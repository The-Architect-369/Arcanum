#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${ARCANUM_REPO_ROOT:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
NODE_HOME="${ARCANUM_NODE_HOME:-$REPO_ROOT/.local/arcnet-node}"
BIN_DIR="${ARCANUM_BIN_DIR:-$REPO_ROOT/.local/bin}"
ARCANUMD="${ARCANUMD:-$BIN_DIR/arcanumd}"
CHAIN_ID="${ARCANUM_CHAIN_ID:-arcanum-local-1}"
PID_FILE="$NODE_HOME/arcanumd.pid"
LOG_FILE="$NODE_HOME/arcanumd.log"

echo "== local ARCnet status =="
echo "repo:       $REPO_ROOT"
echo "node home:  $NODE_HOME"
echo "binary:     $ARCANUMD"
echo "chain id:   $CHAIN_ID"
echo

if [[ -x "$ARCANUMD" ]]; then
  echo "[binary] present"
  "$ARCANUMD" version || true
else
  echo "[binary] missing"
  echo "Run: bash scripts/node/local-reset.sh"
fi

echo
if [[ -d "$NODE_HOME" ]]; then
  echo "[home] present"
  find "$NODE_HOME" -maxdepth 2 -type f | sed "s#^$REPO_ROOT/##" | sort | head -50
else
  echo "[home] missing"
fi

echo
if [[ -f "$PID_FILE" ]]; then
  PID="$(cat "$PID_FILE" || true)"
  if [[ -n "$PID" ]] && kill -0 "$PID" >/dev/null 2>&1; then
    echo "[process] running pid=$PID"
  else
    echo "[process] pid file exists but process is not running"
  fi
else
  echo "[process] no pid file"
fi

echo
if [[ -x "$ARCANUMD" ]]; then
  echo "[daemon status]"
  if "$ARCANUMD" status --home "$NODE_HOME" >/tmp/arcanum-local-status.log 2>&1; then
    cat /tmp/arcanum-local-status.log
  else
    cat /tmp/arcanum-local-status.log || true
    echo "Daemon status unavailable. This is expected when the local node is not running or not fully initialized." >&2
  fi
  rm -f /tmp/arcanum-local-status.log
fi

echo
if [[ -f "$LOG_FILE" ]]; then
  echo "[recent log]"
  tail -40 "$LOG_FILE" || true
fi

echo
echo "Status is informational only. Local node state does not imply validator, governance, MANA, Vitae, or agent authority."