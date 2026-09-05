---
title: "Architect Repository Interface"
status: canonical
visibility: public
last_updated: 2026-09-04
description: "Grounding, branch, provenance, and change rules for reasoning about the Arcanum repository."
---

# Architect Repository Interface

## Purpose

This contract defines how Architect reasoning and assisted changes interface with the Arcanum repository.

## Default repository

Unless the Human Architect explicitly names another repository, references such as `my repo`, `the repo`, or `check Arcanum` resolve to:

```text
repository: https://github.com/The-Architect-369/Arcanum.git
persistent canonical branch: main
workspace root: Arcanum monorepo root
```

There is **no implicit permanent integration branch**.

## Branch model

`main` is the sole persistent canonical branch.

For read-only inspection, default to the exact current `main` state unless another ref is explicitly relevant.

For writes:

- never infer a historical branch name;
- use the branch explicitly named by the Human Architect when one is supplied;
- when isolation is required and authorized, create an explicitly named disposable task branch from the exact current `main` head;
- after verification and authorized merge/closure, delete the disposable branch;
- direct writes to `main` require an explicit instruction that unambiguously targets `main` and still require the applicable verification/recording discipline.

A temporary branch is not a second authority surface. Its contents remain candidate work until promoted.

## Grounding states

Every substantive repository analysis must declare one of:

### `live-file`
Specific live files were opened directly and their content is known.

### `index-snapshot`
The deterministic repository index was used for structural reasoning.

### `partial-scan`
Only a bounded subset of the repository was observed. This permits bounded findings but not whole-repository certainty.

Forbidden: assumed structure, undeclared cached state, or inference presented as live repository fact.

## Automatic preflight

For a default-repository task:

1. resolve the repository and exact active ref;
2. inspect `docs/repo/repo-index.json`, including its source commit;
3. compare the index source with the relevant visible branch/head state;
4. inspect available verification/CI/provider evidence when it matters to the requested claim;
5. open the live files governing the requested surface;
6. declare repository access/grounding state before conclusions.

A stale index limits structural claims; it does not authorize silently reconstructing the tree from memory.

## Source/index cadence

For substantive tracked-source changes, the normal cadence is:

1. make one coherent source change;
2. validate the source change;
3. commit the substantive source change;
4. regenerate `docs/repo/repo-index.json` with `scripts/repo-index.sh` from that source commit;
5. commit the deterministic index companion separately;
6. run exact-final-head verification;
7. publish or merge only after the required evidence is green.

The repository index is generated evidence. It must not be hand-edited or fabricated.

## Canonical structural artifact

`docs/repo/repo-index.json` is the deterministic structural snapshot for tracked paths and metadata. It does not replace opening live files for content-level reasoning.

## Authority and provenance

- controlling doctrine and ratified canonical documents govern meaning;
- live repository code governs current implementation state within those boundaries;
- Git branch/commit state governs repository identity;
- CI and provider state are evidence for verification/deployment claims;
- summaries, issues, pull requests, research, and history are evidence, not automatic authority.

## Archive and history policy

Files under `docs/archive/`, historical commits, closed issues, and closed pull requests are non-canonical provenance unless a current canonical document explicitly delegates a bounded migration/audit purpose to them.

Active instructions must not depend on archived Architect documents when a current canonical Architect contract exists.

When historical material is fully superseded and its lineage is preserved by Git, the active tree may retain only a compact provenance pointer rather than the full historical body.

## Human maintainer responsibilities

- keep the repository index synchronized with the source commit it describes;
- treat failed required checks as a stop condition;
- review exact diffs and exact heads before consequential promotion;
- explicitly authorize repository history writes, merge/deploy actions, and constitutional-impacting changes at the applicable gate.

## Tooling references

- Index generator spec: `docs/repo/repo-index-generator-spec.md`
- Index generator: `scripts/repo-index.sh`
- Repository verification: `scripts/verify-sync.sh`
- Forward baseline: `docs/repo/arcanum-baseline.md`
