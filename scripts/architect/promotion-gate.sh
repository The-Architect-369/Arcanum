#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$ROOT" ]] || { echo "FAIL not inside a git repository"; exit 1; }
cd "$ROOT"

REPORT_ROOT="$ROOT/.architect-reports"
MOBILE_REPORT_DIR="$REPORT_ROOT/mobile"
ORCHESTRATION_DIR="$REPORT_ROOT/orchestration"
VALIDATOR="$ROOT/scripts/architect/validate-evidence.py"
ATTESTATION_DIR="$ORCHESTRATION_DIR/promotions"

fail=0
pass() { printf 'PASS %s\n' "$*"; }
fail_check() { printf 'FAIL %s\n' "$*"; fail=$((fail + 1)); }

report_commit() {
  awk -F'`' '/\| PASS \| git repository \|/{print $2; exit}' "$1"
}

report_has_pass() {
  local report="$1" check="$2"
  grep -Fq "| PASS | $check |" "$report"
}

runtime_changed_between() {
  local from="$1" to="$2"
  git diff --name-only "$from..$to" -- \
    'apps/web/**' \
    'packages/**' \
    'package.json' \
    'pnpm-lock.yaml' \
    'pnpm-workspace.yaml' \
    'tsconfig*.json' \
    'next.config.*' \
    'apps/web/next.config.*' \
    | grep -q .
}

find_build_report() {
  local report commit
  while IFS= read -r report; do
    [[ -n "$report" ]] || continue
    report_has_pass "$report" "web build" || continue
    grep -q -- '- FAIL: 0' "$report" || continue
    commit="$(report_commit "$report")"
    [[ "$commit" =~ ^[0-9a-f]{40}$ ]] || continue
    git merge-base --is-ancestor "$commit" "$head" 2>/dev/null || continue
    runtime_changed_between "$commit" "$head" && continue
    printf '%s\n' "$report"
    return 0
  done < <(find "$MOBILE_REPORT_DIR" -maxdepth 1 -type f -name 'termux-*.md' 2>/dev/null | sort -r)
  return 1
}

branch="$(git branch --show-current 2>/dev/null || echo unknown)"
head="$(git rev-parse HEAD 2>/dev/null || echo unknown)"
remote_head="$(git rev-parse origin/mobile 2>/dev/null || echo unknown)"

printf '== Architect GPT promotion gate ==\n'
printf 'Branch: %s\n' "$branch"
printf 'HEAD: %s\n' "$head"
printf 'origin/mobile: %s\n\n' "$remote_head"

[[ "$branch" == "mobile" ]] && pass "integration branch is mobile" || fail_check "integration branch must be mobile"
[[ -z "$(git status --porcelain)" ]] && pass "working tree clean" || fail_check "working tree contains local changes"
[[ "$head" == "$remote_head" ]] && pass "HEAD synchronized with origin/mobile" || fail_check "HEAD differs from origin/mobile"

if python3 "$VALIDATOR" "$ORCHESTRATION_DIR/execution.jsonl" >/dev/null \
  && python3 "$VALIDATOR" "$ORCHESTRATION_DIR/provider-evidence.jsonl" >/dev/null; then
  pass "orchestration evidence valid"
else
  fail_check "orchestration evidence invalid"
fi

if bash "$ROOT/scripts/verify-sync.sh" >/dev/null; then
  pass "repository integrity suite"
else
  fail_check "repository integrity suite"
fi

exact_report="$(find "$MOBILE_REPORT_DIR" -maxdepth 1 -type f -name 'termux-*.md' 2>/dev/null | sort | tail -n 1)"
build_report=""
build_commit=""

if [[ -z "$exact_report" ]]; then
  fail_check "no Termux verification report found"
else
  exact_commit="$(report_commit "$exact_report")"
  [[ "$exact_commit" == "$head" ]] && pass "latest Termux report matches HEAD" || fail_check "latest Termux report commit does not match HEAD"
  report_has_pass "$exact_report" "web typecheck" && pass "exact-head Termux typecheck evidence" || fail_check "exact-head Termux typecheck evidence missing"
  report_has_pass "$exact_report" "repository sync" && pass "exact-head Termux repository sync evidence" || fail_check "exact-head Termux repository sync evidence missing"
  grep -q -- '- FAIL: 0' "$exact_report" && pass "exact-head Termux report has zero failures" || fail_check "exact-head Termux report contains failures"

  if report_has_pass "$exact_report" "web build"; then
    build_report="$exact_report"
    build_commit="$exact_commit"
    pass "exact-head Termux production build evidence"
  elif build_report="$(find_build_report)"; then
    build_commit="$(report_commit "$build_report")"
    pass "inherited Termux production build evidence from $build_commit"
    pass "no runtime-affecting changes since inherited build"
  else
    fail_check "no valid production build evidence for current runtime tree"
  fi
fi

printf '\nResult: FAIL=%s\n' "$fail"
[[ "$fail" -eq 0 ]] || exit 1

wave="${1:-unspecified}"
mkdir -p "$ATTESTATION_DIR"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
attestation="$ATTESTATION_DIR/promotion-${wave}-${stamp}.json"

jq -n \
  --arg schema_version "1.0" \
  --arg record_type "promotion_attestation" \
  --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg repository "$(git config --get remote.origin.url 2>/dev/null || echo unknown)" \
  --arg branch "$branch" \
  --arg commit "$head" \
  --arg wave "$wave" \
  --arg exact_report "${exact_report#$ROOT/}" \
  --arg build_report "${build_report#$ROOT/}" \
  --arg build_commit "$build_commit" \
  '{schema_version:$schema_version,record_type:$record_type,timestamp:$timestamp,repository:$repository,branch:$branch,commit:$commit,wave:$wave,status:"ready",checks:{working_tree:"clean",remote_sync:"pass",evidence:"pass",repository_integrity:"pass",typecheck:"pass",build:"pass",termux_failures:0},exact_report:$exact_report,build_report:$build_report,build_commit:$build_commit}' \
  > "$attestation"

printf 'Promotion attestation: %s\n' "$attestation"
cat "$attestation"
