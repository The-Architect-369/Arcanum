---
title: "Repo Interface"
status: canonical
visibility: public
last_updated: 2026-03-23
description: "Grounding rules and default operating protocol for reasoning about the Arcanum repository."
---

# Architect Repository Interface

This document defines how architectural and doctrinal reasoning must interface with the Arcanum repository.

## Default repository contract

Unless the user explicitly names a different repository or branch, phrases such as:

- `check my repo`
- `my repo`
- `the repo`
- `check Arcanum`

must resolve to:

- Repository: `https://github.com/The-Architect-369/Arcanum.git`
- Branch: `main`
- Workspace root: Arcanum monorepo root

The user is not required to restate this default for routine analysis inside the Architect GPT context.

If a different repository or branch is explicitly named, that explicit reference wins for that task.

## Principle

**No authoritative analysis may be issued without a declared repository grounding state.**

The assistant must determine and declare the grounding state automatically. The burden is on the assistant, not on the user, to resolve the best available grounding before analysis.

If grounding is insufficient, the correct behavior is refusal or request for regeneration, not inference.

---

## Grounding states

Any analysis must explicitly declare one of:

### 1) `live-file`
- Specific file(s) were opened directly (content known)
- Use for drafting, editing, or validating known documents

### 2) `index-snapshot`
- The repo index artifact was used (paths/metadata known)
- Use for structural integrity checks and tree audits

### 3) `partial-scan`
- Only a subset of the repo was observed
- Allowed for asking questions, not for conclusions

**Forbidden**
- assumed structure
- cached memory without declaration
- inference-based certainty

---

## Automatic preflight on default repo tasks

When the user asks to inspect or analyze `my repo` without naming a repository, branch, or specific file set, the assistant must:

1. Resolve the default repository and branch automatically
2. Read `docs/repo/repo-index.json` and inspect `generated_at` and `commit`
3. Check sync evidence through `scripts/verify-sync.sh`, CI, or equivalent live validation when available
4. Use `live-file` for requested files when available; otherwise use `index-snapshot`
5. If the repo index is stale, missing, or inconsistent with visible branch state, pause substantive analysis and instruct the maintainer to re-sync first

This preflight is automatic and should happen before deeper assistance.

---

## Canonical structural artifact

The repo maintains a deterministic structural snapshot:

- `docs/repo/repo-index.json`

This file is treated as authoritative for:
- what exists
- where it lives
- basic metadata needed for integrity checks

It is not a content mirror, and it does not replace opening live files when content-level reasoning is required.

---

## Operating rule

When repo structure or repo health matters:

1. Prefer `live-file` if the relevant file is already open
2. Otherwise require `index-snapshot` via `docs/repo/repo-index.json`
3. If either is unavailable or stale, require regeneration
4. Use `scripts/verify-sync.sh` as the first integrity gate before asserting structural coherence

---

## Human maintainer responsibilities

- Keep `docs/repo/repo-index.json` current
- Run `scripts/verify-sync.sh` before claiming structural integrity
- Treat failing checks as a stop-ship signal for documentation releases

---

## Tooling references

- Generator spec: `docs/repo/repo-index-generator-spec.md`
- Generator script: `scripts/repo-index.sh`
- Verification script: `scripts/verify-sync.sh`

## Archive policy

Files under `docs/archive/` are historical only.

They may be consulted only for:
- explicit migration work
- historical comparison
- audit trails

They must not be cited as active canonical instruction when a current canonical file exists elsewhere.
