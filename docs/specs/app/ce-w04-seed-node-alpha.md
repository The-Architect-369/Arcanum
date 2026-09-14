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
- record viewport, runtime bridge, application-launch, trigger, privacy, build provenance, and factual visual-layout metadata;
- retain the latest local observation plus a bounded set of capture-ID-bound frozen Human exports in app-private storage;
- report factual capture success or failure to the participant.

It MUST NOT:

- require network access;
- call OpenAI or another model provider;
- transmit the observation automatically;
- enumerate secrets or private key material;
- persist raw Hope reflection content;
- interpret reflection content, identity, geometry, layout, or time as authority or human meaning;
- execute repository, protocol, governance, treasury, or economic actions.

The latest local W04 observation remains stored under:

```text
files/architect/observation/latest.png
files/architect/observation/latest.json
```

The latest local pair MAY be refreshed by automatic local pulses. It MUST NOT itself be used as a mutable share target.

The persisted observation privacy policy is identified as `private-local-redacted-v1`. The raster persisted to `latest.png` MUST have participant-authored Hope reflection text masked before storage. The semantic tree MUST replace private text and any serialized private `contentDescription` or `hint` value with the fixed redaction marker. An unredacted frame may exist transiently in process memory while Android draws the current root view, but MUST NOT be written to durable storage.

Observation schema `0.3` adds a random local `captureId` and build provenance sufficient to bind a physical observation to the installed candidate without exposing private identity or key material. The build block MUST include:

- Android package name;
- version name and version code;
- exact source commit injected by the exact-head build workflow, or `development-unbound` for an intentionally unbound local development build;
- installed APK SHA-256 computed locally from the app's own base APK.

The local observation manifest identifies:

```text
scope = local
authorityEffect = none
transport = none
exportCapability = human_selected_android_share_sheet
automaticExport = false
immutableExport = true
networkRequired = false
modelDependency = false
privacyPolicy = private-local-redacted-v1
```

An initial pulse MAY be captured after the first laid-out render. A Human-triggered pulse MUST be available so the participant can deliberately refresh the latest observation at the moment they want the Architect surface to inspect.

## Human-mediated observation bridge

The bounded workflow capability is a deliberate Human export of an already-redacted observation.

Touch-and-hold on the native Architect control MAY capture a fresh `human_share` pulse and open the Android system share sheet. The native host MUST NOT preselect a recipient, perform a background upload, infer consent from a prior action, or gain `android.permission.INTERNET` merely to support this bridge.

Before the chooser opens, the bridge MUST create a **capture-ID-bound frozen export** under:

```text
files/architect/observation/export/<captureId>/
```

The frozen export contains exactly these bounded representations:

```text
latest.png
latest.json
observation.zip
```

`observation.zip` contains the exact frozen `latest.png` and `latest.json` bytes and introduces no additional participant content. Its purpose is integrity transport: if a receiving application resizes or recompresses the directly displayed PNG, the original redacted PNG remains recoverable from the ZIP for SHA-256 verification against the manifest.

The provider MUST serve only capture-specific frozen files. It MUST NOT grant a URI that resolves dynamically to whatever the mutable local `latest.*` files become later. The provider remains read-only, non-exported, and rejects arbitrary paths and write operations.

Frozen exports use bounded retention: expired export directories are pruned after 24 hours and no more than three capture directories are retained by the bridge. Each share grants a **10-minute temporary URI grant** before the native host attempts explicit revocation. Android/recipient lifecycle behavior remains external to Seed Node Alpha, so physical validation MUST confirm the selected target can finish reading the files within that interval.

A target application selected by the Human may independently use its own network permissions. That external action is a Human-mediated release boundary; it does not make network access, provider availability, or model inference a dependency of Seed Node Alpha.

The purpose of this bridge is to streamline physical embodiment iteration: the Human may send one fresh redacted pulse directly to a chosen analysis surface without manually taking a screenshot or browsing the app-private filesystem.

## Visual diagnostics

Architect observation schema `0.3` carries deterministic visual diagnostics version `0.2` alongside the raster and semantic tree.

The diagnostics MAY report factual candidates such as:

- viewport density, scaled density, font scale, and orientation;
- visible, text, and clickable view counts;
- clickable targets smaller than the 48dp diagnostic threshold;
- visible views whose measured bounds extend outside the captured root viewport;
- current system-window insets and the resulting safe-content rectangle;
- clickable **system-UI overlap candidates**, including estimated obscured area and unobscured fraction;
- intersecting visible `TextView` bounds as text-overlap candidates.

These findings are diagnostic candidates, not aesthetic verdicts. A reported overlap may be intentional, a small target may be contextually acceptable, and no diagnostic count creates authority or meaning. Human review and raster/semantic context remain required.

The diagnostics MUST NOT inspect or restore private Hope text that has been redacted by the observation privacy boundary.

## Inset-safe participant controls

The physical Observer/Bridge audit identified two layout classes that the first visual repair MUST address before orbit work is trusted:

1. the Arcanum launch label and Architect `A` control were independently overlaid at the top of the window and could intersect;
2. the Tempus control could extend into the Android navigation-bar region.

The W04 candidate therefore MUST place participant-facing header content and the Architect control inside one shared top layout region and MUST position top, center, and bottom control overlays using the current Android system-window insets. System bars MAY remain visually black, but essential controls MUST remain inside the current safe-content rectangle.

The inherited canonical renderer may continue drawing its diagnostic labels underneath the opaque participant header for this tranche; those labels do not create authority and MUST NOT be treated as participant controls. A later visual tranche MAY move renderer diagnostics into a dedicated Architect workbench surface.

## Observation-integrity audit disposition

A physical share of the `0.2` Observer/Bridge candidate reached ChatGPT successfully, but the received PNG was proportionally resized relative to the dimensions declared in the JSON manifest and therefore did not match the manifest image SHA-256. That observation remains useful visual/semantic evidence, but exact original PNG-to-manifest binding was unverified. The cause was not established and MUST NOT be described as tampering.

The same audit confirmed a header collision candidate, a substantial Tempus/navigation-bar overlap, incomplete diagnostic coverage of system-UI occlusion, and a source-level mutable-export risk because shared URIs resolved to the mutable `latest.*` files.

Schema `0.3`, the capture-bound frozen export, the integrity ZIP, build provenance, inset-safe layout, and diagnostics `0.2` are the bounded remediation for those findings. They do not certify the physical result until a new device observation is reviewed.

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

This interaction remains a separate W04 visual tranche. The provenance-safe observation export and inset-safe control repair MUST be physically reviewed first so the Architect can trust the evidence used to tune orbit and triple-spine embodiment.

## W04 Observer / Bridge falsification gates

The Architect Observer / Bridge tranche fails if any of these statements is false:

1. The Android application still builds and launches with no `android.permission.INTERNET` declaration.
2. A local pulse persists both a raster frame and semantic manifest under the bounded Architect observation namespace.
3. Participant-authored Hope reflection text is absent from the persisted raster and semantic manifest, including serialized private auxiliary text channels.
4. The persisted manifest visibly states local scope, no authority effect, no automatic transport, no network requirement, and no model dependency.
5. Capture failure is surfaced as a technical failure and does not fabricate a successful observation.
6. The observer does not alter Hope, Tempus, geometry, identity, capability, receipt, or protocol state merely by observing it.
7. The Human Architect can trigger a fresh pulse on the physical device and inspect the resulting experience.
8. Human-mediated sharing serves only capture-ID-bound frozen redacted files through read-only temporary access; later local pulses cannot mutate the already-shared pair.
9. No recipient is selected and no outbound transfer occurs until the Human explicitly acts through the Android share sheet.
10. The frozen ZIP contains the same redacted PNG and JSON bytes used for the capture and permits original-image SHA-256 verification even if a receiving surface transforms its preview.
11. The manifest identifies the exact source commit used by the exact-head CI build and the installed APK SHA-256 observed locally.
12. Visual diagnostics report system-window insets and system-UI overlap candidates without manufacturing authority or revealing redacted reflection content.
13. The participant-facing header and Tempus control remain outside system-bar occlusion on the first physical device.

## Physical validation before orbit/triple-spine work

The next device proof SHOULD establish:

1. share the new capture and verify the PNG extracted from `observation.zip` matches the manifest SHA-256 and dimensions;
2. confirm the manifest source commit and installed APK SHA-256 correspond to the candidate installed on the device;
3. confirm no header collision and no essential control beneath the system UI;
4. repeat the layout check with the software keyboard, larger text/font scale, and the navigation modes available on the test device;
5. save and recall one explicitly non-sensitive test Hope reflection through the protected boundary, while exported evidence keeps the reflection body redacted.

These are bounded validation checks. They do not allocate new falsification IDs, promote CE-W04, or replace the remaining clean-install, continuity, restart/recovery, and signed-local-receipt proof.

## Promotion gate

This implementation candidate may proceed on an exact-source disposable branch and through CI/APK evidence.

Promotion to canonical `main` still requires:

- exact-source verification;
- inherited CE-W03 regression evidence;
- Android build/install evidence;
- privacy-redaction evidence;
- provenance-safe Human-mediated bridge evidence on the first device;
- inset-safe physical control evidence;
- reconciled G/E/A + Tempus behavior;
- Human Architect physical review;
- explicit Human Architect approval to merge/promote.
