\---

title: "ARCnet (Arcanum Chain)"

status: draft

visibility: public

last\_updated: 2026-03-13

description: "ARCnet is the settlement layer of Arcanum: identity anchoring, MANA economy, receipts, treasury, governance, and upgrade discipline."

\---



\# ARCnet (Arcanum Chain)



\*\*ARCnet\*\* is the \*\*settlement layer\*\* of the Arcanum ecosystem: it anchors identity, enforces bounded economic invariants, routes value, and emits auditable receipts that other layers can verify.



It is designed to be:



\- \*\*Minimal\*\* (only what must be settled goes on-chain)

\- \*\*Composable\*\* (modules evolve without rewriting the base)

\- \*\*Sovereignty-aligned\*\* (user custody first; no hidden custodianship)

\- \*\*Recoverable\*\* (upgrade/rollback discipline during early phases)

\- \*\*Auditable\*\* (events/receipts are canonical truth for state transitions)



This document is the architecture-facing chain overview. Implementation specifics should live in `docs/specs/chain/` when present.



\---



\## 1) Why a chain exists in Arcanum



Arcanum is not “a blockchain app.” It is a layered ecosystem with doctrine, lived practice, and bounded modules. The chain exists because a few things benefit from \*\*public settlement\*\*:



\- \*\*Identity anchoring\*\* (non-transferable participation identity)

\- \*\*Economic enforcement\*\* (MANA issuance, sinks, pricing, receipts)

\- \*\*Rite attestations\*\* (proof-of-completion and anti-spam gating; factual only)

\- \*\*Value routing\*\* (purchases, revenue splits, treasury flows)

\- \*\*Governance + treasury actions\*\* (transparent decisions and execution)



Everything else belongs off-chain: content, private memory, high-volume interaction, personal development traces.



\---



\## 2) Network model (canonical posture)



ARCnet is designed as a sovereign chain built on a modular stack:



\- \*\*Cosmos SDK\*\* (module architecture)

\- \*\*CometBFT\*\* (consensus)

\- Optional \*\*IBC\*\* interoperability (deliberate, governance-approved)



ARCnet is intended to be an independent settlement layer so that invariants and governance constraints are enforceable at protocol level.



> Interoperability with EVM ecosystems, if pursued, should be implemented as a governed bridge boundary — not as an architectural dependency.



\---



\## 3) Core primitives



\### 3.1 Identity anchor (ACC / ChainCode)

Each participant may mint or bind a minimal identity anchor:



\- \*\*Non-transferable\*\*

\- Minimal data footprint (anchor, not dossier)

\- Used for receipts and eligibility checks (bounded)



The identity anchor is the canonical on-chain “who,” without becoming a surveillance identity.



\### 3.2 MANA (capacity + value)

\*\*MANA\*\* is ARCnet’s utility token.



It is treated as a single primitive with two inseparable aspects:



\- \*\*Capacity:\*\* permission to invoke actions and access utilities

\- \*\*Value:\*\* transferable utility recognized by others



MANA is engineered to be \*useful first\*, with sinks and receipts tied to real behavior.



\### 3.3 Receipts (events as canonical truth)

ARCnet treats \*\*receipts\*\* as canonical truth for:



\- identity state transitions (mint/bind/credential checks)

\- MANA movement (mint, spend, burn, transfer)

\- rite completion attestations (factual)

\- purchase/unlock receipts

\- treasury routing actions

\- governance actions



Off-chain systems reconstruct truth from receipts rather than from hidden databases.



\---



\## 4) Module suite (high level)



ARCnet’s settlement layer is best described as protocol modules (not “app contracts”):



\### 4.1 Identity module

Responsibilities:

\- define identity anchor lifecycle (mint/bind/revoke where allowed)

\- enforce non-transferability constraints

\- provide eligibility proofs without exposing private data



\### 4.2 Economy (MANA) module

Responsibilities:

\- issuance parameters (bounded by governance)

\- sinks/burn mechanisms (utility-bound)

\- transfer rules

\- legible receipts



Key principle: \*\*MANA spending must always be legible\*\* (who spent, why, what they received).



\### 4.3 Tempus anchors / rite attestations module (bounded)

Responsibilities:

\- registry of rite types (if used)

\- factual completion attestations bound to identity anchors

\- anti-spam / anti-bot gating hooks (rate limits, cost floors, eligibility rules)



Important: attestations are facts (“completed”), not judgements (“improved,” “advanced,” “worthy”).



\### 4.4 Routing module (market + treasury flows)

Responsibilities:

\- purchases/unlocks and revenue split receipts

\- treasury routing lanes (burn/treasury/grants if adopted)

\- verifiable distribution without off-chain discretion



\### 4.5 Treasury module

Responsibilities:

\- custody and execution constraints

\- governance-approved disbursements

\- auditable flows

\- time-lock execution where applicable



Early phases may use multi-sig custody; mature phases should converge toward protocol-native execution.



\### 4.6 Governance module

Responsibilities:

\- proposals and voting

\- parameter changes within bounds

\- upgrade coordination

\- treasury approvals



Governance is constitutional before it is democratic.



\---



\## 5) Storage and off-chain alignment



ARCnet uses layered storage:



\- \*\*On-chain:\*\* hashes, references, receipts, attestations, routing

\- \*\*Off-chain:\*\* content, private memory, high-volume interaction

\- \*\*Content addressing:\*\* content is referenced by hash/pointer; chain stores proofs, not payloads



Rule:

> If it doesn’t need settlement, it shouldn’t touch the chain.



\---



\## 6) Privacy posture



ARCnet’s privacy design is “minimum necessary”:



\- no raw personal data on-chain

\- identity anchor is minimal and consent-respecting

\- off-chain traces should remain user-controlled and revocable

\- logs are technical truth, not human worth



\---



\## 7) Upgrade, rollback, and stability guardrails



During early phases, ARCnet must remain recoverable:



\- upgrades are transparent and logged

\- critical operations are bounded (time-locks, thresholds)

\- emergency rollback procedures exist for catastrophic faults



This posture is intended to \*\*sunset\*\* as the system stabilizes, converging toward stronger immutability guarantees.



\---



\## 8) Security model (architecture level)



Security is first-class:



\- audits before mainnet-scale deployment

\- bug bounty program where appropriate

\- minimal settlement surface (keep core small)

\- invariants expressed as specs and tests

\- clear governance constraints on upgrades and treasury actions



\---



\## 9) How ARCnet connects to modules



\- \*\*Hope:\*\* may invoke optional paid utilities; must not write semantic judgements to chain

\- \*\*Tempus:\*\* may emit factual receipts for bounded actions

\- \*\*Nexus:\*\* may route value and reference content; content remains off-chain

\- \*\*Vitae:\*\* may anchor limited proof receipts; never encode judgements or worth

\- \*\*Wallet:\*\* renders chain truth; never defines it



The chain is not “the app.” It is the truth layer the app can rely on.



\---



\## 10) Where to go next



\- Boundary contract: `./app-chain-doctrine.md`

\- Canonical modules: `./canonical-modules.md`

\- Whitepaper technical architecture: `../whitepaper/technical-architecture.md`

\- Tokenomics: `../whitepaper/tokenomics.md`

\- Governance model: `../whitepaper/governance-constitutional-model.md`

\- Governance mechanics: `../governance/governance-specification.md`

\- Treasury constitution: `../governance/treasury-constitution.md`

