#!/usr/bin/env bash
# verify-sync.sh — repo + governance + orchestration integrity checks
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
  awk -F': *' '/^version:/{print $2; exit}' "$file" | tr -d '\r"' | xargs
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
for f in files:
    f.pop("last_modified_commit", None)
    f.pop("size_bytes", None)
    f.pop("lines", None)
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

INDEX_FILE="docs/repo/repo-index.json"
GEN_SCRIPT="scripts/repo-index.sh"

echo "[1/13] Repo index integrity"
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
    diff_file=".audit/verify-sync/repo-index.diff"
    mkdir -p "$(dirname "$diff_file")"
    if ! diff -u "$norm_orig" "$norm_gen" > "$diff_file"; then
      fail "$INDEX_FILE differs from generator output after normalization."
      echo
      echo "Repo index drift detected."
      echo "Normalized diff written to: $diff_file"
      echo
      echo "To repair:"
      echo "  bash $GEN_SCRIPT"
      echo "  bash scripts/verify-sync.sh"
      echo "  git add $INDEX_FILE"
      echo "  git commit -m \"chore(repo): refresh repo index\""
      echo
      echo "First 80 lines of normalized diff:"
      sed -n '1,80p' "$diff_file" || true
    else
      rm -f "$diff_file"
      echo "✅ repo index matches generator output (normalized): $INDEX_FILE"
    fi
  else
    cp "$orig" "$INDEX_FILE" 2>/dev/null || true
    fail "Repo index generation failed"
  fi
fi
echo

echo "[2/13] Architect GPT manifest integrity"
MANIFEST="docs/governance/architectgpt/architect-gpt-manifest.yaml"
ARCH_DOC="docs/governance/architectgpt/architect-gpt.md"
if [[ ! -f "$MANIFEST" ]]; then fail "Missing manifest: $MANIFEST"; fi
if [[ ! -f "$ARCH_DOC" ]]; then fail "Missing canonical Architect GPT doc: $ARCH_DOC"; fi
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
    if [[ -e "$path" ]]; then echo "✅ $key -> $path"; else fail "Missing manifest target: $key -> $path"; fi
  done < <(awk '/^files:/{flag=1; next} flag && /^[^[:space:]]/{flag=0} flag {print}' "$MANIFEST")
fi
echo

echo "[3/13] Governance canonical surface checks"
required_governance_files=(
  "docs/governance/governance-specification.md"
  "docs/governance/treasury-constitution.md"
  "docs/governance/economic-principles.md"
  "docs/governance/governance-changelog.md"
  "docs/governance/hopegpt/hope-guardian.md"
  "docs/governance/architectgpt/architect-gpt.md"
  "docs/governance/architectgpt/architect-gpt-manifest.yaml"
  "docs/governance/architectgpt/capability-registry.yaml"
  "docs/governance/architectgpt/capability-fabric.md"
  "docs/governance/architectgpt/orchestration-protocol.md"
  "docs/governance/architectgpt/evidence-protocol.md"
  "docs/governance/architectgpt/execution-record.schema.json"
  "docs/governance/architectgpt/promotion-protocol.md"
  "docs/governance/architectgpt/ci-promotion-protocol.md"
  "docs/governance/architectgpt/provider-health-protocol.md"
  "docs/governance/architectgpt/provider-health.schema.json"
  "docs/governance/architectgpt/change-plan-protocol.md"
  "docs/governance/architectgpt/change-plan.schema.json"
  "docs/governance/architectgpt/ast-integrity-protocol.md"
  "docs/governance/architectgpt/ast-integrity.schema.json"
  "docs/governance/architectgpt/build-diagnostics-protocol.md"
  "docs/governance/architectgpt/build-diagnostics.schema.json"
  "docs/governance/architectgpt/repository-timeline-protocol.md"
  "docs/governance/architectgpt/repository-timeline.schema.json"
  "docs/governance/architectgpt/impact-graph-protocol.md"
  "docs/governance/architectgpt/impact-graph.schema.json"
)
for f in "${required_governance_files[@]}"; do
  if [[ -f "$f" ]]; then echo "✅ present: $f"; else fail "Missing governance file: $f"; fi
done
echo

echo "[4/13] Orchestration control checks"
ORCHESTRATOR="scripts/architect/orchestrate.sh"
REGISTRY="docs/governance/architectgpt/capability-registry.yaml"
if [[ ! -f "$ORCHESTRATOR" ]]; then
  fail "Missing orchestration CLI: $ORCHESTRATOR"
elif bash -n "$ORCHESTRATOR"; then
  echo "✅ shell syntax: $ORCHESTRATOR"
else
  fail "Invalid shell syntax: $ORCHESTRATOR"
fi
for state in connected connected_observed verified; do
  if grep -q "status: $state" "$REGISTRY"; then echo "✅ registry status represented: $state"; else fail "Registry lacks required observed status: $state"; fi
done
for permission in R0 R1 W1 W2 W3 C1; do
  if grep -q "^  $permission:" "$REGISTRY"; then echo "✅ permission class: $permission"; else fail "Missing permission class: $permission"; fi
done
echo

echo "[5/13] Evidence schema and validator checks"
SCHEMA="docs/governance/architectgpt/execution-record.schema.json"
VALIDATOR="scripts/architect/validate-evidence.py"
if jq empty "$SCHEMA" >/dev/null 2>&1; then echo "✅ valid JSON schema document: $SCHEMA"; else fail "Invalid JSON schema document: $SCHEMA"; fi
if python3 -m py_compile "$VALIDATOR"; then echo "✅ Python syntax: $VALIDATOR"; else fail "Invalid Python syntax: $VALIDATOR"; fi
if [[ -n "${tmpdir:-}" ]]; then
  valid_log="$tmpdir/valid-evidence.jsonl"
  invalid_log="$tmpdir/invalid-evidence.jsonl"
  legacy_log="$tmpdir/legacy-evidence.jsonl"
  cat > "$valid_log" <<'EOF'
{"schema_version":"1.0","record_type":"execution","timestamp":"2026-07-23T00:00:00Z","repository":"https://github.com/The-Architect-369/Arcanum.git","branch":"mobile","commit":"0000000000000000000000000000000000000000","permission_class":"W2","status":"success","summary":"validator positive fixture"}
{"schema_version":"1.0","record_type":"provider_evidence","timestamp":"2026-07-23T00:00:00Z","repository":"https://github.com/The-Architect-369/Arcanum.git","branch":"mobile","commit":"0000000000000000000000000000000000000000","provider":"vercel","status":"observed","reference":"dpl_fixture","summary":"validator provider fixture"}
EOF
  cat > "$invalid_log" <<'EOF'
{"schema_version":"1.0","record_type":"execution","timestamp":"2026-07-23T00:00:00Z","repository":"Arcanum","branch":"mobile","commit":"short","permission_class":"W9","status":"success","summary":"must fail"}
EOF
  cat > "$legacy_log" <<'EOF'
{"timestamp":"2026-07-23T00:00:00Z","repository":"https://github.com/The-Architect-369/Arcanum.git","branch":"mobile","commit":"0000000000000000000000000000000000000000","permission_class":"W2","status":"success","summary":"legacy fixture"}
EOF
  if python3 "$VALIDATOR" "$valid_log" >/dev/null; then echo "✅ validator accepts canonical fixtures"; else fail "Validator rejected canonical fixtures"; fi
  if python3 "$VALIDATOR" "$invalid_log" >/dev/null 2>&1; then fail "Validator accepted malformed fixture"; else echo "✅ validator rejects malformed fixtures"; fi
  if python3 "$VALIDATOR" --migrate "$legacy_log" >/dev/null && python3 "$VALIDATOR" "$legacy_log" >/dev/null; then echo "✅ validator migrates supported legacy records"; else fail "Validator failed legacy migration fixture"; fi
else
  fail "Temporary verification directory unavailable"
fi
echo

echo "[6/13] Promotion gate checks"
PROMOTION_GATE="scripts/architect/promotion-gate.sh"
PROMOTION_PROTOCOL="docs/governance/architectgpt/promotion-protocol.md"
if [[ ! -f "$PROMOTION_GATE" ]]; then
  fail "Missing promotion gate: $PROMOTION_GATE"
elif bash -n "$PROMOTION_GATE"; then
  echo "✅ shell syntax: $PROMOTION_GATE"
else
  fail "Invalid shell syntax: $PROMOTION_GATE"
fi
for contract in '[[ "$branch" == "mobile" ]]' 'origin/mobile' 'git status --porcelain' 'web typecheck' 'web build' 'repository sync' 'termux_failures:0'; do
  if grep -Fq "$contract" "$PROMOTION_GATE"; then echo "✅ promotion contract: $contract"; else fail "Promotion gate lacks contract: $contract"; fi
done
if grep -q '^wave_completion_policy: guarded_merge_after_each_green_wave$' "$MANIFEST"; then
  echo "✅ standing wave merge policy registered"
else
  fail "Standing wave merge policy missing from manifest"
fi
if [[ -f "$PROMOTION_PROTOCOL" ]]; then echo "✅ promotion protocol present"; else fail "Missing promotion protocol"; fi
echo

echo "[7/13] Provider health and drift checks"
PROVIDER_SCHEMA="docs/governance/architectgpt/provider-health.schema.json"
PROVIDER_MONITOR="scripts/architect/provider-health.py"
PROVIDER_TEST="scripts/architect/test-provider-health.sh"
if jq empty "$PROVIDER_SCHEMA" >/dev/null 2>&1; then echo "✅ valid provider health schema: $PROVIDER_SCHEMA"; else fail "Invalid provider health schema: $PROVIDER_SCHEMA"; fi
if python3 -m py_compile "$PROVIDER_MONITOR"; then echo "✅ Python syntax: $PROVIDER_MONITOR"; else fail "Invalid Python syntax: $PROVIDER_MONITOR"; fi
if bash -n "$PROVIDER_TEST"; then echo "✅ shell syntax: $PROVIDER_TEST"; else fail "Invalid shell syntax: $PROVIDER_TEST"; fi
if bash "$PROVIDER_TEST" >/dev/null; then
  echo "✅ provider monitor accepts healthy exact-head evidence"
  echo "✅ provider monitor rejects drift, stale, and malformed evidence"
else
  fail "Provider health integrity fixtures failed"
fi
echo

echo "[8/13] Repository change plan and patch bundle checks"
CHANGE_PLAN_SCHEMA="docs/governance/architectgpt/change-plan.schema.json"
CHANGE_PLAN_GENERATOR="scripts/architect/change-plan.py"
CHANGE_PLAN_TEST="scripts/architect/test-change-plan.sh"
if jq empty "$CHANGE_PLAN_SCHEMA" >/dev/null 2>&1; then echo "✅ valid change plan schema: $CHANGE_PLAN_SCHEMA"; else fail "Invalid change plan schema: $CHANGE_PLAN_SCHEMA"; fi
if python3 -m py_compile "$CHANGE_PLAN_GENERATOR"; then echo "✅ Python syntax: $CHANGE_PLAN_GENERATOR"; else fail "Invalid Python syntax: $CHANGE_PLAN_GENERATOR"; fi
if bash -n "$CHANGE_PLAN_TEST"; then echo "✅ shell syntax: $CHANGE_PLAN_TEST"; else fail "Invalid shell syntax: $CHANGE_PLAN_TEST"; fi
if bash "$CHANGE_PLAN_TEST" >/dev/null; then
  echo "✅ change plan generator accepts exact-base bounded plans"
  echo "✅ change plan generator emits deterministic patch bundles"
  echo "✅ change plan generator rejects stale, unsafe, duplicate, and malformed plans"
else
  fail "Repository change plan integrity fixtures failed"
fi
echo

echo "[9/13] TypeScript AST and dependency integrity checks"
AST_SCHEMA="docs/governance/architectgpt/ast-integrity.schema.json"
AST_ANALYZER="scripts/architect/ast-integrity.py"
AST_TEST="scripts/architect/test-ast-integrity.sh"
if jq empty "$AST_SCHEMA" >/dev/null 2>&1; then echo "✅ valid AST integrity schema: $AST_SCHEMA"; else fail "Invalid AST integrity schema: $AST_SCHEMA"; fi
if python3 -m py_compile "$AST_ANALYZER"; then echo "✅ Python syntax: $AST_ANALYZER"; else fail "Invalid Python syntax: $AST_ANALYZER"; fi
if bash -n "$AST_TEST"; then echo "✅ shell syntax: $AST_TEST"; else fail "Invalid shell syntax: $AST_TEST"; fi
if bash "$AST_TEST" >/dev/null; then
  echo "✅ AST analyzer accepts the canonical TypeScript project"
  echo "✅ AST analyzer emits deterministic exact-head reports"
  echo "✅ AST analyzer rejects compiler, resolution, declaration, and cycle failures"
else
  fail "TypeScript AST and dependency integrity fixtures failed"
fi
echo

echo "[10/13] Build log diagnostics and deployment attribution checks"
BUILD_DIAGNOSTICS_SCHEMA="docs/governance/architectgpt/build-diagnostics.schema.json"
BUILD_DIAGNOSTICS_PARSER="scripts/architect/build-diagnostics.py"
BUILD_DIAGNOSTICS_TEST="scripts/architect/test-build-diagnostics.sh"
if jq empty "$BUILD_DIAGNOSTICS_SCHEMA" >/dev/null 2>&1; then
  echo "✅ valid build diagnostics schema: $BUILD_DIAGNOSTICS_SCHEMA"
else
  fail "Invalid build diagnostics schema: $BUILD_DIAGNOSTICS_SCHEMA"
fi
if python3 -m py_compile "$BUILD_DIAGNOSTICS_PARSER"; then
  echo "✅ Python syntax: $BUILD_DIAGNOSTICS_PARSER"
else
  fail "Invalid Python syntax: $BUILD_DIAGNOSTICS_PARSER"
fi
if bash -n "$BUILD_DIAGNOSTICS_TEST"; then
  echo "✅ shell syntax: $BUILD_DIAGNOSTICS_TEST"
else
  fail "Invalid shell syntax: $BUILD_DIAGNOSTICS_TEST"
fi
if bash "$BUILD_DIAGNOSTICS_TEST" >/dev/null; then
  echo "✅ build diagnostics parser classifies canonical failure surfaces"
  echo "✅ build diagnostics parser preserves source attribution"
  echo "✅ build diagnostics parser collapses duplicate diagnostics"
  echo "✅ build diagnostics parser emits deterministic provider-bound reports"
  echo "✅ build diagnostics parser rejects malformed deployment metadata"
else
  fail "Build diagnostics and deployment attribution fixtures failed"
fi
echo

echo "[11/13] Repository timeline and lineage integrity checks"
TIMELINE_SCHEMA="docs/governance/architectgpt/repository-timeline.schema.json"
TIMELINE_GENERATOR="scripts/architect/repository-timeline.py"
TIMELINE_TEST="scripts/architect/test-repository-timeline.sh"
if jq empty "$TIMELINE_SCHEMA" >/dev/null 2>&1; then
  echo "✅ valid repository timeline schema: $TIMELINE_SCHEMA"
else
  fail "Invalid repository timeline schema: $TIMELINE_SCHEMA"
fi
if python3 -m py_compile "$TIMELINE_GENERATOR"; then
  echo "✅ Python syntax: $TIMELINE_GENERATOR"
else
  fail "Invalid Python syntax: $TIMELINE_GENERATOR"
fi
if bash -n "$TIMELINE_TEST"; then
  echo "✅ shell syntax: $TIMELINE_TEST"
else
  fail "Invalid shell syntax: $TIMELINE_TEST"
fi
if bash "$TIMELINE_TEST" >/dev/null; then
  echo "✅ repository timeline generator emits deterministic exact-head reports"
  echo "✅ repository timeline generator preserves bounded file lineage"
  echo "✅ repository timeline generator binds blob and content hashes"
  echo "✅ repository timeline generator validates node and edge consistency"
  echo "✅ repository timeline generator rejects path escape and invalid limits"
else
  fail "Repository timeline integrity fixtures failed"
fi
echo

echo "[12/13] Change impact graph integrity checks"
IMPACT_SCHEMA="docs/governance/architectgpt/impact-graph.schema.json"
IMPACT_GENERATOR="scripts/architect/impact-graph.py"
IMPACT_TEST="scripts/architect/test-impact-graph.sh"

if jq empty "$IMPACT_SCHEMA" >/dev/null 2>&1; then
  echo "✅ valid change impact graph schema: $IMPACT_SCHEMA"
else
  fail "Invalid change impact graph schema: $IMPACT_SCHEMA"
fi

if python3 -m py_compile "$IMPACT_GENERATOR"; then
  echo "✅ Python syntax: $IMPACT_GENERATOR"
else
  fail "Invalid Python syntax: $IMPACT_GENERATOR"
fi

if bash -n "$IMPACT_TEST"; then
  echo "✅ shell syntax: $IMPACT_TEST"
else
  fail "Invalid shell syntax: $IMPACT_TEST"
fi

if bash "$IMPACT_TEST" >/dev/null; then
  echo "✅ impact graph emits deterministic exact-base/head reports"
  echo "✅ impact graph resolves direct and transitive dependents"
  echo "✅ impact graph classifies routes, tests, runtime, and canonical surfaces"
  echo "✅ impact graph derives bounded risk and verification requirements"
  echo "✅ impact graph rejects equal refs, non-ancestor bases, and path escape"
else
  fail "Change impact graph integrity fixtures failed"
fi

echo

echo "[13/13] Archive checks (deprecated files)"
archive_files=(
  "docs/archive/architectgpt/architectgpt-core.md"
  "docs/archive/architectgpt/architectgpt-extended.md"
  "docs/archive/architectgpt/architect-log-legacy.md"
)
if [[ "${ALLOW_MISSING_ARCHIVE:-0}" == "1" ]]; then
  for f in "${archive_files[@]}"; do [[ -f "$f" ]] && echo "✅ archive present: $f" || warn "archive missing (allowed): $f"; done
else
  for f in "${archive_files[@]}"; do [[ -f "$f" ]] && echo "✅ archive present: $f" || fail "archive missing: $f"; done
fi

echo
if [[ $STATUS -eq 0 ]]; then echo "✅ verify-sync passed."; else echo "❌ verify-sync failed. Fix issues above."; fi
exit $STATUS
