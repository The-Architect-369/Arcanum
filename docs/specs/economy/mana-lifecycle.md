---
title: "MANA Lifecycle"
status: canonical-draft
visibility: public
last_updated: 2026-06-02
description: "Lifecycle model for earning, holding, spending, routing, and observing MANA without creating extraction, status, or time-pressure loops."
phase: "Pre-Genesis"
layer: "Economy"
---

# MANA Lifecycle

## Purpose

This document defines the lifecycle of MANA across ARCnet and the Arcanum application economy.

It translates the economic constitution into an implementation-facing flow:

```text
earn / acquire
  ↓
hold
  ↓
spend
  ↓
route
  ↓
burn / treasury / builder support
  ↓
public receipt
```

This document is subordinate to:

- `docs/governance/economic-principles.md`
- `docs/governance/treasury-constitution.md`
- `docs/specs/economy/mana-governance-model.md`
- `docs/specs/economy/treasury-flow-model.md`
- `docs/architecture/app-chain-doctrine.md`

## Core principle

MANA is utility and capacity.

MANA is not:

- identity,
- worth,
- authority by itself,
- Vitae recognition,
- readiness,
- dignity,
- time acceleration.

MANA may expand optional capacity. It may not purchase becoming.

## Acquisition paths

### 1. Purchased MANA

A participant may acquire MANA through approved purchase or exchange paths when available.

Purchased MANA is usable for utility, but it may not create governance authority by itself.

### 2. Earned MANA

Earned MANA may be distributed through governed and bounded programs, including:

- system contributions,
- builder incentives,
- ecosystem growth programs,
- bounded participation programs,
- future conversion from non-transferable participation credits.

Earned MANA must be:

- parameterized,
- public in policy,
- bounded in emission,
- auditable,
- aligned with utility sinks,
- non-coercive.

### 3. RITES conversion

If RITES or similar non-transferable participation credits are adopted, conversion to MANA must occur only through a bounded conversion budget.

RITES must never become liquid MANA automatically or infinitely.

## Holding

Holding MANA may represent available utility capacity.

Holding MANA must not automatically represent:

- better citizenship,
- higher worth,
- governance stewardship,
- Vitae advancement,
- identity legitimacy,
- treasury authority.

App surfaces should avoid visual hierarchy based on balance size.

## Spending

MANA may be spent on explicitly priced utility.

Allowed spend categories:

- infrastructure usage,
- storage anchoring,
- execution costs,
- event creation,
- anti-spam gates,
- optional feature invocation,
- developer deployment or module registration,
- governance proposal deposits,
- paid curriculum/tools where doctrinally allowed.

Every spend must show cost before confirmation.

## Forbidden spending semantics

MANA must not be spent to:

- accelerate Tempus windows,
- recover missed windows,
- bypass readiness,
- purchase Vitae recognition,
- purchase authority,
- purchase identity,
- force social access,
- preserve streaks,
- avoid dignity loss,
- create hidden subscriptions that lock basic participation.

## Routing

A MANA spend may route value through transparent lanes.

Initial lane vocabulary:

```text
burn
  reduces supply where appropriate

treasury
  funds security, infrastructure, audits, operations, continuity

builder_grants
  funds governed or retroactive support for useful work
```

Exact percentages are governance parameters and must remain explicit.

## Receipts

MANA actions that require settlement should generate factual receipts.

Receipt types may include:

- `mana_minted`,
- `mana_spent`,
- `mana_burned`,
- `mana_transferred`,
- `mana_routed_to_treasury`,
- `mana_routed_to_builder_pool`,
- `mana_conversion_budget_executed`.

Receipts may state what happened.

Receipts must not state what the human is.

## App implementation posture

During Pre-Genesis, app-local MANA state may exist for scaffolding and UX testing.

The UI must label chain-backed truth and local/device state distinctly.

The app must not:

- invent settled balances where ARCnet has not witnessed them,
- hide spend reasons,
- silently debit MANA,
- imply that low balance reduces dignity,
- imply that high balance grants authority.

## Governance parameters

Governance may later define:

- emission rate ceilings,
- conversion budgets,
- per-identity caps,
- sink prices,
- routing percentages,
- proposal deposits,
- minimum identity age requirements,
- anti-sybil eligibility rules.

All parameter changes must remain within constitutional bounds.

## Canonical closure

MANA should make useful work possible.

MANA should fund durability.

MANA should reward contribution without extracting obedience.

Payment may expand capacity.

Authority remains earned.

Time remains unbuyable.