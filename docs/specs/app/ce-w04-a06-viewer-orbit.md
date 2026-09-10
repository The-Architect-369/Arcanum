---
title: "CE-W04-A06 Viewer-Only Orbit + Bounded Motion Foundation"
status: implementation-candidate
visibility: public
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W04"
arc: "CE-W04-A06"
last_updated: 2026-09-10
maintainer: The-Architect-369
authority: "Implementation contract only; no Genesis, governance, identity, or protocol authority"
---

# CE-W04-A06 — Viewer-Only Orbit + Bounded Motion Foundation

## Purpose

Introduce the first bounded viewer-transform state for Seed Node Alpha without mutating canonical geometry, protected Hope state, Tempus state, identity, receipts, capability state, governance state, or protocol state.

A06 begins from the physically audited A05 static embodiment and preserves A05 as the exact neutral visual state.

## First tranche — A06.1 pure viewer state

The first A06 tranche establishes a pure `ViewerOrbitState` and `ViewerOrbitReducer` before touch input or animation is attached.

State is limited to:

- yaw in degrees;
- pitch in degrees;
- viewer zoom scalar.

The reducer accepts only:

- bounded drag deltas;
- bounded positive zoom factors;
- exact reset to the neutral state.

## Second tranche — A06.2 viewer-transform rendering integration

A06.2 threads `ViewerOrbitState` through the native projection/rendering path as a presentation-only camera transform.

The transform:

- orbits the camera around the canonical projection target;
- derives yaw from the canonical camera up reference;
- derives pitch from the yaw-adjusted camera right axis;
- maps zoom to camera distance without changing model scale or canonical source coordinates;
- returns the inherited canonical `CameraSpec` unchanged when the viewer state is exactly neutral;
- is consumed by both point projection and homogeneous segment clipping;
- is stored ephemerally by `ArcnetRendererView` and triggers only redraw invalidation.

A06.2 does not yet attach Android gestures or animation. Its purpose is to establish a verified mathematical/render boundary before Human motion input is admitted.

## Bounds

The initial bounded viewer envelope is:

```text
yaw: normalized to (-180, 180]
pitch: [-70, 70]
zoom: [0.75, 1.60]
neutral: yaw=0, pitch=0, zoom=1
```

These are implementation bounds, not canonical geometry constants.

## Triple-spine contract

### G — Geometry & Mathematics

Canonical source coordinates, topology, projection reference vectors, and pinned assets are immutable under viewer interaction. A viewer reducer or camera transform cannot own or rewrite any `GeometryPoint.q`, canonical registry, model transform, or source asset.

The required invariant is:

```text
canonical geometry bytes/state before viewer interaction
==
canonical geometry bytes/state after viewer interaction
```

Neutral viewer state must also preserve the inherited projection exactly:

```text
ProjectionEngine.project(q, viewport)
== bitwise
ProjectionEngine.project(q, viewport, ViewerOrbitState.NEUTRAL)
```

### E — Embodiment & Visual Experience

A05 remains the exact neutral orientation. A06.2 permits deterministic non-neutral camera/view projections but no Human gesture path yet. Future gesture attachment must be confined to the `SceneViewportPolicy` scene and excluded from participant controls. Reset must return exactly to neutral rather than approximately to a visually similar state.

### A — Architecture & Technology

Viewer state is presentation-only and has `authorityEffect=none`. It may not write Hope protected storage, Tempus persistence, identity state, receipts, capabilities, governance records, protocol state, or network/model state.

`ArcnetRendererView.setViewerOrbitState(...)` is an in-memory rendering input only. It performs no persistence, authority, network, protocol, or storage operation.

## Explicit exclusions for A06.1–A06.2

These tranches do not yet add:

- Android touch listeners;
- drag/pinch gesture attachment;
- inertia;
- animation timing;
- screen/video recording;
- star-tetrahedron activation;
- geometry mutation;
- camera persistence across process restart;
- network or model calls.

Those may be introduced only after the reducer, projection integration, and inherited invariants are green.

## Acceptance criteria

1. Neutral state is exact and stable.
2. Pitch and zoom are hard bounded in the reducer.
3. Yaw normalization is deterministic.
4. Invalid zoom factors fail closed.
5. Reset restores bitwise-equivalent neutral scalar values.
6. Reducer operations cannot mutate canonical coordinate objects supplied elsewhere in the process.
7. Explicit neutral projection is bitwise-equivalent to the inherited projection path.
8. Non-neutral viewer state changes screen projection/view depth without changing canonical `Vec3` values.
9. Viewer zoom changes camera distance rather than canonical model scale.
10. Segment clipping uses the same viewer camera transform as point projection.
11. `ArcnetRendererView` keeps viewer state ephemeral and redraw-only.
12. Existing CE-W01–A05 geometry, Hope, Tempus, authority, privacy, observer, and repository-index verification remains green.
13. Build provenance remains `versionCode = 6`, `versionName = 0.1.5-cew04-a06`, `ARCANUM_IMPLEMENTATION_ARC = CE-W04-A06` for this Arc.

## Next tranche

After A06.2 is verified, A06 may attach bounded Android gesture input under `SceneViewportPolicy`: one-finger drag for yaw/pitch, pinch for zoom, and exact reset, with participant-control exclusion and geometry-free equivalent controls. Motion evidence remains Human-triggered and local-first.

No A06 work promotes `main` or closes CE-W04 by itself.
