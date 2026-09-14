# CE-W04-A07 — Persistent Arcanum Shell Control

Status: implementation candidate

## Purpose

Freeze the Arcanum crest as the persistent highest-layer native shell control on Seed Node Alpha so Hope, Architect, observation capture, and later bounded runtime capabilities remain reachable while the deeper interface continues to evolve.

## Frozen presentation direction

- Replace the temporary `A` pulse affordance with a monochrome reconstruction of the Arcanum crest.
- Use monochrome presentation only in this tranche: white mark on the current black native shell.
- Keep the control fixed in the native top layer; viewer-orbit transforms must not move it.
- Tapping the mark opens a compact native menu with exactly:
  - `Hope`
  - `Architect`
  - `Capture observation`
- Long press preserves the inherited explicit Human share path for a fresh privacy-redacted Architect observation.

## Navigation behavior

### Hope

- Shows the existing Hope reflection panel.
- Shows the existing Tempus lifecycle panel.
- Does not reset or mutate Hope, Tempus, identity, receipts, geometry, or viewer state.

### Architect

- Hides Hope and Tempus presentation panels only.
- Shows a minimal native Architect shell destination.
- The destination is explicitly presentation-only in A07.
- No model invocation, network request, Termux broker execution, repository mutation, merge, promotion, or governance action is introduced by selecting Architect.

### Capture observation

- Delegates to the inherited local Architect Observer callback.
- Remains Human-triggered.
- Preserves existing privacy-redaction and authority boundaries.

## Authority boundary

The Arcanum shell control is navigation and presentation infrastructure only.

It MUST NOT:

- acquire repository authority;
- execute arbitrary shell or PTY commands;
- invoke external models automatically;
- read or expose secrets;
- mutate canonical geometry;
- mutate Hope or Tempus records through navigation;
- merge or promote branches;
- publish observations automatically.

`authorityEffect=none` remains the required presentation truth for the Architect shell destination.

## Relationship to A06

A06 remains the bounded viewer-orbit implementation arc. A07 does not change canonical geometry, projection mathematics, orbit reducer bounds, or gesture authority. The shell mark remains fixed outside the scene transform.

## Forward attachment point

A later implementation arc may mount registered Architect Runtime / Termux broker actions inside the native Architect destination. Those capabilities must remain fixed-command, receipt-producing, Human-approved, and subordinate to the same authority model.

## Physical acceptance sequence

1. Install A07 over the current A06 build without clearing application data.
2. Launch into the existing Hope experience.
3. Confirm the monochrome Arcanum mark is visible in the top shell.
4. Rotate and zoom geometry; confirm the mark remains fixed.
5. Tap the mark and select `Architect`; confirm the minimal Architect destination appears.
6. Tap the mark and select `Hope`; confirm Hope + Tempus presentation returns.
7. Select `Capture observation`; confirm a local Architect observation is captured.
8. Long-press the mark; confirm the inherited explicit share flow remains available.
9. Recall the existing Hope reflection and capture Tempus; confirm continuity is preserved.
10. Close and reopen; confirm the node remains functional and the shell control is still reachable.
