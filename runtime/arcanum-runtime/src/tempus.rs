use std::collections::BTreeMap;
use std::fmt;
use std::time::{SystemTime, SystemTimeError, UNIX_EPOCH};

const SECONDS_PER_DAY: i64 = 86_400;

pub const TEMPUS_ANCHOR_SCHEMA_VERSION: &str = "0.1.0";
pub const TEMPUS_TIME_SCALE_UTC: &str = "UTC";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ClockSourceKind {
    SystemClock,
    MonotonicClock,
}

impl ClockSourceKind {
    pub const fn as_schema_value(self) -> &'static str {
        match self {
            Self::SystemClock => "system-clock",
            Self::MonotonicClock => "monotonic-clock",
        }
    }
}

/// Factual sample returned by a local clock provider.
///
/// `captured_at` is required to be a civil timestamp with an explicit UTC `Z`
/// or numeric offset. CP4-A's concrete system provider emits UTC at one-second
/// resolution and does not collect network or participant-location data.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ClockSample {
    pub captured_at: String,
    pub source_kind: ClockSourceKind,
    pub provider: Option<String>,
    pub model: Option<String>,
    pub version: Option<String>,
    pub source_id: Option<String>,
    pub time_resolution: Option<String>,
    pub uncertainty: Option<String>,
    pub monotonic_correlation: Option<String>,
}

pub trait ClockProvider {
    type Error;

    fn sample(&self) -> Result<ClockSample, Self::Error>;
}

#[derive(Debug, Clone, Copy, Default)]
pub struct SystemClockProvider;

#[derive(Debug)]
pub enum SystemClockError {
    BeforeUnixEpoch(SystemTimeError),
    TimestampOutOfRange(u64),
}

impl fmt::Display for SystemClockError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::BeforeUnixEpoch(_) => {
                formatter.write_str("system clock reported a time before the Unix epoch")
            }
            Self::TimestampOutOfRange(seconds) => {
                write!(
                    formatter,
                    "system clock timestamp is outside supported range: {seconds}"
                )
            }
        }
    }
}

impl std::error::Error for SystemClockError {}

impl ClockProvider for SystemClockProvider {
    type Error = SystemClockError;

    fn sample(&self) -> Result<ClockSample, Self::Error> {
        let elapsed = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(SystemClockError::BeforeUnixEpoch)?;
        let raw_seconds = elapsed.as_secs();
        let unix_seconds = i64::try_from(raw_seconds)
            .map_err(|_| SystemClockError::TimestampOutOfRange(raw_seconds))?;
        let captured_at = unix_seconds_to_rfc3339(unix_seconds)
            .ok_or(SystemClockError::TimestampOutOfRange(raw_seconds))?;

        Ok(ClockSample {
            captured_at,
            source_kind: ClockSourceKind::SystemClock,
            provider: Some("std::time::SystemTime".to_owned()),
            model: None,
            version: None,
            source_id: Some("host-system-clock".to_owned()),
            time_resolution: Some("1 s".to_owned()),
            uncertainty: None,
            monotonic_correlation: None,
        })
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TempusSource {
    pub kind: ClockSourceKind,
    pub provider: Option<String>,
    pub model: Option<String>,
    pub version: Option<String>,
    pub source_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct ClockObservation {
    pub kind: &'static str,
    pub target: Option<String>,
    pub coordinate_type: Option<String>,
    pub longitude_deg: Option<f64>,
    pub latitude_deg: Option<f64>,
    pub distance: Option<f64>,
    pub distance_unit: Option<String>,
    pub additional_provider_fields: BTreeMap<String, String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TempusPrecision {
    pub time_resolution: Option<String>,
    pub coordinate_resolution: Option<String>,
    pub uncertainty: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TempusProvenance {
    pub source_uri: Option<String>,
    pub request_digest: Option<String>,
    pub software_version: Option<String>,
    pub backend: Option<String>,
    pub fallback_mode: Option<String>,
    pub original_fields_retained: bool,
}

/// CP4-A clock-backed projection of the certified `TempusAnchor` v0.1.0 contract.
///
/// Observer, frame, and interpretation are intentionally uninhabited in this
/// tranche and therefore remain `None`. Astronomical, persistence, signing,
/// authority, and protocol-witness semantics remain outside CP4-A.
#[derive(Debug, Clone, PartialEq)]
pub struct TempusAnchor {
    pub anchor_id: String,
    pub schema_version: &'static str,
    pub captured_at: String,
    pub time_scale: &'static str,
    pub source: TempusSource,
    pub observer: Option<()>,
    pub frame: Option<()>,
    pub observation: ClockObservation,
    pub precision: TempusPrecision,
    pub provenance: TempusProvenance,
    pub interpretation: Option<()>,
}

pub fn capture_tempus_anchor<P: ClockProvider>(
    provider: &P,
    anchor_id: impl Into<String>,
    runtime_version: impl Into<String>,
) -> Result<TempusAnchor, P::Error> {
    let sample = provider.sample()?;
    Ok(tempus_anchor_from_sample(
        anchor_id,
        runtime_version,
        sample,
    ))
}

/// Pure mapping from a factual clock sample into the clock subset of the
/// certified TempusAnchor contract. Equal inputs produce equal anchors.
pub fn tempus_anchor_from_sample(
    anchor_id: impl Into<String>,
    runtime_version: impl Into<String>,
    sample: ClockSample,
) -> TempusAnchor {
    let ClockSample {
        captured_at,
        source_kind,
        provider,
        model,
        version,
        source_id,
        time_resolution,
        uncertainty,
        monotonic_correlation,
    } = sample;

    let backend = provider.clone();
    let mut additional_provider_fields = BTreeMap::new();
    if let Some(correlation) = monotonic_correlation {
        additional_provider_fields.insert("monotonicCorrelation".to_owned(), correlation);
    }

    TempusAnchor {
        anchor_id: anchor_id.into(),
        schema_version: TEMPUS_ANCHOR_SCHEMA_VERSION,
        captured_at,
        time_scale: TEMPUS_TIME_SCALE_UTC,
        source: TempusSource {
            kind: source_kind,
            provider,
            model,
            version,
            source_id,
        },
        observer: None,
        frame: None,
        observation: ClockObservation {
            kind: "clock",
            target: None,
            coordinate_type: None,
            longitude_deg: None,
            latitude_deg: None,
            distance: None,
            distance_unit: None,
            additional_provider_fields,
        },
        precision: TempusPrecision {
            time_resolution,
            coordinate_resolution: None,
            uncertainty,
            notes: None,
        },
        provenance: TempusProvenance {
            source_uri: None,
            request_digest: None,
            software_version: Some(runtime_version.into()),
            backend,
            fallback_mode: None,
            original_fields_retained: false,
        },
        interpretation: None,
    }
}

fn unix_seconds_to_rfc3339(unix_seconds: i64) -> Option<String> {
    let days_since_epoch = unix_seconds.div_euclid(SECONDS_PER_DAY);
    let seconds_within_day = unix_seconds.rem_euclid(SECONDS_PER_DAY);
    let (year, month, day) = civil_from_days(days_since_epoch);

    if !(0..=9_999).contains(&year) {
        return None;
    }

    let hour = seconds_within_day / 3_600;
    let minute = (seconds_within_day % 3_600) / 60;
    let second = seconds_within_day % 60;

    Some(format!(
        "{year:04}-{month:02}-{day:02}T{hour:02}:{minute:02}:{second:02}Z"
    ))
}

// Gregorian civil-date conversion from a signed day count relative to
// 1970-01-01. This arithmetic is deterministic and uses no locale, timezone,
// network, or platform calendar service.
fn civil_from_days(days_since_unix_epoch: i64) -> (i64, i64, i64) {
    let shifted_days = days_since_unix_epoch + 719_468;
    let era = if shifted_days >= 0 {
        shifted_days
    } else {
        shifted_days - 146_096
    } / 146_097;
    let day_of_era = shifted_days - era * 146_097;
    let year_of_era =
        (day_of_era - day_of_era / 1_460 + day_of_era / 36_524 - day_of_era / 146_096) / 365;
    let mut year = year_of_era + era * 400;
    let day_of_year = day_of_era - (365 * year_of_era + year_of_era / 4 - year_of_era / 100);
    let month_prime = (5 * day_of_year + 2) / 153;
    let day = day_of_year - (153 * month_prime + 2) / 5 + 1;
    let month = month_prime + if month_prime < 10 { 3 } else { -9 };
    if month <= 2 {
        year += 1;
    }

    (year, month, day)
}

#[cfg(test)]
mod tests {
    use super::unix_seconds_to_rfc3339;

    #[test]
    fn formats_known_utc_instants_without_external_services() {
        assert_eq!(
            unix_seconds_to_rfc3339(0).as_deref(),
            Some("1970-01-01T00:00:00Z")
        );
        assert_eq!(
            unix_seconds_to_rfc3339(951_827_696).as_deref(),
            Some("2000-02-29T12:34:56Z")
        );
        assert_eq!(
            unix_seconds_to_rfc3339(1_787_724_000).as_deref(),
            Some("2026-08-26T06:00:00Z")
        );
    }
}
