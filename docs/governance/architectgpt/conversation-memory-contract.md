---
title: "Architect Conversation-Memory Contract"
version: "2.0"
status: canonical
visibility: public
last_updated: 2026-09-04
domain: "Continuity & Memory"
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W02"
authority: "Human Architect"
repository: "The-Architect-369/Arcanum"
continuity_epoch: "ARC-CONT-EPOCH-2"
---

# Architect Conversation-Memory Contract

## 1. Purpose and authority

Architect continuity preserves the minimum durable evidence needed to resume work
without converting chat history into a second source of canon.

Continuity records may preserve decisions, corrections, unresolved questions,
repository provenance, verification evidence, and exact next gates. They do not
replace doctrine, architecture, governance, specifications, implementation, or the
Human Architect's ratification authority.

Silence, inference, model confidence, provider state, Notion state, and historical
precedent do not ratify canon.

## 2. Epoch model

Continuity is divided into explicit epochs.

- `ARC-CONT-EPOCH-1` is the sealed developmental predecessor epoch.
- `ARC-CONT-EPOCH-2` is the active post-baseline epoch.
- The machine-readable seal is
  `docs/governance/architectgpt/continuity-epoch.json`.
- The predecessor is sealed through exact commit
  `1212f02b61ab0895a84700b9371847a6c5ebe47f`.
- Exact predecessor log/session blob identities are recorded in the seal and are
  verified against Git history.
- Historical session IDs `ARC-SES-1` through `ARC-SES-10` are permanently
  non-reusable.
- Active session numbering begins at `ARC-SES-11`.

Sealing removes historical bodies from the active working surface; it does not erase
Git history or alter their provenance.

## 3. Active continuity surfaces

The only active continuity surfaces are:

- `docs/governance/architectgpt/conversation-memory-contract.md`
- `docs/governance/architectgpt/architect-log.md`
- `docs/governance/architectgpt/sessions/`
- `docs/governance/architectgpt/session-record-schema.md`
- `docs/governance/architectgpt/session-record.schema.json`
- `docs/governance/architectgpt/continuity-epoch.json`
- `docs/governance/architectgpt/continuity-epoch.schema.json`
- `docs/governance/architectgpt/continuity-index.json`
- `docs/governance/architectgpt/continuity-index-spec.md`
- `docs/governance/architectgpt/continuity-index.schema.json`
- `scripts/architect/validate-session-records.py`
- `scripts/architect/generate-continuity-index.py`
- `scripts/architect/validate-continuity-index.py`

The active log and ledger contain only active-epoch records. Predecessor bodies are
not copied forward.

## 4. What deserves a durable session record

Create a session record only when a substantive Architect interaction produces
continuity that another future session must be able to verify, such as:

- a material ratification, rejection, correction, or deferral;
- a bounded repository change with durable next-gate significance;
- a change to canonical architecture, governance, doctrine, or implementation
  direction;
- a material unresolved dependency that must survive the current conversation.

Routine explanations, repeated status checks, raw transcripts, scratch reasoning,
and disposable command output are not durable continuity.

## 5. Stable identifiers

Active session IDs use `ARC-SES-N`.

- The first active-epoch ID is `ARC-SES-11`.
- IDs increase monotonically by one.
- An ID is never recycled.
- A predecessor ID is never rematerialized as an active session.
- Typed child IDs use the parent session number:
  `ARC-DEC-N-XX`, `ARC-IDE-N-XX`, `ARC-COR-N-XX`, and `ARC-DQ-N-XX`.
- Human review remains the authority for allocating and approving a durable record.

Notion and other providers mirror GitHub identities; they do not allocate competing
canonical IDs.

## 6. Session lifecycle

Active records use:

- `OPEN`
- `REVIEW-PENDING`
- `CLOSED`
- `NEEDS-CORRECTION`
- `BACKFILL`

A closed/backfill record must bind to exact repository provenance, contain a reviewed
outcome and next gate, complete its privacy review, and identify its exact closing
Git commit.

Closed record bodies are immutable. Later corrections are additive records in a
later active session.

## 7. Repository and branch semantics

`main` is the sole persistent canonical branch.

Session metadata uses branch roles:

- `canonical` — exact `main` state;
- `work` — an explicitly named disposable task branch;
- `historical` — evidence-only historical ref.

There is no permanent integration branch role and no implicit write branch.

## 8. Privacy and minimization

Public GitHub continuity must never contain credentials, tokens, cookies, private
keys, recovery material, raw private reflections, full raw conversations,
unnecessary device-identifying paths, bearer URLs, provider-hidden context, or
unreviewed third-party personal data.

Only `PUBLIC` and `PUBLIC-REDACTED` continuity may enter the public repository.
`DEVICE-PRIVATE` and `DO-NOT-EXPORT` fail closed.

Verification fields contain concise evidence, not raw stdout/stderr.

## 9. GitHub and provider boundaries

GitHub owns canonical continuity records and exact Git provenance.

Notion, Google Workspace, Vercel, and other providers may supply operational context
or evidence, but they do not override GitHub canon or Human authority.

After an approved write, provider mirrors may carry the session ID, record URL,
closing commit, state, and next gate. Missing mirror updates do not alter canonical
Git history.

## 10. Closure discipline

Before a durable continuity write:

1. minimize and redact the record;
2. classify material decisions and unresolved questions;
3. identify exact repository, ref, paths, and commit context;
4. obtain the required Human authorization for the repository write;
5. validate the session record and deterministic continuity index;
6. record the exact resulting Git commit.

The continuity index is derived evidence. It never grants authority, repairs missing
history, or invents state.

## 11. Fail-closed predecessor recovery

When predecessor evidence is needed, use the exact commit and blob identities in
`continuity-epoch.json`.

If the predecessor commit or any recorded blob cannot be verified, continuity
validation fails. The system must not reconstruct the missing history from memory,
Notion, issue prose, or inference.

This is the defining boundary of the post-baseline continuity model: current truth
stays compact; historical truth stays exact and recoverable.
