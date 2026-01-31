]pppppppppp55# Arcanum-D Chain

- **Chain ID**: `arcanum-local-1`
- **Bech32 prefix**: `arca`
- **Base denom**: `umana`
- **Display denom**: `MANA`
- **Min gas prices**: `0.025umana`

## Modules

### x/chaincode

Non-transferable SBT identity:

- `arcanumd tx chaincode mint <owner> <token-id> <metadata-cid>`
- Queries:
  - `arcanumd q chaincode by-owner <owner>`
  - `arcanumd q chaincode by-token <token-id>`
  - `arcanumd q chaincode params`

### x/mana

Lightweight in-protocol credits:

- `arcanumd tx mana mint <addr> <amount>`
- `arcanumd tx mana spend <addr> <amount>`
- `arcanumd tx mana transfer <from> <to> <amount>`
- `arcanumd tx mana burn <addr> <amount>`

Queries:

- `arcanumd q mana balance <addr>`
- `arcanumd q mana supply`
- `arcanumd q mana params`

## Localnet

```bash
make start-local
./scripts/faucet.sh 1000000 $(arcanumd keys show demo -a --keyring-backend test)
