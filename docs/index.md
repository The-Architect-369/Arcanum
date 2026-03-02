---
title: "Docs Index"
status: canonical
visibility: public
last_updated: 2026-02-28
description: "Navigation index for the Arcanum documentation tree (ARCnet canonical naming)."
---

# Docs Index

This is the **navigation hub** for the `docs/` tree.

**Canonical naming**
- **ARCnet**: the sovereign network / infrastructure layer.
- **Arcanum**: the application + doctrine + module ecosystem built on ARCnet.

---

## Start here

1) **System overview (recommended first):** `architecture/arcanum-system-overview.md`  
2) **White Pages (investor / institutional flow):**  
   - `whitepaper/executive-summary.md`  
   - `whitepaper/problem-solution.md`  
   - `whitepaper/technical-architecture.md`  
   - `whitepaper/tokenomics.md`  
   - `whitepaper/governance-constitutional-model.md`  
   - `compliance/compliance-risk.md`  
3) **Governance & constitution (canon):** `governance/governance-specification.md`  
4) **Modules (product surfaces):** `modules/`  
5) **Vitae (recognition layer):** `vitae/`  
6) **Repo discipline (indexing + grounding):** `repo/`

---

## Folder map (live structure)

> The folders listed below reflect the current docs structure and are intended to remain stable as the repo grows.

### `architecture/` — system architecture + boundaries
- `architecture/arcanum-system-overview.md`
- `architecture/app-chain-doctrine.md`
- `architecture/canonical-modules.md`
- `architecture/arcanum-chain.md`

### `doctrine/` — constitutional principles + layer constraints
- `doctrine/layer-boundaries.md`
- `doctrine/identity-model.md`
- `doctrine/temporal-model.md`
- `doctrine/metaphysical-neutrality.md`
- `doctrine/authority.md`
- `doctrine/architect-role.md`
- `doctrine/founder-transition.md`

### `governance/` — operational governance + public interfaces
- `governance/governance-specification.md`
- `governance/treasury-constitution.md`
- `governance/economic-principles.md`
- `governance/governance-changelog.md`

**Governance interfaces**
- HOPE Guardian (public interpretive charter): `governance/hopegpt/hope-guardian.md`
- ArchitectGPT (internal build interface): `governance/architectgpt/`

### `whitepaper/` — the “White Pages” (modular)
- `whitepaper/executive-summary.md`
- `whitepaper/problem-solution.md`
- `whitepaper/technical-architecture.md`
- `whitepaper/tokenomics.md`
- `whitepaper/governance-constitutional-model.md`

### `compliance/` — compliance posture + risk boundaries
- `compliance/compliance-risk.md`
- `compliance/dignity-content-boundaries.md`
- `compliance/license-and-attribution.md`

### `modules/` — module overview docs (human-facing)
- `modules/hope/hope.md`
- `modules/tempus/tempus.md`
- `modules/vitae/vitae-and-becoming.md`

### `vitae/` — recognition layer + constitution + curriculum tree
- `vitae/authority.md`
- `vitae/constitution/`
- `vitae/curriculum/`

### `repo/` — repository grounding + indexing (non-optional)
- `repo/repo-interface.md`
- `repo/repo-index-generator-spec.md`
- `repo/repo-index.json`

### `tooling/` — checksums + integrity tooling inputs
- `tooling/doctrine-checksums/`

### `manifesto/` — mythic tone (explicitly non-whitepaper)
- `manifesto/arcanum-manifesto.md`

### `reference/` — glossary + changelog (if present)
- `reference/` (if/when used)

---

## Rules of the road (short)

- Use **kebab-case** for files/folders.
- Prefer **relative links from `docs/`** (stable in GitHub + local preview).
- Treat `repo/repo-index.json` as the authoritative structural snapshot when doing structural analysis.
- When in doubt: update the docs tree **first**, then update prose.
