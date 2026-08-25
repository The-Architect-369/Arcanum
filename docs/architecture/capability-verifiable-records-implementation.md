# Verifiable Capability Records v0.2

Status: **Architecture v2 design candidate**  
Phase: **Pre-Genesis**  
Repository branch: `docs/creation-era-architecture-trail`

## Purpose

Replace the primary capability-evaluator demo's unsigned boolean facts with typed, signed, policy-bound records while preserving the existing authority firewall:

```text
Vitae evidence
    ↓ signed evidence receipts
eligibility
    ↓ signed review
reviewed
    ↓ signed bounded delegation
granted
    ↓ destination registration + destination decision
active
```

The v0.1 evaluator remains preserved as the historical explainability prototype. The primary `/vitae/capabilities` route now exercises v0.2.

## Top-down architecture

The runtime has five distinct responsibilities.

1. **Policy** defines the action-specific requirement grammar.
2. **Issuers** sign typed records that make bounded claims about evidence, review, delegation, lifecycle control, or destination execution.
3. **Trust anchors** state which public keys are currently trusted for which issuer role, capability, and system.
4. **The evaluator** verifies signatures, digests, trust scope, subject/capability/policy binding, timestamps, evidence-set linkage, review linkage, grant linkage, lifecycle state, and destination acceptance.
5. **The destination** remains the final owner of executable action registration and acceptance.

No geometry, Grade position, title, or face illumination enters the signed authorization payload.

## Record envelope

Every record uses:

```text
schema
recordId
kind
issuerId
subjectId
capability {
  capabilityId
  system
  verb
  resource
  constraints[]
}
policyDigest
issuedAt
notBefore
expiresAt
proof {
  alg
  keyId
  keyFingerprint
  payloadDigest
  signature
}
```

The current prototype proof is ES256: ECDSA P-256 with SHA-256 through Web Crypto.

The payload digest is SHA-256 over a deterministic canonical-JSON subset implemented by the runtime. This is an Arcanum prototype serialization contract, not a claim of full RFC 8785 conformance.

## Trust is separate from signature validity

A record is not accepted merely because a public key can verify its signature. The verifier requires a matching out-of-band trust anchor:

```text
issuerId
keyId
keyFingerprint
roles[]
capabilityIds[]
systems[]
publicKeyJwk
```

The required role is determined by record kind:

```text
evidence             → evidence-issuer
review               → reviewer
grant                → grant-authority
control              → control-authority
action-registration  → destination
destination-decision → destination
```

This creates the controlling distinction:

**Signature Is Integrity, Not Authority.**

A cryptographically correct self-issued record with no trusted anchor is rejected.

## Evidence receipts

Evidence is no longer represented as:

```text
evidence["requirement-id"] = true
```

It is represented as a signed receipt bound to:

```text
subject
capability
policy digest
evidence kind
requirement ID
assertion = satisfied
source receipt IDs
validity window
issuer
```

The evaluator still applies each policy group's `all` / `any` logic, but only current trusted receipts can satisfy a requirement.

Evidence remains requirement-specific. It is not a reputation score and does not create whole-system access.

**Evidence Receipt Is a Claim About a Requirement, Not a Score About a Person.**

## Review receipts

A review receipt records:

```text
outcome = passed | failed
evidenceDigests[]
authorityBasis
```

The evaluator selects the latest usable review that contains the currently selected evidence-receipt digests.

A review cannot float free of the evidence it actually reviewed.

## Grant receipts

A grant records:

```text
authorityBasis
evidenceSetDigest
reviewDigest
delegationChainIds[]
```

The grant is also bound by the base envelope to the exact subject, capability ID, system, verb, resource scope, and policy digest.

A grant issued for one policy version therefore cannot silently authorize a later policy version.

**Policy Digest Before Grant Reuse.**

The evaluator does not yet prove the legal/doctrinal legitimacy of the text placed in `authorityBasis` or `delegationChainIds`; it only ensures those fields exist inside the signed bounded record. Full delegation-chain validation is a later gate.

## Suspension, resumption, and revocation

The original grant is immutable. Lifecycle changes are separate signed control events:

```text
targetGrantId
targetGrantDigest
control = suspend | resume | revoke
effectiveAt
until
reasonCode
authorityBasis
```

The latest valid effective control event governs the selected grant.

A temporary suspension may carry `until`. A revocation terminates the selected grant. A later capability requires a new legitimate grant rather than rewriting the old one.

**Revocation Is an Event, Not a Rewrite.**

v0.2 introduces a distinct `REVOKED` evaluator state.

## Destination-owned execution

`ACTIVE` requires destination-owned execution evidence rather than local booleans.

The destination signs an action registration containing:

```text
actionId
destinationSystem
handlerVersion
executionContractDigest
status = registered
```

When destination acceptance is required, it also signs a decision bound to:

```text
actionRequestId
actionId
evidenceSetDigest
reviewDigest
grantDigest
decision = accepted | rejected
decisionBasis
```

This prevents an upstream module, Vitae, a review process, or a grant issuer from declaring an action executable on behalf of the destination.

**A Grant Makes an Action Eligible for Execution; the Destination Still Owns Acceptance.**

## Evaluator states

The v0.2 state machine is:

```text
INELIGIBLE
    ↓ trusted current requirement receipts
ELIGIBLE
    ↓ required signed review
REVIEWED
    ↓ required signed bounded grant
GRANTED
    ↓ destination registration + acceptance
ACTIVE

GRANTED/ACTIVE
    ├── signed suspend → SUSPENDED
    ├── signed revoke  → REVOKED
    └── grant expiry   → EXPIRED
```

Current terminal precedence after authority exists is:

```text
REVOKED
EXPIRED
SUSPENDED
execution pending
ACTIVE
```

## Falsification vectors

`apps/web/src/lib/capabilities/verifiable.vectors.ts` defines deterministic semantic expectations around freshly generated keys:

- no records remain `INELIGIBLE`;
- trusted signed evidence reaches `ELIGIBLE`;
- evidence-bound review reaches `REVIEWED`;
- policy/evidence/review-bound grant reaches `GRANTED`;
- destination registration plus acceptance reaches `ACTIVE`;
- signed suspension reaches `SUSPENDED`;
- signed revocation reaches `REVOKED`;
- expired grant reaches `EXPIRED`;
- payload tampering invalidates the original signature and returns to `INELIGIBLE`;
- removal of the evidence trust anchor returns to `INELIGIBLE`;
- removal of destination trust prevents `ACTIVE`.

These vectors are runtime helpers, not a substitute for repository verification.

## Browser demonstration boundary

The interactive page generates ephemeral P-256 key pairs in the browser and then explicitly places the public anchors into the same in-memory demonstration trust set.

That demonstrates:

- canonical digest binding;
- signature verification;
- tamper detection;
- issuer-role scoping;
- subject/capability/policy binding;
- signed review and grant chaining;
- signed suspension/revocation;
- destination-owned execution acceptance.

It does **not** demonstrate:

- durable issuer legitimacy;
- protected production key custody;
- distributed trust-anchor enrollment;
- replay resistance across devices;
- durable revocation propagation;
- complete delegation-chain authority validation;
- chain settlement or protocol finality.

Those remain future gates.

## Authority firewall

The following remain outside the authorization payload and evaluator inputs:

```text
current Vitae navigation position
Grade index / illuminated face
Architect / Wizard / Magus title display
icosahedron / octahedron / junction alignment
cube / stella alignment
```

They may be rendered as explanatory or participant-facing context. They cannot sign, grant, suspend, revoke, register, or accept a capability.

## Candidate laws

**Signature Is Integrity, Not Authority.**

**Trust Anchor Before Trust Claim.**

**Policy Digest Before Grant Reuse.**

**Evidence Receipt Is a Claim About a Requirement, Not a Score About a Person.**

**A Grant Must Bind Subject, Verb, Scope, Policy, and Authority Basis.**

**Revocation Is an Event, Not a Rewrite.**

**Destination Owns Execution Acceptance.**

**Cryptographic Validity Does Not Equal Legitimacy.**

**Geometry Remains Outside the Authorization Payload.**

## Verification handoff

Repository structural sync is intentionally not regenerated in this change. The Human Architect will run the canonical repository verification flow in Termux after pulling the branch.

Relevant Ubuntu/Termux-compatible commands:

```bash
git switch docs/creation-era-architecture-trail
git pull --ff-only
corepack enable
corepack prepare pnpm@9.10.0 --activate
pnpm install --frozen-lockfile
bash scripts/repo-index.sh
bash scripts/verify-sync.sh
```

If the generated index changes, review it before committing the deterministic refresh.

Refer to full module schema in `docs/architect/architectgpt-extended.md`.
