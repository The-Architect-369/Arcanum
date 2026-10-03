//! Narrow synthetic-only A16 native surface. Never reads Hope/Journey content.
use std::path::Path;

use crate::continuity_receipt::{
    sha256, ContinuityReceipt, Producer, ReceiptType, SignedContinuityReceipt, SourceReference,
    MAX_MESSAGE_BYTES, MAX_WRAPPER_BYTES,
};
use crate::continuity_store::{FileContinuityStore, OperationPhase, PreparedOperation, StoreError};
use crate::ARCANUM_RUNTIME_VERSION;

pub const NATIVE_WIRE_VERSION: i32 = 1;
pub const SYNTHETIC_OBJECT: &[u8] = b"A16 public synthetic qualification sample v1\n";

fn store(root: &Path) -> Result<FileContinuityStore, StoreError> {
    if !root.is_absolute() {
        return Err(StoreError::InvalidInput("absolute private root required"));
    }
    FileContinuityStore::open(root)
}
fn operation(id: &str) -> Result<(), StoreError> {
    if id.len() != 32
        || !id
            .bytes()
            .all(|b| b.is_ascii_hexdigit() && !b.is_ascii_uppercase())
    {
        return Err(StoreError::InvalidInput("synthetic operation ID"));
    }
    Ok(())
}
pub fn prepare(
    root: &Path,
    id: &str,
    fingerprint: [u8; 32],
    generation: [u8; 16],
    confirmed_at_ms: i64,
    adoption: bool,
) -> Result<PreparedOperation, StoreError> {
    operation(id)?;
    let receipt = ContinuityReceipt {
        receipt_type: if adoption {
            ReceiptType::HumanAdoption
        } else {
            ReceiptType::LocalRecording
        },
        operation_id: id.to_owned(),
        object_id: format!("synthetic-{id}"),
        object_schema: "arcanum.public-synthetic-text/v1".to_owned(),
        object_digest: sha256(SYNTHETIC_OBJECT),
        credential_fingerprint: fingerprint,
        credential_generation: generation,
        original_producer: Some(Producer {
            kind: "public-synthetic-fixture".to_owned(),
            reference: "a16-native-qualification-v1".to_owned(),
        }),
        sources: if adoption {
            vec![SourceReference {
                kind: "human-adoption-evidence".to_owned(),
                locator: format!("native-confirmation:{id}"),
                revision: None,
                digest: None,
            }]
        } else {
            Vec::new()
        },
        occurred_at_ms: None,
        observed_at_ms: None,
        recorded_at_ms: confirmed_at_ms,
        adopted_at_ms: adoption.then_some(confirmed_at_ms),
        custody_digest: None,
        runtime_version: ARCANUM_RUNTIME_VERSION.to_owned(),
    };
    store(root)?.prepare(SYNTHETIC_OBJECT, &receipt)
}
pub fn inspect(root: &Path, id: &str) -> Result<OperationPhase, StoreError> {
    operation(id)?;
    store(root)?.inspect(id)
}
pub fn commit(
    root: &Path,
    id: &str,
    message: Vec<u8>,
    public_key: [u8; 65],
    signature_der: Vec<u8>,
) -> Result<PreparedOperation, StoreError> {
    operation(id)?;
    let wrapper = SignedContinuityReceipt {
        message,
        public_key,
        signature_der,
    }
    .encode()
    .map_err(|_| StoreError::InvalidInput("signed wrapper"))?;
    verify_synthetic(&wrapper)?;
    let committed = store(root)?.commit(id, &wrapper)?;
    presentation(&committed.object, committed.wrapper)
}
pub fn publish(root: &Path, id: &str, wrapper: &[u8]) -> Result<PreparedOperation, StoreError> {
    operation(id)?;
    verify_synthetic(wrapper)?;
    let committed = store(root)?.commit(id, wrapper)?;
    presentation(&committed.object, committed.wrapper)
}
fn verify_synthetic(wrapper: &[u8]) -> Result<SignedContinuityReceipt, StoreError> {
    let signed = SignedContinuityReceipt::decode(wrapper)
        .map_err(|_| StoreError::InvalidInput("wrapper format"))?;
    let report = signed
        .verify(Some(SYNTHETIC_OBJECT), None)
        .map_err(|_| StoreError::InvalidInput("verification format"))?;
    if !report.signature_valid
        || !report.public_key_fingerprint_matches
        || report.object_digest_matches != Some(true)
        || report.receipt.object_schema != "arcanum.public-synthetic-text/v1"
        || report.receipt.object_id != format!("synthetic-{}", report.receipt.operation_id)
    {
        return Err(StoreError::InvalidInput("synthetic receipt binding"));
    }
    Ok(signed)
}
pub fn recover(root: &Path, id: &str) -> Result<PreparedOperation, StoreError> {
    operation(id)?;
    let committed = store(root)?.recover(id)?;
    presentation(&committed.object, committed.wrapper)
}
fn presentation(object: &[u8], wrapper: Vec<u8>) -> Result<PreparedOperation, StoreError> {
    if object != SYNTHETIC_OBJECT {
        return Err(StoreError::Corrupt("synthetic object boundary"));
    }
    let signed = verify_synthetic(&wrapper)?;
    Ok(PreparedOperation {
        message: signed.message,
        phase: OperationPhase::Committed,
        prepared_wrapper: Some(wrapper),
    })
}
/// Closed, bounded JNI packet: wire byte, phase byte, u32 message length, message,
/// u32 wrapper length, optional original wrapper. No paths or private object bytes.
pub fn packet(prepared: &PreparedOperation) -> Result<Vec<u8>, StoreError> {
    if prepared.message.len() > MAX_MESSAGE_BYTES
        || prepared
            .prepared_wrapper
            .as_ref()
            .is_some_and(|w| w.len() > MAX_WRAPPER_BYTES)
    {
        return Err(StoreError::InvalidInput("presentation bounds"));
    }
    let wrapper = prepared.prepared_wrapper.as_deref().unwrap_or_default();
    let mut result = vec![NATIVE_WIRE_VERSION as u8, phase_code(prepared.phase) as u8];
    result.extend_from_slice(&(prepared.message.len() as u32).to_be_bytes());
    result.extend_from_slice(&prepared.message);
    result.extend_from_slice(&(wrapper.len() as u32).to_be_bytes());
    result.extend_from_slice(wrapper);
    Ok(result)
}
pub fn phase_code(phase: OperationPhase) -> i32 {
    match phase {
        OperationPhase::NotFound => 0,
        OperationPhase::ContentPending => 1,
        OperationPhase::ReceiptPending => 2,
        OperationPhase::PublishPending => 3,
        OperationPhase::Committed => 4,
        OperationPhase::BlockedCorrupt => 5,
    }
}
