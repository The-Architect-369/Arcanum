---
title: "Project Status"
status: canonical
visibility: public
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W02"
last_updated: 2026-09-04
maintainer: The-Architect-369
authority: "current-state summary; controlling doctrine/specifications remain authoritative"
---

# Project Status

## Current state

Arcanum has completed **CE-W01 — Sovereign Coordinate & Runtime Foundation** and promoted the certified baseline to `main`.

Canonical CE-W01 baseline:

```text
main@22b1255c5063e5fbfebc248c75f6f5e2668a46c4
```

Forward baseline record: `docs/repo/arcanum-baseline.md`.

Current implementation wave: **CE-W02 — Native Geometric Host**.

## Repository posture

- canonical persistent branch: `main`
- permanent integration branch: none
- post-CE-W01 cleanup: GitHub issue #41
- temporary cleanup branch: `cleanup/post-ce-w01-unification` (disposable; not canonical)

## Implemented foundation

### Web application

`apps/web` is the current Next.js web/PWA Arcanum surface. It remains useful and deployable while native ARCnet construction proceeds, but it is not the definition of the future native host.

### Rust local runtime

`runtime/arcanum-runtime` exists and has certified CE-W01 tests for local Tempus clock capture, deterministic anchors, persistence/restart integrity, optional ephemeris-provider boundaries, and local receipt-signing behavior.

### ARCnet protocol

`chains/arcanum` remains the protocol/settlement domain. Local runtime receipt state and protocol finality are intentionally distinct.

### Doctrine and architecture

The repository contains controlling doctrine, architecture, governance, economic/treasury boundaries, Geometry/Spatial machine contracts, Tempus contracts, Vitae authority/curriculum material, and the Architect governance/tooling surface.

## Current construction focus — CE-W02

CE-W02 is responsible for:

- exact mathematical-to-screen projection;
- faithful native/polygonal ARCnet shell realization;
- Android/Kotlin host construction;
- a narrow bridge to the Rust local runtime;
- offline lifecycle integration;
- local Tempus provider integration without requiring network finality.

CE-W03 owns the deeper Hope-centered native vertical slice. CE-W06 owns later protocol connectivity/signing/submission/finality.

## Still intentionally deferred

The current baseline does not settle or claim completion of:

- production tokenomics and MANA issuance policy;
- storage/compute contribution rewards;
- legal/institutional operating structure;
- final governance thresholds and amendment procedures;
- arbitrary community executable-code policy;
- full native multi-platform hosts;
- protocol connectivity/finality from the local runtime;
- unratified symbolic/geometric correspondences.

## Cleanup boundary

The active post-CE-W01 cleanup removes obsolete branch doctrine, stale development scaffolding, redundant archives, and decision-chain clutter without rewriting certified Git history.

Completion target: one persistent `main`, current operating contracts only, bounded provenance, and a clean handoff into CE-W02/local-runtime construction.
