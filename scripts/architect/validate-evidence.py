#!/usr/bin/env python3
"""Validate Architect GPT orchestration JSONL evidence records."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

PERMISSIONS = {"R0", "R1", "W1", "W2", "W3", "C1"}
PROVIDERS = {"github", "vercel", "google_workspace", "notion", "web", "local_termux"}
STATUSES = {"success", "failure", "pending", "observed", "unavailable", "denied"}
RECORD_TYPES = {"execution", "provider_evidence"}
SHA_RE = re.compile(r"^(?:[0-9a-f]{40}|unknown)$")
ALLOWED_KEYS = {
    "schema_version",
    "record_type",
    "timestamp",
    "repository",
    "branch",
    "commit",
    "permission_class",
    "provider",
    "status",
    "reference",
    "summary",
}


def fail(message: str) -> None:
    raise ValueError(message)


def validate_record(record: Any, line_number: int) -> None:
    if not isinstance(record, dict):
        fail(f"line {line_number}: record must be an object")

    unknown = set(record) - ALLOWED_KEYS
    if unknown:
        fail(f"line {line_number}: unsupported keys: {', '.join(sorted(unknown))}")

    required = {
        "schema_version",
        "record_type",
        "timestamp",
        "repository",
        "branch",
        "commit",
        "status",
        "summary",
    }
    missing = required - set(record)
    if missing:
        fail(f"line {line_number}: missing keys: {', '.join(sorted(missing))}")

    if record["schema_version"] != "1.0":
        fail(f"line {line_number}: schema_version must be 1.0")
    if record["record_type"] not in RECORD_TYPES:
        fail(f"line {line_number}: invalid record_type")
    if record["status"] not in STATUSES:
        fail(f"line {line_number}: invalid status")
    if not isinstance(record["repository"], str) or not record["repository"]:
        fail(f"line {line_number}: repository must be non-empty")
    if not isinstance(record["branch"], str) or not record["branch"]:
        fail(f"line {line_number}: branch must be non-empty")
    if not isinstance(record["summary"], str) or not record["summary"]:
        fail(f"line {line_number}: summary must be non-empty")
    if not isinstance(record["commit"], str) or not SHA_RE.fullmatch(record["commit"]):
        fail(f"line {line_number}: commit must be a 40-character lowercase SHA or unknown")

    if record["record_type"] == "execution":
        if record.get("permission_class") not in PERMISSIONS:
            fail(f"line {line_number}: execution record requires a valid permission_class")
        if "provider" in record or "reference" in record:
            fail(f"line {line_number}: execution record cannot contain provider/reference")
    else:
        if record.get("provider") not in PROVIDERS:
            fail(f"line {line_number}: provider_evidence requires a valid provider")
        if not isinstance(record.get("reference"), str) or not record["reference"]:
            fail(f"line {line_number}: provider_evidence requires a non-empty reference")
        if "permission_class" in record:
            fail(f"line {line_number}: provider_evidence cannot contain permission_class")


def validate_jsonl(path: Path) -> int:
    if not path.exists():
        print(f"SKIP evidence log not found: {path}")
        return 0

    count = 0
    with path.open("r", encoding="utf-8") as handle:
        for line_number, raw in enumerate(handle, start=1):
            if not raw.strip():
                continue
            try:
                record = json.loads(raw)
            except json.JSONDecodeError as exc:
                print(f"FAIL line {line_number}: invalid JSON: {exc}", file=sys.stderr)
                return 1
            try:
                validate_record(record, line_number)
            except ValueError as exc:
                print(f"FAIL {exc}", file=sys.stderr)
                return 1
            count += 1

    print(f"PASS validated {count} evidence record(s): {path}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("path", type=Path)
    args = parser.parse_args()
    return validate_jsonl(args.path)


if __name__ == "__main__":
    raise SystemExit(main())
