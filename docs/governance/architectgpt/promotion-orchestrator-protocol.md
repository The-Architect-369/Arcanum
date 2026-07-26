---
title: "Architect GPT Guarded Promotion Orchestrator Protocol"
status: active
version: "1.0"
phase: "Pre-Genesis"
authority: "bounded_w2_before_w3"
---

# Guarded Promotion Orchestrator Protocol

## Purpose

Compress the promotion workflow into one resumable command while preserving every existing verification and authorization boundary.

The orchestrator coordinates already-canonical controls. It does not create a new merge primitive and it does not weaken the expected-head, evidence, permission, or human-authorization requirements enforced by the promotion gate, merge-authorization builder, and guarded merge executor.

## Command model

```bash
scripts/architect/promote-wave.sh <wave> [options]
```

Default mode is dry-run. The orchestrator may advance automatically through read-only and bounded repository-write stages when explicitly requested, but it must stop before a W3 merge unless a valid merge execution request and exact request-digest confirmation are supplied.

## State file

Each wave has one resumable state file:

```text
.architect-reports/orchestration/waves/<wave>.json
```

The state binds:

- repository;
- base and head branches;
- exact head commit;
- current stage;
- local promotion evidence;
- pull-request identity;
- CI evidence;
- provider evidence;
- merge-authorization package;
- merge-execution request;
- final authorization digest;
- applied merge attestation when present.

The state file is evidentiary and local. It is not canon and must not silently modify repository files.

## Stages

1. `ground`
2. `local_verification`
3. `promotion_attestation`
4. `hosted_evidence`
5. `merge_authorization`
6. `ready_for_w3`

Stages are monotonic for one exact head. If the head commit changes, the orchestrator must fail closed and require a new state file or explicit reset.

## Local verification

The orchestrator must verify:

- current branch is `mobile`;
- working tree is clean;
- `HEAD` equals `origin/mobile`;
- `origin/main` is an ancestor of `HEAD`;
- the wave identifier is valid;
- repository and branch identities match the canonical Arcanum configuration.

When `--run-local-gates` is supplied, the orchestrator invokes the existing promotion gate and records the resulting promotion attestation.

## Hosted verification

Hosted evidence may be supplied as canonical files or discovered by a future provider adapter. Wave XVIII-A accepts evidence files and validates their identities before marking hosted verification complete.

Required hosted evidence:

- CI promotion attestation with repository integrity, typecheck, and production build passing for the exact head;
- Vercel preview evidence in `READY` state for the exact head;
- open, non-draft, mergeable `main <- mobile` pull request whose head equals the exact head.

## Authorization boundary

The orchestrator may build or accept a deterministic merge-authorization package. This remains evidentiary only.

The only permitted W3 effect is delegated to:

```text
scripts/architect/merge-executor.py
```

A merge requires all of the following:

- valid authorization package;
- valid merge execution request;
- exact request digest confirmation;
- explicit `--apply`;
- unchanged exact head;
- open mergeable pull request;
- merge method `merge`;
- successful post-merge two-parent identity verification.

## Automatic actions

With explicit bounded write authorization, future adapters may automate:

- creation or update of a promotion PR;
- evidence collection;
- status polling;
- local state recording;
- generation of authorization requests and packages.

They must not automate W3 consent. The human authorization must remain visible and attributable to the exact PR, exact head, merge method, and request digest.

## Fail-closed conditions

The orchestrator must reject:

- dirty working trees;
- branch mismatch;
- local/remote head drift;
- non-ancestor base state;
- stale state files;
- mismatched promotion, CI, or provider evidence;
- draft, closed, wrong-direction, or head-moved pull requests;
- missing or malformed digests;
- authorization package/request mismatch;
- confirmation digest mismatch;
- attempts to merge without `--apply`;
- attempts to use confirmation without `--apply`;
- any mutation outside the delegated guarded executor.

## Authority

Before W3, the orchestrator has evidentiary authority and may perform only explicitly authorized bounded W2 coordination. At W3, it delegates exactly one expected-head-protected pull-request merge to the guarded merge executor.

It does not deploy, roll back, update tags, synchronize `mobile`, ratify canon, or override failed evidence.
