---
title: "Tempus Solar-System Observatory Render Findings"
status: design-candidate
phase: Pre-Genesis
authority: non-canonical render and architecture evidence
---

# Purpose

Record the first render-level consequences of shifting Tempus from an abstract solar-longitude ARCnet carrier into a Sol-centered physical solar-system observatory with Earth/Gaia as the local ARCnet host.

# Render tested

Local interactive artifact:

`tempus_solar_system_observatory_v0_1.html`

Research checkpoint:

`2026-08-24T15:05:00Z`

Prototype ephemeris:

Swiss Ephemeris Python binding using the local Moshier backend. This is reproducible research data only; a production observatory should use an explicitly versioned high-precision ephemeris adapter such as JPL Horizons/SPICE-equivalent data with observer/frame/epoch metadata.

# Structural change

Previous default:

```text
solar longitude
→ Tempus abstract carrier
→ ARCnet frame moves on dual-icosahedral path
```

New default astronomical view:

```text
Sol-centered physical solar system
→ Earth follows its heliocentric orbit
→ ARCnet local frame remains attached to Earth/Gaia
→ Moon follows Earth-relative trajectory
→ planets/belts/clouds remain independently astronomical
→ dodecahedron remains an outer navigation/window interface
```

The old carrier remains useful as an optional normalized zodiac-coordinate renderer. It is no longer the preferred literal-looking solar-system picture.

# Current research checkpoint

At the render checkpoint, the local ephemeris resolves Earth/Gaia at approximately:

```text
heliocentric radius       1.010948 AU
heliocentric longitude  331.476485°
ecliptic latitude         ~0°
```

Luna is approximately:

```text
401,852 km from Earth
```

These values are prototype ephemeris output and are not represented as a direct JPL response.

# Scale finding

A literal one-scale view fails.

Approximate physical distance classes include:

```text
inner planets             < 2 AU
main asteroid belt      2.2–3.2 AU
Jupiter                   ~5 AU
Neptune                  ~30 AU
Kuiper Belt             ~30–50 AU
scattered disk          to ~1000 AU
Oort Cloud         thousands–~100,000 AU
```

The renderer therefore requires explicit projection modes:

- inner-system linear;
- planetary-system linear;
- trans-Neptunian linear;
- whole-system logarithmic.

The logarithmic mode is a map projection, not physical scale.

# Dodecahedron finding

The dodecahedron works better as an outer **celestial interface** than as a literal Oort surface.

It can provide:

- twelve normalized zodiac/Tempus houses;
- selectable outward-looking sky portals;
- a stable spatial memory system;
- later constellation/star-field overlays;
- a transition between top-down solar-system mode and outward observer mode.

It must not imply:

- the Oort Cloud has flat pentagonal faces;
- all stars are located on the shell;
- each zodiac sign is one neighboring star system;
- astronomical constellations are equal 30-degree units.

# Exact five-solid geometry finding

The current architecture now contains a particularly strong historically sourced mathematical stack:

```text
Dodecahedron ↔ Icosahedron
exact Platonic dual pair
historical overlays: cosmos ↔ water

Stella octangula
= two tetrahedra
historical overlay: fire

common tetrahedron intersection
= octahedron
historical overlay: air

convex hull of eight stella vertices
= cube
historical overlay: earth
```

The geometry is exact. The element names are historical symbolic metadata. The combination is an Arcanum synthesis and not a physical-element theory.

# Gaia / node finding

Earth can act as the default system-scope center for an Earth ARCnet installation:

```text
Earth physical body
→ Gaia node/personification layer
→ Earth-hosted ARCnet network
→ human sovereign participant nodes
```

The phrase `Gaia wants growth` should therefore be implemented as a participant/civilization-authored stewardship covenant, not as a scientific claim about planetary consciousness.

A future Gaia profile may organize goals such as biosphere continuity, habitability, ecological resilience, biodiversity, regenerative resource use, and intergenerational continuity.

# Interplanetary extension

A Moon ARCnet installation should be modeled as a separate physical/network node with its own local runtime and time/reference metadata.

The same pattern can later extend to:

```text
Earth node ↔ lunar node
Earth/lunar nodes ↔ orbital infrastructure
Earth/lunar nodes ↔ Mars node
Mars/orbital nodes ↔ asteroid-resource infrastructure
later planetary/habitat nodes
```

Physical distance may affect message latency, synchronization strategy, clock coordination, and settlement/finality design. It may not create authority or civilizational rank.

# Disposition

**BOUNDED PASS.**

The solar-system observatory is a better default physical model than the prior ARCnet-on-Tempus-carrier animation. The previous normalized carrier remains useful as an optional abstract coordinate view.

The next research programme should deepen, rather than immediately add more geometry:

1. exact Platonic-solid history from Plato through Euclid, Pacioli, Kepler, and later esoteric use;
2. exact metric relations and compounds among all five solids, especially the stella-octangula cube/octahedron relation and dodecahedron/icosahedron dual ratio;
3. historical separation of Merkabah literature from modern star-tetrahedron usage;
4. solar-system coordinate/reference-frame architecture: heliocentric, barycentric, geocentric, body-fixed, local horizon;
5. actual planetary orbital elements, precession, nodes, retrograde-as-apparent-motion, and multi-body ephemeris;
6. Oort/Kuiper/heliosphere boundaries and logarithmic map projections;
7. tropical zodiac versus sidereal/constellation sky portals;
8. Gaia stewardship/personification doctrine with a strict fact/symbol/participant-meaning firewall;
9. interplanetary ARCnet node protocol implications: light-time latency, asynchronous receipts, clock provenance, delayed finality, and disconnected local-first operation.

Leading law:

> **Encode What the Sky Does; Use Geometry to Help Humans See It.**
