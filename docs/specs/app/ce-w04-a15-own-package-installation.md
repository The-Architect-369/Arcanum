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
can reopen the original Android confirmation intent while that process-local
capability remains available. It never submits a replacement session. A process
restart loses that capability: the app retains the journal, observes the original
session and installed identity, and blocks reopening until the Human explicitly
cancels and settles the attempt. Session details are not a substitute for Android
installation confirmation.


## Dated bootstrap evidence and advancing test candidate

On 2026-10-01, the version20 bootstrap built at
`effa97cac76a1c142efe42248bd4a9d4f0ff515b` passed its exact-head CI. Its APK
SHA-256 is `e6b6f0a8c5e5c57f6e41e14c642cf1bfb0ecc0837d4f73a1ea89c7802cf29860`.
Independent signer verification matched the A14.2 development signer; the phone
copy and subsequently installed base APK matched those exact bytes. Screenshot
2299 showed the artifact handoff PASS; screenshot2303 showed the historical
version19 inspection rejected as NOT_ADVANCING with installPerformed=false.
Screenshot2309 showed an HTTPS example.com URL blocked, and screenshot2311
showed controlled URLs restored with version19 still rejected. These screenshots
are user-supplied visual evidence, not a direct observation of network traffic.
The Human also reported the no-stage request gate, no-attempt receipt and local
Hope reflection recall. Private reflection contents were not requested or read.

The advancing test candidate is versionCode21, versionName
`0.1.15-cew04-a15-verify`, arc `CE-W04-A15`. This advances identity solely to
exercise the installed version20 updater. Its build/signature/hash, controlled
publication and phone session evidence must be recorded before claiming the
positive path. Publication/main merge remains a separate review/effect gate;
no source change declares those effects complete. The exact version20 artifact
and its historical evidence remain preserved.

## 2026-10-01 pending-session recovery finding

User-supplied screenshots2313 through2323 show version21 staging, the Android
permission gate, Android confirmation, a cancelled callback with no remaining
session, and explicit settlement to no active attempt. Screenshots2325/2327
show a second attempt retained after reopening, with sessionPresent=true and
callbackState=AWAITING_USER. Screenshot2329 then reports an Android app crash
while testing the pending-session opening action; screenshot2331 retains the
same operation and pending state. The crash exception was not available from
the Termux crash-buffer probe. Independent installed APK hashing still matched
the exact version20 bootstrap afterward.

Inspection found the session-details activity launch was posted outside the
worker's exception boundary. The correction catches the launch on the UI thread
and reports a blocked result without changing or repeating the original attempt.
This correction compiles locally; it is not yet deployed or device-tested.
Session details do not establish that Android can resume its confirmation UI.
Pending-session opening and the successful advancing update remain unverified;
A15 stays open. Preserve the journal and reconcile before any new submission.

The recovery correction uses versionCode22, versionName
`0.1.15-cew04-a15-recovery`. The original confirmation is retained only in process
memory and bound to both operation ID and session ID. Resumption requires
AWAITING_USER, presence of the original owned session and unchanged predecessor
bytes. Terminal callbacks and explicit settlement clear the capability. No intent
is serialized into the journal. Both preparation errors and UI-thread activity
launch errors surface as blocked results. Pure tests cover ownership mismatch,
lost process memory, settlement revocation and replacement by a later attempt;
device confirmation/recovery tests remain required. Version21's published bytes
and manifest remain unchanged. A fixed source build is not merge, publication or
installation authorization.

Android's [session-details API contract](https://developer.android.com/reference/android/content/pm/PackageInstaller.SessionInfo#createDetailsIntent())
warns that a matching activity may not exist. This supports guarding the launch;
it does not establish the exact exception on this phone, whose crash log was
unavailable.

## 2026-10-01 installed baseline and corrected recovery verification

PR75's recovery implementation and PR76's controlled version22 publication are
merged. The exact signed APK source is
`8daaa135ad7997a154a9108d5e1b39ff2f114193`, promotion commit
`27207f2c2fa9ff48478fa1d49a37db6b6a175544`, publication commit
`7dad151d221fb092c1a0642373fbfdbb6dd30c3b`. Live A14.2 inspection passed for
the version22 manifest and APK. Supplied screenshots2337/2339 show version22
handoff PASS and operation `abfbb86d-9375-4723-919d-005687a18b10` with
TARGET_OBSERVED, sessionPresent=false and callbackState=VERIFIED. A later
read-only Termux observation independently confirmed the installed base APK's
SHA-256 `d5635af40241e526342a25c01bbb342cfae56ee9b3252a89aaac45cb094c1c10`.
The Human reported geometry, Hope reflection recall and Tempus still working;
no participant interior was read or exported. These dated execution observations
supplement the historical preparation records; they do not close A15.

The next verification candidate is versionCode23, versionName
`0.1.15-cew04-a15-recovery-verify`. Keep version22 installed to test its corrected
updater. The production failure classifier is extracted without changing its
documented mappings; targeted unit tests cover the known Android failure codes,
cancellation as a separate outcome, unknown/missing status, and the requirement
to reconcile before another submission. Unit-injected status evidence is not an
observed device failure callback. Publication and installation retain their own
Human authorization gates.

After the existing verified attempt is explicitly settled and a separately
verified version23 bundle is live:

1. Stage version23 and request it. At Android confirmation, press Home and reopen
   Architect without stopping the process. Refresh and retain the same operation
   ID and pending session; open the original confirmation, then cancel and record
   callback/session reconciliation. Settle explicitly.
2. Stage and request again. Leave confirmation pending, then use Android app
   settings to stop the app process without clearing data. Reopen and refresh the
   retained journal. Opening confirmation must be blocked when the original
   session or process-local capability is unavailable; no replacement session
   may be submitted. Record whether Android retained or removed the session.
   Record the original operation and session observation, then settle explicitly.
3. Stage a fresh advancing inspection and perform the Human-confirmed Android
   update. Verify version23 source/hash/signer and the original operation receipt,
   and repeat local preservation checks without disclosing private content.
4. Inspect the same installed version23 candidate after settlement: expect
   NOT_ADVANCING and no new attempt. Review interrupted-staging and failed-install
   coverage, including the limits of unit versus device observations, before
   preparing a separately authorized closure record. A15 remains open until that
   review accepts all required evidence.

## 2026-10-01 delayed session removal observed on the phone

Version22 successfully reopened the original version23 Android confirmation
without a replacement submission (screenshots2346/2348), then cancellation
reconciled the same operation and absent session (2350). After the Human-directed
process-stop sequence, operation `01472c2b-8121-4350-9683-34ed958a9a3d` remained
journaled with AWAITING_USER and sessionPresent=true (2354/2356); reopening was
blocked because the process-local original confirmation was unavailable (2358).
Explicit settlement produced No installation attempt (2360).

The Human reported needing two settlement actions. An empty-attempt check
(2362/2364/2366) and a cancelled-session check (2376/2378/2380) did not reproduce
the active-session timing issue. For original operation
`f4bf85d8-37db-43df-b422-963609831d8f`, screenshot2384 shows AWAITING_USER and
sessionPresent=true. The first confirmed settlement returned Session absence
not established (2386). Refresh then observed the same operation with CANCELLED
and sessionPresent=false (2388). A second explicit settlement and refresh showed
No installation attempt (2390). These observations establish removal completing
after the immediate absence check, while the journal was retained.

VersionCode24 / `0.1.15-cew04-a15-settlement` is the corrective candidate. Following
one explicit abandonment of the captured owned sessions, its worker observes
session absence for up to two seconds using a monotonic clock. It never repeats
abandonment or installation submission. If absence cannot be established, or
observation/wait fails, the journal remains and the result directs reconciliation
and explicit settlement. Archival still requires absent owned sessions and an
expected independently observed installed identity. Empty-attempt settlement
no longer claims to have archived a nonexistent attempt. Tests cover immediate
and delayed absence, the deadline, persistent presence, failed observation and
interruption. These are unit observations; corrected active-session settlement
still requires phone evidence on the installed corrective build.

Keep version22 installed during preparation. Version23's published files remain
unchanged. Merge, publication and installation keep their separate Human gates.
A15 remains open, including final update/data-preservation and failure-evidence
review. No participant private contents were read or exported.
