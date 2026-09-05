# ARCnet Android Native Host

This Android leaf is the CE-W02 native host. Its layers remain deliberately separate:

- W02.2: canonical geometry/projection renderer;
- W02.3: bounded primitive Rust bridge;
- W02.4: offline Tempus capture/persistence/recovery and visibly local receipt presentation.

Canonical geometry and projection registries remain source-owned under `docs/specs/geometry` and
are consumed directly as Android assets. Kotlin does not own copied coordinates or expected
projection values.

The host has no network permission. W02.4 uses Android app-private `filesDir` only as the root for
the Rust `FileTempusAnchorStore`; Kotlin stores only an opaque last-anchor reference so a later
process start can request recovery. Recovery failure is surfaced and does not silently create a
replacement anchor.

W02.3's original three-probe JNI library remains unchanged. W02.4 adds a separate lifecycle JNI
library; no runtime domain object, private key, signing capability, protocol finality, governance
weight, economic entitlement, or geometric authority crosses either boundary.

## Verify

Repository-only checks:

```bash
pnpm verify:ce-w02
```

Native Android checks require JDK 17, Android SDK 35, and Gradle 8.9. W02.4's dedicated workflow
also provisions Android NDK 27.2, Rust 1.98.1, and cargo-ndk 4.1.2, builds both native libraries for
`arm64-v8a` and `x86_64`, and verifies their APK packaging.
