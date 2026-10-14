# A19 — accepted local Hope collection closure

Recorded October 14, 2026. This is the Human-requested reconciliation of A19's
accepted core storage scope. Canonical closure takes effect when this review is
adopted on main. Historical first-tranche and pre-implementation labels remain
stage-time records. CE-W04 remains open.

## Authority and source lineage

The Human accepted the S23 experience, authorized the A19 merge, and subsequently
requested: “Let’s reconcile A19 closure record.” The standing grant permits the
Apprentice to merge approved packets when their required checks pass and targets
remain bound. This document adds no identity, provider, disclosure or release grant.

- Collection source: `e1bfe489b`; index companion `ca9ba1d64bb25515eeb0f92a5a5da18080ca30fa`.
- Protected storage/migration source: `81ddbb9c4`; qualified application/index head
  `3b228eaa09712d59241f970777cef8ab6c947e20`.
- Verification compatibility repairs: `0ae598740`; final PR98 candidate/index
  `9996a83617f892f846e473b4b47ce819293b10fc`. Application/runtime content was unchanged
  by those CI repairs.
- [PR98](https://github.com/The-Architect-369/Arcanum/pull/98) normal merge
  `421ba13329f16c98eb7d13b28e8a9506dd2814b4`, observed merged at
  `2026-10-14T07:17:38Z`. Apprentice job `job_06ba43229da2b59d4968c265` verified merge
  parents and synchronized main. Source/index history was preserved.
- This reconciliation starts from main
  `5311effa9f2c2879693a9a162e3108a1fabadaa6`, which also contains the separate backup
  format and controls PR99/100. Its own final head, checks and merge receipt belong
  to the reconciliation PR; no future merge SHA is fabricated here.

## Core acceptance evidence

The [evidence manifest](evidence-manifest.json) minimizes original local receipts.
The original receipts remain in the operator's local evidence archive; their
hashes establish provenance, not independent public reproduction. Device results
below are recorded completed tests, not newly repeated tests in this documentation change.

| Obligation | Recorded result |
| --- | --- |
| Save, chronological browse and recall | Rust collection and Android integration tests passed; saved text remains immutable with stable IDs and factual timestamps. |
| Archive, restore and deletion | Explicit archived view, restore, selected-entry confirmation, stale confirmation rejection and retired-ID suppression passed. |
| Protected persistence | Three synthetic reflections survived restart and compatible version35-to36 update with exact content, receipts and archive state. |
| Legacy migration | Surviving synthetic legacy text and receipt preserved; cleanup followed verified collection persistence; no invented overwritten history. |
| Recovery | Five migration interruption points, interrupted writes, missing initialized file, missing key, corrupt ciphertext and unsupported versions preserved data and surfaced errors. No automatic reset/replacement key. |
| Deletion durability | Deleted entries remained absent after restart and compatible reinstall; stale legacy copy did not resurrect them. |
| Privacy and interface | Synthetic interface checks passed for whitespace, archive separation, Back and Architect observation masking. Human subsequently accepted the S23 experience. |
| Verification and adoption | 107 Android unit tests, 20 Hope tests, both native architectures, nine selected S23 phases, 13 final-candidate local checks and all 19 reported pre-merge GitHub checks/statuses passed. |

The phone was an S23 Ultra, API36, isolated
`org.arcanum.nativehost.a19qualification`, versions35/36 with a matching
qualification signer. Minimum/current Rust checks and native builds are recorded
in the original verification evidence. The initial collection-only bundle had18
tests; the later integrated Hope suite had20. These counts describe distinct stages.

## Limits retained at closure

Qualification used synthetic fixtures. It does not certify migration of the
Human's private vault, a production distribution/update, exhaustive accessibility,
forensic erasure, or deletion from independent backups. The 16MiB encoded storage
limit was implemented but was not stress-tested on the phone. One authenticated
envelope means corruption can affect the whole collection. A first-write
interruption after the initialized marker requires deliberate recovery of preserved
legacy data. Archive does not itself grant model access; saved content remains private.

## Separate portable-backup follow-on

The Human explicitly selected portable backup/recovery as a separate task following
A19 local storage. [PR99](https://github.com/The-Architect-369/Arcanum/pull/99) and
[PR100](https://github.com/The-Architect-369/Arcanum/pull/100) implemented the format,
manual export and guarded fresh-vault restore. Their automated checks do not
establish a successful participant two-phone roundtrip.

The participant reported a real export written and read back successfully. The
Apprentice verified the selected encrypted file arrived unchanged on the second
phone. The manual validation/cancel/restore/recall gate is **not passed and deferred**:
the participant reported that code handoff was impractical and the new code was
not retained. Earlier read/validation failure causes remain unconfirmed. No key,
recovery code, reflection, private filename or personal device identifier is retained
in this public review.

[PR101](https://github.com/The-Architect-369/Arcanum/pull/101), observed open at
`2a46683c62f41608cb9a0b17250c590843f378a2`, remains a separate qualification/diagnostic
candidate. This closure neither merges it nor waives its missing physical gate.
Account linking and approved device transfer are proposed future capabilities;
Google sign-in is not evidence of decryption authority or ChainCode enrollment.

## Closure and next gate

A19's accepted **local collection, temporal recall, protected storage and migration**
obligation is closed upon adoption of this reconciliation. Backup follow-on limits
remain visible rather than being relabeled as A19 core failures or successful tests.
A20's A19 predecessor is satisfied; its exact navigation scope and implementation
packet still require bounded review. No A20 work is dispatched by this document.
CE-W04 integrated review and CE-W05 remain separately gated. Observatory remains
parked; website/dashboard lanes and private disclosure are outside this closure.
