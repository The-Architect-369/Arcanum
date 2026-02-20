---
title: "Docs"
status: canonical
visibility: public
last_updated: 2026-02-20
description: "Documentation root for Arcanum: doctrine, architecture, specs, vitae, and whitepaper."
---

# Arcanum Docs

This folder is the **canonical documentation surface** for Arcanum.

If you’re new, start with:

- **System overview:** `overview/arcanum-system-overview.md`
- **Whitepaper flow:** `whitepaper/executive-summary.md` → `whitepaper/problem-solution.md` → `whitepaper/technical-architecture.md`
- **Doctrine & governance (constitution):** `governance/constitution/`

## Folder Map (live structure)

- `index.md` — human-friendly navigation index (this is the “table of contents” for the whole docs tree)
- `overview/` — system overview + roadmaps  
  - `overview/arcanum-system-overview.md`  
  - `overview/roadmap-v1.md`, `overview/roadmap-v2.md`, `overview/roadmap-v3.md`
- `whitepaper/` — modular whitepaper sections (current drafting surface)
  - `executive-summary.md`, `problem-solution.md`, `technical-architecture.md`, `tokenomics.md`, `compliance-risk.md`, etc.
- `governance/constitution/` — constitutional canon + doctrine tooling  
  - `canonical-modules.md`, `layer-boundaries.md`, `metaphysical-neutrality.md`, `repo-interface.md`, `repo-index-generator-spec.md`, etc.
- `architecture/` — architecture law + cross-layer boundaries (app ↔ chain ↔ doctrine)  
  - `app-chain-doctrine.md`, `identity-model.md`, `temporal-model.md`, `tempus-structure.md`, `layer-boundaries.md`
- `specs/` — implementation-facing specifications
  - `specs/modules/` (Hope, Tempus, Identity, Economy, Wallet, etc.)
  - `specs/chain/` (chain overview, invariants, mana, hooks, treasury)
- `vitae/` — Vitae constitution + curriculum + content tree (deep structure)
- `genesis/` — sealed phase artifacts
  - `genesis/g1-hope-seal.md`
- `reference/` — glossary, changelog, license/attribution
- `architect/` — automation + canonical repo indexing artifacts
  - `architect/repo-index.json`
- `archive/` — deprecated or historical materials (non-canonical unless explicitly referenced)

## Naming + linking conventions

- **kebab-case** filenames and folders so links are stable and predictable.
- Link using **relative paths** from `docs/` (example: `overview/roadmap-v3.md`).
- Prefer **folder landing pages** (this `README.md` + `index.md`) over giant single-file docs.

## Change discipline (recommended)

- When structure changes, update:
  1) `docs/index.md` (human navigation)
  2) `architect/repo-index.json` (machine navigation, if generated)
- Keep `archive/` non-authoritative unless a document explicitly declares it canonical.
