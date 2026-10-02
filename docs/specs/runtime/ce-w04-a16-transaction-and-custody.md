---
title: "CE-W04-A16 — Transaction recovery and Android credential custody"
status: implementation-candidate
visibility: public
last_updated: 2026-10-02
wave: "CE-W04"
authority: "Human-authorized bounded repository implementation; native provisioning, install, promotion and closure retain separate gates"
---

# Transaction recovery and credential custody

## Authorization and lineage

On 2026-10-02 the Human instructed “Let's preform that implementation now”,
following the proposed A16 transactional recovery and Android custody slice.
This extends draft [PR #84](https://github.com/The-Architect-369/Arcanum/pull/84)
on `work/a16-receipt-foundation-20261002`, starting from the receipt foundation
source `4cd597306fb12a024012d1556ff7449fc4c073f9` and index companion
`2f7c1a947d82e603d5ffda95d04efaf375ab72f6`. Canonical main was
`ad7c75039a6701145e3051ca151ae003f4ca542d` at grounding. The
[foundation specification](ce-w04-a16-local-continuity-receipts.md) and its
[dated evidence](../../evidence/ce-w04-a16-foundation-20261002/review.md) retain
their original qualification scope; this dated extension does not backdate them.

The exact authorized surface is the Rust continuity store, dedicated Android
continuity custody modules, synthetic tests, their inherited lockfiles, CI and
associated specification/evidence/index output. It does not authorize device
provisioning, key replacement on a participant device, installation, merge,
deployment, or A16 closure. No new Human decision is inferred from a signature.

## Rust content/receipt transaction

`FileContinuityStore` takes an app-private root and creates a distinct
`continuity-operations.v1` namespace. `prepare` freezes the canonical A16 message
before storing content; the supplied object digest must match the exact bytes.
Object bytes are bounded to 4 MiB; existing message/wrapper bounds remain 64/66 KiB.
SHA-256 of the operation ID supplies the filesystem component, avoiding caller
path interpretation. Object and operation IDs remain distinct semantic fields.

Every cooperating writer takes a nonblocking OS advisory lock (`fs2=0.4.3`).
Separate instances/processes contend on the same lock; termination releases it.
Transaction files are written with `create_new` to `.partial`, file-synced,
renamed and directory-synced. The staged directory contains canonical message,
object, original signed wrapper, and a versioned manifest binding SHA-256 of all
three. Publication renames the complete directory within the same namespace and
syncs both parent directories plus the namespace. Success requires read-back
verification of the published object/signature/fingerprint/message/manifest.

| Observed state | API result / next bounded action |
| --- | --- |
| No operation | `NotFound`; an explicit caller action may prepare it |
| Frozen message only | `ContentPending`; matching prepare may finish content |
| Message and verified content | `ReceiptPending`; no stored signature is known; caller must reconcile any earlier signing attempt and retain its explicit signing decision |
| Valid staged signature, with or without complete manifest | `PublishPending`; prepare exposes the original wrapper for explicit commit retry without re-signing |
| Complete verified published operation | `Committed`; recover returns the original object and wrapper |
| Unexpected/partial/symlink/oversized/missing/corrupt evidence, or duplicate locations | `BlockedCorrupt`; preserve evidence, no reset or guessed repair |
| Lock contention or I/O unavailable | Error; absence of an acknowledgment does not imply absence of the effect |

Matching retry preserves the first local recording time. All other supplied
semantics—including original producer, occurrence/observation/adoption times,
object identity/schema/digest, credential generation and sources—must match.
Changed content or provenance under the same operation ID conflicts. A second
valid ECDSA signature of the same canonical message/key never replaces the first
stored wrapper. `inspect` classifies without publication; `recover` reads only
committed verified content. These reads may create/acquire the coordination lock
file but do not sign, enroll, publish or repair an operation.

This is a cooperating-writer durability protocol, not protection against the
owner of the private directory, hostile processes, filesystem rollback, or
unqualified storage hardware. File/directory sync and Linux process interruption
are tested; actual power-loss behavior is not certified. Unsupported directory
sync returns an error. A preserved partial write requires a separately designed,
authorized reconciliation procedure. There is no automatic salvage.

**Privacy boundary:** this store writes plaintext. Qualification uses public
synthetic bytes only. It is not connected to Hope/Journey or provider intake, and
must not be wired to private content without that surface's encryption, custody,
selection and consent policy. Even IDs, digests and provenance can be sensitive.
No automatic logs, telemetry, network, export or broad private-store reads exist.

## Android credential lifecycle

`ContinuityCredentialManager` supplies explicit `provision`, generation-bound
`replace`, `completePending`, absence-qualified `resumeAbsentPendingCreation`,
and message-bound `sign` APIs. `recover` never creates, recreates, signs, deletes,
or repairs. These API decisions are caller assertions for future native actions;
no UI, biometric confirmation, Human-presence proof or Rust/JNI wiring is added
in this slice. They confer no global identity, consent, authority or rights.

`AndroidContinuityKeyProvider` uses AndroidKeyStore EC P-256, purpose SIGN only,
digest SHA-256, signing the complete canonical message with `SHA256withECDSA`.
Aliases live exclusively under `org.arcanum.nativehost.continuity.signing.v1`;
publisher signing, broker HMAC and Hope encryption keys are never reused.
Private keys are neither returned nor serialized, exported, copied or deleted.
There is no alternate software-key fallback when AndroidKeyStore is unavailable.
AndroidKeyStore itself may report a software security level. Provisioning records
the observed KeyInfo level and requires null private-key format/encoding; this
observation does not independently prove secure hardware. StrongBox/TEE/software/
unknown remain distinct. User authentication is deliberately not required by
this baseline adapter, so no biometric or per-signature Human-presence claim is
made. Hardware/user-auth qualification remains future device evidence.

The initial alias is fixed, while its generation uses 16 random bytes. A retained
initial key with missing metadata is reported as orphaned, blocking silent fresh
provisioning. If the initial key is also absent, a read-only observation of the
dedicated continuity alias namespace must establish that it is empty. A retained
later-generation key is orphaned; an unavailable namespace is unknown and blocks
provisioning. Other key purposes are neither returned nor interpreted. Replacement selects a fresh alias/generation, retains every old key
and record, and records `previousGeneration` as an explicit discontinuity. It is
not uninterrupted continuity or a migration of private signing material. Complete
erasure of both registry and all platform keys is indistinguishable from a new
installation; a newly provisioned key must not be presented as the erased lineage.
No cross-device restoration or backup import exists.

Before key creation the manager atomically persists an intent containing the
original decision ID/time, generation, alias and previous generation. The Android
storage lives under `Context.noBackupFilesDir/identity/continuity.v1`, holds a
cross-process file lock, and syncs atomic replacement plus parent directories.
The registry has a versioned, bounded, checksummed binary representation; decoding
rejects malformed/noncanonical state, broken history links, duplicate generations
and decision IDs, or key/fingerprint inconsistency. The checksum detects accidental
corruption; it is not authenticated rollback protection. History is logically
append-only, bounded to 128 generations and 64 KiB. No history eviction is implied.

A partial registry file blocks reads and mutations pending separate storage
reconciliation. An error after atomic rename may leave the finalized record in
place: repeat the same original decision to recover it rather than create another
key. When a persisted intent remains, recovery reports both pending generation and
observed pending-key availability. Explicit completion binds an existing qualified
key, preserving the original decision/time and separately recording reconciliation
ID/time. Missing pending keys are not created by completion or recovery. The
separate explicit resume API requires the matching pending generation and a fresh
provider observation that that alias is absent before retrying creation. Unavailable
or invalidated observations do not satisfy absence. No pending-intent abandonment,
key deletion or guessed repair is implemented.

Missing, invalidated, unavailable, mismatched and orphaned credentials remain
visible states. Replacement is permitted only against a recorded current generation
that is ready, missing or invalidated, with a distinct explicit decision. Unknown
provider state and mismatched bindings block replacement. Idempotent original
provision/replacement decisions return the finalized generation rather than repeat
creation. Cooperating calls use the storage lock; hostile direct provider use is
outside this boundary.

Signing copies the input, strictly parses the complete 20-position v1 canonical
CBOR message, and binds operation ID, exact message SHA-256, fingerprint and
current generation to the supplied decision. Unsupported domains/types/algorithms,
nonminimal CBOR, malformed UTF-8, adoption syntax errors, unsorted/duplicate sources,
bounds violations and trailing bytes are rejected. The returned public signature
must have strict minimal DER with in-range scalars and pass independent JCA
verification against the recorded public key before success. Rust's public wrapper
verifier still provides final exact-object and receipt semantics. Signing is not
permission to publish or evidence of factual content truth.

## Qualification and next gate

Linux Rust tests interrupt every completed write/rename/sync boundary, kill a
lock-holding subprocess, race same-ID writers, preserve original signatures and
clocks, and reject conflicting or damaged state. Stable and declared Rust 1.78
run the same suite. JVM tests use ephemeral in-memory JCA keys and injected storage/
provider failures; their `nonExportable` observation is a test double, not Android
KeyStore qualification. They cover initial/replacement pending recovery, lost
acknowledgments, absence-qualified explicit retry, key loss/invalidation/mismatch,
corruption, stale decisions, concurrent callers, strict signing and all three
independent public vectors. CI compiles the platform adapter and packages the
native host through the inherited Android workflow.

Next A16 gates are explicit native consent/action UI, Rust/JNI transaction wiring,
app-private encrypted content policy where applicable, and approved physical
restart/update/key-loss/custody tests on a bound APK/device. Repository verification
and native packaging do not substitute for those gates. A16 remains open.
