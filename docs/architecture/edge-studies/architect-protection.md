---
title: "ARCnet Edge Study 07 — Architect ↔ Protection"
status: design-candidate
visibility: public
last_updated: 2026-08-22
description: "Stewardship edge study: system construction and change proposals ↔ independent security, integrity, provenance, and capability assurance."
phase: "Pre-Genesis"
authority: "non-canonical design evidence"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/37"
edge_id: "architect.protection"
edge_class: "kinship-candidate"
---

# ARCnet Edge Study 07 — Architect ↔ Protection

## Purpose

This study examines the candidate relationship between **Architect** and **Protection** inside the stewardship tetrahedron.

It asks:

> How may the system be changed without allowing the builder to become its own unquestioned verifier, or the verifier to become an unaccountable ruler of the build process?

The candidate correspondence is:

> **Build / Change ↔ Verification / Assurance**

This is design evidence only.

## Repository grounding

Current repository evidence establishes several relevant constraints:

- ARCnet Native Decisions defines Architect as a builder and guardian that may support visual editing, controlled code interaction, testing, preview, proposal generation, and staged release flows.
- No automated guardian may replace Human Architect authority or silently resolve doctrinal disagreement.
- ARCnet applications are expected to use signed packages with identity, version, provenance, capability declarations, and upgrade lineage.
- Package signing alone does not establish trust, installation permission, publication approval, entitlement, or governance approval.
- Architect GPT is an instrument, not an authority, and repository writes require explicit scope and Human Architect authorization.
- Agent Permission Boundaries distinguish drafting, local execution, repository write, chain action, and governance/treasury authority as separate permission classes.
- The ARCnet Protection Suite is named in native planning but is not yet implemented as a production application.

Therefore **Protection** in this study is a candidate stewardship system assembled from already-canonical security, provenance, capability, review, and audit responsibilities. Its internal taxonomy is not yet canon.

## Semantic correspondence

Architect asks:

> What should we build or change, and how can that change be expressed as a bounded implementation candidate?

Protection asks:

> What can be verified about this candidate, what risks does it introduce, and which already-authorized invariants or capability boundaries apply?

The edge sits between:

- design and assurance;
- implementation intent and adversarial review;
- package creation and provenance verification;
- capability requests and capability-policy enforcement;
- remediation and re-verification.

## Candidate endpoint faculties

### Architect-facing port: Design / Patch / Release Candidate

Candidate Architect objects include:

- architecture proposal;
- implementation plan;
- code patch;
- package manifest;
- capability declaration;
- release candidate;
- migration plan;
- rollback plan;
- verification request.

Architect may construct and revise these objects.

Architect should not be allowed to convert its own assertion of safety into independent evidence of safety.

### Protection-facing port: Review / Verification / Integrity

Candidate Protection functions include:

- signature and provenance verification;
- manifest and capability diff inspection;
- dependency and supply-chain review;
- policy/invariant checks;
- attack-surface analysis;
- security test evidence;
- privacy-boundary review;
- release-integrity verification;
- incident and regression review.

Protection may produce findings and enforce only those hard boundaries whose authority is already established elsewhere.

## Core passage

A strong first-pass flow is:

```text
Architect Change Candidate
       |
       | explicit review request
       v
Protection Review Envelope
       |
       v
Finding Set + Evidence
       |
       +---------------------------+
       |                           |
       | no material finding       | remediation required
       v                           v
Release Evidence           Architect Remediation Candidate
                                       |
                                       | new candidate / digest
                                       v
                               Protection Re-review
```

Protection does not silently edit the candidate.

Architect does not silently mark its own work as independently verified.

## Independent Verification Law

The most important distinction exposed by this edge is:

```text
builder evidence
    !=
independent verification
```

Architect may run tests and attach results.

Protection may independently validate those results, reproduce relevant checks, verify provenance, and determine whether the candidate satisfies applicable security requirements.

Candidate law:

> **A high-impact system change should not be considered independently verified solely because the same authority that produced it says it passed.**

This does not require a different human for every low-risk action. It requires that the architecture preserve a distinct verification role and evidence path.

## Finding–Authority Separation

A security finding and an authority decision are not the same thing.

Protection may classify a finding, for example:

```text
informational
low
moderate
high
critical
```

But severity alone must not silently create constitutional authority.

A finding may become **blocking** only when the block can point to an authority source such as:

- cryptographic verification failure;
- explicit capability policy;
- repository protection rule;
- ratified security invariant;
- release policy;
- governance or constitutional requirement;
- explicitly authorized emergency control.

Candidate law:

> **Protection may discover risk. It may enforce only already-authorized boundaries.**

This prevents a security subsystem from gradually becoming an unreviewable sovereign.

## Remediation Separation

Protection should ordinarily describe the failure and evidence rather than silently rewriting the system.

Example:

```text
Finding:
Capability declaration expanded from read-only repository access
into repository-write authority.

Evidence:
manifest capability diff + policy reference

Required condition:
explicit repository-write authorization and branch scope
```

Architect then decides how to produce a corrected candidate.

This separation keeps the audit trail legible:

```text
candidate A
finding F
candidate B
re-review R
```

rather than replacing candidate A in place and erasing how the issue was discovered.

## Signed-package boundary

Signed packages are important evidence, but signature must not be overinterpreted.

Protection may verify:

- signer identity / continuity reference;
- package digest;
- version lineage;
- declared capabilities;
- upgrade lineage;
- manifest integrity.

The edge must preserve:

```text
signed
!= safe
!= trusted
!= approved
!= installed
!= entitled
!= ratified
```

This directly carries forward the Native Decisions boundary.

## Capability-diff review

One especially important Protection function is the ability to show how authority changes between versions.

Candidate artifact:

```text
CapabilityDiff

previous:
- local storage: namespace app.foo
- network: none

candidate:
- local storage: namespace app.foo
- network: selected peers
- repository: none
```

A version that requests new authority should never hide that expansion inside ordinary release notes.

Candidate law:

> **Authority expansion must be reviewed as authority expansion, not merely as a version upgrade.**

## Paid review does not guarantee approval

Security audits, external review, and Protection infrastructure may legitimately have economic costs.

However:

```text
payment for review
!= payment for a passing result
```

A builder may fund an audit.

A Treasury may fund an audit.

Neither payment should be able to purchase a false verification outcome.

This extends the Economic Constitution's no-authority-for-sale posture into security assurance.

## Sovereign faculty projection test

This stewardship edge provides a useful stress test for Hope, Tempus, and Vitae.

### Hope

Private Hope reflections should normally be **irrelevant** to code/package security review.

Protection must not infer that a build is safer or riskier because of emotional, reflective, ideological, or psychological information about the builder.

### Tempus

Operational timestamps, review expiry, certificate validity, release windows, and audit age may matter.

These are technical time facts.

They do not require broad access to a participant's private Tempus history or symbolic correspondence layer.

### Vitae

A bounded authority/eligibility record may help establish whether someone is eligible to perform a high-impact review.

Vitae recognition itself does not grant repository-write, release, or security-enforcement authority.

This produces a candidate refinement:

> **High-authority stewardship edges should default to zero private faculty context unless a narrow purpose can justify a bounded projection.**

## Candidate directional actions

### Architect → Protection

- `request-security-review`
- `submit-release-candidate`
- `submit-capability-diff`
- `submit-package-for-provenance-check`
- `request-privacy-boundary-review`
- `request-regression-verification`

### Protection → Architect

- `return-finding-set`
- `return-verification-evidence`
- `request-remediation`
- `return-capability-policy-conflict`
- `return-provenance-failure`
- `return-review-expired`

These names remain illustrative.

## Receipt model

Candidate receipts include:

```text
architect_candidate_submitted
protection_review_started
protection_finding_issued
protection_verification_passed
protection_verification_failed
architect_remediation_submitted
protection_reverification_completed
```

A receipt must not imply more than happened.

For example:

```text
protection_verification_passed
```

should not automatically mean:

```text
governance_approved
release_authorized
deployed
constitutionally_ratified
```

## Settlement posture

Most Architect ↔ Protection interactions are local/repository/review evidence and do not require chain settlement.

Settlement may become relevant when the reviewed event itself requires canonical finality, such as:

- protocol release authorization;
- high-authority package endorsement;
- governance-controlled security policy;
- incident record requiring public canonical history.

Even then, detailed vulnerability content or secrets should not be placed on-chain merely because an event is settled.

## Failure modes

This edge fails if:

- Architect self-certifies high-impact changes without an independent evidence path;
- Protection silently edits code and erases the builder/reviewer distinction;
- a security finding becomes law without an authority source;
- signature is treated as proof of safety;
- review payment buys a passing result;
- private psychological or reflective data becomes a security score;
- new capabilities are hidden inside a routine upgrade;
- remediation overwrites the original evidence trail.

## Patterns extracted from edge study 07

This study reconfirms:

1. **Authority Conservation** — review does not create governance or release authority.
2. **Provenance Without Surveillance** — verify package/build origin without personal dossiers.
3. **Typed Claims** — signature, verification, trust, approval, and deployment are different claims.
4. **Non-Transitive Authority** — a successful security review does not authorize the next edge/action.

It adds:

5. **Independent Verification Law** — high-impact builders should not be their sole verifier.
6. **Finding–Authority Separation** — risk discovery and authority to block are distinct.
7. **Remediation Separation** — reviewer findings and builder changes remain distinct artifacts.
8. **Capability Expansion Disclosure** — authority changes require explicit review.
9. **Paid Review Non-Certification** — payment may fund assurance but not purchase the result.
10. **Stewardship Context Minimization** — private faculty context is default-excluded from security review.

## Open questions

- Which Protection findings are purely advisory and which may become automatically blocking under native runtime policy?
- What canonical document will define the first Protection enforcement policy?
- Which checks must be independently reproduced rather than trusting Architect-provided evidence?
- How are sensitive vulnerability details disclosed without creating a public exploit guide?
- Does Protection become one signed ARCnet application or a set of runtime services plus a human-facing application?
- What threshold requires external human/security review beyond automated Protection checks?
- How long is verification evidence considered current before re-review is required?

## Next gate

Compare this edge with **Architect ↔ Imperium**.

That relationship should test whether the same separation between artifact, review, authority, and execution survives when the destination is formal collective decision rather than security assurance.
