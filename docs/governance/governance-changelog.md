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

## 2026-07-28 — Wave XXI two-stage bootstrap model

The Human Architect approved a bounded two-stage bootstrap model for
Wave XXI.

Stage A promotes the verified read-only smoke-verification capability when
an exact-head protected preview is correctly classified fail-closed, no
application routes are executed, and no credentials, cookies, authorization
headers, share tokens, or authenticated bypass are used.

Stage B remains mandatory after merge. It requires the exact public
production deployment to pass all ten canonical routes before Wave XXI may
be declared operationally complete.

Provider protection remains an overall smoke failure and is never interpreted
as application-health success.
