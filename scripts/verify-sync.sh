#!/usr/bin/env bash
# verify-sync.sh — repo + governance integrity checks
# Usage: bash scripts/verify-sync.sh

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

parse_version() {
  local file="$1"
  awk -F': *' '/^version:/{print $2; exit}' "$file" \
    | tr -d '\r"' \
    | xargs
}

normalize_repo_index() {
  local src="$1"
  python3 - "$src" <<'PY'
import json, sys

path = sys.argv[1]
with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

data.pop("generated_at", None)
data.pop("commit", None)

files = data.get("files", [])
files = [f for f in files if f.get("path") != "docs/repo/repo-index.json"]
files.sort(key=lambda x: x.get("path", ""))
data["files"] = files

json.dump(data, sys.stdout, indent=2, sort_keys=False)
sys.stdout.write("\n")
PY
}

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
elif [[ ! -f "$INDEX_FILE" ]]; then
  fail "Missing repo index output: $INDEX_FILE"
else
  tmpdir="$(mktemp -d)"
  trap 'rm -rf "$tmpdir"' EXIT

  orig="$tmpdir/original.json"
  gen="$tmpdir/generated.json"
  norm_orig="$tmpdir/original.norm.json"
  norm_gen="$tmpdir/generated.norm.json"

  cp "$INDEX_FILE" "$orig"

  if bash "$GEN_SCRIPT" >/dev/null; then
    cp "$INDEX_FILE" "$gen"
    cp "$orig" "$INDEX_FILE"

    normalize_repo_index "$orig" > "$norm_orig"
    normalize_repo_index "$gen" > "$norm_gen"

    if ! diff -u "$norm_orig" "$norm_gen" >/dev/null; then
      fail "$INDEX_FILE differs from generator output after normalization. Run: bash $GEN_SCRIPT && commit any real structural drift."
    else
      echo "✅ repo index matches generator output (normalized): $INDEX_FILE"
    fi
  else
    cp "$orig" "$INDEX_FILE" 2>/dev/null || true
    fail "Repo index generation failed"
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
  manifest_ver="$(parse_version "$MANIFEST" || true)"
  doc_ver="$(parse_version "$ARCH_DOC" || true)"

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
  while IFS= read -r line; do
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
