# ARCnet Governance Module Design

Status: canonical-draft
Phase: Pre-Genesis
Layer: Chain

## Purpose

Defines the future governance module architecture for ARCnet.

This is a design document, not an activation document.

## Core Principle

ARCnet witnesses governance.
ARCnet does not replace governance.

The chain records governed outcomes and receipts.

## Module Responsibilities

The governance module should eventually support:

- proposal registration
- sponsorship receipts
- review receipts
- vote receipts
- execution receipts
- authority envelope receipts
- treasury execution receipts
- continuity receipts

The governance module should not support:

- human ranking
- Vitae scoring
- psychological evaluation
- worth computation

## Proposed Stores

### Proposal Store

Tracks:
- proposal id
- proposal type
- state
- timestamps
- associated receipts

### Authority Store

Tracks:
- authority envelope
- scope
- activation receipt
- suspension receipt

### Receipt Store

Tracks:
- receipt id
- receipt type
- actor reference
- timestamp
- metadata hash/reference

### Execution Store

Tracks:
- execution event
- execution receipt
- execution scope

## Proposed Queries

### QueryProposals

Returns proposal state and receipt references.

### QueryAuthority

Returns active authority envelopes and scope.

### QueryReceipts

Returns receipt timelines.

### QueryExecutions

Returns executed governance events.

## Proposed Messages

### MsgSubmitProposal

Creates proposal registration receipt.

### MsgSponsorProposal

Creates sponsorship receipt.

### MsgReviewProposal

Creates review receipt.

### MsgCastVote

Creates vote receipt.

### MsgExecuteProposal

Creates execution receipt.

### MsgAssignAuthority

Creates authority assignment receipt.

### MsgSuspendAuthority

Creates authority suspension receipt.

## Integration Boundary

The governance module should integrate with:

- treasury module
- chaincode module
- mana module
- continuity systems

through receipts and governed execution.

## Genesis Posture

Pre-Genesis:
- documentation only
- no automatic activation
- no protocol authority derived from chain state alone

## Canonical Closure

Governance should be visible.
Execution should be auditable.
Authority should be bounded.
The chain should witness facts, not define meaning.