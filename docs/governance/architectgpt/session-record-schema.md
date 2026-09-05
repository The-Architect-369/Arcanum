---
title: "Architect Per-Session Record Schema"
status: canonical
visibility: public
last_updated: 2026-09-04
version: "2.0"
domain: "Continuity & Memory"
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W02"
authority: "Human Architect"
contract: docs/governance/architectgpt/conversation-memory-contract.md
machine_schema: docs/governance/architectgpt/session-record.schema.json
ledger: docs/governance/architectgpt/sessions
continuity_epoch: ARC-CONT-EPOCH-2
---

# Architect Per-Session Record Schema

## 1. Scope

This specification defines active-epoch Architect session records. Developmental
records from `ARC-CONT-EPOCH-1` are sealed by
`docs/governance/architectgpt/continuity-epoch.json` and are not active ledger
members.

Active records begin at `ARC-SES-11`.

## 2. Stable ID and filename

Session IDs use `ARC-SES-N`, monotonically increasing from 11.

Files use:

```text
YYYY-MM-DD--arc-ses-NNNN--arc-TASK--short-kebab-title.md
```

The date is derived from `started_at` in `America/New_York`. The session number is
zero-padded to at least four digits. `filename_slug` is lowercase kebab case and is
frozen once the reviewed record lands.

No collision suffixes, timestamps, provider IDs, or recycled session numbers are
allowed.

## 3. Machine schema

The canonical frontmatter schema is:

```text
docs/governance/architectgpt/session-record.schema.json
```

New records use:

```text
schema: arcanum.architect.session/v2
record_type: session
```

Branch roles are:

- `canonical`
- `work`
- `historical`

`canonical` means `main`; `work` means an explicitly named disposable task branch;
`historical` is evidence-only.

## 4. Lifecycle

Allowed statuses are:

- `OPEN`
- `REVIEW-PENDING`
- `CLOSED`
- `NEEDS-CORRECTION`
- `BACKFILL`

`CLOSED` and `BACKFILL` require exact `head_commit_end` and `github_commit` SHAs,
non-empty outcome and next gate, `privacy_review_status: COMPLETE`, and
`review_status: APPROVED`.

A closed record body is immutable. Corrections are additive in a later session.

## 5. Required body order

```markdown
# ARC-SES-N — Session title

## Purpose
## Grounding
## Source inventory
## Outcome
## Typed records
## Repository changes
## Verification
## Privacy review
## Unresolved matters
## Exact next task
```

Typed child records use the parent session number:

- `ARC-DEC-N-XX`
- `ARC-IDE-N-XX`
- `ARC-COR-N-XX`
- `ARC-DQ-N-XX`

Declared child-ID arrays in frontmatter must exactly match body headings.

## 6. Evidence and privacy

`verification` entries use:

```text
PASS | <check> | <concise evidence>
FAIL | <check> | <concise evidence>
NOT-RUN | <check> | <reason>
```

Raw transcripts, secrets, raw command dumps, private reflections, bearer URLs, and
provider-hidden context do not belong in session records.

Only `PUBLIC` and `PUBLIC-REDACTED` records may be committed publicly.

## 7. Epoch boundary

The validator rejects any active record numbered below 11. The predecessor IDs and
their exact Git blobs remain verifiable through the epoch seal and must never be
copied into the active ledger merely to satisfy continuity.

If predecessor evidence is missing from Git history, fail closed.
