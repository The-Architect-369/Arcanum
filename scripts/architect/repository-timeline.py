#!/usr/bin/env python3
"""Generate a deterministic repository timeline graph from bounded Git history."""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
from pathlib import Path
from typing import Any

REPOSITORY = "https://github.com/The-Architect-369/Arcanum.git"


def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], text=True, stderr=subprocess.DEVNULL).strip()


def git_lines(*args: str) -> list[str]:
    value = git(*args)
    return value.splitlines() if value else []


def file_history(path: str, limit: int) -> list[str]:
    return git_lines("log", f"-{limit}", "--format=%H", "--follow", "--", path)


def commit_metadata(commit: str) -> dict[str, Any]:
    fields = git("show", "-s", "--format=%H%x00%P%x00%aI%x00%an%x00%s", commit).split("\x00")
    return {
        "commit": fields[0],
        "parents": fields[1].split() if fields[1] else [],
        "timestamp": fields[2],
        "author": fields[3],
        "subject": fields[4],
    }


def file_state(commit: str, path: str) -> dict[str, Any]:
    try:
        blob = subprocess.check_output(["git", "show", f"{commit}:{path}"], stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        return {"exists": False, "blob_sha": None, "size_bytes": 0, "content_sha256": None}
    return {
        "exists": True,
        "blob_sha": git("rev-parse", f"{commit}:{path}"),
        "size_bytes": len(blob),
        "content_sha256": hashlib.sha256(blob).hexdigest(),
    }


def diff_summary(commit: str, path: str) -> dict[str, int]:
    output = git_lines("show", "--format=", "--numstat", commit, "--", path)
    added = deleted = 0
    for line in output:
        parts = line.split("\t")
        if len(parts) < 3:
            continue
        if parts[0].isdigit():
            added += int(parts[0])
        if parts[1].isdigit():
            deleted += int(parts[1])
    return {"added": added, "deleted": deleted}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="+")
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    if args.limit < 1 or args.limit > 200:
        raise SystemExit("--limit must be between 1 and 200")

    root = Path(git("rev-parse", "--show-toplevel"))
    head = git("rev-parse", "HEAD")
    nodes: list[dict[str, Any]] = []
    edges: list[dict[str, str]] = []

    for raw_path in sorted(set(args.paths)):
        path = Path(raw_path).as_posix()
        if path.startswith("../") or Path(path).is_absolute():
            raise SystemExit(f"path escapes repository: {raw_path}")
        history = file_history(path, args.limit)
        previous_id: str | None = None
        for commit in reversed(history):
            metadata = commit_metadata(commit)
            state = file_state(commit, path)
            summary = diff_summary(commit, path)
            node_id = hashlib.sha256(f"{path}\0{commit}".encode()).hexdigest()[:20]
            node = {
                "id": node_id,
                "path": path,
                **metadata,
                **state,
                "diff": summary,
            }
            nodes.append(node)
            if previous_id:
                edges.append({"from": previous_id, "to": node_id, "relation": "superseded_by"})
            previous_id = node_id

    nodes.sort(key=lambda item: (item["path"], item["timestamp"], item["commit"]))
    edges.sort(key=lambda item: (item["from"], item["to"]))
    latest_by_path: dict[str, str] = {}
    for node in nodes:
        latest_by_path[node["path"]] = node["id"]

    report: dict[str, Any] = {
        "schema_version": "1.0",
        "record_type": "repository_timeline_graph",
        "repository": REPOSITORY,
        "commit": head,
        "history_limit": args.limit,
        "paths": sorted(set(args.paths)),
        "summary": {
            "nodes": len(nodes),
            "edges": len(edges),
            "tracked_paths": len(set(args.paths)),
        },
        "nodes": nodes,
        "edges": edges,
        "latest_by_path": latest_by_path,
        "rollback_guidance": "Rollback suggestions are evidentiary only; inspect the target commit and apply through an authorized change plan.",
        "authority": "evidentiary_only",
    }
    canonical = json.dumps(report, sort_keys=True, separators=(",", ":")).encode()
    report["report_sha256"] = hashlib.sha256(canonical).hexdigest()
    rendered = json.dumps(report, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
