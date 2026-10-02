# A15 closure review proposal

Prepared for review: 2026-10-02.

Status: REVIEW-PENDING. Prepared under Human authorization; not adopted closure.
A16 implementation remains blocked until the Human accepts this review and
authorizes its next implementation surface. Chain-live compatibility is outside A15.

## Completed evidence

| Requirement | Evidence | Class and limits |
| --- | --- | --- |
| Exact own-package, signer, advancing identity and consent | Signed25 source7058cbeeb; source/build18 checks; publication10 checks; independently verified package/SDK/ABIs/hash/signer; direct live inspection; staging2650/2658 and explicit Human phone sequence | Machine artifact/distribution evidence plus supplied phone observations; publication is separate from installation |
| Same-version replay rejection, no installation | Installed25 and matching candidate NOT_ADVANCING/installPerformed=false (2670), followed by No installation attempt (2672) | Phone observation; unchanged APK/source/hash |
| Cancellation and original confirmation recovery | Original23 prompt reopening without new submission (2346/2348); same-operation cancellation/session absent (2350) | Phone observations on corrected22; no invented original crash stack |
| Process-loss recovery without duplicate submission | Same operation retained after Human force-stop (2354/2356); missing original confirmation blocks (2358); explicit settlement (2360) | Phone observations; no reconstructed process-local capability |
| Corrected active-session settlement on24 | Original pending operationa3a9e76e-ebed-478f-9b9f-e945dad02409 (2652); one settlement archives/observes absence (2654); one refresh shows no attempt (2656) | Guided phone sequence; not proof of every device scheduling condition |
| Genuine24→25 update and original receipt | Handoff25 PASS/source/hash (2664); original operation1ddb41b0-db96-47a7-b942-86ed98d6e0fd TARGET_OBSERVED/VERIFIED/session absent (2666); explicit settlement then no attempt (2668) | Phone observations bound to independently verified published bytes |
| Compatible local data preservation | Human report: “Hope, Tempus, and geometry all work still.” | Human functional report, allowed by A15 contract; private contents not read. No fresh broker/pairing-key validation is claimed |
| Interrupted staging and orphan partial handling | Four isolated production-path cases: truncated manifest, truncated APK, interrupted thread and orphan partial; partials removed, prior staged artifact and unrelated synthetic sentinel preserved, no attempt journal fabricated | Recompiled production methods with fake HTTPS transfer and host Android adapters; not physical interrupted phone transfer or service delivery |
| Non-cancellation failure, unknown state and journal preservation | Seven failure statuses persist FAILED; aborted persists CANCELLED; missing/unexpected persist UNKNOWN; mismatched session ignored; journal reread by a new installer instance and every active record blocks submission | Isolated production callback/read/write/submit paths; not an observed real Android failed-install callback. Host AtomicFile does not certify framework crash durability |
| Unit and repository gates | All23 original update unit tests and complete Android compilation passed for25; deterministic source/index lineage; signed CI and publication gates passed | Unit/build evidence; updated evidence PR must pass its own exact-head checks |

Detailed phone references and operation IDs are retained in
[final phone observations](final-phone-observations.json). Repeatable isolated
results, source/fixture hashes and limits are retained in
[host fault results](host-fault-results.json) and
[fixture runner](host-fault-fixtures/run.py). No production updater code changed
while collecting these final observations and fixtures.

## Review conclusions and limits

The final guided phone sequence supports the settlement correction, genuine
advancing update, original verified receipt, Human-reported functional preservation
and replay rejection. Isolated execution strengthens the previously classifier-only
failure evidence by exercising actual production callback serialization, re-reading
and submission guards, plus actual production interrupted staging cleanup.

The Human must review the distinction between physical phone observations and
isolated fault evidence. This proposal does not claim a physical non-cancellation
failed install, an intentionally interrupted phone download, fresh broker-key
validation, exhaustive scheduling proof, arbitrary rollback, or whole-wave closure.
The tested production paths and declared limits supply the proposed bounded A15
acceptance record; evidence classes must stay intact in future summaries.

## Requested adoption and next gate

Human review/adoption of bounded A15 closure and merge of this evidence/handoff
PR remain required. Once adopted, record the exact closing head and approval
source, preserve merged history, remove the temporary branch, and update provider
mirrors additively. Resolve exact current main before an explicitly authorized A16
implementation. A16 begins with its existing-primitive inventory, receipt/privacy
and credential-lifecycle review; A17 selected development memory follows A16.

[The prepared handoff](a15-a16-handoff.md) keeps original Human decisions,
machine measurements and Codex-produced drafts distinguishable. Any future A16
local adoption receipt records its actual event time and referenced digest; it must
not retrospectively label unsigned or generated history as a signed Human original.
