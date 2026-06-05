---
title: "Tempus Context Schema"
status: canonical-draft
visibility: public
last_updated: 2026-06-04
description: "Defines the app-facing TempusContext, layer-depth, and rite-record schemas used to connect Tempus content with Vitae, RITES, and future ARCnet receipts."
phase: "Pre-Genesis"
layer: "App / Tempus / Schema"
---

# Tempus Context Schema

## Purpose

This document defines the implementation-facing schema for Tempus context capture.

TempusContext records the factual temporal and symbolic context available at a chosen moment.

It does not interpret the human.

## Constraint sources

This document is subordinate to:

- `docs/specs/modules/tempus-layer-model.md`
- `docs/specs/modules/tempus-content-foundation.md`
- `docs/specs/modules/tempus-earning-policy.md`
- `docs/modules/tempus/tempus-structure.md`
- `docs/specs/app/tempus-windows.md`

## Core principle

TempusContext may describe the moment.

TempusContext must not describe the worth, readiness, status, or destiny of the participant.

## TypeScript target

A first implementation should create:

```text
apps/web/src/lib/tempus/context.ts
```

## Layer types

```ts
export type TempusLayer =
  | 'calendar'
  | 'solar'
  | 'lunar'
  | 'zodiac_planetary'
  | 'decanic'
  | 'ceremonial'
  | 'rite'
  | 'utility'

export type TempusDepth =
  | 'grounded'
  | 'seasonal'
  | 'lunar'
  | 'celestial'
  | 'decanic'
  | 'ceremonial'
```

## TempusContext

```ts
export type TempusContext = {
  version: 'tempus.context.v0.1'
  capturedAt: string
  timezoneOffsetMinutes: number

  phase: 'open' | 'rest' | 'silent'
  isDay: boolean

  solar: {
    season: 'spring' | 'summer' | 'autumn' | 'winter'
    isEquinox?: boolean
    isSolstice?: boolean
  }

  lunar: {
    phase: string
    moonZodiac: string
  }

  zodiac: {
    sign: string
    dayOfSign: number
  }

  planetary: {
    day: string
    hour?: string
  }

  layers: {
    active: TempusLayer[]
    depth: TempusDepth
  }

  precision: 'mvp-table' | 'ephemeris'
  source: 'local-device'
  interpretation: null
}
```

## Capture function

```ts
export function captureTempusContext(
  date = new Date(),
  options: {
    depth?: TempusDepth
    activeLayers?: TempusLayer[]
  } = {}
): TempusContext
```

The function should:

1. call `computeWindowState(date)`,
2. derive solar season from the date,
3. derive active layers from depth,
4. record `capturedAt` as ISO timestamp,
5. set `interpretation: null`,
6. use `precision: 'mvp-table'` until ephemeris support exists.

## Required implementation fix

Before TempusContext is used for deterministic records, `computeWindowState(date)` should pass the provided date into lunar calculation.

Current behavior should change from:

```ts
const lunar = getLunarState(new Date())
```

to:

```ts
const lunar = getLunarState(nowLocal)
```

This makes replay and calendar rendering deterministic.

## Depth-to-layer mapping

Suggested default mapping:

```ts
export const TEMPUS_DEPTH_LAYERS: Record<TempusDepth, TempusLayer[]> = {
  grounded: ['calendar'],
  seasonal: ['calendar', 'solar'],
  lunar: ['calendar', 'solar', 'lunar'],
  celestial: ['calendar', 'solar', 'lunar', 'zodiac_planetary'],
  decanic: ['calendar', 'solar', 'lunar', 'zodiac_planetary', 'decanic'],
  ceremonial: ['calendar', 'solar', 'lunar', 'zodiac_planetary', 'decanic', 'ceremonial'],
}
```

## Rite record

A chosen rite may attach TempusContext.

```ts
export type TempusRiteRecord = {
  id: string
  riteId: string
  title: string
  recordedAt: string
  context: TempusContext
  notes?: string
  receiptStatus: 'local_only' | 'queued' | 'anchored'
  rewardMode: 'none' | 'rites_eligible'
  interpretation: null
}
```

## Vitae bridge

Vitae practice sessions may later attach TempusContext.

Allowed:

```ts
tempusContext?: TempusContext
```

Forbidden:

```ts
readinessScoreFromTempus
worthFromTiming
advancementFromWindow
```

Tempus may provide timing context for later review.

It may not grant recognition.

## RITES bridge

If a rite is eligible for RITES, the record may include:

```ts
rewardMode: 'rites_eligible'
```

This does not guarantee MANA.

It means only that a future governed RITES policy may evaluate the factual record.

## ARCnet bridge

A future ARCnet receipt may include a hash of TempusContext.

Allowed receipt fields:

```json
{
  "type": "tempus_action_recorded",
  "occurred_at": "ISO-8601 timestamp",
  "context_hash": "hash",
  "rite_id": "string",
  "meaning": null
}
```

Forbidden fields:

```json
{
  "readiness": 1,
  "worth": "high",
  "advanced": true,
  "failed_window": true
}
```

## Privacy posture

Private notes must remain local by default.

TempusContext should avoid sensitive personal data.

Only factual timing and chosen symbolic context should be included.

## Canonical closure

The context may be rich.

The judgment must be absent.

Tempus records the shape of the moment.

The being remains sovereign.