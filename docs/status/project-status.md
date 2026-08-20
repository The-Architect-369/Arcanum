---
title: "Project Status"
status: implementation-candidate
visibility: public
phase: "Pre-Genesis"
wave: "XXIV"
last_updated: 2026-08-20
maintainer: The-Architect-369
---

# Project Status

## Purpose

This document provides a grounded snapshot of the Arcanum repository at the opening of Wave XXIV. It separates current implementation, completed but unpromoted work, planned work, and unresolved design questions.

## Repository state

- Repository: `The-Architect-369/Arcanum`
- Stable branch: `main`
- Integration branch: `mobile`
- Active Wave XXIV branch: `agent/wave-xxiv-repository-canonicalization`
- Project phase: Pre-Genesis

## Current implementation

### Web application

The current user-facing product is a Next.js web/PWA implementation under `apps/web`.

Implemented application families include the established Arcanum surfaces for Hope, Tempus, Nexus, Wallet, and Vitae, plus the Developer/Architect Workbench.

The web application is transitional. It remains the active product surface while the native ARCnet host and local runtime are designed and implemented in later waves.

### Human-experience embodiment gap

The repository contains substantially more Arcanum/Vitae knowledge architecture than the current application exposes. This is an **embodiment gap, not primarily a content absence**.

The repository already contains constitutional doctrine, canonical modules, deep Vitae curriculum architecture, specialization systems, anatomy and lexicon work, substantial Guardian content, Hope, Tempus, Nexus, Wallet, Architect tooling, and ARCnet foundations. The comparatively underdeveloped surface is the participant's ability to see, navigate, inhabit, connect, practice, and understand those relationships as one coherent world.

Arc 11 records this as a distinct post-Wave-XXIV development spine in `../roadmap/arcanum-experience-roadmap.md` without representing the planned embodiment milestones as implemented capability.

### ARCnet protocol

The Cosmos SDK implementation under `chains/arcanum` is the current protocol and settlement domain.

The protocol remains distinct from the future ARCnet local runtime and device node.

### Architect execution boundary

Wave XXII is present on `main` and includes:

- the Architect Workbench;
- a loopback-only Termux broker;
- fixed registered commands;
- explicit Human Architect confirmation;
- bounded stdout and stderr;
- structured execution receipts;
- no arbitrary shell input;
- no repository-write authority.

### Architect Runtime Core

Wave XXIII has been merged into `mobile` and adds:

- an active local mission;
- a Human Architect planning-review queue;
- the canonical registered-agent roster as inactive;
- privacy-minimized receipt summaries;
- local audit history;
- browser-local persistence;
- export and reset behavior.

Wave XXIII is complete on `mobile` but is not represented as promoted to `main`.

## Verification and repository controls

The repository includes mature controls for:

- canonical synchronization;
- deterministic repository indexing;
- TypeScript AST and dependency checks;
- build diagnostics;
- change-impact analysis;
- patch planning and isolated execution;
- candidate commit construction;
- guarded publication and merge operations;
- provider and deployment evidence;
- registered read-only agent execution;
- production smoke verification;
- bounded local Workbench execution.

These controls do not imply autonomous authority. Human authorization and wave-specific permission ceilings remain binding.

## Not yet implemented

The following do not yet exist as production repository surfaces:

- Rust ARCnet local runtime;
- Kotlin/Jetpack Compose Android ARCnet host;
- SwiftUI iOS host;
- desktop ARCnet host;
- native ARCnet application registry;
- encrypted ARCnet device vault;
- local-first event ledger owned by the native runtime;
- trusted-device synchronization;
- peer mesh synchronization;
- storage-contribution rewards;
- compute-contribution rewards;
- dynamic signed ARCnet application installation;
- Commercium application;
- Treasury application;
- native Architect application;
- ARCnet Protection Suite;
- production ChainCode device enrollment;
- production tokenomics or institutional operating framework;
- Navigable Arcanum Alpha as a complete participant experience;
- Living Guardian Alpha as an inhabitable curriculum experience;
- Terrestrial Codex Alpha.

## Current active wave

### Wave XXIV — Repository Canonicalization

Objective:

- make repository state self-describing;
- formalize canonical document status;
- record locked native architecture decisions;
- document the ARCnet Seed Node Alpha handoff;
- catalogue unresolved economic, legal, governance, entitlement, storage, and compute questions;
- record the human-experience embodiment gap and its relationship to ARCnet Construction;
- avoid runtime implementation during the documentation freeze.

## Planned implementation milestones

### ARCnet Seed Node Alpha

The next native implementation milestone is intended to prove that an Android device can:

1. install an ARCnet host;
2. start a Rust-backed local runtime;
3. create or restore a provisional local identity;
4. launch Arcanum from a native ARCnet shell;
5. create a Hope reflection offline;
6. persist encrypted local state;
7. restart and recover the same state;
8. inspect a local receipt without claiming chain finality.

### Arcanum Embodiment

Post-Wave-XXIV planning also recognizes an experience spine running in parallel with ARCnet Construction. Its participant-facing milestones include Navigable Arcanum Alpha, Living Guardian Alpha, Living Vitae, the Terrestrial Codex, participant capability, contributor/builder pathways, and living community.

Seed Node Alpha proves sovereign infrastructure. Navigable Arcanum and Living Guardian prove that the infrastructure carries a coherent human world.

See `../roadmap/arcanum-experience-roadmap.md`.

### Institutional and economic framework

A separate later wave must address:

- legal operating structure;
- treasury administration;
- contributor compensation;
- MANA utility and issuance;
- storage and compute contribution accounting;
- governance implementation;
- tax and regulatory review;
- protocol and organizational separation.

No legal or tokenomic conclusion is established by Wave XXIV.

## Known branch cleanup state

- Issue #33 was closed after its corresponding Wave XXIII pull request had already merged.
- Wave XXIV is tracked by Issue #35.
- Historical branches may remain until their relationship to current canonical state is reviewed.
- No branch should be deleted solely because it is old; deletion requires evidence that the work is merged, superseded, or intentionally abandoned.

## Status vocabulary

- `implemented-main` — available on `main`.
- `implemented-mobile` — merged to `mobile` but not promoted to `main`.
- `implementation-candidate` — present on an active feature branch.
- `planned` — approved direction without implementation.
- `unresolved` — requires explicit Human Architect decision.
- `historical` — retained for audit only.
