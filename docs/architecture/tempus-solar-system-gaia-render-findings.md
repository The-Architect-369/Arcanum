---
title: "Tempus Solar-System / Gaia ARCnet Render Findings"
status: design-candidate
visibility: public
last_updated: 2026-08-24
phase: Pre-Genesis
authority: non-canonical rendering and architecture evidence
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/37"
---

# Tempus Solar-System / Gaia ARCnet Render Findings

## Purpose

Record the first renderer produced after the architectural shift from an abstract solar-longitude-carried ARCnet frame to a primary **ephemeris solar-system view with ARCnet anchored to Earth/Gaia**.

This renderer implements the research direction established in:

- `docs/architecture/platonic-cosmology-source-and-science-audit.md`
- `docs/architecture/registries/tempus-solar-system-gaia-frame.v0.1.json`

The earlier Tempus dual-icosahedral carrier renderers remain valid as abstract geometry / phase-space experiments. They are not deleted and are no longer the preferred physical-looking solar-system representation.

---

# 1. Primary visual change

Previous research view:

```text
solar longitude
  → Tempus dual-icosahedral carrier point
  → transported ARCnet stellar frame
```

New primary celestial view:

```text
physical reference frame / ephemeris
  → actual solar-system body state vectors
  → Earth state vector
  → Earth/Gaia-attached ARCnet local frame
```

The difference is architectural, not merely stylistic.

The solar system now moves because the astronomical bodies move. The Tempus geometry no longer supplies a physical-looking orbit for ARCnet.

Finding: **PASS.**

Leading law:

> **Move the Astronomical Bodies; Anchor ARCnet to Its Host.**

---

# 2. Earth / Gaia anchor

The renderer places the stable ARCnet stella-octangula / stellar-cube frame at the Earth state vector.

In local coordinates:

```text
q_system = immutable ARCnet local coordinate
P_earth  = Earth ephemeris position
X_system = P_earth + s R q_system
```

Changing `P_earth` changes the location of the entire local frame without changing:

- the eight system identities;
- the two tetrahedral semantic classes;
- the four mirror axes;
- the six derived octahedral junctions;
- the 28 relation-class partition;
- Edge Contract requirements;
- Identity or authority boundaries.

This is a better physical analogy for a future planetary ARCnet node than making ARCnet ride an invented Platonic orbit.

Finding: **PASS.**

---

# 3. The stella-octangula elemental overlay now has exact geometry under it

The render keeps the current ARCnet geometry:

```text
two interpenetrating tetrahedra
inner regular octahedron
outer cubic hull / eight cube vertices
```

Independent mathematical research confirms that for a regular stella octangula:

```text
constituents = two tetrahedra
intersection = regular octahedron
convex hull = cube
```

A provenance-preserving Platonic historical overlay may therefore expose:

```text
tetrahedron → fire
octahedron  → air
cube        → earth
```

while the repository semantic overlay remains:

```text
tetrahedra → generative / stewardship system sets
octahedron → derived coordination junctions
cube       → outer eight-system positions
```

Neither overlay causes the other.

Finding: **STRONG BOUNDED PASS.**

Candidate law:

> **Exact Geometry May Carry Historical Symbolism Without Turning Symbolism Into Physics.**

---

# 4. Dodecahedron: cosmos shell, not physical space

The renderer uses the regular dodecahedron only in the outer-system mode.

It represents:

- a cosmic / celestial interaction shell;
- an index for future star-window portals;
- the twelve equal conventional ecliptic-sign regions when that layer is selected.

It does not represent:

- the metric of physical space;
- the actual shape of the solar system;
- the physical shape of the Oort Cloud;
- a force constraining planetary orbits.

This matches the source audit more closely than the earlier shorthand `dodecahedron = space`.

Finding: **PASS after correction.**

Candidate law:

> **The Cosmos May Wear a Form; Space Need Not.**

---

# 5. Oort Cloud and Tempus shell can share scale without sharing ontology

The outer view co-renders:

```text
Oort context
= diffuse approximately spherical statistical population

Tempus shell
= regular dodecahedral interface wireframe
```

The render intentionally makes both visible at the same outer-system scale so a participant can understand:

```text
inside → solar system
outside / through portal → wider sky
```

But their shapes are visually and semantically distinct.

Finding: **BOUNDED PASS.**

Candidate law:

> **The Oort Cloud May Set Scale; It Does Not Set Polyhedral Shape.**

---

# 6. Scale must be a first-class UI concept

A single linear scale cannot usefully show both:

```text
Earth ≈ 1 AU from Sol
```

and an Oort Cloud whose estimates extend to tens of thousands or roughly one hundred thousand AU.

The research renderer therefore uses explicit modes:

```text
inner system
planetary system
outer / Oort system
Earth / Gaia node
```

The outer view is explicitly nonlinear/logarithmic-style presentation.

Finding:

> **The interface needs semantic zoom rather than one universal scale.**

Candidate law:

> **A Scale Transform Must Declare Itself.**

---

# 7. The star-window idea survives, but the face normal does not become astronomy

The dodecahedron remains useful as a twelve-portal interaction language.

However the research now distinguishes:

```text
12 equal ecliptic sign sectors
13 IAU zodiac constellations
actual 3D stellar neighborhood
```

Therefore a future face click should work as:

```text
face / portal selection
  → portal registry lookup
  → selected cultural or astronomical layer
  → actual ecliptic/celestial camera direction
```

not:

```text
face normal = physical direction by definition
```

This preserves the intuitive `star house` interface without fabricating celestial coordinates.

Finding: **PASS as portal architecture.**

Candidate laws:

> **A Star House Is a Portal, Not a Claim That the Stars Form a House in Space.**

> **Face Index and Sky Direction Are Different Coordinates.**

---

# 8. Gaia works better as a planetary stewardship interface than as a claimed planetary mind

The Earth-focused render names the current planetary node `Gaia` and exposes a human-authored stewardship intention:

> Preserve and restore conditions in which Earth's living systems can persist, diversify, recover, and flourish across generations.

This intentionally replaces the narrower candidate phrase `Gaia wants everything to grow`.

The reason is scientific and philosophical:

- real ecosystems include growth and reproduction;
- they also include mortality, decomposition, disturbance, carrying limits, dormancy, succession, and recovery;
- modern Earth-system science establishes coupled planetary systems, not a scientifically demonstrated singular conscious planetary desire.

The Gaia layer can therefore help humans relate personally to Earth while retaining a provenance firewall.

Finding: **BOUNDED PASS.**

Candidate law:

> **A Stewardship Covenant Speaks for Human Responsibility, Not for Proven Planetary Sentience.**

---

# 9. Human nodes are local sovereign endpoints, not lesser identities

The Earth view includes sample human-node markers around the Gaia/ARCnet frame.

They represent only the scale relationship:

```text
planetary network scope
  contains / serves
many sovereign participant endpoints
```

They do not represent:

- Gaia owning participants;
- a hierarchy of human worth;
- human Identity becoming a subcomponent of a planetary persona;
- planetary authority automatically superseding participant consent.

Finding: **PASS with sovereignty firewall.**

Candidate law:

> **Planetary Node Is a Network Scope, Not a Superior Identity.**

---

# 10. Vitae moves out of the physical orbital diagram without being removed from the system

The previous shared typed-icosahedron work remains mathematically legitimate as a co-rendering experiment:

```text
Tempus → 12 vertices / selected edges
Vitae  → 20 faces
```

But this test shows that Vitae does not need to be a literal layer physically surrounding the solar system.

A cleaner separation is:

```text
solar-system view
= astronomy + Tempus navigation + planetary ARCnet nodes

Vitae view
= participant developmental / curriculum atlas

practice event
= Vitae changes discretely and captures current Tempus context
```

The historical Platonic association `icosahedron → water` may remain an optional source-labelled symbolic overlay on the Vitae atlas, especially given Vitae's existing path/river metaphor, but this is interpretive resonance rather than historical derivation.

Finding: **PASS after scale separation.**

---

# 11. Future interplanetary ARCnet becomes more concrete

Once ARCnet is treated as a host-attached local network frame, extension no longer means dragging one Earth cube across the entire solar system.

It means adding peer scopes:

```text
Earth / Gaia ARCnet node
Moon / Luna ARCnet node
Mars ARCnet node
orbital-habitat nodes
asteroid / research / mining nodes
future planetary nodes
```

Each can maintain its own local participant and service topology while communicating across long-delay links.

NASA's Delay/Disruption Tolerant Networking and LunaNet work, together with IETF Bundle Protocol v7, establish a real modern precedent for the transport problem.

Potential boundary:

```text
ARCnet Edge Contract
= who may request what from whom, with which disclosure and receipt constraints

DTN / BPv7 or successor
= how a message survives light-time, interruption, and intermittent connectivity
```

Finding: **PASS as long-range transport research direction.**

Candidate law:

> **Light-Time Changes Transport, Not Sovereignty.**

---

# 12. Renderer limitations

This v0.1 renderer is intentionally research-grade.

Current limitations:

1. repository renderer uses a fixed 2026-08-24 prototype snapshot rather than a production ephemeris stream;
2. the richer local research artifact contains a full 2026 sampled animation, but the repository artifact prioritizes a compact auditable snapshot;
3. body radii are display markers, not physical size-to-scale;
4. asteroid, Kuiper, and Oort populations are statistical display samples rather than catalogs of actual objects;
5. outer-system radial compression is nonlinear;
6. dodecahedral portal-to-celestial-direction mapping is not yet implemented;
7. IAU constellation boundaries are not yet rendered;
8. ESA Gaia nearby-star data is not yet ingested;
9. no DTN runtime exists;
10. no planetary-node runtime or governance model is being promoted by this renderer.

---

# 13. Falsification disposition

```text
actual bodies move independently                         PASS
ARCnet attached to Earth/Gaia state vector               PASS
local ARCnet topology remains invariant                  PASS
Moon remains physical Earth satellite                    PASS
Tempus shell does not define planetary orbits            PASS
Oort Cloud remains non-polyhedral physical context       PASS
dodecahedron useful as cosmic/navigation interface       BOUNDED PASS
zodiac / constellation / nearby-star layers separated    PASS
Gaia useful as human-authored stewardship interface      BOUNDED PASS
Gaia scientifically proven conscious                     FAIL / not asserted
human Identity subordinate to planetary persona          FAIL / prohibited
Vitae required as physical solar-system shell             FAIL
Vitae retained as event-driven developmental layer       PASS
```

Overall:

> **BOUNDED PASS — the ephemeris solar-system / Gaia-anchored ARCnet model is the leading primary celestial interface. The previous polyhedral-carrier models remain valuable as abstract geometry modes but should no longer look like the project's literal astronomical mechanics.**

---

# 14. Next gates

The next research/build sequence should be:

1. **Production ephemeris adapter** — JPL Horizons/SPICE-equivalent ingestion with explicit frame, center, epoch, timescale, model/version, and precision.
2. **IAU constellation portal layer** — render actual constellation boundaries separately from the twelve equal sign sectors.
3. **Gaia stellar-neighborhood layer** — ingest three-dimensional nearby-star positions, distances, and proper motions for outward-facing portal views.
4. **Earth/Gaia stewardship registry review** — decide whether the optional covenant belongs to Hope, governance doctrine, a public planetary commons layer, or only Tempus/ARCnet presentation metadata.
5. **Planetary node / DTN study** — test Earth↔Luna as the first concrete interplanetary ARCnet transport topology without changing Edge Contract authority semantics.

No canonical module topology change is made by this document.
