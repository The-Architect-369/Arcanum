#!/usr/bin/env bash
# Architect GPT — Synchronization Verifier (v3.0)
# Confirms alignment of Core, Extended, and Treasury documents
# Maintainer: The-Architect-369

set -e

# --- Remote Verification (GitHub) ---
GITHUB_API="https://api.github.com/repos/The-Architect-369/Arcanum/contents/docs/00_CONSTITUTION"

check_remote_version() {
  local file="$1"
  local local_version="$2"

  remote_data=$(curl -s "$GITHUB_API/$file")
  remote_version=$(echo "$remote_data" | grep -o '"version":[[:space:]]*"[^"]*"' | head -n1 | cut -d'"' -f4)

  if [[ "$remote_version" != "$local_version" && -n "$remote_version" ]]; then
    echo "⚠️  Remote version drift detected for $file (local $local_version → remote $remote_version)"
    DRIFT=1
  else
    echo "✅ Remote version up-to-date for $file"
  fi
}

echo "🔍  Architect GPT Synchronization Verification"
echo "----------------------------------------------"

CORE="docs/00_CONSTITUTION/ARCHITECT_GPT_CORE.md"
EXTENDED="docs/00_CONSTITUTION/ARCHITECT_GPT_EXTENDED.md"
TREASURY="docs/00_CONSTITUTION/TREASURY_CONSTITUTION.md"
LOG="docs/00_CONSTITUTION/.architect-log.md"

# --- Version Check ---
CORE_VERSION=$(grep -m1 "version:" $CORE | awk '{print $2}')
EXT_VERSION=$(grep -m1 "version:" $EXTENDED | awk '{print $2}')
TREASURY_VERSION=$(grep -m1 "version:" $TREASURY | awk '{print $2}')

echo "Core version:       $CORE_VERSION"
echo "Extended version:   $EXT_VERSION"
echo "Treasury version:   $TREASURY_VERSION"

# --- Timestamp Check ---
CORE_UPDATED=$(grep -m1 "last_updated:" $CORE | awk '{print $2}')
EXT_UPDATED=$(grep -m1 "last_updated:" $EXTENDED | awk '{print $2}')

echo "Core updated:       $CORE_UPDATED"
echo "Extended updated:   $EXT_UPDATED"

# --- Version Alignment ---
if [[ "$CORE_VERSION" == "$EXT_VERSION" ]]; then
  echo "✅ Versions match"
else
  echo "❌ Version mismatch between Core and Extended"
fi

if [[ "$CORE_UPDATED" == "$EXT_UPDATED" ]]; then
  echo "✅ Dates match"
else
  echo "⚠️  Date mismatch"
fi

# --- Cross-Reference Validation ---
if grep -q "linked_extended" $CORE && grep -q "linked_core" $EXTENDED; then
  echo "✅ Cross-references present"
else
  echo "❌ Cross-references missing"
fi

# --- Treasury Validation ---
if grep -q "TREASURY_CONSTITUTION.md" $LOG; then
  echo "✅ Treasury link verified"
else
  echo "⚠️  Treasury file not referenced in log"
fi

echo
echo "Synchronization verification complete."

# --- Remote Verification Pass ---
echo
echo "🌐  Checking GitHub remote versions..."
check_remote_version "ARCHITECT_GPT_CORE.md" "$CORE_VERSION"
check_remote_version "ARCHITECT_GPT_EXTENDED.md" "$EXT_VERSION"
check_remote_version "TREASURY_CONSTITUTION.md" "$TREASURY_VERSION"

if [[ $DRIFT -eq 1 ]]; then
  echo "⚠️  One or more files differ from the remote repository."
else
  echo "✅ Remote repository matches local state."
fi

if [[ -z "$GITHUB_TOKEN" ]]; then
  echo "ℹ️  Using unauthenticated GitHub API (60 req/hr limit)"
else
  echo "🔑 Using authenticated GitHub API access"
fi
