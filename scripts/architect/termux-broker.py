#!/usr/bin/env python3
"""Arcanum Architect local execution broker.

CE-W04-A11 preserves the fixed command registry and loopback-only transport while
adding an authenticated native-client session boundary. Requests and responses are
HMAC-bound to exact bytes, one broker process/session, one repository, and one
target HEAD. Registered commands remain read-only or verification-only.
"""

from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import os
import stat
import subprocess
import sys
import threading
import time
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

SCHEMA_VERSION = "1.1"
SERVICE_NAME = "arcanum-termux-broker"
CLIENT_ID = "org.arcanum.nativehost"
AUTH_ALGORITHM = "HMAC-SHA256"
MAX_REQUEST_BYTES = 16 * 1024
MAX_STREAM_BYTES = 256 * 1024
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8765
VERIFY_SYNC_TIMEOUT_SECONDS = 300
REQUEST_FRESHNESS_SECONDS = 120
REPLAY_RETENTION_SECONDS = 300
DEFAULT_ORIGINS = (
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://arcanum-umber.vercel.app",
)

HEADER_CLIENT_ID = "X-Arcanum-Client-Id"
HEADER_SESSION_ID = "X-Arcanum-Session-Id"
HEADER_REQUEST_ID = "X-Arcanum-Request-Id"
HEADER_REQUEST_SHA256 = "X-Arcanum-Request-Sha256"
HEADER_RESPONSE_SHA256 = "X-Arcanum-Response-Sha256"
HEADER_AUTH = "X-Arcanum-Auth"


@dataclass(frozen=True)
class Command:
    id: str
    label: str
    description: str
    risk: str
    argv: tuple[str, ...]
    timeout_seconds: int

    def public(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "label": self.label,
            "description": self.description,
            "risk": self.risk,
            "timeoutSeconds": self.timeout_seconds,
        }


COMMANDS: dict[str, Command] = {
    command.id: command
    for command in (
        Command("git_status", "Git status", "Show concise working-tree and index state.", "read_only", ("git", "status", "--short"), 15),
        Command("git_branch", "Current branch", "Show the checked-out Git branch.", "read_only", ("git", "branch", "--show-current"), 15),
        Command("git_head", "Current commit", "Show the exact checked-out commit SHA.", "read_only", ("git", "rev-parse", "HEAD"), 15),
        Command("git_log_10", "Recent commits", "Show the ten most recent commits in compact form.", "read_only", ("git", "log", "--oneline", "-n", "10"), 20),
        Command("git_diff_stat", "Diff statistics", "Show a summary of unstaged repository differences.", "read_only", ("git", "diff", "--stat"), 20),
        Command("git_diff_names", "Changed filenames", "Show filenames changed in the unstaged working tree.", "read_only", ("git", "diff", "--name-only"), 20),
        Command("verify_sync", "Verify synchronization", "Run the canonical repository synchronization verifier.", "verification", ("bash", "scripts/verify-sync.sh"), VERIFY_SYNC_TIMEOUT_SECONDS),
        Command("web_typecheck", "Web typecheck", "Run the web application's configured TypeScript verification.", "verification", ("pnpm", "-C", "apps/web", "typecheck"), 300),
    )
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def sha256(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def hmac_sha256(secret: bytes, material: bytes) -> str:
    return hmac.new(secret, material, hashlib.sha256).hexdigest()


def bounded_text(value: bytes) -> tuple[str, bool]:
    truncated = len(value) > MAX_STREAM_BYTES
    selected = value[:MAX_STREAM_BYTES]
    return selected.decode("utf-8", errors="replace"), truncated


def text_sha256(value: str) -> str:
    return sha256(value.encode("utf-8"))


def git_value(repository: Path, *args: str) -> str | None:
    try:
        result = subprocess.run(("git", *args), cwd=repository, check=True, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, timeout=10)
    except (OSError, subprocess.SubprocessError):
        return None
    value = result.stdout.decode("utf-8", errors="replace").strip()
    return value or None


def validate_repository(path_value: str) -> Path:
    repository = Path(path_value).expanduser().resolve(strict=True)
    if not repository.is_dir():
        raise ValueError("Repository path is not a directory")
    if not (repository / ".git").exists():
        raise ValueError("Repository path does not contain .git")
    if git_value(repository, "rev-parse", "--show-toplevel") != str(repository):
        raise ValueError("Configured path is not the Git repository root")
    return repository


def validate_secret_file(path_value: str) -> tuple[Path, bytes]:
    path = Path(path_value).expanduser().resolve(strict=True)
    if not path.is_file():
        raise ValueError("Broker pairing secret path is not a regular file")
    mode = stat.S_IMODE(path.stat().st_mode)
    if mode & 0o077:
        raise ValueError("Broker pairing secret must not be group/world accessible")
    value = path.read_text(encoding="utf-8").strip()
    if len(value) != 64:
        raise ValueError("Broker pairing secret must contain exactly 64 hexadecimal characters")
    try:
        secret = bytes.fromhex(value)
    except ValueError as error:
        raise ValueError("Broker pairing secret is not valid hexadecimal") from error
    if len(secret) != 32:
        raise ValueError("Broker pairing secret must decode to exactly 32 bytes")
    return path, secret


def validate_host_tmpdir() -> Path:
    tmpdir_value = os.environ.get("TMPDIR")
    if not tmpdir_value:
        raise ValueError("Broker host TMPDIR is not configured")
    tmpdir = Path(tmpdir_value).expanduser()
    if not tmpdir.is_absolute():
        raise ValueError("Broker host TMPDIR must be an absolute path")
    try:
        tmpdir = tmpdir.resolve(strict=True)
    except OSError as error:
        raise ValueError("Broker host TMPDIR does not exist") from error
    if not tmpdir.is_dir():
        raise ValueError("Broker host TMPDIR is not a directory")
    if not os.access(tmpdir, os.W_OK):
        raise ValueError("Broker host TMPDIR is not writable")
    return tmpdir


def parse_requested_at(value: Any) -> datetime:
    if not isinstance(value, str) or not value or len(value) > 64:
        raise ValueError("invalid_requested_at")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as error:
        raise ValueError("invalid_requested_at") from error
    if parsed.tzinfo is None:
        raise ValueError("invalid_requested_at")
    return parsed.astimezone(timezone.utc)


def request_auth_material(*, path: str, client_id: str, session_id: str, request_id: str, requested_at: str, nonce: str, body_sha256: str) -> bytes:
    return "\n".join(("ARCANUM-A11-REQUEST", "POST", path, client_id, session_id, request_id, requested_at, nonce, body_sha256)).encode("utf-8")


def response_auth_material(*, status: int, path: str, client_id: str, session_id: str, request_id: str, body_sha256: str) -> bytes:
    return "\n".join(("ARCANUM-A11-RESPONSE", str(status), path, client_id, session_id, request_id, body_sha256)).encode("utf-8")


class ReplayGuard:
    def __init__(self) -> None:
        self._seen: dict[tuple[str, str], float] = {}
        self._lock = threading.Lock()

    def register(self, request_id: str, nonce: str) -> bool:
        now = time.monotonic()
        cutoff = now - REPLAY_RETENTION_SECONDS
        with self._lock:
            stale = [key for key, seen_at in self._seen.items() if seen_at < cutoff]
            for key in stale:
                del self._seen[key]
            key = (request_id, nonce)
            if key in self._seen:
                return False
            self._seen[key] = now
            return True


class Broker:
    def __init__(self, repository: Path, allowed_origins: set[str], secret: bytes, secret_path: Path) -> None:
        self.repository = repository
        self.allowed_origins = allowed_origins
        self.secret = secret
        self.secret_path = secret_path
        self.started_at = utc_now()
        self.session_id = str(uuid.uuid4())
        self.replay_guard = ReplayGuard()
        self.execution_lock = threading.Lock()

    def health(self) -> dict[str, Any]:
        return {
            "schemaVersion": SCHEMA_VERSION,
            "service": SERVICE_NAME,
            "status": "ready",
            "authRequired": True,
            "authAlgorithm": AUTH_ALGORITHM,
            "clientId": CLIENT_ID,
            "sessionId": self.session_id,
            "repository": str(self.repository),
            "branch": git_value(self.repository, "branch", "--show-current"),
            "commit": git_value(self.repository, "rev-parse", "HEAD"),
            "commands": [command.public() for command in COMMANDS.values()],
            "startedAt": self.started_at,
        }

    @staticmethod
    def error(error: str, detail: str | None = None) -> dict[str, Any]:
        response: dict[str, Any] = {"schemaVersion": SCHEMA_VERSION, "error": error}
        if detail:
            response["detail"] = detail
        return response

    def validate_authenticated_request(self, *, path: str, request: dict[str, Any], body_bytes: bytes, client_id: str, session_id: str, request_id: str, request_sha256: str, auth_tag: str) -> tuple[dict[str, Any] | None, int]:
        if client_id != CLIENT_ID:
            return self.error("client_not_allowed"), HTTPStatus.FORBIDDEN
        if session_id != self.session_id:
            return self.error("session_mismatch"), HTTPStatus.CONFLICT
        if not request_id or len(request_id) > 128:
            return self.error("invalid_request_id"), HTTPStatus.BAD_REQUEST
        if len(request_sha256) != 64 or len(auth_tag) != 64:
            return self.error("invalid_auth_headers"), HTTPStatus.UNAUTHORIZED
        actual_request_sha = sha256(body_bytes)
        if not hmac.compare_digest(actual_request_sha, request_sha256):
            return self.error("request_digest_mismatch"), HTTPStatus.BAD_REQUEST
        requested_at = request.get("requestedAt")
        nonce = request.get("nonce")
        if not isinstance(nonce, str) or len(nonce) < 16 or len(nonce) > 128:
            return self.error("invalid_nonce"), HTTPStatus.BAD_REQUEST
        try:
            parsed_requested_at = parse_requested_at(requested_at)
        except ValueError:
            return self.error("invalid_requested_at"), HTTPStatus.BAD_REQUEST
        age_seconds = abs((datetime.now(timezone.utc) - parsed_requested_at).total_seconds())
        if age_seconds > REQUEST_FRESHNESS_SECONDS:
            return self.error("stale_request"), HTTPStatus.CONFLICT
        expected_auth = hmac_sha256(self.secret, request_auth_material(path=path, client_id=client_id, session_id=session_id, request_id=request_id, requested_at=requested_at, nonce=nonce, body_sha256=request_sha256))
        if not hmac.compare_digest(expected_auth, auth_tag):
            return self.error("authentication_failed"), HTTPStatus.UNAUTHORIZED
        if request.get("schemaVersion") != SCHEMA_VERSION:
            return self.error("invalid_schema_version"), HTTPStatus.BAD_REQUEST
        if request.get("clientId") != client_id:
            return self.error("client_binding_mismatch"), HTTPStatus.BAD_REQUEST
        if request.get("sessionId") != session_id:
            return self.error("session_binding_mismatch"), HTTPStatus.BAD_REQUEST
        if request.get("requestId") != request_id:
            return self.error("request_binding_mismatch"), HTTPStatus.BAD_REQUEST
        if request.get("repository") != str(self.repository):
            return self.error("repository_mismatch"), HTTPStatus.CONFLICT
        current_branch = git_value(self.repository, "branch", "--show-current")
        current_head = git_value(self.repository, "rev-parse", "HEAD")
        if request.get("targetBranch") != current_branch:
            return self.error("branch_mismatch"), HTTPStatus.CONFLICT
        if request.get("targetHead") != current_head:
            return self.error("target_head_mismatch"), HTTPStatus.CONFLICT
        if not self.replay_guard.register(request_id, nonce):
            return self.error("replay_detected"), HTTPStatus.CONFLICT
        return None, HTTPStatus.OK

    def verify_session(self, request: dict[str, Any], request_sha256: str) -> tuple[dict[str, Any], int]:
        required_keys = {"schemaVersion", "clientId", "sessionId", "requestId", "nonce", "requestedAt", "repository", "targetBranch", "targetHead"}
        if set(request) != required_keys:
            return self.error("invalid_request", "Session fields do not match the contract"), 400
        receipt_without_hash = {
            "schemaVersion": SCHEMA_VERSION,
            "receiptType": "architect_session_receipt",
            "receiptId": f"architect-session-{uuid.uuid4()}",
            "clientId": CLIENT_ID,
            "sessionId": self.session_id,
            "requestId": request["requestId"],
            "repository": str(self.repository),
            "branch": git_value(self.repository, "branch", "--show-current"),
            "commit": git_value(self.repository, "rev-parse", "HEAD"),
            "verifiedAt": utc_now(),
            "requestSha256": request_sha256,
            "status": "pass",
        }
        result_sha = sha256(json.dumps(receipt_without_hash, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8"))
        return {**receipt_without_hash, "resultSha256": result_sha}, 200

    def execute(self, request: dict[str, Any], request_sha256: str) -> tuple[dict[str, Any], int]:
        required_keys = {"schemaVersion", "clientId", "sessionId", "requestId", "nonce", "commandId", "requestedAt", "repository", "targetBranch", "targetHead", "approval"}
        if set(request) != required_keys:
            return self.error("invalid_request", "Execution fields do not match the contract"), 400
        command_id = request["commandId"]
        if not isinstance(command_id, str) or command_id not in COMMANDS:
            return self.error("unknown_command", "Only registered command IDs may execute"), 404
        approval = request["approval"]
        if not isinstance(approval, dict) or set(approval) != {"approvalId", "approvedAt", "surface"}:
            return self.error("invalid_human_approval"), 400
        if approval.get("surface") != "native_dialog":
            return self.error("invalid_human_approval_surface"), 403
        approval_id = approval.get("approvalId")
        if not isinstance(approval_id, str) or not approval_id or len(approval_id) > 128:
            return self.error("invalid_human_approval_id"), 400
        try:
            approved_at = parse_requested_at(approval.get("approvedAt"))
        except ValueError:
            return self.error("invalid_human_approval_time"), 400
        if abs((datetime.now(timezone.utc) - approved_at).total_seconds()) > REQUEST_FRESHNESS_SECONDS:
            return self.error("stale_human_approval"), 409
        if not self.execution_lock.acquire(blocking=False):
            return self.error("broker_busy", "Only one Architect action may execute at a time"), 409
        try:
            current_branch = git_value(self.repository, "branch", "--show-current")
            current_head = git_value(self.repository, "rev-parse", "HEAD")
            if request["targetBranch"] != current_branch:
                return self.error("branch_mismatch"), 409
            if request["targetHead"] != current_head:
                return self.error("target_head_mismatch"), 409
            command = COMMANDS[command_id]
            commit_before = current_head
            branch = current_branch
            started_at = utc_now()
            monotonic_start = time.monotonic()
            try:
                tmpdir = validate_host_tmpdir()
            except ValueError as error:
                return self.error("execution_environment_unavailable", str(error)), 500
            env = {"PATH": os.environ.get("PATH", ""), "HOME": os.environ.get("HOME", str(Path.home())), "TMPDIR": str(tmpdir), "LANG": os.environ.get("LANG", "C.UTF-8"), "LC_ALL": os.environ.get("LC_ALL", "C.UTF-8"), "CI": "1"}
            try:
                process = subprocess.run(command.argv, cwd=self.repository, env=env, shell=False, check=False, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=command.timeout_seconds)
                exit_code = process.returncode
                stdout, stdout_truncated = bounded_text(process.stdout)
                stderr, stderr_truncated = bounded_text(process.stderr)
            except subprocess.TimeoutExpired as error:
                exit_code = 124
                stdout, stdout_truncated = bounded_text(error.stdout or b"")
                stderr, stderr_truncated = bounded_text((error.stderr or b"") + b"\nCommand exceeded its registered timeout.")
            except OSError as error:
                exit_code = 127
                stdout, stdout_truncated = "", False
                stderr, stderr_truncated = str(error), False
            completed_at = utc_now()
            duration_ms = round((time.monotonic() - monotonic_start) * 1000, 3)
            commit_after = git_value(self.repository, "rev-parse", "HEAD")
            receipt_without_hash = {
                "schemaVersion": SCHEMA_VERSION,
                "receiptType": "architect_execution_receipt",
                "receiptId": f"architect-exec-{uuid.uuid4()}",
                "clientId": CLIENT_ID,
                "sessionId": self.session_id,
                "requestId": request["requestId"],
                "approval": approval,
                "command": command.public(),
                "repository": str(self.repository),
                "branch": branch,
                "commitBefore": commit_before,
                "commitAfter": commit_after,
                "startedAt": started_at,
                "completedAt": completed_at,
                "durationMs": duration_ms,
                "exitCode": exit_code,
                "stdout": stdout,
                "stderr": stderr,
                "stdoutSha256": text_sha256(stdout),
                "stderrSha256": text_sha256(stderr),
                "stdoutTruncated": stdout_truncated,
                "stderrTruncated": stderr_truncated,
                "requestSha256": request_sha256,
                "status": "pass" if exit_code == 0 and commit_before == commit_after else "fail",
            }
            result_sha = sha256(json.dumps(receipt_without_hash, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8"))
            return {**receipt_without_hash, "resultSha256": result_sha}, 200
        finally:
            self.execution_lock.release()


class BrokerRequestHandler(BaseHTTPRequestHandler):
    server_version = "ArcanumTermuxBroker/1.1"

    @property
    def broker(self) -> Broker:
        return self.server.broker  # type: ignore[attr-defined]

    def log_message(self, format_string: str, *args: Any) -> None:
        sys.stderr.write(f"[{utc_now()}] {self.address_string()} {format_string % args}\n")

    def origin_allowed(self) -> bool:
        origin = self.headers.get("Origin")
        return origin is None or origin in self.broker.allowed_origins

    def add_cors_headers(self) -> None:
        origin = self.headers.get("Origin")
        if origin and origin in self.broker.allowed_origins:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", ", ".join(("Content-Type", HEADER_CLIENT_ID, HEADER_SESSION_ID, HEADER_REQUEST_ID, HEADER_REQUEST_SHA256, HEADER_AUTH)))
            self.send_header("Access-Control-Expose-Headers", ", ".join((HEADER_CLIENT_ID, HEADER_SESSION_ID, HEADER_REQUEST_ID, HEADER_RESPONSE_SHA256, HEADER_AUTH)))
            self.send_header("Access-Control-Max-Age", "600")

    def send_json(self, payload: dict[str, Any], status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.add_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def send_authenticated_json(self, *, path: str, payload: dict[str, Any], status: int, client_id: str, session_id: str, request_id: str) -> None:
        body = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        body_sha = sha256(body)
        auth = hmac_sha256(self.broker.secret, response_auth_material(status=status, path=path, client_id=client_id, session_id=session_id, request_id=request_id, body_sha256=body_sha))
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header(HEADER_CLIENT_ID, client_id)
        self.send_header(HEADER_SESSION_ID, session_id)
        self.send_header(HEADER_REQUEST_ID, request_id)
        self.send_header(HEADER_RESPONSE_SHA256, body_sha)
        self.send_header(HEADER_AUTH, auth)
        self.add_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def reject_origin(self) -> bool:
        if self.origin_allowed():
            return False
        self.send_json(Broker.error("origin_not_allowed"), HTTPStatus.FORBIDDEN)
        return True

    def do_OPTIONS(self) -> None:  # noqa: N802
        if self.reject_origin():
            return
        self.send_response(HTTPStatus.NO_CONTENT)
        self.add_cors_headers()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        if self.reject_origin():
            return
        path = urlparse(self.path).path
        if path == "/health":
            self.send_json(self.broker.health())
            return
        if path == "/commands":
            self.send_json({"schemaVersion": SCHEMA_VERSION, "commands": [command.public() for command in COMMANDS.values()]})
            return
        self.send_json(Broker.error("not_found"), HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:  # noqa: N802
        if self.reject_origin():
            return
        path = urlparse(self.path).path
        if path not in {"/session", "/execute"}:
            self.send_json(Broker.error("not_found"), HTTPStatus.NOT_FOUND)
            return
        client_id = self.headers.get(HEADER_CLIENT_ID, "")
        session_id = self.headers.get(HEADER_SESSION_ID, "")
        request_id = self.headers.get(HEADER_REQUEST_ID, "")
        request_sha256 = self.headers.get(HEADER_REQUEST_SHA256, "")
        auth_tag = self.headers.get(HEADER_AUTH, "")

        def reject(payload: dict[str, Any], status: int) -> None:
            self.send_authenticated_json(path=path, payload=payload, status=status, client_id=client_id, session_id=session_id, request_id=request_id)

        if self.headers.get_content_type() != "application/json":
            reject(Broker.error("json_required"), HTTPStatus.UNSUPPORTED_MEDIA_TYPE)
            return
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            reject(Broker.error("invalid_content_length"), HTTPStatus.BAD_REQUEST)
            return
        if content_length <= 0 or content_length > MAX_REQUEST_BYTES:
            reject(Broker.error("invalid_request_size"), HTTPStatus.REQUEST_ENTITY_TOO_LARGE)
            return
        body_bytes = self.rfile.read(content_length)
        try:
            payload = json.loads(body_bytes)
        except (json.JSONDecodeError, UnicodeDecodeError):
            reject(Broker.error("invalid_json"), HTTPStatus.BAD_REQUEST)
            return
        if not isinstance(payload, dict):
            reject(Broker.error("json_object_required"), HTTPStatus.BAD_REQUEST)
            return
        auth_error, auth_status = self.broker.validate_authenticated_request(path=path, request=payload, body_bytes=body_bytes, client_id=client_id, session_id=session_id, request_id=request_id, request_sha256=request_sha256, auth_tag=auth_tag)
        if auth_error is not None:
            reject(auth_error, auth_status)
            return
        if path == "/session":
            response, status = self.broker.verify_session(payload, request_sha256)
        else:
            response, status = self.broker.execute(payload, request_sha256)
        reject(response, status)


class BrokerServer(ThreadingHTTPServer):
    daemon_threads = True

    def __init__(self, address: tuple[str, int], broker: Broker) -> None:
        super().__init__(address, BrokerRequestHandler)
        self.broker = broker


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the Arcanum Termux execution broker")
    parser.add_argument("--repo", default=os.environ.get("ARCANUM_REPO_DIR"), help="Absolute Arcanum repository root; defaults to ARCANUM_REPO_DIR")
    parser.add_argument("--secret-file", default=os.environ.get("ARCANUM_BROKER_SECRET_FILE"), help="0600 file containing the 64-hex-character A11 pairing secret")
    parser.add_argument("--host", default=DEFAULT_HOST)
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--allow-origin", action="append", default=[], help="Additional exact browser Origin allowed to call the broker")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.repo:
        print("ERROR: provide --repo or set ARCANUM_REPO_DIR", file=sys.stderr)
        return 2
    if not args.secret_file:
        print("ERROR: provide --secret-file or set ARCANUM_BROKER_SECRET_FILE", file=sys.stderr)
        return 2
    if args.host not in {"127.0.0.1", "localhost", "::1"}:
        print("ERROR: broker may bind only to a loopback address", file=sys.stderr)
        return 2
    if not 1 <= args.port <= 65535:
        print("ERROR: port must be between 1 and 65535", file=sys.stderr)
        return 2
    try:
        repository = validate_repository(args.repo)
        secret_path, secret = validate_secret_file(args.secret_file)
    except (OSError, ValueError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 2
    env_origins = {item.strip() for item in os.environ.get("ARCANUM_BROKER_ORIGINS", "").split(",") if item.strip()}
    allowed_origins = set(DEFAULT_ORIGINS) | env_origins | set(args.allow_origin)
    for origin in allowed_origins:
        parsed = urlparse(origin)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc or parsed.path not in {"", "/"}:
            print(f"ERROR: invalid allowed origin: {origin}", file=sys.stderr)
            return 2
    broker = Broker(repository, allowed_origins, secret, secret_path)
    server = BrokerServer((args.host, args.port), broker)
    print(f"{SERVICE_NAME} listening on http://{args.host}:{args.port}")
    print(f"repository: {repository}")
    print(f"session: {broker.session_id}")
    print(f"pairing secret file: {secret_path}")
    print("allowed origins:")
    for origin in sorted(allowed_origins):
        print(f"  - {origin}")
    print("commands:")
    for command in COMMANDS.values():
        print(f"  - {command.id}: {' '.join(command.argv)}")
    try:
        server.serve_forever(poll_interval=0.25)
    except KeyboardInterrupt:
        print("\nStopping broker.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
