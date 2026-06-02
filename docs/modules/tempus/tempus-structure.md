---
title: "Tempus Structure"
status: canonical
visibility: public
last_updated: 2026-06-02
description: "Implementation-facing structure for Tempus as a non-coercive temporal, calendar, and symbolic orientation layer."
---

# Tempus Structure

## Purpose

Tempus is the temporal structuring layer of Arcanum.

It renders cycles, calendars, windows, and symbolic correspondences so a participant can orient within time without being pressured by time.

Tempus exists to provide:

- rhythmic orientation,
- seasonal grounding,
- cyclical awareness,
- calendar and event surfaces,
- optional symbolic reflection,
- factual temporal context for other modules.

Tempus does not define readiness, worth, superiority, destiny, authority, or Vitae recognition.

## Canonical constraint sources

This document is subordinate to:

- `docs/doctrine/temporal-model.md`
- `docs/specs/app/tempus-windows.md`
- `docs/architecture/app-chain-doctrine.md`
- `docs/governance/economic-principles.md`
- `docs/architecture/canonical-modules.md`

Where older drafts referenced reward contracts, perfect-play rewards, celestial reward triggers, governance participation scoring, or MANA minting from celestial events, those assumptions are superseded.

## Structural layers

| Layer | Purpose | Allowed implementation |
| --- | --- | --- |
| Temporal Grid Layer | Foundational day/week/month/season structure | Calendar views, event windows, local time calculations |
| Astronomical Context Layer | Observable solar/lunar/seasonal context | Lunar phase, day/night, seasonal windows, approximate MVP tables where labeled |
| Symbolic Overlay Layer | Optional cultural/archetypal language | Glyphs, tones, reflective prompts, correspondence library |
| Participation Surface | User-chosen action recording | Optional factual local receipts or future ARCnet factual receipts |
| Utility/Economy Boundary | Explicitly priced optional utility | Event creation, anti-spam, infrastructure costs, feature invocation |

## Current app posture

The current mobile Tempus surface consists of:

- `/tempus/clock`
- `/tempus/calendar`
- `/tempus/codex`

The current implementation may show:

- window phase (`open`, `rest`, `silent`),
- planetary day/hour labels,
- zodiac season/day labels,
- lunar phase labels,
- moon zodiac labels,
- symbolic postures and correspondence cards.

These are orientation signals. They are not commands.

## Symbolic overlay rules

Symbolic overlays may be used when clearly framed as interpretive and optional.

Allowed:

- “Moon has historically symbolized reflection across many cultures.”
- “This calendar view highlights a seasonal transition.”
- “You may choose to record a rite during this window.”

Forbidden:

- “The moon causes reflection.”
- “This season requires you to change.”
- “You missed your chance.”
- “This timing proves readiness.”
- “This celestial event grants authority.”

## MANA and Tempus boundary

Tempus may interact with MANA only through utility-bound, explicitly priced actions.

Allowed:

- optional event creation fees,
- anti-spam costs for public calendar publishing,
- infrastructure costs for anchoring a factual receipt,
- optional feature invocation,
- future bounded participation-credit policy if governed.

Forbidden:

- minting MANA automatically from celestial events,
- perfect-play reward schedules,
- streak multipliers,
- missed-window penalties,
- paying to recover missed windows,
- paying to accelerate time,
- buying Vitae recognition,
- using timing as governance participation scoring.

## ARCnet boundary

If Tempus touches ARCnet, it may emit factual receipts only.

Allowed receipt meaning:

- a user chose to record an action,
- an event was created,
- a public window existed,
- a fee was paid for an explicitly priced utility,
- a receipt was anchored at a time.

Forbidden receipt meaning:

- the user is better,
- the user is worthy,
- the user advanced,
- the user was late,
- the user failed a window,
- the user is cosmologically required to act.

## Vitae boundary

Vitae may use Tempus as temporal context.

Tempus may provide:

- timestamps,
- cycle labels,
- window labels,
- elapsed-time context,
- factual participation receipts.

Tempus may not provide:

- grade advancement,
- readiness decisions,
- authority assignment,
- recognition gates,
- worth or rank.

## Implementation implications

Future Tempus work should prefer:

- deterministic local calculations,
- clearly labeled MVP approximations,
- non-urgent refresh cadences,
- no countdown pressure,
- no streak warnings,
- optional participation recording,
- factual receipt schemas,
- explicit pricing before any MANA spend.

## Superseded assumptions

The following older assumptions are deprecated:

- `RewardTriggerEngine` as automatic celestial-to-MANA logic,
- celestial transits dynamically minting MANA,
- lunar or planetary events granting rewards by default,
- treasury splits tied directly to celestial participation,
- governance participation scoring from activity timestamps,
- perfect-play annual MANA schedules.

Historical drafts remain archived for provenance only.

## Canonical closure

Tempus restores rhythm.

It does not create anxiety.

Tempus may witness time.

It may not judge the being.