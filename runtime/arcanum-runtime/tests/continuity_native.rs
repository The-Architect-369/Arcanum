use arcanum_runtime::{
    continuity_native as native,
    continuity_receipt::{credential_fingerprint, ContinuityReceipt, ReceiptType},
    continuity_store::{FileContinuityStore, OperationPhase},
};
use p256::ecdsa::{signature::Signer, Signature, SigningKey};
use rand_core::OsRng;
use std::{fs, path::PathBuf};
struct Fixture {
    root: PathBuf,
    key: SigningKey,
    public: [u8; 65],
}
impl Fixture {
    fn new() -> Self {
        let root = std::env::temp_dir().join(format!(
            "a16-native-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        let key = SigningKey::random(&mut OsRng);
        let public = key
            .verifying_key()
            .to_encoded_point(false)
            .as_bytes()
            .try_into()
            .unwrap();
        Self { root, key, public }
    }
    fn prepare(&self, adoption: bool) -> arcanum_runtime::continuity_store::PreparedOperation {
        native::prepare(
            &self.root,
            "0123456789abcdef0123456789abcdef",
            credential_fingerprint(&self.public),
            [7; 16],
            1234,
            adoption,
        )
        .unwrap()
    }
}
impl Drop for Fixture {
    fn drop(&mut self) {
        if self.root.exists() {
            fs::remove_dir_all(&self.root).unwrap();
        }
    }
}
const ID: &str = "0123456789abcdef0123456789abcdef";
#[test]
fn native_lifecycle_binds_full_synthetic_message_and_recovers_exact_original() {
    let f = Fixture::new();
    let prepared = f.prepare(false);
    assert_eq!(prepared.phase, OperationPhase::ReceiptPending);
    let signature: Signature = f.key.sign(&prepared.message);
    let committed = native::commit(
        &f.root,
        ID,
        prepared.message.clone(),
        f.public,
        signature.to_der().as_bytes().to_vec(),
    )
    .unwrap();
    assert_eq!(committed.phase, OperationPhase::Committed);
    assert_eq!(
        native::recover(&f.root, ID).unwrap().prepared_wrapper,
        committed.prepared_wrapper
    );
    assert_eq!(native::packet(&committed).unwrap()[..2], [1, 4]);
    let mut altered = committed.prepared_wrapper.unwrap();
    let last = altered.len() - 1;
    altered[last] ^= 1;
    assert!(native::publish(&f.root, ID, &altered).is_err());
}
#[test]
fn actual_adoption_time_and_attribution_are_retained_without_inventing_occurrence() {
    let f = Fixture::new();
    let prepared = f.prepare(true);
    let receipt = ContinuityReceipt::decode(&prepared.message).unwrap();
    assert_eq!(receipt.receipt_type, ReceiptType::HumanAdoption);
    assert_eq!(receipt.adopted_at_ms, Some(1234));
    assert_eq!(receipt.occurred_at_ms, None);
    assert_eq!(
        receipt.original_producer.unwrap().kind,
        "public-synthetic-fixture"
    );
    assert_eq!(
        receipt.sources[0].locator,
        format!("native-confirmation:{ID}")
    );
    assert!(native::prepare(
        &f.root,
        ID,
        credential_fingerprint(&f.public),
        [7; 16],
        1235,
        true
    )
    .is_err());
}
#[test]
fn native_publication_reuses_original_prepared_signature_without_a_signer() {
    let f = Fixture::new();
    let prepared = f.prepare(false);
    let signature: Signature = f.key.sign(&prepared.message);
    let wrapper = arcanum_runtime::continuity_receipt::SignedContinuityReceipt {
        message: prepared.message,
        public_key: f.public,
        signature_der: signature.to_der().as_bytes().to_vec(),
    }
    .encode()
    .unwrap();
    let component: String = arcanum_runtime::continuity_receipt::sha256(ID.as_bytes())
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect();
    fs::write(
        f.root
            .join("continuity-operations.v1/staging")
            .join(component)
            .join("receipt.cbor"),
        &wrapper,
    )
    .unwrap();
    assert_eq!(
        native::inspect(&f.root, ID).unwrap(),
        OperationPhase::PublishPending
    );
    assert_eq!(f.prepare(false).prepared_wrapper.unwrap(), wrapper);
    assert_eq!(
        native::publish(&f.root, ID, &wrapper)
            .unwrap()
            .prepared_wrapper
            .unwrap(),
        wrapper
    );
}
#[test]
fn unsupported_root_ids_and_private_content_schema_never_publish() {
    let f = Fixture::new();
    assert!(native::prepare(
        std::path::Path::new("relative"),
        ID,
        [1; 32],
        [2; 16],
        1,
        false
    )
    .is_err());
    assert!(native::inspect(&f.root, "../wrong").is_err());
    let mut receipt = ContinuityReceipt::decode(&f.prepare(false).message).unwrap();
    receipt.object_schema = "private/unsupported".into();
    FileContinuityStore::open(&f.root).unwrap();
    let message = receipt.encode().unwrap();
    let signature: Signature = f.key.sign(&message);
    assert!(native::commit(
        &f.root,
        ID,
        message,
        f.public,
        signature.to_der().as_bytes().to_vec()
    )
    .is_err());
    assert_eq!(
        native::inspect(&f.root, ID).unwrap(),
        OperationPhase::ReceiptPending
    );
}
