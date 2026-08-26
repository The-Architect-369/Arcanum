#!/usr/bin/env python3
"""Exact determinism and freshness check for docs/repo/repo-index.json."""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(
    subprocess.check_output(
        ["git", "rev-parse", "--show-toplevel"],
        text=True,
    ).strip()
)
INDEX = ROOT / "docs/repo/repo-index.json"
GENERATOR = ROOT / "scripts/repo-index.sh"


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


if not INDEX.exists():
    print(f"FAIL repo-index: missing {INDEX.relative_to(ROOT)}")
    raise SystemExit(1)

if not GENERATOR.exists():
    print(f"FAIL repo-index: missing {GENERATOR.relative_to(ROOT)}")
    raise SystemExit(1)

original = INDEX.read_bytes()

try:
    first_run = subprocess.run(
        ["bash", str(GENERATOR)],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    if first_run.returncode != 0:
        sys.stdout.write(first_run.stdout)
        sys.stderr.write(first_run.stderr)
        print("FAIL repo-index: generator failed on first pass")
        raise SystemExit(1)

    first = INDEX.read_bytes()

    second_run = subprocess.run(
        ["bash", str(GENERATOR)],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    if second_run.returncode != 0:
        sys.stdout.write(second_run.stdout)
        sys.stderr.write(second_run.stderr)
        print("FAIL repo-index: generator failed on second pass")
        raise SystemExit(1)

    second = INDEX.read_bytes()
finally:
    INDEX.write_bytes(original)

if first != second:
    print("FAIL repo-index: generator is not byte-deterministic")
    print(f"first sha256:  {digest(first)}")
    print(f"second sha256: {digest(second)}")
    raise SystemExit(1)

if original != first:
    print("FAIL repo-index: canonical index is stale")
    print(f"stored sha256:    {digest(original)}")
    print(f"generated sha256: {digest(first)}")
    print("Repair with:")
    print("  bash scripts/repo-index.sh")
    print("  python3 scripts/verify-repo-index.py")
    raise SystemExit(1)

parsed = json.loads(first.decode("utf-8"))
print(
    "PASS repo-index: exact deterministic snapshot "
    f"(source {parsed.get('commit', 'unknown')}, "
    f"generator {parsed.get('generator_version', 'unknown')}, "
    f"{len(parsed.get('files', []))} entries)"
)
