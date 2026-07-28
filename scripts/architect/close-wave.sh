#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$ROOT" ]; then
  echo "FAIL not inside a Git worktree" >&2
  exit 1
fi

exec python3 "$ROOT/scripts/architect/post-merge-close.py" "$@"
