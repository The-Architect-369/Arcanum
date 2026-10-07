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
