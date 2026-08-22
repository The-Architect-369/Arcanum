---
title: "ARCnet Edge Study 11 — Protection ↔ Aerarium"
status: design-candidate
visibility: public
last_updated: 2026-08-22
description: "Stewardship edge study: security, custody assurance, fraud controls, and incident response ↔ shared-resource stewardship and Treasury-facing execution."
phase: "Pre-Genesis"
authority: "non-canonical design evidence"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/37"
edge_id: "protection.aerarium"
edge_class: "kinship-candidate"
---

# ARCnet Edge Study 11 — Protection ↔ Aerarium

## Purpose

This study examines the candidate relationship between **Protection** and **Aerarium** inside the stewardship tetrahedron.

It asks:

> How are shared assets protected from theft, fraud, key compromise, unsafe execution, and opaque custody without allowing the security layer to become the owner or discretionary controller of those assets?

The candidate correspondence is:

> **Custody / Integrity Assurance ↔ Shared-Resource Stewardship / Treasury Execution**

This is design evidence only.

## Repository grounding

Current canon establishes:

- Treasury is a stewardship instrument, not an operator with discretionary power.
- No single actor may unilaterally execute Treasury actions.
- Early-phase Treasury custody may use multisignature arrangements with signer thresholds and public role disclosure.
- Treasury actions require defined recipient, amount, purpose, execution window, auditability, and governance approval.
- Emergency Treasury execution, if used, requires elevated safeguards and later incident reporting/postmortem.
- Native ARCnet uses explicit capabilities, signed packages, local custody, and protected device storage.
- Security and audit are legitimate Treasury expenditure lanes.

Protection therefore helps defend custody and execution integrity. Aerarium presents and routes lawful shared-resource operations. Neither may absorb the other's authority.

## Semantic correspondence

Protection asks:

> Is this custody state, signer set, transaction request, destination, policy, or execution path safe and consistent with authorized controls?

Aerarium asks:

> Is this resource movement properly authorized, economically legitimate, auditable, and ready for Treasury execution?

The edge sits between:

- custody and spending;
- fraud prevention and lawful execution;
- signer security and signer authority;
- audit evidence and financial accountability;
- incident containment and restoration of access.

## Core passage

Candidate flow:

```text
Authorized Aerarium / Treasury Action
        |
        | execution request
        v
Protection Pre-Execution Checks
        |
        +-------------------------------+
        |                               |
        | checks pass                   | checks fail / risk detected
        v                               v
Treasury Execution               Hold / Reject / Escalate
        |                               |
        v                               v
Execution Receipt              Incident / Review Path
        |
        v
Protection Post-Execution Audit
```

Protection verifies and may invoke only already-authorized safeguards.

It does not redirect funds to destinations of its own choosing.

## Custody–Ownership Separation

A signer, HSM, multisig service, Protection process, or runtime guard may help protect custody.

None of those entities thereby owns the funds.

Candidate law:

> **Custody control is a bounded responsibility over execution, not ownership of shared resources.**

This extends the Treasury Constitution's stewardship posture into technical security.

## Security Hold versus Spending Decision

Protection may detect conditions such as:

- invalid signature;
- signer-set mismatch;
- unauthorized destination;
- amount outside approved envelope;
- expired execution window;
- replay attempt;
- compromised key signal;
- transaction digest mismatch.

Where policy already authorizes it, Protection may deny or hold execution.

But a hold is not a new allocation decision.

Protection cannot replace the recipient, amount, or purpose with its own preferred choice.

Candidate law:

> **Protection may prevent an unauthorized spend; it may not invent an authorized spend.**

## Signer Role Separation

A future Treasury may contain several distinct roles:

```text
proposal author
reviewer
custodian / signer
security monitor
execution system
accounting / audit reviewer
```

The same human may hold multiple roles in constrained early phases, but the architecture should preserve the role distinctions and reveal overlaps.

A signer signature proves that a key participated.

It does not by itself prove:

- the proposal was constitutionally valid;
- conflicts were disclosed;
- the amount was economically wise;
- the recipient completed promised work.

## Fraud Evidence versus Guilt

Protection may identify anomaly or fraud indicators.

The system should distinguish:

```text
anomaly detected
suspicion / investigation
verified technical compromise
policy violation
adjudicated wrongdoing
```

Candidate law:

> **Security anomaly evidence must not silently become a judgment of personal guilt or character.**

This preserves factual security response without creating social-credit or identity contamination.

## Key Compromise and Recovery

A compromised Treasury or custodian key may require urgent action.

Candidate flow:

```text
compromise evidence
      ↓
preauthorized signer/key suspension
      ↓
execution hold within affected scope
      ↓
continuity / governance review
      ↓
replacement signer/key authorization
      ↓
restored bounded execution
```

Identity continuity and authority binding should remain distinct from the compromised key itself.

A key can be replaced without pretending the responsible human identity ceased to exist.

## Audit Funding Integrity

Aerarium/Treasury may legitimately fund Protection services and external audits.

But:

```text
Treasury pays reviewer
!= Treasury buys favorable finding
```

A paid security provider should preserve review independence and disclose conflicts where relevant.

This echoes Edge Study 07's Paid Review Non-Certification law.

## Privacy versus Financial Auditability

Treasury flows require substantial public auditability.

That does not imply every participant's personal financial history, Hope state, or private device data should become public.

A public Treasury receipt may expose:

- action/proposal reference;
- amount;
- recipient address/entity as required;
- purpose;
- execution time;
- transaction/finality reference;
- signer/control evidence appropriate to policy.

It should not automatically expose unrelated participant wallet activity or personal dossiers.

## Sovereign faculty projection test

### Hope

Private Hope data has no legitimate default role in Treasury security or fraud scoring.

### Tempus

Factual timing matters strongly:

- time-locks;
- transaction windows;
- signer rotation dates;
- key/certificate expiry;
- incident timestamps.

Symbolic Tempus correspondences do not authorize financial actions.

### Vitae

Vitae/authority binding may contribute to eligibility for Treasury stewardship or custody review where canonical rules permit.

It does not make a transaction valid and cannot be used as a wealth or trustworthiness score.

## Candidate directional actions

### Protection → Aerarium

- `return-preexecution-check`
- `place-authorized-security-hold`
- `report-key-compromise`
- `report-transaction-anomaly`
- `submit-custody-audit`
- `request-signer-rotation-review`

### Aerarium → Protection

- `request-transaction-validation`
- `request-custody-audit`
- `request-signer-integrity-check`
- `request-incident-response`
- `request-postexecution-verification`
- `request-recovery-review`

## Receipt model

Candidate receipts:

```text
aerarium_execution_requested
protection_preexecution_passed
protection_preexecution_failed
protection_security_hold_applied
protection_key_compromise_reported
aerarium_treasury_action_executed
protection_postexecution_audit_completed
aerarium_custody_restored
```

A security-hold receipt should state its authority source and scope.

## Settlement posture

Actual Treasury movement, signer/custody changes, and governance-approved execution generally require canonical finality appropriate to the active phase.

Detailed private key material, vulnerability data, or internal security telemetry must never be put on-chain.

## Failure modes

This edge fails if:

- Protection can redirect or allocate funds by itself;
- custody is mistaken for ownership;
- an invalid spend proceeds because governance approved a broad budget but execution does not match it;
- a security anomaly becomes a personal guilt score;
- audit payment purchases favorable findings;
- key compromise permanently contaminates identity rather than bounded authority/custody state;
- public auditability becomes universal financial surveillance.

## Patterns extracted from edge study 11

This study reconfirms:

1. **Finding–Authority Separation** — fraud/security evidence and financial decision authority differ.
2. **Typed Claims** — anomaly, compromise, hold, authorization, execution, and audit are distinct.
3. **Role Separation** — proposer, reviewer, signer, security monitor, and auditor are different responsibilities.
4. **Provenance Without Surveillance** — Treasury transparency need not become personal financial dossiers.

It adds:

5. **Custody–Ownership Separation** — controlling execution does not confer ownership.
6. **Prevent–Not–Redirect Law** — security may block unauthorized spending but not invent a replacement spend.
7. **Key–Identity Separation** — compromised credentials affect bounded authority/custody, not human identity itself.
8. **Anomaly–Guilt Separation** — security evidence does not become moral judgment.
9. **Financial Audit Minimization** — public shared-resource accounting should expose what is necessary and no more.

## Open questions

- What exact pre-execution checks must be hard runtime invariants?
- Which holds can be applied automatically, and for how long?
- What signer recovery process is appropriate in Pre-Genesis and later governance phases?
- How should privacy-preserving Treasury recipient disclosure work where legal or safety concerns exist?
- How are fraudulent proposals distinguished from compromised execution after a valid proposal?
- What evidence must an external security/audit provider publish?

## Next gate

Study **Imperium ↔ Aerarium**, the final stewardship edge, to test the complete authorization chain between collective decision, Treasury constitutional authority, budget approval, time-lock, and execution.
