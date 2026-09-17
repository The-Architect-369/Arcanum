#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

export GIT_OPTIONAL_LOCKS=0

CANONICAL_REPOSITORY_ID="The-Architect-369/Arcanum"
CANONICAL_REPO="$HOME/Arcanum"
LEGACY_REPO="$HOME/work/Arcanum"

usage_error() {
  printf '[arcanum-operator] ERROR: exactly one registered operation ID is required\n' >&2
  exit 64
}

[[ "$#" -eq 1 ]] || usage_error
OPERATION_ID="$1"

case "$OPERATION_ID" in
  probe_workspace)
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
