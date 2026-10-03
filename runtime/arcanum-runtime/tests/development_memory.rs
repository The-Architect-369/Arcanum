use arcanum_runtime::continuity_receipt::sha256;
use arcanum_runtime::development_memory::*;
use std::{fs, path::PathBuf};

const TIME: &str = "2026-10-03T13:00:00Z";
fn record(id: &str) -> PublicQuestion {
    PublicQuestion {
        namespace: "architect/continuity".into(),
        disclosure: Disclosure::Public,
        encryption_required: false,
        object_id: id.into(),
        subject_id: "synthetic:question:1".into(),
        claim: Claim::Proposal,
        occurred_at: None,
        observed_at: TIME.into(),
        recorded_at: TIME.into(),
        retention_authority_ref: "test-only:selected-public-fixture".into(),
        provenance: Provenance {
            kind: SourceKind::Local,
            reference: "synthetic:fixture".into(),
            revision: None,
            captured_at: TIME.into(),
            content_digest: None,
            evidence_class: Claim::Observation,
        },
        effects: std::array::from_fn(|_| Effect {
            state: State::Unknown,
            evidence_refs: vec![],
        }),
        statement: "Which synthetic option should be reviewed?".into(),
        status: QuestionStatus::Open,
        supersedes: None,
    }
}
struct TestPolicy {
    read: bool,
    retain: bool,
    supersede: bool,
}
impl RetentionPolicy for TestPolicy {
    fn allows(&self, a: Access, r: &PublicQuestion, _: &[u8; 32]) -> bool {
        r.retention_authority_ref == "test-only:selected-public-fixture"
            && match a {
                Access::Read => self.read,
                Access::Retain => self.retain,
                Access::Supersede => self.supersede,
            }
    }
}
const ALLOW: TestPolicy = TestPolicy {
    read: true,
    retain: true,
    supersede: true,
};
struct Fixture {
    root: PathBuf,
    store: FileDevelopmentMemory,
}
impl Fixture {
    fn new() -> Self {
        let root = std::env::temp_dir().join(format!(
            "a17-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        fs::create_dir(&root).unwrap();
        let store = FileDevelopmentMemory::open(&root).unwrap();
        Self { root, store }
    }
    fn path(&self, area: &str, id: &str) -> PathBuf {
        self.root
            .join("architect/continuity/public-questions.v1")
            .join(area)
            .join(key(id))
    }
    fn pending(&self, r: &PublicQuestion) {
        let mut bytes = r.canonical_bytes().unwrap();
        bytes.extend_from_slice(&r.digest().unwrap());
        fs::write(self.path("pending", &r.object_id), bytes).unwrap();
    }
}
impl Drop for Fixture {
    fn drop(&mut self) {
        fs::remove_dir_all(&self.root).unwrap();
    }
}
fn key(id: &str) -> String {
    sha256(id.as_bytes())
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect()
}
#[test]
fn canonical_vector_is_fixed_and_decoder_rejects_partial_extra_and_unknown_bytes() {
    let r = record("synthetic:one");
    let bytes = r.canonical_bytes().unwrap();
    let expected = include_str!("../../../docs/specs/runtime/fixtures/a17-v1/question.hex").trim();
    let actual: String = bytes.iter().map(|b| format!("{b:02x}")).collect();
    assert_eq!(actual, expected);
    let expected_digest =
        include_str!("../../../docs/specs/runtime/fixtures/a17-v1/question.sha256").trim();
    assert_eq!(
        r.digest()
            .unwrap()
            .iter()
            .map(|b| format!("{b:02x}"))
            .collect::<String>(),
        expected_digest
    );
    assert_eq!(PublicQuestion::decode(&bytes).unwrap(), r);
    for len in 0..bytes.len() {
        assert!(PublicQuestion::decode(&bytes[..len]).is_err(), "{len}");
    }
    let mut trailing = bytes.clone();
    trailing.push(0);
    assert!(PublicQuestion::decode(&trailing).is_err());
    let mut invalid = bytes;
    invalid[0] ^= 1;
    assert!(PublicQuestion::decode(&invalid).is_err());
}
#[test]
fn immutable_identity_idempotence_and_restart_preserve_original_bytes() {
    let f = Fixture::new();
    let r = record("synthetic:one");
    let digest = f.store.append(&r, &ALLOW).unwrap();
    assert_eq!(f.store.append(&r, &ALLOW).unwrap(), digest);
    let mut changed = r.clone();
    changed.recorded_at = "2026-10-03T13:00:01Z".into();
    assert!(matches!(
        f.store.append(&changed, &ALLOW),
        Err(MemoryError::Conflict)
    ));
    let reopened = FileDevelopmentMemory::open(&f.root).unwrap();
    assert_eq!(reopened.load(&r.object_id, &ALLOW).unwrap(), r);
}
#[test]
fn contradictory_history_remains_visible_until_explicit_authorized_supersession() {
    let f = Fixture::new();
    let a = record("a");
    let mut b = record("b");
    b.statement = "A conflicting synthetic option".into();
    b.effects[3].state = State::Unknown;
    f.store.append(&a, &ALLOW).unwrap();
    f.store.append(&b, &ALLOW).unwrap();
    let before = f.store.project(&a.subject_id, &ALLOW).unwrap();
    assert_eq!(before.active_object_ids, vec!["a", "b"]);
    assert!(before.has_unresolved_alternatives);
    let mut c = record("c");
    c.supersedes = Some(Supersession {
        target_object_id: "a".into(),
        basis_ref: "test-only:review".into(),
    });
    let denied = TestPolicy {
        read: true,
        retain: true,
        supersede: false,
    };
    assert!(matches!(
        f.store.append(&c, &denied),
        Err(MemoryError::Denied)
    ));
    assert!(!f.path("pending", "c").exists());
    f.store.append(&c, &ALLOW).unwrap();
    let after = f.store.project(&a.subject_id, &ALLOW).unwrap();
    assert_eq!(after.active_object_ids, vec!["b", "c"]);
    assert_eq!(after.history.len(), 3);
    assert!(after.has_unresolved_alternatives);
    assert_eq!(f.store.load("a", &ALLOW).unwrap(), a);
    assert_eq!(
        f.store.load("b", &ALLOW).unwrap().effects[3].state,
        State::Unknown
    );
    assert_eq!(
        FileDevelopmentMemory::open(&f.root)
            .unwrap()
            .project(&a.subject_id, &ALLOW)
            .unwrap(),
        after
    );
}
#[test]
fn missing_cross_subject_and_self_supersession_fail_before_publication() {
    let f = Fixture::new();
    let a = record("a");
    f.store.append(&a, &ALLOW).unwrap();
    for target in ["absent", "b", "a"] {
        let mut b = record("b");
        b.subject_id = "other".into();
        b.supersedes = Some(Supersession {
            target_object_id: target.into(),
            basis_ref: "test-only:review".into(),
        });
        assert!(f.store.append(&b, &ALLOW).is_err());
        assert!(!f.path("objects", "b").exists());
    }
}
#[test]
fn stored_grant_and_effect_claims_never_authorize_access_or_override_revocation() {
    let f = Fixture::new();
    let mut r = record("a");
    for e in &mut r.effects {
        e.state = State::Established;
    }
    let deny = TestPolicy {
        read: false,
        retain: false,
        supersede: false,
    };
    assert!(matches!(
        f.store.append(&r, &deny),
        Err(MemoryError::Denied)
    ));
    assert!(!f.path("pending", "a").exists());
    f.store.append(&r, &ALLOW).unwrap();
    assert!(matches!(f.store.load("a", &deny), Err(MemoryError::Denied)));
    assert!(matches!(
        f.store.project(&r.subject_id, &deny),
        Err(MemoryError::Denied)
    ));
    assert_eq!(f.store.load("a", &ALLOW).unwrap(), r);
}
#[test]
fn pending_original_is_not_success_and_resume_cannot_replace_uncertain_bytes() {
    let f = Fixture::new();
    let r = record("a");
    f.pending(&r);
    assert!(matches!(
        f.store.load("a", &ALLOW),
        Err(MemoryError::Pending)
    ));
    assert!(matches!(
        f.store.project(&r.subject_id, &ALLOW),
        Err(MemoryError::Pending)
    ));
    let mut changed = r.clone();
    changed.statement = "Different content".into();
    assert!(matches!(
        f.store.append(&changed, &ALLOW),
        Err(MemoryError::Pending)
    ));
    let denied = TestPolicy {
        read: true,
        retain: false,
        supersede: true,
    };
    assert!(matches!(
        f.store.resume("a", &denied),
        Err(MemoryError::Denied)
    ));
    assert!(f.path("pending", "a").exists());
    f.store.resume("a", &ALLOW).unwrap();
    assert_eq!(f.store.load("a", &ALLOW).unwrap(), r);
    assert_eq!(f.store.resume("a", &ALLOW).unwrap(), r.digest().unwrap());
}
#[test]
fn truncated_pending_is_preserved_and_never_recreated() {
    let f = Fixture::new();
    let r = record("a");
    fs::write(f.path("pending", "a"), b"partial").unwrap();
    assert!(matches!(
        f.store.resume("a", &ALLOW),
        Err(MemoryError::Corrupt)
    ));
    assert!(matches!(
        f.store.append(&r, &ALLOW),
        Err(MemoryError::Pending)
    ));
    assert_eq!(fs::read(f.path("pending", "a")).unwrap(), b"partial");
}
#[test]
fn corruption_identity_swap_duplicate_locations_and_lost_edge_fail_visibly() {
    for kind in 0..4 {
        let f = Fixture::new();
        let r = record("a");
        f.store.append(&r, &ALLOW).unwrap();
        match kind {
            0 => {
                let p = f.path("objects", "a");
                let mut b = fs::read(&p).unwrap();
                b[40] ^= 1;
                fs::write(p, b).unwrap();
            }
            1 => {
                fs::rename(f.path("objects", "a"), f.path("objects", "b")).unwrap();
            }
            2 => f.pending(&r),
            _ => {
                let mut c = record("c");
                c.supersedes = Some(Supersession {
                    target_object_id: "a".into(),
                    basis_ref: "test-only:review".into(),
                });
                f.store.append(&c, &ALLOW).unwrap();
                fs::remove_file(f.path("objects", "a")).unwrap();
            }
        }
        assert!(f.store.project(&r.subject_id, &ALLOW).is_err());
    }
}
#[test]
fn bounds_dates_and_duplicate_evidence_references_fail_before_storage() {
    for kind in 0..6 {
        let f = Fixture::new();
        let mut r = record("a");
        match kind {
            0 => r.object_id = "../escape".into(),
            1 => r.recorded_at = "2026-02-29T13:00:00Z".into(),
            2 => r.statement = "x".repeat(4097),
            3 => r.effects[0].evidence_refs = vec!["same".into(), "same".into()],
            4 => r.provenance.reference = String::new(),
            _ => r.observed_at = "2026-10-03T13:00:60Z".into(),
        }
        assert!(matches!(
            f.store.append(&r, &ALLOW),
            Err(MemoryError::Invalid)
        ));
    }
}
#[cfg(unix)]
#[test]
fn symlinks_are_rejected_and_another_process_lock_blocks_reads_and_writes() {
    use std::os::unix::fs::symlink;
    let f = Fixture::new();
    let r = record("a");
    f.store.append(&r, &ALLOW).unwrap();
    let lock = fs::OpenOptions::new()
        .read(true)
        .write(true)
        .open(f.root.join("architect/continuity/public-questions.v1/lock"))
        .unwrap();
    fs2::FileExt::lock_exclusive(&lock).unwrap();
    assert!(matches!(
        FileDevelopmentMemory::open(&f.root)
            .unwrap()
            .load("a", &ALLOW),
        Err(MemoryError::Busy)
    ));
    assert!(matches!(
        f.store.append(&record("b"), &ALLOW),
        Err(MemoryError::Busy)
    ));
    drop(lock);
    fs::remove_file(f.path("objects", "a")).unwrap();
    symlink("/dev/null", f.path("objects", "a")).unwrap();
    assert!(matches!(
        f.store.load("a", &ALLOW),
        Err(MemoryError::Corrupt)
    ));
    let g = Fixture::new();
    fs::remove_dir_all(g.root.join("architect")).unwrap();
    symlink(&f.root, g.root.join("architect")).unwrap();
    assert!(matches!(
        FileDevelopmentMemory::open(&g.root),
        Err(MemoryError::Corrupt)
    ));
}
#[test]
fn fresh_process_recovers_exact_committed_record() {
    let f = Fixture::new();
    let r = record("process:one");
    f.store.append(&r, &ALLOW).unwrap();
    let status = std::process::Command::new(std::env::current_exe().unwrap())
        .args(["--ignored", "--exact", "process_reader"])
        .env("ARCANUM_A17_TEST_ROOT", &f.root)
        .status()
        .unwrap();
    assert!(status.success());
}
#[test]
#[ignore = "invoked in a fresh process by recovery test"]
fn process_reader() {
    let root = std::env::var_os("ARCANUM_A17_TEST_ROOT").unwrap();
    let store = FileDevelopmentMemory::open(root).unwrap();
    assert_eq!(
        store.load("process:one", &ALLOW).unwrap(),
        record("process:one")
    );
}

#[test]
fn private_namespaces_and_encryption_requirements_are_denied_before_retention() {
    let f = Fixture::new();
    for case in 0..7 {
        let mut r = record("private-denied");
        match case {
            0 => r.namespace = "apps/hope".into(),
            1 => r.namespace = "apps/journey".into(),
            2 => r.disclosure = Disclosure::PrivateLocal,
            3 => r.disclosure = Disclosure::ArchitectDevelopment,
            4 => r.disclosure = Disclosure::SharedProject,
            5 => r.disclosure = Disclosure::PublicCandidate,
            _ => r.encryption_required = true,
        }
        assert!(matches!(
            f.store.append(&r, &ALLOW),
            Err(MemoryError::Denied)
        ));
        assert!(!f.path("pending", "private-denied").exists());
    }
}
