#!/usr/bin/env python3
"""Generate the deterministic, derived Architect continuity index."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

SCHEMA_ID = "arcanum.architect.continuity-index/v1"
INDEX_AUTHORITY = "derived-non-authoritative"
CONTROLLING_LOG = "docs/governance/architectgpt/architect-log.md"
SESSION_LEDGER = "docs/governance/architectgpt/sessions"
MANIFEST_PATH = "docs/governance/architectgpt/architect-gpt-manifest.yaml"
SESSION_RE = re.compile(r"^ARC-SES-([1-9][0-9]*)$")


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
        raise ValueError("missing opening frontmatter delimiter")
    try:
        end = lines.index("---", 1)
    except ValueError as exc:
        raise ValueError("missing closing frontmatter delimiter") from exc

    fm_lines = lines[1:end]
    data: dict[str, object] = {}
    i = 0
    while i < len(fm_lines):
        line = fm_lines[i]
        i += 1
        if not line.strip():
            continue
        if line.startswith((" ", "\t")):
            # Nested mappings belong to fields not projected by ARC-4.
            continue
        if ":" not in line:
            raise ValueError(f"invalid frontmatter line: {line!r}")
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
        raise ValueError(f"invalid session identifier: {session_id!r}")
    return int(match.group(1))


def read_reserved_session_ids(manifest: Path) -> list[str]:
    lines = manifest.read_text(encoding="utf-8").splitlines()
    in_control = False
    in_reserved = False
    found: list[str] = []
    for line in lines:
        if line == "session_schema_control:":
            in_control = True
            in_reserved = False
            continue
        if in_control and line and not line.startswith(" "):
            break
        if not in_control:
            continue
        if line == "  reserved_legacy_session_ids:":
            in_reserved = True
            continue
        if in_reserved:
            if line.startswith("    - "):
                value = line[6:].strip()
                session_number(value)
                found.append(value)
                continue
            if line.strip():
                in_reserved = False

    if len(found) != len(set(found)):
        raise ValueError("duplicate reserved session identifier in Architect manifest")
    return sorted(found, key=session_number)


def run_session_validator(ledger: Path) -> None:
    validator = Path(__file__).with_name("validate-session-records.py")
    schema = Path("docs/governance/architectgpt/session-record.schema.json")
    completed = subprocess.run(
        [sys.executable, str(validator), "--schema", str(schema), "--ledger", str(ledger)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    if completed.returncode != 0:
        detail = completed.stderr.strip() or completed.stdout.strip()
        raise ValueError(f"ARC-3 session validation failed: {detail}")


def build_index(
    ledger: Path = Path(SESSION_LEDGER),
    manifest: Path = Path(MANIFEST_PATH),
    *,
    validate_sessions: bool = True,
) -> dict:
    if validate_sessions:
        run_session_validator(ledger)

    records = sorted(p for p in ledger.glob("*.md") if p.name != "README.md")
    if not records:
        raise ValueError("no canonical session records found")

    sessions: list[dict] = []
    seen_sessions: dict[str, Path] = {}
    for path in records:
        raw_bytes = path.read_bytes()
        text = raw_bytes.decode("utf-8")
        data = parse_frontmatter(text)
        session_id = str(data.get("session_id", ""))
        session_number(session_id)
        if session_id in seen_sessions:
            raise ValueError(
                f"duplicate session identifier {session_id}: "
                f"{seen_sessions[session_id]} and {path}"
            )
        seen_sessions[session_id] = path

        required = (
            "task_id",
            "status",
            "head_commit_end",
            "decision_ids",
            "idea_ids",
            "correction_ids",
            "deferred_question_ids",
            "next_task_id",
        )
        missing = [key for key in required if key not in data]
        if missing:
            raise ValueError(
                f"{path}: missing projected frontmatter field(s): {', '.join(missing)}"
            )

        sessions.append(
            {
                "session_id": session_id,
                "task_id": data["task_id"],
                "status": data["status"],
                "record_path": path.as_posix(),
                "record_sha256": hashlib.sha256(raw_bytes).hexdigest(),
                "head_commit_end": data["head_commit_end"],
                "decision_ids": list(data["decision_ids"]),
                "idea_ids": list(data["idea_ids"]),
                "correction_ids": list(data["correction_ids"]),
                "deferred_question_ids": list(data["deferred_question_ids"]),
                "next_task_id": data["next_task_id"],
            }
        )

    sessions.sort(key=lambda item: session_number(item["session_id"]))
    reserved_ids = read_reserved_session_ids(manifest)
    collisions = sorted(set(reserved_ids) & set(seen_sessions), key=session_number)
    if collisions:
        raise ValueError(
            "reserved session identifier also has canonical record: "
            + ", ".join(collisions)
        )

    reserved_sessions = [
        {
            "session_id": session_id,
            "state": "RESERVED",
            "source_path": MANIFEST_PATH,
        }
        for session_id in reserved_ids
    ]

    represented = {session_number(s["session_id"]) for s in sessions}
    represented.update(session_number(s["session_id"]) for s in reserved_sessions)
    if represented:
        missing_numbers = sorted(set(range(1, max(represented) + 1)) - represented)
        if missing_numbers:
            raise ValueError(
                "missing session identifier(s) without explicit reservation: "
                + ", ".join(f"ARC-SES-{number}" for number in missing_numbers)
            )

    return {
        "schema": SCHEMA_ID,
        "record_type": "continuity-index",
        "authority": INDEX_AUTHORITY,
        "controlling_log": CONTROLLING_LOG,
        "session_ledger": SESSION_LEDGER,
        "reserved_sessions": reserved_sessions,
        "sessions": sessions,
    }


def serialize_index(data: dict) -> str:
    return json.dumps(data, indent=2, sort_keys=True, ensure_ascii=False) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ledger", default=SESSION_LEDGER)
    parser.add_argument("--manifest", default=MANIFEST_PATH)
    parser.add_argument(
        "--output",
        default="docs/governance/architectgpt/continuity-index.json",
    )
    parser.add_argument("--stdout", action="store_true")
    parser.add_argument(
        "--skip-session-validation",
        action="store_true",
        help="Testing only; canonical generation must not use this flag.",
    )
    args = parser.parse_args()

    try:
        data = build_index(
            Path(args.ledger),
            Path(args.manifest),
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
