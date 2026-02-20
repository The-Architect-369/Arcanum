---
title: "App · Chain · Doctrine"
status: canonical
visibility: public
last_updated: 2026-02-20
description: "Layer boundaries and interfaces between the App surface, the Arcanum Chain settlement layer, and Doctrine/Governance constraints."
---

# App · Chain · Doctrine

Arcanum is a layered system. Its durability depends on **keeping layers distinct** while allowing them to interoperate through narrow, auditable interfaces.

This document defines the **boundary contract** between:

- **App** — the lived human surface (fast, private, high-context)
- **Chain** — the settlement surface (slow, public, minimal, factual)
- **Doctrine** — the constraint surface (canonical invariants; what must never drift)

If any one of these begins to behave like the other, the system becomes unstable:
- the App becomes coercive (gamified compliance),
- the Chain becomes semantic (worth/progress encoded on-chain),
- doctrine becomes decorative (ignored by implementation).

---

## 1) The three layers (purpose and failure modes)

### 1.1 App layer (experience + meaning)

**Purpose**
- Human experience: reflection, rites, planning, learning, relationship, creation
- High-context meaning (language, narrative, nuance)
- Private state and user-owned history

**What belongs here**
- content bodies and media
- conversations, drafts, notes
- recommendation and navigation (non-extractive)
- session logic and UX
- private analytics (minimal, local-first where possible)

**Failure modes**
- turns into an attention economy (streaks, feeds, domination mechanics)
- uses economy as pressure loops
- treats Vitae as ranking
- leaks private data into chain receipts

---

### 1.2 Chain layer (settlement + receipts)

**Purpose**
- Minimal public truth: identity anchoring, value routing, receipts
- Auditability: events that can reconstruct “what happened”
- Invariant enforcement where settlement is required

**What belongs here**
- identity anchoring (ChainCode / participation identity)
- Mana movement (mint/spend/burn/transfer) with receipts
- rite completion attestations (only as factual receipts)
- purchases/unlocks (market receipts)
- treasury routing and governance actions

**Failure modes**
- stores meaning or content payloads
- encodes progress/worth or curriculum states
- becomes a surveillance ledger
- becomes irreversible too early (no replaceability in Genesis phases)

---

### 1.3 Doctrine layer (constraints + legitimacy)

**Purpose**
- Defines what is allowed
- Defines “forbidden moves”
- Protects dignity and sovereignty from drift

**What belongs here**
- dignity boundaries (anti-coercion, anti-worth scoring, anti-surveillance)
- neutrality and governance constraints
- module boundaries and interfaces
- repo discipline (canon vs draft vs legacy)
- amendment procedures and checksum discipline

**Failure modes**
- doctrine exists but cannot constrain implementation (no gates)
- doctrine becomes factional or ideological enforcement
- “principles” are vague and non-testable

---

## 2) The boundary contract (hard rules)

### Rule A — Meaning must not be settled
The chain must remain **meaning-blind**.

- On-chain receipts may state *facts* (“X completed rite Y at time T”).
- Receipts must never state *interpretations* (“X is virtuous,” “X advanced,” “X is better”).

### Rule B — Doctrine must be enforceable
If doctrine cannot be translated into checks, it is not complete.

Every constitutional invariant must have at least one of:
- a spec-level testable statement,
- a CI guard,
- an explicit “not enforceable yet” label with a plan.

### Rule C — App must remain optional
The App may invite participation, but it may not compel.

- no streak punishment
- no FOMO locks
- no “pay to keep pace”
- silence must remain valid

### Rule D — The chain is a narrow throat
Only transactions that require settlement go on-chain.

Everything else is:
- off-chain,
- content-addressed,
- user-owned where possible,
- reconstructable from receipts.

### Rule E — Vitae is never a status economy
Vitae recognition must remain:
- stability-first,
- non-coercive,
- non-monetized,
- non-accelerable by payment.

---

## 3) Interfaces (what flows between layers)

### 3.1 Doctrine → App
Doctrine provides:
- posture constraints (dignity, neutrality)
- interface boundaries (what may be measured, shown, gated)
- forbidden UX patterns (coercion mechanics)

**App must implement doctrine as UX constraints**, not just disclaimers.

---

### 3.2 Doctrine → Chain
Doctrine provides:
- what can be settled
- what must never be settled
- upgrade discipline (replaceability in Genesis)
- treasury constraints (anti-capture)

Chain specs must be **derivable** from doctrine without reinterpretation.

---

### 3.3 App → Chain
App may request chain actions for:

- identity anchoring (mint / bind / verify)
- spending Mana (feature invocation, unlocks, purchases)
- recording factual receipts (rite completion)
- treasury routing (where user-initiated or governance-authorized)

**The App must not:**
- write semantic labels to chain (“rank,” “score,” “worthiness”)
- emit private content into calldata/events
- require chain transactions for basic human participation

---

### 3.4 Chain → App
Chain returns:

- receipts (events) that the App can use to reconstruct truth
- proofs needed for access (ownership, completion, entitlement)

The App may render these receipts meaningfully, but must not claim the chain *means* something it doesn’t.

---

### 3.5 App ↔ Doctrine feedback loop
Doctrine can evolve, but only via:

- explicit amendment procedure
- checksum/log discipline
- clear labeling of draft vs canonical

The App must never silently “update doctrine” by behavior.

---

## 4) State ownership and storage policy

### 4.1 Content
- Content bodies live off-chain (db / content network)
- Chain stores only hashes/pointers + receipts where required

### 4.2 Identity
- Chain identity is a minimal anchor
- App identity is a richer user context (pseudonymous, consent-based)
- Real-world identity must not be required for core participation

### 4.3 Logs / telemetry
- Prefer local-first, aggregated, and opt-in
- Telemetry must never become a dossier
- Event logs should support reliability, not surveillance

---

## 5) Doctrine gates (how doctrine actually constrains code)

To prevent drift, doctrine must be wired into tooling:

- **CI checks** verify:
  - canonical file paths and naming
  - checksum integrity for constitutional artifacts
  - no “forbidden terms” in on-chain event schemas (e.g., score/rank)
- **Spec traceability**:
  - each chain event maps to a spec line and a doctrine permission
- **Release gating**:
  - phase advancement requires doctrine guard pass

---

## 6) Economic boundary rules (Mana)

Mana is a capacity/value primitive, but it must not become coercive.

Allowed:
- spending Mana to invoke optional features
- sinks tied to real utility
- receipts for spends and unlocks

Forbidden:
- paying to accelerate time-based progression
- paying to bypass Vitae
- paying to force access to social status
- “subscription pressure” that locks dignity behind payment

---

## 7) Vitae boundary rules (becoming)

Vitae is the recognition layer. It is the most drift-prone system in the stack.

Allowed:
- retrospective recognition after stabilization
- grades as responsibility envelopes
- mastery paths as differentiated load-bearing roles

Forbidden:
- leaderboards
- public comparative rankings
- monetized recognition
- time-acceleration through payment
- coercion through fear of regression

The chain may store **receipts**; it may not store **judgements**.

---

## 8) Upgrade and replaceability discipline

During Genesis phases:

- Chain components must remain replaceable
- Upgrade mechanisms must be transparent and auditable
- Emergency rollback procedures must exist

After stabilization:

- immutability can increase gradually
- governance can take over parameters
- emergency powers must sunset or become constitutionally bounded

---

## 9) Implementation checklist (practical boundary tests)

Use these questions as boundary tests:

- **Does this feature require settlement?**
  - If no, keep it off-chain.
- **Does this event encode meaning?**
  - If yes, redesign it.
- **Does this UX create pressure loops?**
  - If yes, remove or soften until silence is valid.
- **Can payment accelerate progression?**
  - If yes, it violates doctrine.
- **Can we audit truth from receipts without storing content?**
  - If no, receipts are poorly designed.
- **Can a user participate without being tracked?**
  - If no, privacy posture is broken.

---

## 10) Related docs

- System overview: `../overview/arcanum-system-overview.md`
- Canonical module boundaries: `../governance/constitution/layer-boundaries.md`
- Governance neutrality: `../whitepaper/governance-neutrality.md`
- Dignity boundaries: `../whitepaper/dignity-content-boundaries.md`
- Chain overview: `../whitepaper/arcanum-chain.md`
- Chain specs: `../specs/chain/`
- Module specs: `../specs/modules/`
