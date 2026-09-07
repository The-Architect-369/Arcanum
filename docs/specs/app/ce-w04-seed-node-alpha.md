---
title: "CE-W04 Seed Node Alpha — Implementation Contract"
status: implementation-candidate
visibility: public
last_updated: 2026-09-07
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W04"
layer: "Geometry / Embodiment / Local Runtime / Architect Observation"
authority: "implementation-facing candidate under Human Architect review; does not amend controlling doctrine or create protocol authority"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/58"
---

# CE-W04 Seed Node Alpha — Implementation Contract

## Purpose

CE-W04 actualizes the first one-device sovereign ARCnet node from the certified CE-W03 Android substrate.

The implementation proof remains:

```text
clean install
  → provisional local identity / continuity handle
  → local Rust runtime
  → native Android shell
  → Arcanum
  → Hope
  → protected persistence + Tempus provenance
  → terminate / restart
  → exact recovery
  → signed local receipt (scope=local)
```

This document is an implementation candidate until the Human Architect reviews the physical result and explicitly approves promotion. CI success alone cannot certify Seed Node Alpha.

## Triple-spine embodiment invariant

Seed Node Alpha MUST expose one coherent local embodiment of all three Construction lanes:

- **G — Geometry & Mathematics:** source-owned geometry, coordinates, projection, transforms, and geometric verification;
- **E — Embodiment & Visual Experience:** Hope-centered perception, interaction, motion, orientation, accessibility, and the geometry-free equivalent;
- **A — Architecture & Technology:** observable local runtime, identity continuity, protected persistence, receipt state, capabilities, and recovery.

The three lanes MUST be perceptibly unified without collapsing their authority boundaries.

Geometry or presentation MAY visualize, navigate, or orient the participant around factual local state. Geometry, layout, animation, adjacency, focus, visual prominence, or interaction state MUST NOT manufacture identity, capability, evidence, protocol authority, governance authority, economic rights, recognition, or human meaning.

Tempus MAY traverse the embodiment as a contextual/provenance axis. Tempus does not become a fourth peer lane and temporal coincidence does not manufacture authority.

A geometry-free equivalent MUST preserve every essential control, status, warning, and meaning-bearing fact needed to operate Seed Node Alpha.

## W04 integrated proof name

The CE-W03 native registration reserved the ambiguous identifier `networked_seed_node_alpha_proof`.

For CE-W04 the intended proof is explicitly local and integrated, so the implementation reservation is:

```text
integrated_seed_node_alpha_proof
```

Definition:

> A whole-install, one-device proof composed across local continuity identity, shared runtime, native shell, Arcanum/Hope embodiment, protected persistence, Tempus provenance, restart/recovery, and a signed local receipt, with zero requirement for network availability or protocol submission.

Therefore CE-W04 preserves:

```text
networkRequired = false
protocolSubmission = false
modelDependency = false
```

CE-W05 remains the participant-owned device pairing/synchronization wave. CE-W06 remains the wider ARCnet protocol-connectivity/finality wave. The W04 proof name MUST NOT be interpreted as authorization to absorb either wave.

## Architect presence: local Observer / Pulse

Seed Node Alpha requires a node-resident Architect diagnostic surface so the Human Architect and future ArchitectGPT inference can inspect the same embodied state without relying on manually composed screenshots.

The W04 native implementation begins with **Architect Observer / Pulse**.

Architect Observer is deterministic local tooling, not a language model and not an autonomous authority. It MAY:

- capture the Android root render as a privacy-redacted raster frame;
- capture a semantic view tree from the same local UI state;
- record viewport, runtime bridge, application-launch, trigger, privacy, and factual visual-layout metadata;
- retain the latest observation in app-private storage;
- report factual capture success or failure to the participant.

It MUST NOT:

- require network access;
- call OpenAI or another model provider;
- transmit the observation automatically;
- enumerate secrets or private key material;
- persist raw Hope reflection content;
- interpret reflection content, identity, geometry, layout, or time as authority or human meaning;
- execute repository, protocol, governance, treasury, or economic actions.

The W04 native files are stored under:

```text
files/architect/observation/latest.png
files/architect/observation/latest.json
```

Retention is `latest-only` for this tranche. The persisted observation privacy policy is identified as `private-local-redacted-v1`. The raster persisted to `latest.png` MUST have participant-authored Hope reflection text masked before storage. The semantic tree MUST replace the same private text with a fixed redaction marker. An unredacted frame may exist transiently in process memory while Android draws the current root view, but MUST NOT be written to durable storage.

The local observation manifest identifies:

```text
scope = local
authorityEffect = none
transport = none
exportCapability = human_selected_android_share_sheet
automaticExport = false
networkRequired = false
modelDependency = false
privacyPolicy = private-local-redacted-v1
```

An initial pulse MAY be captured after the first laid-out render. A Human-triggered pulse MUST be available so the participant can deliberately refresh the latest observation at the moment they want the Architect surface to inspect.

## Human-mediated observation bridge

The next bounded workflow capability is a deliberate Human export of the already-redacted local observation.

Touch-and-hold on the native Architect control MAY capture a fresh `human_share` pulse and open the Android system share sheet. The native host MUST NOT preselect a recipient, perform a background upload, infer consent from a prior action, or gain `android.permission.INTERNET` merely to support this bridge.

Only these two bounded files may be offered by the native host:

```text
latest.png
latest.json
```

They are exposed through a read-only, non-exported Android content provider with temporary URI read grants to the Human-selected target application. The provider MUST reject arbitrary paths and write operations.

A target application selected by the Human may independently use its own network permissions. That external action is a Human-mediated release boundary; it does not make network access, provider availability, or model inference a dependency of Seed Node Alpha.

The purpose of this bridge is to streamline physical embodiment iteration: the Human may send one fresh redacted pulse directly to a chosen analysis surface without manually taking a screenshot or browsing the app-private filesystem.

## Visual diagnostics

Architect observation schema `0.2` adds deterministic visual diagnostics version `0.1` alongside the raster and semantic tree.

The diagnostics MAY report factual candidates such as:

- viewport density, scaled density, font scale, and orientation;
- visible, text, and clickable view counts;
- clickable targets smaller than the 48dp diagnostic threshold;
- visible views whose measured bounds extend outside the captured root viewport;
- intersecting visible `TextView` bounds as text-overlap candidates.

These findings are diagnostic candidates, not aesthetic verdicts. A reported overlap may be intentional, a small target may be contextually acceptable, and no diagnostic count creates authority or meaning. Human review and raster/semantic context remain required.

The diagnostics MUST NOT inspect or restore private Hope text that has been redacted by the observation privacy boundary.

## Future ArchitectGPT inference boundary

W04 creates the observation contract, Human-mediated bridge, and local diagnostic presence; it does not silently embed a remote or on-device model.

A later ArchitectGPT inference adapter may consume the redacted raster and semantic observation only after a separate capability/privacy/consent review defines at least:

- provider provenance or on-device model provenance;
- exactly what observation fields may leave the node, if any;
- explicit participant consent and revocation;
- bounded retention;
- transport security;
- model-context minimization;
- failure behavior when the model/provider is unavailable;
- a guarantee that Seed Node Alpha still boots, recovers, signs, and operates without the model.

The long-term target is therefore:

```text
Human experience
  ↓
Seed Node Alpha render + factual local state
  ↓
Architect Observer / Pulse
  ├─ privacy-redacted raster
  ├─ semantic + runtime observation
  └─ factual visual diagnostics
  ↓ explicit Human release / future capability-consent boundary
ArchitectGPT inference
  ↓
analysis / diagnosis / proposal
  ↓
Human Architect review
```

The Architect may observe, diagnose, explain, and propose. It may not rule.

## First-device visual interaction direction

Physical CE-W03 evidence showed that the canonical wireframe naturally invites direct reorientation.

CE-W04 should therefore permit bounded viewpoint interaction while preserving canonical geometry. Drag/orbit, zoom, resting-orientation recovery, and reduced-motion behavior may change the participant's **view** of the structure; they MUST NOT mutate canonical coordinates or runtime truth.

This interaction is a visual-embodiment requirement to be implemented and physically reviewed in a separate W04 visual tranche after the Observer/Bridge foundation is green.

## W04 Observer / Bridge falsification gates

The Architect Observer / Bridge tranche fails if any of these statements is false:

1. The Android application still builds and launches with no `android.permission.INTERNET` declaration.
2. A local pulse persists both a raster frame and semantic manifest under the bounded Architect observation namespace.
3. Participant-authored Hope reflection text is absent from the persisted raster and semantic manifest.
4. The persisted manifest visibly states local scope, no authority effect, no automatic transport, no network requirement, and no model dependency.
5. Capture failure is surfaced as a technical failure and does not fabricate a successful observation.
6. The observer does not alter Hope, Tempus, geometry, identity, capability, receipt, or protocol state merely by observing it.
7. The Human Architect can trigger a fresh pulse on the physical device and inspect the resulting experience.
8. Human-mediated sharing exposes only the bounded redacted image and manifest through read-only temporary access.
9. No recipient is selected and no outbound transfer occurs until the Human explicitly acts through the Android share sheet.
10. Visual diagnostics remain factual candidate measurements and do not manufacture authority or reveal redacted reflection content.

## Promotion gate

This implementation candidate may proceed on an exact-source disposable branch and through CI/APK evidence.

Promotion to canonical `main` still requires:

- exact-source verification;
- inherited CE-W03 regression evidence;
- Android build/install evidence;
- privacy-redaction evidence;
- Human-mediated bridge evidence on the first device;
- reconciled G/E/A + Tempus behavior;
- Human Architect physical review;
- explicit Human Architect approval to merge/promote.
