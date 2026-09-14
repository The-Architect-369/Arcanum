---
title: "CE-W04-A09 — Architect bounded action registry"
status: implementation-candidate
visibility: public
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W04"
implementation_arc: "CE-W04-A09.2"
last_updated: 2026-09-13
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

## A09.1 mobile verification execution envelope

Physical A09 testing proved that the canonical `verify_sync` action can legitimately exceed the original 120-second mobile execution window while still completing successfully when run directly in Termux. A09.1 repairs only that execution envelope; it does not widen the command surface or authority boundary.

The frozen A09.1 timeout relationship is:

- `verify_sync` uses a **300-second broker timeout**.
- the Android loopback client uses a **310-second native read timeout** so the broker remains the primary execution deadline and can return a structured timeout receipt before the HTTP client abandons the request.
- all other fixed command identifiers retain their existing registered timeouts.
- timeout expansion MUST NOT permit arbitrary command text, repository mutation, remote endpoints, silent execution, or autonomous approval.

The broker continues to publish each command's `timeoutSeconds` as factual action metadata.

## A09.2 Termux-native temporary execution envelope

Physical A09.1 testing proved that the repaired timeout envelope remained open long enough for `verify_sync` to complete, but the broker's deliberately reduced child-process environment omitted Termux `TMPDIR`. Repository verification therefore reached the deterministic repo-index merge-stability fixture and failed when `mktemp -d` fell back to Android-inaccessible `/tmp`.

A09.2 repairs only this host execution-envelope mismatch.

The frozen A09.2 temporary-directory contract is:

- registered broker actions inherit `TMPDIR` only from the broker host process environment.
- the Android execution request cannot provide or override environment variables.
- host `TMPDIR` MUST be present, absolute, resolvable to an existing directory, and writable before any registered command executes.
- invalid or absent host `TMPDIR` MUST fail closed with `execution_environment_unavailable`.
- the broker MUST NOT create a fallback temporary directory or silently substitute `/tmp`.
- repository verification scripts remain environment-neutral; A09.2 does not add Android/Termux branches to `verify-sync.sh` or repo-index tests.
- `PATH`, `HOME`, `LANG`, `LC_ALL`, `CI`, and validated host `TMPDIR` form the bounded child-process environment.
- no request-controlled environment injection, shell interpolation, arbitrary command text, repository mutation, remote endpoint, model dependency, or autonomous approval is introduced.

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

A09.2 physical validation should demonstrate from the installed Seed Node Alpha app, with the Termux broker running against the active checkout:

1. Architect action chooser opens.
2. Human selects `Verify synchronization` and explicitly approves it.
3. The action runs inside the 300-second broker / 310-second native timeout envelope.
4. The broker child process receives the broker-host Termux `TMPDIR`, and repo-index merge-stability temporary workspaces no longer fall back to `/tmp`.
5. The returned execution receipt reports `status=pass` and the canonical verifier reaches `verify-sync passed: 15/15 checks.`
6. Returned branch and commit match the active Termux checkout.
7. Hope capture/recall and geometry interaction remain functional.
8. No repository mutation occurs as a side effect of any A09.2 action.

## Deferred capability

Repository mutation, patch application, Git push, workflow rerun, artifact installation, and model-mediated planning remain deferred to later arcs with separate proposal/review/approval contracts.
