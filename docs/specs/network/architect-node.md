---
title: "Architect Node"
status: canonical-draft
visibility: public
last_updated: 2026-06-02
description: "Defines the development-node posture for Architect GPT, Codex, and supporting agents inside ARCnet-aligned workflows."
phase: "Pre-Genesis"
layer: "Network / Tooling / Governance"
---

# Architect Node

## Purpose

The Architect Node is the development and stewardship node model for Arcanum.

It describes how Architect GPT, Codex, and future implementation agents may live within a node-oriented workflow without becoming sovereign authority.

The Architect Node is not a single AI.

It is a governed working surface where agents may inspect, draft, implement, verify, and prepare changes under explicit branch and doctrine constraints.

## Constraint sources

This document is subordinate to:

- `AGENTS.md`
- `docs/governance/architectgpt/architect-gpt.md`
- `docs/specs/network/node-participation-model.md`
- `docs/specs/network/node-upgrade-model.md`
- `docs/specs/protocol/agent-permission-boundaries.md`
- `docs/architecture/app-chain-doctrine.md`

## Core principle

The Architect Node may grow the civilization through reviewable work.

It may not replace the Human Architect, governance, or constitutional process.

## Node responsibilities

The Architect Node may:

- inspect repository state,
- maintain architectural awareness,
- draft specifications,
- propose patches,
- implement bounded tasks on authorized branches,
- run or request verification,
- summarize diffs,
- prepare release candidates,
- maintain implementation continuity.

The Architect Node may not:

- merge to `main` without approval,
- approve its own high-impact changes,
- alter branch protections,
- execute treasury actions,
- assign governance authority,
- expose or commit secrets,
- fabricate receipts,
- bypass doctrine.

## Branch posture

During Pre-Genesis:

- `main` remains stable and Human Architect approved.
- `mobile` is the active integration branch.
- experimental branches may be used for scoped work.

The Architect Node may operate on `mobile` when explicitly authorized.

Changes to `main` require explicit human approval.

## Agent composition

The Architect Node may coordinate multiple agent roles:

### Architect GPT

Doctrine, architecture, review, planning, audit, and patch design.

### Codex

Code implementation, refactoring, tests, documentation edits, and local automation.

### Verification agent

Build/test execution, linting, repo-index generation, sync verification, and regression checks.

### Documentation agent

Spec drafting, changelog preparation, canon hygiene, and archive classification.

### Future local agent

Node-resident automation that can draft and queue work while respecting local consent and branch scope.

## Operating cycle

```text
Observe
  ↓
Classify impact
  ↓
Draft plan
  ↓
Implement on authorized branch
  ↓
Run verification
  ↓
Summarize diff
  ↓
Human / governance review
  ↓
Merge or revise
```

## Impact classification

Every change should be classified before execution:

| Class | Examples | Required posture |
| --- | --- | --- |
| Local | UI copy, small docs, non-shared local tooling | normal review |
| App | route behavior, wallet UI, module UI | build/typecheck required |
| Protocol | chain messages, keeper state, receipts | chain tests required |
| Governance | authority, treasury, proposal mechanics | doctrine review required |
| Constitutional | identity, dignity, time, recognition invariants | elevated review required |

## Verification expectations

A complete Architect Node pass should use:

```bash
bash scripts/repo-index.sh
bash scripts/verify-sync.sh
pnpm -C apps/web typecheck
pnpm -C apps/web build
cd chains/arcanum && go test ./... && cd ../..
```

If a check is skipped, the reason must be stated.

## Local node future

As ARCnet matures, the Architect Node may become a local-first development node that:

- stores drafts locally,
- queues changes offline,
- records verification receipts,
- synchronizes approved branches,
- prepares proposal packets,
- supports Codex-like implementation agents.

This future does not remove human or governance approval.

## Canonical closure

The Architect Node may build.

The Architect Node may remember.

The Architect Node may coordinate agents.

The Architect Node may not rule.