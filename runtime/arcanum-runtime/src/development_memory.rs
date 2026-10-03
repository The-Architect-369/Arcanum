//! A17 bounded public-question continuity foundation. No provider, JNI or UI entrypoint.
//! This is a strict storage profile of the sovereign continuity object contract,
//! not an importer or an authorization service. See ce-w04-a17-local-foundation.md.
use crate::continuity_receipt::sha256;
use std::collections::{BTreeMap, BTreeSet};
use std::fs::{self, File, OpenOptions};
use std::io::{self, Read, Write};
use std::path::{Path, PathBuf};

const MAGIC: &[u8] = b"ARCANUM-A17-PUBLIC-QUESTION-V1\0";
pub const MAX_RECORD_BYTES: usize = 64 * 1024;
pub const MAX_RECORDS: usize = 1024;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Claim {
    Observation,
    Report,
    Inference,
    Proposal,
    Unknown,
}
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum State {
    Established,
    NotEstablished,
    Unknown,
    NotApplicable,
}
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Effect {
    pub state: State,
    pub evidence_refs: Vec<String>,
}
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum QuestionStatus {
    Open,
    Accepted,
    Rejected,
    Deferred,
    Superseded,
    Resolved,
}
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SourceKind {
    Local,
    Human,
    Github,
    Notion,
    GoogleDrive,
    Vercel,
    ModelProvider,
    ImportedFile,
    Other,
}
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Provenance {
    pub kind: SourceKind,
    pub reference: String,
    pub revision: Option<String>,
    pub captured_at: String,
    pub content_digest: Option<[u8; 32]>,
    pub evidence_class: Claim,
}
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Supersession {
    pub target_object_id: String,
    pub basis_ref: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Disclosure {
    Public,
    PrivateLocal,
    ArchitectDevelopment,
    SharedProject,
    PublicCandidate,
}

/// Restricted profile: question, architect/continuity, version 1, public snapshot,
/// replication none, do_not_export true, encryption_required false, authority none.
/// These restrictions are constants, not caller-supplied self-authorizations.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PublicQuestion {
    pub namespace: String,
    pub disclosure: Disclosure,
    pub encryption_required: bool,
    pub object_id: String,
    pub subject_id: String,
    pub claim: Claim,
    pub occurred_at: Option<String>,
    pub observed_at: String,
    pub recorded_at: String,
    pub retention_authority_ref: String,
    pub provenance: Provenance,
    /// Proposed, ratified, authorized-for-effect, executed, verified, canonicalized.
    /// Stored claims only. Never consulted for tool or retention authority.
    pub effects: [Effect; 6],
    pub statement: String,
    pub status: QuestionStatus,
    pub supersedes: Option<Supersession>,
}
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Access {
    Retain,
    Read,
    Supersede,
}
/// Supplied by a trusted host, never reconstructed from a stored grant string.
/// Re-evaluated on every access and recovery; must be stable during one operation.
/// Supersede authorizes the exact source AND target (target is separately Read-checked).
/// No production grant resolver or private custody backend is enabled in this tranche.
pub trait RetentionPolicy {
    fn allows(&self, action: Access, record: &PublicQuestion, digest: &[u8; 32]) -> bool;
}
#[derive(Debug)]
pub enum MemoryError {
    Invalid,
    Corrupt,
    Denied,
    NotFound,
    Conflict,
    Pending,
    Busy,
    Capacity,
    Storage(io::Error),
}
impl std::fmt::Display for MemoryError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(match self {
            Self::Invalid => "unsupported or invalid A17 record",
            Self::Corrupt => "A17 integrity failure; evidence retained",
            Self::Denied => "A17 access not authorized",
            Self::NotFound => "A17 record not found",
            Self::Conflict => "A17 identity already binds different bytes",
            Self::Pending => "A17 publication pending; reconcile original record",
            Self::Busy => "A17 store busy",
            Self::Capacity => "A17 bounded store capacity reached",
            Self::Storage(_) => "A17 storage outcome uncertain; inspect original identity",
        })
    }
}
impl std::error::Error for MemoryError {}
impl From<io::Error> for MemoryError {
    fn from(e: io::Error) -> Self {
        Self::Storage(e)
    }
}
type Result<T> = std::result::Result<T, MemoryError>;

impl PublicQuestion {
    /// Fixed ordered, length-delimited UTF-8 profile; no optional digest field.
    pub fn canonical_bytes(&self) -> Result<Vec<u8>> {
        self.validate()?;
        let mut b = MAGIC.to_vec();
        for s in [&self.object_id, &self.subject_id] {
            put(&mut b, s);
        }
        b.push(self.claim as u8);
        optional(&mut b, self.occurred_at.as_deref());
        for s in [
            &self.observed_at,
            &self.recorded_at,
            &self.retention_authority_ref,
        ] {
            put(&mut b, s);
        }
        b.push(self.provenance.kind as u8);
        put(&mut b, &self.provenance.reference);
        optional(&mut b, self.provenance.revision.as_deref());
        put(&mut b, &self.provenance.captured_at);
        b.push(u8::from(self.provenance.content_digest.is_some()));
        if let Some(d) = self.provenance.content_digest {
            b.extend_from_slice(&d);
        }
        b.push(self.provenance.evidence_class as u8);
        for e in &self.effects {
            b.push(e.state as u8);
            b.push(e.evidence_refs.len() as u8);
            for r in &e.evidence_refs {
                put(&mut b, r);
            }
        }
        put(&mut b, &self.statement);
        b.push(self.status as u8);
        b.push(u8::from(self.supersedes.is_some()));
        if let Some(s) = &self.supersedes {
            put(&mut b, &s.target_object_id);
            put(&mut b, &s.basis_ref);
        }
        if b.len() > MAX_RECORD_BYTES {
            return Err(MemoryError::Invalid);
        }
        Ok(b)
    }
    pub fn digest(&self) -> Result<[u8; 32]> {
        Ok(sha256(&self.canonical_bytes()?))
    }
    pub fn decode(bytes: &[u8]) -> Result<Self> {
        if bytes.len() > MAX_RECORD_BYTES || !bytes.starts_with(MAGIC) {
            return Err(MemoryError::Corrupt);
        }
        let mut d = Decoder(&bytes[MAGIC.len()..]);
        let object_id = d.text()?;
        let subject_id = d.text()?;
        let claim = d.claim()?;
        let occurred_at = d.optional()?;
        let observed_at = d.text()?;
        let recorded_at = d.text()?;
        let retention_authority_ref = d.text()?;
        let kind = *[
            SourceKind::Local,
            SourceKind::Human,
            SourceKind::Github,
            SourceKind::Notion,
            SourceKind::GoogleDrive,
            SourceKind::Vercel,
            SourceKind::ModelProvider,
            SourceKind::ImportedFile,
            SourceKind::Other,
        ]
        .get(d.byte()? as usize)
        .ok_or(MemoryError::Corrupt)?;
        let reference = d.text()?;
        let revision = d.optional()?;
        let captured_at = d.text()?;
        let content_digest = if d.flag()? {
            Some(d.take(32)?.try_into().map_err(|_| MemoryError::Corrupt)?)
        } else {
            None
        };
        let provenance = Provenance {
            kind,
            reference,
            revision,
            captured_at,
            content_digest,
            evidence_class: d.claim()?,
        };
        let mut effects = std::array::from_fn(|_| Effect {
            state: State::Unknown,
            evidence_refs: vec![],
        });
        for e in &mut effects {
            e.state = *[
                State::Established,
                State::NotEstablished,
                State::Unknown,
                State::NotApplicable,
            ]
            .get(d.byte()? as usize)
            .ok_or(MemoryError::Corrupt)?;
            let count = d.byte()?;
            if count > 16 {
                return Err(MemoryError::Corrupt);
            }
            for _ in 0..count {
                e.evidence_refs.push(d.text()?);
            }
        }
        let statement = d.text()?;
        let status = *[
            QuestionStatus::Open,
            QuestionStatus::Accepted,
            QuestionStatus::Rejected,
            QuestionStatus::Deferred,
            QuestionStatus::Superseded,
            QuestionStatus::Resolved,
        ]
        .get(d.byte()? as usize)
        .ok_or(MemoryError::Corrupt)?;
        let supersedes = if d.flag()? {
            Some(Supersession {
                target_object_id: d.text()?,
                basis_ref: d.text()?,
            })
        } else {
            None
        };
        if !d.0.is_empty() {
            return Err(MemoryError::Corrupt);
        }
        let r = Self {
            namespace: "architect/continuity".into(),
            disclosure: Disclosure::Public,
            encryption_required: false,
            object_id,
            subject_id,
            claim,
            occurred_at,
            observed_at,
            recorded_at,
            retention_authority_ref,
            provenance,
            effects,
            statement,
            status,
            supersedes,
        };
        if r.canonical_bytes().map_err(|_| MemoryError::Corrupt)? != bytes {
            return Err(MemoryError::Corrupt);
        }
        Ok(r)
    }
    fn validate(&self) -> Result<()> {
        if self.namespace != "architect/continuity"
            || self.disclosure != Disclosure::Public
            || self.encryption_required
        {
            return Err(MemoryError::Denied);
        }
        identifier(&self.object_id)?;
        identifier(&self.subject_id)?;
        for s in [
            &self.observed_at,
            &self.recorded_at,
            &self.provenance.captured_at,
        ] {
            timestamp(s)?;
        }
        if let Some(t) = &self.occurred_at {
            timestamp(t)?;
        }
        for s in [
            &self.retention_authority_ref,
            &self.provenance.reference,
            &self.statement,
        ] {
            text(s)?;
        }
        if let Some(s) = &self.provenance.revision {
            text(s)?;
        }
        for e in &self.effects {
            if e.evidence_refs.len() > 16 {
                return Err(MemoryError::Invalid);
            }
            let mut seen = BTreeSet::new();
            for r in &e.evidence_refs {
                text(r)?;
                if !seen.insert(r) {
                    return Err(MemoryError::Invalid);
                }
            }
        }
        if let Some(s) = &self.supersedes {
            identifier(&s.target_object_id)?;
            text(&s.basis_ref)?;
            if s.target_object_id == self.object_id {
                return Err(MemoryError::Invalid);
            }
        }
        Ok(())
    }
}

/// A derived view, not ratification. Multiple active assertions remain unresolved.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SubjectProjection {
    pub subject_id: String,
    pub history: Vec<PublicQuestion>,
    pub active_object_ids: Vec<String>,
    pub has_unresolved_alternatives: bool,
}
/// Caller supplies a protected, trusted root with no hostile concurrent filesystem owner.
/// Hashes detect corruption, not malicious replacement by the owner or rollback.
pub struct FileDevelopmentMemory {
    root: PathBuf,
    #[cfg(test)]
    fail_after: Option<&'static str>,
}
impl FileDevelopmentMemory {
    pub fn open(private_root: impl AsRef<Path>) -> Result<Self> {
        // Require an existing trusted root, then inspect each child separately.
        directory(private_root.as_ref(), false)?;
        let mut root = private_root.as_ref().to_path_buf();
        for name in ["architect", "continuity", "public-questions.v1"] {
            root.push(name);
            directory(&root, true)?;
            sync(root.parent().ok_or(MemoryError::Invalid)?)?;
        }
        for name in ["objects", "pending"] {
            directory(&root.join(name), true)?;
        }
        sync(&root)?;
        Ok(Self {
            root,
            #[cfg(test)]
            fail_after: None,
        })
    }
    pub fn append(
        &self,
        record: &PublicQuestion,
        policy: &impl RetentionPolicy,
    ) -> Result<[u8; 32]> {
        let bytes = record.canonical_bytes()?;
        let digest = sha256(&bytes);
        authorize(policy, Access::Retain, record)?;
        let _lock = self.lock()?;
        let (pending, committed) = self.paths(&record.object_id)?;
        if exists(&committed)? {
            if exists(&pending)? {
                return Err(MemoryError::Corrupt);
            }
            let original = self.read(&committed, &record.object_id)?;
            authorize(policy, Access::Read, &original)?;
            if original != *record {
                return Err(MemoryError::Conflict);
            }
            self.sync_publication()?;
            return Ok(digest);
        }
        if exists(&pending)? {
            return Err(MemoryError::Pending);
        }
        self.check_capacity()?;
        self.check_edge(record, policy)?;
        let mut f = new_file(&pending)?;
        self.boundary("create")?;
        f.write_all(&bytes)?;
        f.write_all(&digest)?;
        self.boundary("write")?;
        f.sync_all()?;
        sync(&self.root.join("pending"))?;
        self.boundary("flush")?;
        fs::rename(&pending, &committed)?;
        self.boundary("rename")?;
        self.sync_publication()?;
        self.boundary("sync")?;
        Ok(digest)
    }
    /// Reconcile by identity before retrying. No automatic resume/reset on open/load.
    pub fn load(&self, id: &str, policy: &impl RetentionPolicy) -> Result<PublicQuestion> {
        let _lock = self.lock()?;
        self.load_locked(id, policy)
    }
    /// Explicitly publish the original fully persisted pending bytes. Partial/corrupt
    /// bytes stay blocked. New caller content cannot overwrite an uncertain operation.
    pub fn resume(&self, id: &str, policy: &impl RetentionPolicy) -> Result<[u8; 32]> {
        let _lock = self.lock()?;
        let (pending, committed) = self.paths(id)?;
        if exists(&committed)? {
            let r = self.load_locked(id, policy)?;
            self.sync_publication()?;
            return r.digest();
        }
        if !exists(&pending)? {
            return Err(MemoryError::NotFound);
        }
        let r = self.read(&pending, id)?;
        authorize(policy, Access::Retain, &r)?;
        self.check_edge(&r, policy)?;
        File::open(&pending)?.sync_all()?;
        fs::rename(pending, committed)?;
        self.sync_publication()?;
        r.digest()
    }
    pub fn project(
        &self,
        subject: &str,
        policy: &impl RetentionPolicy,
    ) -> Result<SubjectProjection> {
        identifier(subject)?;
        let _lock = self.lock()?;
        // Any incomplete transaction makes the global view incomplete, not current.
        if fs::read_dir(self.root.join("pending"))?
            .next()
            .transpose()?
            .is_some()
        {
            return Err(MemoryError::Pending);
        }
        let mut all = BTreeMap::new();
        for (n, entry) in fs::read_dir(self.root.join("objects"))?.enumerate() {
            if n >= MAX_RECORDS {
                return Err(MemoryError::Capacity);
            }
            let entry = entry?;
            let r = read_record(&entry.path())?;
            if entry.file_name() != std::ffi::OsStr::new(&key(&r.object_id)) {
                return Err(MemoryError::Corrupt);
            }
            authorize(policy, Access::Read, &r)?;
            all.insert(r.object_id.clone(), r);
        }
        // Validate graph before deriving; a lost source must not silently change history.
        let mut hidden = BTreeSet::new();
        for r in all.values() {
            if let Some(edge) = &r.supersedes {
                let target = all
                    .get(&edge.target_object_id)
                    .ok_or(MemoryError::Corrupt)?;
                if target.subject_id != r.subject_id {
                    return Err(MemoryError::Corrupt);
                }
                authorize(policy, Access::Supersede, r)?;
                let mut seen = BTreeSet::new();
                let mut cursor = r;
                while let Some(e) = &cursor.supersedes {
                    if !seen.insert(&cursor.object_id) {
                        return Err(MemoryError::Corrupt);
                    }
                    cursor = all.get(&e.target_object_id).ok_or(MemoryError::Corrupt)?;
                }
                hidden.insert(edge.target_object_id.clone());
            }
        }
        let history: Vec<_> = all
            .into_values()
            .filter(|r| r.subject_id == subject)
            .collect();
        let active_object_ids: Vec<_> = history
            .iter()
            .filter(|r| !hidden.contains(&r.object_id))
            .map(|r| r.object_id.clone())
            .collect();
        Ok(SubjectProjection {
            subject_id: subject.to_owned(),
            has_unresolved_alternatives: active_object_ids.len() > 1,
            history,
            active_object_ids,
        })
    }
    fn load_locked(&self, id: &str, policy: &impl RetentionPolicy) -> Result<PublicQuestion> {
        let (pending, committed) = self.paths(id)?;
        if exists(&pending)? {
            return Err(if exists(&committed)? {
                MemoryError::Corrupt
            } else {
                MemoryError::Pending
            });
        }
        if !exists(&committed)? {
            return Err(MemoryError::NotFound);
        }
        let r = self.read(&committed, id)?;
        authorize(policy, Access::Read, &r)?;
        Ok(r)
    }
    fn check_edge(&self, r: &PublicQuestion, p: &impl RetentionPolicy) -> Result<()> {
        if let Some(e) = &r.supersedes {
            let target = self.load_locked(&e.target_object_id, p)?;
            if target.subject_id != r.subject_id {
                return Err(MemoryError::Invalid);
            }
            authorize(p, Access::Supersede, r)?;
        }
        Ok(())
    }
    fn boundary(&self, _label: &'static str) -> Result<()> {
        #[cfg(test)]
        if self.fail_after == Some(_label) {
            return Err(MemoryError::Storage(io::Error::new(
                io::ErrorKind::Interrupted,
                "injected boundary failure",
            )));
        }
        Ok(())
    }
    fn check_capacity(&self) -> Result<()> {
        let mut count = 0;
        for area in ["objects", "pending"] {
            for entry in fs::read_dir(self.root.join(area))? {
                entry?;
                count += 1;
                if count >= MAX_RECORDS {
                    return Err(MemoryError::Capacity);
                }
            }
        }
        if count >= MAX_RECORDS {
            Err(MemoryError::Capacity)
        } else {
            Ok(())
        }
    }
    fn paths(&self, id: &str) -> Result<(PathBuf, PathBuf)> {
        identifier(id)?;
        let k = key(id);
        Ok((
            self.root.join("pending").join(&k),
            self.root.join("objects").join(k),
        ))
    }
    fn read(&self, path: &Path, id: &str) -> Result<PublicQuestion> {
        let r = read_record(path)?;
        if r.object_id != id {
            Err(MemoryError::Corrupt)
        } else {
            Ok(r)
        }
    }
    fn sync_publication(&self) -> Result<()> {
        sync(&self.root.join("objects"))?;
        sync(&self.root.join("pending"))
    }
    fn lock(&self) -> Result<StoreLock> {
        let path = self.root.join("lock");
        if exists(&path)? && !fs::symlink_metadata(&path)?.file_type().is_file() {
            return Err(MemoryError::Corrupt);
        }
        let mut options = OpenOptions::new();
        options.read(true).write(true).create(true).truncate(false);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            options.mode(0o600);
        }
        let f = options.open(path)?;
        fs2::FileExt::try_lock_exclusive(&f).map_err(|e| {
            if e.kind() == io::ErrorKind::WouldBlock {
                MemoryError::Busy
            } else {
                e.into()
            }
        })?;
        // Explicit unlock also releases a descriptor briefly inherited during fork.
        Ok(StoreLock(f))
    }
}
struct StoreLock(File);
impl Drop for StoreLock {
    fn drop(&mut self) {
        let _ = fs2::FileExt::unlock(&self.0);
    }
}
fn authorize(p: &impl RetentionPolicy, a: Access, r: &PublicQuestion) -> Result<()> {
    if p.allows(a, r, &r.digest()?) {
        Ok(())
    } else {
        Err(MemoryError::Denied)
    }
}
fn key(id: &str) -> String {
    sha256(id.as_bytes())
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect()
}
fn exists(p: &Path) -> Result<bool> {
    match fs::symlink_metadata(p) {
        Ok(_) => Ok(true),
        Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(false),
        Err(e) => Err(e.into()),
    }
}
fn directory(p: &Path, create: bool) -> Result<()> {
    if create && !exists(p)? {
        let mut builder = fs::DirBuilder::new();
        #[cfg(unix)]
        {
            use std::os::unix::fs::DirBuilderExt;
            builder.mode(0o700);
        }
        match builder.create(p) {
            Ok(()) => (),
            Err(e) if e.kind() == io::ErrorKind::AlreadyExists => (),
            Err(e) => return Err(e.into()),
        }
    }
    if !fs::symlink_metadata(p)?.file_type().is_dir() {
        return Err(MemoryError::Corrupt);
    }
    Ok(())
}
fn sync(p: &Path) -> Result<()> {
    File::open(p)?.sync_all().map_err(Into::into)
}
fn new_file(p: &Path) -> Result<File> {
    let mut o = OpenOptions::new();
    o.create_new(true).write(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        o.mode(0o600);
    }
    Ok(o.open(p)?)
}
fn read_record(p: &Path) -> Result<PublicQuestion> {
    let m = fs::symlink_metadata(p)?;
    if !m.file_type().is_file() || m.len() > MAX_RECORD_BYTES as u64 + 32 {
        return Err(MemoryError::Corrupt);
    }
    let mut b = Vec::new();
    File::open(p)?
        .take(MAX_RECORD_BYTES as u64 + 33)
        .read_to_end(&mut b)?;
    if b.len() < 32 || b.len() > MAX_RECORD_BYTES + 32 {
        return Err(MemoryError::Corrupt);
    }
    let (body, digest) = b.split_at(b.len() - 32);
    if sha256(body).as_slice() != digest {
        return Err(MemoryError::Corrupt);
    }
    PublicQuestion::decode(body)
}
fn identifier(s: &str) -> Result<()> {
    let b = s.as_bytes();
    if b.is_empty()
        || b.len() > 256
        || !b[0].is_ascii_alphanumeric()
        || !b
            .iter()
            .all(|c| c.is_ascii_alphanumeric() || b":._/-".contains(c))
    {
        return Err(MemoryError::Invalid);
    }
    Ok(())
}
fn text(s: &str) -> Result<()> {
    if s.is_empty() || s.len() > 4096 || s.contains('\0') {
        Err(MemoryError::Invalid)
    } else {
        Ok(())
    }
}
/// Restricted RFC3339 UTC seconds profile, preserving timestamps without inference.
fn timestamp(s: &str) -> Result<()> {
    let b = s.as_bytes();
    if b.len() != 20
        || b[4] != b'-'
        || b[7] != b'-'
        || b[10] != b'T'
        || b[13] != b':'
        || b[16] != b':'
        || b[19] != b'Z'
        || !b
            .iter()
            .enumerate()
            .all(|(i, c)| [4, 7, 10, 13, 16, 19].contains(&i) || c.is_ascii_digit())
    {
        return Err(MemoryError::Invalid);
    }
    let num = |a: usize, z: usize| s[a..z].parse::<u32>().map_err(|_| MemoryError::Invalid);
    let y = num(0, 4)?;
    let m = num(5, 7)?;
    let day = num(8, 10)?;
    let leap = y % 4 == 0 && (y % 100 != 0 || y % 400 == 0);
    let days = match m {
        1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
        4 | 6 | 9 | 11 => 30,
        2 => {
            if leap {
                29
            } else {
                28
            }
        }
        _ => 0,
    };
    if y == 0
        || day == 0
        || day > days
        || num(11, 13)? > 23
        || num(14, 16)? > 59
        || num(17, 19)? > 59
    {
        return Err(MemoryError::Invalid);
    }
    Ok(())
}
fn put(b: &mut Vec<u8>, s: &str) {
    b.extend_from_slice(&(s.len() as u32).to_be_bytes());
    b.extend_from_slice(s.as_bytes());
}
fn optional(b: &mut Vec<u8>, s: Option<&str>) {
    b.push(u8::from(s.is_some()));
    if let Some(s) = s {
        put(b, s);
    }
}
struct Decoder<'a>(&'a [u8]);
impl<'a> Decoder<'a> {
    fn take(&mut self, n: usize) -> Result<&'a [u8]> {
        if n > self.0.len() {
            return Err(MemoryError::Corrupt);
        }
        let (a, b) = self.0.split_at(n);
        self.0 = b;
        Ok(a)
    }
    fn byte(&mut self) -> Result<u8> {
        Ok(self.take(1)?[0])
    }
    fn flag(&mut self) -> Result<bool> {
        match self.byte()? {
            0 => Ok(false),
            1 => Ok(true),
            _ => Err(MemoryError::Corrupt),
        }
    }
    fn text(&mut self) -> Result<String> {
        let n = u32::from_be_bytes(self.take(4)?.try_into().map_err(|_| MemoryError::Corrupt)?)
            as usize;
        if n > 4096 {
            return Err(MemoryError::Corrupt);
        }
        String::from_utf8(self.take(n)?.to_vec()).map_err(|_| MemoryError::Corrupt)
    }
    fn optional(&mut self) -> Result<Option<String>> {
        if self.flag()? {
            Ok(Some(self.text()?))
        } else {
            Ok(None)
        }
    }
    fn claim(&mut self) -> Result<Claim> {
        [
            Claim::Observation,
            Claim::Report,
            Claim::Inference,
            Claim::Proposal,
            Claim::Unknown,
        ]
        .get(self.byte()? as usize)
        .copied()
        .ok_or(MemoryError::Corrupt)
    }
}

#[cfg(test)]
mod publication_faults {
    use super::*;
    struct SyntheticPolicy;
    impl RetentionPolicy for SyntheticPolicy {
        fn allows(&self, _: Access, _: &PublicQuestion, _: &[u8; 32]) -> bool {
            true
        }
    }
    #[test]
    fn explicit_unlock_releases_inherited_open_file_description() {
        let root = std::env::temp_dir().join(format!(
            "a17-lock-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        fs::create_dir(&root).unwrap();
        let store = FileDevelopmentMemory::open(&root).unwrap();
        let guard = store.lock().unwrap();
        let inherited = guard.0.try_clone().unwrap();
        drop(guard);
        let next = store.lock().unwrap();
        drop(next);
        drop(inherited);
        fs::remove_dir_all(root).unwrap();
    }
    #[test]
    fn interrupted_publication_is_reconciled_at_each_boundary_without_rewriting() {
        let h = include_str!("../../../docs/specs/runtime/fixtures/a17-v1/question.hex").trim();
        let bytes: Vec<u8> = (0..h.len())
            .step_by(2)
            .map(|i| u8::from_str_radix(&h[i..i + 2], 16).unwrap())
            .collect();
        let r = PublicQuestion::decode(&bytes).unwrap();
        for boundary in ["create", "write", "flush", "rename", "sync"] {
            let root = std::env::temp_dir().join(format!(
                "a17-fault-{}-{}-{}",
                std::process::id(),
                boundary,
                std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_nanos()
            ));
            fs::create_dir(&root).unwrap();
            let mut store = FileDevelopmentMemory::open(&root).unwrap();
            store.fail_after = Some(boundary);
            assert!(matches!(
                store.append(&r, &SyntheticPolicy),
                Err(MemoryError::Storage(_))
            ));
            drop(store);
            let store = FileDevelopmentMemory::open(&root).unwrap();
            if ["create", "write", "flush"].contains(&boundary) {
                assert!(matches!(
                    store.load(&r.object_id, &SyntheticPolicy),
                    Err(MemoryError::Pending)
                ));
            }
            if boundary == "create" {
                assert!(matches!(
                    store.resume(&r.object_id, &SyntheticPolicy),
                    Err(MemoryError::Corrupt)
                ));
            } else {
                assert_eq!(
                    store.resume(&r.object_id, &SyntheticPolicy).unwrap(),
                    r.digest().unwrap()
                );
                assert_eq!(store.load(&r.object_id, &SyntheticPolicy).unwrap(), r);
            }
            fs::remove_dir_all(root).unwrap();
        }
    }
}
