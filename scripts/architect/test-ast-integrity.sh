#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

ANALYZER="scripts/architect/ast-integrity.py"
FIXTURE_DIR="apps/web/src/.architect-ast-fixture"
TMPDIR="$(mktemp -d)"

cleanup() {
  rm -rf "$FIXTURE_DIR" "$TMPDIR"
}
trap cleanup EXIT

python3 -m py_compile "$ANALYZER"

python3 "$ANALYZER" --output "$TMPDIR/pass-one.json" >/dev/null
python3 "$ANALYZER" --output "$TMPDIR/pass-two.json" >/dev/null

first_digest="$(jq -r '.report_sha256' "$TMPDIR/pass-one.json")"
second_digest="$(jq -r '.report_sha256' "$TMPDIR/pass-two.json")"
[[ "$first_digest" == "$second_digest" ]] || {
  echo "AST report digest is not deterministic" >&2
  exit 1
}
[[ "$(jq -r '.status' "$TMPDIR/pass-one.json")" == "pass" ]] || {
  echo "live application AST integrity did not pass" >&2
  exit 1
}

mkdir -p "$FIXTURE_DIR"
cat > "$FIXTURE_DIR/syntax-error.ts" <<'EOF'
export const broken: string =
EOF
cat > "$FIXTURE_DIR/unresolved.ts" <<'EOF'
import { missing } from "./does-not-exist";
export { missing };
EOF
cat > "$FIXTURE_DIR/undeclared.ts" <<'EOF'
import value from "architect-wave-viii-fixture-package";
export default value;
EOF
cat > "$FIXTURE_DIR/cycle-a.ts" <<'EOF'
import { cycleB } from "./cycle-b";
export const cycleA = cycleB;
EOF
cat > "$FIXTURE_DIR/cycle-b.ts" <<'EOF'
import { cycleA } from "./cycle-a";
export const cycleB = cycleA;
EOF

if python3 "$ANALYZER" --output "$TMPDIR/fail.json" >/dev/null 2>&1; then
  echo "AST analyzer accepted injected failures" >&2
  exit 1
fi

jq -e '.status == "fail"' "$TMPDIR/fail.json" >/dev/null
jq -e '.findings.compiler_errors | length > 0' "$TMPDIR/fail.json" >/dev/null
jq -e '.findings.unresolved_local_imports | length > 0' "$TMPDIR/fail.json" >/dev/null
jq -e '.findings.undeclared_dependencies | length > 0' "$TMPDIR/fail.json" >/dev/null
jq -e '.findings.dependency_cycles | length > 0' "$TMPDIR/fail.json" >/dev/null

echo "AST integrity fixtures passed"
