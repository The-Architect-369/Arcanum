---

title: "Governance Specification"

status: canonical

visibility: public

last\_updated: 2026-02-26

description: "Operational governance mechanics for ARCnet, including proposal flow, voting structure, neutrality safeguards, and constitutional enforcement."

---



\# Governance Specification



\## I. Purpose



This document defines the operational governance mechanics of \*\*ARCnet\*\*.



It specifies:



\- Proposal structure

\- Voting mechanics

\- Quorum requirements

\- Authority weighting

\- Treasury execution flow

\- Neutrality safeguards

\- Constitutional enforcement



This document does not redefine the constitutional model described in the whitepaper. It operationalizes it.



---



\# II. Governance Hierarchy



ARCnet governance operates within the following hierarchy:



1\. \*\*Constitutional Invariants\*\* (non-overridable)

2\. \*\*Protocol Parameters\*\* (governance-adjustable within bounds)

3\. \*\*Treasury Allocations\*\*

4\. \*\*Module-Level Governance\*\*

5\. \*\*Application-Level Governance\*\*



Chain-level rules supersede module-level rules.



Application-level governance cannot override protocol invariants.



---



\# III. Constitutional Invariants



The following rules cannot be overridden by standard governance vote:



\- Identity cannot be duplicated or reassigned.

\- Time-based progression cannot be accelerated through payment.

\- Mint parameters cannot bypass defined emission bounds.

\- Treasury funds require formal proposal and time-lock.

\- Governance authority cannot derive solely from capital.

\- Constitutional structure requires supermajority and extended time-lock to amend.



These invariants are enforced at protocol level where possible.



---



\# IV. Governance Authority Model



Governance weight is multi-factorial.



Voting power may derive from:



\- Staked MANA

\- Identity longevity (ACC age)

\- Participation consistency metrics

\- Vitae progression signals

\- Delegation relationships



No single vector determines authority.



Capital concentration alone cannot fully control governance outcomes.



---



\# V. Proposal Types



Governance proposals fall into the following categories:



\## 1. Parameter Adjustment Proposals



Used to modify bounded protocol parameters such as:



\- Emission rates

\- Validator thresholds

\- Deposit requirements

\- Fee multipliers



Bounded by predefined parameter ceilings and floors.



---



\## 2. Treasury Allocation Proposals



Used to allocate treasury funds for:



\- Development grants

\- Security audits

\- Validator incentives

\- Ecosystem expansion

\- Infrastructure upgrades



Require deposit, quorum, and time-lock before execution.



---



\## 3. Module Approval Proposals



Used to:



\- Approve new protocol modules

\- Enable or disable optional modules

\- Integrate governance-approved upgrades



Module code must pass audit requirements prior to activation.



---



\## 4. Governance Upgrade Proposals



Used to modify:



\- Governance thresholds

\- Voting mechanics

\- Delegation structures



May require elevated supermajority thresholds.



---



\## 5. Interoperability Proposals



Used to:



\- Enable IBC channels

\- Approve external chain bridges

\- Define cross-chain asset policy



Must consider security implications and validator readiness.



---



\# VI. Proposal Lifecycle



All proposals follow this lifecycle:



1\. Submission (with required deposit)

2\. Validation (format + parameter bounds check)

3\. Voting Period (fixed duration)

4\. Quorum Verification

5\. Threshold Verification

6\. Time-Lock Period

7\. Execution



If quorum or threshold fails, proposal is rejected.



Deposits may be partially or fully forfeited for spam or malicious proposals.



---



\# VII. Quorum \& Threshold



Quorum represents minimum participation required.



Threshold represents required majority.



Initial recommended structure:



\- Standard Proposals: 50% quorum, >50% approval

\- Treasury Proposals: 50% quorum, >60% approval

\- Structural Changes: 60% quorum, >67% approval

\- Constitutional Amendments: 67% quorum, >75% approval + extended time-lock



These values may evolve through governance within constitutional bounds.



---



\# VIII. Delegation



Delegation allows:



\- Stake delegation to validators

\- Governance delegation to representatives



Delegation does not:



\- Transfer identity longevity

\- Override participation metrics

\- Bypass constitutional invariants



Delegation is optional, not mandatory.



---



\# IX. Neutrality Safeguards



ARCnet governance must preserve structural neutrality.



Governance may not:



\- Mandate ideological alignment

\- Impose belief-based requirements

\- Prioritize political positioning

\- Convert identity into ideological compliance



Governance may enforce:



\- Dignity boundaries

\- Anti-harassment policies

\- Security requirements

\- Infrastructure stability rules



Neutrality refers to ideological restraint, not absence of safety enforcement.



---



\# X. Economic Neutrality



Governance may adjust economic parameters but may not:



\- Create hidden inflation mechanisms

\- Allocate treasury to insiders without disclosure

\- Override emission transparency

\- Introduce pay-to-govern mechanics



Economic changes require transparency and on-chain traceability.



---



\# XI. Treasury Execution Rules



Treasury funds are governed by:



\- On-chain proposal approval

\- Time-lock enforcement

\- Multi-sig (in early phases if required)

\- Public transparency



Treasury disbursement requires:



\- Defined recipient

\- Defined allocation amount

\- Defined purpose

\- Execution timestamp



No off-chain treasury allocation is permitted.



---



\# XII. Governance Phases



Governance evolves through phases:



\## Phase I — Genesis Stability



\- Architect Stability Guard active

\- Restricted proposal scope

\- Validator set curated



\## Phase II — Observational Activation



\- Expanded proposal submission

\- Limited treasury routing

\- Governance metrics monitored



\## Phase III — Differentiation



\- Module expansion

\- Broader validator distribution

\- Increased governance participation



\## Phase IV — Circulation



\- Fully active governance surface

\- Infrastructure-level maturity

\- Expanded interoperability



Decentralization is phased, not immediate.



---



\# XIII. Governance Security



Governance security mechanisms include:



\- Proposal deposits

\- Time-lock execution

\- Parameter bounds

\- Supermajority safeguards

\- Slashing for validator misconduct



These mechanisms prevent rapid destabilization.



---



\# XIV. Relationship to Application Governance



The Arcanum application may implement:



\- Community moderation systems

\- Module-level governance

\- Content curation policies



Application-level rules cannot override ARCnet constitutional invariants.



Infrastructure governance remains sovereign.



---



\# XV. Amendments



This specification may be amended through governance under the following conditions:



\- Structural amendments require supermajority.

\- Constitutional amendments require extended time-lock.

\- All amendments must preserve core invariants.



Amendments are logged in the governance changelog.



---



\# Conclusion



ARCnet governance is constitutional before it is democratic.



Authority is:



\- Time-weighted

\- Participation-weighted

\- Economically grounded

\- Bound by invariant enforcement



The objective is not speed.



The objective is durability.



Governance exists to preserve coherence while enabling evolution.

