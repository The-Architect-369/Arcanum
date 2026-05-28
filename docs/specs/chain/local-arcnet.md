---
title: "Local ARCnet Requirements"
status: canonical
visibility: public
last_updated: 2026-05-28
description: "Implementation-facing requirements for the local ARCnet / Arcanum-D node in Pre-Genesis."
---

# Local ARCnet Requirements

This document defines the minimum doctrinally valid shape of the **local ARCnet node** used for Pre-Genesis implementation and verification.

It is not a full mainnet design.
It is the smallest honest local settlement layer that the App may depend on.

## Canonical constraint sources

Local ARCnet must remain subordinate to:

- `docs/architecture/arcanum-chain.md`
- `docs/architecture/app-chain-doctrine.md`
- `docs/doctrine/identity-model.md`
- `docs/doctrine/layer-boundaries.md`
- `docs/doctrine/temporal-model.md`
- `docs/governance/economic-principles.md`
- `docs/governance/governance-specification.md`

## Purpose

Local ARCnet exists to provide a real protocol surface for:

- identity anchoring (ACC / Chain Code)
- MANA settlement and receipts
- treasury-routing and governance-safe economic primitives
- off-chain truth reconstruction from public receipts

It does **not** exist to:

- simulate human meaning
- define identity essence
- store private content payloads
- turn the App into the authority layer

## Architectural posture

The local node is a **witness and settlement harness**.

The stack remains:

1. Site — threshold, consent, initial anchoring when required
2. App — daily-use human interface, primarily off-chain
3. ARCnet — minimal public truth, invariant enforcement, receipts
4. Doctrine / Governance — non-negotiable constraints

Rule of thumb:

> If it does not need settlement, it should not touch the chain.

## Non-negotiable invariants

### Identity

The local node must preserve the following identity invariants:

- one identity anchor per being
- non-transferable identity anchor
- no reassignment of identity anchor
- minimal data footprint
- identity is witness, not dossier

The chain may witness continuity.
The chain may **not** define essence.

### Economy

The local node must preserve the following economic invariants:

- no authority-for-sale
- no worth-scoring
- no hidden costs
- no unbounded emission
- no time acceleration by payment
- no sink that punishes silence or non-participation

### Time

The local node must preserve the following temporal invariants:

- no penalties for missed windows
- no meaning assigned to punctuality
- no inference of intent from timing
- no urgency mechanics at protocol level

## Minimum module responsibilities

### x/chaincode

`x/chaincode` is the protocol witness for ACC / Chain Code continuity.

Minimum required behaviors:

- mint a minimal non-transferable identity anchor
- bind the anchor to a canonical owner address
- reject duplicate minting for the same owner where policy requires singularity
- expose factual query surface for owner → anchor and anchor → owner lookup
- emit factual receipts for mint / bind / recover transitions

Forbidden behaviors:

- storing biographies, profiles, or raw personal data
- allowing transfer or sale
- allowing duplicate or reassigned anchors
- deriving worth, role, or rank from identity state

### x/mana

`x/mana` is the protocol settlement layer for bounded utility value.

Minimum required behaviors:

- expose balance state
- support bounded mint paths used only for local/dev phases or governed issuance flows
- support spend, transfer, and burn
- emit receipts for each balance-affecting action
- support explicit sink routing metadata where applicable

Forbidden behaviors:

- invisible fees
- unbounded “mint anything” production posture
- authority derived solely from MANA holdings
- time-compression through payment

### x/treasury

`x/treasury` is the routing and stewardship surface.

Minimum required behaviors:

- receive explicit treasury-directed routing
- expose queryable routing state where implemented
- remain transparent and factual

Forbidden behaviors:

- discretionary hidden routing
- private side ledgers that override receipts

## Receipt model

Receipts are canonical truth.

The local node must emit factual receipts for:

- identity anchor mint / bind / recover
- MANA mint / spend / burn / transfer
- purchases and unlocks where settlement matters
- treasury routing events
- governance actions where implemented

Each receipt should aim to include:

- action type
- actor / signer
- affected identity or address
- amount (if economic)
- purpose or feature identifier (where applicable)
- block height / tx hash / timestamp

Receipts must remain **technical truth**, not human evaluation.

## Data placement

### On-chain

Allowed on-chain categories:

- hashes
- references
- receipts
- attestations
- routing facts
- minimal anchor state

### Off-chain

Must remain off-chain:

- content payloads
- private histories
- reflective text
- social meaning
- high-volume interaction streams

## Local development phases

### Phase 1 — Honest scaffold

A valid first phase may include:

- local node boot
- real transactions
- event + receipt emission
- query surface
- minimal state persistence

However, the node must not pretend scaffold events are already full canonical state if keeper state is still incomplete.

### Phase 2 — Canonical anchor + balance state

Required next milestone:

- persistent identity anchor state
- persistent MANA balance state
- queries returning actual keeper state rather than implied truth
- README and app integration aligned to real message surface

### Phase 3 — Routing and bounded issuance

Then:

- explicit sink routing lanes
- bounded issuance policy for local/dev posture
- treasury flow integration
- better receipt reconstruction surface

## App ↔ chain contract

The App may:

- request anchor creation
- request spend / transfer actions
- display receipts and balances
- render windows and opportunities

The App may not:

- invent anchor truth without chain witness
- invent balance truth without chain settlement
- simulate growth or readiness
- claim meaning from timestamps

## Current repository implication

If `chains/arcanum/` exists but only emits events for core actions, the correct posture is:

- treat it as an **active scaffold**
- do not overstate it as fully canonical state
- use it as the base for Phase 2 completion

## Immediate implementation checklist

1. verify `arcanumd` boots reliably via localnet target
2. align README with actual tx/query surface
3. complete keeper-backed state for `x/chaincode`
4. complete keeper-backed balance + supply state for `x/mana`
5. emit explicit factual receipts for balance and anchor transitions
6. wire the App to query real chain state where available
7. preserve doctrinal guardrails in docs and CI

## Forbidden moves checklist

Do not:

- put raw personal data on-chain
- make identity transferable
- allow duplicate or reassigned anchors
- let the App mint value by local UI state alone
- add countdown-pressure or missed-window penalties
- treat wallet balance as identity
- turn receipts into worth scores
- ship unbounded production-like mint authority without governance bounds
