#!/data/data/com.termux/files/usr/bin/bash
set -uo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
REPORT_DIR="$ROOT/.architect-reports/mobile"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
REPORT="$REPORT_DIR/termux-$STAMP.md"
LOG_DIR="$REPORT_DIR/logs-$STAMP"
mkdir -p "$REPORT_DIR" "$LOG_DIR"

PASS=0
WARN=0
FAIL=0
CURRENT_CHECK="initialization"
FINALIZED=0

record() {
  local status="$1" label="$2" detail="$3"
  printf '| %s | %s | `%s` |\n' "$status" "$label" "${detail//|/\\|}" >> "$REPORT"
  case "$status" in
    PASS) PASS=$((PASS + 1)) ;;
    WARN) WARN=$((WARN + 1)) ;;
    FAIL) FAIL=$((FAIL + 1)) ;;
  esac
}

finalize_report() {
  [ "$FINALIZED" -eq 1 ] && return 0
  FINALIZED=1
  cat >> "$REPORT" <<EOF

## Result

- PASS: $PASS
- WARN: $WARN
- FAIL: $FAIL
EOF
}

on_interrupt() {
  printf '\n[architect-verify] interrupted during: %s\n' "$CURRENT_CHECK" >&2
  record WARN "verification interrupted" "$CURRENT_CHECK"
  finalize_report
  printf '[architect-verify] partial report: %s\n' "$REPORT" >&2
  exit 130
}

trap on_interrupt INT TERM

run_check() {
  local label="$1"; shift
  local slug log rc summary
  CURRENT_CHECK="$label"
  slug="$(printf '%s' "$label" | tr '[:upper:] /' '[:lower:]--' | tr -cd 'a-z0-9._-')"
  log="$LOG_DIR/$slug.log"

  printf '\n[architect-verify] START %s\n' "$label"
  "$@" 2>&1 | tee "$log"
  rc=${PIPESTATUS[0]}

  summary="$(tail -n 40 "$log" | tr '\n' '; ')"
  if [ "$rc" -eq 0 ]; then
    record PASS "$label" "$summary"
    printf '[architect-verify] PASS  %s\n' "$label"
  else
    record FAIL "$label" "exit=$rc; $summary"
    printf '[architect-verify] FAIL  %s (exit=%s)\n' "$label" "$rc" >&2
  fi
  CURRENT_CHECK="idle"
  return 0
}

cat > "$REPORT" <<EOF
# Arcanum Mobile Verification Report

- Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)
- Repository root: $ROOT
- Device environment: ${TERMUX_VERSION:+Termux $TERMUX_VERSION}${TERMUX_VERSION:-unknown}
- Detailed logs: $LOG_DIR

| Status | Check | Evidence |
|---|---|---|
EOF

for cmd in git node npm pnpm python bash jq; do
  if command -v "$cmd" >/dev/null 2>&1; then
    record PASS "command:$cmd" "$(command -v "$cmd")"
  else
    record FAIL "command:$cmd" "not found"
  fi
done

if git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  BRANCH="$(git -C "$ROOT" branch --show-current)"
  HEAD="$(git -C "$ROOT" rev-parse HEAD)"
  record PASS "git repository" "$HEAD"
  if [ "$BRANCH" = "mobile" ]; then
    record PASS "integration branch" "$BRANCH"
  else
    record WARN "integration branch" "expected mobile; found ${BRANCH:-detached}"
  fi

  if [ -z "$(git -C "$ROOT" status --porcelain)" ]; then
    record PASS "working tree" "clean"
  else
    record WARN "working tree" "local changes present"
  fi
else
  record FAIL "git repository" "not inside a Git worktree"
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || true)"
if [ "$NODE_MAJOR" = "20" ]; then
  record PASS "Node engine" "$(node --version) matches apps/web package engine 20.x"
elif [ -n "$NODE_MAJOR" ]; then
  record WARN "Node engine" "$(node --version); apps/web declares 20.x"
fi

if [ -f "$ROOT/pnpm-lock.yaml" ]; then
  record PASS "pnpm lockfile" "present"
else
  record WARN "pnpm lockfile" "missing at repository root"
fi

if [ "${ARCANUM_SKIP_INSTALL:-0}" = "1" ]; then
  record WARN "dependency install" "skipped by ARCANUM_SKIP_INSTALL=1"
else
  run_check "pnpm install" pnpm -C "$ROOT" install --frozen-lockfile --ignore-scripts
fi

run_check "web typecheck" pnpm -C "$ROOT/apps/web" typecheck

if [ "${ARCANUM_SKIP_BUILD:-0}" = "1" ]; then
  record WARN "web build" "skipped by ARCANUM_SKIP_BUILD=1"
else
  run_check "web build" pnpm -C "$ROOT/apps/web" build
fi

if [ -x "$ROOT/scripts/verify-sync.sh" ]; then
  run_check "repository sync" bash "$ROOT/scripts/verify-sync.sh"
else
  record WARN "repository sync" "scripts/verify-sync.sh missing or not executable"
fi

finalize_report

printf '\nVerification report: %s\n' "$REPORT"
cat "$REPORT"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
