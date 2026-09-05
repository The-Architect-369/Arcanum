---
title: Architect GPT Machine-Readable Continuity Index
status: canonical-specification
version: 2.0
visibility: public
last_updated: 2026-09-04
continuity_epoch: ARC-CONT-EPOCH-2
---

# Architect GPT Machine-Readable Continuity Index

## Purpose

The continuity index is the deterministic, derived projection of active Architect
session records plus a compact summary of the sealed predecessor epoch.

It is evidence, not authority.

## Authority boundary

Current authority is:

1. Human Architect and controlling doctrine/canon.
2. `conversation-memory-contract.md` for continuity rules.
3. `continuity-epoch.json` for the exact predecessor seal and active-epoch boundary.
4. Active `architect-log.md` and `sessions/` for post-seal continuity.
5. `continuity-index.json` as deterministic derived metadata.

The index must not allocate IDs, infer missing history, repair records, or reproduce
developmental narrative bodies.

## Epoch boundary

`ARC-CONT-EPOCH-1` is sealed through exact commit
`1212f02b61ab0895a84700b9371847a6c5ebe47f`.

The seal records exact Git blob identities for the predecessor controlling log and
the nine predecessor session records `ARC-SES-2` through `ARC-SES-10`, plus the
permanent reservation of `ARC-SES-1`.

`ARC-CONT-EPOCH-2` starts at `ARC-SES-11`.

The validator must prove that every sealed blob still matches the recorded path at
the sealed commit. Missing Git history fails closed.

## Canonical files

- Epoch seal: `docs/governance/architectgpt/continuity-epoch.json`
- Epoch schema: `docs/governance/architectgpt/continuity-epoch.schema.json`
- Index: `docs/governance/architectgpt/continuity-index.json`
- Index schema: `docs/governance/architectgpt/continuity-index.schema.json`
- Generator: `scripts/architect/generate-continuity-index.py`
- Validator: `scripts/architect/validate-continuity-index.py`
- Active session validator: `scripts/architect/validate-session-records.py`

## Index shape

The v2 top level contains:

- `schema`
- `record_type`
- `authority`
- `epoch_seal`
- `predecessor_epoch`
- `active_epoch`
- `sessions`

`predecessor_epoch` is a compact summary only. Exact historical paths and blob
identities remain in the epoch seal.

`sessions` contains only active-epoch session projections.

## Active session projection

Each active session entry contains:

- `session_id`
- `task_id`
- `status`
- `record_path`
- `record_sha256`
- `head_commit_end`
- `decision_ids`
- `idea_ids`
- `correction_ids`
- `deferred_question_ids`
- `next_task_id`

The SHA-256 is computed from the exact active Markdown record bytes.

## Ordering and gaps

Active sessions are ordered by numeric `ARC-SES-N`.

If active records exist, their numbers must form a contiguous sequence beginning at
11. No predecessor ID may reappear in the active ledger.

An empty active ledger is valid.

## Deterministic serialization

The generator emits UTF-8 JSON with two-space indentation, lexicographically sorted
object keys, deterministic array ordering, LF endings, and one trailing newline.

It contains no wall-clock timestamp, random identifier, current HEAD, or
environment-specific path.

## Validation

Validation fails when:

- the epoch seal shape or constants are wrong;
- the sealed predecessor commit is unavailable;
- a sealed path resolves to a Git blob different from the recorded blob;
- a sealed predecessor body remains in the active session ledger;
- active session validation fails;
- an active ID is below 11, duplicated, or leaves a numeric gap;
- the committed index differs from deterministic regeneration;
- the active log does not declare the active epoch and predecessor commit.

GitHub Actions uses full-history checkout so sealed Git object verification remains
available in CI.

A green result proves integrity and determinism only. It does not grant merge,
deployment, write, or ratification authority.
