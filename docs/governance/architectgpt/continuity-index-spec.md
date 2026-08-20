---
title: Architect GPT Machine-Readable Continuity Index
status: canonical-specification
version: 1.0
visibility: public
ratified_by: Human Architect
ratified_at: 2026-08-16
---

# Architect GPT Machine-Readable Continuity Index

## Purpose

This specification defines the deterministic machine-readable continuity index introduced by ARC-4. The index exists to make canonical Architect session continuity mechanically discoverable and verifiable without creating a second source of continuity authority.

## Authority boundary

The following authority order is unchanged:

1. `docs/governance/architectgpt/architect-log.md` is the sole controlling cross-session narrative log.
2. `docs/governance/architectgpt/sessions/` is the canonical per-session ledger.
3. `docs/governance/architectgpt/continuity-index.json` is a generated, derived, non-authoritative projection of those canonical records plus explicit reviewed reservation metadata from the Architect manifest.
4. Notion is an operational mirror. It is never an input to continuity-index generation and cannot allocate or redefine canonical identifiers.

The index MUST be fully regenerable from canonical GitHub evidence. It MUST NOT contain independent narrative truth, allocate session identifiers, repair records, infer missing sessions, or supersede the controlling log or per-session ledger.

## Canonical files

- Specification: `docs/governance/architectgpt/continuity-index-spec.md`
- JSON Schema: `docs/governance/architectgpt/continuity-index.schema.json`
- Generated index: `docs/governance/architectgpt/continuity-index.json`
- Generator: `scripts/architect/generate-continuity-index.py`
- Validator: `scripts/architect/validate-continuity-index.py`

JSON is the ratified canonical serialization format.

## Canonical inputs

Session entries derive only from validated Markdown records in `docs/governance/architectgpt/sessions/`.

Reserved session identifiers derive from `session_schema_control.reserved_legacy_session_ids` in `docs/governance/architectgpt/architect-gpt-manifest.yaml`. ARC-SES-1 remains a reservation and MUST NOT be materialized as a synthetic session record.

The controlling Architect log is a reconciliation input to the validator for closed-session orphan detection. It is not copied into the index.

ARC-SES-2 remains the reviewed grandfathered record defined by ARC-3. ARC-3 filename, lifecycle, privacy, Human-review, and typed-record semantics are unchanged.

## Index shape

The top-level document contains:

- `schema`: `arcanum.architect.continuity-index/v1`
- `record_type`: `continuity-index`
- `authority`: `derived-non-authoritative`
- `controlling_log`: the canonical Architect log path
- `session_ledger`: the canonical session-ledger path
- `reserved_sessions`: reviewed reserved IDs, ordered numerically
- `sessions`: canonical session records, ordered numerically

Each reserved-session entry contains only:

- `session_id`
- `state`, fixed to `RESERVED`
- `source_path`

Each session entry contains only:

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

These fields are continuity pointers and integrity anchors. Titles, outcomes, domain, priority, privacy detail, verification prose, provider mirrors, and narrative summaries remain in canonical source records and are deliberately not duplicated into the index.

## Ordering

Session and reservation order is determined by the integer suffix of `ARC-SES-N`.

Lexicographic filename order, creation date, task number, and wall-clock time MUST NOT determine continuity order.

The used-ID set is the union of canonical session IDs and explicit reserved IDs. From 1 through the greatest represented session number, every integer MUST be represented by either a canonical session record or an explicit reservation. A numeric hole is a validation failure.

## Deterministic serialization

The generator MUST produce UTF-8 JSON using:

- two-space indentation;
- lexicographically sorted object keys;
- array ordering defined by this specification;
- `ensure_ascii=false`;
- LF line endings;
- exactly one trailing newline.

The generated document MUST NOT contain `generated_at`, the current commit SHA, random identifiers, environment-specific paths, or any other volatile value.

`record_sha256` is the lowercase SHA-256 digest of the exact source Markdown bytes for the indexed session record.

## Generator behavior

The generator MUST:

1. invoke the ARC-3 session-record validator before projection;
2. read canonical session Markdown records only from the configured ledger;
3. read only the explicit reviewed reservation list from the canonical Architect manifest;
4. reject duplicate or malformed session identifiers;
5. hash exact record bytes;
6. order records numerically;
7. emit only the schema-defined derived fields;
8. serialize deterministically.

The generator MUST NOT allocate IDs, alter source records, alter the controlling log, consult Notion, or repair missing evidence.

## Validator behavior

The continuity validator MUST fail closed when any of the following is true:

- the ARC-3 session ledger is invalid;
- the committed index differs byte-for-byte from deterministic regeneration;
- a session identifier is duplicated;
- a typed child identifier is duplicated across canonical sessions;
- a numeric session ID is neither recorded nor explicitly reserved;
- a reserved identifier collides with a canonical record;
- session ordering is non-numeric or unstable;
- an indexed record path is absent or mismatched;
- `record_sha256` does not match exact source bytes;
- a `CLOSED` or `BACKFILL` session lacks exactly one controlling-log block containing both its session ID and canonical record path;
- the controlling log names a non-reserved session that has no canonical record;
- a manually inserted or stale index entry survives in the committed document.

`OPEN`, `REVIEW-PENDING`, and `NEEDS-CORRECTION` records may be indexed while active and do not require a closure-log block. Closure-log reconciliation begins when a record reaches `CLOSED` or `BACKFILL`.

## CI integration

ARC-4 validation runs in the existing Verify Sync GitHub Actions job after repository-level verification. This preserves one verification pipeline rather than establishing a competing workflow or continuity authority.

A green continuity validation proves deterministic regeneration and cross-record consistency. It does not grant ratification authority and it does not authorize merge, deployment, or identifier allocation.

## Non-scope

ARC-4 does not:

- amend the ARC-3 per-session record schema;
- backfill ARC-SES-1;
- modify Tempus, Runtime, economics, chain, native, or application surfaces;
- migrate GitHub canon into Notion;
- merge, promote, or deploy the Wave XXIV branch.

Human Architect review remains the ratification and session-allocation authority.
