#!/usr/bin/env bash
# Explicit developer command wrapper; no automatic install or startup action.
# The supplied command retains its own authorization and effect requirements.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
LOCAL_NODE="$ROOT/.local/toolchains/node24/bin"
LOCAL_SHIMS="$ROOT/.local/toolchains/bin"
if [[ -x "$LOCAL_NODE/node" ]]; then
  export PATH="$LOCAL_NODE:$LOCAL_SHIMS:$PATH"
fi
if [[ -d "$HOME/.cargo/bin" ]]; then
  export PATH="$HOME/.cargo/bin:$PATH"
fi
[[ "$(node -p 'process.versions.node.split(".")[0]')" == 24 ]] || {
  echo 'Node 24 is required. Provision the documented local toolchain before verification.' >&2
  exit 1
}
[[ "$#" -gt 0 ]] || { echo 'Supply an explicit development command.' >&2; exit 64; }
cd "$ROOT"
exec "$@"
