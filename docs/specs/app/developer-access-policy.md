---
title: "Developer Access Policy"
status: canonical-draft
visibility: public
last_updated: 2026-06-08
phase: "Pre-Genesis"
layer: "Application / Developer Surface"
description: "Defines the first app-level policy helper for internal Developer surfaces."
---

# Developer Access Policy

## Purpose

This document defines the first access policy for internal Developer surfaces in the Arcanum app.

The initial implementation keeps Developer tools visible during local/development builds while hiding them from production navigation by default.

## Current code surface

```text
apps/web/src/lib/developer/access.ts
apps/web/src/lib/developer/index.ts
apps/web/src/components/ui/AppHeader.tsx
apps/web/src/app/(app)/developer/page.tsx
```

## Current decision logic

Developer access is centralized in:

```ts
canAccessDeveloperSurface()
getDeveloperAccessDecision()
```

Current allowed reasons:

```text
development_mode
architect_mode
trusted_local_node
```

Current hidden reason:

```text
production_hidden
```

Only `development_mode` is active by default through `process.env.NODE_ENV !== 'production'`.

`architect_mode` and `trusted_local_node` are reserved for future policy integration.

## Boundary

The Developer surface is navigational and diagnostic.

It does not grant:

- repository write authority,
- governance authority,
- chain authority,
- MANA movement,
- transaction signing,
- autonomous agent execution,
- identity or Vitae recognition.

## Future gates

Future versions may bind access to:

- explicit Architect role,
- local trusted node state,
- governance-recognized permissions,
- signed session proof,
- development-only environment flags.

Any future gate must remain explicit and reviewable.

## Verification

After changes to this policy, run:

```bash
pnpm -C apps/web typecheck
pnpm -C apps/web build
bash scripts/repo-index.sh
bash scripts/verify-sync.sh
bash scripts/doctrine-guard.sh
```
