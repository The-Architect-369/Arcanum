#!/usr/bin/env python3
"""Verify TypeScript parsing, import resolution, dependency declarations, and cycles."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

IMPORT_RE = re.compile(
    r"(?:import|export)\s+(?:[^;]*?\s+from\s+)?[\"']([^\"']+)[\"']|"
    r"import\(\s*[\"']([^\"']+)[\"']\s*\)"
)
SOURCE_SUFFIXES = (".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs")


def fail(message: str) -> None:
    print(f"FAIL {message}", file=sys.stderr)
    raise SystemExit(1)


def read_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"unable to read {path}: {exc}")
    if not isinstance(value, dict):
        fail(f"expected JSON object: {path}")
    return value


def package_name(specifier: str) -> str:
    parts = specifier.split("/")
    return "/".join(parts[:2]) if specifier.startswith("@") else parts[0]


def resolve_local(source: Path, specifier: str, source_root: Path) -> Path | None:
    if specifier.startswith("@/"):
        candidate = source_root / specifier[2:]
    elif specifier.startswith("."):
        candidate = source.parent / specifier
    else:
        return None
    options = [candidate]
    options.extend(candidate.with_suffix(suffix) for suffix in SOURCE_SUFFIXES)
    options.extend(candidate / f"index{suffix}" for suffix in SOURCE_SUFFIXES)
    return next((item.resolve() for item in options if item.is_file()), None)


def find_cycle(graph: dict[Path, set[Path]]) -> list[str] | None:
    visited: set[Path] = set()
    active: set[Path] = set()
    stack: list[Path] = []

    def walk(node: Path) -> list[str] | None:
        if node in active:
            start = stack.index(node)
            return [str(item) for item in stack[start:] + [node]]
        if node in visited:
            return None
        visited.add(node)
        active.add(node)
        stack.append(node)
        for target in sorted(graph.get(node, set())):
            found = walk(target)
            if found:
                return found
        stack.pop()
        active.remove(node)
        return None

    for node in sorted(graph):
        found = walk(node)
        if found:
            return found
    return None


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", type=Path, default=Path("apps/web/tsconfig.json"))
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    root = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())
    head = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()
    project = (root / args.project).resolve()
    package_path = project.parent / "package.json"
    package = read_json(package_path)
    source_root = project.parent / "src"
    files = sorted(path.resolve() for suffix in ("*.ts", "*.tsx") for path in source_root.rglob(suffix))

    compiler = subprocess.run(
        ["pnpm", "exec", "tsc", "--project", str(project), "--noEmit", "--pretty", "false"],
        cwd=project.parent,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    compiler_errors = [] if compiler.returncode == 0 else [line for line in compiler.stdout.splitlines() if line.strip()]

    declared = set()
    for field in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies"):
        declared.update((package.get(field) or {}).keys())

    unresolved: list[dict[str, str]] = []
    undeclared: list[dict[str, str]] = []
    graph: dict[Path, set[Path]] = {path: set() for path in files}
    known = set(files)
    for source in files:
        text = source.read_text(encoding="utf-8")
        for match in IMPORT_RE.finditer(text):
            specifier = match.group(1) or match.group(2)
            target = resolve_local(source, specifier, source_root)
            if specifier.startswith((".", "@/")):
                if target is None:
                    unresolved.append({"file": str(source.relative_to(root)), "specifier": specifier})
                elif target in known:
                    graph[source].add(target)
            elif not specifier.startswith("node:"):
                name = package_name(specifier)
                if name not in declared:
                    undeclared.append({"file": str(source.relative_to(root)), "specifier": specifier, "package": name})

    cycle = find_cycle(graph)
    findings = {
        "compiler_errors": compiler_errors,
        "unresolved_local_imports": unresolved,
        "undeclared_dependencies": undeclared,
        "dependency_cycles": [cycle] if cycle else [],
    }
    failures = sum(len(items) for items in findings.values())
    report: dict[str, Any] = {
        "schema_version": "1.0",
        "record_type": "ast_dependency_integrity_report",
        "repository": "https://github.com/The-Architect-369/Arcanum.git",
        "commit": head,
        "project": str(project.relative_to(root)),
        "status": "pass" if failures == 0 else "fail",
        "source_file_count": len(files),
        "failure_count": failures,
        "findings": findings,
    }
    payload = json.dumps(report, sort_keys=True, separators=(",", ":")).encode()
    report["report_sha256"] = hashlib.sha256(payload).hexdigest()
    rendered = json.dumps(report, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
