#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"

python3 - "$ROOT" <<'PY'
from __future__ import annotations

import json
import sys
from pathlib import Path

root = Path(sys.argv[1])
runtime_path = root / "apps/web/src/lib/architect/runtime.ts"
workspace_path = root / "apps/web/src/components/developer/ArchitectRuntimeWorkspace.tsx"
workbench_path = root / "apps/web/src/components/developer/ArchitectWorkbench.tsx"
spec_path = root / "docs/specs/app/architect-runtime-core.md"
registry_path = root / "docs/governance/architectgpt/agent-registry.yaml"

for path in (runtime_path, workspace_path, workbench_path, spec_path, registry_path):
    if not path.is_file():
        raise SystemExit(f"missing Architect runtime surface: {path.relative_to(root)}")

runtime = runtime_path.read_text(encoding="utf-8")
workspace = workspace_path.read_text(encoding="utf-8")
workbench = workbench_path.read_text(encoding="utf-8")
spec = spec_path.read_text(encoding="utf-8")
registry = json.loads(registry_path.read_text(encoding="utf-8"))

agent_ids = (
    "repository_architect",
    "canon_guardian",
    "product_steward",
    "security_sentinel",
    "verification_oracle",
    "release_steward",
)

registered_agents = registry.get("agents", {})
if tuple(registered_agents) != agent_ids:
    raise SystemExit("canonical Architect agent order or membership drifted")

for agent_id in agent_ids:
    agent = registered_agents[agent_id]
    if agent.get("permission_ceiling") != "R1":
        raise SystemExit(f"agent permission ceiling exceeds or differs from R1: {agent_id}")

agent_block = runtime.split("CANONICAL_ARCHITECT_AGENTS", 1)[1].split("const INITIAL_TASKS", 1)[0]
task_block = runtime.split("const INITIAL_TASKS", 1)[1].split("function auditId", 1)[0]
for agent_id in agent_ids:
    if f"id: '{agent_id}'" not in agent_block:
        raise SystemExit(f"runtime roster missing canonical agent: {agent_id}")
    if f"proposedBy: '{agent_id}'" not in task_block:
        raise SystemExit(f"review queue missing canonical agent proposal: {agent_id}")

required_runtime_terms = (
    "arcanum:architect-runtime:v1",
    "approved_for_planning",
    "registered_inactive",
    "ArchitectExecutionReceiptSummary",
    "recordExecutionReceipt",
    "parseArchitectRuntime",
)
for term in required_runtime_terms:
    if term not in runtime:
        raise SystemExit(f"runtime contract missing required term: {term}")

summary_block = runtime.split("export function summarizeExecutionReceipt", 1)[1].split(
    "export function recordExecutionReceipt", 1
)[0]
for forbidden in ("receipt.stdout", "receipt.stderr", "stdoutTruncated", "stderrTruncated"):
    if forbidden in summary_block:
        raise SystemExit(f"runtime receipt persistence includes raw or stream data: {forbidden}")

required_workspace_terms = (
    "window.localStorage",
    "Human review queue",
    "Registered Architect agents",
    "Private local audit",
    "ArchitectWorkbench onReceipt={recordReceipt}",
    "Approval records intent to review",
)
for term in required_workspace_terms:
    if term not in workspace:
        raise SystemExit(f"runtime workspace missing required boundary or surface: {term}")

if "onReceipt?: (receipt: ArchitectExecutionReceipt) => void" not in workbench:
    raise SystemExit("Workbench does not expose the bounded receipt callback")
if "onReceipt?.(nextReceipt)" not in workbench:
    raise SystemExit("Workbench does not forward completed receipts to the runtime")

required_spec_terms = (
    "Approval means only that the Human Architect accepts the proposal as planning or review work.",
    "Raw stdout and stderr are not copied into runtime persistence.",
    "autonomous or background agent execution",
    "OpenAI or other model-provider calls",
)
for term in required_spec_terms:
    if term not in spec:
        raise SystemExit(f"runtime specification missing required statement: {term}")

print("PASS: Architect runtime mission, review queue, agent ceiling, receipt minimization, and authority boundaries")
PY
