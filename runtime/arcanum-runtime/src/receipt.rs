use std::fmt;

use crate::tempus::TempusAnchor;

pub const LOCAL_RECEIPT_SCHEMA_VERSION: &str = "0.1.0";
pub const TEMPUS_LOCAL_RECEIPT_TYPE: &str = "tempus-anchor";
pub const LOCAL_RECEIPT_SCOPE: &str = "local";

/// Opaque local reference to signing capability.
///
/// The handle is deliberately not serializable through this runtime surface and
/// its debug representation never reveals the underlying reference. Possession
/// of a handle does not itself grant authority; a signer/provider still decides
/// whether the requested operation is available.
#[derive(Clone, PartialEq, Eq, Hash)]
pub struct SigningHandle(String);

impl SigningHandle {
    pub fn new(reference: impl Into<String>) -> Result<Self, SigningHandleError> {
        let reference = reference.into();
        if reference.trim().is_empty() {
            return Err(SigningHandleError::EmptyReference);
        }
        Ok(Self(reference))
    }

    /// Compares opaque handle identity without exposing its internal reference.
    pub fn same_handle(&self, other: &Self) -> bool {
        self.0 == other.0
    }
}

impl fmt::Debug for SigningHandle {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str("SigningHandle([opaque])")
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SigningHandleError {
    EmptyReference,
}

impl fmt::Display for SigningHandleError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::EmptyReference => formatter.write_str("signing handle reference must not be empty"),
        }
    }
}

impl std::error::Error for SigningHandleError {}

/// Opaque result supplied by a local signing provider.
///
/// `signer_ref` identifies the local signer/key provenance without exposing key
/// material. `signature` remains provider-defined bytes; CE-W01 deliberately
/// does not select a production algorithm or keystore.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LocalSignature {
    pub signer_ref: String,
    pub signature: Vec<u8>,
}

#[derive(Debug)]
pub enum SigningFailure<E> {
    Unavailable,
    Provider(E),
}

/// Provider-neutral signing boundary fixed by the CE-W01 runtime contract.
///
/// Only the receipt's supplied content digest is passed through this boundary.
/// CE-W01 does not invent a second signing algorithm or a new keystore contract.
pub trait LocalReceiptSigner {
    type Error;

    fn sign_digest(
        &self,
        data_digest: &[u8; 32],
        signing_handle: &SigningHandle,
    ) -> Result<LocalSignature, SigningFailure<Self::Error>>;
}

/// Minimum Tempus-specific local receipt required by the current CP4 boundary.
///
/// This receipt is local-only. It is not an ARCnet witness, transaction,
/// capability grant, identity statement, or interpretation of temporal facts.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TempusLocalReceipt {
    pub receipt_id: String,
    pub schema_version: &'static str,
    pub receipt_type: &'static str,
    pub anchor_id: String,
    pub anchor_schema_version: String,
    pub content_digest: [u8; 32],
    pub persisted_at: String,
    pub runtime_version: String,
    pub signer_ref: Option<String>,
    pub signature: Option<Vec<u8>>,
    pub scope: &'static str,
}

impl TempusLocalReceipt {
    pub fn is_signed(&self) -> bool {
        self.signer_ref.is_some() && self.signature.is_some()
    }
}

#[derive(Debug)]
pub enum TempusReceiptError<E> {
    InvalidInput(&'static str),
    SigningProvider(E),
    InvalidSignerResult(&'static str),
}

impl<E: fmt::Display> fmt::Display for TempusReceiptError<E> {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidInput(field) => write!(formatter, "invalid local receipt input: {field}"),
            Self::SigningProvider(error) => write!(formatter, "local receipt signer failed: {error}"),
            Self::InvalidSignerResult(field) => {
                write!(formatter, "invalid local signer result: {field}")
            }
        }
    }
}

impl<E> std::error::Error for TempusReceiptError<E>
where
    E: std::error::Error + 'static,
{
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::SigningProvider(error) => Some(error),
            Self::InvalidInput(_) | Self::InvalidSignerResult(_) => None,
        }
    }
}

/// Creates the local receipt after the caller has accepted/persisted the anchor.
///
/// CP4 keeps persistence and signing separate: this function does not alter the
/// certified CP4-B anchor store or persist the receipt itself. A signer that is
/// unavailable yields an explicitly unsigned local receipt rather than a
/// fabricated signature or protocol identity.
pub fn create_tempus_local_receipt<S: LocalReceiptSigner>(
    signer: &S,
    signing_handle: &SigningHandle,
    receipt_id: impl Into<String>,
    anchor: &TempusAnchor,
    content_digest: [u8; 32],
    persisted_at: impl Into<String>,
    runtime_version: impl Into<String>,
) -> Result<TempusLocalReceipt, TempusReceiptError<S::Error>> {
    let receipt_id = receipt_id.into();
    let persisted_at = persisted_at.into();
    let runtime_version = runtime_version.into();

    require_non_empty(&receipt_id, "receiptId")?;
    require_non_empty(&anchor.anchor_id, "anchorId")?;
    require_non_empty(anchor.schema_version, "anchorSchemaVersion")?;
    require_non_empty(&persisted_at, "persistedAt")?;
    require_non_empty(&runtime_version, "runtimeVersion")?;

    let (signer_ref, signature) =
        match signer.sign_digest(&content_digest, signing_handle) {
            Ok(result) => {
                if result.signer_ref.trim().is_empty() {
                    return Err(TempusReceiptError::InvalidSignerResult("signerRef"));
                }
                if result.signature.is_empty() {
                    return Err(TempusReceiptError::InvalidSignerResult("signature"));
                }
                (Some(result.signer_ref), Some(result.signature))
            }
            Err(SigningFailure::Unavailable) => (None, None),
            Err(SigningFailure::Provider(error)) => {
                return Err(TempusReceiptError::SigningProvider(error));
            }
        };

    Ok(TempusLocalReceipt {
        receipt_id,
        schema_version: LOCAL_RECEIPT_SCHEMA_VERSION,
        receipt_type: TEMPUS_LOCAL_RECEIPT_TYPE,
        anchor_id: anchor.anchor_id.clone(),
        anchor_schema_version: anchor.schema_version.to_owned(),
        content_digest,
        persisted_at,
        runtime_version,
        signer_ref,
        signature,
        scope: LOCAL_RECEIPT_SCOPE,
    })
}

fn require_non_empty<E>(value: &str, field: &'static str) -> Result<(), TempusReceiptError<E>> {
    if value.trim().is_empty() {
        Err(TempusReceiptError::InvalidInput(field))
    } else {
        Ok(())
    }
}
