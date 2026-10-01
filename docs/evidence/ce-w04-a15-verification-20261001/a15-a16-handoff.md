# A15 → A16 handoff preparation — 2026-10-01

## Status and authority

Human-directed preparation, drafted by Codex. A15 is open; A16 implementation
is blocked until the Human reviews and adopts A15 closure. This document neither
closes A15 nor activates A16/A17. Its base is main
`f37c572cf927c692af19d8c56e9896a530fa409c`.

The Human instructed: “Merge PR #82 and publish v25.” The same instruction
authorized preparing this handoff and preserving decisions and lessons for A17.
PR82 merged after all ten exact-head checks passed. Production deployment
`dpl_6PmzpURuETtxU4rWTaYFHQuphL5d` is READY at the base commit and carries
the updates origin. Live distribution inspection passed. This preparation does
not supply authorization for another merge or future implementation.

## Baselines and exact provenance

- Installed phone baseline: version24; source
  `61013ca69ee57f56cf4898c2d93b24a75f41b535`; APK SHA-256
  `23fce1ae36dc6a3a2a54f6067631092c23cfe1ab6be20245e02f8e406340927e`.
  Supplied screenshots2394/2396 show handoff PASS and operation
  `35526ca5-edbc-4bb4-bec3-ee0c63609941`, TARGET_OBSERVED, session absent,
  callback VERIFIED. Keep this receipt intact until joint settlement.
- Advancing target: version25, `0.1.15-cew04-a15-settlement-verify`; signed
  APK source `7058cbeeb5c7844fa5c5439ea6d0b421536b880f`; source promotion
  `abc9cb8fadd81231f05e400f62357da1c794c5bd`; hosting promotion is the base
  commit above. Signed run36904286200, artifact11182942916; package, compiled
  source, SDK, two ABIs and established signer independently verified.
- Live APK SHA-256:
  `fc2b6b237f388b97449c958b41d991c666bdc5cdb1929ca1de72d6787982082f`;
  size4632073 bytes. Manifest SHA-256:
  `cc229b86049d64157595bbfc3915212b9d036352682abbebea6160a9938703ec`.
  [Live inspection receipt](live-inspection-receipt.json) binds direct HTTPS
  downloads and independently verified APK signature; it is not a phone install.

## Human decisions and attribution

| Record | Attribution and source | Evidence boundary |
| --- | --- | --- |
| Prepare25; merge candidate after verified checks | Human Architect instruction in this task; PR81 executed after18 passing gates | Conversation authorization; not a cryptographically signed local Human receipt |
| Merge82 and publish25 | Exact Human instruction quoted above; PR82 merge and live inspection | Authorizes this publication; does not close A15 |
| Chain-live is outside A15 | Human scope correction in this task | Preserve the correction as a scope decision |
| Geometry, Hope reflection and Tempus still work after24 | Human report; associated supplied2394/2396 phone evidence | Reported functional preservation; no private interior inspected |
| Settlement requires two actions on22 | Human report, then2384/2386/2388/2390 observations | Reproduced delayed removal; corrected24 behavior still needs phone evidence |
| Implementation, summaries and handoff drafts | Codex-produced artifacts under bounded Human authorization; exact Git references | Human direction/review does not change the original producer of generated text |
| Build, signature, digest and deployment measurements | GitHub CI plus independent tools and Vercel observations | Machine evidence; neither a Human decision nor global identity proof |

These are attributed records with stated sources. Git author names, provider
accounts, model confidence and a local signature alone must not be used to
invent Human authorship. A16 can define a bounded Human-reviewed adoption
receipt tied to its local continuity credential and record digest. That later
receipt records adoption at its actual time, keeping original producer/source,
decision date, observation date and uncertainty. It cannot retroactively prove
historical authorship or global human uniqueness.

## Final joint A15 sequence

1. Preserve the installed24 receipt, explicitly settle it, then refresh and
   capture No installation attempt.
2. Inspect25 and confirm READY_FOR_USER_CONFIRMATION, exact version/hash/signer
   and installPerformed=false. Request update; press Home at Android confirmation.
   Reopen/refresh and capture original operation AWAITING_USER/session present.
3. Confirm settlement once; wait for completion and capture the result before
   Refresh. Expected: owned sessions absent and attempt archived. One refresh
   must show No installation attempt without a second settlement. Timeout or
   failed observation remains an unresolved result with retained journal.
4. Fresh inspection/submission, explicit Android Update, then installed25
   handoff/source/hash and original-operation TARGET_OBSERVED/VERIFIED/session
   absence. The Human repeats geometry, Hope reflection and Tempus checks without
   sharing private contents.
5. Preserve/settle the verified receipt; inspect installed25 again and capture
   NOT_ADVANCING with no new attempt.
6. Review interrupted-staging and failed-install coverage. Failure-classifier
   unit tests and interrupted-wait tests do not prove a physical failed install
   or interrupted download. Identify any unmet acceptance explicitly; do not
   manufacture failure by clearing/uninstalling the private installation.
7. Prepare the factual closure proposal, reconcile every acceptance row with
   references and limits, and obtain Human closure review/adoption. Only then
   resolve the exact main base and authorization for A16 implementation.

## Lessons to carry forward

- Absence is an observation: abandon once and allow bounded asynchronous removal;
  preserve the journal when absence or installed identity cannot be established.
- Pending, cancellation, failure, target observation and verified success are
  distinct. Pressing Home is pending; uncertainty is not a failure or success.
- Original Android confirmation is a process-local capability. After process
  loss, block missing capability rather than reconstructing or submitting again.
- Negative inspections stage nothing. Restarted URL fields may select a
  historical target; capture inspection before requesting installation.
- Local serving caught the missing new-route middleware exemption; verify direct
  download bytes/cache policy on desktop and mobile before publication.
- Keep package signer, broker authentication, local data encryption and future
  participant continuity signing separate. Publication authorization and closure
  authority also remain explicit and separate.

## A16 preparation and A17 intake contract

The [saved A16 scope](https://app.notion.com/p/3df2bb4420b881ccb451d67d5e42b6d4)
requires an inventory before new cryptography. Existing bounded surfaces include
`AndroidHopeKeyManager.kt` (local encryption), `ArchitectPairingStore.kt`
(AndroidKeyStore-protected pairing), `ArchitectBrokerClient.kt` (broker HMAC)
and Android APK signing verification (publisher lineage). Their existence does
not establish participant-local receipt signing. Audit exact live sources,
credential lifecycle, algorithms, domain separation and privacy before reuse.

A16 must review the local credential and receipt envelope, explicit Human
confirmation/adoption semantics, public verification material, versioned payload
and source digests, tamper rejection, restart/compatible-update continuity,
missing/lost key truthfulness, and bounded rotation/reset behavior. No global
uniqueness, wallet/governance entitlement or cross-device key copying is implied.
Private Hope bodies, credentials and sensitive derivatives stay outside developer
evidence. No identity implementation or private-device key test is performed here.

After A16 closure, A17's selected local store should retain the Human decision
source/adoption reference, original producer, evidence class, event/observation
dates, immutable original with additive corrections, exact Git/build/receipt
references, verification/uncertainty state, privacy/export class, retention and
deletion policy, and next gate. Model summaries remain derived views with underlying
references. Existing records enter as attributed historical evidence; unsigned
history is not relabeled as an A16-signed Human original.

The preparatory [sovereign continuity substrate](../../specs/runtime/sovereign-continuity-substrate.md)
does not activate A17. The canonical [conversation-memory contract](../../governance/architectgpt/conversation-memory-contract.md)
controls continuity identifiers and provider mirrors. No ARC-SES number is
allocated while external sequence gaps remain unreconciled.

## Retained record set

[Development decisions and roadblocks](decisions.md),
[publication review](publication-review.md), exact artifact/preflight/direct-serving
evidence in this directory, and the preceding A15 evidence directories retain
the known implementation paths. Dated updates preserve earlier state rather than
rewrite it. Notion/Drive mirrors carry this informational record and the current
next gate; their existence does not ratify canon. Merged branch history is retained
in verified archive refs/bundles before branch deletion.
