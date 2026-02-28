---
title: "Arcanum Chain"
status: draft
visibility: public
last_updated: 2026-02-20
description: "The on-chain settlement layer of Arcanum: identity, mana, rites, marketplace primitives, treasuries, and upgrade discipline."
---

# Arcanum Chain

The **Arcanum Chain** is the **settlement layer** of the Arcanum ecosystem: it anchors identity, enforces economic/ritual invariants, routes value, and emits auditable events that other layers can verify.

It is designed to be:

- **Minimal** (only what must be on-chain goes on-chain)
- **Composable** (modules can evolve without rewriting the base)
- **Sovereignty-aligned** (user custody first; no hidden custodianship)
- **Recoverable** (upgrade/rollback discipline during early phases)
- **Auditable** (events are the canonical truth for state transitions)

This document is the whitepaper-facing chain overview. Implementation specifics live in `docs/specs/chain/`.

---

## 1) Why a chain exists in Arcanum

Arcanum is not “a blockchain app” — it is an ecosystem with doctrine, curriculum, and lived practice. The chain exists because a few things benefit from **public settlement**:

- **Identity anchoring** (non-transferable participation identity)
- **Economic enforcement** (Mana issuance, sinks, pricing, receipts)
- **Rite attestations** (proof-of-completion and anti-spam gating)
- **Marketplace routing** (creator revenue splits, tips, purchases)
- **Treasury governance** (multi-sig policy, disbursements, audit trails)

Everything else belongs off-chain: content, private memory, high-volume interaction, and personal development traces.

---

## 2) Network model

Arcanum’s settlement layer targets an **EVM-compatible chain** for developer leverage and wallet interoperability, with deployment on **Polygon (EVM)** as the cost-efficient default for early phases.

Design constraints:

- Low fees for frequent micro-actions (Mana sinks, receipts)
- Broad tooling support (indexers, audits, wallets)
- Upgrade/roll-forward capability during alpha/beta
- Clear migration paths if the system later deploys cross-chain

---

## 3) Core primitives

### 3.1 ChainCode (soul-bound identity)

Each participant mints a **ChainCode** identity:

- **Non-transferable** (soul-bound / non-tradable)
- Used as the anchor for attestations (rites completed, unlocks, permissions)
- Designed to minimize personal data: identity is a *handle*, not a dossier

This identity is the canonical on-chain “who,” without becoming a surveillance identity.

### 3.2 ACC (access credential)

Arcanum also uses an access credential concept (often referenced as **ACC**) to support:

- gating / access control (e.g., early access, eligibility, realms)
- wallet and session linking logic
- staged onboarding experiences

ACC should remain **lightweight** and never become a status hierarchy.

### 3.3 Mana (capacity + value)

**Mana** is the native unit of participation.

Arcanum treats Mana as a single primitive with two inseparable aspects:

- **Capacity:** permission to invoke features and actions
- **Value:** transferable utility recognized by others

Mana is engineered to be *useful first*, with sinks and receipts built into the product’s real behavior (not as an ornamental token).

---

## 4) Contract suite (high-level)

Arcanum’s on-chain system is a small set of contracts that emit canonical events and enforce invariants.

### 4.1 Mana Core

Responsibilities:

- issuance (rites, allocations, purchases via on-ramp flows)
- sinks/burn (feature invocation, unlocks, costs)
- receipts (so clients and indexers can reconstruct “what happened”)

Key principle: **Mana spending should always be legible** (who spent, why, what they received).

### 4.2 Tempest / Rite Registry

Responsibilities:

- registry of rites and their requirements
- proof-of-completion attestations bound to ChainCode
- anti-spam / anti-bot gating hooks (rate limits, cost floors, eligibility rules)

This is where “ritual action” becomes auditable state.

### 4.3 Arcnet Marketplace (posts, listings, tips)

Responsibilities:

- publishing references (content hashes / pointers, not raw content)
- pricing, purchases, unlock receipts
- creator routing (revenue splits to creators and treasuries)
- lightweight social signals where required (e.g., tips)

The chain never stores the content itself — only the **reference** and **economic proof**.

### 4.4 Treasury routing + policy safes

Responsibilities:

- multi-tier treasury routing (protocol/community/grants tiers)
- programmatic distribution to safes
- upgrade and emergency controls during early phases

Treasuries are implemented as multi-sig vaults (e.g., Gnosis Safe-class tooling) with transparent routing and audit trails.

---

## 5) Events as the canonical truth

Arcanum treats **on-chain events** as the primary source of truth for:

- identity state transitions (mint, bind, credential checks)
- Mana movement (mint, spend, burn, transfer)
- rite completion and attestations
- purchase/unlock receipts
- treasury routing actions

Off-chain systems (apps, indexers, caches, analytics) **reconstruct** state from events rather than depending on hidden databases.

This keeps the protocol legible and reduces trust surface area.

---

## 6) Storage and off-chain alignment

Arcanum uses a layered model:

- **On-chain:** hashes, references, receipts, attestations, routing
- **Off-chain:** content, private memory, high-volume interaction
- **Content addressing:** stored in IPFS-style content networks, referenced by hash
- **Peer networking:** libp2p-style channels where appropriate for rooms and presence

A consistent rule:

> If it doesn’t need settlement, it shouldn’t touch the chain.

---

## 7) Privacy posture

Arcanum’s privacy design is “minimum necessary”:

- no raw personal data on-chain
- attestations are anchored to ChainCode, not to real-world identity
- selective disclosure is preferred where proofs are needed
- off-chain traces should remain user-controlled and revocable

Identity is an anchor for coordination — not a mechanism for extraction.

---

## 8) Upgrade, rollback, and stability guardrails

During alpha/beta, Arcanum may use controlled upgrade mechanisms (e.g., proxies where appropriate) with clear rules:

- upgrades are **transparent** and logged
- critical contracts can be protected by **time-locks** and **multi-sig**
- “stability guard” rollback procedures exist for catastrophic faults during early phases

This power is intended to **sunset** at v1.0 (unless extended by explicit governance), so the protocol can converge toward stronger immutability guarantees.

---

## 9) Security model (whitepaper level)

Security is treated as a first-class system property:

- third-party audits before mainnet-scale deployment
- bug bounty program for continuous hardening
- multi-sig controls for treasuries and upgrades
- minimal contract surface area (keep core small, push complexity off-chain)
- clear invariants (what must never happen) expressed as specs and tests

---

## 10) How Arcanum Chain connects to the modules

Arcanum’s modules remain composable and bounded:

- **Hope:** may consume Mana for stateful guidance (costs enforce resource discipline)
- **Vitae:** unlocks, access, and recognition receipts can be settled on-chain while content remains off-chain
- **Tempest:** rite completion and calendar-linked rhythm can emit attestations/events
- **Arcnet:** marketplace and social primitives route value and emit receipts

The chain is not “the app.” It is the **truth layer** the app can rely on.

---

## 11) Where to go next

- Technical architecture overview: `technical-architecture.md`
- Token economics: `tokenomics.md`
- Chain implementation specs (authoritative details):
  - `../specs/chain/arcanum-chain-overview.md`
  - `../specs/chain/invariants.md`
  - `../specs/chain/mana.md`
  - `../specs/chain/tempus-hooks.md`
  - `../specs/chain/treasury.md`
