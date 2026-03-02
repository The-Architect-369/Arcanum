---
title: "Docs"
status: canonical
visibility: public
last_updated: 2026-02-28
description: "Documentation root for Arcanum: doctrine, architecture, governance, modules, repo discipline, and Vitae."
---

# Arcanum Docs

This folder is the **canonical documentation surface** for Arcanum and ARCnet.

**Naming**
- **ARCnet** = the sovereign network / infrastructure substrate.
- **Arcanum** = the application ecosystem built on ARCnet (modules + lived experience).

If you’re new, start here:

- `docs/index.md` (navigation hub)
- `docs/architecture/arcanum-system-overview.md` (system map)
- `docs/whitepaper/executive-summary.md` (institutional overview)

---

## What lives where

This repo intentionally separates **meaning**, **mechanics**, and **execution**.

### Architecture
`docs/architecture/` holds cross-layer architecture, including the App ↔ Chain ↔ Doctrine boundary contract.

### Doctrine
`docs/doctrine/` holds constitutional principles: layer boundaries, identity, time, neutrality, and authority constraints.

### Governance
`docs/governance/` holds operational governance mechanics **and** the public/internal interface charters (HOPE Guardian + ArchitectGPT).

### Whitepaper (“White Pages”)
`docs/whitepaper/` is the investor/institutional-friendly modular narrative: problem, solution, architecture, tokenomics, governance model.

### Compliance
`docs/compliance/` captures risk posture, dignity boundaries, and licensing posture.

### Modules
`docs/modules/` is the human-facing entrypoint for HOPE, Tempus, and Vitae module docs.

### Vitae
`docs/vitae/` is the deep tree: authority + constitution + curriculum + implementation discipline.

### Repo discipline (non-optional)
`docs/repo/` defines the grounding rules for reasoning about the repository and provides the deterministic repo index artifacts.

---

## Canon / draft / evolution

- Files marked `status: canonical` are treated as stable references.
- Drafts can exist, but must be labeled clearly.
- The system can evolve, but the **layer boundaries** must not drift.

---

## Quick commands (repo discipline)

Generate/update the structural repo index:

```bash
bash scripts/repo-index.sh