#!/usr/bin/env python3
"""Validate canonical Architect session Markdown records without external YAML dependencies."""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo


GRANDFATHERED = {
    "2026-08-12--arc-ses-0002--arc-1--github-conversation-memory-contract.md"
}

REQUIRED_BODY_HEADINGS = [
    "## Purpose",
    "## Grounding",
    "## Source inventory",
    "## Outcome",
    "## Typed records",
    "## Repository changes",
    "## Verification",
    "## Privacy review",
    "## Unresolved matters",
    "## Exact next task",
]

LEGACY_BODY_HEADINGS = {
    "2026-08-12--arc-ses-0002--arc-1--github-conversation-memory-contract.md": [
        "## Purpose",
        "## Grounding",
        "## Source inventory",
        "## Outcome",
        "## Typed records",
        "## Privacy review",
        "## Repository changes",
        "## Verification state",
        "## Exact next task",
    ]
}


def fail(message: str) -> None:
    raise ValueError(message)


def parse_scalar(raw: str):
    raw = raw.strip()
    if raw == "":
        return ""
    if raw == "true":
        return True
    if raw == "false":
        return False
    if raw in {"null", "~"}:
        return None
    if raw.startswith("[") and raw.endswith("]"):
        return json.loads(raw)
    if raw.startswith('"') and raw.endswith('"'):
        return json.loads(raw)
    if raw.startswith("'") and raw.endswith("'"):
        return raw[1:-1].replace("''", "'")
    return raw


def parse_frontmatter(text: str) -> tuple[dict, str]:
    lines = text.splitlines()
    if not lines or lines[0] != "---":
        fail("missing opening frontmatter delimiter")
    try:
        end = lines.index("---", 1)
    except ValueError as exc:
        raise ValueError("missing closing frontmatter delimiter") from exc

    fm_lines = lines[1:end]
    body = "\n".join(lines[end + 1 :])
    data: dict[str, object] = {}
    i = 0

    while i < len(fm_lines):
        line = fm_lines[i]
        i += 1
        if not line.strip():
            continue
        if line.startswith((" ", "\t")):
            fail(f"unexpected indentation in frontmatter: {line!r}")
        if ":" not in line:
            fail(f"invalid frontmatter line: {line!r}")

        key, raw = line.split(":", 1)
        key = key.strip()
        raw = raw.strip()
        if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", key):
            fail(f"invalid top-level key: {key!r}")
        if key in data:
            fail(f"duplicate frontmatter key: {key}")

        if raw:
            data[key] = parse_scalar(raw)
            continue

        items: list[object] = []
        while i < len(fm_lines):
            candidate = fm_lines[i]
            if candidate.startswith("  - "):
                items.append(parse_scalar(candidate[4:]))
                i += 1
                continue
            if not candidate.strip():
                i += 1
                continue
            break
        data[key] = items

    return data, body


def check_datetime(value: str, field: str) -> None:
    if "T" not in value:
        fail(f"{field} must be an ISO-8601 timestamp with time and offset")
    candidate = value.replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(candidate)
    except ValueError as exc:
        raise ValueError(f"{field} is not a valid ISO-8601 timestamp") from exc
    if parsed.tzinfo is None:
        fail(f"{field} must include a UTC offset or Z")


def validate_json_schema_subset(data: dict, schema: dict) -> None:
    properties = schema["properties"]
    required = schema["required"]

    for key in required:
        if key not in data:
            fail(f"missing required frontmatter field: {key}")

    if schema.get("additionalProperties") is False:
        unknown = sorted(set(data) - set(properties))
        if unknown:
            fail(f"unknown frontmatter field(s): {', '.join(unknown)}")

    for key, value in data.items():
        rule = properties.get(key, {})
        if "const" in rule and value != rule["const"]:
            fail(f"{key} must equal {rule['const']!r}")
        if "enum" in rule and value not in rule["enum"]:
            fail(f"{key} has invalid value {value!r}")

        expected = rule.get("type")
        if expected == "string" and not isinstance(value, str):
            fail(f"{key} must be a string")
        if expected == "boolean" and not isinstance(value, bool):
            fail(f"{key} must be a boolean")
        if expected == "array":
            if not isinstance(value, list):
                fail(f"{key} must be an array")
            if len(value) < rule.get("minItems", 0):
                fail(f"{key} must contain at least {rule['minItems']} item(s)")
            item_rule = rule.get("items", {})
            for item in value:
                if item_rule.get("type") == "string" and not isinstance(item, str):
                    fail(f"{key} items must be strings")
                if isinstance(item, str):
                    pattern = item_rule.get("pattern")
                    if pattern and not re.fullmatch(pattern, item):
                        fail(f"{key} item does not match required pattern: {item!r}")
                    if len(item) < item_rule.get("minLength", 0):
                        fail(f"{key} contains an empty/short item")

        if isinstance(value, str):
            if len(value) < rule.get("minLength", 0):
                fail(f"{key} is shorter than allowed")
            if len(value) > rule.get("maxLength", 10**9):
                fail(f"{key} is longer than allowed")
            pattern = rule.get("pattern")
            if pattern and not re.fullmatch(pattern, value):
                fail(f"{key} does not match required pattern: {value!r}")


def expected_filename(data: dict) -> str:
    session_match = re.fullmatch(r"ARC-SES-([1-9][0-9]*)", data["session_id"])
    task_match = re.fullmatch(r"ARC-([1-9][0-9]*)", data["task_id"])
    if not session_match or not task_match:
        fail("cannot derive filename from session_id/task_id")
    check_datetime(data["started_at"], "started_at")
    dt = datetime.fromisoformat(data["started_at"].replace("Z", "+00:00"))
    local_date = dt.astimezone(ZoneInfo("America/New_York")).date().isoformat()
    number = int(session_match.group(1))
    segment = str(number).zfill(4)
    return (
        f"{local_date}--arc-ses-{segment}--"
        f"{data['task_id'].lower()}--{data['filename_slug']}.md"
    )


def child_ids_from_body(body: str) -> dict[str, list[str]]:
    found = {"decision_ids": [], "idea_ids": [], "correction_ids": [], "deferred_question_ids": []}
    patterns = {
        "decision_ids": r"^### (ARC-DEC-[1-9][0-9]*-[0-9]{2})\b",
        "idea_ids": r"^### (ARC-IDE-[1-9][0-9]*-[0-9]{2})\b",
        "correction_ids": r"^### (ARC-COR-[1-9][0-9]*-[0-9]{2})\b",
        "deferred_question_ids": r"^### (ARC-DQ-[1-9][0-9]*-[0-9]{2})\b",
    }
    for key, pattern in patterns.items():
        found[key] = re.findall(pattern, body, flags=re.MULTILINE)
    return found


def validate_record(path: Path, schema: dict) -> list[str]:
    text = path.read_text(encoding="utf-8")
    data, body = parse_frontmatter(text)
    warnings: list[str] = []
    legacy = path.name in GRANDFATHERED

    if legacy:
        legacy_data = dict(data)
        legacy_data.setdefault("filename_slug", path.stem.split("--", 3)[-1])
        legacy_data.setdefault("privacy_review_status", "COMPLETE")
        legacy_data["source_refs"] = [
            "github:file:grandfathered-arc-ses-2@b0023e0429765d8f1b4344c34b072a2c70faae8d"
        ]
        legacy_data["provider_provenance"] = [
            "github:connector:read",
            "notion:connector:read"
        ]
        legacy_data["verification"] = [
            "PASS | grandfathered ARC-SES-2 | reviewed pre-ARC-3 verification evidence"
        ]
        if re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(legacy_data.get("started_at", ""))):
            legacy_data["started_at"] = f"{legacy_data['started_at']}T00:00:00-04:00"
        if re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(legacy_data.get("reviewed_at", ""))):
            legacy_data["reviewed_at"] = f"{legacy_data['reviewed_at']}T00:00:00-04:00"
        data_for_schema = legacy_data
        warnings.append("reviewed grandfathered ARC-SES-2 metadata exceptions")
    else:
        data_for_schema = data

    validate_json_schema_subset(data_for_schema, schema)

    if data_for_schema["started_at"]:
        check_datetime(data_for_schema["started_at"], "started_at")
    for field in ("closed_at", "reviewed_at"):
        if data_for_schema[field]:
            check_datetime(data_for_schema[field], field)

    if expected_filename(data_for_schema) != path.name:
        fail(
            f"filename mismatch: expected {expected_filename(data_for_schema)!r}, "
            f"found {path.name!r}"
        )

    required_headings = LEGACY_BODY_HEADINGS.get(path.name, REQUIRED_BODY_HEADINGS)
    cursor = -1
    for heading in required_headings:
        pos = body.find(heading)
        if pos < 0:
            fail(f"missing required body heading: {heading}")
        if pos <= cursor:
            fail(f"body heading out of order: {heading}")
        cursor = pos

    ids = child_ids_from_body(body)
    for key, observed in ids.items():
        declared = data.get(key, [])
        if observed != declared:
            fail(f"{key} mismatch: frontmatter={declared!r}, body={observed!r}")

    session_number = re.search(r"([1-9][0-9]*)$", data_for_schema["session_id"]).group(1)
    for key, values in ids.items():
        for value in values:
            parts = value.split("-")
            parent_number = parts[-2]
            if parent_number != session_number:
                fail(f"child ID {value} does not match parent {data_for_schema['session_id']}")

    if data_for_schema["status"] in {"CLOSED", "BACKFILL"}:
        if not re.fullmatch(r"[0-9a-f]{40}", data_for_schema["head_commit_end"]):
            fail("closed/backfill record requires exact head_commit_end")
        if data_for_schema["review_status"] != "APPROVED":
            fail("closed/backfill record requires review_status APPROVED")
        if data_for_schema["privacy_review_status"] != "COMPLETE":
            fail("closed/backfill record requires privacy_review_status COMPLETE")
        for field in ("closed_at", "outcome", "next_task_id", "next_gate", "reviewed_by", "reviewed_at", "approval_source", "github_commit"):
            if not data_for_schema[field]:
                fail(f"closed/backfill record requires non-empty {field}")

    return warnings


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--schema",
        default="docs/governance/architectgpt/session-record.schema.json",
    )
    parser.add_argument(
        "--ledger",
        default="docs/governance/architectgpt/sessions",
    )
    args = parser.parse_args()

    schema_path = Path(args.schema)
    ledger = Path(args.ledger)
    schema = json.loads(schema_path.read_text(encoding="utf-8"))

    failures = 0
    records = sorted(p for p in ledger.glob("*.md") if p.name != "README.md")
    if not records:
        print("ERROR: no canonical session records found", file=sys.stderr)
        return 1

    for path in records:
        try:
            warnings = validate_record(path, schema)
            note = f" ({'; '.join(warnings)})" if warnings else ""
            print(f"PASS: {path}{note}")
        except Exception as exc:
            failures += 1
            print(f"FAIL: {path}: {exc}", file=sys.stderr)

    if failures:
        print(f"Session ledger validation failed: {failures} record(s)", file=sys.stderr)
        return 1

    print(f"Session ledger validation passed: {len(records)} record(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
