#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

EXECUTOR="$ROOT_DIR/scripts/architect/production-smoke.py"
TMP="$(mktemp -d)"
SERVER_PID=""
trap '[[ -n "$SERVER_PID" ]] && kill "$SERVER_PID" 2>/dev/null || true; rm -rf "$TMP"' EXIT

cat > "$TMP/server.py" <<'PY'
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys

port_file = Path(sys.argv[1])

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_args):
        pass

    def _send(self, status, body=b"", headers=None):
        self.send_response(status)
        for key, value in (headers or {}).items():
            self.send_header(key, value)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def do_HEAD(self):
        if self.path == "/health":
            self._send(200)
        else:
            self._send(404)

    def do_GET(self):
        if self.path == "/":
            self._send(200, b"<html><title>Arcanum</title><body>Arcanum fixture</body></html>")
        elif self.path == "/redirect":
            self._send(302, headers={"Location": "/final"})
        elif self.path == "/final":
            self._send(200, b"final marker")
        elif self.path == "/cross-host":
            self._send(302, headers={"Location": "https://example.com/"})
        else:
            self._send(404, b"missing")

server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
port_file.write_text(str(server.server_port), encoding="utf-8")
server.serve_forever()
PY

python3 "$TMP/server.py" "$TMP/port" &
SERVER_PID=$!
for _ in $(seq 1 50); do
  [[ -s "$TMP/port" ]] && break
  sleep 0.1
done
[[ -s "$TMP/port" ]] || { echo "FAIL fixture server did not start" >&2; exit 1; }
PORT="$(cat "$TMP/port")"
BASE_URL="http://127.0.0.1:$PORT"
HEAD_SHA="$(git rev-parse HEAD)"

cat > "$TMP/evidence.json" <<JSON
{
  "repository": "The-Architect-369/Arcanum",
  "commit": "$HEAD_SHA",
  "deployment": {
    "provider": "vercel",
    "deployment_id": "fixture-deployment",
    "state": "READY",
    "target": "preview",
    "commit": "$HEAD_SHA",
    "url": "$BASE_URL"
  }
}
JSON

cat > "$TMP/routes.json" <<'JSON'
{
  "schema_version": "1.0",
  "record_type": "production_smoke_route_manifest",
  "routes": [
    {
      "id": "landing",
      "method": "GET",
      "path": "/",
      "expected_status": 200,
      "max_redirects": 0,
      "timeout_ms": 2000,
      "max_duration_ms": 2000,
      "required_text": ["Arcanum"]
    },
    {
      "id": "health-head",
      "method": "HEAD",
      "path": "/health",
      "expected_status": 200,
      "max_redirects": 0,
      "timeout_ms": 2000,
      "required_text": []
    },
    {
      "id": "bounded-redirect",
      "method": "GET",
      "path": "/redirect",
      "expected_status": 200,
      "max_redirects": 1,
      "timeout_ms": 2000,
      "required_text": ["final marker"]
    }
  ]
}
JSON

python3 -m py_compile "$EXECUTOR"
python3 "$EXECUTOR" \
  --deployment-evidence "$TMP/evidence.json" \
  --manifest "$TMP/routes.json" \
  --allow-localhost \
  --output "$TMP/report-one.json" >/dev/null

echo "PASS exact deployment route contract"

python3 "$EXECUTOR" \
  --deployment-evidence "$TMP/evidence.json" \
  --manifest "$TMP/routes.json" \
  --allow-localhost \
  --output "$TMP/report-two.json" >/dev/null

python3 - "$TMP/report-one.json" "$TMP/report-two.json" <<'PY'
import json
import sys
from pathlib import Path
one = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
two = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
assert one["status"] == "pass"
assert one["summary"] == {"total": 3, "passed": 3, "failed": 0}
assert one["request_sha256"] == two["request_sha256"]
assert one["manifest_sha256"] == two["manifest_sha256"]
PY

echo "PASS deterministic request and manifest identities"

python3 - "$TMP/routes.json" "$TMP/bad-marker.json" <<'PY'
import json
import sys
from pathlib import Path
value = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
value["routes"][0]["required_text"] = ["not present"]
Path(sys.argv[2]).write_text(json.dumps(value), encoding="utf-8")
PY
if python3 "$EXECUTOR" --deployment-evidence "$TMP/evidence.json" --manifest "$TMP/bad-marker.json" --allow-localhost >/dev/null 2>&1; then
  echo "FAIL missing marker was accepted" >&2
  exit 1
fi
echo "PASS missing marker rejection"

python3 - "$TMP/routes.json" "$TMP/unsafe-method.json" <<'PY'
import json
import sys
from pathlib import Path
value = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
value["routes"][0]["method"] = "POST"
Path(sys.argv[2]).write_text(json.dumps(value), encoding="utf-8")
PY
if python3 "$EXECUTOR" --deployment-evidence "$TMP/evidence.json" --manifest "$TMP/unsafe-method.json" --allow-localhost >/dev/null 2>&1; then
  echo "FAIL unsafe method was accepted" >&2
  exit 1
fi
echo "PASS mutation method rejection"

python3 - "$TMP/evidence.json" "$TMP/non-ready.json" <<'PY'
import json
import sys
from pathlib import Path
value = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
value["deployment"]["state"] = "BUILDING"
Path(sys.argv[2]).write_text(json.dumps(value), encoding="utf-8")
PY
if python3 "$EXECUTOR" --deployment-evidence "$TMP/non-ready.json" --manifest "$TMP/routes.json" --allow-localhost >/dev/null 2>&1; then
  echo "FAIL non-READY deployment was accepted" >&2
  exit 1
fi
echo "PASS non-READY deployment rejection"

cat > "$TMP/cross-host.json" <<'JSON'
{
  "schema_version": "1.0",
  "record_type": "production_smoke_route_manifest",
  "routes": [
    {
      "id": "cross-host",
      "method": "GET",
      "path": "/cross-host",
      "expected_status": 200,
      "max_redirects": 2,
      "timeout_ms": 2000,
      "required_text": []
    }
  ]
}
JSON
if python3 "$EXECUTOR" --deployment-evidence "$TMP/evidence.json" --manifest "$TMP/cross-host.json" --allow-localhost >/dev/null 2>&1; then
  echo "FAIL cross-host redirect was accepted" >&2
  exit 1
fi
echo "PASS cross-host redirect rejection"

echo "production smoke fixtures passed"
