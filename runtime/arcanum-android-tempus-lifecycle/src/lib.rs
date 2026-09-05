#![forbid(unsafe_code)]

use std::convert::Infallible;
use std::fmt;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use arcanum_runtime::persistence::{
    FileTempusAnchorStore, TempusAnchorStore, TempusPersistenceError,
};
use arcanum_runtime::receipt::{
    create_tempus_local_receipt, LocalReceiptSigner, LocalSignature, SigningFailure, SigningHandle,
};
use arcanum_runtime::tempus::{
    capture_tempus_anchor, ClockProvider, SystemClockProvider, TempusAnchor, TempusSourceKind,
};
use arcanum_runtime::ARCANUM_RUNTIME_VERSION;

pub const LIFECYCLE_WIRE_VERSION: i32 = 1;
pub const AUTHORITY_EFFECT: &str = "none";
const RECEIPT_SIGNING_HANDLE_REF: &str = "ce-w02-w02.4-signing-unavailable";

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LocalReceiptPresentation {
    pub receipt_id: String,
    pub scope: String,
    pub signed: bool,
    pub content_digest_sha256: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TempusLifecyclePresentation {
    pub operation: String,
    pub anchor_id: String,
    pub captured_at: String,
    pub source_kind: String,
    pub persisted: bool,
    pub recovered: bool,
    pub persisted_digest_sha256: String,
    pub receipt: Option<LocalReceiptPresentation>,
}

impl TempusLifecyclePresentation {
    pub fn to_json(&self) -> String {
        let receipt = match &self.receipt {
            Some(receipt) => format!(
                "{{\"receiptId\":{},\"scope\":{},\"signed\":{},\"contentDigestSha256\":{}}}",
                json_string(&receipt.receipt_id),
                json_string(&receipt.scope),
                receipt.signed,
                json_string(&receipt.content_digest_sha256),
            ),
            None => "null".to_owned(),
        };

        format!(
            "{{\"wireVersion\":{LIFECYCLE_WIRE_VERSION},\"operation\":{},\"anchorId\":{},\"capturedAt\":{},\"sourceKind\":{},\"persisted\":{},\"recovered\":{},\"persistedDigestSha256\":{},\"authorityEffect\":{},\"networkUsed\":false,\"protocolFinality\":false,\"receipt\":{receipt}}}",
            json_string(&self.operation),
            json_string(&self.anchor_id),
            json_string(&self.captured_at),
            json_string(&self.source_kind),
            self.persisted,
            self.recovered,
            json_string(&self.persisted_digest_sha256),
            json_string(AUTHORITY_EFFECT),
        )
    }
}

#[derive(Debug)]
pub enum TempusLifecycleError {
    InvalidInput(&'static str),
    Clock(String),
    Persistence(String),
    StorageRead(String),
    Receipt(String),
    Contract(&'static str),
}

impl fmt::Display for TempusLifecycleError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidInput(message) => write!(formatter, "invalid lifecycle input: {message}"),
            Self::Clock(message) => write!(formatter, "Tempus clock unavailable: {message}"),
            Self::Persistence(message) => write!(formatter, "Tempus persistence failed: {message}"),
            Self::StorageRead(message) => {
                write!(formatter, "Tempus durable bytes unavailable: {message}")
            }
            Self::Receipt(message) => write!(formatter, "Tempus local receipt failed: {message}"),
            Self::Contract(message) => {
                write!(formatter, "Tempus lifecycle contract failure: {message}")
            }
        }
    }
}

impl std::error::Error for TempusLifecycleError {}

impl From<TempusPersistenceError> for TempusLifecycleError {
    fn from(error: TempusPersistenceError) -> Self {
        Self::Persistence(error.to_string())
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

pub fn capture_and_persist(
    storage_root: impl AsRef<Path>,
) -> Result<TempusLifecyclePresentation, TempusLifecycleError> {
    let storage_root = storage_root.as_ref();
    validate_storage_root(storage_root)?;

    let anchor_id = next_anchor_id()?;
    let anchor = capture_tempus_anchor(&SystemClockProvider, anchor_id, ARCANUM_RUNTIME_VERSION)
        .map_err(|error| TempusLifecycleError::Clock(error.to_string()))?;
    validate_clock_anchor(&anchor)?;

    let store = FileTempusAnchorStore::open(storage_root)?;
    store.persist(&anchor)?;

    let recovered = store.load(&anchor.anchor_id)?;
    if recovered != anchor {
        return Err(TempusLifecycleError::Contract(
            "persisted anchor did not round-trip exactly",
        ));
    }
    validate_clock_anchor(&recovered)?;

    let persisted_bytes = read_persisted_bytes(storage_root, &anchor.anchor_id)?;
    let content_digest = sha256(&persisted_bytes);
    let content_digest_sha256 = hex_digest(&content_digest);

    let persisted_at = SystemClockProvider
        .sample()
        .map_err(|error| TempusLifecycleError::Clock(error.to_string()))?
        .captured_at;

    let signing_handle = SigningHandle::new(RECEIPT_SIGNING_HANDLE_REF)
        .map_err(|error| TempusLifecycleError::Receipt(error.to_string()))?;
    let receipt = create_tempus_local_receipt(
        &UnavailableSigner,
        &signing_handle,
        format!("receipt-{}", anchor.anchor_id),
        &anchor,
        content_digest,
        persisted_at,
        ARCANUM_RUNTIME_VERSION,
    )
    .map_err(|error| TempusLifecycleError::Receipt(format!("{error:?}")))?;

    if receipt.is_signed() || receipt.signer_ref.is_some() || receipt.signature.is_some() {
        return Err(TempusLifecycleError::Contract(
            "W02.4 must not fabricate local signing availability",
        ));
    }
    if receipt.scope != "local" {
        return Err(TempusLifecycleError::Contract(
            "W02.4 receipt escaped local scope",
        ));
    }

    Ok(TempusLifecyclePresentation {
        operation: "capture-persist".to_owned(),
        anchor_id: anchor.anchor_id,
        captured_at: anchor.captured_at,
        source_kind: anchor.source.kind.as_schema_value().to_owned(),
        persisted: true,
        recovered: false,
        persisted_digest_sha256: content_digest_sha256.clone(),
        receipt: Some(LocalReceiptPresentation {
            receipt_id: receipt.receipt_id,
            scope: receipt.scope.to_owned(),
            signed: false,
            content_digest_sha256,
        }),
    })
}

pub fn recover_anchor(
    storage_root: impl AsRef<Path>,
    anchor_id: &str,
) -> Result<TempusLifecyclePresentation, TempusLifecycleError> {
    let storage_root = storage_root.as_ref();
    validate_storage_root(storage_root)?;
    if anchor_id.trim().is_empty() {
        return Err(TempusLifecycleError::InvalidInput(
            "anchor ID must not be empty",
        ));
    }

    let store = FileTempusAnchorStore::open(storage_root)?;
    let anchor = store.load(anchor_id)?;
    validate_clock_anchor(&anchor)?;

    let persisted_bytes = read_persisted_bytes(storage_root, &anchor.anchor_id)?;
    let content_digest_sha256 = hex_digest(&sha256(&persisted_bytes));

    Ok(TempusLifecyclePresentation {
        operation: "recover".to_owned(),
        anchor_id: anchor.anchor_id,
        captured_at: anchor.captured_at,
        source_kind: anchor.source.kind.as_schema_value().to_owned(),
        persisted: true,
        recovered: true,
        persisted_digest_sha256: content_digest_sha256,
        receipt: None,
    })
}

fn validate_storage_root(storage_root: &Path) -> Result<(), TempusLifecycleError> {
    if storage_root.as_os_str().is_empty() {
        return Err(TempusLifecycleError::InvalidInput(
            "storage root must not be empty",
        ));
    }
    if !storage_root.is_absolute() {
        return Err(TempusLifecycleError::InvalidInput(
            "storage root must be absolute",
        ));
    }
    Ok(())
}

fn validate_clock_anchor(anchor: &TempusAnchor) -> Result<(), TempusLifecycleError> {
    if anchor.source.kind != TempusSourceKind::SystemClock {
        return Err(TempusLifecycleError::Contract(
            "W02.4 accepts system-clock anchors only",
        ));
    }
    if anchor.observer.is_some()
        || anchor.frame.is_some()
        || anchor.interpretation.is_some()
        || anchor.observation.kind != "clock"
    {
        return Err(TempusLifecycleError::Contract(
            "W02.4 clock anchors must remain location-free and uninterpreted",
        ));
    }
    Ok(())
}

fn next_anchor_id() -> Result<String, TempusLifecycleError> {
    let elapsed = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|error| TempusLifecycleError::Clock(error.to_string()))?;
    Ok(format!("ce-w02-tempus-{}", elapsed.as_nanos()))
}

fn persisted_anchor_path(storage_root: &Path, anchor_id: &str) -> PathBuf {
    storage_root
        .join("tempus")
        .join(format!("{anchor_id}.anchor"))
}

fn read_persisted_bytes(
    storage_root: &Path,
    anchor_id: &str,
) -> Result<Vec<u8>, TempusLifecycleError> {
    fs::read(persisted_anchor_path(storage_root, anchor_id))
        .map_err(|error| TempusLifecycleError::StorageRead(error.to_string()))
}

fn hex_digest(bytes: &[u8; 32]) -> String {
    let mut output = String::with_capacity(64);
    for byte in bytes {
        output.push_str(&format!("{byte:02x}"));
    }
    output
}

fn json_string(value: &str) -> String {
    let mut output = String::with_capacity(value.len() + 2);
    output.push('"');
    for character in value.chars() {
        match character {
            '"' => output.push_str("\\\""),
            '\\' => output.push_str("\\\\"),
            '\n' => output.push_str("\\n"),
            '\r' => output.push_str("\\r"),
            '\t' => output.push_str("\\t"),
            '\u{08}' => output.push_str("\\b"),
            '\u{0c}' => output.push_str("\\f"),
            value if value <= '\u{1f}' => output.push_str(&format!("\\u{:04x}", value as u32)),
            value => output.push(value),
        }
    }
    output.push('"');
    output
}

fn sha256(input: &[u8]) -> [u8; 32] {
    const INITIAL: [u32; 8] = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab,
        0x5be0cd19,
    ];
    const K: [u32; 64] = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4,
        0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe,
        0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f,
        0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
        0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
        0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
        0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116,
        0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
        0xc67178f2,
    ];

    let bit_length = (input.len() as u64).wrapping_mul(8);
    let mut padded = input.to_vec();
    padded.push(0x80);
    while padded.len() % 64 != 56 {
        padded.push(0);
    }
    padded.extend_from_slice(&bit_length.to_be_bytes());

    let mut state = INITIAL;
    for chunk in padded.chunks_exact(64) {
        let mut schedule = [0u32; 64];
        for (index, word) in schedule.iter_mut().take(16).enumerate() {
            let offset = index * 4;
            *word = u32::from_be_bytes([
                chunk[offset],
                chunk[offset + 1],
                chunk[offset + 2],
                chunk[offset + 3],
            ]);
        }
        for index in 16..64 {
            let s0 = schedule[index - 15].rotate_right(7)
                ^ schedule[index - 15].rotate_right(18)
                ^ (schedule[index - 15] >> 3);
            let s1 = schedule[index - 2].rotate_right(17)
                ^ schedule[index - 2].rotate_right(19)
                ^ (schedule[index - 2] >> 10);
            schedule[index] = schedule[index - 16]
                .wrapping_add(s0)
                .wrapping_add(schedule[index - 7])
                .wrapping_add(s1);
        }

        let mut a = state[0];
        let mut b = state[1];
        let mut c = state[2];
        let mut d = state[3];
        let mut e = state[4];
        let mut f = state[5];
        let mut g = state[6];
        let mut h = state[7];

        for index in 0..64 {
            let s1 = e.rotate_right(6) ^ e.rotate_right(11) ^ e.rotate_right(25);
            let choose = (e & f) ^ ((!e) & g);
            let temp1 = h
                .wrapping_add(s1)
                .wrapping_add(choose)
                .wrapping_add(K[index])
                .wrapping_add(schedule[index]);
            let s0 = a.rotate_right(2) ^ a.rotate_right(13) ^ a.rotate_right(22);
            let majority = (a & b) ^ (a & c) ^ (b & c);
            let temp2 = s0.wrapping_add(majority);

            h = g;
            g = f;
            f = e;
            e = d.wrapping_add(temp1);
            d = c;
            c = b;
            b = a;
            a = temp1.wrapping_add(temp2);
        }

        state[0] = state[0].wrapping_add(a);
        state[1] = state[1].wrapping_add(b);
        state[2] = state[2].wrapping_add(c);
        state[3] = state[3].wrapping_add(d);
        state[4] = state[4].wrapping_add(e);
        state[5] = state[5].wrapping_add(f);
        state[6] = state[6].wrapping_add(g);
        state[7] = state[7].wrapping_add(h);
    }

    let mut output = [0u8; 32];
    for (index, word) in state.iter().enumerate() {
        output[index * 4..index * 4 + 4].copy_from_slice(&word.to_be_bytes());
    }
    output
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temporary_root(label: &str) -> PathBuf {
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("test clock must be after Unix epoch")
            .as_nanos();
        let root = std::env::temp_dir().join(format!(
            "arcanum-w02-4-{label}-{}-{unique}",
            std::process::id()
        ));
        fs::create_dir_all(&root).expect("test root should be creatable");
        root
    }

    #[test]
    fn sha256_matches_standard_vectors() {
        assert_eq!(
            hex_digest(&sha256(b"")),
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        );
        assert_eq!(
            hex_digest(&sha256(b"abc")),
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
    }

    #[test]
    fn capture_persists_round_trips_and_creates_unsigned_local_receipt() {
        let root = temporary_root("capture");
        let captured = capture_and_persist(&root).expect("capture should persist offline");

        assert!(captured.persisted);
        assert!(!captured.recovered);
        assert_eq!(captured.source_kind, "system-clock");
        let receipt = captured
            .receipt
            .as_ref()
            .expect("capture should expose receipt");
        assert_eq!(receipt.scope, "local");
        assert!(!receipt.signed);
        assert_eq!(
            receipt.content_digest_sha256,
            captured.persisted_digest_sha256
        );
        assert!(persisted_anchor_path(&root, &captured.anchor_id).is_file());

        let recovered = recover_anchor(&root, &captured.anchor_id)
            .expect("persisted anchor should recover offline");
        assert!(recovered.recovered);
        assert_eq!(recovered.anchor_id, captured.anchor_id);
        assert_eq!(recovered.captured_at, captured.captured_at);
        assert_eq!(
            recovered.persisted_digest_sha256,
            captured.persisted_digest_sha256
        );
        assert!(recovered.receipt.is_none());

        let root_string = root.to_string_lossy();
        assert!(!captured.to_json().contains(root_string.as_ref()));
        fs::remove_dir_all(root).expect("test root should be removable");
    }

    #[test]
    fn missing_anchor_fails_closed_without_replacement_capture() {
        let root = temporary_root("missing");
        let error = recover_anchor(&root, "missing-anchor")
            .expect_err("missing durable truth must fail visibly");
        assert!(error.to_string().contains("not found"));
        let tempus_dir = root.join("tempus");
        let entries = fs::read_dir(tempus_dir)
            .expect("Tempus namespace should exist")
            .count();
        assert_eq!(entries, 0);
        fs::remove_dir_all(root).expect("test root should be removable");
    }
}
