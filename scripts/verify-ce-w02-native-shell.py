#!/usr/bin/env python3
"""Deterministic CE-W02 W02.2 Android native-shell verifier using only stdlib."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "apps" / "android"
SPEC = ROOT / "docs" / "specs" / "app"
GEOM = ROOT / "docs" / "specs" / "geometry"

REQUIRED_ANDROID_FILES = [
    APP / "settings.gradle.kts",
    APP / "build.gradle.kts",
    APP / "gradle.properties",
    APP / "app" / "build.gradle.kts",
    APP / "app" / "src" / "main" / "AndroidManifest.xml",
    APP / "app" / "src" / "main" / "java" / "org" / "arcanum" / "nativehost" / "MainActivity.kt",
    APP / "app" / "src" / "main" / "java" / "org" / "arcanum" / "nativehost" / "geometry" / "CanonicalContracts.kt",
    APP / "app" / "src" / "main" / "java" / "org" / "arcanum" / "nativehost" / "geometry" / "ProjectionEngine.kt",
    APP / "app" / "src" / "main" / "java" / "org" / "arcanum" / "nativehost" / "geometry" / "ArcnetRendererView.kt",
    APP / "app" / "src" / "test" / "java" / "org" / "arcanum" / "nativehost" / "geometry" / "ProjectionContractTest.kt",
    ROOT / ".github" / "workflows" / "verify-android-native.yml",
]


def load(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def verify() -> None:
    for path in REQUIRED_ANDROID_FILES:
        require(path.is_file(), f"missing W02.2 artifact: {path.relative_to(ROOT)}")

    schema = load(SPEC / "android-geometric-host.schema.json")
    registry = load(SPEC / "android-geometric-host.v0.1.json")
    source = load(GEOM / "arcnet-coordinate-frame.v0.1.json")
    projection = load(GEOM / "arcnet-screen-projection.v0.1.json")
    vectors = load(GEOM / "arcnet-screen-projection.vectors.v0.1.json")

    app_gradle = read(APP / "app" / "build.gradle.kts")
    manifest = read(APP / "app" / "src" / "main" / "AndroidManifest.xml")
    contracts = read(APP / "app" / "src" / "main" / "java" / "org" / "arcanum" / "nativehost" / "geometry" / "CanonicalContracts.kt")
    projection_engine = read(APP / "app" / "src" / "main" / "java" / "org" / "arcanum" / "nativehost" / "geometry" / "ProjectionEngine.kt")
    renderer = read(APP / "app" / "src" / "main" / "java" / "org" / "arcanum" / "nativehost" / "geometry" / "ArcnetRendererView.kt")
    main_activity = read(APP / "app" / "src" / "main" / "java" / "org" / "arcanum" / "nativehost" / "MainActivity.kt")
    tests = read(APP / "app" / "src" / "test" / "java" / "org" / "arcanum" / "nativehost" / "geometry" / "ProjectionContractTest.kt")
    workflow = read(ROOT / ".github" / "workflows" / "verify-android-native.yml")
    package = load(ROOT / "package.json")

    require(schema["$schema"].endswith("2020-12/schema"), "W02.2 schema draft")
    require(schema["$id"] == "urn:arcanum:ce-w02:android-geometric-host:0.1.0", "W02.2 schema ID")
    require(schema["additionalProperties"] is False, "W02.2 closed root schema")
    require(registry["$schema"] == "./android-geometric-host.schema.json", "W02.2 registry schema binding")
    require(registry["constructionEra"] == "CE-W02", "W02.2 construction era")
    require(registry["tranche"] == "W02.2", "W02.2 tranche")
    require(registry["inheritedFalsificationIds"] == [f"F{i}" for i in range(1, 31)], "W02.2 inherits F1-F30")
    require(registry["falsificationIds"] == [f"F{i}" for i in range(31, 37)], "W02.2 declares F31-F36")

    canonical_inputs = registry["canonicalInputs"]
    require(canonical_inputs == [
        "docs/specs/geometry/arcnet-coordinate-frame.v0.1.json",
        "docs/specs/geometry/arcnet-screen-projection.v0.1.json",
        "docs/specs/geometry/arcnet-screen-projection.vectors.v0.1.json",
    ], "F31 exact canonical inputs")
    for canonical in canonical_inputs:
        require((ROOT / canonical).is_file(), f"F31 live canonical input {canonical}")
    require('sourceSets["main"].assets.srcDir(file("../../../docs/specs/geometry"))' in app_gradle, "F31 canonical geometry directory is direct Android asset source")
    require(registry["sourceOwnership"]["androidCopiesCanonicalCoordinates"] is False, "F31 no copied canonical coordinates")
    require(registry["sourceOwnership"]["androidCopiesExpectedScreenValues"] is False, "F31 no copied expected screen values")
    for asset_name in (
        "arcnet-coordinate-frame.v0.1.json",
        "arcnet-screen-projection.v0.1.json",
        "arcnet-screen-projection.vectors.v0.1.json",
    ):
        require(asset_name in contracts, f"F31 native loader references {asset_name}")
    require('getJSONObject("outerCube")' in contracts and 'getJSONObject("innerOctahedron")' in contracts and 'getJSONArray("vertices")' in contracts, "F31 renderer geometry is parsed from canonical source registry")

    android_kotlin = "\n".join((contracts, projection_engine, renderer, main_activity, tests))
    for sample in vectors["expectations"]["F25"]["samples"]:
        for value in sample["screen"]:
            if abs(value - round(value)) < 1e-12:
                continue
            fingerprint = f"{value:.6f}"
            require(fingerprint not in android_kotlin, f"F31 copied expected screen value detected: {fingerprint}")

    require('getJSONObject("F25")' in contracts, "F32 F25 vectors parsed at runtime")
    require("verifyReferenceVectors()" in renderer and "canonical F25 projection vectors do not match native projection" in renderer, "F32 renderer fail-closed F25 self-check")
    require("nativeProjectionConsumesCanonicalReferenceVectors" in tests and "assertTrue(contracts.verifyReferenceVectors())" in tests, "F32 native unit test consumes canonical vectors")

    required_projection_fragments = [
        "profile.model.rotation.apply(q)",
        "forward.cross(profile.camera.upReference).normalized()",
        "w = -view.z",
        "viewport.width / viewport.height",
        "clipHomogeneousSegment",
        "point.w + point.x",
        "point.w - point.x",
        "point.w + point.y",
        "point.w - point.y",
        "point.w + point.z",
        "point.w - point.z",
        "(ndcX + 1.0) * viewport.width / 2.0",
        "(1.0 - ndcY) * viewport.height / 2.0",
    ]
    for fragment in required_projection_fragments:
        require(fragment in projection_engine, f"F33 projection fragment: {fragment}")
    require("width = width.toDouble()" in renderer and "height = height.toDouble()" in renderer, "F33 Android View owns runtime viewport dimensions")
    require(registry["rendering"]["sourceCoordinatesMutable"] is False and registry["rendering"]["fixedVerticalFov"] is True and registry["rendering"]["homogeneousSegmentClippingBeforeDivide"] is True, "F33 registry projection boundary")

    require(source["authorityEffect"] == "none", "F34 source authorityEffect")
    require(projection["authorityEffect"] == "none", "F34 projection authorityEffect")
    require(projection["geometryFreeEquivalentRequired"] is True, "F34 projection geometry-free equivalent")
    require(registry["authorityEffect"] == "none", "F34 host authorityEffect")
    require(registry["geometryFreeEquivalentRequired"] is True, "F34 host geometry-free equivalent")
    require('projection.getString("authorityEffect") == "none"' in contracts and 'projection.getBoolean("geometryFreeEquivalentRequired")' in contracts, "F34 native parser enforces authority/geometry-free boundary")

    manifest_lower = manifest.lower()
    require("<uses-permission" not in manifest_lower, "F35 manifest has no permissions")
    require("android.permission.internet" not in manifest_lower, "F35 no INTERNET permission")
    require('<action android:name="android.intent.action.MAIN"' in manifest and '<category android:name="android.intent.category.LAUNCHER"' in manifest, "F35 explicit launcher activity")
    forbidden_source_patterns = [
        r"System\.loadLibrary",
        r"\bexternal\s+fun\b",
        r"\bJNI\b",
        r"\bPrivateKey\b",
        r"\bSignature\b",
        r"\bprotocolFinality\b",
        r"\bOkHttp\b",
        r"\bRetrofit\b",
    ]
    for pattern in forbidden_source_patterns:
        require(re.search(pattern, android_kotlin, flags=re.IGNORECASE) is None, f"F35 forbidden native source surface: {pattern}")
    ceiling = registry["capabilityCeiling"]
    require(all(value is False for value in ceiling.values()), "F35 capability ceiling all false")

    build_evidence = registry["buildEvidence"]
    require(build_evidence["workflow"] == ".github/workflows/verify-android-native.yml", "F36 workflow path")
    require('gradle-version: "8.9"' in workflow, "F36 Gradle version")
    require('java-version: "17"' in workflow, "F36 JDK version")
    require('"platforms;android-35"' in workflow, "F36 Android platform")
    require('"build-tools;35.0.0"' in workflow, "F36 Android build tools")
    require("gradle -p apps/android testDebugUnitTest assembleDebug --stacktrace" in workflow, "F36 native test + assemble tasks")
    require("compileSdk = 35" in app_gradle, "F36 compileSdk")
    require(package["scripts"]["verify:ce-w02"] == "pnpm verify:ce-w01 && python3 scripts/verify-ce-w02-projection.py && python3 scripts/verify-ce-w02-native-shell.py", "F36 root CE-W02 verification wiring")

    print("✅ CE-W02 native-shell verification passed: F31-F36")


if __name__ == "__main__":
    verify()
