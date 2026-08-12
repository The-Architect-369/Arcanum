---
title: "Architect Conversation-Memory Contract"
version: "1.0"
status: canonical
visibility: public
last_updated: 2026-08-12
task_id: ARC-1
domain: "Continuity & Memory"
phase: "Pre-Genesis"
wave: "XXIV"
authority: "Human Architect"
ratified_by: "Human Architect"
ratified_at: 2026-08-12
repository: "The-Architect-369/Arcanum"
ratification_branch: "agent/wave-xxiv-repository-canonicalization"
---

# Architect Conversation-Memory Contract

## 1. Authority and purpose

1. This contract governs durable memory for substantive Architect conversations.
2. Its purpose is to preserve decisions, corrections, unresolved questions, provenance, repository context, and exact next gates without storing indiscriminate transcripts.
3. Conversation-memory records are canonical evidence and audit records. They do not replace the canonical doctrine, architecture, governance, specification, or implementation document that owns the subject matter.
4. A decision recorded in a session becomes governing canon only when:
   - the Human Architect explicitly ratifies it; and
   - it is reconciled into its proper canonical document or otherwise linked to an authoritative GitHub artifact.
5. Silence, inference, model confidence, a Notion status, or an unreviewed issue comment never constitutes ratification.

## 2. Canonical paths

### 2.1 Controlling Architect log

The sole cross-session, append-only Architect log is:

```text
docs/governance/architectgpt/architect-log.md
```

The controlling log contains only a chronological digest:

- session ID and date;
- Work Registry task ID;
- session-record path;
- repository, branch, and closing head;
- outcome;
- decision and correction deltas;
- canon impact;
- closure status;
- exact next gate.

It does not duplicate the complete session record or contain a raw conversation transcript.

### 2.2 Canonical per-session ledger

One durable record for each substantive conversation lives under:

```text
docs/governance/architectgpt/sessions/
```

The filename convention is:

```text
YYYY-MM-DD--arc-ses-NNNN--arc-TASK--short-kebab-title.md
```

Example:

```text
2026-08-12--arc-ses-0002--arc-1--github-conversation-memory-contract.md
```

The date is the Human Architect's local calendar date in `America/New_York`. Exact start and close times remain ISO 8601 timestamps in the record metadata.

### 2.3 Duplicate log path

The separate file:

```text
docs/architect/architect-log.md
```

is not authoritative for cross-session continuity.

From ratification onward:

- no new cross-session memory entries may be added to `docs/architect/architect-log.md`;
- its unique historical entries must not be deleted;
- Task `ARC-2` shall migrate or reference those entries with original dates and provenance;
- after reconciliation, the path shall become either a historical stub, an archive redirect, or a clearly bounded domain-specific closeout log.

## 3. Record types

Every substantive session file contains one top-level session record and zero or more typed child records.

| Record | Stable ID | Normative purpose |
|---|---|---|
| Session | `ARC-SES-N` | The complete reviewed envelope for one conversation bound to one Work Registry task. |
| Decision | `ARC-DEC-N-XX` | An explicit choice, rejection, ratification, or authority-bearing conclusion. |
| Idea | `ARC-IDE-N-XX` | A potentially useful concept that has not acquired decision authority. |
| Correction | `ARC-COR-N-XX` | An additive correction to a prior record, statement, path, classification, or conclusion. |
| Deferred question | `ARC-DQ-N-XX` | A material unresolved question deliberately carried forward with dependencies and a next gate. |

Here, `N` is the parent session number and `XX` is the two-digit sequence of that record type within the session.

### 3.1 Session record

A session record shall:

- bind to exactly one Work Registry task;
- preserve the task's domain, priority, success condition, and non-scope;
- record the repository and exact branch/head context;
- summarize what was inspected, concluded, corrected, deferred, and left unchanged;
- link every child record by stable ID;
- name one exact next task or next gate.

A change of domain, authority class, primary artifact, or exit condition requires a new task and session.

### 3.2 Decision record

A decision record contains one precise proposition. It must not combine several independently reversible choices.

Every decision receives one of these knowledge states:

- `KNOWN-RATIFIED`
- `RECONFIRM`
- `UNKNOWN-REDECIDE`
- `DEFERRED`

Its disposition must also be explicit:

- `PROPOSED`
- `RATIFIED`
- `REJECTED`
- `DEFERRED`
- `SUPERSEDED`

`RATIFIED` requires direct Human Architect approval evidence. No inference from conversational momentum is permitted.

### 3.3 Idea record

An idea record preserves a concept worth carrying forward but confers no authority.

It must state:

- why the idea was retained;
- what evidence or design question prompted it;
- what would be required to promote it into a decision;
- whether it was later promoted, rejected, or superseded.

An idea may not be described as approved direction unless a linked decision record establishes that status.

### 3.4 Correction record

Corrections are additive and never silently rewrite history.

A correction must identify:

- the exact record ID, file, issue comment, or canonical statement being corrected;
- the previous claim;
- the corrected claim;
- the reason for correction;
- the source establishing the correction;
- its impact on current canon, tasks, or implementation;
- whether Human Architect approval is required or has been granted.

The original record remains auditable. A correction cannot reuse the corrected record's ID.

### 3.5 Deferred-question record

A deferred-question record captures:

- the exact unresolved question;
- why it cannot or should not be decided now;
- controlling invariants;
- dependencies and blocked tasks;
- candidate options, explicitly labeled non-canonical;
- the responsible domain or future task;
- the event, evidence, date, or review gate that reopens it.

Deferral preserves uncertainty; it must never be converted into an assumed default.

## 4. Classification vocabulary

Every material statement inside a session record shall be marked as one of:

- `FACT` — directly supported by a cited source or observed repository state;
- `INFERENCE` — a reasoned conclusion that is not itself explicit in the source;
- `PROPOSAL` — a candidate action, wording, architecture, or policy;
- `RATIFICATION` — explicit Human Architect approval;
- `REJECTION` — explicit refusal of a proposal;
- `DEFERRAL` — explicit preservation of an unresolved question;
- `CORRECTION` — additive repair of an earlier record.

## 5. Stable IDs and immutability

1. Session numbers are repository-wide positive integers.
2. The next unused number is assigned during Human Architect review of the proposed session packet.
3. Once a GitHub record is committed, its ID is immutable.
4. Notion mirrors the GitHub ID; Notion does not allocate a replacement canonical identity.
5. Deleted, rejected, abandoned, or superseded IDs are never recycled.
6. Renaming a session file does not change its stable ID.
7. A later correction references the original ID instead of replacing it.
8. Work Registry IDs such as `ARC-1` remain cross-system task references and must appear in the GitHub session record.
9. A future continuity index may automate allocation and validation, but it must reference these IDs rather than inventing a second identifier system.

## 6. Required metadata

### 6.1 Minimum session metadata

Every session record contains at least:

```yaml
schema: arcanum.architect.session/v1
record_type: session
session_id: ARC-SES-N
status: OPEN | REVIEW-PENDING | CLOSED | NEEDS-CORRECTION | BACKFILL

task_id: ARC-N
task_title: ""
domain: ""
priority: ""
success_condition: ""
non_scope: []

repository: The-Architect-369/Arcanum
branch: ""
branch_role: stable | integration | feature | historical
head_commit_start: ""
head_commit_end: ""
grounding_state: live-file | index-snapshot | partial-scan | mixed
source_refs: []

started_at: ""
closed_at: ""
timezone: America/New_York

provider_provenance: []
outcome: ""
decision_state_summary: KNOWN-RATIFIED | RECONFIRM | UNKNOWN-REDECIDE | DEFERRED | MIXED | NOT-APPLICABLE
canon_impact: NONE | DRAFT | AMENDMENT-REQUIRED | RATIFIED
canonicalization_status: NOT-APPLICABLE | PENDING | LANDED

privacy_class: PUBLIC | PUBLIC-REDACTED | DEVICE-PRIVATE | DO-NOT-EXPORT
redactions_applied: []

decision_ids: []
idea_ids: []
correction_ids: []
deferred_question_ids: []

repository_write_performed: false
changed_paths: []
verification: []
next_task_id: ""
next_gate: ""

review_status: PENDING | APPROVED | REJECTED
reviewed_by: ""
reviewed_at: ""
approval_source: ""
github_commit: ""
```

The session body includes: purpose, grounding, source inventory, outcome, typed records, files reviewed or changed, verification, privacy review, unresolved matters, and next gate.

### 6.2 Child-record metadata

Every decision, idea, correction, and deferred-question record includes:

- stable record ID;
- record type;
- parent session ID;
- creation timestamp;
- concise statement;
- classification;
- state or disposition;
- source references;
- privacy class;
- recorder/provider provenance;
- related task or canonical destination;
- supersession or correction links where applicable.

## 7. Privacy and redaction boundaries

Only records classified `PUBLIC` or `PUBLIC-REDACTED` may be committed to the public Arcanum repository.

### 7.1 GitHub must never contain

- credentials, tokens, passwords, cookies, authorization headers, private keys, seed phrases, recovery material, or environment secrets;
- raw private reflections, journals, personal notes, or identity dossiers;
- complete raw conversation transcripts by default;
- raw command stdout or stderr merely for continuity;
- provider-local hidden context or browser-storage dumps;
- private filesystem details that unnecessarily identify a device or person;
- unreviewed personal information about third parties;
- signed URLs, temporary access links, or other bearer-capability URLs;
- content marked `DEVICE-PRIVATE` or `DO-NOT-EXPORT`.

### 7.2 Durable GitHub content

GitHub may contain only the reviewed minimum needed for continuity:

- decisions and their state;
- corrected conclusions;
- material ideas;
- deferred questions;
- branch and commit context;
- minimized verification evidence;
- task, issue, PR, ADR, and canonical-document references;
- outcome and next gate.

### 7.3 Redaction form

Redactions use explicit categories such as:

```text
[REDACTED:CREDENTIAL]
[REDACTED:PRIVATE-REFLECTION]
[REDACTED:PERSONAL-DATA]
[REDACTED:SECURITY-SENSITIVE]
[REDACTED:PROVIDER-LOCAL-CONTEXT]
```

The record may preserve the category, reason, and number of redactions, but never the removed value.

A hash is not a substitute for redaction. Low-entropy secrets, personal prose, or guessable private content must not be published merely because it was hashed. Hash linkage is permitted only for already minimized, non-sensitive evidence artifacts.

## 8. GitHub versus Notion

### GitHub owns

- the ratified memory contract;
- canonical session files;
- the controlling append-only log;
- reviewed decision, correction, idea, and deferred-question records;
- exact repository, branch, commit, issue, PR, and canonical-document provenance;
- ratified canonical documents and their change history;
- minimized evidence necessary to audit what occurred.

### Notion owns

- the Understanding Dashboard;
- Work Registry state and priority;
- dependencies and blockers;
- operational decision confidence;
- current handoff summaries;
- Session Ledger views;
- next gates and human-decision queues.

A Notion statement without a GitHub source remains context, not canon. Notion may temporarily show `Needs GitHub Record`, `Awaiting Ratification`, `Reconfirm`, or another operational state while a reviewed GitHub record is pending.

### Synchronization rule

1. **Notion to GitHub:** Notion material may be used only as reviewed draft input. No automatic promotion is permitted.
2. **GitHub to Notion:** After an approved GitHub write, Notion mirrors:
   - session or decision ID;
   - GitHub record URL;
   - closing commit;
   - branch context;
   - updated decision state;
   - status;
   - last-verified date;
   - next gate.
3. A GitHub issue comment remains evidence until reconciled into a session record and the proper canonical document.
4. A Notion update cannot authorize a repository write or ratify a decision.
5. A GitHub session record cannot silently overwrite Notion history; Notion retains its operational audit trail while pointing to the controlling GitHub source.

## 9. When records are created and written

### At session start

- bind the conversation to one Work Registry task;
- reserve a provisional session ID;
- record purpose, success condition, non-scope, repository, branch, head, grounding, and sources;
- inspect the latest dashboard, Session Ledger entry, and active GitHub record;
- create no GitHub write merely because the session started.

### During the session

A typed draft record is captured as soon as a material event occurs:

- an explicit decision;
- a meaningful idea intended for future work;
- a correction to existing understanding;
- a deliberate deferral;
- a new source or repository state that changes the conclusion.

Routine conversational phrasing, repeated explanations, and discarded scratch reasoning need not be preserved.

### At session close

1. Generate a minimized, redacted session packet.
2. Display the complete proposed record to the Human Architect.
3. Classify every decision and unresolved question.
4. Show the exact target branch, paths, and proposed change set.
5. Obtain explicit, session-specific Human Architect approval.
6. Commit the session file and corresponding log digest in the same reviewed change set where practical.
7. Update Notion only after the GitHub record and closing commit are known.

### Immediate ratifications or corrections

A material ratification or correction may be persisted before general session close only when the Human Architect:

- approves the exact text;
- approves the exact GitHub target;
- separately authorizes the write.

Conversational urgency is not authorization.

### Historical backfill

Backfill records are labeled `BACKFILL`. They may reconstruct only what surviving evidence supports. Missing decisions remain `RECONFIRM`, `UNKNOWN-REDECIDE`, or `DEFERRED`; they may not be filled through inference.

## 10. Human-review requirement

No repository write may occur until the Human Architect has reviewed:

- the exact redacted record;
- all stable IDs;
- all decision-state classifications;
- the privacy class and redaction list;
- the target repository, branch, and paths;
- canon-impact claims;
- the proposed diff or equivalent exact content;
- the proposed commit message.

Approval must be:

- explicit;
- scoped to the presented change;
- revocable until execution;
- recorded by source or timestamp.

Standing permission, silence, prior approval of a different session, or approval of an idea does not authorize the write.

After a write, the completion report states:

- exact files changed;
- branch;
- commit SHA;
- whether the canonical log and session file landed together;
- any failed or pending synchronization step.

## 11. Session closure

A conversation may end without its memory record being closed.

A session is canonically closed only when all of the following are true:

1. Its single Work Registry task and success condition are recorded.
2. The outcome is explicit, including partial or unsuccessful outcomes.
3. Every material decision, idea, correction, and deferred question has a stable ID.
4. Decision states are classified.
5. Repository, branch, start head, closing head, grounding, and source references are complete.
6. Privacy and redaction review is complete.
7. One exact next task or next gate is named.
8. The Human Architect has approved the final session packet.
9. The approved session record exists in the canonical GitHub session path.
10. The controlling Architect log contains its digest and link.
11. Notion mirrors the GitHub record URL and closing commit.
12. The Session Ledger status is `Closed`.

A closed session does not require its Work Registry task to be complete. The task may remain `In Progress`, `Blocked`, `Deferred`, or `Awaiting Ratification`; the session record states that continuing status.

When any closure condition is missing:

- `OPEN` means the conversation is active;
- `REVIEW-PENDING` means the packet exists but lacks Human Architect approval or write authorization;
- `NEEDS-CORRECTION` means the GitHub memory exists but is materially wrong or incomplete;
- `BACKFILL` means the record was reconstructed after the original session;
- `CLOSED` is forbidden until all closure conditions are met.

## 12. Append-only integrity

1. Closed records must not be silently deleted or semantically rewritten.
2. Corrections are represented through new correction records.
3. Superseded decisions remain visible and point to their replacements.
4. Historical source URLs, branch references, and commit SHAs remain intact.
5. Non-semantic formatting cleanup must not alter the record's meaning or IDs.
6. Unique material from duplicate logs must be preserved during migration.
7. Generated indexes may be rebuilt, but source session records and IDs remain authoritative.

## 13. Task boundaries and downstream work

This contract ratifies the semantic and authority model. It does not implement the supporting machinery.

After ratification, the following remain separate Work Registry tasks:

- `ARC-2` — reconcile the duplicate Architect log paths;
- `ARC-3` — formalize the session template/schema and normalize the prototype session file;
- `ARC-4` — implement the deterministic continuity index;
- `ARC-6` — embed the start/close protocol into Architect canon and verification;
- `ARC-16` — implement the human-reviewed End Session export;
- `ARC-18` — link private runtime audit evidence to minimized GitHub continuity.

No Economic Constitution drafting, native-shell design, Runtime implementation, or unrelated repository change is authorized by this contract.
