#![forbid(unsafe_code)]

use std::convert::Infallible;
use std::path::Path;

use arcanum_runtime::persistence::{
    FileTempusAnchorStore, TempusAnchorStore, TempusPersistenceError,
};
use arcanum_runtime::receipt::{
    create_tempus_local_receipt, LocalReceiptSigner, LocalSignature, SigningFailure, SigningHandle,
    LOCAL_RECEIPT_SCOPE,
};
use arcanum_runtime::tempus::{
    capture_tempus_anchor, ClockProvider, SystemClockProvider, TempusAnchor, TempusProviderField,
    TEMPUS_ANCHOR_SCHEMA_VERSION,
};
use arcanum_runtime::ARCANUM_RUNTIME_VERSION;
use sha2::{Digest, Sha256};

pub const LIFECYCLE_ABI_VERSION: i32 = 1;
pub const CAP_TEMPUS_PERSIST: i64 = 1 << 0;
pub const CAP_TEMPUS_RECOVER: i64 = 1 << 1;
pub const CAP_LOCAL_RECEIPT_PRESENT: i64 = 1 << 2;
pub const LIFECYCLE_CAPABILITY_MASK: i64 =
    CAP_TEMPUS_PERSIST | CAP_TEMPUS_RECOVER | CAP_LOCAL_RECEIPT_PRESENT;
pub const AUTHORITY_EFFECT: &str = "none";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LifecycleState {
    Persisted,
    Recovered,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LifecyclePresentation {
    pub state: LifecycleState,
    pub anchor_id: String,
    pub captured_at: String,
    pub receipt_scope: Option<String>,
    pub receipt_signed: Option<bool>,
}

impl LifecyclePresentation {
    pub fn presentation_line(&self) -> String {
        let anchor_ref = compact_ref(&self.anchor_id);
        match self.state {
            LifecycleState::Persisted => format!(
                "ok · Tempus local · persisted+recovered · anchor={anchor_ref} · receipt={}/{} · authorityEffect={AUTHORITY_EFFECT}",
                self.receipt_scope.as_deref().unwrap_or("unknown"),
                if self.receipt_signed.unwrap_or(false) {
                    "signed"
                } else {
                    "unsigned"
                },
            ),
            LifecycleState::Recovered => format!(
                "ok · Tempus local · recovered · anchor={anchor_ref} · authorityEffect={AUTHORITY_EFFECT}"
            ),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LifecycleError {
    InvalidInput,
    ProviderUnavailable,
    NotFound,
    StorageUnavailable,
    IntegrityFailure,
    VersionIncompatible,
    ReceiptFailure,
}

impl LifecycleError {
    pub const fn code(self) -> &'static str {
        match self {
            Self::InvalidInput => "invalid-input",
            Self::ProviderUnavailable => "provider-unavailable",
            Self::NotFound => "not-found",
            Self::StorageUnavailable => "storage-unavailable",
            Self::IntegrityFailure => "integrity-failure",
            Self::VersionIncompatible => "version-incompatible",
            Self::ReceiptFailure => "receipt-failure",
        }
    }

    pub fn presentation_line(self) -> String {
        format!(
            "error · Tempus {} · local only · authorityEffect={AUTHORITY_EFFECT}",
            self.code()
        )
    }
}

pub fn lifecycle_abi_version() -> i32 {
    LIFECYCLE_ABI_VERSION
}

pub fn lifecycle_capability_mask() -> i64 {
    LIFECYCLE_CAPABILITY_MASK
}

pub fn capture_persist_system_clock(
    root: &Path,
    anchor_id: &str,
) -> Result<LifecyclePresentation, LifecycleError> {
    capture_persist_with_provider(root, anchor_id, &SystemClockProvider)
}

pub fn recover_tempus_anchor(
    root: &Path,
    anchor_id: &str,
) -> Result<LifecyclePresentation, LifecycleError> {
    validate_inputs(root, anchor_id)?;
    let store = FileTempusAnchorStore::open(root).map_err(map_persistence_error)?;
    let anchor = store.load(anchor_id).map_err(map_persistence_error)?;
    validate_clock_anchor(&anchor)?;

    Ok(LifecyclePresentation {
        state: LifecycleState::Recovered,
        anchor_id: anchor.anchor_id,
        captured_at: anchor.captured_at,
        receipt_scope: None,
        receipt_signed: None,
    })
}

fn capture_persist_with_provider<P: ClockProvider>(
    root: &Path,
    anchor_id: &str,
    provider: &P,
) -> Result<LifecyclePresentation, LifecycleError> {
    validate_inputs(root, anchor_id)?;

    let anchor = capture_tempus_anchor(provider, anchor_id, ARCANUM_RUNTIME_VERSION)
        .map_err(|_| LifecycleError::ProviderUnavailable)?;
    validate_clock_anchor(&anchor)?;

    let store = FileTempusAnchorStore::open(root).map_err(map_persistence_error)?;
    store.persist(&anchor).map_err(map_persistence_error)?;
    let loaded = store.load(anchor_id).map_err(map_persistence_error)?;
    if loaded != anchor {
        return Err(LifecycleError::IntegrityFailure);
    }

    let persisted_at = provider
        .sample()
        .map_err(|_| LifecycleError::ProviderUnavailable)?
        .captured_at;
    let content_digest = clock_anchor_digest(&loaded);
    let signing_handle = SigningHandle::new("ce-w02-offline-signing-unavailable")
        .map_err(|_| LifecycleError::ReceiptFailure)?;
    let receipt = create_tempus_local_receipt(
        &UnavailableSigner,
        &signing_handle,
        format!("receipt:{}", loaded.anchor_id),
        &loaded,
        content_digest,
        persisted_at,
        ARCANUM_RUNTIME_VERSION,
    )
    .map_err(|_| LifecycleError::ReceiptFailure)?;

    if receipt.scope != LOCAL_RECEIPT_SCOPE
        || receipt.is_signed()
        || receipt.anchor_id != loaded.anchor_id
        || receipt.content_digest != content_digest
    {
        return Err(LifecycleError::IntegrityFailure);
    }

    Ok(LifecyclePresentation {
        state: LifecycleState::Persisted,
        anchor_id: loaded.anchor_id,
        captured_at: loaded.captured_at,
        receipt_scope: Some(receipt.scope.to_owned()),
        receipt_signed: Some(receipt.is_signed()),
    })
}

fn validate_inputs(root: &Path, anchor_id: &str) -> Result<(), LifecycleError> {
    if root.as_os_str().is_empty() || anchor_id.trim().is_empty() {
        return Err(LifecycleError::InvalidInput);
    }
    Ok(())
}

fn validate_clock_anchor(anchor: &TempusAnchor) -> Result<(), LifecycleError> {
    let valid = anchor.schema_version == TEMPUS_ANCHOR_SCHEMA_VERSION
        && anchor.source.kind.is_clock()
        && anchor.observer.is_none()
        && anchor.frame.is_none()
        && anchor.observation.kind == "clock"
        && anchor.interpretation.is_none();
    if valid {
        Ok(())
    } else {
        Err(LifecycleError::IntegrityFailure)
    }
}

fn map_persistence_error(error: TempusPersistenceError) -> LifecycleError {
    match error {
        TempusPersistenceError::NotFound(_) => LifecycleError::NotFound,
        TempusPersistenceError::StorageUnavailable { .. } => LifecycleError::StorageUnavailable,
        TempusPersistenceError::IntegrityFailure(_) => LifecycleError::IntegrityFailure,
        TempusPersistenceError::VersionIncompatible(_) => LifecycleError::VersionIncompatible,
        TempusPersistenceError::InvalidInput(_) => LifecycleError::InvalidInput,
    }
}

struct UnavailableSigner;

impl LocalReceiptSigner for UnavailableSigner {
    type Error = Infallible;

    fn sign_digest(
        &self,
        _data_digest: &[u8; 32],
        _signing_handle: &SigningHandle,
    ) -> Result<LocalSignature, SigningFailure<Self::Error>> {
        Err(SigningFailure::Unavailable)
    }
}

fn clock_anchor_digest(anchor: &TempusAnchor) -> [u8; 32] {
    let mut hasher = Sha256::new();
    digest_str(&mut hasher, &anchor.anchor_id);
    digest_str(&mut hasher, anchor.schema_version);
    digest_str(&mut hasher, &anchor.captured_at);
    digest_str(&mut hasher, &anchor.time_scale);
    digest_str(&mut hasher, anchor.source.kind.as_schema_value());
    digest_opt_str(&mut hasher, anchor.source.provider.as_deref());
    digest_opt_str(&mut hasher, anchor.source.model.as_deref());
    digest_opt_str(&mut hasher, anchor.source.version.as_deref());
    digest_opt_str(&mut hasher, anchor.source.source_id.as_deref());
    digest_str(&mut hasher, anchor.observation.kind);
    digest_opt_str(&mut hasher, anchor.observation.target.as_deref());
    digest_opt_str(&mut hasher, anchor.observation.coordinate_type.as_deref());
    digest_opt_f64(&mut hasher, anchor.observation.longitude_deg);
    digest_opt_f64(&mut hasher, anchor.observation.latitude_deg);
    digest_opt_f64(&mut hasher, anchor.observation.distance);
    digest_opt_str(&mut hasher, anchor.observation.distance_unit.as_deref());
    digest_u64(
        &mut hasher,
        anchor.observation.additional_provider_fields.len() as u64,
    );
    for (key, value) in &anchor.observation.additional_provider_fields {
        digest_str(&mut hasher, key);
        match value {
            TempusProviderField::String(value) => {
                hasher.update([0]);
                digest_str(&mut hasher, value);
            }
            TempusProviderField::Number(value) => {
                hasher.update([1]);
                hasher.update(value.to_bits().to_be_bytes());
            }
            TempusProviderField::Boolean(value) => {
                hasher.update([2, u8::from(*value)]);
            }
            TempusProviderField::Null => hasher.update([3]),
        }
    }
    digest_opt_str(&mut hasher, anchor.precision.time_resolution.as_deref());
    digest_opt_str(
        &mut hasher,
        anchor.precision.coordinate_resolution.as_deref(),
    );
    digest_opt_str(&mut hasher, anchor.precision.uncertainty.as_deref());
    digest_opt_str(&mut hasher, anchor.precision.notes.as_deref());
    digest_opt_str(&mut hasher, anchor.provenance.source_uri.as_deref());
    digest_opt_str(&mut hasher, anchor.provenance.request_digest.as_deref());
    digest_opt_str(&mut hasher, anchor.provenance.software_version.as_deref());
    digest_opt_str(&mut hasher, anchor.provenance.backend.as_deref());
    digest_opt_str(&mut hasher, anchor.provenance.fallback_mode.as_deref());
    hasher.update([u8::from(anchor.provenance.original_fields_retained)]);

    let result = hasher.finalize();
    let mut digest = [0_u8; 32];
    digest.copy_from_slice(&result);
    digest
}

fn digest_str(hasher: &mut Sha256, value: &str) {
    digest_u64(hasher, value.len() as u64);
    hasher.update(value.as_bytes());
}

fn digest_opt_str(hasher: &mut Sha256, value: Option<&str>) {
    match value {
        Some(value) => {
            hasher.update([1]);
            digest_str(hasher, value);
        }
        None => hasher.update([0]),
    }
}

fn digest_opt_f64(hasher: &mut Sha256, value: Option<f64>) {
    match value {
        Some(value) => {
            hasher.update([1]);
            hasher.update(value.to_bits().to_be_bytes());
        }
        None => hasher.update([0]),
    }
}

fn digest_u64(hasher: &mut Sha256, value: u64) {
    hasher.update(value.to_be_bytes());
}

fn compact_ref(anchor_id: &str) -> &str {
    let split = anchor_id.len().saturating_sub(12);
    anchor_id.get(split..).unwrap_or(anchor_id)
}

#[cfg(test)]
mod tests {
    use std::cell::Cell;
    use std::fs;
    use std::sync::atomic::{AtomicU64, Ordering};

    use arcanum_runtime::tempus::{ClockSample, ClockSourceKind};

    use super::*;

    static TEST_COUNTER: AtomicU64 = AtomicU64::new(0);

    struct FixtureClock {
        calls: Cell<u8>,
    }

    impl FixtureClock {
        fn new() -> Self {
            Self {
                calls: Cell::new(0),
            }
        }
    }

    impl ClockProvider for FixtureClock {
        type Error = Infallible;

        fn sample(&self) -> Result<ClockSample, Self::Error> {
            let call = self.calls.get();
            self.calls.set(call.saturating_add(1));
            Ok(ClockSample {
                captured_at: if call == 0 {
                    "2026-09-05T11:00:00Z".to_owned()
                } else {
                    "2026-09-05T11:00:01Z".to_owned()
                },
                source_kind: ClockSourceKind::SystemClock,
                provider: Some("fixture".to_owned()),
                model: None,
                version: Some("1".to_owned()),
                source_id: Some("fixture-system-clock".to_owned()),
                time_resolution: Some("1 s".to_owned()),
                uncertainty: None,
                monotonic_correlation: None,
            })
        }
    }

    fn test_root() -> std::path::PathBuf {
        let serial = TEST_COUNTER.fetch_add(1, Ordering::Relaxed);
        std::env::temp_dir().join(format!(
            "arcanum-ce-w02-lifecycle-{}-{serial}",
            std::process::id()
        ))
    }

    #[test]
    fn capability_surface_is_exact() {
        assert_eq!(lifecycle_abi_version(), 1);
        assert_eq!(
            lifecycle_capability_mask(),
            CAP_TEMPUS_PERSIST | CAP_TEMPUS_RECOVER | CAP_LOCAL_RECEIPT_PRESENT
        );
    }

    #[test]
    fn capture_persist_receipt_and_recovery_remain_local() {
        let root = test_root();
        let _ = fs::remove_dir_all(&root);
        let provider = FixtureClock::new();
        let anchor_id = "ce-w02-fixture-anchor";

        let created = capture_persist_with_provider(&root, anchor_id, &provider)
            .expect("fixture lifecycle should persist and recover");
        assert_eq!(created.state, LifecycleState::Persisted);
        assert_eq!(created.anchor_id, anchor_id);
        assert_eq!(created.receipt_scope.as_deref(), Some("local"));
        assert_eq!(created.receipt_signed, Some(false));
        assert!(created
            .presentation_line()
            .contains("receipt=local/unsigned"));
        assert!(created.presentation_line().contains("authorityEffect=none"));

        let recovered = recover_tempus_anchor(&root, anchor_id)
            .expect("persisted anchor should recover without network");
        assert_eq!(recovered.state, LifecycleState::Recovered);
        assert_eq!(recovered.anchor_id, created.anchor_id);
        assert_eq!(recovered.captured_at, created.captured_at);
        assert!(recovered
            .presentation_line()
            .contains("Tempus local · recovered"));

        fs::remove_dir_all(&root).expect("fixture directory should cleanly remove");
    }
}
