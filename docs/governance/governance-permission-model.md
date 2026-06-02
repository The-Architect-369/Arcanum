---
title: "Governance Permission Model"
status: canonical-draft
visibility: public
last_updated: 2026-05-30
description: "Defines the eligibility, review, authority, and execution model for governance, treasury, protocol, app, developer, and continuity permissions."
phase: "Pre-Genesis"
layer: "Governance"
---

# Governance Permission Model

## Purpose

This document defines how Arcanum and ARCnet permissions are granted, reviewed, executed, and constrained.

It bridges:

- Vitae recognition,
- governance participation,
- treasury stewardship,
- protocol stewardship,
- app/developer permissions,
- Architect succession and continuity.

This document does **not** grant authority by itself. It defines the grammar by which authority may be entrusted.

## Canonical dependencies

This model is subordinate to:

- `docs/doctrine/authority.md`
- `docs/doctrine/identity-model.md`
- `docs/doctrine/layer-boundaries.md`
- `docs/architecture/app-chain-doctrine.md`
- `docs/architecture/canonical-modules.md`
- `docs/governance/governance-specification.md`
- `docs/governance/treasury-constitution.md`
- `docs/governance/vitae-authority-map.md`
- `docs/specs/app/vitae-authority-integration.md`
- `docs/specs/chain/local-arcnet.md`

If this document conflicts with doctrine, the stricter dignity-preserving and non-coercive constraint wins.

## Core rule

No permission is granted by Vitae alone.

Permissions require four distinct layers:

1. **Eligibility** — the person or identity may be considered.
2. **Review** — the responsibility is evaluated by a defined process.
3. **Authority** — a bounded permission envelope is recognized.
4. **Execution** — the actual action occurs through a controlled mechanism.

This prevents recognition from becoming unilateral power.

## Permission grammar

Every permission must define:

- **Permission name**
- **Domain**
- **Minimum eligibility**
- **Review path**
- **Authority source**
- **Execution path**
- **Limitations**
- **Receipt / audit requirement**

A permission that lacks any of these fields is not production-ready.

## Vitae grade relationship

Vitae grades may contribute to eligibility, but they do not automatically grant authority.

The ten core grades should distribute responsibility gradually across the system. This allows authority to unfold over time without becoming a score, ladder, or competition.

### Grade I — The Guardian

**Primary reliability:** embodiment, stability, boundaries.

May support eligibility for:

- V1 Witness,
- basic feedback channels,
- local reporting,
- non-binding proposal discussion.

Does not support binding governance authority.

### Grade II — The Seeker

**Primary reliability:** awareness, inquiry, curiosity.

May support eligibility for:

- structured feedback,
- proposal commentary,
- documentation issue reporting,
- review observation.

### Grade III — The Disciple

**Primary reliability:** will, application, follow-through.

May support eligibility for:

- V2 Steward Candidate,
- proposal drafting,
- module working group participation,
- local app configuration experiments.

### Grade IV — The Mystic

**Primary reliability:** emotional coherence and relational sensitivity.

May support eligibility for:

- community care review,
- Nexus moderation review queues,
- Hope-adjacent feedback stewardship,
- non-binding conflict mediation support.

### Grade V — The Scholar

**Primary reliability:** knowledge, reasoning, interpretation.

May support eligibility for:

- documentation stewardship,
- doctrine-drift review,
- governance text review,
- proposal quality review.

### Grade VI — The Healer

**Primary reliability:** restoration, service, repair.

May support eligibility for:

- V3 Module Steward in bounded domains,
- safety review,
- repair-oriented governance work,
- community support stewardship.

### Grade VII — The Alchemist

**Primary reliability:** transformation without destabilization.

May support eligibility for:

- module-change sponsorship,
- app module configuration review,
- cross-module integration review,
- proposal sponsorship where separately approved.

### Grade VIII — The Sage

**Primary reliability:** wisdom, cycles, temporal judgment.

May support eligibility for:

- V4 Governance Steward,
- binding governance voting where activated,
- constitutional-risk review,
- time-lock and amendment review.

### Grade IX — The Oracle

**Primary reliability:** perception, foresight, system-level pattern recognition.

May support eligibility for:

- V5 Treasury Steward,
- V6 Protocol Steward review candidacy,
- risk forecasting,
- release-candidate review,
- treasury allocation review.

### Grade X — The Adept

**Primary reliability:** integration and manifestation.

May support eligibility for:

- V6 Protocol Steward,
- V7 Architect Delegate,
- V8 Architect Succession Council candidacy.

Grade X does **not** automatically unlock V8.

Grade X means a being may be considered for the highest continuity responsibilities. Actual V8 activation requires governance procedure, continuity conditions, multi-person safeguards, and explicit logging.

## Vitae authority envelope relationship

The governance-facing authority envelopes are defined in `docs/governance/vitae-authority-map.md`.

This document interprets them as permission eligibility bands:

| Envelope | Governance posture | Execution posture |
|---|---|---|
| V0 Participant | no binding authority | no execution authority |
| V1 Witness | observe and comment | no execution authority |
| V2 Steward Candidate | draft and request sponsorship | no execution authority |
| V3 Module Steward | scoped module sponsorship/review | bounded app/module execution only if delegated |
| V4 Governance Steward | binding governance participation where activated | no direct treasury/protocol execution |
| V5 Treasury Steward | treasury review and audit | custody only by separate appointment |
| V6 Protocol Steward | protocol/release review | release execution only through approved process |
| V7 Architect Delegate | cross-layer coordination | bounded developer/release permissions under log |
| V8 Architect Succession Council | continuity stewardship | emergency/continuity execution only under succession rules |

## Domain I — Governance permissions

### Proposal comment

- **Minimum eligibility:** V1 Witness
- **Review path:** none beyond account/content rules
- **Authority source:** app/governance participation
- **Execution path:** public/non-binding comment
- **Limitations:** cannot bind outcome
- **Receipt:** optional app receipt

### Proposal draft

- **Minimum eligibility:** V2 Steward Candidate
- **Review path:** sponsor or working group review
- **Authority source:** governance process
- **Execution path:** app proposal drafting surface
- **Limitations:** draft does not enter vote automatically
- **Receipt:** local draft receipt; chain receipt only when submitted

### Proposal sponsorship

- **Minimum eligibility:** V3 Module Steward for module proposals; V4 Governance Steward for structural proposals
- **Review path:** scope check and doctrine check
- **Authority source:** governance rules
- **Execution path:** governance proposal submission
- **Limitations:** sponsor cannot bypass quorum, thresholds, or time-locks
- **Receipt:** proposal submission receipt

### Binding governance vote

- **Minimum eligibility:** V4 Governance Steward plus active governance eligibility
- **Review path:** identity, participation, and governance checks
- **Authority source:** governance specification
- **Execution path:** governance voting mechanism
- **Limitations:** cannot override constitutional invariants
- **Receipt:** governance vote receipt when chain-supported

### Constitutional amendment proposal

- **Minimum eligibility:** V4 Governance Steward; V7 Architect Delegate recommended for sponsorship
- **Review path:** constitutional-risk review
- **Authority source:** governance specification and doctrine
- **Execution path:** elevated proposal, supermajority, extended time-lock
- **Limitations:** cannot erase dignity, identity, non-coercion, or layer boundaries
- **Receipt:** proposal, vote, and execution receipts

## Domain II — Treasury permissions

### Treasury proposal draft

- **Minimum eligibility:** V2 Steward Candidate
- **Review path:** treasury sponsor review
- **Authority source:** governance process
- **Execution path:** app/governance draft
- **Limitations:** no funds move from draft
- **Receipt:** local draft receipt

### Treasury proposal sponsorship

- **Minimum eligibility:** V4 Governance Steward or V5 Treasury Steward
- **Review path:** conflict disclosure and treasury scope review
- **Authority source:** governance specification and treasury constitution
- **Execution path:** treasury proposal submission
- **Limitations:** no off-chain discretionary allocation
- **Receipt:** proposal submission receipt

### Treasury review

- **Minimum eligibility:** V5 Treasury Steward
- **Review path:** treasury council or governance review body
- **Authority source:** treasury constitution
- **Execution path:** public review/signoff
- **Limitations:** review is not custody
- **Receipt:** review/signoff receipt where implemented

### Treasury custody / signing

- **Minimum eligibility:** V5 Treasury Steward plus separate appointment
- **Review path:** governance approval, conflict disclosure, signer policy
- **Authority source:** treasury constitution
- **Execution path:** multi-sig or protocol-native treasury execution
- **Limitations:** no single actor control; no hidden flows
- **Receipt:** required

## Domain III — Protocol permissions

### Protocol issue report

- **Minimum eligibility:** V1 Witness
- **Review path:** technical triage
- **Authority source:** repository process
- **Execution path:** issue/report surface
- **Limitations:** report does not authorize code change
- **Receipt:** optional

### Protocol change draft

- **Minimum eligibility:** V3 Module Steward or technical contributor under review
- **Review path:** protocol steward review
- **Authority source:** repository and governance process
- **Execution path:** branch/patch proposal
- **Limitations:** no deploy authority
- **Receipt:** repository commit/PR record

### Protocol release review

- **Minimum eligibility:** V6 Protocol Steward
- **Review path:** build, test, doctrine, and governance review
- **Authority source:** protocol stewardship process
- **Execution path:** release-candidate signoff
- **Limitations:** signoff is not unilateral upgrade authorization
- **Receipt:** release review receipt

### Protocol upgrade authorization

- **Minimum eligibility:** V6 Protocol Steward review plus governance approval
- **Review path:** module approval / upgrade proposal
- **Authority source:** governance specification
- **Execution path:** governed upgrade mechanism
- **Limitations:** cannot encode meaning, worth, or hidden control paths
- **Receipt:** required

## Domain IV — Application and developer permissions

### Theme / cosmetic authoring

- **Minimum eligibility:** V2 Steward Candidate or local developer mode by the Human Architect during Pre-Genesis
- **Review path:** app review if shared
- **Authority source:** app configuration policy
- **Execution path:** local config or reviewed patch
- **Limitations:** no doctrine, governance, treasury, or chain effect
- **Receipt:** local app receipt optional

### Documentation proposal

- **Minimum eligibility:** V2 Steward Candidate
- **Review path:** documentation steward or Architect review
- **Authority source:** repo process
- **Execution path:** branch/PR or approved patch
- **Limitations:** canonical docs require stronger review
- **Receipt:** repository commit/PR record

### App module patch

- **Minimum eligibility:** V3 Module Steward or technical contributor under review
- **Review path:** module steward review, typecheck, build
- **Authority source:** repository process
- **Execution path:** branch/PR/commit
- **Limitations:** cannot bypass doctrine or app-chain boundary
- **Receipt:** repository record and release notes

### Developer console access

- **Minimum eligibility:** trusted device plus bounded authority envelope
- **Review path:** scope review
- **Authority source:** app/developer policy
- **Execution path:** local-only developer surface
- **Limitations:** no secrets, no arbitrary remote execution, no chain/protocol writes without separate authorization
- **Receipt:** local audit log required

### Release candidate preparation

- **Minimum eligibility:** V6 Protocol Steward or V7 Architect Delegate
- **Review path:** typecheck, build, chain tests, verify-sync, doctrine review
- **Authority source:** repository/release process
- **Execution path:** release branch or tag proposal
- **Limitations:** deployment handoff requires explicit approval
- **Receipt:** required

## Domain V — Continuity and Architect succession

### Architect Delegate coordination

- **Minimum eligibility:** Grade X / Adept review plus V7 Architect Delegate recognition
- **Review path:** Human Architect review during Pre-Genesis; governance review after activation
- **Authority source:** Architect doctrine and governance process
- **Execution path:** logged coordination, release preparation, constitutional review
- **Limitations:** not replacement, not ownership, not unilateral doctrine editing
- **Receipt:** required for material actions

### Architect Succession Council candidacy

- **Minimum eligibility:** Grade X / Adept plus V7-level cross-layer history
- **Review path:** elevated continuity review
- **Authority source:** succession governance and constitutional procedure
- **Execution path:** no execution unless succession condition is active
- **Limitations:** candidacy does not grant control
- **Receipt:** candidacy and review receipts

### Architect Succession Council activation

- **Minimum eligibility:** V8 candidacy plus active succession condition
- **Review path:** elevated governance, continuity proof, multi-person safeguards
- **Authority source:** constitutional succession mechanism
- **Execution path:** emergency/continuity process
- **Limitations:** preserve system, do not rule system; no permanent discretionary power
- **Receipt:** mandatory public log and chain/governance receipt where available

## Execution safeguards

All high-impact execution requires:

- explicit scope,
- visible authorization,
- audit trail,
- rollback or suspension path where technically possible,
- no hidden credentials,
- no private user data exposure,
- doctrine compliance.

High-impact domains include:

- treasury movement,
- protocol upgrade,
- repository write access,
- deployment control,
- governance parameter change,
- constitutional amendment,
- Architect succession.

## App implementation implication

The App should display permissions as bounded responsibilities, not ranks.

The App may show:

- what the user can draft,
- what the user can review,
- what the user can vote on,
- what requires sponsorship,
- what requires governance approval.

The App must not show:

- comparative ranking,
- worth score,
- pressure to advance,
- paid unlock for authority,
- countdown pressure for governance eligibility.

## ARCnet implementation implication

ARCnet may witness permission events as factual receipts.

Allowed receipt types:

- `governance_proposal_submitted`
- `governance_vote_cast`
- `treasury_review_signed`
- `treasury_action_executed`
- `protocol_release_signed`
- `authority_envelope_assigned`
- `authority_envelope_suspended`
- `succession_condition_activated`

Forbidden receipt content:

- private practice notes,
- curriculum state,
- human worth,
- superiority,
- personal essence,
- readiness as identity,
- comparative rank.

## Pre-Genesis operating posture

During Pre-Genesis:

- the Human Architect remains primary editorial and release authority,
- all non-Architect permissions are draft/posture only unless explicitly activated,
- treasury execution must remain guarded and non-discretionary,
- developer console work should remain local and non-secret-bearing,
- chain receipts should be factual and minimal,
- governance permission surfaces should be displayed before they are executable.

## Open questions before activation

Before production governance activation, Arcanum must define:

1. review bodies for each permission domain,
2. exact evidence requirements for authority envelope recognition,
3. conflict disclosure format,
4. suspension and appeal process,
5. chain receipt schema,
6. app visibility rules,
7. emergency continuity triggers,
8. multisig or protocol-native treasury signer policy.

## Canonical closure

Vitae may make a being eligible for responsibility.
Governance may recognize that responsibility.
Execution must remain bounded, visible, and reviewable.

No recognition makes a being more worthy.
No permission creates ownership of Arcanum.
No authority may bypass doctrine.
