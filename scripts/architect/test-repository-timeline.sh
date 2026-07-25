#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

GENERATOR="scripts/architect/repository-timeline.py"
TMPDIR="$(mktemp -d)"
cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

python3 -m py_compile "$GENERATOR"

TARGET="docs/governance/architectgpt/architect-gpt-manifest.yaml"
python3 "$GENERATOR" "$TARGET" --limit 5 --output "$TMPDIR/one.json" >/dev/null
python3 "$GENERATOR" "$TARGET" --limit 5 --output "$TMPDIR/two.json" >/dev/null

cmp -s "$TMPDIR/one.json" "$TMPDIR/two.json"
jq -e --arg head "$(git rev-parse HEAD)" '.commit == $head' "$TMPDIR/one.json" >/dev/null
jq -e '.record_type == "repository_timeline_graph"' "$TMPDIR/one.json" >/dev/null
jq -e '.history_limit == 5' "$TMPDIR/one.json" >/dev/null
jq -e '.summary.tracked_paths == 1' "$TMPDIR/one.json" >/dev/null
jq -e '.summary.nodes >= 1' "$TMPDIR/one.json" >/dev/null
jq -e '.summary.edges == ([.summary.nodes - 1, 0] | max)' "$TMPDIR/one.json" >/dev/null
jq -e '.authority == "evidentiary_only"' "$TMPDIR/one.json" >/dev/null
jq -e '.report_sha256 | test("^[0-9a-f]{64}$")' "$TMPDIR/one.json" >/dev/null
jq -e '.nodes | all(.id | test("^[0-9a-f]{20}$"))' "$TMPDIR/one.json" >/dev/null
jq -e '.nodes | all(.commit | test("^[0-9a-f]{40}$"))' "$TMPDIR/one.json" >/dev/null
jq -e '.nodes | all((.exists == false) or (.blob_sha != null and (.content_sha256 | test("^[0-9a-f]{64}$"))))' "$TMPDIR/one.json" >/dev/null
jq -e --arg path "$TARGET" '.latest_by_path[$path] == .nodes[-1].id' "$TMPDIR/one.json" >/dev/null
jq -e '.edges | all(.relation == "superseded_by")' "$TMPDIR/one.json" >/dev/null

python3 "$GENERATOR" \
  docs/governance/architectgpt/architect-gpt-manifest.yaml \
  scripts/architect/repository-timeline.py \
  --limit 3 \
  --output "$TMPDIR/multi.json" >/dev/null
jq -e '.summary.tracked_paths == 2 and (.paths == (.paths | sort | unique))' "$TMPDIR/multi.json" >/dev/null

if python3 "$GENERATOR" "$TARGET" --limit 0 >/dev/null 2>&1; then
  echo "repository timeline accepted zero history limit" >&2
  exit 1
fi
if python3 "$GENERATOR" "$TARGET" --limit 201 >/dev/null 2>&1; then
  echo "repository timeline accepted excessive history limit" >&2
  exit 1
fi
if python3 "$GENERATOR" ../outside --limit 1 >/dev/null 2>&1; then
  echo "repository timeline accepted path escape" >&2
  exit 1
fi
if python3 "$GENERATOR" /tmp/outside --limit 1 >/dev/null 2>&1; then
  echo "repository timeline accepted absolute path" >&2
  exit 1
fi

echo "Repository timeline fixtures passed"
