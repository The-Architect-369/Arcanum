---
title: "Governance Specification"
status: canonical
visibility: public
last_updated: 2026-03-02
description: "Operational governance mechanics for ARCnet: proposals, voting, thresholds, neutrality safeguards, and treasury execution rules."
---

# Governance Specification

## 1. Purpose

This document defines the operational governance mechanics of **ARCnet**.

It specifies:

- proposal structure and lifecycle
- voting mechanics, quorum, thresholds
- delegation and representation
- neutrality safeguards
- treasury execution rules
- amendment controls and logging

This document does **not** redefine the whitepaper governance model; it operationalizes it.

---

## 2. Governance Hierarchy

ARCnet governance operates within this hierarchy:

1. **Constitutional invariants** (non-overridable)
2. **Protocol parameters** (adjustable within bounds)
3. **Treasury allocations** (proposal + time-lock)
4. **Module-level governance**
5. **Application-level governance**

Chain-level rules supersede module-level rules.  
Application-level governance cannot override protocol invariants.

---

## 3. Constitutional Invariants (Operational Summary)

The following are non-overridable under standard governance actions:

- identity cannot be duplicated or reassigned
- time-based progression cannot be accelerated through payment
- mint parameters cannot bypass protocol emission bounds
- treasury actions require formal proposal and (where applicable) time-lock
- governance authority cannot derive solely from capital
- constitutional amendments require elevated thresholds and extended time-lock

---

## 4. Governance Authority Model (Multi-Factor)

Governance weight is multi-factorial and may derive from:

- staked MANA
- identity longevity (ACC age)
- participation consistency metrics
- Vitae thresholds (recognition signals, not rank)
- delegation relationships

No single vector determines authority.

---

## 5. Proposal Types

### 5.1 Parameter adjustment proposals
Modify bounded protocol parameters such as:

- emission rates
- validator thresholds
- deposit requirements
- fee multipliers

All changes must remain within predefined ceilings and floors.

### 5.2 Treasury allocation proposals
Allocate treasury funds for:

- security audits
- development grants
- validator incentives
- operations
- ecosystem expansion

Require deposit, quorum, and time-lock prior to execution (unless emergency path applies).

### 5.3 Module approval proposals
Approve or modify:

- new protocol modules
- optional module activation/deactivation
- governance-approved upgrades

Module code must pass required audits and review gates.

### 5.4 Governance upgrade proposals
Modify governance mechanics:

- thresholds
- delegation structures
- voting periods
- time-lock rules

May require elevated thresholds depending on impact.

### 5.5 Interoperability proposals
Enable or modify:

- IBC channels
- bridges and external integrations
- cross-chain asset policy

Must include security analysis and readiness criteria.

---

## 6. Proposal Lifecycle

All proposals follow this lifecycle:

1) submission (with required deposit)  
2) validation (format + bounds check)  
3) voting period (fixed duration)  
4) quorum verification  
5) threshold verification  
6) time-lock period (where applicable)  
7) execution  

If quorum or threshold fails, the proposal is rejected.

Deposits may be partially or fully forfeited for spam or malicious proposals.

---

## 7. Quorum & Thresholds (Initial Posture)

Quorum = minimum participation required.  
Threshold = required approval ratio.

Initial recommended posture:

- **Standard proposals:** 50% quorum, >50% approval
- **Treasury proposals:** 50% quorum, >60% approval
- **Structural changes:** 60% quorum, >67% approval
- **Constitutional amendments:** 67% quorum, >75% approval + extended time-lock

These values may evolve through governance within constitutional bounds.

---

## 8. Delegation

Delegation may allow:

- stake delegation to validators
- governance delegation to representatives

Delegation does not:

- transfer identity longevity
- override participation metrics
- bypass constitutional invariants

Delegation is optional, not mandatory.

---

## 9. Neutrality Safeguards

ARCnet governance must preserve structural neutrality.

Governance may not:

- mandate ideological alignment
- impose belief-based requirements
- prioritize political positioning
- convert identity into ideological compliance

Governance may enforce:

- dignity boundaries
- anti-harassment policies
- security requirements
- infrastructure stability rules

Neutrality refers to ideological restraint, not absence of safety enforcement.

---

## 10. Economic Neutrality

Governance may adjust economic parameters but may not:

- introduce hidden inflation mechanisms
- allocate treasury to insiders without explicit disclosure
- override emission transparency
- introduce “pay-to-govern” mechanics

All economic changes require traceability and explicit parameterization.

---

## 11. Treasury Execution Rules (Operational)

Treasury funds are governed by:

- on-chain proposal approval
- time-lock enforcement (where applicable)
- multi-sig safeguards in early phases (if used)
- public transparency requirements

Treasury disbursement requires:

- defined recipient
- defined allocation amount
- defined purpose
- execution timestamp/window

No off-chain discretionary treasury allocation is permitted.

---

## 12. Governance Phases

Governance evolves through phases:

- **Phase I — Genesis stability:** restricted surface, stability guard posture
- **Phase II — observational activation:** expanded proposal surface, metrics monitored
- **Phase III — differentiation:** broader validator distribution, module expansion
- **Phase IV — circulation:** mature governance surface, interoperability options expand

Decentralization is phased, not immediate.

---

## 13. Governance Security

Security mechanisms include:

- proposal deposits
- time-lock execution
- parameter bounds
- supermajority safeguards
- slashing for validator misconduct

---

## 14. Interfaces (Public + Internal)

Governance is implemented by humans and protocol rules.  
Some interfaces exist to interpret, educate, or assist drafting.

- **HOPE Guardian**: public interpretive intelligence surface (advisory; non-sovereign)
- **ArchitectGPT**: internal build interface (read-only repo analysis + drafting support)

These interfaces are constitutionally constrained and carry no ratifying authority.

---

## 15. Amendments & Change Logging

This specification may be amended through governance under these conditions:

- structural amendments require supermajority
- constitutional amendments require extended time-lock
- amendments must preserve core invariants

All amendments must be logged in:

- `docs/governance/governance-changelog.md`

---

## Conclusion

ARCnet governance is constitutional before it is democratic.

Authority is time-weighted, participation-weighted, and bounded by invariants.

The objective is durability.