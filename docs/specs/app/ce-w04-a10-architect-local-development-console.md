---
title: "CE-W04-A10 — Architect Local Development Console"
status: implementation-candidate
visibility: public
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W04"
implementation_arc: "CE-W04-A10"
last_updated: 2026-09-14
---

# CE-W04-A10 — Architect Local Development Console

## Purpose

A10 converts the physically certified A09.2 native Architect action surface into
a usable local development console without widening execution authority.

A10 is a presentation, observability, and Human-control tranche over the existing
fixed loopback broker spine.

## Frozen capability boundary

A10 preserves all A09.2 execution restrictions:

- no free-form shell text;
- no repository mutation;
- no Git commit, push, merge, rebase, reset, checkout, switch, or branch mutation;
- no arbitrary file writes;
- no automatic command execution;
- no remote Architect endpoint;
- no model-provider dependency;
- no protocol or governance authority;
- `authorityEffect=none`.

The native Android allowlist remains:

- `git_status`
- `git_branch`
- `git_head`
- `git_log_10`
- `git_diff_names`
- `git_diff_stat`
- `verify_sync`

## Local development console

The A10 native console MUST present four distinct layers:

1. **Broker state**
   - loopback readiness;
   - active branch;
   - compact active commit;
   - registered broker action count.

2. **Human-approved action selection**
   - fixed action chooser;
   - per-invocation approval;
   - registered command ID;
   - risk class;
   - explicit loopback transport.

3. **Compact result summary**
   - PASS/FAIL state;
   - Human-readable action label;
   - exit code;
   - factual execution duration when present;
   - bounded-output indicator when truncation occurred.

4. **Execution provenance**
   - branch;
   - commit;
   - broker receipt ID;
   - request SHA-256;
   - result SHA-256.

Raw stdout/stderr MUST NOT dominate the default interface. It is hidden by
default and revealed only through an explicit Human "Show raw output" action.

## Broker health probe

Opening or explicitly checking the Architect console MAY perform `GET /health`
against the compile-time loopback broker endpoint.

The health probe:

- executes no registered repository command;
- requires no repository mutation authority;
- cannot accept shell text;
- cannot contact a remote endpoint;
- exposes only factual broker metadata already available from `/health`.

## Visual boundary

The persistent Arcanum shell control remains the highest native navigation layer.

The Architect console MUST mount below the persistent shell band and inside the
safe system-UI region. Console content MUST be vertically scrollable so long
verification output cannot force the panel underneath navigation controls.

## Receipt continuity

A10 consumes the existing `architect_execution_receipt` and exposes additional
factual receipt fields already emitted by the broker:

- exit code;
- duration;
- start/completion timestamps;
- stdout/stderr truncation state;
- request SHA-256;
- result SHA-256.

A10 does not reinterpret these fields as authority, correctness beyond their
defined scope, or permission for further actions.

## Physical validation target

Physical Seed Node Alpha validation SHOULD demonstrate:

1. Architect opens below the persistent Arcanum shell.
2. Broker readiness appears without executing a repository command.
3. Active branch and commit match the Termux checkout.
4. Action chooser still exposes only the seven A09 Android actions.
5. Every execution still requires explicit Human approval.
6. A short action produces a compact PASS summary plus receipt provenance.
7. Raw output remains hidden until explicitly requested.
8. `verify_sync` can complete through the existing A09.2 execution envelope.
9. Raw verification output is vertically scrollable and does not obscure the
   persistent shell or navigation-bar safe region.
10. Hope capture/recall and geometry interaction remain functional.
11. Repository HEAD remains unchanged after all A10 actions.

## Deferred capability

Patch generation, patch application, repository mutation, Git publication,
workflow control, artifact installation, and model-mediated planning remain
separate future capabilities requiring explicit proposal/review/approval
contracts.
