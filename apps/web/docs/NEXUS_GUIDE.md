# NEXUS_GUIDE.md (v1 Merged)

_Date:_ 2025-10-02  
_Status:_ Merged RC (3 tabs)

### Shared Imports
Nexus modules rely on shared helpers and token layers:
```ts
import { cn } from "@shared/lib/cn";
import "@shared/styles/tokens.css";
```

## 0) Purpose
Define the **Nexus** module’s sub-pages, access rules, and behaviors. Nexus is the mystic social network of the Arcanum.

---
## 1) Sub-pages (Left→Center→Right)
- **Posts** | **Current** | **Channels**
- **Default on enter:** **Current**
- **Pips & gestures:** per Core UI Guide

---
## 2) Access & Gates
- **Posts:** MANA required to create; read-only for guests
- **Current:** read-only for guests; ACC users can interact
- **Channels:** ACC required to join/follow
- Guest action → ACC Onboarding modal

---
## 3) Functional Spec
### 3.1 Posts
- User’s sovereign content archive
- Guest can view; posting requires MANA
- Boost mechanics TBD

### 3.2 Current (default)
- Live feed of global posts
- Read-only for guests; interactive for ACC users (like, follow, share)

### 3.3 Channels
- Community boards and thematic streams
- Users can join/follow if ACC
- Guest action → ACC Onboarding modal

---
## 4) UI Hooks
- Global header/footer and pip strip
- Notification badge dot can appear on Nexus footer icon

---
## 5) Out-of-Scope (v1)
- Advanced moderation suite (handled by separate team)
- Algorithmic feed ranking (default chronological)
