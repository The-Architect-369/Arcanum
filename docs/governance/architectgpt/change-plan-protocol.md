---
title: "Repository Change Plan and Patch Bundle Protocol"
status: canonical
version: 1.0
last_updated: 2026-07-23
---

# Repository Change Plan and Patch Bundle Protocol

## Purpose

This protocol defines how Architect GPT represents repository writes before execution and how deterministic patch bundles are derived from those plans.

A change plan is a reviewable statement of intended repository mutation. A patch bundle is a canonical, machine-readable normalization of that plan. Neither artifact grants authority to execute a change.

## Authority boundary

- Change plans are evidentiary and operational artifacts.
- They do not override doctrine, governance, or repository branch protections.
- Permission classes remain governed by the capability registry.
- A valid plan does not satisfy authorization by itself.
- W3 and C1 operations still require their independent approval and verification gates.

## Exact-base requirement

Every change plan must bind to the exact repository HEAD through `base_commit`.

The bundle generator must reject a plan when:

- `base_commit` differs from `git rev-parse HEAD`;
- the target branch is not `mobile`;
- the permission class is unsupported;
- a path is absolute, empty, traverses upward, or enters `.git/`;
- duplicate target paths exist;
- a rename omits `from_path`;
- a declared content digest is not a lowercase SHA-256 value.

## Supported operations

A plan may contain these actions:

- `create`
- `update`
- `delete`
- `rename`

Every operation requires a repository-relative target path and a human-readable purpose.

Rename operations additionally require `from_path`.

## Deterministic bundle

The generator:

1. validates the plan against repository state;
2. normalizes all paths;
3. sorts operations by target path and action;
4. emits a canonical repository patch bundle;
5. calculates `bundle_sha256` over the compact canonical payload before the digest field is added.

The same valid plan against the same exact HEAD must always produce the same bundle digest.

## Non-goals

The Wave VII bundle does not yet contain file bodies or a unified diff. It records the authorized mutation surface and optional content digests. Unified diff materialization is a later execution-stage concern and must remain traceable to the plan bundle.

## Canonical surfaces

- Schema: `docs/governance/architectgpt/change-plan.schema.json`
- Generator: `scripts/architect/change-plan.py`
- Fixtures: `scripts/architect/test-change-plan.sh`
- Reports: `.architect-reports/orchestration/change-plans/`

## Promotion condition

Wave VII is not promotable unless repository verification proves that the generator:

- accepts a valid exact-head plan;
- produces deterministic output;
- rejects stale-base plans;
- rejects unsafe paths;
- rejects duplicate target paths;
- rejects malformed rename operations.
