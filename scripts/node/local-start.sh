#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${ARCANUM_REPO_ROOT:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
CHAIN_DIR="${ARCANUM_CHAIN_DIR:-$REPO_ROOT/chains/arcanum}"
NODE_HOME="${ARCANUM_NODE_HOME:-$REPO_ROOT/.local/arcnet-node}"
BIN_DIR="${ARCANUM_BIN_DIR:-$REPO_ROOT/.local/bin}"
ARCANUMD="${ARCANUMD:-$BIN_DIR/arcanumd}"
CHAIN_ID="${ARCANUM_CHAIN_ID:-arcanum-local-1}"
PRUNING="${ARCANUM_PRUNING:-default}"
PID_FILE="$NODE_HOME/arcanumd.pid"
LOG_FILE="$NODE_HOME/arcanumd.log"

echo "== local ARCnet start =="
echo "repo:       $REPO_ROOT"
echo "chain dir:  $CHAIN_DIR"
echo "node home:  $NODE_HOME"
echo "binary:     $ARCANUMD"
echo "chain id:   $CHAIN_ID"
echo "pruning:    $PRUNING"
echo

mkdir -p "$NODE_HOME" "$BIN_DIR"

if [[ ! -x "$ARCANUMD" ]]; then
  echo "[1/3] Binary missing; building arcanumd"
  (
    cd "$CHAIN_DIR"
    go build -o "$ARCANUMD" ./cmd/arcanumd
  )
else
  echo "[1/3] Binary present"
fi

echo "[2/3] Checking daemon version"
"$ARCANUMD" version || true

if [[ -f "$PID_FILE" ]]; then
  OLD_PID="$(cat "$PID_FILE" || true)"
  if [[ -n "$OLD_PID" ]] && kill -0 "$OLD_PID" >/dev/null 2>&1; then
    echo "Local arcanumd already appears to be running with pid $OLD_PID."
    echo "Use bash scripts/node/local-status.sh to inspect it."
    exit 0
  fi
  rm -f "$PID_FILE"
fi

echo "[3/3] Starting local daemon in background"

echo "This is a Pre-Genesis developer node attempt. It does not start agents, grant authority, or imply production readiness." > "$LOG_FILE"

if "$ARCANUMD" start --home "$NODE_HOME" --chain-id "$CHAIN_ID" --pruning "$PRUNING" >> "$LOG_FILE" 2>&1 & then
  PID="$!"
  echo "$PID" > "$PID_FILE"
  sleep 2
  if kill -0 "$PID" >/dev/null 2>&1; then
    echo "✅ local arcanumd started with pid $PID"
    echo "log: $LOG_FILE"
  else
    echo "arcanumd exited during startup. Recent log follows:" >&2
    tail -80 "$LOG_FILE" >&2 || true
    rm -f "$PID_FILE"
    exit 1
  fi
else
  echo "Failed to launch arcanumd start." >&2
  tail -80 "$LOG_FILE" >&2 || true
  exit 1
fi

echo "Next: bash scripts/node/local-status.sh"}