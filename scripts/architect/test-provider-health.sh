#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

MONITOR="scripts/architect/provider-health.py"
MANIFEST="docs/governance/architectgpt/architect-gpt-manifest.yaml"
TMPDIR_ROOT="$(mktemp -d)"
trap 'rm -rf "$TMPDIR_ROOT"' EXIT

head_sha="$(git rev-parse HEAD)"
now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
stale="2000-01-01T00:00:00Z"

python3 - "$MANIFEST" "$TMPDIR_ROOT" "$head_sha" "$now" "$stale" <<'PY'
import json
import re
import sys
from pathlib import Path

manifest_path = Path(sys.argv[1])
out = Path(sys.argv[2])
head = sys.argv[3]
now = sys.argv[4]
stale = sys.argv[5]

providers = {}
current = None
inside = False
for raw in manifest_path.read_text(encoding="utf-8").splitlines():
    if raw == "providers:":
        inside = True
        continue
    if inside and raw and not raw.startswith(" "):
        break
    match = re.match(r"^  ([a-z0-9_]+):$", raw)
    if inside and match:
        current = match.group(1)
        continue
    status = re.match(r"^    status:\s*(\S+)\s*$", raw)
    if inside and current and status:
        providers[current] = status.group(1)

if not providers:
    raise SystemExit("provider fixture setup could not parse manifest")

def snapshot(observed_at):
    return {
        "schema_version": "2.0",
        "record_type": "provider_health_snapshot",
        "observed_at": observed_at,
        "repository": "The-Architect-369/Arcanum",
        "commit": head,
        "providers": {
            name: {
                "status": "unverified" if status == "unverified" else "healthy",
                "manifest_status": status,
                "reference": f"fixture:{name}",
            }
            for name, status in providers.items()
        },
    }

healthy = snapshot(now)
drift = snapshot(now)
first = next(iter(drift["providers"]))
drift["providers"][first]["manifest_status"] = "drifted_fixture"
stale_snapshot = snapshot(stale)
malformed = {
    "schema_version": "2.0",
    "record_type": "provider_health_snapshot",
    "observed_at": now,
    "repository": "The-Architect-369/Arcanum",
    "commit": head,
}

for name, value in {
    "healthy.json": healthy,
    "drift.json": drift,
    "stale.json": stale_snapshot,
    "malformed.json": malformed,
}.items():
    (out / name).write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")
PY

python3 -m py_compile "$MONITOR"
python3 "$MONITOR" "$TMPDIR_ROOT/healthy.json" --manifest "$MANIFEST" >/dev/null

if python3 "$MONITOR" "$TMPDIR_ROOT/drift.json" --manifest "$MANIFEST" >/dev/null 2>&1; then
  echo "FAIL provider monitor accepted manifest drift" >&2
  exit 1
fi

if python3 "$MONITOR" "$TMPDIR_ROOT/stale.json" --manifest "$MANIFEST" >/dev/null 2>&1; then
  echo "FAIL provider monitor accepted stale evidence" >&2
  exit 1
fi

if python3 "$MONITOR" "$TMPDIR_ROOT/malformed.json" --manifest "$MANIFEST" >/dev/null 2>&1; then
  echo "FAIL provider monitor accepted malformed evidence" >&2
  exit 1
fi

echo "provider health fixtures passed"
