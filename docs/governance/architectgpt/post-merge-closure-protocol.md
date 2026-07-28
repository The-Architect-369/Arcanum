---
title: "Architect GPT Post-Merge Closure Protocol"
status: active
version: "1.0"
phase: "Pre-Genesis"
authority: "guarded_w2_mobile_sync"
---

# Post-Merge Closure Protocol

## Purpose

Close a verified promotion wave after merge without weakening the existing W3 merge boundary.

The closure subsystem verifies that `main` points to the expected merge commit, production is `READY` at that exact commit, and `mobile` can be advanced to `main` by fast-forward. It may then perform one explicitly authorized W2 update of `origin/mobile` and emit a deterministic closure attestation.

It does not merge, deploy, roll back, update tags, modify `main`, or ratify canon.

## Command model

```bash
scripts/architect/close-wave.sh <request.json> [--apply --confirm <sha256>]
```

Dry-run is the default. Dry-run validates the request, repository state, production evidence, ancestry, and expected remote lease, then emits the exact digest required for apply mode.

Apply mode requires both:

- `--apply`;
- `--confirm <request_sha256>` matching the deterministic request digest.

## Required request

The request binds:

- repository identity;
- wave identifier;
- base branch `main`;
- integration branch `mobile`;
- exact merge commit;
- pull-request number;
- production deployment identity and state;
- production commit;
- expected current `origin/mobile` commit;
- requested effect `origin_mobile_fast_forward`.

## Preconditions

The executor must verify:

1. The checkout is a clean Git worktree.
2. The configured remote is `origin`.
3. `origin/main` equals the requested merge commit.
4. Production evidence is `READY` and names the same merge commit.
5. `origin/mobile` equals the expected lease commit.
6. `origin/mobile` is an ancestor of `origin/main`.
7. The requested update is a fast-forward.
8. The request digest matches the supplied confirmation in apply mode.

If `origin/mobile` already equals `origin/main`, closure is idempotent and records `already_synchronized` without a remote mutation.

## Allowed effect

The only remote mutation is:

```text
refs/heads/mobile: <expected mobile commit> -> <exact main merge commit>
```

The update must use a lease and must not use force.

## Closure attestation

A successful run emits a JSON attestation containing:

- request digest;
- repository and wave;
- pull request;
- merge commit;
- production deployment and state;
- before and after branch identities;
- whether a remote update was performed;
- verification outcomes;
- final status `closed`.

The attestation is local evidence under:

```text
.architect-reports/orchestration/closures/
```

It is not canon and does not modify repository content.

## Fail-closed conditions

The executor rejects:

- dirty checkouts;
- repository or branch identity mismatch;
- stale `origin/main`;
- stale expected `origin/mobile` lease;
- non-ancestor integration state;
- production states other than `READY`;
- production commit mismatch;
- malformed or non-canonical requests;
- request digest mismatch;
- apply without confirmation;
- confirmation without apply;
- any requested effect other than `origin_mobile_fast_forward`.

## Authority

Dry-run has evidentiary R1 authority. Apply mode has one bounded W2 authority: fast-forward `origin/mobile` to the exact production-verified `origin/main` commit.

W3 remains exclusively responsible for merge, deploy, and rollback. The Human Architect retains all final action authority.
