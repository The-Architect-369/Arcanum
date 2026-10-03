# A16 transaction recovery and Android custody — candidate review

Session event/observation date: 2026-10-02. Producer: Codex using Architect GPT
v4.1 instructions under the Human instruction “Let's preform that implementation
now”. Exact target: the bounded recovery/custody extension described in
[the slice specification](../../specs/runtime/ce-w04-a16-transaction-and-custody.md).
Repository: `The-Architect-369/Arcanum`; disposable ref:
`work/a16-receipt-foundation-20261002`; draft
[PR #84](https://github.com/The-Architect-369/Arcanum/pull/84).

Canonical main at grounding and pre-publication remote observation:
`ad7c75039a6701145e3051ca151ae003f4ca542d`. Extension base:
`2f7c1a947d82e603d5ffda95d04efaf375ab72f6`, the deterministic index companion
of foundation source `4cd597306fb12a024012d1556ff7449fc4c073f9`.
Prior foundation evidence remains dated and unchanged. No ARC-SES number is
allocated while external sequence gaps remain unreconciled.

## Result and effect states

The Rust store freezes intent before content, stages the original public signed
receipt and manifest, syncs publication, verifies read-back, and preserves original
bytes on matching retry. Damaged state is blocked before any extension. A staged
original signature is available for publication retry without signing again.
Separate instances/processes share the same advisory writer lock.

The Android lifecycle manager and AndroidKeyStore/no-backup storage adapters
implement explicit provision/replacement/signing and generation-bound pending
reconciliation. Recovery performs no key generation or signing. Replacement
retains old keys/records and records a discontinuity. Complete-message parsing,
message/operation/credential decision binding, strict DER and JCA signature
verification guard signing. Failure-state tests use synthetic content and ephemeral
in-memory JCA keys; they do not establish Android hardware custody.

| State | Evidence / limit |
| --- | --- |
| Proposed | Prepared recovery/custody slice following foundation PR #84 |
| Ratified | No new constitutional/doctrine ratification claimed |
| Authorized for effect | Current Human instruction authorizes the bounded repository implementation |
| Executed | Source, tests, specification, CI and lockfile changes in this candidate |
| Verified | Local evidence below; remote exact-head checks remain separately observable in PR #84 |
| Canonicalized | Unmet; no merge, device installation/provisioning, deployment or A16 closure |

## Verification observed before source/index commits

- Rust stable formatting and all-target/all-feature Clippy with warnings denied
  passed. Locked/offline runtime tests passed: 44 ordinary tests (including 8 new
  store/recovery cases), plus one ignored harness helper that is actually invoked
  in a child process by the process-termination test. The recovery cases include
  six write/rename/sync fault boundaries, competing same-ID writers, original
  signature reuse, missing/partial/unknown/symlink/oversized/corrupt state,
  duplicate locations, and the refusal to fill damaged staged content holes.
- Declared minimum Rust 1.78 passed the same locked/offline runtime suite.
  Dependencies were fetched with locked resolution before offline checks.
- Inherited locked/offline bridge (2 tests), Tempus lifecycle (3 tests), and JNI
  source compilation passed with the added `fs2=0.4.3` graph. The three inherited
  tracked Cargo.lock files gained only fs2 and its platform dependencies; the
  previous P-256/SHA-256/MSRV-compatible resolution remains intact.
- Full native Kotlin production and test sources compile against local Android
  API36 stubs. All 77 JUnit tests pass on Windows OpenJDK21: 65 inherited native
  cases, 2 independent receipt-vector cases, and 10 new custody cases. This local
  command uses the existing development BuildConfig stub. It does not establish
  a bound APK identity, API35 Gradle package, AndroidKeyStore behavior, hardware
  security, biometric authentication, or a physical device lifecycle.
- Custody tests qualify observed absence, lost acknowledgments before/after
  intent/key/finalization, preservation of pending and original decision clocks,
  separate reconciliation coordinates, retained old keys, explicit loss/invalidation
  replacement, unavailable/mismatched/orphaned/corrupt state, stale decisions,
  concurrent provisioners, non-exportable test observations, strict DER, and
  complete-message signing/parsing against all three public fixture sets.
- Three JSON display projections and invalid field/adoption cases passed.
  Changed workflow YAML parses. The extended standalone JVM CI job includes
  both pure production custody modules and all receipt/custody tests; the platform
  adapter remains under the inherited native-host compilation/package workflow.
- `pnpm install --frozen-lockfile`, `pnpm verify:ce-w01`, `pnpm lint`,
  `pnpm typecheck`, and `pnpm build` passed with Node24.21.0/pnpm9.10.0.
  The inherited Next.js-plugin detection warning remains. `git diff --check`
  passed on the candidate source.

Final deterministic repository-index lineage, all 15 `verify-sync` gates and
remote checks must be observed after the source/index companion. No future CI
result is asserted in this pre-commit record. The PR records the resulting exact
source/head coordinates and observed check URLs; those coordinates need not equal
canonical main or the indexed source coordinate.

## Limits and next gate

No participant private content, credentials or device state was inspected. Rust
plaintext storage remains synthetic-only qualification; it is not connected to
Hope/Journey or provider intake. No signing credential was provisioned on Android,
no publisher/encryption/broker keys were reused, and no keys or private data were
exported. Registry checksums and filesystem locks are not rollback protection.
Local fault injection is not storage-hardware power-loss certification. Total
registry-plus-key erasure cannot be distinguished from a new installation.

Native UI/consent integration, Rust/JNI wiring, applicable private-content custody
policy, and separately authorized physical restart/update/key-loss qualification
remain next gates. No app version/capability is advanced for these unwired APIs.
A16 and CE-W04 remain open. Canonical adoption retains the Human Architect gate.

## Additive namespace-loss hardening — 2026-10-02

Source `842e2494572bf0c296621f922ff7a581a2789173` and index companion
`31ec3015c304ac67bee84aa243df3e83a165306b` were committed without rewriting the
foundation. Their deterministic index/merge-stability checks and all 15 sync
gates passed. An initial overlapping index-verification attempt captured the
previous snapshot and failed; a sequential regeneration/check passed and left
no source or index drift.

Subsequent inspection identified a narrower loss case: registry metadata and the
initial key may both be absent while a retained replacement key still exists.
This must not be treated as fresh unprovisioned state. The candidate now requires
an observed empty dedicated continuity alias namespace as well as initial-key
absence before provisioning. A retained later-generation alias is orphaned;
unavailable namespace observation remains unknown and blocks key generation.
Only the continuity namespace presence result is returned; unrelated key purposes
are not interpreted, exported or logged.

Full native production/test compilation and JUnit rerun passed with this change:
78 tests, now including 11 custody cases and 2 independent vector cases. The new
case covers both retained-later-key orphan detection and unknown namespace state,
with no additional creation. All previous host-versus-device limits still apply.
The extended standalone CI job therefore runs 13 vector/custody cases. The
follow-up source and deterministic index companion retain independent exact-head
verification; final coordinates and remote results are recorded in PR #84.
