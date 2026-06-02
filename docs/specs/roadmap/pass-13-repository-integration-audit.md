# Pass 13 — Repository Integration Audit

Status: canonical-draft
Phase: Pre-Genesis
Branch: mobile
Scope: Doctrine-to-implementation alignment after governance, authority, ARCnet, node, and self-amendment specification passes.

## Purpose

This report audits where the repository stands after the constitutional architecture work completed across Passes 1–12.

It maps:

- what now exists as doctrine/specification,
- what already exists in app or chain implementation,
- what is partial,
- what is missing,
- and what should be built next.

## Repository Access Status

Grounding state: live-file partial scan of the mobile branch.

Reviewed representative surfaces:

- `docs/governance/vitae-authority-map.md`
- `docs/specs/app/governance-state-machine.md`
- `docs/specs/protocol/self-amendment-boundaries.md`
- `apps/web/src/lib/mobile/vitae.ts`
- `apps/web/src/lib/cosmos/queries.ts`
- `chains/arcanum/x/chaincode/keeper/keeper.go`
- `chains/arcanum/x/mana/keeper/keeper.go`
- `chains/arcanum/Makefile`

This report does not claim a full exhaustive tree audit. It is a directional integration roadmap grounded in the active branch files above.

## Executive Summary

The repository now has a substantially complete constitutional architecture for:

- identity,
- Vitae,
- authority,
- governance,
- treasury,
- MANA,
- receipts,
- ARCnet witnessing,
- node participation,
- developer sovereignty,
- node upgrades,
- self-amendment boundaries.

Implementation is materially behind doctrine, which is expected at this phase.

The strongest implemented areas are:

- local Vitae practice state,
- local receipts,
- ChainCode identity anchor keeper logic,
- MANA balance/supply keeper logic,
- app-side ARCnet query helpers.

The largest missing implementation areas are:

- governance runtime UI,
- governance proposal state machine,
- authority binding runtime,
- governance receipt module,
- council workflows,
- developer console runtime,
- node upgrade runtime,
- bootable local ARCnet daemon/localnet.

## Specification Stack Now Present

### Governance and Authority

- `docs/governance/vitae-authority-map.md`
- `docs/governance/governance-permission-model.md`
- `docs/governance/governance-lifecycle.md`
- `docs/governance/governance-councils.md`

### App Specifications

- `docs/specs/app/vitae-authority-integration.md`
- `docs/specs/app/governance-ui-model.md`
- `docs/specs/app/governance-state-machine.md`
- `docs/specs/app/developer-console-model.md`

### Chain and ARCnet Specifications

- `docs/specs/chain/governance-receipts.md`
- `docs/specs/chain/authority-state-model.md`
- `docs/specs/chain/governance-module-design.md`

### Identity Specifications

- `docs/specs/identity/authority-binding-model.md`
- `docs/specs/identity/governance-identity-model.md`

### Network Specifications

- `docs/specs/network/node-participation-model.md`
- `docs/specs/network/arcnet-topology-model.md`
- `docs/specs/network/node-upgrade-model.md`

### Economy Specifications

- `docs/specs/economy/treasury-flow-model.md`
- `docs/specs/economy/mana-governance-model.md`

### Protocol Evolution

- `docs/specs/protocol/self-amendment-boundaries.md`

## Implementation Audit Matrix

| Area | Current implementation status | Notes |
|---|---:|---|
| Local Vitae state | Implemented | `apps/web/src/lib/mobile/vitae.ts` supports path selection, sessions, summaries, and local receipts. |
| Local receipts | Partial | Vitae emits local receipts; broader governance receipt model is spec-only. |
| App ARCnet query helpers | Partial | MANA balance/supply and ChainCode anchor query helpers exist. |
| Governance UI | Missing | No confirmed `/governance` route family yet. |
| Vitae authority UI | Missing | `/vitae/authority` is specified but not confirmed in code. |
| Governance proposal state machine | Missing | Spec exists; runtime model not implemented. |
| Council workflows | Missing | Spec exists; no app workflow implementation confirmed. |
| Authority binding runtime | Missing | Spec exists; no runtime binding store confirmed. |
| Developer console runtime | Missing | Spec exists; no app route/runtime confirmed. |
| Node upgrade runtime | Missing | Spec exists; no adoption/release workflow confirmed. |
| ChainCode identity anchor | Partial | Keeper supports mint/recover/lookup with duplicate prevention. |
| MANA state | Partial | Keeper supports balance/supply mutation and spend/transfer/burn behavior. |
| Governance chain module | Missing | Design exists; stores/messages/queries not implemented. |
| Treasury execution runtime | Missing/partial | Treasury module exists, but governance-bound execution flow not audited as implemented. |
| Local ARCnet boot | Blocked | `make start-local` intentionally exits because daemon runtime commands are not restored. |

## Current Hard Blocker

The most immediate ARCnet deployment blocker is localnet boot.

`chains/arcanum/Makefile` states that `start-local` is not available yet because runtime commands such as `init`, `start`, `keys`, `add-genesis-account`, and `gentx` have not been wired back in.

Until this is resolved, app-to-real-local-chain validation remains blocked.

## Recommended Build Order

### Phase 1 — Preserve Green Build and Refresh Grounding

1. Regenerate repo index.
2. Re-run `bash scripts/verify-sync.sh`.
3. Re-run app typecheck and build.
4. Re-run chain tests.
5. Commit index refresh if clean.

Recommended commands:

```bash
bash scripts/repo-index.sh
bash scripts/verify-sync.sh
pnpm -C apps/web typecheck
pnpm -C apps/web build
cd chains/arcanum && go test ./...
```

### Phase 2 — Restore Local ARCnet Boot

Goal: make local ARCnet actually start.

Work items:

1. Restore daemon runtime command surface.
2. Restore `init`, `start`, `keys`, genesis account, and local validator flow.
3. Ensure `make start-local` boots reliably.
4. Expose RPC `26657` and REST/API `1317` for app integration.

Success criteria:

```bash
cd chains/arcanum
make build
./bin/arcanumd version
make start-local
```

### Phase 3 — App ARCnet Status Panel

Goal: prove the app can read real local chain state.

Work items:

1. Add ARCnet status panel.
2. Display RPC/API endpoints.
3. Query MANA balance/supply.
4. Query ChainCode anchor.
5. Render error states cleanly.

Success criteria:

- app detects local node availability,
- app reads real MANA/ChainCode data,
- no false claim of settlement when node is offline.

### Phase 4 — Governance Read-Only UI

Goal: expose the constitutional architecture without enabling execution.

Routes:

- `/governance`
- `/governance/proposals`
- `/governance/councils`
- `/governance/receipts`
- `/vitae/authority`

Initial behavior:

- static lifecycle display,
- authority envelope display,
- council descriptions,
- receipt type explanations,
- no live execution.

### Phase 5 — Local Governance Draft Runtime

Goal: implement local-only proposal drafting.

Work items:

1. Add local proposal type definitions.
2. Add local IndexedDB persistence.
3. Add draft proposal UI.
4. Add local receipt creation for draft events.
5. Keep drafts non-binding.

### Phase 6 — Authority Binding Runtime

Goal: represent bounded responsibility in the app.

Work items:

1. Add authority envelope registry.
2. Add authority binding type definitions.
3. Add local authority display.
4. Add review-pending and recognized placeholder states.
5. Do not connect to chain execution yet.

### Phase 7 — Governance Receipt Runtime

Goal: unify local and future chain receipts.

Work items:

1. Add governance receipt types.
2. Add receipt timeline UI.
3. Map app events to receipt-like local records.
4. Prepare adapter for ARCnet receipts once available.

### Phase 8 — Chain Governance Module Scaffold

Goal: begin ARCnet governance module implementation.

Work items:

1. Add governance module scaffold.
2. Add proposal store.
3. Add receipt store.
4. Add authority store.
5. Add basic query surface.
6. Keep execution disabled until governance activation.

### Phase 9 — Treasury Flow Integration

Goal: connect treasury proposals to governance flow.

Work items:

1. Add treasury proposal draft model.
2. Add treasury lanes.
3. Add conflict disclosure fields.
4. Add review status.
5. Add future execution receipt mapping.

### Phase 10 — Developer Console Read-Only / Local Mode

Goal: begin sovereign-node development surface safely.

Work items:

1. Add `/developer` or protected dev console route.
2. Add local theme/config editor.
3. Add proposal draft generator.
4. Add local audit log.
5. Do not add arbitrary terminal or unrestricted execution.

## 24-Week Roadmap

### Weeks 1–2 — Grounding and Local ARCnet Boot

- Refresh repo index.
- Clear verify-sync drift.
- Restore daemon runtime commands.
- Make `make start-local` boot.

### Weeks 3–4 — App-to-Chain Validation

- Add ARCnet status panel.
- Validate RPC/API connectivity.
- Query ChainCode and MANA.
- Confirm mobile/PWA offline and error states.

### Weeks 5–6 — Governance UI Skeleton

- Add read-only governance routes.
- Add authority envelope registry.
- Add council and lifecycle displays.
- Add `/vitae/authority`.

### Weeks 7–8 — Local Governance Drafting

- Add local proposal models.
- Add IndexedDB persistence.
- Add local draft UI.
- Add draft receipts.

### Weeks 9–10 — Authority Binding Runtime

- Add authority binding types.
- Add local authority state.
- Add scope display.
- Add review-pending placeholders.

### Weeks 11–12 — Receipt Timeline

- Add governance receipt types.
- Add local receipt timeline.
- Add receipt filters.
- Prepare ARCnet receipt adapter.

### Weeks 13–15 — Chain Governance Scaffold

- Add governance module scaffold.
- Add proposal/receipt/authority stores.
- Add query endpoints.
- Add keeper tests.

### Weeks 16–18 — Treasury and MANA Integration

- Add treasury proposal models.
- Add treasury lane display.
- Add review metadata.
- Align MANA flows with treasury receipts.

### Weeks 19–20 — Developer Console Local Mode

- Add local developer console page.
- Add theme/config editing.
- Add proposal packet generator.
- Add local audit log.

### Weeks 21–22 — Node Upgrade Preview

- Add release candidate/changelog model.
- Add node adoption status placeholder.
- Add upgrade receipt model.

### Weeks 23–24 — Integration Hardening

- Verify app build.
- Verify chain tests.
- Verify localnet.
- Update repo index.
- Prepare merge to main if all surfaces are green.

## Risks

### Risk 1 — Doctrine Outruns Implementation

Mitigation: keep implementation phases small and read-only first.

### Risk 2 — Localnet Remains Blocked

Mitigation: prioritize daemon runtime restoration before chain governance module work.

### Risk 3 — Governance UI Implies Authority Too Early

Mitigation: label all early surfaces as read-only or local-only.

### Risk 4 — Developer Console Becomes Too Powerful Too Early

Mitigation: begin with theme/config/proposal drafting only.

### Risk 5 — Receipts Accidentally Encode Meaning

Mitigation: receipt schemas must remain factual and minimal.

## Current Maturity Snapshot

| Layer | Maturity |
|---|---:|
| Doctrine | 95% |
| Constitutional governance | 90% |
| Vitae practice app | 80% |
| App ARCnet query helpers | 45% |
| ChainCode keeper | 60% |
| MANA keeper | 60% |
| Governance app runtime | 10% |
| Governance chain runtime | 5% |
| Localnet deployment | 25% |
| Developer console runtime | 0% |
| Node upgrade runtime | 0% |

## Recommended Immediate Next Step

Do not start with governance execution.

Start with local ARCnet boot and app read validation.

The next implementation milestone should be:

```text
Local ARCnet boots
  ↓
App reads ChainCode + MANA
  ↓
App displays ARCnet status honestly
```

Only after that should governance UI and receipt runtime begin.

## Canonical Closure

The repository now has a coherent constitutional architecture.

The next challenge is implementation discipline:

- boot the local node,
- validate app-to-chain reads,
- add read-only governance surfaces,
- then progressively introduce local drafts, receipts, authority state, and eventually governed execution.

The doctrine is now strong enough to guide implementation.
Implementation should now proceed in small, verifiable waves.
