# Guarded Remote Ref Publisher Protocol

## Status

Canonical Architect GPT governance protocol for Wave XV.

## Purpose

The Guarded Remote Ref Publisher converts an already-applied Wave XIV local `mobile` fast-forward into a lease-protected update of `origin/mobile`.

It is the first capability in the autonomous action chain permitted to update a remote repository ref. Its authority is deliberately limited to the integration branch.

## Inputs

The publisher consumes:

1. a Wave XIV `candidate_ref_publication_attestation` in applied state;
2. a `remote_ref_publication_request` bound to that attestation;
3. the current local Git repository;
4. an optional explicit apply confirmation.

## Required state

Before either dry-run or apply mode, all of the following must be true:

- the current branch is `mobile`;
- the working tree is clean;
- local `HEAD` equals `refs/heads/mobile`;
- local `HEAD` equals the attested candidate commit;
- `refs/remotes/origin/mobile` equals the expected remote base;
- live `origin/mobile` equals the same expected remote base;
- the candidate commit has the expected remote base as its sole parent;
- the Wave XIV attestation digest is valid;
- the Wave XIV attestation proves a local apply and no prior remote update;
- the remote request digest is valid;
- the request permission class is `W2`;
- the request authorization marker is `explicit_human_request`;
- all repository, ref, commit, and attestation bindings match exactly.

Any mismatch fails closed.

## Dry-run mode

Dry-run is the default.

Dry-run:

- validates all state and evidence;
- resolves the live remote ref with `git ls-remote`;
- emits a deterministic `ready` attestation;
- does not invoke `git push`;
- does not update local or remote refs.

Supplying a confirmation without `--apply` is invalid.

## Apply mode

Apply mode requires both:

- `--apply`;
- `--confirm <request_sha256>` where the value exactly equals the signed request digest.

The publisher executes one bounded push:

```bash
 git push --porcelain \
   --force-with-lease=refs/heads/mobile:<expected-old-commit> \
   origin \
   <candidate-commit>:refs/heads/mobile
```

The explicit lease prevents publication if the remote integration branch moved after authorization.

After the push, the publisher:

- resolves live `origin/mobile` and requires the candidate commit;
- fetches `origin/mobile`;
- requires the remote-tracking ref to equal the candidate commit;
- proves local `HEAD` and the working tree were unchanged;
- emits an `applied` attestation.

## Authority boundary

Dry-run authority is `evidentiary_only`.

Apply authority is `remote_integration_ref_write_only`.

The capability may update only:

- remote `origin`;
- ref `refs/heads/mobile`;
- from the exact expected old commit;
- to the exact attested candidate commit.

It may not:

- update `main`;
- update any tag;
- update any other branch or remote;
- force past a failed lease;
- create a merge commit;
- merge a pull request;
- deploy;
- authorize promotion to stable;
- perform constitutional change.

## Output

The publisher emits a deterministic `remote_ref_publication_attestation` containing:

- repository and remote identity;
- target ref;
- expected old and candidate commits;
- source-attestation and request digests;
- dry-run or apply mode;
- update booleans;
- SHA-256 of porcelain push output when apply mode succeeds;
- explicit negative evidence for stable, tag, merge, and deployment effects;
- authority classification;
- record SHA-256.

## Failure behavior

All validation, lease, push, fetch, and postcondition failures terminate non-zero and emit no successful attestation.

## Relationship to adjacent waves

- Wave XIII creates the deterministic commit object.
- Wave XIV advances only the local `mobile` ref.
- Wave XV may publish only that exact commit to `origin/mobile` under an exact lease.
- Pull-request merge and deployment remain separate W3 actions governed by the promotion protocol.
