#!/usr/bin/env bash
# CE-W04-A12 proposal-envelope integration fixtures.
# The target repository is read-only throughout generation/review.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$ROOT" ]] || { echo "FAIL A12 test must run inside a git repository" >&2; exit 1; }
cd "$ROOT"

python3 scripts/verify-ce-w04-a12.py

TMP_ROOT="$(mktemp -d)"
BROKER_PID=""
cleanup() {
  if [[ -n "$BROKER_PID" ]]; then
    kill "$BROKER_PID" 2>/dev/null || true
    wait "$BROKER_PID" 2>/dev/null || true
  fi
  rm -rf "$TMP_ROOT"
}
trap cleanup EXIT

snapshot_repository() {
  python3 -B - "$ROOT" <<'PY'
from __future__ import annotations
import hashlib
import os
import subprocess
import sys
from pathlib import Path

root = Path(sys.argv[1])
env = {**os.environ, "GIT_OPTIONAL_LOCKS": "0"}

def git(*args: str) -> bytes:
    return subprocess.run(
        ("git", *args),
        cwd=root,
        env=env,
        shell=False,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    ).stdout

digest = hashlib.sha256()
digest.update(git("rev-parse", "HEAD"))
digest.update(git("symbolic-ref", "-q", "HEAD"))
tracked = [item.decode("utf-8") for item in git("ls-files", "-z").split(b"\0") if item]
untracked = git("ls-files", "--others", "--exclude-standard", "-z")
digest.update(untracked)
for relative in sorted(tracked):
    path = root / relative
    digest.update(relative.encode("utf-8") + b"\0")
    if path.is_file() and not path.is_symlink():
        digest.update(hashlib.sha256(path.read_bytes()).digest())
    elif path.is_symlink():
        digest.update(b"symlink\0" + os.readlink(path).encode("utf-8"))
git_dir = Path(git("rev-parse", "--git-dir").decode().strip())
if not git_dir.is_absolute():
    git_dir = root / git_dir
for name in ("HEAD", "index"):
    path = git_dir / name
    digest.update(name.encode() + b"\0")
    digest.update(hashlib.sha256(path.read_bytes()).digest() if path.exists() else b"absent")
print(digest.hexdigest())
PY
}

BEFORE="$(snapshot_repository)"
HEAD_SHA="$(GIT_OPTIONAL_LOCKS=0 git rev-parse HEAD)"

SECRET_FILE="$TMP_ROOT/pairing-secret"
python3 -B - "$SECRET_FILE" <<'PY'
import secrets
import sys
from pathlib import Path
path = Path(sys.argv[1])
path.write_text(secrets.token_hex(32) + "\n", encoding="utf-8")
path.chmod(0o600)
PY

PORT="$(python3 -B - <<'PY'
import socket
with socket.socket() as sock:
    sock.bind(("127.0.0.1", 0))
    print(sock.getsockname()[1])
PY
)"

TMPDIR="$TMP_ROOT" python3 -B scripts/architect/termux-broker.py \
  --repo "$ROOT" \
  --secret-file "$SECRET_FILE" \
  --host 127.0.0.1 \
  --port "$PORT" \
  >"$TMP_ROOT/broker.out" 2>"$TMP_ROOT/broker.err" &
BROKER_PID="$!"

python3 -B - "$ROOT" "$HEAD_SHA" "$SECRET_FILE" "$PORT" <<'PY'
from __future__ import annotations

import copy
import hashlib
import hmac
import json
import secrets
import sys
import time
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timezone
from pathlib import Path

root = Path(sys.argv[1])
head = sys.argv[2]
secret = bytes.fromhex(Path(sys.argv[3]).read_text(encoding="utf-8").strip())
port = int(sys.argv[4])
sys.path.insert(0, str(root / "scripts" / "architect"))
import proposal_envelope as pe  # noqa: E402

BASE = f"http://127.0.0.1:{port}"
CLIENT = "org.arcanum.nativehost"
PATH = "/proposal/review"

def sha(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()

def request_material(session: str, request_id: str, requested_at: str, nonce: str, body_sha: str) -> bytes:
    return "\n".join(("ARCANUM-A11-REQUEST", "POST", PATH, CLIENT, session, request_id, requested_at, nonce, body_sha)).encode()

def response_material(status: int, session: str, request_id: str, body_sha: str) -> bytes:
    return "\n".join(("ARCANUM-A11-RESPONSE", str(status), PATH, CLIENT, session, request_id, body_sha)).encode()

def health() -> dict:
    last = None
    for _ in range(60):
        try:
            with urllib.request.urlopen(f"{BASE}/health", timeout=0.5) as response:
                return json.loads(response.read())
        except Exception as error:  # broker startup retry only
            last = error
            time.sleep(0.05)
    raise AssertionError(f"broker did not become ready: {last}")

broker_health = health()
assert broker_health["schemaVersion"] == "1.1"
assert len(broker_health["commands"]) == 8
assert broker_health["commit"] == head
session = broker_health["sessionId"]
repository_path = broker_health["repository"]
branch = broker_health["branch"]

base_entry = pe.read_base_blob(root, head, "README.md")
assert base_entry is not None
base_text = pe.validate_text_blob(base_entry[1], path="README.md")
desired_text = base_text + "<!-- CE-W04-A12 in-memory proposal fixture -->\n"
scope = ["README.md"]
desired = [{"path": "README.md", "operation": "upsert", "content": desired_text}]

envelope_a = pe.generate_envelope(
    root,
    repository_id=pe.DEFAULT_REPOSITORY_ID,
    base_commit=head,
    permitted_paths=scope,
    desired_files=desired,
)
envelope_b = pe.generate_envelope(
    root,
    repository_id=pe.DEFAULT_REPOSITORY_ID,
    base_commit=head,
    permitted_paths=scope,
    desired_files=desired,
)
assert pe.canonical_json(envelope_a) == pe.canonical_json(envelope_b)
verified = pe.verify_proposal_envelope(
    root,
    expected_repository_id=pe.DEFAULT_REPOSITORY_ID,
    expected_base=head,
    trusted_permitted_paths=scope,
    envelope=envelope_a,
)
assert verified["verification"] == "valid_candidate"
assert verified["authorityEffect"] == "none"
assert verified["applied"] is False

def post(proposal: object, permitted_paths: list[str], *, expect: int) -> dict:
    request_id = str(uuid.uuid4())
    nonce = secrets.token_hex(16)
    requested_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    body = {
        "schemaVersion": "1.1",
        "clientId": CLIENT,
        "sessionId": session,
        "requestId": request_id,
        "nonce": nonce,
        "requestedAt": requested_at,
        "repository": repository_path,
        "targetBranch": branch,
        "targetHead": head,
        "scopeAssertion": {
            "scopeId": str(uuid.uuid4()),
            "confirmedAt": requested_at,
            "surface": "native_dialog",
            "permittedPaths": permitted_paths,
        },
        "proposal": proposal,
    }
    raw = json.dumps(body, separators=(",", ":"), ensure_ascii=False).encode()
    body_sha = sha(raw)
    auth = hmac.new(secret, request_material(session, request_id, requested_at, nonce, body_sha), hashlib.sha256).hexdigest()
    request = urllib.request.Request(
        f"{BASE}{PATH}",
        data=raw,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-Arcanum-Client-Id": CLIENT,
            "X-Arcanum-Session-Id": session,
            "X-Arcanum-Request-Id": request_id,
            "X-Arcanum-Request-Sha256": body_sha,
            "X-Arcanum-Auth": auth,
        },
    )
    try:
        response = urllib.request.urlopen(request, timeout=5)
    except urllib.error.HTTPError as error:
        response = error
    response_raw = response.read()
    status = response.getcode()
    assert status == expect, (status, response_raw)
    response_sha = response.headers["X-Arcanum-Response-Sha256"]
    response_auth = response.headers["X-Arcanum-Auth"]
    assert response_sha == sha(response_raw)
    expected_auth = hmac.new(secret, response_material(status, session, request_id, response_sha), hashlib.sha256).hexdigest()
    assert hmac.compare_digest(response_auth, expected_auth)
    return json.loads(response_raw)

receipt = post(envelope_a, scope, expect=200)
assert receipt["receiptType"] == "architect_proposal_review_receipt"
assert receipt["verification"] == "valid_candidate"
assert receipt["authorityEffect"] == "none"
assert receipt["applied"] is False
assert receipt["baseCommit"] == head
assert receipt["headBefore"] == head == receipt["headAfter"]
assert receipt["touchedPaths"] == ["README.md"]
assert receipt["proposalSha256"] == envelope_a["proposalSha256"]

wrong_base = copy.deepcopy(envelope_a)
wrong_base["baseCommit"] = ("0" if head[0] != "0" else "1") + head[1:]
assert post(wrong_base, scope, expect=409)["error"] == "stale_base"

bad_digest = copy.deepcopy(envelope_a)
bad_digest["diffSha256"] = "0" * 64
assert post(bad_digest, scope, expect=400)["error"] == "diff_digest_mismatch"

assert post(envelope_a, ["scripts/architect/termux-broker.py"], expect=403)["error"] == "scope_mismatch"
assert post({"schemaVersion": "1.0"}, scope, expect=400)["error"] == "invalid_envelope"

try:
    pe.validate_path("../escape")
except pe.EnvelopeError as error:
    assert error.code == "invalid_path"
else:
    raise AssertionError("path traversal did not fail closed")

try:
    pe.validate_path("docs/repo/repo-index.json")
except pe.EnvelopeError as error:
    assert error.code == "denied_path"
else:
    raise AssertionError("repo-index path did not fail closed")

try:
    pe.strict_json_loads('{"a":1,"a":2}')
except pe.EnvelopeError as error:
    assert error.code == "duplicate_json_key"
else:
    raise AssertionError("duplicate JSON key did not fail closed")

print("PASS deterministic generation, exact-base review, scope enforcement, and authenticated non-apply receipt")
PY

kill "$BROKER_PID"
wait "$BROKER_PID" || true
BROKER_PID=""

AFTER="$(snapshot_repository)"
[[ "$BEFORE" == "$AFTER" ]] || {
  echo "FAIL proposal generation/review changed repository state" >&2
  echo "before=$BEFORE" >&2
  echo "after=$AFTER" >&2
  exit 1
}

echo "PASS CE-W04-A12 repository snapshot unchanged"
