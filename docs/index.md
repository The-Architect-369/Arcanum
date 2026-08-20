---
title: "Docs Index"
status: canonical
visibility: public
last_updated: 2026-08-17
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
2) **Economic Constitution (controlling economic authority):** `economics/economic-constitution.md`  
3) **White Pages (investor / institutional flow):**  
   - `whitepaper/executive-summary.md`  
   - `whitepaper/problem-solution.md`  
   - `whitepaper/technical-architecture.md`  
   - `whitepaper/tokenomics.md`  
   - `whitepaper/governance-constitutional-model.md`  
   - `compliance/compliance-risk.md`  
4) **Governance mechanics + specialized constitutions:** `governance/governance-specification.md`  
5) **Modules (product surfaces):** `modules/`  
6) **Vitae (recognition layer):** `vitae/`  
7) **Repo discipline (indexing + grounding):** `repo/`
8) **Intelligence layer contract:** `specs/intelligence/intelligence-layer-contract.md`

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

### `economics/` — controlling economic constitution
- `economics/economic-constitution.md` — canonical controlling constitutional authority for ARCnet economic law and MANA, subordinate to system Doctrine

### `governance/` — operational governance + specialized constitutional instruments
- `governance/governance-specification.md`
- `governance/treasury-constitution.md`
- `governance/economic-principles.md` — canonical economic policy summary and delegated parameter registry, subordinate to the Economic Constitution
- `governance/governance-changelog.md`

**Governance interfaces**
- HOPE Guardian (public interpretive charter): `governance/hopegpt/hope-guardian.md`
- ArchitectGPT canonical specification: `governance/architectgpt/architect-gpt.md`
- Architect conversation-memory contract: `governance/architectgpt/conversation-memory-contract.md`
- Architect per-session record specification: `governance/architectgpt/session-record-schema.md`
- Architect per-session machine schema: `governance/architectgpt/session-record.schema.json`
- Controlling Architect cross-session log: `governance/architectgpt/architect-log.md`
- Architect session ledger: `governance/architectgpt/sessions/`

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

### `specs/` — implementation-facing contracts
- `specs/app/`
- `specs/chain/`
- `specs/intelligence/intelligence-layer-contract.md`

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
- Navigation and summary documents do not override controlling constitutional sources.
