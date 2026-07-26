#!/usr/bin/env python3
"""Coordinate promotion evidence into one resumable pre-W3 state file."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

REPOSITORY = "https://github.com/The-Architect-369/Arcanum.git"
SHA40 = re.compile(r"^[0-9a-f]{40}$")
WAVE = re.compile(r"^wave-[a-z0-9-]+$")


def fail(message: str) -> None:
    print(f"FAIL {message}", file=sys.stderr)
    raise SystemExit(1)


def run(command: list[str], cwd: Path, check: bool = True) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(command, cwd=cwd, text=True, capture_output=True)
    if check and result.returncode != 0:
        fail(result.stderr.strip() or result.stdout.strip() or f"command failed: {' '.join(command)}")
    return result


def git(root: Path, *args: str) -> str:
    return run(["git", *args], root).stdout.strip()


def canonical(value: dict[str, Any]) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode()


def digest(value: dict[str, Any]) -> str:
    return hashlib.sha256(canonical(value)).hexdigest()


def load(path: Path, label: str) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"unable to read {label} {path}: {exc}")
    if not isinstance(value, dict):
        fail(f"{label} must contain a JSON object")
    return value


def relative(root: Path, path: Path | None) -> str | None:
    if path is None:
        return None
    resolved = path.resolve()
    try:
        return str(resolved.relative_to(root))
    except ValueError:
        return str(resolved)


def validate_promotion(record: dict[str, Any], head: str) -> None:
    if record.get("record_type") != "promotion_attestation" or record.get("status") != "ready":
        fail("promotion attestation must be ready")
    if record.get("repository") != REPOSITORY or record.get("branch") != "mobile" or record.get("commit") != head:
        fail("promotion attestation identity mismatch")
    checks = record.get("checks")
    required = {"working_tree": "clean", "remote_sync": "pass", "repository_integrity": "pass", "typecheck": "pass", "build": "pass", "termux_failures": 0}
    if not isinstance(checks, dict) or any(checks.get(key) != value for key, value in required.items()):
        fail("promotion attestation checks incomplete")


def validate_ci(record: dict[str, Any], head: str) -> None:
    if record.get("record_type") != "ci_promotion_attestation" or record.get("status") != "success":
        fail("CI attestation must be successful")
    if record.get("repository") != REPOSITORY or record.get("branch") != "mobile" or record.get("commit") != head:
        fail("CI attestation identity mismatch")
    checks = record.get("checks")
    if not isinstance(checks, dict) or any(checks.get(name) != "pass" for name in ("repository_integrity", "typecheck", "production_build")):
        fail("CI attestation checks incomplete")


def validate_provider(record: dict[str, Any], head: str) -> None:
    if record.get("record_type") != "provider_evidence" or record.get("provider") != "vercel":
        fail("provider evidence must describe Vercel")
    if record.get("repository") != REPOSITORY or record.get("branch") != "mobile" or record.get("commit") != head:
        fail("provider evidence identity mismatch")
    if record.get("state") != "READY" or record.get("target") != "preview":
        fail("provider preview must be READY")


def validate_pr(root: Path, number: int, head: str) -> None:
    result = run([
        "gh", "pr", "view", str(number), "--repo", "The-Architect-369/Arcanum",
        "--json", "number,state,isDraft,mergeable,baseRefName,headRefName,headRefOid",
    ], root)
    try:
        pr = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        fail(f"invalid gh PR response: {exc}")
    expected = {"number": number, "state": "OPEN", "isDraft": False, "baseRefName": "main", "headRefName": "mobile", "headRefOid": head}
    for field, value in expected.items():
        if pr.get(field) != value:
            fail(f"pull request field mismatch: {field}")
    if pr.get("mergeable") not in {"MERGEABLE", "UNKNOWN"}:
        fail("pull request is not mergeable")


def latest_promotion(root: Path, wave: str) -> Path | None:
    directory = root / ".architect-reports/orchestration/promotions"
    matches = sorted(directory.glob(f"promotion-{wave}-*.json"))
    return matches[-1] if matches else None


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("wave")
    parser.add_argument("--state", type=Path)
    parser.add_argument("--run-local-gates", action="store_true")
    parser.add_argument("--promotion-attestation", type=Path)
    parser.add_argument("--pr-number", type=int)
    parser.add_argument("--ci-attestation", type=Path)
    parser.add_argument("--provider-evidence", type=Path)
    parser.add_argument("--authorization-package", type=Path)
    parser.add_argument("--merge-execution-request", type=Path)
    parser.add_argument("--prepare", action="store_true")
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()

    if WAVE.fullmatch(args.wave) is None:
        fail("invalid wave identifier")

    root = Path(git(Path.cwd(), "rev-parse", "--show-toplevel"))
    state_path = (args.state or root / f".architect-reports/orchestration/waves/{args.wave}.json").resolve()
    head = git(root, "rev-parse", "HEAD")
    remote_head = git(root, "rev-parse", "refs/remotes/origin/mobile")
    base = git(root, "rev-parse", "refs/remotes/origin/main")

    if git(root, "branch", "--show-current") != "mobile":
        fail("orchestrator must run from mobile")
    if git(root, "status", "--porcelain"):
        fail("working tree must be clean")
    if head != remote_head:
        fail("HEAD must equal origin/mobile")
    if SHA40.fullmatch(head) is None or SHA40.fullmatch(base) is None:
        fail("invalid repository commit identity")
    if run(["git", "merge-base", "--is-ancestor", base, head], root, check=False).returncode != 0:
        fail("origin/main must be an ancestor of mobile")

    if state_path.exists() and not args.reset:
        previous = load(state_path, "state")
        unsigned = dict(previous)
        claimed = unsigned.pop("state_sha256", None)
        if claimed != digest(unsigned):
            fail("existing state digest mismatch")
        if previous.get("wave") != args.wave or previous.get("expected_head_sha") != head:
            fail("existing state is stale for current wave or head; use --reset")

    promotion_path = args.promotion_attestation.resolve() if args.promotion_attestation else None
    if args.run_local_gates:
        result = run(["bash", "scripts/architect/promotion-gate.sh", args.wave], root)
        print(result.stdout, end="")
        promotion_path = latest_promotion(root, args.wave)
        if promotion_path is None:
            fail("promotion gate did not emit an attestation")

    checks = {
        "clean_checkout": "pass",
        "remote_sync": "pass",
        "base_ancestor": "pass",
        "local_promotion": "pending",
        "pull_request": "pending",
        "ci": "pending",
        "provider": "pending",
        "authorization_package": "pending",
        "merge_execution_request": "pending",
    }
    evidence: dict[str, str | None] = {
        "promotion_attestation": relative(root, promotion_path),
        "ci_attestation": relative(root, args.ci_attestation),
        "provider_evidence": relative(root, args.provider_evidence),
        "authorization_package": relative(root, args.authorization_package),
        "merge_execution_request": relative(root, args.merge_execution_request),
    }
    blockers: list[str] = []
    stage = "ground"

    if promotion_path:
        validate_promotion(load(promotion_path, "promotion attestation"), head)
        checks["local_promotion"] = "pass"
        stage = "promotion_attestation"
    else:
        blockers.append("local promotion attestation missing")

    if args.pr_number:
        validate_pr(root, args.pr_number, head)
        checks["pull_request"] = "pass"
    else:
        blockers.append("pull request number missing")

    if args.ci_attestation:
        validate_ci(load(args.ci_attestation.resolve(), "CI attestation"), head)
        checks["ci"] = "pass"
    else:
        blockers.append("CI attestation missing")

    if args.provider_evidence:
        validate_provider(load(args.provider_evidence.resolve(), "provider evidence"), head)
        checks["provider"] = "pass"
    else:
        blockers.append("provider evidence missing")

    if checks["pull_request"] == checks["ci"] == checks["provider"] == "pass":
        stage = "hosted_evidence"

    if args.authorization_package:
        package = load(args.authorization_package.resolve(), "authorization package")
        if package.get("record_type") != "merge_authorization_package" or package.get("status") != "authorized" or package.get("expected_head_sha") != head or package.get("pull_request_number") != args.pr_number:
            fail("authorization package identity mismatch")
        checks["authorization_package"] = "pass"
        stage = "merge_authorization"
    else:
        blockers.append("merge authorization package missing")

    authorization_digest = None
    if args.merge_execution_request:
        request = load(args.merge_execution_request.resolve(), "merge execution request")
        if request.get("record_type") != "merge_execution_request" or request.get("expected_head_sha") != head or request.get("pull_request_number") != args.pr_number:
            fail("merge execution request identity mismatch")
        authorization_digest = request.get("request_sha256")
        if not isinstance(authorization_digest, str) or len(authorization_digest) != 64:
            fail("invalid merge execution request digest")
        checks["merge_execution_request"] = "pass"
    else:
        blockers.append("merge execution request missing")

    ready = all(checks[name] == "pass" for name in ("local_promotion", "pull_request", "ci", "provider", "authorization_package", "merge_execution_request"))
    if ready:
        stage = "ready_for_w3"
        blockers = []

    state: dict[str, Any] = {
        "schema_version": "1.0",
        "record_type": "promotion_orchestrator_state",
        "repository": REPOSITORY,
        "wave": args.wave,
        "base_branch": "main",
        "head_branch": "mobile",
        "expected_head_sha": head,
        "pull_request_number": args.pr_number,
        "mode": "prepare" if args.prepare else "dry_run",
        "status": "ready_for_w3" if ready else "in_progress",
        "stage": stage,
        "checks": checks,
        "evidence": evidence,
        "blockers": blockers,
        "effects": {
            "performed": [],
            "allowed_before_w3": ["read_repository", "run_local_verification", "read_pull_request", "validate_evidence", "write_local_state"],
            "forbidden_before_w3": ["merge", "deploy", "rollback", "tag_update", "mobile_sync", "canonical_ratification"],
        },
        "authorization": {
            "required_permission": "W3",
            "human_authorization_required": True,
            "merge_performed": False,
            "request_sha256": authorization_digest,
        },
    }
    unsigned = dict(state)
    state["state_sha256"] = digest(unsigned)
    state_path.parent.mkdir(parents=True, exist_ok=True)
    state_path.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(state, indent=2))
    print(f"State: {state_path}")
    return 0 if ready or not args.prepare else 2


if __name__ == "__main__":
    raise SystemExit(main())
