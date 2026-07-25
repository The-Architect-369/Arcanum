#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

PARSER="scripts/architect/build-diagnostics.py"
TMPDIR="$(mktemp -d)"
cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

python3 -m py_compile "$PARSER"

cat > "$TMPDIR/failure.log" <<'EOF'
apps/web/src/app/page.tsx:12:7 - error TS2322: Type 'number' is not assignable to type 'string'.
apps/web/src/app/page.tsx:12:7 - error TS2322: Type 'number' is not assignable to type 'string'.
Module not found: Can't resolve '@/lib/missing' in apps/web/src/app/page.tsx
Missing required environment variable process.env.ARCANUM_RPC_URL
Error occurred prerendering page "/account".
EOF

cat > "$TMPDIR/metadata.json" <<'EOF'
{
  "provider": "vercel",
  "deployment_id": "dpl_wave_ix_fixture",
  "environment": "preview",
  "state": "ERROR",
  "branch": "mobile",
  "commit": "fixture"
}
EOF

if python3 "$PARSER" "$TMPDIR/failure.log" --metadata "$TMPDIR/metadata.json" --output "$TMPDIR/fail-one.json" >/dev/null; then
  echo "build diagnostics parser accepted error log" >&2
  exit 1
fi
if python3 "$PARSER" "$TMPDIR/failure.log" --metadata "$TMPDIR/metadata.json" --output "$TMPDIR/fail-two.json" >/dev/null; then
  echo "build diagnostics parser accepted repeated error log" >&2
  exit 1
fi

[[ "$(jq -r '.report_sha256' "$TMPDIR/fail-one.json")" == "$(jq -r '.report_sha256' "$TMPDIR/fail-two.json")" ]]
jq -e '.status == "fail"' "$TMPDIR/fail-one.json" >/dev/null
jq -e '.summary.errors == 4' "$TMPDIR/fail-one.json" >/dev/null
jq -e '.summary.diagnostics == 4' "$TMPDIR/fail-one.json" >/dev/null
jq -e '[.diagnostics[] | select(.category == "typescript" and .code == "TS2322" and .source == "apps/web/src/app/page.tsx" and .line == 12 and .column == 7)] | length == 1' "$TMPDIR/fail-one.json" >/dev/null
jq -e '[.diagnostics[] | select(.category == "module_resolution" and .source == "apps/web/src/app/page.tsx")] | length == 1' "$TMPDIR/fail-one.json" >/dev/null
jq -e '[.diagnostics[] | select(.category == "environment")] | length == 1' "$TMPDIR/fail-one.json" >/dev/null
jq -e '[.diagnostics[] | select(.category == "nextjs")] | length == 1' "$TMPDIR/fail-one.json" >/dev/null
jq -e '.deployment.provider == "vercel" and .deployment.deployment_id == "dpl_wave_ix_fixture" and .deployment.environment == "preview"' "$TMPDIR/fail-one.json" >/dev/null
jq -e '.authority == "evidentiary_only"' "$TMPDIR/fail-one.json" >/dev/null

cat > "$TMPDIR/warning.log" <<'EOF'
WARN Browserslist data is outdated.
EOF
python3 "$PARSER" "$TMPDIR/warning.log" --output "$TMPDIR/warn.json" >/dev/null
jq -e '.status == "pass" and .summary.errors == 0 and .summary.warnings == 1' "$TMPDIR/warn.json" >/dev/null

printf '[]\n' > "$TMPDIR/bad-metadata.json"
if python3 "$PARSER" "$TMPDIR/warning.log" --metadata "$TMPDIR/bad-metadata.json" >/dev/null 2>&1; then
  echo "build diagnostics parser accepted malformed metadata" >&2
  exit 1
fi

echo "Build diagnostics fixtures passed"
