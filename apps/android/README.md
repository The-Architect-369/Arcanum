# ARCnet Android Native Host

This is the CE-W02/W02.2 presentation-only Android leaf.

It consumes the canonical geometry and W02.1 projection registries directly from
`docs/specs/geometry` as Android assets. The Kotlin source does not own a copy of canonical
coordinates or expected projection values.

The shell intentionally contains no network permission and no Rust/JNI bridge. W02.3 owns the
later bounded native/runtime bridge.

## Verify

Repository-only checks:

```bash
pnpm verify:ce-w02
```

Native Android checks require JDK 17, Android SDK 35, and Gradle 8.9:

```bash
gradle -p apps/android testDebugUnitTest assembleDebug
```

The dedicated GitHub Actions workflow provisions those build dependencies independently.
