#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
PATCH_EXECUTOR="$ROOT/scripts/architect/patch-executor.py"
BUILDER="$ROOT/scripts/architect/candidate-commit.py"
SCHEMA="$ROOT/docs/governance/architectgpt/candidate-commit.schema.json"

python3 -m py_compile "$BUILDER"
jq empty "$SCHEMA"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
REPO="$TMP/repo"
PAYLOAD="$TMP/payload"
BUNDLE="$TMP/bundle.json"
PATCH="$TMP/patch-attestation.json"
REQUEST="$TMP/request.json"
OUT_A="$TMP/commit-a.json"
OUT_B="$TMP/commit-b.json"

mkdir -p "$REPO" "$PAYLOAD/docs" "$PAYLOAD/.github/workflows"
cd "$REPO"
git init -q
git config user.name "Architect Fixture"
git config user.email "architect@example.invalid"
git switch -q -c mobile
mkdir -p docs old src
printf 'original\n' > docs/update.txt
printf 'delete\n' > docs/delete.txt
printf 'rename\n' > old/name.txt
printf 'stable\n' > src/stable.txt
git add .
git commit -qm "fixture base"
BASE="$(git rev-parse HEAD)"
REFS_BEFORE="$(git for-each-ref --format='%(refname)%00%(objectname)')"

printf 'updated\n' > "$PAYLOAD/docs/update.txt"
printf 'workflow\n' > "$PAYLOAD/.github/workflows/fixture.yml"
UPDATE_SHA="$(sha256sum "$PAYLOAD/docs/update.txt" | awk '{print $1}')"
CREATE_SHA="$(sha256sum "$PAYLOAD/.github/workflows/fixture.yml" | awk '{print $1}')"

python3 - "$BUNDLE" "$BASE" "$UPDATE_SHA" "$CREATE_SHA" <<'PY'
import hashlib
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
base, update_sha, create_sha = sys.argv[2:]
bundle = {
    "schema_version": "1.0",
    "record_type": "repository_patch_bundle",
    "repository": "https://github.com/The-Architect-369/Arcanum.git",
    "base_commit": base,
    "target_branch": "mobile",
    "permission_class": "W2",
    "summary": "candidate commit fixture",
    "changes": [
        {"action": "create", "path": ".github/workflows/fixture.yml", "purpose": "create", "content_sha256": create_sha},
        {"action": "delete", "path": "docs/delete.txt", "purpose": "delete"},
        {"action": "update", "path": "docs/update.txt", "purpose": "update", "content_sha256": update_sha},
        {"action": "rename", "path": "docs/renamed.txt", "from_path": "old/name.txt", "purpose": "rename"}
    ]
}
payload = json.dumps(bundle, sort_keys=True, separators=(",", ":")).encode()
bundle["bundle_sha256"] = hashlib.sha256(payload).hexdigest()
path.write_text(json.dumps(bundle, indent=2) + "\n", encoding="utf-8")
PY

python3 "$PATCH_EXECUTOR" "$BUNDLE" \
  --payload-dir "$PAYLOAD" \
  --output "$PATCH" >/dev/null

python3 - "$REQUEST" "$BUNDLE" "$PATCH" <<'PY'
import json
import sys
from pathlib import Path

out, bundle_path, patch_path = map(Path, sys.argv[1:])
bundle = json.loads(bundle_path.read_text(encoding="utf-8"))
patch = json.loads(patch_path.read_text(encoding="utf-8"))
request = {
    "schema_version": "1.0",
    "record_type": "candidate_commit_request",
    "repository": bundle["repository"],
    "base_commit": bundle["base_commit"],
    "target_branch": "mobile",
    "bundle_sha256": bundle["bundle_sha256"],
    "patch_attestation_sha256": patch["attestation_sha256"],
    "author_name": "The Architect",
    "author_email": "architect@example.invalid",
    "timestamp": "2026-07-25T23:00:00Z",
    "message": "fixture: deterministic candidate commit"
}
out.write_text(json.dumps(request, indent=2) + "\n", encoding="utf-8")
PY

python3 "$BUILDER" "$BUNDLE" "$PATCH" "$REQUEST" \
  --payload-dir "$PAYLOAD" --output "$OUT_A" >/dev/null
python3 "$BUILDER" "$BUNDLE" "$PATCH" "$REQUEST" \
  --payload-dir "$PAYLOAD" --output "$OUT_B" >/dev/null
cmp "$OUT_A" "$OUT_B"

python3 - "$OUT_A" "$BASE" <<'PY'
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

report = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
base = sys.argv[2]
expected = {
    "schema_version": "1.0",
    "record_type": "candidate_commit_attestation",
    "base_commit": base,
    "target_branch": "mobile",
    "parent_commit": base,
    "source_checkout_unchanged": True,
    "refs_unchanged": True,
    "ref_updated": False,
    "authority": "evidentiary_only",
}
for field, value in expected.items():
    if report.get(field) != value:
        raise SystemExit(f"{field} mismatch: {report.get(field)!r} != {value!r}")
for field in (
    "bundle_sha256", "patch_attestation_sha256", "request_sha256",
    "candidate_diff_sha256", "attestation_sha256"
):
    if re.fullmatch(r"[0-9a-f]{64}", report.get(field, "")) is None:
        raise SystemExit(f"invalid {field}")
for field in ("tree_sha", "candidate_commit_sha", "parent_commit"):
    if re.fullmatch(r"[0-9a-f]{40}", report.get(field, "")) is None:
        raise SystemExit(f"invalid {field}")
commit = report["candidate_commit_sha"]
if subprocess.check_output(["git", "cat-file", "-t", commit], text=True).strip() != "commit":
    raise SystemExit("candidate object is not a commit")
if subprocess.check_output(["git", "show", "-s", "--format=%P", commit], text=True).strip() != base:
    raise SystemExit("candidate parent mismatch")
if subprocess.check_output(["git", "show", "-s", "--format=%T", commit], text=True).strip() != report["tree_sha"]:
    raise SystemExit("candidate tree mismatch")
expected_digest = report.pop("attestation_sha256")
actual_digest = hashlib.sha256(
    json.dumps(report, sort_keys=True, separators=(",", ":")).encode()
).hexdigest()
if actual_digest != expected_digest:
    raise SystemExit("candidate attestation digest mismatch")
PY

[[ "$(git rev-parse HEAD)" == "$BASE" ]]
[[ -z "$(git status --porcelain)" ]]
[[ "$(git for-each-ref --format='%(refname)%00%(objectname)')" == "$REFS_BEFORE" ]]

TAMPERED_PATCH="$TMP/tampered-patch.json"
jq '.candidate_diff_sha256 = ("0" * 64)' "$PATCH" > "$TAMPERED_PATCH"
if python3 "$BUILDER" "$BUNDLE" "$TAMPERED_PATCH" "$REQUEST" --payload-dir "$PAYLOAD" >/dev/null 2>&1; then
  echo "tampered patch attestation unexpectedly accepted" >&2
  exit 1
fi

BAD_REQUEST="$TMP/bad-request.json"
jq '.timestamp = "2026-07-25T23:00:00+00:00"' "$REQUEST" > "$BAD_REQUEST"
if python3 "$BUILDER" "$BUNDLE" "$PATCH" "$BAD_REQUEST" --payload-dir "$PAYLOAD" >/dev/null 2>&1; then
  echo "non-Z timestamp unexpectedly accepted" >&2
  exit 1
fi

BAD_PAYLOAD="$TMP/bad-payload"
cp -R "$PAYLOAD" "$BAD_PAYLOAD"
printf 'wrong\n' > "$BAD_PAYLOAD/docs/update.txt"
if python3 "$BUILDER" "$BUNDLE" "$PATCH" "$REQUEST" --payload-dir "$BAD_PAYLOAD" >/dev/null 2>&1; then
  echo "payload mismatch unexpectedly accepted" >&2
  exit 1
fi

echo dirty > dirty.txt
if python3 "$BUILDER" "$BUNDLE" "$PATCH" "$REQUEST" --payload-dir "$PAYLOAD" >/dev/null 2>&1; then
  echo "dirty checkout unexpectedly accepted" >&2
  exit 1
fi
rm dirty.txt

[[ -z "$(git status --porcelain)" ]]
[[ "$(git for-each-ref --format='%(refname)%00%(objectname)')" == "$REFS_BEFORE" ]]

echo "Deterministic candidate commit fixtures passed"
