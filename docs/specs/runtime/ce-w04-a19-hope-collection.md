# CE-W04-A19 — Hope collection and temporal recall

Status: first-tranche implementation candidate. This contract implements the Human-agreed collection rules in Rust; it does not close A19, CE-W04 or any storage/device gate. Controlling implementation: `runtime/arcanum-hope-runtime/src/collection.rs`. Shape schema: `ce-w04-a19-hope-collection.schema.json`.

## Scope and ownership

The `collection` module provides in-memory Save, Browse, Recall, Archive, Restore and confirmed Delete. It retains the existing `hope.reflection.v0.1` serializer and record semantics. Existing APIs remain available. Android owns protected persistence, key custody, migration and UI. The storage/native tranche adds these integrations without adding model or network access.

The host supplies a unique opaque reflection ID and a positive retained-entry capacity. IDs have no identity, governance or economic meaning. A saved entry owns its exact canonical reflection JSON, original capture string, numeric instant sort key, monotonic insertion sequence, visibility and visibility generation. No mutable record access or edit operation is exposed.

## Save and chronology

Save validates the existing reflection inputs and the capture-time profile below. It rejects duplicate IDs, including retired IDs, rather than replacing their records. Entries begin active. A failed validation, capacity check or counter increment leaves committed in-memory state unchanged. Active and archived entries both count toward host-selected capacity; there is no silent eviction or expiry. This is an entry-count guard, not a memory/disk quota or an out-of-memory recovery guarantee.

Browse returns oldest recorded instant first, using insertion sequence to break ties. Sequences start at zero, advance only for successful saves, never renumber on deletion, and do not claim external causal order. Reversed device clocks leave capture strings untouched; the timestamp view and insertion sequence can therefore disagree. Equivalent offsets sort as the same instant. Equal instants preserve insertion order even when their strings use different fractional precision or offsets.

The capture-time profile accepts years0001–9999, valid Gregorian dates, uppercase `T`, seconds00–59, optional1–9 fractional digits, and `Z` or numeric offsets with hours00–23 and minutes00–59. Unknown offset `-00:00`, leap seconds, timezone-less strings, invalid dates, lowercase separators and trailing characters fail explicitly. No timestamps are silently normalized in stored content. This matches ordinary Android `Instant` capture and supports explicit known offsets. Unsupported legacy timestamps must remain a visible, nondestructive migration case in the later storage tranche, never be rewritten to force import. Original Tempus fields and factual `system-clock` source semantics are preserved by the existing reflection serializer.

## Archive, restore and privacy

`recall` and `browse` return only active entries. Deliberate archive access uses `recall_archived` and `browse_archived`. Archive/restore changes visibility and increments a private generation counter without changing ID, exact reflection JSON, capture time or insertion sequence. Repeating the current state is an idempotent no-op. Restoring a deleted/missing ID fails.

These methods make no model request and grant no disclosure or synchronization permission. The host must restrict all future Hope model-context selection to the proper active, consented scope. An archive state does not itself implement a model-access control system.

Collection, entry and pending-deletion Debug output is a fixed private-data placeholder. Error diagnostics contain only static categories, not bodies, IDs, timestamps, hashes or counts. Explicit record getters and the private snapshot API are sensitive participant/storage data, never Architect diagnostics.

## Deletion selection and confirmation

`prepare_delete(id, view)` requires the entry to exist in the selected active/archive view. It returns an opaque, process-local selection bound to this collection instance, entry ID, sequence and visibility generation. `delete(selection, DeleteDecision::Confirm)` consumes that selection. Cancel makes no change. A different collection, removed entry or intervening visibility transition invalidates it; even an archive/restore round trip requires a fresh selection. Multiple independently prepared confirmations cannot reapply a completed deletion.

The host must display and obtain the participant's deliberate decision for this selection. The enum is a caller assertion, not authentication, proof of human presence or permission minted by Rust. Collection-instance binding is an in-memory capability check, unrelated to the person's identity or ChainCode; pending confirmations cannot be restored across application restart.

Successful deletion removes retained body, capture metadata and state, keeping only the protected retired-ID suppression set. Retired IDs cannot be reused by Save. That set and insertion-counter gaps remain private metadata. The protected-store tranche encrypts and persists that set and fails new writes at its size limit. The implementation does not claim secure memory erasure, forensic flash erasure or deletion from independent backups.

## Private snapshot shape

`private_snapshot_json()` emits `hope.collection.v0.1` plaintext only for an explicitly protected storage boundary. It is not called automatically, a public export, a diagnostic or an encrypted on-disk format. The Rust decoder validates this interchange; Android wraps it and its original receipts in a protected envelope. Never send this payload to Architect evidence or models; tests emit only deliberately synthetic fixtures.

The shape contains `version`, decimal-string `nextSequence`, `entries` in insertion-sequence order and lexically sorted `retiredIds`. Each entry contains ID, unchanged `createdAt`, decimal-string `sequence`, active/archive `state` and its exact canonical `reflectionJson` encoded as a JSON string. Decimal strings avoid loss of u64 precision in JavaScript consumers. Transient visibility generations, instance bindings and UI confirmations are not persisted by this shape.

The JSON schema checks structure and primitive constraints. The Rust decoder additionally rejects out-of-u64-range counters, duplicate entry IDs/sequences, inconsistent entry/embedded-reflection IDs or times, malformed embedded reflections, a next counter not above retained sequences, and overlap between retained/retired IDs. `reflectionJson`'s media-type annotation is not semantic validation. A persisted generation is unnecessary while all old confirmations are invalidated on reconstruction; new entries can begin with a fresh in-memory generation.

## Verification and subsequent gates

Synthetic tests cover three independent reflections; whitespace/Unicode/escaping and factual provenance; duplicate/blank input rejection; equal, offset and reversed timestamps; calendar edge cases; archive/restore; selected-view deletion, cancellation, stale/cross-collection confirmations and replay rejection; retired-ID suppression; capacity and counter exhaustion; and redacted Debug/errors. An emitted synthetic snapshot is parsed and validated against the schema separately.

Run focused formatting, Clippy and tests on the default and declared minimum Rust versions. The existing record tests remain applicable. Source/index lineage and repository checks precede adoption. Passing these tests does not establish encryption, persistence, capacity/write-interruption recovery, migration, phone restart/update behavior or native screens.

Next tranche: implement and verify protected storage, truthful migration of the real surviving reflection and nondestructive recovery. A19 later requires S23 evidence that three synthetic reflections and states survive restart and compatible update, deletion remains effective, and corruption/unavailable keys are visible without auto-reset. Portable backup, compression selection, A20 navigation and everyday-phone migration remain separately bounded.


## Protected storage and migration

`HopeCollectionStore` serializes read/modify/write across instances and cooperating processes with an app-private file lock. Rust owns validation, ordering, archive state, retired IDs and collection mutations. The narrow JNI command accepts private snapshots; Android supplies an encrypted wrapper containing the snapshot, original local receipts, and a random revision. Confirmed deletion binds to that revision and selected view; any intervening mutation invalidates the confirmation.

A pinned serde_json dependency and tracked Cargo locks support validating embedded records and snapshots. Records are semantically compared to the existing serializer while their original string bytes remain unchanged. Reconstruction checks counters, duplicate sequences/IDs, record/index binding, visibility state and retired-ID overlap. Codec and storage errors are static; state/receipt Debug/toString are redacted. All IDs, receipts, times, membership and revision remain inside AES-GCM encryption. Files expose format/presence and ciphertext size, not a plaintext record index.

The collection uses one envelope at `hope/collection.v0.1.enc`, with its path bound into authenticated associated data. It reuses the existing device-local Hope key. Opening existing data only looks up the key; it never creates a replacement. Ciphertext authentication failure, unsupported format, missing initialized files and missing/unusable keys preserve files and surface separate recovery states. A protected-store write uses a synced temporary file, atomic replacement and parent-directory sync. Its acknowledgment follows exact reopen/validation. A failure after rename is an uncertain save, reconciled by reopening before retry; no automatic replay occurs.

Migration authenticates and validates the surviving legacy state, preserves its exact reflectionJson and receipt, writes/reopens the new collection, then removes legacy and temporary copies. The presence-only initialized marker is durably created before the first collection write. If interrupted before that write, the legacy copy remains readable but normal collection opening fails closed; deliberate recovery is required, never automatic legacy reimport. Interruptions before the marker can retry normally. Once a collection exists, it is authoritative and cleanup can retry without duplication. A missing collection with an initialized marker never reimports a legacy leftover. This intentionally favors preservation over automatic reconstruction at an ambiguous first-write failure.

Limits: 10,000 retained entries and 16 MiB encoded plaintext, including encrypted receipts and retired-ID suppression metadata. No eviction. A single-envelope corruption affects the whole vault. Compression, portable backup, remote custody and recovery-key export remain deferred. Archive hides entries from ordinary recall; explicit archive browsing permits restore or confirmed deletion. No model receives these records.

## Isolated device qualification

A19 qualification uses `org.arcanum.nativehost.a19qualification`, versions 35 and 36 signed by the same development certificate. Production package/version defaults are unchanged. The phased `HopeCollectionAcceptanceTest` operates only in that package and a dedicated synthetic subtree/key namespace. Seed, migration, restart verification, compatible update verification, active/archive deletion, and interruption/recovery tests are selected explicitly; setup phases refuse to overwrite existing fixtures. Do not run every phase indiscriminately or clear application data. Real personal-phone migration is separate from synthetic qualification.
