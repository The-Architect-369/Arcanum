#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

fail() { printf '[arcanum-broker] ERROR: %s\n' "$*" >&2; exit 1; }

# A11 repository targeting precedence:
# 1. explicit current Git repository when invoked from inside one
# 2. ARCANUM_REPO_DIR advanced override
# 3. canonical $HOME/Arcanum checkout
# 4. fail closed
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

SECRET_DIR="${ARCANUM_BROKER_SECRET_DIR:-$HOME/.config/arcanum}"
SECRET_FILE="${ARCANUM_BROKER_SECRET_FILE:-$SECRET_DIR/architect-broker.secret}"
PAIRING_CREATED=0

umask 077
mkdir -p "$SECRET_DIR"

if [[ ! -e "$SECRET_FILE" ]]; then
  python3 - "$SECRET_FILE" <<'PY'
from pathlib import Path
import secrets
import sys

path = Path(sys.argv[1])
path.write_text(secrets.token_hex(32) + "\n", encoding="utf-8")
path.chmod(0o600)
PY
  PAIRING_CREATED=1
fi

[[ -f "$SECRET_FILE" ]] || fail "pairing secret is not a regular file: $SECRET_FILE"
chmod 600 "$SECRET_FILE"
PAIRING_CODE="$(tr -d '\r\n' < "$SECRET_FILE")"
[[ "$PAIRING_CODE" =~ ^[0-9a-fA-F]{64}$ ]] || fail "pairing secret must contain exactly 64 hexadecimal characters"

PORT="${ARCANUM_BROKER_PORT:-8765}"
printf '[arcanum-broker] repo=%s\n' "$REPO_DIR"
printf '[arcanum-broker] endpoint=http://127.0.0.1:%s\n' "$PORT"
printf '[arcanum-broker] pairing-secret=%s\n' "$SECRET_FILE"
if [[ "$PAIRING_CREATED" == "1" ]]; then
  printf '[arcanum-broker] NEW PAIRING CODE (enter once in Architect): %s\n' "$PAIRING_CODE"
else
  printf '[arcanum-broker] pairing code already exists; use: cat %q\n' "$SECRET_FILE"
fi
printf '[arcanum-broker] stop with Ctrl-C\n'

unset PAIRING_CODE

exec python3 "$REPO_DIR/scripts/architect/termux-broker.py" \
  --repo "$REPO_DIR" \
  --secret-file "$SECRET_FILE" \
  --host 127.0.0.1 \
  --port "$PORT"
