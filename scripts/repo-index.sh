#!/usr/bin/env bash
# repo-index.sh — deterministic repository structure snapshot
# Output: docs/repo/repo-index.json

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

OUT="docs/repo/repo-index.json"
mkdir -p "$(dirname "$OUT")"

python3 - "$OUT" <<'PY'
from __future__ import annotations

import datetime as dt
import json
import subprocess
import sys
from functools import lru_cache
from pathlib import Path, PurePosixPath

out = Path(sys.argv[1])
root = Path.cwd()
out_rel = out.as_posix()


def run_text(args: list[str]) -> str:
    return subprocess.check_output(args, cwd=root, text=True).strip()


def run_bytes(args: list[str]) -> bytes:
    return subprocess.check_output(args, cwd=root)


def safe_run_text(args: list[str], default: str = "unknown") -> str:
    try:
        value = run_text(args)
        return value if value else default
    except Exception:
        return default


# Canonical generation operates only on committed tracked state. The output
# itself may be dirty because generation necessarily rewrites it.
dirty = subprocess.check_output(
    [
        "git",
        "status",
        "--porcelain=v1",
        "--untracked-files=no",
        "--",
        ".",
        f":(exclude){out_rel}",
    ],
    cwd=root,
    text=True,
)
if dirty.strip():
    print(
        "❌ repo index generation requires a clean tracked tree "
        f"apart from {out_rel}",
        file=sys.stderr,
    )
    print(dirty.rstrip(), file=sys.stderr)
    raise SystemExit(1)


@lru_cache(maxsize=None)
def non_index_tree(commit: str) -> tuple[bytes, ...]:
    """Return the exact tracked tree records excluding the canonical output."""
    raw = run_bytes(
        ["git", "ls-tree", "-r", "-z", "--full-tree", commit]
    )
    records: list[bytes] = []
    for record in raw.split(b"\0"):
        if not record:
            continue
        _, path_bytes = record.split(b"\t", 1)
        rel = path_bytes.decode("utf-8", errors="surrogateescape")
        if rel != out_rel:
            records.append(record)
    return tuple(records)


def parents_of(commit: str) -> list[str]:
    value = run_text(["git", "show", "-s", "--format=%P", commit])
    return value.split() if value else []


def resolve_indexed_source_commit() -> str:
    """Resolve the substantive source while peeling index-only/synthetic promotion commits.

    A commit is transparent to the structural snapshot when its full tracked tree,
    excluding docs/repo/repo-index.json, is byte-identical to one of its parents.
    This intentionally peels both index-only companion commits and normal no-conflict
    merge promotions whose source/index parent already carries the promoted tree.

    A merge commit whose non-index tree matches no parent combines substantive state
    from multiple parents. That state has no single pre-merge source commit, so the
    deterministic companion contract cannot represent it safely and generation fails
    closed instead of silently assigning misleading provenance.
    """
    current = run_text(["git", "rev-parse", "HEAD"])
    seen: set[str] = set()

    while True:
        if current in seen:
            print("❌ repo index source resolution encountered a commit cycle", file=sys.stderr)
            raise SystemExit(1)
        seen.add(current)

        parents = parents_of(current)
        if not parents:
            return current

        current_tree = non_index_tree(current)
        matching_parents = [
            parent for parent in parents if non_index_tree(parent) == current_tree
        ]

        if matching_parents:
            # Parent order is meaningful. Prefer first-parent ancestry when multiple
            # parents are structurally equivalent; otherwise follow the unique parent
            # that already carries the exact non-index tree.
            current = matching_parents[0]
            continue

        if len(parents) > 1:
            print(
                "❌ repo index cannot resolve a single indexed source commit: "
                f"merge {current[:9]} introduces a substantive combined non-index tree",
                file=sys.stderr,
            )
            print(
                "Rebase or refresh the source tranche from latest canonical main, "
                "then regenerate its index companion before normal merge promotion.",
                file=sys.stderr,
            )
            raise SystemExit(1)

        return current


source_commit = resolve_indexed_source_commit()

source_epoch_text = safe_run_text(
    ["git", "show", "-s", "--format=%ct", source_commit]
)
try:
    source_epoch = int(source_epoch_text)
except ValueError:
    print("❌ unable to resolve indexed source commit timestamp", file=sys.stderr)
    raise SystemExit(1)

generated_at = (
    dt.datetime.fromtimestamp(source_epoch, tz=dt.timezone.utc)
    .replace(microsecond=0)
    .isoformat()
    .replace("+00:00", "Z")
)

repo = safe_run_text(
    ["git", "config", "--get", "remote.origin.url"],
    "unknown",
)

# Normalize common GitHub URLs to owner/repo when possible.
repo_name = repo
if repo.endswith(".git"):
    repo_name = repo[:-4]
if "github.com" in repo_name:
    repo_name = repo_name.rstrip("/").split("github.com")[-1].strip(":/")
elif repo_name == "unknown":
    repo_name = "unknown"

tree_raw = run_bytes(
    ["git", "ls-tree", "-r", "-z", "--full-tree", source_commit]
)
entries = []

for record in tree_raw.split(b"\0"):
    if not record:
        continue

    meta, path_bytes = record.split(b"\t", 1)
    mode, object_type, blob_sha = meta.decode("ascii").split()
    rel = path_bytes.decode("utf-8", errors="surrogateescape")

    if rel == out_rel:
        continue

    if object_type != "blob":
        print(
            f"❌ unsupported tracked Git object for repo index: "
            f"{rel} ({object_type}, mode {mode})",
            file=sys.stderr,
        )
        raise SystemExit(1)

    data = run_bytes(["git", "cat-file", "blob", blob_sha])

    if mode == "120000":
        entry_type = "symlink"
        lines = 0
    else:
        entry_type = "file"
        sample = data[:4096]
        lines = 0 if b"\0" in sample else len(data.splitlines())

    last_modified_full = safe_run_text(
        [
            "git",
            "log",
            "-1",
            "--format=%H",
            source_commit,
            "--",
            rel,
        ],
        "unknown",
    )
    last_modified_commit = (
        last_modified_full[:9]
        if last_modified_full != "unknown"
        else "unknown"
    )

    entry = {
        "path": rel,
        "type": entry_type,
        "size_bytes": len(data),
        "last_modified_commit": last_modified_commit,
        "is_empty": len(data) == 0,
        "extension": PurePosixPath(rel).suffix,
        "lines": lines,
    }

    if entry_type == "symlink":
        entry["target"] = data.decode("utf-8", errors="surrogateescape")

    entries.append(entry)

entries.sort(key=lambda item: item["path"])

data = {
    "generated_at": generated_at,
    "repo": repo_name,
    "commit": source_commit[:9],
    "generator_version": "1.5",
    "files": entries,
}

tmp = out.with_suffix(out.suffix + ".tmp")
tmp.write_text(
    json.dumps(data, indent=2, ensure_ascii=False) + "\n",
    encoding="utf-8",
)
tmp.replace(out)

print(
    "✅ repo index generated: "
    f"{out} (source {source_commit[:9]}, {len(entries)} tracked entries)"
)
PY
