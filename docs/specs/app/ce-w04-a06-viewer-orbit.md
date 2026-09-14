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

A06.2 does not attach Android gestures or animation. Its purpose is to establish a verified mathematical/render boundary before Human motion input is admitted.

## Third tranche — A06.3 bounded Human gesture attachment

A06.3 admits Human input only inside the resolved `SceneViewportPolicy` scene and maps that input into the already-bounded reducer.

The gesture surface is limited to:

- one-finger drag mapped deterministically to yaw/pitch deltas;
- pinch mapped to positive bounded viewer zoom factors;
- double-tap mapped to exact `ViewerOrbitAction.Reset`;
- no gesture acceptance when the initial touch begins outside the current scene viewport;
- no gesture authority over top-bar, Hope, Tempus, or other participant-control regions.

`ViewerOrbitGesturePolicy` owns only deterministic gesture-to-action mapping and scene-point acceptance. It does not own canonical geometry, projection constants, Hope state, Tempus state, identity, receipts, capabilities, persistence, networking, or model calls.

For geometry-free access, the renderer exposes explicit accessibility actions for rotate left/right/up/down, zoom in/out, and exact reset. These actions dispatch through the same `ViewerOrbitReducer`; they do not create a second motion authority path.

A06.3 remains motion-minimal: there is no inertia, fling continuation, cinematic easing, autonomous animation, or persisted camera state.

## Bounds

The initial bounded viewer envelope is:

```text
yaw: normalized to (-180, 180]
pitch: [-70, 70]
zoom: [0.75, 1.60]
neutral: yaw=0, pitch=0, zoom=1
```

These are implementation bounds, not canonical geometry constants.

The initial drag mapping is presentation-only:

```text
0.18 degrees per input pixel
```

Accessibility rotation uses fixed 15-degree reducer actions, while accessibility zoom uses multiplicative 1.15 steps. All resulting state remains subject to the same reducer bounds.

## Triple-spine contract

### G — Geometry & Mathematics

Canonical source coordinates, topology, projection reference vectors, and pinned assets are immutable under viewer interaction. A viewer reducer, camera transform, gesture adapter, or accessibility action cannot own or rewrite any `GeometryPoint.q`, canonical registry, model transform, or source asset.

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

A05 remains the exact neutral orientation. A06 permits deterministic non-neutral camera/view projections and bounded Human manipulation only inside the scene. Participant controls remain gesture-excluded by the same viewport boundary that excludes geometry drawing. Reset returns exactly to neutral rather than approximately to a visually similar state.

The first physical A06 test should validate response, bounds, reset, participant-control exclusion, and accessibility-equivalent actions before any inertia or animation polish is introduced.

### A — Architecture & Technology

Viewer state is presentation-only and has `authorityEffect=none`. It may not write Hope protected storage, Tempus persistence, identity state, receipts, capabilities, governance records, protocol state, or network/model state.

`ArcnetRendererView.setViewerOrbitState(...)` remains an in-memory rendering input only. Touch and accessibility adapters dispatch only `ViewerOrbitAction` values into the reducer and trigger redraw invalidation.

## Explicit exclusions for A06.1–A06.3

These tranches do not add:

- inertia or fling continuation;
- cinematic easing or autonomous animation timing;
- screen/video recording;
- star-tetrahedron activation;
- geometry mutation;
- camera persistence across process restart;
- network or model calls;
- Hope, Tempus, identity, receipt, governance, capability, or protocol mutation.

Those may be introduced only after the bounded reducer, projection integration, gesture exclusion, accessibility actions, and inherited invariants are green.

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
12. Gesture mapping is deterministic and finite-input checked.
13. A gesture can begin only inside the resolved scene viewport.
14. One-finger drag dispatches reducer yaw/pitch actions; pinch dispatches reducer zoom; double-tap dispatches exact reset.
15. Participant-control regions remain outside the accepted gesture surface.
16. Accessibility actions provide rotate, zoom, and exact reset through the same reducer path.
17. No inertia, animation, persistence, network/model, Hope, Tempus, identity, receipt, governance, capability, or protocol mutation is introduced.
18. Existing CE-W01–A05 geometry, Hope, Tempus, authority, privacy, observer, and repository-index verification remains green.
19. Build provenance remains `versionCode = 6`, `versionName = 0.1.5-cew04-a06`, `ARCANUM_IMPLEMENTATION_ARC = CE-W04-A06` for this Arc.

## Next tranche

After A06.3 is verified and physically exercised, A06 may add bounded motion refinement and Human-triggered short motion evidence. Inertia or cinematic animation remains a separate decision and must not be inferred from gesture support alone.

No A06 work promotes `main` or closes CE-W04 by itself.
