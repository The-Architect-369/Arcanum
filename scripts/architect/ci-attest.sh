#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$ROOT" ]] || { echo "FAIL not inside a git repository" >&2; exit 1; }
cd "$ROOT"

OUTPUT="${1:-.architect-reports/ci/promotion-attestation.json}"
WAVE="${ARCANUM_WAVE:-unspecified}"
EVENT="${GITHUB_EVENT_NAME:-local}"
RUN_ID="${GITHUB_RUN_ID:-local}"
RUN_ATTEMPT="${GITHUB_RUN_ATTEMPT:-1}"
REPOSITORY="${GITHUB_REPOSITORY:-$(git config --get remote.origin.url 2>/dev/null || echo unknown)}"
BRANCH="${GITHUB_HEAD_REF:-${GITHUB_REF_NAME:-$(git branch --show-current 2>/dev/null || echo unknown)}}"
COMMIT="${GITHUB_SHA:-$(git rev-parse HEAD)}"

for result in "${ARCANUM_VERIFY_SYNC_RESULT:-}" "${ARCANUM_TYPECHECK_RESULT:-}" "${ARCANUM_BUILD_RESULT:-}"; do
  [[ "$result" == "success" ]] || {
    echo "FAIL CI attestation requires successful verify-sync, typecheck, and build results" >&2
    exit 1
  }
done

[[ "$COMMIT" =~ ^[0-9a-f]{40}$ ]] || {
  echo "FAIL CI attestation commit must be a full lowercase SHA" >&2
  exit 1
}

mkdir -p "$(dirname "$OUTPUT")"

jq -n \
  --arg schema_version "1.0" \
  --arg record_type "ci_promotion_attestation" \
  --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg repository "$REPOSITORY" \
  --arg branch "$BRANCH" \
  --arg commit "$COMMIT" \
  --arg wave "$WAVE" \
  --arg event "$EVENT" \
  --arg run_id "$RUN_ID" \
  --arg run_attempt "$RUN_ATTEMPT" \
  '{schema_version:$schema_version,record_type:$record_type,timestamp:$timestamp,repository:$repository,branch:$branch,commit:$commit,wave:$wave,status:"ready",source:"github_actions",workflow:{event:$event,run_id:$run_id,run_attempt:$run_attempt},checks:{repository_integrity:"pass",typecheck:"pass",production_build:"pass"}}' \
  > "$OUTPUT"

jq empty "$OUTPUT"
printf 'CI promotion attestation: %s\n' "$OUTPUT"
cat "$OUTPUT"
