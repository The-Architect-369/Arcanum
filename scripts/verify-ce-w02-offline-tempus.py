#!/usr/bin/env python3
"""Deterministic CE-W02 W02.4 offline Tempus lifecycle verifier using only stdlib."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SAFE = ROOT / "runtime/arcanum-android-lifecycle"
JNI = ROOT / "runtime/arcanum-android-lifecycle-jni"
ANDROID = ROOT / "apps/android"
SPEC = ROOT / "docs/specs/runtime"


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def verify() -> None:
    schema = load_json(SPEC / "android-offline-tempus-lifecycle.schema.json")
    registry = load_json(SPEC / "android-offline-tempus-lifecycle.v0.1.json")
    safe_rust = text(SAFE / "src/lib.rs")
    safe_cargo = text(SAFE / "Cargo.toml")
    jni_rust = text(JNI / "src/lib.rs")
    jni_cargo = text(JNI / "Cargo.toml")
    old_jni_rust = text(ROOT / "runtime/arcanum-android-jni/src/lib.rs")
    old_native_bridge = text(
        ANDROID / "app/src/main/java/org/arcanum/nativehost/runtime/NativeRuntimeBridge.kt"
    )
    contract = text(
        ANDROID / "app/src/main/java/org/arcanum/nativehost/runtime/TempusLifecycleContract.kt"
    )
    native = text(
        ANDROID / "app/src/main/java/org/arcanum/nativehost/runtime/TempusLifecycleBridge.kt"
    )
    coordinator = text(
        ANDROID / "app/src/main/java/org/arcanum/nativehost/runtime/TempusLifecycleCoordinator.kt"
    )
    tests = text(
        ANDROID / "app/src/test/java/org/arcanum/nativehost/runtime/TempusLifecycleContractTest.kt"
    )
    main_activity = text(ANDROID / "app/src/main/java/org/arcanum/nativehost/MainActivity.kt")
    renderer = text(
        ANDROID / "app/src/main/java/org/arcanum/nativehost/geometry/ArcnetRendererView.kt"
    )
    manifest = text(ANDROID / "app/src/main/AndroidManifest.xml")
    workflow = text(ROOT / ".github/workflows/verify-android-offline-tempus.yml")
    package = load_json(ROOT / "package.json")

    # F45 — separate safe lifecycle boundary; W02.3 remains intact.
    require(schema["additionalProperties"] is False, "F45 closed root schema")
    require(
        registry["inheritedFalsificationIds"] == [f"F{i}" for i in range(1, 45)],
        "F45 inherits F1-F44",
    )
    require(
        registry["falsificationIds"] == [f"F{i}" for i in range(45, 53)],
        "F45 declares F45-F52",
    )
    require("#![forbid(unsafe_code)]" in safe_rust, "F45 safe lifecycle forbids unsafe code")
    require(
        'arcanum-runtime = { path = "../arcanum-runtime" }' in safe_cargo,
        "F45 safe lifecycle depends on canonical runtime",
    )
    require('sha2 = "=0.10.9"' in safe_cargo, "F45 pinned SHA-256 provider")
    require(
        'arcanum-android-lifecycle = { path = "../arcanum-android-lifecycle" }' in jni_cargo,
        "F45 lifecycle JNI depends on safe facade",
    )
    require(
        'jni = { version = "=0.21.1", default-features = false }' in jni_cargo,
        "F45 pinned JNI helper confined to lifecycle shim",
    )
    root_verify = package["scripts"]["verify:ce-w02"]
    expected_prefix = (
        "pnpm verify:ce-w01 && python3 scripts/verify-ce-w02-projection.py "
        "&& python3 scripts/verify-ce-w02-native-shell.py "
        "&& python3 scripts/verify-ce-w02-native-bridge.py "
        "&& python3 scripts/verify-ce-w02-offline-tempus.py"
    )
    require(
        root_verify == expected_prefix or root_verify.startswith(expected_prefix + " && "),
        "F45 root CE-W02 verification prefix",
    )

    # F46 — app-private storage root; Kotlin retains only an opaque pointer.
    require("context.filesDir.absolutePath" in coordinator, "F46 Android app-private filesDir root")
    require("getSharedPreferences" in coordinator, "F46 host pointer storage")
    require('KEY_LAST_ANCHOR_ID = "last_anchor_id"' in coordinator, "F46 opaque last-anchor pointer")
    require("FileTempusAnchorStore::open" in safe_rust, "F46 canonical Tempus anchor store")
    require("store.persist(&anchor)" in safe_rust and "store.load(anchor_id)" in safe_rust, "F46 Rust owns anchor persistence")
    require("android.permission.INTERNET" not in manifest, "F46 no INTERNET permission")
    require("Environment.getExternalStorageDirectory" not in coordinator, "F46 no external storage")
    require(registry["storage"]["kotlinPersistsAnchorContent"] is False, "F46 Kotlin does not persist anchor content")
    require(registry["storage"]["externalStorage"] is False, "F46 registry no external storage")

    # F47 — canonical clock capture; UUID is identifier-only.
    require("capture_tempus_anchor" in safe_rust, "F47 canonical capture function")
    require("SystemClockProvider" in safe_rust, "F47 canonical system clock provider")
    require("SystemTime" not in safe_rust and "UNIX_EPOCH" not in safe_rust, "F47 no duplicate clock implementation")
    require("UUID.randomUUID()" in coordinator, "F47 host-local opaque identifier")
    require(registry["capture"]["collectsLocation"] is False, "F47 no location collection")

    # F48 — persistence equality and fail-closed recovery.
    require("if loaded != anchor" in safe_rust, "F48 persist/load equality")
    require("recover_tempus_anchor" in safe_rust, "F48 explicit recovery function")
    require("if (priorAnchorId != null)" in coordinator, "F48 restart pointer branch")
    recovery_branch = coordinator.split("if (priorAnchorId != null)", 1)[1].split("val anchorId =", 1)[0]
    require("TempusLifecycleBridge.recover" in recovery_branch, "F48 recovery uses prior ID")
    require("UUID.randomUUID" not in recovery_branch, "F48 recovery failure cannot auto-replace")
    require(registry["recovery"]["autoReplaceOnRecoveryFailure"] is False, "F48 registry fail-closed recovery")
    require(registry["recovery"]["requiresNetwork"] is False, "F48 recovery offline")

    # F49 — actual local unsigned receipt after persistence.
    require("create_tempus_local_receipt" in safe_rust, "F49 canonical receipt constructor")
    require("Sha256" in safe_rust, "F49 SHA-256 content digest")
    require("SigningFailure::Unavailable" in safe_rust, "F49 explicit signing unavailability")
    require("receipt.scope != LOCAL_RECEIPT_SCOPE" in safe_rust, "F49 local scope assertion")
    require("receipt.is_signed()" in safe_rust, "F49 signed-state assertion")
    require("receipt={}/{}" in safe_rust, "F49 visible receipt scope/signed-state template")
    require("LOCAL_RECEIPT_SCOPE" in safe_rust, "F49 local receipt scope source")
    require('"unsigned"' in safe_rust, "F49 visible unsigned state")
    require(registry["receipt"]["scope"] == "local", "F49 registry local receipt")
    require(registry["receipt"]["hostSigningCapability"] is False, "F49 no host signing capability")
    require(registry["receipt"]["privateKeyExposure"] is False, "F49 no private key exposure")
    require(registry["receipt"]["persistedInW02_4"] is False, "F49 receipt persistence deferred")

    # F50 — separate bounded managed-string JNI; W02.3 stays literally narrow.
    require(jni_rust.count("#[unsafe(no_mangle)]") == 4, "F50 exactly four lifecycle JNI exports")
    require("unsafe {" not in jni_rust and "unsafe fn" not in jni_rust, "F50 lifecycle JNI no unsafe blocks/functions")
    require(native.count("external fun") == 4, "F50 exactly four lifecycle Kotlin native methods")
    require('System.loadLibrary("arcanum_android_lifecycle_jni")' in native, "F50 lifecycle library name")
    for method in registry["abi"]["exportedMethods"]:
        require(f"fun {method}" in native, f"F50 Kotlin lifecycle method {method}")
    require(old_jni_rust.count("#[unsafe(no_mangle)]") == 3, "F50 W02.3 JNI remains three exports")
    require(old_native_bridge.count("external fun") == 3, "F50 W02.3 Kotlin bridge remains three methods")
    require(registry["abi"]["domainObjectCrossesJni"] is False, "F50 no domain object across JNI")

    # F51 — presentation remains geometry-independent and authority-free.
    require("runCatching { TempusLifecycleCoordinator(this).resumeOrCapture() }" in main_activity, "F51 lifecycle failure bounded")
    require("ArcnetRendererView(this, bridgeLabel, lifecycleLabel)" in main_activity, "F51 geometry always constructed")
    require("runtimeLifecycleLabel" in renderer, "F51 renderer receives lifecycle presentation")
    require(
        renderer.index("canvas.drawText(runtimeLifecycleLabel") < renderer.index("contractsResult.getOrElse"),
        "F51 lifecycle text precedes geometry contract evaluation",
    )
    require("authorityEffect=none" in contract or "AUTHORITY_SUFFIX" in contract, "F51 Kotlin authority firewall")
    require(registry["presentation"]["geometryGatesLifecycle"] is False, "F51 registry geometry independence")
    require(registry["presentation"]["authorityEffect"] == "none", "F51 presentation authority effect")
    require(registry["authorityEffect"] == "none", "F51 root authority effect")

    # F52 — cross-ABI evidence and no network/protocol expansion.
    for token in (
        "arm64-v8a",
        "x86_64",
        'toolchain: "1.98.1"',
        "cargo-ndk --version 4.1.2",
        "runtime/arcanum-android-jni",
        "runtime/arcanum-android-lifecycle-jni",
        "llvm-nm",
        "assembleDebug",
        "libarcanum_android_jni.so",
        "libarcanum_android_lifecycle_jni.so",
    ):
        require(token in workflow, f"F52 workflow evidence {token}")
    combined_source = "\n".join((safe_rust, jni_rust, native, coordinator, main_activity, renderer, tests))
    for pattern in (
        r"\bOkHttp\b",
        r"\bRetrofit\b",
        r"\breqwest\b",
        r"\bTcpStream\b",
        r"\bUdpSocket\b",
        r"protocolSubmit",
        r"protocolFinality",
        r"exportPrivateKey",
    ):
        require(re.search(pattern, combined_source, flags=re.IGNORECASE) is None, f"F52 forbidden surface {pattern}")
    require(all(value in registry["forbiddenCapabilities"] for value in ("network", "protocol-submit", "protocol-finality", "private-key-export")), "F52 forbidden capability registry")
    require(registry["androidBuild"]["commitNativeBinaries"] is False, "F52 no committed native binaries")

    print("✅ CE-W02 offline Tempus lifecycle verification passed: F45-F52")


if __name__ == "__main__":
    verify()
