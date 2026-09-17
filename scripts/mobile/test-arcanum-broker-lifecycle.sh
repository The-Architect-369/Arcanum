#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
OPERATOR="$ROOT/scripts/mobile/arcanum-operator.sh"
BROKER_SOURCE="$ROOT/scripts/architect/termux-broker.py"
PROPOSAL_SOURCE="$ROOT/scripts/architect/proposal_envelope.py"

fail() {
  echo "FAIL A13.3 broker lifecycle fixture: $*" >&2
  exit 1
}

command -v jq >/dev/null 2>&1 || fail "jq is required"
command -v git >/dev/null 2>&1 || fail "git is required"
command -v python3 >/dev/null 2>&1 || fail "python3 is required"

TMP="$(mktemp -d)"
BROKER_PID=""
DUMMY_PID=""

cleanup() {
  set +e
  if [[ -n "$DUMMY_PID" ]]; then
    kill "$DUMMY_PID" >/dev/null 2>&1 || true
    wait "$DUMMY_PID" >/dev/null 2>&1 || true
  fi
  local state="$HOME/.config/arcanum/architect-broker.lifecycle.json"
  if [[ -f "$state" ]]; then
    local pid
    pid="$(jq -r '.pid // empty' "$state" 2>/dev/null || true)"
    if [[ "$pid" =~ ^[0-9]+$ ]]; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
  fi
  rm -rf "$TMP"
}
trap cleanup EXIT

export HOME="$TMP/home"
export TMPDIR="$TMP/tmp"
mkdir -p "$HOME/Arcanum/scripts/architect" "$TMPDIR"

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

START_JSON="$(bash "$OPERATOR" start_broker)"
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
  and .brokerPort == 8765
  and (.brokerSessionId | type == "string" and length > 0)
  and .lifecycleStatePath == ($home + "/.config/arcanum/architect-broker.lifecycle.json")
  and .logPath == ($home + "/.config/arcanum/architect-broker.log")
' --arg home "$HOME" <<<"$START_JSON" >/dev/null ||
  fail "start_broker fixture rejected"

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

python3 -m http.server 8765 --bind 127.0.0.1 \
  >"$TMP/dummy-http.log" 2>&1 &
DUMMY_PID="$!"

python3 -S - <<'PY'
import socket
import time
deadline = time.monotonic() + 5.0
while time.monotonic() < deadline:
    sock = socket.socket()
    sock.settimeout(0.1)
    try:
        if sock.connect_ex(("127.0.0.1", 8765)) == 0:
            raise SystemExit(0)
    finally:
        sock.close()
    time.sleep(0.05)
raise SystemExit("dummy listener did not become ready")
PY

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

echo "PASS CE-W04-A13.3 explicit owned broker start/stop, idempotence, unowned-process rejection, and repository immutability"
