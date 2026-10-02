# A16 receipt foundation — candidate review

Event/observation date: 2026-10-02. Producer: Codex under the Human instruction
“let's begin A16 implementation”. Canonical base:
`ad7c75039a6701145e3051ca151ae003f4ca542d`; disposable work ref:
`work/a16-receipt-foundation-20261002`. A15 closure is independently recorded in
that base's merge message. No session identifier is allocated while external
continuity sequence gaps remain unreconciled.

## Result and boundaries

The [candidate specification](../../specs/runtime/ce-w04-a16-local-continuity-receipts.md)
records the inspected primitive inventory, privacy review, fixed v1 CBOR envelope,
public wrapper, P-256/SHA-256/DER rules and remaining lifecycle acceptance.
The Rust codec/public verifier authenticates the whole versioned message and
reports object-digest, signature, key binding and optional trusted credential
binding separately. Legacy CP4 and unsigned native receipt semantics are preserved.

Three public synthetic vector sets qualify independent Python reference generation,
RustCrypto verification and JVM reference encoding/JCA verification. No participant
private store, key or content was read. No Android signing credential was provisioned,
no app behavior/version was advanced and no APK was built, published or installed
by this local foundation work. Host/JVM qualification is not device lifecycle proof.

The new dependency graph is recorded in the runtime and three inherited tracked
native Cargo.lock files. Native integrated CI uses locked resolution for those
tracked roots. The A16 workflow adds focused schema, Rust stable/MSRV and independent
JVM checks. Future foundation-vector changes also trigger native-host qualification.

## Verification observed before source/index commits

- Runtime formatting and all-target/all-feature Clippy with warnings denied passed.
- Locked/offline Rust tests passed: 36 tests, including 13 new receipt tests and
  23 inherited clock, ephemeris, persistence and CP4 signing tests.
- Rust 1.78 qualification passed on the final 36-test runtime suite, including
  all 13 receipt cases, with locked/offline dependencies.
- Locked/offline inherited bridge tests (2), Tempus lifecycle tests (3) and JNI
  source check passed with the new dependency graph.
- Full native Kotlin source plus all test source compilation against local Android
  API36 stubs passed; all 67 JUnit tests passed on Windows OpenJDK21. This includes
  2 new independent JVM vector tests. The local command used the existing development
  BuildConfig stub, not a bound build identity. It is not a Gradle Android package,
  API35 APK build or device/AndroidKeyStore evidence. Existing deprecation warnings
  remain outside this slice.
- JSON Schema structure, three display projections and invalid field/adoption cases
  passed; changed workflow YAML parses. Strict CBOR/UTF-8 byte limits/DER validation
  remain Rust requirements, not guarantees supplied by the JSON display schema.
- `pnpm install --frozen-lockfile`, CE-W01 specification verification, lint,
  typecheck and build passed. Web baseline used Node24.21.0 and pnpm9.10.0.
  Lint retains the inherited Next.js-plugin detection warning.
- Initial install using system Node22 failed at Corepack's unwritable `/usr/bin`
  symlink target. A checksum-verified temporary official Node24 distribution supplied
  a writable bundled Corepack; the frozen install then succeeded without repo edits.
- The baseline deterministic repository-index/merge-stability check passed before
  branching. Final source/index lineage and all 15 `verify-sync` gates must be
  checked after the deterministic index companion. Remote exact-head CI remains
  separate evidence; no passing remote checks are asserted here in advance.

Dependencies were fetched before offline tests. Cargo's new/old registry caches
required a separate locked fetch for Rust1.78. `base64ct1.6.0` and `zeroize1.8.1`
are locked to retain that declared minimum rather than silently raise it.

## Next gate

Preserve substantive source then deterministic repository-index companion, complete
indexed-head verification and inspect the published candidate/CI. Canonical merge
retains the applicable Human approval gate. This receipt-foundation result does not
close A16 or CE-W04 and does not activate A17.

Continue A16 with qualified transactional operation recovery, Android custody and
explicit lifecycle actions, then synthetic native integration and separately
authorized physical restart/update/key-loss proof. Signing cannot be a condition
for reflection dignity, and signed local adoption cannot invent historical Human
originals or export permission.
