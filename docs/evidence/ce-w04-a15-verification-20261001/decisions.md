# A15 development decisions, roadblocks and verification sequence — 2026-10-01

## Custody, coverage and authority

This dated record consolidates current repository specifications, merged PRs,
technical build/distribution evidence, supplied phone screenshots and Human
reports. It does not assert a complete reconstruction of unavailable logs or
allocate an ARC-SES identifier. Earlier preparation records remain historical.
Notion and Drive are authorized informational mirrors; storage or a generated
summary does not ratify closure. No private Hope contents, credentials or signing
keys are included. A15 remains open.

## Implementation paths and decisions

| Path | Decision and evidence | Remaining limit |
| --- | --- | --- |
| A14 distribution, PR70/71 | Trusted direct APK inspection and a conditional A14 milestone enabled bounded A15 work. | Inspection is not installation or closure. |
| Initial updater, PR73/74 | Exact own-package identity, advancing version, established signer, independent bytes, explicit Android consent and durable attempt journal; version21 provided an advancing target for version20. | Historical version19 correctly fails NOT_ADVANCING. |
| Recovery, PR75/76 | Version22 retains the original confirmation only in process memory, bound to operation/session; guarded launch; absent capability blocks after process loss. | The original version20 resume crash stack was unavailable; no invented diagnosis. |
| Recovery verification, PR77/78 | Version23 advances identity; production failure-status decisions receive targeted unit evidence. | Injected failure statuses are unit evidence, not physical installation failures. |
| Settlement correction, PR79/80 | Version24 abandons captured owned sessions once, then observes absence for up to two seconds; timeout/error retains the journal. Empty settlement no longer claims a nonexistent archival. | Installing the correction does not test active-session settlement running in it. |
| Final target, version25 | Identity and handoff mapping advance to `0.1.15-cew04-a15-settlement-verify`; updater behavior is unchanged from24. | Signed build, exact artifact verification, controlled publication and joint phone evidence are required. |

All PRs70–80 listed above are merged in
[The-Architect-369/Arcanum](https://github.com/The-Architect-369/Arcanum).
The version25 branch starts from exact main
`7a07a01806ce541f6756b8e8f4917d3811909e4b`.
Source/index lineage and APK source, source promotion and hosting promotion
remain distinct. All builds retain the established signer
`9841fbeda4d7d0c63b1663360fb0415218a08f063b5629317274076dfbb6b844`.

## Roadblocks and paths taken

1. Non-advancing version19, wrong transport/origin, missing fresh staging and
   installation-permission restrictions were rejected before an installation
   attempt. Reset URL fields later inspected19 again (2370); restoring both23
   URLs restored READY_FOR_USER_CONFIRMATION (2372). No bypass was used.
2. Original-confirmation recovery crashed on the earlier build. PR75 guarded
   both preparation and UI launch and retained only the original process-local
   capability. Clearing participant data was not a recovery path.
3. User-reported double settlement was initially ambiguous. Empty-attempt
   checks2362/2364/2366 and already-cancelled checks2376/2378/2380 did not
   reproduce the active-session condition. They were not accepted as proof.
4. Active operation `f4bf85d8-37db-43df-b422-963609831d8f` was pending with
   session present (2384). One settlement blocked: Session absence not
   established (2386). Refresh observed CANCELLED/session absent (2388); a
   second explicit settlement cleared the attempt (2390). This supports delayed
   removal after the immediate check. PR79 adds bounded observation without
   another abandonment or implicit retry; six observer tests cover delay,
   deadline, persistent presence, observation failure and interrupted waiting.
5. Automatic approval review rejected PR80 merge because prior approval named
   PR79. The rejection was disclosed; the Human explicitly said “Merge PR #80,”
   after which the prepared publication merged. This was resolved through
   explicit authorization, not an approval bypass.
6. Local Linux Java was unavailable; the existing Windows JDK/Kotlin compiler
   and Android stub supplied local compilation. Real JSON precedes Android's
   stub at test runtime. Required CI supplies the signed build and independent
   package evidence; local compilation alone does not certify provenance.
7. Temporary merged branches were removed only after exact-tip ancestry and
   preserved archive refs/bundles were checked. Older detached drafts were
   retained; preview servers were stopped. A new bounded verification branch
   is temporary and awaits its own verified merge/cleanup.

## Observed phone evidence

Version22 reopened the original23 prompt without a new submission (2346/2348),
then cancellation reconciled the same operation and absent session (2350).
After Human force-stop, original operation
`01472c2b-8121-4350-9683-34ed958a9a3d` persisted pending (2354/2356), but
opening the missing original capability blocked (2358). Explicit settlement
cleared it (2360). Pressing Home leaves a pending state; it is not itself a
failed installation.

Version24 installation: screenshots2392/2394/2396 show staged24, installed
handoff PASS and operation `35526ca5-edbc-4bb4-bec3-ee0c63609941` with
TARGET_OBSERVED, sessionPresent=false, callbackState=VERIFIED. Source is
`61013ca69ee57f56cf4898c2d93b24a75f41b535`; installed APK hash is
`23fce1ae36dc6a3a2a54f6067631092c23cfe1ab6be20245e02f8e406340927e`.
The Human reported geometry, Hope reflection and Tempus still work. This is
attributed functional preservation evidence; private interiors were not read.
The verified receipt remains intact for the next joint sequence.

## Remaining verification and closure

Prepare/verify25, satisfy controlled publication gates, then jointly test one
explicit settlement of an active pending session while24 is installed. Capture
the settlement result before refresh; timeout preserves uncertainty. Perform a
fresh explicit update, exact installed identity/original-operation reconciliation,
Human preservation checks and same-version rejection. Review interrupted-staging
and failed-install evidence, separating unit, machine and Human observations.
The Human reviews/adopts closure; no successful build or installation closes A15.
Chain-live compatibility is explicitly outside A15.

The Human authorized version25 preparation and on 2026-10-01 authorized merging
the candidate once all verification checks pass. Earlier approvals for23/24 do
not supply automatic approval for new publication surfaces or phone actions.

## Upcoming saved sequence and sovereign memory

The [ratified A14–A20 execution baseline](https://app.notion.com/p/3e12bb4420b881219b88f57e93e25d5a)
places A16 after A15 closure and A17 after A16 closure:

- A16: local continuity identity and signed local receipts; non-exportable local
  credential and domain separation from APK signing and broker authentication.
- A17: selected local development notes, receipts, source/build references,
  decisions and open questions; inspectable custody, retention/deletion,
  process-loss recovery and Human-selected context/export. Evidence classes and
  underlying references survive summaries; uncertainty stays uncertain.
- A18: English Architect conversation using the selected A17 context envelope,
  visible provider/context/budget/retention controls and advisory boundaries.
- A19: Hope collection and temporal recall, with explicit privacy and deletion;
  execution order changes require explicit reprioritization.
- A20: geometry-bound navigation and integrated experience; geometry does not
  create authority or disclose private contents.

The [sovereign continuity substrate](../../specs/runtime/sovereign-continuity-substrate.md)
and schema adopted through PR66 are preparatory. They do not activate A17 or
reorder A14–A16. Node-owned evidence and selected provider context support
sovereign memory; Notion/Drive mirrors do not replace local custody. A17 excludes
private Hope access, general filesystem crawling, embeddings, behavioral
profiling, provider-owned canonical memory and automatic publication.
