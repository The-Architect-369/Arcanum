#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

GENERATOR="$ROOT/scripts/architect/impact-graph.py"
SCHEMA="$ROOT/docs/governance/architectgpt/impact-graph.schema.json"

python3 -m py_compile "$GENERATOR"
jq empty "$SCHEMA"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
FIXTURE="$TMP/repo"
mkdir -p "$FIXTURE"
cd "$FIXTURE"

git init -q
git config user.name "Architect Fixture"
git config user.email "architect-fixture@example.invalid"
mkdir -p \
  apps/web/src/lib \
  apps/web/src/components \
  apps/web/src/app/account \
  apps/web/src/__tests__ \
  docs/doctrine \
  .github/workflows

cat > apps/web/tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {"@/*": ["src/*"]}
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
JSON

cat > apps/web/package.json <<'JSON'
{"name":"@arcanum/impact-fixture","private":true}
JSON

cat > apps/web/src/lib/value.ts <<'TS'
export const value = 1
TS

cat > apps/web/src/components/card.tsx <<'TS'
import { value } from "@/lib/value"
export function Card() { return <div>{value}</div> }
TS

cat > apps/web/src/app/account/page.tsx <<'TS'
import { Card } from "@/components/card"
export default function AccountPage() { return <Card /> }
TS

cat > apps/web/src/__tests__/card.test.tsx <<'TS'
import { Card } from "@/components/card"
export const subject = Card
TS

git add .
git commit -qm "fixture: establish impact graph base"
BASE="$(git rev-parse HEAD)"

cat > apps/web/src/lib/value.ts <<'TS'
export const value = 2
TS

cat > docs/doctrine/fixture-boundary.md <<'MD'
# Fixture Boundary

Synthetic doctrine surface used by the Wave XI fixture.
MD

cat > .github/workflows/fixture.yml <<'YAML'
name: fixture
on: [push]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - run: echo fixture
YAML

git add .
git commit -qm "fixture: change shared source and protected surfaces"
HEAD_SHA="$(git rev-parse HEAD)"
OUT_A="$TMP/impact-a.json"
OUT_B="$TMP/impact-b.json"

python3 "$GENERATOR" \
  --base "$BASE" \
  --head "$HEAD_SHA" \
  --output "$OUT_A" \
  >/dev/null

python3 "$GENERATOR" \
  --base "$BASE" \
  --head "$HEAD_SHA" \
  --output "$OUT_B" \
  >/dev/null

cmp "$OUT_A" "$OUT_B"

jq -e --arg base "$BASE" --arg head "$HEAD_SHA" '
  .schema_version == "1.0"
  and .record_type == "change_impact_graph"
  and .base_commit == $base
  and .head_commit == $head
  and .authority == "evidentiary_only"
  and .changed_files == [
    {"status":"create","path":".github/workflows/fixture.yml"},
    {"status":"update","path":"apps/web/src/lib/value.ts"},
    {"status":"create","path":"docs/doctrine/fixture-boundary.md"}
  ]
  and .direct_dependents == ["apps/web/src/components/card.tsx"]
  and .transitive_dependents == [
    "apps/web/src/__tests__/card.test.tsx",
    "apps/web/src/app/account/page.tsx"
  ]
  and .affected_routes == ["/account"]
  and .affected_packages == ["apps/web"]
  and .affected_tests == ["apps/web/src/__tests__/card.test.tsx"]
  and (.affected_runtime_surfaces | index({"kind":"app_route","path":"apps/web/src/app/account/page.tsx"}) != null)
  and (.affected_runtime_surfaces | index({"kind":"ci_workflow","path":".github/workflows/fixture.yml"}) != null)
  and .affected_canonical_documents == ["docs/doctrine/fixture-boundary.md"]
  and (.risk.factors | index("transitive_code_impact") != null)
  and (.risk.factors | index("user_route_impact") != null)
  and (.risk.factors | index("runtime_surface_impact") != null)
  and (.risk.factors | index("canonical_document_impact") != null)
  and (.required_verification | index("repository_integrity") != null)
  and (.required_verification | index("web_typecheck") != null)
  and (.required_verification | index("web_production_build") != null)
  and (.required_verification | index("targeted_tests") != null)
  and (.required_verification | index("browser_route_smoke") != null)
  and (.required_verification | index("deployment_preview") != null)
  and (.required_verification | index("doctrine_guard") != null)
  and .summary.changed_files == (.changed_files | length)
  and .summary.direct_dependents == (.direct_dependents | length)
  and .summary.transitive_dependents == (.transitive_dependents | length)
  and .summary.affected_routes == (.affected_routes | length)
  and .summary.affected_packages == (.affected_packages | length)
  and .summary.affected_tests == (.affected_tests | length)
  and .summary.runtime_surfaces == (.affected_runtime_surfaces | length)
  and .summary.canonical_documents == (.affected_canonical_documents | length)
  and (.risk.score >= 0 and .risk.score <= 100)
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
  --base "$HEAD_SHA" \
  --head "$BASE" \
  >/dev/null 2>&1; then
  echo "non-ancestor base unexpectedly accepted" >&2
  exit 1
fi

if python3 "$GENERATOR" \
  --base "$BASE" \
  --head "$HEAD_SHA" \
  --project ../outside/tsconfig.json \
  >/dev/null 2>&1; then
  echo "escaping project path unexpectedly accepted" >&2
  exit 1
fi

echo "Change impact graph fixtures passed"
