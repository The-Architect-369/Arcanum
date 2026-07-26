---
title: "Architect GPT Guarded Read-Only Agent Execution Protocol"
status: active
version: "1.0"
phase: Pre-Genesis
---

# Guarded Read-Only Agent Execution Protocol

## Purpose

Wave XIX introduces the first tool-execution boundary for registered Architect GPT agents. It consumes a valid Wave XVIII invocation attestation and permits only deterministic, local, read-only adapters under the selected agent's existing permission ceiling and tool allowlist.

## Authority

- Maximum permission class: `R1`.
- Initial executable tools: `repository.read` and `repository.search`.
- Execution is local to the repository checkout.
- The selected agent must already allowlist every requested tool.
- The invocation attestation must bind the exact repository, branch, commit, agent, permission, tools, and task.
- Human authorization remains explicit in the execution request.

Wave XIX grants no file-write, commit, ref-update, push, pull-request, merge, deployment, rollback, credential, network-write, or canonical-ratification authority.

## Inputs

The executor accepts:

1. a valid `agent_invocation_attestation`;
2. a digest-bound `agent_execution_request`;
3. the canonical agent registry.

The request declares one or more operations. Each operation has a supported tool and bounded inputs.

### repository.read

Reads one declared regular UTF-8 file within the repository. Absolute paths, path traversal, symlink targets, directories, and files outside the repository are rejected.

### repository.search

Searches declared regular UTF-8 files for a literal query. Inputs must declare a non-empty query and one or more repository-relative paths. Results are sorted by path and line number. Regular-expression and shell interpretation are not supported.

## Determinism

The executor normalizes operations and results, sorts all path collections, hashes file content and result payloads, and emits a canonical SHA-256 attestation. Volatile timestamps are excluded.

## Repository preservation

Before execution the executor records:

- `HEAD`;
- `origin/mobile`;
- the full ref listing;
- working-tree status.

After execution, all four observations must be unchanged. The source checkout must be clean before and after execution.

## Fail-closed conditions

Execution is rejected when:

- the invocation or request digest is invalid;
- the invocation is not `ready`, `plan_only`, and evidentiary-only;
- the invocation does not match the execution request;
- the agent is missing from the registry;
- the permission exceeds `R1` or the agent ceiling;
- a tool is not allowlisted or not implemented;
- the checkout is dirty, on the wrong branch, or not synchronized with `origin/mobile`;
- a path escapes the repository, resolves through a symlink, is undeclared, or is not a regular file;
- a file is not valid UTF-8;
- repository state changes during execution.

## Output

The executor emits an `agent_execution_attestation` containing exact identity bindings, operation results, output hashes, preservation observations, and explicit proof that no external write, repository mutation, merge, or deployment occurred.

## Promotion boundary

Wave XIX remains read-only. Any future `W1` execution requires a separate registry amendment, protocol revision, fixtures, canonical integration, and explicit human authorization.