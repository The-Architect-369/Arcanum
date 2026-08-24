---
title: "Tempus Lunar Gate Audit"
status: design-candidate
visibility: public
last_updated: 2026-08-24
phase: Pre-Genesis
authority: non-canonical astronomical and architecture evidence
---

# Purpose

Test whether the Moon can become a second factual Tempus trajectory inside the existing dodecahedral/icosahedral compass without collapsing solar time, lunar time, Vitae development, ARCnet capability, or symbolic interpretation into one clock.

This gate starts from:

- `docs/architecture/registries/tempus-ephemeris-arcnet-unification-registry.v0.1.json`
- `docs/architecture/registries/tempus-72-sector-coordinate.v0.1.json`
- `docs/architecture/registries/arcnet-transported-frame-projection.v0.1.json`
- `docs/doctrine/temporal-model.md`

The new machine-readable result is:

- `docs/architecture/registries/tempus-lunar-ephemeris-overlay.v0.1.json`

# 1. Question under test

The solar gate established:

```text
factual apparent geocentric solar longitude
        ↓
neutral 72-sector Tempus coordinate
        ↓
continuous dual-icosahedral carrier position
        ↓
rigid ARCnet presentation transport
```

The lunar gate asks whether the Moon can inhabit the same factual coordinate space while remaining dynamically independent.

The architecture must reject the shortcut:

```text
Sun uses the Tempus carrier
+
Moon also has longitude
=
Moon should also drive ARCnet
```

That would confuse shared coordinate system with shared role.

# 2. Astronomical grounding

## 2.1 Moon target and observer frame

The NASA/JPL Horizons manual identifies:

```text
Moon center = 301
Earth center = 399
Earth geocenter observer = 500@399
```

Horizons observer quantity 31 returns observer-centered apparent ecliptic-of-date longitude and latitude.

Source:

- https://ssd.jpl.nasa.gov/horizons/manual.html

The same observer/reference-frame family can therefore be used for both Sun and Moon before a relative phase is derived.

Candidate law:

> **Compare Coordinates Only After the Observer and Frame Agree.**

## 2.2 Lunar phases are relative geometry

NASA explains lunar phases as the changing geometry of Sun, Moon, and Earth as the Moon moves around Earth.

NASA's 2026 lunar visualization is geocentric and provides hourly phase/libration context.

Sources:

- https://science.nasa.gov/moon/moon-phases/
- https://svs.gsfc.nasa.gov/5587/

JPL gives an especially useful exact boundary: strict new Moon occurs when the apparent ecliptic longitude of Moon and Sun, as viewed from Earth's center, are equal.

Source:

- https://ssd.jpl.nasa.gov/doc/lunar_cmd_2005_jpl_d32296.pdf

Therefore a useful ecliptic relative-phase coordinate is:

```text
delta_lambda = (lambda_moon - lambda_sun) mod 360
```

with descriptive landmarks:

```text
0°   → longitude conjunction / new-Moon boundary
90°  → first-quarter neighborhood
180° → longitude opposition / full-Moon boundary
270° → third-quarter neighborhood
```

For precision away from the conjunction definition, the render should prefer ephemeris-provided illuminated fraction and phase/elongation quantities rather than assuming that longitude difference alone is the complete three-dimensional phase geometry.

Finding: **Sun–Moon relative phase as derived Tempus context — PASS.**

Finding: **relative phase as authority/readiness signal — FAIL.**

Candidate law:

> **Relative Phase Is Derived, Not Sovereign.**

# 3. Same shell, independent motion

Both solar and lunar apparent longitude can resolve through the neutral 72-sector coordinate:

```text
sector = floor(longitude / 5) + 1
face   = floor(longitude / 30) + 1
```

But their roles differ.

```text
SUN
lambda_sun
    ↓
P_sun on Tempus carrier
    ↓
ARCnet rigid transport position

MOON
lambda_moon
    ↓
P_moon on same neutral carrier
    ↓
independent lunar tracer only
```

The Moon may cross many Tempus sectors while ARCnet advances only slowly with the Sun.

This is desirable rather than contradictory.

It demonstrates that Tempus is becoming a field of simultaneous natural cycles rather than a disguised single master clock.

Finding: **shared neutral shell — PASS.**

Finding: **shared transport role — FAIL.**

Candidate laws:

> **Same Shell, Independent Motion.**

> **The Moon May Contextualize the Vehicle; It Does Not Steer It.**

# 4. Longitude alone is insufficient

NASA's 2026 lunar-orbit visualization notes that the Moon's orbit is tilted about five degrees to the ecliptic and identifies the ascending and descending nodes where it crosses that plane.

Source:

- https://svs.gsfc.nasa.gov/5587/

This matters architecturally.

If the lunar layer retained only longitude, the model would falsely suggest that every 0° or 180° longitude relationship is sufficient to produce a solar or lunar eclipse.

It is not.

The lunar coordinate therefore must preserve at minimum:

```text
longitude
latitude
```

and should preserve distance when eclipse or apparent-size geometry is being studied.

Candidate laws:

> **Longitude Coincidence Is Not Whole Alignment.**

> **Latitude Prevents False Eclipse Inference.**

# 5. Immediate falsification case — August 28, 2026

NASA reports a deep partial lunar eclipse on August 28, 2026, with greatest eclipse at:

```text
2026-08-28T04:13Z
```

At greatest eclipse NASA reports 96.3% of the Moon's disk within Earth's umbra.

Source:

- https://svs.gsfc.nasa.gov/5672

The local reproducible research backend was evaluated at that exact NASA event time. It requested Swiss Ephemeris data and transparently returned the built-in Moshier fallback because external ephemeris files were not present.

Prototype result:

```text
Sun longitude      ≈ 154.898250°
Moon longitude     ≈ 334.852788°
delta longitude    ≈ 179.954538°
Moon latitude      ≈ +0.462362°
illuminated fraction ≈ 99.9984%
```

The important observation is not the local backend's final decimal precision.

It is structural:

```text
near-perfect longitude opposition
+
nonzero lunar ecliptic latitude
+
finite Earth-shadow / Moon geometry
=
deep partial eclipse
```

Therefore:

```text
180° longitude opposition
≠
complete eclipse state
```

Finding: **one-dimensional lunar phase model — FAIL.**

Finding: **longitude + latitude + sourced eclipse geometry — PASS.**

This is a useful falsification because it prevents the sacred-geometric renderer from simplifying real astronomy until it becomes false.

# 6. Current session snapshot

At the current architecture checkpoint:

```text
capturedAt
2026-08-24T07:26:00Z
```

Local reproducible Moshier research values are:

```text
SUN
longitude       151.169235°
latitude        -0.000075°
sector          31
face            Virgo
quinary         1

MOON
longitude       287.121949°
latitude        -3.588200°
distance        ~402,550 km
sector          58
face            Capricorn
quinary         4
decan           2

SUN ↔ MOON
longitude delta 135.952714°
true elongation ~135.836709°
illumination    ~85.93%
phase           waxing gibbous
```

NASA's August 2026 skywatching material independently places new Moon on August 12 and full Moon / lunar eclipse on August 27-28, consistent with the current snapshot lying in the waxing-gibbous interval.

Source:

- https://science.nasa.gov/solar-system/whats-up-august-2026-skywatching-tips-from-nasa/

This snapshot is prototype evidence only. It is not represented as a direct JPL Horizons result.

# 7. Rendering contract

The unified renderer should now display four distinct things:

```text
1. Tempus shell
   outer dodecahedron + inner dual carrier

2. solar state
   factual Sun longitude
   solar carrier point
   ARCnet rigid frame transported there

3. lunar state
   factual Moon longitude
   independent Moon tracer
   factual latitude retained visibly/numerically

4. relative state
   Sun–Moon phase relation
   illuminated fraction / phase label
```

A useful visual distinction is:

```text
Moon carrier base
      │
      │ signed presentation stem
      │ from beta_moon
      ▼
Moon latitude marker
```

The stem is a presentation device only.

It is **not** physical lunar altitude, radial distance from Earth, or a claim that the Moon actually moves off an icosahedral edge.

Candidate law:

> **A Preserved Coordinate May Be Projected Without Becoming Physical Geometry.**

# 8. Waxing and waning boundary

The words waxing and waning are legitimate astronomical descriptions of changing visible illumination.

They must not leak into Vitae semantics as:

```text
waxing  → the human is growing correctly
waning  → the human is declining
full    → completion / mastery
new     → reset / rebirth requirement
```

None of those follow from astronomy.

Finding: **lunar illumination as factual context — PASS.**

Finding: **lunar phase as human-development state — FAIL.**

Candidate law:

> **Waxing and Waning Describe Illumination, Not Human Becoming.**

# 9. ARCnet invariance

The lunar gate preserves the solar transport formula:

```text
X_system = P_sun + s R q_system
```

The following do not enter authorization:

```text
lambda_moon
beta_moon
lunar sector
lunar phase
illuminated fraction
new/full Moon
conjunction/opposition
eclipse state
Moon/ARCnet geometric proximity
```

The ARCnet local frame therefore retains:

- eight system/faculty identities;
- the two tetrahedral classes;
- four mirror antipodes;
- the 12 operational + 12 kinship + 4 mirror relationship partition;
- six derived inner junctions;
- Human/Identity center status;
- Edge Contract requirements;
- authority boundaries.

Finding: **ARCnet semantic invariance under lunar motion — PASS.**

# 10. Vitae boundary

The lunar gate also preserves:

```text
Tempus context may accompany a Vitae event
but
Tempus does not create the Vitae event
```

A lunar wrap, conjunction, opposition, full Moon, eclipse, or ceremonial overlay does not:

- increment a Vitae index;
- prove stabilization;
- grant recognition;
- establish readiness;
- award authority;
- create MANA;
- create missed-window debt.

Candidate law:

> **A Lunar Wrap Does Not Reset Vitae.**

# 11. Geometry-free equivalent

The same state must remain intelligible without a 3D model:

```text
UTC: 2026-08-24T07:26Z
Sun: Virgo, 151.169°, sector 31
Moon: Capricorn, 287.122°, latitude -3.588°, sector 58
Phase: waxing gibbous, ~85.9% illuminated
Relative longitude: 135.953°
ARCnet: unchanged capability/authority state
Vitae: unchanged
```

Finding: **geometry-free equivalence — PASS.**

# 12. Disposition

The lunar gate receives a **BOUNDED PASS**.

The Moon can become a second factual Tempus trajectory because:

1. Sun and Moon can share an observer/frame-consistent longitude registry;
2. their motions remain independent;
3. lunar phase is naturally represented as a derived relation between them;
4. lunar latitude prevents a false one-dimensional eclipse model;
5. the Moon does not have to move ARCnet in order to matter;
6. all participant-development and authority boundaries remain unchanged.

The strongest current formulation is:

> **Tempus is not one clock. It is a field in which multiple factual cycles can be co-observed without being forced into one cause.**

# Candidate laws

- Same Shell, Independent Motion.
- Relative Phase Is Derived, Not Sovereign.
- Compare Coordinates Only After the Observer and Frame Agree.
- Longitude Coincidence Is Not Whole Alignment.
- Latitude Prevents False Eclipse Inference.
- Phase Is Relative Geometry, Not a Command.
- Waxing and Waning Describe Illumination, Not Human Becoming.
- The Moon May Contextualize the Vehicle; It Does Not Steer It.
- A Lunar Wrap Does Not Reset Vitae.
- Conjunction and Opposition Are Context, Not Evaluation.
- A Preserved Coordinate May Be Projected Without Becoming Physical Geometry.

# Next gate

After human inspection of the solar+lunar renderer, the strongest next test is to add **Vitae back into the unified field as an independent event-driven coordinate** while the Sun and Moon continue moving.

The falsification target is:

```text
Sun moves
Moon moves faster
lunar phase changes
Vitae remains fixed until explicit participant event
ARCnet stays solar-transported
```

Only after that separation survives should the earlier Vitae icosahedral corpus atlas be compared with the Tempus dual icosahedron.

That comparison must test whether there is a real cross-scale transform or merely the same Platonic solid appearing in two unrelated registries.
