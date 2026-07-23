---
title: "Architect GPT Promotion Protocol"
status: canonical
visibility: public
last_updated: 2026-07-23
description: "Wave IV protocol for deterministic promotion readiness and guarded mobile-to-main merges."
version: "1.0"
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
7. that report contains passing typecheck, production build, and repository-sync evidence;
8. that report records zero failures.

Vercel readiness is verified externally after the final branch head is pushed. It is not inferred by the local promotion gate.

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
- source Termux report.

Attestations are local verification evidence and are not canonical repository state.

## Merge sequence

The guarded merge sequence is:

```text
local promotion gate
  → push exact mobile head
  → Vercel exact-head READY
  → open mobile-to-main pull request
  → verify mergeability and unchanged head SHA
  → merge with expected-head guard
  → confirm stable merge commit and production deployment
  → synchronize mobile with main
```

## Failure behavior

Any failed condition blocks promotion. The gate must not auto-repair repository state, discard changes, rewrite history, or perform the merge itself.

## Standing wave policy

After Wave IV, each completed implementation wave follows this promotion protocol unless the Human Architect explicitly suspends or changes the policy.
