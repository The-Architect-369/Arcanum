---
title: "ARCnet Edge Study 06 — Commercium ↔ Theatrum"
status: design-candidate
visibility: public
last_updated: 2026-08-22
description: "Sixth ARCnet edge study: the boundary between physical craft/exchange and digital/symbolic representation, provenance, licensing, and twin artifacts."
phase: "Pre-Genesis"
authority: "non-canonical design evidence"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/37"
edge_id: "commercium.theatrum"
edge_class: "kinship-candidate"
---

# ARCnet Edge Study 06 — Commercium ↔ Theatrum

## Purpose

This study examines the candidate relationship between **Commercium** and **Theatrum** within the generative/lived tetrahedron.

It asks how physical objects, services, crafted works, digital representations, licenses, provenance records, and symbolic artifacts can correspond without allowing a digital image to impersonate a physical object, a physical purchase to silently grant unlimited digital rights, or provenance metadata to become ownership by assertion.

## Semantic correspondence

Commercium asks:

> What physical good, service, craft, or exchange exists in the material/economic domain?

Theatrum asks:

> What digital or symbolic form represents, accompanies, interprets, or extends that work?

The edge is therefore the threshold between:

- physical object and digital representation;
- material provenance and digital lineage;
- ownership and license;
- crafted work and symbolic/digital twin;
- sale and use rights.

Candidate summary:

> **Commercium governs material exchange; Theatrum governs digital/symbolic embodiment. Their edge binds representations without collapsing one form into the other.**

## Core flow

A physical object may produce a digital companion or representation.

Candidate flow:

```text
Commercium Object Record
        |
        | explicit creator/owner action
        v
Digital-Twin Seed
        |
        v
Theatrum private artifact
        |
        | creator defines representation/license
        v
Digital Twin / Companion Artifact
```

Reverse:

```text
Theatrum digital design
        |
        | explicit fabrication intent
        v
Fabrication Artifact
        |
        v
Commercium Craft Draft
        |
        | maker performs physical creation
        v
Physical Object Record
```

Neither direction proves the destination object exists until the destination-native process is completed.

## Representation–Object Separation

This edge exposes a foundational law:

> **A representation of an object is not the object itself.**

A photograph, 3D model, certificate, avatar, or digital twin may represent a physical artifact without proving:

- current possession;
- authenticity;
- condition;
- uniqueness;
- physical location;
- continued existence.

Likewise, a physical artifact does not automatically contain all rights to its digital representations.

## Ownership–License Separation

A buyer may acquire a physical object while receiving only limited digital rights.

Examples of separable rights include:

```text
physical possession
physical resale
private digital viewing
public display
commercial digital reproduction
remix
fabrication from digital design
transfer of license
```

Candidate law:

> **Physical ownership, digital ownership, and usage license are separate authorities unless explicitly bundled.**

## Provenance binding

A useful cross-system object may have two related but distinct histories:

```text
PHYSICAL PROVENANCE
maker
materials
fabrication evidence
transfers
fulfillment

DIGITAL LINEAGE
creator
source files
versions
remixes
licenses
publication history
```

The edge may bind them through references or digests without pretending they are identical histories.

Candidate law:

> **Cross-domain provenance should be linked, not flattened.**

## Digital twin classes

The phrase `digital twin` should remain precise. Candidate classes include:

```text
visual representation
- image / render / scan

descriptive companion
- metadata / story / instructions

interactive companion
- 3D object / AR representation / environment

fabrication source
- design files intended to produce a physical object

provenance companion
- signed history / evidence references
```

Different classes imply different rights and evidentiary strength.

A visual representation should not silently become a fabrication license.

## Optional sovereign faculty projections

### Hope projection

Possible legitimate uses:

- selected maker/creator intention;
- personal meaning attached to a physical/digital pair;
- private reflection when acquiring or creating an object.

Hope context remains optional and must not become sales persuasion profiling.

### Tempus projection

Possible legitimate uses:

- fabrication time/window;
- release time;
- ritual/seasonal correspondence selected by creator;
- temporal provenance between physical and digital forms.

Tempus context must distinguish recorded fact from symbolic overlay.

### Vitae projection

Possible legitimate uses:

- selected craft-learning provenance;
- selected developmental source of the design;
- bounded factual capability evidence for fabrication or specialized tools.

Vitae recognition itself is not transferable with the object and cannot be purchased through the sale.

This is the third base-edge confirmation that all three faculties can contribute optional context without any one faculty defining the edge.

## Creation versus fabrication

A digital design may exist without any physical fabrication.

A fabrication intent is therefore a derivative, not proof of completion.

Candidate states:

```text
digital design
fabrication requested
fabrication accepted
physical work in progress
physical object recorded
fulfilled / transferred
```

Candidate law:

> **Design intent and materialization evidence must remain distinct.**

## Scarcity boundary

Physical scarcity and digital scarcity behave differently.

A physical object may be singular because matter cannot occupy multiple owners' possession simultaneously.

A digital artifact is technically copyable unless a particular license, entitlement, or protocol rule defines a scarce right.

ARCnet should not imply that a digital file is physically scarce merely because a token or record references it.

Candidate law:

> **Protocol scarcity is a rule about rights or records; it is not identical to material scarcity or copy prevention.**

## Transfer synchronization

If a physical object changes hands, a linked digital companion may or may not transfer.

Possible policies:

```text
physical only
physical + viewing companion
physical + transferable digital license
physical + provenance reference only
```

The transfer bundle must be explicit before purchase.

Likewise, transferring a digital license does not necessarily transfer the physical object.

## Economic boundary

This edge can carry real economic effects, but they belong to explicit Commercium or licensing actions.

Possible economic actions include:

- sale of physical object;
- sale/license of digital artifact;
- bundled sale;
- creator royalty where constitutionally and contractually authorized;
- fabrication service payment.

All consequences must remain visible before authorization under the Economic Constitution.

No purchase may fabricate Vitae recognition, Tempus history, or provenance that did not occur.

## Settlement boundary

Potentially settleable facts include:

- payment transfer;
- ownership/right transfer where ARCnet recognizes such a right;
- license issuance or transfer;
- factual provenance anchors.

High-context creative meaning, private source files, Hope context, and symbolic interpretations should remain off-chain by default.

## Candidate action registry

### Commercium → Theatrum

- `create-digital-twin-seed`
- `open-companion-artifact-draft`
- `bind-provenance-reference`
- `create-digital-license-draft`
- `open-object-in-theatrum`

### Theatrum → Commercium

- `create-fabrication-draft`
- `create-listing-from-artifact`
- `license-fabrication-right`
- `bind-physical-edition`
- `open-commercialization-draft`

Names are illustrative.

## New patterns extracted

1. **Representation–Object Separation** — a digital representation is not the physical object.
2. **Ownership–License Separation** — possession, ownership, and usage rights are independently scoped.
3. **Linked Provenance** — physical provenance and digital lineage should be connected without being flattened into one record.
4. **Design–Materialization Separation** — a design or fabrication request does not prove physical creation.
5. **Scarcity-Type Separation** — material scarcity, protocol rights, and digital copyability are distinct.
6. **Transfer-Bundle Explicitness** — linked physical/digital rights transfer only when expressly included.
7. **Multi-Faculty Context** — Hope, Tempus, and Vitae all have legitimate optional projections on this edge.

## Reconfirmed laws

This study also supports:

- Derived Artifact Law;
- Authority Conservation;
- Provenance Without Surveillance;
- Evidence Grade Law;
- Temporal Integrity;
- Destination Economics;
- Non-Transitive Edge Authority;
- Transport Independence.

## Open questions

- What should ARCnet call a `digital twin` when the digital object is interpretive rather than a high-fidelity representation?
- Which rights should be protocol-readable versus ordinary legal/license text?
- How can physical provenance resist counterfeit substitution without overstating what software can know?
- What happens to a digital companion when the physical object is destroyed, lost, or materially altered?
- How should creator royalties interact with resale without inventing unauthorized monetary rules?
- Which provenance checks belong to the later Commercium ↔ Protection edge?

## Generative tetrahedron closure

With this study, all six internal relationships of the candidate generative/lived tetrahedron have a first documented pass:

```text
Arcanum <-> Nexus
Arcanum <-> Commercium
Arcanum <-> Theatrum
Nexus <-> Commercium
Nexus <-> Theatrum
Commercium <-> Theatrum
```

The next step should compare the six as a family and extract only those laws that survive across materially different domains.
