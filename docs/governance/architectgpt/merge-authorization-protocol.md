# Wave XVI — Deterministic Merge Authorization Package

## Purpose

Wave XVI binds all exact-head promotion evidence into one deterministic package that may authorize a later pull-request merge action without performing the merge itself.

## Inputs

The builder consumes four canonical JSON records:

1. a ready local `promotion_attestation` for branch `mobile`;
2. a successful `ci_promotion_attestation` for the same commit;
3. exact-head Vercel preview evidence in state `READY`;
4. a `merge_authorization_request` carrying the PR number, expected head SHA, merge method, W3 permission, and `explicit_human_request` marker.

Every input must contain a valid SHA-256 self-digest. The repository, branch, commit, and requested pull-request identity must agree exactly.

## Preconditions

- current branch is `mobile`;
- working tree is clean;
- `HEAD == refs/remotes/origin/mobile == expected_head_sha`;
- base branch is `main`;
- head branch is `mobile`;
- merge method is `merge`;
- permission class is `W3`;
- authorization marker is `explicit_human_request`;
- local promotion checks include clean working tree, remote synchronization, repository integrity, typecheck, production build, and zero Termux failures;
- CI checks include repository integrity, typecheck, and production build;
- Vercel preview evidence is `READY` for the exact head.

## Output

The builder emits a deterministic `merge_authorization_package` containing the exact PR number, head SHA, merge method, input evidence digests, authority boundary, and package SHA-256.

Repeated execution over identical inputs and repository state must produce byte-identical output.

## Authority boundary

Wave XVI is evidentiary only. It may not:

- merge a pull request;
- update `main`, `mobile`, tags, or remote refs;
- push commits;
- create or update a deployment;
- alter GitHub checks or reviews;
- substitute stale or partial evidence.

The package is an input to a separately authorized W3 merge executor. The eventual merge must still use the exact expected head SHA and must fail closed if the PR head changes.

## Failure behavior

The builder exits nonzero and emits no authorization package when any digest, identity, check, provider state, permission, authorization marker, branch state, or commit binding is invalid.
