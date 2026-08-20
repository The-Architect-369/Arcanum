---
title: "Repository Canonicalization"
status: implementation-candidate
visibility: public
phase: "Pre-Genesis"
wave: "XXIV"
last_updated: 2026-08-17
maintainer: The-Architect-369
---

# Repository Canonicalization

## Purpose

Wave XXIV turns the Arcanum repository into a self-describing source of truth before native ARCnet runtime, institutional, treasury, or economic implementation begins.

This document governs the canonicalization pass. It does not replace doctrine, grant authority, or implement runtime behavior.

## Grounded repository state

At the opening of Wave XXIV:

- `main` contains the verified Wave XXII Architect Workbench and bounded Termux execution broker;
- `mobile` contains the merged Wave XXIII Architect Runtime Core and is ahead of `main`;
- Wave XXIII is complete on `mobile` but has not been represented as promoted to `main`;
- the current application remains a Next.js web/PWA implementation;
- a Rust ARCnet local runtime and Kotlin/Compose Android host do not yet exist;
- ARCnet Seed Node Alpha remains a planned milestone, not current implementation.

## Canonical document classes

Every active document should declare one of these postures:

1. `canonical` — ratified source of truth within its stated authority.
2. `implementation-candidate` — grounded proposal or implemented surface awaiting promotion or ratification.
3. `working-draft` — exploratory material that may change without migration guarantees.
4. `historical` — retained for audit or migration only and never treated as current authority.

When two active documents conflict, authority is resolved in this order:

1. ratified doctrine and constitutional specifications;
2. canonical governance and repository-interface documents;
3. canonical architecture and protocol specifications;
4. promoted implementation specifications bound to the active branch state;
5. implementation candidates;
6. working drafts;
7. historical archives.

### Domain-specific constitutional precedence

The generic class ordering above does not flatten explicit constitutional hierarchies inside a domain.

For economic conflicts, the authority hierarchy ratified in `../economics/economic-constitution.md` controls:

1. system Doctrine and ratified system-wide constitutional boundaries;
2. the ARCnet Economic Constitution;
3. specialized constitutions within their bounded domains, including the Treasury Constitution;
4. the Governance Specification for operational governance mechanics;
5. Economic Principles and delegated parameter registries;
6. implementation.

This domain-specific hierarchy resolves same-class and same-era ambiguity among active economic documents. A lower document cannot override a higher one through recency, paraphrase, omission, contradiction, implementation drift, or summary wording.

## Canonicalization rules

- Current implementation and future vision must be labeled separately.
- Unresolved decisions must remain explicitly unresolved.
- Historical records must not be silently deleted or rewritten.
- Archive material may not be cited as active instruction when a current canonical file exists.
- Branch state must be represented exactly: work on `mobile` is not described as live on `main` until promotion occurs.
- Local observations and execution receipts are not chain truth, governance ratification, or legal authority.
- Repository cleanup must be evidence-based and reversible where practical.
- A summary, index, whitepaper, architecture overview, parameter registry, or implementation document may not silently override a controlling constitutional source.

## Active repository domains

### Application

`apps/web` is the current user-facing implementation and transitional application surface.

### ARCnet protocol

`chains/arcanum` contains the Cosmos SDK protocol implementation and higher-order settlement domain.

### Architect tooling

The repository includes deterministic verification, promotion, agent, Workbench, Termux broker, and Architect Runtime surfaces. Their permission and execution boundaries remain separately specified.

### Doctrine, economics, and governance

`docs/doctrine`, `docs/economics`, `docs/governance`, and their canonical indexes define constitutional boundaries and authority relationships.

### Repository integrity

`docs/repo/repo-index.json`, `scripts/repo-index.sh`, and `scripts/verify-sync.sh` remain the structural and synchronization gates.

## Wave XXIV scope

Wave XXIV may:

- document current repository state;
- define canonical document ownership and status;
- consolidate roadmap and project-status reporting;
- record decisions explicitly made by the Human Architect;
- catalogue unresolved design questions;
- close clearly completed tracking records;
- identify archival candidates without deleting them automatically;
- prepare an implementation handoff for later waves.

Wave XXIV may not:

- implement the ARCnet Rust runtime;
- scaffold or publish the Android host;
- alter MANA issuance, supply, permissions, or economic behavior;
- activate storage or compute compensation;
- establish a legal entity or provide legal conclusions;
- alter chain governance or treasury authority;
- introduce arbitrary terminal execution;
- claim unresolved design questions are settled.

ARC-10's ratification of economic document precedence is a documentation-authority decision within this scope. It does not alter MANA parameters, Treasury powers, governance thresholds, or runtime economic behavior.

## Required verification

Before promotion, the exact branch head must pass:

```bash
pnpm -C apps/web typecheck
pnpm -C apps/web build
bash scripts/repo-index.sh
bash scripts/verify-sync.sh
```

Any deterministic repository-index changes produced by the local generator must be committed on the Wave XXIV branch before promotion.

## Exit condition

Wave XXIV is complete when the repository clearly communicates:

- what exists now;
- what has been completed but is not yet promoted;
- what is planned next;
- which decisions are locked;
- which economic, legal, governance, storage, compute, and entitlement questions remain open;
- what evidence is required before implementation resumes.
