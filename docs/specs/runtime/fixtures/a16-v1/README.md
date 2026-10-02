# A16 v1 public synthetic qualification vectors

Generated 2026-10-02 by a separate Python 3 reference encoder and cryptography
41.0.7/OpenSSL ECDSA implementation; consumed by RustCrypto and Java JCA tests.
Each `.hex` file is lowercase hexadecimal plus one newline. Decode before using
it as message/object/public-key/signature/wrapper bytes. No private signing key
was saved. These vectors are synthetic public evidence, not participant receipts.

All three reference the exact object bytes `A16 public synthetic fixture v1\n`
and use generation bytes `00` through `0f`. The same transient P-256 fixture key
signed each message. Its public key is included; signature output was nondeterministic
and the committed values are frozen, never regenerated during testing.

- `recording-minimal`: local recording, unknown producer and original/observation
  time; recorded time zero; no sources, adoption or custody declaration.
- `recording-rich`: assistant producer, two sorted source entries, original time
  `i64::MIN`, observation time `i64::MAX`, recorded time -24, synthetic custody
  digest, and both composed/decomposed Unicode retained exactly.
- `human-adoption`: original assistant attribution retained, separate synthetic
  adoption evidence source and dates 123/456/789/788 milliseconds. Adoption can
  precede recording and does not backdate original authorship.

The independent expected field lists live in the Kotlin vector suite. Rust checks
exact encode/decode and public verification against the frozen wrappers, then
qualifies malformed input, source ordering, all-byte tampering, wrong credentials,
double hashing and S normalization independently. JVM tests reproduce message and
wrapper bytes, verify signatures using `SHA256withECDSA`, and reject all-byte
message alteration and double hashing. No AndroidKeyStore behavior is simulated
or certified by these JVM tests.
