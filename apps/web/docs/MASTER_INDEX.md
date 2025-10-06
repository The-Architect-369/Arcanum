Master Arcanum Index (v1 RC)

Date: 2025-10-02
Status: Master Reference (UI + Modules + Rewards)


─────────── TOP HALF: CORE UI & MODULE CARDS ───────────
0) Core UI Overview

App Router (Next.js):

/hope, /tempus, /nexus, /text, /vitae

/account, /wallet, /exchange, /preferences, /notifications

Root redirect: / → /hope

Header

Logo | MANA viewport | Burger menu

MANA viewport: gold tone, compact, tap → /wallet

Burger menu slides from right; blocks background scroll

Footer

Fixed 5-tab navigation (icons only)

Left→Right: Hope | Tempus | Nexus | Text | Vitae

Active: gold fill + soft glow; box changes to 3D blue tile pop

Badges: dots or counts (per module spec)

Sub-page Tabs (Trapezoid pips)

3 per module: Left→Center→Right

Swipe horizontal to change sub-page; URL ?tab= updates; snap instantly

Footer controls module switching (no horizontal cross-module swipe)

Gesture resolution: vertical scroll prioritized; horizontal swipe if >30° and ≥24px

ACC & MANA Gates

Guest taps restricted feature → ACC Onboarding modal

ACC/MANA pricing: TBD in Economy Guide

1) Module Card Pattern

Each module contains 2–3 primary cards

Cards are full-screen floating panels

Guests: read-only, lock hints

ACC + MANA unlock full functionality

Mobile: swipe sub-pages; Desktop: click TabDots/TabIndicators

FullCard component for full content; TabDots/Indicators for sub-page navigation

Summary Table

Module	Card 1	Card 2	Card 3	Notes
Hope	Character	Inventory	Stylize	Onboarding, AI interaction, cosmetic preview
Tempus	Clock	Codex	Calendar	Sigil clock, celestial knowledge, rituals/events
Nexus	Current	Channel	Posts	Live feed, community boards, sovereign posts
Text	Contacts	Messages	Groups	Encrypted chats, friend management, guilds
Vitae	Grade	Path	Mastery	Journey mapping; DLC stub (Grade 1 not yet released)

─────────── BOTTOM HALF: MODULES & REWARD SYSTEM ───────────
2) Hope Module

Purpose: User guide, onboarding companion, evolving avatar
Sub-pages: Inventory | Character | Stylize
Access/Gates:

Inventory: ACC to claim/mint; guests see lock hints

Character: open for all; ACC unlocks growth/progression

Stylize: ACC required to customize avatar
UI Hooks: Global header/footer + pip strip; floating 3D tile
Rewards: No direct MANA system; indirect via guidance and chain code activation

3) Tempus Module

Purpose: Cosmological & ritual engine
Sub-pages: Codex (ACC-gated) | Clock (default) | Calendar (ACC/MANA gated)
Access/Gates:

Codex: ACC to save/favorite entries

Clock: read-only

Calendar: ACC to interact; MANA to create events

Reward System:

Solar Layer: 12 items/lore (one per zodiac)

Lunar Layer: 96 reflections (emotes, backgrounds, banners, auras)

Planetary Layer: 63 assets via 45-week invocation cycle

Total MANA (perfect play): 11,280/year

Seasonal Orbs: 4 quadrants, progress-only, brightness tracks completion

Daily invocations yield planetary MANA + assets every 5 invocations

4) Nexus Module

Purpose: Mystic social network
Sub-pages: Posts (MANA) | Current (default) | Channels (ACC)
Access/Gates:

Posts: MANA required to create, guests read-only

Current: read-only for guests; ACC can like/follow/share

Channels: ACC required to join/follow
UI Hooks: Header/footer + pip strip
Rewards: No direct MANA reward; engagement indirectly supports social visibility

5) Text Module

Purpose: Encrypted messaging & guild communication
Sub-pages: Contacts (ACC) | Messages (ACC) | Groups (MANA)
Access/Gates:

Contacts: ACC required to add friends

Messages: ACC required to chat

Groups: MANA required to join/create
UI Hooks: Header/footer + pip strip
Rewards: No direct MANA; incentivizes engagement for ACC users

6) Vitae Module (Stub for DLC)

Purpose: Personal mastery & spiritual journey
Sub-pages: Grade | Path | Mastery
Access/Gates:

Grade: read-only for guests; ACC+MANA required to unlock

Path: overview open; ACC unlocks progression tracking

Mastery: ACC required for practice logs & skill unlocks
Notes: Grade 1 “The Guardian” DLC not yet launched; UI fully prepared for stub
UI Hooks: Header/footer + pip strip
Rewards: Will integrate with MANA (exercise completions, mastery progression)
Status: Stubbed; Grade 1 DLC will activate later

7) Universal Acceptance Criteria

Header/Footer sticky, content scrolls with padding (pt-14 pb-16)

Footer icons reflect active/inactive + glow + tile pop

Pips snap instantly; tap/swipe both switch sub-pages

ACC Onboarding modal appears on restricted action

OrbitCarousel removed; FullCard used for card display

MANA gate rules enforced per module specification