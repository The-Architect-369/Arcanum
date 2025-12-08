# 4. Tokenomics — Mana

> **Status:** Framework defined; numeric parameters **TBD** (pending cost modeling and Polygon fee assumptions).

## 4.1 Overview
**Mana** is the native utility unit of the Arcanum. It:
- **Rewards** verified participation (practice‑to‑earn via **Tempest** rites).  
- **Prices access** to features (**Hope** updates, **Vitae** knowledge unlocks).  
- **Enables creation & trade** on **Arknet** (posting, room/channel creation, purchases, and likes/tips).  
- **Facilitates P2P exchange** and (future) **NFT marketplace** activity.

## 4.2 Issuance & Supply
- **Earned issuance:** Completing **Tempest** rites mints Mana to the participant. Anti‑bot mechanisms and rate limits apply.  
- **Purchased issuance:** Users may **purchase Mana with fiat** via an on‑ramp; minted 1:1 to buyer.  
- **No free faucets** beyond verified rites.  
- **Supply policy:** Elastic; net supply governed by the balance between **earn** (rites/purchase) and **sinks** (see below). Parameterization subject to governance.

> **TBD Parameters (to fill when costs known):**  
> - Rite reward schedule (base, streaks, caps)  
> - Fiat price banding / oracle source  
> - Anti‑inflation mechanisms (e.g., dynamic sink pricing)  

## 4.3 Sinks & Utility
Users **spend Mana** to:
- Update **Hope** state/memory.  
- **Create/post** rites, images, texts on **Arknet**.  
- **Open** rooms/channels; advanced moderation tools.  
- **Access** **Vitae** texts/collections.  
- **Protocol fees:** Marketplace listing, transfer, and optional creation fees.

## 4.4 Creator Flows (Arknet)
- **Posting cost:** Creator pays a posting cost (sink).  
- **Sales:** Peers purchase a rite/work for a price set by the creator; protocol splits funds per policy.  
- **Likes/Tips:** Micro‑payments route directly to creators (less protocol fee, if any).  
- **Example:** If a rite costs creator **100 Mana** to publish and sells at **10 Mana**,  N purchases = 10N Mana gross to creator (minus fee).

## 4.5 Treasury & Revenue
- **Multi‑tier treasuries:** Protocol, Community, Grants (Gnosis Safe).  
- **Revenue sources:** Portion of posting fees, marketplace fees, and fiat purchase margin (if any).  
- **Allocation policy:** Periodic disbursements to development, audits, grants, and reserves—governed by community voting.  
- **Architect compensation:** Transparent streams from designated treasury per governance policy.

## 4.6 Governance Link
- **Parameters on‑chain:** Reward curves, fees, caps, and treasury splits adjustable via proposals.  
- **Emergency levers:** Temporary throttles on issuance or sinks during incidents; require on‑chain justification and sunset.

## 4.7 Risk Considerations
- **Speculation risk:** Emphasize utility over price.  
- **Security:** Custody remains with users; smart contract risk mitigated via audits/bounties.  
- **Regulatory:** See §5 for treatment of **Mana** as a utility token; consult counsel.

## 4.8 Open Questions / Placeholders
- Target daily issuance per active user: **TBD**  
- Posting/creation base cost: **TBD**  
- Fee split \(creator : protocol : community\): **TBD**  
- Fiat price bands & regional adjustments: **TBD**  
