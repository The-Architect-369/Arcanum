#!/usr/bin/env python3
"""Guarded post-merge closure for Arcanum promotion waves."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPOSITORY = "https://github.com/The-Architect-369/Arcanum.git"
BASE_BRANCH = "main"
INTEGRATION_BRANCH = "mobile"
EFFECT = "origin_mobile_fast_forward"
REPORT_DIR = Path(".architect-reports/orchestration/closures")


class ClosureError(RuntimeError):
    pass


def run_git(*args: str, check: bool = True) -> str:
    process = subprocess.run(
        ["git", *args],
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if check and process.returncode != 0:
        detail = process.stderr.strip() or process.stdout.strip()
        raise ClosureError(f"git {' '.join(args)} failed: {detail}")
    return process.stdout.strip()


def canonical_json(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def request_digest(request: dict[str, Any]) -> str:
    return hashlib.sha256(canonical_json(request)).hexdigest()


def load_request(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ClosureError(f"unable to read closure request: {exc}") from exc
    if not isinstance(value, dict):
        raise ClosureError("closure request must be a JSON object")
    return value


def require_string(value: Any, name: str) -> str:
    if not isinstance(value, str) or not value:
        raise ClosureError(f"{name} must be a non-empty string")
    return value


def require_sha(value: Any, name: str) -> str:
    text = require_string(value, name)
    if len(text) != 40 or any(char not in "0123456789abcdef" for char in text):
        raise ClosureError(f"{name} must be a lowercase 40-character Git SHA")
    return text


def validate_request(request: dict[str, Any]) -> dict[str, Any]:
    allowed = {
        "schema_version",
        "repository",
        "wave",
        "pull_request_number",
        "base_branch",
        "integration_branch",
        "merge_commit",
        "expected_mobile_commit",
        "production",
        "requested_effect",
    }
    unknown = sorted(set(request) - allowed)
    if unknown:
        raise ClosureError(f"unknown request fields: {', '.join(unknown)}")
    if request.get("schema_version") != "1.0":
        raise ClosureError("schema_version must be 1.0")
    if request.get("repository") != REPOSITORY:
        raise ClosureError("repository identity mismatch")
    wave = require_string(request.get("wave"), "wave")
    if not wave.startswith("wave-"):
        raise ClosureError("wave must start with wave-")
    pr_number = request.get("pull_request_number")
    if not isinstance(pr_number, int) or pr_number < 1:
        raise ClosureError("pull_request_number must be a positive integer")
    if request.get("base_branch") != BASE_BRANCH:
        raise ClosureError("base_branch must be main")
    if request.get("integration_branch") != INTEGRATION_BRANCH:
        raise ClosureError("integration_branch must be mobile")
    merge_commit = require_sha(request.get("merge_commit"), "merge_commit")
    expected_mobile = require_sha(request.get("expected_mobile_commit"), "expected_mobile_commit")
    if request.get("requested_effect") != EFFECT:
        raise ClosureError(f"requested_effect must be {EFFECT}")

    production = request.get("production")
    if not isinstance(production, dict):
        raise ClosureError("production must be an object")
    production_allowed = {"provider", "deployment_id", "url", "state", "commit"}
    production_unknown = sorted(set(production) - production_allowed)
    if production_unknown:
        raise ClosureError(f"unknown production fields: {', '.join(production_unknown)}")
    if production.get("provider") != "vercel":
        raise ClosureError("production.provider must be vercel")
    deployment_id = require_string(production.get("deployment_id"), "production.deployment_id")
    state = require_string(production.get("state"), "production.state")
    if state != "READY":
        raise ClosureError("production.state must be READY")
    production_commit = require_sha(production.get("commit"), "production.commit")
    if production_commit != merge_commit:
        raise ClosureError("production commit does not match merge_commit")

    return {
        "wave": wave,
        "pull_request_number": pr_number,
        "merge_commit": merge_commit,
        "expected_mobile_commit": expected_mobile,
        "production": {
            "provider": "vercel",
            "deployment_id": deployment_id,
            "url": production.get("url", ""),
            "state": state,
            "commit": production_commit,
        },
    }


def ensure_checkout() -> None:
    if run_git("rev-parse", "--is-inside-work-tree") != "true":
        raise ClosureError("not inside a Git worktree")
    if run_git("status", "--porcelain"):
        raise ClosureError("working tree must be clean")
    remote_url = run_git("config", "--get", "remote.origin.url")
    accepted = {
        REPOSITORY,
        "https://github.com/The-Architect-369/Arcanum.git",
        "git@github.com:The-Architect-369/Arcanum.git",
    }
    if remote_url not in accepted:
        raise ClosureError(f"origin repository mismatch: {remote_url}")


def verify_state(validated: dict[str, Any]) -> tuple[str, str]:
    run_git("fetch", "origin", "main", "mobile", "--prune")
    main_sha = run_git("rev-parse", "refs/remotes/origin/main")
    mobile_sha = run_git("rev-parse", "refs/remotes/origin/mobile")
    if main_sha != validated["merge_commit"]:
        raise ClosureError(f"origin/main drift: expected {validated['merge_commit']}, found {main_sha}")
    if mobile_sha != validated["expected_mobile_commit"]:
        raise ClosureError(
            f"origin/mobile lease mismatch: expected {validated['expected_mobile_commit']}, found {mobile_sha}"
        )
    ancestor = subprocess.run(
        ["git", "merge-base", "--is-ancestor", mobile_sha, main_sha],
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    if ancestor.returncode != 0:
        raise ClosureError("origin/mobile is not an ancestor of origin/main")
    return main_sha, mobile_sha


def apply_sync(main_sha: str, mobile_sha: str) -> tuple[bool, str]:
    if main_sha == mobile_sha:
        return False, "already_synchronized"
    lease = f"refs/heads/mobile:{mobile_sha}"
    refspec = f"{main_sha}:refs/heads/mobile"
    run_git("push", "origin", refspec, f"--force-with-lease={lease}")
    run_git("fetch", "origin", "mobile")
    observed = run_git("rev-parse", "refs/remotes/origin/mobile")
    if observed != main_sha:
        raise ClosureError(f"post-update mobile mismatch: expected {main_sha}, found {observed}")
    return True, "fast_forwarded"


def emit_attestation(
    request: dict[str, Any],
    validated: dict[str, Any],
    digest: str,
    main_sha: str,
    mobile_before: str,
    mobile_after: str,
    performed: bool,
    result: str,
) -> Path:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    stamp = timestamp.replace("-", "").replace(":", "")
    path = REPORT_DIR / f"closure-{validated['wave']}-{stamp}.json"
    attestation = {
        "schema_version": "1.0",
        "record_type": "post_merge_closure_attestation",
        "timestamp": timestamp,
        "repository": REPOSITORY,
        "wave": validated["wave"],
        "pull_request_number": validated["pull_request_number"],
        "merge_commit": validated["merge_commit"],
        "production": validated["production"],
        "branches": {
            "base": BASE_BRANCH,
            "integration": INTEGRATION_BRANCH,
            "main": main_sha,
            "mobile_before": mobile_before,
            "mobile_after": mobile_after,
        },
        "checks": {
            "clean_checkout": "pass",
            "main_exact": "pass",
            "production_exact": "pass",
            "mobile_lease": "pass",
            "fast_forward": "pass",
            "remote_sync": "pass",
        },
        "effect": {
            "requested": EFFECT,
            "performed": performed,
            "result": result,
        },
        "request_sha256": digest,
        "status": "closed",
    }
    path.write_text(json.dumps(attestation, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("request", type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--confirm")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        if args.confirm and not args.apply:
            raise ClosureError("--confirm requires --apply")
        if args.apply and not args.confirm:
            raise ClosureError("--apply requires --confirm <request_sha256>")

        request = load_request(args.request)
        validated = validate_request(request)
        digest = request_digest(request)
        ensure_checkout()
        main_sha, mobile_before = verify_state(validated)

        if not args.apply:
            print("Post-merge closure request validated.")
            print(f"Request SHA-256: {digest}")
            print(f"main:   {main_sha}")
            print(f"mobile: {mobile_before}")
            print("Mode: dry-run")
            return 0

        if args.confirm != digest:
            raise ClosureError("confirmation digest mismatch")

        performed, result = apply_sync(main_sha, mobile_before)
        mobile_after = run_git("rev-parse", "refs/remotes/origin/mobile")
        path = emit_attestation(
            request,
            validated,
            digest,
            main_sha,
            mobile_before,
            mobile_after,
            performed,
            result,
        )
        print(f"Post-merge closure status: closed ({result})")
        print(f"Closure attestation: {path}")
        return 0
    except ClosureError as exc:
        print(f"FAIL {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
