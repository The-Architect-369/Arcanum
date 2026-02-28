---
title: "Technical Architecture"
status: draft
visibility: public
last_updated: 2026-02-25
description: "ARCnet blockchain architecture and Arcanum application stack"
---

# Technical Architecture

## I. Overview

The Arcanum ecosystem consists of two primary layers:

1. **ARCnet** — Sovereign blockchain infrastructure (Cosmos SDK–based)
2. **The Arcanum Application** — Modular client and coordination layer built atop ARCnet

ARCnet provides settlement, identity anchoring, token economics, treasury management, and governance enforcement.

The Arcanum application provides user interaction, experience orchestration, and module composition.

The architecture is vertically integrated but logically separated.

---

# II. ARCnet — Sovereign Blockchain Layer

## 1. Base Stack

ARCnet is built using:

- **Cosmos SDK**
- **Tendermint / CometBFT consensus**
- **IBC (Inter-Blockchain Communication) compatibility**
- Modular on-chain architecture

It is an independent Layer-1 chain, not a token deployed on another network.

This ensures:

- Sovereign parameter control
- Validator-defined consensus
- Custom module enforcement
- Constitutional invariants at protocol level

---

## 2. Core Modules

ARCnet contains the following native modules:

---

### A. Identity Module (ACC)

The ACC (Arcanum Chain Code) module provides:

- Native identity anchoring
- Persistent participation history
- Governance weighting inputs
- Cross-module identity binding

Unlike simple wallet-based systems, ACC binds:

- Time-in-system
- Participation metrics
- Governance eligibility
- Economic history

Identity is not merely cryptographic custody.
It is longitudinal participation state.

---

### B. MANA Module

The MANA module defines:

- Token mint parameters
- Burn logic
- Distribution controls
- Transfer mechanics
- Permission hooks

MANA is a utility token used for:

- Access gating
- Infrastructure usage
- Governance weighting
- Developer module integration

Minting parameters are controlled at protocol level and governed constitutionally.

---

### C. Treasury Module

The Treasury module provides:

- On-chain reserve management
- Governance-approved allocation
- Protocol funding
- Validator incentive management

Treasury actions require:

- Governance authorization
- Constitutional compliance
- Defined execution rules

Treasury funds cannot be arbitrarily extracted.

---

### D. Governance Module

Governance supports:

- Proposal submission
- Parameter modification
- Treasury allocation
- Module updates

Governance weight is influenced by:

- Identity longevity
- Participation metrics
- Token stake
- Vitae progression (application-level signal)

Certain invariants are non-overridable.

---

### E. Chaincode / Module Framework

ARCnet supports extensibility via:

- Custom module injection
- Parameterized execution logic
- Developer integration hooks

This allows:

- Native dApps
- Infrastructure-level extensions
- Permission-based deployment
- Future module evolution

ARCnet is designed as a programmable sovereign substrate.

---

# III. Consensus & Validators

ARCnet operates via:

- Validator set governance
- Delegated staking
- Byzantine Fault Tolerant consensus (CometBFT)

Validator characteristics:

- Staked MANA participation
- Governance accountability
- Slashing for misbehavior
- Transparent operation

Genesis phase may begin with limited validator distribution.
Long-term design targets decentralization with constitutional safeguards.

---

# IV. Interoperability

ARCnet supports:

- IBC connections to Cosmos ecosystem
- External asset bridging (governance-approved)
- Identity authentication APIs
- SDK-level developer integration

Interoperability is optional, not mandatory.

ARCnet is sovereign first, interoperable second.

---

# V. The Arcanum Application Layer

The Arcanum application is a modular client system that interfaces with ARCnet.

It includes:

- Mobile-first UI
- Web interface
- Wallet integration
- On-chain query & transaction execution
- IPFS-compatible storage for selective modules
- Matrix or decentralized communication integrations (Nexus layer)

The application is replaceable.
The chain is not.

---

## Core Application Modules

### 1. Hope

Reflection interface:

- Structured input schema
- Optional persistence
- On-chain or IPFS anchoring
- Identity-bound interaction

Hope does not enforce engagement metrics.
It enforces structured reflection.

---

### 2. Tempus

Time coordination module:

- Planetary, lunar, and cadence logic (off-chain computation)
- Time-window gating
- Reward cadence enforcement
- Participation pacing

Tempus influences reward distribution and permission windows.

Time becomes a protocol variable.

---

### 3. Vitae

Structured progression system:

- Grade architecture
- Dependency enforcement
- Event schema logging
- Advancement gating

Vitae progression influences governance weight and permissions but does not override protocol invariants.

---

### 4. Nexus

Sovereign communication layer:

- Identity-bound interaction
- Optional persistence
- Moderation governed by constitutional boundaries
- No algorithmic engagement amplification

Nexus is not an engagement engine.
It is a coordination layer.

---

### 5. Wallet

Wallet module supports:

- MANA balance management
- Governance participation
- Staking
- Treasury interaction
- Developer integration permissions

Wallet integrates with ARCnet via Cosmos-compatible clients.

---

# VI. Invariants

Certain rules are enforced at protocol level:

- Governance cannot override constitutional invariants.
- Time-based progression cannot be accelerated through payment.
- Identity cannot be duplicated.
- Mint parameters require governance thresholds.
- Treasury cannot bypass governance process.

These invariants protect long-term system integrity.

---

# VII. Developer Architecture

Developers may interact with ARCnet through:

- SDK integration
- REST / gRPC endpoints
- IBC channels
- Identity authentication hooks
- MANA payment rails
- Governance proposal systems

Development tiers:

1. Application-level extension (within Arcanum)
2. Native module deployment (protocol-level)
3. External dApp integration (IBC or SDK)

ARCnet is designed to support both consumer and infrastructure development.

---

# VIII. Security Model

Security is layered:

1. Consensus security (CometBFT)
2. Module-level invariant enforcement
3. Governance threshold constraints
4. Treasury execution validation
5. Client-side permission verification

No single layer governs alone.

---

# IX. Architectural Philosophy

ARCnet is designed to:

- Minimize dependency
- Maximize clarity
- Enforce invariants
- Bind authority to participation
- Scale modularly

The Arcanum application demonstrates one civilization built on this substrate.

The architecture supports more.

---

## Conclusion

The Arcanum ecosystem is not a single dApp.

It is:

- A sovereign Cosmos-based chain (ARCnet)
- A modular application civilization (The Arcanum)
- A utility token economy (MANA)
- A constitutional governance framework
- A developer-ready infrastructure layer

Infrastructure defines possibility.
Modules define expression.
Participation defines authority.