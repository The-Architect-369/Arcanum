#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
EXECUTOR="$ROOT/scripts/architect/agent-execute.py"
SCHEMA="$ROOT/docs/governance/architectgpt/agent-execution.schema.json"

python3 -m py_compile "$EXECUTOR"
jq empty "$SCHEMA"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
REPO="$TMP/repo"
ORIGIN="$TMP/origin.git"
mkdir -p "$REPO"
git init -q --bare "$ORIGIN"
git -C "$REPO" init -q
git -C "$REPO" config user.name "Architect Fixture"
git -C "$REPO" config user.email "architect@example.invalid"
git -C "$REPO" switch -q -c mobile
mkdir -p "$REPO/docs/governance/architectgpt" "$REPO/scripts/architect"
cp "$EXECUTOR" "$REPO/scripts/architect/agent-execute.py"
cat > "$REPO/docs/governance/architectgpt/agent-registry.yaml" <<'JSON'
{
  "schema_version":"1.0",
  "registry_type":"architect_agent_registry",
  "default_policy":"deny",
  "permission_order":["R0","R1","W1","W2","W3","C1"],
  "agents":{
    "repository_architect":{
      "display_name":"Repository Architect",
      "purpose":"fixture",
      "permission_ceiling":"R1",
      "allowed_tools":["repository.read","repository.search"],
      "required_outputs":["findings"],
      "forbidden_actions":["write"]
    }
  }
}
JSON
printf 'alpha\nbeta alpha\ngamma\n' > "$REPO/fixture.txt"
git -C "$REPO" add .
git -C "$REPO" commit -qm "fixture"
git -C "$REPO" remote add origin "$ORIGIN"
git -C "$REPO" push -q -u origin mobile
HEAD_SHA="$(git -C "$REPO" rev-parse HEAD)"

python3 - "$REPO" "$HEAD_SHA" <<'PY'
from pathlib import Path
import hashlib, json, sys
root = Path(sys.argv[1]); commit = sys.argv[2]
def digest(v): return hashlib.sha256(json.dumps(v, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
inv = {
 "schema_version":"1.0","record_type":"agent_invocation_attestation",
 "repository":"https://github.com/The-Architect-369/Arcanum.git","branch":"mobile","commit":commit,
 "agent_id":"repository_architect","agent_display_name":"Repository Architect","purpose":"fixture",
 "requested_permission_class":"R1","permission_ceiling":"R1",
 "requested_tools":["repository.read","repository.search"],"required_outputs":["findings"],
 "task":"inspect fixture","mode":"plan_only","status":"ready","tools_executed":False,
 "external_writes_performed":False,"authority":"evidentiary_only","request_sha256":"0"*64
}
inv["attestation_sha256"] = digest(inv)
(root/"invocation.json").write_text(json.dumps(inv, indent=2)+"\n")
req = {
 "schema_version":"1.0","record_type":"agent_execution_request",
 "repository":"https://github.com/The-Architect-369/Arcanum.git","branch":"mobile","commit":commit,
 "agent_id":"repository_architect","invocation_attestation_sha256":inv["attestation_sha256"],
 "requested_permission_class":"R1","requested_tools":["repository.read","repository.search"],
 "operations":[
   {"tool":"repository.read","paths":["fixture.txt"]},
   {"tool":"repository.search","paths":["fixture.txt"],"query":"alpha"}
 ],"authorization":"explicit_human_request"
}
req["request_sha256"] = digest(req)
(root/"request.json").write_text(json.dumps(req, indent=2)+"\n")
PY

git -C "$REPO" add invocation.json request.json
git -C "$REPO" commit -qm "fixture requests"
git -C "$REPO" push -q origin mobile
HEAD_SHA="$(git -C "$REPO" rev-parse HEAD)"
python3 - "$REPO" "$HEAD_SHA" <<'PY'
from pathlib import Path
import hashlib, json, sys
root=Path(sys.argv[1]); head=sys.argv[2]
def digest(v): return hashlib.sha256(json.dumps(v, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
inv=json.loads((root/"invocation.json").read_text()); req=json.loads((root/"request.json").read_text())
for value in (inv, req): value["commit"]=head
inv.pop("attestation_sha256",None); inv["attestation_sha256"]=digest(inv)
req["invocation_attestation_sha256"]=inv["attestation_sha256"]
req.pop("request_sha256",None); req["request_sha256"]=digest(req)
(root/"invocation.json").write_text(json.dumps(inv,indent=2)+"\n")
(root/"request.json").write_text(json.dumps(req,indent=2)+"\n")
PY
# Request files are untracked execution inputs; source checkout must otherwise be clean.
git -C "$REPO" add invocation.json request.json
git -C "$REPO" commit -qm "bind exact head"
git -C "$REPO" push -q origin mobile
HEAD_SHA="$(git -C "$REPO" rev-parse HEAD)"
# Rebind once more without committing, then exclude evidence inputs from status via .git/info/exclude.
python3 - "$REPO" "$HEAD_SHA" <<'PY'
from pathlib import Path
import hashlib, json, sys
root=Path(sys.argv[1]); head=sys.argv[2]
def digest(v): return hashlib.sha256(json.dumps(v, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
inv=json.loads((root/"invocation.json").read_text()); req=json.loads((root/"request.json").read_text())
inv["commit"]=head; inv.pop("attestation_sha256",None); inv["attestation_sha256"]=digest(inv)
req["commit"]=head; req["invocation_attestation_sha256"]=inv["attestation_sha256"]
req.pop("request_sha256",None); req["request_sha256"]=digest(req)
(root/"invocation.json").write_text(json.dumps(inv,indent=2)+"\n")
(root/"request.json").write_text(json.dumps(req,indent=2)+"\n")
PY
git -C "$REPO" update-index --assume-unchanged invocation.json request.json

cd "$REPO"
python3 scripts/architect/agent-execute.py invocation.json request.json --output "$TMP/a.json" >/dev/null
python3 scripts/architect/agent-execute.py invocation.json request.json --output "$TMP/b.json" >/dev/null
cmp "$TMP/a.json" "$TMP/b.json"
jq -e '.status=="completed" and .mode=="read_only" and .tools_executed==true and .external_writes_performed==false and .repository_mutation_performed==false and (.operations[1].matches|length)==2' "$TMP/a.json" >/dev/null

jq '.requested_permission_class="W1" | del(.request_sha256)' request.json > "$TMP/bad.json"
python3 - "$TMP/bad.json" <<'PY'
from pathlib import Path
import hashlib,json,sys
p=Path(sys.argv[1]); v=json.loads(p.read_text()); v['request_sha256']=hashlib.sha256(json.dumps(v,sort_keys=True,separators=(",",":")).encode()).hexdigest(); p.write_text(json.dumps(v))
PY
if python3 scripts/architect/agent-execute.py invocation.json "$TMP/bad.json" >/dev/null 2>&1; then
  echo "W1 escalation unexpectedly accepted" >&2; exit 1
fi

jq '.operations[0].paths=["../escape"] | del(.request_sha256)' request.json > "$TMP/bad-path.json"
python3 - "$TMP/bad-path.json" <<'PY'
from pathlib import Path
import hashlib,json,sys
p=Path(sys.argv[1]); v=json.loads(p.read_text()); v['request_sha256']=hashlib.sha256(json.dumps(v,sort_keys=True,separators=(",",":")).encode()).hexdigest(); p.write_text(json.dumps(v))
PY
if python3 scripts/architect/agent-execute.py invocation.json "$TMP/bad-path.json" >/dev/null 2>&1; then
  echo "path traversal unexpectedly accepted" >&2; exit 1
fi

echo "Guarded read-only agent execution fixtures passed"
