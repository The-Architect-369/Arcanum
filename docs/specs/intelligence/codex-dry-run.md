---
title: "Codex Dry-Run Service"
status: canonical-draft
visibility: public
last_updated: 2026-06-08
phase: "Pre-Genesis"
layer: "Application / Intelligence"
description: "Defines the first non-autonomous Codex dry-run implementation, demo route, and agent registry posture."
---

# Codex Dry-Run Service

## Purpose

The Codex dry-run service is the first callable implementation surface for the Arcanum intelligence layer.

It turns approved inputs into review-required interpretation records without calling a live model by default.

This lets Arcanum test the shape of intelligence records before online or local model providers are activated.

## Current code surface

```text
apps/web/src/lib/intelligence/types.ts
apps/web/src/lib/intelligence/policy.ts
apps/web/src/lib/intelligence/providers.ts
apps/web/src/lib/intelligence/adapters.ts
apps/web/src/lib/intelligence/records.ts
apps/web/src/lib/intelligence/codex.ts
apps/web/src/lib/intelligence/agents.ts
apps/web/src/lib/intelligence/index.ts
apps/web/src/app/(app)/intelligence/codex/page.tsx
```

## Demo route

The first visual inspection surface is:

```text
/intelligence/codex
```

This route renders a static Pre-Genesis Codex dry-run record using only:

- `repo_public` sources
- `system_generated` sources

It does not request user-private data.
It does not call an online model.
It does not require secrets.
It does not execute autonomous actions.

The route is intended for internal development inspection and should not be treated as a public product surface yet.

## Runtime posture

The default provider is disabled.

The disabled provider returns a low-confidence dry-run response stating that no model-generated interpretation occurred.

This is intentional.

Pre-Genesis intelligence should prove boundaries before proving capability.

## Codex dry-run flow

1. Caller prepares `CodexDryRunInput`.
2. Sources are checked for user approval requirements.
3. A Codex prompt is created.
4. The provider adapter interprets the prompt.
5. The result is wrapped as an `InterpretationRecord`.
6. The record is marked `review_required`.

Records are not actions.

## Consent boundary

Sources marked `user_private` or `user_approved` require explicit approval before Codex handoff.

If approval is missing, the dry-run service throws and does not produce a Codex record.

## Agent registry posture

The first registry includes:

- `codex-system-audit` — dry-run only
- `hope-consent-handoff` — disabled

Agents may define intent, allowed inputs, and forbidden actions.

Agents may not execute autonomously during Pre-Genesis.

## Forbidden in this phase

```text
autonomous execution
transaction signing
MANA movement
governance action
repository writes without explicit Human Architect request
identity scoring
Vitae acceleration
silent surveillance
```

## Next activation gate

Before adding a real online provider adapter, the app must have:

- explicit provider selection,
- visible network/data disclosure,
- user consent for any user-derived source,
- server/client boundary review,
- environment-variable handling that does not expose secrets to the browser.

Before adding a local/offline provider adapter, the app must have:

- model runtime target identified,
- device/node resource limits documented,
- deterministic fallback to disabled provider,
- storage boundary review.

## Verification

After changes to this surface, run:

```bash
pnpm -C apps/web typecheck
pnpm -C apps/web build
bash scripts/repo-index.sh
bash scripts/verify-sync.sh
bash scripts/doctrine-guard.sh
```

## Canonical closure

Codex may help the system understand.

Codex may not decide.
