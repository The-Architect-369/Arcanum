# Hope participant backup controls

This follows the authenticated [v1 envelope](hope-portable-backup-v1.md). Manual
export includes the complete retained collection, archives, original receipts,
ordering and retired-ID suppression metadata. It never exports device keys,
identity authority or Architect memory. Source export is a locked read without
migration or cleanup. Open/migrate the local collection before exporting.

## Participant flow

Open **Backup and restore** from Hope. Prepare the encrypted snapshot; record its
fresh recovery code separately, then acknowledge this and choose a destination.
The file contains ciphertext only. Completion requires closing the output and
reading back identical bytes. A provider failure can leave a partial file: the
screen reports an unverified operation, never a completed backup. The system
picker requests local destinations; the participant controls the provider and
its own synchronization policy. No automatic upload or clipboard write occurs.

Restore selects a bounded file, requests the separately saved code, authenticates
and validates the complete payload through Rust collection rules and Android
receipt checks, then previews active/archive counts. Confirmation rechecks the
destination under the collection lock. Any prior key, collection, initialization
marker, legacy data, temporary file or unknown storage refuses restore. Even a
previously initialized empty vault is preserved. Cancelling preview creates no
custody. Stored data receives a fresh local revision and a new device key, while
original reflection bytes, receipts and archive state remain unchanged.

An old backup can include reflections deleted later. No claim is made about erasing
independent backup copies. Lost recovery codes cannot be replaced by the device key.
The backup screen uses FLAG_SECURE, private observation markings, no saved private
instance state or autofill, and clears temporary arrays best effort. JVM strings
and provider buffers prevent a guarantee of complete memory erasure. Rotation or
process loss discards selections; never automatically retry an uncertain write.

## Interrupted restore

A durable `backup-import.pending` intent precedes key creation. It contains only a
SHA-256 commitment to the private encoded destination payload. An initialization
marker, fresh key and atomic encrypted write follow. Readback and semantic
validation must match the commitment before the pending intent is removed.
Normal collection operations refuse a pending import, including save and export.

**Finish interrupted restore** only reads and validates an already written
ciphertext against that intent, then finalizes it. It never replays the backup,
creates a replacement key or clears state. Interruption before complete ciphertext,
missing keys, corrupt or mismatched ciphertext remain blocked with all available
data preserved. Repairing such incomplete custody or selecting a replacement vault
requires a separately designed recovery action; this screen offers no reset.

## Qualification boundary

Host tests exercise cancellation, malformed data, destination races, custody
refusals, stream limits, interrupted writes and explicit reconciliation. Android
tests use independent synthetic directories and distinct non-exportable Keystore
aliases with real Rust validation. They test exact bytes/receipts, archive state,
retired IDs, wrong-key isolation and refusal after emptying an initialized vault.
The participant screen is checked without opening the participant's own vault.

Separate vaults on the S23 establish independent-key behavior, not two physical
devices. Real second-device qualification and provider-specific file-picker
walkthroughs remain distinct evidence gates; no everyday-phone installation or
personal reflection export is authorized by the synthetic test packet.
