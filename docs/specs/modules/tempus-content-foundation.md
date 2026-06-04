---
title: "Tempus Content Foundation"
status: canonical-draft
visibility: public
last_updated: 2026-06-04
description: "Defines the content model for Tempus layers, rites, prompts, Codex entries, and optional depth without coercive timing mechanics."
phase: "Pre-Genesis"
layer: "App / Tempus / Content"
---

# Tempus Content Foundation

## Purpose

This document defines the first content foundation for Tempus.

Tempus content should help a participant understand time, observe rhythm, and optionally engage rites or reflections.

Content must not pressure, diagnose, shame, or rank the participant.

## Constraint sources

This document is subordinate to:

- `docs/specs/modules/tempus-layer-model.md`
- `docs/modules/tempus/tempus-structure.md`
- `docs/specs/modules/tempus-earning-policy.md`
- `docs/specs/app/tempus-windows.md`
- `docs/specs/economy/rites-credit.md`

## Content classes

Tempus content should be organized into the following classes:

```text
calendar_label
seasonal_note
lunar_note
planetary_note
zodiac_note
decanic_note
ceremonial_note
rite_prompt
codex_entry
receipt_summary
```

Each class should declare its depth and safety posture.

## Depth levels

```text
grounded
seasonal
lunar
celestial
decanic
ceremonial
```

The default content depth should be `seasonal` or lower.

## Content fields

A Tempus content entry should include:

```ts
export type TempusContentDepth =
  | 'grounded'
  | 'seasonal'
  | 'lunar'
  | 'celestial'
  | 'decanic'
  | 'ceremonial'

export type TempusContentEntry = {
  id: string
  kind:
    | 'calendar_label'
    | 'seasonal_note'
    | 'lunar_note'
    | 'planetary_note'
    | 'zodiac_note'
    | 'decanic_note'
    | 'ceremonial_note'
    | 'rite_prompt'
    | 'codex_entry'
    | 'receipt_summary'
  depth: TempusContentDepth
  title: string
  summary: string
  body?: string
  tags: string[]
  optional: true
  pressure: 'none'
  rewardMode: 'none' | 'rites_eligible'
  safetyNote?: string
}
```

## Rite fields

A rite is a content entry that invites voluntary action.

```ts
export type TempusRite = {
  id: string
  title: string
  depth: TempusContentDepth
  prompt: string
  posture: string
  contextTags: string[]
  estimatedMinutes?: number
  optional: true
  pressure: 'none'
  rewardMode: 'none' | 'rites_eligible'
  receiptType?: 'tempus_action_recorded'
}
```

## Rite generation principle

Rites should be generated from context, not command.

A safe first generator:

```text
season + lunar phase + planetary day → suggested rite
```

A deeper future generator:

```text
season + lunar phase + zodiac sign + planetary day/hour + decan + selected depth → suggested rite
```

The result must be presented as invitation.

## Starter content map

### Seasonal rites

Spring:

- begin one small thing,
- clear one blocked channel,
- name what is waking.

Summer:

- nourish one living commitment,
- offer warmth without excess,
- protect energy from scattering.

Autumn:

- harvest one lesson,
- release one unneeded burden,
- give thanks for completed effort.

Winter:

- preserve the ember,
- rest without guilt,
- prepare one seed quietly.

### Lunar rites

New Moon:

- seed quietly,
- name an intention privately,
- begin without announcement.

Waxing Crescent:

- protect the beginning,
- remove one obstacle,
- gather what is needed.

First Quarter:

- choose and commit,
- take one concrete step,
- resolve one hesitation.

Waxing Gibbous:

- refine the offering,
- revise with care,
- strengthen the form.

Full Moon:

- reveal and witness,
- notice what is illuminated,
- honor what has become visible.

Waning Gibbous:

- share the harvest,
- teach one lesson,
- offer gratitude.

Third Quarter:

- release and correct,
- return what is not yours,
- simplify the path.

Waning Crescent:

- rest and dissolve,
- close a loop,
- let silence restore.

### Planetary tones

Sun:

- create,
- clarify,
- bless.

Moon:

- receive,
- remember,
- soften.

Mars:

- act,
- protect,
- sever cleanly.

Mercury:

- name,
- translate,
- exchange.

Jupiter:

- teach,
- widen,
- offer.

Venus:

- beautify,
- relate,
- reconcile.

Saturn:

- contain,
- discipline,
- endure.

## Example generated rites

### Seasonal + Lunar

Spring + Waxing Crescent:

```text
Protect one beginning. Name the smallest support it needs and give it that support today.
```

Winter + Waning Crescent:

```text
Let one unfinished thread rest. Record what must be preserved, then release urgency.
```

### Lunar + Planetary

Full Moon + Mercury:

```text
Reveal one truth by naming it clearly. Write it in plain language without ornament.
```

New Moon + Saturn:

```text
Set one boundary around a seed. Decide what will not be allowed to consume it.
```

### Seasonal + Lunar + Planetary

Autumn + Third Quarter + Venus:

```text
Release one imbalance gently. Restore right relation through one small act of repair.
```

Summer + Full Moon + Jupiter:

```text
Share one mature lesson. Offer it generously without requiring agreement.
```

## Ceremonial content safeguards

Ceremonial content must be opt-in and clearly marked.

It should include:

- grounding language,
- exit path,
- no fear claims,
- no spiritual threat language,
- no promise of power,
- no claim of required obedience.

Ceremonial names or correspondences should be treated as historical, symbolic, or ritual-cultural material unless a future governance-approved source policy says otherwise.

## Economy boundary

Content may be unlocked by MANA when it is optional utility or Codex depth.

Content unlocks must not imply:

- superiority,
- readiness,
- Vitae advancement,
- authority,
- required belief.

## Receipt boundary

A completed optional rite may create a factual receipt.

Allowed receipt:

```text
Participant recorded the rite prompt at this time.
```

Forbidden receipt:

```text
Participant became better, advanced, purified, worthy, or ready.
```

## Canonical closure

Tempus content should invite attention.

It should not demand performance.

The deepest layers may be beautiful.

The simplest layer must remain enough.