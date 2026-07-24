#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

GENERATOR="scripts/architect/change-plan.py"
TMPDIR_PLAN="$(mktemp -d)"
trap 'rm -rf "$TMPDIR_PLAN"' EXIT

HEAD_SHA="$(git rev-parse HEAD)"
REPOSITORY="https://github.com/The-Architect-369/Arcanum.git"

write_plan() {
  local path="$1"
  local base_commit="$2"
  local changes_json="$3"
  cat > "$path" <<EOF
{
  "schema_version": "1.0",
  "record_type": "repository_change_plan",
  "repository": "$REPOSITORY",
  "base_commit": "$base_commit",
  "target_branch": "mobile",
  "permission_class": "W2",
  "summary": "Fixture change plan",
  "changes": $changes_json
}
EOF
}

VALID="$TMPDIR_PLAN/valid.json"
write_plan "$VALID" "$HEAD_SHA" '[
  {"action":"update","path":"scripts/architect/change-plan.py","purpose":"Exercise deterministic update planning"},
  {"action":"create","path":"docs/example.md","purpose":"Exercise deterministic create planning","content_sha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}
]'

python3 "$GENERATOR" "$VALID" --output "$TMPDIR_PLAN/bundle-a.json" >/dev/null
python3 "$GENERATOR" "$VALID" --output "$TMPDIR_PLAN/bundle-b.json" >/dev/null
cmp -s "$TMPDIR_PLAN/bundle-a.json" "$TMPDIR_PLAN/bundle-b.json"

grep -q '"record_type": "repository_patch_bundle"' "$TMPDIR_PLAN/bundle-a.json"
grep -Eq '"bundle_sha256": "[0-9a-f]{64}"' "$TMPDIR_PLAN/bundle-a.json"

STALE="$TMPDIR_PLAN/stale.json"
write_plan "$STALE" "0000000000000000000000000000000000000000" '[{"action":"update","path":"README.md","purpose":"Reject stale base"}]'
if python3 "$GENERATOR" "$STALE" >/dev/null 2>&1; then
  echo "stale-base fixture unexpectedly passed" >&2
  exit 1
fi

UNSAFE="$TMPDIR_PLAN/unsafe.json"
write_plan "$UNSAFE" "$HEAD_SHA" '[{"action":"update","path":"../escape","purpose":"Reject traversal"}]'
if python3 "$GENERATOR" "$UNSAFE" >/dev/null 2>&1; then
  echo "unsafe-path fixture unexpectedly passed" >&2
  exit 1
fi

DUPLICATE="$TMPDIR_PLAN/duplicate.json"
write_plan "$DUPLICATE" "$HEAD_SHA" '[
  {"action":"update","path":"README.md","purpose":"First target"},
  {"action":"delete","path":"README.md","purpose":"Duplicate target"}
]'
if python3 "$GENERATOR" "$DUPLICATE" >/dev/null 2>&1; then
  echo "duplicate-path fixture unexpectedly passed" >&2
  exit 1
fi

RENAME="$TMPDIR_PLAN/rename.json"
write_plan "$RENAME" "$HEAD_SHA" '[{"action":"rename","path":"docs/new.md","purpose":"Reject missing rename source"}]'
if python3 "$GENERATOR" "$RENAME" >/dev/null 2>&1; then
  echo "malformed-rename fixture unexpectedly passed" >&2
  exit 1
fi

echo "change plan fixtures passed"
