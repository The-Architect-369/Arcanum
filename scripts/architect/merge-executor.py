#!/usr/bin/env python3
"""Validate and optionally execute one expected-head-protected pull-request merge."""
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
REPO_SLUG = "The-Architect-369/Arcanum"


def fail(message: str) -> None:
    print(f"FAIL {message}", file=sys.stderr)
    raise SystemExit(1)


def canonical(value: dict[str, Any]) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode()


def digest(value: dict[str, Any]) -> str:
    return hashlib.sha256(canonical(value)).hexdigest()


def load(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"unable to read {path}: {exc}")
    if not isinstance(value, dict):
        fail(f"{path} must contain a JSON object")
    return value


def verify_digest(record: dict[str, Any], field: str, label: str) -> str:
    claimed = record.get(field)
    if not isinstance(claimed, str) or SHA64.fullmatch(claimed) is None:
        fail(f"invalid {label} {field}")
    unsigned = dict(record)
    unsigned.pop(field, None)
    if digest(unsigned) != claimed:
        fail(f"{label} digest mismatch")
    return claimed


def run(command: list[str], cwd: Path, check: bool = True) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(command, cwd=cwd, text=True, capture_output=True)
    if check and result.returncode != 0:
        fail(result.stderr.strip() or result.stdout.strip() or f"command failed: {' '.join(command)}")
    return result


def git(root: Path, *args: str) -> str:
    return run(["git", *args], root).stdout.strip()


def gh_json(root: Path, number: int) -> dict[str, Any]:
    result = run(
        [
            "gh", "pr", "view", str(number), "--repo", REPO_SLUG,
            "--json", "number,state,isDraft,mergeable,baseRefName,headRefName,headRefOid,mergedAt,mergeCommit",
        ],
        root,
    )
    try:
        value = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        fail(f"invalid gh pr view output: {exc}")
    if not isinstance(value, dict):
        fail("gh pr view did not return an object")
    return value


def live_ref(root: Path, ref: str) -> str:
    fields = git(root, "ls-remote", "--heads", "origin", ref).split()
    if len(fields) != 2 or fields[1] != ref or SHA40.fullmatch(fields[0]) is None:
        fail(f"unable to resolve {ref} on origin")
    return fields[0]


def validate(root: Path, package: dict[str, Any], request: dict[str, Any]) -> tuple[int, str, str, str]:
    package_sha = verify_digest(package, "package_sha256", "merge authorization package")
    request_sha = verify_digest(request, "request_sha256", "merge execution request")

    required_package = {
        "schema_version": "1.0",
        "record_type": "merge_authorization_package",
        "repository": REPOSITORY,
        "base_branch": "main",
        "head_branch": "mobile",
        "merge_method": "merge",
        "permission_class": "W3",
        "authorization": "explicit_human_request",
        "status": "authorized",
        "merge_performed": False,
        "deploy_performed": False,
        "authority": "merge_authorization_evidence_only",
    }
    for field, expected in required_package.items():
        if package.get(field) != expected:
            fail(f"invalid authorization package field: {field}")

    required_request = {
        "schema_version": "1.0",
        "record_type": "merge_execution_request",
        "repository": REPOSITORY,
        "base_branch": "main",
        "head_branch": "mobile",
        "merge_method": "merge",
        "permission_class": "W3",
        "authorization": "explicit_human_request",
    }
    for field, expected in required_request.items():
        if request.get(field) != expected:
            fail(f"invalid merge execution request field: {field}")

    number = request.get("pull_request_number")
    if not isinstance(number, int) or number < 1:
        fail("invalid pull_request_number")
    expected_head = request.get("expected_head_sha")
    if not isinstance(expected_head, str) or SHA40.fullmatch(expected_head) is None:
        fail("invalid expected_head_sha")
    if request.get("merge_authorization_package_sha256") != package_sha:
        fail("request authorization package binding mismatch")
    if package.get("pull_request_number") != number or package.get("expected_head_sha") != expected_head:
        fail("authorization package PR or head mismatch")

    if git(root, "branch", "--show-current") != "mobile":
        fail("merge executor must run from mobile")
    if git(root, "status", "--porcelain"):
        fail("working tree must be clean")
    if git(root, "rev-parse", "HEAD") != expected_head:
        fail("HEAD does not match expected head")
    if git(root, "rev-parse", "refs/remotes/origin/mobile") != expected_head:
        fail("origin/mobile tracking ref does not match expected head")
    if live_ref(root, "refs/heads/mobile") != expected_head:
        fail("live origin/mobile does not match expected head")

    old_main = git(root, "rev-parse", "refs/remotes/origin/main")
    if live_ref(root, "refs/heads/main") != old_main:
        fail("origin/main tracking ref is stale")
    if run(["git", "merge-base", "--is-ancestor", old_main, expected_head], root, check=False).returncode != 0:
        fail("origin/main is not an ancestor of expected head")

    pr = gh_json(root, number)
    expected_pr = {
        "number": number,
        "state": "OPEN",
        "isDraft": False,
        "baseRefName": "main",
        "headRefName": "mobile",
        "headRefOid": expected_head,
    }
    for field, expected in expected_pr.items():
        if pr.get(field) != expected:
            fail(f"pull request field mismatch: {field}")
    if pr.get("mergeable") not in {"MERGEABLE", "UNKNOWN"}:
        fail("pull request is not mergeable")
    return number, expected_head, old_main, request_sha


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("authorization_package", type=Path)
    parser.add_argument("merge_execution_request", type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--confirm", default="")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    root = Path(git(Path.cwd(), "rev-parse", "--show-toplevel"))
    package = load(args.authorization_package.resolve())
    request = load(args.merge_execution_request.resolve())
    number, expected_head, old_main, request_sha = validate(root, package, request)

    applied = False
    new_main: str | None = None
    provider_output_sha256: str | None = None
    if args.apply:
        if args.confirm != request_sha:
            fail("--apply requires --confirm equal to request_sha256")
        result = run(
            [
                "gh", "pr", "merge", str(number), "--repo", REPO_SLUG,
                "--merge", "--match-head-commit", expected_head,
            ],
            root,
        )
        provider_output_sha256 = hashlib.sha256((result.stdout + result.stderr).encode()).hexdigest()
        git(root, "fetch", "-q", "origin", "main")
        new_main = git(root, "rev-parse", "refs/remotes/origin/main")
        if new_main == old_main or live_ref(root, "refs/heads/main") != new_main:
            fail("origin/main did not advance")
        parents = git(root, "show", "-s", "--format=%P", new_main).split()
        if parents != [old_main, expected_head]:
            fail("merge commit parents do not match authorized base and head")
        pr_after = gh_json(root, number)
        merge_commit = pr_after.get("mergeCommit")
        if pr_after.get("state") != "MERGED" or not isinstance(merge_commit, dict) or merge_commit.get("oid") != new_main:
            fail("pull request merge state does not match origin/main")
        if git(root, "rev-parse", "HEAD") != expected_head or git(root, "status", "--porcelain"):
            fail("local mobile checkout changed during merge")
        if live_ref(root, "refs/heads/mobile") != expected_head:
            fail("origin/mobile changed during merge")
        applied = True
    elif args.confirm:
        fail("--confirm is only valid with --apply")

    record: dict[str, Any] = {
        "schema_version": "1.0",
        "record_type": "merge_execution_attestation",
        "repository": REPOSITORY,
        "pull_request_number": number,
        "base_branch": "main",
        "head_branch": "mobile",
        "expected_head_sha": expected_head,
        "expected_old_main_sha": old_main,
        "actual_new_main_sha": new_main,
        "merge_method": "merge",
        "merge_authorization_package_sha256": package["package_sha256"],
        "merge_execution_request_sha256": request_sha,
        "mode": "apply" if applied else "dry_run",
        "status": "merged" if applied else "ready",
        "main_updated": applied,
        "mobile_updated": False,
        "tag_updated": False,
        "merge_performed": applied,
        "deploy_performed": False,
        "provider_output_sha256": provider_output_sha256,
        "authority": "pull_request_merge_only" if applied else "evidentiary_only",
    }
    record["attestation_sha256"] = digest(record)
    rendered = json.dumps(record, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
