#!/usr/bin/env bash
set -euo pipefail

CHAIN_ID=${CHAIN_ID:-arcanum-local-1}
DENOM=${DENOM:-umana}
AMOUNT=${1:-1000000}        # default 1 MANA (in umana)
RECIPIENT=${2:-}

if [ -z "$RECIPIENT" ]; then
  echo "Usage: faucet.sh <amount (base units)> <bech32-address>"
  exit 1
fi

arcanumd tx bank send \
  faucet "$RECIPIENT" "${AMOUNT}${DENOM}" \
  --from faucet \
  --chain-id "$CHAIN_ID" \
  --keyring-backend test \
  --gas auto --gas-adjustment 1.3 --gas-prices 0.025${DENOM} -y
