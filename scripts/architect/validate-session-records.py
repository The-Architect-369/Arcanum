#!/usr/bin/env python3
"""Validate active Architect session records for the post-seal continuity epoch."""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

SESSION_RE = re.compile(r"^ARC-SES-([1-9][0-9]*)$")
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

    data: dict[str, object] = {}
    fm_lines = lines[1:end]
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

    return data, "\n".join(lines[end + 1 :])


def check_datetime(value: str, field: str) -> None:
    if "T" not in value:
        fail(f"{field} must be an ISO-8601 timestamp with time and offset")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError(f"{field} is not valid ISO-8601") from exc
    if parsed.tzinfo is None:
        fail(f"{field} must include an offset or Z")


def validate_schema_subset(data: dict, schema: dict) -> None:
    properties = schema["properties"]
    for key in schema["required"]:
        if key not in data:
            fail(f"missing required frontmatter field: {key}")
    if schema.get("additionalProperties") is False:
        unknown = sorted(set(data) - set(properties))
        if unknown:
            fail("unknown frontmatter field(s): " + ", ".join(unknown))

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


def session_number(session_id: str) -> int:
    match = SESSION_RE.fullmatch(session_id)
    if not match:
        fail(f"invalid session identifier: {session_id!r}")
    return int(match.group(1))


def expected_filename(data: dict) -> str:
    check_datetime(str(data["started_at"]), "started_at")
    dt = datetime.fromisoformat(str(data["started_at"]).replace("Z", "+00:00"))
    local_date = dt.astimezone(ZoneInfo("America/New_York")).date().isoformat()
    number = session_number(str(data["session_id"]))
    return (
        f"{local_date}--arc-ses-{str(number).zfill(4)}--"
        f"{str(data['task_id']).lower()}--{data['filename_slug']}.md"
    )


def child_ids_from_body(body: str) -> dict[str, list[str]]:
    patterns = {
        "decision_ids": r"^### (ARC-DEC-[1-9][0-9]*-[0-9]{2})\b",
        "idea_ids": r"^### (ARC-IDE-[1-9][0-9]*-[0-9]{2})\b",
        "correction_ids": r"^### (ARC-COR-[1-9][0-9]*-[0-9]{2})\b",
        "deferred_question_ids": r"^### (ARC-DQ-[1-9][0-9]*-[0-9]{2})\b",
    }
    return {
        key: re.findall(pattern, body, flags=re.MULTILINE)
        for key, pattern in patterns.items()
    }


def first_session_number(seal_path: Path) -> int:
    seal = json.loads(seal_path.read_text(encoding="utf-8"))
    value = seal["active_epoch"]["first_session_number"]
    if not isinstance(value, int) or value < 1:
        fail("continuity epoch has invalid first_session_number")
    return value


def validate_record(path: Path, schema: dict, minimum_session: int) -> None:
    data, body = parse_frontmatter(path.read_text(encoding="utf-8"))
    validate_schema_subset(data, schema)

    number = session_number(str(data["session_id"]))
    if number < minimum_session:
        fail(
            f"{data['session_id']} belongs to the sealed predecessor epoch; "
            f"active records start at ARC-SES-{minimum_session}"
        )

    if expected_filename(data) != path.name:
        fail(f"filename mismatch: expected {expected_filename(data)!r}, found {path.name!r}")

    check_datetime(str(data["started_at"]), "started_at")
    for field in ("closed_at", "reviewed_at"):
        if data[field]:
            check_datetime(str(data[field]), field)

    cursor = -1
    for heading in REQUIRED_BODY_HEADINGS:
        pos = body.find(heading)
        if pos < 0:
            fail(f"missing required body heading: {heading}")
        if pos <= cursor:
            fail(f"body heading out of order: {heading}")
        cursor = pos

    observed_ids = child_ids_from_body(body)
    for key, observed in observed_ids.items():
        declared = data.get(key, [])
        if observed != declared:
            fail(f"{key} mismatch: frontmatter={declared!r}, body={observed!r}")
        for child_id in observed:
            parent_number = int(child_id.split("-")[-2])
            if parent_number != number:
                fail(f"child ID {child_id} does not match parent {data['session_id']}")

    if data["status"] in {"CLOSED", "BACKFILL"}:
        if not re.fullmatch(r"[0-9a-f]{40}", str(data["head_commit_end"])):
            fail("closed/backfill record requires exact head_commit_end")
        if data["review_status"] != "APPROVED":
            fail("closed/backfill record requires review_status APPROVED")
        if data["privacy_review_status"] != "COMPLETE":
            fail("closed/backfill record requires privacy_review_status COMPLETE")
        for field in (
            "closed_at", "outcome", "next_task_id", "next_gate",
            "reviewed_by", "reviewed_at", "approval_source", "github_commit",
        ):
            if not data[field]:
                fail(f"closed/backfill record requires non-empty {field}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--schema", default="docs/governance/architectgpt/session-record.schema.json")
    parser.add_argument("--ledger", default="docs/governance/architectgpt/sessions")
    parser.add_argument("--epoch-seal", default="docs/governance/architectgpt/continuity-epoch.json")
    args = parser.parse_args()

    try:
        schema = json.loads(Path(args.schema).read_text(encoding="utf-8"))
        minimum_session = first_session_number(Path(args.epoch_seal))
        records = sorted(
            p for p in Path(args.ledger).glob("*.md")
            if p.name != "README.md"
        )
        seen: set[str] = set()
        for path in records:
            data, _ = parse_frontmatter(path.read_text(encoding="utf-8"))
            session_id = str(data.get("session_id", ""))
            if session_id in seen:
                fail(f"duplicate session identifier: {session_id}")
            seen.add(session_id)
            validate_record(path, schema, minimum_session)
            print(f"PASS: {path}")

        print(
            f"Session ledger validation passed: {len(records)} active record(s); "
            f"active epoch starts at ARC-SES-{minimum_session}"
        )
        return 0
    except Exception as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
