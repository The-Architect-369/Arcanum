#!/usr/bin/env python3
"""Validate the sealed predecessor epoch and deterministic active continuity index."""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import subprocess
import sys
from pathlib import Path

SESSION_RE = re.compile(r"^ARC-SES-([1-9][0-9]*)$")


def fail(message: str) -> None:
    raise ValueError(message)


def session_number(session_id: str) -> int:
    match = SESSION_RE.fullmatch(session_id)
    if not match:
        fail(f"invalid session identifier: {session_id!r}")
    return int(match.group(1))


def git_output(*args: str) -> str:
    completed = subprocess.run(
        ["git", *args],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    if completed.returncode != 0:
        detail = completed.stderr.strip() or completed.stdout.strip()
        fail(f"git {' '.join(args)} failed: {detail}")
    return completed.stdout.strip()


def load_generator():
    path = Path(__file__).with_name("generate-continuity-index.py")
    spec = importlib.util.spec_from_file_location("architect_continuity_generator", path)
    if spec is None or spec.loader is None:
        fail(f"unable to load continuity generator: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def validate_epoch_seal(seal: dict) -> tuple[int, int]:
    expected_top = {"schema", "record_type", "authority", "sealed_epoch", "active_epoch"}
    if set(seal) != expected_top:
        fail("continuity epoch seal top-level keys do not match canonical shape")
    if seal["schema"] != "arcanum.architect.continuity-epoch/v1":
        fail("unsupported continuity epoch seal schema")
    if seal["record_type"] != "continuity-epoch-seal":
        fail("invalid continuity epoch record_type")
    if seal["authority"] != "continuity-metadata-only":
        fail("invalid continuity epoch authority")

    sealed = seal["sealed_epoch"]
    active = seal["active_epoch"]
    if sealed["epoch_id"] != "ARC-CONT-EPOCH-1" or sealed["status"] != "SEALED":
        fail("predecessor epoch identity/state mismatch")
    if active["epoch_id"] != "ARC-CONT-EPOCH-2" or active["status"] != "ACTIVE":
        fail("active epoch identity/state mismatch")
    if sealed["scope"] != "pre-baseline-developmental-continuity":
        fail("unexpected predecessor epoch scope")
    if active["starts_after_commit"] != sealed["sealed_through_commit"]:
        fail("active epoch must start after exact sealed predecessor commit")
    if active["predecessor_ids_never_reused"] is not True:
        fail("predecessor ID non-reuse invariant is not explicit")

    commit = sealed["sealed_through_commit"]
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        fail("sealed_through_commit must be exact 40-character SHA")
    git_output("cat-file", "-e", f"{commit}^{{commit}}")

    log = sealed["controlling_log"]
    if log["path"] != "docs/governance/architectgpt/architect-log.md":
        fail("sealed controlling log path is not canonical")
    observed_log_blob = git_output("rev-parse", f"{commit}:{log['path']}")
    if observed_log_blob != log["git_blob_sha"]:
        fail("sealed controlling-log blob does not match predecessor commit")

    reserved = sealed["reserved_session_ids"]
    if reserved != ["ARC-SES-1"]:
        fail("sealed predecessor reservation set must preserve ARC-SES-1 exactly")

    records = sealed["session_records"]
    if not isinstance(records, list) or not records:
        fail("sealed predecessor session record set is empty")
    numbers: list[int] = []
    seen_paths: set[str] = set()
    for item in records:
        if set(item) != {"session_id", "path", "git_blob_sha"}:
            fail("sealed session record has non-canonical shape")
        number = session_number(item["session_id"])
        numbers.append(number)
        if item["path"] in seen_paths:
            fail(f"duplicate sealed session path: {item['path']}")
        seen_paths.add(item["path"])
        observed_blob = git_output("rev-parse", f"{commit}:{item['path']}")
        if observed_blob != item["git_blob_sha"]:
            fail(f"sealed Git blob mismatch for {item['session_id']}")
        if Path(item["path"]).exists():
            fail(f"sealed predecessor body remains active: {item['path']}")

    if numbers != list(range(2, max(numbers) + 1)):
        fail("sealed predecessor session IDs must be the contiguous range ARC-SES-2..N")
    first = active["first_session_number"]
    if first != max(numbers) + 1:
        fail("active first_session_number must immediately follow sealed predecessor")
    return len(records), first


def validate_index_shape(data: dict, predecessor_count: int, first: int) -> None:
    expected_top = {
        "schema", "record_type", "authority", "epoch_seal",
        "predecessor_epoch", "active_epoch", "sessions",
    }
    if set(data) != expected_top:
        fail("continuity index top-level keys do not match canonical v2 shape")
    if data["schema"] != "arcanum.architect.continuity-index/v2":
        fail("continuity index schema must be v2")
    if data["record_type"] != "continuity-index":
        fail("continuity index record_type mismatch")
    if data["authority"] != "derived-non-authoritative":
        fail("continuity index authority mismatch")
    if data["epoch_seal"] != "docs/governance/architectgpt/continuity-epoch.json":
        fail("continuity index epoch_seal path mismatch")

    predecessor = data["predecessor_epoch"]
    if predecessor["epoch_id"] != "ARC-CONT-EPOCH-1" or predecessor["status"] != "SEALED":
        fail("continuity index predecessor summary mismatch")
    if predecessor["record_count"] != predecessor_count:
        fail("continuity index predecessor record_count mismatch")

    active = data["active_epoch"]
    if active["epoch_id"] != "ARC-CONT-EPOCH-2":
        fail("continuity index active epoch identity mismatch")
    if active["first_session_number"] != first:
        fail("continuity index active first_session_number mismatch")

    sessions = data["sessions"]
    if not isinstance(sessions, list):
        fail("continuity index sessions must be an array")
    numbers = [session_number(item["session_id"]) for item in sessions]
    if numbers and numbers != list(range(first, max(numbers) + 1)):
        fail("continuity index active session IDs are not contiguous")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--schema", default="docs/governance/architectgpt/continuity-index.schema.json")
    parser.add_argument("--index", default="docs/governance/architectgpt/continuity-index.json")
    parser.add_argument("--epoch-seal", default="docs/governance/architectgpt/continuity-epoch.json")
    parser.add_argument("--log", default="docs/governance/architectgpt/architect-log.md")
    args = parser.parse_args()

    try:
        schema = json.loads(Path(args.schema).read_text(encoding="utf-8"))
        if schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
            fail("continuity JSON Schema must declare Draft 2020-12")

        seal = json.loads(Path(args.epoch_seal).read_text(encoding="utf-8"))
        predecessor_count, first = validate_epoch_seal(seal)

        committed_text = Path(args.index).read_text(encoding="utf-8")
        committed = json.loads(committed_text)
        validate_index_shape(committed, predecessor_count, first)

        generator = load_generator()
        expected = generator.build_index(
            Path(seal["active_epoch"]["session_ledger"]),
            Path(args.epoch_seal),
            validate_sessions=True,
        )
        expected_text = generator.serialize_index(expected)
        if committed_text != expected_text:
            fail(
                "committed continuity index differs from deterministic regeneration; "
                "run scripts/architect/generate-continuity-index.py"
            )

        log_text = Path(args.log).read_text(encoding="utf-8")
        if "Current epoch: `ARC-CONT-EPOCH-2`" not in log_text:
            fail("active Architect log does not declare ARC-CONT-EPOCH-2")
        if seal["sealed_epoch"]["sealed_through_commit"] not in log_text:
            fail("active Architect log does not point to sealed predecessor commit")

        print(
            "Continuity epoch validation passed: "
            f"{predecessor_count} sealed predecessor record(s), "
            f"{len(committed['sessions'])} active session(s); "
            f"active IDs begin at ARC-SES-{first}"
        )
        return 0
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
