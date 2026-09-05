#!/usr/bin/env bash
# Architect GPT 4.0 repository integrity verification.
# Read-only: validates the checked-out tree and never edits source, stages files,
# commits, pushes, merges, deploys, or rewrites refs.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$ROOT" ]] || { echo "FAIL not inside a git repository" >&2; exit 1; }
cd "$ROOT"

PASS=0
TOTAL=15

step() { printf '\n[%s/%s] %s\n' "$1" "$TOTAL" "$2"; }
ok() { printf '✅ %s\n' "$*"; PASS=$((PASS + 1)); }
require_file() { [[ -f "$1" ]] || { echo "FAIL missing required file: $1" >&2; exit 1; }; }

echo "== verify-sync =="
echo "Repo: $(basename "$ROOT")"
echo "Commit: $(git rev-parse --short HEAD)"

step 1 "Deterministic repository index"
pnpm verify:repo-index
ok "repo index matches its exact source commit"

step 2 "Architect GPT 4.0 core contract"
SPEC="docs/governance/architectgpt/architect-gpt.md"
MANIFEST="docs/governance/architectgpt/architect-gpt-manifest.yaml"
AGENT_REGISTRY="docs/governance/architectgpt/agent-registry.yaml"
for path in "$SPEC" "$MANIFEST" "$AGENT_REGISTRY"; do require_file "$path"; done

grep -Eq '^version: "4\.0"$' "$MANIFEST"
grep -Eq '^canonical_branch: main$' "$MANIFEST"
grep -Eq '^default_write_branch: null$' "$MANIFEST"
grep -Fq 'sole_persistent_branch: main' "$MANIFEST"
grep -Fq 'implicit_integration_branch: forbidden' "$MANIFEST"
grep -Fq 'version: "4.0"' "$SPEC"
grep -Fq 'sole persistent canonical branch' "$SPEC"
jq -e '
  .schema_version == "1.0"
  and .registry_type == "architect_agent_registry"
  and .architect_gpt_version == "4.0"
  and .invocation_authority == "advisory_only"
  and (.agents | length) == 6
  and ([.agents[].permission_ceiling] | all(. == "R1"))
' "$AGENT_REGISTRY" >/dev/null
ok "Architect GPT 4.0 contract, main-only branch model, and advisory agent registry are coherent"

step 3 "Manifest active-file map"
python3 - "$MANIFEST" <<'PY'
from pathlib import Path
import sys

manifest = Path(sys.argv[1])
lines = manifest.read_text(encoding="utf-8").splitlines()
inside = False
paths = []
for line in lines:
    if line == "files:":
        inside = True
        continue
    if inside and line and not line.startswith(" "):
        break
    if inside and line.startswith("  ") and ":" in line:
        _, value = line.split(":", 1)
        value = value.strip()
        if value:
            paths.append(value)

if not paths:
    raise SystemExit("FAIL manifest files map is empty")
missing = [path for path in paths if not Path(path).is_file()]
if missing:
    raise SystemExit("FAIL manifest files missing: " + ", ".join(missing))
print(f"manifest active-file map: {len(paths)} path(s)")
PY
ok "every manifest active-file path exists"

step 4 "Retired Wave-era machinery is absent"
retired=(
  docs/governance/architectgpt/capability-fabric.md
  docs/governance/architectgpt/capability-registry.yaml
  docs/governance/architectgpt/orchestration-protocol.md
  docs/governance/architectgpt/evidence-protocol.md
  docs/governance/architectgpt/promotion-protocol.md
  docs/governance/architectgpt/ci-promotion-protocol.md
  docs/governance/architectgpt/provider-health-protocol.md
  docs/governance/architectgpt/change-plan-protocol.md
  docs/governance/architectgpt/change-plan.schema.json
  docs/governance/architectgpt/ast-integrity-protocol.md
  docs/governance/architectgpt/build-diagnostics-protocol.md
  docs/governance/architectgpt/repository-timeline-protocol.md
  docs/governance/architectgpt/impact-graph-protocol.md
  docs/governance/architectgpt/patch-executor-protocol.md
  docs/governance/architectgpt/patch-executor.schema.json
  docs/governance/architectgpt/candidate-commit-protocol.md
  docs/governance/architectgpt/candidate-commit.schema.json
  docs/governance/architectgpt/candidate-publisher-protocol.md
  docs/governance/architectgpt/candidate-publisher.schema.json
  docs/governance/architectgpt/remote-publisher-protocol.md
  docs/governance/architectgpt/remote-publisher.schema.json
  docs/governance/architectgpt/merge-authorization-protocol.md
  docs/governance/architectgpt/merge-authorization.schema.json
  docs/governance/architectgpt/merge-executor-protocol.md
  docs/governance/architectgpt/merge-executor.schema.json
  docs/governance/architectgpt/agent-invocation-protocol.md
  docs/governance/architectgpt/agent-invocation.schema.json
  docs/governance/architectgpt/agent-execution-protocol.md
  docs/governance/architectgpt/agent-execution.schema.json
  docs/governance/architectgpt/promotion-orchestrator-protocol.md
  docs/governance/architectgpt/promotion-orchestrator.schema.json
  docs/governance/architectgpt/post-merge-closure-protocol.md
  docs/governance/architectgpt/post-merge-closure.schema.json
  docs/governance/architectgpt/production-smoke-protocol.md
  scripts/architect/change-plan.py
  scripts/architect/test-change-plan.sh
  scripts/architect/patch-executor.py
  scripts/architect/test-patch-executor.sh
  scripts/architect/candidate-commit.py
  scripts/architect/test-candidate-commit.sh
  scripts/architect/candidate-publisher.py
  scripts/architect/test-candidate-publisher.sh
  scripts/architect/remote-publisher.py
  scripts/architect/test-remote-publisher.sh
  scripts/architect/merge-authorization.py
  scripts/architect/test-merge-authorization.sh
  scripts/architect/merge-executor.py
  scripts/architect/test-merge-executor.sh
  scripts/architect/promotion-gate.sh
  scripts/architect/promotion-orchestrator.py
  scripts/architect/promote-wave.sh
  scripts/architect/test-promotion-orchestrator.sh
  scripts/architect/post-merge-close.py
  scripts/architect/close-wave.sh
  scripts/architect/test-post-merge-close.sh
  scripts/architect/agent-run.py
  scripts/architect/test-agent-run.sh
  scripts/architect/agent-execute.py
  scripts/architect/test-agent-execute.sh
  .github/workflows/architect-promotion.yml
)
for path in "${retired[@]}"; do
  [[ ! -e "$path" ]] || { echo "FAIL retired path still active: $path" >&2; exit 1; }
done
ok "retired publication, promotion, patch-pipeline, and local-agent engines are absent"

step 5 "No persistent-mobile branch semantics in active operating surfaces"
scan_paths=(
  AGENTS.md
  docs/repo/repo-interface.md
  docs/governance/architectgpt/architect-gpt.md
  docs/governance/architectgpt/architect-gpt-manifest.yaml
  .github/workflows/architect-verification.yml
  scripts/architect
  docs/mobile
  scripts/mobile
)
pattern='refs/heads/mobile|refs/remotes/origin/mobile|origin/mobile|integration_branch:[[:space:]]*mobile|default_write_branch:[[:space:]]*mobile|required_branch:[[:space:]]*mobile|required_head_branch:[[:space:]]*mobile|required_integration_branch:[[:space:]]*mobile'
if git grep -n -E "$pattern" -- "${scan_paths[@]}" 2>/dev/null; then
  echo "FAIL stale persistent-mobile branch semantics detected" >&2
  exit 1
fi
ok "active operating surfaces contain no persistent-mobile branch contract"

step 6 "Doctrine and canonical checksums"
bash scripts/doctrine-guard.sh
ok "doctrine guard passed"

step 7 "Continuity epoch seal and active ledger"
jq empty docs/governance/architectgpt/session-record.schema.json
jq empty docs/governance/architectgpt/continuity-epoch.schema.json
jq empty docs/governance/architectgpt/continuity-epoch.json
jq empty docs/governance/architectgpt/continuity-index.schema.json
jq empty docs/governance/architectgpt/continuity-index.json
python3 -m py_compile \
  scripts/architect/validate-session-records.py \
  scripts/architect/generate-continuity-index.py \
  scripts/architect/validate-continuity-index.py
python3 scripts/architect/validate-session-records.py
python3 scripts/architect/validate-continuity-index.py
ok "sealed predecessor continuity and active epoch are deterministic and valid"

step 8 "Orchestration, evidence, and CI syntax"
require_file .github/workflows/architect-verification.yml
jq empty docs/governance/architectgpt/execution-record.schema.json
python3 -m py_compile scripts/architect/validate-evidence.py
bash -n scripts/architect/orchestrate.sh
bash -n scripts/architect/ci-attest.sh
bash -n scripts/architect/source-tranche-gate.sh
ok "bounded local evidence and CI surfaces are syntactically valid"

step 9 "Provider health"
jq empty docs/governance/architectgpt/provider-health.schema.json
python3 -m py_compile scripts/architect/provider-health.py
bash scripts/architect/test-provider-health.sh
ok "provider-health evidence is manifest-bound and drift-sensitive"

step 10 "TypeScript AST integrity"
jq empty docs/governance/architectgpt/ast-integrity.schema.json
python3 -m py_compile scripts/architect/ast-integrity.py
bash scripts/architect/test-ast-integrity.sh
ok "AST integrity fixtures passed"

step 11 "Build diagnostics"
jq empty docs/governance/architectgpt/build-diagnostics.schema.json
python3 -m py_compile scripts/architect/build-diagnostics.py
bash scripts/architect/test-build-diagnostics.sh
ok "build diagnostics fixtures passed"

step 12 "Repository lineage and impact graph"
jq empty docs/governance/architectgpt/repository-timeline.schema.json
jq empty docs/governance/architectgpt/impact-graph.schema.json
python3 -m py_compile \
  scripts/architect/repository-timeline.py \
  scripts/architect/impact-graph.py
bash scripts/architect/test-repository-timeline.sh
bash scripts/architect/test-impact-graph.sh
ok "timeline and impact-graph fixtures passed"

step 13 "Local Architect Runtime and Termux broker"
python3 -m py_compile scripts/architect/termux-broker.py
bash -n scripts/architect/test-termux-broker.sh
bash -n scripts/architect/test-architect-runtime.sh
bash scripts/architect/test-termux-broker.sh
bash scripts/architect/test-architect-runtime.sh
ok "local Workbench/runtime boundary and advisory agent roster passed"

step 14 "Production smoke verifier"
jq empty docs/governance/architectgpt/production-smoke.schema.json
jq empty docs/governance/architectgpt/production-smoke-routes.json
python3 -m py_compile scripts/architect/production-smoke.py
bash -n scripts/architect/smoke-production.sh
bash -n scripts/architect/test-production-smoke.sh
bash scripts/architect/test-production-smoke.sh
ok "read-only production smoke fixtures passed"

step 15 "CE-W01 carried-forward machine contracts"
pnpm verify:ce-w01
ok "CE-W01 geometry, spatial architecture, and Tempus contracts remain green"

printf '\n✅ verify-sync passed: %s/%s checks.\n' "$PASS" "$TOTAL"
