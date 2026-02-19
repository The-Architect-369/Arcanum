---
title: "Technical Architecture"
status: draft
visibility: public
last_updated: 2026-02-18
description: ""
---


# Technical Architecture
> **Design goals:** user sovereignty, minimal custodianship, composability, security, and graceful recovery.

## 3.1 Layered Overview
- **Identity Layer:** Decentralized Identifiers (DIDs) and **Soul‑Bound Identity** anchoring each participant.  
- **Settlement Layer:** Smart contracts on **Polygon** (EVM) for cost‑efficient execution.  
- **Data Layer:** Content-addressed storage via **IPFS**; peer networking via **libp2p**.  
- **Treasury Layer:** Multi‑tier treasury using **Gnosis Safe** for programmable, multi‑sig control.  
- **Access & UX:** Wallet + passkey onboarding; account recovery flows; fiat on‑ramp for chain code purchases.  
- **Modules:** Hope, Tempest, Vitae, Arknet—composable services with clear on-chain/off-chain boundaries.

## 3.2 Identity & Access
- **DID/SBI:** Each user mints a **chain code** identity (non‑transferable). Attestations (e.g., rites completed) bind to this identity.  
- **Onboarding:** Passkeys (WebAuthn) first; optional wallet linking.  
- **Recovery:** Social or multi‑factor recovery; guardian options configurable by the user.  
- **Privacy:** PII minimized; selective disclosure for attestations; data remains user-controlled.

## 3.3 Contracts & Services
- **Mana Core:** Minting via rites; purchasing via fiat on‑ramp; burning/sinks via feature usage.  
- **Arknet Marketplace:** Post/listing contract; purchase/like (tip) flows; revenue split routing.  
- **Hope Service:** Stateful guidance; writes to memory/state cost Mana.  
- **Vitae Access:** Pay‑per‑view/unlock via Mana; caching with content addressing.  
- **Tempest Engine:** Rite registry; proof-of-completion attestations; anti‑spam/anti‑bot checks.
- **Treasuries:** Tiered Gnosis Safes (e.g., Protocol, Community, Grants). Policy‑driven disbursements.
- **Observability:** On-chain event logs + off-chain analytics with privacy safeguards.

## 3.4 Data & Storage
- **Content:** Stored on IPFS; references pinned by the community/curators.  
- **Metadata:** Minimal on-chain metadata (content hashes, authorship, pricing).  
- **Comms:** libp2p for p2p channels/rooms; moderation signals (votes) written on-chain.

## 3.5 Interop & Payments
- **Wallets:** EVM-compatible wallets; optional custodial wallet for newcomers.  
- **Fiat on‑ramp:** Providers for card/ACH; compliance handled by provider.  
- **Bridges (future):** Optional cross‑chain deployments as demand dictates.

## 3.6 Security & Audits
- **Audits:** Third‑party contract audits prior to mainnet launch.  
- **Bounties:** Ongoing bug bounty program.  
- **Key Management:** Multi‑sig for treasuries; time‑locks on critical upgrades.  
- **Resilience:** Snapshot/rollback procedures for critical failures; see §6 Governance (Stability Guard).

## 3.7 Versioning & Rollback
- **Modular upgrades:** Feature flags and contract proxies where appropriate.  
- **Stability Guard:** Architect may trigger a **rollback to last stable state** during the **alpha/beta** phases. This power is transparently logged and **sunsets** at v1.0 unless extended by community vote.
