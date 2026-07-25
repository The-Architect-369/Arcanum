---
title: "Architect GPT Isolated Patch Executor Protocol"
status: canonical-control
version: "1.0"
phase: Pre-Genesis
---

# Isolated Patch Executor Protocol

## Purpose

The Isolated Patch Executor converts a validated deterministic repository patch bundle into a verified candidate diff inside a detached temporary Git worktree.

It proves that:

- the bundle digest is valid
- the bundle is bound to the exact current `mobile` commit
- create and update payloads match declared SHA-256 digests
- delete and rename operations target valid tracked files
- the observed staged diff matches the declared operation set
- explicitly requested verification commands pass inside the worktree
- the source checkout remains unchanged

The executor does not commit, push, move refs, merge, deploy, or authorize constitutional change.

## Canonical implementation

- Executor: `scripts/architect/patch-executor.py`
- Input bundle: output of `scripts/architect/change-plan.py`
- Attestation schema: `docs/governance/architectgpt/patch-executor.schema.json`
- Fixtures: `scripts/architect/test-patch-executor.sh`
- Reports: `.architect-reports/orchestration/patch-executor/`

## Inputs

The executor requires:

1. A deterministic `repository_patch_bundle`.
2. A payload directory mirroring repository-relative paths for every create or update operation.
3. Optional explicit verification commands.

Create and update operations require `content_sha256`. Delete and rename operations do not consume payload files.

## Transaction model

Execution begins only when:

- the current branch is `mobile`
- the source checkout is clean
- the bundle base commit equals exact `HEAD`
- the bundle target branch is `mobile`
- the bundle digest is valid

The executor creates a detached temporary Git worktree at the bundle base commit. All declared file mutations occur there. The candidate tree is staged only inside that temporary worktree so Git can classify the exact diff.

The worktree is forcibly removed after execution. The original checkout commit and porcelain status are compared before and after execution.

## Diff contract

The observed staged mutations must exactly equal the declared mutation set:

- create → `A path`
- update → `M path`
- delete → `D path`
- rename → `R from_path path`

Rename detection requires identical file content and uses Git's 100 percent similarity threshold.

Unexpected, missing, duplicate, conflicting, or unsupported mutations fail execution.

## Verification commands

Verification commands are optional and explicitly supplied by the authorized caller with repeated `--verify-command` arguments.

Commands are tokenized and executed directly without a shell. Their exit status and output SHA-256 are recorded. A nonzero exit status fails execution.

The temporary Git worktree is repository isolation, not an operating-system security sandbox. Verification commands retain the local process, filesystem, credential, and network permissions of the invoking environment. Only trusted repository commands should be supplied.

## Attestation

A successful attestation records:

- exact base commit
- target branch and permission class
- source bundle digest
- normalized declared changes
- observed Git status tuples
- verification command results
- candidate binary-diff SHA-256
- proof that the source checkout remained unchanged
- evidentiary-only authority
- deterministic attestation SHA-256

The attestation does not contain the candidate file contents and does not create a commit.

## Failure behavior

Execution fails closed when:

- the bundle is malformed or its digest is invalid
- the bundle is stale
- the source checkout is dirty
- execution starts from a branch other than `mobile`
- a path escapes the repository or targets `.git`
- a required payload is missing or has the wrong digest
- a create target already exists
- an update or delete target does not exist
- a rename source is missing or destination exists
- observed mutations differ from declarations
- a verification command fails
- the original checkout changes

Temporary worktree cleanup is attempted even after a failed mutation or verification step.

## Authority boundary

The executor has `authority: evidentiary_only`.

Applying a candidate to the real integration branch remains a separate W2 repository-history action. Pushing, merging, deploying, or rolling back remains subject to the corresponding explicit permission and promotion gates.

## Known boundaries

Wave XII provides isolated Git transaction execution, not full container isolation. It does not currently:

- restrict system calls or network access
- provision dependencies inside the worktree
- transfer a passing candidate automatically into the source checkout
- create commits or branches
- infer verification commands
- execute untrusted third-party code safely

Those boundaries must remain visible in every use of the control.
