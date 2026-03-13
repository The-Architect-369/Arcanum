---
title: "Governance Changelog"
status: canonical
visibility: public
last_updated: 2026-03-02
description: "Versioned changelog for governance and constitutional documentation."
---

# Governance Changelog

This changelog tracks **governance-facing** documentation changes: constitutional model, treasury, policy, and interface charters.

---

## 2026-03-02 — Governance Interface Normalization

### Changed
- Normalized formatting and metadata for `docs/governance/hopegpt/hope-guardian.md`.

### Added
- `docs/governance/architectgpt/architect-gpt.md` as the **single canonical** Architect GPT specification.

### Archived
- `docs/archive/architectgpt-core.md`
- `docs/archive/architectgpt-extended.md`
- `docs/archive/architect-log.md`

### Updated
- `docs/governance/architectgpt/architect-gpt-manifest.yaml` updated to reference the consolidated canonical file.
- `scripts/verify-sync.sh` updated to validate the consolidated spec + manifest paths.

### Notes
This change is an editorial/structural normalization pass.  
No governance authority, invariants, or rights semantics were altered.