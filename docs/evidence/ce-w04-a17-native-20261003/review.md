# A17 protected native integration candidate

Producer/date: Codex, 2026-10-03. Human direction: continue A17 until ready for phone
installation and testing, then perform that test. Work branch is
`work/a17-continuity-foundation-20261003`, PR85. Starting candidate:
`52cd404dfe92cc47e0b3da6d4c44b27b654a92d3`; canonical main remains
`bfa1ea659937f1fec4216680de81f989bd9961d4`.

The [native contract](../../specs/runtime/ce-w04-a17-native-memory.md) adds separate
AndroidKeyStore AES-GCM custody, encrypted atomic transactions, minimal encrypted
anti-replay tombstones, explicit retention/deletion, selected local context preview,
and Architect navigation. A16 signing/JNI and Hope storage remain separate. No
external context delivery or automatic private ingestion is enabled.

Local production/unit Kotlin sources compile with Kotlin2.0.21, JDK21 and API36
stubs using a development-unbound BuildConfig stub. This is compiler evidence, not
an API35 source-bound APK or physical custody qualification. All 95 host JVM tests passed, including ten A17 tests. Focused tests cover
multiple-record reopen, missing keys, encryption, tombstones, stale/duplicate IDs,
selected context, sensitive/namespace denial, authentication corruption and original
pending deletion reconciliation. The first local compile corrected an unavailable
Android O_DIRECTORY constant; directory fsync uses the supported Os.open/O_RDONLY
path. Directory behavior still requires physical qualification.

The final exact-head checks and qualified APK provenance belong to the PR and the
later additive device report. This pre-device entry does not claim installation,
physical passes or closure. Limits include secret-pattern incompleteness, host-trusted
classification, no malicious filesystem rollback resistance, no secure flash erasure,
and no platform-independent key recovery. Private dialogs deliberately block screenshots.

CI provenance-check correction: the initial observer check expected a literal arc
label and rejected the new closed A16/A17 qualification selector. The verifier now
requires the exact allowed selector/default before resolving the label. Native APK
code and behavior are unchanged by this correction; the initial failure is preserved.
