#!/usr/bin/env python3
from __future__ import annotations

import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "docs/specs/app/ce-w03-native-hope.v0.1.json"
REGISTRATION = ROOT / "docs/specs/app/arcanum-native-registration.v0.1.json"
HOPE_RECORD = ROOT / "docs/specs/app/hope-reflection.v0.1.json"
SEED = ROOT / "docs/specs/geometry/hope-seed-overlay.v0.1.json"
SEED_VECTORS = ROOT / "docs/specs/geometry/hope-seed-overlay.vectors.v0.1.json"
SOURCE = ROOT / "docs/specs/geometry/arcnet-coordinate-frame.v0.1.json"


def require(condition: bool, label: str) -> None:
    if not condition:
        raise SystemExit(f"❌ {label}")
    print(f"✅ {label}")


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def close(a: float, b: float, tolerance: float) -> bool:
    return abs(a - b) <= tolerance * max(1.0, abs(a), abs(b))


def verify_arcanum_registration() -> None:
    registration = json.loads(REGISTRATION.read_text(encoding="utf-8"))
    require(registration["contractId"] == "arcanum-native-registration.v0.1", "F62 Arcanum registration contract ID")
    require(registration["constructionEra"] == "CE-W03" and registration["tranche"] == "W03.2", "F62 registration tranche identity")
    require(registration["appId"] == "arcanum" and registration["launchSurface"] == "hope", "F62 Arcanum launches into Hope")
    runtime = registration["runtime"]
    require(runtime == {"requiredAbiVersion": 1, "requiredCapabilityMask": 1, "allowedCapabilityMask": 1, "failClosed": True}, "F62 inherited runtime ceiling exact")
    authority = registration["authority"]
    require(authority["authorityEffect"] == "none", "F62 launch has no authority effect")
    require(all(authority[key] is False for key in ["protocolAuthority", "canExecute", "canRatify", "canConfirmReadiness"]), "F62 protocol authority closed")
    ceiling = registration["capabilityCeiling"]
    require(all(value is False for value in ceiling.values()), "F71 registered app capability ceiling closed")
    geometry = registration["geometry"]
    require(geometry["optional"] is True and geometry["seedOverlayAuthorityEffect"] == "none", "F62 geometry remains optional presentation")
    receipt = registration["receipt"]
    require(receipt == {"scope": "local", "signingRequired": False}, "F62 CE-W03 receipt boundary remains local unsigned")

    registry = read("apps/android/app/src/main/java/org/arcanum/nativehost/application/NativeApplicationRegistry.kt")
    require('appId = "arcanum"' in registry and 'launchSurface = "hope"' in registry, "F62 native registry contains Arcanum/Hope binding")
    require("requiredRuntimeAbi = BridgeContract.ABI_VERSION" in registry, "F62 native registry reuses inherited ABI")
    require("requiredCapabilityMask = BridgeContract.CAP_TEMPUS_SYSTEM_CLOCK_PROBE" in registry, "F62 native registry reuses inherited capability")
    require('authorityEffect = "none"' in registry and "protocolAuthority = false" in registry, "F62 native registry authority firewall")
    require("networkRequired = false" in registry and "modelDependency = false" in registry, "F71 native registry offline/model ceiling")
    require('NativeApplicationLaunch.Blocked("runtime_not_ready")' in registry, "F62 launch fails closed when runtime is not ready")

    activity = read("apps/android/app/src/main/java/org/arcanum/nativehost/MainActivity.kt")
    require("setContentView(ArcnetRendererView(this, bridgeLabel))" in activity, "F61 inherited renderer host preserved")
    require("TempusLifecyclePanel(this)" in activity, "F61 inherited Tempus panel preserved")
    require("ArcanumLaunchPanel(this, appLaunch)" in activity, "F62 Arcanum launch surface mounted")
    panel = read("apps/android/app/src/main/java/org/arcanum/nativehost/application/ArcanumLaunchPanel.kt")
    require("Arcanum · Hope · local/private · authorityEffect=none" in panel, "F62 Hope-centered native presentation")
    require("fail-closed · authorityEffect=none" in panel, "F62 blocked presentation truthful")


def verify_hope_record_and_storage() -> None:
    specification = json.loads(HOPE_RECORD.read_text(encoding="utf-8"))
    require(specification["contractId"] == "hope-reflection.v0.1", "F63 closed Construction Hope contract ID")
    require(specification["derivedFrom"].endswith("hope.context.v0.1"), "F63 Hope record derivation audited from hope.context.v0.1")
    audit = specification["derivationAudit"]
    excluded = set(audit["excludedFromConstructionRecord"])
    require({"identityId", "Vitae summaries", "consented_export visibility", "queued receipt status", "anchored receipt status"}.issubset(excluded), "F63 broader web states excluded from Construction record")
    record = specification["record"]
    require(record["version"] == "hope.reflection.v0.1" and record["mode"] == "reflection", "F63 Hope record identity fixed")
    require(record["requiredFields"] == ["id", "createdAt", "userText"], "F63 required Hope fields closed")
    require(record["optionalFields"] == ["prompt", "hopeText", "context.tempus"], "F63 optional Hope fields closed")
    require(record["visibility"] == "local_private" and record["receiptStatus"] == "local_only", "F63 Hope local-only states fixed")
    require(record["authority"] == "advisory_only" and record["interpretation"] is None, "F63 Hope advisory/null interpretation fixed")
    require(record["additionalFieldsAllowed"] is False, "F63 additional record fields forbidden")
    tempus = specification["tempus"]
    require(tempus["optional"] is True and tempus["sourceKind"] == "system-clock", "F67 Tempus provenance optional and factual")
    require(tempus["interpretation"] is None and tempus["authorityEffect"] == "none" and tempus["causalMeaningAllowed"] is False, "F67 Tempus meaning/authority firewall")

    storage = specification["storage"]
    require(storage["namespace"] == "hope" and storage["relativePath"] == "hope/reflections.v0.1.enc", "F64 Rust-owned Hope namespace/path fixed")
    require(storage["owner"] == "arcanum-hope-runtime", "F64 Hope storage contract owner fixed")
    require(storage["platformKeyProvider"] == "AndroidKeyStore" and storage["cipher"] == "AES/GCM/NoPadding", "F64 platform encryption contract fixed")
    require(storage["keyExportable"] is False and storage["keyCrossesJni"] is False, "F64 key isolation fixed")
    require(storage["atomicReplaceRequired"] is True and storage["authenticatedEnvelope"] is True, "F65 atomic authenticated envelope required")
    require(storage["missingStateFailure"] == "fail_closed" and storage["corruptionFailure"] == "fail_closed", "F65 missing/corrupt state fail closed")

    rust = read("runtime/arcanum-hope-runtime/src/lib.rs")
    require('pub const HOPE_NAMESPACE: &str = "hope";' in rust, "F64 Rust owns Hope namespace")
    require('pub const HOPE_RECORD_VERSION: &str = "hope.reflection.v0.1";' in rust, "F63 Rust owns Hope record version")
    require('pub const HOPE_STORAGE_RELATIVE_PATH: &str = "hope/reflections.v0.1.enc";' in rust, "F64 Rust owns durable Hope path")
    require("pub fn canonical_reflection(" in rust, "F63 Rust canonical reflection constructor present")
    require('pub const TEMPUS_SOURCE_SYSTEM_CLOCK: &str = "system-clock";' in rust, "F67 factual Tempus source fixed")

    jni = read("runtime/arcanum-android-hope-jni/src/lib.rs")
    require("Java_org_arcanum_nativehost_hope_HopeRuntimeBridge_nativeContract" in jni, "F64 Hope JNI contract export present")
    require("Java_org_arcanum_nativehost_hope_HopeRuntimeBridge_nativeBuildReflection" in jni, "F63 Hope JNI record export present")
    require(all(token not in jni for token in ["AndroidKeyStore", "SecretKey", "KeyStore", ".encoded"]), "F64 key material absent from JNI boundary")

    bridge = read("apps/android/app/src/main/java/org/arcanum/nativehost/hope/HopeRuntimeBridge.kt")
    require('System.loadLibrary("arcanum_android_hope_jni")' in bridge, "F64 dedicated Hope JNI library loaded")
    require("nativeContract(): String" in bridge and "nativeBuildReflection(" in bridge, "F63/F64 bounded Hope JNI surface")
    require(all(token not in bridge for token in ["SecretKey", "KeyStore", ".encoded"]), "F64 Android bridge does not expose keys")

    key_manager = read("apps/android/app/src/main/java/org/arcanum/nativehost/hope/AndroidHopeKeyManager.kt")
    require('KEYSTORE_PROVIDER = "AndroidKeyStore"' in key_manager, "F64 Android Keystore provider used")
    require("KeyGenParameterSpec.Builder(" in key_manager and "KeyProperties.KEY_ALGORITHM_AES" in key_manager, "F64 non-exportable platform AES key generated")
    require("KeyProperties.BLOCK_MODE_GCM" in key_manager and "KeyProperties.ENCRYPTION_PADDING_NONE" in key_manager, "F64 GCM/no-padding key policy fixed")
    require(".setKeySize(256)" in key_manager and ".setRandomizedEncryptionRequired(true)" in key_manager, "F64 256-bit randomized key policy fixed")
    require(".encoded" not in key_manager, "F64 key bytes are never exported")

    protected_store = read("apps/android/app/src/main/java/org/arcanum/nativehost/hope/HopeProtectedStore.kt")
    require('CIPHER = "AES/GCM/NoPadding"' in protected_store, "F64 authenticated cipher fixed in protected store")
    require("GCMParameterSpec" in protected_store and "updateAAD(aad())" in protected_store, "F64 envelope metadata authenticated")
    require("StandardCopyOption.ATOMIC_MOVE" in protected_store and "output.fd.sync()" in protected_store, "F65 durable atomic replace path")
    require("AEADBadTagException" in protected_store and "HopeStateCorruptException" in protected_store, "F65 tamper fails closed")
    require("HopeStateMissingException" in protected_store and "Hope protected state is missing" in protected_store, "F65 missing state explicit")
    require('MAGIC = "ARCHOPE1"' in protected_store, "F65 versioned protected envelope present")

    tests = read("apps/android/app/src/test/java/org/arcanum/nativehost/hope/HopeProtectedStoreTest.kt")
    for test_name in ["protectedStateRoundTripsExactly", "missingStateFailsClosed", "tamperedCiphertextFailsClosed", "truncatedEnvelopeFailsClosed"]:
        require(f"fun {test_name}()" in tests, f"F65 protected-store test {test_name}")

    workflow = read(".github/workflows/verify-ce-w03-native-hope.yml")
    require("arcanum-android-hope-jni" in workflow, "F64 dedicated Hope JNI built in CI")
    require("libarcanum_android_jni.so" in workflow and "libarcanum_android_tempus_lifecycle_jni.so" in workflow and "libarcanum_android_hope_jni.so" in workflow, "F61/F64 three-library dual-ABI packaging verified")


def verify_seed_overlay() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    seed = json.loads(SEED.read_text(encoding="utf-8"))
    vectors = json.loads(SEED_VECTORS.read_text(encoding="utf-8"))
    require(source["innerOctahedron"]["role"] == "hope-centered-inner-rendering", "inherited Hope octahedron retained")
    require([vertex["q"] for vertex in source["innerOctahedron"]["vertices"]] == [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]], "inherited octahedral source coordinates exact")
    overlay = seed["overlay"]
    require(seed["source"]["registry"] == "./arcnet-coordinate-frame.v0.1.json", "Seed overlay bound to inherited registry")
    require(seed["source"]["sourceCoordinatesMutable"] is False, "Seed overlay cannot mutate source coordinates")
    require(overlay["type"] == "symbolic-presentation-overlay", "F69 Seed overlay explicitly symbolic")
    require(overlay["exactMappingSpecified"] is False, "F69 exact mapping not fabricated")
    require(overlay["mathematicalIdentityClaimed"] is False, "F69 mathematical identity not fabricated")
    require(overlay["authorityEffect"] == "none", "F69 geometry has no authority effect")
    require(seed["presentationScale"]["type"] == "viewport-relative-presentation-only", "F69 presentation scale typed")
    require(seed["geometryFreeEquivalent"]["required"] is True, "F70 geometry-free equivalent required")
    centers = {entry["id"]: entry["p"] for entry in overlay["centers"]}
    require(len(centers) == 7 and centers["seed_center"] == [0.0, 0.0], "Seed seven-circle local geometry fixed")
    require(close(centers["seed_ne"][1], math.sqrt(3) / 2, 1e-12), "Seed local vector sqrt(3)/2 fixed")
    width = vectors["referenceViewport"]["width"]
    height = vectors["referenceViewport"]["height"]
    origin_x, origin_y = vectors["referenceOrigin"]
    radius = min(width, height) * seed["presentationScale"]["unitRadiusFractionOfMinViewport"]
    expected = {sample["id"]: sample for sample in vectors["samples"]}
    for point_id, point in centers.items():
        screen_x = origin_x + point[0] * radius
        screen_y = origin_y - point[1] * radius
        sample = expected[point_id]
        require(close(screen_x, sample["screen"][0], vectors["tolerance"]), f"Seed vector {point_id} x")
        require(close(screen_y, sample["screen"][1], vectors["tolerance"]), f"Seed vector {point_id} y")
        require(close(radius, sample["radius"], vectors["tolerance"]), f"Seed vector {point_id} radius")


def main() -> None:
    data = json.loads(CONTRACT.read_text(encoding="utf-8"))
    require(data["contractId"] == "ce-w03-native-hope.v0.1", "CE-W03 contract ID")
    require(data["constructionEra"] == "CE-W03", "CE-W03 era identity")
    require(data["canonicalBase"] == "cb42fb0f9497e406b189230f753c1398c22e6afd", "CE-W03 exact opening baseline")
    require(data["authorityEffect"] == "none", "CE-W03 authority effect remains none")
    require(list(data["decisions"]) == [f"D{i}" for i in range(1, 8)], "D1-D7 frozen")
    require(list(data["falsificationIds"]) == [f"F{i}" for i in range(61, 73)], "F61-F72 frozen")
    require(data["tranches"] == [f"W03.{i}" for i in range(6)], "W03.0-W03.5 ordered")
    record = data["hopeRecord"]
    require(record["version"] == "hope.reflection.v0.1", "Construction Hope record version")
    require(record["visibilityDefault"] == "local_private", "Hope local-private default")
    require(record["authority"] == "advisory_only", "Hope advisory-only authority")
    require(record["interpretation"] is None, "Hope interpretation remains null")
    require(record["receiptScope"] == "local", "Hope receipt scope local")
    require(record["receiptSigningRequired"] is False, "CE-W03 does not fabricate receipt signing")
    storage = data["storage"]
    require(storage["namespace"] == "hope", "Hope namespace fixed")
    require(storage["platformKeyProvider"] == "AndroidKeyStore", "Android Keystore provider fixed")
    require(storage["cipher"] == "AES/GCM/NoPadding", "authenticated AES-GCM fixed")
    require(storage["keyExportable"] is False and storage["keyCrossesJni"] is False, "key isolation invariant")
    require(storage["tamperFailure"] == "fail_closed", "tamper fails closed")
    geometry = data["geometry"]
    require(geometry["seedRelationship"] == "symbolic_presentation_overlay", "Seed overlay typing")
    require(geometry["exactIdentityClaimed"] is False, "no unproved Seed/octahedron identity")
    require(geometry["geometryFreeEquivalentRequired"] is True, "geometry-free equivalent required")
    verify_arcanum_registration()
    verify_hope_record_and_storage()
    verify_seed_overlay()
    ceiling = data["capabilityCeiling"]
    require(all(value is False for value in ceiling.values()), "offline/capability ceiling is closed")
    require("Current implementation wave: **CE-W03" in read("README.md"), "README current wave reconciled")
    require('wave: "CE-W03"' in read("docs/status/project-status.md"), "project status current wave reconciled")
    require('wave: "CE-W03"' in read("docs/roadmap/canonical-roadmap.md"), "canonical roadmap current wave reconciled")
    require('wave: "CE-W03"' in read("docs/roadmap/construction-era-roadmap.md"), "Construction roadmap current wave reconciled")
    print("✅ CE-W03 contract and implemented tranche invariants verified")


if __name__ == "__main__":
    main()
