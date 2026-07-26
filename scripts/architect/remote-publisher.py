#!/usr/bin/env python3
"""Validate and optionally publish local mobile to origin/mobile with an exact lease."""
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
REMOTE_REF = "refs/heads/mobile"
TRACKING_REF = "refs/remotes/origin/mobile"


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


def remote_mobile(root: Path) -> str:
    output = git(root, "ls-remote", "--heads", "origin", REMOTE_REF)
    fields = output.split()
    if len(fields) != 2 or fields[1] != REMOTE_REF or SHA40.fullmatch(fields[0]) is None:
        fail("unable to resolve exact origin mobile ref")
    return fields[0]


def validate(
    root: Path,
    local_attestation: dict[str, Any],
    request: dict[str, Any],
) -> tuple[str, str, str]:
    verify_digest(local_attestation, "attestation_sha256", "local publication attestation")
    verify_digest(request, "request_sha256", "remote publication request")

    if local_attestation.get("schema_version") != "1.0":
        fail("unsupported local publication attestation schema version")
    if local_attestation.get("record_type") != "candidate_ref_publication_attestation":
        fail("unsupported local publication attestation record type")
    if local_attestation.get("mode") != "apply" or local_attestation.get("status") != "applied":
        fail("local publication attestation is not applied")
    if local_attestation.get("target_branch") != "mobile" or local_attestation.get("ref") != LOCAL_REF:
        fail("local publication attestation target mismatch")
    if local_attestation.get("local_ref_updated") is not True:
        fail("local publication attestation does not prove local update")
    if local_attestation.get("remote_ref_updated") is not False:
        fail("local publication attestation reports a prior remote update")
    if local_attestation.get("push_performed") is not False:
        fail("local publication attestation reports a prior push")
    if local_attestation.get("authority") != "local_repository_write_only":
        fail("local publication authority mismatch")

    required = {
        "schema_version", "record_type", "repository", "remote", "target_ref",
        "expected_remote_commit", "candidate_commit_sha",
        "local_publication_attestation_sha256", "permission_class",
        "authorization", "summary", "request_sha256",
    }
    missing = sorted(required - request.keys())
    if missing:
        fail(f"remote publication request missing fields: {', '.join(missing)}")
    if request.get("schema_version") != "1.0":
        fail("unsupported remote publication request schema version")
    if request.get("record_type") != "remote_ref_publication_request":
        fail("unsupported remote publication request record type")
    if request.get("remote") != "origin" or request.get("target_ref") != REMOTE_REF:
        fail("remote publication target must be origin refs/heads/mobile")
    if request.get("permission_class") != "W2":
        fail("remote publication request permission_class must be W2")
    if request.get("authorization") != "explicit_human_request":
        fail("remote publication request lacks explicit human authorization marker")
    if not str(request.get("summary", "")).strip():
        fail("remote publication request summary is required")

    old = str(local_attestation.get("expected_old_commit", ""))
    candidate = str(local_attestation.get("candidate_commit_sha", ""))
    for label, value in (("expected_old_commit", old), ("candidate_commit_sha", candidate)):
        if SHA40.fullmatch(value) is None:
            fail(f"local publication attestation has invalid {label}")

    bindings = {
        "repository": local_attestation.get("repository"),
        "expected_remote_commit": old,
        "candidate_commit_sha": candidate,
        "local_publication_attestation_sha256": local_attestation.get("attestation_sha256"),
    }
    for field, expected in bindings.items():
        if request.get(field) != expected:
            fail(f"remote publication request {field} binding mismatch")

    if git(root, "branch", "--show-current") != "mobile":
        fail("remote publisher must run from the mobile branch")
    if git(root, "status", "--porcelain"):
        fail("source checkout must be clean")
    if git(root, "rev-parse", "HEAD") != candidate:
        fail("HEAD does not match the locally published candidate")
    if git(root, "rev-parse", LOCAL_REF) != candidate:
        fail("local mobile does not match the candidate")
    if git(root, "rev-parse", TRACKING_REF) != old:
        fail("origin/mobile tracking ref does not match the expected remote base")
    if remote_mobile(root) != old:
        fail("live origin/mobile does not match the expected remote base")
    if git(root, "show", "-s", "--format=%P", candidate) != old:
        fail("candidate commit must have the exact remote base as its sole parent")
    return old, candidate, request["request_sha256"]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("local_publication_attestation", type=Path)
    parser.add_argument("remote_publication_request", type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--confirm", default="")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    root = Path(git(Path.cwd(), "rev-parse", "--show-toplevel"))
    local_attestation = load_json(args.local_publication_attestation.resolve())
    request = load_json(args.remote_publication_request.resolve())
    old, candidate, request_sha = validate(root, local_attestation, request)

    status = "ready"
    applied = False
    push_output_sha256 = None
    if args.apply:
        if args.confirm != request_sha:
            fail("--apply requires --confirm equal to request_sha256")
        output = git(
            root,
            "push",
            "--porcelain",
            f"--force-with-lease={REMOTE_REF}:{old}",
            "origin",
            f"{candidate}:{REMOTE_REF}",
        )
        push_output_sha256 = hashlib.sha256(output.encode()).hexdigest()
        if remote_mobile(root) != candidate:
            fail("origin/mobile did not advance to the candidate")
        git(root, "fetch", "-q", "origin", "mobile")
        if git(root, "rev-parse", TRACKING_REF) != candidate:
            fail("origin/mobile tracking ref did not advance to the candidate")
        if git(root, "rev-parse", "HEAD") != candidate or git(root, "status", "--porcelain"):
            fail("local checkout changed unexpectedly during remote publication")
        status = "applied"
        applied = True
    elif args.confirm:
        fail("--confirm is only valid with --apply")

    attestation: dict[str, Any] = {
        "schema_version": "1.0",
        "record_type": "remote_ref_publication_attestation",
        "repository": local_attestation["repository"],
        "remote": "origin",
        "target_ref": REMOTE_REF,
        "expected_old_commit": old,
        "candidate_commit_sha": candidate,
        "local_publication_attestation_sha256": local_attestation["attestation_sha256"],
        "remote_publication_request_sha256": request_sha,
        "mode": "apply" if applied else "dry_run",
        "status": status,
        "remote_ref_updated": applied,
        "tracking_ref_updated": applied,
        "main_updated": False,
        "tag_updated": False,
        "merge_performed": False,
        "deploy_performed": False,
        "push_output_sha256": push_output_sha256,
        "authority": "remote_integration_ref_write_only" if applied else "evidentiary_only",
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
