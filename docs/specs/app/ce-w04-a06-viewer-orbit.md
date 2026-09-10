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

## First tranche

The first A06 tranche establishes a pure `ViewerOrbitState` and `ViewerOrbitReducer` before touch input or animation is attached.

State is limited to:

- yaw in degrees;
- pitch in degrees;
- viewer zoom scalar.

The reducer accepts only:

- bounded drag deltas;
- bounded positive zoom factors;
- exact reset to the neutral state.

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

Canonical source coordinates, topology, projection reference vectors, and pinned assets are immutable under viewer interaction. A viewer reducer cannot own or rewrite any `GeometryPoint.q`, canonical registry, or source asset.

The required invariant is:

```text
canonical geometry bytes/state before viewer interaction
==
canonical geometry bytes/state after viewer interaction
```

### E — Embodiment & Visual Experience

A05 remains the exact neutral orientation. Future gesture attachment must be confined to the `SceneViewportPolicy` scene and excluded from participant controls. Reset must return exactly to neutral rather than approximately to a visually similar state.

### A — Architecture & Technology

Viewer state is presentation-only and has `authorityEffect=none`. It may not write Hope protected storage, Tempus persistence, identity state, receipts, capabilities, governance records, protocol state, or network/model state.

## Explicit exclusions for this tranche

This first A06 source tranche does not yet add:

- Android touch listeners;
- drag/pinch gesture attachment;
- inertia;
- animation timing;
- screen/video recording;
- star-tetrahedron activation;
- geometry mutation;
- camera persistence across process restart;
- network or model calls.

Those may be introduced only after the pure reducer and invariants are green.

## Acceptance criteria

1. Neutral state is exact and stable.
2. Pitch and zoom are hard bounded.
3. Yaw normalization is deterministic.
4. Invalid zoom factors fail closed.
5. Reset restores bitwise-equivalent neutral scalar values.
6. Reducer operations cannot mutate canonical coordinate objects supplied elsewhere in the process.
7. Existing CE-W01–A05 geometry, Hope, Tempus, authority, privacy, observer, and repository-index verification remains green.
8. Build provenance advances to `versionCode = 6`, `versionName = 0.1.5-cew04-a06`, `ARCANUM_IMPLEMENTATION_ARC = CE-W04-A06`.

## Next tranche

After this reducer tranche is verified, A06 may attach the viewer state to projection/rendering and then to bounded Android gestures under `SceneViewportPolicy`. Motion evidence remains Human-triggered and local-first.

No A06 work promotes `main` or closes CE-W04 by itself.
