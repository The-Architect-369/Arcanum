# Governance UI Model

Status: canonical-draft
Phase: Pre-Genesis
Layer: App

## Purpose

Defines how the Arcanum App should expose governance, Vitae authority envelopes, councils, proposals, treasury review, protocol review, and receipts without turning governance into status, pressure, or competition.

## Core Rule

The App is an interface.
It may display governance state.
It may help draft and review proposals.
It may show receipts.

The App must not become the source of governance truth.

## Canonical Dependencies

- docs/governance/vitae-authority-map.md
- docs/governance/governance-permission-model.md
- docs/governance/governance-lifecycle.md
- docs/governance/governance-councils.md
- docs/specs/chain/governance-receipts.md
- docs/architecture/app-chain-doctrine.md

## Primary Surfaces

### /governance

Main governance dashboard.

Should show:
- active proposals
- draft proposals
- proposals under review
- proposals in timelock
- executed proposals
- user's visible permissions
- public governance receipts

Must not show:
- rankings
- popularity metrics
- coercive urgency
- authority as prestige

### /governance/proposals

Proposal list and status surface.

Statuses:
- draft
- seeking_sponsor
- sponsored
- under_review
- voting
- timelock
- executable
- executed
- failed
- deferred

### /governance/proposals/new

Proposal drafting surface.

Requires:
- trusted device
- identity continuity where enabled
- minimum permission envelope for submission path

Drafting does not equal submission.

### /governance/councils

Displays council purpose and current review queues.

Councils:
- Steward Review Council
- Treasury Review Council
- Protocol Review Council
- Continuity Council

Council membership should be shown as responsibility, not status.

### /governance/receipts

Public receipt timeline.

Receipt types come from docs/specs/chain/governance-receipts.md.

The UI may display:
- proposal receipts
- review receipts
- vote receipts
- execution receipts
- treasury receipts
- protocol receipts
- continuity receipts

The UI must not infer human worth from receipts.

### /vitae/authority

Future read-only or semi-interactive surface for authority envelopes.

Should show:
- current authority envelope
- source of authority state
- scope
- what is permitted
- what is not permitted
- whether review is pending
- whether a chain receipt exists

## Permission Display Model

Each permission should be shown with:

- name
- domain
- eligibility
- review path
- execution path
- limitations
- receipt status

Example:

```ts
type GovernanceUIPermission = {
  id: string
  label: string
  domain: 'governance' | 'treasury' | 'protocol' | 'app' | 'continuity'
  eligibility: string
  reviewPath: string
  executionPath: string
  limitations: string[]
  receiptRequired: boolean
}
```

## Proposal UI Model

```ts
type GovernanceProposalStatus =
  | 'draft'
  | 'seeking_sponsor'
  | 'sponsored'
  | 'under_review'
  | 'voting'
  | 'timelock'
  | 'executable'
  | 'executed'
  | 'failed'
  | 'deferred'

 type GovernanceProposal = {
  id: string
  title: string
  summary: string
  domain: 'governance' | 'treasury' | 'protocol' | 'app' | 'continuity'
  status: GovernanceProposalStatus
  authorId: string
  sponsorId?: string
  council?: string
  createdAt: string
  updatedAt: string
  receiptIds: string[]
}
```

## Review Queue Model

```ts
type GovernanceReview = {
  id: string
  proposalId: string
  council: 'steward' | 'treasury' | 'protocol' | 'continuity'
  status: 'pending' | 'accepted' | 'deferred' | 'rejected'
  reviewerIds: string[]
  receiptId?: string
}
```

## Treasury UI Constraints

Treasury surfaces must show:

- purpose
- recipient or recipient category
- amount reference
- allocation lane
- conflict disclosures
- review status
- timelock status
- execution receipt

Treasury surfaces must not:

- hide routing
- imply discretionary spending
- allow single-actor execution
- gamify treasury influence

## Protocol UI Constraints

Protocol surfaces must show:

- linked branch/commit/release candidate
- verification status
- protocol review status
- governance approval status
- timelock status
- upgrade receipt

Protocol surfaces must not:

- deploy from sentiment
- skip verification
- encode meaning or worth into chain state

## Local-Only vs Chain-Witnessed

### Local-only

- drafts
- private notes
- practice sessions
- local review preparation
- unsponsored proposals

### Governance/App State

- sponsored proposals
- council reviews
- pending votes
- visible permission envelopes

### Chain-witnessed

- submitted proposals
- votes
- passed/failed proposals
- role assignment receipts
- treasury execution receipts
- protocol release receipts
- continuity activation receipts

## Pre-Genesis Implementation Path

1. Add static governance dashboard with read-only lifecycle explanation.
2. Add authority envelope display from local/static registry.
3. Add proposal draft model with local storage only.
4. Add receipt viewer using local receipts first.
5. Wire ARCnet receipts once chain support exists.
6. Add review queues after councils are operationally defined.
7. Add execution surfaces only after governance activation.

## Canonical Closure

The governance UI should make responsibility legible.
It should not make authority desirable as status.
It should help users understand where action is possible, where review is required, and where doctrine forbids shortcuts.