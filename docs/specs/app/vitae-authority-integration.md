---
title: "Vitae Authority Integration"
status: canonical-draft
visibility: public
last_updated: 2026-05-30
description: "Implementation-facing bridge between the app Vitae surfaces, local device state, governance permissions, and ARCnet receipts."
phase: "Pre-Genesis"
layer: "App"
---

# Vitae Authority Integration

## Purpose

This document defines how the App should integrate Vitae practice, recognition, authority envelopes, and ARCnet receipts without violating Vitae doctrine.

It is subordinate to:

- `docs/doctrine/authority.md`
- `docs/governance/vitae-authority-map.md`
- `docs/governance/governance-specification.md`
- `docs/architecture/app-chain-doctrine.md`
- `docs/specs/chain/local-arcnet.md`

## Current app state

As of the Pre-Genesis mobile branch, the App has three Vitae routes:

- `/vitae/grade`
- `/vitae/path`
- `/vitae/mastery`

The current implementation is local-first:

- path selection is stored on-device,
- practice sessions are stored on-device,
- local receipts are created for path selection and practice recording,
- the app explicitly says Grade/Band does not imply worth, rank, or personal value,
- saving requires trusted device activation.

This is doctrinally correct for an early app surface.

## Current limitations

The current App does not yet implement:

- authority envelopes from `docs/governance/vitae-authority-map.md`,
- governance permission discovery,
- proposal drafting from Vitae state,
- treasury role visibility,
- protocol stewardship visibility,
- ARCnet-witnessed authority receipts,
- review workflows for recognized responsibility.

The current `band` terms such as `Preview`, `Beginning`, `Steady`, and `Established` are local practice summaries only. They must not be treated as governance authority.

## Required distinction

The App must distinguish three different things:

### 1. Local practice state

Examples:

- selected path,
- practice session count,
- minutes,
- notes,
- latest record.

Authority: device-local only.

Storage: local private storage.

Chain status: not on-chain.

### 2. Recognition review state

Examples:

- request for review,
- module steward review pending,
- governance steward review pending,
- recognition declined or deferred,
- recognition accepted.

Authority: review process.

Storage: app/governance records, with privacy controls.

Chain status: may be represented only by factual receipts if governance activates that path.

### 3. Authority envelope state

Examples:

- V1 Witness,
- V2 Steward Candidate,
- V3 Module Steward,
- V4 Governance Steward,
- V5 Treasury Steward,
- V6 Protocol Steward,
- V7 Architect Delegate,
- V8 Architect Succession Council.

Authority: governance-defined permission envelope.

Storage: governance/app state, optionally witnessed by ARCnet.

Chain status: factual role assignment or activation receipt only. Never internal curriculum, worth, readiness essence, rank, or private practice state.

## App UX requirements

The Vitae UI must:

- preserve browsing without pressure,
- preserve silence as valid,
- keep private notes local by default,
- avoid leaderboards and comparison,
- avoid progress bars that imply speed optimization,
- avoid best-path recommendations,
- avoid public authority claims unless a review/receipt exists,
- label local practice summaries as local and non-authoritative.

## Proposed app model

The implementation should introduce an explicit authority model alongside local practice state.

Suggested TypeScript shape:

```ts
export type VitaeAuthorityEnvelope =
  | 'participant'
  | 'witness'
  | 'steward_candidate'
  | 'module_steward'
  | 'governance_steward'
  | 'treasury_steward'
  | 'protocol_steward'
  | 'architect_delegate'
  | 'architect_succession_council'

export type VitaeAuthorityState = {
  envelope: VitaeAuthorityEnvelope
  source: 'local_preview' | 'review_pending' | 'recognized' | 'chain_witnessed'
  moduleScope?: string
  grantedAt?: string
  receiptId?: string
  txHash?: string
  notes?: string
}
```

Important:

- `local_preview` must never unlock real governance execution.
- `review_pending` may enable drafting, not execution.
- `recognized` may enable app permissions only within a bounded scope.
- `chain_witnessed` may display a factual receipt once ARCnet supports it.

## Suggested route evolution

### `/vitae/grade`

Current role: local practice summary.

Next role:

- keep current local metrics,
- add a clear “Local practice only” label,
- add a read-only authority envelope panel,
- explain that authority requires review and cannot be purchased.

### `/vitae/path`

Current role: choose local emphasis.

Next role:

- preserve path choice as local emphasis,
- clarify path is not destiny, rank, or authority,
- allow path to inform future review requests but never automatically grant rights.

### `/vitae/mastery`

Current role: record local practice.

Next role:

- keep notes local by default,
- add export/proposal draft option later,
- allow the user to generate a review packet without exposing private notes unless they consent.

### Future `/vitae/authority`

A future fourth route may show:

- current authority envelope,
- what it permits,
- what it does not permit,
- review status,
- governance receipts,
- treasury/protocol eligibility where applicable.

This route should be read-only until governance activation.

## Governance integration phases

### Phase 0 — Local-only Vitae

Current phase.

- local path,
- local sessions,
- local receipts,
- no governance execution.

### Phase 1 — Authority map display

Add read-only display of the authority envelopes from `docs/governance/vitae-authority-map.md`.

No permissions are granted automatically.

### Phase 2 — Review request drafting

Allow users to draft a review request for a bounded responsibility envelope.

The request must include:

- requested envelope,
- requested scope,
- reason for review,
- optional consented evidence,
- conflict disclosures where relevant.

### Phase 3 — Governance review state

Add structured review state:

- pending,
- deferred,
- recognized,
- suspended for operational safety,
- expired if temporary.

### Phase 4 — ARCnet factual receipt

Only after local ARCnet supports appropriate receipts, the system may witness:

- role assignment activated,
- role suspended,
- proposal submitted,
- proposal approved,
- treasury signoff event.

The chain must not store private Vitae data.

## Chain boundary

ARCnet may witness authority events but may not define becoming.

Allowed:

- `vitae_authority_assigned`
- `vitae_authority_suspended`
- `governance_proposal_submitted`
- `treasury_review_signed`
- `release_candidate_signed`

Forbidden:

- practice notes,
- internal curriculum state,
- personal development scores,
- readiness scores,
- public rankings,
- superiority claims.

## Developer authority implication

Developer mode in the App should not be tied directly to session count or practice minutes.

A future developer surface may require:

- trusted device,
- identity anchor,
- recognized authority envelope,
- explicit local confirmation,
- repository/branch scope,
- local verification status,
- human or governance review for high-impact changes.

The Human Architect remains the sole primary editorial authority during Pre-Genesis.

## Immediate implementation checklist

1. Add `VitaeAuthorityEnvelope` and `VitaeAuthorityState` types.
2. Add a read-only authority envelope registry matching `docs/governance/vitae-authority-map.md`.
3. Add an authority panel to `/vitae/grade` or a new `/vitae/authority` route.
4. Label current bands as local practice summaries only.
5. Keep notes and session data local by default.
6. Do not connect authority state to treasury, chain execution, or repository write permissions yet.
7. Add review-request drafting only after the display model is stable.

## Canonical closure

The App may help a being remember practice.
The App may help prepare a responsibility review.
The App may display recognized authority envelopes.

The App must never claim that local practice metrics alone make a being worthy, superior, ready, or sovereign over others.
