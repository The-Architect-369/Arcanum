---
title: "Repo Interface"
status: canonical
visibility: public
last_updated: 2026-05-31
description: "Grounding rules and GitHub-first branch workflow for reasoning about the Arcanum repository."
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
- Stable branch: `main`
- Integration branch: `mobile`
- Workspace root: Arcanum monorepo root

The user is not required to restate this default for routine analysis inside the Architect GPT context.

When no branch is explicitly named, branch choice must follow task intent:

- Use `main` for stable-state inspection, deployment-facing questions, and canonical/live-state reads.
- Use `mobile` for implementation work, documentation updates, repository writes, and active workstream changes.

If a different repository or branch is explicitly named, that explicit reference wins for that task.

## Principle

**No authoritative analysis may be issued without a declared repository grounding state and active branch role.**

The assistant must determine and declare the grounding state automatically. The burden is on the assistant, not on the user, to resolve the best available grounding before analysis.

If grounding is insufficient, the correct behavior is refusal or request for regeneration, not inference.

---

## GitHub-first workflow mode

Structured repository changes follow a GitHub-first workflow.

- GitHub branch state is the canonical integration surface for structured changes.
- Local working copies are verification, pull, and merge surfaces; they must not silently supersede GitHub branch truth.
- `mobile` is the default integration branch for implementation and documentation updates unless the user names another branch.
- `main` remains the stable branch and merge target for work that is already verified and explicitly approved.
- Merge to `main` only after green verification and explicit Human Architect approval.

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

When the user asks to inspect, analyze, or update `my repo` without naming a repository, branch, or specific file set, the assistant must:

1. Resolve the default repository automatically.
2. Resolve the active branch from task intent:
   - `main` for stable inspection
   - `mobile` for implementation/update work
3. Read `docs/repo/repo-index.json` and inspect `generated_at` and `commit`.
4. Check sync evidence through `scripts/verify-sync.sh`, CI, or equivalent live validation when available.
5. Use `live-file` for requested files when available; otherwise use `index-snapshot`.
6. If the repo index is stale, missing, or inconsistent with visible branch state, pause substantive analysis and instruct the maintainer to re-sync first.

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

1. Prefer `live-file` if the relevant file is already open.
2. Otherwise require `index-snapshot` via `docs/repo/repo-index.json`.
3. If either is unavailable or stale, require regeneration.
4. Use `scripts/verify-sync.sh` as the first integrity gate before asserting structural coherence.
5. Declare whether the active branch role is `stable` (`main`) or `integration` (`mobile`).

---

## Human maintainer responsibilities

- Keep `docs/repo/repo-index.json` current on the branch being worked.
- Run `scripts/verify-sync.sh` before claiming structural integrity.
- Treat failing checks as a stop-ship signal for documentation releases.
- Pull from GitHub before local continuation when structured changes have been written directly to the active branch.

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
