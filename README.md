# The Arcanum — Monorepo

## Apps
- `apps/site` → **Arcanum.io** (public landing page, Vercel)
- `apps/web`  → **App** (downloadable / gated)

## Packages
- `packages/ui` → shared UI components (mirrored styles)

## Contracts
- `contracts` → Foundry (Solidity)

## Prereqs
- Node 20+, pnpm 9+ (`corepack enable`), Foundry (`foundryup`)

## Commands
```bash
pnpm i
pnpm dev:site   # run landing site
pnpm dev:web    # run app
pnpm build      # build both
