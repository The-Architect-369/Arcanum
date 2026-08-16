---
title: "Architect Per-Session Record Schema"
status: canonical
visibility: public
last_updated: 2026-08-14
description: "Normative schema, filename, lifecycle, and migration rules for canonical Architect per-session records."
version: "1.0"
task_id: ARC-3
domain: "Continuity & Memory"
phase: "Pre-Genesis"
wave: "XXIV"
authority: "Human Architect"
contract: docs/governance/architectgpt/conversation-memory-contract.md
machine_schema: docs/governance/architectgpt/session-record.schema.json
ledger: docs/governance/architectgpt/sessions
---

# Architect Per-Session Record Schema

## 1. Authority and scope

This specification operationalizes Architect Conversation-Memory Contract v1.0 for one canonical Markdown record per substantive Architect conversation.

It does not alter the ARC-1 or ARC-2 authority decisions:

- `docs/governance/architectgpt/architect-log.md` remains the sole cross-session append-only Architect log;
- `docs/governance/architectgpt/sessions/` remains the canonical per-session ledger;
- `docs/architect/architect-log.md` remains historical-only and receives no new cross-session memory;
- the machine-readable continuity index remains deferred to `ARC-4`.

If this specification conflicts with the conversation-memory contract, the contract controls.

## 2. Stable session ID

The canonical stable ID format is:

```text
ARC-SES-N
```

where `N` is a repository-wide positive base-10 integer with no leading zeroes.

Examples:

```text
ARC-SES-1
ARC-SES-2
ARC-SES-103
```

### Allocation rule

1. Build the used/reserved set from surviving canonical GitHub session IDs, the controlling Architect log, and explicit reviewed legacy reservations.
2. Never recycle an ID that was committed, rejected, abandoned, superseded, or reserved by surviving evidence.
3. The provisional candidate is the smallest positive integer not in that used/reserved set.
4. The ID is not allocated canonically until the Human Architect reviews the proposed session packet.
5. Notion mirrors the GitHub ID and never substitutes a different canonical identity.
6. `ARC-SES-1` is reserved by the surviving pre-contract Notion Session Ledger record and may not be reused while its GitHub backfill status remains unresolved.

`ARC-4` may automate this allocation, but it may not create a second identifier system.

## 3. Deterministic filename

Canonical filenames use:

```text
YYYY-MM-DD--arc-ses-NNNN--arc-TASK--short-kebab-title.md
```

The segments are derived as follows:

| Segment | Rule |
|---|---|
| `YYYY-MM-DD` | Local calendar date of `started_at` in `America/New_York`. |
| `arc-ses-NNNN` | Numeric part of `session_id`, zero-padded to at least four digits. Values above 9999 are not truncated. |
| `arc-TASK` | Lowercase rendering of `task_id`, e.g. `ARC-3` → `arc-3`. |
| `short-kebab-title` | Exact `filename_slug` frontmatter value. |

`filename_slug` must:

- contain only lowercase ASCII letters, digits, and single hyphens;
- start and end with a letter or digit;
- contain no consecutive hyphens;
- be 1–64 characters;
- be frozen when the reviewed record path is approved.

Example:

```text
session_id: ARC-SES-3
task_id: ARC-3
started_at: "2026-08-14T22:14:00-04:00"
filename_slug: define-per-session-record-schema
```

produces:

```text
2026-08-14--arc-ses-0003--arc-3--define-per-session-record-schema.md
```

### Collision handling

The stable session ID makes a valid collision impossible unless allocation or migration is wrong.

- If the computed target path already exists for another record, stop.
- Do not overwrite.
- Do not add `-2`, timestamps, random suffixes, or provider IDs.
- Reconcile the ID reservation and allocate the next unused reviewed ID.
- After a canonical record is committed, its path is immutable except for an explicitly reviewed provenance-preserving migration. Title changes do not rename the file.

## 4. Canonical frontmatter schema

Frontmatter is YAML bounded by the first two `---` delimiter lines. New records use only top-level scalars and top-level arrays of scalars. YAML anchors, aliases, custom tags, and provider-local objects are forbidden.

The machine-readable schema is:

```text
docs/governance/architectgpt/session-record.schema.json
```

### Required fields

| Field | Type | Allowed values / invariant |
|---|---|---|
| `schema` | string | `arcanum.architect.session/v1` |
| `record_type` | string | `session` |
| `session_id` | string | `ARC-SES-N` |
| `filename_slug` | string | canonical kebab slug |
| `status` | string | `OPEN`, `REVIEW-PENDING`, `CLOSED`, `NEEDS-CORRECTION`, `BACKFILL` |
| `task_id` | string | `ARC-N` |
| `task_title` | string | exact Work Registry task title at session start |
| `domain` | string | non-empty domain |
| `priority` | string | `P0 Critical`, `P1 High`, `P2 Medium`, `P3 Low` |
| `success_condition` | string | exact bounded success condition |
| `non_scope` | array[string] | explicit exclusions |
| `repository` | string | `The-Architect-369/Arcanum` |
| `branch` | string | exact branch name |
| `branch_role` | string | `stable`, `integration`, `feature`, `historical` |
| `head_commit_start` | string | exact 40-character lowercase Git SHA |
| `head_commit_end` | string | empty while open/review-pending; exact 40-character lowercase substantive closing-head SHA when closed/backfilled |
| `grounding_state` | string | `live-file`, `index-snapshot`, `partial-scan`, `mixed` |
| `source_refs` | array[string] | one or more reviewed source references |
| `started_at` | string | ISO 8601 timestamp with offset |
| `closed_at` | string | empty until closure; ISO 8601 timestamp with offset at closure |
| `timezone` | string | `America/New_York` |
| `provider_provenance` | array[string] | one or more provider/access provenance entries |
| `outcome` | string | explicit outcome; may be empty only before closure |
| `decision_state_summary` | string | `KNOWN-RATIFIED`, `RECONFIRM`, `UNKNOWN-REDECIDE`, `DEFERRED`, `MIXED`, `NOT-APPLICABLE` |
| `canon_impact` | string | `NONE`, `DRAFT`, `AMENDMENT-REQUIRED`, `RATIFIED` |
| `canonicalization_status` | string | `NOT-APPLICABLE`, `PENDING`, `LANDED` |
| `privacy_class` | string | `PUBLIC`, `PUBLIC-REDACTED`, `DEVICE-PRIVATE`, `DO-NOT-EXPORT` |
| `privacy_review_status` | string | `PENDING`, `COMPLETE` |
| `redactions_applied` | array[string] | explicit redaction categories or empty |
| `decision_ids` | array[string] | `ARC-DEC-N-XX` IDs |
| `idea_ids` | array[string] | `ARC-IDE-N-XX` IDs |
| `correction_ids` | array[string] | `ARC-COR-N-XX` IDs |
| `deferred_question_ids` | array[string] | `ARC-DQ-N-XX` IDs |
| `repository_write_performed` | boolean | whether the session performed an authorized repository write |
| `changed_paths` | array[string] | exact repo-relative paths actually changed |
| `verification` | array[string] | minimized verification evidence |
| `next_task_id` | string | exact next Work Registry task; empty only before closure |
| `next_gate` | string | exact next gate; empty only before closure |
| `review_status` | string | `PENDING`, `APPROVED`, `REJECTED` |
| `reviewed_by` | string | reviewer identity; empty before review |
| `reviewed_at` | string | empty before review; ISO 8601 timestamp with offset after review |
| `approval_source` | string | exact approval provenance; empty before review |
| `github_commit` | string | empty before landing; exact substantive closeout commit SHA against which the reviewed packet was approved |

### Closing-head invariant

`head_commit_end` and `github_commit` bind the reviewed packet to the exact substantive repository state being closed. A later metadata-finalization commit that writes the already-approved closed record is not embedded into that same record because doing so would create a self-referential commit hash. The final completion report must separately state the actual branch head after the session-record/log commit, and Git history preserves that relationship.

### Source-reference grammar

New source references use a provider-qualified string so the provider and locator remain distinct:

```text
github:file:docs/path/file.md@<40-sha>
github:commit:<40-sha>
github:issue:<number>
github:pull-request:<number>
notion:page:<page-id-or-url>
vercel:deployment:<deployment-id-or-url>
web:<canonical-url>
local:command:<command-name>
user:conversation:current
```

GitHub file references must bind to an exact commit when the file content materially supports a conclusion.

### Provider-provenance grammar

Provider provenance uses:

```text
<provider>:<access-surface>:<read|write|observed>
```

Examples:

```text
github:connector:read
notion:connector:read
local:ubuntu:observed
user:human-architect:observed
```

## 5. Decision-state representation

Session memory uses separate dimensions and they must not be collapsed.

### Statement classification

Every material typed record uses one classification:

- `FACT`
- `INFERENCE`
- `PROPOSAL`
- `RATIFICATION`
- `REJECTION`
- `DEFERRAL`
- `CORRECTION`

### Decision knowledge state

Decision records use one knowledge state:

- `KNOWN-RATIFIED`
- `RECONFIRM`
- `UNKNOWN-REDECIDE`
- `DEFERRED`

### Decision disposition

Decision records use one disposition:

- `PROPOSED`
- `RATIFIED`
- `REJECTED`
- `DEFERRED`
- `SUPERSEDED`

`RATIFIED` requires direct Human Architect evidence. A `FACT` can describe repository state without becoming a ratification. An `INFERENCE` never upgrades itself to `KNOWN-RATIFIED`.

## 6. Lifecycle

### OPEN

- The conversation is active.
- Exact repository, branch, `head_commit_start`, grounding, task, and sources are already present.
- `head_commit_end`, `closed_at`, `next_task_id`, `next_gate`, review fields, and `github_commit` may remain empty.
- No GitHub write is required merely because a session opened.

### REVIEW-PENDING

- A complete proposed packet exists.
- Human review, write authorization, landing evidence, or another closure condition is still missing.
- It is not a synonym for closed.

### CLOSED

`CLOSED` is valid only when all conversation-memory-contract closure conditions are satisfied.

In frontmatter, at minimum:

- `head_commit_end` is an exact 40-character SHA;
- `closed_at` is an exact timestamp;
- `outcome` is non-empty;
- `privacy_review_status` is `COMPLETE`;
- `review_status` is `APPROVED`;
- `reviewed_by`, `reviewed_at`, and `approval_source` are non-empty;
- `github_commit` is exact;
- exactly one successor Work Registry task is named in `next_task_id`;
- `next_gate` describes the bounded entry condition for that successor task.

The task itself may remain in progress, blocked, deferred, or awaiting ratification.

### BACKFILL

- The record was reconstructed after the original conversation.
- Only surviving evidence may be used.
- Inferred or unrecoverable decisions remain `RECONFIRM`, `UNKNOWN-REDECIDE`, or `DEFERRED`.
- A canonical backfill record still requires exact repository, branch, start-head, and closing-head provenance.
- If exact repository provenance cannot be recovered, preserve the historical note outside the canonical session ledger rather than inventing values.

### NEEDS-CORRECTION

- A committed GitHub session record is materially wrong or incomplete.
- The original record is not silently rewritten.
- A later session carries a new `ARC-COR-*` correction record that identifies the exact target and corrected claim.
- Transitioning an already closed record to `NEEDS-CORRECTION` requires explicit Human Architect approval and may change frontmatter only; the original body remains unchanged.

### Interrupted or incomplete conversations

- If the same task, authority class, artifact, and exit condition are still active, resume the same `OPEN` session.
- If a review packet exists but closure was interrupted, use `REVIEW-PENDING`.
- If the original conversation cannot be resumed, create a later `BACKFILL` only from surviving evidence.
- Never mark an interrupted session `CLOSED` to make the ledger look complete.

### Supersession

There is no `SUPERSEDED` session status.

Supersession applies to decision records. A later session records the new decision and marks the prior decision disposition `SUPERSEDED` by reference. The original closed session body is not rewritten.

## 7. Closed-record mutation rule

After a session is committed as `CLOSED`:

1. Existing body text is immutable.
2. Existing stable IDs are immutable.
3. Existing source locators, branch names, and commit SHAs are immutable.
4. Corrections and superseding decisions live in later session records.
5. The only permitted edit to the closed file is an explicitly reviewed, non-semantic provenance annotation or an approved status-only transition to `NEEDS-CORRECTION`.
6. No cleanup, rewording, compression, or retrospective interpretation may rewrite the historical body.

## 8. Required Markdown body

New canonical records use this section order:

```markdown
# ARC-SES-N — Session title

## Purpose

## Grounding

## Source inventory

## Outcome

## Typed records

### ARC-DEC-N-01 — Decision title
- **Record type:** decision
- **Parent session:** `ARC-SES-N`
- **Created at:** ISO-8601 timestamp
- **Classification:** `FACT | INFERENCE | PROPOSAL | RATIFICATION | REJECTION | DEFERRAL | CORRECTION`
- **Knowledge state:** `KNOWN-RATIFIED | RECONFIRM | UNKNOWN-REDECIDE | DEFERRED`
- **Disposition:** `PROPOSED | RATIFIED | REJECTED | DEFERRED | SUPERSEDED`
- **Statement:** one independently reversible proposition
- **Authority:** source of authority
- **Sources:** provider-qualified references
- **Canonical destination / related task:** exact path or task
- **Privacy class:** `PUBLIC | PUBLIC-REDACTED | DEVICE-PRIVATE | DO-NOT-EXPORT`

## Repository changes

## Verification

## Privacy review

## Unresolved matters

## Exact next task
```

Idea, correction, and deferred-question child records use the same metadata shape with only the state/disposition fields relevant to that record type.

## 9. Verification evidence

`verification` contains minimized evidence, not raw stdout/stderr.

New entries use:

```text
PASS | <command-or-check> | <concise evidence>
FAIL | <command-or-check> | <concise evidence>
NOT-RUN | <command-or-check> | <reason>
```

Never report `PASS` unless the command or check actually executed successfully.

## 10. Privacy and data minimization

- Only `PUBLIC` and `PUBLIC-REDACTED` records may be committed to the public repository.
- `DEVICE-PRIVATE` and `DO-NOT-EXPORT` are fail-closed.
- `privacy_review_status: COMPLETE` is mandatory for closure.
- Redaction categories follow the conversation-memory contract.
- Raw transcripts, secrets, provider-local hidden context, raw command output, private reflections, unnecessary device paths, bearer URLs, and unreviewed third-party personal data remain excluded.

## 11. Existing-record migration

### `ARC-SES-2`

Path:

```text
docs/governance/architectgpt/sessions/2026-08-12--arc-ses-0002--arc-1--github-conversation-memory-contract.md
```

Treatment:

- retain as the canonical closed ARC-1 record;
- do not rewrite its body;
- grandfather its pre-ARC-3 metadata differences: no `filename_slug`, no `privacy_review_status`, and date-only `started_at` / `reviewed_at`;
- verifier reports these as one reviewed legacy exception, not as permission for future records to omit those fields.

### HOPE render-system prototype

Current path:

```text
docs/governance/architectgpt/sessions/2026-hope-render-system-v1.md
```

Treatment:

- move the file verbatim to:

```text
docs/archive/architectgpt/sessions/2026-hope-render-system-v1.md
```

- do not assign a stable session ID;
- do not invent a task, branch, start head, closing head, or ratification state;
- treat it as historical evidence only;
- a future reviewed backfill may create a canonical session record only if exact required provenance is recovered.

### `ARC-SES-1`

The surviving Notion Session Ledger record `ARC-SES-1` is `Needs GitHub Record`.

Treatment:

- reserve the ID so it is never reused;
- do not create or infer a GitHub record inside ARC-3;
- leave backfill to a separately reviewed continuity task with surviving evidence.

## 12. ARC-4 boundary

ARC-3 does not implement a continuity index.

The schema and validator may enumerate fields, validate filenames, validate individual records, and reserve known legacy IDs. They may not create a generated cross-session lookup, dependency graph, resume index, or session-to-decision index. That work is `ARC-4`.
