---
title: "ARCnet Edge Study 10 — Protection ↔ Imperium"
status: design-candidate
visibility: public
last_updated: 2026-08-22
description: "Stewardship edge study: security evidence and bounded emergency controls ↔ governance policy, authorization, review, and appeal."
phase: "Pre-Genesis"
authority: "non-canonical design evidence"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/37"
edge_id: "protection.imperium"
edge_class: "kinship-candidate"
---

# ARCnet Edge Study 10 — Protection ↔ Imperium

## Purpose

This study examines the candidate relationship between **Protection** and **Imperium** inside the stewardship tetrahedron.

It asks:

> How should verified risk, security policy, emergency controls, and incident evidence interact with collective governance without allowing security to become sovereign or governance to vote technical vulnerabilities out of existence?

The candidate correspondence is:

> **Risk / Security Evidence ↔ Policy / Governance Authorization**

This is design evidence only.

## Repository grounding

Current canon establishes:

- governance operates under higher constitutional authority and may enforce security and infrastructure stability rules;
- ordinary governance cannot override constitutional invariants;
- agent and execution permissions require explicit scope and escalation for high-impact security, chain, governance, and Treasury actions;
- Treasury emergency paths, where used, must be explicitly defined, auditable, and followed by incident reporting/postmortem;
- Architect and automated guardians do not possess sovereign authority;
- native application capability boundaries must remain explicit and revocable.

Protection therefore supplies evidence, enforcement of already-authorized hard boundaries, and emergency technical controls where explicitly delegated. Imperium supplies the formal process for policy, delegated authority, review, amendment, and appeal.

## Semantic correspondence

Protection asks:

> What threat, vulnerability, abuse condition, integrity failure, or policy violation is evidenced, and what bounded mitigations are technically available?

Imperium asks:

> Which mitigations are authorized, for how long, under what scope, with what oversight, and what process governs review, appeal, or policy change?

The edge sits between:

- threat evidence and policy response;
- emergency mitigation and democratic/constitutional review;
- security rule definition and enforcement implementation;
- incident disclosure and governance accountability;
- technical necessity and legitimate authority.

## Core passage

Candidate flow:

```text
Protection Finding / Incident
       |
       | bounded evidence packet
       v
Imperium Security Review
       |
       +------------------------------+
       |                              |
       | existing delegated rule      | new/changed authority required
       v                              v
Protection Enforcement         Governance Proposal / Emergency Path
                                      |
                                      v
                              Bounded Authorization
                                      |
                                      v
                              Protection Enforcement
                                      |
                                      v
                              Review / Sunset / Appeal
```

## Threat–Policy Separation

A vulnerability can be technically real regardless of a vote.

But the existence of a vulnerability does not automatically authorize any possible response.

Candidate law:

> **Security evidence determines what risks exist; governance determines which non-preauthorized policy responses are legitimate within higher law.**

Examples:

```text
critical vulnerability
!= unlimited surveillance authority

majority vote
!= proof that a cryptographic flaw is harmless
```

## Preauthorized Safety Interlocks

Some security actions must occur faster than a full governance process.

A legitimate architecture may therefore preauthorize narrow interlocks such as:

- reject invalid signatures;
- deny undeclared capabilities;
- quarantine a demonstrably corrupted package;
- suspend a compromised signing key within a defined scope;
- halt an unsafe automated action pending review.

These interlocks must derive from prior authority and have explicit scope.

Candidate law:

> **Emergency speed should come from preauthorized bounded controls, not from undefined discretionary power.**

## Emergency Sunset Law

Emergency controls are dangerous if temporary authority becomes permanent by inertia.

A high-impact emergency action should therefore carry:

```text
trigger
scope
reason/evidence digest
start time
expiry / sunset
review requirement
appeal or restoration path
```

Candidate law:

> **Emergency authority must expire, be renewed through legitimate review, or transition into ordinary policy through the proper process.**

## Disclosure versus Exploitability

Governance requires enough information to judge policy and accountability.

Public disclosure of every exploit detail may itself increase risk.

This edge therefore needs layered evidence:

```text
public incident summary
restricted technical detail
cryptographic/evidence digest
reviewer access record
later disclosure where safe
```

Candidate law:

> **Transparency requires accountability, not indiscriminate publication of weaponizable detail.**

## Appeal and False-Positive Boundary

Protection can be wrong.

Automated systems especially can produce false positives or overbroad restrictions.

Any action affecting meaningful participant capabilities should therefore have an appropriate review or appeal path unless immediate technical impossibility makes that meaningless.

Governance review should not edit evidence retroactively. It may:

- uphold the restriction;
- narrow it;
- revoke it;
- change future policy;
- authorize remediation.

## Security Policy Versioning

Protection should enforce a known policy version.

Imperium should ratify or authorize policy changes separately.

Candidate flow:

```text
security policy v1
    |
Protection enforcement
    |
new threat evidence
    v
policy amendment proposal
    v
security policy v2
```

This avoids silent policy drift inside a security subsystem.

## Sovereign faculty projection test

### Hope

Private reflective or emotional content should not be used as a security-risk score or political eligibility signal.

### Tempus

Time is operationally important for:

- incident timestamps;
- emergency expiry;
- patch deadlines;
- review windows;
- certificate/key validity.

This is factual timing, not symbolic authority.

### Vitae

Vitae/authority recognition may contribute to eligibility for security or governance review roles, but it does not make a finding true or grant unrestricted enforcement power.

## Candidate directional actions

### Protection → Imperium

- `submit-security-finding`
- `submit-incident-summary`
- `request-emergency-authorization`
- `request-security-policy-change`
- `submit-enforcement-audit`
- `request-extension-or-sunset-review`

### Imperium → Protection

- `authorize-bounded-mitigation`
- `ratify-security-policy-version`
- `revoke-policy-authorization`
- `request-evidence-review`
- `order-sunset-or-restoration`
- `record-appeal-outcome`

## Receipt model

Candidate receipts:

```text
protection_incident_detected
protection_emergency_interlock_applied
imperium_security_review_opened
imperium_mitigation_authorized
imperium_policy_version_ratified
protection_mitigation_executed
protection_control_sunset
imperium_appeal_resolved
```

Receipts should identify whether an action was:

- automatic under preexisting policy;
- emergency under delegated authority;
- newly authorized through governance.

## Settlement posture

Material security-policy decisions, emergency authority, key suspensions, or protocol-wide actions may need canonical settlement.

Sensitive exploit details should remain off-chain and access-controlled.

## Failure modes

This edge fails if:

- Protection invents policy while claiming to merely enforce it;
- governance votes away factual security failures;
- emergency authority has no scope or sunset;
- sensitive exploit details are made public unnecessarily;
- participants have no review path for consequential false positives;
- private Hope/Vitae context becomes a threat score;
- security-policy versions change silently.

## Patterns extracted from edge study 10

This study reconfirms:

1. **Finding–Authority Separation** — evidence and authority to respond remain distinct.
2. **Typed Claims** — risk, policy, authorization, enforcement, and resolution are separate states.
3. **Non-Transitive Authority** — security evidence does not authorize unrelated governance powers.
4. **Provenance Without Surveillance** — accountability does not require personal dossiers.

It adds:

5. **Threat–Policy Separation** — technical risk and legitimate policy response are distinct.
6. **Preauthorized Interlock Law** — urgent controls must be bounded in advance.
7. **Emergency Sunset Law** — exceptional authority must expire or be re-ratified.
8. **Layered Disclosure Law** — transparency and exploit containment require different disclosure layers.
9. **Appealable Enforcement** — consequential security restrictions require review where meaningful.
10. **Security Policy Versioning** — Protection enforces explicit policy versions rather than drifting policy internally.

## Open questions

- Which native runtime controls are constitutional invariants versus governance-controlled security policy?
- Who may access restricted incident details?
- What emergency actions may Protection take without synchronous Human/governance approval?
- How are compromised governance credentials handled during an active incident?
- What is the minimum appeal surface for automated local security actions?
- Which security-policy changes require protocol settlement?

## Next gate

Study **Protection ↔ Aerarium** to examine custody security, fraud prevention, audit funding, signer controls, incident response, and the boundary between protecting shared assets and controlling them.
