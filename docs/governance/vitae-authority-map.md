---
title: "Vitae Authority Map"
status: canonical-draft
visibility: public
last_updated: 2026-05-30
description: "Maps Vitae recognition to governance, stewardship, treasury, and developer permissions without converting Vitae into rank, score, or purchased authority."
phase: "Pre-Genesis"
layer: "Governance"
---

# Vitae Authority Map

## Purpose

This document defines how **Vitae recognition** may interface with governance, stewardship, treasury review, and developer permissions across Arcanum and ARCnet.

It does not redefine Vitae. It operationalizes the narrow governance question:

> When a being has stabilized enough responsibility, what system permissions may be entrusted without turning that recognition into worth, rank, or domination?

## Canonical dependencies

This map is subordinate to:

- `docs/doctrine/authority.md`
- `docs/doctrine/identity-model.md`
- `docs/doctrine/layer-boundaries.md`
- `docs/doctrine/temporal-model.md`
- `docs/architecture/app-chain-doctrine.md`
- `docs/architecture/canonical-modules.md`
- `docs/governance/governance-specification.md`
- `docs/governance/treasury-constitution.md`
- `docs/vitae/constitution/master-constitution-and-architecture.md`
- `docs/vitae/constitution/vitae-kernel-master.md`
- `docs/vitae/constitution/grade-architecture-template.md`

If this document conflicts with those sources, the stricter non-coercive constraint wins.

## Non-negotiable constraints

Vitae authority must never become:

- a worth score
- a reputation score
- a leaderboard
- a social class
- a paid upgrade path
- a proxy for identity value
- a shortcut around governance or doctrine

Vitae may gate responsibility. It may never gate dignity, belonging, basic participation, or identity.

Vitae is economically sterile. MANA may not purchase recognition, accelerate readiness, unlock becoming, or buy governance authority directly.

## Authority grammar

Vitae recognition may grant **permission envelopes**, not superiority.

A permission envelope is a bounded system capability with:

1. a purpose,
2. a scope,
3. a review path,
4. a revocation or suspension procedure for operational safety,
5. explicit doctrinal limits.

Recognition does not make a person more worthy. It only indicates that a specific responsibility may be safely entrusted.

## Recognition states

The following names are implementation-facing authority envelopes, not human value categories.

### V0 — Participant

**Basis:** Identity exists or app participation begins.

**May do:**

- use the App
- hold wallet state
- participate in Hope, Tempus, Nexus, and basic Vitae surfaces
- view public proposals and public receipts
- submit feedback through non-binding channels

**May not do:**

- submit binding governance proposals
- approve treasury movement
- modify protocol or app code
- claim recognized stewardship

### V1 — Witness

**Basis:** Stable participation history, basic identity continuity, and non-coercive engagement.

**May do:**

- comment on governance proposals
- signal non-binding sentiment
- report bugs and doctrine drift
- participate in community moderation review queues where enabled

**May not do:**

- cast binding votes by Vitae alone
- access treasury execution paths
- merge code or alter canonical documents

### V2 — Steward Candidate

**Basis:** Demonstrated reliability within a bounded module or community surface.

**May do:**

- submit structured governance proposals for review
- participate in working groups
- request module-specific responsibility review
- co-draft app/module improvements under review

**May not do:**

- execute proposals
- bypass review
- access private user data
- receive treasury custody authority

### V3 — Module Steward

**Basis:** Recognized responsibility within one module boundary, such as Hope, Tempus, Nexus, Vitae, Wallet, Economy, or documentation.

**May do:**

- sponsor module-level proposals
- participate in module review councils
- approve non-critical module copy or configuration changes where explicitly delegated
- propose treasury grants related to that module

**May not do:**

- modify chain invariants
- define identity truth
- define Vitae recognition alone
- execute treasury disbursements unilaterally
- govern outside the entrusted module boundary

### V4 — Governance Steward

**Basis:** Cross-module reliability, documented understanding of doctrine, and successful participation in proposal review.

**May do:**

- cast binding governance votes where governance activation permits
- co-sponsor structural proposals
- participate in quorum-bearing governance bodies
- review constitutional-risk proposals

**May not do:**

- override constitutional invariants
- convert governance into ideology
- derive authority solely from MANA, popularity, or identity age
- bypass time-locks or elevated thresholds

### V5 — Treasury Steward

**Basis:** Governance Steward recognition plus treasury-specific reliability, conflict disclosure, and operational review.

**May do:**

- review treasury proposals
- co-sign or participate in multi-sig custody if separately appointed
- audit treasury routing and reporting
- recommend allocation lanes within governance bounds

**May not do:**

- unilaterally execute treasury actions
- route funds without proposal approval
- hide conflicts of interest
- use treasury to sell authority or accelerate Vitae

### V6 — Protocol Steward

**Basis:** Deep technical reliability, doctrine literacy, and prior governance stewardship.

**May do:**

- review ARCnet protocol changes
- co-sponsor module approval proposals
- review chain upgrade proposals
- participate in testnet/localnet release signoff

**May not do:**

- deploy protocol upgrades without governance authorization
- encode meaning, worth, or progress into chain state
- weaken identity, treasury, or economic invariants

### V7 — Architect Delegate

**Basis:** Long-duration integration across doctrine, app, protocol, governance, and stewardship.

**May do:**

- assist the Human Architect in cross-layer review
- prepare release candidates
- coordinate constitutional-impacting change proposals
- hold bounded developer permissions under explicit logging

**May not do:**

- replace the Human Architect by implication
- claim unilateral constitutional authority
- merge high-impact changes without review and verification
- create hidden control paths

### V8 — Architect Succession Council

**Basis:** Rare, governance-activated continuity state for system survival beyond the original Human Architect.

**May do:**

- preserve repository continuity
- coordinate emergency maintenance
- steward constitutional amendment procedures
- maintain access continuity for critical infrastructure

**May not do:**

- rewrite doctrine for convenience
- convert Arcanum into factional rule
- centralize permanent discretionary power
- treat succession as ownership

## Treasury authority rules

Treasury authority must follow these constraints:

1. No single actor may control treasury execution.
2. Treasury participation requires governance process plus explicit role assignment.
3. Vitae may qualify a being for treasury review; it does not itself move funds.
4. Treasury decisions require proposal, quorum/threshold, time-lock where applicable, and public traceability.
5. Conflicts of interest must be disclosed in proposal text.

## Developer authority rules

Developer authority is separate from personal worth.

Developer access may be entrusted through Vitae only when:

- the permission scope is explicit,
- repository write paths are logged,
- local verification passes,
- high-impact changes require review,
- secrets are never exposed,
- doctrine remains binding.

Developer permissions SHOULD be staged:

1. local theme/config authoring,
2. documentation proposals,
3. app module patch proposals,
4. reviewed branch contribution,
5. release candidate stewardship,
6. protocol change review,
7. emergency continuity operations.

No app user should receive full protocol or repository authority merely because a UI says they are advanced.

## ARCnet anchoring model

The chain may witness authority-related facts. It may not define the human meaning of Vitae.

Allowed on-chain facts may include:

- identity anchor exists,
- proposal submitted,
- proposal passed,
- role assignment activated,
- treasury action approved,
- release receipt recorded.

Forbidden on-chain claims include:

- human worth,
- superiority,
- enlightenment,
- readiness as essence,
- comparative rank,
- private curriculum state.

## App implementation implication

The App may render authority envelopes and permission availability.

The App must not:

- display Vitae as a leaderboard,
- pressure users to advance,
- punish silence,
- sell access to recognition,
- imply that non-recognized users are lesser.

## Pre-Genesis posture

During Pre-Genesis:

- the Human Architect holds primary editorial and release authority,
- Vitae authority mapping is non-final and subject to review,
- app implementation should begin with read-only display and proposal drafting,
- no automated treasury or protocol execution should be connected to Vitae until governance and chain surfaces are mature.

## Open implementation questions

Before production activation, Arcanum must define:

1. exact recognition evidence requirements for each envelope,
2. review bodies or mechanisms,
3. app storage model for local recognition state,
4. chain receipt schema for authority activation events,
5. emergency suspension process for operational safety,
6. public/private visibility rules for each envelope.

## Canonical closure

Vitae is the bridge from lived stabilization to entrusted responsibility.

It does not create authority by force.
It does not reward performance.
It does not rank beings.
It only allows Arcanum to say, carefully and reversibly where necessary:

> This responsibility may now be entrusted.
