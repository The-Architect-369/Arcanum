#!/usr/bin/env python3
"""Execute deterministic read-only agent tools from a valid invocation attestation."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

REPOSITORY = "https://github.com/The-Architect-369/Arcanum.git"
SHA40 = re.compile(r"^[0-9a-f]{40}$")
SHA64 = re.compile(r"^[0-9a-f]{64}$")
PERMISSION_ORDER = ["R0", "R1", "W1", "W2", "W3", "C1"]
IMPLEMENTED_TOOLS = {"repository.read", "repository.search"}


def fail(message: str) -> None:
    print(f"FAIL {message}", file=sys.stderr)
    raise SystemExit(1)


def canonical(value: dict[str, Any]) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode()


def digest(value: dict[str, Any]) -> str:
    return hashlib.sha256(canonical(value)).hexdigest()


def load(path: Path, label: str) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"unable to read {label} {path}: {exc}")
    if not isinstance(value, dict):
        fail(f"{label} must contain a JSON object")
    return value


def require_digest(record: dict[str, Any], field: str) -> str:
    claimed = record.get(field)
    if not isinstance(claimed, str) or SHA64.fullmatch(claimed) is None:
        fail(f"invalid {field}")
    unsigned = dict(record)
    unsigned.pop(field, None)
    if digest(unsigned) != claimed:
        fail(f"{field} mismatch")
    return claimed


def run(root: Path, *command: str) -> str:
    result = subprocess.run(command, cwd=root, text=True, capture_output=True)
    if result.returncode != 0:
        fail(result.stderr.strip() or result.stdout.strip() or "command failed")
    return result.stdout.strip()


def git(root: Path, *args: str) -> str:
    return run(root, "git", *args)


def snapshot(root: Path) -> dict[str, str]:
    return {
        "head": git(root, "rev-parse", "HEAD"),
        "origin_mobile": git(root, "rev-parse", "refs/remotes/origin/mobile"),
        "refs_sha256": hashlib.sha256(
            git(root, "for-each-ref", "--format=%(refname) %(objectname)").encode()
        ).hexdigest(),
        "status": git(root, "status", "--porcelain"),
    }


def resolve_regular_file(root: Path, raw: str) -> tuple[Path, str]:
    candidate = Path(raw)
    if candidate.is_absolute() or ".." in candidate.parts or not candidate.parts:
        fail(f"unsafe path: {raw}")
    joined = root / candidate
    if joined.is_symlink():
        fail(f"symlink path forbidden: {raw}")
    resolved = joined.resolve()
    try:
        relative = resolved.relative_to(root.resolve()).as_posix()
    except ValueError:
        fail(f"path escapes repository: {raw}")
    if not resolved.exists() or not resolved.is_file():
        fail(f"path is not a regular file: {raw}")
    return resolved, relative


def validate_registry(registry: dict[str, Any], agent_id: str) -> dict[str, Any]:
    if registry.get("schema_version") != "1.0" or registry.get("registry_type") != "architect_agent_registry":
        fail("invalid agent registry")
    if registry.get("default_policy") != "deny":
        fail("registry must deny by default")
    agents = registry.get("agents")
    if not isinstance(agents, dict) or agent_id not in agents:
        fail("agent_id is not registered")
    agent = agents[agent_id]
    if not isinstance(agent, dict):
        fail("invalid agent registry entry")
    return agent


def validate_identity(invocation: dict[str, Any], request: dict[str, Any], agent: dict[str, Any]) -> tuple[str, list[str]]:
    invocation_sha = require_digest(invocation, "attestation_sha256")
    request_sha = require_digest(request, "request_sha256")

    expected_request = {
        "schema_version": "1.0",
        "record_type": "agent_execution_request",
        "repository": REPOSITORY,
        "branch": "mobile",
        "authorization": "explicit_human_request",
    }
    for field, value in expected_request.items():
        if request.get(field) != value:
            fail(f"invalid execution request field: {field}")

    expected_invocation = {
        "schema_version": "1.0",
        "record_type": "agent_invocation_attestation",
        "repository": REPOSITORY,
        "branch": "mobile",
        "mode": "plan_only",
        "status": "ready",
        "tools_executed": False,
        "external_writes_performed": False,
        "authority": "evidentiary_only",
    }
    for field, value in expected_invocation.items():
        if invocation.get(field) != value:
            fail(f"invalid invocation field: {field}")

    if request.get("invocation_attestation_sha256") != invocation_sha:
        fail("invocation attestation digest mismatch")

    for field in ("commit", "agent_id", "requested_permission_class"):
        if request.get(field) != invocation.get(field):
            fail(f"request and invocation mismatch: {field}")

    commit = request.get("commit")
    if not isinstance(commit, str) or SHA40.fullmatch(commit) is None:
        fail("invalid commit")

    permission = request.get("requested_permission_class")
    ceiling = agent.get("permission_ceiling")
    if permission not in ("R0", "R1"):
        fail("Wave XIX permits only R0 or R1")
    if ceiling not in PERMISSION_ORDER or PERMISSION_ORDER.index(permission) > PERMISSION_ORDER.index(ceiling):
        fail("requested permission exceeds agent ceiling")

    requested_tools = request.get("requested_tools")
    invocation_tools = invocation.get("requested_tools")
    if not isinstance(requested_tools, list) or not requested_tools or len(requested_tools) != len(set(requested_tools)):
        fail("invalid requested_tools")
    if sorted(requested_tools) != sorted(invocation_tools or []):
        fail("request tools do not match invocation")
    if any(tool not in IMPLEMENTED_TOOLS for tool in requested_tools):
        fail("requested tool is not implemented")
    allowed = set(agent.get("allowed_tools") or [])
    if any(tool not in allowed for tool in requested_tools):
        fail("requested tool is not allowlisted")

    operations = request.get("operations")
    if not isinstance(operations, list) or not operations:
        fail("operations must be a non-empty array")
    op_tools = [op.get("tool") for op in operations if isinstance(op, dict)]
    if len(op_tools) != len(operations) or sorted(set(op_tools)) != sorted(requested_tools):
        fail("operations must cover exactly the requested tools")

    return request_sha, sorted(requested_tools)


def execute_operation(root: Path, operation: dict[str, Any]) -> dict[str, Any]:
    tool = operation.get("tool")
    raw_paths = operation.get("paths")
    if not isinstance(raw_paths, list) or not raw_paths or len(raw_paths) != len(set(raw_paths)):
        fail("invalid operation paths")

    files = [resolve_regular_file(root, raw) for raw in sorted(raw_paths)]

    if tool == "repository.read":
        if "query" in operation:
            fail("repository.read does not accept query")
        outputs = []
        for path, relative in files:
            try:
                content = path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                fail(f"file is not UTF-8: {relative}")
            outputs.append({
                "path": relative,
                "content_sha256": hashlib.sha256(content.encode()).hexdigest(),
                "line_count": len(content.splitlines()),
                "byte_count": len(content.encode()),
            })
        result = {"tool": tool, "files": outputs}

    elif tool == "repository.search":
        query = operation.get("query")
        if not isinstance(query, str) or not query:
            fail("repository.search requires a non-empty query")
        matches = []
        for path, relative in files:
            try:
                lines = path.read_text(encoding="utf-8").splitlines()
            except UnicodeDecodeError:
                fail(f"file is not UTF-8: {relative}")
            for line_number, line in enumerate(lines, 1):
                if query in line:
                    matches.append({
                        "path": relative,
                        "line": line_number,
                        "line_sha256": hashlib.sha256(line.encode()).hexdigest(),
                    })
        result = {"tool": tool, "query_sha256": hashlib.sha256(query.encode()).hexdigest(), "matches": matches}
    else:
        fail("unsupported operation tool")

    result["result_sha256"] = digest(result)
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("invocation_attestation", type=Path)
    parser.add_argument("execution_request", type=Path)
    parser.add_argument("--registry", type=Path, default=Path("docs/governance/architectgpt/agent-registry.yaml"))
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    root = Path(git(Path.cwd(), "rev-parse", "--show-toplevel"))
    invocation = load(args.invocation_attestation.resolve(), "invocation attestation")
    request = load(args.execution_request.resolve(), "execution request")
    registry = load((root / args.registry).resolve(), "agent registry")

    agent_id = request.get("agent_id")
    if not isinstance(agent_id, str):
        fail("invalid agent_id")
    agent = validate_registry(registry, agent_id)
    request_sha, requested_tools = validate_identity(invocation, request, agent)

    before = snapshot(root)
    commit = request["commit"]
    if git(root, "branch", "--show-current") != "mobile":
        fail("execution must run from mobile")
    if before["status"]:
        fail("working tree must be clean")
    if before["head"] != commit or before["origin_mobile"] != commit:
        fail("HEAD and origin/mobile must equal request commit")

    operations = [execute_operation(root, operation) for operation in request["operations"]]

    after = snapshot(root)
    if before != after:
        fail("repository state changed during execution")

    attestation: dict[str, Any] = {
        "schema_version": "1.0",
        "record_type": "agent_execution_attestation",
        "repository": REPOSITORY,
        "branch": "mobile",
        "commit": commit,
        "agent_id": agent_id,
        "requested_permission_class": request["requested_permission_class"],
        "requested_tools": requested_tools,
        "invocation_attestation_sha256": invocation["attestation_sha256"],
        "execution_request_sha256": request_sha,
        "status": "completed",
        "mode": "read_only",
        "tools_executed": True,
        "external_writes_performed": False,
        "repository_mutation_performed": False,
        "merge_performed": False,
        "deploy_performed": False,
        "operations": operations,
        "preservation": {
            "head_unchanged": True,
            "origin_mobile_unchanged": True,
            "refs_unchanged": True,
            "working_tree_clean": True,
        },
        "authority": "read_only_agent_execution",
    }
    attestation["attestation_sha256"] = digest(attestation)
    rendered = json.dumps(attestation, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
