---
title: "CE-W04-A14.1 — Trusted Update Manifest and Offline Trust Decision"
status: implementation-candidate
visibility: public
last_updated: 2026-09-22
phase: Pre-Genesis
era: Construction Era
wave: CE-W04
arc: CE-W04-A14
stage: A14.1
---

# CE-W04-A14.1 — Trusted Update Manifest and Offline Trust Decision

A14.1 is the first bounded stage of **A14 — Trusted Update Inspection & Distribution Preflight**.

It evaluates already-local evidence only.

A passing decision means only that a candidate may proceed to later trusted-distribution inspection. It is not installation authorization.

## Certified predecessor

A14.1 begins from canonical:

`main@7b781208e08cccea14e059bb1b1869bfc4e79bc7`

after the certified A13.5 native UX/artifact handoff.

The native operator registry remains exactly:

1. `probe_workspace`
2. `pair_native_client`
3. `start_broker`
4. `stop_broker`
5. `verify_workspace`

A14 adds no native operation in this stage.

## Fixed Stage-1 policy

- manifest schema: `1.0`
- manifest type: `arcanum-own-package-update`
- application ID: `org.arcanum.nativehost`
- repository: `The-Architect-369/Arcanum`
- promotion branch: `main`
- channel: `pre-genesis`
- broker contract: `arcanum-termux-broker/1.1`
- operator contract: `ce-w04-a13.5/five-op-v1`
- maximum manifest size: 16 KiB
- maximum candidate APK size: 256 MiB
- redirect policy: deny
- cache maximum age: 0

## Trust rule

The update manifest is evidence, not a trust root.

A publisher signer is accepted only when it is:

- the signer of the currently installed application; or
- already present in a separately Human-approved local rotation set.

Explicit revocation always wins.

The manifest cannot approve its own signer rotation.

Publisher signing remains distinct from A11 broker HMAC authentication and later A16 participant-continuity signing.

## Compatibility rule

A14.1 treats app/companion compatibility as first-class trust data.

The validator binds:

- package identity;
- advancing `versionCode`;
- version name;
- APK SHA-256;
- APK size;
- publisher certificate SHA-256;
- `minSdk`;
- `targetSdk`;
- APK ABIs;
- currently present durable data-contract identifiers;
- A11 broker contract;
- A13 operator contract;
- exact five-operation native registry.

## Effect-free receipt

A successful decision reports:

- `readyForTrustedDistributionInspection=true`
- `eligibleForInstallDecision=false`
- `installPerformed=false`
- `repositoryMutation=false`
- `networkUsed=false`
- `networkRequired=false`
- `redirectPolicy=deny`
- `cacheMaxAgeSeconds=0`
- `authorityEffect=none`
- `promotionEvidence=manifest-bound-offline-stage1`

## Non-scope

A14.1 does not:

- download an APK;
- install or replace an APK;
- invoke Android package installation;
- mutate Git;
- mutate Termux state;
- start or stop the broker;
- widen the broker command registry;
- apply proposals;
- contact a model provider;
- perform network retrieval;
- create identity;
- create participant signatures;
- promote code;
- deploy code;
- grant authority.

A15 owns own-package installation and recovery.

A16 owns local continuity identity and signed local receipt closure.

A14 remains open after A14.1.
