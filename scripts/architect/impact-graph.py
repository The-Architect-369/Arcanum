#!/usr/bin/env python3
"""Generate a deterministic change-impact graph for an exact Git base/head pair."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from collections import deque
from pathlib import Path, PurePosixPath
from typing import Any

REPOSITORY = "https://github.com/The-Architect-369/Arcanum.git"
IMPORT_RE = re.compile(
    r"(?:import|export)\s+(?:[^;]*?\s+from\s+)?[\"']([^\"']+)[\"']|"
    r"import\(\s*[\"']([^\"']+)[\"']\s*\)"
)
SOURCE_SUFFIXES = (".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs")
TEST_MARKERS = (".test.", ".spec.", "/__tests__/")
CANONICAL_PREFIXES = (
    "docs/doctrine/",
    "docs/governance/",
    "docs/architecture/",
    "docs/compliance/",
)
RUNTIME_PATTERNS = (
    (re.compile(r"(^|/)app/api/|route\.(?:ts|tsx|js|jsx)$"), "api_route"),
    (re.compile(r"middleware\.(?:ts|js)$"), "middleware"),
    (re.compile(r"(^|/)app/(?:.+/)?page\.(?:ts|tsx|js|jsx)$"), "app_route"),
    (re.compile(r"(^|/)app/(?:.+/)?layout\.(?:ts|tsx|js|jsx)$"), "layout"),
    (re.compile(r"(^|/)server/|(^|/)actions?/"), "server_runtime"),
    (re.compile(r"^\.github/workflows/.*\.ya?ml$"), "ci_workflow"),
    (re.compile(r"vercel\.json$|next\.config\."), "deployment_config"),
)


def fail(message: str) -> None:
    print(f"FAIL {message}", file=sys.stderr)
    raise SystemExit(1)


def git(root: Path, *args: str) -> str:
    try:
        return subprocess.check_output(
            ["git", *args], cwd=root, text=True, stderr=subprocess.PIPE
        ).strip()
    except subprocess.CalledProcessError as exc:
        detail = exc.stderr.strip() or str(exc)
        fail(f"git {' '.join(args)}: {detail}")


def normalize_repo_path(raw: str) -> str:
    value = raw.replace("\\", "/")
    while value.startswith("./"):
        value = value[2:]
    path = PurePosixPath(value)
    if not value or path.is_absolute() or ".." in path.parts:
        fail(f"path escapes repository: {raw}")
    return path.as_posix()


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


def changed_files(root: Path, base: str, head: str) -> list[dict[str, str]]:
    output = git(root, "diff", "--name-status", "--find-renames", base, head)
    changes: list[dict[str, str]] = []
    for line in output.splitlines():
        parts = line.split("\t")
        if not parts:
            continue
        status = parts[0]
        if status.startswith("R") and len(parts) == 3:
            changes.append(
                {
                    "status": "rename",
                    "old_path": normalize_repo_path(parts[1]),
                    "path": normalize_repo_path(parts[2]),
                }
            )
        elif len(parts) == 2:
            kind = {"A": "create", "M": "update", "D": "delete"}.get(status[0], "update")
            changes.append({"status": kind, "path": normalize_repo_path(parts[1])})
    return sorted(changes, key=lambda item: (item["path"], item["status"]))


def source_files(root: Path, source_root: Path) -> list[Path]:
    if not source_root.is_dir():
        return []
    return sorted(
        path.resolve()
        for suffix in ("*.ts", "*.tsx", "*.js", "*.jsx")
        for path in source_root.rglob(suffix)
        if path.is_file()
    )


def build_graph(root: Path, source_root: Path) -> tuple[dict[str, set[str]], dict[str, set[str]]]:
    files = source_files(root, source_root)
    known = set(files)
    forward: dict[str, set[str]] = {}
    reverse: dict[str, set[str]] = {}
    for source in files:
        source_key = source.relative_to(root).as_posix()
        forward.setdefault(source_key, set())
        text = source.read_text(encoding="utf-8")
        for match in IMPORT_RE.finditer(text):
            specifier = match.group(1) or match.group(2)
            target = resolve_local(source, specifier, source_root)
            if target is None or target not in known:
                continue
            target_key = target.relative_to(root).as_posix()
            forward[source_key].add(target_key)
            reverse.setdefault(target_key, set()).add(source_key)
    return forward, reverse


def reverse_closure(seeds: set[str], reverse: dict[str, set[str]]) -> tuple[set[str], set[str]]:
    direct: set[str] = set()
    transitive: set[str] = set()
    queue: deque[str] = deque(sorted(seeds))
    seen = set(seeds)
    while queue:
        node = queue.popleft()
        for dependent in sorted(reverse.get(node, set())):
            if node in seeds:
                direct.add(dependent)
            if dependent in seen:
                continue
            seen.add(dependent)
            transitive.add(dependent)
            queue.append(dependent)
    return direct, transitive - direct


def route_for(path: str) -> str | None:
    marker = "/src/app/"
    if marker not in path or not re.search(r"/(page|route)\.(?:ts|tsx|js|jsx)$", path):
        return None
    relative = path.split(marker, 1)[1].rsplit("/", 1)[0]
    segments = [segment for segment in relative.split("/") if not segment.startswith("(")]
    return "/" + "/".join(segments) if segments else "/"


def package_for(path: str) -> str | None:
    parts = path.split("/")
    if len(parts) >= 2 and parts[0] in {"apps", "packages", "chains"}:
        return "/".join(parts[:2])
    return None


def is_test_path(path: str) -> bool:
    normalized = f"/{path}"
    return any(marker in normalized for marker in TEST_MARKERS)


def runtime_surfaces(paths: set[str]) -> list[dict[str, str]]:
    surfaces: set[tuple[str, str]] = set()
    for path in paths:
        for pattern, kind in RUNTIME_PATTERNS:
            if pattern.search(path):
                surfaces.add((kind, path))
    return [{"kind": kind, "path": path} for kind, path in sorted(surfaces)]


def risk_score(changes: list[dict[str, str]], dependents: set[str], routes: set[str], runtime: list[dict[str, str]], canonical: set[str]) -> dict[str, Any]:
    score = min(
        100,
        len(changes) * 3
        + min(len(dependents) * 2, 30)
        + len(routes) * 5
        + len(runtime) * 7
        + len(canonical) * 10,
    )
    level = "low" if score < 20 else "moderate" if score < 45 else "high" if score < 70 else "critical"
    factors = []
    if dependents:
        factors.append("transitive_code_impact")
    if routes:
        factors.append("user_route_impact")
    if runtime:
        factors.append("runtime_surface_impact")
    if canonical:
        factors.append("canonical_document_impact")
    if any(item["status"] in {"delete", "rename"} for item in changes):
        factors.append("destructive_file_operation")
        score = min(100, score + 10)
        level = "low" if score < 20 else "moderate" if score < 45 else "high" if score < 70 else "critical"
    return {"score": score, "level": level, "factors": sorted(set(factors))}


def verification_matrix(paths: set[str], routes: set[str], runtime: list[dict[str, str]], canonical: set[str]) -> list[str]:
    checks = {"repository_integrity"}
    if any(path.startswith("apps/web/") for path in paths):
        checks.update({"web_typecheck", "web_production_build"})
    if any(is_test_path(path) for path in paths):
        checks.add("targeted_tests")
    if routes:
        checks.add("browser_route_smoke")
    if runtime:
        checks.add("deployment_preview")
    if canonical:
        checks.add("doctrine_guard")
    return sorted(checks)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", required=True)
    parser.add_argument("--head", default="HEAD")
    parser.add_argument("--project", type=Path, default=Path("apps/web/tsconfig.json"))
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    root = Path(git(Path.cwd(), "rev-parse", "--show-toplevel"))
    base = git(root, "rev-parse", args.base)
    head = git(root, "rev-parse", args.head)
    if base == head:
        fail("base and head resolve to the same commit")
    merge_base = git(root, "merge-base", base, head)
    if merge_base != base:
        fail("base must be an ancestor of head")

    project = (root / args.project).resolve()
    try:
        project.relative_to(root)
    except ValueError:
        fail("project path escapes repository")
    source_root = project.parent / "src"
    changes = changed_files(root, base, head)
    changed_paths = {item["path"] for item in changes}
    changed_paths.update(item["old_path"] for item in changes if "old_path" in item)
    forward, reverse = build_graph(root, source_root)
    code_seeds = changed_paths & set(forward)
    direct, transitive = reverse_closure(code_seeds, reverse)
    impacted_paths = changed_paths | direct | transitive
    routes = {route for path in impacted_paths if (route := route_for(path))}
    packages = {package for path in impacted_paths if (package := package_for(path))}
    tests = {path for path in impacted_paths if is_test_path(path)}
    canonical = {path for path in changed_paths if path.startswith(CANONICAL_PREFIXES)}
    runtime = runtime_surfaces(impacted_paths)
    risk = risk_score(changes, direct | transitive, routes, runtime, canonical)

    edges = [
        {"from": source, "to": target, "relation": "imports"}
        for source in sorted(forward)
        for target in sorted(forward[source])
        if source in impacted_paths or target in impacted_paths
    ]
    report: dict[str, Any] = {
        "schema_version": "1.0",
        "record_type": "change_impact_graph",
        "repository": REPOSITORY,
        "base_commit": base,
        "head_commit": head,
        "project": project.relative_to(root).as_posix(),
        "changed_files": changes,
        "direct_dependents": sorted(direct),
        "transitive_dependents": sorted(transitive),
        "affected_routes": sorted(routes),
        "affected_packages": sorted(packages),
        "affected_tests": sorted(tests),
        "affected_runtime_surfaces": runtime,
        "affected_canonical_documents": sorted(canonical),
        "edges": edges,
        "risk": risk,
        "required_verification": verification_matrix(impacted_paths, routes, runtime, canonical),
        "summary": {
            "changed_files": len(changes),
            "direct_dependents": len(direct),
            "transitive_dependents": len(transitive),
            "affected_routes": len(routes),
            "affected_packages": len(packages),
            "affected_tests": len(tests),
            "runtime_surfaces": len(runtime),
            "canonical_documents": len(canonical),
        },
        "authority": "evidentiary_only",
    }
    canonical_payload = json.dumps(report, sort_keys=True, separators=(",", ":")).encode()
    report["report_sha256"] = hashlib.sha256(canonical_payload).hexdigest()
    rendered = json.dumps(report, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
