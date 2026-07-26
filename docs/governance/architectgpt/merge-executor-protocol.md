# Guarded Merge Executor Protocol

## Purpose

Wave XVII converts one valid Wave XVI merge-authorization package into one narrowly scoped, expected-head-protected pull-request merge.

The executor defaults to dry-run. Apply mode requires exact confirmation of the merge-execution request digest.

## Inputs

1. A valid `merge_authorization_package` produced by Wave XVI.
2. A valid `merge_execution_request` bound to that package.
3. A clean checkout of `mobile` whose `HEAD`, `origin/mobile`, and live `origin/mobile` equal the authorized expected head.
4. An open, non-draft `mobile` to `main` pull request with the authorized number and head SHA.

## Required authorization

- Permission class: `W3`
- Authorization marker: `explicit_human_request`
- Confirmation: `--confirm` must exactly equal the request's `request_sha256`
- Merge method: `merge`

## Dry-run behavior

Dry-run performs no mutation. It validates:

- package and request digests;
- repository, branches, PR number, and expected head;
- clean local state;
- local, tracking, and live mobile identity;
- current main identity and ancestry;
- open, non-draft, mergeable PR state;
- exact package-to-request binding.

It emits a deterministic `merge_execution_attestation` with status `ready`.

## Apply behavior

Apply mode invokes an expected-head-protected GitHub pull-request merge. It then verifies:

- the PR is merged;
- `origin/main` advanced;
- the merge commit has exactly two parents in order: previous main, authorized mobile head;
- the PR's merge commit equals the new live main commit;
- local `mobile`, live `origin/mobile`, and the working tree remain unchanged;
- no tag update or deployment was performed by the executor.

It emits a `merge_execution_attestation` with status `merged`.

## Authority boundary

The executor may perform only the authorized pull-request merge. It may not:

- create or edit a pull request;
- push a branch directly;
- alter `mobile`;
- alter tags;
- deploy;
- roll back;
- synchronize branches after the merge;
- choose a different merge method.

Branch synchronization and deployment observation remain separate capabilities and evidence stages.

## Failure model

The executor fails closed on stale heads, stale main tracking state, altered evidence, wrong PR identity, dirty state, missing confirmation, non-mergeable PR state, parent mismatch, or any unexpected local/mobile mutation.
