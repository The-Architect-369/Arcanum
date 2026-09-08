#!/usr/bin/env python3
"""Fail-closed repository checks for the CE-W04 Architect Observer + Bridge tranche."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def fail(message: str) -> None:
    raise SystemExit(f"FAIL CE-W04 Architect Observer: {message}")


def require(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


registration_path = ROOT / "docs/specs/app/arcanum-native-registration.v0.1.json"
registration = json.loads(registration_path.read_text(encoding="utf-8"))
reserved = registration.get("ceW04Reserved", [])
require(
    "integrated_seed_node_alpha_proof" in reserved,
    "W04 registration must reserve integrated_seed_node_alpha_proof",
)
require(
    "networked_seed_node_alpha_proof" not in reserved,
    "ambiguous networked_seed_node_alpha_proof reservation must be removed",
)
ceiling = registration.get("capabilityCeiling", {})
require(ceiling.get("networkRequired") is False, "W04 baseline must remain network-free")
require(ceiling.get("protocolSubmission") is False, "W04 must not submit protocol state")
require(ceiling.get("modelDependency") is False, "W04 must not require a model provider")

manifest = (ROOT / "apps/android/app/src/main/AndroidManifest.xml").read_text(encoding="utf-8")
require(
    "android.permission.INTERNET" not in manifest,
    "Android manifest must not gain INTERNET permission in the local Architect tranche",
)
for required_phrase in (
    "ArchitectObservationProvider",
    'android:exported="false"',
    'android:grantUriPermissions="true"',
):
    require(required_phrase in manifest, f"Android manifest missing bounded provider control: {required_phrase!r}")

contract = (ROOT / "docs/specs/app/ce-w04-seed-node-alpha.md").read_text(encoding="utf-8")
for required_phrase in (
    "Triple-spine embodiment invariant",
    "integrated_seed_node_alpha_proof",
    "Architect Observer / Pulse",
    "private-local-redacted-v1",
    "transport = none",
    "human_selected_android_share_sheet",
    "automaticExport = false",
    "networkRequired = false",
    "modelDependency = false",
    "capture-ID-bound frozen export",
    "observation.zip",
    "10-minute temporary URI grant",
    "installed APK SHA-256",
    "system-UI overlap candidates",
    "A geometry-free equivalent MUST preserve every essential control",
):
    require(required_phrase in contract, f"implementation contract missing: {required_phrase!r}")

architect_dir = ROOT / "apps/android/app/src/main/java/org/arcanum/nativehost/architect"
required_android_files = {
    "ArchitectObservationBridge.kt",
    "ArchitectObservationContract.kt",
    "ArchitectObservationPrivacy.kt",
    "ArchitectObservationProvider.kt",
    "ArchitectObserver.kt",
    "ArchitectPulseButton.kt",
    "ArchitectVisualDiagnostics.kt",
}
require(architect_dir.is_dir(), "native Architect package is missing")
require(
    required_android_files.issubset({path.name for path in architect_dir.glob("*.kt")}),
    "native Architect package is incomplete",
)
architect_source = "\n".join(
    path.read_text(encoding="utf-8") for path in sorted(architect_dir.glob("*.kt"))
)
for forbidden in (
    "android.permission.INTERNET",
    "HttpURLConnection",
    "OkHttp",
    "Retrofit",
    "java.net.Socket",
    "openai.com",
):
    require(forbidden not in architect_source, f"forbidden network/model surface detected: {forbidden}")

observer = (architect_dir / "ArchitectObserver.kt").read_text(encoding="utf-8")
for required_phrase in (
    "context.filesDir",
    "architect/observation",
    "latest.png",
    "latest.json",
    "captureId",
    "sourceCommit",
    "installedApkSha256",
    "rawUnredactedFramePersisted\", false",
    "privateReflectionContentIncluded\", false",
    "semanticAuxiliaryTextRedacted\", true",
    "ArchitectObservationPrivacy::shouldMaskPixels",
    "ArchitectVisualDiagnostics.inspect",
    "exportCapability",
    "immutableExport",
    "exportGrantTtlSeconds",
):
    require(required_phrase in observer, f"observer implementation missing: {required_phrase!r}")

bridge = (architect_dir / "ArchitectObservationBridge.kt").read_text(encoding="utf-8")
for required_phrase in (
    "Intent.ACTION_SEND_MULTIPLE",
    "Intent.FLAG_GRANT_READ_URI_PERMISSION",
    "Intent.createChooser",
    "ArchitectObservationProvider.uriFor",
    "ArchitectFrozenObservationExport",
    "observation.captureId",
    "createIntegrityBundle",
    "EXPORT_GRANT_TTL_SECONDS",
    "revokeUriPermission",
):
    require(required_phrase in bridge, f"Human-mediated frozen share bridge missing: {required_phrase!r}")

provider = (architect_dir / "ArchitectObservationProvider.kt").read_text(encoding="utf-8")
for required_phrase in (
    "MODE_READ_ONLY",
    "ALLOWED_FILES",
    "latest.png",
    "latest.json",
    "EXPORT_BUNDLE_FILE",
    "pathSegments.size != 2",
    "captureDirectory.parentFile != root",
    "Only capture-bound frozen Architect exports may be shared",
    "Architect observation provider is read-only",
):
    require(required_phrase in provider, f"bounded frozen observation provider missing: {required_phrase!r}")

visual_diagnostics = (architect_dir / "ArchitectVisualDiagnostics.kt").read_text(encoding="utf-8")
for required_phrase in (
    "MIN_TOUCH_TARGET_DP = 48.0",
    "smallTouchTargetCount",
    "clippedVisibleViewCount",
    "systemUiOverlapCandidateCount",
    "systemUiInsetsPx",
    "safeContentBoundsPx",
    "textOverlapCandidateCount",
):
    require(required_phrase in visual_diagnostics, f"visual diagnostics missing: {required_phrase!r}")

hope = (
    ROOT / "apps/android/app/src/main/java/org/arcanum/nativehost/hope/HopeReflectionPanel.kt"
).read_text(encoding="utf-8")
require(
    hope.count("ArchitectObservationPrivacy.markPrivateText(this)") >= 2,
    "Hope input and recalled reflection must both be explicitly marked private",
)

main_activity = (
    ROOT / "apps/android/app/src/main/java/org/arcanum/nativehost/MainActivity.kt"
).read_text(encoding="utf-8")
for required_phrase in (
    "ArchitectObserver",
    "ArchitectObservationBridge",
    "ArchitectPulseButton",
    'trigger = "human_pulse"',
    'trigger = "human_share"',
    'trigger = "initial_render"',
    'trigger = "window_focus"',
    "hold A to share",
    "LinearLayout.HORIZONTAL",
    "setOnApplyWindowInsetsListener",
    "systemWindowInsetBottom",
    "window.navigationBarColor = Color.BLACK",
):
    require(required_phrase in main_activity, f"MainActivity missing Architect/inset-safe hook: {required_phrase!r}")

build_gradle = (ROOT / "apps/android/app/build.gradle.kts").read_text(encoding="utf-8")
for required_phrase in (
    "ARCANUM_SOURCE_COMMIT",
    "arcanumSourceCommit",
    "buildConfig = true",
    "versionCode = 2",
):
    require(required_phrase in build_gradle, f"Android build provenance missing: {required_phrase!r}")

workflow = (
    ROOT / ".github/workflows/verify-ce-w04-architect-observer.yml"
).read_text(encoding="utf-8")
require(
    '-ParcanumSourceCommit="$SOURCE_HEAD"' in workflow,
    "exact-head Android build must inject the checked-out source commit",
)

unit_test = (
    ROOT
    / "apps/android/app/src/test/java/org/arcanum/nativehost/architect/ArchitectObservationContractTest.kt"
)
require(unit_test.is_file(), "Architect observation contract unit test is missing")

print(
    "PASS CE-W04 Architect Observer + Bridge: capture-bound frozen Human export, build provenance, inset-aware diagnostics, privacy redaction, no model/network dependency"
)
