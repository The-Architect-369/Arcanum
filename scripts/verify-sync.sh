#!/usr/bin/env bash
# verify-sync.sh — repo + governance + orchestration integrity checks
# Usage: bash scripts/verify-sync.sh

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${ROOT_DIR}" ]]; then
  echo "❌ Not inside a git repository."
  exit 1
fi
cd "$ROOT_DIR"

STATUS=0
fail() { echo "❌ $*"; STATUS=1; }
warn() { echo "⚠️  $*"; }

parse_version() {
  local file="$1"
