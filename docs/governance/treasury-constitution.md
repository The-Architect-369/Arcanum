---
title: "Treasury Constitution"
status: canonical
visibility: public
last_updated: 2026-03-02
description: "Constitutional rules for ARCnet treasury custody, inflows, allocations, and execution constraints."
arcanum_phase: Pre-Genesis
canonical_reference: true
maintainer: The-Architect-369
mode: read-only
---

# Treasury Constitution

## 1. Purpose

The ARCnet Treasury exists to steward shared resources for the durability of the network and the Arcanum ecosystem.

This constitution defines:

- custody and authorization
- permitted inflows and outflows
- allocation lanes
- execution safeguards
- transparency requirements
- prohibited actions

The Treasury is a **stewardship instrument**, not an operator with discretionary power.

---

## 2. Definitions

- **Treasury**: the on-chain and/or custody-controlled reserve governed by ARCnet governance.
- **Custodians**: signers authorized to execute approved treasury actions.
- **Governance Approval**: a passed proposal that authorizes a treasury action under defined constraints.
- **Time-lock**: an enforced delay between approval and execution (when applicable).
- **Allocation Lanes**: predefined categories for routing treasury funds.

---

## 3. Constitutional Invariants (Non-Negotiable)

The following are prohibited, regardless of vote, unless amended under constitutional amendment procedures:

1) **Single-actor discretionary control**  
   No individual (including the Architect) may unilaterally execute treasury actions.

2) **Opaque flows**  
   All treasury inflows/outflows must be publicly auditable.

3) **Unbounded minting for treasury**  
   The treasury may not self-authorize unlimited minting or bypass protocol issuance bounds.

4) **Insider enrichment without disclosure**  
   Compensation or grants must be explicit, auditable, and governance-approved.

5) **Authority-for-sale**  
   Treasury spending may not be used to sell governance authority or accelerate time-based progression.

---

## 4. Treasury Custody Model

### 4.1 Early-phase custody (Pre-Genesis → Genesis)
During early phases, custody MAY be implemented using a multi-signature arrangement to reduce operational risk.

Requirements:

- minimum signer threshold (e.g., 3-of-5 or stronger)
- signer rotation policy
- public disclosure of signer roles (not necessarily identities)
- mandatory on-chain/ledger visibility for all transfers

### 4.2 Mature-phase custody
As ARCnet governance matures, treasury custody SHOULD converge toward:

- protocol-native treasury execution
- governed modules
- audited automation where appropriate

---

## 5. Inflows

The treasury may receive:

- protocol fees (where applicable)
- governance-approved allocations
- donations or grants (publicly disclosed)
- revenue from ecosystem services (if introduced)

Inflow sources must not require surveillance identity.

---

## 6. Outflows (Permitted Uses)

Treasury funds may be allocated only to:

1) **Security & audits**  
   chain audits, app audits, dependency audits, incident response

2) **Protocol development**  
   core chain development, module upgrades, infrastructure reliability

3) **Ecosystem development**  
   builder grants, research grants, educational materials (bounded)

4) **Operations & maintenance**  
   hosting, monitoring, legal counsel, documentation upkeep (bounded)

5) **Validator and network incentives**  
   governance-approved incentives aligned to network health

Outflows must remain consistent with dignity boundaries and non-coercive participation.

---

## 7. Allocation Lanes (Default)

The treasury may adopt default lanes for budgeting. A typical baseline:

- **Security & Reliability**
- **Core Development**
- **Builder Grants**
- **Operations**
- **Reserves**

Lane percentages may be defined by governance and revised only via proposal.

---

## 8. Execution Constraints

### 8.1 Proposal requirement
All treasury actions require a governance-approved proposal that specifies:

- recipient (address or entity)
- amount
- purpose
- execution window
- audit/log reference

### 8.2 Time-lock
Treasury actions SHOULD be time-locked unless:

- emergency response requires rapid mitigation, and
- the emergency path is explicitly defined and auditable

### 8.3 Emergency execution (exception path)
Emergency execution requires:

- elevated signer threshold (higher than normal)
- public incident report within a defined timeframe
- explicit postmortem and corrective proposal if needed

---

## 9. Compensation & Conflicts of Interest

Compensation is permitted only when:

- explicitly proposed and approved
- publicly auditable
- bounded in amount and duration

Conflicts of interest must be disclosed in proposal text.

---

## 10. Transparency Requirements

At minimum:

- all inflows/outflows are publicly visible
- treasury addresses are published
- quarterly (or phase-appropriate) reporting includes:
  - balances
  - allocations
  - grants
  - audits
  - incidents (if any)

---

## 11. Relationship to MANA

The treasury may hold and spend MANA, but:

- MANA usage may not accelerate time-based progression
- MANA may not purchase governance authority directly
- protocol issuance bounds remain binding

---

## 12. Amendments

This constitution may be amended only via constitutional amendment procedures defined by governance, requiring:

- elevated quorum and threshold
- extended time-lock
- explicit statement of changed invariants

---

## Conclusion

The ARCnet Treasury exists to support durability, security, and long-term ecosystem health.

It is governed by explicit proposals, bounded execution rules, and public auditability.

Stewardship is the purpose. Discretion is forbidden.