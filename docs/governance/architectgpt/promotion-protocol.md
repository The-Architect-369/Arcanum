---
title: "Architect GPT Promotion Protocol"
status: canonical
visibility: public
last_updated: 2026-07-28
description: "Deterministic promotion readiness and guarded mobile-to-main merges, including the bounded Wave XXI bootstrap exception."
version: "1.2"
architect_gpt_version: "3.5"
arcanum_phase: "Pre-Genesis"
maintainer: "The-Architect-369"
---

# Architect GPT Promotion Protocol

## Purpose

Promotion from `mobile` to `main` is a W3 action. It requires explicit Human Architect authorization and evidence tied to the exact integration-branch head.

The executable promotion gate is:

- `scripts/architect/promotion-gate.sh`

## Required conditions

A promotion attestation may be issued only when all of the following are true:

1. the active branch is `mobile`;
2. the working tree is clean;
3. local `HEAD` equals `origin/mobile`;
4. local execution and provider-evidence logs validate;
5. `scripts/verify-sync.sh` passes;
6. the latest Termux verification report references the exact current `HEAD`;
7. that exact-head report contains passing typecheck and repository-sync evidence;
8. that exact-head report records zero failures;
9. production-build evidence is either present in the exact-head report or inherited from an ancestor report under the safe-inheritance rule.

Vercel readiness is verified externally after the final branch head is pushed. It is not inferred by the local promotion gate.

## Wave XXI bootstrap exception

The default promotion policy continues to require green runtime evidence. Wave XXI is a narrowly authorized bootstrap exception because it introduces the read-only runtime verifier itself.

For Wave XXI only, correctly classified fail-closed provider protection may serve as Stage A environmental evidence when all of the following are true:

1. the Human Architect has explicitly approved the two-stage bootstrap model;
2. the exception is bound to Wave XXI, PR #28, and the exact current `mobile` head;
3. the local promotion attestation is `ready` and exact-head bound;
4. repository integrity, typecheck, production build, and all relevant fixtures pass;
5. exact-head GitHub CI passes;
6. the exact-head Vercel preview is `READY`;
7. the pull request is open, non-draft, mergeable, and unchanged;
8. unauthenticated preflight classifies the preview as `provider_access_protected`;
9. the smoke attestation remains overall `fail` and contains zero route observations;
10. no credentials, cookies, authorization headers, share tokens, or authenticated bypass are used;
11. Stage B production verification is tracked as a mandatory post-merge closure gate.

This exception proves only that the verifier is safe, deterministic, deployable, exact-head bound, and fail-closed. It does not claim application health and does not convert provider protection into a passing smoke result.

The exception does not apply automatically to later waves. Any future bootstrap exception requires a separate explicit Human Architect decision and canonical amendment.

## Stage B operational closure

After the Wave XXI capability is merged and deployed to production, the wave remains operationally incomplete until the exact production deployment is publicly observable and the canonical smoke verifier records:

- preflight classification `publicly_accessible`;
- ten total routes;
- ten passed routes;
- zero failed routes;
- overall status `pass`;
- exact repository commit and production deployment identity.

Stage B is tracked by issue #29 and is required before Wave XXI operational closure and guarded `mobile` synchronization.

## Safe build-evidence inheritance

A successful production-build result may be inherited from an ancestor commit only when:

- the source report records a passing production build and zero failures;
- the source commit is an ancestor of the exact promotion head;
- every change between the source commit and promotion head is outside runtime-affecting surfaces;
- the exact promotion head independently passes typecheck and repository synchronization.

Runtime-affecting surfaces include:

- `apps/web/**`;
- `packages/**`;
- root package and workspace manifests;
- `pnpm-lock.yaml`;
- TypeScript configuration;
- Next.js configuration.

Changes limited to generated repository indexes, governance documentation, verification scripts, or other non-runtime metadata may inherit an earlier build result when all other gate conditions pass.

## Attestation

A successful local gate writes an ignored JSON attestation beneath:

- `.architect-reports/orchestration/promotions/`

The attestation records:

- schema version;
- record type;
- timestamp;
- repository;
- branch;
- exact commit;
- wave identifier;
- check outcomes;
- exact-head Termux report;
- build-evidence report and source commit.

Attestations are local verification evidence and are not canonical repository state.

## Merge sequence

The guarded merge sequence is:

```text
local promotion gate
  → push exact mobile head
  → Vercel exact-head READY
  → open mobile-to-main pull request
  → verify mergeability and unchanged head SHA
  → validate default runtime evidence or an explicit bounded bootstrap exception
  → obtain exact-head Human Architect W3 authorization
  → merge with expected-head guard
  → confirm stable merge commit and production deployment
  → complete mandatory post-merge runtime closure
  → synchronize mobile with main through the guarded closure mechanism
```

## Failure behavior

Any failed condition outside an explicitly authorized and canonically bounded exception blocks promotion. The gate must not auto-repair repository state, discard changes, rewrite history, treat protected access as application health, or perform the merge itself.

## Standing wave policy

After Wave IV, each completed implementation wave follows this promotion protocol unless the Human Architect explicitly suspends or changes the policy.