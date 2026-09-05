# Arcanum / ARCnet

Arcanum is the human-facing application and doctrine ecosystem built on **ARCnet**, the sovereign local/network infrastructure substrate.

## Canonical repository posture

- Persistent canonical branch: `main`
- Current era: Construction Era
- CE-W01: complete / certified / promoted
- CE-W02: complete / certified / promoted
- Current implementation wave: **CE-W03 — Hope at the Center / Arcanum Native Vertical Slice**
- Forward baseline: `docs/repo/arcanum-baseline.md`

The repository does not use a permanent integration branch. When review isolation is required, an explicitly authorized temporary work branch is created from the exact current `main` head, verified, merged or closed, and then deleted.

## Repository surfaces

- `apps/web/` — current web/PWA Arcanum experience; transitional while native ARCnet construction proceeds
- `apps/android/` — certified native Android host and Construction-era Arcanum/Hope surface
- `runtime/arcanum-runtime/` — Rust sovereign local-runtime implementation and tests
- `runtime/arcanum-android-*` — bounded Android/JNI runtime adapters
- `chains/arcanum/` — ARCnet/Cosmos protocol and settlement domain
- `docs/` — doctrine, architecture, governance, specifications, roadmaps, and repository contracts
- `scripts/` — active verification, repository-index, Architect, mobile/Termux, node, and deployment utilities

## Toolchain

- Node.js: `24.x`
- pnpm: `9.10.0`
- Ubuntu: `22.04 LTS+` is the primary maintainer environment
- Rust/Cargo: required for local-runtime/native bridge crates

## Common verification

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
pnpm verify:ce-w02:integrated
pnpm verify:ce-w03
pnpm verify:repo-index
bash scripts/verify-sync.sh
```

## Start here

1. `docs/repo/arcanum-baseline.md` — encoded construction baseline
2. `docs/specs/app/ce-w03-native-hope.md` — current CE-W03 implementation contract
3. `docs/architecture/arcanum-system-overview.md` — top-down system model
4. `docs/index.md` — documentation navigation
5. `docs/roadmap/canonical-roadmap.md` — current roadmap state
6. `docs/governance/architectgpt/architect-gpt.md` — current Architect operating contract

Historical decisions remain recoverable through Git history and explicitly historical records. They are provenance, not active instructions.
