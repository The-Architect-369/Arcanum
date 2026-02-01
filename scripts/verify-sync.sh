#!/usr/bin/env bash
# Architect GPT — Synchronization Verifier (v3.0)
# Confirms alignment of Core, Extended, and Treasury documents
# Maintainer: The-Architect-369

set -e

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
