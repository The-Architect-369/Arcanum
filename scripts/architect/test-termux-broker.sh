#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
PORT="${ARCANUM_BROKER_TEST_PORT:-18765}"
HOST_TMPDIR="${TMPDIR:-${PREFIX:-/tmp}/tmp}"
WORK_TMP="$HOST_TMPDIR/arcanum-termux-broker-test"
LOG_FILE="$WORK_TMP/broker.log"
PID_FILE="$WORK_TMP/broker.pid"
SECRET_FILE="$WORK_TMP/pairing.secret"

python3 "$REPO_ROOT/scripts/verify-ce-w04-a11.py"

mkdir -p "$HOST_TMPDIR" "$WORK_TMP"
export TMPDIR="$HOST_TMPDIR"
rm -f "$LOG_FILE" "$PID_FILE" "$SECRET_FILE"
umask 077
python3 - "$SECRET_FILE" <<'PY'
from pathlib import Path
import secrets
import sys
path = Path(sys.argv[1])
path.write_text(secrets.token_hex(32) + "\n", encoding="utf-8")
path.chmod(0o600)
PY

cleanup() {
  if [[ -f "$PID_FILE" ]]; then
    PID="$(cat "$PID_FILE")"
    kill "$PID" 2>/dev/null || true
    wait "$PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

python3 "$REPO_ROOT/scripts/architect/termux-broker.py" \
  --repo "$REPO_ROOT" \
  --secret-file "$SECRET_FILE" \
  --port "$PORT" \
  >"$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

for _ in $(seq 1 40); do
  if curl --silent --fail "http://127.0.0.1:$PORT/health" > "$WORK_TMP/health.json"; then
    break
  fi
  sleep 0.25
done

jq -e '
  .schemaVersion == "1.1" and
  .service == "arcanum-termux-broker" and
  .status == "ready" and
  .authRequired == true and
  .authAlgorithm == "HMAC-SHA256" and
  .clientId == "org.arcanum.nativehost" and
  (.sessionId | length) > 20 and
  (.commands | length) == 8
' "$WORK_TMP/health.json" >/dev/null

python3 - "$REPO_ROOT" "$PORT" "$SECRET_FILE" <<'PY'
from __future__ import annotations

import hashlib
import hmac
import json
import sys
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

repo = Path(sys.argv[1]).resolve()
port = int(sys.argv[2])
secret = bytes.fromhex(Path(sys.argv[3]).read_text(encoding="utf-8").strip())
base = f"http://127.0.0.1:{port}"
client_id = "org.arcanum.nativehost"


def sha256(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def auth_request(path: str, session_id: str, request_id: str, requested_at: str, nonce: str, body_sha: str, key: bytes = secret) -> str:
    material = "\n".join(("ARCANUM-A11-REQUEST", "POST", path, client_id, session_id, request_id, requested_at, nonce, body_sha)).encode()
    return hmac.new(key, material, hashlib.sha256).hexdigest()


def auth_response(status: int, path: str, response_client: str, session_id: str, request_id: str, body_sha: str) -> str:
    material = "\n".join(("ARCANUM-A11-RESPONSE", str(status), path, response_client, session_id, request_id, body_sha)).encode()
    return hmac.new(secret, material, hashlib.sha256).hexdigest()


def health() -> dict:
    with urllib.request.urlopen(f"{base}/health", timeout=3) as response:
        return json.load(response)


def bound_body(health_doc: dict, *, requested_at: str | None = None, repository: str | None = None, target_head: str | None = None, session_id: str | None = None) -> dict:
    sid = session_id or health_doc["sessionId"]
    return {
        "schemaVersion": "1.1",
        "clientId": client_id,
        "sessionId": sid,
        "requestId": str(uuid.uuid4()),
        "nonce": uuid.uuid4().hex,
        "requestedAt": requested_at or datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "repository": repository or health_doc["repository"],
        "targetBranch": health_doc["branch"],
        "targetHead": target_head or health_doc["commit"],
    }


def post(path: str, payload: dict, *, key: bytes = secret, omit_headers: bool = False) -> tuple[int, dict, dict[str, str]]:
    body = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode()
    body_sha = sha256(body)
    headers = {"Content-Type": "application/json"}
    if not omit_headers:
        headers.update({
            "X-Arcanum-Client-Id": client_id,
            "X-Arcanum-Session-Id": payload["sessionId"],
            "X-Arcanum-Request-Id": payload["requestId"],
            "X-Arcanum-Request-Sha256": body_sha,
            "X-Arcanum-Auth": auth_request(path, payload["sessionId"], payload["requestId"], payload["requestedAt"], payload["nonce"], body_sha, key),
        })
    request = urllib.request.Request(f"{base}{path}", data=body, headers=headers, method="POST")
    try:
        response = urllib.request.urlopen(request, timeout=10)
    except urllib.error.HTTPError as error:
        response = error

    response_body = response.read()
    status = response.status
    response_headers = {key.lower(): value for key, value in response.headers.items()}
    parsed = json.loads(response_body)

    if not omit_headers:
        response_sha = response_headers["x-arcanum-response-sha256"]
        assert response_sha == sha256(response_body)
        assert response_headers["x-arcanum-client-id"] == client_id
        assert response_headers["x-arcanum-session-id"] == payload["sessionId"]
        assert response_headers["x-arcanum-request-id"] == payload["requestId"]
        expected = auth_response(status, path, client_id, payload["sessionId"], payload["requestId"], response_sha)
        assert hmac.compare_digest(expected, response_headers["x-arcanum-auth"])
    return status, parsed, response_headers


h = health()
assert h["schemaVersion"] == "1.1"
assert h["authRequired"] is True

unauth = bound_body(h)
unauth["commandId"] = "git_head"
unauth["approval"] = {"approvalId": str(uuid.uuid4()), "approvedAt": unauth["requestedAt"], "surface": "native_dialog"}
status, body, _ = post("/execute", unauth, omit_headers=True)
assert status in (401, 403)
assert body["error"] in {"client_not_allowed", "invalid_auth_headers"}

session_req = bound_body(h)
status, session_receipt, _ = post("/session", session_req)
assert status == 200
assert session_receipt["receiptType"] == "architect_session_receipt"
assert session_receipt["status"] == "pass"
assert session_receipt["sessionId"] == h["sessionId"]

exec_req = bound_body(h)
exec_req["commandId"] = "git_head"
exec_req["approval"] = {"approvalId": str(uuid.uuid4()), "approvedAt": exec_req["requestedAt"], "surface": "native_dialog"}
status, receipt, _ = post("/execute", exec_req)
assert status == 200
assert receipt["receiptType"] == "architect_execution_receipt"
assert receipt["command"]["id"] == "git_head"
assert receipt["commitBefore"] == h["commit"]
assert receipt["commitAfter"] == h["commit"]
assert receipt["status"] == "pass"
assert receipt["stdout"].strip() == h["commit"]
assert receipt["stdoutSha256"] == sha256(receipt["stdout"].encode())
assert receipt["stderrSha256"] == sha256(receipt["stderr"].encode())
assert len(receipt["requestSha256"]) == 64
assert len(receipt["resultSha256"]) == 64

status, replay, _ = post("/execute", exec_req)
assert status == 409
assert replay["error"] == "replay_detected"

wrong_session = bound_body(h, session_id=str(uuid.uuid4()))
wrong_session["commandId"] = "git_head"
wrong_session["approval"] = {"approvalId": str(uuid.uuid4()), "approvedAt": wrong_session["requestedAt"], "surface": "native_dialog"}
status, body, _ = post("/execute", wrong_session)
assert status == 409
assert body["error"] == "session_mismatch"

stale_at = (datetime.now(timezone.utc) - timedelta(minutes=10)).isoformat().replace("+00:00", "Z")
stale = bound_body(h, requested_at=stale_at)
status, body, _ = post("/session", stale)
assert status == 409
assert body["error"] == "stale_request"

repo_mismatch = bound_body(h, repository=str(repo.parent))
status, body, _ = post("/session", repo_mismatch)
assert status == 409
assert body["error"] == "repository_mismatch"

head_mismatch = bound_body(h, target_head="0" * 40)
status, body, _ = post("/session", head_mismatch)
assert status == 409
assert body["error"] == "target_head_mismatch"

unknown = bound_body(h)
unknown["commandId"] = "not_registered"
unknown["approval"] = {"approvalId": str(uuid.uuid4()), "approvedAt": unknown["requestedAt"], "surface": "native_dialog"}
status, body, _ = post("/execute", unknown)
assert status == 404
assert body["error"] == "unknown_command"

wrong_key = b"\x00" * 32
wrong_secret = bound_body(h)
status, body, _ = post("/session", wrong_secret, key=wrong_key)
assert status == 401
assert body["error"] == "authentication_failed"

print("PASS: A11 authenticated session, exact-byte response auth, replay/stale/repo/HEAD rejection, and fixed command ceiling")
PY

ORIGIN_STATUS="$(
  curl --silent \
    --output "$WORK_TMP/origin.json" \
    --write-out '%{http_code}' \
    -H 'Origin: https://example.invalid' \
    "http://127.0.0.1:$PORT/health"
)"

[[ "$ORIGIN_STATUS" == "403" ]]
jq -e '.error == "origin_not_allowed"' "$WORK_TMP/origin.json" >/dev/null

echo "PASS: Termux broker A11 integration and Origin defense-in-depth boundary"
