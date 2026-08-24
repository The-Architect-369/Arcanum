---
title: "Platonic Scale, Reference Frame, and Vitae Mathematics Audit"
status: design-candidate
visibility: public
last_updated: 2026-08-24
phase: Pre-Genesis
authority: non-canonical mathematical and architectural evidence
---

# Platonic Scale, Reference Frame, and Vitae Mathematics Audit

## Purpose

Convert the current Hope → Vitae → ARCnet → Tempus synthesis into explicit mathematics and coordinate contracts before further rendering.

This audit separates:

- exact Euclidean geometry;
- astronomical measurement;
- observer/reference-frame choice;
- historical Platonic symbolism;
- Vitae curriculum semantics;
- presentation scale.

No count, ratio, solid, angle, or celestial state creates identity, recognition, readiness, governance, Treasury, or capability authority.

---

## 1. First correction: cube and icosahedron are not duals

The actual Platonic dualities are:

```text
tetrahedron ↔ tetrahedron
cube        ↔ octahedron
dodecahedron ↔ icosahedron
```

Therefore the earlier conversational shorthand that treated cube↔icosahedron as a dual pair was incorrect.

A regular icosahedron **can** be embedded inside a cube in a standard golden-rectangle orientation. That is a real and useful relation, but it is an **embedding**, not duality.

Leading law:

> **Exact Embedding and Exact Duality Are Different Relations.**

References:

- https://mathworld.wolfram.com/PlatonicSolid.html
- https://mathworld.wolfram.com/RegularIcosahedron.html
- https://www.georgehart.com/virtual-polyhedra/ex-pr1.html

---

## 2. Why there are exactly five convex Platonic solids

For regular p-gon faces with q faces meeting at each vertex, the face interior angle is:

```text
α = (p - 2)π / p
```

Convex closure requires:

```text
qα < 2π
```

which reduces to:

```text
(p - 2)(q - 2) < 4
```

For integers `p,q ≥ 3`, the only solutions are:

```text
{3,3} tetrahedron
{3,4} octahedron
{4,3} cube
{3,5} icosahedron
{5,3} dodecahedron
```

This finite existence result—not elemental symbolism—is what makes the five Platonic solids mathematically exceptional.

Each also satisfies:

```text
V - E + F = 2
```

for convex polyhedra.

---

## 3. Exact ARCnet local geometry

Keep the existing ARCnet cube coordinates:

```text
(x,y,z) ∈ {−1,+1}³
```

Then:

```text
cube edge           = 2
cube circumradius   = √3
```

The two alternate tetrahedral vertex sets form the stella octangula.

Each tetrahedron has:

```text
edge = 2√2
circumradius = √3
```

so the two tetrahedra and the cube share the same eight outer vertices.

Their common intersection is exactly the regular octahedron:

```text
(±1,0,0)
(0,±1,0)
(0,0,±1)
```

with:

```text
octahedron edge = √2
octahedron circumradius = 1
```

This verifies the previously discovered six derived ARCnet junction coordinates as the vertices of the common octahedral intersection.

MathWorld independently states that the convex hull of the stella octangula is a cube and its common solid is an octahedron.

Reference:

- https://mathworld.wolfram.com/StellaOctangula.html

Historical symbolic overlay remains separately sourced:

```text
tetrahedron → fire
octahedron  → air
cube        → earth
```

The geometry is exact. The elemental layer is historical symbolism. Neither is a physical theory of matter.

---

## 4. Exact icosahedron inside the ARCnet cube

Let:

```text
φ = (1 + √5)/2
```

Inside cube `[-1,+1]³`, use the twelve vertices:

```text
(0, ±1/φ, ±1)
(±1/φ, ±1, 0)
(±1, 0, ±1/φ)
```

They form a regular icosahedron.

Exact values:

```text
icosahedron edge = 2/φ
                 ≈ 1.2360679775

icosahedron circumradius = √(3 - φ)
                         ≈ 1.1755705046

cube circumradius = √3
                  ≈ 1.7320508076

R_icosa / R_cube ≈ 0.6787159473
```

Every icosahedron vertex lies on one cube face.

Therefore Vitae can be rendered **inside the ARCnet cube using an exact regular-icosahedron embedding** without claiming the solids are dual.

This gives a legitimate mathematical version of:

```text
ARCnet cube/stella
      contains
Vitae icosahedron
```

The radius remains local presentation geometry, not a physical distance.

---

## 5. Dodecahedron, cube, and the same golden scale

A regular dodecahedron can be written with vertices:

```text
(±1,±1,±1)
(0,±1/φ,±φ)
(±1/φ,±φ,0)
(±φ,0,±1/φ)
```

Its edge is:

```text
2/φ
```

and its circumradius is:

```text
√3
```

The first eight coordinates are exactly the ARCnet cube vertices.

Therefore:

```text
cube edge / dodecahedron edge = φ
```

and the cube is constructed from eight dodecahedral vertices.

In the same ARCnet-friendly coordinate normalization:

```text
dodecahedron edge = 2/φ
icosahedron edge  = 2/φ
cube edge         = 2
```

The equal dodecahedron/icosahedron edge in this construction is a **common normalization**, not their face-center dual scale.

This distinction matters.

The dodecahedron and cube share the same outer circumradius in this exact embedding; if the UI requires a visible gap between ARCnet and Tempus, that additional radial factor is a renderer parameter, not a Platonic constant.

References:

- https://mathworld.wolfram.com/RegularDodecahedron.html
- https://mathworld.wolfram.com/RegularIcosahedron.html

---

## 6. Exact dodecahedron↔icosahedron dual scale

The dodecahedron and icosahedron are exact duals.

When an inner icosahedron is formed specifically from the face centers of an outer dodecahedron, the natural ratio is:

```text
R_inner_icosa / R_outer_dodeca
= r_dodeca / R_dodeca
= √((5 + 2√5)/15)
≈ 0.7946544723
```

The same inradius/circumradius ratio appears for the icosahedron because they are dual regular solids.

This produces a second legitimate dodecahedron↔icosahedron scale.

Therefore the project now has to name which relation it is using:

```text
A. face-center duality
B. cube-mediated golden embedding
C. arbitrary presentation spacing
```

They are not interchangeable.

Leading law:

> **Name the Construction Before Reading the Ratio.**

---

## 7. Reference frame resolves the geocentric/heliocentric question

The user-facing Tempus sky should be allowed to be geocentric because the human observer is on Earth.

The physical solar-system model should remain heliocentric/barycentric as appropriate.

For geometric vectors expressed in the same axes:

```text
r_body_geocentric
= r_body_heliocentric - r_earth_heliocentric
```

Since the heliocentric Sun vector is zero:

```text
r_sun_geocentric = -r_earth_heliocentric
```

Therefore, geometrically in the same ecliptic frame:

```text
λ_sun_geocentric
= λ_earth_heliocentric + 180° mod 360°
```

This gives an exact mathematical bridge between the old Earth-centered sky experience and the modern heliocentric model.

For real apparent astronomy, full ephemeris processing still has to preserve light-time, aberration, frame, epoch, precession/nutation and observer provenance.

JPL Horizons distinguishes bodycentric/geocentric, barycentric, topocentric and multiple reference frames explicitly.

Reference:

- https://ssd.jpl.nasa.gov/horizons/manual.html

Leading law:

> **A Viewpoint May Be Central to Experience Without Being Central to Cosmology.**

---

## 8. Physical scale ladder

The astronomical unit is exactly:

```text
1 au = 149,597,870,700 m
```

under IAU Resolution B2.

Reference:

- https://iauarchive.eso.org/public/themes/measuring/

JPL scale references for the major planets place the fitted semi-major-axis-like values approximately at:

```text
Mercury    0.3871 au
Venus      0.7233 au
Earth-Moon barycenter 1.0000 au
Mars       1.5237 au
Jupiter    5.2029 au
Saturn     9.5367 au
Uranus    19.1892 au
Neptune   30.0699 au
```

Pluto ranges roughly:

```text
30 to 49.3 au
average ~39 au
```

Useful physical-context regions:

```text
main asteroid belt  ~2.2–3.2 au
Kuiper main region ~30–50 au
scattered disk     → roughly 1000 au
Oort inner edge    ~2000–5000 au
Oort outer estimates ~10,000–100,000 au
```

References:

- https://ssd.jpl.nasa.gov/planets/approx_pos.html
- https://science.nasa.gov/dwarf-planets/pluto/facts/
- https://science.nasa.gov/mission/dawn/faq/
- https://science.nasa.gov/solar-system/kuiper-belt/facts/
- https://science.nasa.gov/solar-system/oort-cloud/facts/

One linear camera cannot represent all of these usefully.

The current scale ladder should therefore be:

```text
Gaia–Luna local       ≤ ~500,000 km linear
Inner system          ≤ ~5.5 au linear
Planetary Tempus      ≤ ~50 au linear
Outer solar context   ≤ ~100,000 au compressed/log
Tempus sky            angular, not radial
```

The farthest sky view is not the same mathematical coordinate as a 100,000-au radius.

---

## 9. Dodecahedron faces cannot literally be twelve 30° zodiac directions

This is the most important portal correction.

A regular dodecahedron has twelve faces.

Its twelve face normals are the twelve vertices of the dual regular icosahedron.

Those twelve vertices are distributed through three-dimensional space and are not coplanar.

The ecliptic is one plane through the observer, and its sky projection is one great circle.

A rigid rotation preserves coplanarity.

Therefore no rigid orientation of one regular dodecahedron can make all twelve face normals simultaneously equal twelve evenly spaced directions on the ecliptic.

So:

```text
12 dodecahedron faces
≠ literal twelve 30° ecliptic patches
```

The correct architecture is:

```text
face index
→ UI portal / house
→ actual angular target coordinate
```

For a tropical sign center:

```text
λ_center = 15° + 30°(index - 1)
β = 0°
```

A selected face may rotate so that its normal points at that true sky direction. The other eleven faces must then be treated as surrounding navigation geometry rather than falsely claimed to point at the other eleven signs.

This preserves the dodecahedral experience without falsifying spherical astronomy.

Leading law:

> **Face Index and Sky Direction Are Different Coordinates.**

---

## 10. Tropical zodiac and astronomical constellations remain separate

The twelve-sign Tempus coordinate is:

```text
12 × 30° = 360°
```

and can continue supporting:

```text
12 signs × 6 quinaries × 5° = 72 sectors
```

Astronomical constellations are different.

The IAU recognizes 88 sky regions. The ecliptic crosses thirteen astronomical zodiac constellations, including Ophiuchus, and those regions are not equal in shape or angular width.

References:

- https://www.iau.org/IAU/IAU/Astronomy-FAQs/FAQs.aspx
- https://astroedu.iau.org/activities/what-is-a-constellation/

Therefore a Tempus portal may show simultaneously:

```text
Tropical sign:      conventional 30° coordinate
IAU constellation:  actual sky-region lookup
Stars:              actual catalog positions/distances
```

but those fields may not impersonate one another.

---

## 11. The Vitae icosahedron has an exact 5 + 10 + 5 face architecture

Orient a unit-circumradius regular icosahedron on one fivefold axis.

Its vertices are:

```text
north pole: 1
upper pentagonal ring: 5
lower pentagonal ring: 5
south pole: 1
```

The twenty faces then divide exactly into:

```text
north cap       5 faces
middle belt    10 faces
south cap       5 faces
```

The three face groups have internal adjacency graphs:

```text
C5 + C10 + C5
```

and the cross-group edges are:

```text
5 north-cap ↔ belt
5 south-cap ↔ belt
0 north-cap ↔ south-cap
```

This is a genuine mathematical basis for the Human Architect's latest Vitae proposal.

### Core Grade candidate

The ten middle-belt faces can carry:

```text
Guardian → Seeker → Disciple → Mystic → Scholar
→ Healer → Alchemist → Sage → Oracle → Adept
```

The belt itself is a `C10` cycle.

Vitae progression is not.

Therefore one geometric edge—Adept back to Guardian—must remain semantically inert in the ordinary Core path, giving a `P10` progression overlay on a `C10` terrain.

Leading law:

> **A Closed Belt May Carry an Open Path.**

### Two five-face specialization caps

The ten specializations may now be tested against two exact five-face cap families.

A plausible, explicitly unratified partition suggested by the current mandates and Human Architect direction is:

```text
contemplative / interpretive
- Arcanist
- Philosopher
- Illusionist
- Astrologer
- Hierophant

embodied / transformative
- Druid
- Necromancer
- Alchemist
- Artificer
- Enchanter
```

This is **not yet canon**.

The current specialization codex says the paths are non-hierarchical, non-exclusive and counterbalancing; it does not currently define these two families.

Therefore a dedicated content/falsification audit is still required.

Top/bottom may not mean higher/lower, spirit/matter, good/bad, advanced/basic, masculine/feminine, or more/less authoritative.

---

## 12. Tree of Life inside a Grade face

The Human Architect's proposed interaction is coherent as a UI nesting hypothesis:

```text
select Grade triangle
      ↓
enter Grade
      ↓
view ten Tree-of-Life-oriented class stations
      ↓
practice/navigation/recognition occur through their own rules
      ↓
return to the icosahedral atlas
```

However:

```text
triangle has 3 vertices / 3 edges
Tree has 3 pillars / 10 sefirot
```

is only a count resonance.

The triangle may **host** a Tree projection, but the icosahedron does not mathematically generate the Tree's three pillars.

Leading law:

> **The Triangle May Host the Tree; It Does Not Generate the Tree.**

---

## 13. Current scale synthesis

The strongest current architecture is not one giant Euclidean object with one unit system.

It is a controlled transition among coordinate domains:

```text
HOPE
center / reflective interface
        ↓
VITAE
local normalized icosahedral navigation geometry
        ↓
ARCNET
local cube / stella-octangula capability geometry
        ↓
GAIA–LUNA
Earth-centered physical km scale
        ↓
SOLAR SYSTEM
Sun-centered physical AU scale
        ↓
TEMPUS SKY
Earth-centered angular celestial interface
        ↓
DISTANT STARS
catalog positions + actual distances
```

The user may experience this as one continuous portal.

The mathematics underneath must explicitly change coordinate systems at the appropriate zoom thresholds.

Leading law:

> **One Portal May Cross Many Coordinate Systems; It Must Not Pretend They Are One Metric.**

---

## 14. Registry set created by this gate

1. `docs/architecture/registries/platonic-solid-exact-metrics.v0.1.json`
2. `docs/architecture/registries/tempus-observer-frame-and-scale-registry.v0.1.json`
3. `docs/architecture/registries/tempus-geocentric-sky-window-registry.v0.1.json`
4. `docs/architecture/registries/vitae-icosahedral-fivefold-orientation.v0.1.json`

Machine validation performed during the audit confirmed:

```text
icosahedron-in-cube edge       = 2/φ
icosahedron edge count         = 30
all 12 icosa vertices          lie on cube faces

dodecahedron edge             = 2/φ
dodecahedron edge count        = 30
8 cube vertices                are dodecahedron vertices
cube and dodeca circumradius   = √3 in this normalization

stella tetrahedron edge        = 2√2
octahedral intersection edge   = √2
octahedral intersection edges  = 12

fivefold icosahedron:
vertices                       = 12
edges                          = 30
faces                          = 20
face groups                    = 5 + 10 + 5
each face-group internal degree= 2
```

---

## 15. Current disposition

**PASS**:

- exact Platonic metric registry;
- exact ARCnet stella/cube/octahedron geometry;
- exact icosahedron-in-cube embedding;
- exact cube-from-dodecahedron-vertices embedding;
- exact dodecahedron↔icosahedron duality when construction is named;
- geocentric sky + heliocentric physical-model coexistence;
- physical scale ladder;
- dodecahedron as portal index rather than false literal zodiac tessellation;
- 5+10+5 icosahedral Vitae terrain as a reopened design candidate.

**HOLD**:

- final two specialization families;
- triangle ↔ Tree three-pillar mapping;
- renderer radial gaps between Hope/Vitae/ARCnet/Tempus;
- production JPL/SPICE adapter;
- actual IAU-boundary and Gaia-star portal implementation.

**FAIL / corrected**:

- cube↔icosahedron described as duality;
- twelve dodecahedron face normals described as twelve literal equal ecliptic directions;
- normalized UI radii described as physical AU/km scales;
- Oort Cloud described as a dodecahedral boundary.

---

## Candidate laws

- **Exact Embedding and Exact Duality Are Different Relations.**
- **Name the Construction Before Reading the Ratio.**
- **A Golden Ratio May Set Geometry; It Does Not Set Meaning.**
- **A Viewpoint May Be Central to Experience Without Being Central to Cosmology.**
- **One Portal May Cross Many Coordinate Systems; It Must Not Pretend They Are One Metric.**
- **Face Index and Sky Direction Are Different Coordinates.**
- **A Closed Belt May Carry an Open Path.**
- **The Triangle May Host the Tree; It Does Not Generate the Tree.**
- **Geometry May Offer Families; Doctrine Must Name Them.**

Refer to full module schema in `docs/architect/architectgpt-extended.md`.
