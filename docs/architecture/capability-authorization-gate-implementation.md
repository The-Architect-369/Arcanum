# ARCnet Capability Authorization Gate — Implementation Note

Status: design-candidate / Creation Era implementation evidence

## Purpose

Convert the signed capability-record evaluator into a fail-closed enforcement seam. The evaluator explains state; the authorization gate answers one narrower runtime question: **may this exact action execute now?**

## Top-down architecture

```text
participant intent
      ↓
action-specific CapabilityPolicy
      ↓
signed evidence receipts
      ↓
signed review, when required
      ↓
signed bounded grant, when required
      ↓
signed suspension / resume / revocation controls
      ↓
destination-signed action registration
      ↓
destination-signed decision for this action request
      ↓
verifiable evaluator state
      ↓
authorization gate
      ↓
ALLOW only when state === ACTIVE
DENY otherwise
```

The gate is intentionally smaller than the evaluator. It does not infer missing authority, repair malformed evidence, trust an issuer by title, or convert geometry into permission.

## Existing verifiable record layer

`apps/web/src/lib/capabilities/verifiable.ts` is the controlling signed-record implementation for this design candidate. It provides:

- canonical JSON serialization;
- SHA-256 payload and policy digests;
- ES256 / P-256 Web Crypto signing and verification;
- public-key fingerprints and trusted issuer anchors;
- issuer-role restrictions (`evidence-issuer`, `reviewer`, `grant-authority`, `control-authority`, `destination`);
- capability and system scope restrictions on trust anchors;
- subject, capability ID, system, verb, resource, policy-digest, and temporal binding;
- typed evidence, review, grant, lifecycle-control, action-registration, and destination-decision records;
- suspension, resume, revocation, and expiry handling;
- destination-owned execution checks;
- explicit non-authorizing treatment of Vitae navigation position, Grade display, Wizard/Magus/Architect titles, and geometry.

The earlier boolean evaluator remains useful as an explainable prototype surface, but unsigned booleans are not authority-bearing inputs to the verifiable path.

## Enforcement gate

`apps/web/src/lib/capabilities/authorization-gate.ts` adds `authorizeCapabilityAction(policy, input)`.

The decision rule is deliberately absolute:

```text
if verified state === ACTIVE:
    ALLOW
else:
    DENY
```

The gate emits a deterministic reason code:

- `ACTIVE_VERIFIED`
- `ELIGIBILITY_UNSATISFIED`
- `REVIEW_REQUIRED`
- `GRANT_REQUIRED`
- `GRANT_SUSPENDED`
- `GRANT_REVOKED`
- `GRANT_EXPIRED`
- `EXECUTION_PATH_INCOMPLETE`
- `VERIFICATION_ERROR`

Any evaluator exception is converted to `DENY / VERIFICATION_ERROR`; verification failures never degrade into permissive behavior.

## Falsification vectors

`apps/web/src/lib/capabilities/authorization-gate.vectors.ts` exercises the signed Protection market-assurance profile across:

```text
empty       → DENY / INELIGIBLE
eligible    → DENY / ELIGIBLE
reviewed    → DENY / REVIEWED
granted     → DENY / GRANTED
active      → ALLOW / ACTIVE
suspended   → DENY / SUSPENDED
revoked     → DENY / REVOKED
expired     → DENY / EXPIRED
tampered    → DENY / INELIGIBLE
```

This makes the critical invariant executable: **a cryptographically valid record is necessary where required, but no record or developmental signal may skip the ordered authority boundary.**

## Authority laws preserved

1. Development may establish eligibility; authority still requires legitimate grant.
2. A signed receipt proves only the typed statement and scope it contains.
3. Signature validity does not imply issuer authority; the issuer must also be trusted for the required role, capability, and system.
4. A grant cannot bypass missing eligibility or a required review.
5. A valid grant can still be non-executable because of suspension, revocation, expiry, missing action registration, or destination rejection.
6. Destination acceptance is destination-owned.
7. Geometry, Grade position, achievement titles, and junction alignment are explanatory or navigational only.
8. Verification failure is denial, not ambiguity.

## Current boundary

This is not yet a production identity/key-management system. The current demo generates ephemeral P-256 keys in Web Crypto. Production promotion still requires a durable key lifecycle, issuer registration/governance, revocation distribution, persistent receipt storage, replay rules, destination request binding, and explicit compatibility with the device-owned vault direction.

No chain settlement is required merely to evaluate a local capability. A separate finality requirement may later choose chain settlement for a specific grant or receipt class, consistent with App / Chain / Doctrine separation.

## Termux verification handoff

Repository index refresh and full repository verification are intentionally left to the Human Architect's Termux checkout for this gate:

```bash
git fetch origin
git switch docs/creation-era-architecture-trail
git pull --ff-only origin docs/creation-era-architecture-trail

bash scripts/repo-index.sh
bash scripts/verify-sync.sh
```

If verification passes, commit only the deterministic repo-index refresh generated by the repository script. Do not hand-edit `docs/repo/repo-index.json`.

## Promotion posture

- branch: `docs/creation-era-architecture-trail`
- canonical: no
- merge: no
- `main` write: no
- current purpose: implementation evidence for review

Refer to full module schema in `docs/architect/architectgpt-extended.md`.
