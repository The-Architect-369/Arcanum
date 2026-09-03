use std::convert::Infallible;

use arcanum_runtime::tempus::{
    capture_tempus_anchor, tempus_anchor_from_sample, ClockProvider, ClockSample, ClockSourceKind,
    SystemClockProvider, TEMPUS_ANCHOR_SCHEMA_VERSION, TEMPUS_TIME_SCALE_UTC,
};

#[derive(Debug, Clone)]
struct FixedClockProvider {
    sample: ClockSample,
}

impl ClockProvider for FixedClockProvider {
    type Error = Infallible;

    fn sample(&self) -> Result<ClockSample, Self::Error> {
        Ok(self.sample.clone())
    }
}

fn fixed_sample() -> ClockSample {
    ClockSample {
        captured_at: "2026-08-26T06:00:00Z".to_owned(),
        source_kind: ClockSourceKind::SystemClock,
        provider: Some("fixture".to_owned()),
        model: None,
        version: Some("1".to_owned()),
        source_id: Some("fixture-system-clock".to_owned()),
        time_resolution: Some("1 ms".to_owned()),
        uncertainty: None,
        monotonic_correlation: None,
    }
}

#[test]
fn fixed_clock_provider_creates_location_free_clock_anchor() {
    let provider = FixedClockProvider {
        sample: fixed_sample(),
    };

    let anchor = capture_tempus_anchor(&provider, "tempus-fixture-clock-001", "ce-w01-cp4-a")
        .expect("fixed clock provider is infallible");

    assert_eq!(anchor.anchor_id, "tempus-fixture-clock-001");
    assert_eq!(anchor.schema_version, TEMPUS_ANCHOR_SCHEMA_VERSION);
    assert_eq!(anchor.captured_at, "2026-08-26T06:00:00Z");
    assert_eq!(anchor.time_scale, TEMPUS_TIME_SCALE_UTC);
    assert_eq!(anchor.source.kind, ClockSourceKind::SystemClock);
    assert_eq!(anchor.source.kind.as_schema_value(), "system-clock");
    assert_eq!(anchor.source.provider.as_deref(), Some("fixture"));
    assert_eq!(anchor.source.model, None);
    assert_eq!(anchor.source.version.as_deref(), Some("1"));
    assert_eq!(
        anchor.source.source_id.as_deref(),
        Some("fixture-system-clock")
    );

    assert!(anchor.observer.is_none());
    assert!(anchor.frame.is_none());
    assert_eq!(anchor.observation.kind, "clock");
    assert!(anchor.observation.target.is_none());
    assert!(anchor.observation.coordinate_type.is_none());
    assert!(anchor.observation.longitude_deg.is_none());
    assert!(anchor.observation.latitude_deg.is_none());
    assert!(anchor.observation.distance.is_none());
    assert!(anchor.observation.distance_unit.is_none());
    assert!(anchor.observation.additional_provider_fields.is_empty());

    assert_eq!(anchor.precision.time_resolution.as_deref(), Some("1 ms"));
    assert!(anchor.precision.coordinate_resolution.is_none());
    assert!(anchor.precision.uncertainty.is_none());
    assert!(anchor.precision.notes.is_none());

    assert!(anchor.provenance.source_uri.is_none());
    assert!(anchor.provenance.request_digest.is_none());
    assert_eq!(
        anchor.provenance.software_version.as_deref(),
        Some("ce-w01-cp4-a")
    );
    assert_eq!(anchor.provenance.backend.as_deref(), Some("fixture"));
    assert!(anchor.provenance.fallback_mode.is_none());
    assert!(!anchor.provenance.original_fields_retained);
    assert!(anchor.interpretation.is_none());
}

#[test]
fn sample_to_anchor_mapping_is_deterministic() {
    let sample = fixed_sample();
    let first = tempus_anchor_from_sample(
        "tempus-deterministic-clock-001",
        "ce-w01-cp4-a",
        sample.clone(),
    );
    let second =
        tempus_anchor_from_sample("tempus-deterministic-clock-001", "ce-w01-cp4-a", sample);

    assert_eq!(first, second);
}

#[test]
fn system_clock_provider_is_local_utc_and_location_free() {
    let provider = SystemClockProvider;
    let sample = provider
        .sample()
        .expect("host system clock should be representable as UTC");

    assert_eq!(sample.source_kind, ClockSourceKind::SystemClock);
    assert_eq!(sample.provider.as_deref(), Some("std::time::SystemTime"));
    assert_eq!(sample.source_id.as_deref(), Some("host-system-clock"));
    assert_eq!(sample.time_resolution.as_deref(), Some("1 s"));
    assert!(sample.uncertainty.is_none());
    assert!(sample.monotonic_correlation.is_none());
    assert!(looks_like_utc_second_timestamp(&sample.captured_at));

    let anchor = capture_tempus_anchor(&provider, "tempus-live-clock", "ce-w01-cp4-a")
        .expect("local clock capture should not require network or location");

    assert!(anchor.observer.is_none());
    assert!(anchor.frame.is_none());
    assert_eq!(anchor.observation.kind, "clock");
    assert!(anchor.observation.target.is_none());
    assert!(anchor.interpretation.is_none());
}

fn looks_like_utc_second_timestamp(value: &str) -> bool {
    let bytes = value.as_bytes();
    value.len() == 20
        && bytes[4] == b'-'
        && bytes[7] == b'-'
        && bytes[10] == b'T'
        && bytes[13] == b':'
        && bytes[16] == b':'
        && bytes[19] == b'Z'
        && bytes[..4].iter().all(|byte| byte.is_ascii_digit())
        && bytes[5..7].iter().all(|byte| byte.is_ascii_digit())
        && bytes[8..10].iter().all(|byte| byte.is_ascii_digit())
        && bytes[11..13].iter().all(|byte| byte.is_ascii_digit())
        && bytes[14..16].iter().all(|byte| byte.is_ascii_digit())
        && bytes[17..19].iter().all(|byte| byte.is_ascii_digit())
}
