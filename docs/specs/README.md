---
title: "Specs"
status: canonical
visibility: public
last_updated: 2026-09-02
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
- `runtime/` — sovereign local-runtime, protected storage, application registration, capability, local event/receipt, restart, and later witness-boundary contracts
- `tempus/` — temporal provenance, observer/frame, local receipt, and optional witness contracts

## CE-W01 implementation contracts

Geometry:

- `geometry/arcnet-coordinate-frame.md` — semantic/mathematical contract
- `geometry/arcnet-coordinate-frame.schema.json` — JSON Schema boundary
- `geometry/arcnet-coordinate-frame.v0.1.json` — normalized coordinate registry
- `geometry/arcnet-coordinate-frame.vectors.v0.1.json` — deterministic falsification vectors

Runtime:

- `runtime/local-runtime-boundary.md` — semantic sovereign local-runtime boundary for identity handles, protected storage, application registration, capability isolation, local events/receipts, Tempus persistence, offline restart, and later explicit ARCnet witnessing

Tempus:

- `tempus/tempus-anchor.md` — semantic temporal provenance contract
- `tempus/tempus-anchor.schema.json` — JSON Schema boundary
- `tempus/tempus-anchor.vectors.v0.1.json` — serialization/digest and falsification vectors

## CE-W01 machine-readable verification

Termux/Ubuntu verification:

```bash
pnpm verify:ce-w01
```

The verifier uses only the Python standard library. It currently checks the implementation-critical CE-W01 Geometry and Tempus machine-readable invariants without requiring a new runtime dependency.

The runtime boundary is presently a semantic implementation contract. Native runtime/restart evidence is required by later CE-W01/CE-W04 gates and must not be inferred from the Geometry/Tempus verifier.

Construction-era specs remain subordinate to controlling doctrine and canon even when they provide exact implementation constraints.
