---
title: "ARCnet Edge Study 01 — Arcanum ↔ Nexus"
status: design-candidate
visibility: public
last_updated: 2026-08-21
description: "First detailed ARCnet edge study: the boundary between Arcanum interiority and Nexus relation/expression."
phase: "Pre-Genesis"
authority: "non-canonical design evidence"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/37"
edge_id: "arcanum.nexus"
edge_class: "kinship-candidate"
---

# ARCnet Edge Study 01 — Arcanum ↔ Nexus

## Purpose

This is the first detailed study of a candidate relationship in the eight-point ARCnet topology.

It tests whether a geometric relationship can produce a legitimate, useful, sovereignty-preserving software boundary.

## Semantic correspondence

Arcanum asks:

> What is happening within me?

Nexus asks:

> What do I choose to place between myself and others?

The edge is therefore the threshold between:

- interiority and relation;
- private reflection and expression;
- personal practice and voluntary sharing;
- inner context and social context.

## Candidate endpoint faculties

### Arcanum-facing port: Hope

Hope is the leading Arcanum faculty for this edge because it reflects, clarifies, and helps draft without executing, governing, or publishing.

Hope is **not the edge itself**. It is the Arcanum-facing faculty/port participating in the relationship.

### Nexus-facing port: Compose / Draft / Publication

The current Nexus implementation already separates composing, local drafts, and publication. That makes Compose/Draft/Publication the strongest current candidate for the Nexus-facing faculty.

Future Nexus architecture may rename or restructure this port without changing the semantic relationship.

## Derived Artifact Law

A private Hope reflection must not be moved wholesale into Nexus and Nexus should not receive broad read access to Hope storage.

Candidate flow:

```text
HopeReflectionRecord
    private Arcanum source
          |
          | user selects what may leave
          v
ArcanumNexusPassageArtifact
    bounded derivative
          |
          v
NexusPostDraft
    private destination object
          |
          | separate release decision
          v
NexusPost
    shared social object
```

The source object remains in Arcanum.

The relationship produces a derivative destination card.

> **The source card stays in its system; a derivative card is dealt across the edge.**

## Two-phase passage

### Phase A — Passage

1. The person selects a source card or material.
2. Arcanum derives only the selected disclosure.
3. The user reviews included context.
4. The user authorizes the Arcanum ↔ Nexus crossing.
5. Nexus receives a **private draft**.

No social publication has occurred yet.

### Phase B — Release

1. Nexus opens the private draft.
2. The person edits/reframes as desired.
3. The person chooses audience.
4. Nexus presents any economic or transport consequences.
5. The person authorizes publication.
6. Nexus creates its social object and the relevant receipt/evidence.

This yields a candidate general rule:

> **The origin authorizes departure; the destination governs arrival.**

## Candidate visible interaction

A Hope card may expose a simple action such as:

```text
Share reflection
```

The threshold interaction should make disclosure legible without exposing a technical permission matrix.

Example disclosure review:

```text
Include:
[x] selected reflection text
[ ] Hope response text
[ ] Tempus context
[ ] Vitae practice context
[ ] media
```

The resulting Nexus object should first appear as an explicitly labeled private draft.

## Delivery scope versus audience scope

This edge showed that delivery and audience are independent dimensions.

### Delivery

Where the object travels:

- local device;
- trusted devices;
- selected peers;
- network.

### Audience

Who can perceive the destination object:

- private draft;
- selected identities;
- group;
- channel;
- public.

A group object may travel over a network without becoming public.

## Arcanum Trace — candidate composite card

A possible user-created derivative is an **Arcanum Trace**.

It could combine explicitly selected material from the Arcanum's inner faculties:

```text
Arcanum Trace

Hope
- reflection excerpt

Tempus
- optional ritual / time / correspondence context

Vitae
- optional practice / learning context

User
- caption / framing / media
```

A Trace must be deliberate and user-composed.

It must not become:

- an automatic activity feed;
- a streak report;
- a behavioral surveillance summary;
- automatic evidence of worth or readiness;
- an involuntary social broadcast.

Silence remains valid.

## Provenance and authorship

Crossing the edge should preserve enough provenance to distinguish, where relevant:

- user-authored text;
- user-edited assistant draft;
- Hope-generated draft;
- system-factual context such as a timestamp or selected Tempus window.

This is about epistemic/provenance integrity, not ranking users or content.

Internal source identifiers should not automatically leak to Nexus.

Local ARCnet state may retain the private mapping between source record and passage artifact while Nexus receives minimized shared provenance such as:

```text
origin system: Arcanum
origin component: Hope
artifact digest: ...
authorized by: minimal identity reference
```

## Reverse direction — Nexus → Arcanum

The reverse edge is equally important.

Nexus must not automatically write social state into Hope.

A user may explicitly choose an action such as:

```text
Reflect in Arcanum
```

Candidate flow:

```text
Nexus post / reply / event
          |
          | explicit user choice
          v
NexusReflectionSeed
          |
          v
Hope reflection composer
          |
          | user reflects/saves
          v
new private Hope reflection
```

The imported object is a **reflection seed**, not automatically a reflection and not permission for Hope to ingest the surrounding social graph.

## Social-metric boundary

Social metrics should not automatically flow inward as personality or optimization signals.

Examples that should not become implicit Hope inputs:

- reaction counts;
- reply counts;
- follower counts;
- repost counts;
- popularity ranking;
- engagement velocity.

Otherwise Hope could gradually become a system for optimizing the participant toward social approval rather than supporting private reflection.

A participant may deliberately bring a specific response or interaction inward for reflection.

## Candidate action registry

### Arcanum → Nexus

- `create-reflection-draft`
- `create-practice-draft`
- `create-ritual-context-draft`
- `create-trace-draft`
- `create-event-proposal-draft`
- `reference-factual-receipt`

### Nexus → Arcanum

- `create-reflection-seed-from-post`
- `create-reflection-seed-from-reply`
- `create-tempus-candidate-from-event`
- `save-private-reference-to-resource`

These names are illustrative, not implementation-final.

## Authority posture

This edge is primarily an **expression, interpretation, proposal, and reflection** boundary.

It should carry very little direct execution authority.

Examples:

- Hope may draft; it does not publish by itself.
- Nexus may display a proposal; it does not thereby schedule a rite or ratify governance.
- A factual receipt may be referenced; the social interpretation of that receipt does not become protocol truth.

## Economics boundary

Creating a private Arcanum → Nexus draft should ordinarily have no economic effect.

If a future ratified Nexus policy applies MANA to a scarce public utility such as anti-spam publication, channel creation, or storage, that consequence belongs to the destination action.

> **Edges should not monetize movement merely because movement occurs.**

The current web implementation's posting costs are implementation evidence, not automatic Creation Era law.

## Transport boundary

The semantic edge must remain independent from the current web transport implementation.

Matrix, Helia/IPFS-style content addressing, local storage, direct peer transfer, trusted-device synchronization, and future ARCnet transports are implementation mechanisms beneath the contract.

Replacing a transport must not redefine the Arcanum ↔ Nexus meaning or authority boundary.

## Candidate card transformation pattern

The card/deck UI can embody the edge without rendering sacred geometry as primary navigation.

```text
ARCANUM DECK                     NEXUS DECK

Hope Reflection
      |
      | derive + consent
      v
Passage card
      |
      | Nexus accepts
      v
                                Nexus Draft
                                     |
                                     | publish by choice
                                     v
                                Nexus Social Card
```

The reverse direction can similarly produce a new Hope reflection card from a deliberately selected Nexus seed.

## Patterns extracted from edge study 01

This study produced the following candidate general laws:

1. **Derived Artifact Law** — exchange derivatives, not source-store access.
2. **Two-Phase Passage** — crossing and destination execution are separate.
3. **Monotonic Disclosure** — audience/disclosure may not widen silently.
4. **Authority Conservation** — crossing does not elevate authority.
5. **Provenance Without Surveillance** — preserve origin without exporting dossiers.
6. **Explicit Return** — external state does not automatically feed protected interior state.
7. **Destination Economics** — charge consuming functions, not boundary crossing itself.
8. **Transport Independence** — preserve semantics across transport replacement.

These laws remain provisional until tested against materially different edges.

## Open questions

- Is **Hope** permanently the Arcanum-facing port for Nexus, or is a broader `Expression`/`Share` faculty needed above Hope, Tempus, and Vitae?
- Should **Arcanum Trace** become a first-class artifact type, a UI composition pattern, or remain informal language?
- What minimum shared provenance is sufficient for social integrity without enabling cross-system correlation?
- Which Nexus visibility/audience model should native ARCnet adopt first?
- When a Nexus event is brought into Arcanum, does it enter Tempus directly as a candidate calendar object or first remain a private reference?
- Which of the eight extracted laws survive non-social edges such as Imperium ↔ Aerarium or Architect ↔ Protection?

## Next gate

Preserve this as reference edge 01, then select subsequent edges specifically to stress-test these laws rather than merely repeating similar social-sharing behavior.
