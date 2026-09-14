---
title: "Construction Era Implementation Arc Ledger"
status: implementation-candidate
visibility: public
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W04"
last_updated: 2026-09-14
maintainer: The-Architect-369
authority: "Human Architect naming/continuity convention; evidence and promotion remain governed by existing wave contracts"
---

# Construction Era Implementation Arc Ledger

## Purpose

Construction Era waves remain the large evidence-gated capability boundaries (`CE-W01`, `CE-W02`, ...). An **Arc** is the bounded implementation unit inside a wave.

Arc identifiers use `CE-WNN-ANN`, where `WNN` is the Construction Era wave and `ANN` is the sequential implementation arc within that wave. This convention does not predetermine how many arcs a wave contains. A wave closes only when its evidence contract closes.

## Compatibility rule

Existing historical branch names, workflow filenames, issue references, commit subjects, specification paths, and certified wave identifiers are not renamed in place. They are immutable provenance. The Arc ledger adds stable aliases and forward naming.

## Retrospective continuity map

- `CE-W01-A01` — Sovereign Coordinate & Runtime Foundation certified implementation package.
- `CE-W02-A01` — Native Geometric Host certified implementation package.
- `CE-W03-A01` — Hope at the Center / Arcanum Native Vertical Slice certified implementation package.

These aliases do not replace the detailed commit, issue, falsification, or certification history inside those waves.

## CE-W04 — Seed Node Alpha arc lineage

### CE-W04-A01 — Scope, contract, and physical baseline

Established the bounded Seed Node Alpha implementation/audit scope, physical installation posture, triple-spine requirement, and offline authority ceiling.

### CE-W04-A02 — Architect Observer and Observation Bridge

Established Human-triggered local observation, privacy-redacted frozen export, visual diagnostics, and bounded Android share/provider surfaces without model authority.

### CE-W04-A03 — Persistent signing and Hope protected-recovery repair

Established the persistent private development signing path, migrated the physical node into that signing lineage, repaired AndroidKeyStore/provider-generated AES-GCM IV handling, and physically demonstrated recovered Hope state on v3.

### CE-W04-A04 — Repository-index closure and v4 continuity proof

Closed the stale deterministic repository index, produced Android v4 with the same persistent development signer, and physically demonstrated a clean in-place update without uninstall/data clear with protected Hope reflection recovery preserved.

### CE-W04-A05 — Hope-first static embodiment and SceneViewportPolicy

Established the protected Hope-first static scene, hard participant-control exclusion via `SceneViewportPolicy`, visually subordinate outer ARCnet geometry, compact Hope/Tempus participant surfaces, versionCode 5 provenance, and a physically audited v4 → v5 continuity path.

### CE-W04-A06 — Viewer-only orbit + bounded motion foundation

Established pure bounded viewer orbit state/reducer behavior, then attached SceneViewport-bounded drag/orbit, pinch zoom, and exact neutral reset without mutating canonical geometry. Physical A06.3 validation confirmed geometry rotation on Seed Node Alpha while Hope capture/recall and inherited functions remained operational.

### CE-W04-A07 — Persistent Arcanum shell control

Established the monochrome Arcanum crest as the persistent highest-layer native shell control. The mark remains fixed outside viewer transforms and provides Human navigation among Hope, Architect, and observation capture. Physical validation confirmed the new shell, Architect destination, observation path, geometry interaction, and Hope continuity all function in place.

### CE-W04-A08 — Native Architect read-only broker bridge

Established the first bounded operational capability on the native Architect destination:

```text
Human tap
→ explicit approval dialog
→ compile-time loopback broker endpoint
→ registered git_status command ID
→ structured execution receipt
→ native factual presentation
```

A08 intentionally introduced only read-only repository inspection. It did not accept shell text, mutate Git state, start the broker silently, contact a model provider, merge/promote branches, or convert technical evidence into authority.

Physical validation confirmed the installed Android Architect could reach the loopback Termux broker, execute the registered action, return a receipt, and report the exact active `stage/ce-w04-architect-observer` branch and installed-source commit after repository-target continuity was corrected.

### CE-W04-A09 — Architect bounded action registry and repository continuity

A09 expands the native Architect from one hard-coded inspection into a compact Human-selected action registry while preserving A08's fixed-command and loopback-only boundary. The Android allowlist exposes repository status, branch, exact HEAD, recent commits, changed filenames, diff statistics, and canonical synchronization verification. Each action requires explicit Human approval and broker risk-class agreement before execution.

A09 also hardens the Termux launcher against stale shell environment targeting: when launched from inside a Git checkout, the current repository takes precedence over `ARCANUM_REPO_DIR`, with the canonical `$HOME/Arcanum` checkout as fallback. The resolved path must be the Git repository root before broker startup.

Repository mutation, free-form shell input, patch application, Git push/merge, artifact installation, remote model dependency, and autonomous promotion remain outside A09.

#### CE-W04-A09.1 — Mobile verification execution-envelope repair

Physical A09 testing proved that `verify_sync` itself was healthy and completed 15/15 when run directly in Termux, while the native invocation failed at the broker's original 120-second deadline. A09.1 therefore changed only the bounded execution envelope: `verify_sync` receives a 300-second broker timeout and the Android loopback client receives a 310-second read timeout so the broker remains the primary deadline and can return a structured receipt.

A09.1 also advanced Android provenance to versionCode 10 / `CE-W04-A09.1` for a physically distinguishable in-place update. The command registry, loopback-only transport, Human approval requirement, repository non-mutation ceiling, no-model ceiling, and `authorityEffect=none` remained unchanged.

Physical A09.1 retesting proved the timeout repair worked: the broker remained alive for the full approximately 132-second verification run and returned HTTP 200 without the prior client-side broken pipe. That run then exposed a second, narrower execution-envelope mismatch: the reduced broker child environment omitted Termux `TMPDIR`, causing `mktemp -d` inside repo-index merge-stability verification to fall back to inaccessible `/tmp`.

#### CE-W04-A09.2 — Termux-native temporary execution envelope

Current repair tranche.

A09.2 preserves Termux host `TMPDIR` inside the broker's bounded child-process environment. Before any registered command executes, the broker validates that host `TMPDIR` is present, absolute, resolves to an existing directory, and is writable. Missing or invalid temporary storage fails closed as `execution_environment_unavailable`; the broker does not create a fallback directory or accept environment values from Android request data.

The canonical verification scripts remain environment-neutral. No Android/Termux condition is added to `verify-sync.sh` or repo-index merge-stability logic. Android provenance advances to versionCode 11 / `CE-W04-A09.2` so the repaired runtime can be physically distinguished during in-place validation.

The fixed command registry, 300/310-second verification timeout relation, loopback-only transport, Human approval requirement, repository non-mutation ceiling, no-model ceiling, and `authorityEffect=none` remain unchanged.

### CE-W04-A10 — Architect Local Development Console

A10 begins after physical A09.2 validation proved the bounded native Architect execution spine end-to-end on Seed Node Alpha.

A10 does not widen repository authority. Instead it turns the existing action surface into a usable local development console with factual broker readiness, active branch/commit context, compact execution summaries, execution receipts and hashes, and Human-controlled expandable raw output.

The console is mounted beneath the persistent Arcanum shell and uses a vertically scrollable presentation region so long verification output cannot dominate or escape the safe native interface.

The A09.2 fixed command registry, explicit per-action Human approval, loopback-only transport, Termux-native temporary execution envelope, repository non-mutation ceiling, no-model ceiling, and `authorityEffect=none` remain unchanged.

## Next intended tranche

After physical A10 validation, the Architect Evolution / Iteration Plane may introduce a proposal-oriented implementation workflow: the Architect may construct a bounded change proposal or patch candidate for Human review without applying it. Repository mutation remains deferred until a later Arc defines explicit file scope, preconditions, diff review, Human approval, receipts, and abort/rollback semantics.

## Promotion discipline

An Arc may be implemented, tested, superseded, or abandoned without closing its parent wave. Arc completion does not imply wave certification, Genesis authority, protocol finality, governance authority, or promotion to `main`.

The source/index discipline remains:

```text
substantive Arc source commit(s)
→ exact-source verification
→ deterministic repo-index generation
→ separate index companion commit
→ exact indexed-head CI
→ Human review
→ promotion only when the governing wave contract permits
```
