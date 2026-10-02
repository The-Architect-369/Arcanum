---
title: "CE-W04-A16 — Local Continuity Receipt Foundation"
status: implementation-candidate
visibility: public
last_updated: 2026-10-02
wave: "CE-W04"
authority: "Human-authorized bounded implementation candidate; no closure, custody provisioning, promotion or deployment authority"
machine_schema: "docs/specs/runtime/ce-w04-a16-local-continuity-receipt-v1.schema.json"
---

# Local continuity receipt foundation

## Scope and exact baseline

The Human instructed “let's begin A16 implementation” on 2026-10-02. This first
slice starts from `main@ad7c75039a6701145e3051ca151ae003f4ca542d`, which records
Human-adopted A15 closure in its merge message. Its deterministic index source is
`749f473e29d1994cb0c18015fd789ff34d80825d`; the different coordinates follow the
source/index/merge contract. Local and remote main matched before branching.
The disposable work ref is `work/a16-receipt-foundation-20261002`.

[A16's operational scope](https://app.notion.com/p/3df2bb4420b881ccb451d67d5e42b6d4)
and the [ratified sequence](https://app.notion.com/p/3e12bb4420b881219b88f57e93e25d5a)
require primitive inventory, privacy review and bounded lifecycle qualification.
The prepared engineering design is implemented here as a first foundation slice:
strict receipt codec, independent public verifier and cross-language vectors.
The design draft is a Codex-produced proposal; current Human authorization is the
instruction above, not authority manufactured by that draft.

Success means that Rust and an independent JVM reference encoder reproduce the
same synthetic signed-message/wrapper bytes, verify public signatures over all
message fields, and reject altered or unsupported input. It does not mean the
whole node lifecycle has been proven. Android custody, transactional operation
storage, explicit provisioning/replacement actions, native integration and
physical restart/update/key-loss evidence remain subsequent A16 work.

## Existing-primitive inventory at the baseline

| Live source | Actual primitive / boundary | A16 reuse decision |
| --- | --- | --- |
| `runtime/arcanum-runtime/src/receipt.rs` | Opaque non-serializable `SigningHandle`; provider-neutral digest-only signer; Tempus CP4 receipts, unavailable means unsigned | Preserve API and legacy semantics. Digest-only signing does not authenticate the complete new envelope; keep distinct v1 message API |
| `runtime/arcanum-runtime/src/persistence.rs` | Immutable Tempus IDs, exact replay, file sync; writes directly into final file before sync completes | Preserve certified format. Not a qualified content-plus-receipt transaction; A16 operation store must stage and publish separately |
| `runtime/arcanum-hope-runtime/src/lib.rs` | Exact private Hope record bytes; signing is not required for reflection | Preserve private runtime semantics; no Hope intake in this slice |
| `apps/android/.../hope/AndroidHopeKeyManager.kt` | AndroidKeyStore AES-256-GCM encryption key, get-or-create | Reuse platform custody pattern, never this encryption key for signing. Recovery-time get-or-create is unsuitable for continuity credentials |
| `apps/android/.../hope/HopeProtectedStore.kt` | AES-GCM authenticated encryption, namespace AAD, temp-file/atomic replace and round-trip recovery | Preserve namespace; no format migration or private store inspection here |
| `apps/android/.../hope/HopeLocalStateCodec.kt` | Unsigned local receipt binding ID, version, digest and persistence time | Preserve existing unsigned receipts; do not reinterpret them as signed historical originals |
| `apps/android/.../architect/ArchitectPairingStore.kt` | AndroidKeyStore AES-GCM custody of a Human-transferred broker secret | Separate key purpose/alias; not a participant receipt signing credential |
| `apps/android/.../architect/ArchitectBrokerClient.kt` | HMAC-SHA256 authenticated local broker/client/session exchange | Preserve action/authorization boundaries; shared-secret HMAC is not public receipt verification |
| `apps/android/.../update/OwnPackageDistribution.kt` | APK publisher signature verification through apksig and A14 trust data | Publisher lineage remains distinct from participant-local continuity |
| `docs/specs/runtime/sovereign-continuity-substrate.md` | Immutable objects, provenance, temporal coordinates and custody declarations | Reference this vocabulary; do not activate A17 memory, provider import or a competing object model |

Android paths abbreviated above all resolve under
`apps/android/app/src/main/java/org/arcanum/nativehost/`.

## Signed-message v1

Use RFC 8949 core deterministic CBOR, with exactly one array of 20 fixed positions.
No maps, tags, floating point, indefinite lengths, alternative integer/length
encodings, trailing bytes or invalid UTF-8 are accepted. Text is preserved exactly;
no trimming or Unicode normalization. Decode/re-encode must reproduce input bytes.

| Position | Wire type | Meaning |
| --- | --- | --- |
| 0 | text | `org.arcanum.continuity.receipt` |
| 1 | unsigned integer | version `1` |
| 2 | text | `local-recording` or `human-adoption` |
| 3 | text | `local-only` |
| 4 | text | operation ID |
| 5 | text | immutable object ID |
| 6 | text | object schema version |
| 7 | text | digest algorithm `sha256` |
| 8 | bytes(32) | digest of referenced exact object bytes |
| 9 | bytes(32) | credential fingerprint |
| 10 | bytes(16) | credential generation |
| 11 | text | `ecdsa-p256-sha256-der` |
| 12 | null or array[2] | original producer `[kind, reference]` |
| 13 | array | zero to 16 source entries |
| 14 | null or integer | original occurrence time, Unix UTC milliseconds |
| 15 | null or integer | actual observation time, Unix UTC milliseconds |
| 16 | integer | local recording time, Unix UTC milliseconds |
| 17 | null or integer | actual later adoption time, Unix UTC milliseconds |
| 18 | null or bytes(32) | digest of referenced custody declaration |
| 19 | text | runtime version that produced this receipt |

Each source entry is `[kind:text, locator:text, revision:text-or-null,
digest:bytes(32)-or-null]`. Entries sort by unsigned lexicographic order of their
complete deterministic encoded bytes. Duplicate encoded entries are rejected;
wire decoding rejects unsorted entries rather than silently repairing them.
Caller-side encoding sorts supplied sources. Different revisions/digests may
legitimately refer to the same locator.

Text is nonempty, at most 2,048 UTF-8 bytes; operation/object IDs are at most 128.
The complete message is at most 64 KiB. Integer times fit signed 64-bit values.
No chronological ordering is imposed: historical observations and clock rollback
remain representable and are not evidence of authority.

`local-recording` requires a null adoption time. `human-adoption` requires an
adoption time and a source entry with kind `human-adoption-evidence` referencing
the actual confirmation evidence. The label is necessary syntax, not proof that
consent or evidence is authentic. Unknown original producer/occurrence remain
null. Later adoption cannot change original attribution or invent historical
Human authorship.

The object digest covers exact canonical object bytes under its declared schema.
Follow that schema's self-digest omission rule when applicable; this envelope does
not add an object canonicalization rule. Qualification uses an explicitly synthetic
bytes schema, not private Hope content or imported project history.

V1 `local-only` is a distinct signed-message scope literal. Legacy CP4/Hope/Tempus
`scope=local` receipts remain unchanged; no converter equates formats or meanings.

## Public wrapper and cryptography

The wrapper is deterministic CBOR `[message:bytes, publicKey:bytes(65),
signature:bytes]`, at most 66 KiB. It contains public verification material only;
the signature does not sign itself. The signed message binds the key fingerprint.

Use ECDSA on NIST P-256/secp256r1 with SHA-256. Sign the complete message once with
`SHA256withECDSA`; feeding that API a digest instead would hash twice and is rejected
by the interoperability tests. Rust uses RustCrypto `p256=0.13.2` and `sha2=0.10.9`,
with exact resolution committed in Cargo.lock. No custom curve arithmetic is used.

Public-key wire identity is uncompressed SEC1, exactly `0x04 || X[32] || Y[32]`,
big-endian. Validate exact length, curve and point. X.509/SPKI is only an adapter
representation. Fingerprint is SHA-256 of ASCII `org.arcanum.continuity.key.v1`,
one NUL byte, then the 65 public-key bytes. A future provisioner chooses 16 random
generation bytes; these are not a global Human identity claim.

Signature is strict ASN.1 DER SEQUENCE of two minimally encoded positive INTEGERs
`r,s` in `[1,n-1]`, at most 72 bytes. Reject trailing data, negative values, zero,
out-of-range scalars and nonminimal lengths/padding. Both mathematically valid
high-S and low-S signatures are accepted. Signature bytes are not receipt identity;
future retries return the committed wrapper instead of re-signing it.

`SignedContinuityReceipt::decode` validates format, not successful verification.
`verify` separately reports object digest match (unknown if bytes omitted), public
key/fingerprint match, signature validity, and binding match to an optional
separately trusted fingerprint/generation. A false/unknown result is never a pass.
Malformed/unsupported format returns an error. Credential-binding equality alone
does not prove lifecycle continuity, and must be considered alongside signature
validity and separately observed credential history. `authority_effect=none`.

The verifier proves only cryptographic facts over supplied bytes. It does not
establish original source truth, Human presence/consent, authorization, hardware
backing, global uniqueness, rights, payment or protocol finality.

## Privacy review

A body-free receipt may still contain private digests, IDs, timestamps, locators,
producer references and custody derivatives. Those remain private by default.
Signing is neither disclosure permission nor development-memory retention consent.
The public API is a verifier interface, not an export action. No network calls,
private key serialization, custody provisioning, private store reading, provider
intake or UI export capability is introduced.

Only synthetic fixture bytes, public keys and signatures are checked into this
slice. The fixture signing key existed transiently during generation and was not
saved. No participant credential or device-private derivative enters evidence.

## Qualification and next A16 slices

[Fixed vector provenance](fixtures/a16-v1/README.md) and the focused Rust/JVM
suites qualify canonical bytes, parsing limits, complete-message signing,
wrong-key/digest/generation behavior, timestamp extremes, provenance, both S forms,
malformed CBOR/DER, tampering and preserved CP4 semantics.

Remaining acceptance is explicit:

1. Qualified staged content-plus-receipt operation store: single writer, immutable
   committed ID, identical retry, conflict rejection, each interrupted boundary,
   corrupt evidence preservation and recoverable success only after both artifacts.
2. Android custody: separate non-exportable AndroidKeyStore signing credential,
   explicit provision and replacement, truthful unavailable/missing/invalidated
   states, no recovery-time regeneration or software-key fallback; actual security
   properties recorded without assuming hardware/biometric guarantees.
3. Native confirmation/lifecycle integration on synthetic content first, preserving
   original producer, source, dates, uncertainty and additive corrections.
4. Separately authorized installed-build/device proof: restart and compatible update
   retain the credential, tampered receipts fail, lost keys are truthful. Never
   uninstall or reset the primary private installation to manufacture evidence.
5. Reconcile the integrated W04 proof with Human review before A16 closure. A17
   remains after that gate; this first slice neither closes A16 nor CE-W04.

## References

- [RFC 8949 deterministic encoding](https://www.rfc-editor.org/rfc/rfc8949.html#section-4.2.1)
- [Android Keystore custody and signing](https://developer.android.com/privacy-and-security/keystore)
- [KeyGenParameterSpec](https://developer.android.com/reference/android/security/keystore/KeyGenParameterSpec)
- [RustCrypto P-256](https://github.com/RustCrypto/elliptic-curves/tree/p256/v0.13.2/p256)
- [A15 handoff and attribution](../../evidence/ce-w04-a15-verification-20261001/a15-a16-handoff.md)
