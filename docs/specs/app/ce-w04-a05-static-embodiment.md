---
title: "CE-W04-A05 — Hope-First Static Embodiment and SceneViewportPolicy"
status: implementation-candidate
visibility: public
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W04"
arc: "CE-W04-A05"
authority: "presentation-only; authorityEffect=none"
---

# CE-W04-A05 — Hope-First Static Embodiment and SceneViewportPolicy

## Purpose

A05 changes the Human-facing composition without changing canonical geometry, protected Hope state, identity, Tempus semantics, protocol state, governance state, or network authority.

The static embodiment contract is:

```text
canonical geometry remains immutable
→ participant controls occupy explicit protected bands
→ SceneViewportPolicy resolves the remaining drawable scene
→ inner Hope octahedron receives perceptual priority
→ outer ARCnet geometry remains present but subordinate
→ reflection editing is deliberate rather than permanently occupying the center
→ Tempus remains visible but compact
```

## G / E / A boundary

### G — Geometry & Mathematics

A05 MUST NOT mutate canonical source coordinates, topology, projection reference vectors, source-frame identity, or geometry digests. `ProjectionEngine` continues to consume canonical geometry. SceneViewportPolicy only selects the presentation viewport used by the Human-facing renderer.

### E — Embodiment & Visual Experience

A05 establishes a protected scene center and visual hierarchy before any orbit/motion tranche. The inner octahedron is primary. Outer cube/ARCnet geometry is drawn with reduced visual weight. Reflection editing is collapsed by default and opened explicitly by the Human. Participant-facing debug/provenance text is removed from the primary canvas where it is already preserved in the Architect observation surface or accessibility descriptions.

### A — Architecture & Technology

Hope protected persistence, AndroidKeyStore policy, local receipts, Tempus capture/recovery, Architect observation privacy, and Human-selected export semantics remain unchanged. Build provenance advances monotonically to `versionCode = 5`, arc `CE-W04-A05`.

Tempus remains a cross-spine temporal/provenance axis rather than a fourth peer spine.

## SceneViewportPolicy

`SceneViewportPolicy` is a pure presentation policy. Inputs are physical viewport size plus occupied participant bands. Output is a positive bounded scene rectangle.

It MUST:

- keep the drawable scene inside the current Android content bounds;
- preserve a positive scene even under accessibility/layout pressure;
- reserve participant control bands rather than allowing geometry to draw through them;
- never mutate canonical geometry or persistent state;
- remain independent of identity, capability, receipts, protocol, or governance state.

## Static rendering hierarchy

1. black spatial field;
2. latent/subordinate outer ARCnet geometry;
3. primary inner Hope octahedron;
4. restrained Hope Seed overlay and central point;
5. participant controls in protected bands;
6. Architect observation/export surface outside the geometry semantics.

No orbit reducer, drag gesture, pinch zoom, inertia, animation, star-tetrahedron activation, or screen recording is enabled in A05.

## Observer boundary

A05 continues the existing Human-triggered privacy-redacted screenshot + JSON + frozen ZIP observation. A future motion arc MAY add a bounded short visual clip, but only after motion exists to observe and only with the same Human-selected, private-redacted, no-automatic-export boundary. A05 does not add screen recording.

## Acceptance criteria

- Android `versionCode = 5` and `ARCANUM_IMPLEMENTATION_ARC = CE-W04-A05`.
- Canonical F25 reference vectors still pass unchanged.
- SceneViewportPolicy unit tests pass.
- Inner octahedron remains primary and outer cube visually subordinate.
- Primary renderer no longer prints participant-facing runtime/provenance labels over the geometry.
- Hope editor is collapsed by default and can be explicitly opened.
- Existing protected Hope state remains recoverable across the v4 → v5 in-place update.
- Tempus remains locally recoverable/capturable and visually compact.
- Architect observation remains Human-triggered, privacy-redacted, local until Human share, and authorityEffect=none.
- No INTERNET permission, protocol submission, model dependency, or governance authority is introduced.

## Promotion

A05 is an implementation arc only. Passing A05 does not close CE-W04 and does not authorize `main` promotion, Genesis, protocol finality, or governance authority.
