#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
RUNNER="$ROOT/scripts/architect/agent-run.py"
REGISTRY="$ROOT/docs/governance/architectgpt/agent-registry.yaml"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

REMOTE="$TMP/origin.git"
WORK="$TMP/work"
git init --bare -q "$REMOTE"
git clone -q "$REMOTE" "$WORK"
cd "$WORK"
git config user.email architect@example.invalid
git config user.name "Architect Fixture"
git switch -q -c mobile
mkdir -p docs/governance/architectgpt scripts/architect
cp "$REGISTRY" docs/governance/architectgpt/agent-registry.yaml
cp "$RUNNER" scripts/architect/agent-run.py
git add .
git commit -qm "fixture base"
git push -qu origin mobile
git remote set-head origin mobile
HEAD_SHA="$(git rev-parse HEAD)"

make_request() {
  local output="$1"
  local agent="$2"
  local permission="$3"
  local tools_json="$4"
  local task="$5"
  local authorization="${6:-explicit_human_request}"
  python3 - "$output" "$HEAD_SHA" "$agent" "$permission" "$tools_json" "$task" "$authorization" <<'PY'
import hashlib, json, sys
path, commit, agent, permission, tools, task, authorization = sys.argv[1:]
value = {
    "schema_version": "1.0",
    "record_type": "agent_invocation_request",
    "repository": "https://github.com/The-Architect-369/Arcanum.git",
    "branch": "mobile",
    "commit": commit,
    "agent_id": agent,
    "requested_permission_class": permission,
    "requested_tools": json.loads(tools),
    "task": task,
    "authorization": authorization,
}
payload = json.dumps(value, sort_keys=True, separators=(",", ":")).encode()
value["request_sha256"] = hashlib.sha256(payload).hexdigest()
with open(path, "w", encoding="utf-8") as handle:
    json.dump(value, handle, indent=2)
    handle.write("\n")
PY
}

expect_fail() {
  local label="$1"
  shift
  if "$@" >"$TMP/out" 2>"$TMP/err"; then
    echo "expected failure: $label" >&2
    exit 1
  fi
}

make_request "$TMP/valid.json" repository_architect R1 '["repository.read","impact_graph.generate"]' "Assess the bounded impact of adding an Arcanum MCP read gateway."
python3 scripts/architect/agent-run.py "$TMP/valid.json" >"$TMP/a.json"
python3 scripts/architect/agent-run.py "$TMP/valid.json" >"$TMP/b.json"
cmp "$TMP/a.json" "$TMP/b.json"
python3 - "$TMP/a.json" "$HEAD_SHA" <<'PY'
import hashlib, json, sys
path, commit = sys.argv[1:]
value = json.load(open(path, encoding="utf-8"))
assert value["commit"] == commit
assert value["agent_id"] == "repository_architect"
assert value["mode"] == "plan_only"
assert value["status"] == "ready"
assert value["tools_executed"] is False
assert value["external_writes_performed"] is False
assert value["authority"] == "evidentiary_only"
claimed = value.pop("attestation_sha256")
actual = hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
assert claimed == actual
PY

for agent in canon_guardian product_steward security_sentinel verification_oracle release_steward; do
  case "$agent" in
    canon_guardian) tools='["canon.read"]' ;;
    product_steward) tools='["roadmap.read"]' ;;
    security_sentinel) tools='["threat_model.generate"]' ;;
    verification_oracle) tools='["evidence.read"]' ;;
    release_steward) tools='["release_context.read"]' ;;
  esac
  make_request "$TMP/$agent.json" "$agent" R1 "$tools" "Validate canonical fixture for $agent."
  python3 scripts/architect/agent-run.py "$TMP/$agent.json" >/dev/null
done

make_request "$TMP/unknown.json" unknown_agent R1 '["repository.read"]' "Unknown agent"
expect_fail unknown-agent python3 scripts/architect/agent-run.py "$TMP/unknown.json"

make_request "$TMP/escalation.json" repository_architect W1 '["repository.read"]' "Escalation"
expect_fail permission-escalation python3 scripts/architect/agent-run.py "$TMP/escalation.json"

make_request "$TMP/tool.json" repository_architect R1 '["repository.write"]' "Unlisted tool"
expect_fail unlisted-tool python3 scripts/architect/agent-run.py "$TMP/tool.json"

make_request "$TMP/noauth.json" repository_architect R1 '["repository.read"]' "Missing authorization" denied
expect_fail missing-authorization python3 scripts/architect/agent-run.py "$TMP/noauth.json"

make_request "$TMP/duplicate.json" repository_architect R1 '["repository.read","repository.read"]' "Duplicate tools"
expect_fail duplicate-tools python3 scripts/architect/agent-run.py "$TMP/duplicate.json"

make_request "$TMP/empty.json" repository_architect R1 '["repository.read"]' "   "
expect_fail empty-task python3 scripts/architect/agent-run.py "$TMP/empty.json"

cp "$TMP/valid.json" "$TMP/tampered.json"
python3 - "$TMP/tampered.json" <<'PY'
import json, sys
path = sys.argv[1]
value = json.load(open(path, encoding="utf-8"))
value["task"] = "tampered after digest"
json.dump(value, open(path, "w", encoding="utf-8"), indent=2)
PY
expect_fail tampered-digest python3 scripts/architect/agent-run.py "$TMP/tampered.json"

cp "$TMP/valid.json" "$TMP/stale.json"
python3 - "$TMP/stale.json" <<'PY'
import hashlib, json, sys
path = sys.argv[1]
value = json.load(open(path, encoding="utf-8"))
value["commit"] = "0" * 40
value.pop("request_sha256")
value["request_sha256"] = hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
json.dump(value, open(path, "w", encoding="utf-8"), indent=2)
PY
expect_fail stale-commit python3 scripts/architect/agent-run.py "$TMP/stale.json"

touch dirty.txt
expect_fail dirty-checkout python3 scripts/architect/agent-run.py "$TMP/valid.json"
rm dirty.txt

git switch -q -c wrong-branch
expect_fail wrong-branch python3 scripts/architect/agent-run.py "$TMP/valid.json"
git switch -q mobile

BEFORE_HEAD="$(git rev-parse HEAD)"
BEFORE_REFS="$(git show-ref | sort)"
python3 scripts/architect/agent-run.py "$TMP/valid.json" >/dev/null
AFTER_HEAD="$(git rev-parse HEAD)"
AFTER_REFS="$(git show-ref | sort)"
[[ "$BEFORE_HEAD" == "$AFTER_HEAD" ]]
[[ "$BEFORE_REFS" == "$AFTER_REFS" ]]
[[ -z "$(git status --porcelain)" ]]

echo "Agent invocation fixtures passed"
