#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$ROOT" ]] || { echo "FAIL not inside a git repository" >&2; exit 1; }
cd "$ROOT"

if [[ $# -lt 1 ]]; then
  echo "Usage: scripts/architect/promote-wave.sh <wave> [promotion-orchestrator options]" >&2
  exit 2
fi

exec python3 scripts/architect/promotion-orchestrator.py "$@"
