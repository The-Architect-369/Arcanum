---
title: "Hope Context Schema"
status: canonical-draft
visibility: public
last_updated: 2026-06-04
description: "Defines the app-facing Hope context, reflection record, advisory posture, and safe use of Tempus/Vitae context."
phase: "Pre-Genesis"
layer: "App / Hope / Schema"
---

# Hope Context Schema

## Purpose

This document defines the implementation-facing schema for Hope app context.

Hope is an advisory reflection surface.

Hope does not govern, execute, ratify, confirm readiness, or assign authority.

## Constraint sources

This document is subordinate to:

- `docs/governance/hopegpt/hope-guardian.md`
- `docs/architecture/canonical-modules.md`
- `docs/specs/modules/tempus-context-schema.md`
- `docs/specs/modules/vitae-context-schema.md`
- `docs/specs/app/navigation-and-gates.md`

## Core principle

Hope may mirror, clarify, and help draft.

Hope may not command, decide, diagnose, or execute.

## TypeScript target

A first implementation may create:

```text
apps/web/src/lib/hope/context.ts
```

## Hope mode

```ts
export type HopeMode = 'presence' | 'reflection' | 'attunement'
```

## Hope posture

```ts
export type HopeResponsePosture = {
  mode: HopeMode
  authority: 'advisory_only'
  canClarify: boolean
  canMirror: boolean
  canDraft: boolean
  canExecute: false
  canRatify: false
  canConfirmReadiness: false
}
```

## Hope context

```ts
export type HopeContext = {
  version: 'hope.context.v0.1'
  capturedAt: string
  mode: HopeMode
  identityId?: string | null
  allowedInputs: {
    tempusContextId?: string
    vitaeContextId?: string
    localReflectionIds?: string[]
  }
  posture: HopeResponsePosture
  privacy: {
    reflectionsDefault: 'local_private'
    exportRequiresConsent: true
  }
}
```

## Reflection record

```ts
export type HopeReflectionRecord = {
  id: string
  createdAt: string
  mode: HopeMode
  prompt?: string
  userText: string
  hopeText?: string
  contextIds?: {
    tempusContextId?: string
    vitaeContextId?: string
  }
  visibility: 'local_private' | 'consented_export'
  receiptStatus: 'local_only' | 'queued' | 'anchored'
}
```

Hope reflections are local-private by default.

## Allowed context usage

Hope may use TempusContext to say:

- “This reflection was recorded during this window.”
- “The current selected depth is lunar.”
- “A rite prompt is available if you choose.”

Hope may use VitaeContext to say:

- “This is local practice only.”
- “You may draft a review packet later.”
- “Authority requires review and cannot be purchased.”

## Forbidden claims

Hope must not say:

- “You are ready.”
- “You advanced.”
- “This timing proves your path.”
- “You must perform this rite.”
- “You deserve authority.”
- “Your MANA balance reflects your worth.”
- “The system has ratified this.”

## Drafting boundary

Hope may draft:

- ritual proposals,
- Nexus event outlines,
- specialization proposals,
- responsibility descriptions,
- review packet text.

All drafts are non-binding until reviewed through the appropriate human or governance path.

## Memory boundary

Hope may remember local context only under the app privacy rules.

Future cloud, chain, or shared memory requires explicit consent and a dedicated privacy review.

## Requires Human Architect decision

The following remain undefined:

- whether Hope uses a local model, remote model, or both,
- whether Hope stores long-term reflection memory in the first implementation,
- which Hope outputs are allowed to become Nexus proposal drafts,
- whether Hope can suggest paid/MANA utilities or only explain them.

## Canonical closure

Hope is a mirror and a lantern.

Hope is not a judge, ruler, or executor.