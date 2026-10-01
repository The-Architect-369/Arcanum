# A15 recovery candidate publication — prepared 2026-10-01

The Human Architect explicitly authorized merging PR75 and publishing the verified
version22 recovery candidate. PR75 merged as
`27207f2c2fa9ff48478fa1d49a37db6b6a175544`. The APK's independently observed
compiled source is `8daaa135ad7997a154a9108d5e1b39ff2f114193`, an ancestor of
that canonical main merge. The manifest records both identities separately.

APK versionCode22, versionName `0.1.15-cew04-a15-recovery`, package
`org.arcanum.nativehost`, minSdk26/targetSdk35 and arm64-v8a/x86_64 native
libraries match the successful exact-source signed build
[36828985464](https://github.com/The-Architect-369/Arcanum/actions/runs/36828985464),
artifact11146019465. The independently downloaded APK's SHA-256
`d5635af40241e526342a25c01bbb342cfae56ee9b3252a89aaac45cb094c1c10`
matches the CI packaging log. Size: 4632065 bytes. Android signature verification
confirmed exactly one signer with certificate SHA-256
`9841fbeda4d7d0c63b1663360fb0415218a08f063b5629317274076dfbb6b844`.
The APK is not rebuilt to change publication provenance.

The trust context uses the independently verified version20 predecessor, SHA-256
`e6b6f0a8c5e5c57f6e41e14c642cf1bfb0ecc0837d4f73a1ea89c7802cf29860`,
on phone API36. This observation precedes publication; it does not claim a fresh
device observation at deployment time. No private participant store was read.

This bundle publishes only exact files under `/updates/a15-recovery/`, routing
exceptions for their direct desktop/mobile responses and no-store/max-age0
headers. Earlier version19 and version21 files remain historical artifacts.
Publication checks, production deployment and live inspection are still pending
at this record's preparation; none is pre-asserted as completed.

The supplied phone screenshots showed cancellation/settlement and retained
pending-session state, then an Android app crash when opening session details.
The exact exception was unavailable. Version22 guards UI-thread activity launch,
retains only the original process-local Android confirmation bound to operation
and session, and blocks reopening after that capability is lost. It does not
recommit a session or invent missing receipts. Full device recovery remains
unverified. Existing pending work must be explicitly reconciled and settled
before any fresh submission; publishing a fixed APK does not modify the running
version20 implementation or its journal.

A15 remains open for corrected recovery, successful advancing installation,
failed-install handling and local data preservation evidence. Installing this
candidate is a separate Human action with Android confirmation. Testing its own
updater afterward requires a separately verified newer candidate. No rollback,
uninstall, data clearing, private-content export, broker expansion, visual feed
or chain-live compatibility is established by this publication.
