---
title: "Chain Specs"
status: canonical
visibility: public
last_updated: 2026-05-26
description: "Implementation-facing specifications and artifact policy for ARCnet / Arcanum chain."
---

# Chain Specs

This folder contains implementation-facing chain specifications.

Canonical architectural constraints come from:

- `docs/architecture/arcanum-chain.md`
- `docs/architecture/app-chain-doctrine.md`
- `docs/doctrine/layer-boundaries.md`
- `docs/governance/economic-principles.md`
- `docs/governance/treasury-constitution.md`

## Artifact policy

### Tracked generated artifacts

The chain may track generated files when they are required for downstream consumers, API documentation, or current build reproducibility.

Currently accepted tracked generated surfaces include:

- `chains/arcanum/x/*/types/*.pb.gw.go`
- `chains/arcanum/docs/static/openapi.json`

These are generated artifacts, not canonical doctrine.

### Untracked local build artifacts

Compiled binaries must not be tracked in git.

Ignored path:

- `chains/arcanum/bin/`

### Archived disabled source

Disabled source files should not remain in the active chain implementation tree.

Historical disabled files belong under:

- `docs/archive/chain/arcanum/app-disabled/`
