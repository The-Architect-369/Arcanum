---
title: "ARCnet Edge Study 02 — Arcanum ↔ Commercium"
status: design-candidate
visibility: public
last_updated: 2026-08-22
description: "Second detailed ARCnet edge study: the boundary between Arcanum temporal/correspondence context and Commercium physical craft, provenance, and exchange."
phase: "Pre-Genesis"
authority: "non-canonical design evidence"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/37"
edge_id: "arcanum.commercium"
edge_class: "kinship-candidate"
---

# ARCnet Edge Study 02 — Arcanum ↔ Commercium

## Purpose

This study tests the candidate relationship between **Arcanum** and **Commercium** within the generative/lived tetrahedron.

It asks whether Arcanum's temporal, ritual, and symbolic context can legitimately inform physical making and exchange without allowing software, money, or symbolic language to fabricate metaphysical truth, personal progression, or provenance.

This document is design evidence only.

## Repository grounding

Current canon provides several useful constraints:

- `docs/modules/tempus/tempus.md` defines Tempus as Arcanum's temporal structuring layer, grounded first in observable astronomical phenomena.
- Tempus may expose optional symbolic overlays only when they remain clearly interpretive, non-deterministic, and practitioner-owned.
- The ARCnet Economic Constitution permits exchange and commerce through MANA while forbidding payment from purchasing elapsed time, accelerated Tempus progression, fabricated participation history, human worth, or constitutional exemption.
- Economic consequences must be visible before authorization and reconstructable through appropriate receipts.
- The current project-status record explicitly says a **Commercium application is not yet implemented**.

Therefore the Commercium-facing structures below are new design candidates. They do not describe an existing canonical Commercium module hierarchy.

## Semantic correspondence

Arcanum asks:

> What rhythms, practices, correspondences, and meanings am I deliberately working with?

Commercium asks:

> What physical object, material, service, or crafted work can embody or support that intention, and what may legitimately be exchanged?

The candidate edge is therefore the threshold between:

- symbolic or temporal context and material craft;
- personal practice and physical utility;
- correspondence and fabrication;
- intention and provenance;
- making and exchange.

A concise candidate description is:

> **Arcanum gives context to making; Commercium gives material form and exchange to making.**

## Candidate endpoint faculties

### Arcanum-facing port: Tempus

Tempus is the leading Arcanum-facing faculty for this edge because it can provide:

- observable astronomical timing;
- seasonal and cyclical context;
- user-selected symbolic correspondence;
- ritual timing context;
- descriptive pattern language.

Tempus does **not** certify that an object has supernatural efficacy.

Tempus provides timing and correspondence context; interpretation remains participant-owned.

### Commercium-facing port: Craft / Provenance / Listing

Commercium does not yet have a canonical internal module structure.

For this study, its facing faculty is provisionally described as:

```text
Craft
  + Material Specification
  + Provenance Record
  + Listing / Exchange
```

These names are placeholders for the capabilities the destination must eventually provide, not a ratified Commercium taxonomy.

## Core passage

A person's complete Tempus history should not be exposed to Commercium.

Instead, Arcanum derives a bounded **Craft Context** containing only the timing and correspondence information the person deliberately chooses to apply.

Candidate flow:

```text
Tempus context
  private Arcanum source
        |
        | participant selects a bounded context
        v
ArcanumCommerciumCraftContext
  derivative passage artifact
        |
        v
Commercium Craft Draft
  destination-owned working object
        |
        | maker performs physical work
        v
Craft / Provenance Record
        |
        | separate market decision
        v
Commercium Listing
```

This preserves the Derived Artifact Law from Edge Study 01.

The source Tempus context remains in Arcanum.

## Craft Context — candidate artifact

A Craft Context could include only explicitly selected fields such as:

```text
observable context
- date / time window
- solar or lunar state
- season / astronomical event

symbolic context
- chosen correspondence set
- cultural / archetypal labels
- maker-defined intention

craft parameters
- materials
- planned steps
- timing constraints
- optional ritual protocol
```

The record must distinguish **observable fact** from **symbolic interpretation** and **maker-authored claim**.

For example:

```text
FACT
2026-10-31 22:14 local time
Moon phase: measured astronomical state

SYMBOLIC OVERLAY
Maker selected correspondence: reflection / transition

MAKER STATEMENT
"Prepared as part of my chosen ritual practice."
```

ARCnet may preserve all three while refusing to pretend they have the same epistemic status.

## Semantic Attestation Boundary

This edge reveals a new general problem: a distributed system can prove some facts about a craft process while being unable to prove the metaphysical interpretation attached to it.

ARCnet may be able to attest facts such as:

- a timestamp was recorded;
- a particular identity signed a record;
- a material declaration was submitted;
- a device observed a sensor value;
- a peer witnessed an event;
- a payment finalized;
- a provenance record existed before a later transfer.

ARCnet should not transform those facts into claims such as:

- "this object is objectively enchanted";
- "this celestial configuration caused the object's effect";
- "this object guarantees spiritual advancement";
- "this maker's symbolic interpretation is universal truth."

Candidate law:

> **ARCnet may attest occurrence and provenance. It must not convert interpretation into protocol fact.**

This extends the existing App · Chain · Doctrine posture that settlement should record narrow factual truth rather than semantic judgment.

## Evidence grades for physical-world claims

Commercium introduces a challenge that did not appear as strongly in Arcanum ↔ Nexus: **physical reality cannot always be inferred from a digital record**.

A future Edge Contract may therefore need an explicit evidence grade.

Candidate classes:

```text
self-declared
  maker states that an action/material was used

peer-witnessed
  another authorized participant witnessed it

device-observed
  a trusted device or sensor produced bounded evidence

independently-verified
  an external verifier attested a defined property
```

These grades should describe evidence, not rank the maker.

A self-declared ritual preparation can still be meaningful, but it must not masquerade as independent verification.

This suggests a candidate general law:

> **Evidence strength must be represented explicitly; ARCnet must not silently upgrade a claim.**

## Materialization is separate from marketplace release

The first edge taught us that passage and publication are separate.

This edge adds another distinction:

```text
context
   !=
physical fabrication
   !=
market listing
   !=
purchase / settlement
```

A person may create a Craft Context and never fabricate anything.

A maker may fabricate an object and keep it private.

A completed object does not automatically become a listing.

A listing does not imply a completed sale.

Candidate rule:

> **Making something does not authorize selling it, and describing something does not prove it was made.**

## Candidate maker flow

A Tempus card might expose an action such as:

```text
Create with this correspondence
```

The participant chooses what may leave Arcanum:

```text
Include in Craft Context:
[x] selected astronomical window
[x] selected correspondence labels
[x] maker intention
[ ] personal Tempus history
[ ] Hope reflection
[ ] Vitae record
```

Commercium then receives a private Craft Draft.

Possible destination card:

```text
COMMERCIUM — CRAFT DRAFT

Origin: Arcanum · Tempus

Window
Autumn equinox + selected correspondence

Materials
[ define materials ]

Process
[ define steps ]

Status
Private · not listed
```

The maker may later record fabrication evidence and independently choose whether to create a listing.

## Physical fulfillment versus network delivery

Edge Study 01 separated **delivery scope** from **audience scope**.

Commercium reveals a third dimension: **physical fulfillment**.

For example:

```text
network delivery
- listing reached buyer's device

audience
- listing visible to selected market / public

physical fulfillment
- pickup pending
- shipment pending
- handed over
- delivery acknowledged
- disputed
```

Digital delivery of a listing is not physical delivery of an object.

A future Edge Contract may therefore need a bounded fulfillment state when an action crosses into the physical world.

This should not be generalized to every edge unless later studies confirm it.

## Provenance model

A physical crafted object could eventually possess a provenance chain such as:

```text
Craft Context
      |
Maker Record
      |
Fabrication Record
      |
Listing
      |
Purchase
      |
Transfer Receipt
```

The provenance chain should preserve factual history without requiring disclosure of the maker's entire Arcanum state.

A buyer might receive:

```text
maker: minimal public identity / pseudonymous identity
created: date or bounded window
materials: disclosed set
process claim: maker-authored
witness/evidence grade: explicit
artifact digest / object identifier
transfer history: where applicable
```

They should not automatically receive:

- private Tempus history;
- Hope reflections;
- Vitae history;
- complete location history;
- unrelated wallet activity;
- hidden behavioral analytics.

## Economics boundary

Arcanum → Commercium passage should ordinarily have **no MANA cost** merely because the person created a Craft Context on their own device.

Economic consequences belong to Commercium-native actions such as:

- purchasing a physical object;
- paying a maker for a service;
- paying for optional scarce infrastructure;
- escrow or dispute mechanisms if later authorized;
- shipping or fulfillment services if integrated.

The Economic Constitution remains controlling:

- MANA may coordinate exchange and commerce;
- pricing must be visible before authorization;
- participant custody is sovereign by default;
- payment may not purchase or fabricate Tempus progression;
- payment may not fabricate historical timing evidence.

### Temporal integrity

A buyer cannot pay to make an item retroactively become "crafted during" a prior astronomical window.

If the time was not evidenced then, ARCnet should not manufacture that history now.

Candidate rule:

> **Economic value may price an object; it may not rewrite the object's temporal provenance.**

## Ritual and "enchanted" object language

Participants and makers may use spiritual, ritual, esoteric, devotional, artistic, or cultural language to describe their own practice, subject to broader content rules.

The architecture should distinguish:

```text
maker meaning
from
protocol fact
```

A maker may describe an object as "ritually prepared" or use a tradition-specific term such as "enchanted" as their own claimed practice or symbolic framing.

ARCnet's factual layer should say only what it can evidence, for example:

> The maker signed a record stating that this object was prepared according to the listed process during the recorded window.

This allows spiritually meaningful practice without turning ARCnet into a metaphysical certification authority.

## Reverse direction — Commercium → Arcanum

A purchased, gifted, discovered, or self-created physical object may become relevant to a participant's private Arcanum practice.

Commercium should not automatically inject purchase history into Tempus.

A participant may deliberately choose:

```text
Add to Arcanum practice
```

Candidate flow:

```text
Commercium Object Record
       |
       | explicit participant choice
       v
ArcanumObjectReference
       |
       v
Tempus private practice context
```

The imported object becomes a private reference or practice resource.

It does not automatically:

- create a ritual obligation;
- change Tempus timing;
- modify Hope's model of the person;
- create Vitae recognition;
- increase human worth;
- imply spiritual efficacy.

## Candidate action registry

### Arcanum → Commercium

- `create-craft-context`
- `create-craft-draft`
- `attach-selected-tempus-context`
- `create-maker-process-record`
- `reference-arcanum-derived-provenance`

### Commercium → Arcanum

- `create-private-object-reference`
- `add-object-to-tempus-practice`
- `import-maker-correspondence-as-candidate`
- `create-reflection-seed-from-object`

These action names are illustrative.

## Relationship to other edges

This edge should not silently perform functions belonging to other relationships.

Examples:

- turning the physical object into a digital twin belongs primarily to **Commercium ↔ Theatrum**;
- sharing the object socially belongs primarily to **Commercium ↔ Nexus**;
- publishing an Arcanum reflection about the object belongs to **Arcanum ↔ Nexus**;
- security/provenance verification may compose with **Commercium ↔ Protection**.

This exposes another candidate principle:

> **An edge may produce an artifact suitable for another edge, but authorization does not transit automatically across the graph.**

Every later crossing requires its own invocation and consent.

## Candidate card transformation

```text
ARCANUM / TEMPUS                 COMMERCIUM

Correspondence Card
       |
       | "Create with this"
       v
Craft Context
       |
       | bounded passage
       v
                                Craft Draft
                                     |
                                     | fabricate / record
                                     v
                                Object Record
                                     |
                                     | optional separate action
                                     v
                                Listing
```

Reverse:

```text
Commercium Object
       |
       | "Add to Arcanum practice"
       v
Tempus Object Reference
```

The card metaphor remains human-facing while the edge contract enforces the sovereignty and provenance boundary underneath.

## Patterns extracted from edge study 02

This study supports several laws discovered in Edge Study 01 and adds new candidates.

### Reconfirmed

1. **Derived Artifact Law** — selected Tempus context crosses; source history does not.
2. **Two-Phase Passage** — entering Commercium does not itself perform the destination action.
3. **Authority Conservation** — symbolic context does not become protocol truth by crossing.
4. **Provenance Without Surveillance** — object provenance should not export a personal dossier.
5. **Destination Economics** — commerce costs belong to commerce actions, not local passage.
6. **Transport Independence** — the semantic contract must survive transport replacement.

### Newly exposed

7. **Semantic Attestation Boundary** — occurrence/provenance may be attested; metaphysical meaning remains interpretive.
8. **Evidence Grade Law** — self-declared, witnessed, device-observed, and independently verified claims must not be silently conflated.
9. **Materialization Separation** — context, fabrication, listing, purchase, and fulfillment are distinct states.
10. **Temporal Integrity** — economic payment or later editing cannot rewrite historical timing evidence.
11. **Physical Fulfillment Separation** — network delivery and audience scope do not prove physical possession or delivery.
12. **Non-Transitive Edge Authority** — an artifact prepared for a later edge does not carry consent into that later crossing.

## Open questions

- Is **Tempus** permanently the primary Arcanum-facing port for Commercium, or should Arcanum expose a broader `Practice / Craft` bridge that can draw bounded context from Hope, Tempus, and Vitae?
- What evidence grades are actually practical on ordinary phones without overbuilding hardware attestation?
- How should a physical object receive a stable ARCnet identifier without implying that ARCnet can prevent physical counterfeiting by itself?
- When does a maker-authored process record become publicly visible: at fabrication, listing, purchase, or only by explicit choice?
- Which product claims require independent verification rather than maker declaration?
- How should disputes distinguish software evidence from facts that ARCnet cannot directly observe?
- Should a selected Tempus correspondence set be copied into Commercium, referenced by digest, or packaged as a versioned derivative?
- Which portions of physical fulfillment belong in the common Edge Contract versus a future Commercium-specific contract layer?

## Next gate

Compare these patterns against Arcanum ↔ Theatrum.

That edge should stress-test whether the same distinction among source meaning, derived artifact, destination creation, provenance, economics, and later cross-system release survives when the destination object is **digital expression rather than physical craft**.
