#!/usr/bin/env python3
"""Validate a bounded Architect agent request and emit a non-executing attestation."""
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
REGISTRY_TYPE = "architect_agent_registry"
SHA40 = re.compile(r"^[0-9a-f]{40}$")
SHA64 = re.compile(r"^[0-9a-f]{64}$")
AGENT_ID = re.compile(r"^[a-z][a-z0-9_]*$")


def fail(message: str) -> None:
    print(f"FAIL {message}", file=sys.stderr)
    raise SystemExit(1)


def canonical(value: dict[str, Any]) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode()


def digest(value: dict[str, Any]) -> str:
    return hashlib.sha256(canonical(value)).hexdigest()


def load_object(path: Path, label: str) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"unable to read {label} {path}: {exc}")
    if not isinstance(value, dict):
        fail(f"{label} must contain a JSON object")
    return value


def run(command: list[str], cwd: Path) -> str:
    result = subprocess.run(command, cwd=cwd, text=True, capture_output=True)
    if result.returncode != 0:
        fail(result.stderr.strip() or result.stdout.strip() or f"command failed: {' '.join(command)}")
    return result.stdout.strip()


def git(root: Path, *args: str) -> str:
    return run(["git", *args], root)


def verify_request_digest(request: dict[str, Any]) -> str:
    claimed = request.get("request_sha256")
    if not isinstance(claimed, str) or SHA64.fullmatch(claimed) is None:
        fail("invalid request_sha256")
    unsigned = dict(request)
    unsigned.pop("request_sha256", None)
    if digest(unsigned) != claimed:
        fail("request_sha256 mismatch")
    return claimed


def require_string_list(value: Any, field: str, *, nonempty: bool = False) -> list[str]:
    if not isinstance(value, list) or any(not isinstance(item, str) or not item for item in value):
        fail(f"invalid {field}")
    if nonempty and not value:
        fail(f"{field} must not be empty")
    if len(value) != len(set(value)):
        fail(f"{field} must not contain duplicates")
    return value


def validate_registry(registry: dict[str, Any]) -> tuple[list[str], dict[str, Any]]:
    if registry.get("schema_version") != "1.0":
        fail("unsupported registry schema_version")
    if registry.get("registry_type") != REGISTRY_TYPE:
        fail("invalid registry_type")
    if registry.get("default_policy") != "deny":
        fail("registry must deny by default")
    if registry.get("invocation_authority") != "evidentiary_only":
        fail("registry invocation authority mismatch")

    permission_order = require_string_list(registry.get("permission_order"), "permission_order", nonempty=True)
    if permission_order != ["R0", "R1", "W1", "W2", "W3", "C1"]:
        fail("registry permission_order mismatch")

    agents = registry.get("agents")
    if not isinstance(agents, dict) or not agents:
        fail("registry agents must be a non-empty object")
    for agent_id, agent in agents.items():
        if not isinstance(agent_id, str) or AGENT_ID.fullmatch(agent_id) is None:
            fail(f"invalid agent id: {agent_id}")
        if not isinstance(agent, dict):
            fail(f"invalid registry entry for {agent_id}")
        for field in ("display_name", "purpose", "permission_ceiling"):
            if not isinstance(agent.get(field), str) or not agent[field]:
                fail(f"agent {agent_id} has invalid {field}")
        if agent["permission_ceiling"] not in permission_order:
            fail(f"agent {agent_id} has unknown permission ceiling")
        require_string_list(agent.get("allowed_tools"), f"{agent_id}.allowed_tools", nonempty=True)
        require_string_list(agent.get("required_outputs"), f"{agent_id}.required_outputs", nonempty=True)
        require_string_list(agent.get("forbidden_actions"), f"{agent_id}.forbidden_actions", nonempty=True)
    return permission_order, agents


def validate_checkout(root: Path, commit: str) -> None:
    if git(root, "branch", "--show-current") != "mobile":
        fail("agent invocation must run from mobile")
    if git(root, "status", "--porcelain"):
        fail("working tree must be clean")
    if git(root, "rev-parse", "HEAD") != commit:
        fail("HEAD does not match request commit")
    if git(root, "rev-parse", "refs/remotes/origin/mobile") != commit:
        fail("origin/mobile does not match request commit")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("request", type=Path)
    parser.add_argument(
        "--registry",
        type=Path,
        default=Path("docs/governance/architectgpt/agent-registry.yaml"),
    )
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    root = Path(git(Path.cwd(), "rev-parse", "--show-toplevel"))
    registry = load_object((root / args.registry).resolve(), "registry")
    request = load_object(args.request.resolve(), "request")
    permission_order, agents = validate_registry(registry)
    request_sha = verify_request_digest(request)

    expected = {
        "schema_version": "1.0",
        "record_type": "agent_invocation_request",
        "repository": REPOSITORY,
        "branch": "mobile",
        "authorization": "explicit_human_request",
    }
    for field, value in expected.items():
        if request.get(field) != value:
            fail(f"invalid request field: {field}")

    commit = request.get("commit")
    if not isinstance(commit, str) or SHA40.fullmatch(commit) is None:
        fail("invalid request commit")
    agent_id = request.get("agent_id")
    if not isinstance(agent_id, str) or AGENT_ID.fullmatch(agent_id) is None:
        fail("invalid agent_id")
    if agent_id not in agents:
        fail("agent_id is not registered")
    task = request.get("task")
    if not isinstance(task, str) or not task.strip():
        fail("task must not be empty")
    permission = request.get("requested_permission_class")
    if not isinstance(permission, str) or permission not in permission_order:
        fail("invalid requested_permission_class")
    tools = require_string_list(request.get("requested_tools"), "requested_tools", nonempty=True)

    agent = agents[agent_id]
    if permission_order.index(permission) > permission_order.index(agent["permission_ceiling"]):
        fail("requested permission exceeds agent ceiling")
    allowed_tools = set(agent["allowed_tools"])
    denied = sorted(set(tools) - allowed_tools)
    if denied:
        fail(f"requested tools are not allowlisted: {', '.join(denied)}")

    validate_checkout(root, commit)

    attestation: dict[str, Any] = {
        "schema_version": "1.0",
        "record_type": "agent_invocation_attestation",
        "repository": REPOSITORY,
        "branch": "mobile",
        "commit": commit,
        "agent_id": agent_id,
        "agent_display_name": agent["display_name"],
        "purpose": agent["purpose"],
        "requested_permission_class": permission,
        "permission_ceiling": agent["permission_ceiling"],
        "requested_tools": sorted(tools),
        "required_outputs": agent["required_outputs"],
        "task": task.strip(),
        "mode": "plan_only",
        "status": "ready",
        "tools_executed": False,
        "external_writes_performed": False,
        "authority": "evidentiary_only",
        "request_sha256": request_sha,
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
