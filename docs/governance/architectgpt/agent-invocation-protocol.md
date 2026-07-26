---
title: "Architect GPT Agent Invocation Protocol"
status: proposed
version: "1.0"
phase: "Pre-Genesis"
authority: "evidentiary_only"
---

# Agent Invocation Protocol

## Purpose

Define a deterministic, deny-by-default method for selecting an Architect GPT specialist agent and validating its requested scope before any agent tool execution exists.

Wave XVIII establishes identity, authority ceilings, tool allowlists, exact-commit grounding, and invocation attestations. It does not execute agent tools or perform repository or provider writes.

## Inputs

An invocation request is a JSON object containing:

- `schema_version`: `1.0`
- `record_type`: `agent_invocation_request`
- `repository`: exact Arcanum repository URL
- `branch`: `mobile`
- `commit`: exact forty-character commit SHA
- `agent_id`: an identity from the canonical agent registry
- `requested_permission_class`: one existing Architect permission class
- `requested_tools`: unique tool identifiers requested from the agent allowlist
- `task`: a non-empty description of the bounded assignment
- `authorization`: `explicit_human_request`
- `request_sha256`: SHA-256 of the canonical request without this digest field

## Validation

The invocation runner must fail closed unless all conditions hold:

1. The checkout is on `mobile` and clean.
2. `HEAD` and `origin/mobile` equal the request commit.
3. The registry is valid and deny-by-default.
4. The named agent exists.
5. The requested permission does not exceed the agent permission ceiling.
6. Every requested tool is present in that agent's allowlist.
7. The request carries explicit human authorization.
8. The request digest is valid.
9. The invocation requests at least one tool and contains no duplicates.
10. The runner performs no tool execution or external write.

## Output

A valid request produces a deterministic `agent_invocation_attestation` that binds:

- repository, branch, and exact commit;
- agent identity, display name, and purpose;
- requested permission and registry ceiling;
- requested tool subset;
- required output contract;
- bounded task text;
- request digest;
- plan-only mode and ready status;
- proof that no tool or external write was performed;
- evidentiary-only authority;
- deterministic attestation digest.

## Authority boundary

Wave XVIII agent invocation is planning and evidence only.

The runner cannot:

- execute an agent tool;
- read a connected private provider beyond files already supplied to the runner;
- modify files;
- create commits;
- update refs;
- push;
- create or merge pull requests;
- deploy or roll back;
- ratify doctrine or governance.

Future waves may add an agent execution layer, but that layer must consume a valid invocation attestation and enforce a separate authorization boundary.

## Initial agent set

- Repository Architect
- Canon Guardian
- Product Steward
- Security Sentinel
- Verification Oracle
- Release Steward

Each is intentionally capped at read authority during Wave XVIII.

## Verification requirements

Fixtures must prove:

- deterministic output for identical input;
- acceptance of each canonical agent;
- rejection of unknown agents;
- rejection of permission escalation;
- rejection of non-allowlisted tools;
- rejection of digest tampering;
- rejection of stale commit, dirty checkout, wrong branch, missing authorization, duplicate tools, and empty tasks;
- no mutation of repository refs or working-tree state.
