#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

GENERATOR="scripts/architect/impact-graph.py"
SCHEMA="docs/governance/architectgpt/impact-graph.schema.json"

python3 -m py_compile "$GENERATOR"
jq empty "$SCHEMA"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

BASE="$(git rev-parse HEAD^)"
HEAD="$(git rev-parse HEAD)"
OUT_A="$TMP/impact-a.json"
OUT_B="$TMP/impact-b.json"

python3 "$GENERATOR" \
  --base "$BASE" \
  --head "$HEAD" \
  --output "$OUT_A" \
  >/dev/null

python3 "$GENERATOR" \
  --base "$BASE" \
  --head "$HEAD" \
  --output "$OUT_B" \
  >/dev/null

cmp "$OUT_A" "$OUT_B"

jq -e --arg base "$BASE" --arg head "$HEAD" '
  .schema_version == "1.0"
  and .record_type == "change_impact_graph"
  and .base_commit == $base
  and .head_commit == $head
  and .authority == "evidentiary_only"
  and (.changed_files | length) >= 1
  and .summary.changed_files == (.changed_files | length)
  and .summary.direct_dependents == (.direct_dependents | length)
  and .summary.transitive_dependents == (.transitive_dependents | length)
  and .summary.affected_routes == (.affected_routes | length)
  and .summary.affected_packages == (.affected_packages | length)
  and .summary.affected_tests == (.affected_tests | length)
  and .summary.runtime_surfaces == (.affected_runtime_surfaces | length)
  and .summary.canonical_documents == (.affected_canonical_documents | length)
  and (.risk.score >= 0 and .risk.score <= 100)
  and (.required_verification | index("repository_integrity") != null)
  and (.report_sha256 | test("^[0-9a-f]{64}$"))
' "$OUT_A" >/dev/null

python3 - "$OUT_A" <<'PY'
import hashlib
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
report = json.loads(path.read_text(encoding="utf-8"))
expected = report.pop("report_sha256")
payload = json.dumps(report, sort_keys=True, separators=(",", ":")).encode()
actual = hashlib.sha256(payload).hexdigest()
if actual != expected:
    raise SystemExit(f"report digest mismatch: {actual} != {expected}")
PY

if python3 "$GENERATOR" --base HEAD --head HEAD >/dev/null 2>&1; then
  echo "equal base/head unexpectedly accepted" >&2
  exit 1
fi

if python3 "$GENERATOR" \
  --base "$HEAD" \
  --head "$BASE" \
  >/dev/null 2>&1; then
  echo "non-ancestor base unexpectedly accepted" >&2
  exit 1
fi

if python3 "$GENERATOR" \
  --base "$BASE" \
  --head "$HEAD" \
  --project ../outside/tsconfig.json \
  >/dev/null 2>&1; then
  echo "escaping project path unexpectedly accepted" >&2
  exit 1
fi

echo "Change impact graph fixtures passed"
