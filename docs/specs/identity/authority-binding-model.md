# Authority Binding Model

Status: canonical-draft
Phase: Pre-Genesis
Layer: Identity

## Purpose

Defines how governance authority envelopes bind to ACC / ChainCode identity without modifying identity, ranking beings, or converting authority into ownership.

This document bridges:

Identity → Vitae → Authority → Governance → ARCnet

## Canonical Dependencies

- docs/doctrine/identity-model.md
- docs/doctrine/authority.md
- docs/governance/vitae-authority-map.md
- docs/governance/governance-permission-model.md
- docs/specs/chain/authority-state-model.md
- docs/specs/chain/governance-receipts.md

## Core Rule

Authority attaches to identity.
Authority does not define identity.

A being is not their authority envelope.
A being is not diminished when authority is absent, suspended, or retired.

## Identity Anchor

The ChainCode / ACC identity anchor provides continuity reference.

It may be used to associate:

- governance proposals
- review participation
- authority envelopes
- treasury review eligibility
- protocol stewardship eligibility
- continuity responsibilities

It may not be used to compute:

- worth
- rank
- virtue
- essence
- predicted becoming

## Binding Object

A future implementation may represent authority binding as:

```ts
type AuthorityBinding = {
  identityAnchor: string
  envelope: AuthorityEnvelope
  scope: string
  status: 'pending' | 'active' | 'suspended' | 'restored' | 'retired'
  source: 'local' | 'governance_review' | 'chain_receipt'
  activatedAt?: string
  suspendedAt?: string
  receiptId?: string
  txHash?: string
}
```

## Scope Requirement

All authority bindings must be scoped.

Valid scopes may include:

- module:hope
- module:tempus
- module:vit ae
- module:nexus
- module:wallet
- governance:proposal
- treasury:review
- protocol:review
- continuity:succession
- app:developer-console

Unscoped global authority is forbidden except where explicitly defined by constitutional succession procedures.

## Binding Lifecycle

```text
none
  ↓
review_pending
  ↓
active
  ↓
suspended
  ↓
restored | retired
```

### review_pending

A recognition or permission review exists but has not produced authority.

### active

Authority is recognized within a specific scope.

### suspended

Authority is temporarily blocked for operational, safety, governance, or doctrine reasons.

Suspension does not diminish identity.

### restored

Authority returns after review.

### retired

Authority is intentionally closed or no longer applicable.

Retirement does not diminish identity.

## Key Rotation

Authority should survive legitimate key rotation when continuity is preserved.

Required conditions:

- original identity anchor continuity is preserved,
- recovery path is documented,
- review or cryptographic proof confirms continuity,
- new key does not create duplicate identity.

Key rotation may update signing control.
It must not create a new being.

## Recovery

Authority recovery may be required if:

- device is lost,
- key is lost,
- identity anchor must be rebound,
- authority scope must move to a new signing key.

Recovery requires:

- identity continuity proof,
- governance or council review for high-impact authority,
- receipt generation when chain-supported.

## Suspension

Authority may be suspended for:

- compromised key,
- governance violation,
- treasury risk,
- protocol risk,
- doctrine breach,
- emergency continuity protection.

Suspension must be:

- scoped,
- logged,
- reviewable,
- non-punitive toward identity.

## Treasury Binding

Treasury authority binding must require:

- identity anchor,
- V5 Treasury Steward eligibility or higher,
- explicit treasury scope,
- conflict disclosure,
- governance approval,
- receipt record.

Treasury authority must never bind to anonymous disposable keys without continuity controls.

## Protocol Binding

Protocol authority binding must require:

- identity anchor,
- V6 Protocol Steward eligibility or higher,
- technical scope,
- verification history,
- release review process,
- receipt record.

Protocol authority cannot be derived from app UI alone.

## Developer Binding

Developer permissions may bind to:

- trusted device,
- identity anchor,
- authority envelope,
- repository branch or app scope.

Developer binding must not expose secrets or create hidden write authority.

## Privacy Boundary

Authority binding may expose:

- envelope
- scope
- status
- receipt reference

Authority binding must not expose:

- private Vitae notes
- personal history
- emotional records
- hidden curriculum state
- identity essence

## ARCnet Witnessing

ARCnet may witness authority binding events:

- authority_envelope_assigned
- authority_scope_modified
- authority_envelope_suspended
- authority_envelope_restored
- authority_envelope_retired

ARCnet must not witness the private reasons behind lived recognition unless voluntarily and minimally disclosed through governance records.

## App Implementation Implication

The App should show authority bindings as responsibilities.

Example display:

- Envelope: Module Steward
- Scope: module:hope
- Status: active
- Source: governance review
- Receipt: available

The App must not display authority binding as level, rank, superiority, or worth.

## Canonical Closure

Identity is continuity.
Authority is responsibility.
Binding connects responsibility to continuity.

The binding may change.
The being remains sovereign.
