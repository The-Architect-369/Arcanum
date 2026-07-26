#!/usr/bin/env python3
"""Build a deterministic, non-mutating merge authorization package."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

SHA40 = re.compile(r"^[0-9a-f]{40}$")
SHA64 = re.compile(r"^[0-9a-f]{64}$")
REPOSITORY = "https://github.com/The-Architect-369/Arcanum.git"


def fail(message: str) -> None:
    raise SystemExit(message)


def canonical(data: dict[str, Any]) -> bytes:
    return json.dumps(data, sort_keys=True, separators=(",", ":")).encode()


def digest(data: dict[str, Any]) -> str:
    return hashlib.sha256(canonical(data)).hexdigest()


def load(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"unable to read {path}: {exc}")
    if not isinstance(value, dict):
        fail(f"{path} must contain a JSON object")
    return value


def git(*args: str) -> str:
    result = subprocess.run(["git", *args], text=True, capture_output=True)
    if result.returncode:
        fail(result.stderr.strip() or f"git {' '.join(args)} failed")
    return result.stdout.strip()


def require_digest(record: dict[str, Any], field: str) -> str:
    claimed = record.get(field)
    if not isinstance(claimed, str) or not SHA64.fullmatch(claimed):
        fail(f"invalid {field}")
    unsigned = dict(record)
    unsigned.pop(field, None)
    if digest(unsigned) != claimed:
        fail(f"{field} mismatch")
    return claimed


def require_sha(value: Any, field: str) -> str:
    if not isinstance(value, str) or not SHA40.fullmatch(value):
        fail(f"invalid {field}")
    return value


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("promotion_attestation", type=Path)
    parser.add_argument("ci_attestation", type=Path)
    parser.add_argument("provider_evidence", type=Path)
    parser.add_argument("merge_request", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    if git("status", "--porcelain"):
        fail("working tree must be clean")
    if git("branch", "--show-current") != "mobile":
        fail("current branch must be mobile")

    promotion = load(args.promotion_attestation)
    ci = load(args.ci_attestation)
    provider = load(args.provider_evidence)
    request = load(args.merge_request)

    promotion_sha = require_digest(promotion, "attestation_sha256")
    ci_sha = require_digest(ci, "attestation_sha256")
    provider_sha = require_digest(provider, "evidence_sha256")
    request_sha = require_digest(request, "request_sha256")

    commit = require_sha(request.get("expected_head_sha"), "expected_head_sha")
    head = git("rev-parse", "HEAD")
    remote = git("rev-parse", "refs/remotes/origin/mobile")
    if head != commit or remote != commit:
        fail("HEAD and origin/mobile must equal expected_head_sha")

    if request.get("schema_version") != "1.0" or request.get("record_type") != "merge_authorization_request":
        fail("invalid merge request type")
    expected_request = {
        "repository": REPOSITORY,
        "base_branch": "main",
        "head_branch": "mobile",
        "merge_method": "merge",
        "permission_class": "W3",
        "authorization": "explicit_human_request",
    }
    for field, value in expected_request.items():
        if request.get(field) != value:
            fail(f"invalid request field: {field}")
    if not isinstance(request.get("pull_request_number"), int) or request["pull_request_number"] < 1:
        fail("invalid pull_request_number")

    if promotion.get("record_type") != "promotion_attestation" or promotion.get("status") != "ready":
        fail("promotion attestation must be ready")
    if promotion.get("repository") != REPOSITORY or promotion.get("branch") != "mobile" or promotion.get("commit") != commit:
        fail("promotion attestation identity mismatch")
    checks = promotion.get("checks")
    if not isinstance(checks, dict) or checks.get("working_tree") != "clean" or checks.get("remote_sync") != "pass" or checks.get("repository_integrity") != "pass" or checks.get("typecheck") != "pass" or checks.get("build") != "pass" or checks.get("termux_failures") != 0:
        fail("promotion attestation checks are incomplete")

    if ci.get("record_type") != "ci_promotion_attestation" or ci.get("status") != "success":
        fail("CI attestation must be successful")
    if ci.get("repository") != REPOSITORY or ci.get("branch") != "mobile" or ci.get("commit") != commit:
        fail("CI attestation identity mismatch")
    required_checks = ci.get("checks")
    if not isinstance(required_checks, dict) or any(required_checks.get(name) != "pass" for name in ("repository_integrity", "typecheck", "production_build")):
        fail("CI attestation checks are incomplete")

    if provider.get("record_type") != "provider_evidence" or provider.get("provider") != "vercel":
        fail("provider evidence must describe Vercel")
    if provider.get("repository") != REPOSITORY or provider.get("branch") != "mobile" or provider.get("commit") != commit:
        fail("provider evidence identity mismatch")
    if provider.get("state") != "READY" or provider.get("target") != "preview":
        fail("provider preview must be READY")

    package = {
        "schema_version": "1.0",
        "record_type": "merge_authorization_package",
        "repository": REPOSITORY,
        "pull_request_number": request["pull_request_number"],
        "base_branch": "main",
        "head_branch": "mobile",
        "expected_head_sha": commit,
        "merge_method": "merge",
        "promotion_attestation_sha256": promotion_sha,
        "ci_attestation_sha256": ci_sha,
        "provider_evidence_sha256": provider_sha,
        "merge_request_sha256": request_sha,
        "permission_class": "W3",
        "authorization": "explicit_human_request",
        "status": "authorized",
        "merge_performed": False,
        "deploy_performed": False,
        "authority": "merge_authorization_evidence_only",
    }
    package["package_sha256"] = digest(package)
    rendered = json.dumps(package, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    else:
        sys.stdout.write(rendered)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
