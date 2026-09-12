#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

fail() { printf '[arcanum-broker] ERROR: %s\n' "$*" >&2; exit 1; }

REPO_DIR="${ARCANUM_REPO_DIR:-}"
if [[ -z "$REPO_DIR" ]]; then
  if git rev-parse --show-toplevel >/dev/null 2>&1; then
    REPO_DIR="$(git rev-parse --show-toplevel)"
  elif [[ -d "$HOME/Arcanum/.git" ]]; then
    REPO_DIR="$HOME/Arcanum"
  else
    fail "set ARCANUM_REPO_DIR or run from inside the Arcanum repository"
  fi
fi

REPO_DIR="$(cd "$REPO_DIR" && pwd -P)"
[[ -d "$REPO_DIR/.git" ]] || fail "not an Arcanum Git repository: $REPO_DIR"

PORT="${ARCANUM_BROKER_PORT:-8765}"
printf '[arcanum-broker] repo=%s\n' "$REPO_DIR"
printf '[arcanum-broker] endpoint=http://127.0.0.1:%s\n' "$PORT"
printf '[arcanum-broker] stop with Ctrl-C\n'

exec python3 "$REPO_DIR/scripts/architect/termux-broker.py" \
  --repo "$REPO_DIR" \
  --host 127.0.0.1 \
  --port "$PORT"
