#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
REPORT_ROOT="$ROOT/.architect-reports/orchestration"
MANIFEST="$ROOT/docs/governance/architectgpt/architect-gpt-manifest.yaml"
REGISTRY="$ROOT/docs/governance/architectgpt/capability-registry.yaml"
INDEX="$ROOT/docs/repo/repo-index.json"
mkdir -p "$REPORT_ROOT"

usage() {
  cat <<'EOF'
Architect GPT orchestration control

Usage:
  bash scripts/architect/orchestrate.sh preflight
  bash scripts/architect/orchestrate.sh session [task-label]
  bash scripts/architect/orchestrate.sh record <permission-class> <status> <summary>

Commands:
  preflight  Validate local tooling, repository grounding, provider access, and policy files.
  session    Create a Markdown grounding report for the current repository state.
  record     Append a JSONL execution record under .architect-reports/orchestration/.
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
  ' "$REGISTRY"
}

preflight() {
  local fail=0 warn=0
  printf '== Architect GPT preflight ==\n'
  printf 'Root: %s\n' "$ROOT"
  printf 'Branch: %s\n' "$(git -C "$ROOT" branch --show-current 2>/dev/null || echo unknown)"
  printf 'Commit: %s\n\n' "$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo unknown)"

  for cmd in git bash python3 jq node pnpm; do
    if have "$cmd"; then printf 'PASS command:%s -> %s\n' "$cmd" "$(command -v "$cmd")"; else printf 'FAIL command:%s missing\n' "$cmd"; fail=$((fail+1)); fi
  done

  for file in "$MANIFEST" "$REGISTRY" "$INDEX"; do
    if [[ -f "$file" ]]; then printf 'PASS file:%s\n' "${file#$ROOT/}"; else printf 'FAIL file:%s missing\n' "${file#$ROOT/}"; fail=$((fail+1)); fi
  done

  if have gh && gh auth status -h github.com >/dev/null 2>&1; then
    printf 'PASS provider:github authenticated as %s\n' "$(gh api user --jq .login 2>/dev/null || echo unknown)"
  else
    printf 'WARN provider:github local CLI not authenticated\n'; warn=$((warn+1))
  fi

  printf 'INFO provider:github registry=%s\n' "$(provider_status github)"
  printf 'INFO provider:vercel registry=%s\n' "$(provider_status vercel)"
  printf 'INFO provider:google_workspace registry=%s\n' "$(provider_status google_workspace)"

  if bash "$ROOT/scripts/verify-sync.sh"; then
    printf 'PASS policy:verify-sync\n'
  else
    printf 'FAIL policy:verify-sync\n'; fail=$((fail+1))
  fi

  printf '\nResult: FAIL=%s WARN=%s\n' "$fail" "$warn"
  [[ "$fail" -eq 0 ]]
}

session_report() {
  local label="${1:-interactive-session}"
  local stamp report branch head index_commit index_generated
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  report="$REPORT_ROOT/session-$stamp.md"
  branch="$(git -C "$ROOT" branch --show-current 2>/dev/null || echo unknown)"
  head="$(git -C "$ROOT" rev-parse HEAD 2>/dev/null || echo unknown)"
  index_commit="$(jq -r '.commit // "unknown"' "$INDEX" 2>/dev/null || echo unknown)"
  index_generated="$(jq -r '.generated_at // "unknown"' "$INDEX" 2>/dev/null || echo unknown)"

  cat > "$report" <<EOF
# Architect GPT Session Grounding

- Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)
- Task: $label
- Repository: $(git -C "$ROOT" config --get remote.origin.url 2>/dev/null || echo unknown)
- Branch: $branch
- Branch role: $([[ "$branch" == "main" ]] && echo stable || ([[ "$branch" == "mobile" ]] && echo integration || echo other))
- HEAD: $head
- Working tree: $([[ -z "$(git -C "$ROOT" status --porcelain 2>/dev/null)" ]] && echo clean || echo modified)
- Architect GPT version: $(yaml_value version "$MANIFEST")
- Phase: $(yaml_value phase "$MANIFEST")
- Repo index commit: $index_commit
- Repo index generated: $index_generated

## Provider Registry

- GitHub: $(provider_status github)
- Vercel: $(provider_status vercel)
- Google Workspace: $(provider_status google_workspace)
- Notion: $(provider_status notion)

## Authority Boundary

Connected workspace and deployment providers supply working context or observed state. They do not override repository canon, ratified governance, or doctrine.
EOF

  printf '%s\n' "$report"
  cat "$report"
}

record_execution() {
  [[ "$#" -ge 3 ]] || { usage >&2; exit 2; }
  local permission="$1" status="$2"; shift 2
  local summary="$*" log="$REPORT_ROOT/execution.jsonl"
  jq -cn \
    --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg repository "$(git -C "$ROOT" config --get remote.origin.url 2>/dev/null || echo unknown)" \
    --arg branch "$(git -C "$ROOT" branch --show-current 2>/dev/null || echo unknown)" \
    --arg commit "$(git -C "$ROOT" rev-parse HEAD 2>/dev/null || echo unknown)" \
    --arg permission_class "$permission" \
    --arg status "$status" \
    --arg summary "$summary" \
    '{timestamp:$timestamp,repository:$repository,branch:$branch,commit:$commit,permission_class:$permission_class,status:$status,summary:$summary}' >> "$log"
  tail -n 1 "$log"
}

case "${1:-}" in
  preflight) preflight ;;
  session) shift; session_report "${1:-interactive-session}" ;;
  record) shift; record_execution "$@" ;;
  *) usage; exit 2 ;;
esac
