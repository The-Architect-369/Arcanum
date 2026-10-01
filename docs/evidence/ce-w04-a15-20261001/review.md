# A15 advancing verification bundle — prepared 2026-10-01

The Human Architect explicitly authorized PR73 merge and controlled publication
of the verified version21 test bundle. PR73 merged as
`52c7f4a4204617c80be5eb57995571329596b1d2`. Its exact checked APK source is
`58b420afde2038e1d718e2163c1bfa35c5a36369`, now an ancestor of canonical main.
The manifest distinguishes source from this observed promotion commit.

APK SHA-256: `ddd5dae5e8b1b217e02a9aeb9c587de1738b0918b525b5759261f27191ac345f`.
Android v2 signature independently verified with exactly one signer matching
`9841fbeda4d7d0c63b1663360fb0415218a08f063b5629317274076dfbb6b844`.
Package/version21/name, compiled source identity, minSdk26/targetSdk35 and
arm64-v8a/x86_64 packaging match the successful exact-head CI build
[36825506714](https://github.com/The-Architect-369/Arcanum/actions/runs/36825506714),
artifact11144409891. No APK is rebuilt merely to change hosting provenance.

The independently observed installed version20 predecessor still hashes to
`e6b6f0a8c5e5c57f6e41e14c642cf1bfb0ecc0837d4f73a1ea89c7802cf29860`.
Phone API36 and ABIs arm64-v8a/armeabi-v7a/armeabi were observed through Termux.
The accompanying trust context uses this predecessor and declared existing data
contracts; no private reflection/store contents were read. Version20 remains
installed so the application can exercise its own updater against version21.

This publication changes only exact files under `/updates/a15-verification/`,
the desktop/mobile exact-file routing exceptions and zero-age cache headers.
A14.2 files and the public download page's existing artifact remain unchanged.
The prepared production preview served all three files directly for desktop and
mobile with no-store/max-age0 and identical bytes; final publication still needs
exact-head checks, deployment and live A14.2 inspection. This record does not
pre-assert those effects or an A15 phone test pass.

The phone sequence is specified in the A15 contract: fresh advancing inspection,
Android permission/confirmation, cancellation, explicit settlement, restart
reconciliation, success/installed-byte verification and Human-confirmed local
preservation. User screenshots established version20 handoff and negative gates;
no positive PackageInstaller or recovery observation is claimed yet. A15 stays
open, final A14 closure remains conditional, and chain-live compatibility remains
unestablished. The near-live visual observation feed is outside this publication.
