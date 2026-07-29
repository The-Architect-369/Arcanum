#!/usr/bin/env python3
"""Arcanum Architect local execution broker.

This broker is intentionally narrow. It binds to loopback, accepts fixed command
identifiers rather than shell text, executes only inside one configured Arcanum
repository, and emits structured receipts.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
import time
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

SCHEMA_VERSION = "1.0"
SERVICE_NAME = "arcanum-termux-broker"
MAX_REQUEST_BYTES = 16 * 1024
MAX_STREAM_BYTES = 256 * 1024
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8765
DEFAULT_ORIGINS = (
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://arcanum-umber.vercel.app",
)


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
        Command(
            "git_status",
            "Git status",
            "Show concise working-tree and index state.",
            "read_only",
            ("git", "status", "--short"),
            15,
        ),
        Command(
            "git_branch",
            "Current branch",
            "Show the checked-out Git branch.",
            "read_only",
            ("git", "branch", "--show-current"),
            15,
        ),
        Command(
            "git_head",
            "Current commit",
            "Show the exact checked-out commit SHA.",
            "read_only",
            ("git", "rev-parse", "HEAD"),
            15,
        ),
        Command(
            "git_log_10",
            "Recent commits",
            "Show the ten most recent commits in compact form.",
            "read_only",
            ("git", "log", "--oneline", "-n", "10"),
            20,
        ),
        Command(
            "git_diff_stat",
            "Diff statistics",
            "Show a summary of unstaged repository differences.",
            "read_only",
            ("git", "diff", "--stat"),
            20,
        ),
        Command(
            "git_diff_names",
            "Changed filenames",
            "Show filenames changed in the unstaged working tree.",
            "read_only",
            ("git", "diff", "--name-only"),
            20,
        ),
        Command(
            "verify_sync",
            "Verify synchronization",
            "Run the canonical repository synchronization verifier.",
            "verification",
            ("bash", "scripts/verify-sync.sh"),
            120,
        ),
        Command(
            "web_typecheck",
            "Web typecheck",
            "Run the web application's configured TypeScript verification.",
            "verification",
            ("pnpm", "-C", "apps/web", "typecheck"),
            300,
        ),
    )
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def canonical_json(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def sha256(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def bounded_text(value: bytes) -> tuple[str, bool]:
    truncated = len(value) > MAX_STREAM_BYTES
    selected = value[:MAX_STREAM_BYTES]
    return selected.decode("utf-8", errors="replace"), truncated


def git_value(repository: Path, *args: str) -> str | None:
    try:
        result = subprocess.run(
            ("git", *args),
            cwd=repository,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            timeout=10,
        )
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


class Broker:
    def __init__(self, repository: Path, allowed_origins: set[str]) -> None:
        self.repository = repository
        self.allowed_origins = allowed_origins
        self.started_at = utc_now()

    def health(self) -> dict[str, Any]:
        return {
            "schemaVersion": SCHEMA_VERSION,
            "service": SERVICE_NAME,
            "status": "ready",
            "repository": str(self.repository),
            "branch": git_value(self.repository, "branch", "--show-current"),
            "commit": git_value(self.repository, "rev-parse", "HEAD"),
            "commands": [command.public() for command in COMMANDS.values()],
            "startedAt": self.started_at,
        }

    def execute(self, request: dict[str, Any]) -> tuple[dict[str, Any], int]:
        required_keys = {
            "schemaVersion",
            "commandId",
            "approvedByHumanArchitect",
            "requestedAt",
        }
        if set(request) != required_keys:
            return self.error("invalid_request", "Request fields do not match the execution contract"), 400
        if request["schemaVersion"] != SCHEMA_VERSION:
            return self.error("invalid_schema_version"), 400
        if request["approvedByHumanArchitect"] is not True:
            return self.error("human_authorization_required"), 403
        if not isinstance(request["requestedAt"], str) or len(request["requestedAt"]) > 64:
            return self.error("invalid_requested_at"), 400

        command_id = request["commandId"]
        if not isinstance(command_id, str) or command_id not in COMMANDS:
            return self.error("unknown_command", "Only registered command IDs may execute"), 404

        command = COMMANDS[command_id]
        commit_before = git_value(self.repository, "rev-parse", "HEAD")
        branch = git_value(self.repository, "branch", "--show-current")
        started_at = utc_now()
        monotonic_start = time.monotonic()

        env = {
            "PATH": os.environ.get("PATH", ""),
            "HOME": os.environ.get("HOME", str(Path.home())),
            "LANG": os.environ.get("LANG", "C.UTF-8"),
            "LC_ALL": os.environ.get("LC_ALL", "C.UTF-8"),
            "CI": "1",
        }

        try:
            process = subprocess.run(
                command.argv,
                cwd=self.repository,
                env=env,
                shell=False,
                check=False,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=command.timeout_seconds,
            )
            exit_code = process.returncode
            stdout, stdout_truncated = bounded_text(process.stdout)
            stderr, stderr_truncated = bounded_text(process.stderr)
        except subprocess.TimeoutExpired as error:
            exit_code = 124
            stdout, stdout_truncated = bounded_text(error.stdout or b"")
            stderr_value = (error.stderr or b"") + b"\nCommand exceeded its registered timeout."
            stderr, stderr_truncated = bounded_text(stderr_value)
        except OSError as error:
            exit_code = 127
            stdout, stdout_truncated = "", False
            stderr, stderr_truncated = str(error), False

        completed_at = utc_now()
        duration_ms = round((time.monotonic() - monotonic_start) * 1000, 3)
        commit_after = git_value(self.repository, "rev-parse", "HEAD")
        request_sha = sha256(canonical_json(request))

        receipt_without_hash = {
            "schemaVersion": SCHEMA_VERSION,
            "receiptType": "architect_execution_receipt",
            "receiptId": f"architect-exec-{uuid.uuid4()}",
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
            "stdoutTruncated": stdout_truncated,
            "stderrTruncated": stderr_truncated,
            "requestSha256": request_sha,
            "status": "pass" if exit_code == 0 and commit_before == commit_after else "fail",
        }
        result_sha = sha256(canonical_json(receipt_without_hash))
        receipt = {**receipt_without_hash, "resultSha256": result_sha}
        return receipt, 200

    @staticmethod
    def error(error: str, detail: str | None = None) -> dict[str, Any]:
        response: dict[str, Any] = {"schemaVersion": SCHEMA_VERSION, "error": error}
        if detail:
            response["detail"] = detail
        return response


class BrokerRequestHandler(BaseHTTPRequestHandler):
    server_version = "ArcanumTermuxBroker/1.0"

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
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
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
            self.send_json(
                {
                    "schemaVersion": SCHEMA_VERSION,
                    "commands": [command.public() for command in COMMANDS.values()],
                }
            )
            return
        self.send_json(Broker.error("not_found"), HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:  # noqa: N802
        if self.reject_origin():
            return
        if urlparse(self.path).path != "/execute":
            self.send_json(Broker.error("not_found"), HTTPStatus.NOT_FOUND)
            return
        content_type = self.headers.get_content_type()
        if content_type != "application/json":
            self.send_json(Broker.error("json_required"), HTTPStatus.UNSUPPORTED_MEDIA_TYPE)
            return
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_json(Broker.error("invalid_content_length"), HTTPStatus.BAD_REQUEST)
            return
        if content_length <= 0 or content_length > MAX_REQUEST_BYTES:
            self.send_json(Broker.error("invalid_request_size"), HTTPStatus.REQUEST_ENTITY_TOO_LARGE)
            return
        try:
            payload = json.loads(self.rfile.read(content_length))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self.send_json(Broker.error("invalid_json"), HTTPStatus.BAD_REQUEST)
            return
        if not isinstance(payload, dict):
            self.send_json(Broker.error("json_object_required"), HTTPStatus.BAD_REQUEST)
            return
        response, status = self.broker.execute(payload)
        self.send_json(response, status)


class BrokerServer(ThreadingHTTPServer):
    daemon_threads = True

    def __init__(self, address: tuple[str, int], broker: Broker) -> None:
        super().__init__(address, BrokerRequestHandler)
        self.broker = broker


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the Arcanum Termux execution broker")
    parser.add_argument(
        "--repo",
        default=os.environ.get("ARCANUM_REPO_DIR"),
        help="Absolute Arcanum repository root; defaults to ARCANUM_REPO_DIR",
    )
    parser.add_argument("--host", default=DEFAULT_HOST)
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument(
        "--allow-origin",
        action="append",
        default=[],
        help="Additional exact browser Origin allowed to call the broker",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.repo:
        print("ERROR: provide --repo or set ARCANUM_REPO_DIR", file=sys.stderr)
        return 2
    if args.host not in {"127.0.0.1", "localhost", "::1"}:
        print("ERROR: broker may bind only to a loopback address", file=sys.stderr)
        return 2
    if not 1 <= args.port <= 65535:
        print("ERROR: port must be between 1 and 65535", file=sys.stderr)
        return 2

    try:
        repository = validate_repository(args.repo)
    except (OSError, ValueError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 2

    env_origins = {
        item.strip()
        for item in os.environ.get("ARCANUM_BROKER_ORIGINS", "").split(",")
        if item.strip()
    }
    allowed_origins = set(DEFAULT_ORIGINS) | env_origins | set(args.allow_origin)
    for origin in allowed_origins:
        parsed = urlparse(origin)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc or parsed.path not in {"", "/"}:
            print(f"ERROR: invalid allowed origin: {origin}", file=sys.stderr)
            return 2

    broker = Broker(repository, allowed_origins)
    server = BrokerServer((args.host, args.port), broker)
    print(f"{SERVICE_NAME} listening on http://{args.host}:{args.port}")
    print(f"repository: {repository}")
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
