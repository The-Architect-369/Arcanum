#!/usr/bin/env python3
"""Fail-closed static checks for CE-W04-A13.4 native workspace verification."""

from __future__ import annotations

import io
import os
import re
import subprocess
import sys
import tarfile
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
A12_HEAD = "66a6479d9df921540d117820ed0d9b66eb59ba7e"
A13_1_HEAD = "5f8552eff460d61aa720105b6c8c23321e311809"
A13_2_HEAD = "608c6bd1a8283ef20e07160c2d32ac15ec24b41a"
A13_3_HEAD = "e06143883fb67c7185e98d65845153d6444c1b05"
ANDROID_NS = "{http://schemas.android.com/apk/res/android}"

REQUIRED = (
    "docs/specs/app/ce-w04-a13-native-mobile-operator-bridge.md",
    "docs/specs/app/ce-w04-a13-2-zero-copy-pairing.md",
    "docs/specs/app/ce-w04-a13-3-broker-lifecycle.md",
    "docs/specs/app/ce-w04-a13-4-native-workspace-verification.md",
    "apps/android/app/src/main/java/org/arcanum/nativehost/architect/TermuxOperatorBridge.kt",
    "apps/android/app/src/main/java/org/arcanum/nativehost/architect/TermuxOperatorResultService.kt",
    "apps/android/app/src/main/java/org/arcanum/nativehost/architect/ArchitectPairingStore.kt",
    "scripts/mobile/arcanum-operator.sh",
    "scripts/mobile/arcanum-operator-setup.sh",
    "scripts/mobile/arcanum-broker-lifecycle.py",
    "scripts/mobile/arcanum-workspace-verify.py",
    "scripts/mobile/test-arcanum-operator.sh",
    "scripts/mobile/test-arcanum-broker-lifecycle.sh",
    "scripts/mobile/test-arcanum-workspace-verify.py",
    "scripts/architect/test-termux-broker.sh",
    "scripts/architect/test-proposal-envelope.sh",
    "scripts/verify-ce-w04-architect-observer.py",
    "scripts/verify-ce-w04-a13.py",
)


def fail(message: str) -> None:
    raise SystemExit(f"FAIL CE-W04-A13.4: {message}")


def text(path: str) -> str:
    candidate = ROOT / path
    if not candidate.is_file():
        fail(f"missing required file: {path}")
    return candidate.read_text(encoding="utf-8")


def require(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def require_phrase(source: str, needle: str, label: str) -> None:
    require(needle in source, f"{label} missing required text: {needle}")


def forbid(source: str, needle: str, label: str) -> None:
    require(needle not in source, f"{label} contains forbidden text: {needle}")


for path in REQUIRED:
    require((ROOT / path).is_file(), f"missing required A13.3 path: {path}")

subprocess.run(
    ("git", "merge-base", "--is-ancestor", A13_1_HEAD, "HEAD"),
    cwd=ROOT,
    env={**os.environ, "GIT_OPTIONAL_LOCKS": "0"},
    shell=False,
    check=True,
)

subprocess.run(
    ("git", "merge-base", "--is-ancestor", A13_2_HEAD, "HEAD"),
    cwd=ROOT,
    env={**os.environ, "GIT_OPTIONAL_LOCKS": "0"},
    shell=False,
    check=True,
)

subprocess.run(
    ("git", "merge-base", "--is-ancestor", A13_3_HEAD, "HEAD"),
    cwd=ROOT,
    env={**os.environ, "GIT_OPTIONAL_LOCKS": "0"},
    shell=False,
    check=True,
)

archive = subprocess.run(
    ("git", "archive", "--format=tar", A12_HEAD),
    cwd=ROOT,
    env={**os.environ, "GIT_OPTIONAL_LOCKS": "0"},
    shell=False,
    check=True,
    stdout=subprocess.PIPE,
).stdout

with tempfile.TemporaryDirectory(prefix="arcanum-a13-a12-") as tmp:
    destination = Path(tmp)
    with tarfile.open(fileobj=io.BytesIO(archive), mode="r:") as bundle:
        for member in bundle.getmembers():
            resolved = (destination / member.name).resolve()
            require(
                resolved == destination or destination in resolved.parents,
                "certified predecessor archive contains an unsafe path",
            )
        bundle.extractall(destination)

    subprocess.run(
        (sys.executable, "scripts/verify-ce-w04-a12.py"),
        cwd=destination,
        env={**os.environ, "GIT_OPTIONAL_LOCKS": "0", "PYTHONDONTWRITEBYTECODE": "1"},
        shell=False,
        check=True,
    )

spec = text("docs/specs/app/ce-w04-a13-native-mobile-operator-bridge.md")
for phrase in (
    "probe_workspace",
    "com.termux.permission.RUN_COMMAND",
    "allow-external-apps=true",
    "authorityEffect=none",
    "repositoryMutation=false",
    "No UI, model output, proposal envelope, broker response, remote response, or caller-supplied",
    "versionCode = 14",
    "CE-W04-A13.1",
):
    require_phrase(spec, phrase, "A13.1 spec")

a13_2_spec = text("docs/specs/app/ce-w04-a13-2-zero-copy-pairing.md")
for phrase in (
    "CE-W04-A13.2",
    A13_1_HEAD,
    "pair_native_client",
    "The pairing code is never displayed in the native UI",
    'repositoryMutation=false',
    'authorityEffect=none',
    "versionCode = 15",
):
    require_phrase(a13_2_spec, phrase, "A13.2 spec")

a13_3_spec = text("docs/specs/app/ce-w04-a13-3-broker-lifecycle.md")
for phrase in (
    "CE-W04-A13.3",
    A13_2_HEAD,
    "start_broker",
    "stop_broker",
    "127.0.0.1:8765",
    "PID + `/proc` start-time + exact-argv ownership binding",
    'repositoryMutation=false',
    'authorityEffect="none"',
    "versionCode = 16",
):
    require_phrase(a13_3_spec, phrase, "A13.3 spec")

a13_4_spec = text("docs/specs/app/ce-w04-a13-4-native-workspace-verification.md")
for phrase in (
    "CE-W04-A13.4",
    A13_3_HEAD,
    "verify_workspace",
    "scripts/verify-sync.sh",
    "architect-workspace-verification.log",
    "repositoryMutation=false",
    'authorityEffect="none"',
    "versionCode = 17",
):
    require_phrase(a13_4_spec, phrase, "A13.4 spec")

manifest_path = ROOT / "apps/android/app/src/main/AndroidManifest.xml"
manifest = ET.parse(manifest_path).getroot()
permissions = {
    node.attrib.get(ANDROID_NS + "name")
    for node in manifest.findall("uses-permission")
}
require(
    "com.termux.permission.RUN_COMMAND" in permissions,
    "Android manifest does not request Termux RUN_COMMAND permission",
)
queries = manifest.find("queries")
require(queries is not None, "Android manifest missing package visibility queries")
visible_packages = {
    node.attrib.get(ANDROID_NS + "name")
    for node in queries.findall("package")
}
require(
    visible_packages == {"com.termux"},
    "A13.1 package visibility must name exactly com.termux",
)
application = manifest.find("application")
require(application is not None, "Android manifest missing application")
services = {
    node.attrib.get(ANDROID_NS + "name"): node
    for node in application.findall("service")
}
result_service = services.get(".architect.TermuxOperatorResultService")
require(result_service is not None, "A13.1 result service is not registered")
require(
    result_service.attrib.get(ANDROID_NS + "exported") == "false",
    "A13.1 result service must be non-exported",
)

bridge = text(
    "apps/android/app/src/main/java/org/arcanum/nativehost/architect/TermuxOperatorBridge.kt"
)
for phrase in (
    'PROBE_WORKSPACE(',
    'wireId = "probe_workspace"',
    'PAIR_NATIVE_CLIENT(',
    'wireId = "pair_native_client"',
    'fun pairNativeClient(',
    'parsePairingMaterial(',
    '"/data/data/com.termux/files/home/.config/arcanum/architect-broker.secret"',
    'PAIRING_CODE_PATTERN.matches(pairingCode)',
    'START_BROKER(',
    'wireId = "start_broker"',
    'STOP_BROKER(',
    'wireId = "stop_broker"',
    'fun startBroker(',
    'fun stopBroker(',
    'runBrokerLifecycle(',
    'parseBrokerLifecycle(',
    'VERIFY_WORKSPACE(',
    'wireId = "verify_workspace"',
    'fun verifyWorkspace(',
    'parseWorkspaceVerification(',
    '"/data/data/com.termux/files/home/.config/arcanum/architect-workspace-verification.log"',
    '"com.termux.app.RunCommandService"',
    '"com.termux.RUN_COMMAND"',
    '"com.termux.RUN_COMMAND_PATH"',
    '"com.termux.RUN_COMMAND_ARGUMENTS"',
    '"com.termux.RUN_COMMAND_WORKDIR"',
    '"com.termux.RUN_COMMAND_PENDING_INTENT"',
    '"/data/data/com.termux/files/home/Arcanum/scripts/mobile/arcanum-operator.sh"',
    '"/data/data/com.termux/files/home/Arcanum"',
    'arrayOf(operation.wireId)',
    "PendingIntent.FLAG_ONE_SHOT",
    "PendingIntent.FLAG_MUTABLE",
    "resolveService",
):
    require_phrase(bridge, phrase, "TermuxOperatorBridge")
require(
    bridge.count("PROBE_WORKSPACE(") == 1
    and bridge.count("PAIR_NATIVE_CLIENT(") == 1
    and bridge.count("START_BROKER(") == 1
    and bridge.count("STOP_BROKER(") == 1
    and bridge.count("VERIFY_WORKSPACE(") == 1,
    "A13.4 native operator registry must contain exactly probe, pair, start, stop, and verify",
)
for forbidden_text in (
    "RUN_COMMAND_STDIN",
    "EXTRA_STDIN",
    "Runtime.getRuntime()",
    "ProcessBuilder(",
    "bash -c",
    "sh -c",
):
    forbid(bridge, forbidden_text, "TermuxOperatorBridge")

service = text(
    "apps/android/app/src/main/java/org/arcanum/nativehost/architect/TermuxOperatorResultService.kt"
)
for phrase in (
    "ConcurrentHashMap",
    "EXTRA_EXECUTION_ID",
    "EXTRA_OPERATION_ID",
    "EXTRA_NONCE",
    'private const val TERMUX_RESULT_BUNDLE = "result"',
    "stdoutTruncated",
    "stderrTruncated",
):
    require_phrase(service, phrase, "TermuxOperatorResultService")

operator = text("scripts/mobile/arcanum-operator.sh")
for phrase in (
    'export GIT_OPTIONAL_LOCKS=0',
    'CANONICAL_REPO="$HOME/Arcanum"',
    'LEGACY_REPO="$HOME/work/Arcanum"',
    "probe_workspace | pair_native_client | start_broker | stop_broker | verify_workspace)",
    'PAIRING_SECRET_FILE="$PAIRING_SECRET_DIR/architect-broker.secret"',
    'LIFECYCLE_HELPER="$SCRIPT_DIR/arcanum-broker-lifecycle.py"',
    'VERIFY_HELPER="$SCRIPT_DIR/arcanum-workspace-verify.py"',
    'exec python3 -S "$LIFECYCLE_HELPER" "$OPERATION_ID"',
    'exec python3 -S "$VERIFY_HELPER" "$OPERATION_ID"',
    "secrets.token_hex(32)",
    "os.O_EXCL",
    "os.fchmod(fd, 0o600)",
    '"operationId": "pair_native_client"',
    '"secretCreated": secret_created',
    '"pairingCode": pairing_code',
    "repositoryMutation",
    '"authorityEffect": "none"',
):
    require_phrase(operator, phrase, "A13.1 operator")
for forbidden_text in (
    "eval ",
    "bash -c",
    "sh -c",
    "git push",
    "git commit",
    "git add",
    "git reset",
    "git clean",
    "git checkout",
    "git switch",
    "git merge",
    "git rebase",
    "git apply",
    "git fetch",
    "git pull",
):
    forbid(operator, forbidden_text, "A13.1 operator")

lifecycle = text("scripts/mobile/arcanum-broker-lifecycle.py")
for phrase in (
    'BROKER_HOST = "127.0.0.1"',
    "BROKER_PORT = 8765",
    'LIFECYCLE_STATE = CONFIG_DIR / "architect-broker.lifecycle.json"',
    'BROKER_LOG = CONFIG_DIR / "architect-broker.log"',
    'BROKER_SCRIPT = WORKSPACE / "scripts" / "architect" / "termux-broker.py"',
    'sys.argv[1] not in {"start_broker", "stop_broker"}',
    "subprocess.Popen(",
    "shell=False",
    "start_new_session=True",
    "os.kill(pid, signal.SIGTERM)",
    "os.kill(pid, signal.SIGKILL)",
    'process_start_ticks(pid) != state["procStartTicks"]',
    'process_cmdline(pid) != state["argv"]',
    'LifecycleError("broker_port_unavailable")',
    'LifecycleError("unowned_broker_detected")',
    '"repositoryMutation": False',
    '"authorityEffect": "none"',
    '"runtimeEffect": runtime_effect',
):
    require_phrase(lifecycle, phrase, "A13.3 lifecycle helper")
for forbidden_text in (
    "shell=True",
    "os.system(",
    "eval(",
    "git push",
    "git commit",
    "git add",
    "git reset",
    "git clean",
    "git checkout",
    "git switch",
    "git merge",
    "git rebase",
    "git apply",
    "git fetch",
    "git pull",
):
    forbid(lifecycle, forbidden_text, "A13.3 lifecycle helper")

workspace_verify = text("scripts/mobile/arcanum-workspace-verify.py")
for phrase in (
    'VERIFY_SCRIPT = WORKSPACE / "scripts" / "verify-sync.sh"',
    'VERIFICATION_LOG = CONFIG_DIR / "architect-workspace-verification.log"',
    "VERIFICATION_TIMEOUT_SECONDS = 420",
    "subprocess.Popen(",
    "shell=False",
    "start_new_session=True",
    "os.killpg(process.pid, signal.SIGTERM)",
    'env["GIT_OPTIONAL_LOCKS"] = "0"',
    '"operationId": "verify_workspace"',
    '"authorityEffect": "none"',
    '"repositoryMutation": False',
    '"runtimeEffect": "none"',
    'VerificationError("working_tree_not_clean")',
    'VerificationError("repository_state_changed")',
):
    require_phrase(workspace_verify, phrase, "A13.4 workspace verifier")
for forbidden_text in (
    "shell=True",
    "os.system(",
    "eval(",
    "git push",
    "git commit",
    "git add",
    "git reset",
    "git clean",
    "git checkout",
    "git switch",
    "git merge",
    "git rebase",
    "git apply",
    "git fetch",
    "git pull",
):
    forbid(workspace_verify, forbidden_text, "A13.4 workspace verifier")

panel = text(
    "apps/android/app/src/main/java/org/arcanum/nativehost/architect/ArchitectShellPanel.kt"
)
for phrase in (
    "Connect local workspace",
    "Run read-only workspace probe?",
    "A13.1 workspace",
    "Legacy checkout detected",
    "Pair native client from Termux?",
    "Replace native pairing from Termux?",
    "operatorBridge.pairNativeClient",
    "brokerClient.pair(pairing.pairingCode)",
    "The pairing code is never displayed or copied by the Human",
    "Start local broker",
    "Stop local broker",
    "Start local broker?",
    "Stop local broker?",
    "operatorBridge.startBroker",
    "operatorBridge.stopBroker",
    "Verify local workspace",
    "Run canonical workspace verification?",
    "operatorBridge.verifyWorkspace",
    "A13.4 workspace verification",
    "does not require ",
    "the broker or pairing",
    "A11 still requires separate ",
    "authenticated Human approval for each registered action",
    "An unowned process on port 8765 is never ",
    "signaled. This does not mutate the repository",
):
    require_phrase(panel, phrase, "Architect shell panel")
for forbidden_text in (
    'hint = "64-character pairing code"',
    "Enter the 64-hex-character pairing code generated there.",
    "requestPairingCode()",
):
    forbid(panel, forbidden_text, "Architect shell panel")

pairing_store = text(
    "apps/android/app/src/main/java/org/arcanum/nativehost/architect/ArchitectPairingStore.kt"
)
for phrase in (
    'KEYSTORE_PROVIDER = "AndroidKeyStore"',
    'CIPHER_TRANSFORMATION = "AES/GCM/NoPadding"',
    "secret.fill(0)",
    'Regex("^[0-9a-f]{64}$")',
):
    require_phrase(pairing_store, phrase, "ArchitectPairingStore")

build = text("apps/android/app/build.gradle.kts")
require_phrase(build, 'versionName = "0.1.13-cew04-a13-4"', "Android build")
require_phrase(build, '"\\"CE-W04-A13.4\\""', "Android build")
version_code = re.search(r"\bversionCode\s*=\s*(\d+)\b", build)
require(
    version_code is not None and int(version_code.group(1)) == 17,
    "A13.4 Android versionCode must be exactly 17",
)

bootstrap = text("scripts/mobile/termux-bootstrap.sh")
require_phrase(
    bootstrap,
    'REPO_DIR="${ARCANUM_REPO_DIR:-$HOME/Arcanum}"',
    "Termux bootstrap",
)
forbid(
    bootstrap,
    'REPO_DIR="${ARCANUM_REPO_DIR:-$WORKSPACE_ROOT/Arcanum}"',
    "Termux bootstrap",
)

mobile_doc = text("docs/mobile/termux-verification.md")
mobile_doc_normalized = " ".join(mobile_doc.split())
for phrase in (
    "A13.1 native operator setup",
    "allow-external-apps=true",
    "Run commands in Termux environment",
    "$HOME/Arcanum",
    "A13.2 zero-copy native pairing",
    "pair_native_client",
    "No 64-character secret is copied or displayed",
    "Broker start/stop remains outside A13.2",
    "A13.3 Human-triggered broker lifecycle",
    "start_broker",
    "stop_broker",
    "architect-broker.lifecycle.json",
    "An unknown listener on port `8765` fails closed",
    "A13.4 native workspace verification",
    "verify_workspace",
    "architect-workspace-verification.log",
    "No broker session or pairing is required",
):
    require_phrase(mobile_doc_normalized, phrase, "Termux verification doc")

broker_test = text("scripts/architect/test-termux-broker.sh")
for phrase in (
    'A11_CERTIFIED_HEAD="5db926762d249314083ac9dbe549fd91ec613c22"',
    'git -C "$REPO_ROOT" archive --format=tar "$A11_CERTIFIED_HEAD"',
    'python3 "$A11_VERIFY_ROOT/scripts/verify-ce-w04-a11.py"',
):
    require_phrase(
        broker_test,
        phrase,
        "A11 broker integration predecessor isolation",
    )

forbid(
    broker_test,
    'python3 "$REPO_ROOT/scripts/verify-ce-w04-a11.py"',
    "A11 broker integration live predecessor invocation",
)

proposal_test = text("scripts/architect/test-proposal-envelope.sh")
for phrase in (
    'A12_CERTIFIED_HEAD="66a6479d9df921540d117820ed0d9b66eb59ba7e"',
    'git -C "$ROOT" archive --format=tar "$A12_CERTIFIED_HEAD"',
    'python3 "$A12_VERIFY_ROOT/scripts/verify-ce-w04-a12.py"',
):
    require_phrase(
        proposal_test,
        phrase,
        "A12 proposal integration predecessor isolation",
    )

forbid(
    proposal_test,
    "python3 scripts/verify-ce-w04-a12.py",
    "A12 proposal integration live predecessor invocation",
)

observer_verifier = text("scripts/verify-ce-w04-architect-observer.py")
for phrase in (
    "ARCANUM_IMPLEMENTATION_ARC",
    "implementation_arc_match = re.search(",
    "Android implementation arc must not regress below CE-W04-A11",
    "Android versionCode must remain monotonic from A11 baseline >= 13",
):
    require_phrase(
        observer_verifier,
        phrase,
        "CE-W04 successor-aware observer verifier",
    )

forbid(
    observer_verifier,
    'for required_phrase in ("ARCANUM_SOURCE_COMMIT", "arcanumSourceCommit", "buildConfig = true", "CE-W04-A11"):',
    "CE-W04 observer verifier stale A11 provenance pin",
)

sync = text("scripts/verify-sync.sh")
for phrase in (
    "python3 scripts/verify-ce-w04-a13.py",
    "bash -n scripts/mobile/arcanum-operator.sh",
    "bash -n scripts/mobile/test-arcanum-operator.sh",
    "bash -n scripts/mobile/test-arcanum-broker-lifecycle.sh",
    "python3 -m py_compile \\",
    "scripts/mobile/arcanum-workspace-verify.py",
    "scripts/mobile/test-arcanum-workspace-verify.py",
    "bash scripts/mobile/test-arcanum-operator.sh",
    "bash scripts/mobile/test-arcanum-broker-lifecycle.sh",
    "python3 scripts/mobile/test-arcanum-workspace-verify.py",
):
    require_phrase(sync, phrase, "verify-sync")
forbid(
    sync,
    "python3 scripts/verify-ce-w04-a12.py",
    "live verify-sync predecessor invocation",
)

print(
    "PASS CE-W04-A13.4 frozen A12 regression, certified A13.3 ancestry, "
    "fixed native workspace verification, repository-state attestation, and unchanged authority ceiling"
)
