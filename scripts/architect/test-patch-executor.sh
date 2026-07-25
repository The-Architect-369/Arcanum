#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
EXECUTOR="$ROOT/scripts/architect/patch-executor.py"
SCHEMA="$ROOT/docs/governance/architectgpt/patch-executor.schema.json"

python3 -m py_compile "$EXECUTOR"
jq empty "$SCHEMA"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
REPO="$TMP/repo"
PAYLOAD="$TMP/payload"
BUNDLE="$TMP/bundle.json"
OUT_A="$TMP/attestation-a.json"
OUT_B="$TMP/attestation-b.json"

mkdir -p "$REPO" "$PAYLOAD/docs" "$PAYLOAD/.github/workflows"
cd "$REPO"
git init -q
git config user.name "Architect Fixture"
git config user.email "architect@example.invalid"
git switch -q -c mobile
mkdir -p docs src old
echo 'original' > docs/update.txt
echo 'remove me' > docs/delete.txt
echo 'rename content' > old/name.txt
echo 'stable' > src/stable.txt
git add .
git commit -qm "fixture base"
BASE="$(git rev-parse HEAD)"

printf 'updated\n' > "$PAYLOAD/docs/update.txt"
printf 'created workflow\n' > "$PAYLOAD/.github/workflows/fixture.yml"
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
    "summary": "isolated executor fixture",
    "changes": [
        {
            "action": "create",
            "path": ".github/workflows/fixture.yml",
            "purpose": "verify dot-path preservation",
            "content_sha256": create_sha,
        },
        {
            "action": "delete",
            "path": "docs/delete.txt",
            "purpose": "verify deletion",
        },
        {
            "action": "update",
            "path": "docs/update.txt",
            "purpose": "verify payload replacement",
            "content_sha256": update_sha,
        },
        {
            "action": "rename",
            "path": "docs/renamed.txt",
            "from_path": "old/name.txt",
            "purpose": "verify exact rename",
        },
    ],
}
payload = json.dumps(bundle, sort_keys=True, separators=(",", ":")).encode()
bundle["bundle_sha256"] = hashlib.sha256(payload).hexdigest()
path.write_text(json.dumps(bundle, indent=2) + "\n", encoding="utf-8")
PY

python3 "$EXECUTOR" "$BUNDLE" \
  --payload-dir "$PAYLOAD" \
  --verify-command "git diff --cached --check" \
  --verify-command "test -f .github/workflows/fixture.yml" \
  --output "$OUT_A" >/dev/null

python3 "$EXECUTOR" "$BUNDLE" \
  --payload-dir "$PAYLOAD" \
  --verify-command "git diff --cached --check" \
  --verify-command "test -f .github/workflows/fixture.yml" \
  --output "$OUT_B" >/dev/null

cmp "$OUT_A" "$OUT_B"

jq -e --arg base "$BASE" '
  .schema_version == "1.0"
  and .record_type == "isolated_patch_attestation"
  and .base_commit == $base
  and .target_branch == "mobile"
  and .permission_class == "W2"
  and .status == "pass"
  and .source_checkout_unchanged == true
  and .authority == "evidentiary_only"
  and (.declared_changes | length) == 4
  and (.observed_status | length) == 4
  and (.observed_status | index(["A", ".github/workflows/fixture.yml"]) != null)
  and (.observed_status | index(["D", "docs/delete.txt"]) != null)
  and (.observed_status | index(["M", "docs/update.txt"]) != null)
  and (.observed_status | index(["R", "old/name.txt", "docs/renamed.txt"]) != null)
  and (.verification | length) == 2
  and ([.verification[].status] | all(. == "pass"))
  and (.candidate_diff_sha256 | test("^[0-9a-f]{64}$"))
  and (.attestation_sha256 | test("^[0-9a-f]{64}$"))
' "$OUT_A" >/dev/null

python3 - "$OUT_A" <<'PY'
import hashlib
import json
import sys
from pathlib import Path

report = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
expected = report.pop("attestation_sha256")
actual = hashlib.sha256(
    json.dumps(report, sort_keys=True, separators=(",", ":")).encode()
).hexdigest()
if actual != expected:
    raise SystemExit(f"attestation digest mismatch: {actual} != {expected}")
PY

[[ "$(git rev-parse HEAD)" == "$BASE" ]]
[[ -z "$(git status --porcelain)" ]]
[[ "$(cat docs/update.txt)" == "original" ]]
[[ -f docs/delete.txt ]]
[[ -f old/name.txt ]]
[[ ! -e docs/renamed.txt ]]
[[ ! -e .github/workflows/fixture.yml ]]

TAMPERED="$TMP/tampered.json"
jq '.summary = "tampered"' "$BUNDLE" > "$TAMPERED"
if python3 "$EXECUTOR" "$TAMPERED" --payload-dir "$PAYLOAD" >/dev/null 2>&1; then
  echo "tampered bundle unexpectedly accepted" >&2
  exit 1
fi

BAD_PAYLOAD="$TMP/bad-payload"
cp -R "$PAYLOAD" "$BAD_PAYLOAD"
printf 'wrong\n' > "$BAD_PAYLOAD/docs/update.txt"
if python3 "$EXECUTOR" "$BUNDLE" --payload-dir "$BAD_PAYLOAD" >/dev/null 2>&1; then
  echo "payload digest mismatch unexpectedly accepted" >&2
  exit 1
fi

if python3 "$EXECUTOR" "$BUNDLE" \
  --payload-dir "$PAYLOAD" \
  --verify-command "false" >/dev/null 2>&1; then
  echo "failed verification command unexpectedly accepted" >&2
  exit 1
fi

echo dirty > dirty.txt
if python3 "$EXECUTOR" "$BUNDLE" --payload-dir "$PAYLOAD" >/dev/null 2>&1; then
  echo "dirty source checkout unexpectedly accepted" >&2
  exit 1
fi
rm dirty.txt

[[ -z "$(git status --porcelain)" ]]

echo "Isolated patch executor fixtures passed"
