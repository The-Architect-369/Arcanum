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

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TempusSourceKind {
    SystemClock,
    MonotonicClock,
    Ephemeris,
    ManualFactualEntry,
}

impl TempusSourceKind {
    pub const fn as_schema_value(self) -> &'static str {
        match self {
            Self::SystemClock => "system-clock",
            Self::MonotonicClock => "monotonic-clock",
            Self::Ephemeris => "ephemeris",
            Self::ManualFactualEntry => "manual-factual-entry",
        }
    }

    pub const fn is_clock(self) -> bool {
        matches!(self, Self::SystemClock | Self::MonotonicClock)
    }
}

impl From<ClockSourceKind> for TempusSourceKind {
    fn from(value: ClockSourceKind) -> Self {
        match value {
            ClockSourceKind::SystemClock => Self::SystemClock,
            ClockSourceKind::MonotonicClock => Self::MonotonicClock,
        }
    }
}

impl PartialEq<ClockSourceKind> for TempusSourceKind {
    fn eq(&self, other: &ClockSourceKind) -> bool {
        *self == Self::from(*other)
    }
}

impl PartialEq<TempusSourceKind> for ClockSourceKind {
    fn eq(&self, other: &TempusSourceKind) -> bool {
        TempusSourceKind::from(*self) == *other
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
    pub kind: TempusSourceKind,
    pub provider: Option<String>,
    pub model: Option<String>,
    pub version: Option<String>,
    pub source_id: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TempusObserverKind {
    BodyCenter,
    TopocentricSite,
    BodyFixedSite,
    OtherRegistered,
}

impl TempusObserverKind {
    pub const fn as_schema_value(self) -> &'static str {
        match self {
            Self::BodyCenter => "body-center",
            Self::TopocentricSite => "topocentric-site",
            Self::BodyFixedSite => "body-fixed-site",
            Self::OtherRegistered => "other-registered",
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct TempusObserver {
    pub kind: TempusObserverKind,
    pub body: Option<String>,
    pub site: Option<String>,
    pub latitude_deg: Option<f64>,
    pub longitude_deg: Option<f64>,
    pub altitude_m: Option<f64>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TempusFrame {
    pub family: String,
    pub center: Option<String>,
    pub axes: Option<String>,
    pub reference_plane: Option<String>,
    pub epoch_rule: String,
}

#[derive(Debug, Clone, PartialEq)]
pub enum TempusProviderField {
    String(String),
    Number(f64),
    Boolean(bool),
    Null,
}

#[derive(Debug, Clone, PartialEq)]
pub struct TempusObservation {
    pub kind: &'static str,
    pub target: Option<String>,
    pub coordinate_type: Option<String>,
    pub longitude_deg: Option<f64>,
    pub latitude_deg: Option<f64>,
    pub distance: Option<f64>,
    pub distance_unit: Option<String>,
    pub additional_provider_fields: BTreeMap<String, TempusProviderField>,
}

/// Backward-compatible type name retained for CP4-A/CP4-B callers.
pub type ClockObservation = TempusObservation;

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

/// Provider-returned astronomical sample.
///
/// CP4-C intentionally does not choose an astronomical backend. Implementations
/// of `EphemerisProvider` may later be local/offline or network-backed, but they
/// must return this explicit provenance shape and fail visibly when unavailable.
#[derive(Debug, Clone, PartialEq)]
pub struct EphemerisSample {
    pub captured_at: String,
    pub time_scale: String,
    pub provider: Option<String>,
    pub model: Option<String>,
    pub version: Option<String>,
    pub source_id: Option<String>,
    pub observer: Option<TempusObserver>,
    pub frame: Option<TempusFrame>,
    pub target: Option<String>,
    pub coordinate_type: Option<String>,
    pub longitude_deg: Option<f64>,
    pub latitude_deg: Option<f64>,
    pub distance: Option<f64>,
    pub distance_unit: Option<String>,
    pub additional_provider_fields: BTreeMap<String, TempusProviderField>,
    pub precision: TempusPrecision,
    pub provenance: TempusProvenance,
}

pub trait EphemerisProvider {
    type Error;

    fn sample(&self) -> Result<EphemerisSample, Self::Error>;
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum EphemerisValidationError {
    MissingField(&'static str),
    InvalidField(&'static str),
}

impl fmt::Display for EphemerisValidationError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::MissingField(field) => write!(formatter, "ephemeris sample is missing {field}"),
            Self::InvalidField(field) => write!(formatter, "ephemeris sample has invalid {field}"),
        }
    }
}

impl std::error::Error for EphemerisValidationError {}

#[derive(Debug)]
pub enum EphemerisCaptureError<E> {
    Provider(E),
    InvalidSample(EphemerisValidationError),
}

impl<E: fmt::Display> fmt::Display for EphemerisCaptureError<E> {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Provider(error) => write!(formatter, "ephemeris provider failed: {error}"),
            Self::InvalidSample(error) => fmt::Display::fmt(error, formatter),
        }
    }
}

impl<E> std::error::Error for EphemerisCaptureError<E>
where
    E: std::error::Error + 'static,
{
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Provider(error) => Some(error),
            Self::InvalidSample(error) => Some(error),
        }
    }
}

/// Runtime-domain projection of the certified `TempusAnchor` v0.1.0 contract.
///
/// CP4-C generalizes observer/frame/source/observation types for optional
/// ephemeris capture while preserving the existing offline clock path.
/// `interpretation` remains deliberately uninhabited and no field grants
/// capability, signing, witness submission, or protocol authority.
#[derive(Debug, Clone, PartialEq)]
pub struct TempusAnchor {
    pub anchor_id: String,
    pub schema_version: &'static str,
    pub captured_at: String,
    pub time_scale: String,
    pub source: TempusSource,
    pub observer: Option<TempusObserver>,
    pub frame: Option<TempusFrame>,
    pub observation: TempusObservation,
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
        additional_provider_fields.insert(
            "monotonicCorrelation".to_owned(),
            TempusProviderField::String(correlation),
        );
    }

    TempusAnchor {
        anchor_id: anchor_id.into(),
        schema_version: TEMPUS_ANCHOR_SCHEMA_VERSION,
        captured_at,
        time_scale: TEMPUS_TIME_SCALE_UTC.to_owned(),
        source: TempusSource {
            kind: source_kind.into(),
            provider,
            model,
            version,
            source_id,
        },
        observer: None,
        frame: None,
        observation: TempusObservation {
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

pub fn capture_ephemeris_anchor<P: EphemerisProvider>(
    provider: &P,
    anchor_id: impl Into<String>,
    runtime_version: impl Into<String>,
) -> Result<TempusAnchor, EphemerisCaptureError<P::Error>> {
    let sample = provider.sample().map_err(EphemerisCaptureError::Provider)?;
    ephemeris_anchor_from_sample(anchor_id, runtime_version, sample)
        .map_err(EphemerisCaptureError::InvalidSample)
}

/// Pure mapping from an ephemeris sample into the astronomical subset of the
/// certified TempusAnchor contract. The provider owns astronomical computation;
/// this runtime validates provenance and preserves the supplied factual values.
pub fn ephemeris_anchor_from_sample(
    anchor_id: impl Into<String>,
    runtime_version: impl Into<String>,
    sample: EphemerisSample,
) -> Result<TempusAnchor, EphemerisValidationError> {
    validate_ephemeris_sample(&sample)?;

    let EphemerisSample {
        captured_at,
        time_scale,
        provider,
        model,
        version,
        source_id,
        observer,
        frame,
        target,
        coordinate_type,
        longitude_deg,
        latitude_deg,
        distance,
        distance_unit,
        additional_provider_fields,
        precision,
        mut provenance,
    } = sample;

    if provenance.software_version.is_none() {
        provenance.software_version = Some(runtime_version.into());
    }

    Ok(TempusAnchor {
        anchor_id: anchor_id.into(),
        schema_version: TEMPUS_ANCHOR_SCHEMA_VERSION,
        captured_at,
        time_scale,
        source: TempusSource {
            kind: TempusSourceKind::Ephemeris,
            provider,
            model,
            version,
            source_id,
        },
        observer,
        frame,
        observation: TempusObservation {
            kind: "astronomical-coordinate",
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

fn validate_ephemeris_sample(sample: &EphemerisSample) -> Result<(), EphemerisValidationError> {
    require_non_empty(&sample.captured_at, "capturedAt")?;
    require_non_empty(&sample.time_scale, "timeScale")?;
    require_optional_non_empty(&sample.provider, "source.provider")?;
    require_optional_non_empty(&sample.model, "source.model")?;
    require_optional_non_empty(&sample.version, "source.version")?;
    require_optional_non_empty(&sample.target, "observation.target")?;
    require_optional_non_empty(&sample.coordinate_type, "observation.coordinateType")?;

    let observer = sample
        .observer
        .as_ref()
        .ok_or(EphemerisValidationError::MissingField("observer"))?;
    validate_observer(observer)?;

    let frame = sample
        .frame
        .as_ref()
        .ok_or(EphemerisValidationError::MissingField("frame"))?;
    validate_frame(frame)?;

    if sample.longitude_deg.is_none()
        && sample.latitude_deg.is_none()
        && sample.distance.is_none()
    {
        return Err(EphemerisValidationError::MissingField(
            "astronomical coordinates",
        ));
    }

    if let Some(longitude) = sample.longitude_deg {
        if !longitude.is_finite() || !(0.0..360.0).contains(&longitude) {
            return Err(EphemerisValidationError::InvalidField(
                "observation.longitudeDeg",
            ));
        }
    }
    if let Some(latitude) = sample.latitude_deg {
        if !latitude.is_finite() || !(-90.0..=90.0).contains(&latitude) {
            return Err(EphemerisValidationError::InvalidField(
                "observation.latitudeDeg",
            ));
        }
    }
    if let Some(distance) = sample.distance {
        if !distance.is_finite() || distance < 0.0 {
            return Err(EphemerisValidationError::InvalidField(
                "observation.distance",
            ));
        }
    }
    if sample.distance.is_some() {
        require_optional_non_empty(&sample.distance_unit, "observation.distanceUnit")?;
    }

    require_optional_non_empty(&sample.precision.time_resolution, "precision.timeResolution")?;
    require_optional_non_empty(
        &sample.precision.coordinate_resolution,
        "precision.coordinateResolution",
    )?;
    require_optional_non_empty(&sample.precision.uncertainty, "precision.uncertainty")?;
    require_optional_non_empty(&sample.provenance.backend, "provenance.backend")?;

    Ok(())
}

fn validate_observer(observer: &TempusObserver) -> Result<(), EphemerisValidationError> {
    require_optional_non_empty(&observer.body, "observer.body")?;

    for (value, field) in [
        (observer.latitude_deg, "observer.latitudeDeg"),
        (observer.longitude_deg, "observer.longitudeDeg"),
        (observer.altitude_m, "observer.altitudeM"),
    ] {
        if let Some(value) = value {
            if !value.is_finite() {
                return Err(EphemerisValidationError::InvalidField(field));
            }
        }
    }

    if let Some(latitude) = observer.latitude_deg {
        if !(-90.0..=90.0).contains(&latitude) {
            return Err(EphemerisValidationError::InvalidField(
                "observer.latitudeDeg",
            ));
        }
    }
    if let Some(longitude) = observer.longitude_deg {
        if !(-180.0..=180.0).contains(&longitude) {
            return Err(EphemerisValidationError::InvalidField(
                "observer.longitudeDeg",
            ));
        }
    }

    match observer.kind {
        TempusObserverKind::BodyCenter => {
            if observer.site.is_some()
                || observer.latitude_deg.is_some()
                || observer.longitude_deg.is_some()
                || observer.altitude_m.is_some()
            {
                return Err(EphemerisValidationError::InvalidField(
                    "body-center observer location",
                ));
            }
        }
        TempusObserverKind::TopocentricSite | TempusObserverKind::BodyFixedSite => {
            if observer.latitude_deg.is_none() || observer.longitude_deg.is_none() {
                return Err(EphemerisValidationError::MissingField(
                    "explicit site latitude/longitude",
                ));
            }
        }
        TempusObserverKind::OtherRegistered => {}
    }

    Ok(())
}

fn validate_frame(frame: &TempusFrame) -> Result<(), EphemerisValidationError> {
    require_non_empty(&frame.family, "frame.family")?;
    require_optional_non_empty(&frame.center, "frame.center")?;
    require_optional_non_empty(&frame.axes, "frame.axes")?;
    require_optional_non_empty(&frame.reference_plane, "frame.referencePlane")?;
    require_non_empty(&frame.epoch_rule, "frame.epochRule")
}

fn require_non_empty(value: &str, field: &'static str) -> Result<(), EphemerisValidationError> {
    if value.trim().is_empty() {
        Err(EphemerisValidationError::MissingField(field))
    } else {
        Ok(())
    }
}

fn require_optional_non_empty(
    value: &Option<String>,
    field: &'static str,
) -> Result<(), EphemerisValidationError> {
    match value {
        Some(value) => require_non_empty(value, field),
        None => Err(EphemerisValidationError::MissingField(field)),
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
