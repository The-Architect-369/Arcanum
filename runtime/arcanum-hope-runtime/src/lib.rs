#![forbid(unsafe_code)]

use std::fmt;

pub const HOPE_NAMESPACE: &str = "hope";
pub const HOPE_RECORD_VERSION: &str = "hope.reflection.v0.1";
pub const HOPE_STORAGE_RELATIVE_PATH: &str = "hope/reflections.v0.1.enc";
pub const HOPE_VISIBILITY: &str = "local_private";
pub const HOPE_AUTHORITY: &str = "advisory_only";
pub const HOPE_RECEIPT_STATUS: &str = "local_only";
pub const HOPE_RECEIPT_SCOPE: &str = "local";
pub const AUTHORITY_EFFECT: &str = "none";
pub const TEMPUS_SOURCE_SYSTEM_CLOCK: &str = "system-clock";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct HopeTempusProvenance<'a> {
    pub anchor_id: &'a str,
    pub captured_at: &'a str,
    pub source_kind: &'a str,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct HopeReflectionInput<'a> {
    pub id: &'a str,
    pub created_at: &'a str,
    pub prompt: Option<&'a str>,
    pub user_text: &'a str,
    pub hope_text: Option<&'a str>,
    pub tempus: Option<HopeTempusProvenance<'a>>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum HopeRecordError {
    Blank(&'static str),
    InvalidTempusSource,
}

impl fmt::Display for HopeRecordError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Blank(field) => write!(formatter, "Hope record field must not be blank: {field}"),
            Self::InvalidTempusSource => write!(
                formatter,
                "Hope Tempus provenance must use factual system-clock source",
            ),
        }
    }
}

impl std::error::Error for HopeRecordError {}

pub fn contract_json() -> String {
    format!(
        "{{\"namespace\":{},\"recordVersion\":{},\"storageRelativePath\":{},\"visibility\":{},\"authority\":{},\"interpretation\":null,\"receiptScope\":{},\"signingRequired\":false,\"authorityEffect\":{},\"networkRequired\":false}}",
        json_string(HOPE_NAMESPACE),
        json_string(HOPE_RECORD_VERSION),
        json_string(HOPE_STORAGE_RELATIVE_PATH),
        json_string(HOPE_VISIBILITY),
        json_string(HOPE_AUTHORITY),
        json_string(HOPE_RECEIPT_SCOPE),
        json_string(AUTHORITY_EFFECT),
    )
}

pub fn canonical_reflection(
    input: HopeReflectionInput<'_>,
) -> Result<String, HopeRecordError> {
    require_nonblank(input.id, "id")?;
    require_nonblank(input.created_at, "createdAt")?;
    require_nonblank(input.user_text, "userText")?;
    validate_optional(input.prompt, "prompt")?;
    validate_optional(input.hope_text, "hopeText")?;

    if let Some(tempus) = input.tempus {
        require_nonblank(tempus.anchor_id, "tempus.anchorId")?;
        require_nonblank(tempus.captured_at, "tempus.capturedAt")?;
        require_nonblank(tempus.source_kind, "tempus.sourceKind")?;
        if tempus.source_kind != TEMPUS_SOURCE_SYSTEM_CLOCK {
            return Err(HopeRecordError::InvalidTempusSource);
        }
    }

    let mut output = String::new();
    output.push_str("{\"version\":");
    output.push_str(&json_string(HOPE_RECORD_VERSION));
    output.push_str(",\"id\":");
    output.push_str(&json_string(input.id));
    output.push_str(",\"createdAt\":");
    output.push_str(&json_string(input.created_at));
    output.push_str(",\"mode\":\"reflection\"");
    if let Some(prompt) = input.prompt {
        output.push_str(",\"prompt\":");
        output.push_str(&json_string(prompt));
    }
    output.push_str(",\"userText\":");
    output.push_str(&json_string(input.user_text));
    if let Some(hope_text) = input.hope_text {
        output.push_str(",\"hopeText\":");
        output.push_str(&json_string(hope_text));
    }
    if let Some(tempus) = input.tempus {
        output.push_str(",\"context\":{\"tempus\":{\"anchorId\":");
        output.push_str(&json_string(tempus.anchor_id));
        output.push_str(",\"capturedAt\":");
        output.push_str(&json_string(tempus.captured_at));
        output.push_str(",\"sourceKind\":");
        output.push_str(&json_string(tempus.source_kind));
        output.push_str(",\"interpretation\":null,\"authorityEffect\":\"none\"}}");
    }
    output.push_str(",\"visibility\":");
    output.push_str(&json_string(HOPE_VISIBILITY));
    output.push_str(",\"receiptStatus\":");
    output.push_str(&json_string(HOPE_RECEIPT_STATUS));
    output.push_str(",\"authority\":");
    output.push_str(&json_string(HOPE_AUTHORITY));
    output.push_str(",\"interpretation\":null}");
    Ok(output)
}

fn require_nonblank(value: &str, field: &'static str) -> Result<(), HopeRecordError> {
    if value.trim().is_empty() {
        return Err(HopeRecordError::Blank(field));
    }
    Ok(())
}

fn validate_optional(value: Option<&str>, field: &'static str) -> Result<(), HopeRecordError> {
    if let Some(value) = value {
        require_nonblank(value, field)?;
    }
    Ok(())
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
            control if control <= '\u{1f}' => {
                output.push_str(&format!("\\u{:04x}", control as u32));
            }
            other => output.push(other),
        }
    }
    output.push('"');
    output
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn contract_is_local_private_and_unsigned() {
        let contract = contract_json();
        assert!(contract.contains("\"namespace\":\"hope\""));
        assert!(contract.contains("\"recordVersion\":\"hope.reflection.v0.1\""));
        assert!(contract.contains("\"storageRelativePath\":\"hope/reflections.v0.1.enc\""));
        assert!(contract.contains("\"signingRequired\":false"));
        assert!(contract.contains("\"networkRequired\":false"));
    }

    #[test]
    fn reflection_is_closed_local_private_and_advisory() {
        let record = canonical_reflection(HopeReflectionInput {
            id: "hope:test-1",
            created_at: "2026-09-06T11:00:00Z",
            prompt: Some("What is present?"),
            user_text: "A quiet beginning.",
            hope_text: Some("Your reflection is held locally."),
            tempus: Some(HopeTempusProvenance {
                anchor_id: "ce-w02-tempus-1",
                captured_at: "2026-09-06T11:00:00Z",
                source_kind: "system-clock",
            }),
        })
        .expect("valid reflection");

        assert!(record.contains("\"version\":\"hope.reflection.v0.1\""));
        assert!(record.contains("\"visibility\":\"local_private\""));
        assert!(record.contains("\"receiptStatus\":\"local_only\""));
        assert!(record.contains("\"authority\":\"advisory_only\""));
        assert!(record.contains("\"interpretation\":null"));
        assert!(record.contains("\"sourceKind\":\"system-clock\""));
        assert!(!record.contains("vitae"));
        assert!(!record.contains("consented_export"));
    }

    #[test]
    fn invalid_or_interpreted_tempus_sources_are_rejected() {
        let error = canonical_reflection(HopeReflectionInput {
            id: "hope:test-2",
            created_at: "2026-09-06T11:00:00Z",
            prompt: None,
            user_text: "Text",
            hope_text: None,
            tempus: Some(HopeTempusProvenance {
                anchor_id: "anchor",
                captured_at: "2026-09-06T11:00:00Z",
                source_kind: "ephemeris",
            }),
        })
        .expect_err("non-clock source must fail");
        assert_eq!(error, HopeRecordError::InvalidTempusSource);
    }

    #[test]
    fn private_text_is_json_escaped_deterministically() {
        let record = canonical_reflection(HopeReflectionInput {
            id: "hope:test-3",
            created_at: "2026-09-06T11:00:00Z",
            prompt: None,
            user_text: "line one\n\"line two\"",
            hope_text: None,
            tempus: None,
        })
        .expect("valid reflection");
        assert!(record.contains("line one\\n\\\"line two\\\""));
    }
}
