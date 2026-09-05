---
title: "Android Tempus Offline Lifecycle — CE-W02 W02.4"
status: implementation-candidate
visibility: public
last_updated: 2026-09-05
description: "Bounded Android/Rust offline Tempus capture, persistence, recovery, and local receipt presentation contract."
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W02"
tranche: "W02.4"
authority: "implementation-facing; authorityEffect=none"
---

# Android Tempus Offline Lifecycle — CE-W02 W02.4

## Purpose

W02.4 binds the native Android host to the already-certified local Tempus runtime lifecycle without widening the W02.3 three-probe bridge or allowing persistence, time, receipts, or UI geometry to create authority.

Canonical base: `main@81262baa366d151a941c496356f49a42bd49603e`.

## Top-down boundary

```text
standard Android lifecycle controls
        ↓
Android app-private filesDir
        ↓
separate W02.4 JNI library
        ↓
safe W02.4 Rust lifecycle facade
        ↓
SystemClockProvider → capture_tempus_anchor
        ↓
FileTempusAnchorStore.persist
        ↓
FileTempusAnchorStore.load / exact round-trip
        ↓
SHA-256(exact persisted anchor bytes)
        ↓
create_tempus_local_receipt
        ↓
explicitly unsigned scope=local presentation
```

The W02.3 `arcanum_android_jni` ABI remains unchanged at exactly ABI version, capability mask, and system-clock probe.

## Storage ownership

The Android host supplies only its app-private `filesDir` as the storage root. Rust opens the certified `FileTempusAnchorStore`, which owns the `tempus/` namespace and anchor encoding. Kotlin does not serialize, rewrite, or persist `TempusAnchor` fields.

Kotlin may retain one opaque `anchorId` in private `SharedPreferences` solely so the host can request Rust recovery after restart. No captured timestamp, digest, receipt, signing reference, private key, or runtime domain object is persisted by that preference surface.

## Capture and persistence

A participant-visible **Capture local Tempus** button requests a factual system-clock anchor. Rust:

1. creates a bounded local anchor identifier;
2. calls the existing `SystemClockProvider -> capture_tempus_anchor(...)` path;
3. validates the result remains location-free, uninterpreted, and system-clock sourced;
4. persists through `FileTempusAnchorStore`;
5. immediately reloads the same anchor and requires exact equality;
6. reads the exact durable anchor bytes and computes SHA-256 over those bytes;
7. creates a local receipt through the existing runtime receipt API.

No network is required or permitted by this lifecycle.

## Receipt semantics

W02.4 does not select or export a production signer. It invokes the existing receipt service with an explicitly unavailable signer. Therefore the presented receipt is required to satisfy:

```text
scope = local
signed = false
signerRef = absent
signature = absent
protocolFinality = false
authorityEffect = none
```

The receipt's `contentDigestSha256` is the SHA-256 digest of the exact persisted anchor file bytes after the successful store/load round-trip. W02.4 does not persist the receipt itself and recovery does not reissue a persistence receipt.

## Recovery

On host attachment, if Android has an opaque last-anchor ID, the host requests Rust recovery. Rust calls `FileTempusAnchorStore.load(anchorId)` and returns a bounded presentation DTO only after validation.

Missing, corrupt, version-incompatible, or otherwise invalid durable state fails visibly. Recovery **must not** silently capture a replacement anchor.

## JNI boundary

W02.4 uses a second native library, `arcanum_android_tempus_lifecycle_jni`, with exactly two methods:

- `nativeCapturePersist(storageRoot)`
- `nativeRecover(storageRoot, anchorId)`

The library converts Java strings and returns a bounded JSON v1 presentation. No `TempusAnchor`, store, signer, key, runtime capability object, protocol object, governance object, or economic object crosses JNI.

## Presentation firewall

The ARCnet geometry remains independently constructed exactly as before. W02.4 adds ordinary Android `TextView`/`Button` controls as a geometry-free equivalent for lifecycle operation and status.

Geometry does not gate capture, persistence, recovery, receipt state, signing, capability, or authority.

## Capability ceiling

W02.4 adds only local factual lifecycle behavior:

- system-clock capture;
- local anchor persistence;
- local anchor read/recovery;
- local unsigned receipt presentation.

It adds no network, private-key export, signing authority, protocol submission, finality, governance weight, economic entitlement, Vitae recognition, Hope interpretation, or semantic meaning.

## Falsification

W02.4 reserves F45–F52:

- **F45 — inherited bridge immutability:** W02.3's three-probe JNI contract remains unchanged and F1–F44 are carried forward.
- **F46 — certified runtime composition:** capture/persist/load/receipt operations traverse existing runtime contracts rather than recreating them in Kotlin.
- **F47 — durable-byte receipt binding:** the local receipt digest is SHA-256 over exact persisted anchor bytes after exact load round-trip and remains unsigned/local.
- **F48 — fail-closed recovery:** missing or invalid durable state cannot cause replacement capture or silent reset.
- **F49 — app-private storage boundary:** Android supplies `filesDir`; Kotlin persists only an opaque anchor ID.
- **F50 — separate bounded JNI lifecycle:** exactly two W02.4 exports; no runtime domain object crosses the ABI.
- **F51 — presentation/authority firewall:** lifecycle has a standard-control geometry-free surface and `authorityEffect=none`.
- **F52 — deterministic native evidence:** both Android ABIs compile, export the exact symbols, pass tests, and package both W02.3 and W02.4 native libraries.
