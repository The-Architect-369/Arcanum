#!/usr/bin/env python3
"""Apply a deterministic patch bundle inside a detached temporary Git worktree."""
from __future__ import annotations

import argparse
import hashlib
import json
import shlex
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

ALLOWED_ACTIONS = {"create", "update", "delete", "rename"}
ALLOWED_PERMISSIONS = {"W1", "W2", "W3", "C1"}


def fail(message: str) -> None:
    print(f"FAIL {message}", file=sys.stderr)
    raise SystemExit(1)


def run(command: list[str], cwd: Path, check: bool = True) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(
        command,
        cwd=cwd,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    if check and result.returncode != 0:
        fail(f"command failed ({' '.join(command)}): {result.stdout.strip()}")
    return result


def git(root: Path, *args: str) -> str:
    return run(["git", *args], root).stdout.strip()


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def normalize_path(raw: str) -> str:
    path = Path(raw)
    if path.is_absolute() or ".." in path.parts or not raw:
        fail(f"unsafe repository path: {raw}")
    value = path.as_posix()
    while value.startswith("./"):
        value = value[2:]
    if not value or value == ".git" or value.startswith(".git/"):
        fail(f"unsafe repository path: {raw}")
    return value


def load_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"unable to read JSON {path}: {exc}")
    if not isinstance(value, dict):
        fail(f"expected JSON object: {path}")
    return value


def validate_bundle(bundle: dict[str, Any], root: Path) -> list[dict[str, Any]]:
    required = {
        "schema_version", "record_type", "repository", "base_commit",
        "target_branch", "permission_class", "summary", "changes", "bundle_sha256",
    }
    missing = sorted(required - bundle.keys())
    if missing:
        fail(f"patch bundle missing fields: {', '.join(missing)}")
    if bundle["schema_version"] != "1.0" or bundle["record_type"] != "repository_patch_bundle":
        fail("unsupported patch bundle schema or record type")
    if bundle["target_branch"] != "mobile":
        fail("patch bundle target_branch must be mobile")
    if bundle["permission_class"] not in ALLOWED_PERMISSIONS:
        fail("unsupported patch bundle permission class")
    digest = str(bundle["bundle_sha256"])
    unsigned = dict(bundle)
    unsigned.pop("bundle_sha256", None)
    actual = sha256_bytes(json.dumps(unsigned, sort_keys=True, separators=(",", ":")).encode())
    if digest != actual:
        fail(f"patch bundle digest mismatch: {actual} != {digest}")
    base = str(bundle["base_commit"])
    if git(root, "rev-parse", "HEAD") != base:
        fail("patch bundle base_commit does not match exact repository HEAD")
    branch = git(root, "branch", "--show-current")
    if branch != "mobile":
        fail("isolated patch execution must begin from mobile")
    if git(root, "status", "--porcelain"):
        fail("source checkout must be clean")
    changes = bundle["changes"]
    if not isinstance(changes, list) or not changes:
        fail("patch bundle changes must be a non-empty array")
    normalized: list[dict[str, Any]] = []
    targets: set[str] = set()
    sources: set[str] = set()
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
            source = normalize_path(str(raw.get("from_path", "")))
            if source in sources or source in targets:
                fail(f"duplicate or conflicting rename source: {source}")
            sources.add(source)
            item["from_path"] = source
        if raw.get("content_sha256") is not None:
            content_digest = str(raw["content_sha256"])
            if len(content_digest) != 64 or any(c not in "0123456789abcdef" for c in content_digest):
                fail(f"change {index} has invalid content_sha256")
            item["content_sha256"] = content_digest
        normalized.append(item)
    return sorted(normalized, key=lambda item: (item["path"], item["action"]))


def payload_path(payload_root: Path, repo_path: str) -> Path:
    candidate = (payload_root / repo_path).resolve()
    try:
        candidate.relative_to(payload_root.resolve())
    except ValueError:
        fail(f"payload path escapes payload directory: {repo_path}")
    return candidate


def apply_changes(worktree: Path, payload_root: Path, changes: list[dict[str, Any]]) -> None:
    for change in changes:
        action = change["action"]
        target = worktree / change["path"]
        if action == "create":
            if target.exists():
                fail(f"create target already exists: {change['path']}")
            source = payload_path(payload_root, change["path"])
            if not source.is_file():
                fail(f"missing create payload: {change['path']}")
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)
        elif action == "update":
            if not target.is_file():
                fail(f"update target is not a file: {change['path']}")
            source = payload_path(payload_root, change["path"])
            if not source.is_file():
                fail(f"missing update payload: {change['path']}")
            shutil.copyfile(source, target)
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
        if action in {"create", "update"}:
            expected = change.get("content_sha256")
            if expected is None:
                fail(f"{action} requires content_sha256: {change['path']}")
            actual = sha256_file(target)
            if actual != expected:
                fail(f"payload digest mismatch for {change['path']}: {actual} != {expected}")


def expected_status(changes: list[dict[str, Any]]) -> list[tuple[str, ...]]:
    values: list[tuple[str, ...]] = []
    for change in changes:
        action = change["action"]
        if action == "rename":
            values.append(("R", change["from_path"], change["path"]))
        else:
            code = {"create": "A", "update": "M", "delete": "D"}[action]
            values.append((code, change["path"]))
    return sorted(values)


def observed_status(worktree: Path) -> list[tuple[str, ...]]:
    run(["git", "add", "-A"], worktree)
    output = git(worktree, "diff", "--cached", "--name-status", "--find-renames=100%", "HEAD")
    values: list[tuple[str, ...]] = []
    for line in output.splitlines():
        parts = line.split("\t")
        code = parts[0][0]
        if code == "R" and len(parts) == 3:
            values.append(("R", normalize_path(parts[1]), normalize_path(parts[2])))
        elif code in {"A", "M", "D"} and len(parts) == 2:
            values.append((code, normalize_path(parts[1])))
        else:
            fail(f"unsupported observed mutation: {line}")
    return sorted(values)


def verify_commands(worktree: Path, commands: list[str]) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    for command in commands:
        argv = shlex.split(command)
        if not argv:
            fail("empty verification command")
        completed = run(argv, worktree, check=False)
        results.append({
            "command": command,
            "exit_code": completed.returncode,
            "output_sha256": sha256_bytes(completed.stdout.encode()),
            "status": "pass" if completed.returncode == 0 else "fail",
        })
        if completed.returncode != 0:
            fail(f"verification command failed: {command}")
    return results


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("bundle", type=Path)
    parser.add_argument("--payload-dir", type=Path, required=True)
    parser.add_argument("--verify-command", action="append", default=[])
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    root = Path(git(Path.cwd(), "rev-parse", "--show-toplevel"))
    bundle = load_json(args.bundle.resolve())
    changes = validate_bundle(bundle, root)
    payload_root = args.payload_dir.resolve()
    if not payload_root.is_dir():
        fail(f"payload directory does not exist: {payload_root}")
    source_head = git(root, "rev-parse", "HEAD")
    source_status_before = git(root, "status", "--porcelain")

    with tempfile.TemporaryDirectory(prefix="arcanum-patch-") as temp:
        worktree = Path(temp) / "worktree"
        run(["git", "worktree", "add", "--detach", str(worktree), source_head], root)
        try:
            apply_changes(worktree, payload_root, changes)
            expected = expected_status(changes)
            observed = observed_status(worktree)
            if observed != expected:
                fail(f"declared mutations do not match observed diff: expected={expected} observed={observed}")
            verification = verify_commands(worktree, args.verify_command)
            diff = run(["git", "diff", "--cached", "--binary", "HEAD"], worktree).stdout
            attestation: dict[str, Any] = {
                "schema_version": "1.0",
                "record_type": "isolated_patch_attestation",
                "repository": bundle["repository"],
                "base_commit": source_head,
                "target_branch": bundle["target_branch"],
                "permission_class": bundle["permission_class"],
                "bundle_sha256": bundle["bundle_sha256"],
                "status": "pass",
                "declared_changes": changes,
                "observed_status": [list(item) for item in observed],
                "verification": verification,
                "candidate_diff_sha256": sha256_bytes(diff.encode()),
                "source_checkout_unchanged": False,
                "authority": "evidentiary_only",
            }
        finally:
            run(["git", "worktree", "remove", "--force", str(worktree)], root, check=False)

    source_unchanged = (
        git(root, "rev-parse", "HEAD") == source_head
        and git(root, "status", "--porcelain") == source_status_before
    )
    if not source_unchanged:
        fail("source checkout changed during isolated execution")
    attestation["source_checkout_unchanged"] = True
    payload = json.dumps(attestation, sort_keys=True, separators=(",", ":")).encode()
    attestation["attestation_sha256"] = sha256_bytes(payload)
    rendered = json.dumps(attestation, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
