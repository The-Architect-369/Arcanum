
---

## `scripts/repo-index.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

# Deterministic structural snapshot generator.
# Output: docs/repo/repo-index.json

ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

OUT_DIR="docs/repo"
OUT_FILE="${OUT_DIR}/repo-index.json"
TMP_FILE="${OUT_FILE}.tmp"

GENERATOR_VERSION="1.0"
EMPTY_THRESHOLD_BYTES=5

mkdir -p "$OUT_DIR"

commit="$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")"
now="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
repo_slug="The-Architect-369/Arcanum"

# Prefer jq if present; fall back to python3.
has_jq=false
if command -v jq >/dev/null 2>&1; then
  has_jq=true
fi

# Build file list JSON lines (stable ordering via git ls-files).
# We do not index ignored/untracked files.
if $has_jq; then
  files_json="$(
    git ls-files -z | while IFS= read -r -d '' path; do
      # Basic stats
      size_bytes="$(stat -c%s "$path" 2>/dev/null || echo 0)"
      # Best-effort last modified commit for this path
      last_commit="$(git log -1 --pretty=format:%h -- "$path" 2>/dev/null || echo "unknown")"
      # Extension
      ext=""
      base="${path##*/}"
      if [[ "$base" == *.* ]]; then
        ext=".${base##*.}"
      fi
      # Line count (best effort; binary files may fail)
      lines=0
      if [[ "$ext" == ".md" || "$ext" == ".ts" || "$ext" == ".tsx" || "$ext" == ".js" || "$ext" == ".json" || "$ext" == ".yml" || "$ext" == ".yaml" || "$ext" == ".go" || "$ext" == ".proto" || "$ext" == ".sh" ]]; then
        lines="$(wc -l < "$path" 2>/dev/null | tr -d ' ' || echo 0)"
      fi

      is_empty=false
      if [[ "$size_bytes" -le "$EMPTY_THRESHOLD_BYTES" ]]; then
        is_empty=true
      fi

      printf '{"path":"%s","type":"file","size_bytes":%s,"last_modified_commit":"%s","is_empty":%s,"extension":"%s","lines":%s}\n' \
        "$path" "$size_bytes" "$last_commit" "$is_empty" "$ext" "$lines"
    done | jq -s 'sort_by(.path)'
  )"

  jq -n \
    --arg generated_at "$now" \
    --arg repo "$repo_slug" \
    --arg commit "$commit" \
    --arg generator_version "$GENERATOR_VERSION" \
    --argjson files "$files_json" \
    '{generated_at:$generated_at,repo:$repo,commit:$commit,generator_version:$generator_version,files:$files}' \
    > "$TMP_FILE"
else
  python3 - <<'PY' > "$TMP_FILE"
import json, os, subprocess, sys, datetime

GENERATOR_VERSION="1.0"
EMPTY_THRESHOLD_BYTES=5
repo_slug="The-Architect-369/Arcanum"

def run(cmd):
  return subprocess.check_output(cmd, stderr=subprocess.DEVNULL).decode("utf-8", "replace")

try:
  commit = run(["git","rev-parse","--short","HEAD"]).strip()
except Exception:
  commit = "unknown"

now = datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"

# Stable ordering from git ls-files
raw = subprocess.check_output(["git","ls-files","-z"])
paths = [p.decode("utf-8", "replace") for p in raw.split(b"\x00") if p]

files = []
for path in paths:
  try:
    size_bytes = os.stat(path).st_size
  except Exception:
    size_bytes = 0
  try:
    last_commit = run(["git","log","-1","--pretty=format:%h","--",path]).strip() or "unknown"
  except Exception:
    last_commit = "unknown"

  base = os.path.basename(path)
  ext = ""
  if "." in base:
    ext = "." + base.rsplit(".",1)[-1]

  lines = 0
  if ext in {".md",".ts",".tsx",".js",".json",".yml",".yaml",".go",".proto",".sh"}:
    try:
      with open(path, "rb") as f:
        lines = sum(1 for _ in f)
    except Exception:
      lines = 0

  is_empty = size_bytes <= EMPTY_THRESHOLD_BYTES

  files.append({
    "path": path,
    "type": "file",
    "size_bytes": int(size_bytes),
    "last_modified_commit": last_commit,
    "is_empty": bool(is_empty),
    "extension": ext,
    "lines": int(lines),
  })

files.sort(key=lambda x: x["path"])

doc = {
  "generated_at": now,
  "repo": repo_slug,
  "commit": commit,
  "generator_version": GENERATOR_VERSION,
  "files": files,
}

json.dump(doc, sys.stdout, indent=2, sort_keys=False)
sys.stdout.write("\n")
PY
fi

# Atomic replace
mv "$TMP_FILE" "$OUT_FILE"
echo "✅ repo index generated: $OUT_FILE"