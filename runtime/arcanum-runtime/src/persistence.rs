use std::collections::BTreeMap;
use std::fmt;
use std::fs::{self, OpenOptions};
use std::io::{self, Write};
use std::path::{Path, PathBuf};

use crate::tempus::{
    ClockObservation, ClockSourceKind, TempusAnchor, TempusPrecision, TempusProvenance,
    TempusSource, TEMPUS_ANCHOR_SCHEMA_VERSION, TEMPUS_TIME_SCALE_UTC,
};

const STORAGE_MAGIC: &[u8] = b"ARCANUM-TEMPUS-V1";
const MAX_ANCHOR_BYTES: usize = 4 * 1024 * 1024;
const MAX_STORED_FILE_BYTES: usize = MAX_ANCHOR_BYTES + 64;
const MAX_FIELD_BYTES: usize = 1024 * 1024;
const MAX_MAP_ENTRIES: usize = 4096;
const MAX_ANCHOR_ID_BYTES: usize = 128;

/// Durable local persistence boundary for factual Tempus anchors.
pub trait TempusAnchorStore {
    fn persist(&self, anchor: &TempusAnchor) -> Result<(), TempusPersistenceError>;
    fn load(&self, anchor_id: &str) -> Result<TempusAnchor, TempusPersistenceError>;
}

/// File-backed implementation of the CE-W01 `tempus/` protected namespace.
///
/// The store performs no network operations. Successfully persisted files are
/// flushed with `sync_all`, and an existing anchor ID is immutable: replaying
/// identical content is idempotent while conflicting content fails closed.
#[derive(Debug, Clone)]
pub struct FileTempusAnchorStore {
    namespace: PathBuf,
}

impl FileTempusAnchorStore {
    pub fn open(root: impl AsRef<Path>) -> Result<Self, TempusPersistenceError> {
        let namespace = root.as_ref().join("tempus");
        fs::create_dir_all(&namespace)
            .map_err(|source| storage_error("create Tempus namespace", source))?;
        Ok(Self { namespace })
    }

    fn anchor_path(&self, anchor_id: &str) -> Result<PathBuf, TempusPersistenceError> {
        validate_anchor_id(anchor_id)?;
        Ok(self.namespace.join(format!("{anchor_id}.anchor")))
    }

    fn verify_existing(
        &self,
        path: &Path,
        anchor: &TempusAnchor,
    ) -> Result<(), TempusPersistenceError> {
        let existing = read_anchor_file(path, &anchor.anchor_id)?;
        if existing == *anchor {
            Ok(())
        } else {
            Err(TempusPersistenceError::IntegrityFailure(
                "anchor ID already exists with different durable content",
            ))
        }
    }
}

impl TempusAnchorStore for FileTempusAnchorStore {
    fn persist(&self, anchor: &TempusAnchor) -> Result<(), TempusPersistenceError> {
        validate_supported_anchor(anchor)?;
        let encoded = encode_file(anchor)?;
        let path = self.anchor_path(&anchor.anchor_id)?;

        let mut file = match OpenOptions::new().write(true).create_new(true).open(&path) {
            Ok(file) => file,
            Err(source) if source.kind() == io::ErrorKind::AlreadyExists => {
                return self.verify_existing(&path, anchor);
            }
            Err(source) => return Err(storage_error("create Tempus anchor file", source)),
        };

        if let Err(source) = file.write_all(&encoded) {
            let _ = fs::remove_file(&path);
            return Err(storage_error("write Tempus anchor file", source));
        }

        file.sync_all()
            .map_err(|source| storage_error("flush Tempus anchor file", source))?;
        Ok(())
    }

    fn load(&self, anchor_id: &str) -> Result<TempusAnchor, TempusPersistenceError> {
        let path = self.anchor_path(anchor_id)?;
        let anchor = read_anchor_file(&path, anchor_id)?;
        if anchor.anchor_id != anchor_id {
            return Err(TempusPersistenceError::IntegrityFailure(
                "persisted anchor ID does not match requested anchor ID",
            ));
        }
        Ok(anchor)
    }
}

#[derive(Debug)]
pub enum TempusPersistenceError {
    NotFound(String),
    StorageUnavailable {
        operation: &'static str,
        source: io::Error,
    },
    IntegrityFailure(&'static str),
    VersionIncompatible(String),
    InvalidInput(&'static str),
}

impl fmt::Display for TempusPersistenceError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::NotFound(anchor_id) => write!(formatter, "Tempus anchor not found: {anchor_id}"),
            Self::StorageUnavailable { operation, source } => {
                write!(
                    formatter,
                    "Tempus storage unavailable during {operation}: {source}"
                )
            }
            Self::IntegrityFailure(message) => {
                write!(formatter, "Tempus persistence integrity failure: {message}")
            }
            Self::VersionIncompatible(version) => {
                write!(formatter, "unsupported persisted Tempus version: {version}")
            }
            Self::InvalidInput(message) => {
                write!(formatter, "invalid Tempus persistence input: {message}")
            }
        }
    }
}

impl std::error::Error for TempusPersistenceError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::StorageUnavailable { source, .. } => Some(source),
            _ => None,
        }
    }
}

fn storage_error(operation: &'static str, source: io::Error) -> TempusPersistenceError {
    TempusPersistenceError::StorageUnavailable { operation, source }
}

fn read_anchor_file(path: &Path, anchor_id: &str) -> Result<TempusAnchor, TempusPersistenceError> {
    let metadata = match fs::metadata(path) {
        Ok(metadata) => metadata,
        Err(source) if source.kind() == io::ErrorKind::NotFound => {
            return Err(TempusPersistenceError::NotFound(anchor_id.to_owned()));
        }
        Err(source) => return Err(storage_error("read Tempus anchor metadata", source)),
    };

    if metadata.len() > MAX_STORED_FILE_BYTES as u64 {
        return Err(TempusPersistenceError::IntegrityFailure(
            "persisted anchor exceeds the supported size bound",
        ));
    }

    let bytes =
        fs::read(path).map_err(|source| storage_error("read Tempus anchor file", source))?;
    decode_file(&bytes)
}

fn validate_anchor_id(anchor_id: &str) -> Result<(), TempusPersistenceError> {
    let bytes = anchor_id.as_bytes();
    if bytes.is_empty() || bytes.len() > MAX_ANCHOR_ID_BYTES {
        return Err(TempusPersistenceError::InvalidInput(
            "anchor ID must contain between 1 and 128 bytes",
        ));
    }

    if !bytes
        .iter()
        .all(|byte| byte.is_ascii_alphanumeric() || matches!(*byte, b'.' | b'_' | b':' | b'-'))
    {
        return Err(TempusPersistenceError::InvalidInput(
            "anchor ID violates the certified TempusAnchor identifier pattern",
        ));
    }

    Ok(())
}

fn validate_supported_anchor(anchor: &TempusAnchor) -> Result<(), TempusPersistenceError> {
    validate_anchor_id(&anchor.anchor_id)?;

    if anchor.schema_version != TEMPUS_ANCHOR_SCHEMA_VERSION {
        return Err(TempusPersistenceError::VersionIncompatible(
            anchor.schema_version.to_owned(),
        ));
    }
    if anchor.time_scale != TEMPUS_TIME_SCALE_UTC {
        return Err(TempusPersistenceError::InvalidInput(
            "CP4-B persists the current UTC clock-anchor subset only",
        ));
    }
    if anchor.observer.is_some() || anchor.frame.is_some() || anchor.interpretation.is_some() {
        return Err(TempusPersistenceError::InvalidInput(
            "CP4-B persists location-free clock anchors only",
        ));
    }
    if anchor.observation.kind != "clock" {
        return Err(TempusPersistenceError::InvalidInput(
            "CP4-B persists clock observations only",
        ));
    }

    for value in [
        anchor.observation.longitude_deg,
        anchor.observation.latitude_deg,
        anchor.observation.distance,
    ]
    .into_iter()
    .flatten()
    {
        if !value.is_finite() {
            return Err(TempusPersistenceError::InvalidInput(
                "floating-point observation values must be finite",
            ));
        }
    }

    Ok(())
}

fn encode_file(anchor: &TempusAnchor) -> Result<Vec<u8>, TempusPersistenceError> {
    let payload = encode_payload(anchor)?;
    if payload.len() > MAX_ANCHOR_BYTES {
        return Err(TempusPersistenceError::InvalidInput(
            "encoded Tempus anchor exceeds the supported size bound",
        ));
    }

    let mut encoded = Vec::with_capacity(STORAGE_MAGIC.len() + 4 + payload.len() + 8);
    encoded.extend_from_slice(STORAGE_MAGIC);
    put_u32(&mut encoded, payload.len() as u32);
    encoded.extend_from_slice(&payload);
    put_u64(&mut encoded, checksum(&payload));
    Ok(encoded)
}

fn decode_file(bytes: &[u8]) -> Result<TempusAnchor, TempusPersistenceError> {
    if bytes.len() > MAX_STORED_FILE_BYTES {
        return Err(TempusPersistenceError::IntegrityFailure(
            "persisted anchor exceeds the supported size bound",
        ));
    }

    let mut decoder = Decoder::new(bytes);
    if decoder.take(STORAGE_MAGIC.len())? != STORAGE_MAGIC {
        return Err(TempusPersistenceError::IntegrityFailure(
            "persisted anchor has an unknown storage header",
        ));
    }

    let payload_len = decoder.u32()? as usize;
    if payload_len > MAX_ANCHOR_BYTES {
        return Err(TempusPersistenceError::IntegrityFailure(
            "persisted anchor payload exceeds the supported size bound",
        ));
    }

    let payload = decoder.take(payload_len)?;
    let stored_checksum = decoder.u64()?;
    if !decoder.is_finished() {
        return Err(TempusPersistenceError::IntegrityFailure(
            "persisted anchor contains trailing bytes",
        ));
    }
    if checksum(payload) != stored_checksum {
        return Err(TempusPersistenceError::IntegrityFailure(
            "persisted anchor checksum mismatch",
        ));
    }

    decode_payload(payload)
}

fn encode_payload(anchor: &TempusAnchor) -> Result<Vec<u8>, TempusPersistenceError> {
    let mut encoded = Vec::new();
    put_string(&mut encoded, &anchor.anchor_id)?;
    put_string(&mut encoded, anchor.schema_version)?;
    put_string(&mut encoded, &anchor.captured_at)?;
    put_string(&mut encoded, anchor.time_scale)?;
    encoded.push(match anchor.source.kind {
        ClockSourceKind::SystemClock => 0,
        ClockSourceKind::MonotonicClock => 1,
    });
    put_optional_string(&mut encoded, anchor.source.provider.as_deref())?;
    put_optional_string(&mut encoded, anchor.source.model.as_deref())?;
    put_optional_string(&mut encoded, anchor.source.version.as_deref())?;
    put_optional_string(&mut encoded, anchor.source.source_id.as_deref())?;
    put_bool(&mut encoded, anchor.observer.is_some());
    put_bool(&mut encoded, anchor.frame.is_some());
    put_string(&mut encoded, anchor.observation.kind)?;
    put_optional_string(&mut encoded, anchor.observation.target.as_deref())?;
    put_optional_string(&mut encoded, anchor.observation.coordinate_type.as_deref())?;
    put_optional_f64(&mut encoded, anchor.observation.longitude_deg);
    put_optional_f64(&mut encoded, anchor.observation.latitude_deg);
    put_optional_f64(&mut encoded, anchor.observation.distance);
    put_optional_string(&mut encoded, anchor.observation.distance_unit.as_deref())?;

    if anchor.observation.additional_provider_fields.len() > MAX_MAP_ENTRIES {
        return Err(TempusPersistenceError::InvalidInput(
            "too many additional provider fields",
        ));
    }
    put_u32(
        &mut encoded,
        anchor.observation.additional_provider_fields.len() as u32,
    );
    for (key, value) in &anchor.observation.additional_provider_fields {
        put_string(&mut encoded, key)?;
        put_string(&mut encoded, value)?;
    }

    put_optional_string(&mut encoded, anchor.precision.time_resolution.as_deref())?;
    put_optional_string(
        &mut encoded,
        anchor.precision.coordinate_resolution.as_deref(),
    )?;
    put_optional_string(&mut encoded, anchor.precision.uncertainty.as_deref())?;
    put_optional_string(&mut encoded, anchor.precision.notes.as_deref())?;
    put_optional_string(&mut encoded, anchor.provenance.source_uri.as_deref())?;
    put_optional_string(&mut encoded, anchor.provenance.request_digest.as_deref())?;
    put_optional_string(&mut encoded, anchor.provenance.software_version.as_deref())?;
    put_optional_string(&mut encoded, anchor.provenance.backend.as_deref())?;
    put_optional_string(&mut encoded, anchor.provenance.fallback_mode.as_deref())?;
    put_bool(&mut encoded, anchor.provenance.original_fields_retained);
    put_bool(&mut encoded, anchor.interpretation.is_some());
    Ok(encoded)
}

fn decode_payload(payload: &[u8]) -> Result<TempusAnchor, TempusPersistenceError> {
    let mut decoder = Decoder::new(payload);
    let anchor_id = decoder.string()?;
    validate_anchor_id(&anchor_id).map_err(|_| {
        TempusPersistenceError::IntegrityFailure(
            "persisted anchor ID violates the certified identifier pattern",
        )
    })?;

    let schema_version = decoder.string()?;
    if schema_version != TEMPUS_ANCHOR_SCHEMA_VERSION {
        return Err(TempusPersistenceError::VersionIncompatible(schema_version));
    }

    let captured_at = decoder.string()?;
    let time_scale = decoder.string()?;
    if time_scale != TEMPUS_TIME_SCALE_UTC {
        return Err(TempusPersistenceError::VersionIncompatible(time_scale));
    }

    let source_kind = match decoder.byte()? {
        0 => ClockSourceKind::SystemClock,
        1 => ClockSourceKind::MonotonicClock,
        _ => {
            return Err(TempusPersistenceError::IntegrityFailure(
                "persisted anchor contains an unknown clock source kind",
            ));
        }
    };

    let source = TempusSource {
        kind: source_kind,
        provider: decoder.optional_string()?,
        model: decoder.optional_string()?,
        version: decoder.optional_string()?,
        source_id: decoder.optional_string()?,
    };

    if decoder.boolean()? || decoder.boolean()? {
        return Err(TempusPersistenceError::IntegrityFailure(
            "persisted CP4-B clock anchor unexpectedly contains observer or frame data",
        ));
    }

    let observation_kind = decoder.string()?;
    if observation_kind != "clock" {
        return Err(TempusPersistenceError::IntegrityFailure(
            "persisted CP4-B anchor is not a clock observation",
        ));
    }

    let target = decoder.optional_string()?;
    let coordinate_type = decoder.optional_string()?;
    let longitude_deg = decoder.optional_f64()?;
    let latitude_deg = decoder.optional_f64()?;
    let distance = decoder.optional_f64()?;
    for value in [longitude_deg, latitude_deg, distance]
        .into_iter()
        .flatten()
    {
        if !value.is_finite() {
            return Err(TempusPersistenceError::IntegrityFailure(
                "persisted anchor contains a non-finite observation value",
            ));
        }
    }
    let distance_unit = decoder.optional_string()?;

    let provider_field_count = decoder.u32()? as usize;
    if provider_field_count > MAX_MAP_ENTRIES {
        return Err(TempusPersistenceError::IntegrityFailure(
            "persisted anchor contains too many provider fields",
        ));
    }
    let mut additional_provider_fields = BTreeMap::new();
    for _ in 0..provider_field_count {
        let key = decoder.string()?;
        let value = decoder.string()?;
        if additional_provider_fields.insert(key, value).is_some() {
            return Err(TempusPersistenceError::IntegrityFailure(
                "persisted anchor contains duplicate provider-field keys",
            ));
        }
    }

    let precision = TempusPrecision {
        time_resolution: decoder.optional_string()?,
        coordinate_resolution: decoder.optional_string()?,
        uncertainty: decoder.optional_string()?,
        notes: decoder.optional_string()?,
    };
    let provenance = TempusProvenance {
        source_uri: decoder.optional_string()?,
        request_digest: decoder.optional_string()?,
        software_version: decoder.optional_string()?,
        backend: decoder.optional_string()?,
        fallback_mode: decoder.optional_string()?,
        original_fields_retained: decoder.boolean()?,
    };

    if decoder.boolean()? {
        return Err(TempusPersistenceError::IntegrityFailure(
            "persisted CP4-B anchor unexpectedly contains interpretation data",
        ));
    }
    if !decoder.is_finished() {
        return Err(TempusPersistenceError::IntegrityFailure(
            "persisted anchor payload contains trailing fields",
        ));
    }

    Ok(TempusAnchor {
        anchor_id,
        schema_version: TEMPUS_ANCHOR_SCHEMA_VERSION,
        captured_at,
        time_scale: TEMPUS_TIME_SCALE_UTC,
        source,
        observer: None,
        frame: None,
        observation: ClockObservation {
            kind: "clock",
            target,
            coordinate_type,
            longitude_deg,
            latitude_deg,
            distance,
            distance_unit,
            additional_provider_fields,
        },
        precision,
        provenance,
        interpretation: None,
    })
}

fn put_string(encoded: &mut Vec<u8>, value: &str) -> Result<(), TempusPersistenceError> {
    if value.len() > MAX_FIELD_BYTES {
        return Err(TempusPersistenceError::InvalidInput(
            "Tempus persistence field exceeds the supported size bound",
        ));
    }
    put_u32(encoded, value.len() as u32);
    encoded.extend_from_slice(value.as_bytes());
    Ok(())
}

fn put_optional_string(
    encoded: &mut Vec<u8>,
    value: Option<&str>,
) -> Result<(), TempusPersistenceError> {
    match value {
        Some(value) => {
            encoded.push(1);
            put_string(encoded, value)
        }
        None => {
            encoded.push(0);
            Ok(())
        }
    }
}

fn put_optional_f64(encoded: &mut Vec<u8>, value: Option<f64>) {
    match value {
        Some(value) => {
            encoded.push(1);
            put_u64(encoded, value.to_bits());
        }
        None => encoded.push(0),
    }
}

fn put_bool(encoded: &mut Vec<u8>, value: bool) {
    encoded.push(u8::from(value));
}

fn put_u32(encoded: &mut Vec<u8>, value: u32) {
    encoded.extend_from_slice(&value.to_le_bytes());
}

fn put_u64(encoded: &mut Vec<u8>, value: u64) {
    encoded.extend_from_slice(&value.to_le_bytes());
}

fn checksum(bytes: &[u8]) -> u64 {
    let mut hash = 0xcbf2_9ce4_8422_2325_u64;
    for byte in bytes {
        hash ^= u64::from(*byte);
        hash = hash.wrapping_mul(0x0000_0100_0000_01b3);
    }
    hash
}

struct Decoder<'a> {
    bytes: &'a [u8],
    cursor: usize,
}

impl<'a> Decoder<'a> {
    fn new(bytes: &'a [u8]) -> Self {
        Self { bytes, cursor: 0 }
    }

    fn take(&mut self, len: usize) -> Result<&'a [u8], TempusPersistenceError> {
        let end = self
            .cursor
            .checked_add(len)
            .ok_or(TempusPersistenceError::IntegrityFailure(
                "persisted anchor offset overflow",
            ))?;
        if end > self.bytes.len() {
            return Err(TempusPersistenceError::IntegrityFailure(
                "persisted anchor is truncated",
            ));
        }
        let value = &self.bytes[self.cursor..end];
        self.cursor = end;
        Ok(value)
    }

    fn byte(&mut self) -> Result<u8, TempusPersistenceError> {
        Ok(self.take(1)?[0])
    }

    fn boolean(&mut self) -> Result<bool, TempusPersistenceError> {
        match self.byte()? {
            0 => Ok(false),
            1 => Ok(true),
            _ => Err(TempusPersistenceError::IntegrityFailure(
                "persisted anchor contains an invalid boolean",
            )),
        }
    }

    fn u32(&mut self) -> Result<u32, TempusPersistenceError> {
        let mut bytes = [0_u8; 4];
        bytes.copy_from_slice(self.take(4)?);
        Ok(u32::from_le_bytes(bytes))
    }

    fn u64(&mut self) -> Result<u64, TempusPersistenceError> {
        let mut bytes = [0_u8; 8];
        bytes.copy_from_slice(self.take(8)?);
        Ok(u64::from_le_bytes(bytes))
    }

    fn string(&mut self) -> Result<String, TempusPersistenceError> {
        let len = self.u32()? as usize;
        if len > MAX_FIELD_BYTES {
            return Err(TempusPersistenceError::IntegrityFailure(
                "persisted string exceeds the supported size bound",
            ));
        }
        let bytes = self.take(len)?;
        String::from_utf8(bytes.to_vec()).map_err(|_| {
            TempusPersistenceError::IntegrityFailure("persisted string is not valid UTF-8")
        })
    }

    fn optional_string(&mut self) -> Result<Option<String>, TempusPersistenceError> {
        match self.byte()? {
            0 => Ok(None),
            1 => self.string().map(Some),
            _ => Err(TempusPersistenceError::IntegrityFailure(
                "persisted optional string contains an invalid tag",
            )),
        }
    }

    fn optional_f64(&mut self) -> Result<Option<f64>, TempusPersistenceError> {
        match self.byte()? {
            0 => Ok(None),
            1 => self.u64().map(f64::from_bits).map(Some),
            _ => Err(TempusPersistenceError::IntegrityFailure(
                "persisted optional number contains an invalid tag",
            )),
        }
    }

    fn is_finished(&self) -> bool {
        self.cursor == self.bytes.len()
    }
}
