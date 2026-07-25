---
title: "Repository Timeline Graph Protocol"
status: canonical
visibility: internal
last_updated: 2026-07-25
arcanum_phase: Pre-Genesis
authority: evidentiary-only
---

# Repository Timeline Graph Protocol

## Purpose

The Repository Timeline Graph converts bounded Git history into deterministic evidence about file lineage. It supports comparison, audit, and rollback planning without mutating repository history or granting rollback authority.

## Canonical surfaces

- Generator: `scripts/architect/repository-timeline.py`
- Schema: `docs/governance/architectgpt/repository-timeline.schema.json`
- Fixtures: `scripts/architect/test-repository-timeline.sh`
- Reports: `.architect-reports/orchestration/repository-timeline/`

## Inputs

The generator accepts one or more repository-relative paths and a bounded history limit between 1 and 200 commits.

Paths must remain inside the repository. Absolute paths and parent-directory escapes are rejected.

## Node model

Each file-version node records:

- deterministic node identifier
- repository-relative path
- commit SHA and parent SHAs
- author timestamp and author name
- commit subject
- existence state
- Git blob SHA
- content SHA-256
- content size
- added and deleted line counts for the commit/path pair

## Edge model

Nodes for the same path are ordered from oldest to newest. Consecutive versions are connected with a `superseded_by` edge.

The graph does not claim causal meaning beyond observed Git lineage.

## Determinism

For an unchanged repository head, path set, and history limit, the report must be byte-equivalent except for no runtime-generated timestamps, because none are permitted in the canonical report.

The report is bound to:

- exact repository HEAD
- sorted unique path set
- bounded history limit
- exact commit metadata and blobs

## Rollback guidance

Rollback guidance is advisory evidence only. The graph may identify a prior file version suitable for inspection, but rollback execution must occur through an authorized change plan and normal promotion controls.

The timeline graph must never:

- move a branch ref
- revert or cherry-pick a commit
- edit a worktree
- declare a rollback safe without verification
- supersede constitutional or human authority

## Verification requirements

Canonical fixtures must prove:

- deterministic repeat output
- exact-head binding
- node and edge consistency
- latest-node indexing
- content and blob hashing
- bounded history enforcement
- path-escape rejection
- evidentiary-only authority

## Relationship to adjacent controls

The timeline graph consumes existing Git history. It may inform repository change plans, build diagnostics, and rollback proposals, but it does not modify those controls and does not promote evidence by itself.
