---
schema: arcanum.architect.session/v1
record_type: session
session_id: ARC-SES-3
filename_slug: define-per-session-record-schema
status: CLOSED
task_id: ARC-3
task_title: "Define per-session record schema and filename convention"
domain: "Continuity & Memory"
priority: "P0 Critical"
success_condition: "Ratify a deterministic per-session record model with stable IDs, filename rules, typed child records, lifecycle metadata, provenance, privacy review, Human Architect review, and machine validation."
non_scope:
  - "ARC-4 machine-readable continuity index implementation"
  - "Economic Constitution drafting"
  - "native ARCnet shell implementation"
  - "Architect Runtime implementation"
  - "chain or application implementation"
  - "merge or promotion to main"
repository: The-Architect-369/Arcanum
branch: agent/wave-xxiv-repository-canonicalization
branch_role: feature
head_commit_start: 60477d90f16de76302d166dc2c6ae02807262ba1
head_commit_end: c6950e8ffe79b902503b26133f9442af224ffcf6
grounding_state: mixed
source_refs:
  - "github:commit:60477d90f16de76302d166dc2c6ae02807262ba1"
  - "github:commit:c6950e8ffe79b902503b26133f9442af224ffcf6"
  - "github:issue:35"
  - "github:file:docs/governance/architectgpt/conversation-memory-contract.md"
  - "github:file:docs/governance/architectgpt/session-record-schema.md"
  - "github:file:docs/governance/architectgpt/session-record.schema.json"
  - "github:file:scripts/architect/validate-session-records.py"
  - "notion:work-registry:ARC-3"
  - "notion:work-registry:ARC-4"
  - "local:verification:2026-08-15T17:12:59-04:00"
  - "user:approval:2026-08-16T13:19:00-04:00"
started_at: "2026-08-15T17:12:59-04:00"
closed_at: "2026-08-16T13:44:17-04:00"
timezone: America/New_York
provider_provenance:
  - "github:connector:live-read"
  - "notion:connector:work-registry-read"
  - "local:ubuntu:verification-and-git"
  - "user:human-architect:approval"
outcome: "ARC-3 established and Human-ratified the canonical Architect per-session record specification, JSON Schema, deterministic filename convention, machine validator, lifecycle and typed-record rules, privacy and review gates, archive treatment for the non-conforming HOPE prototype, and the explicit boundary deferring continuity-index implementation to ARC-4."
decision_state_summary: KNOWN-RATIFIED
canon_impact: RATIFIED
canonicalization_status: LANDED
privacy_class: PUBLIC
privacy_review_status: COMPLETE
redactions_applied: []
decision_ids:
  - ARC-DEC-3-01
idea_ids:
  - ARC-IDE-3-01
correction_ids: []
deferred_question_ids: []
repository_write_performed: true
changed_paths:
  - "docs/README.md"
  - "docs/archive/architectgpt/README.md"
  - "docs/governance/architectgpt/sessions/2026-hope-render-system-v1.md"
  - "docs/archive/architectgpt/sessions/2026-hope-render-system-v1.md"
  - "docs/governance/architectgpt/architect-gpt-manifest.yaml"
  - "docs/governance/architectgpt/conversation-memory-contract.md"
  - "docs/governance/architectgpt/session-record-schema.md"
  - "docs/governance/architectgpt/session-record.schema.json"
  - "docs/index.md"
  - "docs/repo/repo-index.json"
  - "docs/tooling/doctrine-checksums/doctrine-checksums.yaml"
  - "scripts/architect/validate-session-records.py"
  - "scripts/verify-sync.sh"
  - "docs/governance/architectgpt/sessions/2026-08-15--arc-ses-0003--arc-3--define-per-session-record-schema.md"
  - "docs/governance/architectgpt/architect-log.md"
verification:
  - "PASS | verified Package A candidate SHA-256 088c31ae0339c6322bc1c349c796d83651ca03a887734f42dfc562809ec669ba"
  - "PASS | TypeScript AST analyzer and deterministic AST fixture suite"
  - "PASS | Verify Sync all 24 repository integrity layers"
  - "PASS | Doctrine Guard canonical checksum and doctrine alignment"
  - "PASS | canonical Architect session ledger validation"
  - "PASS | protected architect-gpt.md remained byte-identical to the approved base"
  - "PASS | pre-existing Architect GPT checksum-map drift reconciled without changing Architect canon"
  - "PASS | Package A post-commit verification at c6950e8ffe79b902503b26133f9442af224ffcf6"
  - "PASS | pre-Package-B remote lease remained 60477d90f16de76302d166dc2c6ae02807262ba1"
next_task_id: ARC-4
next_gate: "Choose the JSON or YAML continuity-index shape and define deterministic generation, ordering, canonical path references, missing-record detection, orphan detection, and CI validation without creating a second continuity authority."
review_status: APPROVED
reviewed_by: "Human Architect"
reviewed_at: "2026-08-16T13:19:00-04:00"
approval_source: "Current Architect conversation: Human Architect explicitly replied APPROVED to the reviewed ARC-SES-3 closeout packet on 2026-08-16."
github_commit: c6950e8ffe79b902503b26133f9442af224ffcf6
---

# ARC-SES-3 — Define Per-Session Record Schema and Filename Convention

## Purpose

Close Work Registry Task `ARC-3` by turning the canonical Architect session directory into a deterministic, machine-validatable, Human-reviewed continuity ledger.

## Grounding

- **Repository access:** provided.
- **Repository:** `The-Architect-369/Arcanum`.
- **Branch:** `agent/wave-xxiv-repository-canonicalization`.
- **Phase:** Pre-Genesis.
- **Wave:** XXIV — Repository Canonicalization.
- **Starting repository head:** `60477d90f16de76302d166dc2c6ae02807262ba1`.
- **Substantive ARC-3 implementation head:** `c6950e8ffe79b902503b26133f9442af224ffcf6`.
- **Grounding state:** mixed live GitHub, Notion Work Registry, Human Architect review, and Ubuntu-local verification evidence.
- **Earliest surviving local ARC-3 verification evidence:** `2026-08-15T17:12:59-04:00`.

As with the reviewed ARC-SES-2 precedent, `head_commit_end` and `github_commit` bind the substantive Package A implementation commit. The later Package B commit containing this finalized record and controlling-log digest remains discoverable through Git history, avoiding a self-referential commit identity.

## Source inventory

ARC-3 reconciled:

- the ratified Architect conversation-memory contract;
- the existing canonical ARC-SES-2 record;
- the pre-schema HOPE session prototype;
- the Architect GPT manifest and controlling log;
- GitHub Issue #35 — Wave XXIV Repository Canonicalization;
- Notion Work Registry tasks ARC-3 and ARC-4;
- local Ubuntu verification evidence for schema validation, TypeScript AST integrity, Verify Sync, Doctrine Guard, Git integrity, and remote-lease checks;
- explicit Human Architect review and approval of the ARC-SES-3 closeout packet.

## Outcome

ARC-3 established the canonical per-session continuity model:

- stable repository-wide `ARC-SES-N` identifiers;
- deterministic `YYYY-MM-DD--arc-ses-NNNN--arc-TASK--slug.md` filenames;
- explicit lifecycle, repository, provenance, privacy, verification, and Human-review metadata;
- typed decision, idea, correction, and deferred-question identifiers;
- normative Markdown specification plus machine-readable JSON Schema;
- a repository validator enforced by Verify Sync;
- reviewed grandfathering of ARC-SES-2;
- archival preservation of the non-conforming HOPE prototype;
- explicit deferral of the machine-readable continuity index to ARC-4.

No ARC-4 implementation was performed.

## Typed records

### ARC-DEC-3-01 — Ratify the canonical per-session record schema

- **Record type:** decision.
- **Classification:** `RATIFICATION`.
- **Knowledge state:** `KNOWN-RATIFIED`.
- **Disposition:** `RATIFIED`.
- **Statement:** Architect per-session continuity is governed by the normative session-record specification, machine-readable JSON Schema, deterministic filename rules, and repository validator landed in Package A.
- **Stable identity rule:** canonical sessions use immutable repository-wide `ARC-SES-N` identifiers; the next unused ID is allocated only through Human review.
- **Legacy disposition:** ARC-SES-2 is the reviewed grandfathered exception; ARC-SES-1 remains reserved by surviving pre-contract evidence and is not backfilled by ARC-3.
- **Prototype disposition:** the non-conforming HOPE record is preserved in the historical archive rather than silently rewritten as canon.
- **Boundary:** continuity-index design and implementation belong to ARC-4.
- **Authority:** Human Architect.
- **Approval:** explicit `APPROVED` response in the current Architect conversation.
- **Privacy class:** `PUBLIC`.

### ARC-IDE-3-01 — Human-reviewed execution and temporal continuity loop

- **Record type:** idea.
- **Classification:** `ARCHITECTURAL-PROPOSAL`.
- **Disposition:** preserved for later design; not an ARC-3 or ARC-4 scope expansion.
- **Statement:** the Human Architect retains approval authority over architectural direction and repository mutation, while Architect GPT may translate reviewed architecture into exact Ubuntu-native implementation and verification commands.
- Local command output returned to Architect GPT is execution evidence; it does not imply uncontrolled or invisible terminal authority.
- Future Desktop, WSL, Docker, agent, or sandbox integrations may compress this execution-evidence loop, but should preserve Human review, repository leases, deterministic verification, and canonical recording gates.
- Material architectural or philosophical insights should be minimized into reviewed typed continuity records rather than requiring reconstruction from raw conversations.
- A future Tempus-aware layer may associate tasks, decisions, sessions, and events with temporal coordinates or cycles, allowing project history to be reasoned about as both dependency structure and movement through time.
- Tempus implementation remains deferred unless separately tasked.
- Consciousness, vibration, quantum, or related metaphysical language may remain project philosophy or design framing but must not be represented as established scientific fact without independent evidence.

## Repository changes

Package A, `c6950e8ffe79b902503b26133f9442af224ffcf6`, contains the ratified schema implementation and integrity updates.

Package B adds only:

1. this canonical ARC-SES-3 record;
2. the concise controlling Architect-log digest;
3. the regenerated repository index.

No economics, chain, application, native-shell, Runtime, deployment, merge, or ARC-4 implementation changes are included.

## Verification

- Package A candidate identity matched its previously verified staged SHA-256 exactly before commit.
- Package A parent is the approved Wave XXIV base `60477d90f16de76302d166dc2c6ae02807262ba1`.
- TypeScript AST analysis passed with zero failures after exact locked dependencies were available.
- The AST fixture suite passed.
- Verify Sync passed all 24 layers.
- Doctrine Guard passed.
- Session-ledger validation passed.
- `architect-gpt.md` remained byte-identical to the approved base.
- The pre-existing protected-file checksum drift was corrected only in the checksum map.
- Package A post-commit verification passed.
- The Wave XXIV remote branch remained at the exact approved lease before Package B preparation.
- Package B is revalidated below before publication.

## Privacy review

- **Privacy class:** `PUBLIC`.
- **Review status:** `COMPLETE`.
- No raw conversation transcript is persisted.
- No credential, token, secret, private reflection, raw terminal log, hidden provider context, bearer URL, or personal dossier is persisted.
- Only minimized reviewed continuity data, exact commit identities, verification conclusions, and architectural records approved for the public repository are retained.
- **Redactions applied:** none required.

## Unresolved matters

- `ARC-SES-1` remains reserved by surviving pre-contract Notion evidence; ARC-3 does not infer or create a GitHub backfill.
- The committed machine-readable continuity index does not yet exist and is intentionally assigned to ARC-4.
- Tempus-aware temporal planning mechanics remain deferred unless separately tasked.
- Notion remains an operational mirror; GitHub remains canonical continuity evidence.

## Exact next task

`ARC-4 — Define the machine-readable continuity index.`

Successor gate: choose the JSON or YAML index shape and establish deterministic generation, stable ordering, canonical record references, missing/orphan detection, and CI validation without creating a second source of continuity authority.

No ARC-4 implementation is authorized by this ARC-3 closeout.
