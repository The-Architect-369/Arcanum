#!/usr/bin/env python3
"""Guarded promotion pull-request publisher for Architect GPT Wave XVI."""
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
SHA256 = re.compile(r"^[0-9a-f]{64}$")
REPOSITORY = "https://github.com/The-Architect-369/Arcanum.git"


def canonical(value: dict[str, Any]) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode()


def digest_without(record: dict[str, Any], field: str) -> str:
    body = dict(record)
    body.pop(field, None)
    return hashlib.sha256(canonical(body)).hexdigest()


def load(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{path}: expected JSON object")
    return value


def run(*args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, check=check, text=True, capture_output=True)


def git(*args: str) -> str:
    return run("git", *args).stdout.strip()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def validate_remote_attestation(record: dict[str, Any]) -> None:
    required = {
        "schema_version": "1.0",
        "record_type": "remote_ref_publication_attestation",
        "repository": REPOSITORY,
        "remote": "origin",
        "target_ref": "refs/heads/mobile",
        "mode": "apply",
        "status": "applied",
        "remote_ref_updated": True,
        "tracking_ref_updated": True,
        "main_updated": False,
        "tag_updated": False,
        "merge_performed": False,
        "deploy_performed": False,
        "authority": "remote_integration_ref_write_only",
    }
    for key, expected in required.items():
        require(record.get(key) == expected, f"remote attestation {key} mismatch")
    for key in ("expected_old_commit", "candidate_commit_sha"):
        require(bool(SHA40.fullmatch(str(record.get(key, "")))), f"invalid {key}")
    require(bool(SHA256.fullmatch(str(record.get("request_sha256", "")))), "invalid request_sha256")
    require(bool(SHA256.fullmatch(str(record.get("attestation_sha256", "")))), "invalid attestation_sha256")
    require(digest_without(record, "attestation_sha256") == record["attestation_sha256"], "remote attestation digest mismatch")


def validate_request(record: dict[str, Any], attestation: dict[str, Any]) -> None:
    required = {
        "schema_version": "1.0",
        "record_type": "promotion_pr_request",
        "repository": REPOSITORY,
        "head_branch": "mobile",
        "base_branch": "main",
        "permission_class": "W2",
        "authorization": "explicit_human_request",
        "draft": False,
    }
    for key, expected in required.items():
        require(record.get(key) == expected, f"request {key} mismatch")
    require(record.get("head_sha") == attestation["candidate_commit_sha"], "request head SHA mismatch")
    require(record.get("remote_publication_attestation_sha256") == attestation["attestation_sha256"], "request attestation binding mismatch")
    require(isinstance(record.get("title"), str) and bool(record["title"].strip()), "title required")
    require(isinstance(record.get("body"), str) and bool(record["body"].strip()), "body required")
    require(bool(SHA256.fullmatch(str(record.get("request_sha256", "")))), "invalid request_sha256")
    require(digest_without(record, "request_sha256") == record["request_sha256"], "request digest mismatch")


def preflight(candidate: str) -> None:
    require(git("rev-parse", "--show-toplevel") != "", "not in repository")
    require(git("branch", "--show-current") == "mobile", "checked-out branch must be mobile")
    require(git("status", "--porcelain") == "", "working tree must be clean")
    require(git("rev-parse", "HEAD") == candidate, "HEAD does not match candidate")
    require(git("rev-parse", "refs/heads/mobile") == candidate, "local mobile does not match candidate")
    require(git("rev-parse", "refs/remotes/origin/mobile") == candidate, "origin/mobile tracking ref does not match candidate")
    live = git("ls-remote", "--heads", "origin", "refs/heads/mobile").split()
    require(bool(live) and live[0] == candidate, "live origin/mobile does not match candidate")
    require(git("merge-base", "--is-ancestor", "refs/remotes/origin/main", candidate) == "", "main is not an ancestor of candidate")


def existing_pr() -> dict[str, Any] | None:
    proc = run("gh", "pr", "list", "--head", "mobile", "--base", "main", "--state", "open", "--json", "number,url,headRefOid", check=False)
    require(proc.returncode == 0, proc.stderr.strip() or "gh pr list failed")
    value = json.loads(proc.stdout or "[]")
    require(isinstance(value, list), "gh pr list returned invalid JSON")
    return value[0] if value else None


def attestation(request: dict[str, Any], mode: str, status: str, pr: dict[str, Any] | None, output_digest: str | None) -> dict[str, Any]:
    record: dict[str, Any] = {
        "schema_version": "1.0",
        "record_type": "promotion_pr_publication_attestation",
        "repository": REPOSITORY,
        "head_branch": "mobile",
        "base_branch": "main",
        "head_sha": request["head_sha"],
        "remote_publication_attestation_sha256": request["remote_publication_attestation_sha256"],
        "promotion_pr_request_sha256": request["request_sha256"],
        "mode": mode,
        "status": status,
        "pr_created": status == "created",
        "pr_number": pr.get("number") if pr else None,
        "pr_url": pr.get("url") if pr else None,
        "ref_updated": False,
        "merge_performed": False,
        "deploy_performed": False,
        "provider_output_sha256": output_digest,
        "authority": "promotion_pr_write_only" if mode == "apply" else "evidentiary_only",
    }
    record["attestation_sha256"] = hashlib.sha256(canonical(record)).hexdigest()
    return record


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("remote_attestation", type=Path)
    parser.add_argument("request", type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--confirm")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    try:
        remote = load(args.remote_attestation)
        request = load(args.request)
        validate_remote_attestation(remote)
        validate_request(request, remote)
        require(not args.confirm or args.apply, "confirmation is valid only in apply mode")
        if args.apply:
            require(args.confirm == request["request_sha256"], "exact request digest confirmation required")
        preflight(remote["candidate_commit_sha"])
        prior = existing_pr()
        require(prior is None, "an open mobile-to-main PR already exists")

        if args.apply:
            proc = run(
                "gh", "pr", "create",
                "--head", "mobile", "--base", "main",
                "--title", request["title"], "--body", request["body"],
                "--json", "number,url,headRefOid",
                check=False,
            )
            require(proc.returncode == 0, proc.stderr.strip() or "gh pr create failed")
            created = json.loads(proc.stdout)
            require(created.get("headRefOid") == request["head_sha"], "created PR head mismatch")
            out_digest = hashlib.sha256(proc.stdout.encode()).hexdigest()
            record = attestation(request, "apply", "created", created, out_digest)
        else:
            record = attestation(request, "dry_run", "ready", None, None)

        rendered = json.dumps(record, indent=2) + "\n"
        if args.output:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(rendered, encoding="utf-8")
        else:
            sys.stdout.write(rendered)
        return 0
    except (ValueError, json.JSONDecodeError, subprocess.CalledProcessError) as exc:
        print(f"promotion-pr-publisher: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
