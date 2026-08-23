---
title: "Tempus 72-Sector Coordinate and Dodecahedral Render Findings"
status: design-candidate
visibility: public
last_updated: 2026-08-23
phase: Pre-Genesis
authority: non-canonical architecture and rendering evidence
---

# Purpose

Record the first exact seventy-two-row Tempus coordinate registry and its provenance-aware dodecahedral renderer.

# Artifacts

- `docs/architecture/registries/tempus-72-sector-coordinate.v0.1.json`
- `docs/architecture/renderings/tempus-72-sector-dodecahedral-compass-v0.1.html`
- parent source audit: `docs/architecture/tempus-72-correspondence-source-audit.md`
- source-strata registry: `docs/architecture/registries/tempus-72-correspondence-source-registry.v0.1.json`

# Exact coordinate result

The base coordinate now materializes exactly:

```text
12 zodiac faces
× 6 quinaries per face
= 72 sectors

72 sectors
× 5 degrees
= 360 degrees

72 sectors
÷ 2
= 36 decans

72 symbolic pentads
× 5 ordinal days
= 360 symbolic calendar days
```

Every sector carries a neutral ordinal coordinate before any historical correspondence is attached.

Validation passes:

- 72 unique sector rows;
- six sectors on every zodiac face;
- two sectors in every decan;
- angular coverage from 0° through 360° without gaps;
- symbolic-day coverage from 1 through 360 without gaps.

# Dodecahedral rendering

The renderer uses one chronology/opposition-preserving face orientation from the earlier dodecahedron audit.

Each selected zodiac face displays six nested pentagonal contours as a **presentation grammar** for its six quinaries.

This does not claim that Agrippa, Reuchlin, Lenain, Egyptian astrologers, or any other historical source drew the quinaries as six nested pentagons.

The pentagonal nesting is an Arcanum visualization chosen because it allows the dodecahedral face to expose six ordered five-unit sectors without manufacturing additional face-edge semantics.

Candidate law:

> **Historical Coordinate May Use a New Renderer Without Becoming a Historical Diagram.**

# Decan bridge

Adjacent quinary pairs are grouped as:

```text
Q1 + Q2 → decan 1
Q3 + Q4 → decan 2
Q5 + Q6 → decan 3
```

This produces the exact `12 × 3 = 36` decan bridge.

The bridge is mathematically compatible with the ten-unit decan / five-unit quinary comparison established in the source audit, but it does not erase the independent histories of decanal and quinary systems.

# Historical overlays

The base row may expose optional historical display metadata:

- comparative Schem triplet transliteration;
- Schem/Reuchlin-Agrippa display name;
- Sloane MS 3825 / Peterson Goetic display name.

The Goetic name is not intrinsic to the neutral coordinate and is not automatically paired with the angelic/Schem display name.

The renderer exposes the same-index angel ↔ Goetic view only as the explicitly labeled later pairing overlay.

Candidate law:

> **Shared Index Becomes a Relationship Only Inside the Overlay That Defines It.**

# Five degrees versus five days

The registry carries both angular and symbolic calendar fields so they can be compared without being conflated.

```text
sector angular width = 5°
symbolic pentad width = 5 ordinal days
```

These are separate coordinate projections.

The current renderer shows the angular/quinary structure directly. The five-day calendar projection remains a data field and future calendar layer until a solar-year reconciliation strategy is chosen.

# Accessibility and geometry-free equivalence

The render is optional.

Every selected sector is also expressed as ordinary text:

- sector number;
- zodiac face;
- quinary number;
- angular interval;
- decan bridge;
- symbolic-day interval;
- selected provenance overlay.

No information required for authority or historical provenance depends on spatial navigation.

# Disposition

**PASS as a neutral 72-sector Tempus coordinate and optional dodecahedral presentation.**

The render does not promote the dodecahedron to the whole Tempus ontology and does not establish astrological causation, personality, recognition, Vitae readiness, governance, Treasury authority, neuroscience, or physical cosmology.

# Next gates

1. Add an ephemeris-aware solar-longitude anchor so the neutral angular sector can be compared with an actual captured astronomical position without confusing normalized angle with civil date.
2. Choose a 360-day solar reconciliation policy before rendering five civil-day pentads as an annual calendar.
3. Audit exact Hebrew-letter triplet encoding and historical spelling variants if the UI is to display Hebrew rather than only comparative Roman transliteration.
4. Add a separate historical overlay registry for decan names/spirits rather than placing them in the neutral sector registry.
5. Test the transported ARCnet stellar frame inside the dodecahedral Tempus compass while preserving `Pose Is Not Permission` and `Time May Move the Frame Through Context; It May Not Rewrite the Frame.`
