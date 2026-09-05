#!/usr/bin/env python3
"""Generate the deterministic post-seal Architect continuity index."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

SCHEMA_ID = "arcanum.architect.continuity-index/v2"
INDEX_AUTHORITY = "derived-non-authoritative"
EPOCH_SEAL = "docs/governance/architectgpt/continuity-epoch.json"
SESSION_LEDGER = "docs/governance/architectgpt/sessions"
SESSION_RE = re.compile(r"^ARC-SES-([1-9][0-9]*)$")


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


def parse_frontmatter(text: str) -> dict:
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
    return data


def session_number(session_id: str) -> int:
    match = SESSION_RE.fullmatch(session_id)
    if not match:
        fail(f"invalid session identifier: {session_id!r}")
    return int(match.group(1))


def run_session_validator(ledger: Path, seal: Path) -> None:
    validator = Path(__file__).with_name("validate-session-records.py")
    completed = subprocess.run(
        [
            sys.executable, str(validator),
            "--ledger", str(ledger),
            "--epoch-seal", str(seal),
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    if completed.returncode != 0:
        detail = completed.stderr.strip() or completed.stdout.strip()
        fail(f"active session validation failed: {detail}")


def load_seal(path: Path) -> dict:
    seal = json.loads(path.read_text(encoding="utf-8"))
    if seal.get("schema") != "arcanum.architect.continuity-epoch/v1":
        fail("unsupported continuity epoch seal schema")
    if seal.get("record_type") != "continuity-epoch-seal":
        fail("invalid continuity epoch record_type")
    sealed = seal["sealed_epoch"]
    active = seal["active_epoch"]
    records = sealed["session_records"]
    if sealed["status"] != "SEALED" or active["status"] != "ACTIVE":
        fail("continuity epoch states are invalid")
    if not records:
        fail("sealed predecessor session record set is empty")
    numbers = [session_number(item["session_id"]) for item in records]
    if numbers != sorted(numbers) or len(numbers) != len(set(numbers)):
        fail("sealed predecessor sessions are not unique and numerically ordered")
    if active["first_session_number"] != max(numbers) + 1:
        fail("active first_session_number must immediately follow sealed predecessor")
    return seal


def build_index(
    ledger: Path = Path(SESSION_LEDGER),
    seal_path: Path = Path(EPOCH_SEAL),
    *,
    validate_sessions: bool = True,
) -> dict:
    seal = load_seal(seal_path)
    if validate_sessions:
        run_session_validator(ledger, seal_path)

    active = seal["active_epoch"]
    sealed = seal["sealed_epoch"]
    first = active["first_session_number"]

    sessions: list[dict] = []
    seen: set[str] = set()
    for path in sorted(p for p in ledger.glob("*.md") if p.name != "README.md"):
        raw = path.read_bytes()
        data = parse_frontmatter(raw.decode("utf-8"))
        session_id = str(data.get("session_id", ""))
        number = session_number(session_id)
        if number < first:
            fail(f"sealed predecessor session found in active ledger: {session_id}")
        if session_id in seen:
            fail(f"duplicate active session identifier: {session_id}")
        seen.add(session_id)
        required = (
            "task_id", "status", "head_commit_end", "decision_ids", "idea_ids",
            "correction_ids", "deferred_question_ids", "next_task_id",
        )
        missing = [key for key in required if key not in data]
        if missing:
            fail(f"{path}: missing projected field(s): {', '.join(missing)}")
        sessions.append(
            {
                "session_id": session_id,
                "task_id": data["task_id"],
                "status": data["status"],
                "record_path": path.as_posix(),
                "record_sha256": hashlib.sha256(raw).hexdigest(),
                "head_commit_end": data["head_commit_end"],
                "decision_ids": list(data["decision_ids"]),
                "idea_ids": list(data["idea_ids"]),
                "correction_ids": list(data["correction_ids"]),
                "deferred_question_ids": list(data["deferred_question_ids"]),
                "next_task_id": data["next_task_id"],
            }
        )

    sessions.sort(key=lambda item: session_number(item["session_id"]))
    if sessions:
        numbers = [session_number(item["session_id"]) for item in sessions]
        expected = list(range(first, max(numbers) + 1))
        if numbers != expected:
            fail(
                "active session identifier gap: expected "
                + ", ".join(f"ARC-SES-{n}" for n in expected)
            )

    predecessor_records = sealed["session_records"]
    return {
        "schema": SCHEMA_ID,
        "record_type": "continuity-index",
        "authority": INDEX_AUTHORITY,
        "epoch_seal": EPOCH_SEAL,
        "predecessor_epoch": {
            "epoch_id": sealed["epoch_id"],
            "status": sealed["status"],
            "sealed_through_commit": sealed["sealed_through_commit"],
            "last_session_id": predecessor_records[-1]["session_id"],
            "record_count": len(predecessor_records),
        },
        "active_epoch": {
            "epoch_id": active["epoch_id"],
            "first_session_number": first,
            "controlling_log": active["controlling_log"],
            "session_ledger": active["session_ledger"],
        },
        "sessions": sessions,
    }


def serialize_index(data: dict) -> str:
    return json.dumps(data, indent=2, sort_keys=True, ensure_ascii=False) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ledger", default=SESSION_LEDGER)
    parser.add_argument("--epoch-seal", default=EPOCH_SEAL)
    parser.add_argument("--output", default="docs/governance/architectgpt/continuity-index.json")
    parser.add_argument("--stdout", action="store_true")
    parser.add_argument("--skip-session-validation", action="store_true")
    args = parser.parse_args()

    try:
        data = build_index(
            Path(args.ledger),
            Path(args.epoch_seal),
            validate_sessions=not args.skip_session_validation,
        )
        rendered = serialize_index(data)
        if args.stdout:
            sys.stdout.write(rendered)
        else:
            Path(args.output).write_text(rendered, encoding="utf-8", newline="\n")
            print(f"Wrote deterministic continuity index: {args.output}")
        return 0
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
