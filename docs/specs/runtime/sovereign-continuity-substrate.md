---
title: "Sovereign Continuity Substrate"
status: implementation-candidate
visibility: public
last_updated: 2026-09-28
description: "Node-local object, provenance, temporal, custody, provider-adapter, projection, and replication contract for sovereign Architect continuity."
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W04"
layer: "Application / Local Runtime / Architect"
authority: "Human-directed design candidate; does not reorder or close CE-W04 A14-A16 or activate A17 runtime effects"
machine_schema: "docs/specs/runtime/sovereign-continuity-object.schema.json"
---

# Sovereign Continuity Substrate

## Purpose

This specification defines the logical continuity substrate that a participant-controlled Arcanum node may use to preserve project development, evidence, temporal provenance, selected Architect development memory, provider references, derived human-readable chronicles, and later peer replication without making a cloud provider the primary memory architecture.

The substrate is local-first and off-chain. It extends the existing ARCnet local-runtime storage model rather than replacing it. It does not alter the canonical Architect session ledger, Hope privacy boundary, TEMPUS doctrine, ARCnet settlement rules, or Human authority.

The immediate purpose is to establish the object contract before any bulk import from GitHub, Notion, Google Drive, model providers, or other external systems.

## Controlling laws

1. **The node owns its retained continuity.** External providers are sources, mirrors, or publication surfaces, not the intrinsic memory substrate.
2. **History is append-only.** Corrections and supersession create new objects and typed relationships. Historical records are not rewritten to resemble the present.
3. **Current state is derived.** A current-state view is a projection over evidence; it is not a replacement for historical objects.
4. **Authority is never inferred from storage.** Import, replication, proximity, geometry, time, provider status, or model confidence grants no authority.
5. **Meaning remains off-chain.** ARCnet may later witness minimal factual digests or receipts only when a separately authorized settlement boundary requires it.
6. **Private interior remains private by default.** Hope/Journey interior is not available to Architect development memory merely because the same node can store it.
7. **Provider ingestion is selective.** Whole external stores are not copied for convenience. Retention and disclosure require explicit scope.
8. **Temporal facts precede temporal interpretation.** The substrate records when facts occurred, were observed, and were recorded. TEMPUS interpretation is a separate additive layer.
9. **Derived indexes confer no authority.** Graphs, timelines, chronicles, search indexes, and public pages are rebuildable projections.
10. **Network absence is valid.** The node must be able to recover retained local continuity without GitHub, Notion, Drive, a model provider, or ARCnet being reachable.

## Relationship to existing runtime

The CE-W01 local runtime already defines protected namespaced persistence, an append-only local event ledger, factual local receipts, Tempus anchors, and explicit later witness boundaries.

The sovereign continuity substrate adds an owning namespace for Architect/project continuity:

```text
runtime/
identity/
apps/<appId>/
events/
receipts/
tempus/
architect/
  continuity/
    objects/
    blobs/
    indexes/
    projections/
    imports/
```

This is a logical layout. The implementation may use encrypted files, SQLite, a content-addressed store, or another local persistence engine so long as the observable contract remains equivalent.

## Core object model

Every retained continuity fact is represented by an immutable Continuity Object.

The initial object classes are:

- `arc` — a bounded development track or work arc;
- `session` — a reviewed Architect continuity session;
- `decision` — a material decision and its state;
- `idea` — an unresolved or developing idea worth retaining;
- `question` — a durable unresolved question;
- `correction` — an additive correction to an earlier record;
- `event` — a factual occurrence or state transition;
- `artifact` — a document, file, build, media object, or other retained artifact;
- `evidence` — evidence supporting or limiting a claim;
- `gate` — a bounded dependency or acceptance gate;
- `source_snapshot` — an observed external-provider object/revision;
- `projection` — a derived current-state, chronicle, machine index, provider mirror, or public view;
- `temporal_annotation` — a later TEMPUS or other temporal interpretation that references facts without rewriting them.

Raw conversation is not a privileged object class. If a transcript or excerpt is intentionally retained, it is an `artifact` subject to the same custody, minimization, and disclosure rules as any other content.

## Object identity and immutability

A continuity object has:

- `object_id` — unique immutable record identity;
- `subject_id` — stable logical subject such as `ARC-55`, `ARC-SES-23`, or a provider object identifier;
- `object_type`;
- `version` — schema-level record version, not mutable revision state;
- optional `object_digest_sha256` over canonical serialized bytes with the digest field omitted.

A correction does not replace an earlier object. It creates another object related by `corrects` or `supersedes`.

A provider revision likewise becomes a new `source_snapshot`. Provider update semantics never mutate already-retained historical observations.

## Claim class

Each object states what kind of claim it makes:

- `observation`
- `report`
- `inference`
- `proposal`
- `unknown`

This keeps observed repository state distinct from Human reports, model reasoning, design proposals, and unresolved claims.

## Independent effect state

Where relevant, an object carries the six Architect effect states independently:

```text
Proposed
Ratified
Authorized-for-effect
Executed
Verified
Canonicalized
```

Each state is one of:

- `established`
- `not-established`
- `unknown`
- `not-applicable`

Each state may cite evidence object IDs. No state implies another.

## Temporal coordinates

Continuity objects may record:

- `occurred_at` — when the underlying event occurred, if known;
- `observed_at` — when the source was actually observed;
- `recorded_at` — when this local object was recorded;
- `effective_from` and `effective_until` — bounded applicability when evidence supports it;
- `era`, `wave`, `arc_id`, and optional sequence ordinal;
- `tempus_anchor_ref` — optional factual temporal provenance.

These fields record chronology. They do not infer urgency, readiness, worth, authority, or meaning.

A later TEMPUS interpretation is a separate `temporal_annotation` object linked to the factual source objects. The original timestamps remain unchanged.

## Provenance

Every object has at least one provenance entry containing:

- provider/source kind;
- stable source reference;
- provider revision or exact Git coordinate where available;
- capture time;
- optional content digest;
- evidence class.

Recognized source kinds initially include local, Human, GitHub, Notion, Google Drive, Vercel, model provider, imported file, and other.

Provider provenance is evidence about origin. It does not grant provider authority.

## Custody, retention, disclosure, and replication

Every object explicitly declares custody policy.

### Disclosure classes

- `private-local` — available only inside the owning protected namespace;
- `architect-development` — available to the Architect development-memory boundary when retention is separately authorized;
- `shared-project` — eligible for explicit sharing with selected project peers;
- `public-candidate` — eligible for Human review before public expression;
- `public` — approved for public projection.

### Replication modes

- `none`
- `explicit-peers`
- `public`

Replication permission does not imply publication permission.

### Materialization modes

- `metadata-only` — retain identity, provenance, digest, and locator only;
- `snapshot` — retain a bounded normalized source snapshot;
- `full-content` — retain the content bytes in the node object/blob store.

A source locator is not permission to retain its content. Full-content retention requires the applicable retention authorization.

Objects from Hope/Journey private namespaces default to `private-local`, `replication=none`, and `do_not_export=true`. They do not enter Architect development memory without a separate explicit retention authorization.

## Typed relationships

Objects may assert typed graph edges:

- `precedes`
- `depends_on`
- `implements`
- `refines`
- `supersedes`
- `corrects`
- `derives_from`
- `verifies`
- `blocks`
- `unblocks`
- `branches_from`
- `returns_to`
- `parallel_track`
- `contains`
- `references`
- `produced_by`
- `evidence_for`
- `projects_to`

Edges are assertions with provenance through their owning object. A derived graph may invert or index these relationships for query, but the derived graph is not itself authoritative.

This distinction allows chronology and dependency to differ. A later-numbered Arc may be a parallel business or editorial track rather than the implementation successor of the preceding Arc.

## Provider adapters

Provider adapters are import/export boundaries, not memory authorities.

### GitHub adapter

GitHub remains authoritative for repository and CI state at exact refs. The node may retain commit, PR, file, check, and release observations as `source_snapshot`, `artifact`, `event`, and `evidence` objects.

A local snapshot does not override GitHub repository state.

### Notion adapter

Notion is treated as an operational/project-management projection and source. Work Registry rows may map to Arc, gate, or operational objects while retaining the Notion page/database identity and observation time.

Notion does not silently allocate competing canonical identities. Existing stable project IDs may be preserved as subject identifiers when their provenance is known.

### Google Drive adapter

Drive is treated as an artifact source and collaboration surface.

A Drive artifact may be represented locally as metadata-only, a normalized snapshot, or a full content-addressed copy. The record retains provider ID/revision, MIME type, digest where available, capture time, related Arc/session IDs, and retention policy.

The node must not bulk-copy Drive merely because connector access exists.

### Model-provider adapter

A model provider supplies computation, not intrinsic project memory.

The node assembles provider context from explicitly permitted objects, records provider provenance when useful, and captures only the selected outputs authorized for Architect development memory. Provider-side retention remains a separate provider-policy fact.

## Conversation-to-continuity loop

The intended sovereign development loop is:

```text
Human conversation
  -> provider-neutral Architect context assembled from permitted node objects
  -> candidate proposal / decision / question / artifact
  -> Human review or applicable authority check
  -> retained immutable continuity object
  -> derived graph / timeline / current-state projection
  -> optional provider mirror
  -> optional public projection
  -> optional minimal ARCnet witness when separately authorized
```

The system should preferentially retain typed outcomes, decisions, unresolved questions, provenance, and next gates rather than raw conversational transcripts.

## Derived projections

The following are derived, rebuildable surfaces:

- current-state projection;
- machine continuity index;
- relationship graph;
- chronological timeline;
- human-readable Chronicle of the Arcanum;
- provider mirrors;
- public-site views.

A projection records its exact source object IDs and generation time. A projection cannot silently promote a proposal to canon or a private object to public.

### Human chronicle

The human-readable chronicle should group Arcs into developmental eras and repeatedly answer:

- where the project was;
- what problem it was trying to solve;
- what was learned;
- what became durable;
- what actually changed;
- what remained unresolved;
- why the next era or branch began.

The chronicle is generated from source objects and may contain narrative interpretation, but every material statement remains traceable to source objects.

### Current state

Current state is computed from the latest non-superseded, sufficiently authoritative evidence for each subject and dimension.

Current-state derivation must preserve conflicts when evidence does not justify resolution. It must never erase the historical record that produced the present.

## Peer-node replication

Each node may hold a different authorized subset of the global object graph.

Replication therefore operates over immutable object identities and digests, not database cloning.

A peer exchange should be able to advertise:

- object ID;
- object type;
- digest;
- disclosure class;
- replication eligibility;
- provenance summary;
- dependency references.

The receiver still applies local capability, trust, retention, and disclosure policy before materialization.

This allows an Ubuntu workstation, Android Seed Node, and later ARCnet peers to share selected continuity without requiring every node to possess every private artifact.

## ARCnet witness boundary

No rich continuity object is placed on-chain by default.

When a later protocol use case requires witnessing, the candidate is a minimal factual receipt such as:

- object digest;
- object class;
- signer/identity anchor where applicable;
- witness time;
- explicit relation to a separately authorized protocol event.

Narrative meaning, raw documents, private memory, model prompts, Human interpretations, and TEMPUS semantic annotations remain off-chain.

## Recovery

The node must recover from retained objects and indexes without inventing missing history.

Derived indexes may be deleted and rebuilt.

Missing source-provider access does not invalidate an already retained, provenance-bound local snapshot. Conversely, a local snapshot does not prove that the external provider still has the same current state.

Corruption fails visibly. Reset or deletion is deliberate and produces its own factual record where the owning contract requires it.

## Relationship to Architect continuity ledger

The existing GitHub Architect continuity ledger remains the canonical continuity mechanism until a later Human-ratified migration explicitly changes that authority arrangement.

This substrate is designed to ingest and represent those records without renumbering, rewriting, or silently canonicalizing external sessions.

An empty active session index remains an index gap, not proof that no external history exists.

## Relationship to CE-W04 A17-A20

This specification prepares the substrate required by the planned Architect development-memory and conversational layers.

It does not itself execute A17, reorder A14-A16, activate model-provider memory, ingest private stores, or grant a publication capability.

A future implementation may map the planned sequence as:

```text
A17  node-local sovereign continuity + authorized Architect development memory
A18  conversational Architect over selected retained continuity
A19  separate private Hope collection + temporal recall
A20  geometry-bound navigation over real node objects
W05  multi-node personal constellation and selected peer synchronization
```

That mapping is implementation guidance only until the controlling roadmap and Human authority establish the applicable gate.

## Initial acceptance criteria

A later implementation should not be considered complete until it can demonstrate:

1. offline creation and restart recovery of immutable continuity objects;
2. deterministic digesting and corruption detection;
3. typed graph traversal without rewriting source records;
4. independent effect-state representation;
5. reconstruction of a current-state projection while preserving historical contradictions;
6. selective GitHub, Notion, and Drive source snapshots with exact provenance;
7. separate retention and disclosure enforcement;
8. denial of Architect access to private Hope/Journey objects absent explicit retention authorization;
9. generation of a human chronicle from source object IDs;
10. rebuildable indexes and projections;
11. selected object transfer between two participant-controlled nodes without whole-store cloning;
12. no automatic chain publication or settlement.
