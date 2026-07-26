#!/usr/bin/env python3
"""Build a deterministic candidate Git commit without moving repository refs."""
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

ACTIONS = {"create", "update", "delete", "rename"}
SHA40 = re.compile(r"^[0-9a-f]{40}$")
SHA64 = re.compile(r"^[0-9a-f]{64}$")


def fail(message: str) -> None:
    print(f"FAIL {message}", file=sys.stderr)
    raise SystemExit(1)


def run(command: list[str], cwd: Path, *, env: dict[str, str] | None = None,
        input_text: str | None = None) -> str:
    result = subprocess.run(
        command, cwd=cwd, env=env, input=input_text, text=True,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=False,
    )
    if result.returncode != 0:
        fail(f"command failed ({' '.join(command)}): {result.stdout.strip()}")
    return result.stdout.strip()


def git(root: Path, *args: str, env: dict[str, str] | None = None,
        input_text: str | None = None) -> str:
    return run(["git", *args], root, env=env, input_text=input_text)


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_json(value: dict[str, Any]) -> str:
    return sha256_bytes(
        json.dumps(value, sort_keys=True, separators=(",", ":")).encode()
    )


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


def contained(root: Path, repo_path: str) -> Path:
    candidate = (root / repo_path).resolve()
    try:
        candidate.relative_to(root.resolve())
    except ValueError:
        fail(f"payload path escapes payload directory: {repo_path}")
    return candidate


def canonical_timestamp(raw: str) -> str:
    if not raw.endswith("Z"):
        fail("commit timestamp must use UTC Z notation")
    try:
        parsed = datetime.fromisoformat(raw[:-1] + "+00:00")
    except ValueError as exc:
        fail(f"invalid commit timestamp: {exc}")
    return parsed.strftime("%Y-%m-%dT%H:%M:%SZ")


def refs_snapshot(root: Path) -> str:
    return git(root, "for-each-ref", "--format=%(refname)%00%(objectname)")


def validate(
    bundle: dict[str, Any], patch: dict[str, Any], request: dict[str, Any], root: Path
) -> list[dict[str, Any]]:
    verify_digest(bundle, "bundle_sha256", "patch bundle")
    verify_digest(patch, "attestation_sha256", "patch attestation")
    if bundle.get("record_type") != "repository_patch_bundle":
        fail("unsupported patch bundle record type")
    if patch.get("record_type") != "isolated_patch_attestation":
        fail("unsupported patch attestation record type")
    if patch.get("status") != "pass" or patch.get("source_checkout_unchanged") is not True:
        fail("patch attestation must be passing and source-preserving")
    if patch.get("bundle_sha256") != bundle.get("bundle_sha256"):
        fail("patch attestation is not bound to the supplied bundle")
    if patch.get("base_commit") != bundle.get("base_commit"):
        fail("patch attestation base does not match bundle")

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
    bindings = {
        "repository": bundle.get("repository"),
        "base_commit": bundle.get("base_commit"),
        "target_branch": "mobile",
        "bundle_sha256": bundle.get("bundle_sha256"),
        "patch_attestation_sha256": patch.get("attestation_sha256"),
    }
    for field, expected in bindings.items():
        if request.get(field) != expected:
            fail(f"candidate commit request {field} binding mismatch")
    if bundle.get("target_branch") != "mobile":
        fail("patch bundle target_branch must be mobile")
    for field in ("author_name", "author_email", "message"):
        if not str(request.get(field, "")).strip():
            fail(f"candidate commit request {field} is required")
    canonical_timestamp(str(request["timestamp"]))

    base = str(bundle.get("base_commit", ""))
    if SHA40.fullmatch(base) is None:
        fail("bundle base_commit must be a full Git SHA")
    if git(root, "rev-parse", "HEAD") != base:
        fail("bundle base_commit does not match exact repository HEAD")
    if git(root, "branch", "--show-current") != "mobile":
        fail("candidate commit construction must begin from mobile")
    if git(root, "status", "--porcelain"):
        fail("source checkout must be clean")

    raw_changes = bundle.get("changes")
    if not isinstance(raw_changes, list) or not raw_changes:
        fail("patch bundle changes must be a non-empty array")
    changes: list[dict[str, Any]] = []
    targets: set[str] = set()
    sources: set[str] = set()
    for index, raw in enumerate(raw_changes):
        if not isinstance(raw, dict):
            fail(f"change {index} must be an object")
        action = str(raw.get("action", ""))
        if action not in ACTIONS:
            fail(f"change {index} has unsupported action")
        path = normalize_path(str(raw.get("path", "")))
        if path in targets:
            fail(f"duplicate target path: {path}")
        targets.add(path)
        item: dict[str, Any] = {"action": action, "path": path}
        if action == "rename":
            source = normalize_path(str(raw.get("from_path", "")))
            if source in sources or source in targets:
                fail(f"conflicting rename source: {source}")
            sources.add(source)
            item["from_path"] = source
        if action in {"create", "update"}:
            digest = str(raw.get("content_sha256", ""))
            if SHA64.fullmatch(digest) is None:
                fail(f"change {index} requires valid content_sha256")
            item["content_sha256"] = digest
        changes.append(item)
    return sorted(changes, key=lambda item: (item["path"], item["action"]))


def apply(worktree: Path, payload_root: Path, changes: list[dict[str, Any]]) -> None:
    for change in changes:
        action = change["action"]
        target = worktree / change["path"]
        if action in {"create", "update"}:
            if action == "create" and target.exists():
                fail(f"create target already exists: {change['path']}")
            if action == "update" and not target.is_file():
                fail(f"update target is not a file: {change['path']}")
            source = contained(payload_root, change["path"])
            if not source.is_file():
                fail(f"missing payload: {change['path']}")
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)
            if sha256_bytes(target.read_bytes()) != change["content_sha256"]:
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
    changes = validate(bundle, patch, request, root)
    payload_root = args.payload_dir.resolve()
    if not payload_root.is_dir():
        fail(f"payload directory does not exist: {payload_root}")

    head_before = git(root, "rev-parse", "HEAD")
    status_before = git(root, "status", "--porcelain")
    refs_before = refs_snapshot(root)
    with tempfile.TemporaryDirectory(prefix="arcanum-commit-") as temp:
        worktree = Path(temp) / "worktree"
        run(["git", "worktree", "add", "--detach", str(worktree), head_before], root)
        try:
            apply(worktree, payload_root, changes)
            git(worktree, "add", "-A")
            diff = subprocess.check_output(
                ["git", "diff", "--cached", "--binary", "HEAD"], cwd=worktree
            )
            diff_sha = sha256_bytes(diff)
            if diff_sha != patch.get("candidate_diff_sha256"):
                fail("reconstructed candidate diff does not match patch attestation")
            tree_sha = git(worktree, "write-tree")
            timestamp = canonical_timestamp(str(request["timestamp"]))
            env = os.environ.copy()
            env.update({
                "GIT_AUTHOR_NAME": str(request["author_name"]),
                "GIT_AUTHOR_EMAIL": str(request["author_email"]),
                "GIT_AUTHOR_DATE": timestamp,
                "GIT_COMMITTER_NAME": str(request["author_name"]),
                "GIT_COMMITTER_EMAIL": str(request["author_email"]),
                "GIT_COMMITTER_DATE": timestamp,
            })
            message = str(request["message"]).rstrip() + "\n"
            commit_sha = git(
                worktree, "commit-tree", tree_sha, "-p", head_before,
                env=env, input_text=message,
            )
            if SHA40.fullmatch(commit_sha) is None:
                fail("git commit-tree did not return a commit SHA")
            if git(worktree, "cat-file", "-t", commit_sha) != "commit":
                fail("candidate object is not a Git commit")
            if git(worktree, "show", "-s", "--format=%P", commit_sha) != head_before:
                fail("candidate commit parent mismatch")
            if git(worktree, "show", "-s", "--format=%T", commit_sha) != tree_sha:
                fail("candidate commit tree mismatch")
            attestation: dict[str, Any] = {
                "schema_version": "1.0",
                "record_type": "candidate_commit_attestation",
                "repository": bundle["repository"],
                "base_commit": head_before,
                "target_branch": "mobile",
                "bundle_sha256": bundle["bundle_sha256"],
                "patch_attestation_sha256": patch["attestation_sha256"],
                "request_sha256": sha256_json(request),
                "candidate_diff_sha256": diff_sha,
                "tree_sha": tree_sha,
                "candidate_commit_sha": commit_sha,
                "parent_commit": head_before,
                "source_checkout_unchanged": False,
                "refs_unchanged": False,
                "ref_updated": False,
                "authority": "evidentiary_only",
            }
        finally:
            run(["git", "worktree", "remove", "--force", str(worktree)], root)

    if git(root, "rev-parse", "HEAD") != head_before or git(root, "status", "--porcelain") != status_before:
        fail("source checkout changed during candidate commit construction")
    if refs_snapshot(root) != refs_before:
        fail("repository refs changed during candidate commit construction")
    attestation["source_checkout_unchanged"] = True
    attestation["refs_unchanged"] = True
    attestation["attestation_sha256"] = sha256_json(attestation)
    rendered = json.dumps(attestation, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
