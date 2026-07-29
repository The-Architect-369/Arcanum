#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
PORT="${ARCANUM_BROKER_TEST_PORT:-18765}"
WORK_TMP="${TMPDIR:-${PREFIX:-/tmp}/tmp}/arcanum-termux-broker-test"
LOG_FILE="$WORK_TMP/broker.log"
PID_FILE="$WORK_TMP/broker.pid"

mkdir -p "$WORK_TMP"
rm -f "$LOG_FILE" "$PID_FILE"

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
  .schemaVersion == "1.0" and
  .service == "arcanum-termux-broker" and
  .status == "ready" and
  (.commands | length) == 8
' "$WORK_TMP/health.json" >/dev/null

cat > "$WORK_TMP/request.json" <<JSON
{
  "schemaVersion": "1.0",
  "commandId": "git_head",
  "approvedByHumanArchitect": true,
  "requestedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
JSON

curl --silent --fail \
  -H 'content-type: application/json' \
  --data-binary @"$WORK_TMP/request.json" \
  "http://127.0.0.1:$PORT/execute" \
  > "$WORK_TMP/receipt.json"

EXPECTED_HEAD="$(git -C "$REPO_ROOT" rev-parse HEAD)"

jq -e --arg expected "$EXPECTED_HEAD" '
  .schemaVersion == "1.0" and
  .receiptType == "architect_execution_receipt" and
  .command.id == "git_head" and
  .commitBefore == $expected and
  .commitAfter == $expected and
  .exitCode == 0 and
  .status == "pass" and
  (.requestSha256 | length) == 64 and
  (.resultSha256 | length) == 64
' "$WORK_TMP/receipt.json" >/dev/null

UNKNOWN_STATUS="$(
  curl --silent \
    --output "$WORK_TMP/unknown.json" \
    --write-out '%{http_code}' \
    -H 'content-type: application/json' \
    --data '{"schemaVersion":"1.0","commandId":"not_registered","approvedByHumanArchitect":true,"requestedAt":"2026-01-01T00:00:00Z"}' \
    "http://127.0.0.1:$PORT/execute"
)"

[[ "$UNKNOWN_STATUS" == "404" ]]
jq -e '.error == "unknown_command"' "$WORK_TMP/unknown.json" >/dev/null

ORIGIN_STATUS="$(
  curl --silent \
    --output "$WORK_TMP/origin.json" \
    --write-out '%{http_code}' \
    -H 'Origin: https://example.invalid' \
    "http://127.0.0.1:$PORT/health"
)"

[[ "$ORIGIN_STATUS" == "403" ]]
jq -e '.error == "origin_not_allowed"' "$WORK_TMP/origin.json" >/dev/null

echo "PASS: Termux broker health, execution receipt, unknown-command rejection, and Origin boundary"
