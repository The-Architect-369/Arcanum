---
title: "CE-W04 A17 — Bounded Local Continuity Foundation"
status: implementation-candidate
visibility: public
last_updated: 2026-10-03
phase: "Pre-Genesis"
wave: "CE-W04"
authority: "Human-directed A17 implementation candidate; no canonical adoption or device installation implied"
---

# A17 local continuity foundation

## Authority, source and first success condition

The Human requested “With A16 closed let's keep this momentum and begin work on A17”.
Canonical starting point is `main@bfa1ea659937f1fec4216680de81f989bd9961d4`, the
verified A16 closure. Work ref: `work/a17-continuity-foundation-20261003`.
The [A17 work record](https://app.notion.com/p/3df2bb4420b8811687bbe4b2c86a6fb1)
and [ratified execution baseline](https://app.notion.com/p/3e12bb4420b881219b88f57e93e25d5a)
were retrieved on 2026-10-03. Their September “blocked on A16” label is superseded
by actual A16 closure, without rewriting those historical observations.

This implements the first bounded slice specified by the adopted
[sovereign migration plan](sovereign-continuity-migration.md#first-bounded-implementation-after-acceptance):
append/load one immutable object, deterministic SHA-256, explicit supersession,
offline restart recovery and conflict-preserving projection. Success means those
properties are demonstrated on selected public synthetic question records.

This is a strict profile of the existing [logical object contract](sovereign-continuity-substrate.md),
not a replacement model or a migration of the canonical Architect session ledger.
No ARC-SES identifiers are allocated or reconstructed.

## Existing primitive inventory and owning surface

`runtime/arcanum-runtime/src/development_memory.rs` owns this tranche. It reuses
A16's SHA-256 implementation, the existing locked `fs2` dependency and its durable
file/locking pattern. It adds no cryptography or dependency. It does not change
A16's signed receipt ABI, custody, operation store, legacy Tempus store or Android
integration. Its independent namespace is:

```text
<trusted root>/architect/continuity/public-questions.v1/
  lock
  pending/<sha256(object_id UTF-8)>
  objects/<sha256(object_id UTF-8)>
```

## Restricted question profile

`PublicQuestion` maps to `arcanum.node.continuity-object/v1` as follows:

| Logical dimension | Supported representation |
| --- | --- |
| Identity | caller object_id, subject_id; type question; schema version 1 |
| Namespace | architect/continuity only |
| Claim class | observation, report, inference, proposal, unknown |
| Time | occurred_at optional; observed_at, recorded_at and capture time explicit; UTC whole seconds only |
| Remaining temporal fields | effective_from/until, sequence dimensions and tempus_anchor_ref are null |
| Custody | public snapshot, retention_authorized true after host grant check, supplied retention reference, replication none, do_not_export true, encryption_required false |
| Provenance | exactly one source with kind, identity, optional revision/digest, capture time and evidence class |
| Authority | authority_class none, authority_refs empty; six independently supplied effect states and their evidence refs; established_at omitted |
| Payload | record_id equals subject_id; statement and question status |
| Relationships | zero or one supersedes edge with target_object_id and mandatory basis_ref |

The explicit namespace/disclosure/encryption inputs reject private Hope/Journey,
private-local, architect-development, shared-project, public-candidate and required
encryption before writing content. This is a plaintext public-fixture foundation,
**not a protected private-memory backend**. A caller can mislabel text; classification
and grant authenticity remain obligations of the trusted host policy. There is no
production grant resolver or public/native ingress in this tranche.

`RetentionPolicy` is a trusted host-supplied capability boundary evaluated for the
exact record and digest on retain, read and supersede. A stored reference or effect
state never grants authority. Read permission is rechecked after restart; resume
rechecks retention; supersession also requires access to the target and a separate
policy decision for the exact source/target relationship. Revocation fails closed.
There is no provider export method. Public classification is not an export grant.

## Canonical storage profile v1

The [JSON fixture](fixtures/a17-v1/question.json) is validated against the adopted
logical JSON Schema. The durable encoding is a separate closed binary profile:
`ARCANUM-A17-PUBLIC-QUESTION-V1` followed by NUL, then the fields in this order:

1. object_id, subject_id, claim;
2. optional occurred_at, observed_at, recorded_at, retention_authority_ref;
3. provenance kind, reference, optional revision, captured_at, optional 32-byte digest, evidence class;
4. six effect slots in proposed/ratified/authorized_for_effect/executed/verified/canonicalized order, each state plus evidence-ref vector;
5. statement, question status, optional supersession target and basis.

Strings are u32 big-endian byte length followed by UTF-8. Optional values have a
single 0/1 byte. Enum tags are zero-based in schema order: claims observation/report/
inference/proposal/unknown; states established/not-established/unknown/not-applicable;
source kinds local/human/github/notion/google-drive/vercel/model-provider/imported-file/other;
question status open/accepted/rejected/deferred/superseded/resolved. Evidence-ref
vectors use a one-byte length followed by strings. Unsupported/extra bytes fail.
Fixed profile fields above are implicit and reconstructed; private variants have no encoding.

SHA-256 covers the complete canonical profile bytes, excluding the digest itself.
It is **not** a claim of JSON canonicalization or compatibility with another profile's
digest. The file appends that 32-byte digest. Golden bytes/digest and an independent
Python encoder freeze this contract. The runtime decoder re-encodes and compares.
A future format needs a new profile/version rather than silently changing these bytes.

Bounds: 256-byte identifiers with the logical identifier grammar; 4096-byte text
fields; at most 16 distinct refs per effect; 64 KiB encoded object; 1024 objects plus
pending entries. All counts/lengths are checked before unbounded allocation.
Identifiers are hashed into filenames, never interpolated as paths.

## State and recovery

Append authorizes retention, acquires an OS advisory exclusive lock, checks identity
and target relationship, creates a pending file exclusively, writes bytes/digest,
flushes file and pending directory, renames to objects, then flushes both directories.
Cooperating threads/processes use the same lock. The guard explicitly unlocks on drop,
including error paths and descriptors briefly inherited during subprocess startup.

| Observed durable state | Behavior |
| --- | --- |
| No matching object/pending file | NotFound; no claim about any external operation |
| Pending file | load/append report Pending; no replay with newly supplied bytes |
| Complete valid pending file | explicit resume may publish those exact original bytes after fresh authorization |
| Partial/corrupt pending file | resume blocks; original bytes remain for diagnosis |
| Valid committed file | load validates digest and identity; identical append is idempotent |
| Conflicting bytes under one identity | Conflict; original retained |
| Both pending and committed locations | Corrupt; neither overwritten |
| Storage error after publication may have occurred | outcome uncertain; inspect original identity before retry |

Open/load never auto-resume or reset. Read operations take the advisory lock and may
create the empty lock file; they do not publish content. An explicit resume of an
already committed object returns its verified original digest. File hashes detect
accidental corruption, not owner tampering that recomputes hashes, malicious parent
paths, whole-root rollback, or hardware failure. The host must supply an existing
protected root and exclude hostile filesystem owners; static symlink/nonregular-file
checks are not a race-proof sandbox. New Unix directories/files use 0700/0600.

## Derived projection

`project(subject)` rebuilds history from source objects; no durable index is trusted.
Output history and active IDs sort by object ID, not timestamp or authority rank.
Every source is integrity/read checked. Any pending transaction blocks the global
view rather than presenting partial history as current. Missing supersession targets,
cross-subject edges, cycles or corrupt files fail visibly.

Only an explicit authorized supersession hides its target from the active candidate
set. It never removes the target from history. Multiple remaining candidates are
marked unresolved even when text happens to agree. The view does not choose a winner
by recency, status, source kind, geometry or a self-declared effect state. Pending or
unknown execution claims retain their original independent state.

## Retention, deletion and remaining A17 gates

This tranche has no delete API, private ingestion, blob retention, context/export,
provider adapter, network sync, chain witness, model call or Android UI/JNI entrypoint.
It runs synthetic host fixtures only. File removal by an external actor is not an
implemented deletion workflow; a completely removed unrelated object cannot be detected
without a later authenticated manifest/tombstone design.

Before admitting real private development content, freeze and implement protected
custody, host grant issuance/revocation, retention limits and explicit deletion semantics.
Deletion must cover bodies and derived indexes, leave a minimal separately authorized
anti-resurrection marker where required, and reject replay of deleted identities;
filesystem backup/rollback limits must remain explicit. That design is a next gate,
not an implemented or ratified erasure guarantee in this profile.

Later A17 tranches must add the needed typed development notes/decisions/receipts,
selected context with source/evidence class and destination preview, separate disclosure
authorization, Android/native integration and physical multi-operation restart/update/
deletion acceptance. A18 consumes that selected context only after its own gate.
No A17 closure, merge, production installation or private-data retention is claimed here.
