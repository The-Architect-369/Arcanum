---
title: "Tempus Ephemeris × ARCnet Unification Audit"
status: design-candidate
visibility: public
last_updated: 2026-08-23
phase: Pre-Genesis
authority: non-canonical mathematical, astronomical-context, and presentation evidence
---

# Purpose

Test whether the neutral seventy-two-sector Tempus dodecahedral compass and the transported ARCnet stellar frame can become one coherent presentation system when Tempus position is supplied by a factual astronomical observable.

The audit asks four separate questions:

1. What astronomical coordinate should drive the first Earth-facing Tempus experiment?
2. Is there a non-arbitrary geometric path through the dodecahedral zodiac shell?
3. Can the ARCnet stellar frame move on that path without changing its internal topology or authority?
4. Does this result support a literal cosmology, or only an information/presentation architecture?

The resulting registry is:

`docs/architecture/registries/tempus-ephemeris-arcnet-unification-registry.v0.1.json`

# Repository posture

This audit is subordinate to current Temporal, Identity, Governance, Treasury, Vitae, ARCnet, and Edge Contract constraints.

It does not alter canon.

Controlling laws remain:

- time may contextualize but not coerce;
- Identity is continuity, not description;
- Tempus may not advance Vitae automatically;
- geometry may not authorize ARCnet actions;
- ARCnet transport may not rewrite the transported frame;
- astronomical context may not become personality, destiny, readiness, recognition, or authority.

# 1. Factual astronomical input

For an Earth-facing annual Tempus coordinate, the strongest first observable is the apparent geocentric ecliptic longitude of the Sun.

NASA/JPL Horizons defines observer quantity 31 as observer-centered apparent ecliptic-of-date longitude and latitude. Its manual specifically notes that Earth seasonal boundaries are conventionally determined using quantity 31 for the Sun seen from the Earth geocenter.

The research contract is therefore:

```text
target       Sun
observer     Earth geocenter
observable   apparent ecliptic-of-date longitude
units        degrees
normalize    [0,360)
```

The architecture must also preserve:

```text
capturedAt
observer
reference / coordinate frame
epoch / of-date rule
ephemeris source + version
precision
longitude
latitude
interpretation: null
```

This is important because a number without observer, frame, epoch, and source is not a reproducible Tempus fact.

Candidate law:

> **Frame Before Meaning — astronomical coordinates become usable context only after observer, reference frame, epoch, and source are explicit.**

# 2. Exact dodecahedron ↔ icosahedron duality

A regular dodecahedron and regular icosahedron are exact Platonic duals.

The twelve centers of the dodecahedron's pentagonal faces are the twelve vertices of a regular icosahedron.

This changes the Tempus geometry materially.

Previously, the dodecahedron provided a bounded twelve-face zodiac shell, but the route through the shell was only an orientation/chronology choice.

Now the selected twelve-face chronological cycle has an exact inner representation:

```text
outer dodecahedron face
        ↕ duality
inner icosahedron vertex
```

Face adjacency becomes edge adjacency on the dual icosahedron.

Therefore the existing twelve-sign Hamiltonian face cycle becomes a twelve-edge Hamiltonian cycle through all twelve vertices of the inner dual icosahedron.

This is mathematically exact once the zodiac face orientation is selected.

# 3. The breathing carrier path

The Human Architect previously proposed a face rhythm that could move inward and then outward toward the next zodiacal region.

The exact dual geometry supplies a continuous version of that intuition without inventing a literal spiral.

For zodiac face `i`, define:

```text
Cprev = previous face center / dual vertex
Ci    = current face center / dual vertex
Cnext = next face center / dual vertex

entry = midpoint(Cprev, Ci)
exit  = midpoint(Ci, Cnext)
```

Let local sign phase be:

```text
u = (solar_longitude mod 30°) / 30°
```

Then:

```text
0 <= u < 0.5
entry → Ci

0.5 <= u < 1
Ci → exit
```

The next sign begins at the exact same point:

```text
exit_i = entry_(i+1)
```

So the year path is continuous.

Each sign traverses:

```text
half of incoming icosahedron edge
+
half of outgoing icosahedron edge
=
one full regular icosahedron edge length
```

Across twelve signs, the complete annual carrier path has twelve equal edge-length units.

This is a stronger result than a freehand face spiral because it is derived from:

1. exact dodecahedron/icosahedron duality;
2. the already-tested zodiac chronological face cycle;
3. ordinary midpoint/interpolation geometry.

It remains a new Arcanum renderer. No historical source is claimed to have used this exact animation.

Candidate law:

> **Duality May Supply a Carrier Without Supplying Semantics.**

# 4. Seventy-two quinaries on the path

Each sign remains thirty angular degrees and contains six registered five-degree quinaries.

The dual path gives them a natural placement:

```text
Q1
Q2
Q3   inbound toward face center
---   face-center crossing
Q4
Q5
Q6   outbound toward next face boundary
```

The three decans remain:

```text
Decan 1 = Q1 + Q2
Decan 2 = Q3 + Q4
Decan 3 = Q5 + Q6
```

This creates a particularly useful property:

**the second decan is the center-crossing decan.**

That is a geometric property of this renderer, not a new historical claim about decan doctrine.

The 72-sector coordinate remains primary. Historical angelic, Egyptian, Lenain, Goetic, or other overlays remain source-versioned optional layers.

# 5. ARCnet enters the Tempus shell

The transported ARCnet frame already obeys:

```text
X_system = P + s R q_system
```

where `q_system` is the immutable local stellar-frame coordinate.

The unification simply supplies:

```text
P = Tempus dual carrier position derived from factual solar longitude
```

The ARCnet piece therefore moves through factual astronomical context while preserving:

- all eight system identities;
- generative/stewardship tetrahedron membership;
- four mirror antipodes;
- 12 operational + 12 kinship + 4 mirror relation partition;
- six derived inner-octahedral junctions;
- Human/Identity non-system center;
- Edge Contract requirements;
- authority boundaries.

Allowed display orientations include:

- world locked;
- radial aligned;
- path-tangent aligned.

These are camera/presentation conventions only.

Candidate law:

> **The Sky May Position the Vehicle; It May Not Drive Its Authority.**

# 6. Current prototype snapshot

For this audit, the local research runtime evaluated the Sun at:

```text
UTC            2026-08-23T23:53:00Z
local ref      2026-08-23T19:53:00-04:00
```

The computation requested the Swiss Ephemeris mode. Because external ephemeris data files were not present, the library returned its documented built-in Moshier fallback.

The snapshot was:

```text
apparent geocentric ecliptic longitude  150.8660349083°
apparent geocentric ecliptic latitude    -0.0000832690°
distance                                   1.0110836867 au
longitude speed                             0.9637576554°/day
```

Resolved neutral Tempus coordinate:

```text
sector       31 / 72
zodiac face  Virgo / face 6
quinary      1 / 6
decan        1 / 3
half-decan   1 / 2
```

The corresponding normalized carrier position is approximately:

```text
[0, 0.675973, 0.024120]
```

This is a prototype ephemeris result, not represented as a JPL Horizons response.

The production contract should use an explicitly chosen and versioned ephemeris backend. JPL Horizons quantity 31 is the leading reference interface because it directly documents the observable required for this Earth-facing experiment.

# 7. Equal angle is visibly not equal day

The current prototype longitude speed is approximately:

```text
0.9638° / civil day
```

A five-degree quinary at that instantaneous rate would span a little more than five civil days.

At other parts of Earth's orbit the rate changes.

This provides direct operational evidence for a boundary already established in the Tempus compass registry:

> **Five Degrees Is Angular; Five Days Is a Separate Calendar Projection.**

The angular and five-day calendars may be compared, but one may not silently replace the other.

# 8. Important correction about the inner icosahedron

This result does **not** prove:

```text
inner icosahedron = Vitae
```

The inner icosahedron in this audit is derived mathematically from the twelve **Tempus dodecahedral face centers**. It therefore belongs to the Tempus presentation geometry as a dual carrier scaffold.

The existing Vitae icosahedral corpus atlas uses a different semantic mapping:

```text
20 Vitae curriculum regions
↔
20 icosahedral faces
```

Those two uses of an icosahedron must remain scale-separated until a later audit proves a legitimate relationship.

Candidate law:

> **A Shared Solid Does Not Merge Coordinate Systems.**

# 9. Falsification results

## Dual construction

PASS.

The twelve dodecahedral face centers form the vertices of an inner regular icosahedron.

## Chronological cycle

PASS for the selected design-candidate orientation.

All consecutive zodiac anchors are neighboring icosahedron vertices and Pisces closes to Aries.

## Opposition

PASS.

The six zodiac opposition pairs remain antipodal vertices.

## Path continuity

PASS.

Each sign exit equals the next sign entry exactly.

## 72-sector mapping

PASS.

Twelve signs × six five-degree sectors yields exactly seventy-two path intervals.

## Ephemeris resolution

PASS at prototype level.

A factual solar longitude deterministically resolves to sign, quinary, decan, and geometric transport position.

## ARCnet topology

PASS.

Changing Tempus longitude translates/orients the local ARCnet frame without changing its local coordinates or relationship classes.

## Authority firewall

PASS by specification.

No astronomical or geometric coordinate is an authorization input.

## Production ephemeris ingestion

UNIMPLEMENTED.

The research snapshot proves the coordinate and geometry contract, but the native/web runtime does not yet contain a production JPL/other approved ephemeris service with observer/frame/epoch/source receipt provenance.

# 10. Disposition

**BOUNDED PASS.**

The integration has an exact mathematical core:

```text
factual apparent solar longitude
        ↓
neutral 72-sector coordinate
        ↓
12-face zodiac dodecahedral shell
        ↓ exact duality
12-vertex inner icosahedral carrier
        ↓
continuous midpoint → face-center → midpoint breath
        ↓
transported invariant ARCnet stellar frame
```

This is the clearest unified Tempus × ARCnet geometry produced by the research trail so far.

It is an information and presentation architecture.

It is not evidence that the physical universe is literally a dodecahedron, that a star tetrahedron physically travels through zodiac solids, or that astronomical position causes human development or authority.

# Candidate laws

- **Ephemeris Before Symbolism.**
- **Frame Before Meaning.**
- **Duality May Supply a Carrier Without Supplying Semantics.**
- **The Breath Is a Path Property, Not a Cosmological Claim.**
- **Boundary Continuity Is Geometric; Meaning Still Requires Registry.**
- **The Sky May Position the Vehicle; It May Not Drive Its Authority.**
- **A Shared Solid Does Not Merge Coordinate Systems.**
- **Five Degrees Is Angular; Five Days Is a Separate Calendar Projection.**

# Next gates

1. Human-review the unified 3D renderer and test whether the inner dual path is visually legible.
2. Implement a production-grade ephemeris adapter contract with observer/frame/epoch/source provenance and deterministic receipts.
3. Add the lunar phase as a second factual independent overlay and verify that it never rewrites the solar-sector path.
4. Only after the Tempus geometry is stable, reopen the question of whether the separate Vitae icosahedral corpus atlas has a useful co-rendering relationship with the Tempus dual icosahedron.
5. Keep Hope, capability eligibility, recognition, and authority outside this geometry until their own gates are explicitly audited.
