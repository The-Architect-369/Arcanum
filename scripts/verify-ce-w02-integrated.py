#!/usr/bin/env python3
"""Deterministic CE-W02 W02.5 integrated-evidence verifier using stdlib only."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "apps" / "android"
SPEC_APP = ROOT / "docs" / "specs" / "app"
SPEC_GEOM = ROOT / "docs" / "specs" / "geometry"
SPEC_RUNTIME = ROOT / "docs" / "specs" / "runtime"


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def verify() -> None:
    schema = load_json(SPEC_APP / "ce-w02-integrated-evidence.schema.json")
    registry = load_json(SPEC_APP / "ce-w02-integrated-evidence.v0.1.json")
    projection = load_json(SPEC_GEOM / "arcnet-screen-projection.v0.1.json")
    host = load_json(SPEC_APP / "android-geometric-host.v0.1.json")
    bridge = load_json(SPEC_RUNTIME / "android-runtime-bridge.v0.1.json")
    lifecycle = load_json(SPEC_RUNTIME / "android-tempus-lifecycle.v0.1.json")

    package = load_json(ROOT / "package.json")
    workflow = text(ROOT / ".github" / "workflows" / "verify-ce-w02-integrated.yml")
    manifest = text(APP / "app" / "src" / "main" / "AndroidManifest.xml")
    main_activity = text(APP / "app/src/main/java/org/arcanum/nativehost/MainActivity.kt")
    runtime_bridge = text(
        APP / "app/src/main/java/org/arcanum/nativehost/runtime/NativeRuntimeBridge.kt"
    )
    lifecycle_bridge = text(
        APP / "app/src/main/java/org/arcanum/nativehost/tempus/TempusLifecycleBridge.kt"
    )
    lifecycle_panel = text(
        APP / "app/src/main/java/org/arcanum/nativehost/tempus/TempusLifecyclePanel.kt"
    )
    lifecycle_rust = text(ROOT / "runtime/arcanum-android-tempus-lifecycle/src/lib.rs")

    # F53 — close the falsification chain and bind the four ratified CE-W02 components.
    require(
        schema["$id"] == "urn:arcanum:ce-w02:integrated-evidence:0.1.0",
        "F53 schema ID",
    )
    require(schema["additionalProperties"] is False, "F53 closed root schema")
    require(
        registry["constructionEra"] == "CE-W02" and registry["tranche"] == "W02.5",
        "F53 tranche identity",
    )
    require(
        registry["inheritedFalsificationIds"] == [f"F{i}" for i in range(1, 53)],
        "F53 inherits F1-F52",
    )
    require(
        registry["falsificationIds"] == [f"F{i}" for i in range(53, 61)],
        "F53 declares F53-F60",
    )
    component_expectations = {
        "projection": (
            SPEC_GEOM / "arcnet-screen-projection.v0.1.json",
            list(range(21, 31)),
            projection,
        ),
        "nativeHost": (
            SPEC_APP / "android-geometric-host.v0.1.json",
            list(range(31, 37)),
            host,
        ),
        "runtimeBridge": (
            SPEC_RUNTIME / "android-runtime-bridge.v0.1.json",
            list(range(37, 45)),
            bridge,
        ),
        "tempusLifecycle": (
            SPEC_RUNTIME / "android-tempus-lifecycle.v0.1.json",
            list(range(45, 53)),
            lifecycle,
        ),
    }
    for name, (path, ids, loaded) in component_expectations.items():
        require(path.is_file(), f"F53 live component registry {name}")
        require(
            registry["components"][name]["registry"] == str(path.relative_to(ROOT)),
            f"F53 registry path {name}",
        )
        expected = [f"F{i}" for i in ids]
        require(
            registry["components"][name]["falsificationIds"] == expected,
            f"F53 declared range {name}",
        )
        require(loaded["falsificationIds"] == expected, f"F53 live range {name}")

    # F54 — integrate projection + host without allowing geometry to gate runtime/lifecycle.
    require(projection["authorityEffect"] == "none", "F54 projection authority firewall")
    require(
        projection["geometryFreeEquivalentRequired"] is True,
        "F54 projection geometry-free equivalent",
    )
    require(host["authorityEffect"] == "none", "F54 host authority firewall")
    require(
        host["geometryFreeEquivalentRequired"] is True,
        "F54 host geometry-free equivalent",
    )
    integration = registry["integration"]
    require(integration["authorityEffect"] == "none", "F54 integrated authority firewall")
    require(integration["geometryGatesRuntime"] is False, "F54 geometry does not gate runtime")
    require(
        integration["geometryGatesLifecycle"] is False,
        "F54 geometry does not gate lifecycle",
    )
    require(
        "setContentView(ArcnetRendererView(this, bridgeLabel))" in main_activity,
        "F54 geometry surface remains canonical",
    )
    require(
        "TempusLifecyclePanel(this)" in main_activity and "addContentView(" in main_activity,
        "F54 lifecycle surface remains separate",
    )

    # F55 — coexistence keeps W02.3 and W02.4 on distinct bounded JNI ABIs.
    require(bridge["abi"]["library"] == "arcanum_android_jni", "F55 W02.3 library")
    require(len(bridge["abi"]["exportedMethods"]) == 3, "F55 W02.3 three exports")
    require(
        lifecycle["abi"]["library"] == "arcanum_android_tempus_lifecycle_jni",
        "F55 W02.4 library",
    )
    require(len(lifecycle["abi"]["exportedMethods"]) == 2, "F55 W02.4 two exports")
    require(lifecycle["abi"]["separateFromW02_3"] is True, "F55 separate JNI surfaces")
    require(
        lifecycle["abi"]["returnsRuntimeDomainObjects"] is False,
        "F55 no runtime domain objects returned",
    )
    require(runtime_bridge.count("external fun") == 3, "F55 Kotlin W02.3 three methods")
    require(lifecycle_bridge.count("external fun") == 2, "F55 Kotlin W02.4 two methods")
    require(
        "TempusAnchor" not in runtime_bridge and "TempusAnchor" not in lifecycle_bridge,
        "F55 no TempusAnchor across Kotlin JNI",
    )
    require(
        registry["nativePackaging"]["libraries"]
        == [
            {"name": "libarcanum_android_jni.so", "exportedMethods": 3},
            {"name": "libarcanum_android_tempus_lifecycle_jni.so", "exportedMethods": 2},
        ],
        "F55 integrated native libraries",
    )

    # F56 — the composed host remains offline and authority-neutral.
    require("<uses-permission" not in manifest.lower(), "F56 Android manifest has no permissions")
    require("android.permission.internet" not in manifest.lower(), "F56 no INTERNET permission")
    require(
        bridge["capabilities"]["allowed"] == ["tempus-system-clock-probe"],
        "F56 bounded W02.3 capability",
    )
    require("network" in bridge["capabilities"]["forbidden"], "F56 W02.3 network forbidden")
    require(lifecycle["storage"]["networkRequired"] is False, "F56 lifecycle storage offline")
    require(lifecycle["recovery"]["networkRequired"] is False, "F56 lifecycle recovery offline")
    require(lifecycle["authorityEffect"] == "none", "F56 lifecycle authority firewall")
    require(integration["networkRequired"] is False, "F56 integrated network-free")
    require(
        all(value is False for value in registry["capabilityCeiling"].values()),
        "F56 integrated capability ceiling",
    )

    # F57 — restart/recovery is Rust-owned, opaque to Kotlin, and fails closed.
    recovery = registry["restartRecovery"]
    require(recovery["runtimeStore"] == "FileTempusAnchorStore", "F57 certified runtime store")
    require(
        recovery["kotlinPersistsOnlyOpaqueAnchorId"] is True,
        "F57 opaque Kotlin anchor reference",
    )
    require(recovery["captureOnRecoveryFailure"] is False, "F57 no replacement capture")
    require(recovery["receiptReissuedOnRecovery"] is False, "F57 no recovery receipt reissue")
    require(recovery["networkRequired"] is False, "F57 recovery remains offline")
    require(
        lifecycle["storage"]["kotlinPersistsOnlyOpaqueAnchorId"] is True,
        "F57 lifecycle registry opaque reference",
    )
    require(lifecycle["recovery"]["captureOnMissing"] is False, "F57 lifecycle registry fail-closed")
    require(
        "LAST_ANCHOR_ID_KEY" in lifecycle_panel and "context.filesDir" in lifecycle_panel,
        "F57 Android app-private recovery",
    )
    require(
        "missing_anchor_fails_closed_without_replacement_capture" in lifecycle_rust,
        "F57 Rust fail-closed test",
    )
    require("receipt: None" in lifecycle_rust, "F57 recovery does not mint a receipt")

    # F58 — both native libraries have deterministic dual-ABI symbol and APK evidence.
    packaging = registry["nativePackaging"]
    require(packaging["abis"] == ["arm64-v8a", "x86_64"], "F58 exact ABI set")
    require(packaging["commitNativeBinaries"] is False, "F58 generated native binaries stay out of Git")
    require(packaging["apkEvidenceRequired"] is True, "F58 APK evidence required")
    for token in (
        "-t arm64-v8a",
        "-t x86_64",
        "libarcanum_android_jni.so",
        "libarcanum_android_tempus_lifecycle_jni.so",
        "Java_org_arcanum_nativehost_runtime_NativeRuntimeBridge_nativeAbiVersion",
        "Java_org_arcanum_nativehost_runtime_NativeRuntimeBridge_nativeCapabilityMask",
        "Java_org_arcanum_nativehost_runtime_NativeRuntimeBridge_nativeTempusClockProbe",
        "Java_org_arcanum_nativehost_tempus_TempusLifecycleBridge_nativeCapturePersist",
        "Java_org_arcanum_nativehost_tempus_TempusLifecycleBridge_nativeRecover",
        "unzip -l",
    ):
        require(token in workflow, f"F58 integrated native evidence {token}")

    # F59 — one exact-source workflow carries machine contracts, Rust, Android, doctrine, and web.
    evidence = registry["repositoryEvidence"]
    require(
        evidence["workflow"] == ".github/workflows/verify-ce-w02-integrated.yml",
        "F59 workflow path",
    )
    for token in (
        "pnpm verify:ce-w02:integrated",
        "bash scripts/doctrine-guard.sh",
        "cargo fmt --manifest-path runtime/arcanum-runtime/Cargo.toml",
        "cargo clippy --manifest-path runtime/arcanum-runtime/Cargo.toml",
        "cargo test --manifest-path runtime/arcanum-runtime/Cargo.toml",
        "runtime/arcanum-android-bridge/Cargo.toml",
        "runtime/arcanum-android-tempus-lifecycle/Cargo.toml",
        "runtime/arcanum-android-jni/Cargo.toml",
        "runtime/arcanum-android-tempus-lifecycle-jni/Cargo.toml",
        "gradle -p apps/android testDebugUnitTest assembleDebug --stacktrace",
        "pnpm lint",
        "pnpm typecheck",
        "pnpm build",
    ):
        require(token in workflow, f"F59 integrated workflow gate {token}")
    require('toolchain: "1.98.1"' in workflow, "F59 pinned Rust")
    require("cargo-ndk --version 4.1.2" in workflow, "F59 pinned cargo-ndk")
    require('gradle-version: "8.9"' in workflow, "F59 pinned Gradle")
    require('node-version: "24"' in workflow, "F59 pinned Node major")
    require(
        evidence["verifySyncRequiredForPromotion"] is True,
        "F59 Verify Sync remains final-head gate",
    )
    require(
        all(
            evidence[key] is True
            for key in ("doctrineGuard", "architectEvidence", "webLint", "webTypecheck", "webBuild")
        ),
        "F59 repository evidence set",
    )

    # F60 — deterministic source/index promotion remains external to source verification.
    promotion = registry["promotion"]
    require(promotion["deterministicIndexCompanionRequired"] is True, "F60 deterministic index required")
    require(promotion["sourceIndexSeparationRequired"] is True, "F60 source/index separation required")
    require(promotion["mergeMethod"] == "merge", "F60 merge-commit preservation")
    require(
        promotion["closeIssueOnlyAfterCanonicalMerge"] is True,
        "F60 issue closes only after canonical merge",
    )
    require(evidence["vercelRequiredForPromotion"] is True, "F60 Vercel remains provider gate")
    require("scripts/repo-index.sh" not in workflow, "F60 source workflow does not mutate deterministic index")
    require(
        package["scripts"]["verify:ce-w02:integrated"]
        == "pnpm verify:ce-w02 && python3 scripts/verify-ce-w02-integrated.py",
        "F60 integrated verifier closes W02.5 after F1-F52",
    )

    print("✅ CE-W02 integrated evidence verification passed: F53-F60")


if __name__ == "__main__":
    verify()
