---
title: "Economic, spatial and chronological validation plan"
status: draft
visibility: public
last_updated: 2026-10-07
authority: proposal-only
---

# Economic, spatial and chronological validation plan

## Basis and objective

The Human's October 7 chat direction requires simulations before settling Genesis
numbers and first-era monetary rules, geometry testing associated with Agent C,
and a coherent community timeline connected to Tempus and node activation. This
document proposes a finite validation program. No simulation results, Agent C run,
new epoch, Genesis date or monetary parameters are claimed here.

Source base: `a07cebf7e0941a52be8961c349522488cf87b9a3`.
Read this alongside the [participant journey](participant-journey-proposal.md) and
[implementation map](authority-and-implementation-map.md). Source authority,
simulation assumptions, measurements and Human decisions must remain distinguishable.

## What is established and what is still open

The [Economic Constitution](../economics/economic-constitution.md) establishes
substantial constraints. Section 4.7 explicitly requires modeling, simulation, risk
analysis and Human ratification of unresolved numbers. Section 4.4 says Treasury
has no independent mint authority: authorization and constitutional validation
precede the monetary module's issuance and named Treasury allocation. Genesis
issuance and Treasury allocation are distinct operations.

The remaining work includes mechanisms as well as numbers: distribution and
reserve-release mechanics, reward evidence, fee destinations, signer/reviewer
policy, emergency ratification and execution/recovery behavior. The
[Treasury flow model](../specs/economy/treasury-flow-model.md) is canonical-draft.
The chain Spend path's accounting ambiguity is recorded in the
[audit](../evidence/pre-a19-architecture-audit-20261007/review.md); simulation must
not silently choose burn versus transfer semantics to conceal it.

## Three linked work packages

| Work package | Inputs and comparisons | Required outputs and falsification |
| --- | --- | --- |
| Economic model | Explicit candidate Genesis totals/allocations, circulation and reserve schedules, eligible service demand, capacity/cost assumptions, fee routing and bounded issuance alternatives. Compare reserve-first funding with separately authorized issuance scenarios; include a no-growth/no-new-issuance case. | Exact-unit accounting, funding sources, conservation checks, reserve exhaustion, service coverage, concentration and sensitivity results. Reject unauthorized minting, negative balances, unexplained value loss, rewards beyond funded budgets or dependence on compulsory participation. |
| Spatial/topology research | Existing Flower adjacency, competing logical graphs, physical network constraints, identical resource budgets and workload assumptions. Include churn, mobile sleep, partitions, hotspots and unavailable links. | Reproducible latency/throughput/route-length/overhead/failure results with distributions. Unsupported hardware links stay routed or unmapped. Failure to outperform a comparator is a valid result; geometry alone proves no efficiency. |
| Tempus and activation chronology | Existing factual anchors, node lifecycle, authorization records, explicit protocol observations and versioned policy activation boundaries. Include offline time, clock skew, delayed observation, duplicate events and uncertain finality. | Deterministic event identity and provenance, distinct event/observation/recording times, no fabricated global ordering or settlement. Symbolic dates must not activate permission, reward or protocol changes. |

Economic scenarios should include slow adoption, demand spikes, hoarding, funding
shortfalls, service-cost shocks, concentrated holdings, dishonest contribution
claims and colluding actors. These are test scenarios, not predictions. Parameter
ranges need stated rationales and uncertainty; arbitrary illustrative values must
stay labeled synthetic. A simulation cannot establish a market price or guarantee
real-world stability. No private participant behavior is needed for initial models.

For each run retain the model revision, source references, units, candidate
parameter set, random seed where used, workload, assumptions, invariants, outputs,
failures and sensitivity analysis. Separate accounting tests from behavioral model
assumptions. First validate the model on hand-checkable cases; then compare
alternatives under the same budgets. Do not select a preferred answer by tuning its
inputs alone. Operational safety thresholds must be reviewed before adoption.

## Geometry and Agent C readiness

The [spatial contract](../specs/geometry/arcnet-spatial-architecture.md) already
defines exact geometry and the boundary between logical and physical topology.
Existing schema/vector checks are mathematical and contract evidence, not proof
of network performance or optimal hardware. Agent C should scrutinize stronger
claims and simulation design against those existing results, rather than rename
an untested geometric analogy as physical connectivity.

The [capability record](../governance/architectgpt/operational-capabilities.md)
reports Agent C as untested: destination, reachability, Memory-off and schedules
remain unverified. The recovered research grant is not evidence of a completed run.
Before any dispatch, resolve that exact destination and settings and the applicable
bounded question. This plan dispatches no agent and creates no substitute agent.

Proposed research questions: Which claimed relationships are proven by existing
vectors? Which require new proof? Which are empirical network hypotheses? What
workload and comparator could disprove an advantage? What is the smallest useful
simulation that respects physical constraints and a phone's resource budget?

## A shared timeline without merging authority layers

Use [TempusAnchor](../specs/tempus/tempus-anchor.md) and the
[Temporal Model](../doctrine/temporal-model.md) as the factual foundation. Maintain
three linked views rather than a single field that mixes history and meaning:

1. **Factual chronology:** sourced events, clock provenance and uncertainty,
   receipts, versions and corrections. A local node activation is local evidence;
   a chain witness or finalized transaction needs its own evidence.
2. **Authorized era and policy schedule:** named milestones and effective rules
   linked to the actual adoption decision and applicable protocol coordinates.
   A proposed launch date is not a Genesis event. Construction Era, continuity-index
   epochs and future consensus/reward epochs must have distinct identifiers.
3. **Community narrative / sacred timeline:** an optional, attributed account of
   purpose, symbols and shared milestones, connected to factual event references.
   A plain chronological view stays available. Narrative adoption cannot rewrite
   event times, compel symbolic participation or create economic/permission effects.

The [derived current state](../governance/architectgpt/current-state.md) and
[short chronicle](../governance/architectgpt/coherence-chronicle.md) already provide
a bounded starting point. Extend through reviewed sources when needed; do not
reconstruct missing events or replace dated records to create a seamless story.
No public timeline should enumerate private reflection, practice or node activity
without a separately justified, consented disclosure scope.

## Integration scenario and decision gates

A future end-to-end simulation should follow a synthetic participant from offline
local activation through optional network joining, a declared service contribution,
an authorized funded reward, a module trial and reviewed common adoption. Use the
same event identities across views. Simulate a partition and an interrupted effect:
local usability continues, rewards stay pending until required evidence exists,
and reconnecting reconciles rather than duplicates the operation. Replay must not
double-mint, double-pay, grant authority from timing, or label a proposal deployed.

The sequence is:

1. Reconcile controlling rules and enumerate open mechanisms and parameter choices.
2. Review finite candidate models, scenario coverage and measurable rejection rules.
3. Implement isolated, reproducible simulations and publish results with limits.
4. Select a supported candidate through Human review and applicable ratification;
   record rejected alternatives and unresolved uncertainties.
5. Translate the adopted choice into versioned contracts and chain/native code;
   verify implementation separately before authorizing Genesis or activation.

The present candidate completes a planning foundation, not all five gates. New
economic/spatial model code and actual Agent C work remain bounded follow-on work.
Before A19, settle its direct storage/interface decisions and record the other open
choices with their gates. It is neither necessary nor honest to label the whole
future network decided before empirical results exist. The scheduling preference
for further simulation before opening A19 can be honored without pretending that
simulation is an intrinsic dependency of the Hope storage contract.
