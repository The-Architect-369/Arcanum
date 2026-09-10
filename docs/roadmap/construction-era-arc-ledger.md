---
title: "Construction Era Implementation Arc Ledger"
status: implementation-candidate
visibility: public
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W04"
last_updated: 2026-09-10
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

### CE-W04-A04 — Repository-index closure and v4 continuity proof

Closed the stale deterministic repository index, produced Android v4 with the same persistent development signer, and physically demonstrated a clean in-place update without uninstall/data clear with protected Hope reflection recovery preserved.

A04 remains an implementation/evidence arc and does not promote CE-W04 or `main`.

### CE-W04-A05 — Hope-first static embodiment and SceneViewportPolicy

Established the protected Hope-first static scene, hard participant-control exclusion via `SceneViewportPolicy`, visually subordinate outer ARCnet geometry, compact Hope/Tempus participant surfaces, versionCode 5 provenance, and a physically audited v4 → v5 continuity path.

The A05 observation confirmed exact build/source provenance, signer continuity, independent F25 projection arithmetic, and a bounded scene reconstruction while preserving the distinction between Human-reported installation continuity and machine-observed state.

A05 deliberately did not add orbit, animation, inertia, star-tetrahedron activation, or screen recording.

### CE-W04-A06 — Viewer-only orbit + bounded motion foundation

Current arc.

First-tranche objectives:

1. establish pure `ViewerOrbitState` presentation state;
2. establish pure `ViewerOrbitReducer` actions for drag, zoom, and exact reset;
3. hard-bound pitch and zoom while deterministically normalizing yaw;
4. preserve the A05 neutral state exactly;
5. prove reducer operations cannot mutate canonical geometry coordinates;
6. advance Android provenance to `versionCode = 6`, `0.1.5-cew04-a06`, `CE-W04-A06`;
7. keep Hope, Tempus, identity, receipts, capability, governance, protocol, network, and model state outside viewer reducer authority.

This first A06 tranche does not yet attach Android touch listeners, inertia, animation timing, or motion recording. Those require the pure reducer/invariant layer to become green first.

## Next intended tranche

Within A06, after pure reducer verification:

```text
viewer transform integration
→ SceneViewport-bounded gesture attachment
→ geometry-free equivalent controls
→ physical v6 motion test
→ optional Human-triggered bounded motion evidence
```

A subsequent Arc may refine animation grammar or motion observation if the first physical motion audit exposes defects that should not enlarge A06.

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
