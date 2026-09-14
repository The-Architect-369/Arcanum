#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

fail() { printf '[arcanum-broker] ERROR: %s\n' "$*" >&2; exit 1; }

# A09 repository targeting precedence:
# 1. explicit current Git repository when invoked from inside one
# 2. ARCANUM_REPO_DIR advanced override
# 3. canonical $HOME/Arcanum checkout
# 4. fail closed
#
# This prevents a stale exported ARCANUM_REPO_DIR from silently overriding the
# repository the Human Architect is actively standing in.
if git rev-parse --show-toplevel >/dev/null 2>&1; then
  REPO_DIR="$(git rev-parse --show-toplevel)"
elif [[ -n "${ARCANUM_REPO_DIR:-}" ]]; then
  REPO_DIR="$ARCANUM_REPO_DIR"
elif [[ -d "$HOME/Arcanum/.git" ]]; then
  REPO_DIR="$HOME/Arcanum"
else
  fail "run from inside Arcanum, set ARCANUM_REPO_DIR, or create $HOME/Arcanum"
fi

REPO_DIR="$(cd "$REPO_DIR" && pwd -P)"
[[ -d "$REPO_DIR/.git" ]] || fail "not an Arcanum Git repository: $REPO_DIR"
[[ "$(git -C "$REPO_DIR" rev-parse --show-toplevel)" == "$REPO_DIR" ]] || \
  fail "resolved path is not the Git repository root: $REPO_DIR"

PORT="${ARCANUM_BROKER_PORT:-8765}"
printf '[arcanum-broker] repo=%s\n' "$REPO_DIR"
printf '[arcanum-broker] endpoint=http://127.0.0.1:%s\n' "$PORT"
printf '[arcanum-broker] stop with Ctrl-C\n'

exec python3 "$REPO_DIR/scripts/architect/termux-broker.py" \
  --repo "$REPO_DIR" \
  --host 127.0.0.1 \
  --port "$PORT"
