---
title: "ARCnet Edge Study 04 — Nexus ↔ Commercium"
status: design-candidate
visibility: public
last_updated: 2026-08-22
description: "Fourth ARCnet edge study: the boundary between social relation/discovery and material exchange/market activity."
phase: "Pre-Genesis"
authority: "non-canonical design evidence"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/37"
edge_id: "nexus.commercium"
edge_class: "kinship-candidate"
---

# ARCnet Edge Study 04 — Nexus ↔ Commercium

## Purpose

This study examines the candidate relationship between **Nexus** and **Commercium** within the generative/lived tetrahedron.

It asks how social discovery, discussion, trust, recommendation, and community activity may legitimately lead into exchange without turning popularity into market authority, social identity into a financial dossier, or conversation into purchase consent.

## Semantic correspondence

Nexus asks:

> What are people discussing, sharing, recommending, seeking, and offering together?

Commercium asks:

> What goods, services, crafts, or exchanges may actually be offered, evaluated, purchased, fulfilled, and settled?

The edge is therefore the threshold between:

- discovery and exchange;
- recommendation and listing;
- conversation and transaction;
- community context and commercial intent;
- reputation-bearing social evidence and bounded market evidence.

Candidate summary:

> **Nexus helps people discover and contextualize exchange; Commercium governs the exchange itself.**

## Core boundary

A Nexus post mentioning an item is not automatically a Commercium listing.

A discussion expressing interest is not purchase authorization.

A recommendation is not a warranty.

A popular creator is not automatically a trusted merchant.

Candidate flow:

```text
Nexus post / conversation / request
          |
          | explicit user action
          v
Commerce Intent Artifact
          |
          v
Commercium Listing / Offer Draft
          |
          | seller review
          v
Published Offer
          |
          | buyer authorization
          v
Transaction / fulfillment
```

Reverse flow:

```text
Commercium listing / object / service
          |
          | explicit share action
          v
Nexus Share Artifact
          |
          v
Nexus draft
          |
          | separate publication
          v
social discussion
```

## Conversation–Transaction Separation

This edge strongly reinforces a new general law:

> **Social expression and economic authorization are different acts.**

Examples:

- “I want one” in a Nexus reply is not a signed purchase.
- “I recommend this maker” is not a guarantee of product quality.
- joining a channel does not subscribe the participant to paid services.
- reacting to a listing does not authorize MANA transfer.

Economic execution must occur inside a destination-native Commercium flow with explicit price, custody, recipient, and receipt information.

## Social context cannot become wallet exposure

Nexus should not receive broad access to:

- wallet balances;
- complete purchase history;
- private payment receipts;
- Treasury interactions;
- financial capacity estimates.

Commercium should not receive broad access to:

- private groups;
- private messages;
- Hope history;
- the complete social graph;
- engagement metrics unrelated to the transaction.

Candidate law:

> **Social identity may contextualize a transaction without becoming financial surveillance, and economic history may support a bounded transaction without becoming social status.**

## Optional sovereign faculty projections

This edge is the first deliberate test of the multi-faculty hypothesis.

### Hope projection

Possible legitimate uses:

- a user-authored maker intention or story;
- a deliberately selected reflective statement explaining why an object/service matters;
- a private buyer reflection seed after an exchange.

Hope must not become persuasive profiling for conversion optimization.

### Tempus projection

Possible legitimate uses:

- event-market timing;
- availability windows;
- seasonal/astronomical craft context;
- delivery or event schedule context.

Tempus must not create urgency loops such as “buy now or miss your destined window.”

### Vitae projection

Possible legitimate uses:

- selected factual training/practice provenance relevant to a craft or service;
- bounded capability evidence where safety requires it;
- creator curriculum provenance when voluntarily disclosed.

Vitae must not become a market rank or purchased prestige credential.

This supports the idea that Hope, Tempus, and Vitae are **optional sovereign contexts**, not exclusive edge owners.

## Recommendation–Warranty Separation

Nexus is naturally capable of carrying opinions, reviews, recommendations, and community discussion.

Commercium may carry factual claims about offers and transactions.

These must remain distinct.

Candidate classes:

```text
social opinion
community recommendation
seller declaration
verified product fact
transaction receipt
independent attestation
```

ARCnet should not silently promote one class into another.

Candidate law:

> **Recommendation is social meaning; warranty and verification require separate authority.**

## Social proof boundary

The system may show bounded factual information such as:

- number of completed transactions where policy permits;
- verified fulfillment events;
- dispute status;
- maker identity continuity where disclosed;
- item provenance.

It should resist collapsing these into a universal seller score that spills into human worth.

If ratings exist later, they should be narrow to the transaction domain and should not alter Vitae, governance legitimacy, or core social dignity.

## Marketplace discovery pattern

A Nexus card could expose:

```text
View in Commercium
```

This may derive only the relevant reference:

```text
origin post
selected item reference
seller reference
optional social context
```

Commercium then opens the authoritative listing or creates a draft if one does not yet exist.

Likewise, a Commercium listing could offer:

```text
Discuss in Nexus
```

which creates a Nexus draft referencing the listing without exposing buyer data or private economic receipts.

## Economics boundary

This edge directly touches MANA, but the **edge crossing itself should not spend MANA** merely because a social object links to a market object.

Economic authorization occurs when the participant performs a Commercium-native action such as:

- buy;
- pay for service;
- authorize escrow;
- pay shipping/fulfillment;
- pay an explicitly disclosed marketplace utility fee.

The canonical Economic Constitution remains controlling.

## Settlement boundary

Most social discovery actions require no chain settlement.

A purchase or other economic transfer may require settlement according to the economic/protocol design.

The edge must preserve the distinction:

```text
Nexus discussion
!=
Commercium offer
!=
transaction authorization
!=
finalized economic receipt
```

## Candidate action registry

### Nexus → Commercium

- `open-listing-reference`
- `create-offer-draft-from-post`
- `create-request-for-goods-or-service`
- `open-maker-profile-context`
- `create-purchase-intent`

### Commercium → Nexus

- `create-discussion-draft`
- `share-listing-draft`
- `share-object-provenance-summary`
- `share-fulfilled-project`
- `request-community-feedback`

Names are illustrative.

## New patterns extracted

1. **Conversation–Transaction Separation** — speech and economic consent are different acts.
2. **Recommendation–Warranty Separation** — social meaning does not become verified commercial fact.
3. **Social–Financial Compartmentalization** — social context and financial history remain narrowly separated.
4. **Bounded Market Evidence** — transaction evidence may inform a market context without becoming universal human ranking.
5. **Multi-Faculty Context** — Hope, Tempus, and Vitae can each contribute optional bounded projections to one edge.

## Reconfirmed laws

This edge also supports:

- Derived Artifact Law;
- Two-Phase Passage;
- Monotonic Disclosure;
- Authority Conservation;
- Provenance Without Surveillance;
- Destination Economics;
- Transport Independence;
- Non-Transitive Edge Authority.

## Open questions

- Should Nexus host reviews directly, or should reviews be Commercium records selectively surfaced in Nexus?
- How should seller reputation remain useful without becoming an identity-wide score?
- Which commercial claims require Protection or independent verification?
- How should disputes be discussed socially without leaking private transaction evidence?
- Can a Nexus community organize group buying without the group itself gaining wallet authority?
- Which Vitae capability evidence, if any, is appropriate for safety-sensitive services?

## Next gate

Compare this relationship against Nexus ↔ Theatrum, where social discovery leads not to physical/economic exchange first, but to digital/cultural creation and publication.
