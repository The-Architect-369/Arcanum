#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
PUBLISHER="$ROOT/scripts/architect/remote-publisher.py"
SCHEMA="$ROOT/docs/governance/architectgpt/remote-publisher.schema.json"

python3 -m py_compile "$PUBLISHER"
jq empty "$SCHEMA"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ORIGIN="$TMP/origin.git"
REPO="$TMP/repo"
LOCAL_ATTESTATION="$TMP/local-publication-attestation.json"
REQUEST="$TMP/remote-publication-request.json"
DRY_A="$TMP/dry-a.json