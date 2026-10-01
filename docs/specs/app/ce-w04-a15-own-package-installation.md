---
title: "CE-W04-A15 — Own-package installation and recovery"
status: implementation-candidate
visibility: public
last_updated: 2026-10-01
phase: Pre-Genesis
era: Construction Era
wave: CE-W04
arc: CE-W04-A15
---

# CE-W04-A15 — Own-package installation and recovery

## Authorized implementation scope

The Human Architect authorized beginning A15 implementation on 2026-10-01.
The base is main `b85ede0b80135731dd38d5cf1b74e334c54a7b6b`.
This candidate implements installation eligibility, fixed-origin staging, independent
APK signature verification, Android session submission, an app-private atomic
attempt journal, explicit confirmation UI and user-directed session cancellation
and reconciliation. Device recovery verification remains pending. No installation has been
performed by this implementation. A14 remains conditional on A15 evidence.

## Eligibility and effect boundary

Only `org.arcanum.nativehost` may be targeted. Independently observed installed
identity, inspection identity, and freshly re-inspected staged bytes must have
valid version codes and SHA-256 digests. Inspection is fresh for ten minutes;
negative/future timestamps reject. Direct HTTPS and independent APK signature
verification are prerequisites. A manifest assertion alone cannot supply either. Source/promotion commit fields
remain publisher claims until separately reconciled against Git/build provenance;
the native receipt does not certify that lineage.
Staged package/version/digest/signer must equal the inspected candidate, the
candidate signer must equal the installed signer, and its version must advance.
No signer rotation, downgrade, reinstall, other-package installation, uninstall,
or data-clear fallback is provided by this contract.

`READY_FOR_USER_CONFIRMATION` is a decision, not effect authorization or an
installation receipt. The Android integration must independently obtain these
inputs from actual bytes and PackageManager, display the exact candidate, and
require an explicit user action and Android installation confirmation.
The already installed version19 baseline is not an advancing update candidate.

## Attempt journal and restart recovery requirements

Before submitting a PackageInstaller session, persist an operation ID, exact
prior/target identities, session ID and attempt state in app-private storage.
Only one attempt may be active. Record submission and Android callbacks with
their observed status; cancellation and failure are separate from success.
On restart, reconcile the original session and installed package before any
decision to retry. Pending or missing callbacks do not authorize repetition.

The pure policy blocks submission for every prior attempt state, including
cancelled, failed and verified. A reviewed Android recovery flow must reconcile
and explicitly settle that record before presenting a new authorized attempt.
Observing target bytes records `TARGET_OBSERVED`; it does not prove which
operation installed them or fabricate a lost success callback. Observing prior
bytes records `PRIOR_OBSERVED_OUTCOME_UNKNOWN`; it does not prove that the
original session is absent. Unexpected installed identity blocks recovery.

Staging writes belong in an app-private update directory. Cleanup may remove
only those staged artifacts and abandoned installer sessions. Hope, Tempus,
pairing, geometry state and other participant data must not be read for receipts
or removed to force an update. Data preservation requires device evidence with
synthetic fixtures or user-confirmed checks that disclose no private contents.

## Verification and remaining gate

The Kotlin policy and distribution tests exercise advancing identity, same-version replay,
changed bytes/signers, stale/future inspections, unverified signatures, every
prior-attempt state, recovery observations, wrong package and malformed digests.
Origin and canonical-byte tests also reject alternate origins, ambiguous URLs,
duplicate keys, malformed/oversized JSON and noncanonical formatting. These are
local implementation tests, not device installation or recovery evidence.

A15 closure also requires Android build/tests, explicit confirmation and
cancellation behavior, interrupted staging/session reconciliation, failed-install
handling, a genuine advancing signed candidate, independently verified installed
bytes/signer/version and local data preservation. Review receipts must distinguish
requested, awaiting user, cancelled, failed, unknown and verified observations.
No automatic rollback is inferred; Android downgrade restrictions and preserved
data contracts must govern any separately reviewed recovery procedure.

The proposed app-only visual observation feed is a separate permission and
implementation surface. A15 does not grant remote control, widen broker/native
registries, activate continuity schemas, or establish chain-live compatibility.


## Candidate and phone verification sequence

The bootstrap APK uses versionCode20, versionName `0.1.15-cew04-a15`, arc
`CE-W04-A15`. It requires the already verified persistent development signer;
no signer secret is stored in source. The human-authorized manual installation
of this bootstrap is separate from exercising A15's own installer. Keep the
A14.2 version19 artifact and evidence unchanged.

After exact build/signature/hash verification and copying the bootstrap to the
existing phone Downloads/Arcanum folder, the Human installs it manually. Capture
its artifact handoff identity, then confirm geometry and local data availability
without exporting private contents. In the A15 panel, inspect the historical
version19 URLs: expect `NOT_ADVANCING` and no install effect. Refresh must show
no attempt. Test wrong-origin rejection and dismiss both app confirmation dialogs.

A complete positive/session-recovery test requires a separately reviewed and
published advancing signed artifact above version20 with the A14 distribution
contract. It must not be fabricated from a same-version reinstall or version19
rollback. Once that artifact exists, test Android permission denial, request and
cancel, refresh/reconciliation, explicit settlement, interruption/restart, and a
successful update with independently verified installed identity. Bootstrap UI
checks alone cannot close A15.

Android user action follows the platform
[PackageInstaller SessionParams contract](https://developer.android.com/reference/android/content/pm/PackageInstaller.SessionParams#setRequireUserAction(int)):
API31+ explicitly uses `USER_ACTION_REQUIRED`; older supported Android uses the
confirmation behavior of `REQUEST_INSTALL_PACKAGES`. Android may decline a
background confirmation launch. The journal remains awaiting-user and the panel
can open the existing session details; it never submits a replacement session.
