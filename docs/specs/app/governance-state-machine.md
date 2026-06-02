# Governance State Machine

Status: canonical-draft
Phase: Pre-Genesis
Layer: App

## Purpose

Defines the app-side runtime state machine for governance proposals, council reviews, authority envelopes, treasury actions, protocol changes, and receipts.

This document translates the governance lifecycle into buildable UI and state logic.

## Canonical Dependencies

- docs/governance/governance-lifecycle.md
- docs/governance/governance-councils.md
- docs/governance/governance-permission-model.md
- docs/specs/app/governance-ui-model.md
- docs/specs/chain/governance-receipts.md
- docs/specs/chain/authority-state-model.md

## Core Rule

The App may manage workflow state.
The App must not become the authority source.

Governance truth must resolve through:

1. local draft state,
2. governance review state,
3. ARCnet receipts where available,
4. canonical doctrine constraints.

## Proposal State Machine

```text
draft
  ↓
seeking_sponsor
  ↓
sponsored
  ↓
under_review
  ↓
ready_for_vote
  ↓
voting
  ↓
passed | failed | deferred
  ↓
timelock
  ↓
executable
  ↓
executed
```

## Proposal States

### draft

Local-only, editable, non-binding.

Created by: V2+ where enabled, or Human Architect during Pre-Genesis.

### seeking_sponsor

Proposal is visible to eligible sponsors.

No governance action yet.

### sponsored

An eligible steward has accepted scope responsibility.

Creates eligibility for council review.

### under_review

Assigned council evaluates:

- doctrine alignment,
- permission scope,
- treasury/protocol/app impact,
- security risk,
- privacy risk.

### ready_for_vote

Review completed without blocking issue.

### voting

Governance vote active.

### passed

Thresholds and quorum met.

### failed

Thresholds or quorum not met.

### deferred

Returned for revision or delayed due to unresolved concerns.

### timelock

Passed proposal waiting before execution.

### executable

Timelock complete and execution path available.

### executed

Execution completed and receipt generated.

## Transition Guards

Every transition must check:

- current state,
- actor permission envelope,
- proposal domain,
- required council review,
- required receipts,
- doctrine constraints.

Invalid transitions should fail silently or return a non-coercive explanation.

## TypeScript Model

```ts
export type GovernanceProposalState =
  | 'draft'
  | 'seeking_sponsor'
  | 'sponsored'
  | 'under_review'
  | 'ready_for_vote'
  | 'voting'
  | 'passed'
  | 'failed'
  | 'deferred'
  | 'timelock'
  | 'executable'
  | 'executed'

export type GovernanceDomain =
  | 'governance'
  | 'treasury'
  | 'protocol'
  | 'app'
  | 'continuity'

export type GovernanceProposalRecord = {
  id: string
  title: string
  summary: string
  domain: GovernanceDomain
  state: GovernanceProposalState
  authorId: string
  sponsorId?: string
  councilId?: string
  createdAt: string
  updatedAt: string
  timelockUntil?: string
  receiptIds: string[]
}
```

## Review State Machine

```text
pending
  ↓
accepted | blocked | deferred
```

### pending

Review has been requested but not resolved.

### accepted

Council finds no blocking issue.

### blocked

Council identifies a doctrinal, security, privacy, treasury, or protocol blocker.

### deferred

Council requires revision or additional evidence.

## Authority State Machine

```text
none
  ↓
review_pending
  ↓
recognized
  ↓
suspended
  ↓
restored | retired
```

Authority must be scoped.

No global authority should be implied unless explicitly defined by doctrine and governance.

## Treasury State Machine

Treasury proposals use the same base proposal machine, with stricter guards:

```text
draft
  ↓
sponsored
  ↓
treasury_review
  ↓
voting
  ↓
passed
  ↓
timelock
  ↓
multisig_or_protocol_execution
  ↓
executed
```

Required fields:

- recipient or recipient class,
- amount reference,
- allocation lane,
- purpose,
- conflict disclosures,
- execution window.

## Protocol State Machine

Protocol proposals require testing and release review:

```text
draft
  ↓
sponsored
  ↓
protocol_review
  ↓
verification
  ↓
voting
  ↓
timelock
  ↓
upgrade_authorized
  ↓
upgrade_executed
```

Required fields:

- branch or commit,
- verification commands,
- risk summary,
- rollback plan where applicable,
- doctrine impact summary.

## Local Storage Policy

Local-only data may include:

- drafts,
- private notes,
- unsponsored proposals,
- local review preparation.

Shared governance state may include:

- sponsored proposals,
- reviews,
- votes,
- timelocks,
- receipts.

## Receipt Binding

A state transition that produces governance effect should bind to a receipt when ARCnet support exists.

Examples:

- sponsored → `governance_proposal_sponsored`
- reviewed → `governance_proposal_reviewed`
- voting → `governance_vote_cast`
- passed → `governance_proposal_passed`
- executed → `governance_proposal_executed`

## Pre-Genesis Implementation Path

1. Implement local draft state only.
2. Add static lifecycle viewer.
3. Add local receipt simulation.
4. Add authority envelope display.
5. Add sponsor/review mock state.
6. Wire real ARCnet receipts after localnet support.
7. Enable execution only after governance activation.

## Canonical Closure

The state machine should make governance legible.
It should not make governance impulsive.

Every action should answer:

- who may do this,
- under what review,
- through what execution path,
- with what receipt,
- under what doctrinal limit.
