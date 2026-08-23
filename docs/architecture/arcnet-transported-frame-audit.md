---
title: "ARCnet Transported Stellar Frame Audit"
status: design-candidate
visibility: public
last_updated: 2026-08-23
phase: Pre-Genesis
authority: non-canonical research evidence
---

# Purpose

Test whether the candidate eight-system ARCnet stellar-cube / stella-octangula frame can be transported through the Tempus × Vitae becoming-field presentation without changing system identity, authority boundaries, Edge Contract requirements, derived-junction status, or the sovereignty of Human / Identity.

# Repository access posture

Repository access is provided for this audit.

Controlling evidence includes:

- `docs/architecture/creation-era-whole-system-falsification-audit.md`;
- `docs/architecture/arcnet-edge-contract.md`;
- `docs/architecture/registries/becoming-field-geometry-registry.v0.1.json`;
- `docs/architecture/registries/tempus-vitae-becoming-field-registry.v0.1.json`;
- `docs/architecture/registries/tempus-vitae-live-phase-projection.v0.1.json`.

This audit changes no canon, runtime capability, Identity rule, recognition rule, Tempus advancement rule, MANA rule, Treasury rule, governance rule, or constitutional authority.

# 1. Audit question

The strongest form of the current hypothesis is not:

```text
ARCnet changes as a participant changes.
```

It is:

```text
a stable ARCnet frame
is rendered at different Tempus × Vitae coordinates
while the frame's own semantics remain invariant.
```

The falsification question is therefore:

> Can the stellar frame move, rotate, and be contextualized while every system, relationship class, authority boundary, and Edge Contract condition remains the same?

If not, the geometry is smuggling semantics into pose.

# 2. Eight-system local coordinate frame

Use a unit-cube local coordinate system:

```text
Arcanum     = (+1,+1,+1)
Nexus       = (+1,-1,-1)
Commercium  = (-1,+1,-1)
Theatrum    = (-1,-1,+1)

Architect   = (-1,-1,-1)
Imperium    = (-1,+1,+1)
Aerarium    = (+1,-1,+1)
Protection  = (+1,+1,-1)
```

The first four points form one regular tetrahedron.

The second four are their antipodes and form the interpenetrating regular tetrahedron.

The registered mirror pairs are therefore body-diagonal antipodes:

```text
Arcanum    ↔ Architect
Nexus      ↔ Imperium
Commercium ↔ Aerarium
Theatrum   ↔ Protection
```

Human / Identity remains at:

```text
(0,0,0)
```

but is not a ninth system vertex.

# 3. Exact 28-relation distance decomposition

A complete graph on the eight outer coordinates has twenty-eight unique pairs.

In this cube embedding those twenty-eight pairs split into exactly three Euclidean distance classes:

| Local distance | Pair count | Polyhedral form | Existing semantic class |
|---|---:|---|---|
| `2` | 12 | cube edges | operational cross-tetrahedron relations |
| `2√2` | 12 | face diagonals / tetrahedron edges | 6 generative + 6 stewardship kinship relations |
| `2√3` | 4 | body diagonals | mirror axes |

Therefore:

```text
12 operational
+ 12 kinship
+ 4 mirror
= 28
```

is not merely count-compatible with the stellar cube. It is exactly represented by the cube's three pairwise distance shells under the selected orientation.

## Disposition

**PASS as geometric encoding.**

This does not mean distance creates the relation.

The relationship semantics were independently established by the edge studies. Geometry is acting as a compact representation of that classification.

Candidate law:

> **Distance Class May Encode Relationship Class; It Does Not Grant Relationship Authority.**

A future runtime must not infer permission, settlement, disclosure, or capability merely from geometric distance.

# 4. Six inner junctions become the central octahedron

The six derived inner junctions have an exact coordinate construction.

Each is the common midpoint of one generative tetrahedron edge and one stewardship tetrahedron edge:

| Junction | Generative source edge | Stewardship source edge | Coordinate |
|---|---|---|---|
| Commons Witness | Arcanum ↔ Nexus | Protection ↔ Aerarium | `(+1,0,0)` |
| Practice Safety | Arcanum ↔ Commercium | Protection ↔ Imperium | `(0,+1,0)` |
| Cultural Commons | Arcanum ↔ Theatrum | Imperium ↔ Aerarium | `(0,0,+1)` |
| Market Assurance | Nexus ↔ Commercium | Architect ↔ Protection | `(0,0,-1)` |
| Creator Public Goods | Nexus ↔ Theatrum | Architect ↔ Aerarium | `(0,-1,0)` |
| Standards and Rights | Commercium ↔ Theatrum | Architect ↔ Imperium | `(-1,0,0)` |

These six points are the vertices of the inner regular octahedron.

This reproduces the earlier junction architecture without making the junctions sovereign.

The important mathematical property is midpoint preservation. For an affine rigid transport `T`:

```text
T((a+b)/2) = (T(a)+T(b))/2
```

So a junction remains the derived meeting point of the same two registered edge relations after the frame moves.

Candidate law:

> **Derived Junctions Transport as Compositions, Not Authorities.**

The 3D local frame therefore contains fifteen notable positions:

```text
8 outer system coordinates
+ 6 inner derived-junction coordinates
+ 1 Human / Identity center
= 15
```

This count is a rendering fact, not a new fifteen-node module registry.

# 5. Rigid transport contract

Let every local system/junction coordinate be `q_i`.

The transported display coordinate is:

```text
X_i = P + s R q_i
```

where:

```text
P = current becoming-field presentation position
s = common visual scale
R = orthonormal presentation rotation
q_i = immutable local frame coordinate
```

Translation changes location.

Rotation changes orientation.

Common scale changes display size.

None changes the local relational grammar.

For any two coordinates `q_i` and `q_j`:

```text
|X_i - X_j| = s |q_i - q_j|
```

Therefore the following remain invariant under rigid transport:

- system identity;
- generative/stewardship membership;
- mirror antipodes;
- the `12 / 12 / 4` edge-class partition;
- the six midpoint-derived junctions;
- center/non-system distinction;
- Edge Contract semantics;
- authority boundaries.

# 6. Transport orientation is not meaning

At least two visual transport conventions are legitimate:

```text
WORLD-LOCKED
frame keeps one orientation while its center moves

PATH-ALIGNED
frame rotates with a local basis derived from the rendered trajectory
```

If the semantics change when the renderer switches between these conventions, the model fails.

They do not change in the present architecture.

Candidate law:

> **Transport Orientation Is a Presentation Convention, Not a Semantic Coordinate.**

This is especially important because a rotating stellar frame may feel symbolically significant. The renderer must not convert orientation into interpretation, readiness, personality, rank, or system activation.

# 7. Tempus × Vitae transport model

The previous phase audit established a critical asymmetry:

```text
Tempus = continuously changing context
Vitae  = discrete participant/practice coordinate
```

The transport render therefore uses a **fibered helix presentation** rather than a single diagonal progress line.

## Vitae base

The 3,600-position Core Vitae index is embedded as a ten-turn helix:

```text
global_index = ((grade_index - 1) * 360) + grade_section_index
θ = 2π(global_index - 1)/360
H = helix position at θ
```

The base coordinate changes only when the Vitae navigation/practice coordinate changes.

## Tempus fiber

A selected Tempus phase is rendered as a circle around the current Vitae base point:

```text
φ = 2π * Tempus normalized phase
P = H + R_tempus(cos φ N + sin φ B)
```

`N` and `B` are local presentation directions only.

This yields the visual logic:

```text
Vitae chooses the current base station on the becoming helix.
Tempus moves around that station as context continues.
The ARCnet stellar frame is rigidly transported to the selected pair.
```

During rest:

```text
Vitae base H = fixed
Tempus φ      = changing
```

The frame may therefore move around the local Tempus fiber while the participant's Vitae coordinate remains unchanged.

No missed lesson, debt, lateness, or catch-up state is created.

Candidate law:

> **Tempus May Move Around a Vitae State Without Moving the Vitae State.**

# 8. Edge Contract firewall

The Edge Contract remains the only legitimate candidate boundary for cross-system execution.

A geometric relation is not an invocation.

A moving relation is not an invocation.

A close relation is not an invocation.

A mirror relation is not an invocation.

A Tempus coincidence is not an invocation.

A Vitae coordinate is not an invocation.

The renderer must never turn any of these presentation states into capability.

Execution still requires the independently registered contract conditions, including:

```text
actor / authorization context
registered directional action
required capability
bounded input / disclosure
origin and destination rules
destination acceptance
receipt
settlement rule where applicable
```

Candidate law:

> **Pose Is Not Permission.**

# 9. Identity center audit

Human / Identity remains at the local frame center for presentation.

That center may travel with the frame because the rendered frame is participant-relative.

But the center remains:

```text
not an app
not a module
not a system endpoint
not a score
not a grade
not a symbolic personality class
```

Canonical Identity remains deeper than the geometry.

The rendering means only:

```text
this is the participant-relative system frame at this recorded/contextual point
```

not:

```text
this geometry defines the participant
```

# 10. Falsification matrix

| Test | Required behavior | Result |
|---|---|---|
| Rigid distance | all pair distances preserved up to common display scale | PASS |
| Mirror antipodes | four registered mirrors stay antipodal | PASS |
| Tetrahedron membership | system classes do not swap during motion | PASS |
| Junction midpoint | all six junctions remain derived from same edge pairs | PASS |
| Identity center | center remains non-system | PASS |
| Tempus rest | Tempus may move while Vitae base is fixed | PASS |
| Vitae discreteness | base moves only on explicit Vitae event | PASS |
| Orientation substitution | world-locked/path-aligned views preserve semantics | PASS |
| Edge Contract firewall | pose cannot authorize execution | PASS |
| Geometry-free equivalent | same state is expressible as cards/list/record | PASS by specification; UI usability still requires later human testing |

# 11. Audit disposition

**PASS as a bounded transported-frame presentation model.**

The model survives because transport is a rigid transformation of a local semantic frame, not a rewrite of that frame.

The strongest surviving architecture is:

```text
continuous Tempus context
        ×
discrete Vitae becoming coordinate
        ↓
presentation position P
        ↓
rigid ARCnet stellar frame
        ↓
unchanged systems / relationships / authority
```

This supports the Human Architect's intuition of a stable ARCnet constellation moving through a field of becoming while avoiding a literal physical-spacetime claim.

# 12. New structural finding

The most material new result is not motion itself.

It is the exact compatibility between the current semantic edge taxonomy and cube metric shells:

```text
cube edge      → operational
face diagonal  → kinship
tetrahedron    → generative/stewardship subfamilies
body diagonal  → mirror
```

and the exact central-octahedron construction of the six derived junctions.

This makes the stellar cube a significantly stronger **information architecture** candidate than a merely decorative sacred-geometric metaphor.

The boundary remains:

> Geometry can encode distinctions that were justified elsewhere. Geometry cannot justify them by itself.

# 13. Candidate laws

- **Transport the Frame; Do Not Rewrite the Frame.**
- **Distance Class May Encode Relationship Class; It Does Not Grant Relationship Authority.**
- **Derived Junctions Transport as Compositions, Not Authorities.**
- **Pose Is Not Permission.**
- **Transport Orientation Is a Presentation Convention, Not a Semantic Coordinate.**
- **Tempus May Move Around a Vitae State Without Moving the Vitae State.**
- **A Rendered Trajectory Is History / Context, Not Human Worth.**

# 14. 3D renderer gate

The companion renderer should expose at least:

- the ten-turn Vitae helix;
- a local Tempus phase circle;
- the eight outer system coordinates;
- the two tetrahedra;
- optional twelve operational cube edges;
- four mirror axes;
- six inner octahedral junctions;
- Human / Identity center;
- world-locked versus path-aligned orientation;
- Tempus-only animation while Vitae remains fixed;
- explicit Vitae movement controls;
- labels/plain-text state;
- reduced-motion behavior.

No visual state may alter authority.

# Canonical boundary

This audit does not promote the eight-system topology, the stellar cube, the six junction coordinates, the becoming-field renderer, or any associated correspondence into canon.

It preserves them as design-candidate evidence for later review.
