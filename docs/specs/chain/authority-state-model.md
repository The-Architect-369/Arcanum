# ARCnet Authority State Model

Status: canonical-draft
Phase: Pre-Genesis
Layer: Chain

## Purpose

Defines what authority-related information ARCnet may witness, store, expose, and refuse.

This document protects the boundary between:

Vitae → Governance → ARCnet

and prevents authority from collapsing into identity value.

## Core Rule

ARCnet may witness authority facts.
ARCnet may not define human worth.

The chain records authority events.
The chain does not create legitimacy by itself.

## Authority Categories

### Off-Chain Authority

Examples:
- private practice
- Vitae notes
- review discussions
- personal reflection
- readiness judgments

Forbidden from chain state.

### Governance Authority

Examples:
- envelope assigned
- envelope suspended
- proposal sponsorship
- review completion

May be witnessed through receipts.

### Execution Authority

Examples:
- treasury execution
- protocol release execution
- continuity execution

Must always generate receipts.

## Authority Envelope State

Suggested chain-facing model:

```ts
type AuthorityEnvelope =
  | 'participant'
  | 'witness'
  | 'steward_candidate'
  | 'module_steward'
  | 'governance_steward'
  | 'treasury_steward'
  | 'protocol_steward'
  | 'architect_delegate'
  | 'architect_succession_council'
```

## Witnessable Authority Event Types

- authority_envelope_assigned
- authority_envelope_suspended
- authority_envelope_restored
- authority_scope_modified

## Governance State Boundary

Chain state may expose:

- envelope
- scope
- activation timestamp
- suspension timestamp
- receipt references

Chain state must not expose:

- practice notes
- Vitae journals
- grade history details
- emotional records
- private review records

## Treasury State Boundary

Chain may witness:

- proposal approved
- review signed
- execution completed

Chain must not witness:

- private deliberations
- personal assessments

## Protocol State Boundary

Chain may witness:

- release signed
- upgrade approved
- upgrade executed

Chain must not witness:

- private development discussion
- contributor reputation

## Continuity State Boundary

Chain may witness:

- delegate recognition
- succession review completion
- succession activation

Chain must not witness:

- personal evaluations
- worth claims

## Query Model

Future query surfaces may include:

- authority by identity
- authority receipts by scope
- active governance roles
- active treasury roles
- active protocol roles

Queries must return factual state only.

## App Relationship

The App may display authority state.
The App may explain authority state.
The App must not reinterpret authority state as human value.

## Canonical Closure

Authority may be witnessed.
Authority may be reviewed.
Authority may be revoked.

Worth may not be computed.
Being may not be ranked.
Identity may not be reduced to governance state.