---
title: "Architect GPT Change Impact Graph Protocol"
status: canonical-control
version: "1.0"
phase: Pre-Genesis
---

# Change Impact Graph Protocol

## Purpose

The Change Impact Graph converts an exact Git base/head comparison into deterministic evidence about the likely blast radius of a repository change.

It answers:

- which files changed
- which local source files directly or transitively depend on changed files
- which routes, packages, tests, runtime surfaces, and canonical documents may be affected
- which verification surfaces should be required
- how much change risk is present before promotion

The report is advisory and evidentiary. It cannot authorize a repository write, merge, deployment, rollback, or constitutional change.

## Canonical implementation

- Generator: `scripts/architect/impact-graph.py`
- Schema: `docs/governance/architectgpt/impact-graph.schema.json`
- Fixtures: `scripts/architect/test-impact-graph.sh`
- Reports: `.architect-reports/orchestration/impact-graph/`

## Inputs

The generator requires:

- a base Git ref
- a head Git ref
- an optional TypeScript project path

The base must be an ancestor of the head. Both refs are resolved to full commit SHAs before analysis.

## Analysis model

### Changed files

Changes are derived from:

```bash
git diff --name-status --find-renames BASE HEAD
```

Supported change types are create, update, delete, and rename.

### Dependency impact

For the configured TypeScript project, the generator resolves local static and dynamic imports using repository-relative and `@/` source aliases.

It produces:

- direct dependents: files that directly import a changed source file
- transitive dependents: files that depend on a changed source file through one or more intermediate imports
- import edges touching impacted files

This analysis is conservative. Runtime-only dynamic references, generated code, non-TypeScript languages, and aliases not represented by the supported resolver may require additional inspection.

### Product and runtime impact

Impacted paths are classified into:

- application routes
- packages or app surfaces
- test files
- API routes
- middleware
- layouts
- server runtime paths
- CI workflows
- deployment configuration
- canonical doctrine, governance, architecture, and compliance documents

### Verification matrix

The report selects verification categories from observed impact:

- `repository_integrity`
- `web_typecheck`
- `web_production_build`
- `targeted_tests`
- `browser_route_smoke`
- `deployment_preview`
- `doctrine_guard`

Selection does not prove that verification occurred. It declares the minimum expected evidence surface for the change.

### Risk

Risk is a bounded score from 0 through 100 derived from changed-file count, dependent count, route impact, runtime impact, canonical impact, and destructive file operations.

Risk levels are:

- low
- moderate
- high
- critical

The score is a triage signal, not a governance decision.

## Determinism

For identical repository content and identical resolved base/head SHAs, the report must be byte-stable except for the output path chosen by the caller.

Arrays and graph edges are sorted. The final `report_sha256` is calculated over the canonical report before the digest field is added.

## Safety constraints

The control must:

- reject equal base and head commits
- reject a base that is not an ancestor of head
- reject project paths outside the repository
- normalize and contain repository paths
- perform no repository mutations
- perform no provider writes
- retain `authority: evidentiary_only`

## Known boundaries

Wave XI initially covers repository file changes and the configured web TypeScript graph. It does not yet provide complete semantic symbol analysis, coverage mapping, browser execution, Go/Cosmos dependency analysis, or automatic patch application.

Those remain future capability layers.
