#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
EXECUTOR="$ROOT/scripts/architect/post-merge-close.py"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

pass=0
fail=0

ok() {
  printf 'PASS %s\n' "$1"
  pass=$((pass + 1))
}

bad() {
  printf 'FAIL %s\n' "$1" >&2
  fail=$((fail + 1))
}

expect_success() {
  local name="$1"
  shift
  if "$@" >"$TMP/out" 2>"$TMP/err"; then
    ok "$name"
  else
    cat "$TMP/out" "$TMP/err" >&2 || true
    bad "$name"
  fi
}

expect_failure() {
  local name="$1"
  shift
  if "$@" >"$TMP/out" 2>"$TMP/err"; then
    cat "$TMP/out" "$TMP/err" >&2 || true
    bad "$name"
  else
    ok "$name"
  fi
}

REMOTE="$TMP/remote.git"
WORK="$TMP/work"
REQUEST="$TMP/request.json"
git init --bare "$REMOTE" >/dev/null
git init -b main "$WORK" >/dev/null
(
  cd "$WORK"
  git config user.name "Fixture"
  git config user.email "fixture@example.invalid"
  printf 'base\n' > README.md
  git add README.md
  git commit -m base >/dev/null
  BASE="$(git rev-parse HEAD)"
  git remote add origin "$REMOTE"
  git push -u origin main >/dev/null
  git branch mobile "$BASE"
  git push origin mobile >/dev/null
  printf 'release\n' >> README.md
  git commit -am release >/dev/null
  MERGE="$(git rev-parse HEAD)"
  git push origin main >/dev/null
  git switch mobile >/dev/null
  git fetch origin >/dev/null
  cat > "$REQUEST" <<JSON
{
  "schema_version": "1.0",
  "repository": "https://github.com/The-Architect-369/Arcanum.git",
  "wave": "wave-fixture",
  "pull_request_number": 99,
  "base_branch": "main",
  "integration_branch": "mobile",
  "merge_commit": "$MERGE",
  "expected_mobile_commit": "$BASE",
  "production": {
    "provider": "vercel",
    "deployment_id": "dpl_fixture",
    "url": "fixture.vercel.app",
    "state": "READY",
    "commit": "$MERGE"
  },
  "requested_effect": "origin_mobile_fast_forward"
}
JSON
)

# The executor requires the canonical origin URL. Use a Git URL rewrite so the
# fixture remains local while origin reports the canonical identity.
git config --global --add url."$REMOTE".insteadOf https://github.com/The-Architect-369/Arcanum.git
trap 'git config --global --unset-all url."'"$REMOTE"'".insteadOf >/dev/null 2>&1 || true; rm -rf "$TMP"' EXIT
(
  cd "$WORK"
  git remote set-url origin https://github.com/The-Architect-369/Arcanum.git
)

expect_success "dry-run accepts exact production-bound fast-forward" \
  bash -c "cd '$WORK' && python3 '$EXECUTOR' '$REQUEST'"

DIGEST="$(cd "$WORK" && python3 "$EXECUTOR" "$REQUEST" | sed -n 's/^Request SHA-256: //p')"
if [[ "$DIGEST" =~ ^[0-9a-f]{64}$ ]]; then
  ok "dry-run emits deterministic request digest"
else
  bad "dry-run emits deterministic request digest"
fi

expect_failure "apply rejects incorrect confirmation digest" \
  bash -c "cd '$WORK' && python3 '$EXECUTOR' '$REQUEST' --apply --confirm $(printf '0%.0s' {1..64})"

expect_success "apply fast-forwards only mobile" \
  bash -c "cd '$WORK' && python3 '$EXECUTOR' '$REQUEST' --apply --confirm '$DIGEST'"

MAIN="$(git --git-dir="$REMOTE" rev-parse refs/heads/main)"
MOBILE="$(git --git-dir="$REMOTE" rev-parse refs/heads/mobile)"
if [ "$MAIN" = "$MOBILE" ]; then
  ok "remote main and mobile converge"
else
  bad "remote main and mobile converge"
fi

python3 - "$WORK/request.json" <<'PY'
import json
import sys
from pathlib import Path
path = Path(sys.argv[1])
data = json.loads(path.read_text())
data["expected_mobile_commit"] = data["merge_commit"]
path.write_text(json.dumps(data, indent=2) + "\n")
PY
DIGEST2="$(cd "$WORK" && python3 "$EXECUTOR" "$REQUEST" | sed -n 's/^Request SHA-256: //p')"
expect_success "apply is idempotent when branches are synchronized" \
  bash -c "cd '$WORK' && python3 '$EXECUTOR' '$REQUEST' --apply --confirm '$DIGEST2'"

python3 - "$WORK/request.json" <<'PY'
import json
import sys
from pathlib import Path
path = Path(sys.argv[1])
data = json.loads(path.read_text())
data["production"]["state"] = "ERROR"
path.write_text(json.dumps(data, indent=2) + "\n")
PY
expect_failure "non-READY production evidence is rejected" \
  bash -c "cd '$WORK' && python3 '$EXECUTOR' '$REQUEST'"

printf '\nResult: PASS=%d FAIL=%d\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
