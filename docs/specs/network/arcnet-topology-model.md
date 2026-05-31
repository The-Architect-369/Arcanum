# ARCnet Topology Model

Status: canonical-draft
Phase: Pre-Genesis
Layer: Network

## Purpose

Defines the conceptual topology of ARCnet and the flow of governance, identity, authority, receipts, and synchronization across the network.

## Core Principle

ARCnet is a network of participating nodes.

Authority belongs to identities.
Receipts belong to history.
Governance belongs to process.

## Topology Layers

### Layer 1 — Identity

Identity continuity exists independent of the network.

Represented through:
- ACC
- ChainCode
- continuity anchors

### Layer 2 — Application

The Arcanum App provides:

- governance interfaces
- Vitae interfaces
- authority interfaces
- receipt interfaces

### Layer 3 — Node

Nodes provide:

- synchronization
- storage
- relay
- verification

### Layer 4 — Governance

Governance provides:

- proposals
- reviews
- votes
- execution authorization

### Layer 5 — ARCnet Witness Layer

ARCnet records:

- receipts
- authority events
- execution events
- continuity events

## Receipt Propagation

```text
Action
  ↓
Receipt Generated
  ↓
Local Node
  ↓
Peer Nodes
  ↓
ARCnet Witness Layer
```

Nodes should validate receipt structure before relay.

## Governance Propagation

```text
Draft
  ↓
Sponsor
  ↓
Review
  ↓
Vote
  ↓
Timelock
  ↓
Execution
  ↓
Receipt
```

The receipt becomes the canonical historical artifact.

## Mobile Node Posture

Mobile nodes are first-class participants.

Mobile nodes should support:

- local drafts
- receipt caching
- authority visibility
- governance participation
- delayed synchronization

Mobile nodes are not secondary citizens of ARCnet.

## Synchronization Rules

Synchronization should prioritize:

1. identity continuity
2. authority state references
3. governance receipts
4. execution receipts
5. public governance state

Synchronization must not prioritize surveillance.

## Network Failure Posture

If peers become unavailable:

- local operation continues
- receipts queue locally
- synchronization resumes later

Loss of connectivity should not erase participation.

## Future Topology Roles

Potential future roles:

- receipt mirrors
- governance archives
- treasury observers
- protocol observers
- continuity archives

These roles provide service, not sovereignty.

## Canonical Closure

ARCnet should remain:

- decentralized
- local-first
- receipt-oriented
- governance-aware
- identity-protective

The network exists to preserve continuity and coordination, not control.