---
title: "Economic Principles"
status: canonical
visibility: public
last_updated: 2026-03-02
description: "Economic invariants, policy principles, and adjustable parameters for ARCnet and the Arcanum application economy."
---

# Economic Principles

## 1. Purpose

This document defines the economic principles and policy constraints governing **ARCnet** and the **Arcanum** application economy.

It complements:

- Whitepaper tokenomics (narrative + design intent): `../whitepaper/tokenomics.md`
- Governance mechanics (how policy changes): `./governance-specification.md`
- Treasury constraints (custody + allocation limits): `./treasury-constitution.md`

This file is **constitutional-economic policy**: it defines *what is allowed* and *what is forbidden*, and it names the adjustable parameters that governance may tune over time.

---

## 2. Canonical Naming

- **ARCnet**: sovereign network / infrastructure substrate.
- **Arcanum**: application ecosystem built on ARCnet.
- **MANA**: native utility token.
- **ACC**: Arcanum Chain Code (identity anchoring).
- **Tempus**: time-window / cadence engine.
- **Hope**: reflection interface.
- **Vitae**: recognition framework (non-comparative).
- **Nexus**: social witness layer (no virality mechanics).

---

## 3. Economic Objectives

ARCnet’s economy is designed to:

1) **Preserve non-coercion** (no pressure loops, no forced monetization)
2) **Preserve sovereignty** (no pay-to-authority, no pay-to-time-acceleration)
3) **Reward contribution** without turning participation into extraction
4) **Fund security and durability** (audits, infrastructure, maintenance)
5) **Support builders** with utility-driven demand, not speculative narratives

---

## 4. Economic Invariants (Non-Negotiable)

These rules must hold across all phases:

1) **No time acceleration by payment**  
   Payment may expand capacity (rate limits, optional utilities), but it must not compress time-based progression, Tempus windows, or Vitae thresholds.

2) **No authority-for-sale**  
   Governance authority must be multi-factor and cannot be purchased directly by acquiring MANA alone.

3) **No worth scoring**  
   The economy must not become a social-credit system. No “human value” scores, no rank-based coercion.

4) **Explicit pricing**  
   All MANA costs must be visible before confirmation. No hidden fees.

5) **Utility-bound sinks**  
   Sinks must be tied to real utility (infrastructure usage, anti-spam, optional features), not psychological manipulation.

6) **Transparency by default**  
   Treasury routing and protocol-level economic parameters must be publicly auditable.

---

## 5. Economic Primitives

### 5.1 MANA (utility token)
MANA is transferable and used for:

- access & permissions (bounded)
- infrastructure usage (storage anchoring, execution costs)
- governance participation (deposits, proposals, bounded parameter changes)
- developer integration (payments, permissions)
- treasury routing (funding audits, grants, reliability)

MANA is **utility-first**: the protocol prioritizes use over speculative velocity.

---

### 5.2 Optional: Participation Credits (non-transferable)

ARCnet MAY support a non-transferable participation credit mechanism (e.g., **RITES**) to improve UX in permission-first phases.

**Purpose:** allow daily participation and rhythm to feel generous while preventing runaway liquid inflation.

If adopted, participation credits MUST be:

- non-transferable
- identity-bound
- convertible only under bounded issuance policy
- governed by transparent parameters
- not a substitute for governance legitimacy

**Note:** This primitive is optional. Earned MANA distribution may also be implemented directly without an intermediate credit layer, as long as issuance remains bounded and non-coercive.

---

## 6. Issuance Policy (Bounded Emission)

### 6.1 Earned MANA distribution (baseline)
Earned MANA may be distributed for:

- Tempus participation
- system contributions
- builder incentives (governance-approved)
- ecosystem growth programs (bounded)

All emission must be:

- parameterized
- publicly visible
- governed within bounds
- aligned to sinks and sustainability

### 6.2 If participation credits exist: conversion budgets
If non-transferable credits exist (e.g., RITES → MANA), conversion MUST occur via a bounded budget that is reflexive to system health.

A permissible (general) form:

- `budget_week = clamp(min_budget, f(net_sinks, protocol_fees, reserve_health), max_budget)`
- conversions are pro-rata to queued credits
- unused budget does not automatically accumulate unless governance explicitly allows it

Conversion budgets may also enforce:

- per-identity caps (anti-sybil backstop)
- minimum identity age for eligibility
- participation consistency requirements

**Forbidden:** unbounded “convert everything instantly” mechanics.

---

## 7. Sinks & Fee Routing

### 7.1 Sink categories (canonical)
Sinks may include:

- **anti-spam / anti-sybil gating** (posting, event creation, group creation)
- **infrastructure usage** (anchoring, storage references, execution costs)
- **optional feature activations** (non-essential utilities)
- **governance proposal deposits**
- **developer deployment / module registration costs** (where applicable)

Sinks must not punish silence or non-participation.

### 7.2 Routing lanes (canonical posture)
When MANA is spent on fees, routing SHOULD follow a transparent lane model such as:

- **burn** (reduces supply; aligns with sink utility)
- **treasury** (durability + stewardship)
- **builder grants** (retroactive rewards; governance-approved)

The exact percentages are adjustable parameters, but the routing model must remain explicit.

---

## 8. Treasury Economic Role (Stewardship, Not Discretion)

The treasury may:

- fund audits, reliability, maintenance
- fund builder grants
- fund security response
- fund ecosystem development

The treasury may hold reserves and may participate in liquidity provisioning **only** if:

- governance approves the venues and policies
- the policies are bounded and auditable
- there is an explicit risk disclosure
- there is an emergency disable path

**Important:** Any “market operations” posture (e.g., corridor stabilization) is optional and must never become discretionary, opaque, or insider-controlled.

See: `./treasury-constitution.md`

---

## 9. Economic Phases (Policy Posture)

### Phase A — Permission-first (Genesis posture)
- emphasize accessibility and exploration
- keep sinks minimal and utility-bound
- keep pricing simple
- prioritize stability over monetization

### Phase B — Controlled circulation
- introduce deeper sinks tied to real utilities
- activate limited grants and builder programs
- strengthen anti-sybil guardrails

### Phase C — Infrastructure economy
- expand infrastructure usage sinks (storage, execution, deployment)
- mature treasury lanes and reporting
- support multi-application usage of ARCnet rails

---

## 10. Module Pricing Semantics (Non-Canonical Examples)

The following are examples of *what may be priced*, not required prices.

### Possible priced actions (allowed)
- Tempus: event creation (anti-spam + coordination cost)
- Nexus: posting / boosting (anti-spam + optional discovery)
- Hope: optional cosmetic transforms (cosmetics only; must not gate reflection)
- Groups: creation/join fees (anti-spam)
- Developer: module registration / deployment fees (governance-defined)

### Forbidden pricing (not allowed)
- paying to bypass Tempus windows
- paying to bypass Vitae recognition gates
- paying to purchase governance authority directly
- pricing that punishes silence (streak penalties, deadlines with loss)

---

## 11. Risk Surface & Mitigations

### Emission shock
Mitigate with bounded emission, sink reflexivity, and conversion throttles (if credits exist).

### Sybil/botting
Mitigate with:
- ACC identity requirements
- minimum identity age gates for certain privileges
- proposal deposits
- anti-spam sinks

### Speculative spiral
Mitigate by:
- utility-first design
- transparent routing lanes
- no “guaranteed yield” narratives
- governance-bounded parameter changes

### UX confusion
Mitigate by:
- clear pre-confirm pricing
- simple mental model (“MANA = capacity and utility”)
- avoid complex staking mechanics until maturity

---

## 12. Parameter Registry (What Governance May Tune)

Governance may tune the following, within constitutional bounds:

- emission rate parameters (bounded)
- sink pricing parameters (bounded)
- routing percentages (burn/treasury/grants)
- proposal deposit requirements
- identity eligibility thresholds (age, participation consistency)
- optional conversion budget parameters (if credits exist)

All changes must be:

- proposed
- voted
- time-locked where appropriate
- documented in governance changelog

See: `./governance-changelog.md`

---

## Conclusion

ARCnet’s economic posture is designed to be:

- utility-first
- non-coercive
- constitutionally bounded
- transparent and auditable
- scalable from Genesis into infrastructure maturity

The economy must fund durability without becoming extraction.

Payment may expand capacity.
Authority remains earned.
Time remains unbuyable.