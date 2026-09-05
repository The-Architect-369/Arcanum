---
title: "CE-W02 Android Offline Tempus Lifecycle"
status: implementation-candidate
visibility: public
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W02"
tranche: "W02.4"
layer: "Application / Local Runtime"
authority: "implementation-facing local lifecycle boundary; does not amend doctrine, identity, governance, economy, Treasury, or protocol authority"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/42"
---

# CE-W02 Android Offline Tempus Lifecycle

## Purpose

W02.4 binds the native Android host to the certified local Tempus persistence boundary without
widening W02.3's three-probe bridge and without requiring network or protocol finality.

The tranche owns four factual local behaviors:

1. capture one system-clock `TempusAnchor` for a fresh native-host lifecycle;
2. persist and immediately reload that anchor through `FileTempusAnchorStore`;
3. construct and present a visibly local unsigned receipt after persistence succeeds;
4. recover the persisted anchor by explicit opaque ID on a later host start.

This is not a signing, synchronization, witness, submission, or finality tranche.

## Inherited boundary

F1–F44 remain controlling. In particular:

- CE-W01 owns Tempus anchor semantics, persistence invariants, and local receipt semantics;
- W02.1 owns projection;
- W02.2 owns native geometric rendering;
- W02.3 owns its exact primitive JNI v1 bridge and one-bit clock-probe capability.

W02.4 does not modify the W02.3 Rust facade or W02.3 JNI crate. It adds a separate lifecycle
facade and lifecycle JNI library.

## Local lifecycle sequence

### Fresh host start

```text
Android MainActivity
  -> TempusLifecycleCoordinator
  -> no last-anchor pointer exists
  -> generate opaque UUID anchor ID
  -> pass filesDir + anchor ID to lifecycle JNI
  -> safe Rust lifecycle captures through SystemClockProvider
  -> FileTempusAnchorStore.persist(anchor)
  -> FileTempusAnchorStore.load(anchorId)
  -> require loaded anchor == captured anchor
  -> SHA-256 digest over the factual clock-anchor content
  -> create_tempus_local_receipt(...)
       signing provider = unavailable
       scope = local
       signed = false
  -> return bounded presentation line
  -> Kotlin stores only the opaque anchor ID pointer
```

The pointer is navigation metadata, not canonical Tempus content. The factual anchor remains
Rust-owned in the `tempus/` namespace beneath Android app-private `filesDir`.

### Later host start

```text
read opaque last-anchor ID
  -> lifecycle JNI recover(filesDir, anchorId)
  -> FileTempusAnchorStore.load(anchorId)
  -> validate clock-only Tempus contract
  -> present recovered/local state
```

If recovery fails, the host surfaces the failure and does **not** remove the pointer or silently
create a replacement anchor. Corruption, missing state, or version mismatch therefore remains
visible.

## Storage boundary

Android supplies `Context.filesDir.absolutePath` as the root. W02.4 does not use external storage,
shared media storage, network storage, or a Kotlin copy of the anchor.

`FileTempusAnchorStore` remains the only anchor persistence implementation used by this tranche.
Its existing immutable-ID, checksum, size-bound, version, clock-only, and no-location constraints
remain controlling.

Kotlin `SharedPreferences` stores exactly one opaque last-anchor ID so the host can request recovery.
It must not store serialized anchor content, receipt content, private key material, or a second
source of temporal truth.

## Capture boundary

Factual time comes only from the certified runtime `SystemClockProvider -> capture_tempus_anchor`
path. Kotlin UUID generation supplies an identifier only; it is not a timestamp or source of
Tempus meaning.

W02.4 collects no participant location and performs no ephemeris capture.

## Receipt boundary

After successful persist+reload equality, the safe lifecycle facade computes SHA-256 over a stable
length-prefixed representation of the clock-anchor content and passes that digest to the existing
`create_tempus_local_receipt` runtime function.

The W02.4 signer implementation always returns `SigningFailure::Unavailable`. Therefore the receipt:

- has `scope = local`;
- is unsigned;
- exposes no signer/key material;
- does not grant capability or identity;
- is not an ARCnet witness, transaction, submission, or finality claim.

W02.4 presents this receipt immediately after persistence. It does **not** add durable receipt
storage. The deeper restart/local-receipt proof remains in CE-W04.

## JNI boundary

The new safe crate is `runtime/arcanum-android-lifecycle` and retains `#![forbid(unsafe_code)]`.
It depends on `arcanum-runtime` and pinned `sha2` only.

The new FFI crate is `runtime/arcanum-android-lifecycle-jni`. It alone depends on pinned `jni` and
contains four explicit linker exports:

- lifecycle ABI version;
- lifecycle capability mask;
- capture+persist presentation;
- recovery presentation.

Managed strings carry only app-private root path, opaque anchor ID, and a bounded presentation
line. No `TempusAnchor`, receipt object, signing handle, private key, capability object, or protocol
object crosses JNI.

## Presentation and geometry firewall

Runtime bridge status and lifecycle status are rendered before canonical geometry is evaluated.
A projection failure therefore cannot suppress local runtime truth.

Conversely, lifecycle availability, persistence state, receipt state, screen position, animation,
draw order, overlap, or geometric proximity cannot create capability, authority, recognition,
governance weight, economic entitlement, or protocol finality.

Every lifecycle presentation line includes `authorityEffect=none` and remains understandable
without ARCnet geometry.

## Failure semantics

W02.4 preserves bounded technical categories:

- invalid-input;
- provider-unavailable;
- not-found;
- storage-unavailable;
- integrity-failure;
- version-incompatible;
- receipt-failure.

Paths, private content, key material, and internal domain objects are not echoed into the Android
presentation string.

## Build evidence

The dedicated W02.4 workflow pins:

- Ubuntu 22.04;
- JDK 17;
- Android SDK 35 / build-tools 35.0.0;
- Android NDK 27.2.12479018;
- Rust 1.98.1 with rustfmt + clippy;
- cargo-ndk 4.1.2.

It verifies F45–F52, formats/lints/tests the safe lifecycle crate, formats/lints the lifecycle JNI
shim, cross-compiles both W02.3 and W02.4 native libraries for `arm64-v8a` and `x86_64`, verifies
exported symbols, runs Android unit tests/debug assembly, and proves both libraries are packaged in
the APK for both ABIs.

## Falsification range

- **F45** — separate lifecycle boundary and inherited F1–F44.
- **F46** — app-private storage ownership and opaque host pointer only.
- **F47** — canonical system-clock capture with no duplicate temporal or location semantics.
- **F48** — persist/load equality plus fail-closed explicit recovery.
- **F49** — actual local unsigned receipt construction after persistence.
- **F50** — bounded managed-string lifecycle JNI; W02.3 primitive JNI remains unchanged.
- **F51** — geometry-independent presentation and authority firewall.
- **F52** — deterministic cross-ABI/native/APK evidence and no network/protocol expansion.

## Explicit non-goals

W02.4 does not add signing keys, Android keystore integration, receipt persistence, networking,
peer sync, protocol submission/finality, ephemeris persistence, application entitlement,
governance, economics, Hope/Vitae expansion, or a new interpretation of geometry.
