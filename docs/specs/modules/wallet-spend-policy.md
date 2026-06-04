---
title: "Wallet Spend Policy"
status: canonical-draft
visibility: public
last_updated: 2026-06-04
description: "Defines spend intent, confirmation, MANA utility boundaries, and forbidden wallet behaviors."
phase: "Pre-Genesis"
layer: "App / Wallet / Economy"
---

# Wallet Spend Policy

## Purpose

This document defines how Wallet may prepare and confirm spends.

Wallet may initiate permitted utility transactions.

Wallet may not define balances, silently debit users, bypass treasury rules, or convert payment into recognition or authority.

## Constraint sources

This document is subordinate to:

- `docs/specs/modules/wallet-context-schema.md`
- `docs/specs/economy/mana-lifecycle.md`
- `docs/governance/economic-principles.md`
- `docs/governance/treasury-constitution.md`
- `docs/architecture/canonical-modules.md`

## Spend intent

```ts
export type WalletSpendIntent = {
  id: string
  createdAt: string
  amount: string
  denom: 'umana' | string
  purpose: string
  category:
    | 'infrastructure'
    | 'anti_spam'
    | 'event_creation'
    | 'optional_utility'
    | 'developer_module'
    | 'governance_deposit'
    | 'curriculum_or_tool'
  recipient?: string
  routeHint?: 'burn' | 'treasury' | 'builder_grants' | 'module_account'
  requiresConfirmation: true
}
```

## Confirmation

Every spend requires explicit confirmation.

```ts
export type WalletSpendConfirmation = {
  intentId: string
  confirmedAt: string
  confirmedBy: 'user'
  status: 'confirmed' | 'cancelled' | 'failed'
  txHash?: string
  receiptId?: string
}
```

## Allowed spend categories

Allowed:

- infrastructure usage,
- storage anchoring,
- event creation,
- anti-spam gates,
- optional feature invocation,
- developer module registration,
- governance proposal deposits,
- curriculum/tools where permitted by Vitae economy boundary.

## Forbidden spends

Forbidden:

- identity purchase,
- dignity purchase,
- Vitae grade purchase,
- authority purchase,
- readiness acceleration,
- Tempus window recovery,
- streak recovery,
- treasury bypass,
- silent subscription that locks basic participation.

## UI requirements

Before confirmation, the UI must show:

- amount,
- denom,
- purpose,
- recipient or module if known,
- whether this is local scaffold or chain transaction,
- whether it can be cancelled,
- what it does not grant.

## Receipt requirements

A spend receipt may say:

```text
User confirmed spend X for purpose Y.
```

It must not say:

```text
User became worthy, ready, ranked, or recognized.
```

## Requires Human Architect decision

The following remain undefined:

- exact spend categories for first public release,
- exact routing percentages,
- whether spend confirmations require passkey confirmation in first implementation,
- whether cancellation exists after queueing but before broadcast.

## Canonical closure

A spend is a chosen utility action.

It is not a purchase of becoming.