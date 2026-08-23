---
title: "Tempus–Vitae Dodecahedron / Icosahedron Duality Audit"
status: design-candidate
visibility: public
last_updated: 2026-08-22
description: "Tests whether the mathematical duality of dodecahedron and icosahedron corresponds to a real Tempus–Vitae semantic, information, or UI duality after the dedicated geometry audits."
phase: "Pre-Genesis"
authority: "non-canonical design evidence"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/37"
---

# Tempus–Vitae Dodecahedron / Icosahedron Duality Audit

## Purpose

The dedicated geometry audits produced two bounded positive findings:

```text
Tempus
12 dodecahedral faces
can serve as optional zodiacal regions

Vitae
20 icosahedral faces
can serve as an optional atlas of
10 grades + 10 specializations
```

Because the regular dodecahedron and regular icosahedron are mathematical duals, this document tests whether those two results constitute a genuine **Tempus ↔ Vitae architectural duality**.

The answer is narrower than the visual symmetry suggests.

---

# 1. Mathematical duality is exact

For the two regular solids:

```text
DODECAHEDRON
12 faces
20 vertices
30 edges

ICOSAHEDRON
20 faces
12 vertices
30 edges
```

Under geometric duality:

```text
each dodecahedral face
↔
one icosahedral vertex

 each dodecahedral vertex
↔
one icosahedral face

 each dodecahedral edge
↔
one icosahedral edge
```

This relationship is mathematical fact.

What remains unproven is whether Tempus and Vitae have semantic structures on the corresponding geometric element types.

---

# 2. The first crucial correction: face count does not equal dual correspondence

The strongest Tempus result occupies:

```text
12 DODECAHEDRAL FACES
= optional zodiac regions
```

The strongest Vitae result occupies:

```text
20 ICOSAHEDRAL FACES
= 10 grades + 10 specializations
```

These are both **face mappings**.

They are not dual to one another.

A true geometric dual correspondence would require:

```text
12 Tempus dodecahedral faces
↔
12 Vitae icosahedral vertices
```

and:

```text
20 Tempus dodecahedral vertices
↔
20 Vitae icosahedral faces
```

The dedicated audits found:

```text
12 Vitae vertices
→ no canonical twelve-part Vitae set

20 Tempus vertices
→ no canonical twenty-part Tempus set
```

Therefore:

> **The currently successful Tempus and Vitae face counts do not yet form a semantic polyhedral dual.**

Finding: **literal semantic duality — FAIL for now.**

Candidate law:

> **Element-Type Fidelity — mathematical duality may only become semantic duality when concepts occupy the geometric elements that actually correspond under the dual transform.**

---

# 3. Twenty Tempus vertices — count-rescue test

The most tempting way to complete the dual is:

```text
12 zodiac signs
+
8 lunar phases
=
20 Tempus items
```

This is rejected.

A lunar phase and a zodiac sign are independent coordinates that can be simultaneously true in one `TempusContext`.

They are not twenty mutually exclusive peer positions.

Example:

```text
Full Moon
+
Moon in Taurus
+
Sun in Virgo
+
planetary day = Mercury
```

The state is compositional.

It is not one selection from a twenty-item list.

Putting `12 signs + 8 phases` on one set of twenty vertices would destroy that dimensional independence.

Finding: **20 Tempus vertices from 12+8 — FAIL.**

Candidate law:

> **Orthogonal Cycles Do Not Become One Registry by Addition — independent temporal coordinates may combine in context but may not be merged into a peer set merely to fill a polyhedron.**

---

# 4. Twelve Vitae vertices — count-rescue test

The most tempting Vitae completion is something like:

```text
10 grades
+
2 thresholds
=
12 Vitae positions
```

Possible thresholds might include entry, Adept, specialization entry, or other corpus boundaries.

The current repository does not define a canonical twelve-part peer registry of that kind.

Grades and thresholds are different structural roles.

Likewise:

```text
9 authority envelopes + 3 mastery archetypes = 12
```

would mix permission architecture with optional mastery overlays.

That is also not one ontology.

Finding: **12 Vitae vertices by mixed-role addition — FAIL.**

Candidate law:

> **Role Homogeneity Before Coordinate Assignment — a geometric node set should contain concepts of the same architectural type unless the heterogeneity is itself explicitly modeled.**

---

# 5. Edge-to-edge duality test

Both solids have thirty edges.

This looks promising until the dedicated edge audits are compared.

## Tempus thirty-edge result

For a chronology/opposition-preserving zodiac orientation:

```text
12 chronological neighboring-sign edges
6 selected sextile edges
6 selected square edges
6 selected trine edges
```

The secondary eighteen edges are not a complete aspect system and vary by valid orientation.

Therefore only the chronological ring has strong edge semantics so far.

## Vitae thirty-edge result

When twenty faces are assigned to ten grades + ten specializations, the thirty face-adjacency edges necessarily invent curriculum relationships that are not present in the source corpus.

Therefore Vitae's geometric edges are presentation-only by default.

## Result

There is no current thirty-edge semantic structure on either side that could be mapped edge-for-edge.

Finding: **30 ↔ 30 semantic edge duality — FAIL.**

Candidate law:

> **Equal Edge Count Does Not Create Equal Relation Vocabulary — dual solids may share an edge count while their modules expose entirely different or incomplete semantic relation sets.**

---

# 6. The actual canonical Tempus ↔ Vitae relationship already exists

The strongest relationship between the modules is not geometric.

It is already represented in the app-facing schemas:

```text
TempusContext
        ↓ optional bounded reference
VitaePracticeSession.tempusContextId
```

Meaning:

```text
Tempus
can describe when / under what factual or selected symbolic context
an event occurred

Vitae
can record practice and later prepare review
without letting timing determine recognition
```

The relationship is therefore:

```text
TEMPORAL CONTEXT
→
PRACTICE / BECOMING RECORD
```

not:

```text
TEMPORAL POSITION
→
VITAE ADVANCEMENT
```

This is a genuine semantic relationship derived from the repository.

Candidate law:

> **Schema Before Symmetry — the typed cross-module relationship already present in canonical schemas outranks any visual correspondence suggested by a polyhedron.**

---

# 7. Stronger conceptual duality: context ↔ path

Although literal face/vertex semantic duality fails, a higher-level conceptual pairing survives:

```text
TEMPUS
Where / when in rhythm is this moment?

VITAE
What practice / path / responsibility is being lived or recognized?
```

This can be described as:

```text
time context ↔ lived path
orientation ↔ becoming
cycle ↔ traversal
moment ↔ continuity of practice
```

This is not a one-to-one coordinate mapping.

It is a **projection relationship**.

A Vitae region can be viewed through a selected Tempus context.

A Tempus moment can contain references to what the participant chose to practice.

Neither module owns the other.

Candidate law:

> **Semantic Duality May Be Relational Without Being Bijective — two faculties may form a meaningful conceptual pair even when their internal coordinate sets do not map one-to-one.**

Finding: **context ↔ path conceptual duality — PASS, bounded.**

---

# 8. Nesting test

The prior research map considered whether one solid should literally contain the other or the ARCnet cube/stella structure.

The audits do not justify authority-bearing containment.

## Rejected interpretation

```text
larger solid
=
higher authority / parent ontology
```

Tempus is not sovereign over Vitae because time contextualizes practice.

Vitae is not sovereign over Tempus because recognition may reference time.

## Stronger interpretation

```text
co-centered views
+
explicit projection between data models
```

A participant experience could place both geometries around the same sovereign center while changing which faculty is active.

For example:

```text
Identity / Self
      |
      +-- Hope relational view
      |
      +-- Tempus temporal view
      |     optional dodecahedral zodiac shell
      |
      +-- Vitae curriculum view
            optional icosahedral corpus atlas
```

This preserves shared center without claiming containment or authority inheritance.

Candidate law:

> **Co-Centering Does Not Imply Containment — faculties may share a sovereign visual center while remaining separate data and authority domains.**

---

# 9. Dual-solid morph as UI, not ontology

The dodecahedron and icosahedron can be rendered as geometric dual views.

That creates a legitimate UI possibility:

```text
Tempus celestial view
Dodecahedron
      ↓ transition / morph
Vitae corpus view
Icosahedron
```

The morph may communicate:

```text
change of faculty
change of question
change of information topology
```

It must **not** imply:

```text
this Tempus sign becomes this Vitae grade
this zodiac region causes this specialization
this vertex grants this recognition
```

Until the missing 12-vertex and 20-vertex semantic registries independently emerge, the face-center dual transform is visual only.

Candidate law:

> **Transform Without Transfer — a geometric morph may change representation without transferring identity, authority, recognition, or causal meaning between the labels on the two solids.**

Finding: **dual-solid morphing UI — PASS as a non-semantic presentation experiment.**

---

# 10. Dynamic geometry interpretation

The audits strengthen the earlier principle:

> **Stable Topology, Living State.**

A dynamic Arcanum geometry does not need its semantic coordinates to continuously change.

Instead:

```text
fixed / relatively stable
- Hope node functions
- ARCnet system identities
- Tempus zodiac face identities in celestial view
- Vitae primary corpus face identities if adopted

living / dynamic
- current Hope observations
- selected archetypal lens
- current Tempus context
- selected Vitae path
- practice records
- actual dependency overlays
- active ARCnet workflows
- rotation / focus / transition state
```

This gives movement without semantic instability.

---

# 11. Fruit-of-Life consequence

The Tempus audit has now produced the first strong independently derived twelvefold set in the nested-geometry research:

```text
12 optional zodiac regions
```

Therefore a future `1 + 12` flat-geometry test is no longer count-empty.

However the center must be handled carefully.

A risky interpretation would be:

```text
Identity
+
12 zodiac signs around the person
```

because it may imply that temporal/symbolic coordinates define Identity.

A safer candidate for a future test is:

```text
selected moment / temporal focus
+
12 zodiac regions
```

or simply a twelve-region navigation diagram with no personal center semantics.

This audit does **not** promote the Fruit of Life.

It only reopens that research question with a real twelvefold dataset.

Candidate law:

> **Temporal Center Is Not Identity — when a symbolic time map uses a center, the center should represent the selected moment or navigation focus unless Identity semantics are independently justified.**

---

# 12. Relation to Hope and the planetary lens model

Hope already uses the Classical Seven most successfully as:

```text
6 rotating interpretive lenses
+
1 optional solar return-to-center operation
```

Tempus already has factual planetary/time context.

The new dodecahedral shell does not change that result.

A safe sequence remains:

```text
participant selects Hope relation
        ↓
participant optionally selects or accepts a transparent lens suggestion
        ↓
participant optionally requests Tempus context
        ↓
Hope asks a bounded question
```

Vitae remains downstream only through a separate practice / recognition pathway.

No geometry creates automatic A2 → Tempus → Vitae progression.

---

# 13. Relation to ARCnet

ARCnet's current geometric exploration concerns system relationships, edge contracts, and inner coordination junctions.

Tempus and Vitae geometry must not silently become ARCnet runtime primitives.

If an ARCnet app invocation involves Tempus or Vitae, the crossing remains governed by ordinary capability, data, doctrine, receipt, and settlement rules.

The fact that UI solids are nested, dual, co-centered, rotating, or visually aligned grants no cross-system capability.

Candidate law:

> **Visual Incidence Does Not Create an Edge Contract — touching, intersecting, nesting, or duality in presentation never authorizes data or action flow between systems.**

---

# 14. Duality audit verdict

| Hypothesis | Result | Reason |
| --- | --- | --- |
| Dodecahedron / icosahedron are mathematical duals | **Pass / fact** | 12↔12, 20↔20 face-vertex correspondence and 30 edges |
| Tempus 12 faces directly dual Vitae 20 faces | **Fail** | Faces do not dual-map to faces |
| 20 Tempus vertices have canonical semantics | **Fail / undefined** | No homogeneous twenty-part Tempus registry |
| 12 Vitae vertices have canonical semantics | **Fail / undefined** | No homogeneous twelve-part Vitae registry |
| 30 Tempus edges map to 30 Vitae edges | **Fail** | Neither side has a complete matching semantic edge vocabulary |
| Tempus ↔ Vitae has a real conceptual relation | **Pass** | Temporal context ↔ lived practice/path |
| TempusContext can project into Vitae practice | **Pass / existing schema** | Explicit bounded schema relationship already exists |
| Dual solids can morph in UI | **Pass, presentation-only** | Useful faculty transition if labels do not transfer meaning |
| One solid should contain/command the other | **Fail** | Context does not imply authority hierarchy |
| Shared center is possible | **Pass, bounded** | Co-centered faculty views can preserve sovereign Identity |

---

# 15. Leading architecture after both audits

The strongest current nested information picture is:

```text
IDENTITY / SELF
sovereign center

HOPE
fixed six-direction relational scaffold
+ participant-owned current state
+ rotating optional archetypal lenses

TEMPUS
multi-cycle temporal context
+ optional dodecahedral zodiac shell
    12 faces = zodiac regions
    ring = chronology
    opposites = six zodiac oppositions
    other geometric edges inert by default

VITAE
geometry-independent corpus / recognition registry
+ optional icosahedral atlas
    20 faces = 10 grades + 10 specializations
    geometric edges inert by default
    actual path/dependencies overlaid from registry

ARCANUM
participant-facing integration of these faculties

ARCNET
shared substrate and bounded system relations

ARCHITECT
builder / guardian interface for system becoming
```

The solids are therefore better understood as **faculty-specific views** than as one literal stack of authority-bearing nested shells.

---

# 16. New candidate laws

## Element-Type Fidelity

Semantic duality requires concepts to occupy the geometric elements that actually correspond under dual transformation.

## Orthogonal Cycles Do Not Become One Registry by Addition

Independent temporal coordinates remain independent dimensions.

## Role Homogeneity Before Coordinate Assignment

Mixed structural roles may not be combined merely to fill a node count.

## Equal Edge Count Does Not Create Equal Relation Vocabulary

Shared geometry counts do not establish shared semantic edge types.

## Schema Before Symmetry

Typed canonical data relationships outrank geometric resemblance.

## Semantic Duality May Be Relational Without Being Bijective

Context and path may form a true conceptual pair without one-to-one coordinate mapping.

## Co-Centering Does Not Imply Containment

Sharing a visual center does not create hierarchy or data ownership.

## Transform Without Transfer

A morph between geometric views does not transfer labels, authority, recognition, or causal meaning.

## Temporal Center Is Not Identity

A temporal map's center should not define the being.

## Visual Incidence Does Not Create an Edge Contract

Geometric contact is not runtime permission.

---

# 17. Decision

The mathematical dodecahedron–icosahedron duality **does not yet survive as a literal semantic Tempus–Vitae dual architecture**.

The missing evidence is precise:

```text
Tempus lacks a canonical 20-vertex semantic set.
Vitae lacks a canonical 12-vertex semantic set.
Neither module currently exposes a complete 30-edge vocabulary that maps to the other.
```

But the audits do support a meaningful weaker relationship:

> **Tempus provides temporal context; Vitae organizes lived practice and recognized becoming.**

And the dual solids remain valuable as a possible **co-centered visual transform between faculty views**.

This produces a better design than forced nesting:

```text
same sovereign center
multiple faculty-specific geometries
explicit schema bridges
no geometric authority leakage
```

---

# 18. Next gate

The next geometry work should now shift from counting to representation prototypes:

1. create a geometry-independent `TempusZodiacRegion` candidate registry;
2. create or generate the geometry-independent Vitae grade/specialization registry;
3. prototype the Tempus dodecahedral zodiac shell from its registry;
4. prototype the Vitae icosahedral corpus atlas from its registry;
5. test an optional dodecahedron↔icosahedron morph with **no semantic label transfer**;
6. test `TempusContext` projected onto one selected Vitae practice/path;
7. keep all geometric non-semantic edges visually suppressible;
8. test cards/list/tree equivalents and reduced motion;
9. only after those prototypes revisit literal nesting, Fruit-of-Life `1+12`, or any face↔vertex semantic correspondence.
