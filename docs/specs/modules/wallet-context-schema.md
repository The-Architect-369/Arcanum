---
title: "Wallet Context Schema"
status: canonical-draft
visibility: public
last_updated: 2026-06-04
description: "Defines Wallet context, balance state, settlement status, receipt records, and local-vs-chain truth boundaries."
phase: "Pre-Genesis"
layer: "App / Wallet / Schema"
---

# Wallet Context Schema

## Purpose

This document defines the implementation-facing Wallet context.

Wallet is an interface, not authority.

The Wallet may display, prepare, and request confirmation for permitted actions. It may not define balances or bypass chain, treasury, or governance rules.

## Constraint sources

This document is subordinate to:

- `docs/architecture/canonical-modules.md`
- `docs/specs/economy/mana-lifecycle.md`
- `docs/specs/economy/treasury-flow-model.md`
- `docs/specs/chain/local-arcnet.md`
- `docs/specs/modules/wallet-spend-policy.md`

## Core principle

Wallet state must distinguish local/device state from chain-witnessed state.

## TypeScript target

A first implementation may create:

```text
apps/web/src/lib/wallet/context.ts
```

## Settlement status

```ts
export type WalletSettlementStatus =
  | 'device_only'
  | 'bound'
  | 'syncing'
  | 'sync_error'
  | 'chain_witnessed'
```

## Balance state

```ts
export type WalletBalanceState = {
  denom: string
  amount: string
  displayAmount?: string
  source: 'local_scaffold' | 'bank_fallback' | 'arcnet_mana_module'
  lastSyncedAt?: string
}
```

## Wallet context

```ts
export type WalletContext = {
  version: 'wallet.context.v0.1'
  capturedAt: string
  identityId?: string | null
  chainAddress?: string | null
  settlementStatus: WalletSettlementStatus
  balances: WalletBalanceState[]
  chainAnchor?: {
    tokenId?: string
    metadata?: string
    source: 'arcnet_chaincode_module'
  }
  warnings: string[]
}
```

## Receipt record

```ts
export type WalletReceiptRecord = {
  id: string
  type:
    | 'wallet_synced'
    | 'spend_intent_created'
    | 'spend_confirmed'
    | 'spend_failed'
    | 'address_bound'
    | 'address_unbound'
  createdAt: string
  status: 'info' | 'pending' | 'confirmed' | 'failed'
  amount?: string
  denom?: string
  address?: string
  txHash?: string
  source: 'local_device' | 'arcnet'
  meaning: null
}
```

Receipts may state what happened.

Receipts must not state what the human is.

## Local scaffolding posture

During Pre-Genesis, app-local values may exist for development.

The UI must label them as local, device-only, scaffold, or unsynced where appropriate.

## Forbidden fields

Do not implement:

```ts
wealthRank: number
worthinessFromBalance: string
authorityFromBalance: boolean
treasuryAccess: boolean
silentDebit: boolean
```

## Requires Human Architect decision

The following remain undefined:

- exact first production wallet custody model,
- whether the app will ever hold keys directly,
- exact local scaffold balance display copy,
- first supported non-MANA assets,
- whether Wallet Vault is identity backup, key custody, or document storage.

## Canonical closure

Wallet shows capacity.

Wallet requests confirmation.

Wallet does not define truth.