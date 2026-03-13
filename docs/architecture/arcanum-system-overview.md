\---

title: "Arcanum System Overview"

status: canonical

visibility: public

last\_updated: 2026-03-13

description: "A high-level map of Arcanum’s layers (site, app, ARCnet settlement, and modules) and how the system fits together."

\---



\# Arcanum System Overview



Arcanum is a \*\*layered ecosystem\*\* that coordinates identity, action, and value while preserving dignity and sovereignty.



This overview describes the system as four interacting surfaces:



1\) \*\*Experience surfaces\*\* (Site + App)  

2\) \*\*Modules\*\* (Hope, Tempus, Nexus, Vitae, etc.)  

3\) \*\*Settlement\*\* (ARCnet — the Arcanum Chain)  

4\) \*\*Doctrine + Governance\*\* (constitutional constraints)



> Note: A visual system map can live at `docs/architecture/media/system-map.png` if you choose to add it later. This document includes a Mermaid map so it renders cleanly even without assets.



```mermaid

flowchart TB

&#x20; subgraph Experience\["Experience Surfaces"]

&#x20;   Site\["Site (Threshold)"]

&#x20;   App\["App (Daily Use)"]

&#x20; end



&#x20; subgraph Modules\["Modules (bounded subsystems)"]

&#x20;   Hope\["Hope"]

&#x20;   Tempus\["Tempus"]

&#x20;   Vitae\["Vitae"]

&#x20;   Nexus\["Nexus"]

&#x20;   Identity\["Identity"]

&#x20;   Wallet\["Wallet"]

&#x20;   Economy\["Economy (MANA)"]

&#x20;   Treasury\["Treasury"]

&#x20; end



&#x20; subgraph Settlement\["Settlement Layer"]

&#x20;   ARCnet\["ARCnet (Arcanum Chain)"]

&#x20; end



&#x20; subgraph Constraint\["Constraint Layer"]

&#x20;   Doctrine\["Doctrine"]

&#x20;   Governance\["Governance"]

&#x20;   Compliance\["Compliance + Dignity Boundaries"]

&#x20; end



&#x20; Site --> App

&#x20; App --> Modules

&#x20; Modules --> ARCnet

&#x20; Doctrine --> App

&#x20; Doctrine --> ARCnet

&#x20; Governance --> ARCnet

&#x20; Compliance --> App

&#x20; Compliance --> ARCnet



If you’re new, start with:



docs/index.md



docs/whitepaper/executive-summary.md



docs/whitepaper/technical-architecture.md



docs/architecture/app-chain-doctrine.md (boundary contract)



1\) System at a glance

Experience surfaces



Site: the threshold surface (discovery, onboarding, consent, downloads)



App: the daily-use surface (modules, rites, social, wallet, economy)



Settlement



ARCnet (Arcanum Chain): minimal on-chain truth for identity anchoring, receipts, routing, and invariant enforcement



Doctrine \& constraints



Doctrine: defines what the system may do and must never do



Governance: defines how changes occur (bounded)



Dignity boundaries: prevents coercion, worth-scoring, surveillance drift, and status extraction



2\) Repo and directory shape (implementation-facing)



This is a conceptual shape. The exact code layout may vary, but the separation of concerns is stable:



apps/ — experience surfaces (site/app clients)



chain/ or arcnet/ — protocol implementation (Cosmos SDK modules, specs, upgrades)



docs/ — canonical doctrine, architecture, governance, compliance, whitepaper, vitae



scripts/ — integrity tooling (repo index, doctrine guards, verification)



archive/ — deprecated artifacts (explicitly non-canonical unless referenced)



Docs constrain; code implements.



3\) The two user-facing realms

3.1 Site — the threshold surface



Purpose: discovery → consent → identity anchoring (when required) → entry



Typical functions:



explain the posture (sovereignty, dignity, non-coercion)



connect a wallet and perform initial identity anchoring (if required)



route the user to the App experience



provide downloads and distribution links



The Site should stay lightweight: it is a threshold, not the whole system.



3.2 App — the daily-use surface



Purpose: the lived interface for modules.



The App is where:



actions occur (rites, reflection, posts, planning, learning)



MANA is spent (optional capacity) and earned (bounded distribution)



receipts are generated for verifiable transitions (unlock, completion, purchase)



the user’s experience stays primarily off-chain (private, fast, human)



The App is not “the chain UI.” It is the human surface over layered truth.



4\) The modules (system capabilities)



Arcanum is organized into modules with explicit boundaries.



Hope



Reflection interface and coherence support. Advisory; never sovereign.



Tempus



Time and rhythm: rites, calendars, cadence, scheduling, seasonal discipline.



Nexus



Social and publication primitives without virality mechanics.



Vitae



Recognition after stabilization: grades, paths, mastery — without coercion, surveillance, or worth-scoring.



Identity



Consent-respecting continuity anchoring (ACC / ChainCode) designed to minimize leakage and prevent status capture.



Economy + Treasury



MANA issuance/sinks/receipts, value routing, and transparent treasury stewardship.



Wallet



User custody and transaction surfaces (connect, sign, pay, receive, receipts).



5\) ARCnet (settlement layer)



ARCnet exists to do only what benefits from public settlement:



identity anchoring (ACC / ChainCode)



MANA movement (mint, spend, burn, transfer) with legible receipts



rite completion / unlock receipts (where auditability matters)



routing (purchases, revenue splits, treasury flows)



governance and treasury actions



Rule of thumb: if it doesn’t need settlement, it shouldn’t touch the chain.



See: docs/architecture/arcanum-chain.md



6\) Data, storage, and privacy posture



Arcanum uses layered storage:



On-chain: hashes, references, receipts, attestations, routing



Off-chain: content, private history, high-volume interaction



Content addressing: content is referenced by hash/pointer; the chain stores proofs, not payloads



Privacy posture:



no raw personal data on-chain



identity is an anchor, not a dossier



logs are technical truth, not human worth



“silence is valid”: non-participation remains dignified



7\) Lifecycle: a typical user journey



Discover Arcanum on the Site



Connect wallet + accept posture (dignity / sovereignty / boundaries)



Mint / verify identity anchor (where required)



Enter the App



Hope guides onboarding + first rites



Tempus establishes rhythm (calendar/rites)



Nexus enables participation and value routing



MANA economy becomes legible via receipts and sinks



Vitae names maturation after stabilization (grades/paths/mastery)



8\) Governance and doctrine alignment



Arcanum is designed to prevent predictable drift:



leaderboards → coercion



scoring → worth hierarchy



logging → surveillance identity



credentials → gatekeeping dignity



Key constraint surfaces:



Doctrine: docs/doctrine/layer-boundaries.md



Neutrality: docs/doctrine/metaphysical-neutrality.md



Governance mechanics: docs/governance/governance-specification.md



Dignity boundaries: docs/compliance/dignity-content-boundaries.md



9\) Where to go next



Whitepaper path



../whitepaper/executive-summary.md



../whitepaper/problem-solution.md



../whitepaper/technical-architecture.md



../whitepaper/tokenomics.md



../whitepaper/governance-constitutional-model.md



../whitepaper/roadmap.md



Architecture path



./app-chain-doctrine.md



./arcanum-chain.md



./canonical-modules.md



Modules path



../modules/hope/hope.md



../modules/tempus/tempus.md



../modules/vitae/vitae-and-becoming.md





\---

