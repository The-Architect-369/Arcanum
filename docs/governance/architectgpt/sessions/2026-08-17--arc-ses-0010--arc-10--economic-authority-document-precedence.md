---
schema: arcanum.architect.session/v1
record_type: session
session_id: ARC-SES-10
filename_slug: economic-authority-document-precedence
status: REVIEW-PENDING
task_id: ARC-10
task_title: "Ratify economic authority and document precedence"
domain: "Economic Constitution"
priority: "P0 Critical"
success_condition: "Ratify one explicit economic authority and document-precedence hierarchy, preserve specialized Treasury and governance authority, and prevent summary documents from silently overriding controlling constitutional text."
non_scope:
  - "ratifying unresolved monetary numbers, rates, ceilings, percentages, vesting schedules, reserve-release schedules, or pricing"
  - "creating a new MANA issuance mechanism or activating economic runtime behavior"
  - "expanding Treasury powers or mint authority"
  - "changing governance quorum, approval thresholds, or amendment mechanics"
  - "importing unratified Section 5.8 or later historical/issue-discussion material into canon"
  - "merge, promotion, stable-branch mutation, or deployment"
repository: The-Architect-369/Arcanum
branch: agent/wave-xxiv-repository-canonicalization
branch_role: feature
head_commit_start: 6205a31113428af13b18bc5065a36502ed6b9809
head_commit_end: 1b446cbec1770d56a628e57799799a49c91733ad
grounding_state: mixed
source_refs:
  - "github:commit:6205a31113428af13b18bc5065a36502ed6b9809"
  - "github:commit:29a67a226e3a03f8b013c8a5698a4c1b28b77323"
  - "github:commit:1b446cbec1770d56a628e57799799a49c91733ad"
  - "github:file:docs/economics/economic-constitution.md@1b446cbec1770d56a628e57799799a49c91733ad"
  - "github:file:docs/governance/economic-principles.md@1b446cbec1770d56a628e57799799a49c91733ad"
  - "github:file:docs/governance/treasury-constitution.md@1b446cbec1770d56a628e57799799a49c91733ad"
  - "github:file:docs/governance/governance-specification.md@1b446cbec1770d56a628e57799799a49c91733ad"
  - "github:file:docs/repo/repository-canonicalization.md@1b446cbec1770d56a628e57799799a49c91733ad"
  - "github:file:docs/index.md@1b446cbec1770d56a628e57799799a49c91733ad"
  - "github:issue:35"
  - "notion:page:3ba2bb44-20b8-813f-bef6-e5fc817a5030"
  - "notion:page:3ba2bb44-20b8-81ff-bccb-d103dfa52eb2"
  - "user:conversation:current"
started_at: "2026-08-17T18:09:06-04:00"
closed_at: ""
timezone: America/New_York
provider_provenance:
  - "github:connector:read"
  - "github:connector:write"
  - "notion:connector:read"
  - "notion:connector:write"
  - "user:human-architect:observed"
outcome: "ARC-10 ratified and landed the controlling economic authority hierarchy: system Doctrine remains supreme; the Economic Constitution controls ARCnet economic law and MANA; specialized constitutions retain bounded domain authority; the Governance Specification controls delegated operational mechanics; Economic Principles remains a subordinate canonical summary and parameter registry; implementation has no independent constitutional authority. Closure remains review-pending only because the controlling-log digest, deterministic repository-index regeneration, continuity validators, and exact-head Verify Sync have not all been reconciled on an available execution surface."
decision_state_summary: KNOWN-RATIFIED
canon_impact: RATIFIED
canonicalization_status: LANDED
privacy_class: PUBLIC
privacy_review_status: COMPLETE
redactions_applied: []
decision_ids:
  - ARC-DEC-10-01
  - ARC-DEC-10-02
  - ARC-DEC-10-03
  - ARC-DEC-10-04
  - ARC-DEC-10-05
idea_ids: []
correction_ids: []
deferred_question_ids: []
repository_write_performed: true
changed_paths:
  - "docs/economics/economic-constitution.md"
  - "docs/governance/economic-principles.md"
  - "docs/governance/treasury-constitution.md"
  - "docs/governance/governance-specification.md"
  - "docs/repo/repository-canonicalization.md"
  - "docs/index.md"
  - "docs/governance/architectgpt/sessions/2026-08-17--arc-ses-0010--arc-10--economic-authority-document-precedence.md"
  - "docs/governance/architectgpt/continuity-index.json"
verification:
  - "PASS | exact branch lease | agent/wave-xxiv-repository-canonicalization remained identical to 1b446cbec1770d56a628e57799799a49c91733ad before continuity closeout work"
  - "PASS | substantive ratification | Economic Constitution promoted to canonical controlling economic authority and dependent documents aligned across commits 29a67a226e3a03f8b013c8a5698a4c1b28b77323 through 1b446cbec1770d56a628e57799799a49c91733ad"
  - "PASS | GitHub issue provenance | ARC-10 ratification provenance persisted to issue #35"
  - "PASS | Notion Work Registry | ARC-10 decision state is Known Ratified and ARC-11 is identified as the Ready successor"
  - "PASS | Vercel combined status | success at substantive head 1b446cbec1770d56a628e57799799a49c91733ad"
  - "NOT-RUN | PR-triggered GitHub Actions | no workflow run was present for substantive head 1b446cbec1770d56a628e57799799a49c91733ad"
  - "NOT-RUN | repository-index regeneration and Verify Sync | docs/repo/repo-index.json remains anchored to c67d47ecb and no Ubuntu/local execution surface is available in this session"
  - "NOT-RUN | controlling-log digest | canonical append-only architect-log digest has not been landed; CLOSED status is withheld until log/index/verification evidence reconcile"
next_task_id: ARC-11
next_gate: "Create the Deferred Decision & Simulation Register: define the canonical register schema and extract every numerical, mechanical, legal, and modeling deferral with source-section provenance while keeping placeholders non-constitutional."
review_status: APPROVED
reviewed_by: "Human Architect"
reviewed_at: "2026-08-17T18:26:00-04:00"
approval_source: "Current Architect conversation: after ARC-10 substantive ratification was landed and the remaining ARC-SES-10 continuity gate was stated explicitly, the Human Architect instructed, 'Close ARC-10' on 2026-08-17."
github_commit: 1b446cbec1770d56a628e57799799a49c91733ad
---

# ARC-SES-10 — Economic Authority and Document Precedence

## Purpose

Close Work Registry Task `ARC-10` by resolving the competing-authority ambiguity between the deep Economic Constitution and the older Economic Principles, while preserving the bounded specialized authority of Treasury and governance instruments.

## Grounding

- **Repository access:** provided.
- **Repository:** `The-Architect-369/Arcanum`.
- **Branch:** `agent/wave-xxiv-repository-canonicalization`.
- **Branch role:** feature.
- **Phase:** Pre-Genesis.
- **Wave:** XXIV — Repository Canonicalization.
- **Starting head:** `6205a31113428af13b18bc5065a36502ed6b9809`.
- **First substantive ARC-10 write:** `29a67a226e3a03f8b013c8a5698a4c1b28b77323`.
- **Substantive closing head:** `1b446cbec1770d56a628e57799799a49c91733ad`.
- **Grounding state:** mixed live GitHub evidence, canonical continuity evidence, Notion Work Registry state, and direct Human Architect ratification.
- **Human close instruction:** `2026-08-17T18:26:00-04:00`.

The `started_at` timestamp is anchored to the first ARC-10 substantive GitHub commit because no earlier exact provider timestamp for preliminary discussion is preserved as canonical evidence.

`head_commit_end` and `github_commit` bind the reviewed packet to the substantive ARC-10 state. Any later continuity-metadata commit is intentionally not embedded into those fields, avoiding self-reference.

## Ratified authority hierarchy

ARC-10 establishes the following controlling order for economic authority:

1. **System Doctrine and ratified system-wide constitutional boundaries** — supreme.
2. **`docs/economics/economic-constitution.md`** — controlling constitutional authority for ARCnet economic law, MANA, issuance architecture, and economic invariants.
3. **Specialized constitutions** — controlling only within expressly bounded domains, including the Treasury Constitution for Treasury custody, allocation, and execution, subject to Doctrine and the Economic Constitution.
4. **`docs/governance/governance-specification.md`** — controlling delegated operational governance mechanics; it cannot manufacture authority not granted by higher constitutional law.
5. **`docs/governance/economic-principles.md`** — canonical economic policy summary and delegated parameter registry, subordinate to the Economic Constitution rather than a competing constitution.
6. **Implementation** — code, configuration, implementation specifications, and runtime behavior implement higher authority and possess no independent constitutional authority.

Conflict resolution is explicit: higher authority prevails; specialized instruments control only their bounded scope; recency alone creates no authority; summaries and implementation cannot amend higher law through paraphrase, omission, contradiction, or silence; and unresolved matters remain unresolved until separately ratified.

## Typed records

### ARC-DEC-10-01 — Ratify the economic authority hierarchy

- **Record type:** decision.
- **Parent session:** `ARC-SES-10`.
- **Created at:** `2026-08-17T18:09:06-04:00`.
- **Classification:** `RATIFICATION`.
- **Knowledge state:** `KNOWN-RATIFIED`.
- **Disposition:** `RATIFIED`.
- **Statement:** ARCnet economic authority follows Doctrine → Economic Constitution → specialized constitutions → Governance Specification → Economic Principles / delegated parameter registry → implementation.
- **Authority:** Human Architect.
- **Sources:** Economic Constitution and dependent documents at `1b446cbec1770d56a628e57799799a49c91733ad`, Issue #35, Work Registry ARC-10, and current Human approval.
- **Canonical destination / related task:** `docs/economics/economic-constitution.md` Status and Authority.
- **Privacy class:** `PUBLIC`.

### ARC-DEC-10-02 — Ratify explicit conflict resolution

- **Record type:** decision.
- **Parent session:** `ARC-SES-10`.
- **Created at:** `2026-08-17T18:09:06-04:00`.
- **Classification:** `RATIFICATION`.
- **Knowledge state:** `KNOWN-RATIFIED`.
- **Disposition:** `RATIFIED`.
- **Statement:** Higher economic authority prevails over lower authority; document recency alone creates no authority; summaries, whitepapers, indexes, architecture descriptions, parameter registries, and implementation cannot silently amend controlling constitutional text; conflicting lower material must be corrected.
- **Authority:** Human Architect.
- **Sources:** Economic Constitution, repository canonicalization rules, docs index, Issue #35, and current Human approval.
- **Canonical destination / related task:** Economic Constitution authority section and `docs/repo/repository-canonicalization.md`.
- **Privacy class:** `PUBLIC`.

### ARC-DEC-10-03 — Preserve specialized Treasury and governance authority

- **Record type:** decision.
- **Parent session:** `ARC-SES-10`.
- **Created at:** `2026-08-17T18:09:06-04:00`.
- **Classification:** `RATIFICATION`.
- **Knowledge state:** `KNOWN-RATIFIED`.
- **Disposition:** `RATIFIED`.
- **Statement:** The Treasury Constitution remains controlling for Treasury custody, allocation, and execution inside its bounded domain, while the Governance Specification remains controlling for delegated proposal, voting, parameter-change, amendment, time-lock, and execution mechanics; neither may create economic authority beyond higher constitutional law.
- **Authority:** Human Architect.
- **Sources:** Treasury Constitution and Governance Specification at `1b446cbec1770d56a628e57799799a49c91733ad` and current Human approval.
- **Canonical destination / related task:** `docs/governance/treasury-constitution.md` and `docs/governance/governance-specification.md`.
- **Privacy class:** `PUBLIC`.

### ARC-DEC-10-04 — Preserve the ratification boundary

- **Record type:** decision.
- **Parent session:** `ARC-SES-10`.
- **Created at:** `2026-08-17T18:09:06-04:00`.
- **Classification:** `RATIFICATION`.
- **Knowledge state:** `KNOWN-RATIFIED`.
- **Disposition:** `RATIFIED`.
- **Statement:** ARC-10 changes document authority and precedence only; it does not ratify unresolved monetary parameters, create issuance mechanisms, expand Treasury powers, change governance thresholds, import later unratified Section V material, or activate runtime economic behavior.
- **Authority:** Human Architect.
- **Sources:** Economic Constitution ARC-10 boundary at `1b446cbec1770d56a628e57799799a49c91733ad`, Issue #35, and current Human approval.
- **Canonical destination / related task:** ARC-10 authority boundary.
- **Privacy class:** `PUBLIC`.

### ARC-DEC-10-05 — Establish ARC-11 as successor

- **Record type:** decision.
- **Parent session:** `ARC-SES-10`.
- **Created at:** `2026-08-17T18:26:00-04:00`.
- **Classification:** `RATIFICATION`.
- **Knowledge state:** `KNOWN-RATIFIED`.
- **Disposition:** `RATIFIED`.
- **Statement:** After ARC-10 continuity closure reconciles, the exact successor is `ARC-11 — Create the Deferred Decision & Simulation Register`.
- **Authority:** Human Architect.
- **Sources:** Work Registry ARC-11 and current Human instruction to close ARC-10.
- **Canonical destination / related task:** ARC-11.
- **Privacy class:** `PUBLIC`.

## Repository changes

ARC-10's substantive ratification changed:

- `docs/economics/economic-constitution.md`;
- `docs/governance/economic-principles.md`;
- `docs/governance/treasury-constitution.md`;
- `docs/governance/governance-specification.md`;
- `docs/repo/repository-canonicalization.md`;
- `docs/index.md`.

This continuity write additionally adds this session record and updates the derived continuity index. The controlling Architect log is intentionally not claimed as changed until a safe append-only write is available.

## Verification and closure state

- The feature branch was re-read and remained identical to substantive head `1b446cbec1770d56a628e57799799a49c91733ad` before continuity closeout work.
- The six ratification documents are already landed on the feature branch.
- GitHub Issue #35 contains ARC-10 ratification provenance.
- Work Registry ARC-10 is `Known Ratified`; ARC-11 exists as `Ready`.
- Vercel combined status is `success` at the substantive head.
- No PR-triggered GitHub Actions run exists for the substantive head.
- `docs/repo/repo-index.json` remains anchored to `c67d47ecb`, not the current branch tip.
- Repository-index regeneration, continuity validators, and `bash scripts/verify-sync.sh` have not been run on the exact closeout head in an Ubuntu/local execution surface available to this session.
- The append-only controlling-log digest has not yet been landed.

For those reasons, this record is deliberately `REVIEW-PENDING`, not `CLOSED`. This preserves the fail-closed continuity rule rather than claiming a completed canonical close without reconciled log/index/verification evidence.

## Privacy review

- **Privacy class:** `PUBLIC`.
- **Review status:** `COMPLETE`.
- No raw transcript, secret, token, private reflection, hidden provider context, bearer URL, or raw provider/terminal log is persisted.
- **Redactions applied:** none.

## Exact next task

`ARC-11 — Create the Deferred Decision & Simulation Register`.

Next gate: create the canonical register schema and extract every numerical, mechanical, legal, and modeling deferral with source-section provenance, stable IDs, dependencies, candidate models, simulation scenarios, metrics, failure cases, legal-review requirements, ratifying authority, and status.

ARC-11 must not be represented as active until ARC-10's controlling-log and exact-head verification closure gates reconcile.
