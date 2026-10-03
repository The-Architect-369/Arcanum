use arcanum_runtime::continuity_receipt::{sha256, ContinuityReceipt, SignedContinuityReceipt};
use arcanum_runtime::continuity_store::{
    FileContinuityStore, OperationPhase, StoreError, MAX_OBJECT_BYTES,
};
use std::{fs, path::PathBuf};

struct Fixture {
    root: PathBuf,
    store: FileContinuityStore,
    object: Vec<u8>,
    receipt: ContinuityReceipt,
    wrapper: Vec<u8>,
}
impl Fixture {
    fn new() -> Self {
        let root = std::env::temp_dir().join(format!(
            "a16-recovery-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        let store = FileContinuityStore::open(&root).unwrap();
        let object = hex(include_str!(
            "../../../docs/specs/runtime/fixtures/a16-v1/recording-minimal.object.hex"
        ));
        let wrapper = hex(include_str!(
            "../../../docs/specs/runtime/fixtures/a16-v1/recording-minimal.wrapper.hex"
        ));
        let receipt =
            ContinuityReceipt::decode(&SignedContinuityReceipt::decode(&wrapper).unwrap().message)
                .unwrap();
        Self {
            root,
            store,
            object,
            receipt,
            wrapper,
        }
    }
    fn path(&self, location: &str) -> PathBuf {
        let id: String = sha256(self.receipt.operation_id.as_bytes())
            .iter()
            .map(|b| format!("{b:02x}"))
            .collect();
        self.root
            .join("continuity-operations.v1")
            .join(location)
            .join(id)
    }
    fn commit(&self) {
        self.store.prepare(&self.object, &self.receipt).unwrap();
        self.store
            .commit(&self.receipt.operation_id, &self.wrapper)
            .unwrap();
    }
}
impl Drop for Fixture {
    fn drop(&mut self) {
        fs::remove_dir_all(&self.root).unwrap();
    }
}
fn hex(s: &str) -> Vec<u8> {
    let s = s.trim();
    (0..s.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&s[i..i + 2], 16).unwrap())
        .collect()
}

#[test]
fn identical_retry_freezes_time_returns_original_signature_and_preserves_generation() {
    let f = Fixture::new();
    f.commit();
    let mut retry = f.receipt.clone();
    retry.recorded_at_ms += 1;
    assert_eq!(
        f.store.prepare(&f.object, &retry).unwrap().message,
        f.receipt.encode().unwrap()
    );
    // An equivalent valid high/low-S signature must not replace committed bytes.
    let mut alternative = SignedContinuityReceipt::decode(&f.wrapper).unwrap();
    let sig = p256::ecdsa::Signature::from_der(&alternative.signature_der).unwrap();
    let (r, s) = sig.split_scalars();
    let changed = p256::ecdsa::Signature::from_scalars(r.to_bytes(), (-*s).to_bytes()).unwrap();
    alternative.signature_der = changed.to_der().as_bytes().to_vec();
    assert_ne!(alternative.signature_der, sig.to_der().as_bytes());
    assert_eq!(
        f.store
            .commit(&f.receipt.operation_id, &alternative.encode().unwrap())
            .unwrap()
            .wrapper,
        f.wrapper
    );
    for mutation in 0..3 {
        let mut request = f.receipt.clone();
        match mutation {
            0 => request.credential_generation[0] ^= 1,
            1 => request.observed_at_ms = Some(42),
            _ => request.object_digest = sha256(b"different"),
        }
        let bytes = if mutation == 2 {
            &b"different"[..]
        } else {
            &f.object
        };
        assert!(matches!(
            f.store.prepare(bytes, &request),
            Err(StoreError::Conflict)
        ));
    }
    assert_eq!(
        f.store.recover(&f.receipt.operation_id).unwrap().object,
        f.object
    );
}

#[test]
fn unknown_partial_missing_and_corrupt_files_block_without_rewriting_evidence() {
    for kind in [
        "partial",
        "unknown",
        "missing",
        "digest",
        "manifest",
        "duplicate",
    ] {
        let f = Fixture::new();
        f.commit();
        let path = f.path("committed");
        match kind {
            "partial" => fs::write(path.join("object.bin.partial"), b"preserved").unwrap(),
            "unknown" => fs::write(path.join("surprise"), b"preserved").unwrap(),
            "missing" => fs::remove_file(path.join("manifest.bin")).unwrap(),
            "digest" => fs::write(path.join("object.bin"), b"wrong").unwrap(),
            "manifest" => fs::write(path.join("manifest.bin"), b"wrong").unwrap(),
            _ => fs::create_dir(f.path("staging")).unwrap(),
        }
        let before = fs::read(path.join("receipt.cbor")).unwrap();
        assert_eq!(
            f.store.inspect(&f.receipt.operation_id).unwrap(),
            OperationPhase::BlockedCorrupt
        );
        assert!(f.store.recover(&f.receipt.operation_id).is_err());
        assert!(f.store.prepare(&f.object, &f.receipt).is_err());
        assert!(f.store.commit(&f.receipt.operation_id, &f.wrapper).is_err());
        assert_eq!(fs::read(path.join("receipt.cbor")).unwrap(), before);
    }
}

#[test]
fn bounds_and_cross_instance_lock_contention_are_visible() {
    let f = Fixture::new();
    assert_eq!(
        f.store.inspect(&f.receipt.operation_id).unwrap(),
        OperationPhase::NotFound
    );
    assert!(matches!(
        f.store.recover(&f.receipt.operation_id),
        Err(StoreError::NotFound)
    ));
    assert!(f.store.inspect("").is_err());
    assert!(f
        .store
        .prepare(&vec![0; MAX_OBJECT_BYTES + 1], &f.receipt)
        .is_err());
    let lock = fs::OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .truncate(false)
        .open(f.root.join("continuity-operations.v1/writer.lock"))
        .unwrap();
    fs2::FileExt::try_lock_exclusive(&lock).unwrap();
    let other = FileContinuityStore::open(&f.root).unwrap();
    assert!(matches!(
        other.prepare(&f.object, &f.receipt),
        Err(StoreError::Busy)
    ));
    drop(lock);
    f.commit();
    assert_eq!(
        other.recover(&f.receipt.operation_id).unwrap().wrapper,
        f.wrapper
    );
}

#[cfg(unix)]
#[test]
fn symlinks_and_oversized_persisted_content_fail_closed() {
    for symlink in [true, false] {
        let f = Fixture::new();
        f.commit();
        let path = f.path("committed").join("object.bin");
        fs::remove_file(&path).unwrap();
        if symlink {
            std::os::unix::fs::symlink("receipt.cbor", &path).unwrap();
        } else {
            let file = fs::File::create(&path).unwrap();
            file.set_len(MAX_OBJECT_BYTES as u64 + 1).unwrap();
        }
        assert_eq!(
            f.store.inspect(&f.receipt.operation_id).unwrap(),
            OperationPhase::BlockedCorrupt
        );
    }
}

#[test]
fn process_exit_releases_writer_lock_and_original_operation_survives() {
    let f = Fixture::new();
    f.commit();
    let mut child = std::process::Command::new(std::env::current_exe().unwrap())
        .args(["--exact", "lock_holder_helper", "--ignored"])
        .env("ARCANUM_A16_TEST_ROOT", &f.root)
        .stdout(std::process::Stdio::null())
        .spawn()
        .unwrap();
    let marker = f.root.join("child-locked");
    let start = std::time::Instant::now();
    while !marker.exists() {
        assert!(start.elapsed() < std::time::Duration::from_secs(10));
        std::thread::sleep(std::time::Duration::from_millis(10));
    }
    assert!(matches!(
        f.store.recover(&f.receipt.operation_id),
        Err(StoreError::Busy)
    ));
    child.kill().unwrap();
    child.wait().unwrap();
    assert_eq!(
        FileContinuityStore::open(&f.root)
            .unwrap()
            .recover(&f.receipt.operation_id)
            .unwrap()
            .wrapper,
        f.wrapper
    );
}
#[test]
#[ignore = "subprocess helper; invoked by process_exit test"]
fn lock_holder_helper() {
    let root = PathBuf::from(std::env::var_os("ARCANUM_A16_TEST_ROOT").unwrap());
    let file = fs::OpenOptions::new()
        .read(true)
        .write(true)
        .open(root.join("continuity-operations.v1/writer.lock"))
        .unwrap();
    fs2::FileExt::try_lock_exclusive(&file).unwrap();
    fs::write(root.join("child-locked"), b"locked").unwrap();
    loop {
        std::thread::sleep(std::time::Duration::from_secs(1));
    }
}

#[test]
fn simultaneous_same_id_writers_converge_on_one_original_commit() {
    let f = Fixture::new();
    let gate = std::sync::Arc::new(std::sync::Barrier::new(2));
    let threads: Vec<_> = (0..2)
        .map(|_| {
            let root = f.root.clone();
            let object = f.object.clone();
            let receipt = f.receipt.clone();
            let wrapper = f.wrapper.clone();
            let gate = gate.clone();
            std::thread::spawn(move || {
                let store = FileContinuityStore::open(root).unwrap();
                gate.wait();
                for _ in 0..1000 {
                    match store.prepare(&object, &receipt) {
                        Err(StoreError::Busy) => {
                            std::thread::sleep(std::time::Duration::from_millis(1));
                            continue;
                        }
                        Ok(_) => {}
                        Err(error) => panic!("{error}"),
                    }
                    match store.commit(&receipt.operation_id, &wrapper) {
                        Err(StoreError::Busy) => {
                            std::thread::sleep(std::time::Duration::from_millis(1))
                        }
                        Ok(result) => return result.wrapper,
                        Err(error) => panic!("{error}"),
                    }
                }
                panic!("writers failed to converge")
            })
        })
        .collect();
    for thread in threads {
        assert_eq!(thread.join().unwrap(), f.wrapper);
    }
    assert_eq!(
        fs::read_dir(f.root.join("continuity-operations.v1/committed"))
            .unwrap()
            .count(),
        1
    );
}

#[test]
fn prepare_never_fills_holes_in_damaged_staged_signed_state() {
    for empty in [true, false] {
        let f = Fixture::new();
        let stage = f.path("staging");
        if empty {
            fs::create_dir(&stage).unwrap();
        } else {
            f.store.prepare(&f.object, &f.receipt).unwrap();
            fs::write(stage.join("receipt.cbor"), &f.wrapper).unwrap();
            fs::remove_file(stage.join("object.bin")).unwrap();
        }
        assert_eq!(
            f.store.inspect(&f.receipt.operation_id).unwrap(),
            OperationPhase::BlockedCorrupt
        );
        assert!(f.store.prepare(&f.object, &f.receipt).is_err());
        assert!(!stage.join("object.bin").exists());
        if empty {
            assert!(!stage.join("message.cbor").exists());
        }
    }
}
