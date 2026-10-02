use arcanum_runtime::continuity_receipt::*;
use p256::ecdsa::{signature::Signer, Signature, SigningKey};
use rand_core::OsRng;
use std::fs;
use std::path::Path;

fn hex(name: &str, field: &str) -> Vec<u8> {
    let path = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../docs/specs/runtime/fixtures/a16-v1")
        .join(format!("{name}.{field}.hex"));
    let text = fs::read_to_string(path).unwrap();
    let text = text.trim();
    (0..text.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&text[i..i + 2], 16).unwrap())
        .collect()
}
fn fixture(name: &str) -> SignedContinuityReceipt {
    SignedContinuityReceipt::decode(&hex(name, "wrapper")).unwrap()
}
fn minimal() -> ContinuityReceipt {
    ContinuityReceipt::decode(&hex("recording-minimal", "message")).unwrap()
}
fn signed(value: &ContinuityReceipt, key: &SigningKey) -> SignedContinuityReceipt {
    let mut value = value.clone();
    let public_key: [u8; 65] = key
        .verifying_key()
        .to_encoded_point(false)
        .as_bytes()
        .try_into()
        .unwrap();
    value.credential_fingerprint = credential_fingerprint(&public_key);
    let message = value.encode().unwrap();
    let signature: Signature = key.sign(&message);
    SignedContinuityReceipt {
        message,
        public_key,
        signature_der: signature.to_der().as_bytes().to_vec(),
    }
}

#[test]
fn independent_python_vectors_round_trip_and_verify() {
    for name in ["recording-minimal", "recording-rich", "human-adoption"] {
        let wrapper = fixture(name);
        assert_eq!(wrapper.message, hex(name, "message"));
        assert_eq!(wrapper.public_key.as_slice(), hex(name, "public-key"));
        assert_eq!(wrapper.signature_der, hex(name, "signature"));
        assert_eq!(wrapper.encode().unwrap(), hex(name, "wrapper"));
        assert_eq!(
            ContinuityReceipt::decode(&wrapper.message)
                .unwrap()
                .encode()
                .unwrap(),
            wrapper.message
        );
        let result = wrapper.verify(Some(&hex(name, "object")), None).unwrap();
        assert!(result.signature_valid);
        assert!(result.public_key_fingerprint_matches);
        assert_eq!(result.object_digest_matches, Some(true));
        assert_eq!(result.credential_continuity_matches, None);
        assert_eq!(result.authority_effect, "none");
    }
    let rich = fixture("recording-rich")
        .verify(None, None)
        .unwrap()
        .receipt;
    assert_eq!(rich.occurred_at_ms, Some(i64::MIN));
    assert_eq!(rich.observed_at_ms, Some(i64::MAX));
    assert_eq!(rich.recorded_at_ms, -24);
    assert_eq!(rich.runtime_version, "runtime-é-e\u{301}");
    let adopted = fixture("human-adoption")
        .verify(None, None)
        .unwrap()
        .receipt;
    assert_eq!(adopted.original_producer.unwrap().kind, "assistant");
    assert_eq!(adopted.occurred_at_ms, Some(123));
    assert_eq!(adopted.adopted_at_ms, Some(788));
}

#[test]
fn signed_fields_are_all_bound_and_wrong_object_is_separate() {
    let wrapper = fixture("recording-rich");
    for i in 0..wrapper.message.len() {
        let mut altered = wrapper.clone();
        altered.message[i] ^= 1;
        if let Ok(report) = altered.verify(None, None) {
            assert!(!report.signature_valid, "altered byte {i} verified");
        }
    }
    let report = wrapper.verify(Some(b"changed object"), None).unwrap();
    assert!(report.signature_valid);
    assert_eq!(report.object_digest_matches, Some(false));
    assert_eq!(
        wrapper.verify(None, None).unwrap().object_digest_matches,
        None
    );
}

#[test]
fn wrong_key_fingerprint_and_continuity_are_separate_facts() {
    let wrapper = fixture("recording-minimal");
    let receipt = minimal();
    let expected = (
        &receipt.credential_fingerprint,
        &receipt.credential_generation,
    );
    assert_eq!(
        wrapper
            .verify(None, Some(expected))
            .unwrap()
            .credential_continuity_matches,
        Some(true)
    );
    assert_eq!(
        wrapper
            .verify(None, Some((&receipt.credential_fingerprint, &[99; 16])))
            .unwrap()
            .credential_continuity_matches,
        Some(false)
    );
    let key = SigningKey::random(&mut OsRng);
    let mut changed = wrapper.clone();
    changed.public_key = key
        .verifying_key()
        .to_encoded_point(false)
        .as_bytes()
        .try_into()
        .unwrap();
    let report = changed.verify(None, Some(expected)).unwrap();
    assert!(!report.signature_valid);
    assert!(!report.public_key_fingerprint_matches);
    assert_eq!(report.credential_continuity_matches, Some(false));
    // Even a signature by the supplied key does not repair a false claimed fingerprint.
    let signature: Signature = key.sign(&changed.message);
    changed.signature_der = signature.to_der().as_bytes().to_vec();
    let report = changed.verify(None, None).unwrap();
    assert!(report.signature_valid);
    assert!(!report.public_key_fingerprint_matches);
}

#[test]
fn both_s_forms_are_valid_but_signature_bytes_are_not_identity() {
    let wrapper = fixture("recording-minimal");
    let signature = Signature::from_der(&wrapper.signature_der).unwrap();
    let low = signature.normalize_s().unwrap_or(signature);
    let (r, s) = low.split_scalars();
    let high = Signature::from_scalars(r.to_bytes(), (-s).to_bytes()).unwrap();
    for signature in [low, high] {
        let changed = SignedContinuityReceipt {
            signature_der: signature.to_der().as_bytes().to_vec(),
            ..wrapper.clone()
        };
        assert!(changed.verify(None, None).unwrap().signature_valid);
    }
}

#[test]
fn signing_complete_message_hashes_once_and_binds_generation() {
    let key = SigningKey::random(&mut OsRng);
    let value = minimal();
    let wrapper = signed(&value, &key);
    assert!(wrapper.verify(None, None).unwrap().signature_valid);
    let digest_signature: Signature = key.sign(&sha256(&wrapper.message));
    let changed = SignedContinuityReceipt {
        signature_der: digest_signature.to_der().as_bytes().to_vec(),
        ..wrapper.clone()
    };
    assert!(!changed.verify(None, None).unwrap().signature_valid);
    let mut value = ContinuityReceipt::decode(&wrapper.message).unwrap();
    value.credential_generation[0] ^= 1;
    let changed = SignedContinuityReceipt {
        message: value.encode().unwrap(),
        ..wrapper
    };
    assert!(!changed.verify(None, None).unwrap().signature_valid);
}

#[test]
fn legacy_unsigned_receipts_and_unknown_provenance_remain_truthful() {
    let value = minimal();
    assert_eq!(value.original_producer, None);
    assert_eq!(value.occurred_at_ms, None);
    assert_eq!(value.observed_at_ms, None);
    assert_eq!(value.adopted_at_ms, None);
    assert!(value.sources.is_empty());
    // The new wire API neither invokes nor changes the CP4 signing API.
    assert_eq!(
        arcanum_runtime::receipt::LOCAL_RECEIPT_SCHEMA_VERSION,
        "0.1.0"
    );
    assert_eq!(arcanum_runtime::receipt::LOCAL_RECEIPT_SCOPE, "local");
}

#[test]
fn adoption_requires_its_actual_time_and_explicit_evidence_reference() {
    let mut value = minimal();
    value.adopted_at_ms = Some(1);
    assert!(value.encode().is_err());
    value.receipt_type = ReceiptType::HumanAdoption;
    assert!(value.encode().is_err());
    value.sources.push(SourceReference {
        kind: "human-adoption-evidence".into(),
        locator: "fixture:confirmation".into(),
        revision: None,
        digest: None,
    });
    assert!(value.encode().is_ok());
    value.adopted_at_ms = None;
    assert!(value.encode().is_err());
}

#[test]
fn text_and_source_bounds_are_enforced_before_encoding() {
    let mut value = minimal();
    value.operation_id = "x".repeat(129);
    assert!(value.encode().is_err());
    value.operation_id = "x".repeat(128);
    value.runtime_version = "é".repeat(1024);
    assert!(value.encode().is_ok());
    value.runtime_version.push('x');
    assert!(value.encode().is_err());
    value.runtime_version = "v1".into();
    value.object_id.clear();
    assert!(value.encode().is_err());
    value.object_id = "object".into();
    let source = SourceReference {
        kind: "fixture".into(),
        locator: "fixture:one".into(),
        revision: None,
        digest: None,
    };
    value.sources = vec![source.clone(); 2];
    assert!(value.encode().is_err());
    value.sources = (0..17)
        .map(|i| SourceReference {
            locator: format!("fixture:{i}"),
            ..source.clone()
        })
        .collect();
    assert!(value.encode().is_err());
    value.sources.pop();
    assert!(value.encode().is_ok());
    // Legal per-field limits can still exceed the complete-message cap.
    for source in &mut value.sources {
        source.kind = "k".repeat(2048);
        source.locator = "l".repeat(2048);
    }
    assert!(value.encode().is_err());
}

#[test]
fn sources_sort_unsigned_encoded_bytes_and_duplicate_or_unsorted_wire_is_rejected() {
    let mut value = minimal();
    value.sources = vec![
        SourceReference {
            kind: "aa".into(),
            locator: "fixture:z".into(),
            revision: None,
            digest: None,
        },
        SourceReference {
            kind: "z".into(),
            locator: "fixture:a".into(),
            revision: None,
            digest: None,
        },
    ];
    let encoded = value.encode().unwrap();
    value.sources.reverse();
    assert_eq!(value.encode().unwrap(), encoded);
    let decoded = ContinuityReceipt::decode(&encoded).unwrap();
    assert_eq!(decoded.sources[0].kind, "z");
    let mut one = minimal();
    one.sources = vec![decoded.sources[0].clone()];
    let mut two = minimal();
    two.sources = vec![decoded.sources[1].clone()];
    let a = one.encode().unwrap();
    let b = two.encode().unwrap();
    // Locate each source sequence via the schema's known kind/locator encoding.
    let source_a = [b"\x84\x61z\x69fixture:a".as_slice(), &[0xf6, 0xf6]].concat();
    let source_b = [b"\x84\x62aa\x69fixture:z".as_slice(), &[0xf6, 0xf6]].concat();
    assert!(a.windows(source_a.len()).any(|w| w == source_a));
    assert!(b.windows(source_b.len()).any(|w| w == source_b));
    let start = encoded
        .windows(source_a.len())
        .position(|w| w == source_a)
        .unwrap();
    let end = start + source_a.len() + source_b.len();
    let mut unsorted = encoded.clone();
    unsorted.splice(start..end, [source_b, source_a].concat());
    assert!(ContinuityReceipt::decode(&unsorted).is_err());
}

#[test]
fn malformed_cbor_truncation_nonminimal_lengths_and_trailing_data_fail_closed() {
    let bytes = hex("recording-minimal", "message");
    for end in 0..bytes.len() {
        assert!(
            ContinuityReceipt::decode(&bytes[..end]).is_err(),
            "truncation {end}"
        );
    }
    let mut appended = bytes.clone();
    appended.push(0);
    assert!(ContinuityReceipt::decode(&appended).is_err());
    for prefix in [
        vec![0x98, 20],
        vec![0x9f],
        vec![0xa0],
        vec![0xd8, 0],
        vec![0xf9, 0, 0],
    ] {
        let mut bad = prefix;
        bad.extend(&bytes[1..]);
        assert!(ContinuityReceipt::decode(&bad).is_err());
    }
    let mut utf8 = bytes.clone();
    utf8[3] = 0xff;
    assert!(ContinuityReceipt::decode(&utf8).is_err());
    let mut extra_field = bytes.clone();
    extra_field[0] = 0x95;
    extra_field.push(0xf6);
    assert!(ContinuityReceipt::decode(&extra_field).is_err());
    assert!(ContinuityReceipt::decode(&vec![0; MAX_MESSAGE_BYTES + 1]).is_err());
    assert!(SignedContinuityReceipt::decode(&vec![0; MAX_WRAPPER_BYTES + 1]).is_err());
    let wrapper = hex("recording-minimal", "wrapper");
    for end in 0..wrapper.len() {
        assert!(SignedContinuityReceipt::decode(&wrapper[..end]).is_err());
    }
}

#[test]
fn unsupported_domain_version_scope_algorithms_and_integer_overflow_are_rejected() {
    let bytes = hex("recording-minimal", "message");
    for (needle, replacement) in [
        (
            "org.arcanum.continuity.receipt",
            "org.arcanum.continuity.invalid",
        ),
        ("local-only", "chain-only"),
        ("sha256", "sha512"),
        ("ecdsa-p256-sha256-der", "ecdsa-p384-sha256-der"),
    ] {
        let position = bytes
            .windows(needle.len())
            .position(|w| w == needle.as_bytes())
            .unwrap();
        let mut bad = bytes.clone();
        bad.splice(position..position + needle.len(), replacement.bytes());
        assert!(ContinuityReceipt::decode(&bad).is_err());
    }
    let version_position = 3 + DOMAIN.len();
    assert_eq!(bytes[version_position], 1);
    let mut bad = bytes.clone();
    bad[version_position] = 2;
    assert!(ContinuityReceipt::decode(&bad).is_err());
    let mut bad = bytes.clone();
    bad.splice(version_position..=version_position, [0x18, 1]);
    assert!(ContinuityReceipt::decode(&bad).is_err());
    // Last fields of the minimal fixture are recorded time 0, null, null, runtime.
    let marker = [0xf6, 0xf6, 0, 0xf6, 0xf6];
    let at = bytes
        .windows(marker.len())
        .position(|w| w == marker)
        .unwrap()
        + 2;
    let mut bad = bytes.clone();
    bad.splice(at..=at, [0x1b, 0x80, 0, 0, 0, 0, 0, 0, 0]);
    assert!(ContinuityReceipt::decode(&bad).is_err());
}

#[test]
fn invalid_points_and_strict_der_errors_are_rejected() {
    let wrapper = fixture("recording-minimal");
    for public_key in [[0; 65], [4; 65]] {
        assert!(SignedContinuityReceipt {
            public_key,
            ..wrapper.clone()
        }
        .verify(None, None)
        .is_err());
    }
    for signature_der in [
        vec![],
        vec![0; 73],
        vec![0x30, 6, 2, 1, 0, 2, 1, 1],
        vec![0x30, 6, 2, 1, 0x80, 2, 1, 1],
        vec![0x30, 7, 2, 2, 0, 1, 2, 1, 1],
        vec![0x30, 0x81, 6, 2, 1, 1, 2, 1, 1],
        [wrapper.signature_der.clone(), vec![0]].concat(),
    ] {
        assert!(SignedContinuityReceipt {
            signature_der,
            ..wrapper.clone()
        }
        .verify(None, None)
        .is_err());
    }
}

#[test]
fn bounded_decoder_handles_adversarial_lengths_and_arbitrary_bytes_without_panics() {
    let wrapper = hex("recording-minimal", "wrapper");
    let mut huge = vec![0x83, 0x5b];
    huge.extend(u64::MAX.to_be_bytes());
    huge.extend(&wrapper[4..]);
    assert!(SignedContinuityReceipt::decode(&huge).is_err());
    let mut appended = wrapper.clone();
    appended.push(0);
    assert!(SignedContinuityReceipt::decode(&appended).is_err());
    let mut wide_array = vec![0x98, 3];
    wide_array.extend(&wrapper[1..]);
    assert!(SignedContinuityReceipt::decode(&wide_array).is_err());
    let mut state = 0x52d2e02b_u64;
    for length in 0..1024 {
        let bytes: Vec<u8> = (0..length)
            .map(|_| {
                state = state.wrapping_mul(6364136223846793005).wrapping_add(1);
                (state >> 32) as u8
            })
            .collect();
        assert!(ContinuityReceipt::decode(&bytes).is_err());
        assert!(SignedContinuityReceipt::decode(&bytes).is_err());
    }
}
