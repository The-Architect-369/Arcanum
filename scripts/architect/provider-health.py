#!/usr/bin/env python3
"""Validate provider observations against the canonical capability registry."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ALLOWED_OBSERVATIONS = {"healthy", "degraded", "unavailable", "unverified"}


def fail(message: str) -> None:
    print(f"FAIL {message}", file=sys.stderr)
    raise SystemExit(1)


def parse_time(value: str) -> datetime:
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        fail(f"invalid observed_at timestamp: {value}: {exc}")
    if parsed.tzinfo is None:
        fail("observed_at must include a timezone")
    return parsed.astimezone(timezone.utc)


def registry_providers(path: Path) -> dict[str, str]:
    providers: dict[str, str] = {}
    current: str | None = None
    in_providers = False
    for raw in path.read_text(encoding="utf-8").splitlines():
        if raw == "providers:":
            in_providers = True
            continue
        if in_providers and raw and not raw.startswith(" "):
            break
        match = re.match(r"^  ([a-z0-9_]+):$", raw)
        if in_providers and match:
            current = match.group(1)
            continue
        status = re.match(r"^    status:\s*(\S+)\s*$", raw)
        if in_providers and current and status:
            providers[current] = status.group(1)
    if not providers:
        fail(f"no providers parsed from {path}")
    return providers


def git_head() -> str:
    return subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("snapshot", type=Path)
    parser.add_argument("--registry", type=Path, default=Path("docs/governance/architectgpt/capability-registry.yaml"))
    parser.add_argument("--max-age-hours", type=int, default=24)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    registry = registry_providers(args.registry)
    try:
        snapshot: dict[str, Any] = json.loads(args.snapshot.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"unable to read snapshot: {exc}")

    required = {"schema_version", "record_type", "observed_at", "repository", "commit", "providers"}
    missing = sorted(required - snapshot.keys())
    if missing:
        fail(f"snapshot missing fields: {', '.join(missing)}")
    if snapshot["schema_version"] != "1.0" or snapshot["record_type"] != "provider_health_snapshot":
        fail("unsupported snapshot schema or record type")
    if snapshot["commit"] != git_head():
        fail("snapshot commit does not match exact HEAD")

    observed_at = parse_time(str(snapshot["observed_at"]))
    age_hours = (datetime.now(timezone.utc) - observed_at).total_seconds() / 3600
    if age_hours < -0.25:
        fail("snapshot timestamp is in the future")

    observations = snapshot["providers"]
    if not isinstance(observations, dict):
        fail("providers must be an object")

    results: dict[str, Any] = {}
    drift = 0
    failures = 0
    for provider, expected_status in registry.items():
        item = observations.get(provider)
        if not isinstance(item, dict):
            results[provider] = {"status": "missing", "registry_status": expected_status}
            failures += 1
            continue
        observed_status = item.get("status")
        if observed_status not in ALLOWED_OBSERVATIONS:
            results[provider] = {"status": "invalid", "registry_status": expected_status}
            failures += 1
            continue
        declared = item.get("registry_status")
        provider_drift = declared != expected_status
        if provider_drift:
            drift += 1
        results[provider] = {
            "status": observed_status,
            "registry_status": expected_status,
            "declared_registry_status": declared,
            "drift": provider_drift,
            "reference": item.get("reference"),
        }

    stale = age_hours > args.max_age_hours
    report = {
        "schema_version": "1.0",
        "record_type": "provider_health_report",
        "observed_at": snapshot["observed_at"],
        "repository": snapshot["repository"],
        "commit": snapshot["commit"],
        "status": "pass" if failures == 0 and drift == 0 and not stale else "fail",
        "age_hours": round(age_hours, 3),
        "max_age_hours": args.max_age_hours,
        "stale": stale,
        "drift_count": drift,
        "failure_count": failures,
        "providers": results,
    }

    rendered = json.dumps(report, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
