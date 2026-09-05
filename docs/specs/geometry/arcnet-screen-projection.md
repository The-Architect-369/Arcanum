---
title: "ARCnet Screen Projection — CE-W02"
status: implementation-candidate
visibility: public
last_updated: 2026-09-04
description: "Exact CE-W02 contract for deterministic model-to-screen projection of certified ARCnet geometry without creating semantic or runtime authority."
era: "Construction Era"
wave: "CE-W02"
version: "0.1"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/42"
extends:
  - "docs/specs/geometry/arcnet-coordinate-frame.md"
  - "docs/specs/geometry/arcnet-spatial-architecture.md"
---

# ARCnet Screen Projection — CE-W02

## Purpose

This specification defines the exact math-to-screen projection contract that every CE-W02 native renderer must consume before presentation-specific rendering is introduced.

It extends the certified CE-W01 coordinate and spatial architecture contracts. It does not rewrite canonical coordinates, coordinate families, semantic correspondence, runtime connectivity, Identity, authority, Tempus, governance, economics, recognition, or protocol finality.

> **Project registered geometry; do not reinterpret it.**

## Pipeline

For a canonical local point `q`, the deterministic pipeline is:

```text
q
→ model/world X = P + s R q
→ right-handed view coordinates
→ homogeneous clip coordinates
→ normalized device coordinates
→ top-left screen coordinates
```

Canonical source coordinates remain immutable throughout the pipeline.

## Vector and matrix convention

CE-W02 uses:

```text
homogeneous column vectors
left matrix multiplication
right-handed world/view convention
right-hand-rule positive rotations
camera local forward = -Z
```

For composed model rotations, the rightmost matrix acts first.

The CE-W02 reference profile composes:

```text
R = Rx(-30°) Ry(+45°)
```

so `Ry(+45°)` acts on `q` before `Rx(-30°)`.

## Model transform

The inherited CE-W01 rigid transport remains:

```text
X = P + s R q
```

where:

- `q` is an immutable source coordinate;
- `P` is presentation translation;
- `s > 0` is a common presentation scale;
- `R` is orthonormal.

No anisotropic model scale is ratified by this contract.

Model transform state has no authority effect.

## View transform

Given:

```text
eye
target
upReference
```

define:

```text
forward = normalize(target - eye)
right   = normalize(forward × upReference)
up      = right × forward
```

The view coordinates of world point `X` are:

```text
x_v = dot(right, X - eye)
y_v = dot(up, X - eye)
z_v = -dot(forward, X - eye)
```

Points in front of the camera satisfy:

```text
z_v < 0
```

and the positive sortable view depth is:

```text
viewDepth = -z_v
```

`eye == target`, a zero-length `upReference`, or an `upReference` collinear with `forward` is invalid and must fail closed.

## Perspective projection

For vertical field of view `fovY`, aspect ratio `a = width / height`, near plane `N`, far plane `F`, and:

```text
t = 1 / tan(fovY / 2)
```

the canonical CE-W02 perspective matrix is:

```text
[ t/a   0             0                 0 ]
[  0    t             0                 0 ]
[  0    0      (F+N)/(N-F)      2FN/(N-F) ]
[  0    0            -1                 0 ]
```

Constraints:

```text
0 < fovY < 180°
0 < N < F
width > 0
height > 0
```

The canonical NDC depth range is:

```text
[-1, +1]
```

This is an engine-neutral mathematical contract. A renderer whose graphics API uses another depth range must adapt at its backend boundary without changing the canonical vectors.

## Homogeneous clipping

Perspective clipping occurs before division by `w`.

A point is inside the canonical clip volume iff:

```text
w > 0
-w <= x <= w
-w <= y <= w
-w <= z <= w
```

A segment with one endpoint outside is not discarded merely because that endpoint is outside. The segment must be clipped against the canonical homogeneous clip volume, or by a mathematically equivalent deterministic algorithm, before rasterization.

## Normalized-device division

For a surviving clip coordinate:

```text
ndcX = clipX / clipW
ndcY = clipY / clipW
ndcZ = clipZ / clipW
```

Division by zero or non-positive perspective `w` is invalid.

## Viewport mapping

The canonical viewport has:

```text
origin = top-left
+x = right
+y = down
```

For viewport `(x0, y0, width, height)`:

```text
screenX = x0 + (ndcX + 1) * width / 2
screenY = y0 + (1 - ndcY) * height / 2
```

Screen coordinates are continuous viewport-edge coordinates. Pixel-center or raster-sample conventions belong to the rendering backend and must not rewrite these reference values.

## Aspect preservation

Perspective mode fixes the vertical field of view and derives horizontal field of view from aspect ratio.

Equivalent horizontal field of view is:

```text
fovX = 2 atan(aspect * tan(fovY / 2))
```

Orthographic renderers, when introduced, must fix a vertical half-height and derive horizontal half-width as:

```text
halfWidth = aspect * halfHeight
```

A renderer must not apply anisotropic stretching to make geometry fit a viewport.

## Depth and draw ordering

Canonical perspective depth for ordering is:

```text
viewDepth = -z_v
```

For visible points, smaller positive depth is nearer.

Depth equality does not create semantic equality. If a presentation layer needs a deterministic tie break for otherwise equal-depth display items, it may use stable registered IDs. Such a tie break is presentation-only.

## Intersection and authority separation

The following implications are forbidden:

```text
screen-space coincidence
  != 3D intersection

3D intersection
  != semantic relationship

semantic relationship
  != executable runtime relation
```

An executable edge still requires its own capability and authority contract.

Projection, camera position, viewport position, depth, clipping result, visibility, occlusion, screen overlap, animation, or draw order must never generate or modify:

```text
identity
capability
permission
authority
governance weight
recognition
readiness
worth
score
economic entitlement
protocol finality
```

## Scale firewall

The pipeline distinguishes:

```text
q          canonical unitless local coordinate
s          common presentation-only model scale
camera     presentation viewpoint
viewport   screen projection scale
```

None of these quantities is physical distance, time, economic value, recognition, governance weight, or human worth by geometric fact.

## Geometry-free equivalent

Every operationally relevant projection state must be inspectable without a rendered scene.

Minimum representation:

```text
Projection State
- projection contract ID/version
- source frame ID/version
- model transform
- camera eye/target/up reference
- handedness and rotation convention
- projection mode
- fov/near/far or orthographic extent
- clip convention
- NDC depth range
- viewport rectangle and axis directions
- selected registered object ID, if any
- source/provenance
```

Disabling graphics must not change authority, available state transitions, capability, permission, runtime connectivity, Tempus state, or source provenance.

## Reference profile

The machine-readable v0.1 registry fixes one deterministic reference profile:

```text
model:
  P = (0, 0, 0)
  s = 1
  R = Rx(-30°) Ry(+45°)

camera:
  eye = (0, 0, 5)
  target = (0, 0, 0)
  upReference = (0, 1, 0)

perspective:
  fovY = 60°
  near = 0.1
  far = 100

viewport:
  x0 = 0
  y0 = 0
  width = 1000
  height = 1000
```

Expected screen values are supplied by `arcnet-screen-projection.vectors.v0.1.json`. Native Android code must consume or reproduce those vectors; it must not establish a second independent truth set.

## Falsification tests

### F21 — source immutability

Projection never mutates certified CE-W01 source coordinates.

### F22 — rigid model transport

`P + sRq` preserves pairwise distance ratios under one positive common scale and orthonormal rotation.

### F23 — declared orientation convention

Handedness, vector convention, positive rotation, camera-forward convention, and transform order are explicit and match the machine registry.

### F24 — deterministic view transform

The declared `eye/target/upReference` basis yields the exact registered view coordinates within tolerance and fails closed for degenerate camera inputs.

### F25 — projection and viewport mapping

Reference-profile points produce the registered clip/NDC/screen results within tolerance.

### F26 — aspect preservation

Changing viewport aspect derives horizontal extent from the fixed vertical extent; equivalent x/y camera distances at equal depth retain equal pixel scale.

### F27 — clipping

Canonical homogeneous clipping uses `w > 0` and all six `±w` planes; crossing segments are clipped rather than incorrectly discarded.

### F28 — depth ordering

Positive `viewDepth = -z_v` is deterministic; smaller visible depth is nearer. Any equal-depth presentation tie break is stable-ID-only.

### F29 — dimensional and semantic separation

Two distinct 3D points may project to the same screen coordinate without becoming spatially identical, semantically related, or executable neighbors.

### F30 — geometry-free and authority firewall

Projection has `authorityEffect = none`, carries the forbidden-authority input firewall forward, and retains a geometry-free equivalent.

## CE-W02 boundary

This contract is the prerequisite for W02.2 native rendering.

It does not create an Android UI design, a Rust FFI surface, a Tempus bridge, network synchronization, protocol submission, or finality. Those remain later CE-W02 or later-wave work and must consume this contract rather than redefine it.
