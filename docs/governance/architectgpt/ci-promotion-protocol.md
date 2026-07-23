---
title: "Architect GPT CI Promotion Protocol"
status: canonical
visibility: public
last_updated: 2026-07-23
description: "Wave V protocol for GitHub Actions promotion attestations tied to exact commits."
version: "1.0"
architect_gpt_version: "3.5"
arcanum_phase: "Pre-Genesis"
maintainer: "The-Architect-369"
---

# Architect GPT CI Promotion Protocol

## Purpose

Wave V adds an independent GitHub Actions verification surface to the local Termux promotion gate. CI evidence supplements local evidence; it does not replace Human Architect authorization or provider readiness checks.

## Workflow

The canonical workflow is:

- `.github/workflows/architect-promotion.yml`

It runs for pushes to `mobile`, pull requests targeting `main`, and manual dispatches.

## Required checks

The workflow must complete all of the following on Ubuntu 22.04 with Node.js 20.x:

1. install dependencies from the locked dependency graph;
2. run `scripts/verify-sync.sh`;
3. run the web TypeScript typecheck;
4. run the web production build;
5. generate a commit-bound CI promotion attestation;
6. upload that attestation as a retained workflow artifact.

## Attestation

The generator is:

- `scripts/architect/ci-attest.sh`

The artifact record includes:

- schema version and record type;
- exact repository, branch, and commit;
- wave identifier;
- GitHub Actions event, run ID, and attempt;
- repository-integrity, typecheck, and production-build outcomes.

The generator refuses to issue an attestation unless every required result is `success` and the commit is a full lowercase SHA.

## Authority boundary

A CI attestation proves that the repository passed the declared automated checks for one exact commit. It does not prove Vercel readiness, authorize a W3 merge, modify canon, or supersede the local promotion attestation.

## Promotion sequence

```text
local exact-head attestation
  + CI exact-head attestation
  + Vercel exact-head READY
  + explicit or standing W3 authorization
  → guarded pull-request merge
```

## Failure behavior

Missing artifacts, failed checks, malformed commit identity, or attestation-generation failure block promotion. CI must not rewrite history, merge branches, or modify repository files.
