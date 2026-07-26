# Candidate Ref Publication Protocol

## Status

Canonical governance protocol for Wave XIV of Architect GPT.

## Purpose

The Guarded Candidate Ref Publisher converts an attested Wave XIII candidate commit into an optional local fast-forward of `refs/heads/mobile`.

The publisher defaults to dry-run. Applying the candidate requires a digest-bound publication request, an explicit `--apply` flag, and a confirmation value equal to the request SHA-256.

## Inputs

The publisher requires:

1. A passing `candidate_commit_attestation`.
2. A signed `candidate_ref_publication_request` bound to that attestation.
3. A clean checkout on `mobile`.
4. Exact equality between HEAD, local `mobile`, `origin/mobile`, and the attested base commit.
5. The attested candidate commit object in the local Git object database.

## Binding rules

The request and candidate attestation must agree on:

- repository
- target branch
- expected old commit
- candidate commit SHA
- candidate attestation SHA-256

The request must declare:

- `permission_class: W2`
- `authorization: explicit_human_request`
- `expected_ref: refs/heads/mobile`

## Dry-run mode

Dry-run is the default mode.

A successful dry-run:

- validates every binding and precondition
- validates candidate object type, sole parent, and tree identity
- validates the candidate is an exact fast-forward descendant
- emits a deterministic `ready` attestation
- does not update any ref

Supplying `--confirm` without `--apply` is rejected.

## Apply mode

Apply mode requires both:

```text
--apply
--confirm <request_sha256>
```

When authorized, the publisher performs only:

```bash
git merge --ff-only <candidate_commit_sha>
```

This advances the checked-out local `mobile` branch and working tree to the exact attested candidate commit.

## Authority boundary

Apply mode has `local_repository_write_only` authority.

The publisher does not:

- update `origin/mobile`
- push
- alter `main`
- create or merge a pull request
- deploy
- rewrite history
- force-update a ref
- create a merge commit

A successful local fast-forward is not remote publication and does not authorize push, merge, deployment, rollback, or constitutional change.

## Fail-closed conditions

The publisher rejects:

- malformed or digest-invalid records
- missing explicit authorization markers
- non-`W2` requests
- branch or ref mismatches
- stale local or remote-tracking state
- dirty working trees
- missing or non-commit candidate objects
- candidate parent or tree mismatches
- non-fast-forward candidates
- missing, incorrect, or misplaced confirmation values

## Verification requirements

Fixtures must prove:

- deterministic dry-run attestations
- dry-run leaves HEAD, local refs, remote-tracking refs, and working tree unchanged
- apply requires exact request-digest confirmation
- apply performs an exact local fast-forward
- apply leaves `origin/mobile` unchanged
- apply creates no merge commit
- tampered candidate attestations and requests are rejected
- stale remote-tracking state is rejected
- dirty source checkouts are rejected
- non-fast-forward candidates are rejected

## Security boundary

The publisher relies on local Git object and ref integrity. It does not provide an operating-system sandbox and does not authenticate or push to a remote provider.
