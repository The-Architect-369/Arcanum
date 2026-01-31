#!/usr/bin/env bash
# verify-sync.sh  —  Architect GPT sync integrity checker
# Usage: bash verify-sync.sh

CORE="ArchitectGPT_Core.md"
EXT="ArchitectGPT_Extended.md"

# Extract metadata
core_ver=$(grep -m1 "^version:" "$CORE" | awk '{print $2}')
ext_ver=$(grep -m1 "^version:" "$EXT" | awk '{print $2}')
core_date=$(grep -m1 "^last_updated:" "$CORE" | awk '{print $2}')
ext_date=$(grep -m1 "^last_updated:" "$EXT" | awk '{print $2}')
core_ref=$(grep -m1 "linked_extended" "$CORE" | awk '{print $2}')
ext_ref=$(grep -m1 "linked_core" "$EXT" | awk '{print $2}')

echo "🔍  Architect GPT Synchronization Verification"
echo "----------------------------------------------"
echo "Core version:      $core_ver"
echo "Extended version:  $ext_ver"
echo "Core updated:      $core_date"
echo "Extended updated:  $ext_date"
echo

# Checks
status=0

if [[ "$core_ver" == "$ext_ver" ]]; then
  echo "✅ Versions match"
else
  echo "❌ Version mismatch"
  status=1
fi

if [[ "$core_date" == "$ext_date" ]]; then
  echo "✅ Dates match"
else
  echo "⚠️  Date mismatch"
  status=1
fi

if grep -q "$EXT" "$CORE" && grep -q "$CORE" "$EXT"; then
  echo "✅ Cross-references found"
else
  echo "❌ Cross-references missing"
  status=1
fi

if [[ $status -eq 0 ]]; then
  echo
  echo "✅ All synchronization checks passed."
else
  echo
  echo "⚠️  One or more checks failed. Please review the log above."
fi

exit $status
