#!/usr/bin/env python3
"""Parse build logs into deterministic, source-linked diagnostic evidence."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path
from typing import Any

RULES = (
    ("typescript", "error", re.compile(r"(?P<file>[^\s:(]+\.(?:ts|tsx))[:(](?P<line>\d+)[,:](?P<column>\d+)\)?\s*[-:]?\s*error\s+(?P<code>TS\d+):\s*(?P<message>.+)", re.I)),
    ("module_resolution", "error", re.compile(r"(?:Module not found|Cannot find module)[:\s]+[\"']?(?P<message>[^\n]+)", re.I)),
    ("environment", "error", re.compile(r"(?P<message>(?:Missing|required|undefined).*(?:environment variable|env(?:ironment)? variable|process\.env\.[A-Z0-9_]+))", re.I)),
    ("nextjs", "error", re.compile(r"(?P<message>(?:Build error occurred|Failed to compile|Error occurred prerendering page|Export encountered an error).*)", re.I)),
    ("runtime_boundary", "error", re.compile(r"(?P<message>.*(?:Edge Runtime|server-only|client component|Server Component).*(?:unsupported|cannot|must not|only).*)", re.I)),
    ("warning", "warning", re.compile(r"(?P<message>.*\bWARN(?:ING)?\b.*)", re.I)),
)
SOURCE_RE = re.compile(r"(?P<file>(?:apps|packages|src)/[^\s:()]+\.(?:ts|tsx|js|jsx|mjs|cjs))(?::(?P<line>\d+)(?::(?P<column>\d+))?)?")


def git_value(*args: str) -> str:
    return subprocess.check_output(["git", *args], text=True).strip()


def load_json(path: Path | None) -> dict[str, Any]:
    if path is None:
        return {}
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise SystemExit("metadata must be a JSON object")
    return value


def normalize(message: str) -> str:
    return " ".join(message.strip().split())


def diagnostic_id(item: dict[str, Any]) -> str:
    payload = json.dumps(item, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(payload).hexdigest()[:16]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("log", type=Path)
    parser.add_argument("--metadata", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    root = Path(git_value("rev-parse", "--show-toplevel"))
    text = args.log.read_text(encoding="utf-8", errors="replace")
    metadata = load_json(args.metadata)
    diagnostics: list[dict[str, Any]] = []
    seen: set[tuple[str, str, str | None]] = set()

    for raw in text.splitlines():
        line = normalize(raw)
        if not line:
            continue
        for category, severity, pattern in RULES:
            match = pattern.search(line)
            if not match:
                continue
            groups = match.groupdict()
            source_match = SOURCE_RE.search(line)
            source = groups.get("file") or (source_match.group("file") if source_match else None)
            source_line = groups.get("line") or (source_match.group("line") if source_match else None)
            source_column = groups.get("column") or (source_match.group("column") if source_match else None)
            message = normalize(groups.get("message") or line)
            code = groups.get("code")
            key = (category, code or message.lower(), source)
            if key in seen:
                break
            seen.add(key)
            item: dict[str, Any] = {
                "category": category,
                "severity": severity,
                "message": message,
                "source": source,
                "line": int(source_line) if source_line else None,
                "column": int(source_column) if source_column else None,
                "code": code,
            }
            item["id"] = diagnostic_id(item)
            diagnostics.append(item)
            break

    diagnostics.sort(key=lambda item: (item["severity"] != "error", item["category"], item.get("source") or "", item["id"]))
    errors = sum(item["severity"] == "error" for item in diagnostics)
    warnings = sum(item["severity"] == "warning" for item in diagnostics)
    report: dict[str, Any] = {
        "schema_version": "1.0",
        "record_type": "build_diagnostics_report",
        "repository": "https://github.com/The-Architect-369/Arcanum.git",
        "commit": git_value("rev-parse", "HEAD"),
        "log_sha256": hashlib.sha256(text.encode()).hexdigest(),
        "status": "fail" if errors else "pass",
        "summary": {"errors": errors, "warnings": warnings, "diagnostics": len(diagnostics)},
        "deployment": {
            "provider": metadata.get("provider"),
            "deployment_id": metadata.get("deployment_id"),
            "environment": metadata.get("environment"),
            "state": metadata.get("state"),
            "branch": metadata.get("branch"),
            "commit": metadata.get("commit"),
        },
        "diagnostics": diagnostics,
        "authority": "evidentiary_only",
    }
    canonical = json.dumps(report, sort_keys=True, separators=(",", ":")).encode()
    report["report_sha256"] = hashlib.sha256(canonical).hexdigest()
    rendered = json.dumps(report, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
