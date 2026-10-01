#!/usr/bin/env python3
"""Verify the exact A14.2 Android candidate identity without installing it."""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "4c5318eeaf8d50b77f8183259c8f07c16ca85ebc"
sys.path.insert(0, str(ROOT / "scripts/update"))
from trusted_update_preflight import inspect  # noqa: E402


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"FAIL CE-W04-A14.2 candidate: {message}")


subprocess.run(
    ("git", "merge-base", "--is-ancestor", BASE, "HEAD"),
    cwd=ROOT,
    env={**os.environ, "GIT_OPTIONAL_LOCKS": "0"},
    check=True,
)

# Preserve the certified A14.2 identity while successors advance independently.
A14_2_HEAD = "d2e30b275234c820708cdcc0b025a38be9a5fe61"
build = subprocess.check_output(
    ("git", "show", f"{A14_2_HEAD}:apps/android/app/build.gradle.kts"),
    cwd=ROOT, text=True,
)
current_build = (ROOT / "apps/android/app/build.gradle.kts").read_text()
current_code = re.search(r"\bversionCode\s*=\s*(\d+)\b", current_build)
require(current_code is not None and int(current_code.group(1)) >= 19, "successor versionCode regressed below A14.2")
panel = (
    ROOT
    / "apps/android/app/src/main/java/org/arcanum/nativehost/architect/ArchitectShellPanel.kt"
).read_text()

identity = (
    re.search(r"\bversionCode\s*=\s*(\d+)\b", build),
    re.search(r'\bversionName\s*=\s*"([^"]+)"', build),
    re.search(r'"\\"(CE-W04-[^\\]+)\\""', build),
)
require(all(identity), "Android build identity fields missing")
require(identity[0].group(1) == "19", "versionCode must be 19")
require(
    identity[1].group(1) == "0.1.14-cew04-a14-2",
    "versionName must be the A14.2 candidate",
)
require(identity[2].group(1) == "CE-W04-A14.2", "implementation arc must be A14.2")

for phrase in (
    '"CE-W04-A13.5" -> {',
    '"CE-W04-A14.2" -> {',
    'BuildConfig.VERSION_NAME == "0.1.14-cew04-a14-2"',
    "BuildConfig.VERSION_CODE == 19",
    'Regex("^[0-9a-f]{40}$").matches(source)',
    "File(appContext.applicationInfo.sourceDir)",
    'MessageDigest.getInstance("SHA-256")',
):
    require(phrase in panel, f"installed-artifact handoff missing {phrase}")

fixtures = ROOT / "tests/fixtures/trusted-update"
manifest = json.loads((fixtures / "valid.json").read_text())
observation = json.loads((fixtures / "candidate-observation.json").read_text())
manifest["package"]["versionName"] = "0.1.14-cew04-a14-2"
observation["versionName"] = "0.1.14-cew04-a14-2"

with tempfile.TemporaryDirectory(prefix="arcanum-a14-2-identity-") as directory:
    manifest_path = Path(directory) / "manifest.json"
    observation_path = Path(directory) / "observation.json"
    for path, value in ((manifest_path, manifest), (observation_path, observation)):
        path.write_text(json.dumps(value, sort_keys=True, separators=(",", ":")))
    receipt = inspect(manifest_path, fixtures / "trust-context.json", observation_path)
    require(receipt["decision"] == "pass", "offline candidate was rejected")
    require(
        receipt["candidateVersionCode"] == 19
        and receipt["candidateVersionName"] == "0.1.14-cew04-a14-2",
        "offline receipt identity mismatch",
    )
    require(not receipt["eligibleForInstallDecision"], "candidate granted install decision")

print("PASS CE-W04-A14.2 exact Android candidate identity and A14.1 trust compatibility")
