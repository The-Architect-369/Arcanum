#!/usr/bin/env python3
"""Deterministic CE-W02 W02.3 native-bridge verifier using only stdlib."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / "runtime" / "arcanum-runtime"
BRIDGE = ROOT / "runtime" / "arcanum-android-bridge"
JNI = ROOT / "runtime" / "arcanum-android-jni"
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
    bridge_rust = text(BRIDGE / "src" / "lib.rs")
    bridge_cargo = text(BRIDGE / "Cargo.toml")
    jni_rust = text(JNI / "src" / "lib.rs")
    jni_cargo = text(JNI / "Cargo.toml")
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
    package = load_json(ROOT / "package.json")

    # F37 — separate safe facade, mechanical FFI shim, and closed contract.
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
        "F37 safe bridge crate path",
    )
    require(
        registry["ffiCrate"] == "runtime/arcanum-android-jni",
        "F37 FFI crate path",
    )
    require(
        'arcanum-runtime = { path = "../arcanum-runtime" }' in bridge_cargo,
        "F37 safe facade depends on runtime",
    )
    require(
        'arcanum-android-bridge = { path = "../arcanum-android-bridge" }' in jni_cargo,
        "F37 JNI shim depends on safe facade",
    )
    require("jni =" not in bridge_cargo and "jni =" not in jni_cargo, "F37 no JNI helper dependency")
    root_verify = package["scripts"]["verify:ce-w02"]
    w02_3_prefix = (
        "pnpm verify:ce-w01 && python3 scripts/verify-ce-w02-projection.py "
        "&& python3 scripts/verify-ce-w02-native-shell.py "
        "&& python3 scripts/verify-ce-w02-native-bridge.py"
    )
    require(
        root_verify == w02_3_prefix or root_verify.startswith(w02_3_prefix + " && "),
        "F37 root CE-W02 verification prefix",
    )

    # F38 — safe facade plus the smallest explicit linker-unsafe shim.
    require("#![forbid(unsafe_code)]" in bridge_rust, "F38 safe facade forbids unsafe code")
    require("#[no_mangle]" not in bridge_rust and "#[unsafe(no_mangle)]" not in bridge_rust, "F38 no exports in safe facade")
    require("unsafe {" not in bridge_rust and "unsafe fn" not in bridge_rust, "F38 safe facade no unsafe body")
    require("#![deny(unsafe_attr_outside_unsafe)]" in jni_rust, "F38 explicit unsafe attribute discipline")
    require(jni_rust.count("#[unsafe(no_mangle)]") == 3, "F38 exactly three unsafe linker attributes")
    require("unsafe {" not in jni_rust and "unsafe fn" not in jni_rust, "F38 JNI shim has no unsafe blocks/functions")
    expected_symbols = [
        "Java_org_arcanum_nativehost_runtime_NativeRuntimeBridge_nativeAbiVersion",
        "Java_org_arcanum_nativehost_runtime_NativeRuntimeBridge_nativeCapabilityMask",
        "Java_org_arcanum_nativehost_runtime_NativeRuntimeBridge_nativeTempusClockProbe",
    ]
    for symbol in expected_symbols:
        require(jni_rust.count(symbol) == 1, f"F38 exact export {symbol}")
    abi = registry["abi"]
    require(abi["primitiveOnly"] is True, "F38 primitive-only registry")
    require(abi["jniPointersDereferenced"] is False, "F38 opaque JNI pointers")
    require(abi["safeFacadeForbidsUnsafeCode"] is True, "F38 safe facade registry")
    require(abi["ffiUnsafeLinkerAttributes"] == 3, "F38 linker attribute count")
    require(abi["ffiUnsafeBlocks"] is False and abi["ffiUnsafeFunctions"] is False, "F38 no executable unsafe Rust")

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
        require(token in bridge_rust, f"F40 runtime traversal {token}")
    require("SystemTime" not in bridge_rust and "UNIX_EPOCH" not in bridge_rust, "F40 no duplicate clock implementation")
    require("pub const ARCANUM_RUNTIME_VERSION" in core_lib, "F40 runtime version source-owned")
    require("bridge_abi_version" in jni_rust and "tempus_system_clock_probe" in jni_rust, "F40 shim delegates to safe facade")
    require(registry["tempusProbe"]["persists"] is False, "F40 no persistence")
    require(registry["tempusProbe"]["returnsAnchorToHost"] is False, "F40 no anchor export")
    require(registry["tempusProbe"]["collectsLocation"] is False, "F40 no location")

    # F41 — Android owns a tiny declared library surface.
    require('System.loadLibrary("arcanum_android_jni")' in native_bridge, "F41 library name")
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
        "runtime/arcanum-android-jni/Cargo.toml",
        "assembleDebug",
        "lib/arm64-v8a/libarcanum_android_jni.so",
        "lib/x86_64/libarcanum_android_jni.so",
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
