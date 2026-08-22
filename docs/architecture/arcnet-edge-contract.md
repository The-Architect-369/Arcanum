---
title: "ARCnet Edge Contract"
status: design-candidate
visibility: public
last_updated: 2026-08-21
description: "Candidate common contract for sovereign, capability-scoped interactions between ARCnet systems."
phase: "Pre-Genesis"
authority: "non-canonical design evidence"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/37"
---

# ARCnet Edge Contract

## Purpose

An **ARCnet Edge Contract** is the candidate common boundary by which one ARCnet system may request capability, information, value, or action from another system on behalf of a sovereign identity or explicitly authorized institutional context.

This document is exploratory. It does not replace the current native runtime, App · Chain · Doctrine, Identity, Economic Constitution, Governance, Treasury, or capability rules.

## Core model

A system does not gain direct authority over another system merely because the two are related.

```text
Human / Identity
      |
    Intent
      |
Origin System
      |
Edge Contract
      |
ARCnet local runtime
      |
Destination System
      |
Receipt / optional settlement
```

The Edge Contract should become the narrow, inspectable cross-system boundary.

## Relationship versus invocation

A geometric/system relationship is persistent and bilateral.

Example:

```text
Arcanum <-> Nexus
```

An invocation is directional and action-specific.

Examples:

```text
Arcanum -> Nexus : create-share-draft
Nexus -> Arcanum : create-reflection-seed
```

The existence of the edge does not automatically authorize either action.

## Candidate geometric classes

```text
Kinship     — systems on the same tetrahedron
Operational — cross-tetrahedron / cube-edge relation
Mirror      — deep opposite pair
```

These classes are semantic/topological metadata. They do not automatically grant different authority levels.

## Candidate contract structure

A future machine-readable form should be able to express at least:

```text
EDGE IDENTITY
- edge id
- version
- endpoint systems
- geometric class

ACTION REGISTRY
- permitted directional actions
- human-readable intent
- origin component/port
- destination component/port

AUTHORITY
- sovereign actor or institutional authorization context
- required capabilities
- expiry
- revocation behavior

DATA
- accepted inputs
- derived artifact/output type
- disclosure policy
- provenance policy

DELIVERY
- local device
- trusted devices
- selected peers
- network

AUDIENCE
- private draft
- selected identities
- group
- channel
- public

ECONOMY
- economic effect type
- pre-authorization disclosure
- no implicit mint authority

SETTLEMENT
- none
- optional
- required
- local / synchronized / submitted / finalized distinctions

RECEIPTS
- local receipt
- synchronization evidence
- protocol transaction/finality reference when required

DOCTRINE
- mandatory guards
- forbidden transitions

FAILURE
- deny
- cancel
- expire
- retry
- partial completion
- compensating/new action where history is already final

PRESENTATION
- optional card or UI metadata
- presentation never grants authority
```

## Candidate invariants

### 1. No direct cross-system private-storage access

Systems should exchange bounded artifacts through a contract rather than giving one system broad access to another system's private namespace.

### 2. Derived Artifact Law

The source record remains owned by its originating system. A crossing produces a bounded derivative suitable for the destination.

```text
private source record
      -> derived passage artifact
      -> destination-owned record
```

### 3. Two-Phase Passage

Entering a destination and executing/publishing there are distinct decisions.

The originating system authorizes departure. The destination system governs arrival and any later destination-native action.

### 4. Monotonic Disclosure

Visibility may not silently widen while an artifact travels through the system. Every widening in audience or disclosure requires explicit authorization appropriate to the sensitivity and context.

### 5. Authority Conservation

An advisory, draft, factual, or non-executing object does not acquire higher authority merely because it crosses an edge.

A Hope draft remains a draft when it arrives in Nexus. A Nexus discussion does not become governance law by being routed into Imperium.

### 6. Provenance Without Surveillance

The runtime should preserve enough provenance to reconstruct legitimate origin and authorization without exposing complete private source identifiers, source histories, or cross-system dossiers.

### 7. Explicit Return

External/social state does not automatically flow back into protected interior systems. Reverse passage must itself be an explicit edge action.

### 8. Destination Economics

Economic cost belongs to the function consuming scarce utility or causing an economic effect, not merely to the fact that an artifact crossed a system boundary.

### 9. Transport Independence

An Edge Contract defines semantic and authority behavior independently from Matrix, IPFS/Helia, direct peer transport, trusted-device sync, or future ARCnet transports.

### 10. Local-First Receipt

Every accepted edge invocation begins as a locally understandable action and should produce an appropriate local receipt before any later synchronization or chain settlement.

### 11. Geometric Neutrality of Authority

`Kinship`, `Operational`, or `Mirror` classification does not itself increase permission, constitutional legitimacy, settlement authority, or data access.

### 12. No Edge by Symmetry Alone

A geometric line is a question, not permission. Every one of the 28 candidate relationships must independently demonstrate legitimate functions and constraints.

## Actor / Identity boundary

The actor reference should expose only the minimum continuity and authorization information needed for the operation.

It must not require:

- personality dossiers;
- Hope history;
- Vitae rank;
- wealth as identity;
- ideology;
- complete profile export.

The Identity Model remains controlling.

## Delivery and audience are separate dimensions

The first detailed edge study showed that one generic `reach` field is insufficient.

A contract should distinguish at least:

### Delivery scope

Where the artifact is transported:

- local device;
- trusted devices;
- selected peers;
- network.

### Audience scope

Who may perceive/use the destination object:

- private draft;
- selected identities;
- group;
- channel;
- public.

A group-visible object may require network delivery while remaining non-public.

## Economic boundary

An Edge Contract may describe economic consequences but may not invent monetary authority.

A contract can request or declare:

- no economic effect;
- quote;
- transfer;
- fee;
- deposit;
- Treasury allocation request where otherwise authorized.

Creation of new MANA must remain under separately constitutionally authorized issuance mechanisms.

## Settlement boundary

An Edge Contract should state whether final settlement is:

- unnecessary;
- optional;
- required.

It must preserve the distinction among:

```text
local committed
peer synchronized
network observed
submitted
finalized
rejected
```

Private meaning and high-context content remain off-chain unless another canonical rule explicitly establishes a different boundary.

## Revocation and finality

Revocation may stop future use of a capability or invalidate an unconsumed grant.

Revocation must not pretend finalized history never happened.

When correction is required after a finalized economic/governance/protocol action, the correction is a new authorized action with its own receipt rather than hidden rewriting of history.

## Edge and vertex relationship

An Edge Contract is the primitive bilateral relationship.

A future geometric vertex should preferably be modeled as a composed workflow across multiple edges rather than a separate source of authority.

```text
edge = primitive contract
vertex = composed multi-edge workflow
```

This remains a design hypothesis to test against later edge studies.

## Reference study

The first detailed application of this contract is:

- `docs/architecture/edge-studies/arcanum-nexus.md`

That study produced several of the invariants in this document. They remain provisional until repeated across additional edges.

## Next validation gate

Use the remaining 27 edge studies to test whether the same contract grammar works for:

- private reflection and social publication;
- physical/digital creation;
- commerce and provenance;
- governance and Treasury execution;
- system building and security review;
- public goods and cultural patronage;
- mirror-axis balancing relationships.

Recurring principles should be promoted only after they survive multiple materially different edges.
