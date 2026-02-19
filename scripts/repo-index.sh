#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(git rev-parse --show-toplevel)
cd "$ROOT_DIR"

OUTPUT="docs/architect/repo-index.json"
THRESHOLD_EMPTY=5

command -v jq >/dev/null || { echo "jq is required"; exit 1; }

commit=$(git rev-parse --short HEAD)
now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
repo=$(git config --get remote.origin.url | sed 's#.*/##; s#\.git##')

files_json=$(
  git ls-files -z | while IFS= read -r -d '' file; do
    # Skip tracked paths that don’t exist in the working tree (mid-move / unstaged / sparse checkout)
    if [[ ! -e "$file" ]]; then
      echo "⚠️  Skipping missing tracked path: $file" >&2
      continue
    fi

    size=$(stat -c%s "$file")
    last_commit=$(git log -1 --pretty=format:%h -- "$file")
    is_empty=false
    [[ "$size" -le "$THRESHOLD_EMPTY" ]] && is_empty=true

    # Extension (safe)
    ext=""
    if [[ "$file" == *.* ]]; then
      ext=".${file##*.}"
    fi

    # Lines (safe)
    lines=$(wc -l < "$file" | tr -d ' ')

    jq -n \
      --arg path "$file" \
      --arg type "file" \
      --arg last "$last_commit" \
      --arg ext "$ext" \
      --argjson size "$size" \
      --argjson lines "$lines" \
      --argjson empty "$is_empty" \
      '{path:$path,type:$type,size_bytes:$size,last_modified_commit:$last,is_empty:$empty,extension:$ext,lines:$lines}'
  done | jq -s 'sort_by(.path)'
)

mkdir -p "$(dirname "$OUTPUT")"

jq -n \
  --arg now "$now" \
  --arg commit "$commit" \
  --arg repo "$repo" \
  --argjson files "$files_json" \
  '{generated_at:$now,repo:$repo,commit:$commit,generator_version:"1.1",files:$files}' \
  > "$OUTPUT"

echo "📘 REPO_INDEX written to $OUTPUT"
