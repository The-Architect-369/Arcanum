#!/usr/bin/env python3
"""Static CE-W04-A12 contract verifier."""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_A11_BLOBS = {
    "docs/specs/app/ce-w04-a11-verified-architect-session.md": "57399fbbbbcd3d11ffbc37ccef542f43ce086281",
    "scripts/verify-ce-w04-a11.py": "b6612a080384d73b2aa73fc6d1525ce732c26e73",
    "scripts/architect/test-termux-broker.sh": "09248f299ee491f69fbe28c89f07f2c1e70c896c",
}
REQUIRED = (
    "docs/specs/app/ce-w04-a12-architect-proposal-envelope.md",
    "docs/governance/architectgpt/architect-proposal-envelope.schema.json",
    "scripts/architect/proposal_envelope.py",
    "scripts/architect/test-proposal-envelope.sh",
    "scripts/architect/termux-broker.py",
    "scripts/verify-ce-w04-a12.py",
    "apps/android/app/src/main/java/org/arcanum/nativehost/architect/ArchitectBrokerClient.kt",
    "apps/android/app/src/main/java/org/arcanum/nativehost/architect/ArchitectShellPanel.kt",
    "scripts/verify-sync.sh",
)


def fail(message: str) -> None:
    raise SystemExit(f"FAIL CE-W04-A12: {message}")


def text(path: str) -> str:
    candidate = ROOT / path
    if not candidate.is_file():
        fail(f"missing required file: {path}")
    return candidate.read_text(encoding="utf-8")


def require(source: str, needle: str, label: str) -> None:
    if needle not in source:
        fail(f"{label} missing required contract text: {needle}")


def forbid(source: str, needle: str, label: str) -> None:
    if needle in source:
        fail(f"{label} contains forbidden source text: {needle}")


def git_hash_object(path: str) -> str:
    env = os.environ.copy()
    env["GIT_OPTIONAL_LOCKS"] = "0"
    result = subprocess.run(
        ("git", "hash-object", "--", path),
        cwd=ROOT,
        env=env,
        shell=False,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    return result.stdout.strip()


for required in REQUIRED:
    if not (ROOT / required).is_file():
        fail(f"missing required file: {required}")

for path, expected_blob in EXPECTED_A11_BLOBS.items():
    actual = git_hash_object(path)
    if actual != expected_blob:
        fail(f"frozen A11 file changed: {path} expected {expected_blob} got {actual}")

spec = text("docs/specs/app/ce-w04-a12-architect-proposal-envelope.md")
for phrase in (
    "exact 40-hex base commit",
    "externally trusted permitted scope",
    "authorityEffect",
    "applied",
    "docs/repo/repo-index.json",
    "GIT_OPTIONAL_LOCKS=0",
    "POST /proposal/review",
    "Verified candidate · not approved · not applied",
    "no `git apply`",
    "promotion to the next canonical baseline is separately authorized",
):
    require(spec, phrase, "A12 spec")

schema = json.loads(text("docs/governance/architectgpt/architect-proposal-envelope.schema.json"))
if schema.get("additionalProperties") is not False:
    fail("proposal schema must reject unknown fields")
required_fields = set(schema.get("required", []))
expected_fields = {
    "schemaVersion",
    "envelopeType",
    "repository",
    "baseCommit",
    "permittedPaths",
    "touchedPaths",
    "diffFormat",
    "unifiedDiff",
    "diffSha256",
    "proposalSha256",
}
if required_fields != expected_fields:
    fail("proposal schema required fields differ from the A12 envelope")

engine = text("scripts/architect/proposal_envelope.py")
for phrase in (
    'PROPOSAL_SCHEMA_VERSION = "1.0"',
    'ENVELOPE_TYPE = "architect_proposal"',
    'DIFF_FORMAT = "arcanum-unified-text-diff-v1"',
    'DIGEST_DOMAIN = "ARCANUM-A12-PROPOSAL-V1"',
    'DENIED_PATHS = {"docs/repo/repo-index.json"}',
    '"GIT_OPTIONAL_LOCKS"] = "0"',
    "shell=False",
    "def generate_envelope(",
    "def verify_proposal_envelope(",
    '"verification": "valid_candidate"',
    '"authorityEffect": "none"',
    '"applied": False',
    "canonical_file_diff",
    "parse_unified_diff",
):
    require(engine, phrase, "proposal engine")
for forbidden in (
    "shell=True",
    '("git", "apply"',
    '("git", "commit"',
    '("git", "push"',
    '("git", "merge"',
    '("git", "reset"',
    '("git", "checkout"',
    '("git", "switch"',
):
    forbid(engine, forbidden, "proposal engine")

broker = text("scripts/architect/termux-broker.py")
for phrase in (
    'SCHEMA_VERSION = "1.1"',
    'PROPOSAL_REVIEW_PATH = "/proposal/review"',
    'A12_REPOSITORY_ID = "The-Architect-369/Arcanum"',
    "sys.dont_write_bytecode = True",
    'path not in {"/session", "/execute"}',
    "review_proposal",
    "scopeAssertion",
    "architect_proposal_review_receipt",
    '"authorityEffect": "none"',
    '"applied": False',
):
    require(broker, phrase, "broker")
if broker.count('Command("') != 8:
    fail("A11 broker command registry must remain exactly eight entries")
for forbidden in ("git apply", "git commit", "git push", "git merge", "shell=True"):
    forbid(broker, forbidden, "broker")

client = text("apps/android/app/src/main/java/org/arcanum/nativehost/architect/ArchitectBrokerClient.kt")
for phrase in (
    'const val SCHEMA_VERSION = "1.1"',
    'private const val PROPOSAL_PATH = "/proposal/review"',
    "data class ProposalScope",
    "data class ProposalReviewResult",
    "fun reviewProposal(",
    '"architect_proposal_review_receipt"',
    '"valid_candidate"',
    '"none"',
):
    require(client, phrase, "Android broker client")
for command_id in (
    "git_status",
    "git_branch",
    "git_head",
    "git_log_10",
    "git_diff_names",
    "git_diff_stat",
    "verify_sync",
):
    require(client, f'"{command_id}"', "Android broker client")
if client.count('("git_') < 6 or "web_typecheck" in client:
    fail("Android A11 action allowlist changed or broker-only action leaked to Android")

panel = text("apps/android/app/src/main/java/org/arcanum/nativehost/architect/ArchitectShellPanel.kt")
for phrase in (
    "Review proposal envelope",
    "Confirm proposal review scope?",
    "Verified candidate · not approved · not applied",
    "does not approve or apply",
    "no arbitrary shell · no repository mutation · ",
    "no autonomous approval · no model provider",
):
    require(panel, phrase, "Architect shell panel")

sync = text("scripts/verify-sync.sh")
for phrase in (
    "python3 scripts/verify-ce-w04-a12.py",
    "bash -n scripts/architect/test-proposal-envelope.sh",
    "bash scripts/architect/test-proposal-envelope.sh",
):
    require(sync, phrase, "verify-sync")

# A12 remains additive to the frozen predecessor verifier.
subprocess.run(
    (sys.executable, "scripts/verify-ce-w04-a11.py"),
    cwd=ROOT,
    env={**os.environ, "GIT_OPTIONAL_LOCKS": "0"},
    shell=False,
    check=True,
)

print("PASS CE-W04-A12 static contract and frozen A11 regression")
