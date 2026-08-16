#!/usr/bin/env python3
"""Validate the deterministic Architect continuity index and cross-record invariants."""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from pathlib import Path

SESSION_RE = re.compile(r"^ARC-SES-([1-9][0-9]*)$")
SESSION_STATUSES = {"OPEN", "REVIEW-PENDING", "CLOSED", "NEEDS-CORRECTION", "BACKFILL"}
CHILD_PATTERNS = {
    "decision_ids": re.compile(r"^ARC-DEC-[1-9][0-9]*-[0-9]{2}$"),
    "idea_ids": re.compile(r"^ARC-IDE-[1-9][0-9]*-[0-9]{2}$"),
    "correction_ids": re.compile(r"^ARC-COR-[1-9][0-9]*-[0-9]{2}$"),
    "deferred_question_ids": re.compile(r"^ARC-DQ-[1-9][0-9]*-[0-9]{2}$"),
}


def fail(message: str) -> None:
    raise ValueError(message)


def session_number(session_id: str) -> int:
    match = SESSION_RE.fullmatch(session_id)
    if not match:
        fail(f"invalid session identifier: {session_id!r}")
    return int(match.group(1))


def load_generator():
    path = Path(__file__).with_name("generate-continuity-index.py")
    spec = importlib.util.spec_from_file_location("architect_continuity_generator", path)
    if spec is None or spec.loader is None:
        fail(f"unable to load continuity generator: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def validate_shape(data: dict) -> None:
    expected_top = {
        "schema",
        "record_type",
        "authority",
        "controlling_log",
        "session_ledger",
        "reserved_sessions",
        "sessions",
    }
    if set(data) != expected_top:
        fail("continuity index top-level keys do not match canonical shape")
    constants = {
        "schema": "arcanum.architect.continuity-index/v1",
        "record_type": "continuity-index",
        "authority": "derived-non-authoritative",
        "controlling_log": "docs/governance/architectgpt/architect-log.md",
        "session_ledger": "docs/governance/architectgpt/sessions",
    }
    for key, expected in constants.items():
        if data.get(key) != expected:
            fail(f"{key} must equal {expected!r}")

    reservations = data["reserved_sessions"]
    sessions = data["sessions"]
    if not isinstance(reservations, list) or not isinstance(sessions, list):
        fail("reserved_sessions and sessions must be arrays")

    reservation_ids: list[str] = []
    for item in reservations:
        if not isinstance(item, dict) or set(item) != {"session_id", "state", "source_path"}:
            fail("reserved session entry has non-canonical shape")
        session_number(item["session_id"])
        if item["state"] != "RESERVED":
            fail("reserved session state must equal RESERVED")
        if item["source_path"] != "docs/governance/architectgpt/architect-gpt-manifest.yaml":
            fail("reserved session source_path is not canonical")
        reservation_ids.append(item["session_id"])
    if reservation_ids != sorted(reservation_ids, key=session_number):
        fail("reserved sessions are not numerically ordered")
    if len(reservation_ids) != len(set(reservation_ids)):
        fail("duplicate reserved session identifier")

    session_ids: list[str] = []
    child_owner: dict[str, str] = {}
    required_session_keys = {
        "session_id",
        "task_id",
        "status",
        "record_path",
        "record_sha256",
        "head_commit_end",
        "decision_ids",
        "idea_ids",
        "correction_ids",
        "deferred_question_ids",
        "next_task_id",
    }
    for item in sessions:
        if not isinstance(item, dict) or set(item) != required_session_keys:
            fail("session index entry has non-canonical shape")
        session_number(item["session_id"])
        if not re.fullmatch(r"ARC-[1-9][0-9]*", item["task_id"]):
            fail(f"invalid task_id in {item['session_id']}")
        if item["status"] not in SESSION_STATUSES:
            fail(f"invalid status in {item['session_id']}")
        if not re.fullmatch(
            r"docs/governance/architectgpt/sessions/.+\.md",
            item["record_path"],
        ):
            fail(f"invalid record_path in {item['session_id']}")
        if not re.fullmatch(r"[0-9a-f]{64}", item["record_sha256"]):
            fail(f"invalid record_sha256 in {item['session_id']}")
        if not re.fullmatch(r"(?:|[0-9a-f]{40})", item["head_commit_end"]):
            fail(f"invalid head_commit_end in {item['session_id']}")
        if not re.fullmatch(r"(?:|ARC-[1-9][0-9]*)", item["next_task_id"]):
            fail(f"invalid next_task_id in {item['session_id']}")

        for field, pattern in CHILD_PATTERNS.items():
            values = item[field]
            if not isinstance(values, list):
                fail(f"{field} must be an array in {item['session_id']}")
            if len(values) != len(set(values)):
                fail(f"duplicate {field} within {item['session_id']}")
            for child_id in values:
                if not isinstance(child_id, str) or not pattern.fullmatch(child_id):
                    fail(f"invalid child ID {child_id!r} in {item['session_id']}")
                previous = child_owner.get(child_id)
                if previous is not None:
                    fail(
                        f"duplicate typed child identifier {child_id}: "
                        f"{previous} and {item['session_id']}"
                    )
                child_owner[child_id] = item["session_id"]
        session_ids.append(item["session_id"])

    if session_ids != sorted(session_ids, key=session_number):
        fail("sessions are not numerically ordered")
    if len(session_ids) != len(set(session_ids)):
        fail("duplicate session identifier in continuity index")
    collisions = sorted(set(session_ids) & set(reservation_ids), key=session_number)
    if collisions:
        fail("reserved session collision: " + ", ".join(collisions))

    represented = {session_number(value) for value in session_ids + reservation_ids}
    if represented:
        missing = sorted(set(range(1, max(represented) + 1)) - represented)
        if missing:
            fail(
                "missing session identifier(s): "
                + ", ".join(f"ARC-SES-{number}" for number in missing)
            )


def log_blocks(text: str) -> list[str]:
    starts = [match.start() for match in re.finditer(r"(?m)^## .+$", text)]
    if not starts:
        return []
    blocks: list[str] = []
    for index, start in enumerate(starts):
        end = starts[index + 1] if index + 1 < len(starts) else len(text)
        blocks.append(text[start:end])
    return blocks


def reconcile_log(data: dict, log_text: str) -> None:
    sessions = {item["session_id"]: item for item in data["sessions"]}
    reserved = {item["session_id"] for item in data["reserved_sessions"]}
    by_session: dict[str, list[str]] = {}

    for block in log_blocks(log_text):
        matches = re.findall(
            r"(?m)^-\s+Session:\s+`?(ARC-SES-[1-9][0-9]*)`?\s*$",
            block,
        )
        for session_id in matches:
            by_session.setdefault(session_id, []).append(block)

    for session_id, item in sessions.items():
        blocks = by_session.get(session_id, [])
        if item["status"] in {"CLOSED", "BACKFILL"}:
            matching = [block for block in blocks if item["record_path"] in block]
            if len(matching) != 1:
                fail(
                    f"{session_id} requires exactly one controlling-log block "
                    f"containing its canonical record path; found {len(matching)}"
                )

    for session_id, blocks in by_session.items():
        if session_id not in sessions and session_id not in reserved:
            fail(
                f"controlling log references non-reserved session with no "
                f"canonical record: {session_id}"
            )
        if session_id in sessions:
            record_path = sessions[session_id]["record_path"]
            if not any(record_path in block for block in blocks):
                fail(
                    f"controlling log session/path mismatch for {session_id}: "
                    f"expected {record_path}"
                )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--schema",
        default="docs/governance/architectgpt/continuity-index.schema.json",
    )
    parser.add_argument(
        "--index",
        default="docs/governance/architectgpt/continuity-index.json",
    )
    parser.add_argument(
        "--ledger",
        default="docs/governance/architectgpt/sessions",
    )
    parser.add_argument(
        "--manifest",
        default="docs/governance/architectgpt/architect-gpt-manifest.yaml",
    )
    parser.add_argument(
        "--log",
        default="docs/governance/architectgpt/architect-log.md",
    )
    args = parser.parse_args()

    try:
        schema = json.loads(Path(args.schema).read_text(encoding="utf-8"))
        if schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
            fail("continuity JSON Schema must declare Draft 2020-12")

        committed_text = Path(args.index).read_text(encoding="utf-8")
        committed = json.loads(committed_text)
        validate_shape(committed)

        generator = load_generator()
        expected = generator.build_index(
            Path(args.ledger),
            Path(args.manifest),
            validate_sessions=True,
        )
        expected_text = generator.serialize_index(expected)
        if committed_text != expected_text:
            fail(
                "committed continuity index differs from deterministic regeneration; "
                "run scripts/architect/generate-continuity-index.py"
            )

        reconcile_log(committed, Path(args.log).read_text(encoding="utf-8"))
        print(
            "Continuity index validation passed: "
            f"{len(committed['sessions'])} session(s), "
            f"{len(committed['reserved_sessions'])} reserved"
        )
        return 0
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
