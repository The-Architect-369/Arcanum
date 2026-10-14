use arcanum_hope_runtime::collection::{
    CollectionError, DeleteDecision, EntryState, HopeCollection,
};
use arcanum_hope_runtime::{canonical_reflection, HopeReflectionInput, HopeTempusProvenance};

fn input<'a>(id: &'a str, at: &'a str, text: &'a str) -> HopeReflectionInput<'a> {
    HopeReflectionInput {
        id,
        created_at: at,
        prompt: None,
        user_text: text,
        hope_text: None,
        tempus: None,
    }
}

const TIME: &str = "2026-10-13T12:00:00Z";

#[test]
fn three_distinct_records_keep_exact_original_content_and_provenance() {
    let mut c = HopeCollection::new(3).unwrap();
    for (id, text) in [
        ("a", "  untrimmed  "),
        ("b", "line\n\"quoted\"\\\t"),
        ("c", "🌱 café\u{0001}"),
    ] {
        let record = HopeReflectionInput {
            prompt: Some("A question"),
            hope_text: Some("A local response"),
            tempus: Some(HopeTempusProvenance {
                anchor_id: "synthetic-anchor",
                captured_at: TIME,
                source_kind: "system-clock",
            }),
            ..input(id, TIME, text)
        };
        let exact = canonical_reflection(record).unwrap();
        c.save(record).unwrap();
        assert_eq!(c.recall(id).unwrap().reflection_json(), exact);
        assert_eq!(c.recall(id).unwrap().created_at(), TIME);
    }
    assert_eq!(
        c.browse().iter().map(|e| e.id()).collect::<Vec<_>>(),
        ["a", "b", "c"]
    );
}

#[test]
fn invalid_inputs_and_duplicate_ids_leave_collection_unchanged() {
    let mut c = HopeCollection::new(4).unwrap();
    c.save(input("a", TIME, "original")).unwrap();
    let before = c.private_snapshot_json();
    for record in [
        input("b", TIME, " \n\u{2003}"),
        input(" ", TIME, "text"),
        input("b", "", "text"),
        HopeReflectionInput {
            prompt: Some(" "),
            ..input("b", TIME, "text")
        },
        HopeReflectionInput {
            tempus: Some(HopeTempusProvenance {
                anchor_id: "a",
                captured_at: TIME,
                source_kind: "interpretation",
            }),
            ..input("b", TIME, "text")
        },
    ] {
        assert!(c.save(record).is_err());
        assert_eq!(c.private_snapshot_json(), before);
    }
    assert_eq!(
        c.save(input("a", TIME, "replacement")),
        Err(CollectionError::DuplicateId)
    );
    assert_eq!(c.private_snapshot_json(), before);
}

#[test]
fn chronology_uses_instant_then_insertion_order_without_rewriting_time() {
    let mut c = HopeCollection::new(8).unwrap();
    for (id, time) in [
        ("late", "2026-10-13T12:00:01Z"),
        ("offset", "2026-10-13T08:00:00-04:00"),
        ("fraction", "2026-10-13T12:00:00.100Z"),
        ("same", TIME),
        ("earlier", "2026-10-12T23:59:59.999999999Z"),
        ("nano", "2026-10-13T12:00:00.000000001Z"),
    ] {
        c.save(input(id, time, "synthetic")).unwrap();
    }
    assert_eq!(
        c.browse().iter().map(|e| e.id()).collect::<Vec<_>>(),
        ["earlier", "offset", "same", "nano", "fraction", "late"]
    );
    assert_eq!(
        c.recall("offset").unwrap().created_at(),
        "2026-10-13T08:00:00-04:00"
    );
    assert_eq!(c.recall("earlier").unwrap().sequence(), 4);
    assert_eq!(c.recall("late").unwrap().sequence(), 0);
}

#[test]
fn equivalent_instants_across_dates_and_leap_years_sort_correctly() {
    let mut c = HopeCollection::new(5).unwrap();
    for (id, time) in [
        ("offset", "2000-03-01T00:30:00+01:00"),
        ("utc", "2000-02-29T23:30:00Z"),
        ("old", "1900-02-28T23:59:59Z"),
        ("new", "2000-03-01T00:00:00Z"),
    ] {
        c.save(input(id, time, "fixture")).unwrap();
    }
    assert_eq!(
        c.browse().iter().map(|e| e.id()).collect::<Vec<_>>(),
        ["old", "offset", "utc", "new"]
    );
}

#[test]
fn malformed_or_ambiguous_timestamps_fail_without_mutation_or_panics() {
    let mut c = HopeCollection::new(2).unwrap();
    let before = c.private_snapshot_json();
    for time in [
        "x",
        "éééééééééééé",
        "0000-01-01T00:00:00Z",
        "2026-00-01T00:00:00Z",
        "2026-13-01T00:00:00Z",
        "2026-02-29T00:00:00Z",
        "1900-02-29T00:00:00Z",
        "2026-04-31T00:00:00Z",
        "2026-01-00T00:00:00Z",
        "2026-01-01T24:00:00Z",
        "2026-01-01T00:60:00Z",
        "2026-01-01T00:00:60Z",
        "2026-01-01T00:00:00",
        "2026-01-01T00:00:00.Z",
        "2026-01-01T00:00:00.1234567890Z",
        "2026-01-01T00:00:00.1",
        "2026-01-01T00:00:00+24:00",
        "2026-01-01T00:00:00-00:00",
        "2026-01-01T00:00:00+00:60",
        "2026-01-01T00:00:00Zsuffix",
        "2026-01-01t00:00:00z",
    ] {
        assert_eq!(
            c.save(input("a", time, "fixture")),
            Err(CollectionError::InvalidTimestamp),
            "{time}"
        );
        assert_eq!(c.private_snapshot_json(), before);
    }
    for end in 0..TIME.len() {
        assert!(c.save(input("a", &TIME[..end], "fixture")).is_err());
    }
    c.save(input(
        "a",
        "2000-02-29T00:00:00.000000001+00:00",
        "valid leap day",
    ))
    .unwrap();
    c.save(input(
        "b",
        "0001-01-01T00:00:00+23:59",
        "earliest profile year",
    ))
    .unwrap();
}

#[test]
fn archive_and_restore_preserve_record_and_exclude_it_from_default_recall() {
    let mut c = HopeCollection::new(3).unwrap();
    c.save(input("a", TIME, "held")).unwrap();
    let exact = c.recall("a").unwrap().reflection_json().to_owned();
    assert!(c.archive("a").unwrap());
    assert!(!c.archive("a").unwrap());
    assert!(c.recall("a").is_none());
    assert!(c.browse().is_empty());
    assert_eq!(c.browse_archived().len(), 1);
    assert_eq!(c.recall_archived("a").unwrap().reflection_json(), exact);
    assert!(c.restore("a").unwrap());
    assert!(!c.restore("a").unwrap());
    let entry = c.recall("a").unwrap();
    assert_eq!(entry.reflection_json(), exact);
    assert_eq!(entry.created_at(), TIME);
    assert_eq!(entry.sequence(), 0);
    assert!(c.browse_archived().is_empty());
    assert_eq!(c.archive("absent"), Err(CollectionError::NotFound));
    assert_eq!(c.restore("absent"), Err(CollectionError::NotFound));
}

#[test]
fn canceled_and_wrong_view_deletion_preserve_records() {
    let mut c = HopeCollection::new(1).unwrap();
    c.save(input("a", TIME, "keep")).unwrap();
    assert!(matches!(
        c.prepare_delete("a", EntryState::Archived),
        Err(CollectionError::NotFound)
    ));
    let selection = c.prepare_delete("a", EntryState::Active).unwrap();
    let before = c.private_snapshot_json();
    assert!(!c.delete(selection, DeleteDecision::Cancel).unwrap());
    assert_eq!(before, c.private_snapshot_json());
}

#[test]
fn delete_active_and_archived_entries_prevents_id_reuse_and_keeps_sequence() {
    let mut c = HopeCollection::new(3).unwrap();
    c.save(input("a", TIME, "first secret")).unwrap();
    c.save(input("b", TIME, "second secret")).unwrap();
    c.save(input("c", TIME, "retained")).unwrap();
    c.archive("b").unwrap();
    for (id, view) in [("a", EntryState::Active), ("b", EntryState::Archived)] {
        let selection = c.prepare_delete(id, view).unwrap();
        assert!(c.delete(selection, DeleteDecision::Confirm).unwrap());
        assert!(c.recall(id).is_none());
        assert!(c.recall_archived(id).is_none());
        assert_eq!(c.restore(id), Err(CollectionError::NotFound));
        assert_eq!(
            c.save(input(id, TIME, "resurrection")),
            Err(CollectionError::DuplicateId)
        );
    }
    let snapshot = c.private_snapshot_json();
    assert!(!snapshot.contains("first secret"));
    assert!(!snapshot.contains("second secret"));
    c.save(input("d", TIME, "new")).unwrap();
    assert_eq!(c.recall("c").unwrap().sequence(), 2);
    assert_eq!(c.recall("d").unwrap().sequence(), 3);
}

#[test]
fn confirmation_is_stale_after_visibility_round_trip_or_other_collection() {
    let mut c = HopeCollection::new(1).unwrap();
    let mut other = HopeCollection::new(1).unwrap();
    for collection in [&mut c, &mut other] {
        collection
            .save(input("a", TIME, "same exact reflection"))
            .unwrap();
    }
    let old = c.prepare_delete("a", EntryState::Active).unwrap();
    c.archive("a").unwrap();
    c.restore("a").unwrap();
    assert_eq!(
        c.delete(old, DeleteDecision::Confirm),
        Err(CollectionError::StaleDeletion)
    );
    let wrong_owner = other.prepare_delete("a", EntryState::Active).unwrap();
    assert_eq!(
        c.delete(wrong_owner, DeleteDecision::Confirm),
        Err(CollectionError::StaleDeletion)
    );
    assert!(c.recall("a").is_some());
}

#[test]
fn a_second_confirmation_cannot_reapply_deletion() {
    let mut c = HopeCollection::new(1).unwrap();
    c.save(input("a", TIME, "synthetic")).unwrap();
    let first = c.prepare_delete("a", EntryState::Active).unwrap();
    let second = c.prepare_delete("a", EntryState::Active).unwrap();
    c.delete(first, DeleteDecision::Confirm).unwrap();
    assert_eq!(
        c.delete(second, DeleteDecision::Confirm),
        Err(CollectionError::StaleDeletion)
    );
}

#[test]
fn capacity_failure_keeps_archived_and_active_records_without_eviction() {
    assert!(matches!(
        HopeCollection::new(0),
        Err(CollectionError::InvalidCapacity)
    ));
    let mut c = HopeCollection::new(1).unwrap();
    c.save(input("a", TIME, "retain")).unwrap();
    c.archive("a").unwrap();
    let before = c.private_snapshot_json();
    assert_eq!(
        c.save(input("b", TIME, "overflow")),
        Err(CollectionError::CapacityReached)
    );
    assert_eq!(c.private_snapshot_json(), before);
    let deletion = c.prepare_delete("a", EntryState::Archived).unwrap();
    c.delete(deletion, DeleteDecision::Confirm).unwrap();
    c.save(input("b", TIME, "fits")).unwrap();
    assert_eq!(c.recall("b").unwrap().sequence(), 1);
}

#[test]
fn debug_and_errors_do_not_reveal_content_ids_timestamps_or_counts() {
    let mut c = HopeCollection::new(1).unwrap();
    c.save(input("PRIVATE-ID", TIME, "PRIVATE-CONTENT"))
        .unwrap();
    let selection = c.prepare_delete("PRIVATE-ID", EntryState::Active).unwrap();
    let error = c
        .save(input("PRIVATE-ID", TIME, "replacement"))
        .unwrap_err();
    let diagnostics = format!(
        "{c:?} {:?} {selection:?} {error:?} {error}",
        c.recall("PRIVATE-ID").unwrap()
    );
    for private in ["PRIVATE-ID", "PRIVATE-CONTENT", TIME] {
        assert!(!diagnostics.contains(private));
    }
    assert_eq!(format!("{c:?}"), "HopeCollection([private])");
}

#[test]
fn schema_fixture_is_explicitly_synthetic() {
    let mut c = HopeCollection::new(3).unwrap();
    c.save(input("deleted", TIME, "do not retain this fixture body"))
        .unwrap();
    let selected = c.prepare_delete("deleted", EntryState::Active).unwrap();
    c.delete(selected, DeleteDecision::Confirm).unwrap();
    c.save(input(
        "active",
        "2026-10-13T08:00:00-04:00",
        "synthetic\n\"quoted\" 🌱",
    ))
    .unwrap();
    c.save(input("archived", TIME, "synthetic archive"))
        .unwrap();
    c.archive("archived").unwrap();
    let snapshot = c.private_snapshot_json();
    assert!(!snapshot.contains("do not retain"));
    // Only this synthetic fixture is emitted for external JSON/schema validation.
    println!("A19_SYNTHETIC_SNAPSHOT={snapshot}");
}
