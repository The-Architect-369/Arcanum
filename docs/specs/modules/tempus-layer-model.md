---
title: "Tempus Layer Model"
status: canonical-draft
visibility: public
last_updated: 2026-06-04
description: "Defines the user-facing Tempus progression from practical calendar to seasonal, lunar, planetary, zodiac, decanic, and ceremonial layers."
phase: "Pre-Genesis"
layer: "App / Tempus"
---

# Tempus Layer Model

## Purpose

This document defines the layered Tempus experience.

Tempus should begin as a useful calendar and gradually reveal deeper symbolic context only when the participant chooses to engage it.

The model preserves ordinary usability while allowing depth:

```text
Calendar
  ↓
Solar / Seasonal
  ↓
Lunar
  ↓
Planetary + Zodiac
  ↓
Decanic
  ↓
Ceremonial / Solomonic
  ↓
Rites / Receipts / Optional Utility
```

Tempus is a dial, not a demand.

## Constraint sources

This document is subordinate to:

- `docs/modules/tempus/tempus-structure.md`
- `docs/specs/app/tempus-windows.md`
- `docs/specs/modules/tempus-earning-policy.md`
- `docs/specs/economy/mana-lifecycle.md`
- `docs/specs/economy/rites-credit.md`
- `docs/doctrine/temporal-model.md`

## Core principle

Every participant should be able to stop at the layer that serves them.

The system may reveal depth.

It must not require belief, performance, or escalation.

## Layer 0 — Civic Calendar

The default Tempus layer is practical time.

It includes:

- days,
- weeks,
- months,
- years,
- local events,
- reminders,
- user-created calendar entries,
- simple open/rest/silent window labels where appropriate.

This layer must remain broadly useful without symbolic interpretation.

Access posture:

```text
available by default
no MANA required
no Vitae requirement
no symbolic belief required
```

## Layer 1 — Solar / Seasonal Rhythm

The first symbolic layer is solar and seasonal.

It introduces:

- seasons,
- equinoxes,
- solstices,
- month/season flow,
- day/night emphasis,
- yearly cycle orientation.

This layer is grounded in observable time and should be presented gently.

Access posture:

```text
available by default or early opt-in
no pressure
no reward race
no required rite
```

## Layer 2 — Lunar Rhythm

The lunar layer adds the moon as a visible cyclical companion.

It includes:

- new moon,
- waxing crescent,
- first quarter,
- waxing gibbous,
- full moon,
- waning gibbous,
- third quarter,
- waning crescent,
- lunar month context,
- approximately thirteen full-moon cycles per solar year.

This layer may support reflective prompts, but prompts must remain optional.

Access posture:

```text
free or low-friction opt-in
no penalty for ignoring lunar prompts
no automatic reward for timed compliance
```

## Layer 3 — Planetary + Zodiac Correspondence

This layer introduces archetypal correspondences.

It may include:

- zodiac season,
- zodiac day within sign,
- planetary day,
- planetary hour where implemented,
- moon zodiac,
- planetary tone,
- symbolic posture.

This layer should be framed as cultural, symbolic, reflective, and optional.

It must not claim causal authority over the participant.

Access posture:

```text
optional deeper layer
may be unlocked by MANA as a utility/codex layer
must not imply superiority over users who do not unlock it
```

## Layer 4 — Decanic Layer

The decanic layer divides zodiac seasons into smaller symbolic segments.

It may include:

- 36 decans,
- approximate 10-degree / 10-day symbolic spans,
- elemental refinements,
- planetary or traditional rulers where documented,
- deeper Codex entries,
- optional rite modifiers.

This layer should not be enabled before the base solar, lunar, zodiac, and planetary layers are understandable.

Access posture:

```text
advanced optional layer
may require MANA unlock or Vitae-informed readiness gate
no required use
no pressure to complete all decans
```

## Layer 5 — Ceremonial / Solomonic Layer

This is the deepest symbolic layer.

It may include ceremonial correspondences such as:

- angelic names,
- demonic names,
- archangelic associations,
- planetary intelligences or spirits where historically sourced,
- ceremonial seals or symbolic references,
- advanced Codex material,
- deeper rites or contemplative structures.

This layer must be handled with additional care.

It should be gated by explicit opt-in and may require Vitae readiness, age/consent boundaries, or governance-approved content safeguards.

Access posture:

```text
advanced opt-in only
not enabled by default
not shown to casual users unexpectedly
may require Vitae / MANA / explicit consent gates
must include grounding and exit paths
```

## Layer 6 — Rites, Receipts, and Optional Utility

Rites are the action layer.

They may be generated from active context:

```text
season + lunar phase + zodiac sign + planetary day/hour + selected depth
```

Rites may produce factual local receipts or future ARCnet receipts only when the participant chooses to act.

Rites must remain:

- optional,
- non-coercive,
- non-punitive,
- non-comparative,
- non-diagnostic,
- non-authority-granting by themselves.

Access posture:

```text
optional participation
possible RITES eligibility only under explicit policy
MANA only for utility, not worth or readiness
```

## User depth control

The UI should expose a clear depth control.

Suggested levels:

```text
Grounded
Seasonal
Lunar
Celestial
Decanic
Ceremonial
```

The participant may reduce depth at any time.

The system should remember preference locally, but should never trap the user in an intense symbolic layer.

## Default safety posture

Default experience:

```text
Calendar + Seasonal
```

Not default:

```text
ceremonial names
advanced spirits
reward prompts
high-intensity rites
```

If the user feels overwhelmed, the app should allow immediate return to Grounded or Seasonal view.

## Economic boundary

MANA may unlock optional depth, content packs, Codex entries, visual layers, event tools, or advanced utilities.

MANA must not unlock:

- readiness,
- dignity,
- superiority,
- Vitae recognition,
- authority,
- forced progression.

## Vitae boundary

Vitae may gate advanced ceremonial depth if governance chooses that path.

This means:

- readiness is reviewed retrospectively,
- local curiosity remains valid,
- paid access alone is insufficient for restricted depth,
- no symbolic layer automatically advances Vitae.

## Implementation order

Recommended order:

1. Civic calendar and seasonal view.
2. Lunar phase context.
3. TempusContext capture.
4. Planetary/zodiac overlay controls.
5. Deterministic rite suggestion engine.
6. RITES local scaffold.
7. Decanic Codex entries.
8. Ceremonial content safeguards.
9. ARCnet factual receipts.

## Canonical closure

Tempus should meet the participant at ordinary time.

Then, only by choice, it may open the heavens.

The dial belongs to the participant.