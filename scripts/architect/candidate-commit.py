#!/usr/bin/env python3
"""Build a deterministic candidate Git commit without moving any repository ref."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any

ALLOWED_ACTIONS = {"create", "update", "delete", "rename"}
SHA40 = re.compile(r"^[0-9a-f]{40}$")
SHA64 = re.compile(r"^[0-9a-f]{64}$")


def fail(message: str) -> None:
    print(f"FAIL {message}", file=sys.stderr)
    raise SystemExit(1)


def run(command: list[str], cwd: Path, *, env: dict[str, str] | None = None) -> str:
    result = subprocess.run(
        command,
        cwd=cwd,
        env=env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    if result.returncode != 0:
        fail(f"command failed ({' '.join(command)}): {result.stdout.strip()}")
    return result.stdout.strip()


def git(root: Path, *args: str, env: dict[str, str] | None = None) -> str:
    return run(["git", *args], root, env=env)


def digest_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def digest_json(value: dict[str, Any]) -> str:
    payload = json.dumps(value, sort_keys=True, separators=(",", ":")).encode()
    return digest_bytes(payload)


def load_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"unable to read JSON {path}: {exc}")
    if not isinstance(value, dict):
        fail(f"expected JSON object: {path}")
    return value


def verify_signed_json(value: dict[str, Any], field: str, label: str) -> None:
    expected = str(value.get(field, ""))
    if SHA64.fullmatch(expected) is None:
        fail(f"{label} has invalid {field}")
    unsigned = dict(value)
    unsigned.pop(field, None)
    actual = digest_json(unsigned)
    if actual != expected:
        fail(f"{label} digest mismatch: {actual} != {expected}")


def normalize_path(raw: str) -> str:
    path = Path(raw)
    if not raw or path.is_absolute() or ".." in path.parts:
        fail(f"unsafe repository path: {raw}")
    value = path.as_posix()
    while value.startswith("./"):
        value = value[2:]
    if not value or value == ".git" or value.startswith(".git/"):
        fail(f"unsafe repository path: {raw}")
    return value


def payload_path(root: Path, repo_path: str) -> Path:
    candidate = (root / repo_path).resolve()
    try:
        candidate.relative_to(root.resolve())
    except ValueError:
        fail(f"payload path escapes payload directory: {repo_path}")
    return candidate


def validate_timestamp(value: str) -> str:
    if not value.endswith("Z"):
        fail("commit timestamp must use UTC Z notation")
    try:
        parsed = datetime.fromisoformat(value[:-1] + "+00:00")
    except ValueError as exc:
        fail(f"invalid commit timestamp: {exc}")
    return parsed.strftime("%Y-%m-%dT%H:%M:%SZ")


def validate_inputs(
    bundle: dict[str, Any],
    patch: dict[str, Any],
    request: dict[str, Any],
    root: Path,
) -> list[dict[str, Any]]:
    verify_signed_json(bundle, "bundle_sha256", "patch bundle")
    verify_signed_json(patch, "attestation_sha256", "patch attestation")

    if bundle.get("record_type") != "repository_patch_bundle":
        fail("unsupported patch bundle record type")
    if patch.get("record_type") != "isolated_patch_attestation" or patch.get("status") != "pass":
        fail("patch attestation must be a passing isolated_patch_attestation")
    if patch.get("source_checkout_unchanged") is not True:
        fail("patch attestation does not prove source checkout preservation")
    if patch.get("bundle_sha256") != bundle.get("bundle_sha256"):
        fail("patch attestation is not bound to the supplied bundle")
    if patch.get("base_commit") != bundle.get("base_commit"):
        fail("patch attestation base does not match the supplied bundle")

    required = {
        "schema_version", "record_type", "repository", "base_commit",
        "target_branch", "bundle_sha256", "patch_attestation_sha256",
        "author_name", "author_email", "timestamp", "message",
    }
    missing = sorted(required - request.keys())
    if missing:
        fail(f"candidate commit request missing fields: {', '.join(missing)}")
    if request.get("schema_version") != "1.0" or request.get("record_type") != "candidate_commit_request":
        fail("unsupported candidate commit request")
    if request.get("repository") != bundle.get("repository"):
        fail("request repository does not match bundle")
    if request.get("base_commit") != bundle.get("base_commit"):
        fail("request base_commit does not match bundle")
    if request.get("target_branch") != "mobile" or bundle.get("target_branch") != "mobile":
        fail("candidate commit target_branch must be mobile")
    if request.get("bundle_sha256") != bundle.get("bundle_sha256"):
        fail("request bundle digest does not match bundle")
    if request.get("patch_attestation_sha256") != patch.get("attestation_sha256"):
        fail("request patch attestation digest does not match attestation")
    for field in ("author_name", "author_email", "message"):
        if not str(request.get(field, "")).strip():
            fail(f"candidate commit request {field} is required")
    validate_timestamp(str(request["timestamp"]))

    base = str(bundle.get("base_commit", ""))
    if SHA40.fullmatch(base) is None:
        fail("bundle base_commit must be a full Git SHA")
    if git(root, "rev-parse", "HEAD") != base:
        fail("bundle base_commit does not match exact repository HEAD")
    if git(root, "branch", "--show-current") != "mobile":
        fail("candidate commit construction must begin from mobile")
    if git(root, "status", "--porcelain"):
        fail("source checkout must be clean")

    changes = bundle.get("changes")
    if not isinstance(changes, list) or not changes:
        fail("patch bundle changes must be a non-empty array")
    normalized: list[dict[str, Any]] = []
    targets: set[str] = set()
    for index, raw in enumerate(changes):
        if not isinstance(raw, dict):
            fail(f"change {index} must be an object")
        action = str(raw.get("action", ""))
        if action not in ALLOWED_ACTIONS:
            fail(f"change {index} has unsupported action")
        path = normalize_path(str(raw.get("path", "")))
        if path in targets:
            fail(f"duplicate target path: {path}")
        targets.add(path)
        item: dict[str, Any] = {"action": action, "path": path}
        if action == "rename":
            item["from_path"] = normalize_path(str(raw.get("from_path", "")))
        if raw.get("content_sha256") is not None:
            value = str(raw["content_sha256"])
            if SHA64.fullmatch(value) is None:
                fail(f"change {index} has invalid content_sha256")
            item["content_sha256"] = value
        normalized.append(item)
    return normalized


def apply_changes(worktree: Path, payload_root: Path, changes: list[dict[str, Any]]) -> None:
    for change in changes:
        action = change["action"]
        target = worktree / change["path"]
        if action in {"create", "update"}:
            if action == "create" and target.exists():
                fail(f"create target already exists: {change['path']}")
            if action == "update" and not target.is_file():
                fail(f"update target is not a file: {change['path']}")
            source = payload_path(payload_root, change["path"])
            if not source.is_file():
                fail(f"missing payload: {change['path']}")
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)
            actual = digest_bytes(target.read_bytes())
            if actual != change.get("content_sha256"):
                fail(f"payload digest mismatch for {change['path']}")
        elif action == "delete":
            if not target.is_file():
                fail(f"delete target is not a file: {change['path']}")
            target.unlink()
        else:
            source = worktree / change["from_path"]
            if not source.is_file() or target.exists():
                fail(f"invalid rename: {change['from_path']} -> {change['path']}")
            target.parent.mkdir(parents=True, exist_ok=True)
            source.rename(target)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("bundle", type=Path)
    parser.add_argument("patch_attestation", type=Path)
    parser.add_argument("request", type=Path)
    parser.add_argument("--payload-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    root = Path(git(Path.cwd(), "rev-parse", "--show-toplevel"))
    bundle = load_json(args.bundle.resolve())
    patch = load_json(args.patch_attestation.resolve())
    request = load_json(args.request.resolve())
    changes = validate_inputs(bundle, patch, request, root)
    payload_root = args.payload_dir.resolve()
    if not payload_root.is_dir():
        fail(f"payload directory does not exist: {payload_root}")

    source_head = git(root, "rev-parse", "HEAD")
    source_status = git(root, "status", "--porcelain")
    with tempfile.TemporaryDirectory(prefix="arcanum-commit-") as temp:
        worktree = Path(temp) / "worktree"
        run(["git", "worktree", "add", "--detach", str(worktree), source_head], root)
        try:
            apply_changes(worktree, payload_root, changes)
            git(worktree, "add", "-A")
            diff = subprocess.check_output(
                ["git", "diff", "--cached", "--binary", "HEAD"],
                cwd=worktree,
            )
            diff_sha = digest_bytes(diff)
            if diff_sha != patch.get("candidate_diff_sha256"):
                fail("reconstructed candidate diff does not match patch attestation")
            tree_sha = git(worktree, "write-tree")
            timestamp = validate_timestamp(str(request["timestamp"]))
            env = os.environ.copy()
            env.update({
                "GIT_AUTHOR_NAME": str(request["author_name"]),
                "GIT_AUTHOR_EMAIL": str(request["author_email"]),
                "GIT_AUTHOR_DATE": timestamp,
                "GIT_COMMITTER_NAME": str(request["author_name"]),
                "GIT_COMMITTER_EMAIL": str(request["author_email"]),
                "GIT_COMMITTER_DATE": timestamp,
            })
            commit_sha = git(
                worktree,
                "commit-tree", tree_sha, "-p", source_head,
                env=env,
            ) if False else ""
            result = subprocess.run(
                ["git", "commit-tree", tree_sha, "-p", source_head],
                cwd=worktree,
                env=env,
                input=str(request["message"]).rstrip() + "\n",
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                check=False,
            )
            if result.returncode != 0:
                fail(f"git commit-tree failed: {result.stdout.strip()}")
            commit_sha = result.stdout.strip()
            if SHA40.fullmatch(commit_sha) is None:
                fail("git commit-tree did not return a commit SHA")
            request_sha = digest_json(request)
            attestation: dict[str, Any] = {
                "schema_version": "1.0",
                "record_type": "candidate_commit_attestation",
                "repository": bundle["repository"],
                "base_commit": source_head,
                "target_branch": "mobile",
                "bundle_sha256": bundle["bundle_sha256"],
                "patch_attestation_sha256": patch["attestation_sha256"],
                "request_sha256": request_sha,
                "candidate_diff_sha256": diff_sha,
                "tree_sha": tree_sha,
                "candidate_commit_sha": commit_sha,
                "parent_commit": source_head,
                "source_checkout_unchanged": False,
                "ref_updated": False,
                "authority": "evidentiary_only",
            }
        finally:
            run(["git", "worktree", "remove", "--force", str(worktree)], root)

    unchanged = (
        git(root, "rev-parse", "HEAD") == source_head
        and git(root, "status", "--porcelain") == source_status
    )
    if not unchanged:
        fail("source checkout changed during candidate commit construction")
    attestation["source_checkout_unchanged"] = True
    attestation["attestation_sha256"] = digest_json(attestation)
    rendered = json.dumps(attestation, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
