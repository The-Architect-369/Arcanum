---
title: "ARCnet Edge Study 09 — Architect ↔ Aerarium"
status: design-candidate
visibility: public
last_updated: 2026-08-22
description: "Stewardship edge study: system-development work and public-goods proposals ↔ bounded funding, budgets, grants, and shared-resource stewardship."
phase: "Pre-Genesis"
authority: "non-canonical design evidence"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/37"
edge_id: "architect.aerarium"
edge_class: "kinship-candidate"
---

# ARCnet Edge Study 09 — Architect ↔ Aerarium

## Purpose

This study examines the candidate relationship between **Architect** and **Aerarium** inside the stewardship tetrahedron.

It asks:

> How may system-development work receive shared funding without allowing Architect to self-fund, allowing money to purchase design authority, or allowing a treasury-facing system to decide what is technically true?

The candidate correspondence is:

> **Work / Public-Goods Design ↔ Funding / Shared-Resource Stewardship**

This is design evidence only.

## Repository grounding

Current canon establishes:

- Architect is a builder/instrument and does not possess inherent governance or Treasury authority.
- Treasury is a stewardship instrument, not a discretionary operator.
- Treasury outflows require governance-approved proposals with recipient, amount, purpose, execution window, and audit reference.
- No single actor, including the Architect, may unilaterally execute Treasury actions.
- MANA may support builders, security, protocol operations, ecosystem development, and other bounded utilities.
- MANA may not purchase governance supremacy, constitutional exemption, identity legitimacy, elapsed time, or Vitae recognition.
- Economic consequences must be visible before authorization and reconstructable after through receipts.

Therefore **Aerarium** is treated here as the candidate human-facing/public-resource lens built atop the canonical Treasury and Economic Constitution. It is not independent mint authority and not a replacement for Treasury law.

## Semantic correspondence

Architect asks:

> What work is needed, what capability will it produce, what evidence will demonstrate completion, and what resources are required?

Aerarium asks:

> What shared resources may legitimately support this work, under what authorization, budget, conditions, milestones, and public accounting?

The edge sits between:

- development need and funding request;
- implementation milestone and disbursement milestone;
- builder compensation and shared-resource stewardship;
- technical deliverables and public-goods accounting;
- budget estimation and authorized expenditure.

## Candidate endpoint faculties

### Architect-facing port: Work Package / Milestone / Evidence Plan

Architect may produce:

- scoped work package;
- architecture/design deliverable;
- implementation milestone;
- dependency and risk analysis;
- estimated resource need;
- evidence/verification criteria;
- progress packet;
- completion packet;
- change request when scope evolves.

Architect does not authorize payment merely by declaring the work important.

### Aerarium-facing port: Funding Request / Budget / Disbursement / Accounting

Aerarium may present or route:

- Treasury funding proposals;
- builder grants;
- approved budgets;
- milestone-linked disbursements;
- payment schedules;
- expense and resource accounting;
- funding receipts;
- reserve visibility;
- conflict disclosures.

Aerarium does not determine whether a build actually works simply because it funded the work.

## Core passage

Candidate flow:

```text
Architect Work Package
       |
       | explicit funding request
       v
Aerarium Funding Draft
       |
       | governance / treasury authorization
       v
Approved Budget Envelope
       |
       | separate disbursement condition
       v
Work Performed by Architect / Contributors
       |
       | evidence packet
       v
Milestone Review
       |
       | condition satisfied
       v
Authorized Disbursement
```

The important distinction is that **funding authorization and technical completion are separate facts**.

## Funding–Authority Separation

The central law is:

```text
funding
!= architectural authority
```

A Treasury or grant may pay for a project.

A funder does not thereby gain the right to silently change Doctrine, bypass architecture review, or redefine technical truth.

Likewise Architect does not gain custody over shared funds merely because it designed the work.

Candidate law:

> **Shared funding may support system development; it may not purchase system sovereignty.**

## Budget–Execution Separation

An approved budget is an envelope, not an automatic transfer.

Candidate states:

```text
requested
reviewed
approved
committed
eligible_for_disbursement
disbursed
reconciled
closed
```

The exact Treasury mechanics remain canonical-law dependent.

This state separation prevents a governance-approved maximum budget from being interpreted as a requirement to spend all of it.

## Milestone Evidence Law

Funding can legitimately depend on bounded factual deliverables, for example:

- code or documentation delivered;
- review completed;
- audit performed;
- test suite passed;
- package signed;
- agreed public good made available.

But milestone payment should not depend on subjective claims about the human worth of a contributor.

Candidate law:

> **Disbursement conditions may verify deliverables; they must not become a hidden social-credit or worth system.**

## Builder Compensation versus MANA Issuance

Paying contributors with existing MANA and creating new MANA are different operations.

```text
Treasury transfer
!= issuance
```

The Edge Contract may carry a funding/disbursement request, but it cannot invent new supply authority.

Any issuance used to fund Treasury lanes must already be authorized under the Economic Constitution.

## Conflict-of-Interest Boundary

Architect may potentially participate in designing work for which contributors receive funding.

That creates a conflict surface.

A funding packet should therefore support explicit disclosure where relevant:

```text
proposal author
recommended recipient
technical reviewer
funding reviewer
custody signer
```

These roles may overlap in early phases only where canon permits and the overlap is visible.

Candidate law:

> **Role overlap must be disclosed; hidden self-dealing is not simplified governance.**

## Scope Drift and Change Orders

System-development work often changes after discovery.

The architecture should not quietly expand a funded work package without review.

Candidate flow:

```text
funded scope v1
    ↓ discovery
change request v2
    ↓ review
approved / rejected / partially approved
```

This produces a useful distinction:

```text
technical necessity discovered
!= automatic spending authority
```

## Public-Goods Provenance

A funded deliverable should retain enough provenance to show:

- what was funded;
- under which proposal/budget;
- who or what recipient received resources;
- what evidence was submitted;
- what amount was disbursed;
- what remains available;
- which review/approval authorized the payment.

This should not require revealing private contributor data beyond what the funding/accountability model legitimately requires.

## Sovereign faculty projection test

### Hope

Private Hope state should not be used to decide compensation, budget eligibility, or grant worthiness.

A builder may optionally include a public mission statement, but that is authored content, not psychological scoring.

### Tempus

Tempus may contribute factual schedule data:

- funding window;
- milestone date;
- review deadline;
- vesting/time-lock period where lawful;
- completion timestamp.

Temporal data must not become pressure to accelerate becoming.

### Vitae

Vitae/authority recognition may contribute to eligibility for bounded stewardship/review roles where canon permits.

It must not determine salary, human worth, or an automatic right to Treasury funds.

## Candidate directional actions

### Architect → Aerarium

- `create-funding-request`
- `submit-work-package`
- `submit-budget-estimate`
- `submit-milestone-evidence`
- `submit-change-request`
- `submit-completion-packet`

### Aerarium → Architect

- `return-funding-decision`
- `return-budget-envelope`
- `request-scope-clarification`
- `request-milestone-evidence`
- `return-disbursement-status`
- `request-change-order`

## Receipt model

Candidate receipts:

```text
architect_funding_request_created
aerarium_funding_proposal_submitted
aerarium_budget_approved
aerarium_budget_rejected
architect_milestone_evidence_submitted
aerarium_disbursement_authorized
aerarium_disbursement_executed
aerarium_budget_reconciled
```

The receipt should preserve the distinction between authorization and actual movement of funds.

## Settlement posture

Funding drafts, estimates, and local planning do not require chain settlement.

Treasury allocations and actual economic transfers requiring canonical finality should use the applicable governance/Treasury settlement path.

High-context internal Architect reasoning should remain off-chain.

## Failure modes

This edge fails if:

- Architect can self-approve payment from shared funds;
- funding purchases architectural or constitutional authority;
- Aerarium declares a build technically valid because it was funded;
- an approved budget is silently treated as already spent;
- milestone payments become human-worth scores;
- Treasury transfers are confused with new MANA issuance;
- scope expands without visible authorization;
- conflicts of interest are hidden.

## Patterns extracted from edge study 09

This study reconfirms:

1. **Authority Conservation** — funding does not elevate governance/design authority.
2. **Typed Claims** — budget, authorization, disbursement, completion, and reconciliation are distinct.
3. **Non-Transitive Authority** — technical need does not automatically authorize spending.
4. **Provenance Without Surveillance** — public accounting should not require personal dossiers.

It adds:

5. **Funding–Authority Separation** — money may support work but does not purchase design sovereignty.
6. **Budget–Disbursement Separation** — approval of an envelope is not movement of funds.
7. **Milestone Evidence Law** — payment conditions verify bounded deliverables, not human worth.
8. **Conflict Visibility** — overlapping design/funding/custody roles must be disclosed.
9. **Scope-Change Authorization** — discovered need and expanded spending authority are separate.
10. **Transfer–Issuance Separation** — Treasury spending is not monetary issuance.

## Open questions

- What exactly is Aerarium's human-facing role versus the underlying canonical Treasury module?
- Should builder grants use milestone tranches, reimbursement, streaming, or other mechanisms?
- Which evidence is sufficient before a milestone-linked disbursement?
- How should uncertain research work be funded when the outcome cannot be guaranteed?
- What disclosure is necessary when the Human Architect or related contributors are funded?
- How are maintenance budgets distinguished from project grants?
- What part of funding review belongs to Imperium versus Aerarium?

## Next gate

Study **Protection ↔ Imperium**, where the primary question becomes how security evidence and emergency constraints inform formal governance without allowing either security personnel or voting processes to counterfeit the other's authority.
