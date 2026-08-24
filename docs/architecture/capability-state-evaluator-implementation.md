---
title: "ARCnet Capability State Evaluator — Implementation Gate"
status: design-candidate
visibility: public
last_updated: 2026-08-24
phase: Pre-Genesis
authority: non-canonical implementation evidence
---

# ARCnet Capability State Evaluator — Implementation Gate

## Purpose

Implement the first deterministic, explainable evaluator for the action-specific capability registry.

The evaluator is deliberately **not** an authorization service. It computes a presentation/review state from already-supplied facts. The source of those facts, the legitimacy of a grant, cryptographic verification, governance ratification, repository permissions, and destination execution remain separate systems.

## State machine

```text
missing action-specific evidence
        |
        v
INELIGIBLE
        |
        | evidence satisfied
        v
ELIGIBLE
        |
        | required review passed
        v
REVIEWED
        |
        | explicit bounded grant/delegation
        v
GRANTED
        |
        | registered action + destination acceptance
        v
ACTIVE
        |
        +------> SUSPENDED
        |
        +------> EXPIRED
```

`EXPIRED` takes precedence over `SUSPENDED` when both lifecycle conditions are true.

## Eligibility grammar

Evidence is expressed as typed groups:

- `vitae` — only already-recognized, action-relevant Vitae evidence;
- `domain` — subject-matter, governance, technical, or marketplace evidence;
- `safety` — bounded safeguards required by the action.

A group uses either `all` or `any` semantics. The evaluator has no parser for narrative doctrine strings; each runtime policy must translate its requirements into stable predicate IDs explicitly.

## Authority firewall

The following fields are accepted by the prototype only so the evaluator can demonstrate that it ignores them as authorization inputs:

- current Vitae navigation/face position;
- Grade index or illuminated Grade face;
- Architect, Wizard, or Magus display title;
- icosahedron, inner-junction, cube, or stella geometric alignment.

A policy may require a *recognized receipt* whose historical meaning references a Grade or specialization. That is different from reading a current UI coordinate or title label.

## Representative profiles

The v0.1 runtime profile set covers:

1. ordinary Commercium listing publication — proves basic market participation has no Vitae gate;
2. bounded Vitae provenance attachment — proves participant-selected receipts can cross by explicit disclosure;
3. Protection market-assurance review — exercises the full eligibility → review → grant → execution chain;
4. preauthorized Protection interlock — proves deterministic security policy does not use personal Vitae status;
5. binding Imperium vote — exercises constitutional/domain safeguards in addition to responsibility eligibility;
6. Architect release-candidate preparation — preserves authorship, independent verification, and deployment separation.

These are representative implementation profiles, not a replacement for the source capability registry.

## Geometry binding

The prototype renders three explanatory domains:

```text
Vitae icosahedron
      |
      | bounded evidence projection
      v
inner octahedron
review / coordination context
      |
      | system/action selection
      v
ARCnet cube / stella
bounded verb
```

The geometric emphasis follows evaluator state. Geometry is never included in the eligibility, review, grant, lifecycle, or execution formula.

## Runtime boundary

`evaluateCapability(policy, facts)` is a pure function.

It does not:

- query a participant dossier;
- infer a Grade;
- inspect Hope;
- manufacture a grant;
- execute an Edge Contract;
- cast a vote;
- publish a listing;
- perform a security action;
- write a repository;
- settle a chain receipt.

This makes the function suitable for local-first explanation, UI gating, dry-run review, and future signed-policy evaluation while keeping side effects outside the evaluator.

## Test vectors

The repository includes framework-free deterministic vectors covering:

- grant cannot bypass missing evidence;
- eligible waits for review;
- reviewed waits for grant;
- grant waits for execution prerequisites;
- active requires all predicates;
- titles/geometry/current position do not activate;
- suspension overrides active;
- expiry overrides suspension;
- ordinary Commercium listing requires no Vitae evidence;
- preauthorized Protection interlock ignores personal Vitae status.

## Production requirements not yet satisfied

Before this evaluator may be treated as an authorization component:

1. every capability must have stable predicate IDs rather than only narrative requirements;
2. evidence predicates need signed/typed provenance and expiry rules;
3. grants need a verifiable issuer, scope, subject, capability ID, issue time, expiry, suspension/revocation state, and authority basis;
4. destination acceptance and action registration need runtime-owned verification rather than caller-provided booleans;
5. Edge Contract invocation must remain a separate explicit action;
6. capability decisions need factual local/audit receipts without private Vitae dossier export;
7. policy version/digest must be bound into evaluation output.

Until those gates are implemented, this is an explainable **design-candidate evaluator and interactive dry-run surface**.

## Candidate laws

- **Lifecycle Can Disable a Grant Without Rewriting the Person.**
- **Forbidden Signals May Be Displayed; They Must Remain Non-Authorizing.**
- **Evaluator Input Must Be Typed Before It Can Be Trusted.**
- **Policy Version Belongs in the Decision Receipt.**
- **A Morph May Explain a Permission Boundary; It May Not Execute One.**
