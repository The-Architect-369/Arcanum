---
title: "Bounded current-state projection profile"
status: implementation-candidate
visibility: public
last_updated: 2026-10-07
---

# Bounded current-state projection profile

Review checkpoint: `PRE-A19-RECON-20261007-R1`. The Human approved the repository
candidate following the bounded reconciliation, then directed implementation.
That grant covers this profile, reviewed object seed, generator, fixtures, derived
views, present-state pointers and deterministic repository-index companion.
Canonical adoption, deployment, provider changes and agent dispatch retain their
separate gates. This candidate does not claim they occurred.

## Source and authority contract

`coherence/objects.json` is a finite, manually reviewed selection of public project
facts, not a replacement ledger or an automatic provider importer. Every object
conforms to the unchanged adopted
[continuity-object schema](../../specs/runtime/sovereign-continuity-object.schema.json).
This profile narrows that schema to public, metadata-only arc/evidence objects in
`architect.public-coherence`, with retention authorized for this candidate and no
replication. Private Hope/Journey interiors and derivatives are excluded. Schema
validity does not authenticate consent, grant references or the truth of a claim;
Human review of source selection remains necessary.

The generator reads only the named seed and schemas plus its explicit provenance
paths. Repository evidence is pinned to a full commit and SHA-256 of the source
bytes. The sole unpinned source is this reviewed profile, also digest-bound, for
selected recovered reports and the current implementation grant. It performs no
network reads, provider writes, private-store reads or runtime operations.
External links below locate originals; they are not fetched on regeneration.
Missing source bytes or digest mismatches produce a partial projection and a failing
check. Invalid custody or malformed objects are rejected before writing any view.

### Field precedence

For repository identity, era, wave, completed arc, epoch, continuity gaps and source
conflicts: `canonical-repository > operational-record > derived`.
For scheduled next/following arcs, baselines, implementation gate, outstanding
Human decisions, extension proposals and Agent C reports:
`human-decision > operational-record > canonical-repository > derived`.
These orders apply only to the named fields, not to doctrine or other subjects.
Provider location never authenticates Human authority.

Only observation/report claims compete for present facts. Hope and spatial extension
fields accept only proposals and are always labeled proposed. Inferences and unknowns
remain visible but cannot establish a fact. Equal-authority incompatible claims stay
unresolved; timestamps never choose a winner. Explicit `supersedes`/`corrects` edges
apply only to overlapping evidence fields for the same subject, from an eligible
claim of equal or higher authority with a basis reference. A lower-authority claim,
proposal, missing source or later timestamp cannot suppress stronger evidence.
Cycles, dangling edges, duplicate IDs and unsupported vocabulary fail validation.
The seed uses `precedes` for schedule and `evidence_for` for support. It does not
invent `next`, `ratified_by` or `verified_by` relationship types.

The A18 arc uses the local seed label `ARC-A18`; no external work-registry number
is inferred. `ARC-50` and `ARC-51` retain the recovered A19/A20 planning identities.

The six effect dimensions remain independently recorded on every object. Unknown
states are not promoted by an arc label or successful generator check. Those vectors
refer to evidence-object adoption, not automatically to the effects described in
its payload; original closure records retain their own effect evidence.

## Recovered planning report

This section preserves minimized results of the October 7 bounded reconciliation,
not a fresh provider read or new ratification. Exact provider observation times were
not retained here; do not fabricate them. The source content dates below remain
separate from this report's recording date. Missing provider revisions stay unknown.

- [A19 / ARC-50](https://app.notion.com/p/3df2bb4420b8812b9242d99516dc639d),
  content last modified September 20: encrypted individually addressable Hope
  records; protected temporal index; truthful migration of the one surviving legacy
  reflection; chronological retrieval; explicit deletion, retention, corruption and
  redaction behavior; factual Tempus references. Model access, profiling, scoring,
  automatic sharing, synchronization and developer access to private interiors are
  outside that baseline. Collection and physical acceptance tests remain ahead.
- [A20 / ARC-51](https://app.notion.com/p/3df2bb4420b881fb86a0c0f68552a04e),
  content last modified September 20: optional geometry and accessible controls share
  semantic destinations; preserve Home/crest, Back, focus, escape, gestures and privacy.
  A20 leads to CE-W04 review, not automatic wave closure or CE-W05 activation.
- The recovered operational dashboard retained an older A18-pending presentation;
  the A19 work record retained its pre-closure predecessor block. These are reported
  projection lags, not evidence that A18 reopened. The dashboard's precise block
  revision is not retained in this seed and must be re-read before any provider edit.
- [October 5 Drive handoff](https://drive.google.com/file/d/12ISCCDmeQtAedKx3BGLLJWjz0XN3JT56/view)
  describes the earlier 07:01Z research state. Keep that original snapshot unchanged.
  [WS-RQ-009](https://app.notion.com/p/3e42bb4420b881e6a633ecabfd01468e) was subsequently
  recovered as approved_active for bounded research. Agent C's exact destination,
  reachability, Memory-off setting and schedule state remain unverified. No Agent C
  run was launched in the reconciliation. This is not proof of present agent liveness.

## Proposed extensions and unresolved decisions

The Human described unchanged reflection originals with linked later additions,
archival and consent-based Hope model access. These are proposed extensions, not
implemented Hope capabilities. Participant-controlled deletion is already part of
the A19 baseline; forced retention is not approved. A18's implemented local model
serves Architect development evidence, not private Hope reflection access.

The broader spatial-semantic direction proposes multiple geometric lenses over
stable objects and relationships, declared coordinate frames and explicit projection
omissions/emphasis. It is not a ratified expansion of A20. Source-corpus, Equinox and
responsible Vitae remain separate horizons.

Human decisions still needed before implementing extensions: whether Hope model
access and linked-addition/archival semantics amend A19 or follow separately; whether
the broader spatial-semantic work amends A20 or remains separate. No new decision
is needed to retain the existing A19 deletion baseline. Approval of this bounded
projection does not make the full coherence substrate an A19 prerequisite.

## Source identity and preserved history

The seed's observed canonical base is
`052bdc42a8aba8e246719cf9493c0df11a612e92`, freshly resolved from remote main
on October 7 before this branch was created. This is a dated base observation,
not a claim that future main always equals that SHA. A18 closure was adopted by
[PR89](https://github.com/The-Architect-369/Arcanum/pull/89); the
[closure record](../../evidence/ce-w04-a18-local-20261003/closure-review.md)
retains the APK source, release promotion, installer and verification identities
separately. None of those effects is repeated here.

The September 20 CE-W04/A14/Stage 1 scheduling ratification stays historical.
Dated log entries, accepted core instructions, sealed epoch and session index stay
unchanged. An empty active `sessions` array is valid and does not prove missing
history was lost. External numbering remains unreconciled. This seed allocates no
ARC-SES IDs and reconstructs no missing records.

## Generation and verification

Run `python3 scripts/architect/generate-current-state.py` to regenerate all three
views. Run it with `--check` for read-only byte comparison, then run
`python3 scripts/architect/test-current-state.py`. The synchronization verifier
runs both. Python standard library is sufficient: the generator validates the
closed JSON Schema subset actually used here, rejects unknown assertion keywords,
and does not claim to implement all of Draft 2020-12.

The output schema is `current-state.schema.json`. UTF-8/LF output and sorted object
IDs/keys are deterministic. The seed's explicit `as_of` is the snapshot time, not
wall-clock generation time. Event, observation and recording times remain distinct;
unknown event times stay null. Recording cannot precede observation. Timed activation
windows are outside this bounded profile and are rejected rather than ignored.
No output contains its own commit SHA or a volatile
current-HEAD query. Source object IDs and exact provenance accompany each field.

`coherence-chronicle.md` is a mechanical transition trace of the A18 pending/closure
claims, A19/A20 planning and projection gate. It is not a complete history or a substitute for the log. It infers no events, session IDs or causation.
A new source observation requires reviewed seed changes, not merely regeneration.

Recovery: regenerate disposable views from the reviewed seed. Close an unaccepted
candidate; after adoption use an additive revert if needed. Never rewrite certified
history. Future provider projections and startup integration require separate
bounded work; no current provider dashboard is changed by this implementation.


## October 7 operational baseline follow-on

At 09:02Z, the earlier projection candidate has been adopted through PR90 at main
`f839027a3c82197d0087e0a530126f67b884618a`. The Human then requested merge, cleanup,
archival and capability verification across Ubuntu, Termux, GitHub, Notion and Drive.
This bounded follow-on records environment observations and their limitations; it
adds no A19 implementation, private Hope model access or Agent C dispatch authority.
The earlier candidate gate above remains its original historical grant.

Fresh Notion readback confirms the dashboard supersession notice, the historical
handoff notice and A19 Ready state. The older A18 predecessor block is cleared;
September 20 acceptance criteria remain intact. Old profile observations retain
their original bytes through pinned PR90 provenance and are superseded only for
canonical base, implementation gate and source conflicts. No closed event is edited.

See the [dated operational report](../../evidence/operational-baseline-20261007/review.md)
and [capability register](operational-capabilities.md) for actual tests, archival
receipts and retained exceptions. This is a new reviewed observation, not a live
provider refresh performed by the generator. The observed main above is the starting
baseline for this follow-on, not a claim about every future main head.

## October 7 pre-A19 architecture and decision reconciliation

The Human requested the architecture/canon/governance/economy audit and bounded
fixes, then reviewed the resulting plan favorably and explicitly requested that
outstanding decisions be carried into this derived view and Notion. This section
records that current-chat direction; exact speech timestamps are not asserted.
No constitutional ratification, monetary parameters, A19/A20 implementation,
Agent C dispatch, merge, deployment or installation is established by this review.

Observed canonical main remains `a07cebf7e0941a52be8961c349522488cf87b9a3`.
The review candidate is [PR92](https://github.com/The-Architect-369/Arcanum/pull/92),
whose initial source/index head `7b204e6f52051f498c474b6694c6d7e9c33cbc52` passed
the local frozen install, eight wallet-boundary tests, 15 synchronization gates,
lint, typecheck and Node 24 build. Those results apply to that exact candidate;
subsequent projection updates require their own verification.

Recorded Human direction: a self-contained phone experience; open private creation
across domains; consenting small-group trials before Adept; broader reviewed
architect responsibility at Adept; architect peer review and community review
before common adoption; and simulations before adopting monetary numbers or
stronger geometric/network claims. Notion remains a present working surface;
eventual removal as a required expense is a future direction, not authorization
to cancel, delete or migrate it now.

The Human also requested an integrated remote Agent C research/build loop: launch
bounded approved questions, continue independent building, retrieve actual findings,
review their implications and propose the next questions. The manual-cohort record
identifies the existing WS-AGENT-C as Research Observatory:
[acceptance source](https://app.notion.com/p/3e32bb4420b881a7b3b9d085e5042f06).
A fresh read of [WS-RQ-009](https://app.notion.com/p/3e42bb4420b881e6a633ecabfd01468e)
confirms its approved scope is one Equinox source study, not geometry research.
The Human pointed back to WS-RQ-003; fresh readback of its
[registry row](https://app.notion.com/p/3e42bb4420b88119b83ae44c3e78f083) confirms
`approved_active` since September 24 for the bounded geometry-versus-conventional
view question. That existing approval stands and needs no repetition. It covers
research/method review, not a deployed prototype, recruited participants or proof
that a study occurred. The row's old next-decision wording still requesting
approval is stale relative to its explicit authorization body and activation state.
Browser discovery failed at the tool entry point with a local-file-URI error before
the agent could be inspected. Destination and settings remain unverified; no launch
or recurring schedule occurred. The validation plan records adapter/round-trip
acceptance requirements; the requested workflow is not yet a verified capability.

Outstanding decisions now include the earlier Hope and spatial extensions and:

- economic mechanisms and candidate numbers: Genesis allocation/distribution,
  reserve release, funded rewards, fee/sink/burn routing, issuance ceilings and
  emergency policy, with simulation, risk review and ratification before activation;
- domain-specific review/appointment/signing scopes, consenting-group trial limits,
  community and architect review decision rules, suspension, appeal and recovery;
- Grade X versus the post-Grade-X Adept threshold, consented recognition evidence,
  specialization catalog reconciliation and curriculum readiness;
- geometry hypothesis, comparator/workload and empirical acceptance criteria,
  with Agent C's exact destination, reachability, Memory-off and schedules still
  unverified; a research grant does not prove readiness or a completed simulation;
- Tempus factual chronology, authorized policy/era schedules and an optional
  community sacred narrative as separate linked views, including the definitions
  of future epochs and node/network activation states;
- whether the proposed Hope/model and spatial-semantic extensions amend A19/A20
  or follow separately; existing A19 deletion remains baseline, not a new extension.

The [journey proposal](../../architecture/participant-journey-proposal.md) and
[simulation/chronology plan](../../architecture/simulation-and-chronology-plan.md)
contain the source comparisons and proposed next gates. They record proposals and
Human product direction, not an activated permission matrix or simulated outcomes.
A18 stays closed; CE-W04 stays open; A19 remains the next bounded implementation
arc. The Human has prioritized this reconciliation/research planning before its
opening; no wholesale platform redesign is added to A19 acceptance.

This report supersedes the earlier implementation-gate and outstanding-decision
summaries for present planning, retaining their original source bytes and dated
claims. Existing unpinned baseline sources are pinned to the pre-update candidate
commit before appending this section. It neither renumbers sessions nor rewrites
the sealed continuity record. The accompanying Notion update is an operational
projection with explicit candidate links, not proof of canonical repository merge.

## October 7 automated research coordination grant

After the review above, the Human explicitly authorized more automated preparation
of evidence-grounded questions and running already approved questions for Human
review. They selected both refresh during active work and daily. This updates the
earlier manual-only coordination posture within that scope; it does not approve
all new questions, unlimited repeated runs or automatic implementation of findings.

The app confirmed creation of thread heartbeat `arcanum-research-review-loop` as
ACTIVE, with a daily 9 a.m. schedule (America/New_York intended local timezone).
Its prompt refreshes the queue, preserves question-level budgets and private
output, reconciles prior runs, and permits approved dispatch only after Agent C
readiness verification. This records successful scheduling, not a completed daily
run or a working Agent C adapter. The connection failure and unknown settings
remain; no research run or simulation result is claimed.

The [research review queue](../../architecture/research-review-queue.md) prepares
WS-RQ-003 for its unchanged bounded run, preserves WS-RQ-009 separately, and adds
four pending-review questions grounded in the inspected economic accounting,
topology, scoped-adoption and Tempus-replay evidence. These local proposal labels
do not allocate new WS-RQ IDs or mark new questions approved.

Notion WS-RQ-003's stale next-decision wording was corrected and read back while
preserving the September 24 approval body and `approved_active` state. The
Understanding Dashboard is the authorized operational mirror for this update.
No Notion subscription cancellation, main merge, deployment or new policy is
authorized or established by scheduling this review loop.


## October 8 present-state reconciliation

The Human approved and explicitly instructed the bounded repository/Notion tracking
repair, with no merge/deploy, scheduler recreation, Agent C dispatch or A19 work.
The [checkpoint](present-state-checkpoint-20261008.md) records the exact freshly
resolved main395d8f9894c72abccb57c5663c9c127b28f1d6b7 and attributes recovered
production/scheduler observations separately. A18 remains closed, CE-W04 open,
A19 Ready (tracked by Notion ARC-50), A20 Blocked (tracked by ARC-51).
The October7 dashboard reports version10 Agent C with readiness evidence still
incomplete; WS-RQ-003 remains approved but no research result exists.
The October8 audit reports no active scheduler, superseding the prior ACTIVE claim.
No device/environment capability is freshly certified by this tracking refresh.

The independent event projection indexes controlling-log entries without changing
sessions or the ARC-SES-11..22/external ARC-SES-23 gap. All earlier profile sections
and seed objects remain historical evidence. Task and arc identifiers are distinct.
This profile remains the only unpinned, digest-bound reviewed source for generation.
