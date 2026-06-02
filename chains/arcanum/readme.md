# Arcanum-D Chain

- **Chain ID**: `arcanum-local-1`
- **Bech32 prefix**: `arca`
- **Base denom**: `umana`
- **Display denom**: `MANA`
- **Min gas prices**: `0.025umana`

## Status

`chains/arcanum/` is the active local ARCnet implementation surface for Pre-Genesis work.

Current posture:

- `arcanumd` boots a local development chain
- `x/chaincode`, `x/mana`, and `x/treasury` exist in the active source tree
- the chain is an **active scaffold**, not yet a fully completed canonical state machine

Important:

- some tx paths currently emit events before full keeper-backed state is complete
- the README must reflect the actual implementation surface, not aspirational commands
- doctrinal constraints live in `docs/specs/chain/local-arcnet.md` and the canonical doctrine / architecture docs

## Modules

### x/chaincode

Identity witness surface for ACC / Chain Code continuity.

Current tx surface:

- `arcanumd tx chaincode mint-sbi [creator] [to]`
- recover message exists at proto level and should be wired/documented once exposed consistently through CLI

Current intent:

- non-transferable identity witness
- minimal anchor, not dossier
- factual receipts for anchor transitions

### x/mana

MANA settlement surface.

Current tx surface:

- `arcanumd tx mana spend [creator] [address] [purpose] [amount]`

Current intent:

- bounded utility value
- explicit spend purpose
- factual receipts for balance-affecting actions

### x/treasury

Treasury routing and stewardship surface.

Current scope is implementation-facing and should remain subordinate to doctrinal routing rules.

## Localnet

```bash
make start-local
./scripts/faucet.sh 1000000 $(arcanumd keys show demo -a --keyring-backend test)
```

## Near-term completion target

The next honest milestone for local ARCnet is:

1. keeper-backed identity anchor state in `x/chaincode`
2. keeper-backed MANA balance / supply state in `x/mana`
3. receipt reconstruction from real state transitions
4. app integration against real chain truth where available

## References

- `docs/specs/chain/local-arcnet.md`
- `docs/architecture/arcanum-chain.md`
- `docs/architecture/app-chain-doctrine.md`
- `docs/doctrine/identity-model.md`
- `docs/doctrine/layer-boundaries.md`
- `docs/doctrine/temporal-model.md`
- `docs/governance/economic-principles.md`
