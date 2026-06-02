---
title: "Agent Permission Boundaries"
status: canonical-draft
visibility: public
last_updated: 2026-06-02
description: "Defines what AI and automation agents may do across app, repository, node, chain, governance, and treasury layers."
phase: "Pre-Genesis"
layer: "Protocol / Governance / Tooling"
---

# Agent Permission Boundaries

## Purpose

This document defines permission boundaries for AI agents and automation agents in Arcanum.

Agents may act only within explicit scope.

Agents do not possess inherent sovereignty.

## Constraint sources

This document is subordinate to:

- `AGENTS.md`
- `docs/specs/network/architect-node.md`
- `docs/specs/network/codex-agent-integration.md`
- `docs/architecture/app-chain-doctrine.md`
- `docs/governance/governance-specification.md`
- `docs/governance/treasury-constitution.md`

## Core principle

Agents may assist action.

Agents may not become authority.

## Permission classes

### Class 0 — Read

Allowed:

- inspect repository files,
- inspect public docs,
- inspect build logs,
- inspect non-secret configuration,
- summarize state.

Risks:

- stale context,
- hallucinated access,
- overconfident summaries.

Required posture:

- cite source when possible,
- state access limits.

### Class 1 — Draft

Allowed:

- draft specs,
- draft patches,
- draft commands,
- draft PR summaries,
- draft governance proposals.

Required posture:

- mark as proposed until accepted,
- avoid claiming execution.

### Class 2 — Local Execute

Allowed with explicit authorization:

- run local tests,
- run repo-index generation,
- run builds,
- run local scripts,
- modify local working tree.

Forbidden:

- exfiltrating secrets,
- destructive commands without explicit approval,
- hidden network calls.

### Class 3 — Repository Write

Allowed with explicit branch scope:

- create files,
- update files,
- commit to authorized branch,
- push to integration branch,
- open pull requests.

Forbidden:

- direct unauthorized writes to `main`,
- branch-protection modification,
- silent scope expansion,
- committing credentials,
- rewriting shared history without explicit approval.

### Class 4 — Node Action

Allowed with explicit user consent:

- draft local node tasks,
- queue synchronization,
- prepare receipts,
- display node status,
- run local verification.

Forbidden:

- assigning identity,
- fabricating receipts,
- submitting governance messages without user authorization,
- replicating private data without consent.

### Class 5 — Chain Action

Allowed only through explicit transaction confirmation:

- submit identity anchor transaction,
- submit MANA spend,
- submit factual receipt,
- submit proposal deposit,
- query chain state.

Forbidden:

- semantic judgment receipts,
- private content payloads,
- hidden spends,
- unauthorized signing,
- treasury execution without governance path.

### Class 6 — Governance / Treasury

Agents may assist drafting and review.

Agents may not independently ratify:

- governance outcomes,
- treasury allocations,
- authority envelopes,
- constitutional amendments,
- releases to `main`.

## Scope declaration

Every agent task should declare:

- actor,
- branch or node,
- permission class,
- intended files/actions,
- allowed commands,
- verification requirements,
- rollback path where relevant.

## Receipt model

Future agent receipts may record factual events:

- agent_task_started,
- agent_patch_created,
- agent_verification_passed,
- agent_verification_failed,
- agent_review_requested,
- agent_task_completed.

Agent receipts must not imply:

- governance approval,
- human approval,
- canonical ratification,
- authority assignment,
- worth or readiness.

## Secrets policy

Agents must never request, print, store, or commit:

- private keys,
- seed phrases,
- API keys,
- passwords,
- session cookies,
- production tokens,
- private user records.

If a task requires credentials, the agent should instruct the human to configure them locally through a secure path.

## Escalation rules

Agents must escalate to human review when a task touches:

- identity invariants,
- MANA issuance,
- treasury flows,
- governance thresholds,
- Vitae recognition,
- Tempus earning policy,
- chain modules,
- branch protections,
- production deployment.

## Canonical closure

Agents can carry tools.

Agents can carry memory.

Agents can carry drafts.

Agents cannot carry sovereignty.