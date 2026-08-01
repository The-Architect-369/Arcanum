---
title: "Architect Runtime Core"
status: implementation-candidate
phase: "Pre-Genesis"
layer: "Application / Local Tooling / Architect"
wave: "XXIII"
---

# Architect Runtime Core

## Purpose

Wave XXIII turns the Architect Workbench from a single-command inspection panel into the first accountable local Architect runtime.

The runtime helps the Human Architect understand the current mission, review bounded proposals, see the canonical agent roster, execute the existing registered Termux commands, and retain a private local audit trail.

It does not activate autonomous agents and does not convert planning decisions into execution authority.

## Runtime topology

```text
Human Architect
      ↓ local review decision
Architect Runtime Core
      ├── active mission
      ├── planning review queue
      ├── registered inactive agents
      ├── privacy-minimized receipt ledger
      └── private local audit history
      ↓ separate per-command confirmation
Wave XXII Termux broker
      ↓ fixed registered argv
Configured Arcanum repository root
```

## Canonical implementation surfaces

- Runtime contract: `apps/web/src/lib/architect/runtime.ts`
- Runtime workspace: `apps/web/src/components/developer/ArchitectRuntimeWorkspace.tsx`
- Existing execution UI: `apps/web/src/components/developer/ArchitectWorkbench.tsx`
- Developer route: `apps/web/src/app/(app)/developer/page.tsx`
- Runtime fixture: `scripts/architect/test-architect-runtime.sh`
- Agent source of truth: `docs/governance/architectgpt/agent-registry.yaml`

## Active mission

The initial local mission is:

> Establish the accountable Architect runtime.

Its objective is to give the Human Architect one local surface for mission awareness, bounded planning reviews, registered agents, execution receipts, and private audit history.

The mission is a local coordination record. It is not a governance proposal, canonical ratification, release authorization, or claim of network state.

## Human review queue

The runtime initializes one bounded planning proposal for each canonical registered Architect agent:

1. Repository Architect — runtime architecture review.
2. Canon Guardian — authority-boundary review.
3. Product Steward — Human Architect journey review.
4. Security Sentinel — privacy and security review.
5. Verification Oracle — evidence-plan review.
6. Release Steward — release-checklist preparation.

A proposal may be:

- pending review;
- approved for planning;
- rejected.

Approval means only that the Human Architect accepts the proposal as planning or review work. It does not invoke an agent, execute a broker command, create a patch, commit, push, merge, deploy, transact, or alter governance.

## Agent posture

The runtime displays the six canonical Wave XVIII agents from the registered architecture:

- `repository_architect`
- `canon_guardian`
- `product_steward`
- `security_sentinel`
- `verification_oracle`
- `release_steward`

All are represented as `registered_inactive` with permission ceiling `R1`.

This wave does not change the canonical agent registry and does not grant tool execution to those agents.

## Local persistence

The local snapshot uses browser storage key:

```text
arcanum:architect-runtime:v1
```

The snapshot contains:

- active mission;
- review tasks and Human Architect decisions;
- registered-agent descriptors;
- privacy-minimized execution-receipt summaries;
- private local audit entries;
- last-updated timestamp.

The Human Architect may export or reset the local snapshot.

The local audit remains private unless the Human Architect deliberately exports it.

## Receipt minimization

The existing Workbench continues to show full bounded stdout and stderr for the active browser session.

The runtime persists only:

- receipt ID;
- command ID and label;
- pass/fail status;
- exit code;
- duration;
- branch;
- commit before and after;
- completion timestamp;
- request SHA-256;
- result SHA-256.

Raw stdout and stderr are not copied into runtime persistence.

## Authority boundaries

Wave XXIII does not add:

- autonomous or background agent execution;
- arbitrary terminal input;
- browser-provided command arguments;
- repository writes;
- patch application;
- commits, pushes, pull requests, merges, or deployments;
- secrets or environment inspection;
- OpenAI or other model-provider calls;
- chain transactions;
- governance actions;
- Docker;
- native Android process embedding.

Each later capability must be separately registered, reviewed, revocable, and subordinate to Human Architect authorization.

## Verification

```bash
bash scripts/architect/test-architect-runtime.sh
bash scripts/architect/test-termux-broker.sh
pnpm -C apps/web typecheck
pnpm -C apps/web build
bash scripts/repo-index.sh
bash scripts/verify-sync.sh
```

## Next capability gate

After this runtime is verified and promoted, the next bounded capability may introduce provider-neutral Architect conversation and planning records.

That later capability should allow the Architect to formulate proposals from approved context while preserving:

- local provider abstraction;
- visible provider provenance;
- explicit Human Architect review;
- no implicit execution;
- no secrets in model context;
- no repository mutation without a separate action authorization.
