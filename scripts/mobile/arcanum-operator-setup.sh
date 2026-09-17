#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

command -v termux-info >/dev/null 2>&1 || {
  echo "[arcanum-operator-setup] ERROR: run this inside Termux." >&2
  exit 1
}

PROPERTIES_DIR="$HOME/.termux"
PROPERTIES_FILE="$PROPERTIES_DIR/termux.properties"

mkdir -p "$PROPERTIES_DIR"
touch "$PROPERTIES_FILE"

python3 -S - "$PROPERTIES_FILE" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
lines = path.read_text(encoding="utf-8").splitlines()
out = []
replaced = False

for line in lines:
    if line.strip().startswith("allow-external-apps="):
        if not replaced:
            out.append("allow-external-apps=true")
            replaced = True
        continue
    out.append(line)

if not replaced:
    if out and out[-1] != "":
        out.append("")
    out.append("allow-external-apps=true")

path.write_text("\n".join(out) + "\n", encoding="utf-8")
PY

if command -v termux-reload-settings >/dev/null 2>&1; then
  termux-reload-settings
fi

cat <<'EOF'

A13.1 Termux operator property is enabled:
  allow-external-apps=true

One Android gate remains Human-controlled:
  Settings → Apps → ARCnet Native Host → Permissions
  → Additional permissions → Run commands in Termux environment → Allow

A13.1 does not and cannot grant that Android permission to itself.
EOF
