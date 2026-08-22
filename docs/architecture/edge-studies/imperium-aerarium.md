---
title: "ARCnet Edge Study 12 — Imperium ↔ Aerarium"
status: design-candidate
visibility: public
last_updated: 2026-08-22
description: "Stewardship edge study: formal collective decision and delegated governance authority ↔ Treasury-facing budgeting, custody, time-lock, and execution."
phase: "Pre-Genesis"
authority: "non-canonical design evidence"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/37"
edge_id: "imperium.aerarium"
edge_class: "kinship-candidate"
---

# ARCnet Edge Study 12 — Imperium ↔ Aerarium

## Purpose

This study examines the candidate relationship between **Imperium** and **Aerarium**, completing the six internal relationships of the stewardship tetrahedron.

It asks:

> How does a legitimate collective decision become a bounded shared-resource action without allowing governance to create financial authority it does not possess or allowing the Treasury-facing system to spend merely because a discussion or vote occurred?

The candidate correspondence is:

> **Collective Decision / Authorization ↔ Treasury Execution / Public Resource Stewardship**

This is design evidence only.

## Repository grounding

Current canon is unusually explicit on this boundary:

- Governance operationalizes authority delegated by higher constitutional law; it does not manufacture Treasury or economic authority by proposal or vote.
- Treasury is a specialized constitutional domain subordinate to Doctrine and the Economic Constitution.
- Treasury actions require a governance-approved proposal defining recipient, amount, purpose, execution window, and audit/log reference.
- Treasury actions should generally be time-locked; emergency paths must be explicitly defined and auditable.
- Treasury may hold and spend MANA but has no independent mint authority.
- No single actor may exercise discretionary Treasury control.
- Governance approval and Treasury execution are distinct layers.

Aerarium is therefore treated as the candidate human-facing/public-resource lens over canonical Treasury machinery, while Imperium is the formal civic/governance lens over canonical governance mechanics.

## Semantic correspondence

Imperium asks:

> Has a bounded collective action been legitimately proposed, reviewed, and authorized under the correct authority?

Aerarium asks:

> Is there an executable Treasury/resource instruction that exactly matches that authorization and the Treasury Constitution?

The edge sits between:

- proposal outcome and financial instruction;
- public mandate and custody action;
- budget authorization and actual transfer;
- time-lock governance and executable state;
- amendment/revocation and pending financial action.

## Core passage

Candidate flow:

```text
Imperium Treasury Proposal
        |
        | valid governance process
        v
Ratified Allocation Authorization
        |
        | scope/authority validation
        v
Aerarium Execution Draft
        |
        | time-lock + custody/security checks
        v
Executable Treasury Action
        |
        | signer/protocol execution
        v
Final Treasury Receipt
        |
        v
Imperium / public audit reference
```

Every arrow is meaningful.

A governance vote should not jump directly to an arbitrary spend.

## Authorization–Execution Separation

This edge strongly reconfirms:

```text
governance approval
!= treasury execution
```

Imperium produces a bounded authorization.

Aerarium/Treasury validates whether the requested action is actually executable under Treasury law and current state.

Candidate law:

> **Imperium decides whether a permitted shared-resource action is authorized; Aerarium executes only the action actually authorized.**

## Governance Cannot Create Treasury Authority

A proposal cannot say, in effect:

```text
"The vote passed, therefore anything Treasury-related is allowed."
```

The authorization must remain inside:

- Economic Constitution;
- Treasury Constitution;
- delegated governance authority;
- applicable protocol bounds.

Candidate law:

> **Governance can exercise delegated Treasury authority; it cannot manufacture Treasury authority by majority preference.**

## Exact Execution Binding

The Treasury execution object should be bound to the ratified authorization.

Candidate fields:

```text
authorization_id
proposal_digest
recipient
asset
amount
purpose
execution_window
time_lock
allocation_lane
conditions
```

A changed recipient, amount, purpose, or materially different execution condition should require a new or amended authorization rather than being silently substituted at execution time.

Candidate law:

> **Treasury execution must be cryptographically and semantically bound to the approved allocation.**

## Time-Lock as a Constitutional Boundary

A time-lock is not merely a UX countdown.

It creates a state between authorization and execution in which:

- the action is publicly inspectable;
- errors or security incidents may be discovered;
- cancellation/suspension may occur where law permits;
- the execution is not yet final.

Candidate state model:

```text
proposed
approved
queued / time_locked
executable
executed
finalized
or
cancelled / expired / rejected
```

The UI must not present `approved` as `paid`.

## Revocation and Amendment Before Execution

Where governing law permits, a pending allocation may need to be amended or cancelled before execution.

The system should preserve why:

- original authorization existed;
- amendment/cancellation occurred;
- whether any partial execution already happened.

Once final settlement occurs, correction should use a new authorized action rather than rewriting history.

This carries forward the Edge Contract's finality rule.

## Public Mandate versus Custodian Signature

A custodian or signer executes a valid instruction.

The signer does not become the source of the mandate.

Conversely, a governance outcome is not itself sufficient cryptographic execution.

Candidate law:

> **Mandate and custody are complementary responsibilities; neither substitutes for the other.**

## Economic Parameter Boundary

Imperium may adjust only economic parameters explicitly delegated by higher law.

Aerarium may display or execute those parameters.

Neither system may infer that a UI control creates authority to change:

- unratified issuance mechanisms;
- constitutional supply bounds;
- human-worth rules;
- identity legitimacy;
- Treasury constitutional invariants.

## Emergency Path

A genuine emergency may require accelerated Treasury action.

That must not mean abandoning the separation of powers.

A legitimate emergency path should already define:

```text
qualifying trigger
allowed action classes
maximum scope
required signer threshold
logging requirements
postmortem deadline
review / ratification requirement
```

Candidate law:

> **An emergency path is a predesigned constitutional mechanism, not a license for improvisational Treasury discretion.**

## Sovereign faculty projection test

### Hope

Private Hope information should have no default role in Treasury voting, allocation, or execution.

### Tempus

Factual time is central:

- proposal periods;
- time-lock duration;
- execution windows;
- expiry;
- reporting cycles.

Symbolic timing must not create economic or governance authority.

### Vitae

Vitae/authority bindings may support eligibility for bounded governance or Treasury responsibilities where canon permits.

They do not make a proposal valid, cause funds to move, or establish human worth.

## Candidate directional actions

### Imperium → Aerarium

- `submit-ratified-allocation`
- `authorize-budget-envelope`
- `authorize-treasury-execution`
- `amend-pending-allocation`
- `cancel-pending-allocation`
- `authorize-emergency-treasury-path`

### Aerarium → Imperium

- `return-execution-readiness`
- `return-constitutional-conflict`
- `return-time-lock-status`
- `return-execution-receipt`
- `request-allocation-amendment`
- `return-budget-reconciliation`

## Receipt model

Candidate receipts:

```text
imperium_treasury_proposal_ratified
aerarium_execution_draft_created
aerarium_time_lock_started
aerarium_execution_ready
aerarium_treasury_action_executed
aerarium_treasury_action_finalized
imperium_allocation_amended
imperium_allocation_cancelled
```

Each receipt must state only its actual stage.

## Settlement posture

This edge contains some of the strongest candidates for mandatory protocol settlement because governance decisions and Treasury transfers may require canonical finality.

Drafts, private deliberation, and high-context internal analyses remain off-chain.

## Failure modes

This edge fails if:

- a passed vote is treated as unlimited Treasury authority;
- Aerarium changes recipient, amount, or purpose after ratification without a new authorization;
- `approved` is displayed as `executed`;
- signers are treated as the source of public mandate;
- emergency procedure becomes undefined discretionary control;
- Treasury execution creates new MANA without independent issuance authority;
- private Hope/Vitae data is used to rank financial legitimacy.

## Patterns extracted from edge study 12

This study reconfirms:

1. **Ratification–Execution Separation** — collective decision and domain execution remain distinct.
2. **Process–Authority Separation** — governance process cannot create forbidden authority.
3. **Typed State Law** — proposed, approved, queued, executed, and finalized are different facts.
4. **Non-Transitive Authority** — authorization is scoped to the specific allocation/action.
5. **Provenance Without Surveillance** — public Treasury history need not expose unrelated private participant data.

It adds:

6. **Exact Execution Binding** — financial execution must match the ratified allocation.
7. **Mandate–Custody Separation** — governance mandate and signer/custodian control are different responsibilities.
8. **Time-Lock State Law** — approval and execution are separated by an inspectable state where applicable.
9. **Emergency Constitutionalization** — emergency financial authority must be designed and bounded in advance.
10. **No UI-Created Economic Authority** — presentation of a parameter or action never grants constitutional power to change it.

## Open questions

- What exact data structure binds a governance authorization to a Treasury execution request?
- Which allocation changes require a full new proposal versus bounded amendment?
- What cancellation authority exists during time-lock?
- How should partial execution be represented?
- Which Aerarium surfaces are public, participant-specific, custodian-specific, or governance-specific?
- How does the public-facing Aerarium relate to a lower-level protocol Treasury module without duplicating authority?

## Next gate

Synthesize all six stewardship edges as one tetrahedral family and compare the result to the six generative edges.

Only then should the six inner stella-octangula crossing points be assigned candidate semantic meanings from the actual crossing pairs.
