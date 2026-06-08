#!/usr/bin/env bash
set -euo pipefail

CHAIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$CHAIN_DIR"

CHAIN_ID="${CHAIN_ID:-arcanum-local-1}"
DENOM="${DENOM:-umana}"
SELF_DELEGATION="${SELF_DELEGATION:-100000000}"
GENESIS_BALANCE="${GENESIS_BALANCE:-1000000000}"

BASE_PORT="${BASE_PORT:-$((30000 + RANDOM % 20000))}"
RPC_PORT="$BASE_PORT"
P2P_PORT="$((BASE_PORT + 1))"
GRPC_PORT="$((BASE_PORT + 2))"
API_PORT="$((BASE_PORT + 3))"

HOME_DIR="$(mktemp -d "${TMPDIR:-/tmp}/arcanum-smoke.XXXXXX")"
LOG_FILE="$HOME_DIR/arcanumd.log"
NODE_PID=""

cleanup() {
  if [[ -n "${NODE_PID}" ]] && kill -0 "$NODE_PID" 2>/dev/null; then
    kill "$NODE_PID" 2>/dev/null || true
    wait "$NODE_PID" 2>/dev/null || true
  fi
  rm -rf "$HOME_DIR"
}
trap cleanup EXIT

echo "==> Building arcanumd"
make build >/dev/null

echo "==> Initializing temporary localnet home: $HOME_DIR"
./bin/arcanumd init smoke \
  --chain-id "$CHAIN_ID" \
  --home "$HOME_DIR" >/dev/null

./bin/arcanumd keys add validator \
  --keyring-backend test \
  --home "$HOME_DIR" >/dev/null

VALIDATOR_ADDR="$(./bin/arcanumd keys show validator -a --keyring-backend test --home "$HOME_DIR")"

python3 <<PY
import json
from pathlib import Path

p = Path("$HOME_DIR/config/genesis.json")
g = json.loads(p.read_text())
app = g["app_state"]
denom = "$DENOM"

app["staking"]["params"]["bond_denom"] = denom
app["mint"]["params"]["mint_denom"] = denom
app["gov"]["params"]["min_deposit"] = [{"denom": denom, "amount": "10000000"}]
app["gov"]["params"]["expedited_min_deposit"] = [{"denom": denom, "amount": "50000000"}]

p.write_text(json.dumps(g, indent=2) + "\n")
PY

./bin/arcanumd genesis add-genesis-account "$VALIDATOR_ADDR" "${GENESIS_BALANCE}${DENOM}" \
  --keyring-backend test \
  --home "$HOME_DIR" >/dev/null

./bin/arcanumd genesis gentx validator "${SELF_DELEGATION}${DENOM}" \
  --chain-id "$CHAIN_ID" \
  --keyring-backend test \
  --home "$HOME_DIR" >/dev/null

./bin/arcanumd genesis collect-gentxs \
  --home "$HOME_DIR" >/dev/null

./bin/arcanumd genesis validate "$HOME_DIR/config/genesis.json" >/dev/null

echo "==> Starting localnet smoke node on RPC port $RPC_PORT"
./bin/arcanumd start \
  --home "$HOME_DIR" \
  --pruning default \
  --minimum-gas-prices "0.025${DENOM}" \
  --rpc.laddr "tcp://127.0.0.1:${RPC_PORT}" \
  --p2p.laddr "tcp://127.0.0.1:${P2P_PORT}" \
  --grpc.address "127.0.0.1:${GRPC_PORT}" \
  --api.address "tcp://127.0.0.1:${API_PORT}" \
  >"$LOG_FILE" 2>&1 &

NODE_PID="$!"

for _ in $(seq 1 45); do
  if grep -q "This node is a validator" "$LOG_FILE" && grep -q "finalized block .*height=1" "$LOG_FILE"; then
    echo "ARCnet smoke localnet passed: validator initialized and block 1 finalized."
    exit 0
  fi

  if ! kill -0 "$NODE_PID" 2>/dev/null; then
    echo "ARCnet smoke localnet failed: node exited early."
    cat "$LOG_FILE"
    exit 1
  fi

  sleep 1
done

echo "ARCnet smoke localnet failed: block 1 was not finalized in time."
cat "$LOG_FILE"
exit 1
