#!/usr/bin/env python3
"""Regression fixtures for CE-W04-A13.4 native workspace verification."""

from __future__ import annotations

import hashlib
import importlib.util
import os
from pathlib import Path
import stat
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[2]
HELPER = ROOT / "scripts" / "mobile" / "arcanum-workspace-verify.py"


def fail(message: str) -> None:
    raise SystemExit(f"FAIL CE-W04-A13.4 workspace verification fixture: {message}")


def run(*args: str, cwd: Path | None = None) -> str:
    cp = subprocess.run(
        args,
        cwd=cwd,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        shell=False,
    )
    return cp.stdout.strip()


def commit_verifier(repo: Path, path: Path, body: str, label: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("#!/usr/bin/env bash\nset -euo pipefail\n" + body, encoding="utf-8")
    path.chmod(0o755)
    relative = path.relative_to(repo)
    run("git", "add", str(relative), cwd=repo)
    run("git", "commit", "-q", "-m", label, cwd=repo)


spec = importlib.util.spec_from_file_location("arcanum_workspace_verify", HELPER)
if spec is None or spec.loader is None:
    fail("unable to load helper module")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

with tempfile.TemporaryDirectory(prefix="arcanum-a13-4-fixture-") as tmp_value:
    tmp = Path(tmp_value)
    home = tmp / "home"
    repo = home / "Arcanum"
    config = home / ".config" / "arcanum"
    verifier = repo / "scripts" / "verify-sync.sh"
    tmpdir = tmp / "tmp"
    repo.mkdir(parents=True)
    tmpdir.mkdir()

    run("git", "init", "-q", "-b", "main", cwd=repo)
    run("git", "config", "user.name", "A13.4 Fixture", cwd=repo)
    run("git", "config", "user.email", "a13-4@example.invalid", cwd=repo)
    (repo / "README.fixture").write_text("fixture\n", encoding="utf-8")
    run("git", "add", "README.fixture", cwd=repo)
    run("git", "commit", "-q", "-m", "fixture", cwd=repo)
    run(
        "git",
        "remote",
        "add",
        "origin",
        "https://github.com/The-Architect-369/Arcanum.git",
        cwd=repo,
    )

    module.WORKSPACE = repo
    module.VERIFY_SCRIPT = verifier
    module.CONFIG_DIR = config
    module.VERIFICATION_LOG = config / "architect-workspace-verification.log"
    os.environ["HOME"] = str(home)
    os.environ["TMPDIR"] = str(tmpdir)

    commit_verifier(
        repo,
        verifier,
        "printf 'fixture verifier\\n'\n"
        "printf '✅ verify-sync passed: 15/15 checks.\\n'\n",
        "fixture verifier pass",
    )
    success = module.verify_workspace()
    if success["status"] != "pass":
        fail(f"success fixture rejected: {success}")
    if success["verifyExitCode"] != 0:
        fail("success fixture exit code mismatch")
    if success["passedChecks"] != 15 or success["totalChecks"] != 15:
        fail("success fixture check count mismatch")
    if success["repositoryMutation"] is not False:
        fail("success fixture reported repository mutation")
    if success["runtimeEffect"] != "verification_log_written":
        fail("success fixture runtime effect mismatch")
    log_path = Path(success["logPath"])
    if stat.S_IMODE(log_path.stat().st_mode) != 0o600:
        fail("verification log mode is not 0600")
    actual_hash = hashlib.sha256(log_path.read_bytes()).hexdigest()
    if success["logSha256"] != actual_hash:
        fail("verification log digest mismatch")

    commit_verifier(
        repo,
        verifier,
        "printf 'fixture verifier failure\\n'\n"
        "exit 7\n",
        "fixture verifier fail",
    )
    failure = module.verify_workspace()
    if failure["status"] != "fail" or failure["reason"] != "verify_sync_failed":
        fail(f"non-zero verifier did not fail closed: {failure}")
    if failure["verifyExitCode"] != 7 or failure["repositoryMutation"] is not False:
        fail("non-zero verifier result shape mismatch")

    dirty = repo / "DIRTY"
    dirty.write_text("dirty\n", encoding="utf-8")
    dirty_result = module.verify_workspace()
    if dirty_result["status"] != "fail" or dirty_result["reason"] != "working_tree_not_clean":
        fail(f"dirty workspace did not fail before verification: {dirty_result}")
    if dirty_result["runtimeEffect"] != "none":
        fail("dirty preflight unexpectedly ran verifier")
    dirty.unlink()

    commit_verifier(
        repo,
        verifier,
        "printf 'mutating fixture\\n'\n"
        "printf 'mutation\\n' > \"$PWD/MUTATED\"\n"
        "printf '✅ verify-sync passed: 15/15 checks.\\n'\n",
        "fixture verifier mutation",
    )
    mutation = module.verify_workspace()
    if mutation["status"] != "fail" or mutation["reason"] != "repository_state_changed":
        fail(f"repository mutation was not detected: {mutation}")
    if mutation["repositoryMutation"] is not True:
        fail("mutation result did not report repositoryMutation=true")
    (repo / "MUTATED").unlink()

    run(
        "git",
        "remote",
        "set-url",
        "origin",
        "https://example.invalid/not-arcanum.git",
        cwd=repo,
    )
    wrong_origin = module.verify_workspace()
    if wrong_origin["status"] != "fail" or wrong_origin["reason"] != "origin_mismatch":
        fail(f"wrong origin did not fail closed: {wrong_origin}")
    if wrong_origin["runtimeEffect"] != "none":
        fail("wrong-origin preflight unexpectedly ran verifier")

print(
    "PASS CE-W04-A13.4 fixed verify-sync execution, private log binding, "
    "failure reporting, and repository-state attestation"
)
