#!/usr/bin/env bash
# Reusable source-tranche validation gate for Architect/Human Architect work.
# It validates branch/base/scope/EOL/lint/typecheck/CE-W01 without staging,
# committing, pushing, rebasing, merging, or rewriting history.
set -euo pipefail

EXPECTED_BRANCH="${EXPECTED_BRANCH:-}"
EXPECTED_BASE="${EXPECTED_BASE:-$(git rev-parse HEAD)}"
EXPECTED_MAIN="${EXPECTED_MAIN:-}"
EXPECTED_ERRORS="${EXPECTED_ERRORS:-}"
EXPECTED_WARNINGS="${EXPECTED_WARNINGS:-}"
EXPECTED_ANY="${EXPECTED_ANY:-}"
EXPECTED_BAN="${EXPECTED_BAN:-}"

fail() { printf 'FAIL: %s\n' "$*" >&2; exit 1; }

[[ "$#" -gt 0 ]] || fail "pass the exact dirty paths expected in this tranche"

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || fail "not inside a Git repository"
cd "$ROOT"

branch="$(git branch --show-current)"
head="$(git rev-parse HEAD)"
[[ -n "$branch" ]] || fail "detached HEAD is not allowed"

if [[ -n "$EXPECTED_BRANCH" ]]; then
  [[ "$branch" == "$EXPECTED_BRANCH" ]] || fail "branch moved: expected $EXPECTED_BRANCH, got $branch"
else
  EXPECTED_BRANCH="$branch"
fi
[[ "$head" == "$EXPECTED_BASE" ]] || fail "starting HEAD moved: expected $EXPECTED_BASE, got $head"

git fetch origin --prune
remote="$(git rev-parse "origin/$EXPECTED_BRANCH" 2>/dev/null || true)"
main="$(git rev-parse origin/main)"
if [[ -n "$remote" ]]; then
  [[ "$remote" == "$EXPECTED_BASE" ]] || fail "remote branch moved: expected $EXPECTED_BASE, got $remote"
fi
if [[ -n "$EXPECTED_MAIN" ]]; then
  [[ "$main" == "$EXPECTED_MAIN" ]] || fail "main moved: expected $EXPECTED_MAIN, got $main"
fi

mapfile -t expected_paths < <(printf '%s\n' "$@" | sed '/^$/d' | LC_ALL=C sort -u)
mapfile -t dirty_paths < <(
  {
    git diff --name-only HEAD --
    git ls-files --others --exclude-standard
  } | LC_ALL=C sort -u
)

[[ "${#expected_paths[@]}" -eq "$#" ]] || fail "duplicate or empty expected path argument"
[[ "${#dirty_paths[@]}" -eq "${#expected_paths[@]}" ]] || {
  printf 'Expected dirty paths:\n' >&2
  printf '  %s\n' "${expected_paths[@]}" >&2
  printf 'Actual dirty paths:\n' >&2
  if [[ "${#dirty_paths[@]}" -gt 0 ]]; then printf '  %s\n' "${dirty_paths[@]}" >&2; else printf '  <none>\n' >&2; fi
  fail "dirty scope differs"
}
for i in "${!expected_paths[@]}"; do
  [[ "${dirty_paths[$i]}" == "${expected_paths[$i]}" ]] || fail "dirty scope differs"
done

for path in "${dirty_paths[@]}"; do
  if [[ ! -e "$path" ]]; then
    git cat-file -e "HEAD:$path" 2>/dev/null || fail "missing dirty path was not tracked at HEAD: $path"
    printf 'DELETE OK: %s\n' "$path"
    continue
  fi
  [[ -f "$path" ]] || fail "dirty path is not a regular file: $path"
  python3 - "$path" <<'PY'
from pathlib import Path
import subprocess
import sys

path = Path(sys.argv[1])
work = path.read_bytes()

def eol_kind(data: bytes) -> str:
    crlf = data.count(b"\r\n")
    lf = data.count(b"\n")
    bare_cr = data.count(b"\r") - crlf
    bare_lf = lf - crlf
    if bare_cr:
        raise SystemExit(f"FAIL bare CR detected: {path}")
    if crlf and bare_lf:
        raise SystemExit(f"FAIL mixed CRLF/LF detected: {path}")
    if crlf:
        return "CRLF"
    if lf:
        return "LF"
    return "NONE"

work_kind = eol_kind(work)
proc = subprocess.run(
    ["git", "cat-file", "blob", f"HEAD:{path.as_posix()}"],
    stdout=subprocess.PIPE,
    stderr=subprocess.DEVNULL,
    check=False,
)
if proc.returncode == 0:
    head_kind = eol_kind(proc.stdout)
    if work_kind != head_kind:
        raise SystemExit(f"FAIL EOL contract changed: {path} was {head_kind}, now {work_kind}")
    print(f"EOL OK: {path} ({work_kind})")
else:
    print(f"EOL OK: {path} ({work_kind}; new file)")
PY
done

git -c core.whitespace='trailing-space,space-before-tab,cr-at-eol' diff --check

lint_json="$(mktemp)"
trap 'rm -f "$lint_json"' EXIT
set +e
pnpm -C apps/web exec eslint . --no-cache --format json >"$lint_json"
lint_rc=$?
set -e

python3 - "$lint_json" "$lint_rc" "$EXPECTED_ERRORS" "$EXPECTED_WARNINGS" "$EXPECTED_ANY" "$EXPECTED_BAN" <<'PY'
import json
import sys

path = sys.argv[1]
lint_rc = int(sys.argv[2])
expected_errors, expected_warnings, expected_any, expected_ban = sys.argv[3:7]
with open(path, encoding="utf-8") as f:
    report = json.load(f)
errors = sum(item["errorCount"] for item in report)
warnings = sum(item["warningCount"] for item in report)
rules = {}
for item in report:
    for msg in item["messages"]:
        rule = msg.get("ruleId") or "<parser/config>"
        rules[rule] = rules.get(rule, 0) + 1
print(f"lint: {errors} errors + {warnings} warnings")
for rule, count in sorted(rules.items()):
    print(f"  {rule}: {count}")
if errors == 0 and lint_rc != 0:
    raise SystemExit(f"FAIL ESLint returned {lint_rc} with zero reported errors")
if errors > 0 and lint_rc == 0:
    raise SystemExit("FAIL ESLint returned zero despite reported errors")
for label, actual, expected in [
    ("errors", errors, expected_errors),
    ("warnings", warnings, expected_warnings),
    ("@typescript-eslint/no-explicit-any", rules.get("@typescript-eslint/no-explicit-any", 0), expected_any),
    ("@typescript-eslint/ban-ts-comment", rules.get("@typescript-eslint/ban-ts-comment", 0), expected_ban),
]:
    if expected and actual != int(expected):
        raise SystemExit(f"FAIL expected {label}={expected}, got {actual}")
PY

pnpm -C apps/web typecheck
pnpm verify:ce-w01
git -c core.whitespace='trailing-space,space-before-tab,cr-at-eol' diff --check

printf '\nPASS: source tranche validated.\n'
printf 'branch: %s\n' "$branch"
printf 'base:   %s\n' "$head"
printf 'main:   %s\n' "$main"
printf 'Review the exact diff before commit/push.\n'
