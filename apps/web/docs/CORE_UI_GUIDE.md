# CORE_UI_GUIDE.md (v1 RC)
_Date:_ 2025‑09‑30
_Status:_ Release Candidate

## 0) Purpose
This guide locks the **navigation, layout, gestures, icons, gates, and visual tokens** for v1. It supersedes any Orbit/Carousel specs. All modules share a consistent header, a fixed footer with five tabs, and a 3‑page internal submenu (trapezoid pips).

---
## 1) Routes & Structure
- **App Router** (Next.js):
  - `/vitae`, `/text`, `/nexus`, `/tempus`, `/hope`
  - `/account`, `/wallet`, `/exchange`, `/preferences`, `/notifications`
- **Root redirect:** `/` → `/nexus`
- **Remove**: Core Orbit / OrbitCarousel UI, any legacy routes (e.g., `/acc`, `/mana`, `/prefs`, `/notifs`).

### Shared Imports
All UI components depend on shared utilities and global tokens:
```ts
import { cn } from "@shared/lib/cn";
import "@shared/styles/tokens.css";
```
Use these imports consistently to ensure visual harmony and functional consistency across realms.

### Footer Tabs (icons only, no labels)
1) **Vitae** (`/vitae`) → `BookMarked`
2) **Text** (`/text`) → `MessageSquareMore`
3) **Nexus** (`/nexus`) → `Globe`
4) **Tempus** (`/tempus`) → `Clock`
5) **Hope** (`/hope`) → `UserRound`
_Icon library_: `lucide-react` (PascalCase export names as above)

### Burger Drawer (right side)
- Items (with icons):
  - **Account** (`/account`) → `UserCog`
  - **Wallet** (`/wallet`) → `Wallet`
  - **Exchange** (`/exchange`) → `ArrowsLeftRight`
  - **Preferences** (`/preferences`) → `Settings`
  - **Notifications** (`/notifications`) → `Bell`
- Behavior: slides in/out from under menu (right), blocks background scroll, auto‑closes on route change.

---
## 2) Header & Footer
### Header (fixed)
- **Order (left→right):** Logo | (flex) | **MANA viewport** | **Burger**
- **MANA viewport**: `Gem` icon **right** of number; compact like `1,250 MANA`, `text-sm font-semibold tabular-nums`, gold tone (`text-amber-300`), tapping opens `/wallet`.
- **Sticky style**: `fixed top-0 inset-x-0 z-50 bg-black/60 backdrop-blur-md border-b border-zinc-800`

### Footer (fixed)
- **Sticky style**: `fixed bottom-0 inset-x-0 z-50 bg-black/70 backdrop-blur-md border-t border-zinc-800 shadow-[0_-8px_20px_rgba(0,0,0,0.5)]`
- **Icon states**:
  - Active: gold stroke/fill (`text-amber-300`) + soft glow `shadow-[0_0_10px_rgba(246,196,83,0.6)]`
  - Inactive: silver stroke (`text-zinc-400`), no glow
- **Badges**:
  - Footer: Vitae •dot, Text •**count** (cap `99+`, hide when 0), Nexus •dot, Tempus •dot, Hope •dot — `bg-amber-400 text-black`
  - Burger: dots on all five — `bg-amber-400 text-black`

- **Content padding**: `pt-14 pb-16` (safe areas included)

---
## 3) Sub‑pages (Trapezoid pips)
- **Three per module; order is Left → Center → Right**
  - Vitae: **Grade**, **Path**, **Mastery**
  - Text: **Contacts**, **Messages**, **Groups**
  - Nexus: **Posts**, **Current**, **Channels**
  - Tempus: **Codex**, **Clock**, **Calendar**
  - Hope: **Inventory**, **Character**, **Stylize**
- **Default on module enter:** center sub‑page
- **Placement:** fixed strip under header, full‑width, 56–64px tall (content scrolls beneath)
- **Interaction:**
  - **Swipe** horizontally anywhere in the content area to change sub‑page
  - **Pips are tappable** (PC friendly)
  - **URL**: use `?tab=` deep‑link (e.g., `/tempus?tab=clock`); on swipe/tap use **`replaceState`** (no Back‑stack spam)
- **Gesture resolution:** prioritize vertical scroll unless gesture starts mostly horizontal (≈ ≥30° from vertical; ≥24px horizontal before 8px vertical)
- **Pip styles**
  - **Active:** `bg-blue-700 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(246,196,83,0.8)] scale-110` + underline beam `h-0.5 w-10 bg-amber-400 shadow-[0_0_8px_rgba(246,196,83,0.7)]`
  - **Inactive:** `bg-neutral-900/60 text-zinc-400 border border-zinc-500`
  - **Motion:** snap instantly (`transition-none`)

- **Module switching:** **only via footer** (no horizontal module swipe)

---
## 4) Access Model (v1)
_All routes are guest‑accessible, with feature limits gated by ACC and MANA._
- **Gate behavior pattern (global):** tapping a restricted action opens **ACC Onboarding modal**
  - Title: “Create your ACC”; Primary → `/account` (Start Setup); Secondary → Learn more; Dismiss → Not now
- **High‑level limits** (details per module guide):
  - **Vitae**: read‑only; **ACC+MANA** to purchase Grades
  - **Text**: read‑only; **ACC** to make friends; **MANA** to join/create groups
  - **Nexus**: **Current** read‑only; **ACC** to follow Channels; **MANA** to create Posts (boost TBD)
  - **Tempus**: **Codex** needs **ACC**; **Clock** read‑only; **Calendar** read‑only with **ACC** to interact/earn; **MANA** to create event (amount TBD)
  - **Hope**: **Inventory** read‑only; **ACC** to collect/earn NFTs; **Stylize** read‑only with **ACC** to customize; Hope has intro features; **ACC** to grow with you

> MANA prices are **TBD** and will be set in the Economy guide.

---
## 5) Wallet (v1 posture)
- **Live wallet connect** (keep Wagmi v2 + Viem v2 UI)
- **Chains**: Dev **Sepolia** (default), Prod **Ethereum Mainnet**
- **Connectors**: defined in separate **Wallet Guide** (not in this doc)

---
## 6) Acceptance Criteria
- Header/Footer are fixed; content scrolls with `pt-14 pb-16`
- Footer icons reflect active/inactive styles; badges match spec
- Pips show correct states, snap instantly; tap & swipe both switch sub‑pages
- URL reads `?tab=` on first load; changes via `replaceState` on interaction
- Module switching only via footer; no horizontal module swipe between modules
- ACC Onboarding modal appears for all restricted actions
- OrbitCarousel + FullCard removed; no legacy routes; `/` → `/nexus`

---
## 7) Implementation Notes
- Component paths:
  - Header → `components/ui/AppHeader.tsx`
  - Footer → `components/ui/AppFooter.tsx`
  - Submenu Indicators → `components/ui/TabMenuIndicators.tsx`
  - Submenu Pager → `components/ui/TabMenuPager.tsx`
- Route files exist under `app/*/page.tsx` as listed above.

---


# TEMPUS_GUIDE.md (v1 RC)
_Date:_ 2025‑09‑30
_Status:_ Release Candidate (3 tabs)

## 0) Purpose
Define the **Tempus** module’s sub‑pages, behaviors, and gates for v1. **Rituals** and **Notifications** are removed from Tempus.

---
## 1) Sub‑pages (Left→Center→Right)
- **Codex** | **Clock** | **Calendar**
- **Default on enter:** **Clock**
- **Pips & gestures:** per Core UI Guide (tappable pips; swipe; `?tab=` with `replaceState`)

---
## 2) Access & Gates
- **Codex**: requires **ACC** (guest tap → ACC Onboarding modal)
- **Clock**: **read‑only** for all
- **Calendar**: **read‑only** for all; **ACC** to interact/earn; **MANA** required to **create an event** (price TBD)

---
## 3) Functional Spec
### 3.1 Codex (ACC‑gated)
- **Browseable reference** of time/correspondences
- **Search** input; **categories** (e.g., Planets, Zodiac, Phases)
- **Entry view**: title, short description, correspondence tags
- **CTA behavior**: attempting to favorite/save opens ACC Onboarding modal if guest

**Acceptance**
- Loads only for ACC accounts; guests see modal when attempting to open or interact
- Search filters entries client‑side

### 3.2 Clock (default)
- **Sigil clock** readout + time (Sol/Terra) display
- **No interactive gates** (pure view)
- **Performance**: renders under 50ms on tab change

**Acceptance**
- Always loads for guests & trusted; no prompts

### 3.3 Calendar
- **Month** and **Day** views; list of upcoming events (read‑only)
- **Create event**: ACC required; costs **MANA** (TBD) → guest sees modal
- **Interact/earn** actions (ACC‑only): check‑in, claim streak (TBD rules in Economy Guide)

**Acceptance**
- Guests can view but any action funnels to ACC modal
- ACC users can execute allowed actions; MANA charge shown pre‑confirm (amount TBD)

---
## 4) UI Hooks
- Uses the global header/footer and pip strip
- Keeps module swipe only for sub‑pages; no cross‑module swipe

---
## 5) Out‑of‑Scope (v1)
- Rituals, Notifications inside Tempus (moved/removed)
- Advanced animations beyond pip snap


# HOPE_GUIDE.md (v1 RC)
_Date:_ 2025‑09‑30
_Status:_ Release Candidate (3 tabs)

## 0) Purpose
Define **Hope** module sub‑pages and gates. Hope acts as the user’s guide with light onboarding education for guests.

---
## 1) Sub‑pages (Left→Center→Right)
- **Inventory** | **Character** | **Stylize**
- **Default on enter:** **Character**
- **Pips & gestures:** per Core UI Guide

---
## 2) Access & Gates
- **Inventory**: read‑only; **ACC** required to collect/earn NFTs (guest action → ACC Onboarding modal)
- **Character**: open for all; includes basic intro features to explain the Arcanum; **ACC** enables growth/progression
- **Stylize**: read‑only; **ACC** required to customize Hope Chibi (guest action → modal)

---
## 3) Functional Spec
### 3.1 Inventory
- Grid/list of items; item detail sheet
- **Claim/Mint** actions → ACC‑gated; MANA costs TBD in Economy Guide

**Acceptance**
- Guests see read‑only items and CTA triggers modal

### 3.2 Character (default)
- **Intro panels** that explain ACC, MANA, and core modules at a glance
- **Soft CTAs** that route to `/account` for setup

**Acceptance**
- No errors for guests; smooth info flow; CTAs route correctly

### 3.3 Stylize
- **Preview** of Hope avatar with locked controls for guests
- ACC users unlock customization controls (slots TBD)

**Acceptance**
- Guests see lock hints; ACC users can open controls; MANA costs TBD

---
## 4) UI Hooks
- Global header/footer and pip strip
- Notification badge dot can appear on Hope footer icon (gold dot)

---
## 5) Out‑of‑Scope (v1)
- Deep avatar editor feature set; full NFT claim rules; pricing — handled in Economy & Avatar guides.

