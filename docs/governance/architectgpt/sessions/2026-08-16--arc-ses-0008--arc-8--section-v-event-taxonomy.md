---
schema: arcanum.architect.session/v1
record_type: session
session_id: ARC-SES-8
filename_slug: section-v-event-taxonomy
status: CLOSED
task_id: ARC-8
task_title: "Rebuild the Section V acquisition and circulation event taxonomy"
domain: "Economic Constitution"
priority: "P0 Critical"
success_condition: "Ratify and persist a Section V acquisition and circulation event taxonomy that keeps MANA supply creation distinct from movement of existing MANA and requires each material event to identify authority, funding or value source, receipt semantics, and forbidden interpretations without silently deciding downstream economic policy or reconstructing unresolved legacy Section V text."
non_scope:
  - "detailed acquisition eligibility, distribution mechanics, or participant qualification policy"
  - "numerical monetary parameters, reward formulas, prices, exchange targets, or credit terms"
  - "reconfirming recovered Sections 5.3 through 5.7 or directly deciding Section 5.6"
  - "ratifying Section 5.9.16 or other unresolved legacy Section V material"
  - "native ARCnet runtime implementation or chain-economics implementation"
  - "merge, promotion, deployment, or stable-branch mutation"
  - "beginning ARC-9 before explicit Human Architect release"
repository: The-Architect-369/Arcanum
branch: agent/wave-xxiv-repository-canonicalization
branch_role: feature
head_commit_start: 32850d4a189b7525004c1a671b64ae49413ba9ef
head_commit_end: 70924a7e9c0592a25255d8ecef68be4624933b42
grounding_state: mixed
source_refs:
  - "github:commit:32850d4a189b7525004c1a671b64ae49413ba9ef"
  - "github:commit:70924a7e9c0592a25255d8ecef68be4624933b42"
  - "github:file:docs/economics/economic-constitution.md@70924a7e9c0592a25255d8ecef68be4624933b42"
  - "github:file:docs/governance/architectgpt/sessions/2026-08-16--arc-ses-0007--arc-7--section-v-evidence-first-rebuild.md@70924a7e9c0592a25255d8ecef68be4624933b42"
  - "github:file:docs/governance/architectgpt/session-record.schema.json@70924a7e9c0592a25255d8ecef68be4624933b42"
  - "notion:page:3ba2bb44-20b8-8126-b61e-d1b9e2b46664"
  - "notion:page:3ba2bb44-20b8-81a9-aa20-eceaa793065d"
  - "local:command:verify-sync"
  - "user:conversation:current"
started_at: "2026-08-16T23:03:00-04:00"
closed_at: "2026-08-16T23:44:00-04:00"
timezone: America/New_York
provider_provenance:
  - "github:connector:read"
  - "github:connector:write"
  - "notion:connector:read"
  - "local:ubuntu:observed"
  - "user:human-architect:observed"
outcome: "ARC-8 ratified and landed the Section V acquisition and circulation event taxonomy. The resulting constitutional grammar separates monetary operation from economic purpose; treats issuance as the sole MANA supply-creation class; requires explicit authority, funding or value source, receipt semantics, and forbidden interpretations for acquisition and circulation events; preserves linked primitive receipts for composite events; and leaves downstream policy, unresolved legacy Section V normalization, numerical parameters, native runtime work, chain economics, merge, promotion, and deployment outside scope. ARC-9 is the exact successor but is explicitly held and must not begin until the Human Architect separately releases it."
decision_state_summary: KNOWN-RATIFIED
canon_impact: RATIFIED
canonicalization_status: LANDED
privacy_class: PUBLIC
privacy_review_status: COMPLETE
redactions_applied: []
decision_ids:
  - ARC-DEC-8-01
  - ARC-DEC-8-02
  - ARC-DEC-8-03
  - ARC-DEC-8-04
  - ARC-DEC-8-05
idea_ids: []
correction_ids: []
deferred_question_ids: []
repository_write_performed: true
changed_paths:
  - "docs/economics/economic-constitution.md"
  - "docs/governance/architectgpt/sessions/2026-08-16--arc-ses-0008--arc-8--section-v-event-taxonomy.md"
  - "docs/governance/architectgpt/architect-log.md"
  - "docs/governance/architectgpt/continuity-index.json"
verification:
  - "PASS | local exact-head Verify Sync | 24/24 checks passed at 70924a7e9c0592a25255d8ecef68be4624933b42"
  - "PASS | canonical session-ledger validation | 6 existing records passed before ARC-SES-8 closeout"
  - "PASS | deterministic continuity-index validation | 6 sessions plus ARC-SES-1 reservation passed before ARC-SES-8 closeout"
  - "PASS | live GitHub branch lease | agent/wave-xxiv-repository-canonicalization remained 70924a7e9c0592a25255d8ecef68be4624933b42 at closeout review"
  - "PASS | Package A commit scope | 70924a7e9c0592a25255d8ecef68be4624933b42 changed only docs/economics/economic-constitution.md"
  - "PASS | GitHub combined status | Vercel reports success at substantive head 70924a7e9c0592a25255d8ecef68be4624933b42"
  - "PASS | Human Architect review | ARC-8 closeout approved at 2026-08-16T23:44:00-04:00 with ARC-9 explicitly held pending separate release"
  - "NOT-RUN | post-closeout repository-index regeneration and Verify Sync | requires the landed metadata commit"
next_task_id: ARC-9
next_gate: "Human Architect must explicitly release the ARC-9 hold. After release, present only evidence-backed normalized text; directly decide anything still unknown, especially the exact Section 5.6 scope."
review_status: APPROVED
reviewed_by: "Human Architect"
reviewed_at: "2026-08-16T23:44:00-04:00"
approval_source: "Current Architect conversation: Human Architect approved the ARC-8 closeout at 2026-08-16T23:44:00-04:00 and explicitly directed that ARC-9 must not begin until separately released."
github_commit: 70924a7e9c0592a25255d8ecef68be4624933b42
---

# ARC-SES-8 — Section V Acquisition and Circulation Event Taxonomy

## Purpose

Close Work Registry Task `ARC-8` by ratifying and persisting the factual event grammar for MANA acquisition and circulation while preserving the constitutional distinction between creation of new supply and movement, custody, allocation, removal, or purpose-labeling of existing MANA.

## Grounding

- **Repository access:** provided.
- **Repository:** `The-Architect-369/Arcanum`.
- **Branch:** `agent/wave-xxiv-repository-canonicalization`.
- **Phase:** Pre-Genesis.
- **Wave:** XXIV — Repository Canonicalization.
- **Starting head:** `32850d4a189b7525004c1a671b64ae49413ba9ef`.
- **Substantive closing head:** `70924a7e9c0592a25255d8ecef68be4624933b42`.
- **Grounding state:** mixed live GitHub evidence, Notion Work Registry state, Human Architect ratification, and Human-supplied Ubuntu verification.
- **Session start anchor:** `2026-08-16T23:03:00-04:00`.
- **Closeout approval anchor:** `2026-08-16T23:44:00-04:00`.

Package A landed the ratified Section V taxonomy at the substantive closing head. The later metadata-finalization commit containing this reviewed record, the append-only Architect log digest, and the derived continuity-index update is intentionally not self-referential.

## Source inventory

ARC-8 reviewed and relied on:

- the live Economic Constitution and its Section IV issuance boundary;
- the ARC-SES-7 evidence-first provenance boundary and ARC-8 handoff;
- the canonical Architect session schema and continuity requirements;
- Work Registry Tasks ARC-8 and ARC-9;
- the Human Architect's direct taxonomy ratification and separate Package A repository-write authorization;
- the Human-supplied exact-head Ubuntu `verify-sync` result at `70924a7e9c0592a25255d8ecef68be4624933b42`.

No unresolved legacy Section V text was reconstructed from numbering, neighboring prose, later summaries, or economic convention.

## Outcome

ARC-8 established a two-axis economic grammar:

1. **Monetary operation** records what happened to supply, an existing balance, custody, a reserve, or a liability.
2. **Economic purpose** records why the operation occurred.

Purpose labels are additive rather than substitutive. They may reference one or more monetary-operation receipts but may not hide whether existing MANA moved or new MANA was constitutionally issued.

The ratified taxonomy covers issuance, transfer, reward, compensation, grant, Treasury allocation, protocol payment, commerce, refund, escrow placement, escrow return, holding/saving, fee, sink, burn, reserve movement, borrowing/credit, and debt repayment.

The taxonomy establishes event distinctions and factual receipt semantics only. It does not by itself authorize eligibility rules, distribution programs, issuance quantities, prices, reward formulas, credit terms, fee schedules, sink parameters, or other downstream economic mechanisms.

## Typed records

### ARC-DEC-8-01 — Ratify the two-axis economic event grammar

- **Record type:** decision.
- **Parent session:** `ARC-SES-8`.
- **Created at:** `2026-08-16T23:44:00-04:00`.
- **Classification:** `RATIFICATION`.
- **Knowledge state:** `KNOWN-RATIFIED`.
- **Disposition:** `RATIFIED`.
- **Statement:** Every material MANA event must preserve both its monetary operation and its economic purpose. An economic-purpose label may reference one or more monetary operations but may not replace or obscure them.
- **Authority:** Human Architect.
- **Sources:** Economic Constitution at `70924a7e9c0592a25255d8ecef68be4624933b42`, ARC-SES-7, Work Registry ARC-8, and the current Human Architect conversation.
- **Canonical destination / related task:** `docs/economics/economic-constitution.md`, Section V.
- **Privacy class:** `PUBLIC`.

### ARC-DEC-8-02 — Ratify issuance as the sole MANA supply-creation event class

- **Record type:** decision.
- **Parent session:** `ARC-SES-8`.
- **Created at:** `2026-08-16T23:44:00-04:00`.
- **Classification:** `RATIFICATION`.
- **Knowledge state:** `KNOWN-RATIFIED`.
- **Disposition:** `RATIFIED`.
- **Statement:** Issuance is the event class that creates new MANA supply. Transfer, Treasury spending, recycling, reserve movement, reward, compensation, grants, commerce, credit, and other movement or purpose events do not create MANA unless a separate constitutionally authorized issuance event actually occurs.
- **Authority:** Human Architect.
- **Sources:** Economic Constitution Sections IV-V at `70924a7e9c0592a25255d8ecef68be4624933b42` and the current Human Architect conversation.
- **Canonical destination / related task:** `docs/economics/economic-constitution.md`, Sections IV-V.
- **Privacy class:** `PUBLIC`.

### ARC-DEC-8-03 — Ratify the acquisition and circulation event taxonomy with explicit provenance

- **Record type:** decision.
- **Parent session:** `ARC-SES-8`.
- **Created at:** `2026-08-16T23:44:00-04:00`.
- **Classification:** `RATIFICATION`.
- **Knowledge state:** `KNOWN-RATIFIED`.
- **Disposition:** `RATIFIED`.
- **Statement:** The Section V event classes and their distinctions are ratified as landed. Each material event must preserve its applicable authority, funding or value source, receipt semantics, and forbidden interpretations so unlike economic operations cannot be collapsed into labels such as earning, payment, or reward.
- **Authority:** Human Architect.
- **Sources:** Economic Constitution Section V at `70924a7e9c0592a25255d8ecef68be4624933b42`, Work Registry ARC-8, and the current Human Architect conversation.
- **Canonical destination / related task:** `docs/economics/economic-constitution.md`, Section V.
- **Privacy class:** `PUBLIC`.

### ARC-DEC-8-04 — Require composite-event integrity

- **Record type:** decision.
- **Parent session:** `ARC-SES-8`.
- **Created at:** `2026-08-16T23:44:00-04:00`.
- **Classification:** `RATIFICATION`.
- **Knowledge state:** `KNOWN-RATIFIED`.
- **Disposition:** `RATIFIED`.
- **Statement:** Composite economic events must preserve their linked primitive receipts. A purpose description such as rewarded, paid, compensated, or granted may not flatten away whether existing MANA moved, reserves were reclassified, custody changed, liabilities changed, or new supply was created.
- **Authority:** Human Architect.
- **Sources:** Economic Constitution Section V at `70924a7e9c0592a25255d8ecef68be4624933b42` and the current Human Architect conversation.
- **Canonical destination / related task:** Section V receipt semantics and downstream economic design.
- **Privacy class:** `PUBLIC`.

### ARC-DEC-8-05 — Hold ARC-9 pending explicit Human Architect release

- **Record type:** decision.
- **Parent session:** `ARC-SES-8`.
- **Created at:** `2026-08-16T23:44:00-04:00`.
- **Classification:** `RATIFICATION`.
- **Knowledge state:** `KNOWN-RATIFIED`.
- **Disposition:** `RATIFIED`.
- **Statement:** `ARC-9 — Reconfirm recovered §5.3–§5.7 decisions and decide §5.6 directly` remains the exact successor task, but Architect GPT must not begin ARC-9 until the Human Architect gives a separate explicit release instruction.
- **Authority:** Human Architect.
- **Sources:** Work Registry ARC-9 and the current Human Architect conversation.
- **Canonical destination / related task:** ARC-9 sequencing boundary.
- **Privacy class:** `PUBLIC`.

## Repository changes

ARC-8 used two bounded repository packages.

Package A landed at `70924a7e9c0592a25255d8ecef68be4624933b42`:

1. replaced the unresolved Section V placeholder in `docs/economics/economic-constitution.md` with the ratified acquisition and circulation event taxonomy.

The closeout metadata package is bounded to:

1. this canonical `ARC-SES-8` record;
2. one append-only `ARC-SES-8` digest in `docs/governance/architectgpt/architect-log.md`;
3. deterministic inclusion of ARC-SES-8 in `docs/governance/architectgpt/continuity-index.json`.

`docs/repo/repo-index.json` is not part of the closeout metadata package. It must be regenerated after that metadata commit so its head metadata and tracked-tree projection reflect the new repository state.

## Verification

- Human-supplied Ubuntu verification fast-forwarded the feature branch to `70924a7e9c0592a25255d8ecef68be4624933b42`.
- `bash scripts/repo-index.sh` regenerated the local repository index at that substantive head.
- `bash scripts/verify-sync.sh` passed all 24 checks at that exact head.
- Session-ledger validation passed six existing canonical session records.
- Continuity-index validation passed six sessions with `ARC-SES-1` preserved as reserved.
- Live GitHub re-read confirmed the feature branch still pointed to `70924a7e9c0592a25255d8ecef68be4624933b42` at closeout review.
- GitHub commit inspection confirmed Package A changed only `docs/economics/economic-constitution.md`.
- GitHub combined status reports Vercel success at the substantive closing head.
- No PR-triggered GitHub Actions run was visible for the substantive closing head, so no hosted Actions CI claim is made.
- Full post-closeout repository-index regeneration and Verify Sync are not claimed until the metadata package lands.

## Privacy review

- **Privacy class:** `PUBLIC`.
- **Review status:** `COMPLETE`.
- No raw conversation transcript is persisted.
- No credentials, tokens, private reflections, hidden provider context, bearer URLs, or raw terminal output are persisted.
- **Redactions applied:** none.

## Unresolved matters

- ARC-9 is explicitly held and must not begin until the Human Architect separately releases it.
- ARC-8 does not reconfirm recovered Sections 5.3 through 5.7 or decide Section 5.6.
- Section 5.6 therefore remains subject to direct decision in ARC-9 after release.
- Section 5.9.16 remains unratified.
- Detailed acquisition policy, eligibility, distribution mechanics, quantitative parameters, pricing, reward formulas, credit terms, fee schedules, sink parameters, legal/tax questions, and simulation choices remain downstream or deferred.
- No merge, promotion, deployment, stable-branch mutation, native-runtime implementation, or chain-economics implementation is authorized by ARC-8.

## Exact next task

`ARC-9 — Reconfirm recovered §5.3–§5.7 decisions and decide §5.6 directly`.

**HOLD:** Do not begin ARC-9 until the Human Architect explicitly releases it.

After release, the next gate is: present only evidence-backed normalized text; directly decide anything still unknown, especially the exact Section 5.6 scope.
