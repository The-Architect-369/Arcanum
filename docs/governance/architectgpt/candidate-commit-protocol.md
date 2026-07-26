# Candidate Commit Protocol

## Status

Canonical governance protocol for Wave XIII of Architect GPT.

## Purpose

The Deterministic Candidate Commit Builder converts a verified Wave XII candidate diff into a reproducible Git commit object without moving any repository ref.

It bridges the boundary between an evidentiary patch attestation and a reviewable candidate commit identity. It does not publish, authorize, or promote that commit.

## Inputs

The builder requires:

1. A canonical `repository_patch_bundle`.
2. A passing `isolated_patch_attestation` bound to that bundle.
3. A `candidate_commit_request` containing controlled author, timestamp, and message metadata.
4. The payload directory used to reconstruct create and update operations.
5. A clean `mobile` checkout whose exact HEAD equals the bundle base commit.

## Binding rules

The request, bundle, and patch attestation must agree on:

- repository
- base commit
- target branch
- patch bundle digest
- patch attestation digest

The reconstructed binary candidate diff must equal the Wave XII `candidate_diff_sha256` value.

## Deterministic construction

The builder:

1. Records the source HEAD, worktree status, and complete Git ref map.
2. Creates a detached temporary worktree at the exact base commit.
3. Reconstructs the declared patch from payloads.
4. Stages the candidate and verifies its binary diff digest.
5. Writes the candidate tree with `git write-tree`.
6. Creates a single-parent commit with `git commit-tree` using request-controlled author, committer, UTC timestamp, and message metadata.
7. Verifies the resulting object type, parent, and tree.
8. Removes the temporary worktree.
9. Proves source HEAD, source status, and the complete ref map remain unchanged.
10. Emits a deterministic candidate commit attestation.

Repeated execution with identical repository state, bundle, patch attestation, payloads, and request metadata must produce the same tree SHA, commit SHA, and attestation SHA-256.

## Git object boundary

`git commit-tree` writes an unreachable commit object into the repository object database. This is a persistent but non-authoritative object-store effect.

The builder does not:

- update HEAD
- update a branch
- update a tag
- update a remote-tracking ref
- create a push
- open or merge a pull request
- deploy

An unreachable object may later be removed by normal Git garbage collection unless another authorized workflow creates a ref that reaches it.

## Authority

Candidate commit attestations are `evidentiary_only`.

A passing attestation proves deterministic object construction and ref preservation. It does not authorize publication, branch movement, push, merge, deployment, rollback, or constitutional change.

## Verification requirements

Fixtures must prove:

- deterministic repeated commit identity
- exact parent and tree identity
- binding to Wave XII bundle and attestation digests
- exact candidate diff reconstruction
- source checkout preservation
- complete ref-map preservation
- rejection of tampered bundle or attestation data
- rejection of stale base commits
- rejection of payload digest mismatches
- rejection of dirty source checkouts
- rejection of malformed or non-UTC commit metadata

## Security boundary

Temporary Git worktrees are not operating-system sandboxes. The builder does not execute user-supplied shell commands, but it inherits the invoking process's filesystem and Git object-store access.
