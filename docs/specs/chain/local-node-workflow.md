---
title: "Local ARCnet Node Workflow"
status: canonical-draft
visibility: public
last_updated: 2026-06-05
description: "Defines the safe local developer workflow for preparing, starting, and inspecting an ARCnet node during Pre-Genesis."
phase: "Pre-Genesis"
layer: "Chain / Node / Developer Workflow"
---

# Local ARCnet Node Workflow

## Purpose

This document defines the first local ARCnet node workflow.

The goal is to give the Human Architect and future agent operators a safe, repeatable local node surface before deeper chain logic, agent placement, or distributed infrastructure is added.

This workflow is deliberately conservative.

It prepares and inspects a local node environment. It must not imply production readiness, validator authority, governance authority, or autonomous agent execution.

## Repository access status

This workflow assumes repository access is local and explicit.

Default local repository path:

```text
~/dev/arcanum
```

Default chain app path:

```text
chains/arcanum
```

Default local node home:

```text
.local/arcnet-node
```

Default local chain ID:

```text
arcanum-local-1
```

## Constraint sources

This workflow is subordinate to:

- `docs/architecture/canonical-modules.md`
- `docs/specs/chain/local-arcnet.md`
- `docs/specs/modules/wallet-context-schema.md`
- `docs/specs/modules/wallet-spend-policy.md`
- `docs/specs/economy/mana-lifecycle.md`
- `docs/governance/treasury-constitution.md`

## Current daemon posture

The active daemon target is:

```text
chains/arcanum/cmd/arcanumd
```

The local binary path used by scripts is:

```text
.local/bin/arcanumd
```

The daemon should be treated as a Pre-Genesis developer binary.

The local scripts do not commit keys, do not export private material, do not assume production peers, and do not create governance authority.

## Script surface

The first script surface is:

```text
scripts/node/local-reset.sh
scripts/node/local-start.sh
scripts/node/local-status.sh
```

### `local-reset.sh`

Resets local developer state under `.local/arcnet-node`.

It may:

- delete local node home,
- recreate local directories,
- rebuild the local daemon binary,
- optionally run `arcanumd init` when available.

It must not:

- delete anything outside `.local/arcnet-node` unless explicitly changed by environment variable,
- commit keys,
- publish network state,
- claim production readiness.

### `local-start.sh`

Starts the local daemon using the configured local node home.

It may:

- build the binary,
- create the node home if missing,
- run a local start command if the daemon supports it,
- write a pid file under `.local/arcnet-node`.

It must not:

- silently join a public network,
- claim validator authority,
- run Architect, Codex, or other agents automatically.

### `local-status.sh`

Reports local node status.

It may:

- verify binary presence,
- print daemon version,
- report local home/config paths,
- check a pid file,
- call `arcanumd status` when possible.

It must not:

- treat a failed RPC status as fatal when the node is not running,
- imply a chain is live merely because the binary builds.

## Environment variables

Scripts may read:

```bash
ARCANUM_REPO_ROOT
ARCANUM_CHAIN_DIR
ARCANUM_NODE_HOME
ARCANUM_CHAIN_ID
ARCANUM_MONIKER
ARCANUM_BIN_DIR
ARCANUMD
```

Defaults are local and repository-contained.

## Safety posture

Local node scripts are development tools.

They do not grant:

- identity,
- dignity,
- MANA truth,
- treasury authority,
- Vitae recognition,
- governance authority,
- validator legitimacy,
- autonomous agent authority.

## Agent placement boundary

Architect, Codex, Hope, and future agents may eventually live on or near the ARCnet network.

That is not implemented here.

This workflow only prepares the future place where agent processes may later bind to local node endpoints after explicit design and review.

Forbidden for this phase:

```text
auto-starting agents
auto-writing governance proposals
auto-signing transactions
auto-moving MANA
auto-mutating chain state
```

## Local verification sequence

After adding or changing node scripts, run:

```bash
cd ~/dev/arcanum

bash scripts/node/local-status.sh
bash scripts/node/local-reset.sh
bash scripts/node/local-status.sh

bash scripts/repo-index.sh
bash scripts/verify-sync.sh

pnpm -C apps/web typecheck
pnpm -C apps/web build

cd chains/arcanum
go test ./...
cd ../..
```

If the daemon supports full local start, test manually in a separate terminal:

```bash
bash scripts/node/local-start.sh
```

Then inspect:

```bash
bash scripts/node/local-status.sh
```

## Canonical closure

The local node workflow prepares the ground.

It does not crown a validator.

It does not awaken agents.

It gives the Architect a safe place to build the network from.