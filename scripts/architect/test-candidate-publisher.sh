#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
PUBLISHER="$ROOT/scripts/architect/candidate-publisher.py"
SCHEMA="$ROOT/docs/governance/architectgpt/candidate-publisher.schema.json"

python3 -m py_compile "$PUBLISHER"
jq empty "$SCHEMA"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ORIGIN="$TMP/origin.git"
REPO="$TMP/repo"
CANDIDATE_ATTESTATION="$TMP/candidate-attestation.json"
REQUEST="$TMP/publication-request.json"
DRY_A="$TMP/dry-a.json"
DRY_B="$TMP/dry-b.json"
APPLY_OUT="$TMP/apply.json"

mkdir -p "$ORIGIN" "$REPO"
git init -q --bare "$ORIGIN"
cd "$REPO"
git init -q
git config user.name "Architect Fixture"
git config user.email "architect@example.invalid"
git switch -q -c mobile
printf 'base\n' > tracked.txt
git add tracked.txt
git commit -qm "fixture base"
BASE="$(git rev-parse HEAD)"
git remote add origin "$ORIGIN"
git push -q -u origin mobile

WORKTREE="$TMP/candidate-worktree"
git worktree add -q --detach "$WORKTREE" "$BASE"
printf 'candidate\n' > "$WORKTREE/tracked.txt"
printf 'new\n' > "$WORKTREE/new.txt"
git -C "$WORKTREE" add -A
TREE="$(git -C "$WORKTREE" write-tree)"
CANDIDATE="$(
  printf 'fixture: candidate publication\n' |
  GIT_AUTHOR_NAME='The Architect' \
  GIT_AUTHOR_EMAIL='architect@example.invalid' \
  GIT_AUTHOR_DATE='2026-07-26T00:00:00Z' \
  GIT_COMMITTER_NAME='The Architect' \
  GIT_COMMITTER_EMAIL='architect@example.invalid' \
  GIT_COMMITTER_DATE='2026-07-26T00:00:00Z' \
  git -C "$WORKTREE" commit-tree "$TREE" -p "$BASE"
)"
git worktree remove --force "$WORKTREE"

python3 - "$CANDIDATE_ATTESTATION" "$BASE" "$TREE" "$CANDIDATE" <<'PY'
import hashlib
import json
import sys
from pathlib import Path

out = Path(sys.argv[1])
base, tree, candidate = sys.argv[2:]
record = {
    "schema_version": "1.0",
    "record_type": "candidate_commit_attestation",
    "repository": "https://github.com/The-Architect-369/Arcanum.git",
    "base_commit": base,
    "target_branch": "mobile",
    "bundle_sha256": "1" * 64,
    "patch_attestation_sha256": "2" * 64,
    "request_sha256": "3" * 64,
    "candidate_diff_sha256": "4" * 64,
    "tree_sha": tree,
    "candidate_commit_sha": candidate,
    "parent_commit": base,
    "source_checkout_unchanged": True,
    "refs_unchanged": True,
    "ref_updated": False,
    "authority": "evidentiary_only",
}
record["attestation_sha256"] = hashlib.sha256(
    json.dumps(record, sort_keys=True, separators=(",", ":")).encode()
).hexdigest()
out.write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
PY

python3 - "$REQUEST" "$CANDIDATE_ATTESTATION" <<'PY'
import hashlib
import json
import sys
from pathlib import Path

out, attestation_path = map(Path, sys.argv[1:])
attestation = json.loads(attestation_path.read_text(encoding="utf-8"))
record = {
    "schema_version": "1.0",
    "record_type": "candidate_ref_publication_request",
    "repository": attestation["repository"],
    "target_branch": "mobile",
    "expected_ref": "refs/heads/mobile",
    "expected_old_commit": attestation["base_commit"],
    "candidate_commit_sha": attestation["candidate_commit_sha"],
    "candidate_attestation_sha256": attestation["attestation_sha256"],
    "permission_class": "W2",
    "authorization": "explicit_human_request",
    "summary": "fixture local fast-forward authorization",
}
record["request_sha256"] = hashlib.sha256(
    json.dumps(record, sort_keys=True, separators=(",", ":")).encode()
).hexdigest()
out.write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
PY

HEAD_BEFORE="$(git rev-parse HEAD)"
LOCAL_BEFORE="$(git rev-parse refs/heads/mobile)"
REMOTE_BEFORE="$(git rev-parse refs/remotes/origin/mobile)"
STATUS_BEFORE="$(git status --porcelain)"

python3 "$PUBLISHER" "$CANDIDATE_ATTESTATION" "$REQUEST" --output "$DRY_A" >/dev/null
python3 "$PUBLISHER" "$CANDIDATE_ATTESTATION" "$REQUEST" --output "$DRY_B" >/dev/null
cmp "$DRY_A" "$DRY_B"

python3 - "$DRY_A" "$BASE" "$CANDIDATE" <<'PY'
import hashlib
import json
import sys
from pathlib import Path

record = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
base, candidate = sys.argv[2:]
expected = {
    "schema_version": "1.0",
    "record_type": "candidate_ref_publication_attestation",
    "target_branch": "mobile",
    "ref": "refs/heads/mobile",
    "expected_old_commit": base,
    "candidate_commit_sha": candidate,
    "mode": "dry_run",
    "status": "ready",
    "local_ref_updated": False,
    "remote_ref_updated": False,
    "push_performed": False,
    "merge_performed": False,
    "deploy_performed": False,
    "authority": "evidentiary_only",
}
for field, value in expected.items():
    if record.get(field) != value:
        raise SystemExit(f"{field} mismatch: {record.get(field)!r} != {value!r}")
expected_digest = record.pop("attestation_sha256")
actual_digest = hashlib.sha256(
    json.dumps(record, sort_keys=True, separators=(",", ":")).encode()
).hexdigest()
if actual_digest != expected_digest:
    raise SystemExit("dry-run attestation digest mismatch")
PY

[[ "$(git rev-parse HEAD)" == "$HEAD_BEFORE" ]]
[[ "$(git rev-parse refs/heads/mobile)" == "$LOCAL_BEFORE" ]]
[[ "$(git rev-parse refs/remotes/origin/mobile)" == "$REMOTE_BEFORE" ]]
[[ "$(git status --porcelain)" == "$STATUS_BEFORE" ]]

REQUEST_SHA="$(jq -r '.request_sha256' "$REQUEST")"

if python3 "$PUBLISHER" "$CANDIDATE_ATTESTATION" "$REQUEST" --apply >/dev/null 2>&1; then
  echo "apply without confirmation unexpectedly accepted" >&2
  exit 1
fi
if python3 "$PUBLISHER" "$CANDIDATE_ATTESTATION" "$REQUEST" --apply --confirm "$(printf '0%.0s' {1..64})" >/dev/null 2>&1; then
  echo "apply with wrong confirmation unexpectedly accepted" >&2
  exit 1
fi
if python3 "$PUBLISHER" "$CANDIDATE_ATTESTATION" "$REQUEST" --confirm "$REQUEST_SHA" >/dev/null 2>&1; then
  echo "dry-run confirmation unexpectedly accepted" >&2
  exit 1
fi

TAMPERED="$TMP/tampered-attestation.json"
jq '.candidate_commit_sha = .base_commit' "$CANDIDATE_ATTESTATION" > "$TAMPERED"
if python3 "$PUBLISHER" "$TAMPERED" "$REQUEST" >/dev/null 2>&1; then
  echo "tampered candidate attestation unexpectedly accepted" >&2
  exit 1
fi

BAD_REQUEST="$TMP/bad-request.json"
jq '.permission_class = "W3"' "$REQUEST" > "$BAD_REQUEST"
if python3 "$PUBLISHER" "$CANDIDATE_ATTESTATION" "$BAD_REQUEST" >/dev/null 2>&1; then
  echo "invalid permission request unexpectedly accepted" >&2
  exit 1
fi

printf 'dirty\n' > dirty.txt
if python3 "$PUBLISHER" "$CANDIDATE_ATTESTATION" "$REQUEST" >/dev/null 2>&1; then
  echo "dirty checkout unexpectedly accepted" >&2
  exit 1
fi
rm dirty.txt

python3 "$PUBLISHER" "$CANDIDATE_ATTESTATION" "$REQUEST" \
  --apply --confirm "$REQUEST_SHA" --output "$APPLY_OUT" >/dev/null

[[ "$(git rev-parse HEAD)" == "$CANDIDATE" ]]
[[ "$(git rev-parse refs/heads/mobile)" == "$CANDIDATE" ]]
[[ "$(git rev-parse refs/remotes/origin/mobile)" == "$BASE" ]]
[[ -z "$(git status --porcelain)" ]]
[[ "$(git show -s --format=%P HEAD)" == "$BASE" ]]

python3 - "$APPLY_OUT" <<'PY'
import hashlib
import json
import sys
from pathlib import Path

record = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
expected = {
    "mode": "apply",
    "status": "applied",
    "local_ref_updated": True,
    "remote_ref_updated": False,
    "push_performed": False,
    "merge_performed": False,
    "deploy_performed": False,
    "authority": "local_repository_write_only",
}
for field, value in expected.items():
    if record.get(field) != value:
        raise SystemExit(f"{field} mismatch: {record.get(field)!r} != {value!r}")
expected_digest = record.pop("attestation_sha256")
actual_digest = hashlib.sha256(
    json.dumps(record, sort_keys=True, separators=(",", ":")).encode()
).hexdigest()
if actual_digest != expected_digest:
    raise SystemExit("apply attestation digest mismatch")
PY

if python3 "$PUBLISHER" "$CANDIDATE_ATTESTATION" "$REQUEST" >/dev/null 2>&1; then
  echo "stale base unexpectedly accepted after local publication" >&2
  exit 1
fi

[[ "$(git rev-parse refs/remotes/origin/mobile)" == "$BASE" ]]

echo "Guarded candidate ref publisher fixtures passed"
