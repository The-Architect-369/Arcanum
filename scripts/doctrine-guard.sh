#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Arcanum Doctrine Guard
# Enforces constitutional alignment across docs, app, and chain
# ============================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$ROOT_DIR/docs"
CONSTITUTION="$DOCS_DIR/00_CONSTITUTION/CANONICAL_MODULES.md"

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
  "docs/00_CONSTITUTION/CANONICAL_MODULES.md"
  "docs/03_VITAE"
  "docs/02_WHITE_PAGES/03_VITAE_AND_BECOMING.md"
  "docs/02_WHITE_PAGES/05_ARCANUM_CHAIN.md"
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
  fail "Canonical modules file missing: CANONICAL_MODULES.md"
else
  # Extract module names (MODULE I — NAME)
  mapfile -t MODULES < <(grep -E "^## MODULE" "$CONSTITUTION" | sed 's/.*— //')

  for module in "${MODULES[@]}"; do
    case "$module" in
      ARCHITECT)
        [[ -d "$DOCS_DIR/00_CONSTITUTION" ]] || fail "ARCHITECT module missing constitution folder"
        ;;
      VITAE)
        [[ -d "$DOCS_DIR/03_VITAE" ]] || fail "VITAE module missing docs/03_VITAE"
        [[ -f "$DOCS_DIR/04_MODULE_SPECS/vitae.md" ]] || fail "VITAE module spec missing"
        ;;
      TEMPUS)
        [[ -f "$DOCS_DIR/04_MODULE_SPECS/tempus.md" ]] || fail "TEMPUS module spec missing"
        ;;
      HOPE)
        [[ -f "$DOCS_DIR/04_MODULE_SPECS/hope.md" ]] || fail "HOPE module spec missing"
        ;;
      ECONOMY)
        [[ -f "$DOCS_DIR/04_MODULE_SPECS/economy.md" ]] || fail "ECONOMY module spec missing"
        ;;
      TREASURY)
        [[ -f "$DOCS_DIR/04_MODULE_SPECS/treasury.md" ]] || fail "TREASURY module spec missing"
        ;;
      ARCANUM\ CHAIN)
        [[ -d "$DOCS_DIR/05_CHAIN_SPECS" ]] || fail "ARCANUM CHAIN specs missing"
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
if grep -R -E "(mint\(|supply\(|balance\()" "$DOCS_DIR/03_VITAE" >/dev/null 2>&1; then
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
  | grep -v "00_CONSTITUTION" >/dev/null 2>&1; then
  fail "Non-constitutional document claims absolute authority"
fi

# White pages must not claim enforcement
if grep -R -E "(enforces|guarantees|final authority)" \
  "$DOCS_DIR/02_WHITE_PAGES" >/dev/null 2>&1; then
  fail "White pages claim enforcement authority — forbidden"
fi

[[ $FAILED -eq 0 ]] && pass "Authority claims valid"

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
