# HOPE_GUIDE.md (v1 Merged)

_Date:_ 2025-10-02  
_Status:_ Merged RC (Tabs + Onboarding Detail)

## 0) Purpose
Hope acts as the user’s guide, onboarding companion, and evolving avatar.

---
## 1) Sub-pages (Left→Center→Right)
- **Inventory** | **Character** | **Stylize**
- **Default on enter:** **Character**
- **Pips & gestures:** per Core UI Guide

---
## 2) Role & Placement
- Greets users, explains ACC & MANA, guides activation and security  
- Always available as "Ask Hope" input, guest and trusted

---
## 3) States
- **Guest:** intro, safety, Activate Chain Code ($1) CTA; limited memory  
- **Trusted:** persona sliders, goals, context memory; panel-aware tips

---
## 4) Interactions
- Inline guidance inside MANA / Exchange / Nexus  
- Surfaces Items Vault artifacts from Chain Code  
- Persona sliders shape Hope’s tone

---
## 5) Memory & Privacy
- Default ephemeral prefs  
- Opt-in durable memory  
- Export/erase in Preferences

---
## 6) Hope-led Onboarding
1. Welcome → ACC & MANA intro  
2. Activate ACC ($1) → mint SBT + issue smart wallet + starter MANA  
3. Secure account → passkeys + recovery  
4. Optional wallet linking → set default spend wallet

---
## 7) Functional Spec
### 7.1 Inventory
- Grid/list of items; item detail sheet  
- Claim/Mint actions → ACC-gated; MANA costs TBD

### 7.2 Character (default)
- Intro panels explain ACC, MANA, and modules  
- Soft CTAs route to `/account`

### 7.3 Stylize
- Preview of Hope avatar with locked controls for guests  
- ACC unlocks customization (slots TBD)

---
## 8) UI & Theme
- 3D floating tile on dark orbit; luminous edge; hover tilt  
- Full-screen PanelShell with Back  
- Avatar: `/public/hope/hope.png` (88×88)  
- Reduced-motion aware

---
## 9) Boundaries
- No legal/medical/financial guarantees  
- Defers to providers for KYC/fiat  
- Moderation hooks in Nexus contexts

---
## 10) Acceptance Criteria
- Guest sees intro + CTA  
- Trusted sees tips + persona controls  
- Guidance may reference inventory  
- Persona affects tone

---
## 11) Out-of-Scope (v1)
- Deep avatar editor, full NFT claim rules, pricing — handled in Economy & Avatar guides
