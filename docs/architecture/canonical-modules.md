\---

title: "Canonical Modules"

status: canonical

visibility: public

last\_updated: 2026-03-13

description: "First-class modules of Arcanum and ARCnet, including boundaries, sources of truth, and dependency invariants."

role: "constitution"

authority: "system-wide"

version: "1.0"

\---



\# Canonical Modules



\## Preamble



This document defines the canonical modules of the Arcanum system.



A canonical module is a first-class subsystem whose existence, authority, and boundaries are explicitly recognized by constitutional doctrine. No module may be created, removed, or substantially altered without alignment to this canon.



If a capability, feature, or behavior is not attributable to a canonical module, it is not permitted to exist within Arcanum.



\---



\## Canonical Authority Model



Every module is governed by three questions:



1\) \*\*Where does it live?\*\* (Doctrine · ARCnet · App · Experience)  

2\) \*\*What is its source of truth?\*\* (Doctrine · Chain state · App state · Lived state)  

3\) \*\*What may it depend on — and what may not depend on it?\*\*



Violations constitute doctrinal drift.



Reference doctrine:

\- `docs/doctrine/layer-boundaries.md`

\- `docs/architecture/app-chain-doctrine.md`



\---



\## Module registry



> Naming note: \*\*ARCnet\*\* is the canonical network name. “Arcanum Chain” refers to ARCnet’s settlement layer implementation.



\### MODULE I — ARCHITECT (Doctrine \& Governance)



\- \*\*Status:\*\* Canonical

\- \*\*Primary layer:\*\* Doctrine

\- \*\*Source of truth:\*\* Doctrine + Governance canon (`docs/doctrine/`, `docs/governance/`)

\- \*\*Purpose:\*\* cross-layer coherence, boundary enforcement, change discipline



\*\*Responsibilities\*\*

\- maintain doctrinal law and its enforceability posture

\- preserve layer boundaries and module separation

\- require explicit logging for constitutional-impacting changes



\*\*Dependencies\*\*

\- none (foundational)



\*\*Forbidden\*\*

\- may not depend on app logic, chain state, or user data

\- may not bypass doctrine or simulate lived experience



\---



\### MODULE II — HOPE (Reflection Interface)



\- \*\*Primary layer:\*\* App / Experience

\- \*\*Source of truth:\*\* Lived state + App state

\- \*\*Purpose:\*\* reflective dialogue and coherence support



\*\*Dependencies\*\*

\- Identity (context continuity)

\- Tempus (timing context)

\- Vitae (responsibility envelope context)



\*\*Forbidden\*\*

\- may not enforce progression

\- may not write semantic judgements to chain

\- may not alter economic balances directly



\---



\### MODULE III — TEMPUS (Time \& Rhythm)



\- \*\*Primary layer:\*\* App (with optional chain anchors)

\- \*\*Source of truth:\*\* App schedulers + bounded chain receipts

\- \*\*Purpose:\*\* rhythm, rites, cycles, windows, cadence discipline



\*\*Dependencies\*\*

\- ARCnet (optional attestations/receipts)

\- Architect doctrine (temporal constraints)



\*\*Forbidden\*\*

\- may not define meaning

\- may not allocate value

\- may not directly advance Vitae



\---



\### MODULE IV — VITAE (Recognition After Stabilization)



\- \*\*Primary layer:\*\* Experience / App (optional chain anchors)

\- \*\*Source of truth:\*\* Lived state (recognized retrospectively) + doctrine invariants

\- \*\*Purpose:\*\* recognize stabilized capacity; gate responsibility without worth-scoring



\*\*Dependencies\*\*

\- Tempus (temporal context, not speed)

\- Identity (continuity)



\*\*Forbidden\*\*

\- may not mint or transfer value

\- may not be reduced to scoring/ranking

\- may not be bypassed by payment or authority



\*\*Chain interaction\*\*

\- Vitae remains lived off-chain

\- Proof of certain transitions may be anchored as factual receipts

\- The chain may witness Vitae; it may not define it



\---



\### MODULE V — IDENTITY (Continuity \& Sovereignty)



\- \*\*Primary layer:\*\* App / Protocol

\- \*\*Source of truth:\*\* identity records under user control + minimal chain anchor

\- \*\*Purpose:\*\* persistent continuity without dossier creation



\*\*Responsibilities\*\*

\- persistent identity anchor (ACC / ChainCode)

\- relationship binding and consent surfaces

\- anti-fragmentation safeguards



\*\*Dependencies\*\*

\- none (foundational)



\*\*Forbidden\*\*

\- may not be owned by the app

\- may not be traded

\- may not be reduced to reputation scores



\---



\### MODULE VI — ECONOMY (MANA)



\- \*\*Primary layer:\*\* ARCnet

\- \*\*Source of truth:\*\* chain state + protocol parameters

\- \*\*Purpose:\*\* utility-first circulation (capacity, permissions, infrastructure usage)



\*\*Dependencies\*\*

\- Treasury

\- Governance parameters (bounded)



\*\*Forbidden\*\*

\- may not create speculative instruments as protocol defaults

\- may not override constitutional invariants

\- may not be governed by app logic



\---



\### MODULE VII — TREASURY (Stewardship)



\- \*\*Primary layer:\*\* ARCnet (or multi-sig custody in early phases)

\- \*\*Source of truth:\*\* chain state + governance-approved execution rules

\- \*\*Purpose:\*\* collective custody and long-term stewardship



\*\*Dependencies\*\*

\- governance

\- execution constraints (time-locks where applicable)



\*\*Forbidden\*\*

\- may not be controlled by a single actor

\- may not be accessed directly by the app

\- may not be silently changed



\---



\### MODULE VIII — ARCNET (Settlement \& Invariants)



\- \*\*Primary layer:\*\* Protocol

\- \*\*Source of truth:\*\* chain state

\- \*\*Purpose:\*\* minimal settlement, receipts, invariant enforcement



\*\*Responsibilities\*\*

\- enforce economic rules

\- anchor identity and factual receipts

\- protect treasury and governance execution



\*\*Dependencies\*\*

\- architect doctrine (constraints)



\*\*Forbidden\*\*

\- may not govern meaning

\- may not define personal growth

\- may not be bypassed for protocol truth



\---



\### MODULE IX — NEXUS (Social Fabric)



\- \*\*Primary layer:\*\* App / Experience

\- \*\*Source of truth:\*\* lived interaction + app state

\- \*\*Purpose:\*\* connection and discourse without domination mechanics



\*\*Dependencies\*\*

\- Identity

\- (Optional) economy receipts for value routing



\*\*Forbidden\*\*

\- may not enforce doctrine

\- may not allocate economic value by ranking humans

\- may not alter Vitae progression



\---



\### MODULE X — WALLET (Interface, Not Authority)



\- \*\*Primary layer:\*\* App

\- \*\*Source of truth:\*\* chain state

\- \*\*Purpose:\*\* user custody surface for viewing and initiating permitted transactions



\*\*Dependencies\*\*

\- ARCnet



\*\*Forbidden\*\*

\- may not define balances

\- may not hold custody by default

\- may not bypass treasury rules



\---



\## Global dependency invariants



\- App modules may \*\*read\*\* chain state but may not \*\*define\*\* it.

\- Chain modules may enforce rules but may not \*\*define meaning\*\*.

\- Experience modules may shape becoming but may not \*\*mint value\*\*.

\- Doctrine supersedes all other layers.

\- Any violation constitutes constitutional breach.



\---



\## Amendment protocol



This document may only be amended by:



\- explicit doctrine change

\- full boundary review

\- synchronized updates across:

&#x20; - doctrine

&#x20; - architecture boundary contract

&#x20; - governance specs

&#x20; - (if applicable) chain specs



Silent drift is forbidden.



\---



\## Closing



Arcanum is not a product.  

It is a coherent system of becoming.



This canon exists so coherence may endure.

