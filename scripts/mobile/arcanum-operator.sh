#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

export GIT_OPTIONAL_LOCKS=0

CANONICAL_REPOSITORY_ID="The-Architect-369/Arcanum"
CANONICAL_REPO="$HOME/Arcanum"
LEGACY_REPO="$HOME/work/Arcanum"
PAIRING_SECRET_DIR="$HOME/.config/arcanum"
PAIRING_SECRET_FILE="$PAIRING_SECRET_DIR/architect-broker.secret"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
LIFECYCLE_HELPER="$SCRIPT_DIR/arcanum-broker-lifecycle.py"

usage_error() {
  printf '[arcanum-operator] ERROR: exactly one registered operation ID is required\n' >&2
  exit 64
}

[[ "$#" -eq 1 ]] || usage_error
OPERATION_ID="$1"

case "$OPERATION_ID" in
  probe_workspace | pair_native_client | start_broker | stop_broker)
    ;;
  *)
    printf '[arcanum-operator] ERROR: unregistered operation: %s\n' "$OPERATION_ID" >&2
    exit 64
    ;;
esac

accepted_origin() {
  case "$1" in
    "https://github.com/The-Architect-369/Arcanum" | \
    "https://github.com/The-Architect-369/Arcanum.git" | \
    "git@github.com:The-Architect-369/Arcanum.git" | \
    "ssh://git@github.com/The-Architect-369/Arcanum.git")
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

STATUS="fail"
REASON="canonical_workspace_missing"
ORIGIN=""
BRANCH=""
HEAD_SHA=""
CLEAN="false"

if [[ -d "$CANONICAL_REPO/.git" ]] &&
   git -C "$CANONICAL_REPO" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  REPO_REAL="$(cd "$CANONICAL_REPO" && pwd -P)"
  ROOT="$(git -C "$CANONICAL_REPO" rev-parse --show-toplevel 2>/dev/null || true)"
  ROOT_REAL=""
  if [[ -n "$ROOT" && -d "$ROOT" ]]; then
    ROOT_REAL="$(cd "$ROOT" && pwd -P)"
  fi

  if [[ "$ROOT_REAL" != "$REPO_REAL" ]]; then
    REASON="canonical_workspace_not_git_root"
  else
    ORIGIN="$(git -C "$CANONICAL_REPO" remote get-url origin 2>/dev/null || true)"
    BRANCH="$(git -C "$CANONICAL_REPO" branch --show-current 2>/dev/null || true)"
    HEAD_SHA="$(git -C "$CANONICAL_REPO" rev-parse HEAD 2>/dev/null || true)"

    if ! accepted_origin "$ORIGIN"; then
      REASON="origin_mismatch"
    elif [[ -z "$BRANCH" ]]; then
      REASON="detached_head"
    elif [[ ! "$HEAD_SHA" =~ ^[0-9a-f]{40}$ ]]; then
      REASON="invalid_head"
    else
      if [[ -z "$(git -C "$CANONICAL_REPO" status --porcelain=v1 --untracked-files=normal)" ]]; then
        CLEAN="true"
      fi
      STATUS="pass"
      REASON=""
    fi
  fi
fi

if [[ "$OPERATION_ID" == "start_broker" || "$OPERATION_ID" == "stop_broker" ]]; then
  exec python3 -S "$LIFECYCLE_HELPER" "$OPERATION_ID"
fi

if [[ "$OPERATION_ID" == "pair_native_client" ]]; then
  python3 -S - \
    "$STATUS" \
    "$REASON" \
    "$CANONICAL_REPO" \
    "$CANONICAL_REPOSITORY_ID" \
    "$BRANCH" \
    "$HEAD_SHA" \
    "$PAIRING_SECRET_DIR" \
    "$PAIRING_SECRET_FILE" <<'PY'
import json
import os
from pathlib import Path
import re
import secrets
import stat
import sys

(
    status,
    reason,
    workspace_path,
    repository_id,
    branch,
    head,
    secret_dir_value,
    secret_file_value,
) = sys.argv[1:]

secret_dir = Path(secret_dir_value)
secret_file = Path(secret_file_value)

def emit(final_status, final_reason, pairing_code, secret_created):
    payload = {
        "schemaVersion": "1.0",
        "operationId": "pair_native_client",
        "status": final_status,
        "reason": final_reason,
        "authorityEffect": "none",
        "repositoryMutation": False,
        "repositoryId": repository_id,
        "workspacePath": workspace_path,
        "branch": branch or None,
        "head": head or None,
        "pairingSecretPath": str(secret_file),
        "secretCreated": secret_created,
        "pairingCode": pairing_code,
    }
    print(json.dumps(payload, sort_keys=True, separators=(",", ":")))

if status != "pass":
    emit(status, reason or "workspace_validation_failed", None, False)
    raise SystemExit(0)

created = False
try:
    secret_dir.mkdir(mode=0o700, parents=True, exist_ok=True)
    os.chmod(secret_dir, 0o700)

    create_flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
    if hasattr(os, "O_CLOEXEC"):
        create_flags |= os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        create_flags |= os.O_NOFOLLOW

    try:
        fd = os.open(secret_file, create_flags, 0o600)
    except FileExistsError:
        pass
    else:
        try:
            value = (secrets.token_hex(32) + "\n").encode("ascii")
            offset = 0
            while offset < len(value):
                offset += os.write(fd, value[offset:])
            os.fsync(fd)
            created = True
        finally:
            os.close(fd)

    read_flags = os.O_RDONLY
    if hasattr(os, "O_CLOEXEC"):
        read_flags |= os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        read_flags |= os.O_NOFOLLOW

    fd = os.open(secret_file, read_flags)
    try:
        info = os.fstat(fd)
        if not stat.S_ISREG(info.st_mode):
            emit("fail", "pairing_secret_not_regular", None, False)
            raise SystemExit(0)
        os.fchmod(fd, 0o600)
        raw = os.read(fd, 256)
    finally:
        os.close(fd)

    try:
        pairing_code = raw.decode("ascii").strip().lower()
    except UnicodeDecodeError:
        emit("fail", "pairing_secret_invalid", None, False)
        raise SystemExit(0)

    if re.fullmatch(r"[0-9a-f]{64}", pairing_code) is None:
        emit("fail", "pairing_secret_invalid", None, False)
        raise SystemExit(0)

    emit("pass", None, pairing_code, created)
except SystemExit:
    raise
except OSError:
    emit("fail", "pairing_secret_unavailable", None, False)
PY
  exit 0
fi

LEGACY_PRESENT="false"
LEGACY_BRANCH=""
LEGACY_HEAD=""
if [[ "$LEGACY_REPO" != "$CANONICAL_REPO" ]] &&
   [[ -d "$LEGACY_REPO/.git" ]] &&
   git -C "$LEGACY_REPO" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  LEGACY_PRESENT="true"
  LEGACY_BRANCH="$(git -C "$LEGACY_REPO" branch --show-current 2>/dev/null || true)"
  LEGACY_HEAD="$(git -C "$LEGACY_REPO" rev-parse HEAD 2>/dev/null || true)"
fi

python3 -S - \
  "$STATUS" \
  "$REASON" \
  "$CANONICAL_REPO" \
  "$CANONICAL_REPOSITORY_ID" \
  "$ORIGIN" \
  "$BRANCH" \
  "$HEAD_SHA" \
  "$CLEAN" \
  "$LEGACY_PRESENT" \
  "$LEGACY_REPO" \
  "$LEGACY_BRANCH" \
  "$LEGACY_HEAD" <<'PY'
import json
import sys

(
    status,
    reason,
    path,
    repository_id,
    origin,
    branch,
    head,
    clean,
    legacy_present,
    legacy_path,
    legacy_branch,
    legacy_head,
) = sys.argv[1:]

payload = {
    "schemaVersion": "1.0",
    "operationId": "probe_workspace",
    "status": status,
    "reason": reason or None,
    "authorityEffect": "none",
    "repositoryMutation": False,
    "repositoryId": repository_id,
    "path": path,
    "origin": origin or None,
    "branch": branch or None,
    "head": head or None,
    "clean": clean == "true",
    "legacyWorkspace": {
        "present": legacy_present == "true",
        "path": legacy_path,
        "branch": legacy_branch or None,
        "head": legacy_head or None,
    },
}

print(json.dumps(payload, sort_keys=True, separators=(",", ":")))
PY
