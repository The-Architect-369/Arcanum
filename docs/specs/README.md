---
title: "Specs"
status: canonical
visibility: public
last_updated: 2026-08-26
description: "Implementation-facing specifications derived from doctrine, architecture, governance, and module canon."
---

# Specs

This folder contains implementation-facing specifications.

Specs translate doctrine and architecture into buildable constraints without replacing canon.

## Subfolders

- `app/` — application behavior, routing, gates, PWA surfaces, and module interaction rules
- `chain/` — protocol/module specifications, when added
- `economy/` — implementation-facing economic contracts
- `geometry/` — exact coordinate, topology, projection, scale-firewall, and geometry-free-equivalence contracts
- `identity/` — identity implementation contracts
- `intelligence/` — intelligence/Architect implementation contracts
- `modules/` — module implementation contracts
- `network/` — network and peer interaction contracts
- `protocol/` — protocol-facing implementation contracts
- `roadmap/` — roadmap implementation contracts
- `tempus/` — temporal provenance, observer/frame, local receipt, and optional witness contracts

## CE-W01 machine-readable contracts

Geometry:

- `geometry/arcnet-coordinate-frame.md` — semantic/mathematical contract
- `geometry/arcnet-coordinate-frame.schema.json` — JSON Schema boundary
- `geometry/arcnet-coordinate-frame.v0.1.json` — normalized coordinate registry
- `geometry/arcnet-coordinate-frame.vectors.v0.1.json` — deterministic falsification vectors

Tempus:

- `tempus/tempus-anchor.md` — semantic temporal provenance contract
- `tempus/tempus-anchor.schema.json` — JSON Schema boundary
- `tempus/tempus-anchor.vectors.v0.1.json` — serialization/digest and falsification vectors

Termux/Ubuntu verification:

```bash
pnpm verify:ce-w01
```

The verifier uses only the Python standard library. It checks the implementation-critical CE-W01 geometry and Tempus invariants without requiring a new runtime dependency.

Construction-era specs remain subordinate to controlling doctrine and canon even when they provide exact implementation constraints.
