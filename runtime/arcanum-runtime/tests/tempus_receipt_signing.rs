use std::cell::Cell;
use std::fmt;

use arcanum_runtime::receipt::{
    create_tempus_local_receipt, LocalReceiptSigner, LocalSignature, SigningFailure,
    SigningHandle, TempusReceiptError, LOCAL_RECEIPT_SCOPE, LOCAL_RECEIPT_SCHEMA_VERSION,
    TEMPUS_LOCAL_RECEIPT_TYPE,
};
use arcanum_runtime::tempus::{
    tempus_anchor_from_sample, ClockSample, ClockSourceKind, TempusAnchor,
};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum FixtureSignerError {
    Failed,
}

impl fmt::Display for FixtureSignerError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str("fixture signer failure")
    }
}

impl std::error::Error for FixtureSignerError {}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum FixtureMode {
    Signed,
    Unavailable,
    ProviderFailure,
    EmptySignerRef,
    EmptySignature,
}

struct FixtureSigner {
    authorized_handle: SigningHandle,
    mode: FixtureMode,
    seen_digest: Cell<Option<[u8; 32]>>,
}

impl FixtureSigner {
    fn new(authorized_handle: SigningHandle, mode: FixtureMode) -> Self {
        Self {
            authorized_handle,
            mode,
            seen_digest: Cell::new(None),
        }
    }
}

impl LocalReceiptSigner for FixtureSigner {
    type Error = FixtureSignerError;

    fn sign_digest(
        &self,
        data_digest: &[u8; 32],
        signing_handle: &SigningHandle,
    ) -> Result<LocalSignature, SigningFailure<Self::Error>> {
        if !signing_handle.same_handle(&self.authorized_handle) {
            return Err(SigningFailure::Unavailable);
        }

        self.seen_digest.set(Some(*data_digest));

        match self.mode {
            FixtureMode::Signed => {
                let mut signature = b"fixture-signature:".to_vec();
                signature.extend_from_slice(data_digest);
                Ok(LocalSignature {
                    signer_ref: "fixture-local-signer".to_owned(),
                    signature,
                })
            }
            FixtureMode::Unavailable => Err(SigningFailure::Unavailable),
            FixtureMode::ProviderFailure => {
                Err(SigningFailure::Provider(FixtureSignerError::Failed))
            }
            FixtureMode::EmptySignerRef => Ok(LocalSignature {
                signer_ref: String::new(),
                signature: vec![1],
            }),
            FixtureMode::EmptySignature => Ok(LocalSignature {
                signer_ref: "fixture-local-signer".to_owned(),
                signature: Vec::new(),
            }),
        }
    }
}

fn fixed_anchor(anchor_id: &str) -> TempusAnchor {
    tempus_anchor_from_sample(
        anchor_id,
        "ce-w01-cp4-signing",
        ClockSample {
            captured_at: "2026-09-04T08:30:00Z".to_owned(),
            source_kind: ClockSourceKind::SystemClock,
            provider: Some("fixture".to_owned()),
            model: None,
            version: Some("1".to_owned()),
            source_id: Some("fixture-system-clock".to_owned()),
            time_resolution: Some("1 ms".to_owned()),
            uncertainty: None,
            monotonic_correlation: None,
        },
    )
}

fn opaque_handle() -> SigningHandle {
    SigningHandle::new("fixture-opaque-signing-handle")
        .expect("fixture signing handle should be valid")
}

#[test]
fn signed_tempus_receipt_binds_digest_and_remains_local_only() {
    let handle = opaque_handle();
    let signer = FixtureSigner::new(handle.clone(), FixtureMode::Signed);
    let anchor = fixed_anchor("tempus-signing-001");
    let digest = [0xA5; 32];

    let receipt = create_tempus_local_receipt(
        &signer,
        &handle,
        "receipt-tempus-001",
        &anchor,
        digest,
        "2026-09-04T08:31:00Z",
        "ce-w01-cp4-signing",
    )
    .expect("fixture signer should produce a local signed receipt");

    assert_eq!(signer.seen_digest.get(), Some(digest));
    assert_eq!(receipt.receipt_id, "receipt-tempus-001");
    assert_eq!(receipt.schema_version, LOCAL_RECEIPT_SCHEMA_VERSION);
    assert_eq!(receipt.receipt_type, TEMPUS_LOCAL_RECEIPT_TYPE);
    assert_eq!(receipt.anchor_id, anchor.anchor_id);
    assert_eq!(receipt.anchor_schema_version, anchor.schema_version);
    assert_eq!(receipt.content_digest, digest);
    assert_eq!(receipt.scope, LOCAL_RECEIPT_SCOPE);
    assert_eq!(receipt.signer_ref.as_deref(), Some("fixture-local-signer"));
    assert!(receipt.signature.as_ref().is_some_and(|value| !value.is_empty()));
    assert!(receipt.is_signed());

    assert!(!format!("{handle:?}").contains("fixture-opaque-signing-handle"));
    assert!(!format!("{receipt:?}").contains("fixture-opaque-signing-handle"));
}

#[test]
fn signing_unavailable_returns_unsigned_receipt_without_fabricated_identity() {
    let handle = opaque_handle();
    let signer = FixtureSigner::new(handle.clone(), FixtureMode::Unavailable);
    let anchor = fixed_anchor("tempus-signing-unavailable");

    let receipt = create_tempus_local_receipt(
        &signer,
        &handle,
        "receipt-tempus-unsigned",
        &anchor,
        [0x11; 32],
        "2026-09-04T08:32:00Z",
        "ce-w01-cp4-signing",
    )
    .expect("signing unavailability should be represented explicitly");

    assert_eq!(receipt.scope, LOCAL_RECEIPT_SCOPE);
    assert!(receipt.signer_ref.is_none());
    assert!(receipt.signature.is_none());
    assert!(!receipt.is_signed());
}

#[test]
fn signer_provider_failure_fails_closed_without_receipt() {
    let handle = opaque_handle();
    let signer = FixtureSigner::new(handle.clone(), FixtureMode::ProviderFailure);
    let anchor = fixed_anchor("tempus-signing-provider-failure");

    let error = create_tempus_local_receipt(
        &signer,
        &handle,
        "receipt-tempus-provider-failure",
        &anchor,
        [0x22; 32],
        "2026-09-04T08:33:00Z",
        "ce-w01-cp4-signing",
    )
    .expect_err("provider failure must fail visibly");

    assert!(matches!(
        error,
        TempusReceiptError::SigningProvider(FixtureSignerError::Failed)
    ));
}

#[test]
fn malformed_signer_results_fail_closed() {
    let handle = opaque_handle();
    let anchor = fixed_anchor("tempus-signing-malformed");

    for mode in [FixtureMode::EmptySignerRef, FixtureMode::EmptySignature] {
        let signer = FixtureSigner::new(handle.clone(), mode);
        let error = create_tempus_local_receipt(
            &signer,
            &handle,
            "receipt-tempus-malformed",
            &anchor,
            [0x33; 32],
            "2026-09-04T08:34:00Z",
            "ce-w01-cp4-signing",
        )
        .expect_err("malformed signer output must fail visibly");

        assert!(matches!(error, TempusReceiptError::InvalidSignerResult(_)));
    }
}

#[test]
fn changing_content_digest_changes_fixture_signature() {
    let handle = opaque_handle();
    let signer = FixtureSigner::new(handle.clone(), FixtureMode::Signed);
    let anchor = fixed_anchor("tempus-signing-digest-scope");

    let first = create_tempus_local_receipt(
        &signer,
        &handle,
        "receipt-tempus-digest-a",
        &anchor,
        [0x44; 32],
        "2026-09-04T08:35:00Z",
        "ce-w01-cp4-signing",
    )
    .expect("fixture signing should succeed");
    let changed = create_tempus_local_receipt(
        &signer,
        &handle,
        "receipt-tempus-digest-b",
        &anchor,
        [0x45; 32],
        "2026-09-04T08:36:00Z",
        "ce-w01-cp4-signing",
    )
    .expect("fixture signing should succeed");

    assert_ne!(first.content_digest, changed.content_digest);
    assert_ne!(first.signature, changed.signature);
}

#[test]
fn unauthorized_handle_cannot_produce_a_signature() {
    let authorized = opaque_handle();
    let other = SigningHandle::new("fixture-other-handle").expect("fixture handle should be valid");
    let signer = FixtureSigner::new(authorized, FixtureMode::Signed);
    let anchor = fixed_anchor("tempus-signing-wrong-handle");

    let receipt = create_tempus_local_receipt(
        &signer,
        &other,
        "receipt-tempus-wrong-handle",
        &anchor,
        [0x55; 32],
        "2026-09-04T08:37:00Z",
        "ce-w01-cp4-signing",
    )
    .expect("unauthorized handle should resolve to signing unavailable");

    assert!(!receipt.is_signed());
    assert!(receipt.signer_ref.is_none());
    assert!(receipt.signature.is_none());
}
