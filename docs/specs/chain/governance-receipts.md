# ARCnet Governance Receipts

Status: canonical-draft
Phase: Pre-Genesis

## Purpose

Defines the factual receipt schema that ARCnet may witness for governance, treasury, protocol, authority, and continuity events.

ARCnet is a witness layer.
It records facts.
It does not determine human worth, Vitae progression, or authority legitimacy by itself.

## Core Rule

Receipts record:

- what happened
- when it happened
- who authorized it
- what process produced it

Receipts do not record:

- personal value
- rank
- superiority
- private Vitae notes
- internal curriculum state
- psychological assessments

## Canonical Receipt Shape

Every governance receipt should support:

- receipt_id
- receipt_type
- timestamp
- actor_id
- authority_envelope
- governance_scope
- proposal_id (optional)
- review_id (optional)
- execution_id (optional)
- metadata
- signature

## Governance Receipts

### governance_proposal_submitted

Generated when a proposal enters governance.

Metadata:
- proposal_type
- sponsor
- scope

### governance_proposal_sponsored

Generated when a steward formally sponsors a proposal.

Metadata:
- sponsor_id
- proposal_id

### governance_proposal_reviewed

Generated when review completes.

Metadata:
- council
- outcome
- notes_reference

### governance_vote_cast

Generated when a binding vote is recorded.

Metadata:
- proposal_id
- vote_choice

### governance_proposal_passed

Generated when a proposal reaches passage requirements.

### governance_proposal_failed

Generated when a proposal fails.

### governance_proposal_executed

Generated after execution completes.

## Authority Receipts

### authority_envelope_assigned

Records activation of a governance authority envelope.

Metadata:
- envelope
- scope
- review_reference

### authority_envelope_suspended

Records temporary or permanent suspension.

Metadata:
- envelope
- reason_code

### authority_envelope_restored

Records restoration after review.

## Treasury Receipts

### treasury_proposal_submitted

### treasury_review_signed

Metadata:
- reviewer
- review_scope

### treasury_proposal_passed

### treasury_action_executed

Metadata:
- treasury_lane
- amount_reference
- execution_reference

## Protocol Receipts

### protocol_change_proposed

### protocol_review_signed

### release_candidate_signed

### protocol_upgrade_authorized

### protocol_upgrade_executed

## Continuity Receipts

### architect_delegate_recognized

### succession_candidate_reviewed

### succession_condition_activated

### continuity_action_executed

## Privacy Boundaries

The following data must never appear in governance receipts:

- private reflections
- Vitae session notes
- personal journals
- mastery logs
- emotional records
- health records
- identity worth claims

## App Boundary

The app may display receipts.
The app may derive timelines from receipts.
The app must not derive human value from receipts.

## Future ARCnet Integration

Governance receipts are intended to become the canonical bridge between:

Governance → ARCnet
Treasury → ARCnet
Protocol → ARCnet
Continuity → ARCnet

without placing Vitae itself on-chain.

## Canonical Closure

ARCnet witnesses actions.
Governance authorizes actions.
Vitae prepares beings for responsibility.

These layers must remain distinct.