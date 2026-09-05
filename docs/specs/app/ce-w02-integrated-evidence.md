# CE-W02 Integrated Evidence — W02.5

Status: implementation-candidate
Construction Era: CE-W02 / W02.5
Authority effect: none

## Purpose

W02.5 closes CE-W02 by proving that the ratified projection contract, native Android host,
bounded Rust/JNI bridge, and offline Tempus lifecycle coexist as one native host without
widening any earlier capability or authority boundary.

This tranche is verification-only. It does not redefine Geometry v0.1, the W02.1 projection
contract, W02.2 rendering behavior, W02.3 JNI ABI, W02.4 persistence/recovery semantics, or
any protocol/economic/governance rule.

## Canonical base

W02.5 begins from:

`main@e05dbf6cb5ce3b819512dbde1fff29cea12571d8`

That commit is the verified canonical W02.4 merge.

## Integrated composition

```text
canonical geometry + W02.1 projection
                ↓
       W02.2 Android host
          ↙             ↘
W02.3 bounded ABI    W02.4 offline lifecycle
          ↓             ↓
   primitive status   capture / persist / recover
          ↘             ↙
       one Android installation
                ↓
       integrated evidence
```

The geometry surface remains independently renderable. Runtime bridge status and Tempus
lifecycle controls remain geometry-free operational surfaces.

## Authority and capability firewall

Integrated evidence must fail if any of the following becomes true:

- geometry gates runtime or lifecycle access;
- Android gains a network permission for CE-W02 behavior;
- a private key or signing capability crosses the native boundary;
- local receipt presentation claims protocol finality;
- recovery captures replacement temporal truth after missing/corrupt state;
- runtime domain objects cross JNI;
- visual position creates identity, capability, governance, economic, recognition, or
  protocol authority.

`authorityEffect` remains `none`.

## Native packaging

The final host must package both certified native libraries for both required ABIs:

- `arm64-v8a`
- `x86_64`

Libraries:

- `libarcanum_android_jni.so` — exactly three W02.3 JNI exports;
- `libarcanum_android_tempus_lifecycle_jni.so` — exactly two W02.4 JNI exports.

Generated native binaries remain outside Git history.

## Falsification range

W02.5 inherits F1–F52 and reserves F53–F60.

- **F53 — chain closure:** bind the four live CE-W02 component registries and exact
  falsification ranges.
- **F54 — geometry/host composition:** preserve geometry-free runtime/lifecycle operation
  and `authorityEffect=none`.
- **F55 — ABI coexistence:** preserve the separate three-export W02.3 ABI and two-export
  W02.4 lifecycle ABI without domain-object leakage.
- **F56 — offline/authority firewall:** preserve no-INTERNET, no-network-required, and
  no-authority capability ceilings.
- **F57 — restart recovery:** prove app-private opaque recovery references, Rust-owned
  persistence, and fail-closed no-replacement recovery.
- **F58 — native packaging:** build both native libraries for both ABIs, verify exact JNI
  symbol sets, and verify APK packaging.
- **F59 — integrated source evidence:** carry F1–F60, doctrine, Rust fmt/clippy/tests,
  Android tests/assemble, and web lint/typecheck/build in one exact-source workflow.
- **F60 — promotion discipline:** require deterministic source/index separation, merge-commit
  preservation, final-head Verify Sync/Architect/Vercel evidence, and issue closure only after
  canonical merge.

## Evidence surfaces

Machine contract:

- `docs/specs/app/ce-w02-integrated-evidence.schema.json`
- `docs/specs/app/ce-w02-integrated-evidence.v0.1.json`

Source verifier:

- `scripts/verify-ce-w02-integrated.py`
- `pnpm verify:ce-w02:integrated`

CI:

- `.github/workflows/verify-ce-w02-integrated.yml`

The integrated source workflow intentionally does not generate the deterministic repository
index. The index is generated only after exact substantive source certification, committed as
a separate companion, and then verified by repository-wide final-head gates.

## Closure law

CE-W02 issue #42 may close only after:

1. W02.5 substantive source is independently green;
2. the deterministic repository index is generated from that exact source and committed
   separately;
3. exact indexed-head GitHub and Vercel gates are green;
4. the source/index pair is promoted with a merge commit;
5. canonical `main` and the merge parents are independently verified.

Until then, CE-W02 remains open.
