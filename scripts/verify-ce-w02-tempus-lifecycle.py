#!/usr/bin/env python3
"""Deterministic CE-W02 W02.4 offline Tempus lifecycle verifier using stdlib only."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / "runtime" / "arcanum-runtime"
W02_3_BRIDGE = ROOT / "runtime" / "arcanum-android-bridge"
W02_3_JNI = ROOT / "runtime" / "arcanum-android-jni"
LIFECYCLE = ROOT / "runtime" / "arcanum-android-tempus-lifecycle"
LIFECYCLE_JNI = ROOT / "runtime" / "arcanum-android-tempus-lifecycle-jni"
ANDROID = ROOT / "apps" / "android"
SPEC = ROOT / "docs" / "specs" / "runtime"


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def verify() -> None:
    schema = load_json(SPEC / "android-tempus-lifecycle.schema.json")
    registry = load_json(SPEC / "android-tempus-lifecycle.v0.1.json")
    lifecycle_rust = text(LIFECYCLE / "src" / "lib.rs")
    lifecycle_cargo = text(LIFECYCLE / "Cargo.toml")
    lifecycle_jni_rust = text(LIFECYCLE_JNI / "src" / "lib.rs")
    lifecycle_jni_cargo = text(LIFECYCLE_JNI / "Cargo.toml")
    old_bridge_rust = text(W02_3_BRIDGE / "src" / "lib.rs")
    old_jni_rust = text(W02_3_JNI / "src" / "lib.rs")
    native_bridge = text(
        ANDROID
        / "app/src/main/java/org/arcanum/nativehost/runtime/NativeRuntimeBridge.kt"
    )
    lifecycle_contract = text(
        ANDROID
        / "app/src/main/java/org/arcanum/nativehost/tempus/TempusLifecycleContract.kt"
    )
    lifecycle_bridge = text(
        ANDROID
        / "app/src/main/java/org/arcanum/nativehost/tempus/TempusLifecycleBridge.kt"
    )
    lifecycle_panel = text(
        ANDROID
        / "app/src/main/java/org/arcanum/nativehost/tempus/TempusLifecyclePanel.kt"
    )
    lifecycle_test = text(
        ANDROID
        / "app/src/test/java/org/arcanum/nativehost/tempus/TempusLifecycleContractTest.kt"
    )
    main_activity = text(
        ANDROID / "app/src/main/java/org/arcanum/nativehost/MainActivity.kt"
    )
    manifest = text(ANDROID / "app/src/main/AndroidManifest.xml")
    workflow = text(ROOT / ".github/workflows/verify-android-tempus-lifecycle.yml")
    package = load_json(ROOT / "package.json")
    gitignore = text(ROOT / ".gitignore")

    # F45 — inherit F1-F44 and freeze the certified W02.3 three-probe ABI.
    require(schema["additionalProperties"] is False, "F45 closed root schema")
    require(
        registry["inheritedFalsificationIds"] == [f"F{i}" for i in range(1, 45)],
        "F45 inherited F1-F44",
    )
    require(
        registry["falsificationIds"] == [f"F{i}" for i in range(45, 53)],
        "F45 declares F45-F52",
    )
    require(old_jni_rust.count("#[unsafe(no_mangle)]") == 3, "F45 old JNI still exactly three exports")
    require(native_bridge.count("external fun") == 3, "F45 Kotlin W02.3 bridge still exactly three methods")
    require("CAP_TEMPUS_SYSTEM_CLOCK_PROBE" in old_bridge_rust, "F45 W02.3 capability probe preserved")
    require(registry["w02_3BridgeFrozen"]["exportedMethodCount"] == 3, "F45 registry freezes W02.3 method count")

    # F46 — compose existing runtime capture, persistence, recovery, and receipt APIs.
    require("#![forbid(unsafe_code)]" in lifecycle_rust, "F46 safe lifecycle forbids unsafe")
    require('arcanum-runtime = { path = "../arcanum-runtime" }' in lifecycle_cargo, "F46 lifecycle depends on certified runtime")
    for token in (
        "SystemClockProvider",
        "capture_tempus_anchor",
        "FileTempusAnchorStore",
        "TempusAnchorStore",
        "store.persist(&anchor)",
        "store.load(&anchor.anchor_id)",
        "create_tempus_local_receipt",
        "ARCANUM_RUNTIME_VERSION",
    ):
        require(token in lifecycle_rust, f"F46 runtime composition {token}")
    require("recovered != anchor" in lifecycle_rust, "F46 exact store/load round trip")
    require("observer.is_some()" in lifecycle_rust and "interpretation.is_some()" in lifecycle_rust, "F46 location/interpretation rejection")

    # F47 — exact persisted bytes bind the explicitly unsigned local receipt.
    for token in (
        "read_persisted_bytes",
        "sha256(&persisted_bytes)",
        "SigningFailure::Unavailable",
        "receipt.is_signed()",
        'receipt.scope != "local"',
        "content_digest_sha256",
    ):
        require(token in lifecycle_rust, f"F47 durable-byte receipt binding {token}")
    receipt = registry["receipt"]
    require(receipt["digest"] == "sha256-exact-persisted-anchor-bytes", "F47 SHA-256 digest scope")
    require(receipt["scope"] == "local" and receipt["signed"] is False, "F47 unsigned local receipt")
    require(receipt["protocolFinality"] is False, "F47 no finality")
    require("sha256_matches_standard_vectors" in lifecycle_rust, "F47 SHA-256 known vectors")

    # F48 — recovery is load-only and cannot fabricate replacement truth.
    recovery = registry["recovery"]
    require(recovery["captureOnMissing"] is False, "F48 no replacement capture")
    require(recovery["mutatesPersistedAnchor"] is False, "F48 no recovery mutation")
    require(recovery["reissuesReceipt"] is False, "F48 no receipt reissue")
    require("pub fn recover_anchor" in lifecycle_rust, "F48 explicit recovery entry")
    require("missing_anchor_fails_closed_without_replacement_capture" in lifecycle_rust, "F48 missing-anchor falsification")
    require("receipt: None" in lifecycle_rust, "F48 recovery returns no new receipt")

    # F49 — Android filesDir is the root; Kotlin retains only an opaque last-anchor ID.
    storage = registry["storage"]
    require(storage["androidRoot"] == "filesDir", "F49 app-private root")
    require(storage["kotlinPersistsOnlyOpaqueAnchorId"] is True, "F49 opaque Kotlin persistence")
    require("context.filesDir" in lifecycle_panel, "F49 host passes filesDir")
    require("LAST_ANCHOR_ID_KEY" in lifecycle_panel, "F49 opaque anchor preference")
    for forbidden in ("capturedAt", "persistedDigestSha256", "receiptId", "signature", "signerRef"):
        require(f'putString("{forbidden}"' not in lifecycle_panel, f"F49 Kotlin does not persist {forbidden}")
    require("android.permission.INTERNET" not in manifest, "F49 no INTERNET permission")

    # F50 — separate bounded lifecycle JNI surface; no runtime domain object crosses it.
    require('System.loadLibrary("arcanum_android_tempus_lifecycle_jni")' in lifecycle_bridge, "F50 lifecycle library name")
    require(lifecycle_bridge.count("external fun") == 2, "F50 exactly two lifecycle Kotlin methods")
    require(lifecycle_jni_rust.count("#[unsafe(no_mangle)]") == 2, "F50 exactly two lifecycle JNI exports")
    require("unsafe {" not in lifecycle_jni_rust and "unsafe fn" not in lifecycle_jni_rust, "F50 no executable unsafe Rust")
    require("TempusAnchor" not in lifecycle_jni_rust and "TempusAnchor" not in lifecycle_bridge, "F50 no anchor domain object across JNI")
    require('jni = { version = "=0.21.1", default-features = false }' in lifecycle_jni_cargo, "F50 exact JNI helper version")
    for symbol in (
        "Java_org_arcanum_nativehost_tempus_TempusLifecycleBridge_nativeCapturePersist",
        "Java_org_arcanum_nativehost_tempus_TempusLifecycleBridge_nativeRecover",
    ):
        require(lifecycle_jni_rust.count(symbol) == 1, f"F50 exact export {symbol}")

    # F51 — standard-control geometry-free lifecycle and explicit authority firewall.
    require("setContentView(ArcnetRendererView(this, bridgeLabel))" in main_activity, "F51 canonical geometry still constructed independently")
    require("addContentView(" in main_activity and "TempusLifecyclePanel(this)" in main_activity, "F51 separate lifecycle panel")
    require("Button(context)" in lifecycle_panel and "TextView(context)" in lifecycle_panel, "F51 standard Android controls")
    require('text = "Capture local Tempus"' in lifecycle_panel, "F51 explicit lifecycle action")
    require("authorityEffect=none" in lifecycle_contract and "authorityEffect=none" in lifecycle_panel, "F51 visible authority firewall")
    require(registry["presentation"]["geometryGatesLifecycle"] is False, "F51 geometry does not gate lifecycle")
    require(registry["authorityEffect"] == "none", "F51 registry authority effect")
    for capability, enabled in registry["capabilityCeiling"].items():
        require(enabled is False, f"F51 capability ceiling {capability}")

    # F52 — deterministic source verifier, Rust checks, dual ABI symbols, APK packaging.
    root_verify = package["scripts"]["verify:ce-w02"]
    require(root_verify.endswith("python3 scripts/verify-ce-w02-tempus-lifecycle.py"), "F52 root verifier wiring")
    for token in (
        "arm64-v8a",
        "x86_64",
        'toolchain: "1.98.1"',
        "cargo-ndk --version 4.1.2",
        "runtime/arcanum-android-tempus-lifecycle/Cargo.toml",
        "runtime/arcanum-android-tempus-lifecycle-jni/Cargo.toml",
        "libarcanum_android_jni.so",
        "libarcanum_android_tempus_lifecycle_jni.so",
        "assembleDebug",
        "llvm-nm",
    ):
        require(token in workflow, f"F52 workflow evidence {token}")
    require("TempusLifecycleContractTest" in lifecycle_test, "F52 Kotlin contract tests")
    require("apps/android/app/src/main/jniLibs/" in gitignore, "F52 native binaries ignored")
    require("runtime/arcanum-android-tempus-lifecycle-jni/Cargo.lock" in gitignore, "F52 generated JNI lock ignored")

    print("✅ CE-W02 Tempus lifecycle verification passed: F45-F52")


if __name__ == "__main__":
    verify()
