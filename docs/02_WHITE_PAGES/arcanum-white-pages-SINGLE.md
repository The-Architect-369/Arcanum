<!-- 00-README.md -->

# Arcanum — White Pages (v0.1-draft)
**Date:** 2025-10-26

This repository contains the modular “White Pages” for the **Arcanum**, a self-governing ecosystem tool and sacred digital commons. It is structured for clarity, versioning, and community collaboration.

> **How to use**  
> - Read `01-Executive-Summary.md` first for the big picture.  
> - Each major section lives in its own Markdown file for easy editing.  
> - Governance is designed as a **living appendix** that can be updated independently.  
> - Convert to PDF/Word using tools like Pandoc when ready for distribution.

## Table of Contents
1. [Executive Summary](01-Executive-Summary.md)
2. [Problem & Solution Overview](02-Problem-Solution.md)
3. [Technical Architecture](03-Technical-Architecture.md)
4. [Tokenomics — Mana](04-Tokenomics.md)
5. [Compliance & Risk Posture](05-Compliance-and-Risk.md)
6. [Governance Appendix (Living Doc)](06-Governance-Appendix.md)
7. [Roadmap](07-Roadmap.md)
8. [Glossary](08-Glossary.md)
9. [Changelog](09-Changelog.md)
10. [License & Attribution](10-License-and-Attribution.md)

## Editing & Versioning
- Treat each commit as a **release candidate**. Maintain release notes in `09-Changelog.md`.
- When governance rules change, update **only** `06-Governance-Appendix.md` and bump the appendix sub-version (e.g., `Appendix v0.3`).

## Single-File Build
If you prefer a single-file version, see `arcanum-white-pages-SINGLE.md` (auto-generated concatenation of all sections).


---

<!-- 01-Executive-Summary.md -->

# 1. Executive Summary

**Arcanum** is a self‑governing, decentralized ecosystem designed to restore **authentic human presence** in the digital realm. It weaves spiritual practice, creative expression, and community coordination into a trust‑minimized platform powered by **soul‑bound identity** and a native unit of account, **Mana**.

**Mission.** Create a sacred, user‑owned space where humans grow, create, trade, and govern together—free of centralized surveillance and coercion.

**The Problem.** Online spaces are overrun by bots, misaligned incentives, and extractive platforms. Authentic identity, meaningful contribution, and user sovereignty are diluted by centralized control over data, rules, and revenue.

**The Solution.** Arcanum aligns identity, value, and governance:
- **Soul‑bound identity (SBI / DID):** Each participant anchors a persistent, non‑transferable identity that reflects their journey and reputation.
- **Mana economy:** Users earn Mana through practice and contribution (e.g., **Tempest** rites) or purchase with fiat; they spend Mana to access features (e.g., **Hope**, **Vitae**), post works, create spaces, and reward creators.
- **Modular spiritual‑creative stack:** Core modules—**Hope**, **Tempest**, **Vitae**, and **Arknet**—compose into a gamified yet reverent experience.
- **Community governance:** A living **Governance Appendix** defines principles, processes, and parameters the community updates over time. The architect retains a **time‑limited stability rollback** to revert to a known-good state in early phases.

**Why now.** Advances in decentralized identity, storage, and smart contracts enable human‑centric networks that do not rely on data extraction. Arcanum brings these primitives together for a spiritually coherent, economically sustainable commons.


---

<!-- 02-Problem-Solution.md -->

# 2. Problem & Solution Overview

## 2.1 Problem Statement
1. **Identity dilution & bots.** Anonymous, disposable identities enable spam and erode trust.  
2. **Centralized gatekeeping.** Platforms monetize attention and data; users surrender control and upside.  
3. **Value misalignment.** Creative and spiritual labor is under‑rewarded; healthy participation is not systematically incentivized.  
4. **Fragmented experiences.** Tools for practice, learning, social exchange, and governance live in silos with incompatible incentives.  
5. **Content custodianship risks.** Central operators face legal exposure and censorial pressures that distort community norms.

## 2.2 Solution Overview
**Arcanum** aligns **identity → practice → value → governance**:
- **Soul‑bound identity (DID/SBI):** Persistent, non‑transferable identity records key attestations and progress.  
- **Practice‑to‑earn:** **Tempest** daily rites mint **Mana** as a reward for verified engagement.  
- **Creator economy:** **Arknet** lets creators post rites/works; peers purchase, like (tip), and remix—routing Mana to creators.  
- **Knowledge access:** **Vitae** (a library of magical/transformative texts) is accessible via Mana.  
- **Stateful guidance:** **Hope** provides state/memory updates (fee in Mana) that tailor user experience.  
- **Community governance:** Proposals, voting, and a living rulebook curate the commons without central gatekeepers.

**Outcomes:** Authentic participation, fair rewards, portable reputation, and a resilient, user‑owned network.


---

<!-- 03-Technical-Architecture.md -->

# 3. Technical Architecture

> **Design goals:** user sovereignty, minimal custodianship, composability, security, and graceful recovery.

## 3.1 Layered Overview
- **Identity Layer:** Decentralized Identifiers (DIDs) and **Soul‑Bound Identity** anchoring each participant.  
- **Settlement Layer:** Smart contracts on **Polygon** (EVM) for cost‑efficient execution.  
- **Data Layer:** Content-addressed storage via **IPFS**; peer networking via **libp2p**.  
- **Treasury Layer:** Multi‑tier treasury using **Gnosis Safe** for programmable, multi‑sig control.  
- **Access & UX:** Wallet + passkey onboarding; account recovery flows; fiat on‑ramp for chain code purchases.  
- **Modules:** Hope, Tempest, Vitae, Arknet—composable services with clear on-chain/off-chain boundaries.

## 3.2 Identity & Access
- **DID/SBI:** Each user mints a **chain code** identity (non‑transferable). Attestations (e.g., rites completed) bind to this identity.  
- **Onboarding:** Passkeys (WebAuthn) first; optional wallet linking.  
- **Recovery:** Social or multi‑factor recovery; guardian options configurable by the user.  
- **Privacy:** PII minimized; selective disclosure for attestations; data remains user-controlled.

## 3.3 Contracts & Services
- **Mana Core:** Minting via rites; purchasing via fiat on‑ramp; burning/sinks via feature usage.  
- **Arknet Marketplace:** Post/listing contract; purchase/like (tip) flows; revenue split routing.  
- **Hope Service:** Stateful guidance; writes to memory/state cost Mana.  
- **Vitae Access:** Pay‑per‑view/unlock via Mana; caching with content addressing.  
- **Tempest Engine:** Rite registry; proof-of-completion attestations; anti‑spam/anti‑bot checks.
- **Treasuries:** Tiered Gnosis Safes (e.g., Protocol, Community, Grants). Policy‑driven disbursements.
- **Observability:** On-chain event logs + off-chain analytics with privacy safeguards.

## 3.4 Data & Storage
- **Content:** Stored on IPFS; references pinned by the community/curators.  
- **Metadata:** Minimal on-chain metadata (content hashes, authorship, pricing).  
- **Comms:** libp2p for p2p channels/rooms; moderation signals (votes) written on-chain.

## 3.5 Interop & Payments
- **Wallets:** EVM-compatible wallets; optional custodial wallet for newcomers.  
- **Fiat on‑ramp:** Providers for card/ACH; compliance handled by provider.  
- **Bridges (future):** Optional cross‑chain deployments as demand dictates.

## 3.6 Security & Audits
- **Audits:** Third‑party contract audits prior to mainnet launch.  
- **Bounties:** Ongoing bug bounty program.  
- **Key Management:** Multi‑sig for treasuries; time‑locks on critical upgrades.  
- **Resilience:** Snapshot/rollback procedures for critical failures; see §6 Governance (Stability Guard).

## 3.7 Versioning & Rollback
- **Modular upgrades:** Feature flags and contract proxies where appropriate.  
- **Stability Guard:** Architect may trigger a **rollback to last stable state** during the **alpha/beta** phases. This power is transparently logged and **sunsets** at v1.0 unless extended by community vote.


---

<!-- 04-Tokenomics.md -->

# 4. Tokenomics — Mana

> **Status:** Framework defined; numeric parameters **TBD** (pending cost modeling and Polygon fee assumptions).

## 4.1 Overview
**Mana** is the native utility unit of the Arcanum. It:
- **Rewards** verified participation (practice‑to‑earn via **Tempest** rites).  
- **Prices access** to features (**Hope** updates, **Vitae** knowledge unlocks).  
- **Enables creation & trade** on **Arknet** (posting, room/channel creation, purchases, and likes/tips).  
- **Facilitates P2P exchange** and (future) **NFT marketplace** activity.

## 4.2 Issuance & Supply
- **Earned issuance:** Completing **Tempest** rites mints Mana to the participant. Anti‑bot mechanisms and rate limits apply.  
- **Purchased issuance:** Users may **purchase Mana with fiat** via an on‑ramp; minted 1:1 to buyer.  
- **No free faucets** beyond verified rites.  
- **Supply policy:** Elastic; net supply governed by the balance between **earn** (rites/purchase) and **sinks** (see below). Parameterization subject to governance.

> **TBD Parameters (to fill when costs known):**  
> - Rite reward schedule (base, streaks, caps)  
> - Fiat price banding / oracle source  
> - Anti‑inflation mechanisms (e.g., dynamic sink pricing)  

## 4.3 Sinks & Utility
Users **spend Mana** to:
- Update **Hope** state/memory.  
- **Create/post** rites, images, texts on **Arknet**.  
- **Open** rooms/channels; advanced moderation tools.  
- **Access** **Vitae** texts/collections.  
- **Protocol fees:** Marketplace listing, transfer, and optional creation fees.

## 4.4 Creator Flows (Arknet)
- **Posting cost:** Creator pays a posting cost (sink).  
- **Sales:** Peers purchase a rite/work for a price set by the creator; protocol splits funds per policy.  
- **Likes/Tips:** Micro‑payments route directly to creators (less protocol fee, if any).  
- **Example:** If a rite costs creator **100 Mana** to publish and sells at **10 Mana**,  N purchases = 10N Mana gross to creator (minus fee).

## 4.5 Treasury & Revenue
- **Multi‑tier treasuries:** Protocol, Community, Grants (Gnosis Safe).  
- **Revenue sources:** Portion of posting fees, marketplace fees, and fiat purchase margin (if any).  
- **Allocation policy:** Periodic disbursements to development, audits, grants, and reserves—governed by community voting.  
- **Architect compensation:** Transparent streams from designated treasury per governance policy.

## 4.6 Governance Link
- **Parameters on‑chain:** Reward curves, fees, caps, and treasury splits adjustable via proposals.  
- **Emergency levers:** Temporary throttles on issuance or sinks during incidents; require on‑chain justification and sunset.

## 4.7 Risk Considerations
- **Speculation risk:** Emphasize utility over price.  
- **Security:** Custody remains with users; smart contract risk mitigated via audits/bounties.  
- **Regulatory:** See §5 for treatment of **Mana** as a utility token; consult counsel.

## 4.8 Open Questions / Placeholders
- Target daily issuance per active user: **TBD**  
- Posting/creation base cost: **TBD**  
- Fee split \(creator : protocol : community\): **TBD**  
- Fiat price bands & regional adjustments: **TBD**  


---

<!-- 05-Compliance-and-Risk.md -->

# 5. Compliance & Risk Posture

> **Not legal advice.** This section outlines a design posture for a **user‑owned**, non‑custodial network. Engage qualified counsel before launch and prior to any jurisdictional expansion.

## 5.1 Operating Principles
- **User custodianship:** Arcanum does **not** centrally hold private keys or user funds.  
- **Minimal data retention:** The platform does **not** centrally store user PII or content; content is user‑posted and content‑addressed (e.g., IPFS).  
- **Community moderation:** Users govern content standards and enforcement through the **Governance Appendix** (e.g., voting to dissolve or de‑list rites).  
- **Transparency:** Parameters, fees, and treasury flows are recorded on-chain or published openly.

## 5.2 Content Responsibility
- **User‑generated content (UGC):** Users are responsible for the content they publish.  
- **Platform disclaimer:** Arcanum serves as a decentralized protocol; it does not pre‑screen nor assume liability for UGC.  
- **Takedown via governance:** Community may vote to hide/de‑list content from discovery layers while preserving content‑addressed integrity.

## 5.3 Data Protection & Privacy
- **Data minimization:** Collect only what is necessary for protocol function.  
- **GDPR/CCPA posture:** Favor local processing and user consent; enable data export where applicable.  
- **Selective disclosure:** Use attestations/zk‑friendly approaches for privacy‑preserving proofs where feasible.

## 5.4 Financial & Payments
- **Fiat on‑ramp:** Utilize third‑party providers for KYC/AML where required; Arcanum does not perform custodial fiat services.  
- **Utility positioning:** **Mana** is intended for on‑platform utility, not investment. Avoid representations that could imply profit expectations.  
- **Sanctions & restricted use:** Block interactions from sanctioned regions/services per provider requirements.

## 5.5 Intellectual Property
- **Creator rights:** Creators retain IP to their works unless they opt into open licenses.  
- **Protocol UI/Docs:** Consider permissive licenses (see §10).  
- **Infringement process:** Community moderation plus provider‑required procedures for notices.

## 5.6 Safety & Abuse
- **Prohibited conduct:** Define in Governance Appendix (harassment, illegal content, malware, etc.).  
- **Reporting & redress:** On‑chain/off‑chain reporting channels; documented response timelines.  
- **Minors:** Age‑appropriate access and controls where legally required.

## 5.7 Jurisdictions
- **Progressive rollout:** Start with a limited set of jurisdictions, expand as counsel advises.  
- **Localization:** Reflect local requirements in client UX where applicable.

## 5.8 Disclaimers
> This document is for information only and does not constitute legal, tax, or financial advice. Participation may carry risk, including loss of funds.


---

<!-- 06-Governance-Appendix.md -->

# 6. Governance Appendix (Living Document)

**Status:** v0.1 (subject to community ratification). This appendix is modular and may be updated independently of the main White Pages.

## 6.1 Core Principles (Draft — 10 Commandments)
1. **Human dignity:** Prioritize real humans and respectful conduct.  
2. **Consent & sovereignty:** Users control identity, keys, and data.  
3. **Transparency:** Rules, parameters, and treasury flows are open.  
4. **Fair reward:** Value flows to creators and contributors.  
5. **Non‑violence:** No harassment, threats, or targeted abuse.  
6. **Integrity:** No fraud, impersonation, or manipulation.  
7. **Stewardship:** Protect the commons; minimize spam and noise.  
8. **Privacy by default:** Favor privacy‑preserving designs and choices.  
9. **Pluralism:** Encourage diverse practices within shared bounds.  
10. **Accountability:** Breaches face proportionate, due‑process remedies.

> **Note:** Community may refine these and adopt amendments per §6.5.

## 6.2 Roles
- **Participants:** Post, purchase, vote, and contribute.  
- **Creators:** Publish rites/works; set pricing; earn Mana.  
- **Curators/Moderators:** Signal quality; initiate de‑listing proposals.  
- **Treasury Stewards:** Execute approved disbursements via multi‑sig.  
- **Architect (Stability Guard):** During alpha/beta only, may trigger **rollback** to a last stable state (see §6.8).

## 6.3 Proposals & Voting
- **Proposal types:** Parameter change, treasury allocation, content policy update, module upgrade, amendment.  
- **Lifecycle:** Draft → Temperature check → Formal proposal → Vote → Execution.  
- **Quorum & thresholds:** *TBD* (e.g., quorum 10% of active addresses; simple majority or supermajority by category).  
- **Voting power:** *TBD* (identity‑weighted, participation‑weighted, or mixed; avoid pure token plutocracy).  
- **Snapshot & execution:** Off‑chain snapshot voting with on‑chain execution, or fully on‑chain, as feasible.

## 6.4 Content Curation & Rite Dissolution
- **Signals:** Likes/tips (positive), flags (negative).  
- **Trigger:** If net negative signal crosses **TBD%** of recent viewers within **TBD** days, a de‑listing vote opens.  
- **Outcomes:** Keep (no action), De‑list from discovery, or Return to creator; underlying content hash remains addressable.

## 6.5 Amendments
- **Process:** Amendments to core principles or parameters follow the proposal lifecycle.  
- **Versioning:** Each ratified change increments **Appendix version** and adds to the **Amendment Log**.

## 6.6 Treasury Policy (Outline)
- **Budgets:** Recurring (ops, audits) and discretionary (grants).  
- **Controls:** Multi‑sig, time‑locks, and public reporting.  
- **Audits:** Periodic independent reviews.

## 6.7 Dispute Resolution
- **Mediation first;** escalate to formal vote if unresolved.  
- **Appeals:** Time‑boxed appeal window with higher quorum/supermajority.

## 6.8 Stability Guard (Time‑Limited)
- **Scope:** **Alpha/Beta** phases only, or until **v1.0** unless extended by vote.  
- **Powers:** Initiate **state rollback** to last approved stable snapshot; pause parameters in emergencies.  
- **Transparency:** Every action logged with rationale; automatic community review vote within **TBD** days.  
- **Sunset:** Powers expire unless renewed by supermajority.

## 6.9 Amendment Log (Initial)
- *v0.1* — Initial publication for community review.


---

<!-- 07-Roadmap.md -->

# 7. Roadmap (Indicative)

> **Note:** Dates and scope are placeholders; update as resources and audits clarify.

## Phase 0 — Research & Prototypes (TBD → TBD)
- Identity & rite attestations prototype
- Mana mint/burn model simulation
- Governance draft + community feedback

## Phase 1 — Alpha (Invite‑only) (TBD → TBD)
- Tempest (daily rites) + basic Hope interactions
- Arknet posting & tipping (testnet)
- Treasury setup (Gnosis Safe), fiat on‑ramp integration (sandbox)
- Security review #1

## Phase 2 — Beta (Open) (TBD → TBD)
- Mainnet deployment (Polygon) with rate limits
- Vitae access flows
- Governance voting (snapshot or on‑chain MVP)
- Security audit #2 + bug bounty

## Phase 3 — v1.0 Launch (TBD)
- Marketplace v1 (buy/sell rites)
- Sunsetting Stability Guard (unless voted to extend)
- Regional rollout with legal counsel sign‑off

## Post‑1.0
- Cross‑chain bridges (as needed)
- Advanced privacy (ZK attestations)
- Grants program & creator accelerators


---

<!-- 08-Glossary.md -->

# 8. Glossary

- **Arcanum:** The ecosystem/protocol providing a sacred, user‑owned digital commons.  
- **Mana:** Native utility unit used to reward participation and access features.  
- **Rite:** A unit of practice or creative work (e.g., from **Tempest**), which can be posted, purchased, or curated.  
- **Tempest:** Daily practice engine; verifies completion and mints Mana rewards.  
- **Hope:** Stateful guidance/memory service; updates cost Mana.  
- **Vitae:** Knowledge library; access is priced in Mana.  
- **Arknet:** Social/market layer for posting, rooms/channels, purchases, and tipping. *(Also seen as “Arqnet” in earlier drafts; standardized here as **Arknet**.)*  
- **SBI / Soul‑Bound Identity:** Non‑transferable identity bound to a participant.  
- **DID:** Decentralized Identifier standard used to anchor identity attestations.  
- **Chain code:** The minted identity credential granting access; non‑transferable.  
- **De‑listing:** Removing content from discovery layers while preserving its content addressability.  
- **Stability Guard:** Time‑limited rollback authority held by the architect during early releases.  


---

<!-- 09-Changelog.md -->

# 9. Changelog

- **v0.1-draft — 2025-10-26**
  - Initial modular White Pages published from founder/architect conversations.
  - Added Governance Appendix (v0.1) as a living, versioned document.
  - Tokenomics framework defined with TBD parameters pending cost modeling.


---

<!-- 10-License-and-Attribution.md -->

# 10. License & Attribution

> **Proposal — subject to community approval.**

- **Documentation (this White Pages):** Creative Commons **CC BY 4.0** (attribution required).  
- **Reference code samples (if any):** MIT License.  
- **Creator content on Arknet:** Creator‑owned by default; creators may select alternative licenses per work.

**Attribution:** © The Arcanum community and contributors. Please attribute “Arcanum White Pages” with a link to the canonical repository or release page.


---

