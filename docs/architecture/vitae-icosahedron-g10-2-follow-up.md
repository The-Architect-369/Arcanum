---
title: "Vitae Icosahedron G(10,2) Decomposition Follow-Up"
status: design-candidate
visibility: public
last_updated: 2026-08-23
description: "Follow-up falsification of the seductive 10-cycle + 5-cycle + 5-cycle + 10-spoke decomposition of the Vitae icosahedral corpus atlas."
phase: "Pre-Genesis"
authority: "non-canonical design evidence"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/37"
---

# Vitae Icosahedron G(10,2) Decomposition Follow-Up

## Purpose

The first Vitae geometry audit found that the face-adjacency graph of the icosahedron admits an unusually suggestive decomposition:

```text
one 10-node cycle
+
two 5-node cycles
+
ten connecting spokes
```

A naive assignment would be:

```text
10-cycle = Grades I-X
5-cycle  = five specializations
5-cycle  = five specializations
10 spokes = grade ↔ specialization correspondences
```

The original audit rejected this as doctrinally unsupported because it appeared to fabricate:

1. an Adept → Guardian closure edge;
2. two privileged specialization pentads;
3. ten one-to-one grade / specialization pairings.

The Human Architect asked that these apparent fabrications be explored rather than discarded.

This follow-up therefore asks a stricter question:

> **Can any of the three apparent fabrications be reinterpreted as bounded information architecture without becoming false curriculum doctrine, hierarchy, or authority?**

The answer is mixed.

---

# 1. Source posture

The following sources control this study:

- `docs/modules/vitae/vitae-and-becoming.md`
- `docs/vitae/overview.md`
- `docs/vitae/curriculum/elementary-school/elementary-school-canon.md`
- `docs/vitae/curriculum/intermediate-school/intermediate-school-canon.md`
- `docs/vitae/curriculum/high-school/high-school-canon.md`
- `docs/vitae/curriculum/adept/adept-threshold-canon.md`
- `docs/vitae/constitution/cross-grade-dependency-canon.md`
- `docs/vitae/curriculum/specializations/specialization-overview-codex.md`
- `docs/vitae/curriculum/specializations/specialization-wide-invariants-canon.md`
- `docs/vitae/curriculum/specializations/mastery-path-governance-canon.md`
- `docs/specs/modules/vitae-context-schema.md`
- `docs/specs/modules/vitae-content-foundation.md`
- `docs/specs/modules/vitae-economy-boundary.md`

Where older hard-progression or hidden-mastery language conflicts with current non-coercive, non-comparative, consent-respecting Vitae constraints, the stricter current boundary controls.

---

# 2. The graph decomposition under test

When the twenty icosahedral faces are treated as nodes connected when they share an icosahedral edge, the resulting twenty-node graph can be represented in a generalized-Petersen-style form:

```text
outer ring:
U0-U1-U2-U3-U4-U5-U6-U7-U8-U9-U0

spokes:
Ui-Vi

inner edges:
Vi-V(i+2 mod 10)
```

Because stepping by two around ten indices separates parity, the inner nodes form two independent pentagonal cycles:

```text
V0-V2-V4-V6-V8-V0
V1-V3-V5-V7-V9-V1
```

This is the mathematical source of the seductive:

```text
10 + 5 + 5 + 10 spokes
```

structure.

The graph fact is real.

Its Vitae semantics must still be earned independently.

---

# 3. Fabrication 1 — Adept ↔ Guardian closure

## Original concern

If Grades I-X occupy the outer 10-cycle in ordinary order, nine edges correspond naturally to the grade sequence:

```text
Guardian → Seeker → Disciple → Mystic → Scholar
→ Healer → Alchemist → Sage → Oracle → Adept
```

The tenth geometric edge closes:

```text
Adept ↔ Guardian
```

Interpreted as another progression edge, this is false.

The Core Vitae ladder concludes at Adept and transitions into optional specialization.

## Repository evidence for a different interpretation

The Adept Threshold Canon explicitly states that an Adept may:

```text
revisit prior grades with integrative depth
practice without active progression tracking
```

It also states:

```text
all prior grade invariants remain in force
Adept does not invalidate prior grades
Adept does not supersede foundational disciplines
specialization work remains grounded in Guardian reliability,
Seeker meaning discipline,
Disciple ethical restraint,
and Mystic perceptual containment
```

The Grade Architecture Template also treats Guardian as the reference baseline and preserves foundational practices beyond nominal completion.

The Cross-Grade Dependency Canon treats foundational stability as continuously load-bearing rather than disposable after advancement.

Therefore the geometric closure can carry a bounded meaning that is **not** progression:

```text
Adept
  ↓
return to foundational maintenance / renewed practice
  ↓
Guardian
```

This does not mean:

```text
Adept becomes Grade I again
Adept loses prior recognition
progression restarts automatically
all participants must traverse a loop
```

It means the end of the structured ladder remains connected to its foundation.

## Finding

> **Adept ↔ Guardian as progression — REJECTED.**

> **Adept ↔ Guardian as a renewal / return-to-foundation seam — BOUNDED PASS.**

Candidate law:

> **Renewal Is Not Regression — returning attention to a foundational discipline after advanced practice does not erase prior becoming or restart the grade ladder.**

Candidate law:

> **Completion Returns to Maintenance — the close of a finite curriculum sequence may reconnect to the practices that keep its foundations alive, provided the return is not scored, compulsory, or interpreted as loss of status.**

### Presentation implication

If the outer ten-grade cycle is rendered, the ninth sequential edges and the closing seam must not look semantically identical.

Suggested edge types:

```text
I → II ... IX → X
edge_type = sequence

X ↔ I
edge_type = renewal_seam
```

The renewal seam should be visually and accessibly distinguishable from progression.

---

# 4. Fabrication 2 — two specialization pentads

## Canonical constraint

The specialization corpus is explicit:

```text
specializations are non-hierarchical
specializations are non-exclusive
no specialization is prerequisite for another
no required progression order exists
cross-specialization combinations are situational and contextual
no predefined hybrid tracks should acquire authority
```

Therefore two fixed pentads cannot become:

```text
School A
School B
higher/lower family
required specialization sequence
compatibility class
exclusive faction
```

That remains rejected.

## But an analytic 5 + 5 view can be derived

The public specialization mandates reveal one useful non-exclusive classification.

### Interpretive / representational pentad

```text
Illusionist
Arcanist
Philosopher
Enchanter
Astrologer
```

Shared emphasis:

```text
perception
knowledge / models
meaning / coherence
symbol / resonance
scale / rhythm / perspective
```

A possible analytic cycle is:

```text
Illusionist
→ Arcanist
→ Philosopher
→ Enchanter
→ Astrologer
→ Illusionist
```

Neighbor questions:

```text
Illusionist ↔ Arcanist
perception hygiene ↔ epistemic model discipline

Arcanist ↔ Philosopher
knowledge limits ↔ coherence / meaning

Philosopher ↔ Enchanter
meaning ↔ symbol / resonance

Enchanter ↔ Astrologer
symbolic atmosphere ↔ temporal scale / rhythm

Astrologer ↔ Illusionist
perspective / cycles ↔ perceptual distortion safeguards
```

The Enchanter↔Astrologer relation requires an especially strong anti-causation boundary so symbolic resonance cannot turn temporal context into determinism.

### Formation / lifecycle pentad

```text
Hierophant
Druid
Artificer
Alchemist
Necromancer
```

Shared emphasis:

```text
threshold
living system
form / construction
transformation
ending / release
```

A particularly coherent analytic cycle is:

```text
Hierophant
→ Druid
→ Artificer
→ Alchemist
→ Necromancer
→ Hierophant
```

Neighbor questions:

```text
Hierophant ↔ Druid
threshold ↔ living transition

Druid ↔ Artificer
living system ↔ constructed form

Artificer ↔ Alchemist
form ↔ transformation

Alchemist ↔ Necromancer
transformation ↔ release / ending

Necromancer ↔ Hierophant
ending ↔ threshold
```

This is structurally interesting because the final relation naturally returns ending to threshold without claiming metaphysical reincarnation or mandatory renewal.

## Finding

> **Two specialization pentads as canonical families or tracks — REJECTED.**

> **Two specialization pentads as optional analytic / navigation views — VIABLE DESIGN CANDIDATE.**

Candidate law:

> **Pentad as Lens, Not Lane — a specialization grouping may help a participant inspect relationships among domains, but it may not become a required track, identity class, authority category, or prerequisite family.**

Candidate law:

> **Grouping Does Not Imply Exclusion — membership in one analytic view may not imply incompatibility with domains shown in another view.**

---

# 5. Fabrication 3 — ten grade ↔ specialization spokes

## The question

The graph supplies exactly ten spokes.

The corpus supplies exactly:

```text
10 grades
10 specializations
```

The tempting claim is:

```text
one grade
↔
one specialization
```

A full semantic scan shows that real resonance exists, but the relation is not uniquely one-to-one.

## High-confidence resonances

Several pairings are unusually strong because the specialization extends or applies a faculty already explicit in the grade.

### Seeker ↔ Philosopher

```text
Seeker:
meaning discipline and inquiry stability

Philosopher:
coherence without closure; meaning, ethics, integration
```

Strong correspondence:

```text
inquiry discipline
→ advanced stewardship of meaning without closure
```

### Mystic ↔ Illusionist

```text
Mystic:
perception without interpretation

Illusionist:
perceptual hygiene; bias, projection, narrative distortion
```

Strong correspondence:

```text
perception without doctrine
→ advanced stewardship of distortion without superior-sight claims
```

### Scholar ↔ Arcanist

```text
Scholar:
structured knowledge and cognitive architecture

Arcanist:
epistemic stewardship; knowledge systems, models, limits of knowing
```

Strong correspondence:

```text
structured knowing
→ stewardship of knowledge limits
```

### Alchemist ↔ Alchemist

The shared name is not sufficient by itself, but the functions also correspond:

```text
Grade VII:
transformation and synthesis

Specialization:
ethical transformation under constraint
```

Strong correspondence:

```text
responsible transformation
→ advanced transformation stewardship
```

### Oracle ↔ Astrologer

```text
Oracle:
pattern perception and foresight without prophecy

Astrologer:
scale and rhythm without fate; cycles, timing, perspective
```

Strong correspondence:

```text
pattern perception without prediction
→ temporal / scale interpretation without fate
```

### Adept ↔ Artificer

```text
Adept:
creative stabilization and containment of generative capability

Artificer:
responsible form and tool stewardship; design, construction, maintenance
```

Strong correspondence:

```text
creation without distortion
→ responsible form / tool stewardship
```

These six relationships survive as strong **resonances**.

They still do not make the corresponding specializations automatic outcomes of those grades.

## Ambiguous regions

The remaining four grades do not produce one uniquely superior specialization mapping.

### Guardian

Strong candidates include:

```text
Guardian ↔ Hierophant
reliability / guarding self-governance
↔ threshold stewardship without gatekeeping

Guardian ↔ Druid
grounding / reliability
↔ living-systems balance and embodiment
```

Neither is uniquely forced.

### Disciple

Plausible candidates include:

```text
Disciple ↔ Hierophant
ethical action / restraint
↔ threshold stewardship

Disciple ↔ Necromancer
refusal / consequence
↔ ethical endings and release

Disciple ↔ Enchanter
action without authority
↔ resonance without control
```

No unique bijection emerges.

### Healer

Two especially strong candidates exist:

```text
Healer ↔ Druid
care / maintenance / restoration
↔ living-systems stewardship

Healer ↔ Necromancer
care without ownership
↔ grief, impermanence, ethical release
```

The first emphasizes sustaining life.
The second emphasizes caring through endings.

Both are legitimate advanced expressions of care.

### Sage

Plausible candidates include:

```text
Sage ↔ Philosopher
integration / reflective wisdom
↔ coherence without closure

Sage ↔ Enchanter
embodied understanding
↔ meaning / resonance without control

Sage ↔ Druid
integration at scale
↔ living-systems balance

Sage ↔ Alchemist
coherent synthesis
↔ transformation under constraint
```

Again, no unique spoke is forced.

## Finding

> **The corpus supports a grade↔specialization resonance network. It does not support a canonical one-to-one pairing.**

Candidate law:

> **Resonance Is Many-to-Many — an advanced stewardship domain may express capacities stabilized across several grades, and one grade may mature into several legitimate specialization contexts.**

Candidate law:

> **Spoke Is Suggestion, Not Destiny — a grade-to-specialization connection may be used as transparent navigation or reflection metadata but may not automatically choose, unlock, rank, or prescribe a specialization.**

---

# 6. Why the full 10 + 5 + 5 + 10 semantic load still fails

The graph imposes one additional structural constraint.

The two inner pentagons attach through the spokes to alternating positions on the outer ten-cycle:

```text
Pentad A ↔ Grades I, III, V, VII, IX
Pentad B ↔ Grades II, IV, VI, VIII, X
```

Therefore a fixed two-pentad classification and a fixed ten-spoke pairing cannot be chosen independently.

If the specialization pentads are optimized for their own semantic coherence, they constrain which specializations are available to pair with the odd-grade and even-grade positions.

If the spokes are optimized for grade-specialization resonance, the resulting two pentads are simply the parity partition created by those pairings and no longer correspond cleanly to the strongest independent interpretive / formation grouping.

This exposes a structural overloading problem:

```text
same graph
asked to encode simultaneously:
- grade sequence
- specialization family
- specialization cycle
- grade/specialization correspondence
```

The geometry can host these as **overlays**.

It does not earn the right to make all of them fixed edge identity at once.

Candidate law:

> **Semantic Multiplexing Limit — one geometric decomposition may support multiple views, but independent meanings may not all be promoted into fixed edge semantics merely because the same line can display them.**

Candidate law:

> **Typed Edge Before Meaning — every connection shown as meaningful must declare whether it represents sequence, renewal, resonance, prerequisite, counterbalance, or another bounded relation; geometric adjacency alone is not a semantic type.**

---

# 7. Revised bounded icosahedral model

The decomposition can now be used more carefully.

## Fixed corpus identity

```text
20 faces
= 10 grade regions + 10 specialization regions
```

This remains the strongest fixed mapping.

## Grade ring

```text
9 sequence edges
+
1 renewal seam
```

This is now a viable bounded interpretation.

## Specialization pentagons

Possible uses:

```text
optional analytic grouping
counterbalance study
navigation filter
teaching visualization
```

Forbidden uses:

```text
required tracks
rank families
exclusive compatibility classes
prerequisite chains
identity labels
```

## Spokes

The strongest model is no longer ten immutable pairings.

Instead:

```text
registry-derived many-to-many resonance
→ selected or highlighted dynamically
→ one or several visible bridges in the current view
```

A rendered icosahedron may still draw a geometric spoke, but the semantic spoke should be treated as an overlay selected from actual relationship data rather than permanently baked into face identity.

## Dependencies

Actual curriculum prerequisites remain a separate graph generated from Vitae source data.

They are not limited to icosahedral adjacency.

---

# 8. A possible UI grammar

A bounded participant-facing atlas could support several modes.

### Curriculum mode

```text
show Grades I-X
show actual sequence
show selected curriculum region
hide unearned specialization semantics
```

### Renewal mode

```text
show Adept↔Guardian renewal seam
show foundational practices that remain live
no progress reset
no completion score
```

### Specialization mode

```text
show all ten lateral specialization domains
optionally group by an analytic pentad view
plain-language labels always available
no family rank
```

### Resonance mode

```text
select a grade or specialization
show several source-derived or reviewable resonance candidates
explain why each relation is suggested
allow participant to ignore all suggestions
```

### Path mode

```text
show actual participant-selected path / curriculum references
path overlays geometry
geometry does not generate path
```

---

# 9. Registry consequence

This study strengthens the need for a geometry-independent Vitae registry.

The registry should encode what the corpus actually owns:

```text
10 grades
10 specializations
grade order
school membership
grade functions
specialization mandates / risks / safeguards
entry threshold facts
non-hierarchy and non-exclusivity constraints
```

It should deliberately leave absent:

```text
fixed specialization adjacency
fixed 5+5 family membership
fixed grade↔specialization bijection
icosahedral face coordinates
```

Those belong, if used at all, in separately versioned projection or resonance metadata.

Candidate law:

> **Registry Before Projection — the semantic registry must remain complete and usable without the solid; geometry receives identifiers from the registry and may not create semantic relationships missing from it.**

---

# 10. Current verdict

```text
20-face Vitae corpus atlas
→ PASS, bounded

Grades I-X on 10-cycle
→ PASS as navigation / curriculum order

Adept↔Guardian as 10th progression edge
→ FAIL

Adept↔Guardian as renewal seam
→ BOUNDED PASS

Two fixed specialization schools of five
→ FAIL

Two non-exclusive analytic pentad views
→ VIABLE / requires UI testing

Ten fixed one-to-one grade↔specialization spokes
→ FAIL

Many-to-many grade↔specialization resonance overlay
→ PASS as design-candidate information architecture

Full 30-edge semantic graph
→ still FAIL
```

The important refinement is that the original three fabrications were not equally wrong.

The outer closure contained a real **maintenance relationship**.

The pentads contained a potentially useful **analytic grouping grammar**.

The spokes contained a real **resonance network**, but not a fixed bijection.

The geometry becomes more useful when each relation is typed and allowed to remain dynamic where the corpus is dynamic.
