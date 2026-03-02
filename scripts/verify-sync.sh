#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

INDEX_FILE="docs/repo/repo-index.json"

echo "== verify-sync =="
echo "Repo: $(basename "$ROOT_DIR")"
echo "Commit: $(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
echo

# 1) Ensure generator runs
echo "[1/3] Generating repo index..."
bash scripts/repo-index.sh >/dev/null

# 2) Ensure repo index is tracked and not dirty
echo "[2/3] Checking repo index is clean..."
if ! git ls-files --error-unmatch "$INDEX_FILE" >/dev/null 2>&1; then
  echo "❌ $INDEX_FILE is not tracked by git. Add it and commit."
  exit 1
fi

# If regeneration changed it, git will show it as modified.
if ! git diff --quiet -- "$INDEX_FILE"; then
  echo "❌ $INDEX_FILE differs from generated output."
  echo "   Run: bash scripts/repo-index.sh"
  echo "   Then: git add $INDEX_FILE && git commit -m \"chore(docs): update repo index\""
  exit 1
fi

echo "✅ repo index matches generator output."

# 3) Minimal structural sanity checks for docs discipline
echo "[3/3] Sanity checks..."

# Required docs entrypoints (based on your current structure)
required_paths=(
  "docs/index.md"
  "docs/README.md"
  "docs/repo/repo-interface.md"
  "docs/repo/repo-index-generator-spec.md"
)

for p in "${required_paths[@]}"; do
  if [[ ! -f "$p" ]]; then
    echo "❌ missing required file: $p"
    exit 1
  fi
done

echo "✅ required files present."

echo
echo "✅ verify-sync passed."