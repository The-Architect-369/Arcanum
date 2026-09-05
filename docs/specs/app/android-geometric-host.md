# ARCnet Android Geometric Host

Status: implementation-candidate  
Construction Era: CE-W02 / W02.2  
Authority effect: none

## Purpose

The Android geometric host is the first native ARCnet presentation surface. It renders the
certified CE-W01 coordinate frame through the ratified W02.1 screen-projection contract
without creating a second geometry source and without introducing runtime/JNI authority.

W02.2 is presentation-only. The Rust/native bridge is intentionally deferred to W02.3.

## Canonical inputs

The Android module consumes these repository-owned files directly as build assets:

- `docs/specs/geometry/arcnet-coordinate-frame.v0.1.json`
- `docs/specs/geometry/arcnet-screen-projection.v0.1.json`
- `docs/specs/geometry/arcnet-screen-projection.vectors.v0.1.json`

The Android tree MUST NOT copy their coordinate arrays or expected screen-space values into
Kotlin source. Gradle exposes the canonical geometry directory as an asset source directory.

## Host topology

`apps/android` is an independent Android/Kotlin leaf application.

- `MainActivity` owns only Android lifecycle entry.
- `ArcnetRendererView` owns Android Canvas presentation.
- `CanonicalContracts` parses repository-owned geometry/projection/vector JSON.
- `ProjectionEngine` implements the ratified model → view → clip → NDC → viewport pipeline.
- no Rust/JNI bridge is present in W02.2.

The shell uses platform `Activity` and `View` APIs and does not require Compose or AndroidX.

## Startup validation and fail-closed behavior

Before any geometry is presented, the host MUST:

1. parse the canonical coordinate-frame registry;
2. parse the projection registry and verify its source-frame binding;
3. require `sourceCoordinatesMutable=false`;
4. require projection `authorityEffect=none`;
5. require `geometryFreeEquivalentRequired=true`;
6. parse the ratified projection vectors;
7. execute the F25 reference samples through the native Kotlin projection engine; and
8. fail closed if any sample differs beyond the canonical vector tolerance.

A failed contract self-check produces an unavailable-state message and no projected geometry.

## Rendering law

Source points are read from the canonical coordinate-frame registry. The host derives visible
geometric edges only by comparing source-space pair distances with each registry-owned
polyhedron edge length.

For each frame:

1. canonical `q` remains immutable;
2. the ratified rigid model transform is applied;
3. the ratified camera basis/view transform is applied;
4. perspective clip coordinates are produced;
5. line segments are clipped in homogeneous clip space before perspective divide;
6. surviving points/segments are mapped to a top-left Android viewport whose dimensions are
   the actual `View` dimensions.

The vertical FOV remains fixed while the horizontal extent derives from runtime aspect ratio.
Screen position, overlap, draw order, depth, visibility, and animation are presentation state
only.

## Authority and capability boundary

W02.2 MUST NOT introduce:

- `android.permission.INTERNET`;
- a network client or synchronization path;
- `System.loadLibrary`, JNI, `external fun`, FFI, or a Rust bridge;
- private-key access, signing, receipt issuance, or secret material;
- protocol finality;
- identity classification;
- capability or permission derivation from geometry;
- governance weight, recognition, readiness, worth, score, or economic entitlement.

Operationally relevant state retains a geometry-free equivalent. Geometry and projection have
`authorityEffect=none`.

## Build evidence

The repository-level verifier `scripts/verify-ce-w02-native-shell.py` checks the source,
ownership, manifest, asset, and authority boundaries using only Python stdlib.

`.github/workflows/verify-android-native.yml` performs an independent Ubuntu Android build:

- JDK 17;
- Android platform/build tools 35;
- Gradle 8.9;
- `testDebugUnitTest`;
- `assembleDebug`.

The native unit tests read canonical JSON from the repository root. They do not contain a
second set of expected projection coordinates.

## W02.2 falsification range

- **F31 — canonical asset ownership:** Android consumes repository-owned geometry/projection
  JSON directly; Kotlin source contains no copied source-coordinate or expected-screen registry.
- **F32 — native vector fidelity:** the Kotlin projection engine must satisfy ratified F25
  samples before rendering.
- **F33 — projection implementation boundary:** runtime viewport aspect and homogeneous segment
  clipping are implemented without mutating source geometry.
- **F34 — authority firewall:** native presentation preserves `authorityEffect=none` and the
  geometry-free requirement.
- **F35 — host capability ceiling:** manifest/source contain no network, JNI, signing, or
  protocol-authority surface.
- **F36 — independent native build:** Android unit tests and debug assembly compile in the
  dedicated CI workflow.

## Exit condition

W02.2 is complete when F31-F36 are green, the Android CI build succeeds at an exact source
commit, the deterministic repository index is regenerated from that source commit in a
separate companion commit, and the tranche is promoted to canonical `main`.

W02.3 may then introduce the narrow Rust/native bridge without changing this projection law.
