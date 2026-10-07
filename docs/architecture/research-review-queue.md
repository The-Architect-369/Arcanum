---
title: "Evidence-grounded research queue and execution boundaries"
status: draft
visibility: public
last_updated: 2026-10-07
authority: operational-proposal
---

# Evidence-grounded research queue and execution boundaries

## Current Human grant

In the October 7 working conversation, the Human authorized more automated
preparation of questions grounded in workspace evidence and execution of already
approved questions, with findings returning for Human review. This updates the
earlier manual-only planning posture within that stated scope. It does not approve
every new question, an unlimited research loop, public output, paid computation,
prototype deployment, participant studies or canonical adoption of results.

The Human selected refresh during active work and daily. The thread heartbeat
`arcanum-research-review-loop` was created ACTIVE for a daily 9 a.m. check, using
America/New_York as the intended local schedule. This is the coordinating chat's
review check; no Agent C-owned schedule has been created. This queue is a concrete review surface and prepared execution
packet; it does not claim an established remote connection or a completed run.
The exact Agent C destination, source access, Memory-off and schedule posture still
need verification after the browser tool's connection failure. Existing run history
must be reconciled before starting a question whose execution state is uncertain.

Use the existing [Question Registry](https://app.notion.com/p/2619373dd1e148978bb5024e595e0669)
as the operational registry. The local labels below are proposal labels, not newly
allocated WS-RQ identifiers. New questions stay pending review; approval and actual
run status are independent fields. Evidence generation never approves itself.

## Already approved: recover the actual research route

### WS-RQ-003 — geometric versus conventional views

- **Recorded approval:** [September 24 authorization](https://app.notion.com/p/3e42bb4420b88119b83ae44c3e78f083), freshly read as `approved_active`.
- **Question:** Does a geometry-based view improve retrieval accuracy, time or orientation on the same object corpus?
- **Method to review:** within-subject, counterbalanced comparison with accessibility assessed and participant consent before any later study.
- **Run ceiling:** one question, at most six searches, eight source/connector reads, eight findings and one retry; private review output; no paid computation or automatic continuation.
- **Current next gate:** verify Agent C and approved source IDs S02, S12 and S21; reconcile whether a run already exists; then execute the unchanged bounded evidence/method review under the preserved approval.
- **Required output:** actual run ID, sources actually opened, evidence separated from hypotheses, contradictory findings, a proposed reproducible test and remaining limitations. No claim that a prototype or human study has run.

Prepared request for the verified existing WS-AGENT-C:

> Perform the already approved WS-RQ-003 evidence and method review. Compare the
> proposed geometric and conventional views of the same object corpus for retrieval
> accuracy, time, orientation and accessibility. Resolve approved sources S02, S12
> and S21 and report gaps rather than substitute unsupported evidence. Stay within
> six searches, eight opened sources, eight findings and one retry, or a tighter
> existing limit. Return contradictory evidence, a falsifiable counterbalanced test
> proposal and the actual run/source record for private Human review. Do not build
> or deploy a prototype, recruit participants, perform a study, write to providers,
> spend money, promote canon or launch follow-on questions. Keep backend identity
> and permissions invariant and private Hope/Journey content excluded.

### WS-RQ-009 — separate approved Equinox source pilot

[The existing approval](https://app.notion.com/p/3e42bb4420b881e6a633ecabfd01468e)
remains valid within its own source-criticism scope and limits. It is not a geometry,
economics or participant-study grant. Preserve it in the queue; do not combine it
with WS-RQ-003 into one broader run. Start with WS-RQ-003 as the Human identified.

## New questions prepared for Human review

Each proposed run below is read-only evidence/method research, with a proposed
ceiling of six searches, eight source reads, eight findings and one retry, private
review output and no paid computation. These ceilings are proposals for new items;
they do not authorize their execution. Existing workspace evidence should be read
before spending the external source budget. Any actual simulation implementation
or external experiment gets its own explicit work scope.

### ECON-ROUTING — make accounting operations testable before choosing numbers

**Evidence:** the [Economic Constitution §5.7](../economics/economic-constitution.md)
distinguishes transfers, reserve movement and burns. The inspected
[MANA keeper](../../chains/arcanum/x/mana/keeper/keeper.go) subtracts a balance in
Spend without a destination or supply change; the Treasury keeper is scaffolding.
See the [audit](../evidence/pre-a19-architecture-audit-20261007/review.md).

**Question:** Which explicit accounting operations and receipt fields are required
to model each permissible Spend interpretation without unaccounted value loss,
implicit minting or double payment after interruption?

**Deliverable:** a comparison of transfer, reserve/sink and burn interpretations;
conservation equations; hand-checkable synthetic cases; duplicate/recovery failure
cases; and the smallest set of Human mechanism decisions needed before sweeping
Genesis allocations, reward budgets or fee rates. Select no live mechanism or number.

### TOPOLOGY-COMPARISON — distinguish logical geometry from network performance

**Evidence:** the [adopted spatial contract](../specs/geometry/arcnet-spatial-architecture.md)
defines six-neighbor Flower adjacency, geometry-free equivalence and an explicit
logical-to-physical adapter boundary. Passing its vectors proves specified
geometry, not throughput or optimal hardware. This is distinct from WS-RQ-003's
human navigation comparison.

**Question:** What minimal reproducible comparison could falsify a performance
advantage of Flower-derived logical routing against conventional graphs on the
same mobile-node workload and physical link/resource budget?

**Deliverable:** baseline choices and their rationale, workload and churn/partition
cases, routing treatment for unavailable physical links, metric distributions,
resource accounting, sensitivity variables and rejection criteria. No invented
measurement, superiority claim or hardware-specific result without execution.

### SCOPED-ADOPTION — reconcile open creation with reviewed responsibility

**Evidence:** the [existing permission draft](../governance/governance-permission-model.md)
places some drafting behind V2, while the
[Human-directed journey](participant-journey-proposal.md) opens private creation and
consenting trials earlier and calls for architect plus community review of shared
adoption. Recognition permanence and revocable execution must coexist.

**Question:** What minimal permission and review state machine admits early private
creation and opt-in trials while preventing grade, group vote or review status from
granting universal execution, Treasury custody or third-party access?

**Deliverable:** explicit actors and decision points, scope/expiry/revocation and
appeal cases, threat/failure examples, and unresolved Human choices about binding
peer/community review. Use public synthetic examples; no participant profiling or
private practice evidence. Propose no worth score or paid authority.

### TEMPUS-REPLAY — connect chronology without inventing finality

**Evidence:** [TempusAnchor](../specs/tempus/tempus-anchor.md) separates observation,
local receipt and optional protocol witness. The
[derived view](../governance/architectgpt/current-state.md) distinguishes source
authority, historical claims and unknowns. The requested community timeline adds
narrative and future policy-era schedules without changing those facts.

**Question:** Which minimal event identities, ordering constraints and policy-version
references permit an offline node to reconcile activation, service evidence and
later reward/approval receipts after clock skew, partition and interrupted execution?

**Deliverable:** a synthetic replay trace showing pending/unknown/final distinctions,
duplicate prevention, correction provenance and explicit unknown ordering; separate
continuity epochs, monetary epochs and optional narrative dates. No choice of a
Genesis date, reward period or automatic symbolic activation.

## Repeatable workflow

After a meaningful change, compare its reviewed source/evidence coordinates with
the last research packet. Prepare or refine a question only when that difference
changes a decision or exposes a testable uncertainty. Reuse an existing question
when its scope matches; avoid duplicate queues and repeated runs without new need.

Track question approval, connection readiness, execution/run ID, returned evidence,
Human review, and implementation authorization separately. Building can continue
on independent tasks while research runs. A dependent implementation waits for the
needed evidence and applicable decision. Results may suggest further questions;
only questions already approved for that scope may be dispatched without another
question-level decision. Report unchanged/blocked state without pretending progress.

Recovery must inspect the actual run before retrying a launch with an unknown
outcome. One successful round trip does not prove recurring unattended operation;
qualify the daily check's actual first run separately from successful scheduling.
The adapter contract and proposed
failure tests are in the [validation plan](simulation-and-chronology-plan.md).
