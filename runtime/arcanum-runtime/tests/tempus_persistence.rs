use std::fs;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};

use arcanum_runtime::persistence::{
    FileTempusAnchorStore, TempusAnchorStore, TempusPersistenceError,
};
use arcanum_runtime::tempus::{
    tempus_anchor_from_sample, ClockSample, ClockSourceKind, TempusAnchor,
};

static TEST_DIRECTORY_COUNTER: AtomicU64 = AtomicU64::new(0);

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

    fn path(&self) -> &Path {
        &self.path
    }
}

impl Drop for TestDirectory {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.path);
    }
}

fn fixed_anchor(anchor_id: &str) -> TempusAnchor {
    let sample = ClockSample {
        captured_at: "2026-09-03T08:00:00Z".to_owned(),
        source_kind: ClockSourceKind::SystemClock,
        provider: Some("fixture-system-clock".to_owned()),
        model: Some("fixture-model".to_owned()),
        version: Some("2".to_owned()),
        source_id: Some("fixture-source-001".to_owned()),
        time_resolution: Some("1 ms".to_owned()),
        uncertainty: Some("±1 ms".to_owned()),
        monotonic_correlation: Some("fixture-monotonic=424242".to_owned()),
    };
    let mut anchor = tempus_anchor_from_sample(anchor_id, "ce-w01-cp4-b", sample);
    anchor.precision.notes = Some("restart fixture".to_owned());
    anchor.provenance.source_uri = Some("local://fixture/system-clock".to_owned());
    anchor.provenance.request_digest = Some("fixture-request-digest-001".to_owned());
    anchor.provenance.fallback_mode = Some("offline".to_owned());
    anchor.provenance.original_fields_retained = true;
    anchor
}

#[test]
fn persisted_anchor_survives_store_reopen_without_provenance_mutation() {
    let directory = TestDirectory::new("tempus-restart");
    let original = fixed_anchor("tempus-restart-001");

    {
        let store = FileTempusAnchorStore::open(directory.path())
            .expect("initial Tempus store should open offline");
        store
            .persist(&original)
            .expect("Tempus anchor should persist durably");
    }

    let restarted =
        FileTempusAnchorStore::open(directory.path()).expect("restarted Tempus store should open");
    let restored = restarted
        .load(&original.anchor_id)
        .expect("persisted Tempus anchor should be recoverable after restart");

    assert_eq!(restored, original);
    assert_eq!(restored.captured_at, original.captured_at);
    assert_eq!(restored.source, original.source);
    assert_eq!(restored.precision, original.precision);
    assert_eq!(restored.provenance, original.provenance);
}

#[test]
fn existing_anchor_id_is_immutable_but_identical_replay_is_idempotent() {
    let directory = TestDirectory::new("tempus-immutable");
    let original = fixed_anchor("tempus-immutable-001");
    let store =
        FileTempusAnchorStore::open(directory.path()).expect("Tempus store should open offline");

    store
        .persist(&original)
        .expect("initial Tempus anchor should persist");
    store
        .persist(&original)
        .expect("identical persistence replay should be idempotent");

    let mut conflicting = original.clone();
    conflicting.captured_at = "2026-09-03T08:01:00Z".to_owned();
    let error = store
        .persist(&conflicting)
        .expect_err("conflicting durable content must not replace an existing anchor");

    assert!(matches!(error, TempusPersistenceError::IntegrityFailure(_)));
    assert_eq!(
        store
            .load(&original.anchor_id)
            .expect("original durable anchor should remain readable"),
        original
    );
}

#[test]
fn corrupted_durable_anchor_fails_closed_instead_of_becoming_empty_state() {
    let directory = TestDirectory::new("tempus-corruption");
    let original = fixed_anchor("tempus-corruption-001");
    let store =
        FileTempusAnchorStore::open(directory.path()).expect("Tempus store should open offline");
    store
        .persist(&original)
        .expect("Tempus anchor should persist before corruption test");

    let path = only_anchor_file(directory.path());
    let mut bytes = fs::read(&path).expect("durable Tempus anchor should be readable by fixture");
    let checksum_byte = bytes
        .last_mut()
        .expect("persisted Tempus anchor should contain an integrity checksum");
    *checksum_byte ^= 0x01;
    fs::write(&path, bytes).expect("fixture should be able to corrupt the durable anchor");

    let restarted =
        FileTempusAnchorStore::open(directory.path()).expect("restarted Tempus store should open");
    let error = restarted
        .load(&original.anchor_id)
        .expect_err("corrupted durable state must fail visibly");

    assert!(matches!(error, TempusPersistenceError::IntegrityFailure(_)));
}

fn only_anchor_file(root: &Path) -> PathBuf {
    let namespace = root.join("tempus");
    let mut entries = fs::read_dir(namespace).expect("Tempus namespace should be readable");
    let first = entries
        .next()
        .expect("one persisted Tempus anchor should exist")
        .expect("persisted Tempus directory entry should be readable")
        .path();
    assert!(
        entries.next().is_none(),
        "corruption fixture expects exactly one durable anchor file"
    );
    first
}
