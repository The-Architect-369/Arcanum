# Node Upgrade Model

Status: canonical-draft
Phase: Pre-Genesis
Layer: Network

## Purpose

Defines how local node evolution becomes network evolution.

This model creates the bridge between:

Node → Proposal → Governance → Release → Adoption

and ensures that decentralized evolution remains reviewable, receipted, and doctrinally constrained.

## Core Principle

A node may evolve itself.
A network evolves through governance.

No single node may redefine ARCnet for every other participant.

## Upgrade Domains

### Domain A — Local Experience

Examples:

- themes
- layouts
- accessibility settings
- local agent configuration
- local dashboards

Governance required:

No.

Network effect:

None.

### Domain B — Local Extensions

Examples:

- optional plugins
- local workflows
- local tooling
- personal automation

Governance required:

No, unless distributed as a shared network feature.

### Domain C — Shared Application Behavior

Examples:

- wallet behavior
- governance UI behavior
- authority display behavior
- receipt display behavior

Governance required:

Usually yes.

Review required.

### Domain D — Protocol Behavior

Examples:

- chain modules
- message definitions
- receipt schemas
- consensus-affecting logic

Governance required:

Always.

### Domain E — Constitutional Behavior

Examples:

- identity rules
- authority rules
- governance rules
- treasury rules
- succession rules

Governance required:

Always.

Elevated review required.

## Upgrade Lifecycle

```text
Local Change
  ↓
Proposal Draft
  ↓
Sponsorship
  ↓
Review
  ↓
Governance
  ↓
Release Candidate
  ↓
Receipt
  ↓
Node Adoption
```

## Stage Definitions

### Local Change

Change exists only on a local node.

No governance impact.

### Proposal Draft

Change intent is documented.

Must include:

- purpose
- scope
- impact
- verification notes
- doctrine notes

### Sponsorship

Eligible steward accepts responsibility for review.

### Review

Appropriate council evaluates:

- safety
- doctrine
- governance impact
- treasury impact
- protocol impact

### Governance

Governance determines whether the change should proceed.

### Release Candidate

A concrete candidate exists for evaluation.

Must include:

- version
- changelog
- verification status
- rollback guidance where applicable

### Receipt

Governance and release events generate receipts.

### Node Adoption

Individual nodes decide whether and when to adopt.

## Adoption Principle

Governed approval does not require immediate adoption.

Nodes should remain capable of:

- staged upgrades
- delayed upgrades
- offline upgrades
- upgrade verification

subject to protocol compatibility requirements.

## Upgrade Receipts

Suggested receipt events:

- release_candidate_signed
- release_candidate_approved
- release_candidate_rejected
- node_upgrade_adopted
- node_upgrade_rolled_back

## Version Channels

Future channels may include:

### Experimental

Local experimentation.

### Review

Under active governance review.

### Candidate

Approved for broader testing.

### Stable

Governance-approved release.

### Long-Term Support

Extended compatibility path.

## Rollback Principle

Whenever technically possible:

- upgrades should be reversible,
- rollback procedures should be documented,
- rollback events should generate receipts.

## Node Sovereignty Boundary

Nodes may:

- choose adoption timing,
- verify releases,
- remain temporarily offline,
- inspect receipts.

Nodes may not:

- redefine governance outcomes,
- fabricate receipts,
- assign authority unilaterally,
- rewrite constitutional history.

## ARCnet Relationship

ARCnet witnesses:

- release approvals
- release adoption
- rollback events
- upgrade execution

ARCnet does not force belief.
ARCnet records historical facts.

## Pre-Genesis Implementation Path

1. Define release candidate schema.
2. Define upgrade receipt schema.
3. Implement local release viewer.
4. Implement receipt-linked changelogs.
5. Implement adoption tracking.
6. Define protocol compatibility policy.
7. Activate governed upgrade path after governance activation.

## Canonical Closure

A sovereign node may evolve.
A sovereign network evolves together.

The bridge between those truths is governance.