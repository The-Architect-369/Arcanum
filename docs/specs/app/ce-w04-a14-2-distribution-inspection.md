---
title: "CE-W04-A14.2 — Trusted Distribution Inspection"
status: implementation-candidate
visibility: public
last_updated: 2026-09-30
phase: Pre-Genesis
era: Construction Era
wave: CE-W04
arc: CE-W04-A14
stage: A14.2
---

# CE-W04-A14.2 — Trusted Distribution Inspection

A14.2 inspects a published manifest and APK through a fixed HTTPS update origin. It
reuses the A14.1 offline trust decision, hashes the bytes actually retrieved, and
independently verifies the downloaded APK signature with Android `apksigner`.
This is inspection evidence, not installation or publication authorization.

The advancing Android candidate uses versionCode `19`, versionName
`0.1.14-cew04-a14-2`, and implementation arc `CE-W04-A14.2`. The installed A13.5
predecessor is versionCode `18`; its downloaded and installed APK bytes were
observed on Seed Node Alpha on 2026-09-30 with SHA-256
`a583c444f1111566a8c567f82134c1006b8c4c905d40ebe1ef03584b59d989a0`,
matching the exact `2dc2b3954778f9d13b1e501888dbebe5c3e76ebc` CI artifact.
This is a dated predecessor observation, not a claim that A14.2 has been built.

## Candidate and distribution coordinates

The Human-reviewed distribution candidate must identify an exact manifest URL and
APK URL at `https://updates.the-arcanum.net`. The origin is proposed, not declared
operational by this specification. The URLs must be distinct, direct, free of
userinfo, query strings, and fragments, and must return HTTP 200 with identity
encoding and a zero-age cache policy. Redirects fail closed. The manifest is
limited to 16 KiB and the APK to 256 MiB. Retrieval writes only to a temporary
directory for inspection; it does not install the package or mutate the repository.

The inspector consumes separate local A14.1 trust context and candidate observation.
It accepts neither trust roots nor signer rotation from the downloaded manifest.
A14.1 must pass before the APK is inspected. The downloaded APK size and SHA-256
must equal the manifest, and `apksigner verify --print-certs` must succeed with
exactly one certificate digest matching the manifest and A14.1 trust decision.
Missing `apksigner`, malformed responses, network errors, or any mismatch reject.

## Receipt and limits

A passing receipt records the two exact URLs, manifest and APK SHA-256 digests,
APK size, signer digest, source and promotion commits asserted by the manifest,
and `apkSignatureVerified=true`. It reports `networkUsed=true`,
`readyForA15Review=true`, `eligibleForInstallDecision=false`,
`installPerformed=false`, `repositoryMutation=false`, and `authorityEffect=none`.
The commit values remain manifest claims until separately reconciled against Git
and build provenance. The receipt alone does not certify the device's currently
installed signer or authorize a retry of any prior external effect.

## Closure gate

A14 cannot close on simulated tests alone. Record the live origin response,
exact artifact and manifest hashes, signer verification, source/build provenance,
local trust context, and exact-head CI before proposing A14 closure. If the
origin or signed artifact is absent, record the gate as pending. APK publication,
DNS changes, installation and recovery require their own authorization; A15 owns
installation and recovery. No A14.3–A14.5 stages are inferred from this file.
