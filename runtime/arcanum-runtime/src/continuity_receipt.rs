//! A16 v1 public receipt wire format. No key provisioning, custody or authority.
//!
//! Sign the complete encoded message using SHA256withECDSA (one hash), not an
//! already-hashed message. Legacy CP4 digest-only receipts remain separate.
use std::fmt;

use p256::ecdsa::{signature::Verifier, Signature, VerifyingKey};
use sha2::{Digest, Sha256};

pub const DOMAIN: &str = "org.arcanum.continuity.receipt";
pub const SCOPE: &str = "local-only";
pub const ALGORITHM: &str = "ecdsa-p256-sha256-der";
pub const MAX_MESSAGE_BYTES: usize = 64 * 1024;
pub const MAX_WRAPPER_BYTES: usize = 66 * 1024;
const MAX_TEXT_BYTES: usize = 2048;
const MAX_ID_BYTES: usize = 128;
const MAX_SOURCES: usize = 16;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ReceiptType {
    LocalRecording,
    HumanAdoption,
}

impl ReceiptType {
    fn as_str(self) -> &'static str {
        match self {
            Self::LocalRecording => "local-recording",
            Self::HumanAdoption => "human-adoption",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Producer {
    pub kind: String,
    pub reference: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SourceReference {
    pub kind: String,
    pub locator: String,
    pub revision: Option<String>,
    pub digest: Option<[u8; 32]>,
}

/// Claimed provenance is signed as supplied; verification does not prove it true.
/// These fields may contain sensitive derivatives and are not an export grant.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ContinuityReceipt {
    pub receipt_type: ReceiptType,
    pub operation_id: String,
    pub object_id: String,
    pub object_schema: String,
    pub object_digest: [u8; 32],
    pub credential_fingerprint: [u8; 32],
    pub credential_generation: [u8; 16],
    pub original_producer: Option<Producer>,
    pub sources: Vec<SourceReference>,
    pub occurred_at_ms: Option<i64>,
    pub observed_at_ms: Option<i64>,
    pub recorded_at_ms: i64,
    pub adopted_at_ms: Option<i64>,
    pub custody_digest: Option<[u8; 32]>,
    pub runtime_version: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ReceiptError(pub &'static str);

impl fmt::Display for ReceiptError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.0)
    }
}
impl std::error::Error for ReceiptError {}
type Result<T> = std::result::Result<T, ReceiptError>;

fn require(condition: bool, message: &'static str) -> Result<()> {
    if condition {
        Ok(())
    } else {
        Err(ReceiptError(message))
    }
}

impl ContinuityReceipt {
    pub fn encode(&self) -> Result<Vec<u8>> {
        let mut w = Writer::default();
        w.array(20);
        w.text(DOMAIN, MAX_TEXT_BYTES)?;
        w.head(0, 1);
        w.text(self.receipt_type.as_str(), MAX_TEXT_BYTES)?;
        w.text(SCOPE, MAX_TEXT_BYTES)?;
        w.text(&self.operation_id, MAX_ID_BYTES)?;
        w.text(&self.object_id, MAX_ID_BYTES)?;
        w.text(&self.object_schema, MAX_TEXT_BYTES)?;
        w.text("sha256", MAX_TEXT_BYTES)?;
        w.bytes(&self.object_digest);
        w.bytes(&self.credential_fingerprint);
        w.bytes(&self.credential_generation);
        w.text(ALGORITHM, MAX_TEXT_BYTES)?;
        if let Some(producer) = &self.original_producer {
            w.array(2);
            w.text(&producer.kind, MAX_TEXT_BYTES)?;
            w.text(&producer.reference, MAX_TEXT_BYTES)?;
        } else {
            w.null();
        }
        require(self.sources.len() <= MAX_SOURCES, "too many sources")?;
        let mut sources = self
            .sources
            .iter()
            .map(encode_source)
            .collect::<Result<Vec<_>>>()?;
        sources.sort(); // Vec<u8> comparison is unsigned lexicographic.
        require(
            !sources.windows(2).any(|pair| pair[0] == pair[1]),
            "duplicate source",
        )?;
        w.array(sources.len());
        for source in sources {
            w.0.extend(source);
        }
        w.optional_time(self.occurred_at_ms);
        w.optional_time(self.observed_at_ms);
        w.time(self.recorded_at_ms);
        w.optional_time(self.adopted_at_ms);
        w.optional_bytes(self.custody_digest.as_ref().map(|v| &v[..]));
        w.text(&self.runtime_version, MAX_TEXT_BYTES)?;
        self.validate_adoption()?;
        require(w.0.len() <= MAX_MESSAGE_BYTES, "message too large")?;
        Ok(w.0)
    }

    pub fn decode(bytes: &[u8]) -> Result<Self> {
        require(bytes.len() <= MAX_MESSAGE_BYTES, "message too large")?;
        let mut r = Reader::new(bytes);
        r.array(20)?;
        require(r.text(MAX_TEXT_BYTES)? == DOMAIN, "unsupported domain")?;
        require(r.head(0)? == 1, "unsupported version")?;
        let receipt_type = match r.text(MAX_TEXT_BYTES)?.as_str() {
            "local-recording" => ReceiptType::LocalRecording,
            "human-adoption" => ReceiptType::HumanAdoption,
            _ => return Err(ReceiptError("unsupported receipt type")),
        };
        require(r.text(MAX_TEXT_BYTES)? == SCOPE, "unsupported scope")?;
        let operation_id = r.text(MAX_ID_BYTES)?;
        let object_id = r.text(MAX_ID_BYTES)?;
        let object_schema = r.text(MAX_TEXT_BYTES)?;
        require(
            r.text(MAX_TEXT_BYTES)? == "sha256",
            "unsupported digest algorithm",
        )?;
        let object_digest = r.fixed_bytes()?;
        let credential_fingerprint = r.fixed_bytes()?;
        let credential_generation = r.fixed_bytes()?;
        require(
            r.text(MAX_TEXT_BYTES)? == ALGORITHM,
            "unsupported signature algorithm",
        )?;
        let original_producer = if r.null()? {
            None
        } else {
            r.array(2)?;
            Some(Producer {
                kind: r.text(MAX_TEXT_BYTES)?,
                reference: r.text(MAX_TEXT_BYTES)?,
            })
        };
        let count = r.head(4)?;
        require(count <= MAX_SOURCES as u64, "too many sources")?;
        let mut sources = Vec::new();
        for _ in 0..count {
            r.array(4)?;
            sources.push(SourceReference {
                kind: r.text(MAX_TEXT_BYTES)?,
                locator: r.text(MAX_TEXT_BYTES)?,
                revision: if r.null()? {
                    None
                } else {
                    Some(r.text(MAX_TEXT_BYTES)?)
                },
                digest: if r.null()? {
                    None
                } else {
                    Some(r.fixed_bytes()?)
                },
            });
        }
        let value = Self {
            receipt_type,
            operation_id,
            object_id,
            object_schema,
            object_digest,
            credential_fingerprint,
            credential_generation,
            original_producer,
            sources,
            occurred_at_ms: r.optional_time()?,
            observed_at_ms: r.optional_time()?,
            recorded_at_ms: r.time()?,
            adopted_at_ms: r.optional_time()?,
            custody_digest: if r.null()? {
                None
            } else {
                Some(r.fixed_bytes()?)
            },
            runtime_version: r.text(MAX_TEXT_BYTES)?,
        };
        r.finish()?;
        // Also rejects unsorted sources, duplicates, and any alternative encoding.
        require(value.encode()? == bytes, "noncanonical message")?;
        Ok(value)
    }

    fn validate_adoption(&self) -> Result<()> {
        match self.receipt_type {
            ReceiptType::LocalRecording => require(
                self.adopted_at_ms.is_none(),
                "recording cannot claim adoption",
            ),
            ReceiptType::HumanAdoption => {
                require(self.adopted_at_ms.is_some(), "adoption time required")?;
                require(
                    self.sources
                        .iter()
                        .any(|source| source.kind == "human-adoption-evidence"),
                    "adoption evidence reference required",
                )
            }
        }
    }
}

/// Carries public verification material, never private signing material.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SignedContinuityReceipt {
    pub message: Vec<u8>,
    pub public_key: [u8; 65],
    pub signature_der: Vec<u8>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct VerificationReport {
    pub receipt: ContinuityReceipt,
    pub object_digest_matches: Option<bool>,
    pub public_key_fingerprint_matches: bool,
    pub signature_valid: bool,
    /// Relative only to a separately trusted caller-supplied credential binding.
    pub credential_continuity_matches: Option<bool>,
    pub authority_effect: &'static str,
}

impl SignedContinuityReceipt {
    pub fn encode(&self) -> Result<Vec<u8>> {
        self.validate_format()?;
        let mut w = Writer::default();
        w.array(3);
        w.bytes(&self.message);
        w.bytes(&self.public_key);
        w.bytes(&self.signature_der);
        require(w.0.len() <= MAX_WRAPPER_BYTES, "wrapper too large")?;
        Ok(w.0)
    }

    pub fn decode(bytes: &[u8]) -> Result<Self> {
        require(bytes.len() <= MAX_WRAPPER_BYTES, "wrapper too large")?;
        let mut r = Reader::new(bytes);
        r.array(3)?;
        let value = Self {
            message: r.bytes(MAX_MESSAGE_BYTES)?.to_vec(),
            public_key: r.fixed_bytes()?,
            signature_der: r.bytes(72)?.to_vec(),
        };
        r.finish()?;
        value.validate_format()?;
        require(value.encode()? == bytes, "noncanonical wrapper")?;
        Ok(value)
    }

    pub fn verify(
        &self,
        object_bytes: Option<&[u8]>,
        trusted_credential: Option<(&[u8; 32], &[u8; 16])>,
    ) -> Result<VerificationReport> {
        let (receipt, key, signature) = self.validate_format()?;
        let fingerprint_matches =
            credential_fingerprint(&self.public_key) == receipt.credential_fingerprint;
        Ok(VerificationReport {
            object_digest_matches: object_bytes.map(|bytes| sha256(bytes) == receipt.object_digest),
            signature_valid: key.verify(&self.message, &signature).is_ok(),
            public_key_fingerprint_matches: fingerprint_matches,
            credential_continuity_matches: trusted_credential.map(|(fingerprint, generation)| {
                fingerprint_matches
                    && fingerprint == &receipt.credential_fingerprint
                    && generation == &receipt.credential_generation
            }),
            receipt,
            authority_effect: "none",
        })
    }

    fn validate_format(&self) -> Result<(ContinuityReceipt, VerifyingKey, Signature)> {
        let receipt = ContinuityReceipt::decode(&self.message)?;
        require(
            self.public_key[0] == 4,
            "uncompressed SEC1 public key required",
        )?;
        let key = VerifyingKey::from_sec1_bytes(&self.public_key)
            .map_err(|_| ReceiptError("invalid P-256 point"))?;
        require(
            !self.signature_der.is_empty() && self.signature_der.len() <= 72,
            "invalid signature length",
        )?;
        let signature = Signature::from_der(&self.signature_der)
            .map_err(|_| ReceiptError("invalid DER signature"))?;
        require(
            signature.to_der().as_bytes() == self.signature_der,
            "nonminimal DER signature",
        )?;
        Ok((receipt, key, signature))
    }
}

pub fn sha256(bytes: &[u8]) -> [u8; 32] {
    Sha256::digest(bytes).into()
}

pub fn credential_fingerprint(public_key: &[u8; 65]) -> [u8; 32] {
    let mut hash = Sha256::new();
    hash.update(b"org.arcanum.continuity.key.v1\0");
    hash.update(public_key);
    hash.finalize().into()
}

fn encode_source(source: &SourceReference) -> Result<Vec<u8>> {
    let mut w = Writer::default();
    w.array(4);
    w.text(&source.kind, MAX_TEXT_BYTES)?;
    w.text(&source.locator, MAX_TEXT_BYTES)?;
    if let Some(revision) = &source.revision {
        w.text(revision, MAX_TEXT_BYTES)?;
    } else {
        w.null();
    }
    w.optional_bytes(source.digest.as_ref().map(|v| &v[..]));
    Ok(w.0)
}

#[derive(Default)]
struct Writer(Vec<u8>);
impl Writer {
    fn head(&mut self, major: u8, value: u64) {
        let prefix = major << 5;
        match value {
            0..=23 => self.0.push(prefix | value as u8),
            24..=255 => self.0.extend([prefix | 24, value as u8]),
            256..=65535 => {
                self.0.push(prefix | 25);
                self.0.extend((value as u16).to_be_bytes());
            }
            65536..=4294967295 => {
                self.0.push(prefix | 26);
                self.0.extend((value as u32).to_be_bytes());
            }
            _ => {
                self.0.push(prefix | 27);
                self.0.extend(value.to_be_bytes());
            }
        }
    }
    fn array(&mut self, count: usize) {
        self.head(4, count as u64);
    }
    fn null(&mut self) {
        self.0.push(0xf6);
    }
    fn bytes(&mut self, bytes: &[u8]) {
        self.head(2, bytes.len() as u64);
        self.0.extend(bytes);
    }
    fn text(&mut self, value: &str, max: usize) -> Result<()> {
        require(
            !value.is_empty() && value.len() <= max,
            "invalid text length",
        )?;
        self.head(3, value.len() as u64);
        self.0.extend(value.as_bytes());
        Ok(())
    }
    fn time(&mut self, value: i64) {
        if value >= 0 {
            self.head(0, value as u64);
        } else {
            self.head(1, (-1 - i128::from(value)) as u64);
        }
    }
    fn optional_time(&mut self, value: Option<i64>) {
        if let Some(value) = value {
            self.time(value);
        } else {
            self.null();
        }
    }
    fn optional_bytes(&mut self, value: Option<&[u8]>) {
        if let Some(value) = value {
            self.bytes(value);
        } else {
            self.null();
        }
    }
}

struct Reader<'a> {
    bytes: &'a [u8],
    offset: usize,
}
impl<'a> Reader<'a> {
    fn new(bytes: &'a [u8]) -> Self {
        Self { bytes, offset: 0 }
    }
    fn take(&mut self, count: usize) -> Result<&'a [u8]> {
        let end = self
            .offset
            .checked_add(count)
            .ok_or(ReceiptError("length overflow"))?;
        let bytes = self
            .bytes
            .get(self.offset..end)
            .ok_or(ReceiptError("truncated CBOR"))?;
        self.offset = end;
        Ok(bytes)
    }
    fn head(&mut self, major: u8) -> Result<u64> {
        let byte = self.take(1)?[0];
        require(byte >> 5 == major, "unexpected CBOR type")?;
        let additional = byte & 31;
        let (count, minimum) = match additional {
            0..=23 => return Ok(u64::from(additional)),
            24 => (1, 24),
            25 => (2, 256),
            26 => (4, 65536),
            27 => (8, 4294967296),
            _ => return Err(ReceiptError("unsupported CBOR additional information")),
        };
        let mut value = 0_u64;
        for byte in self.take(count)? {
            value = (value << 8) | u64::from(*byte);
        }
        require(value >= minimum, "nonminimal CBOR head")?;
        Ok(value)
    }
    fn array(&mut self, count: u64) -> Result<()> {
        require(self.head(4)? == count, "wrong array length")
    }
    fn bytes(&mut self, max: usize) -> Result<&'a [u8]> {
        let count = self.head(2)?;
        require(count <= max as u64, "byte string too large")?;
        self.take(count as usize)
    }
    fn fixed_bytes<const N: usize>(&mut self) -> Result<[u8; N]> {
        self.bytes(N)?
            .try_into()
            .map_err(|_| ReceiptError("wrong byte string length"))
    }
    fn text(&mut self, max: usize) -> Result<String> {
        let count = self.head(3)?;
        require(count > 0 && count <= max as u64, "invalid text length")?;
        std::str::from_utf8(self.take(count as usize)?)
            .map(str::to_owned)
            .map_err(|_| ReceiptError("invalid UTF-8"))
    }
    fn null(&mut self) -> Result<bool> {
        let byte = *self
            .bytes
            .get(self.offset)
            .ok_or(ReceiptError("truncated CBOR"))?;
        if byte == 0xf6 {
            self.offset += 1;
            Ok(true)
        } else {
            Ok(false)
        }
    }
    fn time(&mut self) -> Result<i64> {
        let major = self
            .bytes
            .get(self.offset)
            .ok_or(ReceiptError("truncated CBOR"))?
            >> 5;
        require(major <= 1, "integer time required")?;
        let value = self.head(major)?;
        require(value <= i64::MAX as u64, "time outside signed 64-bit range")?;
        Ok(if major == 0 {
            value as i64
        } else {
            -1 - value as i64
        })
    }
    fn optional_time(&mut self) -> Result<Option<i64>> {
        if self.null()? {
            Ok(None)
        } else {
            self.time().map(Some)
        }
    }
    fn finish(&self) -> Result<()> {
        require(self.offset == self.bytes.len(), "trailing CBOR bytes")
    }
}
