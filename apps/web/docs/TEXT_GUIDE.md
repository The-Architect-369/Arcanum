# TEXT_GUIDE.md (v1 Merged)

_Date:_ 2025-10-02  
_Status:_ Merged RC (3 tabs)

## 0) Purpose
Define the **Text** module’s sub-pages, access rules, and behaviors. Text is the encrypted messaging and guild communication system of the Arcanum.

---
## 1) Sub-pages (Left→Center→Right)
- **Contacts** | **Messages** | **Groups**
- **Default on enter:** **Messages**
- **Pips & gestures:** per Core UI Guide

---
## 2) Access & Gates
- **Contacts:** read-only for guests; **ACC required** to add friends.
- **Messages:** read-only for guests; **ACC required** to chat.
- **Groups:** read-only for guests; **MANA required** to join/create groups.

---
## 3) Functional Spec
### 3.1 Contacts
- View list of ACC-bound friends.
- Invite or remove friends (**ACC only**).
- Guest taps → **ACC Onboarding modal**.

### 3.2 Messages (default)
- Direct encrypted chats.
- Supports ephemeral/disappearing messages (toggle).
- Guest can preview interface but cannot send.

### 3.3 Groups
- Multi-user channels and guilds.
- Group creation and joining require **MANA**.
- Future support for geo-local clusters.

---
## 4) UI Hooks
- Global header/footer and pip strip.
- Notification badge dot can appear on Text footer icon (with count).

---
## 5) Out-of-Scope (v1)
- Media-heavy chat (video/audio streams).
- Federation with outside messengers.
