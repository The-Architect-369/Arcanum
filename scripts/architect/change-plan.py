#!/usr/bin/env python3
"""Validate repository change plans and emit deterministic patch bundles."""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

ALLOWED_ACTIONS = {"create", "update", "delete", "rename"}
ALLOWED_PERMISSIONS = {"W1", "W2", "W3", "C1"}


def fail(message: str) -> None:
    print(f"FAIL {message}", file=sys.stderr)
    raise SystemExit(1)


def git_head() -> str:
    return subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()


def normalize_path(value: str) -> str:
    path = Path(value)
    if path.is_absolute() or ".." in path.parts or value.startswith(".git/"):
        fail(f"unsafe repository path: {value}")
    normalized = path.as_posix().lstrip("./")
    if not normalized:
        fail("empty repository path")
    return normalized


def load_plan(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"unable to read change plan: {exc}")
    if not isinstance(data, dict):
        fail("change plan must be an object")
    return data


def validate(plan: dict[str, Any]) -> list[dict[str, Any]]:
    required = {
        "schema_version", "record_type", "repository", "base_commit",
        "target_branch", "permission_class", "summary", "changes",
    }
    missing = sorted(required - plan.keys())
    if missing:
        fail(f"change plan missing fields: {', '.join(missing)}")
    if plan["schema_version"] != "1.0" or plan["record_type"] != "repository_change_plan":
        fail("unsupported change plan schema or record type")
    if plan["base_commit"] != git_head():
        fail("change plan base_commit does not match exact HEAD")
    if plan["target_branch"] != "mobile":
        fail("change plan target_branch must be mobile")
    if plan["permission_class"] not in ALLOWED_PERMISSIONS:
        fail("unsupported permission class")
    changes = plan["changes"]
    if not isinstance(changes, list) or not changes:
        fail("changes must be a non-empty array")
    normalized: list[dict[str, Any]] = []
    seen: set[str] = set()
    for index, raw in enumerate(changes):
        if not isinstance(raw, dict):
            fail(f"change {index} must be an object")
        action = raw.get("action")
        if action not in ALLOWED_ACTIONS:
            fail(f"change {index} has unsupported action")
        path = normalize_path(str(raw.get("path", "")))
        if path in seen:
            fail(f"duplicate change path: {path}")
        seen.add(path)
        item = {
            "action": action,
            "path": path,
            "purpose": str(raw.get("purpose", "")).strip(),
        }
        if not item["purpose"]:
            fail(f"change {index} purpose is required")
        if action == "rename":
            item["from_path"] = normalize_path(str(raw.get("from_path", "")))
        if raw.get("content_sha256") is not None:
            digest = str(raw["content_sha256"])
            if len(digest) != 64 or any(c not in "0123456789abcdef" for c in digest):
                fail(f"change {index} has invalid content_sha256")
            item["content_sha256"] = digest
        normalized.append(item)
    return sorted(normalized, key=lambda item: (item["path"], item["action"]))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("plan", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    plan = load_plan(args.plan)
    changes = validate(plan)
    canonical = {
        "schema_version": "1.0",
        "record_type": "repository_patch_bundle",
        "repository": plan["repository"],
        "base_commit": plan["base_commit"],
        "target_branch": plan["target_branch"],
        "permission_class": plan["permission_class"],
        "summary": str(plan["summary"]).strip(),
        "changes": changes,
    }
    payload = json.dumps(canonical, sort_keys=True, separators=(",", ":")).encode()
    canonical["bundle_sha256"] = hashlib.sha256(payload).hexdigest()
    rendered = json.dumps(canonical, indent=2, sort_keys=False) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
