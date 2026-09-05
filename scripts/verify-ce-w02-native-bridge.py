#!/usr/bin/env python3
"""Deterministic CE-W02 W02.3 native-bridge verifier using only stdlib."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / "runtime" / "arcanum-runtime"
BRIDGE = ROOT / "runtime" / "arcanum-android-bridge"
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
    schema = load_json(SPEC / "android-runtime-bridge.schema.json")
    registry = load_json(SPEC / "android-runtime-bridge.v0.1.json")
    rust = text(BRIDGE / "src" / "lib.rs")
    cargo = text(BRIDGE / "Cargo.toml")
    core_lib = text(RUNTIME / "src" / "lib.rs")
    bridge_contract = text(
        ANDROID
        / "app/src/main/java/org/arcanum/nativehost/runtime/BridgeContract.kt"
    )
    native_bridge = text(
        ANDROID
        / "app/src/main/java/org/arcanum/nativehost/runtime/NativeRuntimeBridge.kt"
    )
    main_activity = text(
        ANDROID / "app/src/main/java/org/arcanum/nativehost/MainActivity.kt"
    )
    renderer = text(
        ANDROID
        / "app/src/main/java/org/arcanum/nativehost/geometry/ArcnetRendererView.kt"
    )
    manifest = text(ANDROID / "app/src/main/AndroidManifest.xml")
    workflow = text(ROOT / ".github/workflows/verify-android-bridge.yml")

    require(schema["additionalProperties"] is False, "F37 closed root schema")
    require(
        registry["inheritedFalsificationIds"] == [f"F{i}" for i in range(1, 37)],
        "F37 inherited F1-F36",
    )
    require(
        registry["falsificationIds"] == [f"F{i}" for i in range(37, 45)],
        "F37 declares F37-F44",
    )
    require(
        registry["bridgeCrate"] == "runtime/arcanum-android-bridge",
        "F37 bridge crate path",
    )
    require(
        'arcanum-runtime = { path = "../arcanum-runtime" }' in cargo,
        "F37 bridge depends on runtime",
    )
    require("[dependencies]" in cargo and "jni =" not in cargo, "F37 no JNI helper dependency")

    # F38 — safe Rust and exact primitive-only ABI.
    require("#![forbid(unsafe_code)]" in rust, "F38 unsafe code forbidden")
    require("unsafe {" not in rust and "unsafe fn" not in rust, "F38 no unsafe body")
    expected_symbols = [
        "Java_org_arcanum_nativehost_runtime_NativeRuntimeBridge_nativeAbiVersion",
        "Java_org_arcanum_nativehost_runtime_NativeRuntimeBridge_nativeCapabilityMask",
        "Java_org_arcanum_nativehost_runtime_NativeRuntimeBridge_nativeTempusClockProbe",
    ]
    for symbol in expected_symbols:
        require(rust.count(symbol) == 1, f"F38 exact export {symbol}")
    require(rust.count("#[no_mangle]") == 3, "F38 exactly three JNI exports")
    require(registry["abi"]["primitiveOnly"] is True, "F38 primitive-only registry")
    require(
        registry["abi"]["jniPointersDereferenced"] is False,
        "F38 opaque JNI pointers",
    )

    # F39 — single capability bit and denied authority surfaces.
    require(registry["capabilities"]["mask"] == 1, "F39 capability mask")
    require(
        registry["capabilities"]["allowed"] == ["tempus-system-clock-probe"],
        "F39 one allowed capability",
    )
    for forbidden in (
        "persistence-write",
        "persistence-read",
        "receipt-create",
        "signing",
        "private-key-export",
        "network",
        "protocol-submit",
        "authority",
        "governance-weight",
        "economic-entitlement",
    ):
        require(forbidden in registry["capabilities"]["forbidden"], f"F39 deny {forbidden}")
    require(
        "ALLOWED_CAPABILITY_MASK: Long = CAP_TEMPUS_SYSTEM_CLOCK_PROBE" in bridge_contract,
        "F39 Kotlin exact mask",
    )
    require(
        "capabilityMask == BridgeContract.ALLOWED_CAPABILITY_MASK" in bridge_contract,
        "F39 Kotlin rejects extra bits",
    )

    # F40 — no duplicate clock semantics; traverse the certified runtime.
    for token in ("capture_tempus_anchor", "SystemClockProvider", "ARCANUM_RUNTIME_VERSION"):
        require(token in rust, f"F40 runtime traversal {token}")
    require("SystemTime" not in rust and "UNIX_EPOCH" not in rust, "F40 no duplicate clock implementation")
    require("pub const ARCANUM_RUNTIME_VERSION" in core_lib, "F40 runtime version source-owned")
    require(registry["tempusProbe"]["persists"] is False, "F40 no persistence")
    require(registry["tempusProbe"]["returnsAnchorToHost"] is False, "F40 no anchor export")
    require(registry["tempusProbe"]["collectsLocation"] is False, "F40 no location")

    # F41 — Android owns a tiny declared library surface.
    require('System.loadLibrary("arcanum_android_bridge")' in native_bridge, "F41 library name")
    require(native_bridge.count("external fun") == 3, "F41 exactly three Kotlin native methods")
    for method in registry["abi"]["exportedMethods"]:
        require(f"fun {method}" in native_bridge, f"F41 Kotlin method {method}")
    require("android.permission.INTERNET" not in manifest, "F41 no INTERNET permission")

    # F42 — bridge availability is presentation-only and cannot gate geometry.
    require("runCatching { NativeRuntimeBridge.status() }" in main_activity, "F42 bridge failure bounded")
    require(
        "setContentView(ArcnetRendererView(this, bridgeLabel))" in main_activity,
        "F42 geometry always constructed",
    )
    require("runtimeBridgeLabel" in renderer, "F42 renderer receives informational label")
    require("ready" not in renderer, "F42 renderer does not gate geometry on bridge readiness")
    require(
        registry["presentation"]["bridgeAvailabilityGatesGeometry"] is False,
        "F42 registry independence",
    )

    # F43 — cross-ABI and packaging evidence is explicit.
    for token in (
        "arm64-v8a",
        "x86_64",
        "cargo-ndk --version 4.1.2",
        "llvm-nm",
        "assembleDebug",
        "lib/arm64-v8a/libarcanum_android_bridge.so",
        "lib/x86_64/libarcanum_android_bridge.so",
    ):
        require(token in workflow, f"F43 workflow evidence {token}")
    require(registry["androidBuild"]["commitNativeBinaries"] is False, "F43 binaries uncommitted")

    # F44 — explicit deferral and authority firewall.
    require(registry["authorityEffect"] == "none", "F44 authority effect")
    require(
        registry["presentation"]["geometryFreeEquivalentRequired"] is True,
        "F44 geometry-free equivalent",
    )
    require(len(registry["deferredToW02_4"]) == 4, "F44 W02.4 deferral set")
    require(
        "TempusAnchor persistence" in registry["deferredToW02_4"],
        "F44 persistence deferred",
    )
    require("authorityEffect=none" in renderer, "F44 presentation authority label")

    print("✅ CE-W02 native-bridge verification passed: F37-F44")


if __name__ == "__main__":
    verify()
