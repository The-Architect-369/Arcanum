
---

## `docs/repo/repo-interface.md`

```md
---
title: "Repo Interface"
status: canonical
visibility: public
last_updated: 2026-02-28
description: "Grounding rules for reasoning about the Arcanum repository (ARCnet)."
---

# Architect Repository Interface

This document defines how architectural and doctrinal reasoning must interface with the repository.

## Principle

**No authoritative analysis may be issued without a declared repository grounding state.**

If grounding is insufficient, the correct behavior is refusal or request for regeneration—not inference.

---

## Grounding states

Any analysis must explicitly declare ONE of:

### 1) `live-file`
- Specific file(s) were opened directly (content known).
- Use for drafting, editing, or validating known documents.

### 2) `index-snapshot`
- The repo index artifact was used (paths/metadata known).
- Use for structural integrity checks and tree audits.

### 3) `partial-scan`
- Only a subset of the repo was observed.
- Allowed for asking questions, not for conclusions.

**Forbidden**
- assumed structure
- cached memory without declaration
- inference-based certainty

---

## Canonical structural artifact

The repo maintains a deterministic structural snapshot:

- `docs/repo/repo-index.json`

This file is treated as authoritative for:
- what exists
- where it lives
- basic metadata needed for integrity checks

It is not a content mirror.

---

## Operating rule

When repo structure matters:

1) Prefer `live-file` if you already have the file open.
2) Otherwise require `index-snapshot` via `docs/repo/repo-index.json`.
3) If either is unavailable or stale, require regeneration.

---

## Human maintainer responsibilities

- Keep `docs/repo/repo-index.json` current.
- Run `scripts/verify-sync.sh` before claiming structural integrity.
- Treat failing checks as a stop-ship signal for documentation releases.

---

## Tooling references

- Generator spec: `docs/repo/repo-index-generator-spec.md`
- Generator script: `scripts/repo-index.sh`
- Verification script: `scripts/verify-sync.sh`
