---
title: "ARCnet Local Runtime Boundary — CE-W01"
status: implementation-candidate
visibility: public
last_updated: 2026-09-02
description: "Sovereign local-runtime contract for CE-W01 covering identity handles, protected storage, application registration, capability isolation, local events and receipts, Tempus persistence, offline restart, and the later ARCnet witness boundary."
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W01"
layer: "Application / Local Runtime"
authority: "implementation-facing specification derived from controlling doctrine, canonical module boundaries, and the Construction Era roadmap; does not amend doctrine, identity, governance, economy, Treasury, or ARCnet protocol authority"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/39"
---

# ARCnet Local Runtime Boundary — CE-W01

## Purpose

This specification defines the minimum sovereign local-runtime boundary required by CE-W01 before the native Android host is constructed.

The local runtime is the participant-controlled computational core that persists local state, mediates local applications, applies explicit capability decisions, emits factual local events and receipts, and preserves temporal provenance without requiring network access or protocol finality.

The first implementation target is a shared Rust runtime. CE-W02 may place a narrow Android/Kotlin host around this contract. The host must derive behavior from this boundary rather than recreating identity, storage, capability, receipt, or temporal rules in presentation code.

This specification does **not** create a new canonical module. Runtime services exist to implement already-authorized application, Identity, Tempus, and protocol boundaries.

## Controlling constraints

This contract remains subordinate to:

- `docs/architecture/app-chain-doctrine.md`;
- `docs/architecture/canonical-modules.md`;
- `docs/doctrine/identity-model.md`;
- `docs/doctrine/layer-boundaries.md`;
- `docs/doctrine/temporal-model.md`;
- `docs/specs/identity/authority-binding-model.md`;
- `docs/specs/protocol/agent-permission-boundaries.md`;
- `docs/specs/tempus/tempus-anchor.md`;
- `docs/specs/chain/local-arcnet.md`;
- `docs/roadmap/construction-era-roadmap.md`.

Where this document conflicts with controlling canon, controlling canon wins.

## Core law

> **Local truth remains local until an independently authorized boundary explicitly submits a minimal fact for wider witnessing.**

Derived laws:

1. local state does not require chain settlement;
2. a local receipt is not protocol finality;
3. an application does not receive a capability merely because it is installed, visible, geometrically adjacent, temporally coincident, or able to request it;
4. identity continuity is deeper than a wallet, address, device key, account, application record, or runtime process;
5. private participant content remains local by default;
6. restart must recover durable local truth without inventing or silently rewriting it;
7. network absence is a valid operating condition;
8. runtime implementation may enforce authorized boundaries but may not manufacture doctrine, governance, economic policy, recognition, or human meaning.

## Runtime position

The Construction-era local stack is:

```text
Human / participant
        ↓
native host / accessible presentation
        ↓
shared local runtime
  ├─ identity handle boundary
  ├─ protected vault/storage
  ├─ local application registry
  ├─ capability gate
  ├─ local event ledger
  ├─ local receipt service
  └─ Tempus provider/persistence boundary
        ↓
explicit later network submission boundary
        ↓
ARCnet witness / settlement only when required
```

The local runtime is not the ARCnet chain and must remain usable when ARCnet is unavailable.

## CE-W01 runtime responsibilities

The runtime contract owns only the following minimum responsibilities:

- lifecycle initialization and orderly shutdown;
- opaque local identity/signing handles;
- protected namespaced persistence;
- local application registration and lookup;
- deny-by-default capability evaluation from explicit grants;
- append-only factual local event persistence;
- local receipt creation over persisted facts;
- `TempusAnchor` capture/persistence integration;
- deterministic restart/recovery semantics;
- preparation of explicitly selected witness candidates for later waves without submitting them automatically.

It does not own:

- constitutional or doctrinal authority;
- identity essence;
- Vitae recognition;
- Hope interpretation;
- economic issuance policy;
- Treasury discretion;
- governance ratification;
- protocol consensus/finality;
- symbolic or geometric meaning;
- participant-worth, readiness, rank, destiny, or behavioral prediction.

## Process boundary

The runtime is a local process/library boundary with a versioned interface.

The native host may:

- start and stop the runtime;
- request registered application metadata;
- request application launch preparation;
- submit participant-approved local commands;
- request reads of authorized local state;
- request a capability decision;
- ask the runtime to persist an event or participant-owned record;
- request factual receipt data;
- request Tempus observation through a registered provider.

The native host may not:

- read private signing key material;
- bypass the capability gate;
- rewrite the event ledger directly;
- reinterpret a local receipt as protocol-finalized;
- silently transmit private local state;
- create canonical modules, authority, recognition, or economic rights through UI state.

The host/runtime bridge introduced in CE-W02 must remain narrower than the internal runtime domain model.

## Local identity interface

CE-W01 requires an identity **handle** boundary, not a complete production identity system.

Conceptual shape:

```text
LocalIdentityHandle
- identityRef
- continuityState
- signingHandle
- provenance
```

### `identityRef`

A stable local reference to participant continuity.

It must not be treated as the being itself and must not encode worth, rank, Vitae Grade, authority level, economic balance, or behavioral classification.

### `continuityState`

Minimum lifecycle states may include:

```text
provisional
restored
unavailable
recovery-required
```

These are technical continuity states, not human status.

### `signingHandle`

An opaque reference that permits an authorized signing operation without exposing private key material to applications or the presentation host.

The CE-W01 semantic rule is:

```text
sign(dataDigest, signingHandle) -> signature result or explicit failure
```

The runtime interface must not provide:

```text
exportPrivateKey(signingHandle)
```

Specific cryptographic algorithms, key stores, recovery ceremonies, hardware-backed storage, and protocol identity binding remain implementation/provider decisions that must satisfy the controlling Identity model and later evidence gates.

### Identity versus authority

Authority may attach to an identity through a separately controlling binding. The runtime must not derive authority merely from possession of an identity handle, signing key, device, application, wallet, balance, geometry, or timestamp.

## Protected vault and storage contract

The runtime owns participant-controlled local persistence through explicit namespaces.

Minimum namespace classes:

```text
runtime/
identity/
apps/<appId>/
events/
receipts/
tempus/
```

Additional namespaces require an owning application/module contract.

### Storage invariants

- application state is namespaced;
- one application may not enumerate or read another application's private namespace without an explicit capability;
- identity/signing material is isolated from ordinary application state;
- protected content is encrypted at rest where the platform/runtime implementation provides durable participant-controlled storage;
- key material must not be written to logs, receipts, analytics, application manifests, or protocol payloads;
- corruption must fail visibly rather than silently resetting participant history;
- deletion/reset must be deliberate and distinguishable from ordinary restart;
- telemetry must not become a cross-application dossier.

CE-W01 defines these semantics without selecting the final Android secure-storage mechanism. CE-W02 must bind the native host to a storage provider that can satisfy them.

## Local application registry

The runtime maintains a local registry of applications it may expose to the host.

Conceptual record:

```text
LocalApplicationRecord
- appId
- manifestVersion
- implementationVersion
- provenance
- installState
- requestedCapabilities[]
- grantedCapabilities[]
```

### Registry laws

- `appId` is stable and source-owned;
- registration does not create a canonical module;
- geometric position does not create an application;
- a requested capability is not a granted capability;
- an installed application is not automatically trusted with another application's state;
- registry records must remain understandable without geometric presentation;
- CE-W01 may use statically provisioned records; dynamic signed-package installation belongs to later Construction waves.

Minimum install states may include:

```text
registered
disabled
unavailable
```

Dynamic installation, update lineage, package signature verification, rollback, and entitlement semantics are explicitly deferred to later signed-application waves.

## Capability isolation

Capabilities are deny-by-default.

Conceptual request:

```text
CapabilityRequest
- requestingAppId
- capabilityId
- scope
- purpose
- contextRef
```

Conceptual decision:

```text
CapabilityDecision
- requestDigest
- decision
- scope
- authoritySource
- decidedAt
- constraints
```

`decision` is one of:

```text
grant
deny
```

### Capability laws

- absence of a grant means deny;
- a request cannot self-authorize;
- application registration alone cannot grant a capability;
- time, location, celestial position, visual geometry, animation state, economic balance, popularity, completion count, or Vitae state cannot grant capability unless a separately controlling legitimate authority explicitly defines a bounded dependency;
- capability decisions must be scoped and auditable;
- Human consent remains required wherever the controlling contract requires it;
- agent/automation permission ceilings remain separate from participant application capabilities.

This specification defines the runtime enforcement boundary. It does not promote the Creation-era capability-evaluator prototype into the baseline.

## Local event model

The runtime maintains an append-only factual event ledger.

Conceptual envelope:

```text
LocalEvent
- eventId
- schemaVersion
- eventType
- owningAppId
- subjectRef
- payloadDigest
- payloadRef
- createdAt
- tempusAnchorRef
- provenance
- visibility
```

### Event laws

- events record technical facts, not human judgement;
- persisted events are immutable; corrections are new events referencing prior events;
- private content should be referenced through protected local storage rather than copied into broad receipt/event surfaces when a digest/reference is sufficient;
- `createdAt` is factual provenance, not an authority or readiness signal;
- `tempusAnchorRef` is optional unless the owning contract requires temporal provenance;
- `visibility` controls eligibility for later handling and does not itself transmit data.

Minimum CE-W01 visibility classes:

```text
private-local
sync-eligible
witness-eligible
```

CE-W01 implements only local persistence semantics. `sync-eligible` and `witness-eligible` are classifications for later explicit flows, not automatic network behavior.

## Local receipt model

A local receipt states that the local runtime accepted and persisted a factual local operation.

Conceptual envelope:

```text
LocalReceipt
- receiptId
- schemaVersion
- receiptType
- eventRefs[]
- contentDigest
- persistedAt
- runtimeVersion
- signerRef
- signature
- scope
```

For CE-W01:

```text
scope = local
```

A signed receipt means only that the local signer attested to the digest represented by the receipt.

It does not mean:

- ARCnet witnessed the receipt;
- consensus accepted it;
- another device possesses it;
- the participant consented to publish it;
- the event carries moral, symbolic, spiritual, governance, economic, or recognition meaning beyond its declared factual fields.

When signing is unavailable, the runtime must represent the receipt as unsigned rather than fabricate a signature or protocol identity.

## Tempus provider boundary

The runtime exposes a minimal provider boundary sufficient for the existing `TempusAnchor` contract.

Conceptual clock operation:

```text
ClockProvider.sample() -> ClockSample
```

A `ClockSample` must identify:

- source kind;
- civil timestamp with explicit offset or `Z`;
- source/provider identity where applicable;
- available resolution/uncertainty information;
- monotonic correlation when the provider supplies one.

A system-clock `TempusAnchor` must be creatable with no network dependency and no precise participant location.

Optional ephemeris providers remain separate interfaces. A provider may supply astronomical observations only with the source/observer/frame/model/precision provenance required by `docs/specs/tempus/tempus-anchor.md`.

No provider output grants runtime capability or authority merely because of timing or astronomical position.

## Persistence and restart contract

A valid CE-W01 runtime lifecycle is:

```text
start
  ↓
open protected storage
  ↓
validate runtime metadata/version
  ↓
restore identity handle metadata
  ↓
load local application registry
  ↓
validate/replay durable event + receipt indexes
  ↓
restore Tempus provenance required by persisted records
  ↓
ready
```

Shutdown must flush durable state or return an explicit failure.

### Restart invariants

After a clean restart:

- stable identity references remain stable;
- application records preserve their IDs and explicit capability grants;
- persisted participant-owned records remain retrievable;
- event IDs and event content do not change;
- receipt IDs, digests, signatures, and scope do not change;
- original Tempus provenance does not change;
- no network connection is required to recover local truth;
- restart does not create a protocol transaction.

If durable state fails validation, the runtime must fail closed for affected operations and surface recoverable diagnostics. It must not silently invent replacement identity, receipts, timestamps, capability grants, or participant content.

## Witness-candidate boundary

CE-W01 may prepare a minimal candidate for later explicit ARCnet submission.

Conceptual form:

```text
WitnessCandidate
- sourceReceiptId
- factType
- digest
- minimalPublicReferences
- requestedBy
```

Creation of a `WitnessCandidate` is local-only.

It must not perform network submission.

A later protocol-connectivity wave must define the separately authorized steps for:

```text
prepare -> review/consent -> sign transaction -> submit -> observe finality
```

The witness payload must remain meaning-blind and privacy-minimized. Private reflective content, private history, identity essence, Vitae notes, or symbolic interpretation must not be placed on-chain merely because a local receipt exists.

## Geometry and presentation firewall

The runtime does not depend on 3D geometry to represent required state.

A host may project registered applications or runtime state into the ARCnet coordinate frame, but:

- position does not grant capability;
- adjacency does not grant data access;
- center distance does not rank applications or humans;
- animation/rotation does not mutate runtime truth;
- a geometry-free list/card/navigation surface must remain capable of invoking the same authorized operations.

## Failure semantics

The runtime must distinguish at least:

```text
not-found
not-authorized
provider-unavailable
storage-unavailable
integrity-failure
version-incompatible
signing-unavailable
invalid-input
```

Failure categories are technical diagnostics. They must not be transformed into participant-worth, compliance, readiness, or moral judgements.

## Privacy and logging

Runtime logging exists for reliability and local diagnosis.

Logs must not contain:

- private keys or seed phrases;
- raw signing secrets;
- protected reflective content by default;
- precise location unless the diagnostic purpose explicitly requires and the participant permits it;
- cross-application behavioral profiles;
- hidden authority or recognition inferences.

A production implementation must support bounded retention or participant-controlled clearing appropriate to the owning data class without silently deleting canonical local receipts that another contract requires to remain durable.

## Rust implementation mapping

CE-W01 fixes semantic boundaries, not crate names. A Rust implementation should preserve separable domains equivalent to:

```text
runtime lifecycle
identity handles/signing
protected storage
application registry
capability gate
events
receipts
tempus providers/persistence
later witness preparation
```

The implementation may combine or split crates/modules for engineering reasons only if the externally testable boundaries remain intact.

No Rust implementation is required to be merged merely to declare CE-W01 semantic closure. CE-W02/CE-W04 evidence must prove the actual runtime and native host satisfy this contract.

## Falsification tests

An implementation fails this specification if any of the following is false.

### R1 — offline boot

The runtime can initialize and expose registered local applications with network access unavailable.

### R2 — protected namespace isolation

An application cannot read another application's protected namespace without an explicit applicable capability grant.

### R3 — opaque signing

An authorized local signing operation can be requested through an opaque handle without exposing private key material to the application/host interface.

### R4 — deny by default

An absent, unknown, expired, or out-of-scope capability grant cannot be treated as permission.

### R5 — factual local events

Persisted events can reconstruct technical local facts without encoding human worth, rank, readiness, destiny, or symbolic judgement.

### R6 — local receipt scope

A newly created CE-W01 receipt is visibly local and cannot be mistaken for ARCnet finality.

### R7 — no automatic chain action

Persisting a record, event, receipt, application state, capability decision, or `TempusAnchor` causes no automatic protocol transaction.

### R8 — restart equivalence

After termination/restart, stable persisted identity references, participant records, event IDs/digests, receipt IDs/digests/signatures, application registry state, applicable capability grants, and original Tempus provenance are recovered without mutation.

### R9 — integrity failure is visible

Corrupted durable state does not silently become a clean empty identity/history or fabricated replacement record.

### R10 — temporal authority firewall

Changing timestamp, season, astronomical coordinate, or other `TempusAnchor` context cannot grant capability by itself.

### R11 — geometry-free operation

Every required CE-W01 runtime action remains invokable and understandable without geometric presentation.

### R12 — witness preparation is not submission

Creating a witness candidate performs no network call, transaction signing, submission, or finality claim.

## Explicit CE-W01 non-scope

The runtime boundary does not yet require:

- Android/Kotlin host implementation;
- JNI/UniFFI or another concrete host bridge;
- production cryptographic algorithm selection;
- production recovery ceremony;
- trusted-device synchronization;
- peer networking;
- ARCnet query/transaction connectivity;
- protocol finality observation;
- dynamic signed application installation/update/rollback;
- application entitlement formulas;
- MANA issuance or reward logic;
- Treasury execution;
- governance execution;
- arbitrary community executable code.

Those belong to later waves and remain separately authority-gated.

## CE-W01 architecture exit gate

The Architecture & Technology lane is semantically ready for CE-W02 only when:

1. this runtime boundary is accepted as the implementation contract;
2. the local identity/signing boundary remains opaque and sovereignty-preserving;
3. protected storage namespaces and failure semantics are fixed;
4. local application registration and deny-by-default capability isolation are fixed;
5. event and local receipt semantics are fixed;
6. `TempusAnchor` has a defined local provider/persistence integration boundary;
7. offline restart invariants are testable;
8. local truth and later ARCnet witness/finality remain visibly distinct.

CE-W02 may then implement the Android/Kotlin host and narrow Rust bridge against this contract. CE-W04 remains the evidence milestone that proves clean install → identity → runtime → Arcanum/Hope → protected persistence → restart → signed local receipt in an actually running native system.
