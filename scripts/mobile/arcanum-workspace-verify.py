#!/usr/bin/env python3
"""CE-W04-A13.4 fixed native workspace verification helper."""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import re
import signal
import stat
import subprocess
import sys
import time

sys.dont_write_bytecode = True

SCHEMA_VERSION = "1.0"
CANONICAL_REPOSITORY_ID = "The-Architect-369/Arcanum"
WORKSPACE = Path.home() / "Arcanum"
VERIFY_SCRIPT = WORKSPACE / "scripts" / "verify-sync.sh"
CONFIG_DIR = Path.home() / ".config" / "arcanum"
VERIFICATION_LOG = CONFIG_DIR / "architect-workspace-verification.log"
VERIFICATION_TIMEOUT_SECONDS = 420
VERIFY_SYNC_TOTAL_CHECKS = 15
HEAD_PATTERN = re.compile(r"^[0-9a-f]{40}$")
PASS_PATTERN = re.compile(r"verify-sync passed:\s+(\d+)/(\d+)\s+checks\.")
ACCEPTED_ORIGINS = {
    "https://github.com/The-Architect-369/Arcanum",
    "https://github.com/The-Architect-369/Arcanum.git",
    "git@github.com:The-Architect-369/Arcanum.git",
    "ssh://git@github.com/The-Architect-369/Arcanum.git",
}


class VerificationError(Exception):
    def __init__(self, code: str):
        super().__init__(code)
        self.code = code


def run_git(*args: str) -> str:
    try:
        cp = subprocess.run(
            ("git", *args),
            cwd=WORKSPACE,
            shell=False,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            timeout=10,
            env={**os.environ, "GIT_OPTIONAL_LOCKS": "0"},
        )
    except (OSError, subprocess.SubprocessError):
        raise VerificationError("workspace_validation_failed")
    return cp.stdout.strip()


def inspect_workspace() -> tuple[str, str, bool]:
    if not WORKSPACE.is_dir() or not (WORKSPACE / ".git").is_dir():
        raise VerificationError("canonical_workspace_missing")
    try:
        workspace_real = WORKSPACE.resolve(strict=True)
    except OSError:
        raise VerificationError("canonical_workspace_missing")
    root = run_git("rev-parse", "--show-toplevel")
    try:
        root_real = Path(root).resolve(strict=True)
    except OSError:
        raise VerificationError("canonical_workspace_not_git_root")
    if root_real != workspace_real:
        raise VerificationError("canonical_workspace_not_git_root")
    origin = run_git("remote", "get-url", "origin")
    if origin not in ACCEPTED_ORIGINS:
        raise VerificationError("origin_mismatch")
    branch = run_git("branch", "--show-current")
    if not branch:
        raise VerificationError("detached_head")
    head = run_git("rev-parse", "HEAD")
    if HEAD_PATTERN.fullmatch(head) is None:
        raise VerificationError("invalid_head")
    clean = not bool(run_git("status", "--porcelain=v1", "--untracked-files=normal"))
    return branch, head, clean


def require_verify_script() -> None:
    if not VERIFY_SCRIPT.is_file() or VERIFY_SCRIPT.is_symlink():
        raise VerificationError("verify_script_unavailable")


def require_tempdir() -> None:
    value = os.environ.get("TMPDIR", "")
    if not value:
        raise VerificationError("termux_tmpdir_unavailable")
    candidate = Path(value)
    if not candidate.is_absolute():
        raise VerificationError("termux_tmpdir_unavailable")
    try:
        resolved = candidate.resolve(strict=True)
    except OSError:
        raise VerificationError("termux_tmpdir_unavailable")
    if not resolved.is_dir() or not os.access(resolved, os.W_OK):
        raise VerificationError("termux_tmpdir_unavailable")


def bounded_env() -> dict[str, str]:
    allowed = (
        "PATH",
        "HOME",
        "TMPDIR",
        "PREFIX",
        "LANG",
        "LC_ALL",
        "JAVA_HOME",
        "ANDROID_HOME",
        "CARGO_HOME",
        "RUSTUP_HOME",
        "PNPM_HOME",
        "COREPACK_HOME",
    )
    env = {key: os.environ[key] for key in allowed if os.environ.get(key)}
    env["HOME"] = str(Path.home())
    env["GIT_OPTIONAL_LOCKS"] = "0"
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    return env


def ensure_config_dir() -> None:
    if CONFIG_DIR.is_symlink():
        raise VerificationError("verification_config_invalid")
    try:
        CONFIG_DIR.mkdir(mode=0o700, parents=True, exist_ok=True)
        os.chmod(CONFIG_DIR, 0o700)
    except OSError:
        raise VerificationError("verification_config_unavailable")


def open_log():
    flags = os.O_WRONLY | os.O_CREAT | os.O_TRUNC
    if hasattr(os, "O_CLOEXEC"):
        flags |= os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    try:
        fd = os.open(VERIFICATION_LOG, flags, 0o600)
        os.fchmod(fd, 0o600)
    except OSError:
        raise VerificationError("verification_log_unavailable")
    return os.fdopen(fd, "wb", buffering=0)


def hash_file(path: Path) -> str:
    digest = hashlib.sha256()
    try:
        with path.open("rb") as handle:
            while True:
                chunk = handle.read(1024 * 1024)
                if not chunk:
                    break
                digest.update(chunk)
    except OSError:
        raise VerificationError("verification_log_unavailable")
    return digest.hexdigest()


def parse_pass_counts(path: Path) -> tuple[int | None, int]:
    try:
        size = path.stat().st_size
        with path.open("rb") as handle:
            if size > 128 * 1024:
                handle.seek(size - 128 * 1024)
            tail = handle.read().decode("utf-8", errors="replace")
    except OSError:
        raise VerificationError("verification_log_unavailable")
    matches = list(PASS_PATTERN.finditer(tail))
    if not matches:
        return None, VERIFY_SYNC_TOTAL_CHECKS
    match = matches[-1]
    return int(match.group(1)), int(match.group(2))


def stop_owned_verifier(process: subprocess.Popen[bytes]) -> None:
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except ProcessLookupError:
        return
    except OSError:
        return
    try:
        process.wait(timeout=2)
        return
    except subprocess.TimeoutExpired:
        pass
    try:
        os.killpg(process.pid, signal.SIGKILL)
    except (ProcessLookupError, OSError):
        return
    try:
        process.wait(timeout=2)
    except subprocess.TimeoutExpired:
        pass


def base_payload() -> dict:
    return {
        "schemaVersion": SCHEMA_VERSION,
        "operationId": "verify_workspace",
        "status": "fail",
        "reason": None,
        "authorityEffect": "none",
        "repositoryMutation": False,
        "runtimeEffect": "none",
        "repositoryId": CANONICAL_REPOSITORY_ID,
        "workspacePath": str(WORKSPACE),
        "branch": None,
        "head": None,
        "cleanBefore": False,
        "cleanAfter": False,
        "verifyExitCode": None,
        "passedChecks": None,
        "totalChecks": VERIFY_SYNC_TOTAL_CHECKS,
        "durationMs": 0,
        "logPath": str(VERIFICATION_LOG),
        "logSha256": None,
    }


def verify_workspace() -> dict:
    started = time.monotonic()
    payload = base_payload()

    try:
        branch_before, head_before, clean_before = inspect_workspace()
        payload["branch"] = branch_before
        payload["head"] = head_before
        payload["cleanBefore"] = clean_before

        if not clean_before:
            raise VerificationError("working_tree_not_clean")

        require_verify_script()
        require_tempdir()
        ensure_config_dir()

        exit_code = None
        timed_out = False
        with open_log() as log_handle:
            try:
                process = subprocess.Popen(
                    ("bash", str(VERIFY_SCRIPT)),
                    cwd=WORKSPACE,
                    shell=False,
                    stdin=subprocess.DEVNULL,
                    stdout=log_handle,
                    stderr=subprocess.STDOUT,
                    env=bounded_env(),
                    start_new_session=True,
                )
            except OSError:
                raise VerificationError("verifier_launch_failed")

            try:
                exit_code = process.wait(timeout=VERIFICATION_TIMEOUT_SECONDS)
            except subprocess.TimeoutExpired:
                timed_out = True
                stop_owned_verifier(process)

        payload["runtimeEffect"] = "verification_log_written"
        payload["verifyExitCode"] = exit_code
        payload["logSha256"] = hash_file(VERIFICATION_LOG)
        passed, total = parse_pass_counts(VERIFICATION_LOG)
        payload["passedChecks"] = passed
        payload["totalChecks"] = total

        try:
            branch_after, head_after, clean_after = inspect_workspace()
        except VerificationError:
            payload["repositoryMutation"] = True
            payload["cleanAfter"] = False
            raise VerificationError("repository_state_changed")

        payload["cleanAfter"] = clean_after
        if (
            branch_after != branch_before
            or head_after != head_before
            or not clean_after
        ):
            payload["repositoryMutation"] = True
            raise VerificationError("repository_state_changed")

        if timed_out:
            raise VerificationError("verify_sync_timeout")
        if exit_code != 0:
            raise VerificationError("verify_sync_failed")
        if passed != VERIFY_SYNC_TOTAL_CHECKS or total != VERIFY_SYNC_TOTAL_CHECKS:
            raise VerificationError("verify_sync_receipt_missing")

        payload["status"] = "pass"
        payload["reason"] = None
        return payload
    except VerificationError as error:
        payload["status"] = "fail"
        payload["reason"] = error.code
        return payload
    finally:
        payload["durationMs"] = int((time.monotonic() - started) * 1000)


def main() -> None:
    if len(sys.argv) != 2 or sys.argv[1] != "verify_workspace":
        print(
            "[arcanum-workspace-verify] ERROR: exactly verify_workspace is required",
            file=sys.stderr,
        )
        raise SystemExit(64)
    print(json.dumps(verify_workspace(), sort_keys=True, separators=(",", ":")))


if __name__ == "__main__":
    main()
