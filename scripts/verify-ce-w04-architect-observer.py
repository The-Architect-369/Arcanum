#!/usr/bin/env python3
"""Fail-closed repository checks for the CE-W04 Architect Observer + Bridge tranche."""
from __future__ import annotations
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def fail(message: str) -> None:
    raise SystemExit(f"FAIL CE-W04 Architect Observer: {message}")

def require(condition: bool, message: str) -> None:
    if not condition:
        fail(message)

registration = json.loads((ROOT / "docs/specs/app/arcanum-native-registration.v0.1.json").read_text(encoding="utf-8"))
reserved = registration.get("ceW04Reserved", [])
require("integrated_seed_node_alpha_proof" in reserved, "W04 registration must reserve integrated_seed_node_alpha_proof")
require("networked_seed_node_alpha_proof" not in reserved, "ambiguous networked_seed_node_alpha_proof reservation must be removed")
ceiling = registration.get("capabilityCeiling", {})
require(ceiling.get("networkRequired") is False, "W04 baseline must remain operable without network availability")
require(ceiling.get("protocolSubmission") is False, "W04 must not submit protocol state")
require(ceiling.get("modelDependency") is False, "W04 must not require a model provider")

manifest = (ROOT / "apps/android/app/src/main/AndroidManifest.xml").read_text(encoding="utf-8")
require("android.permission.INTERNET" in manifest, "A09 native loopback broker bridge requires Android INTERNET permission")
require("architect_loopback_network_security" in manifest, "A09 must bind cleartext policy to the loopback network-security config")
for required_phrase in ("ArchitectObservationProvider", 'android:exported="false"', 'android:grantUriPermissions="true"'):
    require(required_phrase in manifest, f"Android manifest missing bounded provider control: {required_phrase!r}")

network_security = (ROOT / "apps/android/app/src/main/res/xml/architect_loopback_network_security.xml").read_text(encoding="utf-8")
for required_phrase in ('<base-config cleartextTrafficPermitted="false"', '<domain-config cleartextTrafficPermitted="true"', '>127.0.0.1<'):
    require(required_phrase in network_security, f"A09 loopback network policy missing: {required_phrase!r}")

contract = (ROOT / "docs/specs/app/ce-w04-seed-node-alpha.md").read_text(encoding="utf-8")
for required_phrase in (
    "Triple-spine embodiment invariant", "integrated_seed_node_alpha_proof", "Architect Observer / Pulse",
    "private-local-redacted-v1", "transport = none", "human_selected_android_share_sheet", "automaticExport = false",
    "networkRequired = false", "modelDependency = false", "capture-ID-bound frozen export", "observation.zip",
    "10-minute temporary URI grant", "installed APK SHA-256", "system-UI overlap candidates",
    "A geometry-free equivalent MUST preserve every essential control",
):
    require(required_phrase in contract, f"implementation contract missing: {required_phrase!r}")

a09_contract = (ROOT / "docs/specs/app/ce-w04-a09-bounded-action-registry.md").read_text(encoding="utf-8")
for required_phrase in (
    "Human chooses one native allowlisted action", "native client verifies broker risk class matches its own allowlist",
    "git_status", "git_branch", "git_head", "git_log_10", "git_diff_names", "git_diff_stat", "verify_sync",
    "current Git repository", "ARCANUM_REPO_DIR advanced override", "$HOME/Arcanum", "fail closed",
    "No free-form shell text", "authorityEffect=none", "Repository mutation",
):
    require(required_phrase in a09_contract, f"A09 bounded action contract missing: {required_phrase!r}")

architect_dir = ROOT / "apps/android/app/src/main/java/org/arcanum/nativehost/architect"
required_android_files = {
    "ArchitectObservationBridge.kt", "ArchitectObservationContract.kt", "ArchitectObservationPrivacy.kt",
    "ArchitectObservationProvider.kt", "ArchitectObserver.kt", "ArchitectPulseButton.kt",
    "ArchitectVisualDiagnostics.kt", "ArchitectShellPanel.kt", "ArchitectBrokerClient.kt",
}
require(required_android_files.issubset({path.name for path in architect_dir.glob("*.kt")}), "native Architect package is incomplete")
architect_source = "\n".join(path.read_text(encoding="utf-8") for path in sorted(architect_dir.glob("*.kt")))
for forbidden in ("OkHttp", "Retrofit", "java.net.Socket", "openai.com", "api.openai.com"):
    require(forbidden not in architect_source, f"forbidden network/model surface detected: {forbidden}")

broker_client = (architect_dir / "ArchitectBrokerClient.kt").read_text(encoding="utf-8")
for required_phrase in (
    'LOOPBACK_BASE_URL = "http://127.0.0.1:8765"',
    '"git_status"', '"git_branch"', '"git_head"', '"git_log_10"', '"git_diff_names"', '"git_diff_stat"', '"verify_sync"',
    'approvedByHumanArchitect", true', 'receiptType") == "architect_execution_receipt"',
    'registered.optString("risk") == action.expectedRisk', 'url.host == LOOPBACK_HOST', 'instanceFollowRedirects = false',
):
    require(required_phrase in broker_client, f"A09 bounded native broker client missing: {required_phrase!r}")
require("https://" not in broker_client, "A09 native broker client must not contain a remote HTTPS endpoint")
require("web_typecheck" not in broker_client, "A09 Android allowlist must not expose web_typecheck")

shell_panel = (architect_dir / "ArchitectShellPanel.kt").read_text(encoding="utf-8")
for required_phrase in (
    "Choose local action", "Architect local actions", "Registered action:", "Risk class:", "Transport: 127.0.0.1 only",
    "ArchitectBrokerClient.Action.entries", "requestApproval", "authorityEffect=none",
    "cannot execute arbitrary shell commands", "cannot mutate the repository",
):
    require(required_phrase in shell_panel, f"A09 Architect action surface missing: {required_phrase!r}")

mobile_broker = (ROOT / "scripts/mobile/arcanum-broker.sh").read_text(encoding="utf-8")
current_repo_index = mobile_broker.find('if git rev-parse --show-toplevel')
env_index = mobile_broker.find('elif [[ -n "${ARCANUM_REPO_DIR:-}" ]]')
home_index = mobile_broker.find('elif [[ -d "$HOME/Arcanum/.git" ]]')
require(current_repo_index >= 0 and env_index > current_repo_index and home_index > env_index, "A09 broker launcher repository precedence must be current Git -> env override -> $HOME/Arcanum")
for required_phrase in (
    'git -C "$REPO_DIR" rev-parse --show-toplevel',
    'fail "resolved path is not the Git repository root: $REPO_DIR"',
    '--host 127.0.0.1',
):
    require(required_phrase in mobile_broker, f"A09 broker launcher hardening missing: {required_phrase!r}")

broker = (ROOT / "scripts/architect/termux-broker.py").read_text(encoding="utf-8")
for command_id in ("git_status", "git_branch", "git_head", "git_log_10", "git_diff_names", "git_diff_stat", "verify_sync"):
    require(f'"{command_id}"' in broker, f"A09 broker registry missing command: {command_id}")
for forbidden in ("shell=True", "git push", "git commit", "git merge", "git reset --hard"):
    require(forbidden not in broker, f"A09 broker mutation/shell ceiling violated: {forbidden!r}")

observer = (architect_dir / "ArchitectObserver.kt").read_text(encoding="utf-8")
for required_phrase in (
    "context.filesDir", "architect/observation", "latest.png", "latest.json", "captureId", "sourceCommit",
    "installedApkSha256", "rawUnredactedFramePersisted\", false", "privateReflectionContentIncluded\", false",
    "semanticAuxiliaryTextRedacted\", true", "ArchitectObservationPrivacy::shouldMaskPixels",
    "ArchitectVisualDiagnostics.inspect", "exportCapability", "immutableExport", "exportGrantTtlSeconds",
):
    require(required_phrase in observer, f"observer implementation missing: {required_phrase!r}")

bridge = (architect_dir / "ArchitectObservationBridge.kt").read_text(encoding="utf-8")
for required_phrase in (
    "Intent.ACTION_SEND_MULTIPLE", "Intent.FLAG_GRANT_READ_URI_PERMISSION", "Intent.createChooser",
    "ArchitectObservationProvider.uriFor", "ArchitectFrozenObservationExport", "observation.captureId",
    "createIntegrityBundle", "EXPORT_GRANT_TTL_SECONDS", "revokeUriPermission",
):
    require(required_phrase in bridge, f"Human-mediated frozen share bridge missing: {required_phrase!r}")

provider = (architect_dir / "ArchitectObservationProvider.kt").read_text(encoding="utf-8")
for required_phrase in (
    "MODE_READ_ONLY", "ALLOWED_FILES", "latest.png", "latest.json", "EXPORT_BUNDLE_FILE", "pathSegments.size != 2",
    "captureDirectory.parentFile != root", "Only capture-bound frozen Architect exports may be shared",
    "Architect observation provider is read-only",
):
    require(required_phrase in provider, f"bounded frozen observation provider missing: {required_phrase!r}")

visual_diagnostics = (architect_dir / "ArchitectVisualDiagnostics.kt").read_text(encoding="utf-8")
for required_phrase in (
    "MIN_TOUCH_TARGET_DP = 48.0", "smallTouchTargetCount", "clippedVisibleViewCount",
    "systemUiOverlapCandidateCount", "systemUiInsetsPx", "safeContentBoundsPx", "textOverlapCandidateCount",
):
    require(required_phrase in visual_diagnostics, f"visual diagnostics missing: {required_phrase!r}")

hope = (ROOT / "apps/android/app/src/main/java/org/arcanum/nativehost/hope/HopeReflectionPanel.kt").read_text(encoding="utf-8")
require(hope.count("ArchitectObservationPrivacy.markPrivateText(this)") >= 2, "Hope input and recalled reflection must both be explicitly marked private")

main_activity = (ROOT / "apps/android/app/src/main/java/org/arcanum/nativehost/MainActivity.kt").read_text(encoding="utf-8")
for required_phrase in (
    "ArchitectObserver", "ArchitectObservationBridge", "ArchitectPulseButton", 'trigger = "human_pulse"',
    'trigger = "human_share"', 'trigger = "initial_render"', 'trigger = "window_focus"', "hold A to share",
    "LinearLayout.HORIZONTAL", "setOnApplyWindowInsetsListener", "systemWindowInsetBottom", "window.navigationBarColor = Color.BLACK",
):
    require(required_phrase in main_activity, f"MainActivity missing Architect/inset-safe hook: {required_phrase!r}")

build_gradle = (ROOT / "apps/android/app/build.gradle.kts").read_text(encoding="utf-8")
for required_phrase in ("ARCANUM_SOURCE_COMMIT", "arcanumSourceCommit", "buildConfig = true", "CE-W04-A09"):
    require(required_phrase in build_gradle, f"Android build provenance missing: {required_phrase!r}")
version_code_match = re.search(r"\bversionCode\s*=\s*(\d+)\b", build_gradle)
require(version_code_match is not None, "Android build provenance missing: versionCode")
require(int(version_code_match.group(1)) >= 9, "A09 requires monotonic Android versionCode >= 9")

workflow = (ROOT / ".github/workflows/verify-ce-w04-architect-observer.yml").read_text(encoding="utf-8")
require('-ParcanumSourceCommit="$SOURCE_HEAD"' in workflow, "exact-head Android build must inject the checked-out source commit")
unit_test = ROOT / "apps/android/app/src/test/java/org/arcanum/nativehost/architect/ArchitectObservationContractTest.kt"
require(unit_test.is_file(), "Architect observation contract unit test is missing")

print("PASS CE-W04 Architect Observer + Bridge: A09 Human-approved bounded action registry, repository-target continuity, loopback transport, frozen observation export, provenance, and inherited privacy controls")
