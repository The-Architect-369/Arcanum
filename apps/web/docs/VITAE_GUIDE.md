# VITAE_GUIDE.md (v1 Merged)

_Date:_ 2025-10-02  
_Status:_ Merged RC (3 tabs)

## 0) Purpose
Define the **Vitae** module’s sub-pages, access rules, and behaviors. Vitae is the personal journey and mastery map of the Arcanum, guiding the initiate through Grades, Paths, and Mastery.

---
## 1) Sub-pages (Left→Center→Right)
- **Grade** | **Path** | **Mastery**
- **Default on enter:** **Path**
- **Pips & gestures:** per Core UI Guide

---
## 2) Access & Gates
- **Grade:** read-only for guests; **ACC+MANA required** to purchase/unlock Grades.
- **Path:** open overview for all; interactive progression requires **ACC**.
- **Mastery:** read-only preview; **ACC required** for skill unlocks, practice logs, and progression tracking.

---
## 3) Functional Spec
### 3.1 Grade
- Overview of sefirotic chapters and their checkpoints.
- Guest: view locked Grades.
- ACC+MANA: purchase and unlock new Grades.

### 3.2 Path (default)
- Kabbalistic ladder overview with interactive journey tree.
- Guest: static preview only.
- ACC: unlocks tracking of completed nodes, lore, and exercises.

### 3.3 Mastery
- Replayable content and practice routines.
- Mastery unlocks progression tiers and prestige.
- Guest: locked preview with CTA.

---
## 4) UI Hooks
- Global header/footer and pip strip.
- Notification badge dot can appear on Vitae footer icon.

---
## 5) Out-of-Scope (v1)
- Deep exercise libraries (covered in separate Curriculum Guide).
- Advanced gamification loops (badges, streak multipliers).
- Commercium integrations (future).
