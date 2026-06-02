# Treasury Flow Model

Status: canonical-draft
Phase: Pre-Genesis
Layer: Economy

## Purpose

Defines how treasury resources move through Arcanum from proposal to allocation, execution, receipt generation, and public observation.

This document connects:

Governance → Treasury → Receipts → ARCnet

## Core Principle

The treasury is a stewardship system.

It is not:
- private ownership
- discretionary patronage
- political reward
- authority purchase

Treasury movement must always remain reviewable, receipted, and governance-bound.

## Treasury Lifecycle

```text
Proposal
  ↓
Sponsorship
  ↓
Treasury Review
  ↓
Governance Vote
  ↓
Timelock
  ↓
Execution
  ↓
Receipt
```

No treasury action may bypass this flow.

## Treasury Lanes

Suggested allocation lanes:

### Infrastructure

Supports:
- network operations
- archival services
- protocol infrastructure
- shared tooling

### Development

Supports:
- application development
- protocol development
- audits
- technical maintenance

### Community

Supports:
- educational materials
- onboarding resources
- events
- stewardship initiatives

### Continuity

Supports:
- emergency operations
- succession readiness
- continuity infrastructure

### Research

Supports:
- doctrine exploration
- governance experiments
- technical research

## Treasury Proposal Model

Required fields:

- title
- purpose
- allocation lane
- amount reference
- recipient or recipient class
- sponsor
- review references
- conflict disclosures

## Review Requirements

Treasury review should verify:

- doctrinal alignment
- governance alignment
- budget availability
- recipient eligibility
- conflict disclosures
- execution safety

## Custody Rules

Treasury custody must:

- be multi-party
- be reviewable
- generate receipts
- remain governance-bound

Treasury custody must not:

- be controlled by one actor
- operate invisibly
- bypass governance

## Treasury Receipts

Receipt types:

- treasury_proposal_submitted
- treasury_review_signed
- treasury_proposal_passed
- treasury_action_executed

## Public Observation

The network should be able to observe:

- allocation lane
- proposal status
- review completion
- execution status
- treasury receipts

The network should not require exposure of private personal information.

## Canonical Closure

Treasury resources are held in trust.
The treasury exists to sustain the mission, not reward status.
Every movement should be visible, reviewable, and receipted.