# A16 physical qualification and bounded closure

Event and review date: 2026-10-03. Producer: Codex using Architect GPT v4.1.
Repository: `The-Architect-369/Arcanum`. Work branch:
`work/a16-receipt-foundation-20261002`. Canonical base observed:
`ad7c75039a6701145e3051ca151ae003f4ca542d`.

## Human direction and disposition

The Human instructed “Run a 16 test sequence”, then, after receiving the seven-test
result and its limits, “proceed with isolated test and lets close A16”. This record
supports that bounded closure request. Canonical closure takes effect upon verified
adoption of this evidence and implementation through [PR #84](https://github.com/The-Architect-369/Arcanum/pull/84);
preparation of this file does not assert that a merge already occurred. The actual
closing commit and final checks belong to the PR and additive operational mirror.
CE-W04 remains open. A17 implementation is a separate next scope.

## Bound implementation and artifact

The physical APK source is `18172fad5061cf01c989b066587be7e44f5bff3b`.
All three APKs came from [CI run 37012528420](https://github.com/The-Architect-369/Arcanum/actions/runs/37012528420),
[artifact 11228568670](https://github.com/The-Architect-369/Arcanum/actions/runs/37012528420/artifacts/11228568670).
Package, source binding, hashes, common signer, versions, instrumentation target,
both ABIs and four JNI libraries were independently checked. Installed-target
BuildConfig/source and version checks also execute inside instrumentation.
This closing tranche changes evidence only, not the physically tested runtime,
Android sources, APKs, JNI or workflow. Later evidence/index heads must not be
misreported as the source embedded in these APKs.

[Minimized machine evidence](qualification.json) retains actual event times,
artifact hashes, test methods/results, state comparisons and PNG digests.
The original local report, instrumentation receipts, public synthetic wrappers and
12 original PNGs remain in the ignored A16 qualification output directory. Public
evidence excludes device serial, local personal paths, test credential identifiers,
raw UI trees and screenshots containing system-status indicators.

## Acceptance review

| Obligation | Result | Evidence class |
| --- | --- | --- |
| Fresh observation/cancel without credential creation | PASS: NOT_PROVISIONED / NO_SAMPLE observed; provisioning cancelled; seed asserted untouched state | Physical UI plus instrumentation; initial PNG missing |
| Non-exportable, domain-separated local credential and signed synthetic receipt | PASS: seed; Android provider reports TRUSTED_ENVIRONMENT and non-exportable key observation | Physical AndroidKeyStore/JNI; no independent hardware attestation |
| Process restart preserves credential and original receipt | PASS: recoverAfterRestart | Physical process force-stop and individually invoked instrumentation |
| Compatible 26-to-27 update preserves credential and original receipt | PASS: recoverAfterCompatibleUpdate | Real advancing isolated APK update; same signer/source |
| Tampered receipt rejected; original retained | PASS: rejectTamperedReceipt | Physical Rust/JNI signature/store assertion |
| Deleted test key represented truthfully | PASS: loseQualificationKey; MISSING_KEY displayed, record/adopt disabled | Isolated UID only; exact original generation checked |
| Replacement and rotation preserve history | PASS: replaceMissingQualificationKey and rotateReadyQualificationKey; distinct generations/fingerprints; original wrapper unchanged | Physical custody/store assertions and UI comparisons |
| Adoption preserves fixture attribution and actual later time | PASS: committed original/adoption wrappers independently verify P-256 signatures, object digests and fingerprint bindings | Selected public synthetic bytes only; confirming actor unverified |
| Cancellation does not create another signed sample | PASS: final Record confirmation cancelled; displayed state and both existing wrapper digests unchanged | Additional physical UI/receipt check on 2026-10-03 |
| Native integration and inherited navigation | PASS: scroll/refresh, disabled-state labels, Hope editor opening without save, Tempus capture and return to continuity | Basic physical UI evidence; not full accessibility certification |
| Fault recovery and unavailable/unknown handling | Existing Rust/JVM suites and exact-source CI pass | Host/injected faults, not physical missing-JNI or exhaustive crash proof |

Seven instrumentation methods passed individually in the specified order. No seed,
key deletion, rotation, install or adoption was replayed to repair missing evidence.
The production `org.arcanum.nativehost` installation remains version 25 with its
original update time; only the isolated package was installed/updated to 27.

## Evidence corrections and bounded limits

The screenshot helper initially queried `dumpsys window windows`, which omitted
focus on this Android 16 device. Its local-only correction queries `dumpsys window`.
The fresh screenshot was missed; state was observed and independently asserted by
seed. No reset was used to recreate it. Later previews appeared blank, but original
PNG inspection and decoded pixel equality established intact restart/update/tamper
frames; this was corrected in the conversation, not treated as a device failure.

Adoption completed while its confirmation dialog was open. The agent's subsequent
Confirm lookup found no control and sent no tap. The actual confirming actor is
unverified. Committed bytes and actual recorded/adopted time were inspected; no
historical Human authorship, biometric presence or retroactive approval is inferred.

Process restart is not reboot, power-loss or backup recovery. TRUSTED_ENVIRONMENT is
provider-reported, not independent attestation. No missing-JNI APK, changed-font-scale
or TalkBack physical run was performed. No production private-store migration,
private-content signing/export, chain registration, global identity or wallet rights
are qualified. These limits are retained in the bounded closure, not promoted to
passes. The original dated foundation/custody/native reviews retain their original
pre-device statements and are superseded only for current status by this evidence.

## Verification and next gate

The physically tested source had 17 successful reported PR checks/statuses (including
duplicates and deployment statuses, not 17 distinct jobs). The final evidence/index
head must pass deterministic index verification, all 15 sync gates, applicable Rust
format/Clippy/tests, frozen dependency installation, CE-W01, lint, typecheck and build,
then the fresh PR checks. Exact results are recorded in the PR before canonical
adoption; this source record does not pre-assert later checks.

Preserve source/index lineage and merge history. Record the actual closing SHA,
verify canonical ancestry and tree equivalence, and reconcile the A16 operational
record. A17 may then be scoped around selected local development memory, retaining
original sources, evidence classes, uncertainty, custody and retention boundaries.
No ARC-SES ID is allocated while external sequence gaps remain unreconciled.
