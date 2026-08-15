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

echo "[1/24] Repo index integrity"
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

echo "[2/24] Architect GPT manifest integrity"
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

echo "[3/24] Governance canonical surface checks"
required_governance_files=(
  "docs/governance/governance-specification.md"
  "docs/governance/treasury-constitution.md"
  "docs/governance/economic-principles.md"
  "docs/governance/governance-changelog.md"
  "docs/governance/hopegpt/hope-guardian.md"
  "docs/governance/architectgpt/architect-gpt.md"
  "docs/governance/architectgpt/architect-gpt-manifest.yaml"
  "docs/governance/architectgpt/conversation-memory-contract.md"
  "docs/governance/architectgpt/architect-log.md"
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
  "docs/governance/architectgpt/patch-executor-protocol.md"
  "docs/governance/architectgpt/patch-executor.schema.json"
  "docs/governance/architectgpt/candidate-commit-protocol.md"
  "docs/governance/architectgpt/candidate-commit.schema.json"
  "docs/governance/architectgpt/candidate-publisher-protocol.md"
  "docs/governance/architectgpt/candidate-publisher.schema.json"
  "docs/governance/architectgpt/remote-publisher-protocol.md"
  "docs/governance/architectgpt/remote-publisher.schema.json"
  "docs/governance/architectgpt/merge-authorization-protocol.md"
  "docs/governance/architectgpt/merge-authorization.schema.json"
  "docs/governance/architectgpt/merge-executor-protocol.md"
  "docs/governance/architectgpt/merge-executor.schema.json"
  "docs/governance/architectgpt/agent-registry.yaml"
  "docs/governance/architectgpt/agent-invocation-protocol.md"
  "docs/governance/architectgpt/agent-invocation.schema.json"
  "docs/governance/architectgpt/agent-execution-protocol.md"
  "docs/governance/architectgpt/agent-execution.schema.json"
  "docs/governance/architectgpt/promotion-orchestrator-protocol.md"
  "docs/governance/architectgpt/promotion-orchestrator.schema.json"
  "docs/governance/architectgpt/post-merge-closure-protocol.md"
  "docs/governance/architectgpt/post-merge-closure.schema.json"
  "docs/governance/architectgpt/production-smoke-protocol.md"
  "docs/governance/architectgpt/production-smoke.schema.json"
  "docs/governance/architectgpt/production-smoke-routes.json"
)
for f in "${required_governance_files[@]}"; do
  if [[ -f "$f" ]]; then echo "✅ present: $f"; else fail "Missing governance file: $f"; fi
done
echo

MEMORY_CONTRACT="docs/governance/architectgpt/conversation-memory-contract.md"
HISTORICAL_ARCHITECT_LOG="docs/architect/architect-log.md"

echo "Checking Architect continuity authority..."
if grep -Fxq 'active_log: docs/governance/architectgpt/architect-log.md' "$MANIFEST"; then
  echo "✅ manifest active log is canonical governance path"
else
  fail "Manifest active_log does not resolve to the canonical governance path"
fi

if grep -Fxq 'active_log: docs/architect/architect-log.md' "$MANIFEST"; then
  fail "Historical Architect log is incorrectly configured as active_log"
else
  echo "✅ historical Architect log is not configured as active_log"
fi

if grep -Fq 'The sole cross-session, append-only Architect log is:' "$MEMORY_CONTRACT" \
  && grep -Fq 'docs/governance/architectgpt/architect-log.md' "$MEMORY_CONTRACT" \
  && grep -Fq 'is not authoritative for cross-session continuity.' "$MEMORY_CONTRACT"; then
  echo "✅ conversation-memory contract preserves sole-log authority"
else
  fail "Conversation-memory contract no longer proves sole-log authority"
fi

if [[ -f "$HISTORICAL_ARCHITECT_LOG" ]] \
  && grep -Fxq 'status: historical' "$HISTORICAL_ARCHITECT_LOG" \
  && grep -Fxq 'authority: historical-only' "$HISTORICAL_ARCHITECT_LOG" \
  && grep -Fxq 'cross_session_writes: forbidden' "$HISTORICAL_ARCHITECT_LOG" \
  && grep -Fxq 'controlling_log: docs/governance/architectgpt/architect-log.md' "$HISTORICAL_ARCHITECT_LOG"; then
  echo "✅ secondary Architect log is frozen as historical-only"
else
  fail "Secondary Architect log is not explicitly frozen as historical-only"
fi

if grep -Fq -- '- `architect-log.md`' "$ARCH_DOC"; then
  fail "Architect GPT spec still contains ambiguous bare architect-log.md supersession language"
else
  echo "✅ Architect GPT spec has no ambiguous bare architect-log.md authority reference"
fi

if grep -Fq 'docs/governance/architectgpt/architect-log.md' "$ARCH_DOC" \
  && grep -Fq 'docs/governance/architectgpt/conversation-memory-contract.md' "$ARCH_DOC"; then
  echo "✅ Architect GPT spec references canonical continuity surfaces"
else
  fail "Architect GPT spec does not reference canonical continuity surfaces"
fi
echo

echo "[4/24] Orchestration control checks"
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

echo "[5/24] Evidence schema and validator checks"
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

echo "[6/24] Promotion gate checks"
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

echo "[7/24] Provider health and drift checks"
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

echo "[8/24] Repository change plan and patch bundle checks"
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

echo "[9/24] TypeScript AST and dependency integrity checks"
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

echo "[10/24] Build log diagnostics and deployment attribution checks"
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

echo "[11/24] Repository timeline and lineage integrity checks"
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

echo "[12/24] Change impact graph integrity checks"
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

echo "[13/24] Isolated patch executor integrity checks"
PATCH_EXECUTOR_SCHEMA="docs/governance/architectgpt/patch-executor.schema.json"
PATCH_EXECUTOR="scripts/architect/patch-executor.py"
PATCH_EXECUTOR_TEST="scripts/architect/test-patch-executor.sh"

if jq empty "$PATCH_EXECUTOR_SCHEMA" >/dev/null 2>&1; then
  echo "✅ valid isolated patch attestation schema: $PATCH_EXECUTOR_SCHEMA"
else
  fail "Invalid isolated patch attestation schema: $PATCH_EXECUTOR_SCHEMA"
fi

if python3 -m py_compile "$PATCH_EXECUTOR"; then
  echo "✅ Python syntax: $PATCH_EXECUTOR"
else
  fail "Invalid Python syntax: $PATCH_EXECUTOR"
fi

if bash -n "$PATCH_EXECUTOR_TEST"; then
  echo "✅ shell syntax: $PATCH_EXECUTOR_TEST"
else
  fail "Invalid shell syntax: $PATCH_EXECUTOR_TEST"
fi

if bash "$PATCH_EXECUTOR_TEST" >/dev/null; then
  echo "✅ patch executor applies declared changes in a detached worktree"
  echo "✅ patch executor emits deterministic attestations and diff hashes"
  echo "✅ patch executor preserves dot-prefixed repository paths"
  echo "✅ patch executor leaves the source checkout unchanged"
  echo "✅ patch executor rejects tampered bundles, payloads, failed checks, and dirty sources"
else
  fail "Isolated patch executor integrity fixtures failed"
fi

echo

echo "[14/24] Deterministic candidate commit integrity checks"
CANDIDATE_COMMIT_SCHEMA="docs/governance/architectgpt/candidate-commit.schema.json"
CANDIDATE_COMMIT_BUILDER="scripts/architect/candidate-commit.py"
CANDIDATE_COMMIT_TEST="scripts/architect/test-candidate-commit.sh"

if jq empty "$CANDIDATE_COMMIT_SCHEMA" >/dev/null 2>&1; then
  echo "✅ valid candidate commit schema: $CANDIDATE_COMMIT_SCHEMA"
else
  fail "Invalid candidate commit schema: $CANDIDATE_COMMIT_SCHEMA"
fi

if python3 -m py_compile "$CANDIDATE_COMMIT_BUILDER"; then
  echo "✅ Python syntax: $CANDIDATE_COMMIT_BUILDER"
else
  fail "Invalid Python syntax: $CANDIDATE_COMMIT_BUILDER"
fi

if bash -n "$CANDIDATE_COMMIT_TEST"; then
  echo "✅ shell syntax: $CANDIDATE_COMMIT_TEST"
else
  fail "Invalid shell syntax: $CANDIDATE_COMMIT_TEST"
fi

if bash "$CANDIDATE_COMMIT_TEST" >/dev/null; then
  echo "✅ candidate commit builder reconstructs the exact attested diff"
  echo "✅ candidate commit builder emits deterministic tree, commit, and attestation identities"
  echo "✅ candidate commit builder binds the exact parent and tree"
  echo "✅ candidate commit builder preserves source checkout and complete ref state"
  echo "✅ candidate commit builder rejects tampered, stale, malformed, dirty, and mismatched inputs"
else
  fail "Deterministic candidate commit integrity fixtures failed"
fi

echo


echo "[15/24] Guarded candidate ref publisher integrity checks"
CANDIDATE_PUBLISHER_SCHEMA="docs/governance/architectgpt/candidate-publisher.schema.json"
CANDIDATE_PUBLISHER="scripts/architect/candidate-publisher.py"
CANDIDATE_PUBLISHER_TEST="scripts/architect/test-candidate-publisher.sh"

if jq empty "$CANDIDATE_PUBLISHER_SCHEMA" >/dev/null 2>&1; then
  echo "✅ valid candidate publisher schema: $CANDIDATE_PUBLISHER_SCHEMA"
else
  fail "Invalid candidate publisher schema: $CANDIDATE_PUBLISHER_SCHEMA"
fi

if python3 -m py_compile "$CANDIDATE_PUBLISHER"; then
  echo "✅ Python syntax: $CANDIDATE_PUBLISHER"
else
  fail "Invalid Python syntax: $CANDIDATE_PUBLISHER"
fi

if bash -n "$CANDIDATE_PUBLISHER_TEST"; then
  echo "✅ shell syntax: $CANDIDATE_PUBLISHER_TEST"
else
  fail "Invalid shell syntax: $CANDIDATE_PUBLISHER_TEST"
fi

if bash "$CANDIDATE_PUBLISHER_TEST" >/dev/null; then
  echo "✅ candidate publisher defaults to deterministic dry-run"
  echo "✅ candidate publisher requires exact request-digest confirmation"
  echo "✅ candidate publisher applies only a local mobile fast-forward"
  echo "✅ candidate publisher preserves origin/mobile and forbids push, merge, and deploy"
  echo "✅ candidate publisher rejects tampered, stale, dirty, and unauthorized inputs"
else
  fail "Guarded candidate ref publisher integrity fixtures failed"
fi

echo


echo "[16/24] Guarded remote ref publisher integrity checks"
REMOTE_PUBLISHER_SCHEMA="docs/governance/architectgpt/remote-publisher.schema.json"
REMOTE_PUBLISHER="scripts/architect/remote-publisher.py"
REMOTE_PUBLISHER_TEST="scripts/architect/test-remote-publisher.sh"

if jq empty "$REMOTE_PUBLISHER_SCHEMA" >/dev/null 2>&1; then
  echo "✅ valid remote publisher schema: $REMOTE_PUBLISHER_SCHEMA"
else
  fail "Invalid remote publisher schema: $REMOTE_PUBLISHER_SCHEMA"
fi

if python3 -m py_compile "$REMOTE_PUBLISHER"; then
  echo "✅ Python syntax: $REMOTE_PUBLISHER"
else
  fail "Invalid Python syntax: $REMOTE_PUBLISHER"
fi

if bash -n "$REMOTE_PUBLISHER_TEST"; then
  echo "✅ shell syntax: $REMOTE_PUBLISHER_TEST"
else
  fail "Invalid shell syntax: $REMOTE_PUBLISHER_TEST"
fi

if bash "$REMOTE_PUBLISHER_TEST" >/dev/null; then
  echo "✅ remote publisher defaults to deterministic dry-run"
  echo "✅ remote publisher requires exact request-digest confirmation"
  echo "✅ remote publisher enforces an exact origin/mobile lease"
  echo "✅ remote publisher updates only the authorized integration ref"
  echo "✅ remote publisher preserves local state, main, tags, merge, and deploy boundaries"
  echo "✅ remote publisher rejects drift, tampering, stale evidence, dirty state, and unauthorized requests"
else
  fail "Guarded remote ref publisher integrity fixtures failed"
fi

echo


echo "[17/24] Deterministic merge authorization integrity checks"
MERGE_AUTH_SCHEMA="docs/governance/architectgpt/merge-authorization.schema.json"
MERGE_AUTH_BUILDER="scripts/architect/merge-authorization.py"
MERGE_AUTH_TEST="scripts/architect/test-merge-authorization.sh"

if jq empty "$MERGE_AUTH_SCHEMA" >/dev/null 2>&1; then
  echo "✅ valid merge authorization schema: $MERGE_AUTH_SCHEMA"
else
  fail "Invalid merge authorization schema: $MERGE_AUTH_SCHEMA"
fi

if python3 -m py_compile "$MERGE_AUTH_BUILDER"; then
  echo "✅ Python syntax: $MERGE_AUTH_BUILDER"
else
  fail "Invalid Python syntax: $MERGE_AUTH_BUILDER"
fi

if bash -n "$MERGE_AUTH_TEST"; then
  echo "✅ shell syntax: $MERGE_AUTH_TEST"
else
  fail "Invalid shell syntax: $MERGE_AUTH_TEST"
fi

if bash "$MERGE_AUTH_TEST" >/dev/null; then
  echo "✅ merge authorization package is deterministic"
  echo "✅ merge authorization binds exact promotion, CI, provider, PR, and head evidence"
  echo "✅ merge authorization requires explicit W3 human authorization"
  echo "✅ merge authorization preserves expected-head and merge-method constraints"
  echo "✅ merge authorization performs no PR creation, push, ref update, merge, or deploy"
  echo "✅ merge authorization rejects stale, mismatched, malformed, and unauthorized evidence"
else
  fail "Deterministic merge authorization integrity fixtures failed"
fi

echo


echo "[18/24] Guarded merge executor integrity checks"
MERGE_EXECUTOR_SCHEMA="docs/governance/architectgpt/merge-executor.schema.json"
MERGE_EXECUTOR="scripts/architect/merge-executor.py"
MERGE_EXECUTOR_TEST="scripts/architect/test-merge-executor.sh"

if jq empty "$MERGE_EXECUTOR_SCHEMA" >/dev/null 2>&1; then
  echo "✅ valid merge executor schema: $MERGE_EXECUTOR_SCHEMA"
else
  fail "Invalid merge executor schema: $MERGE_EXECUTOR_SCHEMA"
fi

if python3 -m py_compile "$MERGE_EXECUTOR"; then
  echo "✅ Python syntax: $MERGE_EXECUTOR"
else
  fail "Invalid Python syntax: $MERGE_EXECUTOR"
fi

if bash -n "$MERGE_EXECUTOR_TEST"; then
  echo "✅ shell syntax: $MERGE_EXECUTOR_TEST"
else
  fail "Invalid shell syntax: $MERGE_EXECUTOR_TEST"
fi

if bash "$MERGE_EXECUTOR_TEST" >/dev/null; then
  echo "✅ merge executor defaults to deterministic dry-run"
  echo "✅ merge executor requires an exact Wave XVI authorization package"
  echo "✅ merge executor requires explicit W3 request-digest confirmation"
  echo "✅ merge executor enforces PR identity and unchanged expected head"
  echo "✅ merge executor verifies exact two-parent merge identity"
  echo "✅ merge executor preserves mobile, tags, deployment, and local checkout state"
  echo "✅ merge executor rejects replay, drift, tampering, dirty state, and unauthorized requests"
else
  fail "Guarded merge executor integrity fixtures failed"
fi

echo


echo "[19/24] Agent registry and invocation integrity checks"
AGENT_REGISTRY="docs/governance/architectgpt/agent-registry.yaml"
AGENT_SCHEMA="docs/governance/architectgpt/agent-invocation.schema.json"
AGENT_RUNNER="scripts/architect/agent-run.py"
AGENT_TEST="scripts/architect/test-agent-run.sh"

if jq empty "$AGENT_REGISTRY" >/dev/null 2>&1; then
  echo "✅ valid agent registry: $AGENT_REGISTRY"
else
  fail "Invalid agent registry: $AGENT_REGISTRY"
fi

if jq empty "$AGENT_SCHEMA" >/dev/null 2>&1; then
  echo "✅ valid agent invocation schema: $AGENT_SCHEMA"
else
  fail "Invalid agent invocation schema: $AGENT_SCHEMA"
fi

if python3 -m py_compile "$AGENT_RUNNER"; then
  echo "✅ Python syntax: $AGENT_RUNNER"
else
  fail "Invalid Python syntax: $AGENT_RUNNER"
fi

if bash -n "$AGENT_TEST"; then
  echo "✅ shell syntax: $AGENT_TEST"
else
  fail "Invalid shell syntax: $AGENT_TEST"
fi

if bash "$AGENT_TEST" >/dev/null; then
  echo "✅ agent invocations emit deterministic exact-commit attestations"
  echo "✅ all canonical Wave XVIII agents are registered"
  echo "✅ agent permission ceilings are enforced"
  echo "✅ requested tools must be explicitly allowlisted"
  echo "✅ explicit human authorization and request digests are required"
  echo "✅ unknown agents, escalation, stale state, and tampering are rejected"
  echo "✅ Wave XVIII performs no tool execution or external writes"
  echo "✅ repository HEAD, refs, and working-tree state remain unchanged"
else
  fail "Agent registry and invocation integrity fixtures failed"
fi

echo


echo "[20/24] Guarded promotion orchestrator integrity checks"
PROMOTION_ORCHESTRATOR_PROTOCOL="docs/governance/architectgpt/promotion-orchestrator-protocol.md"
PROMOTION_ORCHESTRATOR_SCHEMA="docs/governance/architectgpt/promotion-orchestrator.schema.json"
PROMOTION_ORCHESTRATOR_ENTRYPOINT="scripts/architect/promote-wave.sh"
PROMOTION_ORCHESTRATOR="scripts/architect/promotion-orchestrator.py"
PROMOTION_ORCHESTRATOR_TEST="scripts/architect/test-promotion-orchestrator.sh"

if grep -q '^status: active$' "$PROMOTION_ORCHESTRATOR_PROTOCOL"; then
  echo "✅ promotion orchestrator protocol is active"
else
  fail "Promotion orchestrator protocol is not active"
fi

if jq empty "$PROMOTION_ORCHESTRATOR_SCHEMA" >/dev/null 2>&1; then
  echo "✅ valid promotion orchestrator schema: $PROMOTION_ORCHESTRATOR_SCHEMA"
else
  fail "Invalid promotion orchestrator schema: $PROMOTION_ORCHESTRATOR_SCHEMA"
fi

if python3 -c '
import json
schema = json.load(open(
    "docs/governance/architectgpt/promotion-orchestrator.schema.json",
    encoding="utf-8",
))
authorization = schema["properties"]["authorization"]["properties"]
assert "request_sha256" in authorization
assert authorization["request_sha256"]["type"] == ["string", "null"]
assert "ready_for_w3" in schema["properties"]["stage"]["enum"]
'; then
  echo "✅ orchestrator schema matches emitted authorization state"
else
  fail "Promotion orchestrator schema does not match emitted state"
fi

if python3 -m py_compile "$PROMOTION_ORCHESTRATOR"; then
  echo "✅ Python syntax: $PROMOTION_ORCHESTRATOR"
else
  fail "Invalid Python syntax: $PROMOTION_ORCHESTRATOR"
fi

if bash -n "$PROMOTION_ORCHESTRATOR_ENTRYPOINT"; then
  echo "✅ shell syntax: $PROMOTION_ORCHESTRATOR_ENTRYPOINT"
else
  fail "Invalid shell syntax: $PROMOTION_ORCHESTRATOR_ENTRYPOINT"
fi

if bash -n "$PROMOTION_ORCHESTRATOR_TEST"; then
  echo "✅ shell syntax: $PROMOTION_ORCHESTRATOR_TEST"
else
  fail "Invalid shell syntax: $PROMOTION_ORCHESTRATOR_TEST"
fi

for executable in \
  "$PROMOTION_ORCHESTRATOR_ENTRYPOINT" \
  "$PROMOTION_ORCHESTRATOR" \
  "$PROMOTION_ORCHESTRATOR_TEST"
do
  if [[ -x "$executable" ]]; then
    echo "✅ executable: $executable"
  else
    fail "Promotion orchestrator surface is not executable: $executable"
  fi
done

if "$PROMOTION_ORCHESTRATOR_TEST" >/dev/null; then
  echo "✅ promotion orchestrator emits deterministic resumable state"
  echo "✅ exact branch, remote head, and base ancestry are enforced"
  echo "✅ stale evidence and tampered state are rejected"
  echo "✅ dirty and wrong-branch execution are rejected"
  echo "✅ W3 merge remains forbidden before explicit authorization"
  echo "✅ repository HEAD, refs, and working tree remain unchanged"
else
  fail "Guarded promotion orchestrator fixtures failed"
fi

echo

echo "[21/24] Guarded read-only agent execution integrity checks"

AGENT_EXECUTION_PROTOCOL="docs/governance/architectgpt/agent-execution-protocol.md"
AGENT_EXECUTION_SCHEMA="docs/governance/architectgpt/agent-execution.schema.json"
AGENT_EXECUTION_RUNNER="scripts/architect/agent-execute.py"
AGENT_EXECUTION_TEST="scripts/architect/test-agent-execute.sh"

if grep -q '^status: active$' "$AGENT_EXECUTION_PROTOCOL"; then
  echo "✅ agent execution protocol is active"
else
  fail "Agent execution protocol is not active"
fi

if jq empty "$AGENT_EXECUTION_SCHEMA" >/dev/null; then
  echo "✅ valid agent execution schema: $AGENT_EXECUTION_SCHEMA"
else
  fail "Invalid agent execution schema: $AGENT_EXECUTION_SCHEMA"
fi

if python3 -m py_compile "$AGENT_EXECUTION_RUNNER"; then
  echo "✅ Python syntax: $AGENT_EXECUTION_RUNNER"
else
  fail "Invalid Python syntax: $AGENT_EXECUTION_RUNNER"
fi

if bash -n "$AGENT_EXECUTION_TEST"; then
  echo "✅ shell syntax: $AGENT_EXECUTION_TEST"
else
  fail "Invalid shell syntax: $AGENT_EXECUTION_TEST"
fi

for executable in \
  "$AGENT_EXECUTION_RUNNER" \
  "$AGENT_EXECUTION_TEST"
do
  if [[ -x "$executable" ]]; then
    echo "✅ executable: $executable"
  else
    fail "Agent execution surface is not executable: $executable"
  fi
done

if "$AGENT_EXECUTION_TEST" >/dev/null; then
  echo "✅ invocation attestation digests are enforced"
  echo "✅ exact mobile head and origin/mobile synchronization are enforced"
  echo "✅ registered-agent and R1 permission ceilings are enforced"
  echo "✅ requested tools must be explicitly allowlisted"
  echo "✅ repository paths are bounded and symlink escape is rejected"
  echo "✅ repository read and literal search results are deterministic"
  echo "✅ W1 escalation, stale state, and tampering are rejected"
  echo "✅ repository HEAD, refs, and working tree remain unchanged"
  echo "✅ external writes, merge, and deployment remain forbidden"
else
  fail "Guarded read-only agent execution fixtures failed"
fi

echo

echo "[22/24] Guarded post-merge closure integrity checks"
POST_MERGE_CLOSURE_PROTOCOL="docs/governance/architectgpt/post-merge-closure-protocol.md"
POST_MERGE_CLOSURE_SCHEMA="docs/governance/architectgpt/post-merge-closure.schema.json"
POST_MERGE_CLOSURE_ENTRYPOINT="scripts/architect/close-wave.sh"
POST_MERGE_CLOSURE_EXECUTOR="scripts/architect/post-merge-close.py"
POST_MERGE_CLOSURE_TEST="scripts/architect/test-post-merge-close.sh"

if [[ -f "$POST_MERGE_CLOSURE_PROTOCOL" ]]; then
  echo "✅ post-merge closure protocol is active"
else
  fail "Missing post-merge closure protocol: $POST_MERGE_CLOSURE_PROTOCOL"
fi

if jq empty "$POST_MERGE_CLOSURE_SCHEMA" >/dev/null 2>&1; then
  echo "✅ valid post-merge closure schema: $POST_MERGE_CLOSURE_SCHEMA"
else
  fail "Invalid post-merge closure schema: $POST_MERGE_CLOSURE_SCHEMA"
fi

if python3 -m py_compile "$POST_MERGE_CLOSURE_EXECUTOR"; then
  echo "✅ Python syntax: $POST_MERGE_CLOSURE_EXECUTOR"
else
  fail "Invalid Python syntax: $POST_MERGE_CLOSURE_EXECUTOR"
fi

for script in "$POST_MERGE_CLOSURE_ENTRYPOINT" "$POST_MERGE_CLOSURE_TEST"; do
  if bash -n "$script"; then
    echo "✅ shell syntax: $script"
  else
    fail "Invalid shell syntax: $script"
  fi
done

for executable in \
  "$POST_MERGE_CLOSURE_ENTRYPOINT" \
  "$POST_MERGE_CLOSURE_EXECUTOR" \
  "$POST_MERGE_CLOSURE_TEST"
do
  if [[ -x "$executable" ]]; then
    echo "✅ executable: $executable"
  else
    fail "Not executable: $executable"
  fi
done

if bash "$POST_MERGE_CLOSURE_TEST" >/dev/null; then
  echo "✅ closure defaults to deterministic dry-run"
  echo "✅ closure requires exact request-digest confirmation"
  echo "✅ closure binds exact READY production evidence"
  echo "✅ closure enforces the expected origin/mobile lease"
  echo "✅ closure fast-forwards only the integration branch"
  echo "✅ closure is idempotent after branch convergence"
  echo "✅ closure rejects non-READY production evidence"
  echo "✅ main, tags, merge, deployment, rollback, and canon remain protected"
else
  fail "Post-merge closure integrity fixtures failed"
fi
echo

echo "[23/24] Read-only production smoke verification checks"
PRODUCTION_SMOKE_PROTOCOL="docs/governance/architectgpt/production-smoke-protocol.md"
PRODUCTION_SMOKE_SCHEMA="docs/governance/architectgpt/production-smoke.schema.json"
PRODUCTION_SMOKE_ROUTES="docs/governance/architectgpt/production-smoke-routes.json"
PRODUCTION_SMOKE_ENTRYPOINT="scripts/architect/smoke-production.sh"
PRODUCTION_SMOKE_EXECUTOR="scripts/architect/production-smoke.py"
PRODUCTION_SMOKE_TEST="scripts/architect/test-production-smoke.sh"

if [[ -f "$PRODUCTION_SMOKE_PROTOCOL" ]]; then
  echo "✅ production smoke protocol is active"
else
  fail "Missing production smoke protocol: $PRODUCTION_SMOKE_PROTOCOL"
fi

for json_file in "$PRODUCTION_SMOKE_SCHEMA" "$PRODUCTION_SMOKE_ROUTES"; do
  if jq empty "$json_file" >/dev/null 2>&1; then
    echo "✅ valid JSON document: $json_file"
  else
    fail "Invalid JSON document: $json_file"
  fi
done

if python3 -m py_compile "$PRODUCTION_SMOKE_EXECUTOR"; then
  echo "✅ Python syntax: $PRODUCTION_SMOKE_EXECUTOR"
else
  fail "Invalid Python syntax: $PRODUCTION_SMOKE_EXECUTOR"
fi

for script in "$PRODUCTION_SMOKE_ENTRYPOINT" "$PRODUCTION_SMOKE_TEST"; do
  if bash -n "$script"; then
    echo "✅ shell syntax: $script"
  else
    fail "Invalid shell syntax: $script"
  fi
done

for executable in \
  "$PRODUCTION_SMOKE_ENTRYPOINT" \
  "$PRODUCTION_SMOKE_EXECUTOR" \
  "$PRODUCTION_SMOKE_TEST"
do
  if [[ -x "$executable" ]]; then
    echo "✅ executable: $executable"
  else
    fail "Not executable: $executable"
  fi
done

if bash "$PRODUCTION_SMOKE_TEST" >/dev/null; then
  echo "✅ smoke verifier accepts exact deployment route contracts"
  echo "✅ smoke evidence identities are deterministic"
  echo "✅ missing response markers are rejected"
  echo "✅ mutation methods are rejected"
  echo "✅ non-READY deployments are rejected"
  echo "✅ cross-host redirects are rejected"
  echo "✅ Vercel Deployment Protection is classified before route execution"
  echo "✅ protected deployments fail closed without authenticated bypass"
  echo "✅ production observations remain GET/HEAD-only"
  echo "✅ credentials, cookies, request bodies, and authorization headers remain forbidden"
  echo "✅ application mutation, wallet signing, merge, deploy, and rollback remain forbidden"
else
  fail "Production smoke integrity fixtures failed"
fi
echo


# Wave XXI two-stage bootstrap policy
require_wave_xxi_policy() {
  local pattern="$1"
  local file="$2"
  local label="$3"

  if grep -Fq -- "$pattern" "$file"; then
    echo "✅ $label"
  else
    echo "❌ missing Wave XXI policy: $label"
    exit 1
  fi
}

require_wave_xxi_policy \
  "## Wave XXI two-stage bootstrap model" \
  "docs/governance/architectgpt/production-smoke-protocol.md" \
  "Wave XXI two-stage bootstrap model is registered"

require_wave_xxi_policy \
  "### Stage A — capability promotion" \
  "docs/governance/architectgpt/production-smoke-protocol.md" \
  "Stage A capability promotion is distinguished"

require_wave_xxi_policy \
  "### Stage B — operational activation and closure" \
  "docs/governance/architectgpt/production-smoke-protocol.md" \
  "Stage B operational closure is distinguished"

require_wave_xxi_policy \
  "provider_access_protected_is_smoke_success: false" \
  "docs/governance/architectgpt/architect-gpt-manifest.yaml" \
  "provider protection is not application-health success"

require_wave_xxi_policy \
  "bootstrap_authorized_wave: wave-xxi" \
  "docs/governance/architectgpt/architect-gpt-manifest.yaml" \
  "bootstrap exception is restricted to Wave XXI"

require_wave_xxi_policy \
  "authenticated_bypass_forbidden: true" \
  "docs/governance/architectgpt/architect-gpt-manifest.yaml" \
  "authenticated deployment bypass remains forbidden"

require_wave_xxi_policy \
  "stage_b_public_access_required: true" \
  "docs/governance/architectgpt/architect-gpt-manifest.yaml" \
  "Stage B requires public production access"

require_wave_xxi_policy \
  "stage_b_required_total_routes: 10" \
  "docs/governance/architectgpt/architect-gpt-manifest.yaml" \
  "Stage B requires ten total routes"

require_wave_xxi_policy \
  "stage_b_required_passed_routes: 10" \
  "docs/governance/architectgpt/architect-gpt-manifest.yaml" \
  "Stage B requires ten passing routes"

require_wave_xxi_policy \
  "stage_b_required_failed_routes: 0" \
  "docs/governance/architectgpt/architect-gpt-manifest.yaml" \
  "Stage B requires zero failed routes"

require_wave_xxi_policy \
  "operational_closure_requires_stage_b: true" \
  "docs/governance/architectgpt/architect-gpt-manifest.yaml" \
  "Wave XXI operational closure requires Stage B"


echo "[24/24] Archive checks (deprecated files)"
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