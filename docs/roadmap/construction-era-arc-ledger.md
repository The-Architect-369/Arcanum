---
title: "Construction Era Implementation Arc Ledger"
status: implementation-candidate
visibility: public
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W04"
last_updated: 2026-09-09
maintainer: The-Architect-369
authority: "Human Architect naming/continuity convention; evidence and promotion remain governed by existing wave contracts"
---

# Construction Era Implementation Arc Ledger

## Purpose

Construction Era waves remain the large evidence-gated capability boundaries (`CE-W01`, `CE-W02`, ...). An **Arc** is the bounded implementation unit inside a wave.

Arc identifiers use:

```text
CE-WNN-ANN
```

where `WNN` is the Construction Era wave and `ANN` is the sequential implementation arc within that wave.

Examples:

```text
CE-W04-A01
CE-W04-A02
CE-W04-A03
CE-W04-A04
```

This convention does not numerologically predetermine how many arcs a wave contains. A wave closes only when its evidence contract closes.

## Compatibility rule

Existing historical branch names, workflow filenames, issue references, commit subjects, specification paths, and certified wave identifiers are **not renamed in place**. They are immutable provenance.

The Arc ledger adds stable aliases and forward naming. New implementation work SHOULD carry an Arc identifier in planning/evidence records and, where practical, build provenance.

`CE-WNN` therefore means the whole wave. `CE-WNN-ANN` means one bounded implementation arc within it.

## Retrospective continuity map

The first three Construction Era waves were completed before Arc numbering became formal. Their certified implementation packages receive non-destructive retrospective closure aliases rather than rewritten history:

- `CE-W01-A01` — Sovereign Coordinate & Runtime Foundation certified implementation package.
- `CE-W02-A01` — Native Geometric Host certified implementation package.
- `CE-W03-A01` — Hope at the Center / Arcanum Native Vertical Slice certified implementation package.

These aliases do not replace the detailed commit, issue, falsification, or certification history inside those waves.

## CE-W04 — Seed Node Alpha arc lineage

### CE-W04-A01 — Scope, contract, and physical baseline

Established the bounded Seed Node Alpha implementation/audit scope, physical installation posture, triple-spine requirement, and offline authority ceiling.

### CE-W04-A02 — Architect Observer and Observation Bridge

Established Human-triggered local observation, privacy-redacted frozen export, visual diagnostics, and bounded Android share/provider surfaces without network or model authority.

### CE-W04-A03 — Persistent signing and Hope protected-recovery repair

Established the persistent private development signing path, migrated the physical node into that signing lineage, repaired AndroidKeyStore/provider-generated AES-GCM IV handling, and physically demonstrated recovered Hope state on v3.

### CE-W04-A04 — Repository-index closure and v4 continuity candidate

Current arc.

Objectives:

1. restore deterministic `docs/repo/repo-index.json` synchronization as a separate generated companion commit;
2. produce Android `versionCode = 4` with the same persistent development signer;
3. make no Hope storage-envelope, key-alias, identity, geometry, protocol, governance, or network-semantic change;
4. prove v3-created benign Hope state survives an in-place v3 → v4 update without uninstall or data clear;
5. complete remaining adaptive-layout evidence before enabling physical Visual Orbit interaction.

The v4 candidate carries build provenance identifier `CE-W04-A04`.

## Next intended arc

Subject to A04 evidence closure, the next implementation arc is expected to be:

```text
CE-W04-A05 — Hope-first static embodiment and SceneViewportPolicy
```

A05 should establish the protected Hope center and adaptive scene composition before viewer-orbit gestures are enabled. The exact scope remains evidence-gated and may be revised by the Human Architect.

## Promotion discipline

An Arc may be implemented, tested, superseded, or abandoned without closing its parent wave. Arc completion does not imply wave certification, Genesis authority, protocol finality, governance authority, or promotion to `main`.

The existing source/index discipline remains:

```text
substantive Arc source commit(s)
→ exact-source verification
→ deterministic repo-index generation
→ separate index companion commit
→ exact indexed-head CI
→ Human review
→ promotion only when the governing wave contract permits
```
