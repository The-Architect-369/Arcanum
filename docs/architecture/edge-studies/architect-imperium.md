---
title: "ARCnet Edge Study 08 — Architect ↔ Imperium"
status: design-candidate
visibility: public
last_updated: 2026-08-22
description: "Stewardship edge study: system design and proposal generation ↔ formal collective governance, ratification, and bounded activation."
phase: "Pre-Genesis"
authority: "non-canonical design evidence"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/37"
edge_id: "architect.imperium"
edge_class: "kinship-candidate"
---

# ARCnet Edge Study 08 — Architect ↔ Imperium

## Purpose

This study examines the candidate relationship between **Architect** and **Imperium** inside the stewardship tetrahedron.

It asks:

> How does a system design become a legitimate collective decision without allowing the builder to govern by authorship or governance to masquerade as the builder?

The candidate correspondence is:

> **Design / Proposal ↔ Ratification / Collective Decision**

This is design evidence only.

## Repository grounding

Current canon establishes:

- Architect GPT is an instrument, not an authority.
- Architect may analyze, draft, patch, test, prepare proposals, and coordinate bounded release work under Human Architect authorization.
- Governance operationalizes authority delegated by higher constitutional law; it does not manufacture economic, Treasury, identity, temporal, or constitutional authority by ordinary proposal or vote.
- Governance proposals, voting, thresholds, time-locks, and execution remain subordinate to Doctrine, the Economic Constitution, specialized constitutions, and delegated authority.
- App-level governance cannot override protocol or constitutional invariants.
- During Pre-Genesis, the Human Architect remains primary editorial and release authority and most broader governance permissions remain draft/posture only unless explicitly activated.

Therefore **Imperium** in this study is the candidate human-facing/formal-governance system built upon these existing governance authorities. It is not a new source of constitutional power.

## Semantic correspondence

Architect asks:

> What change should be designed, why, and what implementation or policy artifact expresses it?

Imperium asks:

> Who is authorized to decide whether this proposal should become binding, under what process, and within what higher-order constraints?

The edge sits between:

- design and ratification;
- technical possibility and legitimate mandate;
- proposal drafting and proposal sponsorship;
- implementation evidence and governance judgment;
- amendment design and constitutional process.

## Candidate endpoint faculties

### Architect-facing port: Design / Rationale / Change Candidate

Architect may produce:

- architecture proposal;
- policy draft;
- implementation candidate;
- impact analysis;
- migration plan;
- verification evidence;
- alternatives and tradeoffs;
- rollback or suspension plan;
- governance proposal draft.

Architect does not ratify its own design merely by producing it.

### Imperium-facing port: Proposal / Deliberation / Ratification

Imperium may provide:

- proposal intake;
- sponsorship and eligibility checks;
- doctrine/authority-bound validation;
- deliberation and review;
- voting or other ratification process where activated;
- time-lock and execution authorization;
- amendment handling;
- governance receipts.

Imperium should not rewrite the technical artifact silently and then pretend the original proposal was what passed.

## Core passage

Candidate flow:

```text
Architect Change Candidate
        |
        | prepare governance packet
        v
Imperium Proposal Draft
        |
        | sponsorship / validation
        v
Formal Proposal
        |
        | deliberation / vote / review
        v
Governance Outcome
        |
        +------------------------------+
        |                              |
        | rejected / revise            | ratified within authority
        v                              v
Architect Revision               Execution Authorization
                                       |
                                       | separate implementation edge/action
                                       v
                                 Architect / Runtime Execution
```

The important split is that **ratification authorizes bounded execution; it does not itself perform the implementation**.

## Authorship–Authority Separation

The most important law from this edge is:

```text
proposal authorship
      !=
decision authority
```

Architect may be the best system for expressing a coherent proposal and showing consequences.

That does not make Architect the sovereign decision-maker.

Candidate law:

> **The ability to design a change does not confer authority to ratify that change.**

This directly mirrors the existing canonical posture that Architect GPT is an instrument, not an authority.

## Proposal Fidelity Law

Governance must know what it is deciding on.

A proposal packet should therefore bind:

- proposal version;
- exact text or configuration digest;
- implementation candidate digest when applicable;
- declared scope;
- authority basis;
- impact analysis;
- known risks;
- amendment history;
- execution conditions.

If the proposal changes materially during deliberation, the modified object should receive a new version/digest rather than silently mutating beneath an existing vote.

Candidate law:

> **A ratified outcome must be traceable to the actual proposal artifact that was reviewed.**

## Constitutional Bounds Check

Imperium cannot make an invalid proposal valid merely by processing it.

Examples:

```text
ordinary vote
!= authority to override Doctrine

ordinary vote
!= new MANA issuance authority

ordinary vote
!= unilateral Treasury discretion

ordinary vote
!= authority to reassign Identity
```

A governance packet should therefore include a machine/human-readable **authority basis** before formal ratification.

Candidate law:

> **Process legitimacy cannot substitute for substantive authority.**

## Amendment Separation

During deliberation, an Architect proposal may be amended.

But amendment should remain explicit:

```text
v0.1 proposal
  ↓ amendment A
v0.2 proposal
  ↓ amendment B
v0.3 final voting text
```

The system should not collapse these into one mutable blob if the differences matter to authority or implementation.

This preserves replayable decision history.

## Ratification–Execution Separation

Imperium may produce an execution authorization, but execution should occur through the system that owns the relevant action.

Examples:

- a protocol upgrade may route to Architect / protocol release machinery;
- a Treasury allocation routes to Aerarium/Treasury execution;
- a security policy routes to Protection enforcement configuration;
- an application policy routes to the applicable app/runtime.

Candidate law:

> **Governance authorizes within scope; the destination system executes within its own bounded authority.**

This prevents Imperium from becoming a universal super-app that directly performs every governed action.

## Technical Truth versus Political Preference

Architect may provide technical evidence such as:

- build passes;
- benchmark results;
- migration impact;
- dependency analysis;
- security review references.

Imperium may legitimately decide among policy alternatives even where multiple options are technically possible.

But governance should not vote a failed build into being technically sound.

Likewise Architect should not label one politically contested option as technically mandatory when it is actually a value choice.

Candidate law:

> **Technical evidence constrains what is feasible; governance decides among legitimate choices within authority. Neither should counterfeit the other's form of truth.**

## Sovereign faculty projection test

### Hope

Hope may help a participant understand proposal language or reflect on values, but private Hope content must not become an ideological compliance input or governance score.

### Tempus

Tempus may provide factual time context such as:

- voting windows;
- amendment periods;
- time-locks;
- activation dates;
- historical proposal timing.

It must not turn symbolic timing into governance authority.

### Vitae

Vitae may contribute to **eligibility** for bounded responsibilities where canon permits, but it does not automatically grant a vote, sponsorship power, or execution authority.

This is consistent with the Governance Permission Model's separation:

```text
Eligibility → Review → Authority → Execution
```

## Candidate directional actions

### Architect → Imperium

- `create-governance-proposal-draft`
- `submit-impact-analysis`
- `submit-amendment-candidate`
- `submit-implementation-digest`
- `submit-migration-plan`
- `submit-technical-evidence`

### Imperium → Architect

- `request-proposal-revision`
- `return-governance-outcome`
- `authorize-bounded-implementation`
- `request-implementation-plan`
- `request-post-ratification-verification`
- `return-amendment-text`

## Receipt model

Candidate receipts:

```text
architect_proposal_drafted
imperium_proposal_submitted
imperium_amendment_recorded
imperium_vote_closed
imperium_proposal_ratified
imperium_proposal_rejected
imperium_execution_authorization_issued
architect_execution_candidate_prepared
```

A ratification receipt must specify scope and authority basis.

It must not imply that execution has occurred.

## Settlement posture

Governance outcomes requiring canonical finality may require chain settlement.

High-context drafts, private deliberation notes, and internal Architect reasoning should remain off-chain.

The chain may witness narrow facts such as:

- proposal submitted;
- vote cast;
- proposal ratified/rejected;
- execution authorized;
- amendment finalized.

The chain should not become a store for private design discussions or semantic judgments about participants.

## Failure modes

This edge fails if:

- Architect treats authorship as governing authority;
- Imperium silently rewrites technical artifacts after ratification;
- a vote is used to bypass higher constitutional authority;
- technical evidence is decided by popularity rather than verification;
- governance outcome is mistaken for completed implementation;
- Vitae or MANA becomes a shortcut to unrestricted authority;
- private Hope/identity context becomes ideological scoring.

## Patterns extracted from edge study 08

This study reconfirms:

1. **Authority Conservation** — drafts do not become law by crossing.
2. **Typed Claims** — proposal, ratification, authorization, execution, and verification are distinct.
3. **Non-Transitive Authority** — a passed proposal does not silently authorize unrelated actions.
4. **Provenance Without Surveillance** — preserve proposal authorship and history without dossiers.

It adds:

5. **Authorship–Authority Separation** — designing a change does not ratify it.
6. **Proposal Fidelity Law** — the ratified decision must bind to the exact proposal version/digest.
7. **Process–Authority Separation** — valid process cannot create authority forbidden by higher law.
8. **Ratification–Execution Separation** — governance authorizes; domain systems execute.
9. **Technical–Political Truth Separation** — feasibility evidence and collective value judgment are distinct epistemic roles.

## Open questions

- What kinds of changes require Imperium ratification versus Human Architect approval during Pre-Genesis?
- Should proposal packets include executable manifests/digests from the beginning, or only after policy text stabilizes?
- How are emergency security changes handled when governance latency is too slow?
- How should community amendments be reconciled with an Architect-maintained implementation candidate?
- Which governance outcomes require chain finality versus signed local/network receipts?
- Does Imperium expose one unified governance surface or domain-specific chambers/workflows?

## Next gate

Study **Architect ↔ Aerarium** to test how system-development work, public funding, grants, budgets, and payment can interact without allowing money to purchase architecture authority or Architect to spend shared resources directly.
