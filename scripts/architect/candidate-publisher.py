#!/usr/bin/env python3
"""Validate and optionally fast-forward local mobile to an attested candidate commit."""
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
LOCAL_REF = "refs/heads/mobile"
REMOTE_REF = "refs/remotes/origin/mobile"


def fail(message: str) -> None:
    print(f"FAIL {message}", file=sys.stderr)
    raise SystemExit(1)


def run(command: list[str], cwd: Path) -> str:
    result = subprocess.run(
        command,
        cwd=cwd,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    if result.returncode != 0:
        fail(f"command failed ({' '.join(command)}): {result.stdout.strip()}")
    return result.stdout.strip()


def git(root: Path, *args: str) -> str:
    return run(["git", *args], root)


def sha256_json(value: dict[str, Any]) -> str:
    payload = json.dumps(value, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(payload).hexdigest()


def load_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"unable to read JSON {path}: {exc}")
    if not isinstance(value, dict):
        fail(f"expected JSON object: {path}")
    return value


def verify_digest(value: dict[str, Any], field: str, label: str) -> None:
    expected = str(value.get(field, ""))
    if SHA64.fullmatch(expected) is None:
        fail(f"{label} has invalid {field}")
    unsigned = dict(value)
    unsigned.pop(field, None)
    actual = sha256_json(unsigned)
    if actual != expected:
        fail(f"{label} digest mismatch: {actual} != {expected}")


def validate(
    root: Path,
    candidate: dict[str, Any],
    request: dict[str, Any],
) -> tuple[str, str, str]:
    verify_digest(candidate, "attestation_sha256", "candidate attestation")
    verify_digest(request, "request_sha256", "publication request")

    if candidate.get("schema_version") != "1.0":
        fail("unsupported candidate attestation schema version")
    if candidate.get("record_type") != "candidate_commit_attestation":
        fail("unsupported candidate attestation record type")
    if candidate.get("source_checkout_unchanged") is not True:
        fail("candidate attestation does not prove source checkout preservation")
    if candidate.get("refs_unchanged") is not True or candidate.get("ref_updated") is not False:
        fail("candidate attestation does not prove ref preservation")
    if candidate.get("authority") != "evidentiary_only":
        fail("candidate attestation authority mismatch")

    required = {
        "schema_version", "record_type", "repository", "target_branch",
        "expected_ref", "expected_old_commit", "candidate_commit_sha",
        "candidate_attestation_sha256", "permission_class", "authorization",
        "summary", "request_sha256",
    }
    missing = sorted(required - request.keys())
    if missing:
        fail(f"publication request missing fields: {', '.join(missing)}")
    if request.get("schema_version") != "1.0":
        fail("unsupported publication request schema version")
    if request.get("record_type") != "candidate_ref_publication_request":
        fail("unsupported publication request record type")
    if request.get("target_branch") != "mobile" or candidate.get("target_branch") != "mobile":
        fail("publication target must be mobile")
    if request.get("expected_ref") != LOCAL_REF:
        fail(f"publication request expected_ref must be {LOCAL_REF}")
    if request.get("permission_class") != "W2":
        fail("publication request permission_class must be W2")
    if request.get("authorization") != "explicit_human_request":
        fail("publication request lacks explicit human authorization marker")
    if not str(request.get("summary", "")).strip():
        fail("publication request summary is required")

    base = str(candidate.get("base_commit", ""))
    candidate_sha = str(candidate.get("candidate_commit_sha", ""))
    for label, value in (("base_commit", base), ("candidate_commit_sha", candidate_sha)):
        if SHA40.fullmatch(value) is None:
            fail(f"candidate attestation has invalid {label}")

    bindings = {
        "repository": candidate.get("repository"),
        "expected_old_commit": base,
        "candidate_commit_sha": candidate_sha,
        "candidate_attestation_sha256": candidate.get("attestation_sha256"),
    }
    for field, expected in bindings.items():
        if request.get(field) != expected:
            fail(f"publication request {field} binding mismatch")

    if git(root, "branch", "--show-current") != "mobile":
        fail("publisher must run from the mobile branch")
    if git(root, "status", "--porcelain"):
        fail("source checkout must be clean")

    head = git(root, "rev-parse", "HEAD")
    local = git(root, "rev-parse", LOCAL_REF)
    remote = git(root, "rev-parse", REMOTE_REF)
    if head != base or local != base or remote != base:
        fail("HEAD, local mobile, origin/mobile, and expected base must match exactly")

    if git(root, "cat-file", "-t", candidate_sha) != "commit":
        fail("candidate object is not a commit")
    if git(root, "show", "-s", "--format=%P", candidate_sha) != base:
        fail("candidate commit must have the exact current mobile head as its sole parent")
    if git(root, "show", "-s", "--format=%T", candidate_sha) != candidate.get("tree_sha"):
        fail("candidate tree does not match attestation")
    if git(root, "merge-base", "--is-ancestor", base, candidate_sha):
        pass
    return base, candidate_sha, request["request_sha256"]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("candidate_attestation", type=Path)
    parser.add_argument("publication_request", type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--confirm", default="")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    root = Path(git(Path.cwd(), "rev-parse", "--show-toplevel"))
    candidate = load_json(args.candidate_attestation.resolve())
    request = load_json(args.publication_request.resolve())
    base, candidate_sha, request_sha = validate(root, candidate, request)

    status = "ready"
    applied = False
    if args.apply:
        if args.confirm != request_sha:
            fail("--apply requires --confirm equal to request_sha256")
        git(root, "merge", "--ff-only", candidate_sha)
        if git(root, "rev-parse", "HEAD") != candidate_sha:
            fail("local mobile did not advance to candidate commit")
        if git(root, "status", "--porcelain"):
            fail("working tree is not clean after fast-forward")
        status = "applied"
        applied = True
    else:
        if args.confirm:
            fail("--confirm is only valid with --apply")

    attestation: dict[str, Any] = {
        "schema_version": "1.0",
        "record_type": "candidate_ref_publication_attestation",
        "repository": candidate["repository"],
        "target_branch": "mobile",
        "ref": LOCAL_REF,
        "expected_old_commit": base,
        "candidate_commit_sha": candidate_sha,
        "candidate_attestation_sha256": candidate["attestation_sha256"],
        "publication_request_sha256": request_sha,
        "mode": "apply" if applied else "dry_run",
        "status": status,
        "local_ref_updated": applied,
        "remote_ref_updated": False,
        "push_performed": False,
        "merge_performed": False,
        "deploy_performed": False,
        "authority": "local_repository_write_only" if applied else "evidentiary_only",
    }
    attestation["attestation_sha256"] = sha256_json(attestation)
    rendered = json.dumps(attestation, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
