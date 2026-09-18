#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
OPERATOR_SOURCE="$ROOT/scripts/mobile/arcanum-operator.sh"
LIFECYCLE_SOURCE="$ROOT/scripts/mobile/arcanum-broker-lifecycle.py"
BROKER_SOURCE="$ROOT/scripts/architect/termux-broker.py"
PROPOSAL_SOURCE="$ROOT/scripts/architect/proposal_envelope.py"

fail() {
  echo "FAIL A13.3 broker lifecycle fixture: $*" >&2
  exit 1
}

command -v jq >/dev/null 2>&1 || fail "jq is required"
command -v git >/dev/null 2>&1 || fail "git is required"
command -v python3 >/dev/null 2>&1 || fail "python3 is required"
command -v cmp >/dev/null 2>&1 || fail "cmp is required"

TMP="$(mktemp -d)"
BROKER_PID=""
DUMMY_PID=""
FIXTURE_HOME="$TMP/home"
FIXTURE_SCRIPTS="$TMP/operator"
OPERATOR="$FIXTURE_SCRIPTS/arcanum-operator.sh"

cleanup() {
  set +e
  if [[ -n "$DUMMY_PID" ]]; then
    kill "$DUMMY_PID" >/dev/null 2>&1 || true
    wait "$DUMMY_PID" >/dev/null 2>&1 || true
  fi
  # Never read the caller's lifecycle state or signal an unverified PID.
  # The fixture helper checks start ticks and argv before stopping its own broker.
  local state="$FIXTURE_HOME/.config/arcanum/architect-broker.lifecycle.json"
  if [[ -f "$state" && -f "$FIXTURE_SCRIPTS/arcanum-broker-lifecycle.py" ]]; then
    HOME="$FIXTURE_HOME" bash "$OPERATOR" stop_broker >/dev/null 2>&1 || true
  fi
  rm -rf "$TMP"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

export HOME="$FIXTURE_HOME"
export TMPDIR="$TMP/tmp"
mkdir -p "$HOME/Arcanum/scripts/architect" "$TMPDIR" "$FIXTURE_SCRIPTS"

# ARC-53: exercise the real operator against a fixture-local helper copy.
# Production source remains byte-for-byte unchanged and fixed to loopback 8765.
cp "$OPERATOR_SOURCE" "$OPERATOR"
prepare_fixture_port() {
  python3 -S - "$LIFECYCLE_SOURCE" "$FIXTURE_SCRIPTS/arcanum-broker-lifecycle.py" <<'PYPORT'
from pathlib import Path
import socket
import sys

source = Path(sys.argv[1]).read_bytes()
marker = b"\nBROKER_PORT = 8765\n"
if source.count(marker) != 1:
    raise SystemExit("FAIL ARC-53: production port declaration changed; review fixture adaptation")

# Never probe or claim the production port. The OS selects an ephemeral port;
# a bounded retry below handles a competitor claiming it before helper startup.
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as reservation:
    reservation.bind(("127.0.0.1", 0))
    port = reservation.getsockname()[1]
    if not 1024 <= port <= 65535 or port == 8765:
        raise SystemExit("FAIL ARC-53: unsafe fixture port")
    adapted = source.replace(marker, f"\nBROKER_PORT = {port}\n".encode("ascii"), 1)
    Path(sys.argv[2]).write_bytes(adapted)
print(port)
PYPORT
}

cp "$BROKER_SOURCE" "$HOME/Arcanum/scripts/architect/termux-broker.py"
cp "$PROPOSAL_SOURCE" "$HOME/Arcanum/scripts/architect/proposal_envelope.py"

git -C "$HOME/Arcanum" init -q -b main
git -C "$HOME/Arcanum" config user.name "A13 Lifecycle Fixture"
git -C "$HOME/Arcanum" config user.email "a13-lifecycle@example.invalid"
printf 'fixture\n' > "$HOME/Arcanum/README.fixture"
git -C "$HOME/Arcanum" add .
git -C "$HOME/Arcanum" commit -q -m fixture
git -C "$HOME/Arcanum" remote add origin \
  https://github.com/The-Architect-369/Arcanum.git

BEFORE_HEAD="$(git -C "$HOME/Arcanum" rev-parse HEAD)"
BEFORE_STATUS="$(git -C "$HOME/Arcanum" status --porcelain=v1 --untracked-files=normal)"

PAIR_JSON="$(bash "$OPERATOR" pair_native_client)"
PAIR_CODE="$(jq -r '.pairingCode' <<<"$PAIR_JSON")"
[[ "$PAIR_CODE" =~ ^[0-9a-f]{64}$ ]] || fail "pairing fixture did not return valid material"

STATE="$HOME/.config/arcanum/architect-broker.lifecycle.json"
LOG="$HOME/.config/arcanum/architect-broker.log"

# Retry only an explicitly unowned port collision before a broker was started.
# Other lifecycle failures remain failures; no test is skipped or made green.
for attempt in 1 2 3 4 5; do
  FIXTURE_PORT="$(prepare_fixture_port)"
  START_JSON="$(bash "$OPERATOR" start_broker)"
  if ! jq -e '.status == "fail" and .reason == "broker_port_unavailable"' \
    <<<"$START_JSON" >/dev/null; then
    break
  fi
  [[ ! -e "$STATE" ]] || fail "port collision unexpectedly created lifecycle state"
done
jq -e '
  .schemaVersion == "1.0"
  and .operationId == "start_broker"
  and .status == "pass"
  and .authorityEffect == "none"
  and .repositoryMutation == false
  and .runtimeEffect == "broker_started"
  and .repositoryId == "The-Architect-369/Arcanum"
  and .workspacePath == ($home + "/Arcanum")
  and .branch == "main"
  and (.head | test("^[0-9a-f]{40}$"))
  and .brokerState == "started"
  and (.brokerPid | type == "number" and . > 1)
  and .brokerPort == $port
  and (.brokerSessionId | type == "string" and length > 0)
  and .lifecycleStatePath == ($home + "/.config/arcanum/architect-broker.lifecycle.json")
  and .logPath == ($home + "/.config/arcanum/architect-broker.log")
' --arg home "$HOME" --argjson port "$FIXTURE_PORT" <<<"$START_JSON" >/dev/null || {
  # Do not print pairing material, environment, or unrestricted subprocess output.
  jq '{operationId,status,reason,brokerState,brokerPort}' <<<"$START_JSON" >&2 || true
  fail "start_broker fixture rejected"
}

BROKER_PID="$(jq -r '.brokerPid' <<<"$START_JSON")"
SESSION_ID="$(jq -r '.brokerSessionId' <<<"$START_JSON")"
[[ -f "$STATE" ]] || fail "lifecycle state was not created"
[[ "$(stat -c '%a' "$STATE")" == "600" ]] || fail "lifecycle state mode is not 600"
[[ -f "$LOG" ]] || fail "broker log was not created"
[[ "$(stat -c '%a' "$LOG")" == "600" ]] || fail "broker log mode is not 600"
kill -0 "$BROKER_PID" 2>/dev/null || fail "started broker process is not alive"

START_AGAIN_JSON="$(bash "$OPERATOR" start_broker)"
jq -e '
  .status == "pass"
  and .brokerState == "already_running"
  and .runtimeEffect == "none"
  and .brokerPid == $pid
  and .brokerSessionId == $session
' --argjson pid "$BROKER_PID" --arg session "$SESSION_ID" <<<"$START_AGAIN_JSON" >/dev/null ||
  fail "idempotent start did not preserve the owned broker"

AFTER_START_HEAD="$(git -C "$HOME/Arcanum" rev-parse HEAD)"
AFTER_START_STATUS="$(git -C "$HOME/Arcanum" status --porcelain=v1 --untracked-files=normal)"
[[ "$AFTER_START_HEAD" == "$BEFORE_HEAD" ]] || fail "broker start mutated repository HEAD"
[[ "$AFTER_START_STATUS" == "$BEFORE_STATUS" ]] || fail "broker start mutated repository state"

STOP_JSON="$(bash "$OPERATOR" stop_broker)"
jq -e '
  .schemaVersion == "1.0"
  and .operationId == "stop_broker"
  and .status == "pass"
  and .brokerState == "stopped"
  and .runtimeEffect == "broker_stopped"
  and .authorityEffect == "none"
  and .repositoryMutation == false
  and .brokerPid == $pid
  and .brokerSessionId == $session
' --argjson pid "$BROKER_PID" --arg session "$SESSION_ID" <<<"$STOP_JSON" >/dev/null ||
  fail "stop_broker fixture rejected"
BROKER_PID=""
[[ ! -e "$STATE" ]] || fail "lifecycle state remains after stop"

STOP_AGAIN_JSON="$(bash "$OPERATOR" stop_broker)"
jq -e '
  .status == "pass"
  and .brokerState == "already_stopped"
  and .runtimeEffect == "none"
' <<<"$STOP_AGAIN_JSON" >/dev/null ||
  fail "idempotent stop failed"

AFTER_STOP_HEAD="$(git -C "$HOME/Arcanum" rev-parse HEAD)"
AFTER_STOP_STATUS="$(git -C "$HOME/Arcanum" status --porcelain=v1 --untracked-files=normal)"
[[ "$AFTER_STOP_HEAD" == "$BEFORE_HEAD" ]] || fail "broker stop mutated repository HEAD"
[[ "$AFTER_STOP_STATUS" == "$BEFORE_STATUS" ]] || fail "broker stop mutated repository state"

SECRET="$HOME/.config/arcanum/architect-broker.secret"
printf 'invalid-secret\n' > "$SECRET"
chmod 600 "$SECRET"
INVALID_SECRET_JSON="$(bash "$OPERATOR" start_broker)"
jq -e '
  .status == "fail"
  and .reason == "pairing_secret_invalid"
  and .brokerState == "unchanged"
  and .runtimeEffect == "none"
' <<<"$INVALID_SECRET_JSON" >/dev/null ||
  fail "invalid secret did not fail closed"
[[ ! -e "$STATE" ]] || fail "invalid secret created lifecycle state"

printf '%s\n' "$PAIR_CODE" > "$SECRET"
chmod 600 "$SECRET"

python3 -m http.server "$FIXTURE_PORT" --bind 127.0.0.1 \
  >"$TMP/dummy-http.log" 2>&1 &
DUMMY_PID="$!"

python3 -S - "$FIXTURE_PORT" <<'PY'
import socket
import sys
import time
port = int(sys.argv[1])
deadline = time.monotonic() + 5.0
while time.monotonic() < deadline:
    sock = socket.socket()
    sock.settimeout(0.1)
    try:
        if sock.connect_ex(("127.0.0.1", port)) == 0:
            raise SystemExit(0)
    finally:
        sock.close()
    time.sleep(0.05)
raise SystemExit("dummy listener did not become ready")
PY

kill -0 "$DUMMY_PID" 2>/dev/null || fail "fixture dummy listener exited before assertions"

UNOWNED_START_JSON="$(bash "$OPERATOR" start_broker)"
jq -e '
  .status == "fail"
  and .reason == "broker_port_unavailable"
  and .brokerState == "unchanged"
' <<<"$UNOWNED_START_JSON" >/dev/null ||
  fail "start did not reject an unowned listener"
kill -0 "$DUMMY_PID" 2>/dev/null || fail "start operation killed an unowned process"

UNOWNED_STOP_JSON="$(bash "$OPERATOR" stop_broker)"
jq -e '
  .status == "fail"
  and .reason == "unowned_broker_detected"
  and .brokerState == "unchanged"
' <<<"$UNOWNED_STOP_JSON" >/dev/null ||
  fail "stop did not reject an unowned listener"
kill -0 "$DUMMY_PID" 2>/dev/null || fail "stop operation killed an unowned process"

kill "$DUMMY_PID"
wait "$DUMMY_PID" 2>/dev/null || true
DUMMY_PID=""

if bash "$OPERATOR" start_broker unexpected >/dev/null 2>&1; then
  fail "extra start arguments were accepted"
fi
if bash "$OPERATOR" stop_broker unexpected >/dev/null 2>&1; then
  fail "extra stop arguments were accepted"
fi

cmp -s "$OPERATOR_SOURCE" "$OPERATOR" || fail "fixture operator differs from production source"
printf 'PASS ARC-53 lifecycle fixture isolation on loopback port %s; production 8765 untouched\n' "$FIXTURE_PORT"
echo "PASS CE-W04-A13.3 explicit owned broker start/stop, idempotence, unowned-process rejection, and repository immutability"
