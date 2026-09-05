#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
REPORT_ROOT="$ROOT/.architect-reports/orchestration"
MANIFEST="$ROOT/docs/governance/architectgpt/architect-gpt-manifest.yaml"
INDEX="$ROOT/docs/repo/repo-index.json"
SCHEMA="$ROOT/docs/governance/architectgpt/execution-record.schema.json"
VALIDATOR="$ROOT/scripts/architect/validate-evidence.py"
EXECUTION_LOG="$REPORT_ROOT/execution.jsonl"
EVIDENCE_LOG="$REPORT_ROOT/provider-evidence.jsonl"
mkdir -p "$REPORT_ROOT"

usage() {
  cat <<'EOF'
Architect GPT 4.0 orchestration control

Usage:
  bash scripts/architect/orchestrate.sh preflight
  bash scripts/architect/orchestrate.sh session [task-label]
  bash scripts/architect/orchestrate.sh record <permission-class> <status> <summary>
  bash scripts/architect/orchestrate.sh evidence <provider> <status> <reference> <summary>
  bash scripts/architect/orchestrate.sh validate
  bash scripts/architect/orchestrate.sh migrate

This utility records local evidence. It does not grant write, merge, deploy, rollback,
or ratification authority.
EOF
}

have() { command -v "$1" >/dev/null 2>&1; }

yaml_value() {
  local key="$1" file="$2"
  awk -F': *' -v key="$key" '$1 == key {print $2; exit}' "$file" | tr -d '"\r'
}

provider_status() {
  local provider="$1"
  awk -v provider="$provider" '
    $0 ~ "^  " provider ":$" {inside=1; next}
    inside && /^  [a-zA-Z0-9_]+:$/ {exit}
    inside && /^    status:/ {sub(/^    status:[[:space:]]*/, ""); print; exit}
  ' "$MANIFEST"
}

repo_url() { git -C "$ROOT" config --get remote.origin.url 2>/dev/null || echo unknown; }
branch_name() { git -C "$ROOT" branch --show-current 2>/dev/null || echo detached; }
head_sha() { git -C "$ROOT" rev-parse HEAD 2>/dev/null || echo unknown; }

migrate_logs() {
  python3 "$VALIDATOR" --migrate "$EXECUTION_LOG"
  python3 "$VALIDATOR" --migrate "$EVIDENCE_LOG"
}

validate_logs() {
  python3 "$VALIDATOR" "$EXECUTION_LOG"
  python3 "$VALIDATOR" "$EVIDENCE_LOG"
}

preflight() {
  local fail=0 warn=0
  printf '== Architect GPT 4.0 preflight ==\n'
  printf 'Root: %s\n' "$ROOT"
  printf 'Branch: %s\n' "$(branch_name)"
  printf 'Commit: %s\n\n' "$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo unknown)"

  for cmd in git bash python3 jq node pnpm; do
    if have "$cmd"; then
      printf 'PASS command:%s -> %s\n' "$cmd" "$(command -v "$cmd")"
    else
      printf 'FAIL command:%s missing\n' "$cmd"
      fail=$((fail+1))
    fi
  done

  for file in "$MANIFEST" "$INDEX" "$SCHEMA" "$VALIDATOR"; do
    if [[ -f "$file" ]]; then
      printf 'PASS file:%s\n' "${file#$ROOT/}"
    else
      printf 'FAIL file:%s missing\n' "${file#$ROOT/}"
      fail=$((fail+1))
    fi
  done

  if have gh && gh auth status -h github.com >/dev/null 2>&1; then
    printf 'PASS provider:github authenticated as %s\n' "$(gh api user --jq .login 2>/dev/null || echo unknown)"
  else
    printf 'WARN provider:github local CLI not authenticated\n'
    warn=$((warn+1))
  fi

  for provider in github vercel google_workspace notion web local_termux; do
    printf 'INFO provider:%s manifest=%s\n' "$provider" "$(provider_status "$provider")"
  done

  if migrate_logs >/dev/null && validate_logs; then
    printf 'PASS evidence:local-jsonl\n'
  else
    printf 'FAIL evidence:local-jsonl\n'
    fail=$((fail+1))
  fi

  if bash "$ROOT/scripts/verify-sync.sh"; then
    printf 'PASS policy:verify-sync\n'
  else
    printf 'FAIL policy:verify-sync\n'
    fail=$((fail+1))
  fi

  printf '\nResult: FAIL=%s WARN=%s\n' "$fail" "$warn"
  [[ "$fail" -eq 0 ]]
}

session_report() {
  local label="${1:-interactive-session}"
  local stamp report branch head index_commit index_generated role
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  report="$REPORT_ROOT/session-$stamp.md"
  branch="$(branch_name)"
  head="$(head_sha)"
  index_commit="$(jq -r '.commit // "unknown"' "$INDEX" 2>/dev/null || echo unknown)"
  index_generated="$(jq -r '.generated_at // "unknown"' "$INDEX" 2>/dev/null || echo unknown)"

  if [[ "$branch" == "main" ]]; then
    role="canonical"
  elif [[ "$branch" == "detached" || -z "$branch" ]]; then
    role="detached"
  else
    role="disposable-work"
  fi

  cat > "$report" <<EOF
# Architect GPT Session Grounding

- Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)
- Task: $label
- Repository: $(repo_url)
- Branch: $branch
- Branch role: $role
- HEAD: $head
- Working tree: $([[ -z "$(git -C "$ROOT" status --porcelain 2>/dev/null)" ]] && echo clean || echo modified)
- Architect GPT version: $(yaml_value version "$MANIFEST")
- Phase: $(yaml_value phase "$MANIFEST")
- Wave: $(yaml_value wave "$MANIFEST")
- Repo index commit: $index_commit
- Repo index generated: $index_generated
- Execution evidence: $EXECUTION_LOG
- Provider evidence: $EVIDENCE_LOG

## Provider Registry

- GitHub: $(provider_status github)
- Vercel: $(provider_status vercel)
- Google Workspace: $(provider_status google_workspace)
- Notion: $(provider_status notion)
- Web: $(provider_status web)
- Local Termux: $(provider_status local_termux)

## Authority Boundary

main is the sole persistent canonical branch. Any non-main branch is a candidate
work surface only. Provider observations and local reports are evidence; they do
not override doctrine, ratified canon, or Human Architect authorization.
EOF

  printf '%s\n' "$report"
  cat "$report"
}

append_and_validate() {
  local log="$1" record="$2" tmp
  tmp="$(mktemp)"
  printf '%s\n' "$record" > "$tmp"
  python3 "$VALIDATOR" "$tmp" >/dev/null
  printf '%s\n' "$record" >> "$log"
  rm -f "$tmp"
}

record_execution() {
  [[ "$#" -ge 3 ]] || { usage >&2; exit 2; }
  local permission="$1" status="$2"; shift 2
  local summary="$*" record
  record="$(jq -cn \
    --arg schema_version "1.0" \
    --arg record_type "execution" \
    --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg repository "$(repo_url)" \
    --arg branch "$(branch_name)" \
    --arg commit "$(head_sha)" \
    --arg permission_class "$permission" \
    --arg status "$status" \
    --arg summary "$summary" \
    '{schema_version:$schema_version,record_type:$record_type,timestamp:$timestamp,repository:$repository,branch:$branch,commit:$commit,permission_class:$permission_class,status:$status,summary:$summary}')"
  append_and_validate "$EXECUTION_LOG" "$record"
  printf '%s\n' "$record"
}

record_evidence() {
  [[ "$#" -ge 4 ]] || { usage >&2; exit 2; }
  local provider="$1" status="$2" reference="$3"; shift 3
  local summary="$*" record
  record="$(jq -cn \
    --arg schema_version "1.0" \
    --arg record_type "provider_evidence" \
    --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg repository "$(repo_url)" \
    --arg branch "$(branch_name)" \
    --arg commit "$(head_sha)" \
    --arg provider "$provider" \
    --arg status "$status" \
    --arg reference "$reference" \
    --arg summary "$summary" \
    '{schema_version:$schema_version,record_type:$record_type,timestamp:$timestamp,repository:$repository,branch:$branch,commit:$commit,provider:$provider,status:$status,reference:$reference,summary:$summary}')"
  append_and_validate "$EVIDENCE_LOG" "$record"
  printf '%s\n' "$record"
}

case "${1:-}" in
  preflight) preflight ;;
  session) shift; session_report "${1:-interactive-session}" ;;
  record) shift; record_execution "$@" ;;
  evidence) shift; record_evidence "$@" ;;
  validate) validate_logs ;;
  migrate) migrate_logs ;;
  *) usage; exit 2 ;;
esac
