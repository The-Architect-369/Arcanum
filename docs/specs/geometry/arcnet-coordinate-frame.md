---
title: "ARCnet Coordinate Frame — CE-W01"
status: implementation-candidate
visibility: public
last_updated: 2026-08-26
description: "Implementation-facing mathematical contract for the CE-W01 ARCnet local coordinate frame, Hope-centered inner geometry, optional overlays, projection boundaries, and falsification invariants."
era: "Construction Era"
wave: "CE-W01"
authority: "implementation-facing specification derived from controlling canon and verified mathematical research; does not amend doctrine or the canonical module registry"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/39"
---

# ARCnet Coordinate Frame — CE-W01

## Purpose

This specification defines the minimum exact geometry required to construct the CE-W01 native ARCnet host without allowing geometry to create semantic, module, capability, governance, economic, recognition, identity, or protocol authority.

It translates surviving Construction-era research into a bounded implementation contract.

It does **not** ratify the full Creation-era eight-domain architecture, every researched semantic edge, the six proposed junction names, the sovereign-faculty hypothesis, or Module Architecture v2.

The current canonical module registry remains controlling until explicitly amended through its required doctrine and boundary-review process.

## Governing law

> **Registry before projection. Geometry may render source-owned relationships; it may not manufacture them.**

Derived implementation laws:

1. mathematical coordinates do not create modules;
2. geometric adjacency does not create runtime connectivity;
3. geometric symmetry does not create authority;
4. a symbolic name does not replace the exact mathematical object;
5. a screen projection does not replace the mathematical source;
6. a participant must be able to use every required function through a geometry-free equivalent.

## Typed vocabulary

The following terms are intentionally separate.

### ARCnet local coordinate frame

The exact Euclidean coordinate system defined in this document.

### Stella octangula

The mathematical compound of two regular tetrahedra occupying alternate vertices of a cube.

Its convex hull is a cube. The common solid intersection of the two tetrahedra is a regular octahedron.

### Stellar Octahedral Cube / Merkabah

Project vocabulary for the ARCnet visual/system model based on the cube, the two interpenetrating tetrahedra, their octahedral common interior, and the sovereign center.

`Merkabah` is a project symbolic/design term here. It is not the mathematical name of the whole object and supplies no physical or metaphysical claim.

### Hope-centered inner geometry

The first rendered reflective geometry around the sovereign origin. In CE-W01 it is represented by the regular octahedral interior centered on the origin.

### Seed-of-Life projection

A candidate visual/symbolic spherical/circular projection associated with Hope.

It is **not** defined as mathematically identical to the octahedron. A later verified projection contract must state the exact mapping between Seed-of-Life circles/spheres and octahedral coordinates before an implementation may describe the two as the same geometry.

### Overlay

A separately typed geometric construction rendered in the same scene or coordinate family without changing the underlying ARCnet semantic frame.

## Sovereign origin

The local frame origin is:

```text
O = (0, 0, 0)
```

The origin represents the **Human / Identity presentation center**.

This is a geometric representation only. Canonical Identity is continuity and sovereignty; it is not defined by this point, this rendering, or any distance from it.

The origin:

- is not a ninth ARCnet application;
- is not a capability source;
- is not a score;
- is not a recognition state;
- is not a protocol account by geometric necessity.

## ARCnet cube hull

The normalized outer cube uses the eight vertices:

```text
(x, y, z) where x, y, z ∈ {-1, +1}
```

Therefore:

```text
cube edge length = 2
cube circumradius = sqrt(3)
center = O
```

The normalized scale is unitless.

It is not an AU, kilometer, degree, second, day, economic quantity, authority weight, or human-value quantity.

## Two tetrahedral subsets

The eight cube vertices decompose exactly into two regular tetrahedra.

### Tetrahedron G

The four vertices satisfying:

```text
x * y * z = +1
```

Explicit coordinates:

```text
(+1, +1, +1)
(+1, -1, -1)
(-1, +1, -1)
(-1, -1, +1)
```

### Tetrahedron S

The four vertices satisfying:

```text
x * y * z = -1
```

Explicit coordinates:

```text
(-1, -1, -1)
(-1, +1, +1)
(+1, -1, +1)
(+1, +1, -1)
```

Each tetrahedral edge has length:

```text
2 * sqrt(2)
```

The union of these tetrahedra is the normalized stella-octangula compound used by the ARCnet stellar-frame projection.

The G/S labels describe the two mathematical subsets only. Any mapping of application/domain names onto those coordinates remains registry-owned and separately ratified.

## Hope-centered octahedral interior

The common solid intersection of the two tetrahedra is a regular octahedron centered at the origin.

Normalized vertices:

```text
(+1,  0,  0)
(-1,  0,  0)
( 0, +1,  0)
( 0, -1,  0)
( 0,  0, +1)
( 0,  0, -1)
```

Therefore:

```text
octahedron edge length = sqrt(2)
octahedron circumradius = 1
```

CE-W01 uses this octahedral interior as the exact mathematical basis for the **Hope-centered inner rendering**.

The six octahedral vertices are coordinates. They do not become six applications, six authorities, six personality traits, six recognition states, or six mandatory workflows by geometric fact.

Research may propose semantic relations or junctions at these points. Those meanings remain separately registered and unratified unless promoted through their own authority path.

## Distance classes in the outer cube

For any pair of distinct cube vertices, Euclidean distance belongs to one of three classes:

```text
2
2 * sqrt(2)
2 * sqrt(3)
```

Counts across the eight cube vertices are:

```text
12 pairs at distance 2
12 pairs at distance 2 * sqrt(2)
4 pairs at distance 2 * sqrt(3)
```

These are mathematical pair classes only.

A registry may use a distance class to render an already-owned relationship class. The distance cannot manufacture or authorize the relationship.

> **Distance class may encode relationship class; it does not grant relationship authority.**

## Optional icosahedral embedding

CE-W01 preserves an optional regular icosahedron embedded inside the normalized cube using the golden-ratio coordinate family.

Let:

```text
phi = (1 + sqrt(5)) / 2
```

Vertices are permutations of:

```text
(0, ±1/phi, ±1)
(±1/phi, ±1, 0)
(±1, 0, ±1/phi)
```

For this construction:

```text
icosahedron edge = 2 / phi
icosahedron circumradius = sqrt(3 - phi)
```

All twelve vertices lie on cube faces.

This is an **embedding**, not a duality.

The cube is dual to the octahedron. The dodecahedron is dual to the icosahedron. The cube and icosahedron are not dual polyhedra.

Any Vitae, Tempus, curriculum, correspondence, or other meaning applied to the icosahedral overlay must come from an independent registry and may be disabled without altering the ARCnet frame.

## Scale firewall

Every rendered geometric layer must declare which scale relationship it uses.

Allowed scale categories include:

- exact normalized coordinate scale;
- exact dual construction scale;
- exact embedding scale;
- presentation-only radial separation;
- screen/camera projection scale.

They may not be silently substituted for one another.

Examples:

- the normalized octahedron circumradius `1` is an exact consequence of this cube/stella coordinate choice;
- an added visual gap around Hope is presentation scale, not a Platonic constant;
- an astronomical radius belongs to a physical coordinate system, not this normalized local frame;
- an angular Tempus shell belongs to an angular coordinate domain, not this normalized Euclidean radius.

> **Exact embedding and exact duality are different relations.**

## Rigid transport contract

The local frame may be rendered at another presentation position and orientation using:

```text
X_i = P + s * R * q_i
```

where:

- `q_i` is an immutable local coordinate from this specification;
- `P` is a presentation translation;
- `s > 0` is a common presentation scale;
- `R` is an orthonormal rotation matrix.

Rigid transport must preserve:

- the origin's center role;
- cube-vertex coordinates relative to the local frame;
- tetrahedral subset membership;
- antipodal relationships;
- pairwise distance ratios;
- octahedral common-intersection structure;
- any separately registered label attached to a coordinate;
- all doctrine/module/capability/authority boundaries.

Transport position, orientation, animation state, Tempus phase, or camera pose may not be an authorization input.

> **Transport the frame; do not rewrite the frame.**

## Projection boundary

A native renderer may choose perspective, orthographic, isometric, stereographic, diagrammatic, or other presentation modes only if the renderer declares the projection and does not change source semantics.

A screen-space coincidence does not establish a 3D intersection.

A 3D intersection does not establish a semantic relationship.

A semantic relationship does not establish an executable runtime edge.

An executable edge requires its own capability and authority contract.

## Hope / Seed projection boundary

CE-W01 may render Hope through octahedral, spherical, circular, polygonal, Seed-of-Life-inspired, or combined visual forms provided all of the following remain true:

1. the exact octahedral source coordinates remain available;
2. the renderer identifies any additional circles/spheres as a projection or overlay rather than unverified mathematical identity;
3. no visual node becomes a new module or authority because it exists on-screen;
4. the same Hope function is accessible in a non-geometric representation;
5. participant data is not inferred from geometric position.

## Geometry-free equivalent

Every state required for operation must be expressible without 3D geometry.

Minimum equivalent representation:

```text
Frame
- frame ID/version
- origin role
- registered outer coordinates/labels
- active optional overlays
- selected focus
- orientation mode
- presentation scale
- provenance
```

No permission, action, state transition, or meaning may exist only inside the visual scene.

## Falsification tests

An implementation of this specification fails if any of the following is false.

### F1 — cube vertices

Exactly eight normalized outer coordinates exist at `(±1, ±1, ±1)`.

### F2 — tetrahedral partition

Exactly four outer vertices satisfy `xyz = +1` and exactly four satisfy `xyz = -1`.

Each subset forms a regular tetrahedron with edge `2*sqrt(2)`.

### F3 — octahedral interior

The common tetrahedral interior is represented by the regular octahedron with vertices `±e_x`, `±e_y`, `±e_z` and circumradius `1`.

### F4 — center sovereignty

`(0,0,0)` remains non-system presentation center and never acquires application or authority semantics merely from geometry.

### F5 — rigid transport

Translation/rotation/common presentation scale preserve local relative geometry and registered semantics.

### F6 — overlay independence

Removing the optional icosahedral or Seed-of-Life projection does not remove any required ARCnet capability or alter authority.

### F7 — no false duality

No implementation describes cube↔icosahedron as Platonic duality.

### F8 — scale firewall

Every non-normalized scale factor has an explicit source and type.

### F9 — geometry-free equivalence

The same operational state and authority meaning can be rendered in cards/lists/text without geometric loss.

### F10 — no numerology-driven software

No module, application, permission, entitlement, recognition state, governance role, or economic rule is created to fill a geometric count.

## Research retained outside this minimum

The following remain research unless separately promoted:

- exact semantic assignment of all eight outer vertices;
- all 28 pairwise semantic edge studies as runtime edges;
- six named inner-junction semantics;
- Module Architecture v2 / sovereign-faculty restructuring;
- mandatory dodecahedral navigation;
- Fruit-of-Life whole-system equivalence;
- Tree-of-Life path identity with ARCnet edges;
- mandatory Vitae icosahedral curriculum adjacency;
- symbolic element/cosmology claims;
- astronomical meaning derived from normalized solid radii.

## Verified external mathematical basis

During CE-W01 consolidation, external references were independently checked rather than inherited solely from the research branch.

Verified facts used by this minimum include:

- the stella octangula is a compound of two tetrahedra;
- its convex hull is a cube;
- the solid common to the two tetrahedra is a regular octahedron;
- cube↔octahedron and dodecahedron↔icosahedron are the relevant Platonic dual pairs.

The coordinate formulas in this specification are independently testable and should become machine-verified before baseline promotion.

## Next implementation gate

Before CE-W02 native host work begins, this specification should gain:

- a machine-readable coordinate registry;
- deterministic geometry tests;
- a declared math-to-screen projection contract;
- a geometry-free reference renderer;
- explicit mapping of any ratified ARCnet labels to coordinates;
- explicit Hope Seed-of-Life projection mathematics if that visual mapping is retained.
