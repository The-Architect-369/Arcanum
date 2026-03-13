#!/usr/bin/env bash
# verify-sync.sh — repo + governance integrity checks
# Usage: bash scripts/verify-sync.sh
#
# What this enforces:
# 1) Repo index is up-to-date (docs/repo/repo-index.json) via scripts/repo-index.sh
# 2) Architect GPT manifest exists, versions match, and all referenced files exist
# 3) Governance canonical files exist (treasury/governance spec/economic principles/changelog/interfaces)
# 4) Deprecated ArchitectGPT files are present in docs/archive (optional strictness)
#
# Notes:
# - This script assumes you're running inside a git worktree.
# - If docs/archive is intentionally absent, set ALLOW_MISSING_ARCHIVE=1

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

echo "== verify-sync =="
echo "Repo: $(basename "$ROOT_DIR")"
echo "Commit: $(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
echo

# -------------------------------------------------------------------
# 1) Repo index integrity
# -------------------------------------------------------------------
INDEX_FILE="docs/repo/repo-index.json"
GEN_SCRIPT="scripts/repo-index.sh"

echo "[1/4] Repo index integrity"
if [[ ! -f "$GEN_SCRIPT" ]]; then
  fail "Missing generator script: $GEN_SCRIPT"
else
  # Generate index (writes to docs/repo/repo-index.json)
  bash "$GEN_SCRIPT" >/dev/null || fail "Repo index generation failed"

  if [[ ! -f "$INDEX_FILE" ]]; then
    fail "Missing repo index output: $INDEX_FILE"
  else
    # Fail if index differs from generated output (content drift)
    if ! git diff --quiet -- "$INDEX_FILE"; then
      fail "$INDEX_FILE differs from generator output. Run: bash $GEN_SCRIPT && commit the updated index."
    else
      echo "✅ repo index matches generator output: $INDEX_FILE"
    fi
  fi
fi
echo

# -------------------------------------------------------------------
# 2) Architect GPT manifest integrity
# -------------------------------------------------------------------
echo "[2/4] Architect GPT manifest integrity"
MANIFEST="docs/governance/architectgpt/architect-gpt-manifest.yaml"
ARCH_DOC="docs/governance/architectgpt/architect-gpt.md"

if [[ ! -f "$MANIFEST" ]]; then
  fail "Missing manifest: $MANIFEST"
fi
if [[ ! -f "$ARCH_DOC" ]]; then
  fail "Missing canonical Architect GPT doc: $ARCH_DOC"
fi

if [[ -f "$MANIFEST" && -f "$ARCH_DOC" ]]; then
  manifest_ver="$(grep -m1 '^version:' "$MANIFEST" | awk '{print $2}' | tr -d '"' || true)"
  doc_ver="$(grep -m1 '^version:' "$ARCH_DOC" | awk '{print $2}' | tr -d '"' || true)"

  echo "Manifest version: $manifest_ver"
  echo "Doc version:      $doc_ver"

  if [[ -z "$manifest_ver" || -z "$doc_ver" ]]; then
    fail "Unable to parse version from manifest or doc."
  elif [[ "$manifest_ver" != "$doc_ver" ]]; then
    fail "Version mismatch (manifest=$manifest_ver, doc=$doc_ver)"
  else
    echo "✅ versions match"
  fi

  echo
  echo "Checking manifest file paths..."
  # Parse files: block in YAML (simple indentation-based parse)
  while IFS= read -r line; do
    # Only lines like "  key: path"
    [[ "$line" =~ ^[[:space:]]{2}[a-zA-Z0-9_]+: ]] || continue
    key="$(echo "$line" | sed -E 's/^\s*([a-zA-Z0-9_]+):.*/\1/')"
    path="$(echo "$line" | sed -E 's/^\s*[a-zA-Z0-9_]+:\s*//')"

    [[ -z "$path" ]] && continue
    if [[ -e "$path" ]]; then
      echo "✅ $key -> $path"
    else
      fail "Missing manifest target: $key -> $path"
    fi
  done < <(awk '
    /^files:/{flag=1; next}
    flag && /^[^[:space:]]/{flag=0}
    flag {print}
  ' "$MANIFEST")
fi
echo

# -------------------------------------------------------------------
# 3) Governance canonical surface presence checks
# -------------------------------------------------------------------
echo "[3/4] Governance canonical surface checks"
required_governance_files=(
  "docs/governance/governance-specification.md"
  "docs/governance/treasury-constitution.md"
  "docs/governance/economic-principles.md"
  "docs/governance/governance-changelog.md"
  "docs/governance/hopegpt/hope-guardian.md"
  "docs/governance/architectgpt/architect-gpt.md"
  "docs/governance/architectgpt/architect-gpt-manifest.yaml"
)

for f in "${required_governance_files[@]}"; do
  if [[ -f "$f" ]]; then
    echo "✅ present: $f"
  else
    fail "Missing governance file: $f"
  fi
done
echo

# -------------------------------------------------------------------
# 4) Archived deprecated files (optional strictness)
# -------------------------------------------------------------------
echo "[4/4] Archive checks (deprecated files)"
archive_files=(
  "docs/archive/architectgpt-core.md"
  "docs/archive/architectgpt-extended.md"
  "docs/archive/architect-log.md"
)

if [[ "${ALLOW_MISSING_ARCHIVE:-0}" == "1" ]]; then
  for f in "${archive_files[@]}"; do
    [[ -f "$f" ]] && echo "✅ archive present: $f" || warn "archive missing (allowed): $f"
  done
else
  for f in "${archive_files[@]}"; do
    [[ -f "$f" ]] && echo "✅ archive present: $f" || fail "archive missing: $f"
  done
fi

echo
if [[ $STATUS -eq 0 ]]; then
  echo "✅ verify-sync passed."
else
  echo "❌ verify-sync failed. Fix issues above."
fi

exit $STATUS