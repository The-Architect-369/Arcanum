---
title: "Intelligence Layer Contract"
status: canonical-draft
visibility: public
last_updated: 2026-06-08
phase: "Pre-Genesis"
layer: "Application / Intelligence / Doctrine Boundary"
description: "Defines the first implementation contract for Hope, Codex, Architect, and future agent intelligence layers."
---

# Intelligence Layer Contract

## Purpose

This document defines the first implementation-facing contract for Arcanum intelligence layers.

It exists to let the system begin using online intelligence during development while preserving a clear path toward local/offline operation later.

This contract is deliberately conservative. It defines roles, boundaries, records, and escalation rules. It does not activate autonomous agents, does not move MANA, does not write chain state, and does not grant governance authority.

## Layer posture

Arcanum intelligence is layered:

1. **Hope** — personal / reflective guidance
2. **Codex** — interpretive synthesis and pattern translation
3. **Architect** — internal builder and system-design assistant
4. **Agents** — future scheduled or event-triggered workers under explicit policy

All intelligence remains subordinate to doctrine, governance, and the Human Architect.

## Role boundaries

### Hope

Hope is user-facing and advisory.

Allowed:

- reflective prompts
- explanation of doctrine
- user-owned summaries
- consent-respecting personal context
- optional handoff of non-private, user-approved insights to Codex

Forbidden:

- declaring readiness
- scoring identity
- accelerating Vitae
- coercive reminders
- silent surveillance
- autonomous publication or transaction signing

### Codex

Codex is the interpretive synthesis layer.

Allowed:

- summarize system state
- classify signals by source and confidence
- translate raw events into human-readable context
- identify doctrinal or architectural tensions
- prepare non-binding recommendations for Architect review

Forbidden:

- ratifying doctrine
- deciding governance outcomes
- assigning worth or rank
- auto-writing proposals
- auto-signing transactions
- mutating chain or app state without explicit action authority

### Architect

Architect is the internal builder interface.

Allowed:

- repository analysis
- implementation planning
- patch drafting
- build/deploy diagnostics
- doctrine alignment review
- explicit, auditable repository writes when requested

Forbidden:

- governing
- ratifying doctrine
- silently changing repository state
- executing irreversible actions without explicit human approval

### Agents

Agents are future bounded workers.

Allowed in this phase:

- design only
- dry-run records
- manual invocation under Architect review
- scheduled intent definitions with disabled execution

Forbidden in this phase:

- auto-starting
- auto-writing governance proposals
- auto-signing transactions
- auto-moving MANA
- auto-mutating chain state
- persistent unattended execution

## Online-to-offline transition path

The first implementation may use online models as development scaffolding.

The long-term target is a provider-neutral interface where the same intelligence contract can be served by:

- online models during development,
- local models on a developer node,
- local models in the app where feasible,
- hybrid models only with explicit consent and visible routing.

The interface must never assume one vendor, one model, or permanent internet access.

## Data boundary

Intelligence records must classify input sources:

- `user_private`
- `user_approved`
- `repo_public`
- `repo_internal`
- `chain_public`
- `app_local`
- `system_generated`

Private user data may not move from Hope to Codex unless the user explicitly approves the specific transfer.

Codex may synthesize system state, but it must preserve source labels and confidence levels.

## Interpretation record

Every intelligence output should be representable as an interpretation record:

```ts
type InterpretationRecord = {
  id: string
  layer: 'hope' | 'codex' | 'architect' | 'agent'
  status: 'draft' | 'review_required' | 'approved' | 'rejected'
  sources: IntelligenceSource[]
  summary: string
  recommendations: string[]
  forbiddenActions: ForbiddenAction[]
  createdAt: string
}
```

Records are not actions.

They are evidence for review.

## Execution boundary

No intelligence layer may execute unless a separate authority layer grants explicit action permission.

For Pre-Genesis, the default execution policy is:

```text
interpretation: allowed
draft generation: allowed
recommendation: allowed
autonomous execution: forbidden
transaction signing: forbidden
MANA movement: forbidden
governance action: forbidden
repository write: explicit Human Architect request only
```

## Tempus relationship

Tempus may schedule windows for review, audits, or reflection.

Tempus may not pressure action.

Agent schedules derived from Tempus are informational until an explicit activation policy is ratified.

## Verification posture

Initial implementation must remain type-level and non-executing.

Acceptable first code surfaces:

- role/type definitions
- boundary guards
- disabled agent registry
- interpretation record helpers
- provider-neutral model interface stubs

Not acceptable yet:

- live background workers
- secret-bearing provider calls
- automatic repository mutation
- automatic chain transactions
- unattended schedules

## Canonical closure

The intelligence layers may help Arcanum perceive, interpret, and build.

They may not become sovereign.

The Human Architect remains the approving authority during Pre-Genesis.
