---
title: "Tempus / Vitae Registry Validation v0.1"
status: design-candidate
visibility: public
last_updated: 2026-08-23
description: "Source-alignment validation for the geometry-independent Tempus zodiac registry, Vitae curriculum registry, and Vitae resonance overlay."
phase: "Pre-Genesis"
authority: "non-canonical design evidence"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/37"
---

# Tempus / Vitae Registry Validation v0.1

## Purpose

This validation checks that the first geometry-independent registries preserve repository-owned semantics without importing geometric coordinates, inferred authority, or unsupported relationship structure.

Validated artifacts:

- `tempus-zodiac-registry.v0.1.json`
- `vitae-curriculum-registry.v0.1.json`
- `vitae-resonance-overlay.v0.1.json`

The validation does **not** promote these files into canon.

---

# 1. Tempus zodiac registry

## Count and identity

Expected source-owned optional zodiac set:

```text
12 regions
```

Registry contains:

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
```

Result: **PASS**.

## Chronology

The registry encodes one twelve-step closed chronological cycle:

```text
Aries → Taurus → Gemini → Cancer → Leo → Virgo
→ Libra → Scorpio → Sagittarius → Capricorn → Aquarius → Pisces → Aries
```

Every region has exactly one previous and one next region in this selected cycle.

Result: **PASS**.

## Opposition

The registry encodes six opposition pairs:

```text
Aries ↔ Libra
Taurus ↔ Scorpio
Gemini ↔ Sagittarius
Cancer ↔ Capricorn
Leo ↔ Aquarius
Virgo ↔ Pisces
```

Each region has exactly one opposite.

Result: **PASS**.

## Geometry independence

The registry does not contain:

```text
dodecahedron face coordinates
secondary face adjacency
sextile / square / trine subsets
pentagonal corner semantics
20-vertex count rescue
```

Result: **PASS**.

## Doctrine boundary

The registry explicitly records:

```text
optional symbolic layer
describes time, not person
no astrological causation
no behavior determination
no readiness / authority grant
no geometry requirement
```

Result: **PASS**.

### Tempus validation verdict

> **The v0.1 Tempus registry is suitable as a geometry-independent source for plain navigation and later optional projection testing.**

It is not a complete Tempus registry; it is specifically the optional zodiac-region registry.

---

# 2. Vitae curriculum registry

## Grade count

Expected Core Vitae grades:

```text
10
```

Registry contains:

```text
I Guardian
II Seeker
III Disciple
IV Mystic
V Scholar
VI Healer
VII Alchemist
VIII Sage
IX Oracle
X Adept
```

Result: **PASS**.

## School partition

Repository school structure:

```text
Elementary: I-IV = 4
Intermediate: V-VIII = 4
High: IX-X = 2
```

Registry matches:

```text
4 + 4 + 2 = 10
```

Result: **PASS**.

## Grade sequence

The registry contains exactly nine sequence edges:

```text
I→II
II→III
III→IV
IV→V
V→VI
VI→VII
VII→VIII
VIII→IX
IX→X
```

It deliberately does **not** encode:

```text
X→I
```

because the Adept↔Guardian relationship survived only as a design-candidate **renewal seam**, not canonical grade sequence.

Result: **PASS**.

## Grade functions

The registry summaries match the school canons:

```text
Guardian  — self-governance and reliability
Seeker    — meaning discipline and inquiry stability
Disciple  — ethical action without authority
Mystic    — perception without interpretation
Scholar   — structured knowledge and cognitive architecture
Healer    — care, maintenance, and restoration
Alchemist — transformation and synthesis
Sage      — integration and reflective wisdom
Oracle    — pattern perception and foresight without prophecy
Adept     — creative stabilization and governance readiness
```

Result: **PASS**.

## Specialization count

Expected specialization set:

```text
10
```

Registry contains:

```text
Arcanist
Philosopher
Illusionist
Astrologer
Hierophant
Druid
Necromancer
Alchemist
Artificer
Enchanter
```

Result: **PASS**.

## Specialization posture

Each specialization is encoded as:

```text
lateral
post-Adept eligible
voluntary / reversible
no required order
no fixed neighbors
```

This matches the specialization-wide non-hierarchy and non-prerequisite posture.

Result: **PASS**.

## Deliberately empty relationships

The registry contains:

```text
specialization_fixed_adjacency = []
grade_specialization_fixed_pairings = []
```

This is not missing work.

It is an explicit representation of what the current source architecture does **not** canonically define.

Result: **PASS**.

## Support layers remain separate

The registry does not misclassify the following as peer faces:

```text
Authority
Constitution
foundations / thresholds
anatomy
experience
lexicon
cross-grade dependency rules
review packets
practice sessions
permission envelopes
```

Result: **PASS**.

## Recognition boundary

The registry contains no:

```text
worth score
readiness score
automatic authority
paid advancement
completion percentage
```

Result: **PASS**.

### Vitae curriculum validation verdict

> **The v0.1 Vitae curriculum registry is suitable as a geometry-independent high-level atlas source.**

It is not yet a generated index of every class, chapter, practice, dependency, or review artifact.

---

# 3. Vitae resonance overlay

The resonance overlay exists because semantic resonance is real but not identical to curriculum structure.

## Relationship count

The first pass contains:

```text
17 candidate grade ↔ specialization resonances
```

including six especially strong correspondences:

```text
Seeker     ↔ Philosopher
Mystic     ↔ Illusionist
Scholar    ↔ Arcanist
Alchemist  ↔ Alchemist
Oracle     ↔ Astrologer
Adept      ↔ Artificer
```

and explicitly non-unique candidates for Guardian, Disciple, Healer, and Sage.

Result: **PASS as design-candidate overlay**.

## Non-bijection

The overlay declares:

```text
many_to_many = true
exclusive_pairing = false
```

It therefore cannot be used as a one-to-one icosahedral spoke registry.

Result: **PASS**.

## Suggestion boundary

The overlay requires an explicitly selected grade or specialization context before a resonance suggestion may be surfaced.

It prohibits inference from:

```text
participant behavior
Hope state
Tempus state
wealth
Identity
local practice metrics
```

Result: **PASS**.

## Authority boundary

The overlay cannot:

```text
unlock a specialization
advance Vitae
produce recognition
create authority
rank compatibility
trigger MANA effects
```

Result: **PASS**.

### Resonance validation verdict

> **The overlay is structurally separated correctly from both curriculum truth and geometric projection.**

This is the strongest current implementation grammar for the formerly fixed-spoke intuition.

---

# 4. Source conflict discovered during validation

The older Vitae corpus contains an unresolved specialization/mastery inconsistency.

## Source A — cross-specialization mastery archetypes

`docs/vitae/curriculum/specializations/cross-specialization-mastery-paths-canon.md` names fixed combinations such as:

```text
Wizard
= Arcanist + Philosopher + Illusionist

Magus
= Alchemist + Artificer + Enchanter

Architect
= Druid + Necromancer + Hierophant
```

## Source B — mastery governance

`docs/vitae/curriculum/specializations/mastery-path-governance-canon.md` states instead:

```text
cross-specialization combinations are situational and contextual
no predefined hybrid classes, titles, or tracks shall be created
Wizard / Magus style master titles are not formally recognized
```

It also frames advanced stewardship through broad engagement rather than those fixed triples.

## Source C — specialization-wide invariants

`specialization-wide-invariants-canon.md` further requires:

```text
no specialization prerequisite hierarchy
lateral cooperative roles
no role-based identity inflation
system resilience if any specialization is unused
```

## Validation disposition

The v0.1 curriculum registry therefore encodes **neither** the old fixed mastery triples **nor** any new fixed pentads.

This is deliberate.

Candidate rule:

> **Conflicted Source Structure Does Not Enter the Base Registry — when repository sources disagree about grouping or track semantics, the base registry preserves only the shared stable identities and constraints until Human Architect reconciliation.**

This conflict should be resolved before any specialization grouping is promoted beyond optional design-study metadata.

---

# 5. Registry / projection architecture after validation

The current stack is:

```text
SOURCE DOCUMENTS
      ↓
SEMANTIC REGISTRY
      ↓
OPTIONAL RELATION OVERLAY
      ↓
PROJECTION / RENDERER
```

For Tempus:

```text
Tempus docs
→ tempus.zodiac.v0.1
→ future optional symbolic overlays
→ cards/list OR dodecahedral shell
```

For Vitae:

```text
Vitae docs
→ vitae.curriculum.v0.1
→ vitae.resonance.v0.1 + future dependency registry
→ cards/tree OR icosahedral atlas
```

Candidate law:

> **Projection Is a Consumer, Not an Author — the renderer may select, arrange, animate, or focus registered information; it may not create curriculum truth, symbolic authority, or relationship semantics absent from upstream data.**

---

# 6. Validation result

```text
Tempus zodiac registry v0.1
→ PASS as bounded geometry-independent registry

Vitae curriculum registry v0.1
→ PASS as bounded geometry-independent high-level registry

Vitae resonance overlay v0.1
→ PASS as non-authoritative many-to-many design overlay

fixed specialization grouping canon
→ unresolved due source conflict

full generated dependency registry
→ not yet built

runtime implementation
→ not started
```

No validation finding changes current canon.
