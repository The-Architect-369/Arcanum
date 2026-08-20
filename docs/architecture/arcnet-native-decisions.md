---
title: "ARCnet Native Decisions"
status: implementation-candidate
visibility: public
phase: "Pre-Genesis"
wave: "XXIV"
last_updated: 2026-08-20
maintainer: The-Architect-369
---

# ARCnet Native Decisions

## Purpose

This document records native-platform decisions explicitly established by the Human Architect during Wave XXIV planning. It distinguishes locked architectural direction from deferred implementation details.

## Decision status vocabulary

- `locked` — explicitly accepted by the Human Architect and treated as architectural direction.
- `bounded` — accepted with stated limits that later implementation must preserve.
- `deferred` — intentionally unresolved and blocked on later review.

## 1. ARCnet protocol and ARCnet local runtime are separate domains

**Status:** locked

ARCnet consists of at least two distinct technical domains:

- the ARCnet protocol and chain settlement network;
- the ARCnet local runtime, also described as the ARCnet node running on a user device.

The protocol may be implemented and operated by a network of nodes, while the local runtime is the device-resident environment through which a user owns identity, storage, applications, and synchronization state.

The protocol binary and local-runtime binary must not be treated as one responsibility domain.

## 2. Arcanum is the flagship ARCnet application

**Status:** locked

Arcanum is an installable ARCnet application rather than the ARCnet shell itself.

It is also the flagship and heart of the ecosystem. Other applications and services exist around it, including Commercium, Treasury, Architect, and the ARCnet Protection Suite.

Technical separation must not erase Arcanum's central role in the human experience of the network.

## 3. Android is the first native host

**Status:** locked

ARCnet is intended to become cross-platform across Android, iOS, Windows, Linux, and later compatible device environments.

Android is the first implementation lane because it allows the project to prove the shared runtime, native shell, local services, widgets, storage integration, and bounded execution model before adapting those contracts to other operating systems.

Android-first does not authorize Android-only architecture.

## 4. Rust owns the shared local runtime core

**Status:** locked

Rust is the selected language for the cross-platform ARCnet local runtime foundation.

The Rust core is expected to own canonical device-side logic for:

- runtime lifecycle;
- identity;
- local storage contracts;
- local events and receipts;
- application registration;
- capability enforcement;
- synchronization preparation;
- protocol-client boundaries.

Rust remains an implementation choice rather than a permanent constitutional requirement. Replacement requires a demonstrated technical need and explicit review.

## 5. Kotlin and Jetpack Compose own the Android presentation layer

**Status:** locked

Kotlin is the Android implementation language and Jetpack Compose is the Android UI toolkit.

Compose must support the intended custom interaction system, including:

- radial application navigation;
- central-disk and jewel metaphors;
- controlled transitions;
- gesture-aware motion;
- custom drawing;
- haptics;
- reduced-motion behavior;
- future visual-editor integration.

Presentation logic may call the Rust runtime through narrow bindings. Android UI code must not become the canonical owner of identity, storage, synchronization, or capability rules.

## 6. The current web application is transitional

**Status:** locked

The current Next.js web/PWA application remains a migration surface while native ARCnet is built.

It may provide:

- reusable terminology;
- design references;
- pure domain logic;
- compatibility access;
- temporary hosted interfaces;
- migration validation.

It is not the intended permanent ARCnet or Arcanum runtime. The long-term platform is local-first and natively installed.

Any future web access is secondary and must not become the authoritative custody layer for identity, private memory, local node state, or application authority.

## 7. Every ordinary user action begins locally

**Status:** locked

User actions are committed first to the user's device and local ARCnet runtime.

The user then chooses the intended reach, such as:

- local only;
- trusted devices;
- selected people;
- private followers or circles;
- public network;
- protocol settlement candidate.

The architecture must support direct transfer between local devices and later synchronization without assuming that all data belongs on-chain.

## 8. Chain settlement is reserved for canonical events

**Status:** locked

The ARCnet chain is the grand canonical record for events requiring civilizational, economic, governance, legal, or protocol finality.

Ordinary reflections, drafts, messages, interface interactions, and local application state do not require chain settlement.

Local receipts, synchronized peer records, submitted transactions, and finalized chain records must remain distinguishable.

## 9. Broad user experience maps to explicit internal capabilities

**Status:** bounded

The default user experience should be integrated, approachable, and powerful rather than presenting a large permission matrix at onboarding.

Internally, applications and agents must still operate through explicit, inspectable, and revocable capabilities.

Progress through Arcanum, Vitae, MANA, application entitlements, and governance may deepen customization and control. The exact formulas and permission thresholds remain unresolved.

MANA or progression must not silently bypass device-security boundaries, cryptographic authorization, or explicit consent for sensitive operations.

## 10. Local use does not require chain finality

**Status:** locked

A user must be able to use Arcanum and the ARCnet local runtime without a live protocol connection.

Hope and other private memory surfaces require persistent device-side continuity, but this persistence is not automatically public or on-chain.

Major settlement domains include:

- economic transactions;
- treasury actions;
- governance decisions;
- protocol amendments;
- high-authority attestations;
- other explicitly ratified canonical history.

## 11. Architect is a builder and guardian

**Status:** locked

The Architect application is intended to offer:

- visual editing;
- controlled code interaction;
- testing and preview;
- proposal generation;
- beta and staged release flows;
- community-supported platform growth.

Architect is also expected to protect cohesion with Arcanum doctrine and ethos.

No automated guardian may replace Human Architect authority or silently resolve doctrinal disagreement. Doctrine checks, review gates, and community processes must remain visible and appealable.

## 12. ARCnet applications use signed packages

**Status:** locked

ARCnet applications must have cryptographically signed identity, version, provenance, capability declarations, and upgrade lineage.

A ChainCode owner may eventually sign or authorize packages within the limits of their role, device authority, governance standing, and application-publisher permissions.

Signing alone does not automatically establish network-wide trust. Installation, publication, endorsement, entitlement, and governance approval are separate concepts.

The first native applications may be bundled into the host while preserving the same manifest and signing model intended for later installation.

## Device-owned vault direction

**Status:** locked direction; implementation deferred

The user must own a device-local protected storage domain containing, as applicable:

- local ARCnet node state;
- device identity;
- ChainCode-related custody material;
- application namespaces;
- private Arcanum state;
- local receipts;
- synchronization metadata;
- user-approved shared-resource allocations.

The storage backend may use open-source libraries and operating-system security primitives without becoming a remote dependency. An external software dependency is not the same as external custody.

The device remains the initial vault and source of local continuity.

## Shared storage and compute direction

**Status:** approved vision; economic mechanism deferred

ARCnet is intended to support opt-in contribution of device storage and computational resources.

Participants may eventually receive MANA or another ratified reward for measurable, reliable contributions.

The runtime must reserve and protect the user's own application and identity needs before allocating contributed capacity.

No storage or compute reward system may be implemented before reliability, encryption, privacy, proof, repair, abuse, accounting, energy, device-wear, and legal questions are resolved.

## Relationship to the Arcanum embodiment roadmap

The native architecture and the human-experience roadmap are parallel authority surfaces and must remain distinct.

- This document defines the planned substrate boundary: local runtime, native host, identity, storage, synchronization, application packaging, protocol connectivity, and related native constraints.
- `../roadmap/arcanum-experience-roadmap.md` defines the implementation-candidate human-experience, curriculum, symbolic, capability, and civilizational roadmap that the substrate is intended to carry.
- Native runtime architecture must not absorb or silently redefine Vitae, symbolic design, curriculum meaning, participant capability, or civilizational milestones.
- The experience roadmap must not silently redefine native security, custody, protocol, or capability boundaries.

Seed Node Alpha proves sovereign infrastructure. Navigable Arcanum and Living Guardian are separate experience milestones proving that the infrastructure carries a coherent human world.

## Explicitly deferred

This record does not settle:

- exact Rust crates or storage libraries;
- database encryption implementation;
- application package format;
- key derivation algorithms;
- recovery and social-recovery design;
- MANA entitlement formulas;
- governance thresholds;
- storage and compute reward formulas;
- iOS background behavior;
- desktop-shell toolkit;
- GrapheneOS modification;
- full operating-system replacement;
- legal classification of packages, rewards, or token rights.

## Change control

A locked decision may be revised only through:

1. an explicit proposed amendment;
2. documented rationale and affected surfaces;
3. compatibility and migration analysis;
4. doctrine and authority review;
5. explicit Human Architect approval;
6. repository promotion through the applicable guarded process.
