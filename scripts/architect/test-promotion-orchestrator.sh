#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
ORCHESTRATOR="$ROOT/scripts/architect/promotion-orchestrator.py"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

REMOTE="$TMP/origin.git"
WORK="$TMP/work"
git init --bare -q "$REMOTE"
git clone -q "$REMOTE" "$WORK"
cd "$WORK"
git config user.email architect@example.invalid
git config user.name "Architect Fixture"
git switch -q -c main
mkdir -p scripts/architect .architect-reports/orchestration/promotions
cp "$ORCHESTRATOR" scripts/architect/promotion-orchestrator.py
echo base > README.md
git add .
git commit -qm "base"
git push -qu origin main
git switch -q -c mobile
echo wave > wave.txt
git add wave.txt
git commit -qm "wave"
git push -qu origin mobile
git fetch -q origin main mobile
HEAD_SHA="$(git rev-parse HEAD)"

cat > "$TMP/promotion.json" <<EOF
{"schema_version":"1.0","record_type":"promotion_attestation","repository":"https://github.com/The-Architect-369/Arcanum.git","branch":"mobile","commit":"$HEAD_SHA","wave":"wave-xviii-a","status":"ready","checks":{"working_tree":"clean","remote_sync":"pass","evidence":"pass","repository_integrity":"pass","typecheck":"pass","build":"pass","termux_failures":0},"exact_report":"fixture","build_report":"fixture","build_commit":"$HEAD_SHA"}
EOF

python3 scripts/architect/promotion-orchestrator.py wave-xviii-a \
  --promotion-attestation "$TMP/promotion.json" \
  --state "$TMP/state.json" > "$TMP/out.json"

python3 - "$TMP/state.json" "$HEAD_SHA" <<'PY'
import hashlib, json, sys
path, head = sys.argv[1:]
value = json.load(open(path, encoding="utf-8"))
assert value["expected_head_sha"] == head
assert value["stage"] == "promotion_attestation"
assert value["status"] == "in_progress"
assert value["authorization"]["merge_performed"] is False
assert "merge" in value["effects"]["forbidden_before_w3"]
claimed = value.pop("state_sha256")
actual = hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
assert claimed == actual
PY

cp "$TMP/state.json" "$TMP/first.json"
python3 scripts/architect/promotion-orchestrator.py wave-xviii-a \
  --promotion-attestation "$TMP/promotion.json" \
  --state "$TMP/state.json" >/dev/null
cmp "$TMP/first.json" "$TMP/state.json"

expect_fail() {
  local label="$1"
  shift
  if "$@" >"$TMP/stdout" 2>"$TMP/stderr"; then
    echo "expected failure: $label" >&2
    exit 1
  fi
}

touch dirty.txt
expect_fail dirty-checkout python3 scripts/architect/promotion-orchestrator.py wave-xviii-a --state "$TMP/dirty.json"
rm dirty.txt

git switch -q main
expect_fail wrong-branch python3 scripts/architect/promotion-orchestrator.py wave-xviii-a --state "$TMP/wrong.json"
git switch -q mobile

cp "$TMP/promotion.json" "$TMP/stale-promotion.json"
python3 - "$TMP/stale-promotion.json" <<'PY'
import json, sys
path = sys.argv[1]
value = json.load(open(path, encoding="utf-8"))
value["commit"] = "0" * 40
json.dump(value, open(path, "w", encoding="utf-8"))
PY
expect_fail stale-evidence python3 scripts/architect/promotion-orchestrator.py wave-xviii-a --promotion-attestation "$TMP/stale-promotion.json" --state "$TMP/stale.json"

cp "$TMP/state.json" "$TMP/tampered.json"
python3 - "$TMP/tampered.json" <<'PY'
import json, sys
path = sys.argv[1]
value = json.load(open(path, encoding="utf-8"))
value["stage"] = "ready_for_w3"
json.dump(value, open(path, "w", encoding="utf-8"))
PY
expect_fail tampered-state python3 scripts/architect/promotion-orchestrator.py wave-xviii-a --promotion-attestation "$TMP/promotion.json" --state "$TMP/tampered.json"

BEFORE_HEAD="$(git rev-parse HEAD)"
BEFORE_REFS="$(git show-ref | sort)"
python3 scripts/architect/promotion-orchestrator.py wave-xviii-a \
  --promotion-attestation "$TMP/promotion.json" \
  --state "$TMP/final.json" >/dev/null
[[ "$BEFORE_HEAD" == "$(git rev-parse HEAD)" ]]
[[ "$BEFORE_REFS" == "$(git show-ref | sort)" ]]
[[ -z "$(git status --porcelain)" ]]

echo "Promotion orchestrator fixtures passed"
