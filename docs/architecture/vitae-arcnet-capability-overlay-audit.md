---
title: "Vitae → ARCnet Capability Overlay Audit"
status: design-candidate
visibility: public
last_updated: 2026-08-24
description: "Exact geometry and authority audit of the fivefold Vitae icosahedron inside the ARCnet cube, including the 12→6→8 transition, Grade-evidence capability eligibility, and system-permission firewalls."
phase: "Pre-Genesis"
authority: "non-canonical Architecture-v2 design evidence"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/37"
---

# Vitae → ARCnet Capability Overlay Audit

## Purpose

This audit tests a specific Human Architect hypothesis:

> Can the audited fivefold Vitae icosahedron line up with the ARCnet stella-octangula/cube strongly enough to create a useful functional layer connecting recognized Vitae development to ARCnet system permissions?

The test distinguishes three claims that must not be collapsed:

1. **geometric relation** — whether the solids admit an exact shared coordinate construction;
2. **eligibility relation** — whether recognized Vitae evidence may legitimately support review for higher-consequence system capabilities;
3. **authority relation** — whether geometry, Grade progression, curriculum position, or achievement titles can themselves activate a permission.

The first two may pass while the third must remain false.

Repository authority remains:

```text
lived stabilization
    ↓
Vitae recognition / evidence
    ↓
eligibility for bounded responsibility review
    ↓
explicit review / delegation / grant
    ↓
active capability
    ↓
registered ARCnet Edge Contract action where cross-system action is involved
```

This audit does not rewrite canon.

---

# 1. Source constraints

The following sources control the test:

- `docs/doctrine/authority.md`
- `docs/governance/vitae-authority-map.md`
- `docs/architecture/arcnet-edge-contract.md`
- `docs/architecture/registries/arcnet-transported-frame-projection.v0.1.json`
- `docs/architecture/junction-studies/inner-octahedron-synthesis-and-orientation.md`
- `docs/architecture/registries/vitae-curriculum-registry.v0.1.json`
- `docs/architecture/registries/vitae-icosahedral-fivefold-orientation.v0.1.json`
- `docs/architecture/registries/vitae-icosahedral-achievement-axis.v0.1.json`

The stricter rule controls when sources differ.

Two existing boundaries are especially important.

First, `authority.md` says Vitae may gate **responsibility**, but may never gate dignity, belonging, basic participation, or worth.

Second, the Edge Contract requires action-specific capabilities and explicit authorization. A geometric relationship does not authorize an invocation.

Therefore this audit begins with a required distinction:

> **Vitae may contribute evidence to an eligibility decision. It may not turn a Grade face into a cryptographic key, system unlock, office, or authority source.**

---

# 2. Exact common coordinate construction

Let

```text
φ = (1 + √5) / 2
```

and use the current ARCnet cube:

```text
Q = [-1,+1]^3
```

with eight system vertices at sign triples `(sx,sy,sz)`.

The regular icosahedron can be embedded in that same cube with the exact twelve vertices:

```text
(0, ±1/φ, ±1)
(±1/φ, ±1, 0)
(±1, 0, ±1/φ)
```

Its edge length is:

```text
2/φ
```

This is an exact regular icosahedron, not a visual approximation.

## 2.1 Twelve icosahedral vertices occur in six cube-face pairs

Each cube face contains exactly two icosahedral vertices.

For example:

```text
+x cube face
(1,0,-1/φ)
(1,0,+1/φ)
```

Their midpoint is:

```text
(1,0,0)
```

Repeating this across all six cube faces gives:

```text
+x → ( 1, 0, 0) → Commons Witness
-x → (-1, 0, 0) → Standards and Rights
+y → ( 0, 1, 0) → Practice Safety
-y → ( 0,-1, 0) → Creator Public Goods
+z → ( 0, 0, 1) → Cultural Commons
-z → ( 0, 0,-1) → Market Assurance
```

These are **exactly the six already-registered ARCnet inner-octahedron coordinates**.

Therefore:

```text
12 Vitae-icosahedron vertices
        ↓ pair by cube face
6 exact pair midpoints
        ↓
ARCnet inner octahedron
```

This is the strongest exact bridge found in this audit.

Candidate law:

> **Pair-to-Junction Is Geometry; Review Meaning Comes From the Registered Junction.**

The vertex pair does not manufacture the junction's meaning. The meaning already comes from the edge/junction studies.

---

# 3. The inner octahedron reconstructs the eight ARCnet system directions exactly

The octahedron vertices are:

```text
±e_x, ±e_y, ±e_z
```

For each sign triple:

```text
s = (sx,sy,sz)
```

the three octahedron vertices:

```text
sx e_x
sy e_y
sz e_z
```

form one triangular octahedron face.

That triangle's outward normal is parallel to:

```text
(sx,sy,sz)
```

which is exactly one cube vertex.

So the cube is recovered as the exact dual of the inner octahedron.

With current ARCnet labels:

| ARCnet system | Cube coordinate | Exact three-junction octa face |
|---|---:|---|
| Arcanum | `(1,1,1)` | Commons Witness · Practice Safety · Cultural Commons |
| Nexus | `(1,-1,-1)` | Commons Witness · Creator Public Goods · Market Assurance |
| Commercium | `(-1,1,-1)` | Standards & Rights · Practice Safety · Market Assurance |
| Theatrum | `(-1,-1,1)` | Standards & Rights · Creator Public Goods · Cultural Commons |
| Architect | `(-1,-1,-1)` | Standards & Rights · Creator Public Goods · Market Assurance |
| Imperium | `(-1,1,1)` | Standards & Rights · Practice Safety · Cultural Commons |
| Aerarium | `(1,-1,1)` | Commons Witness · Creator Public Goods · Cultural Commons |
| Protection | `(1,1,-1)` | Commons Witness · Practice Safety · Market Assurance |

This result is stronger than a numerical coincidence.

The current junction study already says each inner vertex is a coordination composition of one generative edge and one stewardship edge. The dual-face construction above makes each cube system incident to exactly the three inner junctions involving that system's three same-tetrahedron edges.

For example, Commercium's exact inner face is:

```text
Standards & Rights
Practice Safety
Market Assurance
```

Those three names also make semantic sense for high-consequence commerce:

- rights / interoperability / standards;
- physical practice and product-claim safety;
- provenance / assurance / verification.

The geometry did not invent those functions. It exposed that the existing junction semantics already form the exact dual face of Commercium.

Candidate law:

> **Three Junctions May Organize a System Review; They Do Not Own the System.**

---

# 4. The stella-octangula partition is algebraically exact

The eight cube coordinates divide into the two existing tetrahedra by sign parity.

For:

```text
q = (sx,sy,sz)
```

we obtain:

```text
sx·sy·sz = +1 → generative tetrahedron
sx·sy·sz = -1 → stewardship tetrahedron
```

So:

```text
Generative
Arcanum     (+,+,+)
Nexus       (+,-,-)
Commercium  (-,+,-)
Theatrum    (-,-,+)

Stewardship
Architect   (-,-,-)
Imperium    (-,+,+)
Aerarium    (+,-,+)
Protection  (+,+,-)
```

and the mirror operation is simply:

```text
q → -q
```

which reproduces:

```text
Arcanum    ↔ Architect
Nexus      ↔ Imperium
Commercium ↔ Aerarium
Theatrum   ↔ Protection
```

Therefore the proposed transition has an exact endpoint chain:

```text
icosahedron
    ↓ exact cube-face pairing
inner octahedron
    ↓ exact duality
cube
    ↓ parity partition
stella octangula
```

The visual interpolation between those endpoints is renderer-defined, but the endpoints and incidence relationships are exact.

---

# 5. Eight icosahedral faces look exactly toward the eight ARCnet systems

A second exact relation exists.

Eight of the twenty icosahedron face centroids are:

```text
(φ/3) · (sx,sy,sz)
```

for every cube sign triple `(sx,sy,sz)`.

Therefore eight icosahedron face normals point exactly toward the eight ARCnet cube vertices.

This looks initially like a direct permission mapping.

It fails under the audited fivefold Vitae orientation.

---

# 6. Exhaustive fivefold-axis test

The Vitae achievement model uses one fivefold axis:

```text
5 upper Wizard faces
10 Core Grade belt faces
5 lower Magus faces
```

A regular icosahedron has six opposite vertex axes, or twelve directed choices once north/south orientation is distinguished.

This audit exhaustively checked all twelve directed fivefold choices against the cube-embedded icosahedron.

For **every** choice, the eight system-facing icosahedral faces distribute as:

```text
Wizard cap  → 2 system-facing faces
Core belt   → 4 system-facing faces
Magus cap   → 2 system-facing faces
```

There is no fivefold rotation in which all eight system-facing faces lie on the ten-Grade belt.

There is also an invariant generative/stewardship balance:

```text
Wizard cap
1 generative + 1 stewardship system-facing face

Core belt
2 generative + 2 stewardship system-facing faces

Magus cap
1 generative + 1 stewardship system-facing face
```

This is elegant geometry, but it falsifies the tempting rule:

```text
Grade face → ARCnet system → permission
```

Result:

> **Ten Grades → eight systems as a direct geometric permission map — FAIL.**

The failure is useful because it tells us where the real functional layer must live.

---

# 7. The real bridge is evidence → eligibility, not Grade → system

The curriculum registry gives each Grade a distinct responsibility domain:

```text
I Guardian
self-governance and reliability

II Seeker
meaning discipline and inquiry stability

III Disciple
ethical action without authority

IV Mystic
perception without interpretation

V Scholar
structured knowledge and cognitive architecture

VI Healer
care, maintenance, and restoration

VII Alchemist
transformation and synthesis

VIII Sage
integration and reflective wisdom

IX Oracle
pattern perception and foresight without prophecy

X Adept
creative stabilization and governance readiness
```

These are more useful as **evidence predicates** than as ten permission levels.

A capability should therefore not ask:

```text
Is Grade >= 7?
```

It should ask something closer to:

```text
Does this action require evidence of:
- stable self-governance?
- ethical restraint?
- systems literacy?
- repair responsibility?
- bounded transformation?
- second-order consequence awareness?
- stewardship readiness?
```

Then it may reference the relevant recognized Vitae evidence.

This preserves the meaning of the Grades instead of turning the Grade number into a generalized social score.

Candidate law:

> **Grade Is Evidence, Not a Key.**

---

# 8. Permission must remain action-specific

An ARCnet system vertex is too coarse to be "unlocked."

A person may legitimately use a system while lacking permission for one of its high-consequence actions.

For example, a participant might:

```text
use Commercium
create a private craft draft
publish an ordinary listing
```

without being allowed to:

```text
act as an independent market verifier
apply policy to other participants
hold shared custody
approve Treasury movement
alter protocol rules
```

Therefore the permission object must attach to a **verb/action**, not to the whole vertex.

Candidate law:

> **Vitae May Gate Verbs, Not Worlds.**

And:

> **Capability Requirements Are Action-Specific, Not Vertex-Wide.**

Basic dignity, belonging, ordinary participation, and ordinary local/private use remain outside Vitae gating.

---

# 9. Candidate capability pipeline

A machine-readable capability could eventually declare:

```text
CapabilityRequirement {
  system
  action
  consequence_class

  vitae_evidence_required[]
  domain_evidence_required[]
  safety_requirements[]

  review_body_or_role
  explicit_grant_required
  expiry
  suspension_behavior
}
```

The resulting logic is:

```text
eligible(action)
=
recognized Vitae requirements satisfied
AND domain requirements satisfied
AND non-authority safety prerequisites satisfied
```

but:

```text
active(action)
=
eligible(action)
AND explicit grant/delegation
AND registered action
AND destination acceptance
AND not expired/suspended
```

This is the critical distinction.

A Grade recognition can make an advanced responsibility **reviewable**.

It cannot make the responsibility active by itself.

Candidate law:

> **Eligibility May Expand; Authority Must Still Be Granted.**

---

# 10. Relation to the current V0–V8 authority map

The existing canonical-draft Vitae Authority Map contains nine implementation-facing envelopes:

```text
V0 Participant
V1 Witness
V2 Steward Candidate
V3 Module Steward
V4 Governance Steward
V5 Treasury Steward
V6 Protocol Steward
V7 Architect Delegate
V8 Architect Succession Council
```

Those nine envelopes do not form a one-to-one mapping with the ten Grades.

They also have domain conditions that Grade progression cannot satisfy alone:

- module-specific reliability;
- governance participation;
- Treasury conflict disclosure and appointment;
- deep technical reliability;
- long-duration cross-layer integration;
- governance activation for succession.

Therefore this audit does **not** define:

```text
Grade I = V0
Grade II = V1
...
```

That would be both mathematically artificial and doctrinally wrong.

A safer interpretation is:

```text
recognized Vitae evidence
        ↓
may satisfy some prerequisites
        ↓
for one or more envelope reviews
        ↓
with separate domain evidence and legitimate appointment
```

---

# 11. Why the inner octahedron is the useful permission interface

The exact `12 → 6 → 8` structure suggests a new presentation and information architecture.

## Vitae layer

The icosahedron holds rich developmental/curriculum evidence.

It should remain high-dimensional, participant-centered, and not reduced to a social rank.

## Projection layer

When the user enters ARCnet capability view, the system derives only the evidence needed for the selected action.

A bounded object might look like:

```text
VitaeEvidenceProjection
- selected recognition / achievement receipts
- target system + action
- purpose
- audience
- retention
- provenance
- disclosure / revocation behavior
```

The whole Vitae history does not cross.

## Coordination layer

The visual icosahedral vertex pairs converge to the six exact octahedral junctions.

Those junctions may organize the review contexts around the selected action.

They do not decide the result.

## System layer

The eight octahedral faces are dual to the eight cube systems.

The relevant system vertex appears with only those action capabilities that have actually been granted.

Candidate law:

> **The Inner Octahedron Mediates; It Does Not Grant.**

---

# 12. Commercium stress test

The Human Architect has specifically suggested that Wizard and Magus achievement should carry meaningful weight in Commercium because deeper learning should matter to craft.

The current Arcanum ↔ Commercium study already allows a bounded Vitae projection for factual craft-learning provenance, while rejecting full Vitae-history export or generalized trust scoring.

The exact cube/octahedron overlay strengthens this because Commercium's dual inner face is:

```text
Standards & Rights
Practice Safety
Market Assurance
```

That is a strong review triangle for consequential commercial functions.

## What passes

A maker may voluntarily attach a bounded Vitae achievement or specialization receipt as provenance/context, for example:

```text
completed Artificer foundational cycle
completed Alchemist foundational cycle
Architect Core achievement
Magus achievement
```

when those facts are actually recognized and the participant chooses to disclose them.

A buyer or reviewer may understand them as:

```text
education / practice provenance
```

not as proof of human worth or guaranteed product quality.

A higher-consequence role such as independent verifier, safety reviewer, standards contributor, or delegated market steward may legitimately include relevant Vitae evidence among its eligibility prerequisites.

## What fails

The system may not automatically turn:

```text
Wizard
Magus
Architect
Grade X
```

into:

```text
higher search rank
higher default price
universal trust badge
market authority
automatic verifier status
dispute superiority
permission to regulate others
```

Those would convert developmental history into generalized market rank.

Candidate law:

> **Titles May Inform Provenance; They May Not Become Market Rank.**

---

# 13. Fivefold Wizard/Magus axis relative to the labeled ARCnet cube

The current Vitae UI has a fixed local semantic orientation:

```text
Wizard = up
Core = equator
Magus = down
```

The cube also has a fixed labeled orientation because its eight coordinates carry system identity.

There are six mathematically valid opposite icosahedral vertex axes inside the cube.

No current repository source uniquely proves which of those six axes should become the permanent Wizard↔Magus axis relative to the labeled cube.

Every choice preserves the same `2 + 4 + 2` system-facing distribution.

Therefore the overlay should currently use two frames:

```text
Vitae local frame
fixed Wizard / Core / Magus meaning

ARCnet local frame
fixed system coordinates
```

and an explicit transition rotation:

```text
R_vitae_to_arcnet
```

The rotation can be deterministic for a renderer, but it carries no authority or cross-system semantics until a later audit independently justifies one orientation.

Candidate law:

> **Fivefold Axis Is a Vitae Coordinate Until ARCnet Semantics Independently Select It.**

---

# 14. Exact transition sequence for the future unified portal

A mathematically disciplined morph can now be defined.

## Stage A — Vitae

Render the fivefold icosahedron in its local frame:

```text
Wizard cap
10-Grade Core belt
Magus cap
```

## Stage B — frame registration

Rotate the complete solid into the standard cube-embedded icosahedral frame.

No curriculum state changes.

## Stage C — evidence projection / geometric collapse

For each cube face, animate its two icosahedron vertices toward their exact midpoint:

```text
p_a(t) = (1-t)v_a + t m
p_b(t) = (1-t)v_b + t m
```

At `t=1`, the twelve points have become the six octahedron junction coordinates.

This is presentation of **bounded projection**, not destruction of Vitae and not reduction of the person.

Candidate law:

> **The Person Does Not Collapse; the Interface Projects.**

## Stage D — ARCnet coordination kernel

Reveal the six junctions and any capability-specific review context.

## Stage E — cube dual expansion

Use the eight octahedral faces to reveal the eight dual cube/system vertices.

Split the cube vertices by sign parity into the two tetrahedra.

## Stage F — active capability view

Only actual granted actions illuminate.

No face position, morph completion, or animation state can activate a capability.

Candidate law:

> **A Morph May Explain a Permission Boundary; It May Not Execute One.**

---

# 15. Falsification summary

| Hypothesis | Result |
|---|---|
| Regular Vitae icosahedron fits exactly in ARCnet cube | **PASS** |
| 12 icosahedron vertices pair exactly to the six current inner junctions | **PASS** |
| Six inner junctions reconstruct the eight system directions by exact octahedron↔cube duality | **PASS** |
| Existing generative/stewardship tetrahedra arise from cube sign parity | **PASS** |
| Eight icosahedron faces point exactly at the eight system vertices | **PASS as geometry only** |
| Ten Grade belt faces can map one-to-one to all eight systems | **FAIL** |
| Rotating the fivefold axis can rescue that direct mapping | **FAIL — exhaustive 12-direction test** |
| Current Vitae section/face/position can change permissions | **FAIL** |
| Achievement title alone can activate system permissions | **FAIL** |
| Recognized Vitae evidence can support action-specific capability eligibility | **BOUNDED PASS** |
| Inner junctions can organize system-specific review contexts | **BOUNDED PASS** |
| Wizard/Magus achievements can appear in Commercium provenance | **BOUNDED PASS** |
| Wizard/Magus should automatically create market rank or trust | **FAIL** |
| One fixed Wizard/Magus axis is already semantically selected relative to the labeled cube | **HOLD** |

---

# 16. Architecture conclusion

The direct hypothesis was too simple:

```text
Grade progression
→ system unlock
```

The stronger architecture is:

```text
VITAE
recognized lived-development evidence
        ↓
bounded evidence projection
        ↓
ICOSAHEDRON → paired bridge handles
        ↓ exact midpoint projection
INNER OCTAHEDRON → six coordination/review junctions
        ↓ exact dual incidence
ARCNET CUBE → eight system domains
        ↓
action-specific eligibility
        ↓
explicit review / delegation / grant
        ↓
active capability / Edge Contract action
```

This creates a genuine new layer of function without violating the earlier rule that geometry cannot create authority.

The geometry now helps answer:

> **Why is this capability eligible for review, which responsibilities support it, which coordination boundaries apply, and what still must be explicitly granted?**

That is a much stronger use of the solids than making them decorative unlock screens.

---

# 17. Candidate laws

1. **Grade Is Evidence, Not a Key.**
2. **Vitae May Gate Verbs, Not Worlds.**
3. **Eligibility May Expand; Authority Must Still Be Granted.**
4. **Capability Requirements Are Action-Specific, Not Vertex-Wide.**
5. **Capability Is a Projection of Evidence, Not a Summary of the Person.**
6. **Current Vitae Position Is Not Recognized Vitae Evidence.**
7. **Pair-to-Junction Is Geometry; Review Meaning Comes From the Registered Junction.**
8. **Three Junctions May Organize a System Review; They Do Not Own the System.**
9. **The Inner Octahedron Mediates; It Does Not Grant.**
10. **The Person Does Not Collapse; the Interface Projects.**
11. **Fivefold Axis Is a Vitae Coordinate Until ARCnet Semantics Independently Select It.**
12. **Titles May Inform Provenance; They May Not Become Market Rank.**
13. **A Morph May Explain a Permission Boundary; It May Not Execute One.**

---

# 18. Disposition and next gate

The overlay receives:

```text
exact geometric bridge                 PASS
direct Grade → system permission       FAIL
Vitae evidence → eligibility           BOUNDED PASS
six-junction capability review layer   BOUNDED PASS
fixed labeled Wizard/Magus cube axis   HOLD
runtime authority from geometry        PROHIBITED
```

The next useful gate is not another solid.

It is a **machine-readable capability requirement registry** for a small representative set of real ARCnet actions.

The first test set should include:

- Commercium — ordinary maker action vs assurance/reviewer action;
- Protection — claim-specific verification action;
- Imperium — proposal/review vs binding governance action;
- Architect — documentation/patch proposal vs bounded developer/release action.

For each action, define:

```text
which recognized Vitae evidence is relevant
which domain evidence is independently required
which of the three system-adjacent junction contexts apply
who can issue the explicit grant
time/expiry/suspension behavior
what the Edge Contract requires
```

If that registry works without turning Grade into rank or geometry into permission, the new Vitae→ARCnet functional layer is ready for a unified morph prototype.
