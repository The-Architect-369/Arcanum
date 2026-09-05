---
title: "CE-W02 Android Runtime Bridge"
status: implementation-candidate
visibility: public
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W02"
tranche: "W02.3"
layer: "Application / Local Runtime"
authority: "implementation-facing boundary; does not amend doctrine, identity, governance, economy, Treasury, or protocol authority"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/42"
---

# CE-W02 Android Runtime Bridge

## Purpose

W02.3 establishes the first native Android ↔ Rust boundary without exporting the internal runtime domain model.

The bridge is intentionally smaller than `arcanum-runtime`. It proves that the Android host can load a Rust JNI library, confirm a versioned ABI, inspect an explicit capability ceiling, and traverse the existing factual local Tempus clock path.

It does not implement the W02.4 offline lifecycle.

## Position

```text
Android presentation
        |
        | three primitive JNI probes
        v
arcanum-android-jni       mechanical FFI shim
        |
        | safe Rust calls only
        v
arcanum-android-bridge    safe host facade
        |
        | safe Rust call
        v
arcanum-runtime
        |
        +-- SystemClockProvider
        +-- capture_tempus_anchor(...)
```

Neither adapter crate is a canonical domain module. The runtime remains the source of Tempus semantics.

## Safety boundary

Rust's current language model treats `no_mangle` as an unsafe attribute because exported linker symbols occupy a global namespace. W02.3 therefore does not make the false claim that a JNI-exporting crate can simultaneously forbid all unsafe code.

Instead:

- `arcanum-android-bridge` is the safe host facade and retains `#![forbid(unsafe_code)]`;
- `arcanum-android-jni` is a mechanical `cdylib` shim;
- the JNI shim uses exactly three explicit `#[unsafe(no_mangle)]` attributes;
- the JNI shim contains no unsafe block and no unsafe function;
- the `JNIEnv` and receiver pointers are opaque and are never dereferenced;
- no runtime domain object crosses JNI.

This isolates the unavoidable linker-level proof obligation from runtime/domain logic.

## Bridge ABI v1

The Android library name is:

```text
arcanum_android_jni
```

The complete JNI surface is exactly:

```text
nativeAbiVersion() -> Int
nativeCapabilityMask() -> Long
nativeTempusClockProbe() -> Int
```

The shim delegates all behavior to the safe facade.

## Capability ceiling

The only allowed bridge capability is:

```text
tempus-system-clock-probe
```

The capability mask is exactly `1`.

Absent capabilities include persistence read/write, receipt creation, signing, private-key export, networking, protocol submission, authority, governance weight, and economic entitlement.

A bridge implementation that returns any undeclared capability bit fails closed at the Kotlin contract boundary.

## Tempus probe

`nativeTempusClockProbe()` delegates through the safe facade and must traverse:

```text
SystemClockProvider
  -> capture_tempus_anchor(...)
  -> TempusAnchor contract validation
```

The probe:

- does not persist the anchor;
- does not return the anchor to Android;
- does not collect participant location;
- does not request network data;
- does not create a receipt;
- does not sign;
- does not submit a protocol fact;
- has `authorityEffect = none`.

The fixed probe anchor identifier is diagnostic only and creates no identity, relationship, capability, recognition, or authority.

## Presentation independence

Bridge availability is informational.

A missing or failed bridge may disable future runtime-dependent actions, but it does **not** suppress, authorize, reinterpret, or mutate canonical geometry. The W02.2 renderer continues to own geometric fail-closed behavior independently.

The host shows only a bounded bridge status label. It does not expose raw runtime structures.

## Native build evidence

The JNI shim is cross-compiled for:

- `arm64-v8a`;
- `x86_64`.

W02.3 pins the CI Rust toolchain to `1.98.1` and `cargo-ndk` to `4.1.2`. The toolchain pin is part of the falsifiable contract so rustfmt, clippy, linker behavior, and Android cross-compilation do not depend on a moving `stable` alias.

Generated `.so` files are build artifacts and are not committed.

CI must verify all three JNI symbol names in each ABI library, then assemble the Android debug APK and verify both libraries are packaged.

## W02.4 boundary

Deferred to W02.4:

- TempusAnchor persistence;
- TempusAnchor read/recovery;
- local receipt presentation;
- offline lifecycle UI.

Adding those operations requires a separately reviewed safe host facade extension and new falsification evidence. They are not implied by the W02.3 ABI.

## Falsification

W02.3 reserves F37–F44:

- **F37** — separate safe facade, mechanical FFI shim, and closed machine contract;
- **F38** — safe facade plus exactly three auditable unsafe linker attributes, with no unsafe blocks/functions or pointer dereference;
- **F39** — explicit one-bit capability ceiling;
- **F40** — probe traverses the existing runtime Tempus path;
- **F41** — Android loads only the declared JNI library and exact native methods;
- **F42** — bridge status cannot gate or mutate geometry;
- **F43** — deterministic pinned-toolchain cross-ABI symbol and APK evidence;
- **F44** — geometry-free/authority firewall and W02.4 deferral.

F1–F36 remain inherited. Earlier tranche verifiers must accept later CE-W02 verifier extensions as an ordered prefix rather than requiring the historical root command to remain terminal forever.
