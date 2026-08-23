---
title: "Tempus Dodecahedron Geometry Audit"
status: design-candidate
visibility: public
last_updated: 2026-08-22
description: "Full falsification audit of the regular dodecahedron as a candidate Tempus information geometry, including twelve-face zodiac mapping, all thirty face-adjacency relations, opposition structure, decanic compatibility, authority boundaries, and accessibility constraints."
phase: "Pre-Genesis"
authority: "non-canonical design evidence"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/37"
---

# Tempus Dodecahedron Geometry Audit

## Purpose

This audit tests whether the regular dodecahedron should become a Tempus architecture, a bounded Tempus navigation geometry, or neither.

It explicitly rejects the argument:

```text
12 dodecahedral faces
+
12 zodiac signs
=
therefore Tempus is a dodecahedron
```

The geometry must survive doctrine, adjacency, sequencing, opposition, decanic, authority, and accessibility tests.

## Repository grounding

This audit reads the current Tempus corpus through the stricter non-coercive posture established by:

- `docs/doctrine/temporal-model.md`
- `docs/modules/tempus/tempus.md`
- `docs/modules/tempus/tempus-structure.md`
- `docs/specs/modules/tempus-layer-model.md`
- `docs/specs/modules/tempus-context-schema.md`
- `docs/specs/modules/tempus-content-foundation.md`

Controlling principles include:

```text
Tempus = temporal structuring / orientation
Time = rhythmic, cyclical, spiral-bound
Tempus records the shape of the moment
Tempus does not interpret or judge the being
symbolic layers are optional
astronomical facts remain distinct from archetypal interpretation
no urgency / streak / missed-window pressure
Tempus cannot advance Vitae
```

Any older symbolic or reward assumption that conflicts with these rules is excluded from the geometry model.

---

# 1. Geometry under test

A regular dodecahedron has:

```text
12 pentagonal faces
20 vertices
30 edges
```

When **faces** are treated as the twelve candidate Tempus regions, face adjacency has the topology of the icosahedral graph:

```text
12 face-regions
5 neighboring faces per face
30 face-adjacency relations
1 unique opposite face per face
```

From any face, the face-relation distance shells are:

```text
self              1
adjacent ring      5
second ring        5
opposite           1
```

The six unique opposite-face pairs are therefore a real structural property rather than a visual impression.

---

# 2. Tempus is not intrinsically twelvefold

Before assigning the zodiac, the canonical module already disproves a whole-module twelvefold interpretation.

Tempus simultaneously contains several independent temporal structures:

```text
civic calendar
4 solar seasons
solstices / equinoxes
8 named lunar phases
planetary day / hour context
12-sign zodiac layer
36-decan optional layer
ceremonial depth
rites / factual receipts
```

The app-facing layer model is also not twelvefold:

```text
Calendar
Solar / Seasonal
Lunar
Planetary + Zodiac
Decanic
Ceremonial
Rites / Receipts / Utility
```

Therefore:

> **The dodecahedron cannot honestly be the complete Tempus ontology merely because one optional Tempus layer is twelvefold.**

Finding: **whole-Tempus dodecahedron — FAIL.**

The remaining question is narrower:

> Can the dodecahedron be a useful geometry for the optional zodiacal / celestial Tempus layer?

---

# 3. Twelve faces ↔ twelve zodiac signs

The strongest candidate face identity is:

```text
one dodecahedral face
=
one zodiac sign / zodiacal temporal chamber
```

This mapping has several advantages:

- exactly twelve face-regions;
- each region can remain a bounded optional symbolic context;
- a face can hold sign-specific Codex content without turning the sign into a participant trait;
- the model can remain hidden when the participant uses Grounded, Seasonal, or Lunar depth.

This is compatible with Tempus doctrine only if the face describes **time context**, not the person.

Allowed:

```text
The selected moment is within this zodiacal region.
```

Forbidden:

```text
You are this region.
This region determines your behavior.
This region grants readiness.
```

Finding: **twelve faces as optional zodiac regions — PASS, bounded.**

---

# 4. Can chronological zodiac order live on the faces?

A zodiac navigator needs the twelve signs to preserve their ordinary circular order:

```text
Aries
Taurus
Gemini
Cancer
Leo
Virgo
Libra
Scorpio
Sagittarius
Capricorn
Aquarius
Pisces
→ Aries
```

The face-adjacency graph of the dodecahedron admits a twelve-face Hamiltonian cycle.

More importantly, the audit found a labeling in which:

1. every consecutive zodiac sign is face-adjacent;
2. Pisces returns to Aries through a face adjacency;
3. signs six positions apart in the zodiac are the six unique opposite-face pairs.

Therefore the geometry can simultaneously preserve:

```text
12-step chronological cycle
+
6 zodiac opposition pairs
```

This is a genuine structural fit, not just a count match.

Finding: **chronological ring — PASS.**

Finding: **opposition as opposite face — PASS.**

Candidate law:

> **Chronology Is a Selected Cycle — a temporal sequence may use a chosen cycle through a richer geometry without requiring every geometric adjacency to mean chronological succession.**

---

# 5. Six opposite faces ↔ six zodiac oppositions

With chronological order fixed, the opposite-face pairs become:

```text
Aries       ↔ Libra
Taurus      ↔ Scorpio
Gemini      ↔ Sagittarius
Cancer      ↔ Capricorn
Leo         ↔ Aquarius
Virgo       ↔ Pisces
```

This matches the ordinary six zodiac opposition pairs exactly.

This is the strongest geometric correspondence found in the audit.

The system must still frame opposition as an optional symbolic relationship, never a prediction of conflict, compatibility, psychology, destiny, or worth.

Candidate law:

> **Opposition May Be Geometric Without Becoming Deterministic — an opposite-face relationship may organize symbolic contrast while remaining causally and psychologically neutral.**

---

# 6. Full thirty-edge face-adjacency audit

The central falsification test was whether all thirty face adjacencies naturally reproduce a complete zodiac relationship system.

They do not.

Under a valid chronological + opposition-preserving orientation, the thirty face-adjacency edges classify by zodiac separation as:

```text
12 × neighboring-sign relations   (30° separation)
 6 × sextile relations            (60° separation)
 6 × square relations             (90° separation)
 6 × trine relations              (120° separation)
 0 × quincunx relations           (150° separation)
 0 × opposition edges             (180°; opposition is represented by opposite faces instead)
```

This initially looks elegant, but it is incomplete.

For each of the 60°, 90°, and 120° relationship classes, the twelve-sign zodiac contains **twelve** undirected pairs. The dodecahedral adjacency graph selects only **six** of each.

Therefore it encodes a half-set of sextiles, squares, and trines rather than the complete relation class.

## Example valid orientation

One chronology/opposition-preserving orientation yields these thirty face adjacencies.

### Neighboring signs — all twelve

```text
Aries ↔ Taurus
Taurus ↔ Gemini
Gemini ↔ Cancer
Cancer ↔ Leo
Leo ↔ Virgo
Virgo ↔ Libra
Libra ↔ Scorpio
Scorpio ↔ Sagittarius
Sagittarius ↔ Capricorn
Capricorn ↔ Aquarius
Aquarius ↔ Pisces
Pisces ↔ Aries
```

### Selected sextiles — six of twelve

```text
Taurus ↔ Cancer
Taurus ↔ Pisces
Cancer ↔ Virgo
Virgo ↔ Scorpio
Scorpio ↔ Capricorn
Capricorn ↔ Pisces
```

### Selected squares — six of twelve

```text
Aries ↔ Capricorn
Taurus ↔ Leo
Gemini ↔ Pisces
Cancer ↔ Libra
Virgo ↔ Sagittarius
Scorpio ↔ Aquarius
```

### Selected trines — six of twelve

```text
Aries ↔ Leo
Aries ↔ Sagittarius
Gemini ↔ Libra
Gemini ↔ Aquarius
Leo ↔ Sagittarius
Libra ↔ Aquarius
```

In this orientation, the selected trines are concentrated in the traditional fire/air parity while selected sextiles are concentrated in the earth/water parity.

That asymmetry is **not** a canonical Tempus principle.

A different valid orientation can swap which parity receives the selected sextile/trine subset.

The geometry is therefore making an unearned choice if those edges are interpreted as zodiac doctrine.

Finding: **all thirty edges as fixed zodiac-aspect semantics — FAIL.**

---

# 7. Orientation non-uniqueness test

The scan found multiple valid face labelings that preserve both:

```text
chronological zodiac cycle
+
all six opposition pairs
```

but produce different secondary 60° / 90° / 120° adjacency subsets.

After normalizing the chronological zodiac order, the search produced **four distinct secondary adjacency signatures**.

This means the dodecahedron does not itself answer:

```text
Which sextile is an edge?
Which square is an edge?
Which trine is an edge?
```

Any implementation that assigned meaning to those secondary geometric edges would therefore be choosing a symbolic convention that must be separately justified.

Candidate law:

> **Geometry Cannot Ratify Its Own Correspondence — when multiple equally valid orientations produce different symbolic relationships, the geometry is presentation evidence, not doctrinal authority.**

---

# 8. Aspect-completeness falsification

A second test asked whether the face-adjacency graph could preserve the chronological ring while also including **all** pairs of a standard relation class.

The scan did not find a chronological face cycle in which all twelve:

```text
sextile pairs
or
square pairs
or
trine pairs
```

are simultaneously face edges.

The dodecahedral graph is therefore too sparse to be a complete zodiac-aspect graph.

This is not a flaw in the solid.

It is evidence that geometric adjacency and symbolic aspect are different concepts.

Candidate law:

> **Aspect Completeness Law — if a geometry claims to encode an aspect class, omitted members of that class must be intentional and semantically justified; visual adjacency may not silently redefine the class.**

---

# 9. Fivefold face structure versus three decans

Each zodiac sign contains three conventional decanic divisions in the current Tempus layer model:

```text
12 signs × 3 decans = 36 decans
```

A dodecahedral face is pentagonal.

Its native local symmetry therefore suggests five edges / five vertices, not three.

No canonical Tempus source provides five equal sign-internal functions that would make those pentagonal subdivisions meaningful.

Trying to make the five corners mean:

```text
solar
lunar
planetary
decanic
ceremonial
```

would also mix unequal dimensions:

- decanic is a subdivision of zodiac;
- lunar and planetary are parallel context channels;
- ceremonial is a selected depth;
- solar context exists independently of zodiac.

Finding: **pentagonal face geometry as literal internal Tempus layer model — FAIL.**

Decans may still be shown *inside* a zodiac face as ordinary content/navigation without claiming that the pentagon itself generates the threefold division.

Candidate law:

> **Decan Independence — a twelve-face zodiac shell must not force its fivefold face symmetry onto the independent threefold decanic structure.**

---

# 10. Twenty dodecahedral vertices

The audit searched the current Tempus structure for an independently derived twenty-part set.

No canonical twenty-part Tempus registry currently exists.

Tempting count constructions include:

```text
12 zodiac signs + 8 lunar phases = 20
```

but this mixes two different coordinate systems:

- zodiac position;
- lunar phase.

They can coexist in one `TempusContext` at the same moment, but they are not twenty peer states.

Using the twenty dodecahedral vertices for that sum would therefore be a **count rescue**, not an architecture.

Finding: **twenty Tempus vertices as semantic positions — FAIL / undefined.**

---

# 11. Thirty dodecahedral edges

Likewise, the thirty geometric edges do not map to a canonical thirty-item temporal set.

The fact that a zodiac sign is conventionally divided into thirty degrees does not help:

```text
30 edges total across the solid
≠
30 degrees per sign
≠
360 zodiac degrees
```

No degree, day, or rite semantics should be inferred from the global edge count.

Candidate law:

> **Global Count Is Not Local Measure — the total number of edges in a solid may not be reinterpreted as the number of subdivisions inside every face.**

---

# 12. Multi-cycle compatibility

Tempus must support simultaneous, independent temporal cycles.

Example `TempusContext` may contain at once:

```text
civil date / time
open-rest-silent window
solar season
lunar phase
moon zodiac
zodiac sign + day within sign
planetary day / hour
selected depth
precision / source
```

A dodecahedral zodiac shell can hold the **zodiac coordinate** while other cycles are projected onto or around it.

It must not absorb those cycles into face identity.

A viable UI grammar is therefore:

```text
DODECAHEDRAL FACE
zodiac region

OVERLAYS / CONTEXT
solar state
lunar state
planetary state
decanic detail
ceremonial availability
user-selected depth
```

rather than:

```text
one face = complete state of time
```

Candidate law:

> **Temporal Multiplicity — no single symbolic coordinate may collapse solar, lunar, civic, planetary, zodiacal, or participant-selected depth into one temporal identity.**

---

# 13. Hope / C2 relationship

The dodecahedral candidate belongs most naturally to the slower symbolic / celestial side of the architecture rather than Hope A2's current relational snapshot.

A safe bridge is:

```text
participant selects an A2 relation
        ↓ optional request
Tempus provides bounded factual/symbolic context
        ↓
Hope poses a reflection using that selected context
```

Not:

```text
Tempus face
→ assigns Hope trait
→ predicts participant behavior
```

C2 Natal Pattern may eventually use selected astronomical or cultural context, but the dodecahedron does not itself validate natal psychology.

---

# 14. Vitae boundary

Canonical schemas already define the correct Tempus→Vitae bridge:

```text
VitaePracticeSession.tempusContextId?
```

or equivalent bounded factual `TempusContext` attachment.

Therefore:

```text
Tempus geometry
may contextualize a practice event

Tempus geometry
may not advance the practice
may not prove stabilization
may not assign a grade
may not determine readiness
may not grant authority
```

Candidate law:

> **Context Is Not Advancement — geometric or celestial context may accompany a Vitae event but can never become the cause or proof of Vitae recognition.**

---

# 15. Economic boundary

A dodecahedral visual layer may be optional utility or Codex depth where otherwise permitted.

MANA may not:

- buy a more favorable temporal region;
- repair a "missed" zodiac chamber;
- turn symbolic timing into reward multipliers;
- purchase readiness;
- turn use of all twelve faces into an achievement economy.

No completion ring, streak, or twelve-face collection reward should arise from this geometry.

---

# 16. Accessibility and geometry-free operation

Tempus must work without a 3D solid.

Every dodecahedral interaction requires a plain representation such as:

```text
current sign card
previous / next sign
opposite sign
calendar date range
optional symbolic notes
selected lunar / planetary context
```

Reduced-motion mode must not require spinning the solid to discover information.

Screen-reader order must follow semantic time/navigation rather than spatial coordinates.

Candidate law:

> **Temporal Navigation Precedes Spatial Navigation — the user must be able to understand and traverse time even when the solid is absent.**

---

# 17. Audit verdict by hypothesis

| Hypothesis | Result | Reason |
| --- | --- | --- |
| Dodecahedron = complete Tempus ontology | **Fail** | Tempus is multi-cycle and multi-layer, not intrinsically twelvefold |
| 12 faces = optional zodiac regions | **Pass, bounded** | Exact count plus useful temporal chamber model |
| Face ring can preserve zodiac chronology | **Pass** | A 12-face Hamiltonian cycle exists |
| Opposite faces can encode zodiac oppositions | **Pass** | Six face-opposite pairs align exactly |
| All 30 face adjacencies = complete aspect graph | **Fail** | Only half-sets of sextile/square/trine relations appear |
| Geometry uniquely selects secondary aspects | **Fail** | Multiple equally valid adjacency signatures |
| Pentagon subdivisions = three decans | **Fail** | Fivefold local symmetry does not produce threefold decans |
| 20 vertices = canonical Tempus set | **Fail / undefined** | No independent twenty-part Tempus registry |
| Dodecahedron can be optional celestial UI | **Pass, candidate** | If edges beyond chronology/opposition remain inert unless typed |
| Geometry can affect readiness / worth / authority | **Prohibited** | Violates Temporal/Vitae/Identity doctrine |

---

# 18. Leading architecture after the audit

The strongest model is now:

```text
TEMPUS
multi-cycle temporal context engine

    grounded/calendar views
    solar/seasonal views
    lunar views

    optional celestial view
        ↓
    DODECAHEDRAL ZODIAC SHELL
        12 faces = signs
        selected ring = chronology
        6 opposite pairs = opposition
        other geometric adjacency = inert presentation metadata
        unless separately defined by future doctrine

    decanic content
    ceremonial content
    rites / factual receipts
```

This means the dodecahedron has earned a **bounded role**, not ownership of Tempus.

Candidate designation:

> **Tempus Dodecahedral Zodiac Shell** — an optional celestial navigation geometry whose face identities and chronological/opposition structure may be meaningful while untyped geometric adjacencies remain non-semantic.

---

# 19. New candidate laws

## Zodiac Shell, Not Tempus Whole

A twelvefold zodiac representation may exist inside Tempus without reducing Tempus to the zodiac.

## Chronology Is a Selected Cycle

A linear/circular time order may traverse a richer solid without making every edge a time transition.

## Opposition May Be Geometric Without Becoming Deterministic

Opposite faces may encode symbolic contrast, never causal or psychological certainty.

## Unnamed Adjacency Is Inert

A visible geometric edge carries no symbolic or runtime meaning until a separate contract/schema explicitly names that meaning.

## Geometry Cannot Ratify Its Own Correspondence

Multiple valid orientations prevent geometric symmetry from becoming doctrinal authority.

## Aspect Completeness Law

An aspect class cannot be represented by an unexplained partial subset.

## Decan Independence

The threefold decanic structure may not be fabricated from pentagonal face symmetry.

## Temporal Multiplicity

Solar, lunar, civic, planetary, zodiacal, and selected-depth coordinates remain distinct dimensions.

## Global Count Is Not Local Measure

Global polyhedral counts may not be reused as local subdivisions without an independent semantic derivation.

## Context Is Not Advancement

Temporal context may accompany Vitae or Hope activity but may not create recognition, readiness, worth, or authority.

## Temporal Navigation Precedes Spatial Navigation

The full Tempus experience must remain understandable without 3D geometry.

---

# 20. Decision

The full audit **rejects the dodecahedron as the complete fixed structure of Tempus**.

It **provisionally accepts the dodecahedron as an optional zodiacal/celestial navigation shell** because three independent facts survive falsification:

```text
12 face-regions
12-step chronological face cycle
6 exact opposite-face pairs
```

The remaining eighteen non-chronological face-adjacency edges have **not** earned symbolic meaning.

They must remain presentation-only unless future evidence derives explicit semantics for each relationship without distorting astronomical fact, cultural pluralism, or participant sovereignty.

This is a stronger and narrower result than the original twelve-faces intuition.

It preserves what the geometry genuinely contributes and refuses what it does not prove.

---

# 21. Next Tempus geometry gate

Before any canonical promotion:

1. prototype a geometry-free zodiac card/list and a dodecahedral view from the same data;
2. verify `current`, `previous`, `next`, and `opposite` navigation;
3. keep secondary face edges visually optional / non-semantic;
4. overlay lunar and planetary context without changing face identity;
5. demonstrate three decans per sign without deriving them from pentagonal corners;
6. test reduced motion and screen-reader traversal;
7. verify Hope/C2 receives only explicitly selected bounded context;
8. verify Vitae receives factual context only;
9. Human Architect review decides whether the shell belongs in Tempus symbolic UI specifications.
