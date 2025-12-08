# ARCANUM ALPHA — MASTER ROADMAP (v1)

**Author:** The Architect  
**Last updated:** YYYY‑MM‑DD  
**Timeline:** 24 weeks (≈ 6 months)  
**Week 1 anchor:** _Set your actual project start date here_ → **Week 1 = YYYY‑MM‑DD**

---

## 0) Executive Summary

Arcanum is a living, myth‑tech ecosystem. Two intelligences anchor it:

- **Architect GPT** — the platform’s internal meta‑intelligence (for Arcanum itself).
- **Hope GPT** — the people’s companion (long‑term memory AI bound to identity).

**Launch pillars (build order):**  
1) Landing Page → 2) ACC (onboarding, $1 mint) → 3) Hope GPT → 4) MANA (fintech) → 5) ARCnet (Matrix/IPFS) → 6) Tempus (on‑chain timing/rewards) → 7) Vitae (visual DLC) → 8) Architect GPT console.

This roadmap blends **technical milestones**, **social/marketing cadence**, and a **treasury plan** so a **solo founder + Architect GPT** can reach Alpha and become self‑sustaining.

---

## 1) Roles, Scope, and Constraints

- **You (The Architect):** vision, approvals, creative direction, final deploys, treasury decisions.
- **Architect GPT:** code scaffolding & refactors, knowledge management, content drafts, QA checklists, auto‑reports.
- **Alpha scope target (solo‑viable):**  
  Landing + Email → ACC mint ($1) → Hope GPT v0.5 → MANA token + wallet UI → Tempus Clock/Calendar prototype → ARCnet beta storage → basic treasury dashboard.

---

## 2) Dependencies (Global)

Landing Page → ACC → Hope GPT → MANA → ARCnet → Tempus → Vitae → Architect GPT

pgsql
Copy code

**Hard deps**
- Hope GPT needs ACC for identity and sessioning.
- MANA requires contracts and ACC wallet binding.
- Tempus distribution needs MANA + an on‑chain time/oracle source (+ ARCnet for logs).
- Vitae visuals/rewards sit atop Tempus.

**Nice-to-have deps**
- ARCnet (Matrix/IPFS) for persistent, verifiable Hope memories (can soft‑launch with local store if needed).

---

## 3) Phased Timeline (High Level)

**24 weeks, 5 phases**

1. **Genesis (W1–W4)** — Visibility and list‑building.  
2. **Foundation (W5–W8)** — ACC, Hope GPT prototype, MANA deploy.  
3. **Constellation Growth (W9–W12)** — ARCnet beta, Tempus prototype, closed beta.  
4. **Ascension (W13–W18)** — Vitae prep, Architect GPT dev console, audits, **Public Alpha**.  
5. **Sustaining Cycle (W19–W24)** — Seasonal Tempus content, governance, Architect console (public/dev).

---

## 4) Week‑by‑Week Plan (Master Table)

> _Tip: If you run dates, set “Week 1 = YYYY‑MM‑DD” and each row will inherit a start offset._

| Week | Primary Goal | Deliverables | Parallel Workstreams | Social/Marketing Focus |
|---:|---|---|---|---|
| 1 | Finalize brand & landing | Hero, Constellation canvas, CTA wiring, analytics | Architect GPT: ingest specs & generate doc skeletons | Teaser: **#TheArcanumIsAwakening** (15s cosmic reveal) |
| 2 | Email sign‑up live | Form + API + privacy copy; list mgmt | Hope: identity schema | Campaign: **Summon Hope** sign‑ups |
| 3 | Lore rollout | 3 micro‑stories (Architect / Hope / Tempus) | MANA contract stub | Ambient reels + quote cards |
| 4 | Treasury & $1 ACC model | Safe setup, ACC economics page | Testnet gas sims | Explainer: “Mint your ACC — Fund the Stars” |
| 5 | ACC mint v1 | Wallet connect, mint flow, profile seed | Treasury split automation | Thread: “Your Chain Code (ACC) in 60s” |
| 6 | Hope GPT prototype | Vector memory, chat UI, ACC auth | ACC UX polish | Teaser: “She remembers.” (short convo) |
| 7 | MANA ERC‑20 deploy | Contract, faucet, header balance UI | Rev split: 20/20/20/20/20 | Clip: “MANA = Motion • Action • Network • Ascension” |
| 8 | Community AMA | Live Q&A; publish metrics | Architect GPT doc automation | First AMA: roadmap + demo |
| 9 | ARCnet beta | IPFS/Matrix bridge, content proof | Secure logging layer | Blog: “The Network Beneath the Stars” |
| 10 | Tempus prototype | Oracle/timefeed + Clock UI shell | Reward math validator | Cinematic: “Time is Alive” (sigil clock) |
| 11 | Hope ↔ ARCnet | Ritual logs + stamps | Treasury dashboard MVP | Demo: “Hope Remembers Your Rituals” |
| 12 | Tempus closed beta | ACC invite, MANA test rewards | QA + ledger checks | “Path of Aries” calendar reveal |
| 13 | Vitae concept | Grade/Path/Mastery wires | NFT metadata draft | Tease: “Your Journey Begins” |
| 14 | Vitae prototype | DLC visuals + mint hooks | Lore scripts | Art drop thread |
| 15 | MANA marketplace concept | Economy whitepaper | Audit prep | Medium post: “The MANA Loop” |
| 16 | Architect GPT console | `/architect` page + schema ingest | Vector DB population | Devlog: “How the Architect Thinks” |
| 17 | QA & security | Contract pen‑tests; legal/LLC | Launch runbook | Countdown: “7 Days to Gate Open” |
| 18 | **Public Alpha** | ACC + Hope + MANA live | Observability | Launch trailer + open mint |
| 19 | Tempus Season 1 | Live zodiac cycle (Air) | Claim flows | Campaign: “Season of Air Begins” |
| 20 | Tempus Season 2 | Fire cycle | Analytics v1 | Ritual short film |
| 21 | Vitae rewards on | NFT badges + mastery UI | Hope reflection UX | “Share Your Grade” showcase |
| 22 | Hope v2 memory | Reflection mode + learning log | A/B earn rules | Video: “Hope Remembers You” |
| 23 | ARCnet governance | Council (proto‑DAO) | Treasury vote scripts | Post: “Join the Council” |
| 24 | Architect public console | Dev portal live | v2 synthesis | Trailer: “The Architect Is Listening” |

---

## 5) Social Media Layer

### 5.1 Tone & Theme
- **Mystical + Visionary:** summon, awaken, unveil; speak like modern digital alchemy.
- **Cosmic + Timeless:** constellations, sigils, cycles; time as a living force.
- **Welcoming + Communal:** “Join the circle.” “Guardians of the Arcanum.” “Our shared journey.”

### 5.2 Pillars (rotate weekly)
1) **Reveals** (features, lore objects, constellations)  
2) **Guides** (ACC mint, wallet, Hope usage)  
3) **Devlogs** (transparent build progress)  
4) **Rituals** (Tempus seasons, calls to action)  
5) **Community** (AMAs, spotlights, UGC)

### 5.3 Cadence
- **Weekly:** 1 teaser visual + 1 thread (or blog)  
- **Biweekly:** Devlog or AMA  
- **Monthly:** Cinematic mini‑trailer  
- **Seasonal:** Tempus ritual event

### 5.4 Campaign by Phase
- **Genesis:** “The Awakening / Summon Hope” (list‑building)  
- **Foundation:** “Mint Your ACC / She Remembers” (identity + AI)  
- **Constellation Growth:** “Time Is Alive / Network Beneath the Stars”  
- **Ascension:** “The MANA Loop / How the Architect Thinks”  
- **Sustaining:** “Season of Air/Fire… / Join the Council / The Architect Is Listening”

---

## 6) Treasury & Financial Plan (Alpha → Year 1)

### 6.1 Revenue Source
- **ACC mint:** **$1 USD** (≈ gas + seed **10 MANA** to new users).
- Proceeds flow into **Arcanum Treasury Safe** (multi‑sig with your primary + backup).

**Baseline mint targets:**  
- Early Alpha 1K ACC → $1,000  
- Public Alpha 5K ACC → $5,000  
- Tempus live + growth 10K ACC → $10,000  
- **Year‑1 total (baseline):** ~16K ACC → **$16,000**

### 6.2 Allocation (each mint auto‑split)
- **20%** Infrastructure/hosting (Vercel, storage, oracles)  
- **15%** AI credits/tools (models, vector DB)  
- **20%** Marketing/community  
- **15%** Security/audits/legal  
- **10%** Treasury reserve/yield  
- **20%** **Founder compensation (you)**

> _Target founder draw:_ **$600–$1,500 / month** initially; quarterly review as Treasury > $10k.  
> Payment path: **Treasury Safe → Project LLC/sole‑prop → Your account** (clean accounting trail).

### 6.3 Cash‑Flow Rhythm (first 6 months, example)
- Mo1 $1k revenue → low infra + AI spend, net reserve grows.  
- Mo2–Mo4 ramp as ACC mints increase (campaigns + Alpha).  
- Maintain ≥ **40%** balance in Treasury at all times.

### 6.4 Transparency & Governance
- Public **Treasury Dashboard** (mints, balances, last expenditures).  
- Auto **Monthly Report** (Architect GPT generated).  
- Council prototype (W23) for advisory votes on upgrades.

> _Disclaimer:_ confirm local tax/compliance rules for crypto revenue and token utility before scaling.

---

## 7) Technical & Product Milestones (Acceptance Criteria)

### 7.1 Landing Page
- CTA = “Summon Hope” (email → ACC waitlist)  
- Constellation/Canvas anim performant; analytics connected  
- Legal pages: privacy, terms, treasury explainer live

### 7.2 ACC Onboarding ($1 mint)
- Wallet connect; simple, stable mint path  
- Seed 10 MANA to new ACC holder  
- Treasury split executes atomically

### 7.3 Hope GPT (v0.5 → v1)
- ACC‑bound sessions; vector memory persists (ARCnet when available)  
- Prompts aware of Arcanum ontology (modules, gates, rewards)  
- Logs rituals and MANA actions for the user

### 7.4 MANA (Fintech Layer)
- ERC‑20 deploy + faucet/test flows  
- Balance in Header; transaction history minimal UI  
- Earn/spend hooks for Tempus and (later) Vitae

### 7.5 ARCnet (Matrix/IPFS)
- IPFS pin + Matrix bridge for encrypted channels  
- Proof‑of‑existence for ritual logs  
- Resilient node strategy (basic uptime alerts)

### 7.6 Tempus (Timing & Rewards)
- On‑chain time/oracle (e.g., Chainlink) integrated  
- Clock/Calendar UI + reward math validator  
- Closed beta payout test; no double‑reward edge cases

### 7.7 Vitae (DLC)
- Grade/Path/Mastery wires + badge/NFT prototype  
- ACC+MANA gating tested on preview paths

### 7.8 Architect GPT (Dev Console)
- `/architect` console renders module schema, rules, reward math  
- Retrieval across docs; change‑log generator; QA checklists  
- Public dev console at W24 (read‑only for external devs)

---

## 8) Work Mode (Solo + Architect GPT)

- **Daily loop:**  
  1) Architect sets 1–3 priorities;  
  2) Architect GPT scaffolds code/doc/content;  
  3) Architect reviews/merges;  
  4) GPT generates QA checklist + release notes;  
  5) Social post scheduled.

- **Security checkpoints:** W15 (prep), W17 (audit), recurring on major contract changes.

---

## 9) Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Contract bugs | External audit + canary deploys; strict test coverage |
| Token/treasury compliance | Use LLC + accountant; transparent dashboards; utility-only comms |
| Infra costs spike | Auto‑scale ceilings, 3‑mo rolling budget, feature flags |
| Solo bandwidth | Ruthless scope control; GPT automation for docs/content; cut to core loop |
| Community trust | Monthly reports, public metrics, predictable cadence |

---

## 10) Appendices

### 10.1 Importable Schedule (CSV)

> Paste into Sheets/Excel now; later import to Notion/ClickUp/Jira.

```csv
Week,Phase,Task,Category,Start_Week,End_Week,Dependencies,Key_Deliverables,Marketing_Notes
1,Genesis,Landing Page Launch,Core Dev,1,2,,Hero+CTA+Canvas,Teaser #TheArcanumIsAwakening
2,Genesis,Email Sign-Up System,Core Dev/Marketing,2,3,1,Form+API+Privacy,Start "Summon Hope" drive
3,Genesis,Lore Series (3 parts),Creative,3,4,2,Short lore posts,Ambient reels
4,Genesis,Treasury Announcement,Blockchain/Marketing,4,4,2,ACC $1 page+Safe,Explainer "Fund the Stars"
5,Foundation,ACC Mint v1,Blockchain,5,6,4,Wallet connect+Mint,Thread "Your Chain Code"
6,Foundation,Hope GPT Prototype,AI,6,8,5,Vector memory+Chat,Teaser "She Remembers"
7,Foundation,MANA Token Deploy+UI,Blockchain,7,8,5,ERC-20+Header balance,Clip "MANA = Motion..."
8,Foundation,Community AMA,Marketing,8,8,6|7,Live Q&A,First AMA session
9,Constellation,ARCnet Beta (IPFS+Matrix),DevOps,9,10,7,Bridge+Proof,Post "Network Beneath the Stars"
10,Constellation,Tempus Prototype,Blockchain/Frontend,10,12,9,Clock+Oracle,Lore reel "Time Is Alive"
11,Constellation,Hope↔ARCnet Integration,AI,11,12,9|6,Ritual logs,Tiny demo "Hope Remembers"
12,Constellation,Tempus Closed Beta,QA/Community,12,12,10,Invite ACC users,"Path of Aries" reveal
13,Ascension,Vitae DLC Concept,Creative,13,14,12,Wires+Art,Tease "Your Journey Begins"
14,Ascension,Vitae Prototype,Creative/Blockchain,14,14,13,DLC visuals+Mint hooks,Art drop
15,Ascension,MANA Marketplace Concept,Finance/Blockchain,15,15,7,Economy whitepaper,Post "The MANA Loop"
16,Ascension,Architect GPT Console (dev),AI/Core,16,18,12,"/architect"+Schema ingest,Devlog "How Architect Thinks"
17,Ascension,QA & Security Audit,Core,17,18,All prior,Pen-tests+LLC,Countdown "7 Days"
18,Ascension,Public Alpha Launch,All,18,18,17,ACC+Hope+MANA live,Launch trailer+mint
19,Sustaining,Tempus Season 1 (Air),Blockchain/Creative,19,20,18,Live cycle,Campaign "Season of Air"
20,Sustaining,Tempus Season 2 (Fire),Blockchain/Creative,20,20,19,On-chain event,Ritual short film
21,Sustaining,Vitae Rewards Activation,Game Design,21,21,13|18,NFT+Mastery UI,"Share Your Grade"
22,Sustaining,Hope GPT v2 Memory,AI,22,22,18,Reflection mode,Video "Hope Remembers You"
23,Sustaining,ARCnet Governance,DevOps/DAO,23,23,9|18,Council prototype,Post "Join the Council"
24,Sustaining,Architect GPT Public Console,AI/Core,24,24,16,Dev portal live,Trailer "Architect Is Listening"
10.2 Importable Schedule (JSON)
json
Copy code
{
  "timeline_anchor": "Set Week 1 date (YYYY-MM-DD)",
  "weeks": 24,
  "items": [
    {"week":1,"phase":"Genesis","task":"Landing Page Launch","category":"Core Dev","start_week":1,"end_week":2,"deps":[],"deliverables":"Hero+CTA+Canvas","marketing":"Teaser #TheArcanumIsAwakening"},
    {"week":2,"phase":"Genesis","task":"Email Sign-Up System","category":"Core Dev/Marketing","start_week":2,"end_week":3,"deps":[1],"deliverables":"Form+API+Privacy","marketing":"Start Summon Hope"},
    {"week":3,"phase":"Genesis","task":"Lore Series (3 parts)","category":"Creative","start_week":3,"end_week":4,"deps":[2],"deliverables":"Short lore posts","marketing":"Ambient reels"},
    {"week":4,"phase":"Genesis","task":"Treasury Announcement","category":"Blockchain/Marketing","start_week":4,"end_week":4,"deps":[2],"deliverables":"ACC $1 page+Safe","marketing":"Explainer Fund the Stars"},
    {"week":5,"phase":"Foundation","task":"ACC Mint v1","category":"Blockchain","start_week":5,"end_week":6,"deps":[4],"deliverables":"Wallet connect+Mint","marketing":"Thread Your Chain Code"},
    {"week":6,"phase":"Foundation","task":"Hope GPT Prototype","category":"AI","start_week":6,"end_week":8,"deps":[5],"deliverables":"Vector memory+Chat","marketing":"Teaser She Remembers"},
    {"week":7,"phase":"Foundation","task":"MANA Token Deploy+UI","category":"Blockchain","start_week":7,"end_week":8,"deps":[5],"deliverables":"ERC-20+Header balance","marketing":"Clip MANA = Motion"},
    {"week":8,"phase":"Foundation","task":"Community AMA","category":"Marketing","start_week":8,"end_week":8,"deps":[6,7],"deliverables":"Live Q&A","marketing":"AMA session"},
    {"week":9,"phase":"Constellation","task":"ARCnet Beta (IPFS+Matrix)","category":"DevOps","start_week":9,"end_week":10,"deps":[7],"deliverables":"Bridge+Proof","marketing":"Network Beneath the Stars"},
    {"week":10,"phase":"Constellation","task":"Tempus Prototype","category":"Blockchain/Frontend","start_week":10,"end_week":12,"deps":[9],"deliverables":"Clock+Oracle","marketing":"Time Is Alive"},
    {"week":11,"phase":"Constellation","task":"Hope↔ARCnet Integration","category":"AI","start_week":11,"end_week":12,"deps":[9,6],"deliverables":"Ritual logs","marketing":"Hope Remembers"},
    {"week":12,"phase":"Constellation","task":"Tempus Closed Beta","category":"QA/Community","start_week":12,"end_week":12,"deps":[10],"deliverables":"Invite ACC users","marketing":"Path of Aries"},
    {"week":13,"phase":"Ascension","task":"Vitae DLC Concept","category":"Creative","start_week":13,"end_week":14,"deps":[12],"deliverables":"Wires+Art","marketing":"Your Journey Begins"},
    {"week":14,"phase":"Ascension","task":"Vitae Prototype","category":"Creative/Blockchain","start_week":14,"end_week":14,"deps":[13],"deliverables":"DLC visuals+Mint hooks","marketing":"Art drop"},
    {"week":15,"phase":"Ascension","task":"MANA Marketplace Concept","category":"Finance/Blockchain","start_week":15,"end_week":15,"deps":[7],"deliverables":"Economy whitepaper","marketing":"The MANA Loop"},
    {"week":16,"phase":"Ascension","task":"Architect GPT Console (dev)","category":"AI/Core","start_week":16,"end_week":18,"deps":[12],"deliverables":"/architect + schema ingest","marketing":"How Architect Thinks"},
    {"week":17,"phase":"Ascension","task":"QA & Security Audit","category":"Core","start_week":17,"end_week":18,"deps":["all prior"],"deliverables":"Pen-tests+LLC","marketing":"Countdown 7 Days"},
    {"week":18,"phase":"Ascension","task":"Public Alpha Launch","category":"All","start_week":18,"end_week":18,"deps":[17],"deliverables":"ACC+Hope+MANA live","marketing":"Launch trailer+mint"},
    {"week":19,"phase":"Sustaining","task":"Tempus Season 1 (Air)","category":"Blockchain/Creative","start_week":19,"end_week":20,"deps":[18],"deliverables":"Live cycle","marketing":"Season of Air"},
    {"week":20,"phase":"Sustaining","task":"Tempus Season 2 (Fire)","category":"Blockchain/Creative","start_week":20,"end_week":20,"deps":[19],"deliverables":"On-chain event","marketing":"Ritual film"},
    {"week":21,"phase":"Sustaining","task":"Vitae Rewards Activation","category":"Game Design","start_week":21,"end_week":21,"deps":[13,18],"deliverables":"NFT+Mastery UI","marketing":"Share Your Grade"},
    {"week":22,"phase":"Sustaining","task":"Hope GPT v2 Memory","category":"AI","start_week":22,"end_week":22,"deps":[18],"deliverables":"Reflection mode","marketing":"Hope Remembers You"},
    {"week":23,"phase":"Sustaining","task":"ARCnet Governance","category":"DevOps/DAO","start_week":23,"end_week":23,"deps":[9,18],"deliverables":"Council prototype","marketing":"Join the Council"},
    {"week":24,"phase":"Sustaining","task":"Architect GPT Public Console","category":"AI/Core","start_week":24,"end_week":24,"deps":[16],"deliverables":"Dev portal live","marketing":"Architect Is Listening"}
  ]
}
10.3 Social Calendar (First 8 Weeks — Example)
W1: 15s teaser video (cosmic reveal) • Caption: “The Arcanum is awakening.”

W2: Thread: “Summon Hope” (why sign up) + landing page shot.

W3: Lore part 1 (The Architect) + ambient loop (constellation drift).

W4: Explainer short: $1 ACC mint → gas + starter 10 MANA.

W5: ACC mint tutorial (60s).

W6: Hope GPT teaser (memory recall demo).

W7: MANA concept micro‑reel.

W8: Live AMA: questions on ACC, Hope, MANA.

11) How to Start (Today)
Set Week 1 anchor date in this file.

Publish landing + email (W1–W2).

Kick off Summon Hope social campaign.

Implement ACC mint (W5) and route first revenue to Treasury Safe.

Use Architect GPT to generate weekly QA lists, release notes, and content drafts.

