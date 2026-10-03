---
title: "CE-W04 A17 — Protected Native Development Memory"
status: implementation-candidate
visibility: public
last_updated: 2026-10-03
authority: "Human-directed A17 implementation and isolated phone qualification; canonical adoption remains separate"
---

# Protected native development memory

The Human requested continuation until A17 is ready to install and test, followed by
that phone test. This tranche extends PR85 from `52cd404dfe92cc47e0b3da6d4c44b27b654a92d3`.
Canonical main remains A16 closure `bfa1ea659937f1fec4216680de81f989bd9961d4`.

## Owning layers and scope

The Rust public-question foundation remains unchanged and separately qualified.
Android owns protected private-record custody, as it already does for Hope, using
platform AES/GCM and a **separate** AndroidKeyStore alias. No private bytes are passed
to the public Rust profile or its signed synthetic A16 JNI surface. This avoids
pretending that A16's signing key or public plaintext store provides encryption.
The new Kotlin module under `nativehost/memory` implements host-local storage and
UI; no JNI ABI or broker command is extended.

The private storage profile `arcanum.architect.private-memory/v1` is an owning-app
format, not a generic import of the sovereign continuity JSON schema. It preserves
selected notes, decisions, questions and evidence with record identity, source,
optional exact revision, evidence class, explicit execution claim, optional occurred
time, actual confirmation/recording time and retention-decision identity. Unknown
execution is retained as unknown; persistence does not verify a claim. Richer
sovereign-object mappings remain explicit future adapters, not silent data conversion.

## Consent and privacy

The Architect dashboard exposes Development memory. Opening observes; explicit setup
creates a dedicated encryption key. New records require selected content/source,
review checkbox, exact-content confirmation and an actual final confirmation time.
No Hope/Journey storage, directory crawling, provider import or automatic transcript
capture is reachable. The only namespace is architect/development.

Recognizable credential patterns and Hope/Journey source paths are rejected. Pattern
matching cannot prove arbitrary prose secret-free: the Human-selected review remains
necessary. No production grant strings are interpreted as tool authority.

UI text is marked private for Architect observation, autofill/personalized keyboard
learning is discouraged, and dialogs use FLAG_SECURE. Android/accessibility/keyboard
and privileged OS behavior remain platform trust boundaries; this is not a guarantee
against a compromised device or an external camera.

## Custody and bounded retention

The store is under `noBackupFilesDir/architect-development.v1`. Android backup is
already disabled for the app. AndroidKeyStore AES-256/GCM uses platform-generated
12-byte IVs, 128-bit authentication tags and the domain AAD
`org.arcanum.architect.development-memory/v1`. Keys are not exported; hardware level
is a provider observation, not independent attestation. Opening missing-key storage
never generates a replacement. No key reset or private-store migration is included.

The closed vault contains generation, up to 64 records, 256 deleted-ID tombstones and
512 minimal audit entries (operation ID, retain/delete/initialize, actual local time).
Record text is at most 4096 UTF-8 bytes; sources at most 512; vault plaintext at most
512 KiB. Capacity is explicit: no background pruning, silent eviction or automatic
upload. Deleted bodies and source metadata disappear from the current logical vault;
encrypted IDs and minimal audit remain to prevent replay and preserve factual action
history. No promise of physical flash erasure or malicious whole-store rollback
resistance is made. Copies/screenshots outside this store are outside deletion scope.

## Transaction protocol

All cooperating writers/readers take a FileChannel advisory lock. Setup writes and
syncs an intent before creating the separate key. A key without a supported setup or
vault is blocked, not silently adopted. Failed setup may be explicitly completed.

Each mutation freezes a complete next vault and the SHA-256 of its exact predecessor
ciphertext into an authenticated encrypted pending envelope. It syncs pending bytes
and the parent directory, creates/syncs an encrypted publication file, atomically
renames it over the current vault and syncs the directory. It then removes pending
and syncs again. No plaintext record is written to disk. No old vault backup is kept.

A pending transaction blocks new retention, deletion and preview. Reconciliation is
explicit: validate pending and predecessor; publish only its original next state.
If the target already equals that exact next state, only finish acknowledgment.
Partial or unauthenticated bytes remain blocked/preserved. No externally effectful
operation is retried. Read state never promotes an execution claim to success.
The trusted app-private root and filesystem owner remain assumptions; static file
checks are not an adversarial-filesystem sandbox.

Deletion commits the body-free next vault and durable tombstones together. Reopen,
compatible update and attempts to reuse the same deleted ID must not restore it.
A deliberate new record with a new ID is a new selected retention, not automatic
restoration. Whole-filesystem rollback/uninstall is outside the stated guarantee.

## Selected context

`arcanum.architect.selected-context/v1` carries exactly the selected records, their
sources/evidence/operation claims, selection decision, vault generation and fixed
destination `local-preview`; authorityEffect is none. Selection is limited to eight
records and 32 KiB, with no silent truncation. Stale generations or deleted IDs fail.
No clipboard, share intent, file export, provider adapter, socket or model call is
attached. The preview itself is the provider-neutral handoff shape for A18; actual
external disclosure needs a future destination-bound review/send path and its own
retention/authority gate. Stored content remains data, never instructions to execute.

## Qualification boundary and sequence

A17 uses `org.arcanum.nativehost.a17qualification`, versions28/29 and one CI-run
signer. The A16 lane explicitly requests its legacy qualification arc and remains
26/27 in its own package. The production package is not updated by this test.

The instrumented class refuses other packages and unbound/mismatched installed
source/arc constants. Individually ordered methods:

1. Observe fresh memory and cancel setup in the UI.
2. Seed three public synthetic records; observe a non-exportable platform key.
3. Force-stop/reopen and verify original multi-record history and unknown/pending claims.
4. Verify exact selected context, absence of unselected notes, and privacy denials.
5. Delete the selected synthetic record; verify stale selection denial.
6. Force-stop/reopen and verify retained tombstone/history.
7. Install the real same-signer version29 update; verify history and reject replay of deleted ID.
8. In separate synthetic stores/aliases, inject interrupted deletion before/after
   publication, corrupt authentication, and remove a test-only key. Preserve the
   demonstration store. These injected boundaries are not physical power-loss proof.
9. Exercise native create/cancel/review/save/selection/deletion navigation and capture
   permitted UI evidence. Secure-dialog screenshots should redact content; do not
   disable protection merely to obtain a readable screenshot.

Fresh runs record their own source/APK hashes/package versions/signer, actual times,
per-method outcomes and evidence limits. No seed or destructive fault is repeated
merely because its acknowledgment is missing. A17 stays open until its implementation,
physical evidence and any remaining limits receive the applicable closure review.
