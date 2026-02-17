#!/usr/bin/env bash
# Architect GPT — Synchronization Verifier (v3.1)
# Confirms alignment of Core, Extended, and Treasury documents
# Maintainer: The-Architect-369

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

echo ""
echo "📦 Generating Repository Index..."

INDEX_PATH="docs/architect/REPO_INDEX.json"

bash "scripts/repo-index.sh" || {
  echo "❌ REPO_INDEX generation failed"
  exit 1
}

if [[ ! -f "$INDEX_PATH" ]]; then
  echo "❌ REPO_INDEX.json not found after generation"
  exit 1
fi

echo "✅ REPO_INDEX generated"

# --- Local Paths (new structure) ---
CONSTITUTION_DIR="docs/governance/constitution"

CORE="$CONSTITUTION_DIR/architectgpt-core.md"
EXTENDED="$CONSTITUTION_DIR/architectgpt-extended.md"
TREASURY="$CONSTITUTION_DIR/treasury-constitution.md"

# log filename varies across your tree snapshots; support both
LOG="$CONSTITUTION_DIR/architect-log.md"
[[ -f "$LOG" ]] || LOG="$CONSTITUTION_DIR/.architect-log.md"

FAILED=0
DRIFT=0

yaml_field() {
  local field="$1"
  local file="$2"
  grep -m1 "^${field}:" "$file" 2>/dev/null | awk '{print $2}'
}

echo "🔍  Architect GPT Synchronization Verification"
echo "----------------------------------------------"

for f in "$CORE" "$EXTENDED" "$TREASURY"; do
  if [[ ! -f "$f" ]]; then
    echo "❌ Missing required file: $f"
    FAILED=1
  fi
done

if [[ $FAILED -ne 0 ]]; then
  echo "❌ Synchronization checks failed (missing files)."
  exit 1
fi

# --- Version Check ---
CORE_VERSION="$(yaml_field version "$CORE")"
EXT_VERSION="$(yaml_field version "$EXTENDED")"
TREASURY_VERSION="$(yaml_field version "$TREASURY")"

echo "Core version:       ${CORE_VERSION:-<missing>}"
echo "Extended version:   ${EXT_VERSION:-<missing>}"
echo "Treasury version:   ${TREASURY_VERSION:-<missing>}"

# --- Timestamp Check ---
CORE_UPDATED="$(yaml_field last_updated "$CORE")"
EXT_UPDATED="$(yaml_field last_updated "$EXTENDED")"

echo "Core updated:       ${CORE_UPDATED:-<missing>}"
echo "Extended updated:   ${EXT_UPDATED:-<missing>}"

# --- Version Alignment ---
if [[ -n "${CORE_VERSION:-}" && "$CORE_VERSION" == "${EXT_VERSION:-}" ]]; then
  echo "✅ Versions match"
else
  echo "❌ Version mismatch between Core and Extended"
  FAILED=1
fi

if [[ -n "${CORE_UPDATED:-}" && "$CORE_UPDATED" == "${EXT_UPDATED:-}" ]]; then
  echo "✅ Dates match"
else
  echo "⚠️  Date mismatch"
fi

# --- Cross-Reference Validation ---
if grep -q "linked_extended" "$CORE" && grep -q "linked_core" "$EXTENDED"; then
  echo "✅ Cross-references present"
else
  echo "❌ Cross-references missing"
  FAILED=1
fi

# --- Treasury Validation (accept either old or new name in log) ---
if [[ -f "$LOG" ]]; then
  if grep -q "treasury-constitution.md" "$LOG" || grep -q "TREASURY_CONSTITUTION.md" "$LOG"; then
    echo "✅ Treasury link verified"
  else
    echo "⚠️  Treasury file not referenced in log"
  fi
else
  echo "⚠️  Architect log not found (skipping treasury link check)"
fi

# --- Remote Verification (GitHub) ---
GITHUB_API="https://api.github.com/repos/The-Architect-369/Arcanum/contents/${CONSTITUTION_DIR}"

curl_args=(-sSL)
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  curl_args+=(-H "Authorization: Bearer $GITHUB_TOKEN")
fi

remote_version_for() {
  local filename="$1"
  local local_version="$2"

  local remote_data content_b64 remote_text remote_version
  remote_data="$(curl "${curl_args[@]}" "$GITHUB_API/$filename" || true)"
  content_b64="$(echo "$remote_data" | jq -r '.content // empty' | tr -d '\n' || true)"

  if [[ -z "$content_b64" ]]; then
    echo "⚠️  Remote check failed or file missing on GitHub: $filename"
    DRIFT=1
    return 0
  fi

  remote_text="$(echo "$content_b64" | base64 -d 2>/dev/null || true)"
  remote_version="$(echo "$remote_text" | grep -m1 "^version:" | awk '{print $2}')"

  if [[ -n "${remote_version:-}" && "$remote_version" != "${local_version:-}" ]]; then
    echo "⚠️  Remote version drift detected for $filename (local ${local_version:-<missing>} → remote $remote_version)"
    DRIFT=1
  else
    echo "✅ Remote version up-to-date for $filename"
  fi
}

echo
echo "🌐  Checking GitHub remote versions..."
remote_version_for "architectgpt-core.md" "$CORE_VERSION"
remote_version_for "architectgpt-extended.md" "$EXT_VERSION"
remote_version_for "treasury-constitution.md" "$TREASURY_VERSION"

if [[ $DRIFT -eq 1 ]]; then
  echo "⚠️  One or more files differ from the remote repository."
  FAILED=1
else
  echo "✅ Remote repository matches local state."
fi

echo
if [[ $FAILED -eq 0 ]]; then
  echo "✅ All synchronization checks passed"
  exit 0
else
  echo "❌ Synchronization checks failed"
  exit 1
fi
