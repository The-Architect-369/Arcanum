---
title: "Architect Workbench Runtime"
status: implementation-candidate
phase: "Pre-Genesis"
layer: "Application / Local Tooling / Architect"
wave: "XXII"
---

# Architect Workbench Runtime

## Purpose

The Architect Workbench is the first functional in-Arcanum development surface for the Human Architect.

It joins the application interface to a separately started local execution broker so the Human Architect can inspect and verify the checked-out Arcanum repository without leaving the platform experience.

The first implementation is deliberately narrow. It does not provide unrestricted terminal access and does not make the browser a shell authority.

## Runtime topology

```text
Arcanum /developer Workbench
        ↓ explicit registered command request
127.0.0.1 Termux broker
        ↓ fixed argv execution
Configured Arcanum repository root
        ↓ bounded stdout/stderr
Structured execution receipt
```

## Canonical implementation surfaces

- Workbench route: `apps/web/src/app/(app)/developer/page.tsx`
- Workbench component: `apps/web/src/components/developer/ArchitectWorkbench.tsx`
- Execution contract: `apps/web/src/lib/architect/execution.ts`
- Termux broker: `scripts/architect/termux-broker.py`
- Broker self-test: `scripts/architect/test-termux-broker.sh`

## Authority posture

The Workbench is an instrument of the Human Architect.

The Human Architect must:

1. connect to the local broker;
2. select one exact registered command;
3. review its description and classification;
4. authorize that single execution;
5. inspect the resulting receipt.

Authorization does not persist across command selections or completed executions.

## Broker constraints

The broker:

- binds only to a loopback address;
- validates that the configured path is the Git repository root;
- accepts command identifiers, never shell source text;
- uses fixed argument arrays and `shell=False`;
- executes only with the repository root as the working directory;
- limits request and response sizes;
- applies an exact browser Origin allowlist;
- records branch and commit before execution;
- records commit after execution;
- fails a receipt if the command changes the checked-out commit;
- emits request and result SHA-256 identities;
- exposes no repository-write command.

## Initial registry

| Command ID | Classification | Effect |
|---|---|---|
| `git_status` | read-only | concise working-tree state |
| `git_branch` | read-only | current branch |
| `git_head` | read-only | exact commit SHA |
| `git_log_10` | read-only | recent commit summary |
| `git_diff_stat` | read-only | unstaged diff statistics |
| `git_diff_names` | read-only | unstaged changed filenames |
| `verify_sync` | verification | canonical synchronization verification |
| `web_typecheck` | verification | configured web TypeScript verification |

The registry is owned by the broker. The browser cannot supply arguments or executable paths.

## Receipt model

Each completed request returns:

- receipt ID;
- command descriptor;
- repository root;
- branch;
- commit before and after execution;
- start and completion timestamps;
- duration;
- exit code;
- bounded stdout and stderr;
- truncation indicators;
- canonical request SHA-256;
- canonical result SHA-256;
- pass or fail status.

Receipts are local observations. They are not governance receipts, authority grants, release approvals, or claims of network truth.

## Start command

From the Arcanum repository in Termux:

```bash
python3 scripts/architect/termux-broker.py \
  --repo "$ARCANUM_REPO_DIR"
```

The default broker address is:

```text
http://127.0.0.1:8765
```

Additional exact browser origins may be supplied with repeated `--allow-origin` flags or through the comma-separated `ARCANUM_BROKER_ORIGINS` environment variable.

## Verification

```bash
bash scripts/architect/test-termux-broker.sh
pnpm -C apps/web typecheck
pnpm -C apps/web build
```

## Explicitly deferred

Wave XXII does not add:

- Docker;
- arbitrary command input;
- an interactive PTY;
- repository writes;
- commits, pushes, merges, or pull requests;
- Vercel deployment actions;
- chain transactions;
- governance execution;
- secret or environment inspection;
- OpenAI or other model-provider calls;
- background execution;
- native Android process embedding.

## Future capability gates

Later waves may add independently reviewed capabilities for:

1. repository patch preparation;
2. diff approval;
3. isolated build execution;
4. provider-neutral Architect conversation;
5. signed local receipts;
6. native-shell process integration;
7. bounded repository publication.

Each capability must remain separately registered, reviewable, revocable, and subordinate to Human Architect authorization.
