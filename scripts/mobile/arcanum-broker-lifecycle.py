#!/usr/bin/env python3
"""CE-W04-A13.3 fixed broker lifecycle helper.

Only start_broker and stop_broker are accepted. Paths, host, port, broker argv,
state file, and log file are compile-time constants. No caller-supplied shell
text, argv, environment, repository path, host, or port is accepted.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
import re
import signal
import socket
import stat
import subprocess
import sys
import time
import urllib.error
import urllib.request
import uuid

sys.dont_write_bytecode = True

SCHEMA_VERSION = "1.0"
CANONICAL_REPOSITORY_ID = "The-Architect-369/Arcanum"
WORKSPACE = Path.home() / "Arcanum"
CONFIG_DIR = Path.home() / ".config" / "arcanum"
PAIRING_SECRET = CONFIG_DIR / "architect-broker.secret"
LIFECYCLE_STATE = CONFIG_DIR / "architect-broker.lifecycle.json"
BROKER_LOG = CONFIG_DIR / "architect-broker.log"
BROKER_SCRIPT = WORKSPACE / "scripts" / "architect" / "termux-broker.py"
BROKER_HOST = "127.0.0.1"
BROKER_PORT = 8765
HEALTH_URL = f"http://{BROKER_HOST}:{BROKER_PORT}/health"
HEAD_PATTERN = re.compile(r"^[0-9a-f]{40}$")
SECRET_PATTERN = re.compile(r"^[0-9a-f]{64}$")
STATE_KEYS = {
    "schemaVersion",
    "stateType",
    "pid",
    "procStartTicks",
    "argv",
    "repositoryId",
    "workspacePath",
    "branch",
    "head",
    "sessionId",
    "port",
    "logPath",
    "secretPath",
    "startedAt",
}
ACCEPTED_ORIGINS = {
    "https://github.com/The-Architect-369/Arcanum",
    "https://github.com/The-Architect-369/Arcanum.git",
    "git@github.com:The-Architect-369/Arcanum.git",
    "ssh://git@github.com/The-Architect-369/Arcanum.git",
}


class LifecycleError(Exception):
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
        raise LifecycleError("workspace_validation_failed")
    return cp.stdout.strip()


def observe_workspace(require_origin: bool = True) -> tuple[str, str]:
    if not WORKSPACE.is_dir() or not (WORKSPACE / ".git").is_dir():
        raise LifecycleError("canonical_workspace_missing")
    try:
        workspace_real = WORKSPACE.resolve(strict=True)
    except OSError:
        raise LifecycleError("canonical_workspace_missing")
    root = run_git("rev-parse", "--show-toplevel")
    try:
        root_real = Path(root).resolve(strict=True)
    except OSError:
        raise LifecycleError("canonical_workspace_not_git_root")
    if root_real != workspace_real:
        raise LifecycleError("canonical_workspace_not_git_root")
    origin = run_git("remote", "get-url", "origin")
    if require_origin and origin not in ACCEPTED_ORIGINS:
        raise LifecycleError("origin_mismatch")
    branch = run_git("branch", "--show-current")
    if not branch:
        raise LifecycleError("detached_head")
    head = run_git("rev-parse", "HEAD")
    if HEAD_PATTERN.fullmatch(head) is None:
        raise LifecycleError("invalid_head")
    return branch, head


def validate_secret() -> None:
    if PAIRING_SECRET.is_symlink():
        raise LifecycleError("pairing_secret_invalid")
    try:
        info = PAIRING_SECRET.stat()
    except OSError:
        raise LifecycleError("pairing_secret_missing")
    if not stat.S_ISREG(info.st_mode):
        raise LifecycleError("pairing_secret_invalid")
    if stat.S_IMODE(info.st_mode) != 0o600:
        raise LifecycleError("pairing_secret_permissions")
    try:
        value = PAIRING_SECRET.read_text(encoding="ascii").strip().lower()
    except (OSError, UnicodeError):
        raise LifecycleError("pairing_secret_invalid")
    if SECRET_PATTERN.fullmatch(value) is None:
        raise LifecycleError("pairing_secret_invalid")


def require_runtime_files() -> None:
    if not BROKER_SCRIPT.is_file() or BROKER_SCRIPT.is_symlink():
        raise LifecycleError("broker_script_unavailable")
    tmpdir_value = os.environ.get("TMPDIR", "")
    if not tmpdir_value:
        raise LifecycleError("termux_tmpdir_unavailable")
    tmpdir = Path(tmpdir_value)
    if not tmpdir.is_absolute():
        raise LifecycleError("termux_tmpdir_unavailable")
    try:
        resolved = tmpdir.resolve(strict=True)
    except OSError:
        raise LifecycleError("termux_tmpdir_unavailable")
    if not resolved.is_dir() or not os.access(resolved, os.W_OK):
        raise LifecycleError("termux_tmpdir_unavailable")


def broker_argv() -> list[str]:
    return [
        sys.executable,
        str(BROKER_SCRIPT),
        "--repo",
        str(WORKSPACE),
        "--secret-file",
        str(PAIRING_SECRET),
        "--host",
        BROKER_HOST,
        "--port",
        str(BROKER_PORT),
    ]


def broker_env() -> dict[str, str]:
    tmpdir_value = os.environ.get("TMPDIR", "")
    return {
        "PATH": os.environ.get("PATH", ""),
        "HOME": str(Path.home()),
        "TMPDIR": tmpdir_value,
        "LANG": os.environ.get("LANG", "C.UTF-8"),
        "LC_ALL": os.environ.get("LC_ALL", "C.UTF-8"),
        "PYTHONUNBUFFERED": "1",
    }


def ensure_config_dir() -> None:
    if CONFIG_DIR.is_symlink():
        raise LifecycleError("lifecycle_config_invalid")
    try:
        CONFIG_DIR.mkdir(mode=0o700, parents=True, exist_ok=True)
        os.chmod(CONFIG_DIR, 0o700)
    except OSError:
        raise LifecycleError("lifecycle_config_unavailable")


def open_log():
    flags = os.O_WRONLY | os.O_CREAT | os.O_APPEND
    if hasattr(os, "O_CLOEXEC"):
        flags |= os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    try:
        fd = os.open(BROKER_LOG, flags, 0o600)
        os.fchmod(fd, 0o600)
    except OSError:
        raise LifecycleError("broker_log_unavailable")
    return os.fdopen(fd, "ab", buffering=0)


def process_state(pid: int) -> str | None:
    try:
        raw = Path(f"/proc/{pid}/stat").read_text(encoding="utf-8")
    except OSError:
        return None
    parts = raw.split()
    if len(parts) < 22:
        return None
    return parts[2]


def process_start_ticks(pid: int) -> int | None:
    try:
        raw = Path(f"/proc/{pid}/stat").read_text(encoding="utf-8")
    except OSError:
        return None
    parts = raw.split()
    if len(parts) < 22:
        return None
    try:
        return int(parts[21])
    except ValueError:
        return None


def process_cmdline(pid: int) -> list[str] | None:
    try:
        raw = Path(f"/proc/{pid}/cmdline").read_bytes()
    except OSError:
        return None
    if not raw:
        return None
    try:
        return [item.decode("utf-8") for item in raw.rstrip(b"\0").split(b"\0")]
    except UnicodeDecodeError:
        return None


def process_running(pid: int) -> bool:
    state = process_state(pid)
    return state is not None and state != "Z"


def port_open() -> bool:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(0.2)
    try:
        return sock.connect_ex((BROKER_HOST, BROKER_PORT)) == 0
    finally:
        sock.close()


def fetch_health() -> dict | None:
    try:
        request = urllib.request.Request(
            HEALTH_URL,
            headers={"Cache-Control": "no-store"},
            method="GET",
        )
        with urllib.request.urlopen(request, timeout=0.5) as response:
            if response.status != 200:
                return None
            raw = response.read(256 * 1024)
    except (OSError, urllib.error.URLError, ValueError):
        return None
    try:
        value = json.loads(raw.decode("utf-8"))
    except (UnicodeError, json.JSONDecodeError):
        return None
    return value if isinstance(value, dict) else None


def validate_health(
    health: dict | None,
    *,
    branch: str,
    head: str,
    session_id: str | None = None,
) -> str:
    if not isinstance(health, dict):
        raise LifecycleError("broker_health_unavailable")
    if health.get("schemaVersion") != "1.1":
        raise LifecycleError("broker_health_mismatch")
    if health.get("service") != "arcanum-termux-broker":
        raise LifecycleError("broker_health_mismatch")
    if health.get("status") != "ready" or health.get("authRequired") is not True:
        raise LifecycleError("broker_health_mismatch")
    if health.get("repository") != str(WORKSPACE):
        raise LifecycleError("broker_health_mismatch")
    if health.get("branch") != branch or health.get("commit") != head:
        raise LifecycleError("broker_health_mismatch")
    session = health.get("sessionId")
    if not isinstance(session, str) or not session:
        raise LifecycleError("broker_health_mismatch")
    if session_id is not None and session != session_id:
        raise LifecycleError("broker_session_mismatch")
    return session


def read_state() -> dict | None:
    if not LIFECYCLE_STATE.exists():
        return None
    if LIFECYCLE_STATE.is_symlink():
        raise LifecycleError("lifecycle_state_invalid")
    flags = os.O_RDONLY
    if hasattr(os, "O_CLOEXEC"):
        flags |= os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    try:
        fd = os.open(LIFECYCLE_STATE, flags)
    except OSError:
        raise LifecycleError("lifecycle_state_invalid")
    try:
        info = os.fstat(fd)
        if not stat.S_ISREG(info.st_mode) or stat.S_IMODE(info.st_mode) != 0o600:
            raise LifecycleError("lifecycle_state_invalid")
        raw = os.read(fd, 16 * 1024)
        if os.read(fd, 1):
            raise LifecycleError("lifecycle_state_invalid")
    finally:
        os.close(fd)
    try:
        state = json.loads(raw.decode("utf-8"))
    except (UnicodeError, json.JSONDecodeError):
        raise LifecycleError("lifecycle_state_invalid")
    if not isinstance(state, dict) or set(state) != STATE_KEYS:
        raise LifecycleError("lifecycle_state_invalid")
    if state.get("schemaVersion") != SCHEMA_VERSION:
        raise LifecycleError("lifecycle_state_invalid")
    if state.get("stateType") != "architect_broker_lifecycle":
        raise LifecycleError("lifecycle_state_invalid")
    if state.get("repositoryId") != CANONICAL_REPOSITORY_ID:
        raise LifecycleError("lifecycle_state_invalid")
    if state.get("workspacePath") != str(WORKSPACE):
        raise LifecycleError("lifecycle_state_invalid")
    if state.get("secretPath") != str(PAIRING_SECRET):
        raise LifecycleError("lifecycle_state_invalid")
    if state.get("logPath") != str(BROKER_LOG):
        raise LifecycleError("lifecycle_state_invalid")
    if state.get("port") != BROKER_PORT:
        raise LifecycleError("lifecycle_state_invalid")
    if state.get("argv") != broker_argv():
        raise LifecycleError("lifecycle_state_invalid")
    pid = state.get("pid")
    ticks = state.get("procStartTicks")
    if not isinstance(pid, int) or pid <= 1 or not isinstance(ticks, int) or ticks <= 0:
        raise LifecycleError("lifecycle_state_invalid")
    if not isinstance(state.get("branch"), str) or not state["branch"]:
        raise LifecycleError("lifecycle_state_invalid")
    if not isinstance(state.get("head"), str) or HEAD_PATTERN.fullmatch(state["head"]) is None:
        raise LifecycleError("lifecycle_state_invalid")
    if not isinstance(state.get("sessionId"), str) or not state["sessionId"]:
        raise LifecycleError("lifecycle_state_invalid")
    return state


def write_state(state: dict) -> None:
    ensure_config_dir()
    temp = CONFIG_DIR / f".architect-broker.lifecycle.{uuid.uuid4().hex}.tmp"
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
    if hasattr(os, "O_CLOEXEC"):
        flags |= os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    payload = (json.dumps(state, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")
    try:
        fd = os.open(temp, flags, 0o600)
        try:
            os.fchmod(fd, 0o600)
            offset = 0
            while offset < len(payload):
                offset += os.write(fd, payload[offset:])
            os.fsync(fd)
        finally:
            os.close(fd)
        os.replace(temp, LIFECYCLE_STATE)
        os.chmod(LIFECYCLE_STATE, 0o600)
    except OSError:
        try:
            temp.unlink(missing_ok=True)
        except OSError:
            pass
        raise LifecycleError("lifecycle_state_unavailable")


def remove_state() -> None:
    try:
        LIFECYCLE_STATE.unlink(missing_ok=True)
    except OSError:
        raise LifecycleError("lifecycle_state_unavailable")


def owned_process(state: dict) -> bool:
    pid = state["pid"]
    if not process_running(pid):
        return False
    if process_start_ticks(pid) != state["procStartTicks"]:
        raise LifecycleError("lifecycle_process_mismatch")
    if process_cmdline(pid) != state["argv"]:
        raise LifecycleError("lifecycle_process_mismatch")
    return True


def stop_pid(pid: int) -> None:
    try:
        os.kill(pid, signal.SIGTERM)
    except ProcessLookupError:
        return
    except OSError:
        raise LifecycleError("broker_stop_failed")
    deadline = time.monotonic() + 3.0
    while time.monotonic() < deadline:
        if not process_running(pid):
            return
        time.sleep(0.1)
    try:
        os.kill(pid, signal.SIGKILL)
    except ProcessLookupError:
        return
    except OSError:
        raise LifecycleError("broker_stop_failed")
    deadline = time.monotonic() + 2.0
    while time.monotonic() < deadline:
        if not process_running(pid):
            return
        time.sleep(0.1)
    if process_running(pid):
        raise LifecycleError("broker_stop_failed")


def result(
    operation_id: str,
    *,
    status: str,
    reason: str | None,
    branch: str | None,
    head: str | None,
    broker_state: str,
    pid: int | None,
    session_id: str | None,
    runtime_effect: str,
) -> dict:
    return {
        "schemaVersion": SCHEMA_VERSION,
        "operationId": operation_id,
        "status": status,
        "reason": reason,
        "authorityEffect": "none",
        "repositoryMutation": False,
        "runtimeEffect": runtime_effect,
        "repositoryId": CANONICAL_REPOSITORY_ID,
        "workspacePath": str(WORKSPACE),
        "branch": branch,
        "head": head,
        "brokerState": broker_state,
        "brokerPid": pid,
        "brokerPort": BROKER_PORT,
        "brokerSessionId": session_id,
        "lifecycleStatePath": str(LIFECYCLE_STATE),
        "logPath": str(BROKER_LOG),
    }


def start_broker() -> dict:
    branch, head = observe_workspace(require_origin=True)
    validate_secret()
    require_runtime_files()
    ensure_config_dir()

    state = read_state()
    if state is not None:
        if owned_process(state):
            session = validate_health(
                fetch_health(),
                branch=state["branch"],
                head=state["head"],
                session_id=state["sessionId"],
            )
            return result(
                "start_broker",
                status="pass",
                reason=None,
                branch=state["branch"],
                head=state["head"],
                broker_state="already_running",
                pid=state["pid"],
                session_id=session,
                runtime_effect="none",
            )
        if port_open():
            raise LifecycleError("unowned_broker_detected")
        remove_state()

    if port_open():
        raise LifecycleError("broker_port_unavailable")

    argv = broker_argv()
    with open_log() as log_file:
        try:
            process = subprocess.Popen(
                argv,
                cwd=WORKSPACE,
                env=broker_env(),
                shell=False,
                stdin=subprocess.DEVNULL,
                stdout=log_file,
                stderr=log_file,
                close_fds=True,
                start_new_session=True,
            )
        except OSError:
            raise LifecycleError("broker_start_failed")

    session_id = None
    try:
        deadline = time.monotonic() + 8.0
        while time.monotonic() < deadline:
            if process.poll() is not None:
                raise LifecycleError("broker_start_failed")
            health = fetch_health()
            if health is not None:
                session_id = validate_health(health, branch=branch, head=head)
                break
            time.sleep(0.2)
        if session_id is None:
            raise LifecycleError("broker_health_unavailable")

        ticks = process_start_ticks(process.pid)
        if ticks is None or not process_running(process.pid):
            raise LifecycleError("broker_start_failed")
        state = {
            "schemaVersion": SCHEMA_VERSION,
            "stateType": "architect_broker_lifecycle",
            "pid": process.pid,
            "procStartTicks": ticks,
            "argv": argv,
            "repositoryId": CANONICAL_REPOSITORY_ID,
            "workspacePath": str(WORKSPACE),
            "branch": branch,
            "head": head,
            "sessionId": session_id,
            "port": BROKER_PORT,
            "logPath": str(BROKER_LOG),
            "secretPath": str(PAIRING_SECRET),
            "startedAt": health.get("startedAt"),
        }
        if not isinstance(state["startedAt"], str) or not state["startedAt"]:
            raise LifecycleError("broker_health_mismatch")
        write_state(state)
    except Exception:
        if process_running(process.pid):
            try:
                stop_pid(process.pid)
            except LifecycleError:
                pass
        raise

    return result(
        "start_broker",
        status="pass",
        reason=None,
        branch=branch,
        head=head,
        broker_state="started",
        pid=process.pid,
        session_id=session_id,
        runtime_effect="broker_started",
    )


def stop_broker() -> dict:
    state = read_state()
    if state is None:
        branch, head = observe_workspace(require_origin=True)
        if port_open():
            raise LifecycleError("unowned_broker_detected")
        return result(
            "stop_broker",
            status="pass",
            reason=None,
            branch=branch,
            head=head,
            broker_state="already_stopped",
            pid=None,
            session_id=None,
            runtime_effect="none",
        )

    if not owned_process(state):
        if port_open():
            raise LifecycleError("unowned_broker_detected")
        remove_state()
        return result(
            "stop_broker",
            status="pass",
            reason=None,
            branch=state["branch"],
            head=state["head"],
            broker_state="already_stopped",
            pid=state["pid"],
            session_id=state["sessionId"],
            runtime_effect="none",
        )

    stop_pid(state["pid"])
    remove_state()
    deadline = time.monotonic() + 2.0
    while time.monotonic() < deadline and port_open():
        time.sleep(0.1)
    if port_open():
        raise LifecycleError("broker_port_remains_in_use")
    return result(
        "stop_broker",
        status="pass",
        reason=None,
        branch=state["branch"],
        head=state["head"],
        broker_state="stopped",
        pid=state["pid"],
        session_id=state["sessionId"],
        runtime_effect="broker_stopped",
    )


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in {"start_broker", "stop_broker"}:
        return 64
    operation = sys.argv[1]
    try:
        payload = start_broker() if operation == "start_broker" else stop_broker()
    except LifecycleError as error:
        branch = None
        head = None
        try:
            branch, head = observe_workspace(require_origin=False)
        except LifecycleError:
            pass
        payload = result(
            operation,
            status="fail",
            reason=error.code,
            branch=branch,
            head=head,
            broker_state="unchanged",
            pid=None,
            session_id=None,
            runtime_effect="none",
        )
    except Exception:
        payload = result(
            operation,
            status="fail",
            reason="lifecycle_internal_error",
            branch=None,
            head=None,
            broker_state="unchanged",
            pid=None,
            session_id=None,
            runtime_effect="none",
        )
    print(json.dumps(payload, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
