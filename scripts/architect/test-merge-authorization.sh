#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
BUILDER="$ROOT/scripts/architect/merge-authorization.py"
SCHEMA="$ROOT/docs/governance/architectgpt/merge-authorization.schema.json"

python3 -m py_compile "$BUILDER"
jq empty "$SCHEMA"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ORIGIN="$TMP/origin.git"
REPO="$TMP/repo"
mkdir -p "$ORIGIN" "$REPO"
git init -q --bare "$ORIGIN"
git -C "$REPO" init -q
git -C "$REPO" config user.name "Architect Fixture"
git -C "$REPO" config user.email "architect@example.invalid"
git -C "$REPO" switch -q -c mobile
printf 'authorized\n' > "$REPO/tracked.txt"
git -C "$REPO" add tracked.txt
git -C "$REPO" commit -qm "fixture head"
HEAD_SHA="$(git -C "$REPO" rev-parse HEAD)"
git -C "$REPO" remote add origin "$ORIGIN"
git -C "$REPO" push -q -u origin mobile

python3 - "$TMP" "$HEAD_SHA" <<'PY'
import hashlib, json, sys
from pathlib import Path
root = Path(sys.argv[1]); commit = sys.argv[2]
repo = "https://github.com/The-Architect-369/Arcanum.git"
def write(name, record, digest_field):
    record[digest_field] = hashlib.sha256(json.dumps(record, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    (root / name).write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
write("promotion.json", {
    "schema_version":"1.0","record_type":"promotion_attestation","repository":repo,
    "branch":"mobile","commit":commit,"wave":"wave-xvi","status":"ready",
    "checks":{"working_tree":"clean","remote_sync":"pass","evidence":"pass","repository_integrity":"pass","typecheck":"pass","build":"pass","termux_failures":0}
}, "attestation_sha256")
write("ci.json", {
    "schema_version":"1.0","record_type":"ci_promotion_attestation","repository":repo,
    "branch":"mobile","commit":commit,"status":"success",
    "checks":{"repository_integrity":"pass","typecheck":"pass","production_build":"pass"}
}, "attestation_sha256")
write("provider.json", {
    "schema_version":"1.0","record_type":"provider_evidence","repository":repo,
    "provider":"vercel","branch":"mobile","commit":commit,"target":"preview","state":"READY",
    "deployment_id":"dpl_fixture"
}, "evidence_sha256")
write("request.json", {
    "schema_version":"1.0","record_type":"merge_authorization_request","repository":repo,
    "pull_request_number":21,"base_branch":"main","head_branch":"mobile","expected_head_sha":commit,
    "merge_method":"merge","permission_class":"W3","authorization":"explicit_human_request",
    "summary":"fixture merge authorization"
}, "request_sha256")
PY

cd "$REPO"
python3 "$BUILDER" "$TMP/promotion.json" "$TMP/ci.json" "$TMP/provider.json" "$TMP/request.json" --output "$TMP/a.json" >/dev/null
python3 "$BUILDER" "$TMP/promotion.json" "$TMP/ci.json" "$TMP/provider.json" "$TMP/request.json" --output "$TMP/b.json" >/dev/null
cmp "$TMP/a.json" "$TMP/b.json"

python3 - "$TMP/a.json" "$HEAD_SHA" <<'PY'
import hashlib, json, sys
from pathlib import Path
record = json.loads(Path(sys.argv[1]).read_text())
assert record["expected_head_sha"] == sys.argv[2]
assert record["status"] == "authorized"
assert record["permission_class"] == "W3"
assert record["merge_performed"] is False
assert record["deploy_performed"] is False
claimed = record.pop("package_sha256")
actual = hashlib.sha256(json.dumps(record, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
assert claimed == actual
PY

jq '.state="BUILDING"' "$TMP/provider.json" > "$TMP/bad-provider.json"
if python3 "$BUILDER" "$TMP/promotion.json" "$TMP/ci.json" "$TMP/bad-provider.json" "$TMP/request.json" >/dev/null 2>&1; then
  echo "non-ready provider unexpectedly accepted" >&2; exit 1
fi
jq '.permission_class="W2"' "$TMP/request.json" > "$TMP/bad-request.json"
if python3 "$BUILDER" "$TMP/promotion.json" "$TMP/ci.json" "$TMP/provider.json" "$TMP/bad-request.json" >/dev/null 2>&1; then
  echo "wrong permission unexpectedly accepted" >&2; exit 1
fi
printf 'dirty\n' > dirty.txt
if python3 "$BUILDER" "$TMP/promotion.json" "$TMP/ci.json" "$TMP/provider.json" "$TMP/request.json" >/dev/null 2>&1; then
  echo "dirty checkout unexpectedly accepted" >&2; exit 1
fi
rm dirty.txt

echo "Deterministic merge authorization fixtures passed"
