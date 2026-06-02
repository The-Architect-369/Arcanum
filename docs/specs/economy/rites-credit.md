---
title: "RITES Participation Credit"
status: canonical-draft
visibility: public
last_updated: 2026-06-02
description: "Non-transferable participation credit model for generous rhythm without liquid inflation, coercion, or perfect-play pressure."
phase: "Pre-Genesis"
layer: "Economy"
---

# RITES Participation Credit

## Purpose

RITES is an optional non-transferable participation credit primitive.

It may be adopted to let participation feel acknowledged without turning every action into immediate liquid MANA issuance.

RITES is a buffer between voluntary participation and transferable utility value.

## Canonical constraint sources

This document is subordinate to:

- `docs/governance/economic-principles.md`
- `docs/specs/economy/mana-lifecycle.md`
- `docs/specs/app/tempus-windows.md`
- `docs/doctrine/temporal-model.md`
- `docs/architecture/app-chain-doctrine.md`

## Core principle

RITES may remember participation.

RITES must not judge the participant.

RITES is not:

- MANA,
- governance authority,
- Vitae recognition,
- identity,
- worth,
- rank,
- readiness.

## Required properties

If adopted, RITES must be:

- non-transferable,
- identity-bound or account-bound under a minimal privacy model,
- non-speculative,
- non-purchasable as recognition,
- convertible only through bounded policy,
- auditable in aggregate policy,
- optional in participation.

## Eligible sources

RITES may be issued for voluntary, useful, or coherence-supporting participation such as:

- optional Tempus rite recording,
- public event hosting,
- reviewable system contribution,
- governance drafting assistance,
- verified educational contribution,
- builder contribution receipts,
- participation programs approved by governance.

Eligibility must be defined by policy before issuance.

## Forbidden sources

RITES must not be issued for:

- private belief,
- ideological alignment,
- silence-breaking pressure,
- perfect attendance,
- forced daily streaks,
- purchasing grades,
- purchasing authority,
- paying to recover missed windows,
- arbitrary insider distribution.

## Missed windows

Missing a Tempus window must have no penalty.

The system may record chosen participation.

The system must not record non-participation as failure.

## Conversion to MANA

RITES may convert to MANA only if governance activates a bounded conversion program.

A valid conversion program must define:

- conversion epoch,
- total budget,
- per-identity caps,
- minimum identity age where needed,
- anti-sybil requirements,
- pro-rata conversion logic,
- expiry or carry rules,
- receipt schema,
- emergency pause path.

A permissible form:

```text
budget_epoch = clamp(min_budget, f(net_sinks, protocol_fees, reserve_health), max_budget)
conversion = pro_rata(eligible_rites, budget_epoch, per_identity_caps)
```

Unbounded conversion is forbidden.

## Receipt model

Potential factual receipt types:

- `rites_credit_issued`,
- `rites_credit_voided_for_error`,
- `rites_conversion_epoch_opened`,
- `rites_converted_to_mana`,
- `rites_conversion_budget_exhausted`.

Receipts may state that a credit was issued or converted.

Receipts must not state that the participant is superior, worthy, advanced, or ready.

## Privacy posture

RITES should minimize behavioral dossier risk.

Where possible:

- keep private practice details off-chain,
- store only receipt references or hashes,
- aggregate public conversion data,
- avoid exposing private notes,
- avoid public scoreboards.

## UI posture

App surfaces should describe RITES as participation credit, not status.

Allowed language:

- “Participation credit recorded.”
- “Eligible for future bounded conversion.”
- “No action required.”

Avoid language:

- “Perfect streak.”
- “You fell behind.”
- “Rank increased.”
- “Higher worth.”
- “Pay to recover.”

## Canonical closure

RITES may acknowledge participation.

RITES may never become obedience points.

RITES may support generosity.

RITES may not create coercion.