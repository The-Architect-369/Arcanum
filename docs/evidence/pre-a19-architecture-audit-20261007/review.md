# Pre-A19 architecture and authority audit — October 7, 2026

## Scope and authority

Starting main: `a07cebf7e0941a52be8961c349522488cf87b9a3`; repository index source
`29cea02a6`. The Human requested analysis of construction, canon, governance and
economy, plus concrete improvements before A19. Later clarification: the phone is
the intended home; Rust/Kotlin remain the technical direction; participants should
not have to install Termux or connect development providers for ordinary use.

Grounding: live-file, bounded partial scan. This audit covers documentation entry
points, selected controlling doctrine, Economic Constitution, governance/Treasury
contracts, native decisions and A18 boundaries, web wallet spending, and the chain
MANA/Treasury implementations. Subsequent steering added a full metadata inventory
of 191 Vitae Markdown files and selected review of curriculum, grade/authority and
web practice sources. It is not a line-by-line audit of all Vitae curricula,
providers, protocol security or economic sustainability. The preceding environment
audit proved selected access paths; it did not certify the entire architecture.

## Conclusion

The existing separation of participant custody, native host, shared runtime,
optional adapters and narrow settlement remains a useful foundation. A wholesale
rewrite is not justified by the inspected evidence. Improvements should make those
boundaries legible and enforce them where prototypes currently blur them.

## Findings and disposition

| Priority | Finding and evidence | Disposition |
| --- | --- | --- |
| P1 | `apps/web/src/state/useAccount.ts` used one `mana` field for fetched chain balances and local preview deductions. Its spend function produced a confirmed receipt without submitting a chain transaction. `lib/economy/economy.ts` added a second confirmed receipt and lost the caller's purpose. | Candidate prevents local debit/credit of a chain-associated account, emits one informational preview receipt with `settlement=not_submitted`, and preserves purpose. Existing historical receipts are not rewritten. |
| P1 | `lib/wallet/context.ts` fell back to the first balance when the requested denomination was absent. A malformed balance could become NaN and evade the insufficiency comparison; fractional/unsafe numbers were accepted or rounded. | Candidate requires exact denomination and valid safe integer amounts. This is a guard for the existing Number-based prototype, not a production monetary arithmetic design. |
| P1 before activation | `chains/arcanum/x/mana/keeper/keeper.go` Spend subtracts a balance without identifying a recipient/reserve or changing supply. The message receipt reports only purpose/amount. Treasury keeper has no custody/execution implementation. | No monetary mechanism is selected by this patch. Before activation, define sink/transfer/burn treatment and reconciliation against Economic Constitution §5.7, then test conservation, receipts and authority. Presence of chain code is not a complete economic implementation. |
| P2 | `docs/index.md` presents the CE-W03 dated baseline as current; root README omits the Economics directory and ends inside an unclosed command fence. Older overview formatting and pre-native scope can obscure later accepted direction. | Repair navigation and fence; identify dated sources explicitly. Add a derived ownership/authority map with current evidence links. Preserve old canon and dated bodies. |
| P2 before activation | Governance specification supplies multi-factor candidates and recommended thresholds; governance permission/lifecycle/council pages remain canonical-draft with explicit open activation questions. | Treat them as bounded design, not deployed institutions. Define electorate/eligibility, evidence privacy, weighting/capture controls, review bodies, appeals, revocation and execution policy before activation. |
| P2 portability | A18 uses home-computer inference; native development still reaches a separate Termux broker. Provider-mediated construction is not yet the intended packaged participant experience. | Record the actual dependency map and proposed newcomer journey. No gateway relocation, new adapter, package redesign or implicit A19 expansion. |
| P2 corpus | 189 of 191 Vitae Markdown files are draft despite some canonical claims in their bodies. The grade and post-Grade-X Adept thresholds and specialization catalogs need reconciliation. Earlier permission drafts constrain even private drafting more narrowly than the Human's October 7 direction. | Add a sourced participant journey proposal; preserve original drafts and distinguish open creation, opt-in trials, eligibility, appointment and shared adoption. No permission activation. |
| P2 navigation | Vitae index points to absent authority/curriculum/module pages and claims Classes 01–10 where current content exists only under Classes 01–03. | Correct current navigation and explicitly identify the unsupported earlier tree claim. No curriculum body is rewritten. |

## Canon and governance tensions requiring care

The economic document hierarchy is explicit and useful. Numerical issuance ceilings,
Genesis distribution, rewards and routing remain unresolved in Economic Constitution
§4.7 and §5.7.6. Lower summaries or code defaults must not silently fill those gaps.
The chain prototype needs separate verification against that hierarchy before any
live economy claim.

Governance can consider stake, longevity, participation and recognition under the
specification, but “multiple factors” alone does not demonstrate capture resistance
or privacy. A concrete design must show how wealth, activity and recognition cannot
become a universal social-credit score. This is an unresolved engineering/design
obligation, not a finding that an implemented governance system already violates it.

Doctrine preserves permanent recognition while draft governance supports suspended
authority envelopes. Those can coexist if historical recognition is kept separate
from current delegation/appointment. A permission implementation must model that
separation explicitly rather than infer irrevocable access from a recognition.

Founder-transition doctrine retains a conditional legacy allocation example; the
Economic Constitution forbids title-based automatic/perpetual entitlement and leaves
actual compensation mechanics deferred. The legacy example is not an adopted rate.
No founder allocation, governance formula or constitutional text is changed here.

Several foundational Markdown documents contain escaped frontmatter/headings and
legacy presentation artifacts. Normalization would change checksum-pinned bytes;
this audit leaves them intact and supplies clean navigation. Any normalization pass
should prove semantic equivalence and preserve provenance through its own review.

## Bounded implementation

The wallet fix is limited to the transitional web prototype. Native APK behavior,
Rust storage, A19/A20, protocol monetary code and provider configuration are unchanged.
No transaction is submitted. Positive-cost actions against chain-associated accounts
now fail before local debit; the Nexus publish path also checks before media upload.
That preflight checks the starting account state; an account change during awaited
uploads can still make the final spend guard fail after upload. This patch does not
claim atomic publication/payment or removal of previously uploaded content.
Zero-cost actions remain allowed without a receipt. Local preview counters retain
existing prototype behavior and are explicitly not settled MANA.

Legacy account state does not persist a trustworthy typed balance-source enum; it
still derives presentation from address/status text. Production wallet work should
replace that with explicit source, denomination, exact integer units, observation
coordinates and separate pending operations. This patch prevents the identified
spend/credit confusion; it does not certify the whole wallet or repair old receipts.

No constitutional source, checksum map, old dated log event, sealed epoch or session
index is edited. Proposed economic/governance decisions remain visible in this
record. This candidate requires review and applicable merge authority before adoption.

## Verification

Behavioral fixtures execute the actual TypeScript guard, account and economy modules
with inert persistence/query dependencies: exact denomination, invalid amounts,
insufficient funds, confirmation requirement, preservation of chain-associated
balances, one preview receipt, purpose continuity and zero-cost behavior.
The synchronization gate includes those fixtures. Full repository validation and
exact-head CI are recorded with the candidate PR, not inferred from this document.
No real participant account, funds, private reflection or external publication is
used in tests.

## Recommended sequence

1. Review these navigation and prototype-boundary fixes.
2. Review the [participant journey](../../architecture/participant-journey-proposal.md)
   and [simulation/chronology plan](../../architecture/simulation-and-chronology-plan.md)
   before opening A19, as requested. Open creation, consenting group trials and
   reviewed broad architect responsibility are recorded Human directions. The
   proposed detailed workflows and grade mappings are not activated policy.
3. Prepare bounded economic and geometry simulations before ratifying monetary
   numbers or stronger topology claims. Agent C readiness remains unverified.
   Preserve the separation of factual Tempus history, authorized policy schedules
   and optional community narrative. Simulation results cannot ratify themselves.
4. Keep A19's storage contract bounded; broader platform implementation is not an
   invented storage prerequisite. The Human may choose the scheduling of research.
5. Separately design native guided building and dependency removal, with an offline
   install/use/restart/recovery acceptance test and explicit unavailable states.
6. Before economic/governance activation, settle the identified monetary operations,
   accounting, scoped authority and appeal rules, then model and falsify them.

The [authority and implementation map](../../architecture/authority-and-implementation-map.md)
connects these concerns without inventing another source of constitutional authority.
