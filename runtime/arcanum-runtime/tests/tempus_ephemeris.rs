use std::cell::Cell;
use std::collections::BTreeMap;
use std::fmt;
use std::fs;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};

use arcanum_runtime::persistence::{FileTempusAnchorStore, TempusAnchorStore};
use arcanum_runtime::tempus::{
    capture_ephemeris_anchor, ephemeris_anchor_from_sample, EphemerisCaptureError,
    EphemerisProvider, EphemerisSample, EphemerisValidationError, TempusFrame, TempusObserver,
    TempusObserverKind, TempusPrecision, TempusProvenance, TempusProviderField, TempusSourceKind,
    TEMPUS_ANCHOR_SCHEMA_VERSION, TEMPUS_TIME_SCALE_UTC,
};

static TEST_DIRECTORY_COUNTER: AtomicU64 = AtomicU64::new(0);

#[derive(Debug, Clone)]
struct FixedEphemerisProvider {
    sample: EphemerisSample,
    calls: Cell<u32>,
}

impl EphemerisProvider for FixedEphemerisProvider {
    type Error = FixtureProviderError;

    fn sample(&self) -> Result<EphemerisSample, Self::Error> {
        self.calls.set(self.calls.get() + 1);
        Ok(self.sample.clone())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum FixtureProviderError {
    Unavailable,
}

impl fmt::Display for FixtureProviderError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str("fixture provider unavailable")
    }
}

impl std::error::Error for FixtureProviderError {}

struct UnavailableEphemerisProvider;

impl EphemerisProvider for UnavailableEphemerisProvider {
    type Error = FixtureProviderError;

    fn sample(&self) -> Result<EphemerisSample, Self::Error> {
        Err(FixtureProviderError::Unavailable)
    }
}

fn certified_structural_sample() -> EphemerisSample {
    let mut additional_provider_fields = BTreeMap::new();
    additional_provider_fields.insert(
        "fixture".to_owned(),
        TempusProviderField::Boolean(true),
    );

    EphemerisSample {
        captured_at: "2026-08-26T06:00:00Z".to_owned(),
        time_scale: TEMPUS_TIME_SCALE_UTC.to_owned(),
        provider: Some("fixture".to_owned()),
        model: Some("synthetic-structural-vector".to_owned()),
        version: Some("1".to_owned()),
        source_id: Some("fixture-ephemeris".to_owned()),
        observer: Some(TempusObserver {
            kind: TempusObserverKind::BodyCenter,
            body: Some("Earth".to_owned()),
            site: None,
            latitude_deg: None,
            longitude_deg: None,
            altitude_m: None,
        }),
        frame: Some(TempusFrame {
            family: "geocentric-ecliptic-apparent".to_owned(),
            center: Some("Earth geocenter".to_owned()),
            axes: Some("provider-declared".to_owned()),
            reference_plane: Some("ecliptic-of-date".to_owned()),
            epoch_rule: "of-date".to_owned(),
        }),
        target: Some("Sun".to_owned()),
        coordinate_type: Some("apparent-ecliptic-longitude-latitude".to_owned()),
        longitude_deg: Some(150.0),
        latitude_deg: Some(0.0),
        distance: Some(1.0),
        distance_unit: Some("au".to_owned()),
        additional_provider_fields,
        precision: TempusPrecision {
            time_resolution: Some("1 s".to_owned()),
            coordinate_resolution: Some("0.001 deg".to_owned()),
            uncertainty: Some("fixture-only".to_owned()),
            notes: Some(
                "Synthetic structural fixture; values are not represented as a live astronomical observation."
                    .to_owned(),
            ),
        },
        provenance: TempusProvenance {
            source_uri: Some("urn:arcanum:fixture:ephemeris".to_owned()),
            request_digest: Some("fixture-request-001".to_owned()),
            software_version: Some("ce-w01-fixture".to_owned()),
            backend: Some("fixture".to_owned()),
            fallback_mode: None,
            original_fields_retained: true,
        },
    }
}

#[test]
fn certified_structural_ephemeris_maps_to_factual_tempus_anchor() {
    let provider = FixedEphemerisProvider {
        sample: certified_structural_sample(),
        calls: Cell::new(0),
    };

    let anchor = capture_ephemeris_anchor(
        &provider,
        "tempus-fixture-ephemeris-001",
        "ce-w01-cp4-c",
    )
    .expect("certified structural ephemeris fixture should map");

    assert_eq!(provider.calls.get(), 1);
    assert_eq!(anchor.anchor_id, "tempus-fixture-ephemeris-001");
    assert_eq!(anchor.schema_version, TEMPUS_ANCHOR_SCHEMA_VERSION);
    assert_eq!(anchor.captured_at, "2026-08-26T06:00:00Z");
    assert_eq!(anchor.time_scale, TEMPUS_TIME_SCALE_UTC);
    assert_eq!(anchor.source.kind, TempusSourceKind::Ephemeris);
    assert_eq!(anchor.source.kind.as_schema_value(), "ephemeris");
    assert_eq!(anchor.source.provider.as_deref(), Some("fixture"));
    assert_eq!(
        anchor.source.model.as_deref(),
        Some("synthetic-structural-vector")
    );
    assert_eq!(anchor.source.version.as_deref(), Some("1"));
    assert_eq!(
        anchor.source.source_id.as_deref(),
        Some("fixture-ephemeris")
    );

    let observer = anchor
        .observer
        .as_ref()
        .expect("ephemeris observer must be explicit");
    assert_eq!(observer.kind, TempusObserverKind::BodyCenter);
    assert_eq!(observer.kind.as_schema_value(), "body-center");
    assert_eq!(observer.body.as_deref(), Some("Earth"));
    assert!(observer.site.is_none());
    assert!(observer.latitude_deg.is_none());
    assert!(observer.longitude_deg.is_none());
    assert!(observer.altitude_m.is_none());

    let frame = anchor.frame.as_ref().expect("ephemeris frame must be explicit");
    assert_eq!(frame.family, "geocentric-ecliptic-apparent");
    assert_eq!(frame.center.as_deref(), Some("Earth geocenter"));
    assert_eq!(frame.axes.as_deref(), Some("provider-declared"));
    assert_eq!(frame.reference_plane.as_deref(), Some("ecliptic-of-date"));
    assert_eq!(frame.epoch_rule, "of-date");

    assert_eq!(anchor.observation.kind, "astronomical-coordinate");
    assert_eq!(anchor.observation.target.as_deref(), Some("Sun"));
    assert_eq!(
        anchor.observation.coordinate_type.as_deref(),
        Some("apparent-ecliptic-longitude-latitude")
    );
    assert_eq!(anchor.observation.longitude_deg, Some(150.0));
    assert_eq!(anchor.observation.latitude_deg, Some(0.0));
    assert_eq!(anchor.observation.distance, Some(1.0));
    assert_eq!(anchor.observation.distance_unit.as_deref(), Some("au"));
    assert_eq!(
        anchor
            .observation
            .additional_provider_fields
            .get("fixture"),
        Some(&TempusProviderField::Boolean(true))
    );

    assert_eq!(
        anchor.precision.coordinate_resolution.as_deref(),
        Some("0.001 deg")
    );
    assert_eq!(anchor.precision.uncertainty.as_deref(), Some("fixture-only"));
    assert_eq!(
        anchor.provenance.request_digest.as_deref(),
        Some("fixture-request-001")
    );
    assert_eq!(anchor.provenance.backend.as_deref(), Some("fixture"));
    assert!(anchor.provenance.original_fields_retained);
    assert!(anchor.interpretation.is_none());
}

#[test]
fn equal_ephemeris_inputs_produce_equal_anchors() {
    let sample = certified_structural_sample();
    let first = ephemeris_anchor_from_sample(
        "tempus-deterministic-ephemeris-001",
        "ce-w01-cp4-c",
        sample.clone(),
    )
    .expect("valid fixture should map");
    let second = ephemeris_anchor_from_sample(
        "tempus-deterministic-ephemeris-001",
        "ce-w01-cp4-c",
        sample,
    )
    .expect("valid fixture should map");

    assert_eq!(first, second);
}

#[test]
fn missing_observer_or_frame_fails_closed() {
    let mut missing_observer = certified_structural_sample();
    missing_observer.observer = None;
    assert_eq!(
        ephemeris_anchor_from_sample("missing-observer", "ce-w01-cp4-c", missing_observer)
            .expect_err("ephemeris without observer must fail"),
        EphemerisValidationError::MissingField("observer")
    );

    let mut missing_frame = certified_structural_sample();
    missing_frame.frame = None;
    assert_eq!(
        ephemeris_anchor_from_sample("missing-frame", "ce-w01-cp4-c", missing_frame)
            .expect_err("ephemeris without frame must fail"),
        EphemerisValidationError::MissingField("frame")
    );
}

#[test]
fn geocentric_ephemeris_requires_no_participant_location() {
    let anchor = ephemeris_anchor_from_sample(
        "geocentric-no-location",
        "ce-w01-cp4-c",
        certified_structural_sample(),
    )
    .expect("Earth-geocentric sample should not require participant location");

    let observer = anchor.observer.expect("observer should remain explicit");
    assert_eq!(observer.kind, TempusObserverKind::BodyCenter);
    assert!(observer.site.is_none());
    assert!(observer.latitude_deg.is_none());
    assert!(observer.longitude_deg.is_none());
    assert!(observer.altitude_m.is_none());
}

#[test]
fn topocentric_location_must_be_explicitly_supplied() {
    let mut missing_location = certified_structural_sample();
    missing_location.observer = Some(TempusObserver {
        kind: TempusObserverKind::TopocentricSite,
        body: Some("Earth".to_owned()),
        site: Some("explicit-fixture-site".to_owned()),
        latitude_deg: None,
        longitude_deg: None,
        altitude_m: None,
    });
    assert_eq!(
        ephemeris_anchor_from_sample("topocentric-missing", "ce-w01-cp4-c", missing_location)
            .expect_err("topocentric sample must not invent participant location"),
        EphemerisValidationError::MissingField("explicit site latitude/longitude")
    );

    let mut supplied_location = certified_structural_sample();
    supplied_location.observer = Some(TempusObserver {
        kind: TempusObserverKind::TopocentricSite,
        body: Some("Earth".to_owned()),
        site: Some("explicit-fixture-site".to_owned()),
        latitude_deg: Some(40.0),
        longitude_deg: Some(-75.0),
        altitude_m: Some(100.0),
    });
    let anchor = ephemeris_anchor_from_sample(
        "topocentric-explicit",
        "ce-w01-cp4-c",
        supplied_location,
    )
    .expect("explicit topocentric coordinates should be preserved");

    let observer = anchor.observer.expect("topocentric observer should persist");
    assert_eq!(observer.latitude_deg, Some(40.0));
    assert_eq!(observer.longitude_deg, Some(-75.0));
    assert_eq!(observer.altitude_m, Some(100.0));
}

#[test]
fn precision_and_provider_provenance_must_be_explicit() {
    let mut missing_provider = certified_structural_sample();
    missing_provider.provider = None;
    assert_eq!(
        ephemeris_anchor_from_sample("missing-provider", "ce-w01-cp4-c", missing_provider)
            .expect_err("provider identity must remain explicit"),
        EphemerisValidationError::MissingField("source.provider")
    );

    let mut missing_uncertainty = certified_structural_sample();
    missing_uncertainty.precision.uncertainty = None;
    assert_eq!(
        ephemeris_anchor_from_sample(
            "missing-uncertainty",
            "ce-w01-cp4-c",
            missing_uncertainty,
        )
        .expect_err("unknown uncertainty must be explicit rather than fabricated"),
        EphemerisValidationError::MissingField("precision.uncertainty")
    );
}

#[test]
fn unavailable_and_malformed_provider_states_fail_visibly() {
    let error = capture_ephemeris_anchor(
        &UnavailableEphemerisProvider,
        "provider-unavailable",
        "ce-w01-cp4-c",
    )
    .expect_err("provider failure must be visible");

    assert!(matches!(
        error,
        EphemerisCaptureError::Provider(FixtureProviderError::Unavailable)
    ));

    let mut malformed = certified_structural_sample();
    malformed.longitude_deg = Some(f64::NAN);
    let provider = FixedEphemerisProvider {
        sample: malformed,
        calls: Cell::new(0),
    };
    let error = capture_ephemeris_anchor(&provider, "provider-malformed", "ce-w01-cp4-c")
        .expect_err("malformed provider data must fail visibly");

    assert!(matches!(
        error,
        EphemerisCaptureError::InvalidSample(EphemerisValidationError::InvalidField(
            "observation.longitudeDeg"
        ))
    ));
}

#[test]
fn ephemeris_capture_has_no_authority_or_protocol_side_effect_surface() {
    let anchor = ephemeris_anchor_from_sample(
        "factual-only",
        "ce-w01-cp4-c",
        certified_structural_sample(),
    )
    .expect("valid factual sample should map");

    assert!(anchor.interpretation.is_none());
    assert_eq!(anchor.source.kind, TempusSourceKind::Ephemeris);
    assert_eq!(anchor.observation.kind, "astronomical-coordinate");
}

#[test]
fn cp4_b_v1_store_rejects_ephemeris_without_reinterpreting_clock_bytes() {
    let directory = TestDirectory::new("tempus-ephemeris-v1-reject");
    let store = FileTempusAnchorStore::open(&directory.path)
        .expect("Tempus store should open without network");
    let anchor = ephemeris_anchor_from_sample(
        "ephemeris-not-v1-persistable",
        "ce-w01-cp4-c",
        certified_structural_sample(),
    )
    .expect("valid ephemeris anchor should construct in memory");

    let error = store
        .persist(&anchor)
        .expect_err("CP4-B V1 storage must not silently reinterpret ephemeris data");

    assert!(matches!(
        error,
        arcanum_runtime::persistence::TempusPersistenceError::InvalidInput(_)
    ));
}

#[test]
fn cp4_b_legacy_clock_bytes_still_recover_unchanged() {
    let directory = TestDirectory::new("tempus-cp4-b-compat");
    let namespace = directory.path.join("tempus");
    fs::create_dir_all(&namespace).expect("Tempus namespace should be creatable");

    let bytes = decode_hex(LEGACY_CP4_B_ANCHOR_HEX);
    fs::write(namespace.join("tempus-restart-001.anchor"), bytes)
        .expect("legacy fixture should be writable");

    let store = FileTempusAnchorStore::open(&directory.path)
        .expect("Tempus store should open without network");
    let restored = store
        .load("tempus-restart-001")
        .expect("CP4-B durable bytes should remain readable");

    assert_eq!(restored.anchor_id, "tempus-restart-001");
    assert_eq!(restored.schema_version, TEMPUS_ANCHOR_SCHEMA_VERSION);
    assert_eq!(restored.captured_at, "2026-09-03T08:00:00Z");
    assert_eq!(restored.time_scale, TEMPUS_TIME_SCALE_UTC);
    assert_eq!(restored.source.kind.as_schema_value(), "system-clock");
    assert_eq!(
        restored.source.provider.as_deref(),
        Some("fixture-system-clock")
    );
    assert!(restored.observer.is_none());
    assert!(restored.frame.is_none());
    assert_eq!(restored.observation.kind, "clock");
    assert_eq!(
        restored
            .observation
            .additional_provider_fields
            .get("monotonicCorrelation"),
        Some(&TempusProviderField::String(
            "fixture-monotonic=424242".to_owned()
        ))
    );
    assert_eq!(restored.precision.uncertainty.as_deref(), Some("±1 ms"));
    assert_eq!(
        restored.provenance.request_digest.as_deref(),
        Some("fixture-request-digest-001")
    );
    assert!(restored.provenance.original_fields_retained);
    assert!(restored.interpretation.is_none());
}

struct TestDirectory {
    path: PathBuf,
}

impl TestDirectory {
    fn new(label: &str) -> Self {
        let sequence = TEST_DIRECTORY_COUNTER.fetch_add(1, Ordering::Relaxed);
        let path = std::env::temp_dir().join(format!(
            "arcanum-runtime-{label}-{}-{sequence}",
            std::process::id()
        ));
        let _ = fs::remove_dir_all(&path);
        fs::create_dir_all(&path).expect("test storage directory should be creatable");
        Self { path }
    }
}

impl Drop for TestDirectory {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.path);
    }
}

fn decode_hex(value: &str) -> Vec<u8> {
    assert_eq!(value.len() % 2, 0, "hex fixture must contain whole bytes");
    value
        .as_bytes()
        .chunks_exact(2)
        .map(|pair| {
            let high = hex_nibble(pair[0]);
            let low = hex_nibble(pair[1]);
            (high << 4) | low
        })
        .collect()
}

fn hex_nibble(value: u8) -> u8 {
    match value {
        b'0'..=b'9' => value - b'0',
        b'a'..=b'f' => value - b'a' + 10,
        b'A'..=b'F' => value - b'A' + 10,
        _ => panic!("invalid hex fixture"),
    }
}

const LEGACY_CP4_B_ANCHOR_HEX: &str = "415243414e554d2d54454d5055532d5631710100001200000074656d7075732d726573746172742d30303105000000302e312e3014000000323032362d30392d30335430383a30303a30305a03000000555443000114000000666978747572652d73797374656d2d636c6f636b010d000000666978747572652d6d6f64656c0101000000320112000000666978747572652d736f757263652d303031000005000000636c6f636b00000000000001000000140000006d6f6e6f746f6e6963436f7272656c6174696f6e18000000666978747572652d6d6f6e6f746f6e69633d343234323432010400000031206d73000106000000c2b131206d73010f000000726573746172742066697874757265011c0000006c6f63616c3a2f2f666978747572652f73797374656d2d636c6f636b011a000000666978747572652d726571756573742d6469676573742d303031010c00000063652d7730312d6370342d620114000000666978747572652d73797374656d2d636c6f636b01070000006f66666c696e6501004d26cc76998173ae";
