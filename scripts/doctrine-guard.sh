#!/usr/bin/env bash
# doctrine-guard.sh — enforce Arcanum doctrine + structural invariants
# Usage: bash scripts/doctrine-guard.sh
#
# This script is intentionally conservative: it validates the *docs tree* and
# enforces a few high-signal boundary rules. It does NOT attempt to “prove”
# semantics in application code.
#
# Optional env flags:
#   SKIP_CHECKSUMS=1   -> skip checksum verification (warn only)

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${ROOT_DIR}" ]]; then
  echo "❌ Not inside a git repository."
  exit 1
fi
cd "$ROOT_DIR"

DOCS_DIR="$ROOT_DIR/docs"
FAILED=0

fail() { echo "❌ $*"; FAILED=1; }
pass() { echo "✅ $*"; }
warn() { echo "⚠️  $*"; }

echo "== doctrine-guard =="
echo "Repo: $(basename "$ROOT_DIR")"
echo "Commit: $(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
echo

# Resolve chain directory (repo may choose chains/, chain/, or arcnet/)
CHAIN_DIR=""
for d in "chains" "chain" "arcnet"; do
  if [[ -d "$ROOT_DIR/$d" ]]; then
    CHAIN_DIR="$ROOT_DIR/$d"
    break
  fi
done

# ------------------------------------------------------------
# GUARD 0 — Structural Presence (docs tree must exist)
# ------------------------------------------------------------
echo "🔍 Guard 0 — Structural Presence"

required_paths=(
  "docs/index.md"
  "docs/README.md"
  "docs/architecture/canonical-modules.md"
  "docs/architecture/app-chain-doctrine.md"
  "docs/doctrine/layer-boundaries.md"
  "docs/doctrine/identity-model.md"
  "docs/doctrine/temporal-model.md"
  "docs/doctrine/metaphysical-neutrality.md"
  "docs/doctrine/architect-role.md"
  "docs/doctrine/authority.md"
  "docs/governance/governance-specification.md"
  "docs/governance/treasury-constitution.md"
  "docs/governance/economic-principles.md"
  "docs/governance/governance-changelog.md"
  "docs/governance/hopegpt/hope-guardian.md"
  "docs/governance/architectgpt/architect-gpt.md"
  "docs/governance/architectgpt/architect-gpt-manifest.yaml"
  "docs/repo/repo-interface.md"
  "docs/repo/repo-index-generator-spec.md"
  "docs/repo/repo-index.json"
  "docs/tooling/doctrine-checksums/doctrine-checksums.yaml"
  "docs/whitepaper"
  "docs/compliance"
  "docs/modules"
  "docs/vitae"
  "docs/archive"
)

for p in "${required_paths[@]}"; do
  if [[ -e "$ROOT_DIR/$p" ]]; then
    echo "✅ present: $p"
  else
    fail "Missing required path: $p"
  fi
done

# Spot-check canonical naming: ARCnet must be canonical network name
if [[ -f "$DOCS_DIR/architecture/canonical-modules.md" ]]; then
  if grep -q "ARCnet" "$DOCS_DIR/architecture/canonical-modules.md"; then
    pass "Canonical naming present (ARCnet)"
  else
    fail "canonical-modules.md does not mention ARCnet; canonical naming note may be missing"
  fi
fi

echo
[[ $FAILED -eq 0 ]] && pass "Structural presence OK"

# ------------------------------------------------------------
# GUARD 1 — Canonical Module Surface Checks (docs/modules must exist)
# ------------------------------------------------------------
echo
echo "🔍 Guard 1 — Module Surface Checks"

module_surface_docs=(
  "docs/modules/hope/hope.md"
  "docs/modules/tempus/tempus.md"
  "docs/modules/vitae/vitae-and-becoming.md"
)

for f in "${module_surface_docs[@]}"; do
  if [[ -f "$ROOT_DIR/$f" ]]; then
    echo "✅ present: $f"
  else
    fail "Missing module surface doc: $f"
  fi
done

echo
[[ $FAILED -eq 0 ]] && pass "Module surfaces present"

# ------------------------------------------------------------
# GUARD 2 — Layer Boundary Enforcement (high-signal checks)
# ------------------------------------------------------------
echo
echo "🔍 Guard 2 — Layer Boundary Enforcement"

# Vitae must not contain mechanical economy operations (coupling risk)
if [[ -d "$DOCS_DIR/vitae" ]]; then
  if grep -R -E "(mint\(|supply\(|balance\()" "$DOCS_DIR/vitae" >/dev/null 2>&1; then
    fail "VITAE contains mechanical economic operations — forbidden coupling"
  else
    pass "Vitae contains no mechanical economy operations"
  fi
fi

# Chain/protocol implementation must not reference meaning/progression concepts in executable context
# (If no chain directory exists yet, warn but do not fail.)
if [[ -n "$CHAIN_DIR" ]]; then
  if grep -R -E '\b(vitae|hope|grade)\b' "$CHAIN_DIR" \
    | grep -v -E '^\s*//|^\s*#' >/dev/null 2>&1; then
    fail "Chain layer references meaning/progression concepts (vitae|hope|grade) in non-comment context"
  else
    pass "Chain layer does not reference meaning/progression concepts"
  fi
else
  warn "No chain directory found (chains/, chain/, or arcnet/). Skipping chain boundary check."
fi

# ------------------------------------------------------------
# GUARD 3 — Forbidden Authority Claims (outside doctrine/governance/architecture)
# ------------------------------------------------------------
echo
echo "🔍 Guard 3 — Forbidden Authority Claims"

# Only doctrine/governance/architecture may use absolute/final authority language.
if grep -R -n -E "(absolute authority|final authority)" "$DOCS_DIR" \
  | grep -v -E "/(doctrine|governance|architecture)/" >/dev/null 2>&1; then
  fail "Non-doctrine/governance/architecture doc claims absolute/final authority"
else
  pass "Authority language constrained to doctrine/governance/architecture"
fi

# ------------------------------------------------------------
# GUARD 4 — Canonical Checksums (immutable proof for core doctrine surfaces)
# ------------------------------------------------------------
echo
echo "🔍 Guard 4 — Canonical Checksums"

CHECKSUM_FILE="$DOCS_DIR/tooling/doctrine-checksums/doctrine-checksums.yaml"

if [[ "${SKIP_CHECKSUMS:-0}" == "1" ]]; then
  warn "SKIP_CHECKSUMS=1 set — checksum verification skipped."
else
  if [[ -f "$CHECKSUM_FILE" ]]; then
    while IFS=":" read -r path hash; do
      path="$(echo "$path" | xargs || true)"
      hash="$(echo "$hash" | xargs || true)"
      [[ -z "$path" ]] && continue
      [[ "$path" =~ ^# ]] && continue

      local_path="$ROOT_DIR/$path"
      if [[ -f "$local_path" ]]; then
        current_hash="$(sha256sum "$local_path" | awk '{print $1}')"
        if [[ "$current_hash" != "$hash" ]]; then
          fail "Checksum mismatch: $path"
        fi
      else
        fail "Missing file for checksum: $path"
      fi
    done < "$CHECKSUM_FILE"
    [[ $FAILED -eq 0 ]] && pass "All canonical checksums valid"
  else
    fail "Checksum manifest missing: $CHECKSUM_FILE"
  fi
fi

# ------------------------------------------------------------
# FINAL RESULT
# ------------------------------------------------------------
echo
if [[ $FAILED -ne 0 ]]; then
  echo "🚫 Doctrine Guard FAILED"
  echo "Fix violations above before proceeding."
  exit 1
else
  echo "🟢 Doctrine Guard PASSED"
  echo "System is canon-aligned."
  exit 0
fi