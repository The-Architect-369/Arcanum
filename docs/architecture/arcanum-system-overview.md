---
title: "Arcanum System Overview"
status: canonical
visibility: public
last_updated: 2026-02-20
description: "A high-level map of Arcanum’s layers (site, app, chain, and modules) and how the system fits together."
---

# Arcanum System Overview

![Arcanum System Map](./media/SYSTEM_MAP.png)

Arcanum is a **layered ecosystem** that coordinates identity, action, and value while preserving dignity and sovereignty.

This overview describes the system as four interacting surfaces:

1) **Experience surfaces** (Site + App)  
2) **Modules** (Hope, Tempus, Nexus, Vitae, etc.)  
3) **Settlement** (Arcanum Chain)  
4) **Doctrine + Governance** (constitutional constraints)

If you’re new, start with:
- `docs/overview/arcanum-system-overview.md` (this document)
- `docs/whitepaper/executive-summary.md`
- `docs/whitepaper/technical-architecture.md`

---

## 1) System at a glance

### Experience surfaces
- **Site**: the threshold surface (discovery, onboarding, minting, downloads)
- **App**: the daily-use surface (modules, social, rites, wallet, economy)

### Settlement
- **Arcanum Chain**: minimal on-chain truth for identity anchoring, receipts, routing, and invariant enforcement

### Doctrine & constraints
- **Governance / Constitution**: defines what the system may do and must never do
- **Dignity boundaries**: prevents coercion, worth-scoring, surveillance drift, and status extraction

---

## 2) Repos and directories (implementation-facing)

This is a conceptual repo shape (the codebase may vary, but the separation of concerns is stable):

arcanum/
├─ apps/
│ ├─ site/ # Threshold surface (landing, mint, downloads, onboarding)
│ └─ web/ # App surface (modules, wallet UX, social, rites)
├─ contracts/ # Chain settlement layer (identity, mana, treasury routing)
├─ shared/ # Shared design tokens + common utilities
├─ docs/ # Canonical doctrine, architecture, specs, whitepaper, vitae
└─ archive/ # Deprecated artifacts (non-canonical unless referenced)


Docs are the canonical explanation layer; specs and contracts implement what docs constrain.

---

## 3) The two user-facing realms

### 3.1 Site — the threshold surface

**Purpose:** discovery → consent → identity anchoring → entry

Typical functions:
- explain the system and the posture (sovereignty, dignity, non-coercion)
- connect a wallet and mint / verify identity (ChainCode)
- route the user to the App experience (web or installable)
- provide downloads and distribution links

The Site should stay lightweight: it is a **threshold**, not the whole temple.

### 3.2 App — the daily-use surface

**Purpose:** the lived interface for the modules.

The App is where:
- actions occur (rites, posts, messaging, planning, learning)
- Mana is spent and earned through meaningful behaviors
- receipts are generated for verifiable transitions (unlock, completion, purchase)
- the user’s experience stays primarily **off-chain** (private, fast, human)

The App is not “the chain UI.” It is the human surface over layered truth.

---

## 4) The modules (system capabilities)

Arcanum is organized into modules with explicit boundaries. At the whitepaper level, you can treat these as “major organs” of the ecosystem.

### Hope
A companion layer for guidance and onboarding, including personalization and coherence support.

### Tempus
Time and rhythm: rites, calendars, cadence, scheduling, seasonal structures, and event discipline.

### Nexus
Social and publication primitives: posts, channels, feeds, and value routing for creators—without turning the user into content inventory.

### Vitae
The recognition layer: becoming named after stabilization, without coercion, surveillance, or worth-scoring. (Grades, paths, mastery.)

### Identity
Wallet-bound, consent-respecting identity anchoring (ChainCode / credentials) designed to minimize data leakage and prevent status capture.

### Economy + Treasury
Mana issuance/sinks/receipts, value routing, and transparent treasury policy surfaces.

### Wallet
User custody and transaction surfaces (connect, sign, pay, receive, receipts).

> Implementation detail: each module should have a corresponding spec under `docs/specs/modules/` and (where needed) chain specs under `docs/specs/chain/`.

---

## 5) The Arcanum Chain (settlement layer)

Arcanum Chain exists to do **only what benefits from public settlement**:

- identity anchoring (ChainCode / participation identity)
- Mana movement (mint, spend, burn, transfer) with legible receipts
- rite completion / unlock receipts (where auditability matters)
- marketplace routing (purchases, revenue splits, treasury flows)
- transparent governance + treasury actions

**Rule of thumb:**  
If it doesn’t need settlement, it shouldn’t touch the chain.

See: `docs/whitepaper/arcanum-chain.md` and `docs/specs/chain/`.

---

## 6) Data, storage, and privacy posture

Arcanum uses layered storage:

- **On-chain:** hashes, references, receipts, attestations, routing
- **Off-chain:** content, private history, high-volume interaction
- **Content addressing:** content is referenced by hash/pointer; the chain stores proofs, not payloads

Privacy posture:
- no raw personal data on-chain
- identity is an anchor, not a dossier
- logs are technical truth, not human worth
- “silence is valid”: non-participation remains dignified

---

## 7) Lifecycle: a typical user journey

A typical flow looks like:

1) Discover Arcanum on the Site  
2) Connect wallet + accept posture (dignity / sovereignty / boundaries)  
3) Mint / verify ChainCode identity (where required)  
4) Enter the App surface  
5) Hope guides onboarding + first rituals  
6) Tempus establishes rhythm (calendar/rites)  
7) Nexus enables participation and value routing  
8) Mana economy becomes legible via receipts and sinks  
9) Vitae names maturation after stabilization (grades/paths/mastery)

---

## 8) Governance and doctrine alignment

Arcanum is designed to prevent predictable drift:

- leaderboards → coercion
- scoring → worth hierarchy
- logging → surveillance identity
- credentials → gatekeeping dignity

Governance constrains the system so the implementation cannot “accidentally” become an extraction machine.

Key doctrine surfaces:
- `docs/governance/constitution/` (canonical constraints and repo discipline)
- `docs/whitepaper/dignity-content-boundaries.md` (content + coercion boundaries)
- `docs/whitepaper/governance-neutrality.md` (neutrality posture)

---

## 9) Where to go next

**Whitepaper path**
- `../whitepaper/executive-summary.md`
- `../whitepaper/problem-solution.md`
- `../whitepaper/technical-architecture.md`
- `../whitepaper/arcanum-chain.md`
- `../whitepaper/tokenomics.md`
- `../whitepaper/vitae-and-becoming.md`

**Specs path**
- `../specs/modules/` (Hope, Tempus, Identity, Economy, Nexus, Treasury, Vitae, Wallet)
- `../specs/chain/` (chain overview, invariants, mana, hooks, treasury)

**Vitae path**
- `../vitae/index.md`
- `../vitae/overview.md`
- `../vitae/constitution/`
- `../vitae/curriculum/`

---

## 10) Visual map

![Arcanum System Map](./SYSTEM_MAP.svg)

See `SYSTEM_MAP.svg` / `media/SYSTEM_MAP.png` for the diagram used in this overview.