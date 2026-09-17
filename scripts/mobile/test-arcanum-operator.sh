#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
OPERATOR="$ROOT/scripts/mobile/arcanum-operator.sh"

fail() {
  echo "FAIL A13.1 operator fixture: $*" >&2
  exit 1
}

command -v jq >/dev/null 2>&1 || fail "jq is required"
command -v git >/dev/null 2>&1 || fail "git is required"
command -v python3 >/dev/null 2>&1 || fail "python3 is required"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

export HOME="$TMP/home"
mkdir -p "$HOME/Arcanum"

git -C "$HOME/Arcanum" init -q -b main
git -C "$HOME/Arcanum" config user.name "A13 Fixture"
git -C "$HOME/Arcanum" config user.email "a13-fixture@example.invalid"
printf 'fixture\n' > "$HOME/Arcanum/README.fixture"
git -C "$HOME/Arcanum" add README.fixture
git -C "$HOME/Arcanum" commit -q -m fixture
git -C "$HOME/Arcanum" remote add origin \
  https://github.com/The-Architect-369/Arcanum.git

BEFORE_HEAD="$(git -C "$HOME/Arcanum" rev-parse HEAD)"
BEFORE_STATUS="$(git -C "$HOME/Arcanum" status --porcelain=v1 --untracked-files=normal)"

PASS_JSON="$(bash "$OPERATOR" probe_workspace)"
jq -e '
  .schemaVersion == "1.0"
  and .operationId == "probe_workspace"
  and .status == "pass"
  and .authorityEffect == "none"
  and .repositoryMutation == false
  and .repositoryId == "The-Architect-369/Arcanum"
  and .path == ($home + "/Arcanum")
  and .branch == "main"
  and (.head | test("^[0-9a-f]{40}$"))
  and .clean == true
  and .legacyWorkspace.present == false
' --arg home "$HOME" <<<"$PASS_JSON" >/dev/null ||
  fail "canonical workspace pass fixture rejected"

AFTER_HEAD="$(git -C "$HOME/Arcanum" rev-parse HEAD)"
AFTER_STATUS="$(git -C "$HOME/Arcanum" status --porcelain=v1 --untracked-files=normal)"
[[ "$AFTER_HEAD" == "$BEFORE_HEAD" ]] || fail "operator mutated HEAD"
[[ "$AFTER_STATUS" == "$BEFORE_STATUS" ]] || fail "operator mutated working tree"

mkdir -p "$HOME/work/Arcanum"
git -C "$HOME/work/Arcanum" init -q -b stale
git -C "$HOME/work/Arcanum" config user.name "A13 Fixture"
git -C "$HOME/work/Arcanum" config user.email "a13-fixture@example.invalid"
printf 'legacy\n' > "$HOME/work/Arcanum/legacy.fixture"
git -C "$HOME/work/Arcanum" add legacy.fixture
git -C "$HOME/work/Arcanum" commit -q -m legacy

LEGACY_JSON="$(bash "$OPERATOR" probe_workspace)"
jq -e '
  .status == "pass"
  and .legacyWorkspace.present == true
  and .legacyWorkspace.branch == "stale"
  and (.legacyWorkspace.head | test("^[0-9a-f]{40}$"))
' <<<"$LEGACY_JSON" >/dev/null ||
  fail "legacy workspace was not surfaced"

git -C "$HOME/Arcanum" remote set-url origin https://example.invalid/not-arcanum.git
WRONG_ORIGIN_JSON="$(bash "$OPERATOR" probe_workspace)"
jq -e '
  .status == "fail"
  and .reason == "origin_mismatch"
  and .authorityEffect == "none"
  and .repositoryMutation == false
' <<<"$WRONG_ORIGIN_JSON" >/dev/null ||
  fail "wrong origin did not fail closed"

if bash "$OPERATOR" unknown_operation >/dev/null 2>&1; then
  fail "unknown operation was accepted"
fi

if bash "$OPERATOR" probe_workspace unexpected >/dev/null 2>&1; then
  fail "extra arguments were accepted"
fi

echo "PASS CE-W04-A13.1 fixed workspace probe, duplicate detection, scope rejection, and repository immutability"
