---
schema: arcanum.architect.session/v1
record_type: session
session_id: ARC-SES-10
filename_slug: economic-authority-document-precedence
status: CLOSED
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
  - "github:commit:77ee94c6b84ed12e8dd58896c4e53e9b1b52ce48"
  - "github:commit:f9898845fa1eddd98ab5938690152e31e9a06676"
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
closed_at: "2026-08-18T08:21:00-04:00"
timezone: America/New_York
provider_provenance:
  - "github:connector:read"
  - "github:connector:write"
  - "notion:connector:read"
  - "notion:connector:write"
  - "user:human-architect:observed"
outcome: "ARC-10 ratified and landed the controlling economic authority hierarchy: system Doctrine remains supreme; the Economic Constitution controls ARCnet economic law and MANA; specialized constitutions retain bounded domain authority; the Governance Specification controls delegated operational mechanics; Economic Principles remains a subordinate canonical summary and parameter registry; implementation has no independent constitutional authority. The canonical session ledger, continuity index, repository index, and Verify Sync passed after structural repair, and the single controlling-log digest landed at f9898845fa1eddd98ab5938690152e31e9a06676."
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
  - "docs/governance/architectgpt/architect-log.md"
  - "docs/governance/architectgpt/continuity-index.json"
verification:
  - "PASS | exact branch lease | feature branch was identical to f9898845fa1eddd98ab5938690152e31e9a06676 immediately before CLOSED metadata preparation"
  - "PASS | substantive ratification | Economic Constitution promoted to canonical controlling economic authority and dependent documents aligned across commits 29a67a226e3a03f8b013c8a5698a4c1b28b77323 through 1b446cbec1770d56a628e57799799a49c91733ad"
  - "PASS | ARC-SES-10 structural repair | commit 77ee94c6b84ed12e8dd58896c4e53e9b1b52ce48 supplies the required canonical body headings"
  - "PASS | post-repair session ledger | Human Architect Ubuntu run at 77ee94c6b84ed12e8dd58896c4e53e9b1b52ce48 passed all 9 canonical session records"
  - "PASS | post-repair continuity index | Human Architect Ubuntu run at 77ee94c6b84ed12e8dd58896c4e53e9b1b52ce48 passed deterministic continuity validation for 9 sessions and 1 reserved session"
  - "PASS | post-repair repository index | Human Architect Ubuntu run at 77ee94c6b84ed12e8dd58896c4e53e9b1b52ce48 regenerated docs/repo/repo-index.json and Verify Sync repo-index integrity passed"
  - "PASS | post-repair Verify Sync | Human Architect Ubuntu run at 77ee94c6b84ed12e8dd58896c4e53e9b1b52ce48 passed all 24 verification layers"
  - "PASS | controlling-log digest | single ARC-SES-10 closeout block naming the canonical record path landed at f9898845fa1eddd98ab5938690152e31e9a06676"
  - "PASS | GitHub issue provenance | ARC-10 ratification and closeout provenance persisted to issue #35"
  - "PASS | Notion Work Registry grounding | ARC-10 decision state is Known Ratified and ARC-11 is identified as the Ready successor"
next_task_id: ARC-11
next_gate: "Create the Deferred Decision & Simulation Register: define the canonical register schema and extract every numerical, mechanical, legal, and modeling deferral with source-section provenance while keeping placeholders non-constitutional."
review_status: APPROVED
reviewed_by: "Human Architect"
reviewed_at: "2026-08-17T18:26:00-04:00"
approval_source: "Current Architect conversation: after ARC-10 substantive ratification was landed and the remaining ARC-SES-10 continuity gate was stated explicitly, the Human Architect instructed, 'Close ARC-10' on 2026-08-17; subsequent Ubuntu verification and controlling-log landing supplied the required closure evidence."
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
- **Structural-repair head:** `77ee94c6b84ed12e8dd58896c4e53e9b1b52ce48`.
- **Controlling-log head:** `f9898845fa1eddd98ab5938690152e31e9a06676`.
- **Grounding state:** mixed live GitHub evidence, canonical continuity evidence, Notion Work Registry state, direct Human Architect ratification, and Human-supplied Ubuntu verification.
- **Human close instruction:** `2026-08-17T18:26:00-04:00`.
- **Canonical close timestamp:** `2026-08-18T08:21:00-04:00`.

The `started_at` timestamp is anchored to the first ARC-10 substantive GitHub commit because no earlier exact provider timestamp for preliminary discussion is preserved as canonical evidence.

`head_commit_end` and `github_commit` bind the reviewed packet to the substantive ARC-10 state. Later continuity-metadata commits are intentionally not embedded into those fields, avoiding self-reference.

## Source inventory

ARC-10 relied only on the reviewed authority and provenance surfaces bound in frontmatter:

- `docs/economics/economic-constitution.md` at substantive head `1b446cbec1770d56a628e57799799a49c91733ad`;
- `docs/governance/economic-principles.md` at the same substantive head;
- `docs/governance/treasury-constitution.md` at the same substantive head;
- `docs/governance/governance-specification.md` at the same substantive head;
- `docs/repo/repository-canonicalization.md` and `docs/index.md` at the same substantive head;
- the ARC-SES-10 structural repair at `77ee94c6b84ed12e8dd58896c4e53e9b1b52ce48`;
- the single controlling-log closeout block at `f9898845fa1eddd98ab5938690152e31e9a06676`;
- GitHub Issue #35 for Wave XXIV decision and closeout provenance;
- Notion Work Registry pages for ARC-10 and ARC-11 as operational mirrors;
- direct Human Architect ratification, close instruction, and Ubuntu verification evidence.

No unresolved economic parameter, later Section V issue discussion, or inferred authority rule was imported into ARC-10 through this closeout record.

## Outcome

### Ratified authority hierarchy

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

Continuity closure additionally changed:

- this canonical session record;
- `docs/governance/architectgpt/architect-log.md`, with exactly one ARC-SES-10 controlling-log block landed at `f9898845fa1eddd98ab5938690152e31e9a06676`;
- `docs/governance/architectgpt/continuity-index.json`, regenerated from canonical session inputs.

## Verification

- The feature branch lease was exact at `f9898845fa1eddd98ab5938690152e31e9a06676` immediately before CLOSED metadata preparation.
- The six substantive ratification documents are landed on the feature branch.
- The earlier structural validation failure at `b4cb49ee7c2f9793bb661e3341a61a45901fa346` is retained as historical evidence and was repaired at `77ee94c6b84ed12e8dd58896c4e53e9b1b52ce48`.
- Human-supplied Ubuntu verification after that repair passed the canonical session ledger: 9 records.
- The same run regenerated and passed the deterministic continuity index: 9 sessions and 1 reserved session.
- The same run regenerated the repository index and passed repository-index integrity.
- `bash scripts/verify-sync.sh` passed all 24 verification layers at `77ee94c6b84ed12e8dd58896c4e53e9b1b52ce48`.
- The single controlling-log closeout block naming this canonical record path landed at `f9898845fa1eddd98ab5938690152e31e9a06676`.
- GitHub Issue #35 contains ARC-10 ratification and closeout provenance.
- Work Registry ARC-10 remains the operational mirror for this canonical record; ARC-11 is the exact successor.
- After this CLOSED metadata lands, one final exact-head Ubuntu regeneration/Verify Sync run is required before external mirrors are advanced from blocked/review state. Any failure must reopen correction rather than being ignored.

## Privacy review

- **Privacy class:** `PUBLIC`.
- **Review status:** `COMPLETE`.
- No raw transcript, secret, token, private reflection, hidden provider context, bearer URL, or raw provider/terminal log is persisted.
- **Redactions applied:** none.

## Unresolved matters

- No substantive ARC-10 authority or conflict-resolution decision remains unresolved within the approved acceptance criteria.
- No numerical, mechanical, legal, or modeling deferral is promoted by this closeout; those remain inputs to ARC-11.
- The only remaining action after this metadata landing is post-landing verification and external-mirror synchronization. It is a closure confirmation gate, not a new ARC-10 substantive decision.
- No merge, promotion, deployment, stable-branch mutation, or runtime economic activation is authorized by ARC-10 closure.

## Exact next task

`ARC-11 — Create the Deferred Decision & Simulation Register`.

Next gate: create the canonical register schema and extract every numerical, mechanical, legal, and modeling deferral with source-section provenance, stable IDs, dependencies, candidate models, simulation scenarios, metrics, failure cases, legal-review requirements, ratifying authority, and status.

ARC-11 becomes active only after this CLOSED metadata package passes the final exact-head verification and the external mirrors are synchronized.
