//! A16 staged content/receipt transactions. No signing, enrollment or network.
//!
//! Recovery never repeats an external effect. All cooperating writers, including
//! separate store instances/processes, use one OS advisory file lock. Supported
//! callers supply an app-private root; this is not protection against a hostile
//! owner of that root or filesystem rollback. Plaintext storage is qualified on
//! synthetic content only; private ingestion still needs its own custody policy.
use std::fmt;
use std::fs::{self, File, OpenOptions};
use std::io::{self, Read, Write};
use std::path::{Path, PathBuf};

use crate::continuity_receipt::{
    sha256, ContinuityReceipt, SignedContinuityReceipt, MAX_MESSAGE_BYTES, MAX_WRAPPER_BYTES,
};

pub const MAX_OBJECT_BYTES: usize = 4 * 1024 * 1024;
const MANIFEST_MAGIC: &[u8] = b"ARCANUM-CONTINUITY-TRANSACTION-V1\0";

#[derive(Debug)]
pub enum StoreError {
    Busy,
    NotFound,
    Conflict,
    Corrupt(&'static str),
    InvalidInput(&'static str),
    Storage(io::Error),
}
impl fmt::Display for StoreError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Busy => f.write_str("continuity store has another writer"),
            Self::NotFound => f.write_str("continuity operation not found"),
            Self::Conflict => f.write_str("operation ID already binds different content"),
            Self::Corrupt(reason) => write!(f, "continuity operation blocked: {reason}"),
            Self::InvalidInput(reason) => write!(f, "invalid continuity input: {reason}"),
            // Do not expose paths or content through the public error text.
            Self::Storage(_) => {
                f.write_str("continuity storage unavailable; reconcile original operation")
            }
        }
    }
}
impl std::error::Error for StoreError {}
impl From<io::Error> for StoreError {
    fn from(value: io::Error) -> Self {
        Self::Storage(value)
    }
}
type Result<T> = std::result::Result<T, StoreError>;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OperationPhase {
    NotFound,
    ContentPending,
    ReceiptPending,
    PublishPending,
    Committed,
    BlockedCorrupt,
}

#[derive(Clone, PartialEq, Eq)]
pub struct PreparedOperation {
    /// Frozen canonical message: preserve its original recording time on retry.
    pub message: Vec<u8>,
    pub phase: OperationPhase,
    /// Reuse this original signature on publication retry. Never sign again merely
    /// because the earlier commit acknowledgment is missing.
    pub prepared_wrapper: Option<Vec<u8>>,
}

#[derive(Clone, PartialEq, Eq)]
pub struct CommittedOperation {
    pub object: Vec<u8>,
    /// Original committed bytes, even if a retry supplies a different valid ECDSA signature.
    pub wrapper: Vec<u8>,
}

pub struct FileContinuityStore {
    root: PathBuf,
    #[cfg(test)]
    fail_after: Option<&'static str>,
}
impl FileContinuityStore {
    pub fn open(private_root: impl AsRef<Path>) -> Result<Self> {
        ensure_dir(private_root.as_ref())?;
        let root = private_root.as_ref().join("continuity-operations.v1");
        ensure_dir(&root)?;
        ensure_dir(&root.join("staging"))?;
        ensure_dir(&root.join("committed"))?;
        sync_dir(&root)?;
        sync_dir(private_root.as_ref())?;
        Ok(Self {
            root,
            #[cfg(test)]
            fail_after: None,
        })
    }

    pub fn prepare(&self, object: &[u8], receipt: &ContinuityReceipt) -> Result<PreparedOperation> {
        if object.len() > MAX_OBJECT_BYTES || sha256(object) != receipt.object_digest {
            return Err(StoreError::InvalidInput("object size or digest mismatch"));
        }
        let requested = receipt
            .encode()
            .map_err(|_| StoreError::InvalidInput("receipt format"))?;
        let _lock = self.lock()?;
        let (stage, committed) = self.paths(&receipt.operation_id)?;
        if exists(&committed)? {
            if exists(&stage)? {
                return Err(StoreError::Corrupt("duplicate operation locations"));
            }
            let existing = self.read_committed(&committed, &receipt.operation_id)?;
            let saved = SignedContinuityReceipt::decode(&existing.wrapper)
                .map_err(|_| StoreError::Corrupt("wrapper"))?;
            compare_request(receipt, &saved.message)?;
            if existing.object != object {
                return Err(StoreError::Conflict);
            }
            // A prior publish may have returned an I/O error after rename.
            self.sync_publication()?;
            return Ok(PreparedOperation {
                message: saved.message,
                phase: OperationPhase::Committed,
                prepared_wrapper: Some(existing.wrapper),
            });
        }
        if exists(&stage)? {
            // Reconcile before extending anything: never fill a hole in damaged
            // signed state or reinterpret an empty interrupted directory as fresh.
            self.stage_phase(&stage, &receipt.operation_id)?;
        } else {
            fs::create_dir(&stage)?;
            sync_dir(&self.root.join("staging"))?;
        }
        check_entries(&stage)?;
        let message_path = stage.join("message.cbor");
        let message = if exists(&message_path)? {
            let saved = bounded_read(&message_path, MAX_MESSAGE_BYTES)?;
            compare_request(receipt, &saved)?;
            saved
        } else {
            if fs::read_dir(&stage)?.next().is_some() {
                return Err(StoreError::Corrupt("intent missing"));
            }
            write_new(&stage, "message.cbor", &requested)?;
            self.boundary("message")?;
            requested
        };
        let object_path = stage.join("object.bin");
        if exists(&object_path)? {
            if bounded_read(&object_path, MAX_OBJECT_BYTES)? != object {
                return Err(StoreError::Corrupt("staged object differs"));
            }
        } else {
            write_new(&stage, "object.bin", object)?;
            self.boundary("object")?;
        }
        // Validate any previously prepared receipt/manifest before exposing readiness.
        let phase = self.stage_phase(&stage, &receipt.operation_id)?;
        let prepared_wrapper = if phase == OperationPhase::PublishPending {
            Some(bounded_read(
                &stage.join("receipt.cbor"),
                MAX_WRAPPER_BYTES,
            )?)
        } else {
            None
        };
        Ok(PreparedOperation {
            message,
            phase,
            prepared_wrapper,
        })
    }

    pub fn commit(
        &self,
        operation_id: &str,
        supplied_wrapper: &[u8],
    ) -> Result<CommittedOperation> {
        let supplied = SignedContinuityReceipt::decode(supplied_wrapper)
            .map_err(|_| StoreError::InvalidInput("wrapper format"))?;
        let supplied_message = ContinuityReceipt::decode(&supplied.message)
            .map_err(|_| StoreError::InvalidInput("message format"))?;
        if supplied_message.operation_id != operation_id {
            return Err(StoreError::Conflict);
        }
        let _lock = self.lock()?;
        let (stage, committed) = self.paths(operation_id)?;
        if exists(&committed)? {
            if exists(&stage)? {
                return Err(StoreError::Corrupt("duplicate operation locations"));
            }
            let saved = self.read_committed(&committed, operation_id)?;
            compare_wrapper(&saved.object, &saved.wrapper, &supplied, operation_id)?;
            self.sync_publication()?;
            return Ok(saved);
        }
        if !exists(&stage)? {
            return Err(StoreError::NotFound);
        }
        check_entries(&stage)?;
        let message = bounded_read(&stage.join("message.cbor"), MAX_MESSAGE_BYTES)?;
        let object = bounded_read(&stage.join("object.bin"), MAX_OBJECT_BYTES)?;
        if supplied.message != message {
            return Err(StoreError::Conflict);
        }
        validate_wrapper(&object, supplied_wrapper, operation_id)?;
        let receipt_path = stage.join("receipt.cbor");
        let wrapper = if exists(&receipt_path)? {
            let saved = bounded_read(&receipt_path, MAX_WRAPPER_BYTES)?;
            compare_wrapper(&object, &saved, &supplied, operation_id)?;
            saved
        } else {
            write_new(&stage, "receipt.cbor", supplied_wrapper)?;
            self.boundary("receipt")?;
            supplied_wrapper.to_vec()
        };
        let manifest = manifest_bytes(&object, &message, &wrapper);
        let manifest_path = stage.join("manifest.bin");
        if exists(&manifest_path)? {
            if bounded_read(&manifest_path, manifest.len())? != manifest {
                return Err(StoreError::Corrupt("manifest mismatch"));
            }
        } else {
            write_new(&stage, "manifest.bin", &manifest)?;
            self.boundary("manifest")?;
        }
        sync_dir(&stage)?;
        // Both destinations are under the same private namespace and writer lock.
        // Never overwrite an operation ID. All supported writers hold this lock.
        if exists(&committed)? {
            return Err(StoreError::Conflict);
        }
        fs::rename(&stage, &committed)?;
        self.boundary("rename")?;
        self.sync_publication()?;
        self.boundary("sync")?;
        self.read_committed(&committed, operation_id)
    }

    /// Read-only state classification. No provisioning, signing or publication.
    pub fn inspect(&self, operation_id: &str) -> Result<OperationPhase> {
        let _lock = self.lock()?;
        let (stage, committed) = self.paths(operation_id)?;
        let result = if exists(&committed)? {
            if exists(&stage)? {
                Err(StoreError::Corrupt(
                    "both staged and committed records exist",
                ))
            } else {
                self.read_committed(&committed, operation_id)
                    .map(|_| OperationPhase::Committed)
            }
        } else if exists(&stage)? {
            self.stage_phase(&stage, operation_id)
        } else {
            Ok(OperationPhase::NotFound)
        };
        match result {
            Err(StoreError::Corrupt(_)) => Ok(OperationPhase::BlockedCorrupt),
            other => other,
        }
    }

    /// Returns only validated committed content plus its original receipt.
    pub fn recover(&self, operation_id: &str) -> Result<CommittedOperation> {
        let _lock = self.lock()?;
        let (stage, committed) = self.paths(operation_id)?;
        if !exists(&committed)? {
            return Err(StoreError::NotFound);
        }
        if exists(&stage)? {
            return Err(StoreError::Corrupt(
                "both staged and committed records exist",
            ));
        }
        self.read_committed(&committed, operation_id)
    }

    fn paths(&self, operation_id: &str) -> Result<(PathBuf, PathBuf)> {
        if operation_id.is_empty() || operation_id.len() > 128 {
            return Err(StoreError::InvalidInput("operation ID"));
        }
        let component: String = sha256(operation_id.as_bytes())
            .iter()
            .map(|b| format!("{b:02x}"))
            .collect();
        Ok((
            self.root.join("staging").join(&component),
            self.root.join("committed").join(component),
        ))
    }

    fn lock(&self) -> Result<WriterLock> {
        for dir in [
            &self.root,
            &self.root.join("staging"),
            &self.root.join("committed"),
        ] {
            if !fs::symlink_metadata(dir)?.file_type().is_dir() {
                return Err(StoreError::Corrupt("namespace is not a directory"));
            }
        }
        let path = self.root.join("writer.lock");
        if exists(&path)? && !fs::symlink_metadata(&path)?.file_type().is_file() {
            return Err(StoreError::Corrupt("lock is not a regular file"));
        }
        let file = OpenOptions::new()
            .read(true)
            .write(true)
            .create(true)
            .truncate(false)
            .open(path)?;
        match fs2::FileExt::try_lock_exclusive(&file) {
            Ok(()) => Ok(WriterLock(file)),
            Err(error)
                if error.kind() == io::ErrorKind::WouldBlock
                    || error.raw_os_error() == fs2::lock_contended_error().raw_os_error() =>
            {
                Err(StoreError::Busy)
            }
            Err(error) => Err(error.into()),
        }
    }

    fn sync_publication(&self) -> Result<()> {
        sync_dir(&self.root.join("staging"))?;
        sync_dir(&self.root.join("committed"))?;
        sync_dir(&self.root)
    }

    fn stage_phase(&self, stage: &Path, operation_id: &str) -> Result<OperationPhase> {
        check_entries(stage)?;
        if !exists(&stage.join("message.cbor"))? {
            return Err(StoreError::Corrupt("intent missing"));
        }
        let message = bounded_read(&stage.join("message.cbor"), MAX_MESSAGE_BYTES)?;
        let receipt = ContinuityReceipt::decode(&message)
            .map_err(|_| StoreError::Corrupt("intent format"))?;
        if receipt.operation_id != operation_id {
            return Err(StoreError::Corrupt("intent ID mismatch"));
        }
        if !exists(&stage.join("object.bin"))? {
            if exists(&stage.join("receipt.cbor"))? || exists(&stage.join("manifest.bin"))? {
                return Err(StoreError::Corrupt("receipt without content"));
            }
            return Ok(OperationPhase::ContentPending);
        }
        let object = bounded_read(&stage.join("object.bin"), MAX_OBJECT_BYTES)?;
        if sha256(&object) != receipt.object_digest {
            return Err(StoreError::Corrupt("object digest"));
        }
        if !exists(&stage.join("receipt.cbor"))? {
            if exists(&stage.join("manifest.bin"))? {
                return Err(StoreError::Corrupt("manifest without receipt"));
            }
            return Ok(OperationPhase::ReceiptPending);
        }
        let wrapper = bounded_read(&stage.join("receipt.cbor"), MAX_WRAPPER_BYTES)?;
        let signed = validate_wrapper(&object, &wrapper, operation_id)?;
        if signed.message != message {
            return Err(StoreError::Corrupt("frozen message binding"));
        }
        if exists(&stage.join("manifest.bin"))? {
            let manifest = manifest_bytes(&object, &message, &wrapper);
            if bounded_read(&stage.join("manifest.bin"), manifest.len())? != manifest {
                return Err(StoreError::Corrupt("manifest digest"));
            }
        }
        Ok(OperationPhase::PublishPending)
    }

    fn read_committed(&self, path: &Path, operation_id: &str) -> Result<CommittedOperation> {
        check_entries(path)?;
        if fs::read_dir(path)?.count() != 4 {
            return Err(StoreError::Corrupt("incomplete committed operation"));
        }
        let object = bounded_read(&path.join("object.bin"), MAX_OBJECT_BYTES)?;
        let message = bounded_read(&path.join("message.cbor"), MAX_MESSAGE_BYTES)?;
        let wrapper = bounded_read(&path.join("receipt.cbor"), MAX_WRAPPER_BYTES)?;
        let signed = validate_wrapper(&object, &wrapper, operation_id)?;
        if signed.message != message {
            return Err(StoreError::Corrupt("committed message binding"));
        }
        let manifest = manifest_bytes(&object, &message, &wrapper);
        if bounded_read(&path.join("manifest.bin"), manifest.len())? != manifest {
            return Err(StoreError::Corrupt("committed manifest digest"));
        }
        Ok(CommittedOperation { object, wrapper })
    }

    fn boundary(&self, _label: &'static str) -> Result<()> {
        #[cfg(test)]
        if self.fail_after == Some(_label) {
            return Err(StoreError::Storage(io::Error::new(
                io::ErrorKind::Interrupted,
                "qualification fault",
            )));
        }
        Ok(())
    }
}

struct WriterLock(File);
impl Drop for WriterLock {
    fn drop(&mut self) {
        let _ = fs2::FileExt::unlock(&self.0);
    }
}

fn compare_request(requested: &ContinuityReceipt, saved_message: &[u8]) -> Result<()> {
    let saved = ContinuityReceipt::decode(saved_message)
        .map_err(|_| StoreError::Corrupt("frozen intent"))?;
    let mut retry = requested.clone();
    // Only the local recording clock is frozen by the store. Original provenance,
    // observation/adoption times and every other semantic input must still match.
    retry.recorded_at_ms = saved.recorded_at_ms;
    if retry
        .encode()
        .map_err(|_| StoreError::InvalidInput("retry input"))?
        != saved_message
    {
        return Err(StoreError::Conflict);
    }
    Ok(())
}
fn compare_wrapper(
    object: &[u8],
    saved: &[u8],
    supplied: &SignedContinuityReceipt,
    operation_id: &str,
) -> Result<()> {
    let saved = validate_wrapper(object, saved, operation_id)?;
    validate_wrapper(
        object,
        &supplied
            .encode()
            .map_err(|_| StoreError::InvalidInput("wrapper"))?,
        operation_id,
    )?;
    if saved.message != supplied.message || saved.public_key != supplied.public_key {
        return Err(StoreError::Conflict);
    }
    Ok(())
}
fn validate_wrapper(
    object: &[u8],
    bytes: &[u8],
    operation_id: &str,
) -> Result<SignedContinuityReceipt> {
    let signed = SignedContinuityReceipt::decode(bytes)
        .map_err(|_| StoreError::Corrupt("signed wrapper format"))?;
    let report = signed
        .verify(Some(object), None)
        .map_err(|_| StoreError::Corrupt("verification format"))?;
    if !report.signature_valid
        || !report.public_key_fingerprint_matches
        || report.object_digest_matches != Some(true)
        || report.receipt.operation_id != operation_id
    {
        return Err(StoreError::Corrupt(
            "receipt signature/content/credential binding",
        ));
    }
    Ok(signed)
}
fn manifest_bytes(object: &[u8], message: &[u8], wrapper: &[u8]) -> Vec<u8> {
    [
        MANIFEST_MAGIC,
        &sha256(object),
        &sha256(message),
        &sha256(wrapper),
    ]
    .concat()
}
fn exists(path: &Path) -> Result<bool> {
    match fs::symlink_metadata(path) {
        Ok(_) => Ok(true),
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(false),
        Err(error) => Err(error.into()),
    }
}
fn ensure_dir(path: &Path) -> Result<()> {
    if !exists(path)? {
        fs::create_dir_all(path)?;
    }
    if !fs::symlink_metadata(path)?.file_type().is_dir() {
        return Err(StoreError::Corrupt("namespace is not a directory"));
    }
    Ok(())
}
fn check_entries(path: &Path) -> Result<()> {
    if !fs::symlink_metadata(path)?.file_type().is_dir() {
        return Err(StoreError::Corrupt("operation is not a directory"));
    }
    for entry in fs::read_dir(path)? {
        let entry = entry?;
        if !entry.file_type()?.is_file()
            || !["message.cbor", "object.bin", "receipt.cbor", "manifest.bin"]
                .iter()
                .any(|name| entry.file_name() == *name)
        {
            return Err(StoreError::Corrupt(
                "unexpected, partial or non-regular file; evidence preserved",
            ));
        }
    }
    Ok(())
}
fn bounded_read(path: &Path, limit: usize) -> Result<Vec<u8>> {
    let metadata = fs::symlink_metadata(path).map_err(|error| {
        if error.kind() == io::ErrorKind::NotFound {
            StoreError::Corrupt("expected file missing")
        } else {
            error.into()
        }
    })?;
    if !metadata.file_type().is_file() || metadata.len() > limit as u64 {
        return Err(StoreError::Corrupt("file type or size"));
    }
    let mut bytes = Vec::new();
    File::open(path)?
        .take(limit as u64 + 1)
        .read_to_end(&mut bytes)?;
    if bytes.len() > limit {
        return Err(StoreError::Corrupt("file grew beyond size limit"));
    }
    Ok(bytes)
}
fn write_new(dir: &Path, name: &str, bytes: &[u8]) -> Result<()> {
    let temporary = dir.join(format!("{name}.partial"));
    let final_path = dir.join(name);
    if exists(&final_path)? || exists(&temporary)? {
        return Err(StoreError::Corrupt("existing file or incomplete write"));
    }
    let mut file = OpenOptions::new()
        .create_new(true)
        .write(true)
        .open(&temporary)?;
    file.write_all(bytes)?;
    file.sync_all()?;
    fs::rename(temporary, final_path)?;
    sync_dir(dir)
}
fn sync_dir(path: &Path) -> Result<()> {
    File::open(path)?.sync_all().map_err(Into::into)
}

#[cfg(test)]
mod fault_tests {
    use super::*;
    use p256::ecdsa::{signature::Signer, Signature, SigningKey};
    use rand_core::OsRng;
    #[test]
    fn every_transaction_boundary_recovers_original_state_without_repeating_signing() {
        for boundary in ["message", "object", "receipt", "manifest", "rename", "sync"] {
            let dir = std::env::temp_dir().join(format!(
                "arcanum-a16-fault-{boundary}-{}-{}",
                std::process::id(),
                std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_nanos()
            ));
            fs::create_dir(&dir).unwrap();
            let mut store = FileContinuityStore::open(&dir).unwrap();
            let key = SigningKey::random(&mut OsRng);
            let public_key = key
                .verifying_key()
                .to_encoded_point(false)
                .as_bytes()
                .try_into()
                .unwrap();
            let mut receipt = ContinuityReceipt::decode(&hex_fixture()).unwrap();
            receipt.credential_fingerprint =
                crate::continuity_receipt::credential_fingerprint(&public_key);
            let object = b"A16 public synthetic fixture v1\n";
            store.fail_after = Some(boundary);
            let preparation = store.prepare(object, &receipt);
            let frozen_message = receipt.encode().unwrap();
            let signature: Signature = key.sign(&frozen_message);
            let wrapper = SignedContinuityReceipt {
                message: frozen_message,
                public_key,
                signature_der: signature.to_der().as_bytes().to_vec(),
            }
            .encode()
            .unwrap();
            if ["message", "object"].contains(&boundary) {
                assert!(preparation.is_err());
            } else {
                assert!(preparation.is_ok());
                assert!(store.commit(&receipt.operation_id, &wrapper).is_err());
            }
            drop(store);
            let store = FileContinuityStore::open(&dir).unwrap();
            let expected = match boundary {
                "message" => OperationPhase::ContentPending,
                "object" => OperationPhase::ReceiptPending,
                "receipt" | "manifest" => OperationPhase::PublishPending,
                _ => OperationPhase::Committed,
            };
            assert_eq!(store.inspect(&receipt.operation_id).unwrap(), expected);
            let mut retry = receipt.clone();
            retry.recorded_at_ms = 5000;
            let prepared = store.prepare(object, &retry).unwrap();
            assert_eq!(prepared.message, receipt.encode().unwrap());
            let original = prepared.prepared_wrapper.as_deref().unwrap_or(&wrapper);
            assert!(store.commit(&receipt.operation_id, original).is_ok());
            assert!(store.recover(&receipt.operation_id).unwrap().wrapper == wrapper);
            fs::remove_dir_all(dir).unwrap();
        }
    }
    fn hex_fixture() -> Vec<u8> {
        let text = include_str!(
            "../../../docs/specs/runtime/fixtures/a16-v1/recording-minimal.message.hex"
        )
        .trim();
        (0..text.len())
            .step_by(2)
            .map(|i| u8::from_str_radix(&text[i..i + 2], 16).unwrap())
            .collect()
    }
}
