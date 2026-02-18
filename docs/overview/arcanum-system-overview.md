---
title: "Arcanum System Overview"
status: draft
visibility: public
last_updated: 2026-02-18
description: ""
---

![Arcanum System Map](./media/SYSTEM_MAP.png)
# Arcanum System Overview
_Date:_ 2025-10-15  
_Status:_ Canonical Architecture Summary  
_Author:_ The Architect

---

## 🌌 0. Purpose

**The Arcanum** is a decentralized ecosystem uniting consciousness and technology.  
It is both a social organism and a spiritual operating system.

This document describes the **dual-realm architecture** — the **Site** and the **App** — and how they interact with the on-chain layer, the modules of the Arcanum, and the user’s soul-bound identity.

---

## 🏛️ 1. Structural Overview
arcanum/
├─ apps/
│ ├─ site/ → Landing Portal, ChainCode Mint, Downloads
│ └─ web/ → App Interface, Wallet Interaction, MANA Ecosystem
├─ contracts/ → On-chain smart contracts (MANA, ACC, ChainCode)
├─ shared/ → Common libs, utilities, and design tokens
├─ docs/ → Module guides and internal architecture files
└─ archive/ → Legacy code and deprecated modules

---

## 🌐 2. Realms of the Arcanum

### 🩵 **SITE — The Outer Temple**
**Path:** `/apps/site`  
**Stack:** Next.js 15 • Tailwind • Framer Motion • Viem/Wagmi  

The Site is the *threshold*. It is the first contact point for a visitor discovering the Arcanum.

**Functions:**
- Explains the philosophy and structure of the Arcanum.  
- Handles **ChainCode minting** (SBT identity) directly on-chain.  
- Provides **onboarding** via the Hope companion.  
- Offers **App downloads** (APK / App Store / F-Droid).  
- Detects returning ACC holders and **redirects to the App** automatically.

**Core Logic:**
- Uses `/shared/lib/sbt-check.ts` to detect a local SBT in browser storage.
- Integrates wallet connect via Wagmi + Viem for mint transactions.
- Imports shared design tokens from `/shared/styles/tokens.css`.

---

### 💎 **APP — The Inner Temple**
**Path:** `/apps/web`  
**Stack:** Next.js 15 • React 18 • TypeScript • Tailwind • Framer Motion  

The App is the interface through which the user interacts with the ecosystem.

**Modules:**
| Module | Subpages | Description |
|:--|:--|:--|
| **Hope** | Inventory / Character / Stylize | AI guide, onboarding, customization |
| **Tempus** | Codex / Clock / Calendar | Timekeeping & ritual system |
| **Nexus** | Posts / Current / Channels | Decentralized social network |
| **Text** | Contacts / Messages / Groups | Encrypted messaging |
| **Vitae** | Grade / Path / Mastery | Journey & mastery system |

**Core Structure:**
- `/components/ui` → Header, Footer, Modal, Tabs, Pager  
- `/lib` → divided into domains:
  - `economy/` → MANA, pricing, contracts  
  - `identity/` → ACC, gates, trust  
  - `infra/` → network/storage systems (IPFS, Matrix, Wagmi)  
  - `social/` → posts, rooms  
- `/shared/` → imports `tokens.css` + utilities

---

### ⚙️ **CONTRACTS — The Arcane Layer**
**Path:** `/contracts`  
**Language:** Solidity + Foundry  

Implements on-chain logic for:
- **MANA** — universal currency of action and energy  
- **ChainCode** — soul-bound identity contract (minted at onboarding)  
- **TestACC / ACC** — access credential and wallet logic  

---

## 🧩 3. Shared Systems

### `/shared/lib/`
| File | Role |
|:--|:--|
| `cn.ts` | Combines class names (universal utility) |
| `sbt-check.ts` | Checks for local SBT and redirects accordingly |

### `/shared/styles/`
| File | Role |
|:--|:--|
| `tokens.css` | Defines base color, motion, typography, and shadow constants shared between realms |

The Shared Library forms the energetic bridge between realms — uniting logic and style.

### Implementation Mandate
Each app (`apps/web`, `apps/site`) must explicitly import shared modules using workspace alias `@shared/*`:

```ts
import { cn } from "@shared/lib/cn";
import { isSBT } from "@shared/lib/sbt-check";
import "@shared/styles/tokens.css";
```

This ensures universal coherence of design and identity logic across the ecosystem.

---

## 🔮 4. Flow of the Initiate

Visitor
↓
Landing Page (apps/site)
↓ Mint ChainCode → Soul-Bound Token issued
↓
Download App (APK / App Store / F-Droid)
↓
Launch App (apps/web)
↓
Hope Companion greets user → Sync Wallet
↓
Tempus & Nexus Modules unlock
↓
MANA economy activates (tasks, rituals, messages)
↓
Vitae progression begins (Grades & Paths)
↓
Mastery + Lore unlock (complete cycle)


---

## ⚖️ 5. Economy Overview

- **MANA** represents energy earned through actions, rituals, and participation.
- **ACC** (Arcanum Chain Code) binds wallet and identity.
- **Rewards** follow cosmological rhythm (Tempus calendar).

---

## 🌐 6. Future Distribution Plan

- **Site** hosts minting + direct APK download.  
- **App** distributed on:
  - Google Play  
  - Apple App Store  
  - F-Droid (for sovereign installs)  
- Both share a single contract layer and design token set.

---

## 🧠 7. System Philosophy

> “Form is frequency. Function is ritual.”

- **Form** — the structure of the code, as harmonic geometry.  
- **Motion** — animation and timing, as breath.  
- **Color** — consciousness gradient, cyan → indigo → gold.  
- **Code** — temple language: minimal, meaningful, sovereign.

---

## 📘 8. References

| Document | Description |
|:--|:--|
| `CORE_UI_GUIDE.md` | Header, footer, tab system, gestures |
| `HOPE_GUIDE.md` | Hope companion design |
| `TEMPUS_GUIDE.md` | Temporal engine |
| `NEXUS_GUIDE.md` | Social graph rules |
| `VITAE_GUIDE.md` | Path and mastery |
| `MODULE_CARD_GUIDE.md` | Card structure spec |
| `TEMPUS_REWARD_SYSTEM_CALENDAR.md` | MANA + asset reward math |
| `MASTER_INDEX.md` | Root module and reward summary |

---

## 🜃 9. Visual System Map

![Arcanum System Map](./SYSTEM_MAP.svg)

*See `SYSTEM_MAP.svg` for the visual diagram of flow and modular interaction.*

---

## 🜁 10. License & Principles

The Arcanum operates under principles of:
- **Sovereignty** — full user ownership of identity and data  
- **Reciprocity** — value exchange through MANA  
- **Harmony** — technological architecture reflecting natural rhythm  

---

_End of document._
