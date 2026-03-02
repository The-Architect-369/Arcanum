---
title: "Technical Architecture"
status: draft
visibility: public
last_updated: 2026-03-02
description: "ARCnet blockchain architecture and Arcanum application stack."
---

# Technical Architecture

## I. Overview

The Arcanum ecosystem consists of two primary layers:

1. **ARCnet** — sovereign blockchain infrastructure (Cosmos SDK–based)  
2. **Arcanum Application** — modular client and coordination layer built atop ARCnet  

ARCnet provides settlement, identity anchoring, token economics, treasury governance, and protocol-level invariants.

Arcanum provides user interaction and module composition.

---

## II. ARCnet — Sovereign Blockchain Layer

### 1) Base stack

ARCnet is built using:

- Cosmos SDK
- CometBFT consensus
- IBC compatibility (optional / deliberate)
- Modular on-chain architecture

ARCnet is an independent Layer-1 chain, not a token deployed on another network. This enables sovereign parameter control and invariant enforcement.

### 2) Core modules (whitepaper level)

#### A) Identity module (ACC)
ACC anchors participation identity to on-chain history:

- identity anchoring events
- continuity signals
- governance weighting inputs
- cross-module binding

Identity is not merely custody.
It is longitudinal participation state.

#### B) MANA module
Defines:

- issuance parameters (governance-bounded)
- burn/sink logic
- distribution controls
- transfers
- permission hooks

MANA is used for access, infrastructure usage, and governance participation.

#### C) Treasury module
Defines:

- on-chain reserve management
- governance-approved allocations
- auditability of flows
- execution constraints (time-locks where applicable)

Treasury exists for stewardship, not discretion.

#### D) Governance module
Defines:

- proposals
- voting
- parameter changes within bounds
- treasury approvals
- upgrade coordination

Governance is constitutional before it is democratic.

#### E) Module extensibility framework
ARCnet supports new modules via upgrade governance and audited deployment processes. Extensibility is explicit and bounded.

---

## III. Consensus & Validators

ARCnet uses BFT consensus (CometBFT) with a validator set.

Validators are accountable through:

- staking and delegation
- slashing for misbehavior
- governance visibility
- upgrade coordination

Early phases may begin with curated constraints; the roadmap expects decentralization as stability and participation mature.

---

## IV. Interoperability

ARCnet may support:

- IBC channels
- external asset bridges (governance-approved)
- identity authentication APIs
- SDK-level developer integration

Interoperability is optional; sovereignty and invariants remain primary.

---

## V. Arcanum Application Layer

Arcanum interfaces with ARCnet through wallet clients and transaction/query surfaces.

Typical components:

- mobile-first UI
- web UI
- wallet integration
- on-chain query & transaction execution
- optional content addressing (IPFS-like) where appropriate
- optional decentralized comms integrations for Nexus

**Rule:** If it does not require public settlement, it does not belong on-chain.

---

## VI. Invariants (Protocol-Bound)

At minimum, ARCnet enforces:

- governance cannot override constitutional invariants
- time-based progression cannot be accelerated through payment
- identity cannot be duplicated
- treasury cannot execute outside governance process

These invariants protect long-term coherence.

---

## VII. Developer Integration (Whitepaper Level)

Developers may build on ARCnet via:

- SDK integration
- REST/gRPC endpoints
- IBC (where enabled)
- identity authentication rails
- MANA payment rails
- governance hooks (proposal + parameter surfaces)

Development tiers:

1) Arcanum-level extension (within the app experience)
2) ARCnet module development (protocol-level; governed)
3) External dApps integrating ARCnet identity/economy

---

## VIII. Security Model (Layered)

Security is composed of:

1) consensus security
2) module-level invariants
3) governance thresholds and time-locks
4) treasury execution constraints
5) client-side permission enforcement

No single layer governs alone.

---

## Conclusion

ARCnet is the sovereign substrate.
Arcanum is a civilization built on it.

The architecture is designed for:

- durable invariants
- phased decentralization
- utility-first economics
- composable development
- non-coercive participation

---

## Further Reading

- `tokenomics.md`
- `governance-constitutional-model.md`
- `roadmap.md`