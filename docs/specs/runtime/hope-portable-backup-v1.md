# Hope portable backup format v1

Status: first format tranche. This implements an authenticated byte envelope and
synthetic host/device tests. It does not implement participant export/import UI,
collection semantic validation, vault creation, cross-device restoration or cloud sync.

## Scope and custody

The Human selected manual encrypted backup with a separately retained generated
recovery code, followed by explicit restore only into a new, empty vault. Existing
vaults must remain untouched. No Android Keystore key, ChainCode or identity
signing authority is exported. All current test keys and records are public synthetic
fixtures. No production key or reflection belongs in diagnostics or the repository.

## Wire format

A binary file, all integers big-endian, with exactly this layout:

| Offset | Bytes | Meaning |
| --- | --- | --- |
| 0 | 8 | ASCII `HOPEBKP!` |
| 8 | 1 | Version `01` |
| 9 | 12 | Fresh random GCM nonce |
| 21 | 4 | Plaintext length, 1 through 16,777,216 |
| 25 | length | AES-256-GCM ciphertext |
| 25 + length | 16 | Authentication tag |

The entire 25-byte header is authenticated additional data. Exact total file length
is `25 + plaintext length + 16`; reject trailing bytes and truncation. Maximum file
size is 16,777,257 bytes. Reject unknown magic/version and out-of-range lengths
before decryption. This fixed binary layout has no JSON fields or duplicate-key
ambiguity; the companion JSON schema describes conformance-vector records, not
a second accepted wire encoding.

Use platform `AES/GCM/NoPadding`, a 256-bit SecureRandom-generated key and a
fresh 96-bit nonce for each sealing operation, with a 128-bit tag. The public sealing
API accepts neither an existing recovery key nor a chosen nonce. The recovery code
is `HBP1:` plus canonical unpadded URL-safe Base64 of the 32-byte key (43 encoded
characters). Reject alternate encodings, padding, whitespace, malformed lengths
and unknown prefixes. This is generated key material, not a user password; no
password-based derivation or guessed passphrase is accepted.

The platform verifies authentication before returning plaintext. Treat wrong-code,
authentication and format failures as generic privacy-safe errors with no input or
provider cause attached. Best-effort clearing of temporary key arrays does not
promise erasure of JVM/provider copies or immutable recovery-code strings. Public
APIs return deliberately private byte/string objects; callers must never log them.

References: [JDK Cipher](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/javax/crypto/Cipher.html)
and [Android GCMParameterSpec](https://developer.android.com/reference/javax/crypto/spec/GCMParameterSpec).
The 16MiB length ceiling bounds the byte-array codec, not a future file reader or
whole-process heap. Future input adapters must enforce the file cap before allocation.

## Payload and later import gate

The future payload is one locked `HopeCollectionCodec` serialization: exact original
reflection JSON, receipts, sequence state, active/archive states and retired-ID
suppression metadata. Header size reveals total payload size; IDs, timestamps and
contents remain encrypted. No compression in v1. A fresh destination revision must
invalidate stale UI deletion selections while preserving original receipts.

Successful envelope authentication alone does not establish a valid collection.
The follow-on coordinator must invoke existing Rust snapshot validation and Android
receipt validation before preview or persistence. Arbitrary authenticated bytes are
explicitly accepted by this low-level envelope and must be rejected by that higher
layer when they do not form a valid collection.

Restore must refuse retained, archived-only, initialized-but-empty, legacy, missing-file,
missing-key or other ambiguous destination state. A new vault must have no previous
Hope custody evidence. Recheck under lock at commit, not just at preview. Export
never mutates the source collection. Old backups may contain subsequently deleted
records; do not promise deletion from independent copies or recovery without the code.

Before adding storage effects, define and test: bounded read -> authentication ->
semantic validation -> preview -> participant confirmation -> locked fresh-vault
recheck -> durable pending import -> new destination custody -> atomic protected
commit -> readback verification -> completion. Failed or interrupted effects preserve
backup and existing state; unknown outcomes require reconciliation, never a blind
retry or automatic reset. No new key, marker or vault write is performed by this tranche.

## Verification and limits

Host tests cover exact bytes including Unicode/whitespace, independently generated
Python AES-GCM vectors, every-byte corruption, wrong/noncanonical codes, truncation,
trailing bytes, version and length rejection, maximum size and privacy-safe errors.
A memory-only Android instrumentation test exercises the same independent vector,
random round trip and rejection cases on the designated qualification phone. It
opens no vault and touches no Keystore alias. Existing collection preservation is
verified separately during the compatible qualification update.

These tests qualify interoperability between the independent fixture generator,
JVM crypto and Android crypto. They do not establish two-device vault restoration,
recovery-code UI, file destination behavior, storage interruption safety or backup
availability. Those remain the next bounded tranche before any participant backup
capability is presented as complete.
