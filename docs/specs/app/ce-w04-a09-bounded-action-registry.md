---
title: "CE-W04-A09 — Architect bounded action registry"
status: implementation-candidate
visibility: public
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W04"
implementation_arc: "CE-W04-A09"
last_updated: 2026-09-12
---

# CE-W04-A09 — Architect bounded action registry

## Purpose

A09 advances Seed Node Alpha from one hard-coded native repository inspection into a compact bounded Architect action surface while preserving the A08 authority, privacy, and transport ceilings.

The Architect remains an advisory local development surface. It does not gain protocol authority, repository mutation authority, arbitrary shell execution, remote model dependence, or autonomous approval.

## Frozen execution path

```text
Human opens Architect
→ Human chooses one native allowlisted action
→ native approval dialog names action + risk class
→ Human explicitly taps Run
→ native client verifies the action exists in broker registry
→ native client verifies broker risk class matches its own allowlist
→ POST fixed commandId to 127.0.0.1:8765
→ broker executes shell=False registered argv in exact repository root
→ structured receipt returns branch, commit, output, timestamps, and result hash
→ native Architect presents factual result
```

No free-form shell text crosses the Android/broker boundary.

## Native allowlist

A09 exposes only these broker action identifiers:

- `git_status` — read-only working-tree/index state.
- `git_branch` — read-only checked-out branch.
- `git_head` — read-only exact HEAD commit.
- `git_log_10` — read-only recent commit summary.
- `git_diff_names` — read-only changed filenames.
- `git_diff_stat` — read-only diff statistics.
- `verify_sync` — repository verification action; may run scripts but may not intentionally mutate repository state.

`web_typecheck` remains broker-registered for development compatibility but is not exposed by the A09 Android allowlist.

## Repository targeting continuity

The mobile broker launcher MUST prefer the repository the Human Architect is currently standing in over a stale exported environment value.

Resolution order is:

```text
1. current Git repository
2. ARCANUM_REPO_DIR advanced override
3. $HOME/Arcanum
4. fail closed
```

The resolved path MUST be the Git repository root before the broker starts.

## Human approval invariant

Every selected action requires an explicit native approval dialog before execution. Approval is per action invocation and is not persisted as blanket permission.

The approval dialog MUST expose at least:

- Human-readable action label.
- Registered command ID.
- Native expected risk class.
- Loopback-only transport statement.
- Statement that arbitrary shell text is not accepted.

## Authority and capability ceiling

A09 MUST NOT introduce:

- Arbitrary command strings.
- Shell interpolation or `shell=true`.
- Git writes, commits, pushes, merges, rebases, resets, checkout/switch, branch mutation, or file mutation.
- Automatic action execution on app launch or panel open.
- Automatic repository promotion.
- Remote HTTP(S) Architect endpoints.
- OpenAI/model-provider dependency.
- Protocol submission or governance authority.

`authorityEffect=none` remains visible on the native Architect surface.

## Receipt continuity

The broker execution receipt remains the factual boundary. A successful native presentation MUST be backed by a receipt with:

- `receiptType = architect_execution_receipt`
- branch
- commit before / after
- registered command metadata
- exit code
- bounded stdout / stderr
- request SHA-256
- result SHA-256
- pass/fail status

For A09 actions, pass requires command exit code zero and unchanged repository HEAD.

## Physical validation target

A09 physical validation should demonstrate from the installed Seed Node Alpha app, with the Termux broker running against the active checkout:

1. Architect action chooser opens.
2. Human selects at least `Current branch`, `Current commit`, and `Verify synchronization`.
3. Each invocation presents an explicit approval dialog.
4. Returned branch and commit match the active Termux checkout.
5. `Verify synchronization` returns a receipt-backed pass or truthful failure.
6. Hope capture/recall and geometry interaction remain functional.
7. No repository mutation occurs as a side effect of any A09 action.

## Deferred capability

Repository mutation, patch application, Git push, workflow rerun, artifact installation, and model-mediated planning remain deferred to later arcs with separate proposal/review/approval contracts.
