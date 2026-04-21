#!/usr/bin/env python3
from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
from pathlib import Path
import difflib
import sys

ROOT = Path.cwd()
INDEX = ROOT / "docs/repo/repo-index.json"
GEN = ROOT / "scripts/repo-index.sh"

def normalize(path: Path) -> str:
    data = json.loads(path.read_text(encoding="utf-8"))
    data.pop("generated_at", None)
    data.pop("commit", None)

    files = data.get("files", [])
    files = [f for f in files if f.get("path") != "docs/repo/repo-index.json"]
    for f in files:
        f.pop("last_modified_commit", None)
    files.sort(key=lambda x: x.get("path", ""))
    data["files"] = files
    return json.dumps(data, indent=2, ensure_ascii=False) + "\\n"

def main() -> int:
    if not INDEX.exists():
        print(f"missing: {INDEX}", file=sys.stderr)
        return 1
    if not GEN.exists():
        print(f"missing: {GEN}", file=sys.stderr)
        return 1

    original = INDEX.read_text(encoding="utf-8")
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        orig_path = td / "original.json"
        gen_path = td / "generated.json"
        orig_path.write_text(original, encoding="utf-8")

        try:
            subprocess.run(["bash", str(GEN)], check=True)
            shutil.copy2(INDEX, gen_path)
        finally:
            INDEX.write_text(original, encoding="utf-8")

        a = normalize(orig_path).splitlines(keepends=True)
        b = normalize(gen_path).splitlines(keepends=True)

        diff = list(difflib.unified_diff(a, b, fromfile="current", tofile="generated"))
        if not diff:
            print("No normalized drift detected.")
            return 0

        print("Normalized drift detected:\\n")
        sys.stdout.writelines(diff)
        return 2

if __name__ == "__main__":
    raise SystemExit(main())
