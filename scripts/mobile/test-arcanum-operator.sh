#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
OPERATOR="$ROOT/scripts/mobile/arcanum-operator.sh"

fail() {
  echo "FAIL A13.2 operator fixture: $*" >&2
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

PAIRING_SECRET="$HOME/.config/arcanum/architect-broker.secret"
PAIR_JSON="$(bash "$OPERATOR" pair_native_client)"
jq -e '
  .schemaVersion == "1.0"
  and .operationId == "pair_native_client"
  and .status == "pass"
  and .authorityEffect == "none"
  and .repositoryMutation == false
  and .repositoryId == "The-Architect-369/Arcanum"
  and .workspacePath == ($home + "/Arcanum")
  and .branch == "main"
  and (.head | test("^[0-9a-f]{40}$"))
  and .pairingSecretPath == ($home + "/.config/arcanum/architect-broker.secret")
  and .secretCreated == true
  and (.pairingCode | test("^[0-9a-f]{64}$"))
' --arg home "$HOME" <<<"$PAIR_JSON" >/dev/null ||
  fail "zero-copy pairing creation fixture rejected"

[[ -f "$PAIRING_SECRET" ]] || fail "pairing secret was not created"
[[ "$(stat -c '%a' "$PAIRING_SECRET")" == "600" ]] ||
  fail "pairing secret mode is not 600"

PAIR_CODE="$(jq -r '.pairingCode' <<<"$PAIR_JSON")"
[[ "$(tr -d '\r\n' < "$PAIRING_SECRET" | tr '[:upper:]' '[:lower:]')" == "$PAIR_CODE" ]] ||
  fail "returned pairing material differs from canonical secret"

PAIR_REUSE_JSON="$(bash "$OPERATOR" pair_native_client)"
jq -e '
  .status == "pass"
  and .secretCreated == false
  and .pairingCode == $pairing
' --arg pairing "$PAIR_CODE" <<<"$PAIR_REUSE_JSON" >/dev/null ||
  fail "existing pairing secret was not reused exactly"

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

rm -f "$PAIRING_SECRET"
WRONG_PAIR_JSON="$(bash "$OPERATOR" pair_native_client)"
jq -e '
  .status == "fail"
  and .reason == "origin_mismatch"
  and .authorityEffect == "none"
  and .repositoryMutation == false
  and .secretCreated == false
  and .pairingCode == null
' <<<"$WRONG_PAIR_JSON" >/dev/null ||
  fail "pairing did not fail closed for wrong origin"
[[ ! -e "$PAIRING_SECRET" ]] ||
  fail "pairing secret was created for a rejected repository"

git -C "$HOME/Arcanum" remote set-url origin \
  https://github.com/The-Architect-369/Arcanum.git
mkdir -p "$(dirname "$PAIRING_SECRET")"
printf 'not-a-valid-secret\n' > "$PAIRING_SECRET"

INVALID_PAIR_JSON="$(bash "$OPERATOR" pair_native_client)"
jq -e '
  .status == "fail"
  and .reason == "pairing_secret_invalid"
  and .pairingCode == null
' <<<"$INVALID_PAIR_JSON" >/dev/null ||
  fail "invalid existing pairing secret did not fail closed"

if bash "$OPERATOR" unknown_operation >/dev/null 2>&1; then
  fail "unknown operation was accepted"
fi

if bash "$OPERATOR" probe_workspace unexpected >/dev/null 2>&1; then
  fail "extra probe arguments were accepted"
fi

if bash "$OPERATOR" pair_native_client unexpected >/dev/null 2>&1; then
  fail "extra pairing arguments were accepted"
fi

if bash "$OPERATOR" verify_workspace unexpected >/dev/null 2>&1; then
  fail "extra verification arguments were accepted"
fi

echo "PASS CE-W04-A13.4 fixed operator registry, workspace probe, zero-copy pairing, scope rejection, and repository immutability"
