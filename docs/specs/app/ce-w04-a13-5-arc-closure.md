# CE-W04-A13.5 — Native Operator UX and Arc Closure

Status: implementation-candidate
Phase: Pre-Genesis
Era: Construction Era
Wave: CE-W04
Arc: CE-W04-A13.5
Certified predecessor: CE-W04-A13.4 at `a48d73bb489cd10281e32be87d156802ab0029c1`

## Purpose

CE-W04-A13.5 closes the CE-W04-A13 native mobile operator arc without adding runtime,
repository, governance, deployment, model, or autonomous authority.

A13.1 through A13.4 already established the complete native operator capability set:
canonical workspace discovery, zero-copy pairing, Human-triggered broker lifecycle, and
canonical workspace verification. A13.5 therefore adds no sixth operator command and no
new A11 broker action.

Its only implementation effect is native UX/provenance closure: the Architect surface
shows a self-contained receipt for the exact installed Android application so the Human can
bind the physical Seed Node Alpha app to the certified source/artifact without searching
for an artifact by filename or copying a digest through Termux.

## Frozen native operator registry

The Android → Termux operator registry remains exactly five compile-time IDs:

1. `probe_workspace`
2. `pair_native_client`
3. `start_broker`
4. `stop_broker`
5. `verify_workspace`

No A13.5 Termux operation is added.

The inherited Android A11 broker allowlist remains seven Human-approved actions, while the
backend broker registry remains eight including backend-only `web_typecheck`. A13.5 does
not widen either registry.

## Installed application handoff receipt

When the Human opens Architect, A13.5 performs one app-private, read-only inspection of
the installed application package.

The receipt is derived only from:

- `BuildConfig.ARCANUM_IMPLEMENTATION_ARC`;
- `BuildConfig.VERSION_NAME`;
- `BuildConfig.VERSION_CODE`;
- `BuildConfig.ARCANUM_SOURCE_COMMIT`;
- Android's own `applicationInfo.sourceDir` for this installed package.

A13.5 requires the source commit to be an exact lowercase 40-hex Git commit, requires the
compiled A13.5 provenance values, and computes SHA-256 directly over the installed APK
bytes with `MessageDigest.getInstance("SHA-256")`.

The receipt displays:

```text
A13.5 artifact handoff · PASS
arc=CE-W04-A13.5
version=0.1.13-cew04-a13-5 (18)
source=<exact 40-hex source commit>
installedApkSha256=<exact 64-hex digest>
operatorRegistry=5 fixed native operations
authorityEffect=none · repositoryMutation=false
```

No caller can provide an APK path, expected digest, source commit, registry value, or
command. The inspection does not write the repository, Termux state, pairing state, broker
state, Android package bytes, or an external report.

A non-exact source binding, wrong compiled arc/version, missing installed package path, or
hashing failure is shown as a local handoff failure. It does not trigger recovery,
installation, network access, repository mutation, or broker lifecycle.

## Human operator path

A13.5 presents the A13 capability set as one bounded mobile workflow while preserving the
existing confirmation boundaries:

```text
Architect
→ installed artifact handoff receipt
→ Connect local workspace
→ Verify local workspace
→ Pair native client (only when needed)
→ Start local broker
→ Check local broker
→ Choose one authenticated registered action or review one A12 proposal envelope
→ Stop local broker
```

The UI never chains these effects automatically. Pairing does not auto-start the broker;
starting the broker does not approve a broker action; workspace verification does not
require pairing or a broker; stopping the broker does not clear pairing.

After one-time Termux setup and installation of the certified APK, routine operation
requires no copied shell command, no copied pairing secret, and no manual artifact search.

## Authority ceiling

A13.5 adds no operator or broker execution capability.

Forbidden:

- arbitrary shell or caller-selected argv;
- caller-selected executable, repository, APK path, or environment;
- Git staging, commit, reset, checkout, merge, rebase, fetch, pull, push, or clean;
- proposal application;
- artifact installation or self-update;
- autonomous broker startup or shutdown;
- autonomous broker-action approval;
- widening the A11 broker registry;
- model-provider invocation;
- production deployment.

Every successful handoff receipt states `authorityEffect=none` and
`repositoryMutation=false`.

## Android provenance

- `versionCode = 18`
- `versionName = 0.1.13-cew04-a13-5`
- `ARCANUM_IMPLEMENTATION_ARC = CE-W04-A13.5`

The exact-head Android workflow already injects `ARCANUM_SOURCE_COMMIT` from the checked-out
Git SHA. A13.5 consumes that compile-time fact; it does not introduce another provenance
channel.

## Arc closure certification target

CE-W04-A13 may be marked closed only after all of the following pass on one exact indexed
A13.5 head:

1. exact certified A13.4 ancestry from `a48d73bb489cd10281e32be87d156802ab0029c1`;
2. frozen A12 regression remains green;
3. native operator registry remains exactly five;
4. Android A11 broker allowlist/backend registry remain unchanged;
5. A13.5 Android provenance is exact;
6. app-private installed APK SHA-256 receipt compiles and is reachable from Architect;
7. canonical `scripts/verify-sync.sh` passes;
8. exact-head GitHub CI and Vercel preview pass;
9. exact-head APK artifact digest is recorded;
10. physical Seed Node Alpha handoff receipt reports the exact source commit and installed
    APK digest matching the certified artifact;
11. the final installed build still demonstrates canonical workspace connection,
    `verify_workspace` 15/15, native pairing continuity, authenticated broker start/check,
    and owned broker stop without copied shell or secret material.

A13.5 closure closes CE-W04-A13 only. It does not promote `main`, close CE-W04 itself,
grant Genesis authority, or authorize production deployment.
