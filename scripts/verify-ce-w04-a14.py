#!/usr/bin/env python3
"""Fail-closed verification for CE-W04-A14.1 trusted update preflight."""

from __future__ import annotations

import ast
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

BASE = (
    "7b781208e08cccea14e059bb1b1869bfc4e79bc7"
)

REQUIRED = (
    "docs/specs/app/ce-w04-a14-trusted-update-preflight.md",
    "docs/specs/app/trusted-update-manifest.schema.json",
    "scripts/update/trusted_update_preflight.py",
    "scripts/update/test_trusted_update_preflight.py",
    "scripts/verify-ce-w04-a14.py",
    "tests/fixtures/trusted-update/valid.json",
    "tests/fixtures/trusted-update/trust-context.json",
    "tests/fixtures/trusted-update/candidate-observation.json",
    "tests/fixtures/trusted-update/wrong-package.json",
    "tests/fixtures/trusted-update/untrusted-signer.json",
    "tests/fixtures/trusted-update/untrusted-signer-observation.json",
    "tests/fixtures/trusted-update/downgrade.json",
    "tests/fixtures/trusted-update/downgrade-observation.json",
    "tests/fixtures/trusted-update/runtime-incompatible.json",
    "tests/fixtures/trusted-update/unknown-field.json",
    "tests/fixtures/trusted-update/wrong-digest-observation.json",
)


def fail(message: str) -> None:
    raise SystemExit(
        f"FAIL CE-W04-A14.1: {message}"
    )


def require(
    condition: bool,
    message: str,
) -> None:
    if not condition:
        fail(message)


def text(path: str) -> str:
    candidate = ROOT / path

    require(
        candidate.is_file(),
        f"missing required file: {path}",
    )

    return candidate.read_text(
        encoding="utf-8"
    )


for path in REQUIRED:
    require(
        (ROOT / path).is_file(),
        f"missing required A14.1 path: {path}",
    )


subprocess.run(
    (
        "git",
        "merge-base",
        "--is-ancestor",
        BASE,
        "HEAD",
    ),
    cwd=ROOT,
    env={
        **os.environ,
        "GIT_OPTIONAL_LOCKS": "0",
    },
    shell=False,
    check=True,
)


subprocess.run(
    (
        sys.executable,
        "scripts/verify-ce-w04-a13.py",
    ),
    cwd=ROOT,
    env={
        **os.environ,
        "GIT_OPTIONAL_LOCKS": "0",
        "PYTHONDONTWRITEBYTECODE": "1",
    },
    shell=False,
    check=True,
)


schema = json.loads(
    text(
        "docs/specs/app/"
        "trusted-update-manifest.schema.json"
    )
)

require(
    schema.get(
        "$schema"
    )
    == "https://json-schema.org/draft/2020-12/schema",
    "manifest schema is not Draft 2020-12",
)

require(
    schema.get("additionalProperties") is False,
    "manifest schema root is not closed",
)

for section in (
    "package",
    "artifact",
    "build",
    "compatibility",
):
    node = schema[
        "properties"
    ][section]

    require(
        node.get(
            "additionalProperties"
        )
        is False,
        f"schema section is not closed: {section}",
    )

companion = (
    schema["properties"]
    ["compatibility"]
    ["properties"]
    ["companion"]
)

require(
    companion.get(
        "additionalProperties"
    )
    is False,
    "companion schema is not closed",
)


validator_path = (
    ROOT
    / "scripts/update/"
    "trusted_update_preflight.py"
)

validator_source = (
    validator_path.read_text(
        encoding="utf-8"
    )
)

tree = ast.parse(
    validator_source,
    filename=str(validator_path),
)

forbidden_import_roots = {
    "http",
    "requests",
    "socket",
    "subprocess",
    "urllib",
}

for node in ast.walk(tree):

    if isinstance(node, ast.Import):
        for alias in node.names:
            root = alias.name.split(".", 1)[0]

            require(
                root
                not in forbidden_import_roots,
                "validator imports forbidden "
                f"effect surface: {alias.name}",
            )

    if isinstance(
        node,
        ast.ImportFrom,
    ):
        root = (
            node.module or ""
        ).split(".", 1)[0]

        require(
            root
            not in forbidden_import_roots,
            "validator imports forbidden "
            f"effect surface: {node.module}",
        )


for forbidden in (
    "--url",
    "--download",
    "--install",
    "PackageInstaller",
    "adb install",
    "git pull",
    "git reset",
):
    require(
        forbidden not in validator_source,
        "validator contains forbidden "
        f"effect surface: {forbidden}",
    )


for required in (
    "--manifest",
    "--trust-context",
    "--observation",
    "MAX_MANIFEST_BYTES = 16 * 1024",
    "MAX_APK_BYTES = 256 * 1024 * 1024",
    'APPLICATION_ID = "org.arcanum.nativehost"',
    'CHANNEL = "pre-genesis"',
    'BROKER_CONTRACT = "arcanum-termux-broker/1.1"',
    'OPERATOR_CONTRACT = "ce-w04-a13.5/five-op-v1"',
):
    require(
        required in validator_source,
        f"validator missing contract: {required}",
    )


fixture_root = (
    ROOT
    / "tests/fixtures/trusted-update"
)

for path in REQUIRED:
    if not path.startswith(
        "tests/fixtures/trusted-update/"
    ):
        continue

    raw = (ROOT / path).read_bytes()

    require(
        not raw.endswith(b"\n"),
        f"fixture has trailing newline: {path}",
    )

    parsed = json.loads(
        raw.decode("utf-8")
    )

    canonical = json.dumps(
        parsed,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")

    require(
        raw == canonical,
        f"fixture is not canonical JSON: {path}",
    )


subprocess.run(
    (
        sys.executable,
        "scripts/update/"
        "test_trusted_update_preflight.py",
    ),
    cwd=ROOT,
    env={
        **os.environ,
        "PYTHONDONTWRITEBYTECODE": "1",
    },
    shell=False,
    check=True,
)


result = subprocess.run(
    (
        sys.executable,
        "scripts/update/"
        "trusted_update_preflight.py",
        "--manifest",
        "tests/fixtures/trusted-update/"
        "valid.json",
        "--trust-context",
        "tests/fixtures/trusted-update/"
        "trust-context.json",
        "--observation",
        "tests/fixtures/trusted-update/"
        "candidate-observation.json",
    ),
    cwd=ROOT,
    env={
        **os.environ,
        "PYTHONDONTWRITEBYTECODE": "1",
    },
    shell=False,
    check=True,
    stdout=subprocess.PIPE,
    text=True,
)

receipt = json.loads(
    result.stdout
)

expected_receipt = {
    "decision": "pass",
    "readyForTrustedDistributionInspection": True,
    "eligibleForInstallDecision": False,
    "installPerformed": False,
    "repositoryMutation": False,
    "networkUsed": False,
    "networkRequired": False,
    "redirectPolicy": "deny",
    "cacheMaxAgeSeconds": 0,
    "authorityEffect": "none",
    "promotionEvidence":
        "manifest-bound-offline-stage1",
}

for key, expected in (
    expected_receipt.items()
):
    require(
        receipt.get(key) == expected,
        f"receipt contract mismatch: {key}",
    )


spec_source = text(
    "docs/specs/app/"
    "ce-w04-a14-trusted-update-preflight.md"
)

for phrase in (
    "A14 — Trusted Update Inspection & Distribution Preflight",
    "A13.5 native UX/artifact handoff",
    "A15 owns own-package installation and recovery",
    "A16 owns local continuity identity",
    "A14 remains open after A14.1",
):
    require(
        phrase in spec_source,
        f"A14.1 spec missing: {phrase}",
    )


sync_source = text(
    "scripts/verify-sync.sh"
)

require(
    "scripts/verify-ce-w04-a14.py"
    in sync_source,
    "verify-sync does not invoke A14 verifier",
)

require(
    "A13.5 native UX/artifact handoff"
    in sync_source,
    "A13.5 frozen verification wording changed",
)


print(
    "PASS CE-W04-A14.1 offline trusted-update "
    "preflight and unchanged authority ceiling"
)
