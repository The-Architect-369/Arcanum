#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
REPORT_ROOT="$ROOT/.architect-reports/orchestration"
MANIFEST="$ROOT/docs/governance/architectgpt/architect-gpt-manifest.yaml"
REGISTRY="$ROOT/docs/governance/architectgpt/capability-registry.yaml"
INDEX="$ROOT/docs/repo/repo-index.json"
mkdir -p "$REPORT_ROOT"

usage() {
  cat <<'EOF'
Architect GPT orchestration control

Usage: