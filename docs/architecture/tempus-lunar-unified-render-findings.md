---
title: "Tempus Solar + Lunar Unified Render Findings"
status: design-candidate
visibility: public
last_updated: 2026-08-24
phase: Pre-Genesis
authority: non-canonical rendering and falsification evidence
---

# Purpose

Record findings from the first unified Tempus render in which the Sun and Moon occupy the same neutral 72-sector shell while retaining different architectural roles.

Primary registry:

- `docs/architecture/registries/tempus-lunar-ephemeris-overlay.v0.1.json`

Primary audit:

- `docs/architecture/tempus-lunar-gate-audit.md`

# Render grammar

The prototype renders:

```text
outer dodecahedron
    = Tempus zodiac/celestial shell

inner dual icosahedron
    = exact Tempus carrier scaffold

solar marker
    = apparent geocentric Sun longitude

ARCnet stellar frame
    = rigid frame transported at solar marker

lunar carrier-base marker
    = apparent geocentric Moon longitude

lunar latitude marker
    = signed presentation offset preserving beta_moon

Sun–Moon chord
    = derived relative-phase display only
```

The phase chord is explicitly **not** an ARCnet edge, Edge Contract, or executable relationship.

# Current capture

At `2026-08-24T07:26:00Z`, the local reproducible prototype gives:

```text
Sun
  151.169235°
  Virgo
  sector 31
  quinary 1

Moon
  287.121949°
  Capricorn
  sector 58
  quinary 4
  latitude -3.588200°

Sun–Moon
  delta longitude 135.952714°
  true elongation ~135.836709°
  illuminated ~85.93%
  waxing gibbous
```

The Moon is therefore visibly elsewhere on the same shell while ARCnet remains attached to the Sun-derived carrier point.

Finding: **same shell / separate trajectory is perceptually legible — PASS.**

# Motion result

The full-year local prototype samples the research ephemeris every three hours and interpolates between samples.

When played:

- the Sun advances slowly through one annual circuit;
- ARCnet follows the Sun;
- the Moon repeatedly overtakes and separates from the Sun;
- lunar latitude oscillates independently;
- illuminated fraction changes according to Sun–Moon geometry;
- ARCnet local structure does not change.

This visually demonstrates the intended Tempus principle:

> **Tempus is a field of concurrent cycles, not one master clock.**

# Latitude result

The lunar longitude point is shown on the neutral carrier.

A separate dashed stem leads to a secondary Moon marker whose displacement encodes signed lunar ecliptic latitude.

This offset is intentionally not calibrated as physical distance.

Its purpose is to prevent the longitude shell from erasing a coordinate that matters to actual alignment.

Finding: **latitude preservation as secondary projection — BOUNDED PASS.**

Candidate law:

> **A Preserved Coordinate May Be Projected Without Becoming Physical Geometry.**

# Eclipse falsification

The renderer contains an August 28, 2026 greatest-eclipse checkpoint from NASA's published event time.

At that point the prototype shows:

```text
Sun–Moon longitude difference ≈ 179.95°
Moon latitude ≈ +0.46°
Moon illumination ≈ 100%
```

The configuration makes clear that:

```text
full/opposition
is necessary phase context
but
is not a complete eclipse model
```

Finding: **one-dimensional eclipse inference — FAIL.**

Finding: **longitude + latitude + separately sourced eclipse context — PASS.**

# Rejected lunar-driven ARCnet comparison

The local renderer includes an optional translucent/dashed ghost ARCnet frame at the lunar marker.

This exists solely to visualize the rejected model:

```text
Moon position
→ move ARCnet
```

The canonical design-candidate transport remains:

```text
Sun position
→ ARCnet presentation position

Moon position
→ Tempus context only
```

The ghost does not exist in runtime semantics and has no capability effects.

Finding: **role separation survives direct visual comparison — PASS.**

# Phase semantics

The renderer displays illuminated fraction and a plain-language lunar phase label.

It does not display:

- readiness;
- good/bad timing;
- participant growth/decline;
- recognition;
- authority;
- MANA;
- missed windows;
- personality claims.

Candidate law:

> **Waxing and Waning Describe Illumination, Not Human Becoming.**

# ARCnet invariance

Across the full-year scrubber, lunar motion never changes:

- ARCnet system identities;
- local stellar-cube coordinates;
- generative/stewardship tetrahedron membership;
- mirror axes;
- relation classes;
- derived inner junctions;
- Human/Identity center status;
- Edge Contract requirements;
- authority boundaries.

Finding: **lunar-context invariance — PASS.**

# Accessibility / geometry-free equivalence

All rendered state is also displayed textually as:

```text
UTC
Sun longitude / sign / sector / quinary / decan
Moon longitude / sign / sector / quinary / decan
Moon latitude
Sun–Moon relative longitude
true elongation
illumination
plain phase label
ARCnet carrier = Sun only
Vitae effect = none
```

Reduced-motion users can use the scrubber without playback.

Finding: **geometry-free equivalence — PASS.**

# Disposition

The render supports the registry's **BOUNDED PASS**.

The visual system now has a coherent grammar for two factual astronomical cycles:

```text
solar trajectory
    carries ARCnet

lunar trajectory
    moves independently

relative Sun–Moon geometry
    produces phase context

lunar latitude
    preserves alignment information
```

No cycle becomes participant authority.

# Strongest next gate

Reintroduce Vitae as an **event-driven** coordinate while both celestial trajectories continue moving.

The target demonstration is:

```text
Sun continuously changes
Moon continuously changes faster
phase continuously changes
Vitae remains fixed
ARCnet remains solar-carried

participant explicitly records/practices a Vitae event
        ↓
Vitae coordinate changes discretely
        ↓
Sun / Moon are merely captured as TempusContext
```

This is the next scale-separation test before attempting any deeper relationship between the Tempus dual icosahedron and the separate Vitae icosahedral corpus atlas.
