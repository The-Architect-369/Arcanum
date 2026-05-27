#!/usr/bin/env bash
# repo-index.sh — deterministic repository structure snapshot
# Output: docs/repo/repo-index.json

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

OUT="docs/repo/repo-index.json"
TMP="${OUT}.tmp"

mkdir -p "$(dirname "$OUT")"

python3 - "$OUT" <<'PY'
import json
import os
import subprocess
import sys
from pathlib import Path

out = Path(sys.argv[1])
root = Path.cwd()

def run(args):
    return subprocess.check_output(args, cwd=root, text=True).strip()

def safe_run(args, default="unknown"):
    try:
        value = run(args)
        return value if value else default
    except Exception:
        return default

generated_at = safe_run(["date", "-u", "+%Y-%m-%dT%H:%M:%SZ"])
repo = safe_run(["git", "config", "--get", "remote.origin.url"], "unknown")
commit = safe_run(["git", "rev-parse", "--short=9", "HEAD"], "unknown")

# Normalize common GitHub URLs to owner/repo when possible.
repo_name = repo
if repo.endswith(".git"):
    repo_name = repo[:-4]
if "github.com" in repo_name:
    repo_name = repo_name.rstrip("/").split("github.com")[-1].strip(":/")
elif repo_name == "unknown":
    repo_name = "unknown"

tracked = subprocess.check_output(
    ["git", "ls-files"],
    cwd=root,
    text=True,
).splitlines()

entries = []

for rel in sorted(tracked):
    path = root / rel

    # Skip vanished files in odd index states.
    if not path.exists():
        continue

    try:
        st = path.stat()
    except OSError:
        continue

    ext = path.suffix
    size = st.st_size
    is_empty = size == 0

    lines = 0
    if path.is_file():
        try:
            with path.open("rb") as f:
                # Count lines only for reasonably text-like files.
                sample = f.read(4096)
                if b"\0" not in sample:
                    f.seek(0)
                    lines = sum(1 for _ in f)
        except Exception:
            lines = 0

    last_modified_commit = safe_run(
        ["git", "log", "-1", "--format=%h", "--", rel],
        "unknown",
    )

    entries.append({
        "path": rel,
        "type": "file",
        "size_bytes": size,
        "last_modified_commit": last_modified_commit,
        "is_empty": is_empty,
        "extension": ext,
        "lines": lines,
    })

data = {
    "generated_at": generated_at,
    "repo": repo_name,
    "commit": commit,
    "generator_version": "1.1",
    "files": entries,
}

tmp = out.with_suffix(out.suffix + ".tmp")
tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
tmp.replace(out)
print(f"✅ repo index generated: {out}")
PY
