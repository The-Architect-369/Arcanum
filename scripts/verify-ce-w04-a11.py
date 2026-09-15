#!/usr/bin/env python3
"""Fail-closed static checks for CE-W04-A11 Verified Architect Runtime Session."""
from __future__ import annotations

import re
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def fail(message: str) -> None:
    raise SystemExit(f"FAIL CE-W04-A11: {message}")


def require(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


spec = (ROOT / "docs/specs/app/ce-w04-a11-verified-architect-session.md").read_text(encoding="utf-8")
for phrase in (
    "Verified Architect Runtime Session",
    "Human-mediated pairing",
    "HMAC-SHA256",
    "exact request-body SHA-256",
    "POST /session",
    "sessionId",
    "replay",
    "target HEAD",
    "native_dialog",
    "at most one active registered broker action",
    "authorityEffect=none",
    "no repository mutation",
):
    require(phrase in spec, f"A11 contract missing: {phrase!r}")

broker_path = ROOT / "scripts/architect/termux-broker.py"
broker = broker_path.read_text(encoding="utf-8")
for phrase in (
    'SCHEMA_VERSION = "1.1"',
    'CLIENT_ID = "org.arcanum.nativehost"',
    'AUTH_ALGORITHM = "HMAC-SHA256"',
    "REQUEST_FRESHNESS_SECONDS = 120",
    "REPLAY_RETENTION_SECONDS = 300",
    "class ReplayGuard",
    "hmac.compare_digest",
    "self.session_id = str(uuid.uuid4())",
    "self.execution_lock = threading.Lock()",
    'path not in {"/session", "/execute"}',
    '"repository_mismatch"',
    '"branch_mismatch"',
    '"target_head_mismatch"',
    '"replay_detected"',
    '"broker_busy"',
    '"stdoutSha256"',
    '"stderrSha256"',
    "canonical_result_json",
    "--secret-file",
    "validate_secret_file",
):
    require(phrase in broker, f"A11 broker boundary missing: {phrase!r}")
require(
    broker.count("sha256(canonical_result_json(receipt_without_hash))") == 2,
    "A11 session and execution receipts must share the canonical result-digest encoder",
)
broker_runtime = runpy.run_path(str(broker_path))
canonical_result_json = broker_runtime.get("canonical_result_json")
require(callable(canonical_result_json), "A11 canonical result-digest encoder is not callable")
canonical_vector = canonical_result_json({"repository": "/data/data/com.termux/files/home/Arcanum"})
require(
    canonical_vector == b'{"repository":"\\/data\\/data\\/com.termux\\/files\\/home\\/Arcanum"}',
    "A11 result digest canonicalization must match Android org.json solidus escaping",
)
for forbidden in ("shell=True", "git push", "git commit", "git merge", "git reset --hard"):
    require(forbidden not in broker, f"A11 broker mutation/shell ceiling violated: {forbidden!r}")

launcher = (ROOT / "scripts/mobile/arcanum-broker.sh").read_text(encoding="utf-8")
for phrase in (
    'SECRET_FILE="${ARCANUM_BROKER_SECRET_FILE:-$SECRET_DIR/architect-broker.secret}"',
    "secrets.token_hex(32)",
    'chmod 600 "$SECRET_FILE"',
    "NEW PAIRING CODE",
    '--secret-file "$SECRET_FILE"',
    "--host 127.0.0.1",
):
    require(phrase in launcher, f"A11 broker launcher pairing boundary missing: {phrase!r}")

architect_dir = ROOT / "apps/android/app/src/main/java/org/arcanum/nativehost/architect"
pairing_store = (architect_dir / "ArchitectPairingStore.kt").read_text(encoding="utf-8")
for phrase in (
    "AndroidKeyStore",
    "AES/GCM/NoPadding",
    "setKeySize(256)",
    "setRandomizedEncryptionRequired(true)",
    "Pairing code must be exactly 64 hexadecimal characters",
    "Context.MODE_PRIVATE",
):
    require(phrase in pairing_store, f"A11 Android pairing store missing: {phrase!r}")

client = (architect_dir / "ArchitectBrokerClient.kt").read_text(encoding="utf-8")
for phrase in (
    'SCHEMA_VERSION = "1.1"',
    'LOOPBACK_BASE_URL = "http://127.0.0.1:8765"',
    "HmacSHA256",
    "X-Arcanum-Client-Id",
    "X-Arcanum-Session-Id",
    "X-Arcanum-Request-Id",
    "X-Arcanum-Request-Sha256",
    "X-Arcanum-Response-Sha256",
    "Broker response authentication failed",
    "Execution stdout digest verification failed",
    "Execution stderr digest verification failed",
    "Broker receipt result digest verification failed",
    'surface: String = "native_dialog"',
    'path = "/session"',
    'path = "/execute"',
):
    require(phrase in client, f"A11 Android broker client missing: {phrase!r}")
require('.put("approvedByHumanArchitect"' not in client, "legacy approval Boolean must not be sent on the A11 wire contract")
require("https://" not in client, "A11 native broker client must not contain a remote HTTPS endpoint")
require("web_typecheck" not in client, "A11 Android allowlist must not expose web_typecheck")
for command_id in ("git_status", "git_branch", "git_head", "git_log_10", "git_diff_names", "git_diff_stat", "verify_sync"):
    require(f'"{command_id}"' in client, f"A11 Android allowlist missing: {command_id}")

panel = (architect_dir / "ArchitectShellPanel.kt").read_text(encoding="utf-8")
for phrase in (
    "Pair local broker",
    "Clear local pairing",
    "AndroidKeyStore-protected storage",
    "authenticated A11 session",
    "HumanApproval.now()",
    "Show raw output",
    "broker output bounded",
    "no repository mutation",
    "no model provider",
):
    require(phrase in panel, f"A11 Architect console surface missing: {phrase!r}")

build = (ROOT / "apps/android/app/build.gradle.kts").read_text(encoding="utf-8")
require('versionName = "0.1.12-cew04-a11"' in build, "A11 Android versionName missing")
require("CE-W04-A11" in build, "A11 implementation arc provenance missing")
version_code = re.search(r"\bversionCode\s*=\s*(\d+)\b", build)
require(version_code is not None and int(version_code.group(1)) >= 13, "A11 requires versionCode >= 13")

test = (ROOT / "scripts/architect/test-termux-broker.sh").read_text(encoding="utf-8")
for phrase in (
    "replay_detected",
    "stale_request",
    "repository_mismatch",
    "target_head_mismatch",
    "authentication_failed",
    "architect_session_receipt",
    "architect_execution_receipt",
):
    require(phrase in test, f"A11 broker integration test missing: {phrase!r}")

print("PASS CE-W04-A11: authenticated local session boundary, replay/freshness/repository binding, Keystore pairing, and fixed authority ceiling")
