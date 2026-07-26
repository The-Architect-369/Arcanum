#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
EXECUTOR="$ROOT/scripts/architect/merge-executor.py"
SCHEMA="$ROOT/docs/governance/architectgpt/merge-executor.schema.json"

python3 -m py_compile "$EXECUTOR"
jq empty "$SCHEMA"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ORIGIN="$TMP/origin.git"
REPO="$TMP/repo"
BIN="$TMP/bin"
PACKAGE="$TMP/package.json"
REQUEST="$TMP/request.json"
DRY_A="$TMP/dry-a.json"
DRY_B="$TMP/dry-b.json"
APPLY_OUT="$TMP/apply.json"
STATE="$TMP/pr-state"

mkdir -p "$ORIGIN" "$REPO" "$BIN"
git init -q --bare "$ORIGIN"
git -C "$ORIGIN" symbolic-ref HEAD refs/heads/main

git -C "$REPO" init -q
git -C "$REPO" config user.name "Architect Fixture"
git -C "$REPO" config user.email "architect@example.invalid"
git -C "$REPO" switch -q -c main
printf 'base\n' > "$REPO/tracked.txt"
git -C "$REPO" add tracked.txt
git -C "$REPO" commit -qm "fixture base"
BASE="$(git -C "$REPO" rev-parse HEAD)"
git -C "$REPO" remote add origin "$ORIGIN"
git -C "$REPO" push -q -u origin main

git -C "$REPO" switch -q -c mobile
printf 'candidate\n' > "$REPO/tracked.txt"
git -C "$REPO" add tracked.txt
GIT_AUTHOR_DATE='2026-07-26T16:00:00Z' \
GIT_COMMITTER_DATE='2026-07-26T16:00:00Z' \
  git -C "$REPO" commit -qm "fixture candidate"
CANDIDATE="$(git -C "$REPO" rev-parse HEAD)"
git -C "$REPO" push -q -u origin mobile

echo open > "$STATE"

cat > "$BIN/gh" <<'SH'
#!/usr/bin/env bash
set -euo pipefail

if [[ "$1 $2" == "pr view" ]]; then
  if [[ "$(cat "$MOCK_PR_STATE")" == "open" ]]; then
    jq -n \
      --argjson number "$MOCK_PR_NUMBER" \
      --arg head "$MOCK_HEAD" \
      '{number:$number,state:"OPEN",isDraft:false,mergeable:"MERGEABLE",baseRefName:"main",headRefName:"mobile",headRefOid:$head,mergedAt:null,mergeCommit:null}'
  else
    main="$(git --git-dir="$MOCK_ORIGIN" rev-parse refs/heads/main)"
    jq -n \
      --argjson number "$MOCK_PR_NUMBER" \
      --arg head "$MOCK_HEAD" \
      --arg main "$main" \
      '{number:$number,state:"MERGED",isDraft:false,mergeable:"UNKNOWN",baseRefName:"main",headRefName:"mobile",headRefOid:$head,mergedAt:"2026-07-26T16:05:00Z",mergeCommit:{oid:$main}}'
  fi
  exit 0
fi

if [[ "$1 $2" == "pr merge" ]]; then
  [[ "$(cat "$MOCK_PR_STATE")" == "open" ]]
  old="$(git --git-dir="$MOCK_ORIGIN" rev-parse refs/heads/main)"
  tree="$(git --git-dir="$MOCK_ORIGIN" rev-parse "$MOCK_HEAD^{tree}")"
  merge="$({
    printf 'tree %s\n' "$tree"
    printf 'parent %s\n' "$old"
    printf 'parent %s\n' "$MOCK_HEAD"
    printf 'author Architect Fixture <architect@example.invalid> 1785081900 +0000\n'
    printf 'committer Architect Fixture <architect@example.invalid> 1785081900 +0000\n\n'
    printf 'fixture merge\n'
  } | git --git-dir="$MOCK_ORIGIN" hash-object -t commit -w --stdin)"
  git --git-dir="$MOCK_ORIGIN" update-ref refs/heads/main "$merge" "$old"
  echo merged > "$MOCK_PR_STATE"
  printf 'merged fixture PR\n'
  exit 0
fi

printf 'unsupported gh invocation: %s\n' "$*" >&2
exit 1
SH
chmod +x "$BIN/gh"

python3 - "$PACKAGE" "$REQUEST" "$CANDIDATE" <<'PY'
import hashlib
import json
import sys
from pathlib import Path

package_path, request_path = map(Path, sys.argv[1:3])
head = sys.argv[3]

def sign(record, field):
    body = json.dumps(record, sort_keys=True, separators=(",", ":")).encode()
    record[field] = hashlib.sha256(body).hexdigest()

package = {
    "schema_version": "1.0",
    "record_type": "merge_authorization_package",
    "repository": "https://github.com/The-Architect-369/Arcanum.git",
    "pull_request_number": 42,
    "base_branch": "main",
    "head_branch": "mobile",
    "expected_head_sha": head,
    "merge_method": "merge",
    "promotion_attestation_sha256": "1" * 64,
    "ci_attestation_sha256": "2" * 64,
    "provider_evidence_sha256": "3" * 64,
    "merge_request_sha256": "4" * 64,
    "permission_class": "W3",
    "authorization": "explicit_human_request",
    "status": "authorized",
    "merge_performed": False,
    "deploy_performed": False,
    "authority": "merge_authorization_evidence_only",
}
sign(package, "package_sha256")
package_path.write_text(json.dumps(package, indent=2) + "\n", encoding="utf-8")

request = {
    "schema_version": "1.0",
    "record_type": "merge_execution_request",
    "repository": "https://github.com/The-Architect-369/Arcanum.git",
    "pull_request_number": 42,
    "base_branch": "main",
    "head_branch": "mobile",
    "expected_head_sha": head,
    "merge_method": "merge",
    "merge_authorization_package_sha256": package["package_sha256"],
    "permission_class": "W3",
    "authorization": "explicit_human_request",
    "summary": "fixture expected-head merge",
}
sign(request, "request_sha256")
request_path.write_text(json.dumps(request, indent=2) + "\n", encoding="utf-8")
PY

export PATH="$BIN:$PATH"
export MOCK_PR_STATE="$STATE"
export MOCK_PR_NUMBER=42
export MOCK_HEAD="$CANDIDATE"
export MOCK_ORIGIN="$ORIGIN"

cd "$REPO"
HEAD_BEFORE="$(git rev-parse HEAD)"
MAIN_BEFORE="$(git ls-remote --heads origin refs/heads/main | awk '{print $1}')"
MOBILE_BEFORE="$(git ls-remote --heads origin refs/heads/mobile | awk '{print $1}')"
STATUS_BEFORE="$(git status --porcelain)"

python3 "$EXECUTOR" "$PACKAGE" "$REQUEST" --output "$DRY_A" >/dev/null
python3 "$EXECUTOR" "$PACKAGE" "$REQUEST" --output "$DRY_B" >/dev/null
cmp "$DRY_A" "$DRY_B"

jq -e '
  .mode == "dry_run" and
  .status == "ready" and
  .main_updated == false and
  .mobile_updated == false and
  .merge_performed == false and
  .deploy_performed == false and
  .authority == "evidentiary_only"
' "$DRY_A" >/dev/null

[[ "$(git rev-parse HEAD)" == "$HEAD_BEFORE" ]]
[[ "$(git ls-remote --heads origin refs/heads/main | awk '{print $1}')" == "$MAIN_BEFORE" ]]
[[ "$(git ls-remote --heads origin refs/heads/mobile | awk '{print $1}')" == "$MOBILE_BEFORE" ]]
[[ "$(git status --porcelain)" == "$STATUS_BEFORE" ]]

REQUEST_SHA="$(jq -r '.request_sha256' "$REQUEST")"
if python3 "$EXECUTOR" "$PACKAGE" "$REQUEST" --apply >/dev/null 2>&1; then
  echo "apply without confirmation unexpectedly accepted" >&2
  exit 1
fi
if python3 "$EXECUTOR" "$PACKAGE" "$REQUEST" --apply --confirm "$(printf '0%.0s' {1..64})" >/dev/null 2>&1; then
  echo "apply with wrong confirmation unexpectedly accepted" >&2
  exit 1
fi
if python3 "$EXECUTOR" "$PACKAGE" "$REQUEST" --confirm "$REQUEST_SHA" >/dev/null 2>&1; then
  echo "dry-run confirmation unexpectedly accepted" >&2
  exit 1
fi

TAMPERED="$TMP/tampered-package.json"
jq '.expected_head_sha = "0000000000000000000000000000000000000000"' "$PACKAGE" > "$TAMPERED"
if python3 "$EXECUTOR" "$TAMPERED" "$REQUEST" >/dev/null 2>&1; then
  echo "tampered authorization package unexpectedly accepted" >&2
  exit 1
fi

printf 'dirty\n' > dirty.txt
if python3 "$EXECUTOR" "$PACKAGE" "$REQUEST" >/dev/null 2>&1; then
  echo "dirty checkout unexpectedly accepted" >&2
  exit 1
fi
rm dirty.txt

python3 "$EXECUTOR" "$PACKAGE" "$REQUEST" \
  --apply --confirm "$REQUEST_SHA" --output "$APPLY_OUT" >/dev/null

NEW_MAIN="$(git ls-remote --heads origin refs/heads/main | awk '{print $1}')"
[[ "$NEW_MAIN" != "$MAIN_BEFORE" ]]
[[ "$(git --git-dir="$ORIGIN" show -s --format=%P "$NEW_MAIN")" == "$MAIN_BEFORE $CANDIDATE" ]]
[[ "$(git rev-parse HEAD)" == "$CANDIDATE" ]]
[[ "$(git ls-remote --heads origin refs/heads/mobile | awk '{print $1}')" == "$CANDIDATE" ]]
[[ -z "$(git status --porcelain)" ]]

jq -e --arg main "$NEW_MAIN" '
  .mode == "apply" and
  .status == "merged" and
  .actual_new_main_sha == $main and
  .main_updated == true and
  .mobile_updated == false and
  .tag_updated == false and
  .merge_performed == true and
  .deploy_performed == false and
  .authority == "pull_request_merge_only" and
  (.provider_output_sha256 | test("^[0-9a-f]{64}$"))
' "$APPLY_OUT" >/dev/null

if python3 "$EXECUTOR" "$PACKAGE" "$REQUEST" >/dev/null 2>&1; then
  echo "replayed merge request unexpectedly accepted" >&2
  exit 1
fi

echo "Guarded merge executor fixtures passed"
