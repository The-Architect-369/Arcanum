---
title: "Codex Agent Integration"
status: canonical-draft
visibility: public
last_updated: 2026-06-02
description: "Defines how Codex and implementation agents integrate with the Architect Node, repository branches, verification, and future ARCnet node workflows."
phase: "Pre-Genesis"
layer: "Network / Tooling / App"
---

# Codex Agent Integration

## Purpose

This document defines how Codex or Codex-like implementation agents may participate in Arcanum development.

Codex is an implementation assistant.

Codex is not governance.

## Constraint sources

This document is subordinate to:

- `AGENTS.md`
- `docs/specs/network/architect-node.md`
- `docs/specs/protocol/agent-permission-boundaries.md`
- `docs/repo/repo-interface.md`
- `docs/governance/architectgpt/architect-gpt.md`

## Core principle

Codex may turn approved intent into code.

Codex must not decide constitutional direction.

## Allowed functions

Codex may:

- edit files within explicit scope,
- create new files requested by the task,
- refactor bounded code surfaces,
- update documentation,
- add tests,
- run local commands when environment permits,
- summarize diffs,
- prepare pull requests or patches,
- respond to build/test failures.

## Forbidden functions

Codex must not:

- access or expose secrets,
- alter branch protections,
- merge to `main` without approval,
- change doctrine by implementation side effect,
- broaden scope without explicit instruction,
- bypass verification,
- fabricate test results,
- create hidden network calls,
- embed private credentials,
- silently change economic or governance rules.

## Branch model

Default implementation branch:

```text
mobile
```

Allowed additional branch types:

```text
feature/<scope>
fix/<scope>
docs/<scope>
experiment/<scope>
```

Stable branch:

```text
main
```

`main` requires Human Architect approval.

## Task packet

A Codex task should include:

- branch,
- scope,
- files or modules affected,
- expected behavior,
- verification commands,
- doctrine constraints,
- whether commits are allowed,
- whether PR creation is expected.

## Verification contract

After implementation, Codex should report:

- files changed,
- commands run,
- command outcomes,
- known limitations,
- risks or follow-up work.

Expected commands for full-stack changes:

```bash
bash scripts/repo-index.sh
bash scripts/verify-sync.sh
pnpm -C apps/web typecheck
pnpm -C apps/web build
cd chains/arcanum && go test ./... && cd ../..
```

## Doctrine-aware implementation

Codex must preserve:

- no worth scoring,
- no pay-to-recognition,
- no time acceleration by payment,
- no private data on-chain,
- no semantic judgments in receipts,
- no authority assignment without governance path,
- no basic participation locked behind payment.

## Future node integration

In a future local ARCnet node, Codex may operate as a local implementation agent that:

- drafts patches offline,
- reads local repository state,
- prepares verification logs,
- queues changes for human review,
- attaches factual build receipts,
- syncs approved work to the remote repository.

Codex must still operate under permission boundaries.

## Receipt posture

Future agent receipts may state:

- task started,
- files changed,
- verification command run,
- verification passed or failed,
- patch submitted,
- review requested.

Agent receipts must not state:

- change is approved,
- human review is complete,
- governance ratified the change,
- release is canonical unless the required process occurred.

## Canonical closure

Codex may implement.

Codex may verify.

Codex may assist the Architect Node.

Codex may not become the Architect.