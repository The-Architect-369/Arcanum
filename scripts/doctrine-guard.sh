#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Arcanum Doctrine Guard
# Enforces constitutional alignment across docs, app, and chain
# ============================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$ROOT_DIR/docs"

# New constitution location
CONSTITUTION_DIR="$DOCS_DIR/governance/constitution"
CONSTITUTION="$CONSTITUTION_DIR/canonical-modules.md"

FAILED=0

echo "🛡️  Arcanum Doctrine Guard"
echo "----------------------------------------------"

fail() {
  echo ""
  echo "❌ DOCTRINE VIOLATION"
  echo "→ $1"
  FAILED=1
}

pass() {
  echo "✅ $1"
}

# ------------------------------------------------------------
# GUARD 0 — Structural Existence
# ------------------------------------------------------------
echo ""
echo "🔍 Guard 0 — Structural Existence"

REQUIRED_PATHS=(
  "docs/governance/constitution/canonical-modules.md"
  "docs/vitae"
  "docs/whitepaper/vitae-and-becoming.md"
  "docs/whitepaper/arcanum-chain.md"
  "docs/specs/modules"
  "docs/specs/chain"
  "apps"
  "chains"
)

for path in "${REQUIRED_PATHS[@]}"; do
  if [[ ! -e "$ROOT_DIR/$path" ]]; then
    fail "Required path missing: $path"
  fi
done

[[ $FAILED -eq 0 ]] && pass "All required structural paths present"

# ------------------------------------------------------------
# GUARD 1 — Canonical Modules Integrity
# ------------------------------------------------------------
echo ""
echo "🔍 Guard 1 — Canonical Module Integrity"

if [[ ! -f "$CONSTITUTION" ]]; then
  fail "Canonical modules file missing: canonical-modules.md"
else
  # Extract module names (## MODULE I — NAME)
  mapfile -t MODULES < <(grep -E "^## MODULE" "$CONSTITUTION" | sed 's/.*— //')

  for module in "${MODULES[@]}"; do
    case "$module" in
      ARCHITECT)
        [[ -d "$CONSTITUTION_DIR" ]] || fail "ARCHITECT module missing constitution folder"
        ;;
      VITAE)
        [[ -d "$DOCS_DIR/vitae" ]] || fail "VITAE module missing docs/vitae"
        [[ -f "$DOCS_DIR/specs/modules/vitae.md" ]] || fail "VITAE module spec missing"
        ;;
      TEMPUS)
        [[ -f "$DOCS_DIR/specs/modules/tempus.md" ]] || fail "TEMPUS module spec missing"
        ;;
      HOPE)
        [[ -f "$DOCS_DIR/specs/modules/hope.md" ]] || fail "HOPE module spec missing"
        ;;
      ECONOMY)
        [[ -f "$DOCS_DIR/specs/modules/economy.md" ]] || fail "ECONOMY module spec missing"
        ;;
      TREASURY)
        [[ -f "$DOCS_DIR/specs/modules/treasury.md" ]] || fail "TREASURY module spec missing"
        ;;
      ARCANUM\ CHAIN)
        [[ -d "$DOCS_DIR/specs/chain" ]] || fail "ARCANUM CHAIN specs missing"
        ;;
    esac
  done
fi

[[ $FAILED -eq 0 ]] && pass "Canonical modules structurally valid"

# ------------------------------------------------------------
# GUARD 2 — Layer Boundary Enforcement
# ------------------------------------------------------------
echo ""
echo "🔍 Guard 2 — Layer Boundary Enforcement"

# App must not mint or control economy
if grep -R "mint(" "$ROOT_DIR/apps" >/dev/null 2>&1; then
  fail "App layer references mint() — economy must be enforced on-chain"
fi

# Vitae must not touch economy directly
if grep -R -E "(mint\(|supply\(|balance\()" "$DOCS_DIR/vitae" >/dev/null 2>&1; then
  fail "VITAE contains mechanical economic operations — forbidden coupling"
fi

# Chain must not define meaning or progression
if grep -R -E '\b(vitae|hope|grade)\b' "$ROOT_DIR/chains" \
  | grep -v -E '^\s*//|^\s*#' >/dev/null 2>&1; then
  fail "Chain layer references meaning/progression concepts in executable context"
fi
[[ $FAILED -eq 0 ]] && pass "Layer boundaries respected"

# ------------------------------------------------------------
# GUARD 3 — Forbidden Authority Claims
# ------------------------------------------------------------
echo ""
echo "🔍 Guard 3 — Forbidden Authority Claims"

# Only constitution may claim absolute authority
if grep -R "absolute authority" "$DOCS_DIR" \
  | grep -v "governance/constitution" >/dev/null 2>&1; then
  fail "Non-constitutional document claims absolute authority"
fi

# White pages must not claim enforcement
if grep -R -E "(enforces|guarantees|final authority)" \
  "$DOCS_DIR/whitepaper" >/dev/null 2>&1; then
  fail "White pages claim enforcement authority — forbidden"
fi

[[ $FAILED -eq 0 ]] && pass "Authority claims valid"

# ------------------------------------------------------------
# GUARD 4 — Canonical Checksums (Immutable Proof)
# ------------------------------------------------------------
CHECKSUM_FILE="$CONSTITUTION_DIR/doctrine-checksums.yaml"

echo ""
echo "🔍 Guard α — Canonical Checksums"

if [[ -f "$CHECKSUM_FILE" ]]; then
  while IFS=":" read -r path hash; do
    path="$(echo "$path" | xargs)"
    hash="$(echo "$hash" | xargs)"
    [[ -z "$path" ]] && continue
    local_path="$ROOT_DIR/$path"
    if [[ -f "$local_path" ]]; then
      current_hash=$(sha256sum "$local_path" | awk '{print $1}')
      if [[ "$current_hash" != "$hash" ]]; then
        fail "Checksum mismatch: $path"
      fi
    else
      fail "Missing file for checksum: $path"
    fi
  done < <(grep -v '^#' "$CHECKSUM_FILE")
else
  fail "Checksum manifest missing: doctrine-checksums.yaml"
fi

[[ $FAILED -eq 0 ]] && pass "All canonical checksums valid"

# ------------------------------------------------------------
# FINAL RESULT
# ------------------------------------------------------------
echo ""
if [[ $FAILED -ne 0 ]]; then
  echo "🚫 Doctrine Guard FAILED"
  echo "Fix violations above before proceeding."
  exit 1
else
  echo "🟢 Doctrine Guard PASSED"
  echo "System is canon-aligned."
  exit 0
fi
