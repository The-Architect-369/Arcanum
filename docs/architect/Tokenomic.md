docs/tokenomics/00-Tokenomics-Overview.md
Arcanum Tokenomics (v1)

Scope. This section defines the economic primitives that power Arcanum: the utility token (MANA), non-transferable participation credits (RITES), and the treasury/market operations that stabilize value. These plug into the modules and gates already defined for Tempus, Core UI, and the Master Index.

Roles at a glance

MANA (utility token). Transferable, on-chain, spent across ARCnet/Nexus, Tempus event creation, Hope stylize, group joins, boosts, and DLC stubs. It is used—not just held. Prices are visible pre-confirm and follow the Economy Policy herein.

RITES (participation credits). Non-transferable points earned by doing Tempus rituals/quests (Clock/Calendar cadence). Users may convert RITES → MANA via a weekly, system-wide throttle that flexes with treasury health and net sinks. (This preserves UX while keeping issuance sustainable.) Reward math and cadence come from your Tempus calendar plan.

ARC (future, optional). Governance/voting escrow representation (non-transferable voting power derived from staked/locked MANA). Not required at launch.

Why a utility token?

Arcanum’s value loop is usage-based. Users spend MANA to create value (events, posts, rites, styles, groups), while RITES ensure day-to-day play/participate → earn stays fun and non-speculative. This separation lets you keep Tempus rewarding without dumping raw token inflation into markets. (See Tempus gates and module pricing placeholders in Core UI.)

System flywheel

Participate (Tempus): Users complete time-based rites → earn RITES per your zodiac/lunar/planetary plan (11,280 “MANA-equivalent” per perfect year becomes 11,280 RITES in this model).

Convert: Weekly budget converts queued RITES → MANA pro-rata.

Spend: Users spend MANA on ARCnet posting/boosts, Tempus event creation, Hope stylize, Text groups, Vitae DLC.

Value capture: In-app fees route to buy-and-burn MANA and to the treasury buffer.

Stability: Treasury runs a light price-corridor policy (buys below, provides/sells above) and maintains protocol-owned liquidity.

Launch posture

Chains: Sepolia for dev, Ethereum mainnet for prod; wallet flows remain per Core UI/Wallet posture.

Tempus modules and rewards UI already specced (Codex | Clock | Calendar).

Reward math and pacing are anchored to your calendar (12 zodiac, 8 lunar reflections × 12, 45-week planetary).

docs/tokenomics/10-Economy-Policy.md
Monetary policy
Two-circuit design

RITES → MANA. Users accumulate RITES via Tempus. A weekly conversion budget (global) mints MANA only up to a function of net token sinks + a share of protocol revenue. This keeps emissions reflexive to real usage.

Weekly conversion budget (v1):

Let X = (30d net MANA burned/sunk) + (k × 30d net protocol fees), with k = 0.30
Budget_week = min( X , max( α × POL_value , β ) )
α = 0.5% ;  β = 50,000 MANA ; per-user weekly cap = 500 MANA


All claimants receive MANA pro-rata by RITES queued that week. Unused budget does not accumulate.

Sinks (spend/burn)

Tempus: Create Event — default 25 MANA; route 50% to burn, 50% to treasury. (Adjustable by surge factor at high load.) Gate aligns with Tempus spec.

ARCnet/Nexus posts & boosts — posting cost + optional boosts.

Hope stylize (cosmetics only).

Text groups — create/join fees.

Vitae DLC — future stubs.

Fees & routing (v1 posture)

In-app net fees (fiat/crypto purchases, DLC, premium):

50% buy-and-burn MANA

30% treasury (reserves/POL)

20% builder grants (retroactive)

Treasury & AMO

Arcanum Reserve (Gnosis Safe): holds stables + ETH; later, conservative RWA.

AMO corridor (initial):

Lower band = 30d TWAP − 12% → buy up to 0.75% of reserve USD/day.

Upper band = 30d TWAP + 18% → provide liquidity / sell up to 0.5%/day.

POL: maintain baseline concentrated-range liquidity to damp volatility.

Staking (two modes)

Feature-Locks (stake-to-enable). Spend 100 MANA to enable a permission or feature; turning it off returns 90 MANA (10% sink). This is utility staking, not yield, and maps cleanly to your ACC/MANA gates.

Stake-to-Boost (fee-backed) (optional after T+60d). Users stake MANA into a Boost Pool that distributes fee-denominated rewards (from the 20–50% fee lanes above). No “guaranteed APY”; rewards scale with actual app revenue.

Rite marketplace (creator economy)

Goal: Let creators spend MANA to publish Rites (templated), set a price, and share proceeds with completers to drive participation. Ties directly into Tempus themes.

Publish Rite: 100 MANA (sink). Rite metadata: template (e.g., Venus/Sagittarius/Element), price (e.g., 10 MANA), and optional completion rebate.

Purchase/Save Rite: 10 MANA default (split: creator share vs. system fee).

Completion rebate (optional): Creator can earmark 0–10 MANA as a rebate to successful completers (proof rules below). If rebate > 0, it is escrowed from creator proceeds at purchase time to avoid underfunding.

Why buy? Access to the rite flow, achievements/ratings, creator reputation, and optional rebate if completed on time.

Why create? Break-even at 10 purchases (100/10), profit afterward; potential to be canonized if highly rated.

Proof & storage. On completion, clients upload proof artifacts to IPFS (photo, short clip, GPS/time hash). The chain stores content hashes + attestations, not heavy media. (Tempus rules decide windowing.)

Ratings & tiers. Rites accrue star ratings and “Gold/Platinum” tiers after thresholds—driving creator discovery and future canon picks.

Onboarding $1 flow (lean launch)

User pays $1 via fiat on-ramp; funds settle to Gnosis Safe.

Backend orchestrates: mint DID / chain code, initial MANA grant, wallet connect.

You can phase in IPFS-hosted payment servers later; not required for T-0. (Modules/gates unaffected.)

docs/tokenomics/20-Parameters-v1.md
Day-1 parameters (editable)
Area	Param	v1 Value	Notes
Tempus rewards	Annual RITES target (perfect play)	11,280	Mirrors existing calendar math; now credited as RITES instead of raw MANA.
Conversion	Weekly global budget β	50,000 MANA	Lower bound issuance throttle
Conversion	α × POL guardrail	0.5% / week	Upper guidance by reserves
Conversion	Per-user cap	500 MANA/week	Anti-whale, anti-sybil backstop
Tempus sink	Create Event	25 MANA	50% burn / 50% treasury
ARCnet	Post	10 MANA	May vary by channel/size
ARCnet	Boost	3–15 MANA	Duration-based
Hope	Stylize slot	10–40 MANA	Cosmetics only
Text	Create/Join Group	20/5 MANA	Anti-spam
Rite mkt	Publish rite	100 MANA	High value = fewer, better rites
Rite mkt	Purchase rite	10 MANA	Split: creator/system/escrow
Feature-locks	Refund on disable	90%	10% permanent sink
Treasury	Buy band	TWAP − 12%	Buy up to 0.75% reserves/day
Treasury	Sell band	TWAP + 18%	LP/sell up to 0.5%/day
Fees	Routing	50/30/20	Burn / Treasury / Retro-grants

Module gates & routes referenced here are defined in Core UI Guide and Master Index (header MANA viewport, ACC gating, footer tabs, Tempus sub-pages).

docs/tokenomics/30-Launch-Plan.md
Phased rollout (T-90 → T+90)

T-90 → T-14: Testnet hardening

Sepolia: ACC onboarding modal, DID mint, initial MANA grant, header viewport, footer tabs, Tempus pips.

RITES accrual live (Tempus Clock/Calendar); conversion off.

Basic sinks wired: ARCnet Post, Tempus Create Event.

T-14 → T-0: Mainnet genesis

Seed treasury (Gnosis Safe), deploy MANA, enable LBP or initial liquidity + POL.

Turn on fee routing (buy-and-burn + treasury).

Turn on RITES→MANA conversion (β=50k; α=0.5%).

T+1 → T+30: Marketplace & feature-locks

Enable Rite Marketplace (publish/purchase/rebate/ratings).

Enable Feature-Locks (90% refund).

Publish weekly economy dashboard (burn, issuance, RITES queue, sinks, POL depth).

T+30 → T+90: AMO tuning

Evaluate corridor widths; adjust bands ±3–5% if needed.

Consider Stake-to-Boost pool (fee-backed), not inflation-backed.

Risks & mitigations

Emission shock: RITES→MANA budget ties to sinks + fees; per-user weekly cap enforced.

Sybil/botting: ACC gating; device attestations; proof rules on rites; creator escrow for rebates.

Speculative spiral: Fees fund burn/treasury; AMO corridor dampens extremes.

UX confusion: Keep wallet/MANA viewport simple (header), show costs pre-confirm, route restricted actions to ACC modal.

How this maps to current app

Tempus already defined with Codex | Clock | Calendar, ACC gates, and “MANA to create events”—these become your first sinks; RITES uses your reward math unchanged.

Core UI already specifies header MANA viewport, footer tabs, and gating UX—drop these prices/flows in and you’re consistent across modules.

Master Index maps routes and cards across modules so Economy knobs stay discoverable and predictable.

Appendix A — Rite Templates (starter set)

Use 25 base correspondences (elements × planets/zodiacs per your canon) as publishable templates; the system or creators parameterize prompts so no two rites are identical, while verification remains consistent (time window, media proof hash, location optional). Tempus retains ownership of canon, while community editions can be canonized via ratings and usage over time.