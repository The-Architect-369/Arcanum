---
title: "CE-W03 Hope / Seed Presentation Overlay"
status: implementation-candidate
visibility: public
wave: "CE-W03"
tranche: "W03.1"
last_updated: 2026-09-05
---

# Hope / Seed Presentation Overlay

This contract preserves the inherited CE-W01/CE-W02 Hope-centered octahedral source exactly and adds only the CE-W03 ratified Seed-of-Life presentation layer.

## Source boundary

The controlling source remains `arcnet-coordinate-frame.v0.1.json`:

- inner octahedron role: `hope-centered-inner-rendering`;
- vertices remain the six normalized axis points;
- source coordinates are immutable to CE-W03;
- no Seed geometry is asserted as an exact mathematical identity of that octahedron.

The inherited coordinate registry is intentionally **not edited by W03.1**; this overlay is a separate Construction-era presentation contract bound to it.

## Overlay type

`hope-seed-overlay.v0.1.json` is explicitly `symbolic-presentation-overlay`.

Its seven equal circles use standard overlay-local Seed centers: one origin circle and six unit-distance centers at 60-degree intervals. Those coordinates define the overlay itself; they do **not** derive new canonical coordinates for ARCnet or Hope.

The overlay is centered on the screen projection of the inherited identity/Hope origin. Its unit radius is `0.08 × min(viewport width, viewport height)`. This is a presentation scale choice, not a geometric or metaphysical derivation.

## Deterministic vectors

`hope-seed-overlay.vectors.v0.1.json` fixes a 1000 × 1000 reference viewport, projected origin `(500,500)`, unit radius 80 px, and exact expected screen centers within the declared tolerance.

## Authority and equivalence

- `authorityEffect=none`.
- Overlay position, visibility, scale, or animation may never grant capability, readiness, identity, recognition, value, or governance effect.
- Hope reflection capture/recall must remain fully usable if this overlay is absent or cannot be rendered.
- Geometry-free presentation label: `Hope · private reflection`.

F69 and F70 fail if implementation converts this symbolic overlay into an unproved exact ARCnet relation or makes geometric rendering necessary for the Hope capability.
