#!/usr/bin/env bash
set -euo pipefail
# Install/start arcanumd with a provided genesis or seed peers.
if ! command -v arcanumd >/dev/null; then echo "Install arcanumd first"; exit 1; fi
arcanumd init user --chain-id ${ARCANUM_CHAIN_ID:-arcanum-local-1}
# TODO: fetch genesis.json + addrbook.json from your seed
# TODO: set persistent_peers in config.toml
arcanumd start
