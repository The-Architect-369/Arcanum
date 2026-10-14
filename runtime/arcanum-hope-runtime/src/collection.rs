//! Private, in-memory collection rules. Persistence and UI consent are host duties.
use crate::{canonical_reflection, json_string, HopeRecordError, HopeReflectionInput};
use std::collections::{BTreeMap, BTreeSet};
use std::fmt;
use std::sync::Arc;

pub const COLLECTION_VERSION: &str = "hope.collection.v0.1";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EntryState {
    Active,
    Archived,
}

impl EntryState {
    fn name(self) -> &'static str {
        match self {
            Self::Active => "active",
            Self::Archived => "archived",
        }
    }
}

/// Caller-asserted participant decision, not proof of identity or UI consent.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DeleteDecision {
    Cancel,
    Confirm,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CollectionError {
    InvalidRecord(HopeRecordError),
    InvalidTimestamp,
    DuplicateId,
    CapacityReached,
    InvalidCapacity,
    NotFound,
    StaleDeletion,
    CounterExhausted,
}

impl fmt::Display for CollectionError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        // Neither content nor identifiers, timestamps or counts belong in diagnostics.
        f.write_str(match self {
            Self::InvalidRecord(_) => "Invalid Hope reflection",
            Self::InvalidTimestamp => "Unsupported Hope capture timestamp",
            Self::DuplicateId => "Hope identifier already used",
            Self::CapacityReached => "Hope collection capacity reached",
            Self::InvalidCapacity => "Hope collection capacity must be positive",
            Self::NotFound => "Hope entry unavailable in selected view",
            Self::StaleDeletion => "Hope deletion selection is no longer current",
            Self::CounterExhausted => "Hope collection counter exhausted",
        })
    }
}

impl std::error::Error for CollectionError {}

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
struct InstantKey {
    seconds: i64,
    nanos: u32,
}

/// No public mutable access to saved records. Debug intentionally omits private data.
pub struct CollectionEntry {
    id: String,
    created_at: String,
    reflection_json: String,
    instant: InstantKey,
    sequence: u64,
    generation: u64,
    state: EntryState,
}

impl fmt::Debug for CollectionEntry {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("CollectionEntry([private])")
    }
}

impl CollectionEntry {
    pub fn id(&self) -> &str {
        &self.id
    }
    pub fn created_at(&self) -> &str {
        &self.created_at
    }
    pub fn reflection_json(&self) -> &str {
        &self.reflection_json
    }
    pub fn sequence(&self) -> u64 {
        self.sequence
    }
    pub fn state(&self) -> EntryState {
        self.state
    }
}

/// A process-local selection, invalid after a state change or collection replacement.
pub struct PendingDeletion {
    owner: Arc<()>,
    id: String,
    sequence: u64,
    generation: u64,
}

impl fmt::Debug for PendingDeletion {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("PendingDeletion([private])")
    }
}

pub struct HopeCollection {
    owner: Arc<()>,
    entries: BTreeMap<String, CollectionEntry>,
    retired_ids: BTreeSet<String>,
    next_sequence: u64,
    max_entries: usize,
}

impl fmt::Debug for HopeCollection {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("HopeCollection([private])")
    }
}

impl HopeCollection {
    /// Capacity is supplied by the host; active and archived entries both count.
    pub fn new(max_entries: usize) -> Result<Self, CollectionError> {
        if max_entries == 0 {
            return Err(CollectionError::InvalidCapacity);
        }
        Ok(Self {
            owner: Arc::new(()),
            entries: BTreeMap::new(),
            retired_ids: BTreeSet::new(),
            next_sequence: 0,
            max_entries,
        })
    }

    /// The host supplies an opaque ID; reuse (including a deleted ID) is rejected.
    pub fn save(&mut self, input: HopeReflectionInput<'_>) -> Result<(), CollectionError> {
        let reflection_json =
            canonical_reflection(input).map_err(CollectionError::InvalidRecord)?;
        let instant = parse_instant(input.created_at)?;
        if self.entries.contains_key(input.id) || self.retired_ids.contains(input.id) {
            return Err(CollectionError::DuplicateId);
        }
        if self.entries.len() >= self.max_entries {
            return Err(CollectionError::CapacityReached);
        }
        let next = self
            .next_sequence
            .checked_add(1)
            .ok_or(CollectionError::CounterExhausted)?;
        let entry = CollectionEntry {
            id: input.id.to_owned(),
            created_at: input.created_at.to_owned(),
            reflection_json,
            instant,
            sequence: self.next_sequence,
            generation: 0,
            state: EntryState::Active,
        };
        self.entries.insert(input.id.to_owned(), entry);
        self.next_sequence = next;
        Ok(())
    }

    pub fn recall(&self, id: &str) -> Option<&CollectionEntry> {
        self.entry_in(id, EntryState::Active)
    }

    /// Deliberate archive access; ordinary recall never returns archived entries.
    pub fn recall_archived(&self, id: &str) -> Option<&CollectionEntry> {
        self.entry_in(id, EntryState::Archived)
    }

    pub fn browse(&self) -> Vec<&CollectionEntry> {
        self.ordered(EntryState::Active)
    }

    pub fn browse_archived(&self) -> Vec<&CollectionEntry> {
        self.ordered(EntryState::Archived)
    }

    pub fn archive(&mut self, id: &str) -> Result<bool, CollectionError> {
        self.set_state(id, EntryState::Archived)
    }

    pub fn restore(&mut self, id: &str) -> Result<bool, CollectionError> {
        self.set_state(id, EntryState::Active)
    }

    pub fn prepare_delete(
        &self,
        id: &str,
        view: EntryState,
    ) -> Result<PendingDeletion, CollectionError> {
        let entry = self.entry_in(id, view).ok_or(CollectionError::NotFound)?;
        Ok(PendingDeletion {
            owner: Arc::clone(&self.owner),
            id: entry.id.clone(),
            sequence: entry.sequence,
            generation: entry.generation,
        })
    }

    pub fn delete(
        &mut self,
        selection: PendingDeletion,
        decision: DeleteDecision,
    ) -> Result<bool, CollectionError> {
        if decision == DeleteDecision::Cancel {
            return Ok(false);
        }
        if !Arc::ptr_eq(&self.owner, &selection.owner) {
            return Err(CollectionError::StaleDeletion);
        }
        let entry = self
            .entries
            .get(&selection.id)
            .ok_or(CollectionError::StaleDeletion)?;
        if entry.sequence != selection.sequence || entry.generation != selection.generation {
            return Err(CollectionError::StaleDeletion);
        }
        self.retired_ids.insert(selection.id.clone());
        self.entries.remove(&selection.id);
        Ok(true)
    }

    /// Private plaintext interchange ONLY for the future protected-store boundary.
    /// This is not a diagnostic, public export, on-disk format or restore decoder.
    pub fn private_snapshot_json(&self) -> String {
        let mut entries: Vec<_> = self.entries.values().collect();
        entries.sort_by_key(|entry| entry.sequence);
        let entries = entries
            .iter()
            .map(|entry| {
                format!(
                    "{{\"id\":{},\"createdAt\":{},\"sequence\":{},\"state\":{},\"reflectionJson\":{}}}",
                    json_string(&entry.id),
                    json_string(&entry.created_at),
                    json_string(&entry.sequence.to_string()),
                    json_string(entry.state.name()),
                    json_string(&entry.reflection_json),
                )
            })
            .collect::<Vec<_>>()
            .join(",");
        let retired = self
            .retired_ids
            .iter()
            .map(|id| json_string(id))
            .collect::<Vec<_>>()
            .join(",");
        format!(
            "{{\"version\":{},\"nextSequence\":{},\"entries\":[{}],\"retiredIds\":[{}]}}",
            json_string(COLLECTION_VERSION),
            json_string(&self.next_sequence.to_string()),
            entries,
            retired,
        )
    }

    fn entry_in(&self, id: &str, state: EntryState) -> Option<&CollectionEntry> {
        self.entries.get(id).filter(|entry| entry.state == state)
    }

    fn ordered(&self, state: EntryState) -> Vec<&CollectionEntry> {
        let mut entries: Vec<_> = self
            .entries
            .values()
            .filter(|entry| entry.state == state)
            .collect();
        entries.sort_by_key(|entry| (entry.instant, entry.sequence));
        entries
    }

    fn set_state(&mut self, id: &str, state: EntryState) -> Result<bool, CollectionError> {
        let entry = self.entries.get_mut(id).ok_or(CollectionError::NotFound)?;
        if entry.state == state {
            return Ok(false);
        }
        let generation = entry
            .generation
            .checked_add(1)
            .ok_or(CollectionError::CounterExhausted)?;
        entry.state = state;
        entry.generation = generation;
        Ok(true)
    }
}

// Restricted RFC3339 profile: years 0001..9999, T/Z, 0..9 fractional digits,
// numeric offsets (except unknown -00:00). No leap seconds or silent coercion.
fn parse_instant(text: &str) -> Result<InstantKey, CollectionError> {
    let invalid = CollectionError::InvalidTimestamp;
    let b = text.as_bytes();
    if b.len() < 20
        || b[4] != b'-'
        || b[7] != b'-'
        || b[10] != b'T'
        || b[13] != b':'
        || b[16] != b':'
    {
        return Err(invalid);
    }
    fn number(b: &[u8]) -> Option<i64> {
        b.iter().try_fold(0, |n, digit| {
            digit
                .is_ascii_digit()
                .then(|| n * 10 + i64::from(digit - b'0'))
        })
    }
    let year = number(&b[..4]).ok_or(invalid.clone())?;
    let month = number(&b[5..7]).ok_or(invalid.clone())?;
    let day = number(&b[8..10]).ok_or(invalid.clone())?;
    let hour = number(&b[11..13]).ok_or(invalid.clone())?;
    let minute = number(&b[14..16]).ok_or(invalid.clone())?;
    let second = number(&b[17..19]).ok_or(invalid.clone())?;
    let leap = year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
    let months = [
        31,
        if leap { 29 } else { 28 },
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
    ];
    if year == 0
        || !(1..=12).contains(&month)
        || day < 1
        || day > months[(month - 1) as usize]
        || hour > 23
        || minute > 59
        || second > 59
    {
        return Err(invalid);
    }
    let mut position = 19;
    let mut nanos = 0;
    if b[position] == b'.' {
        position += 1;
        let start = position;
        while position < b.len() && b[position].is_ascii_digit() {
            position += 1;
        }
        let digits = position - start;
        if !(1..=9).contains(&digits) {
            return Err(invalid);
        }
        nanos = number(&b[start..position]).ok_or(invalid.clone())? as u32
            * 10_u32.pow((9 - digits) as u32);
    }
    let zone = &b[position..];
    let offset = if zone == b"Z" {
        0
    } else if zone.len() == 6 && (zone[0] == b'+' || zone[0] == b'-') && zone[3] == b':' {
        let hours = number(&zone[1..3]).ok_or(invalid.clone())?;
        let minutes = number(&zone[4..6]).ok_or(invalid.clone())?;
        if hours > 23 || minutes > 59 || zone == b"-00:00" {
            return Err(invalid);
        }
        (hours * 3600 + minutes * 60) * if zone[0] == b'-' { -1 } else { 1 }
    } else {
        return Err(invalid);
    };
    let previous = year - 1;
    let days = previous * 365 + previous / 4 - previous / 100
        + previous / 400
        + months[..(month - 1) as usize].iter().sum::<i64>()
        + day
        - 1;
    Ok(InstantKey {
        seconds: days * 86400 + hour * 3600 + minute * 60 + second - offset,
        nanos,
    })
}

#[cfg(test)]
mod internal_tests {
    use super::*;

    #[test]
    fn exhausted_counters_do_not_mutate() {
        let input = HopeReflectionInput {
            id: "synthetic",
            created_at: "2026-10-13T00:00:00Z",
            prompt: None,
            user_text: "fixture",
            hope_text: None,
            tempus: None,
        };
        let mut c = HopeCollection::new(3).unwrap();
        c.next_sequence = u64::MAX;
        let before = c.private_snapshot_json();
        assert_eq!(c.save(input), Err(CollectionError::CounterExhausted));
        assert_eq!(c.private_snapshot_json(), before);
        c.next_sequence = 0;
        c.save(input).unwrap();
        c.entries.get_mut("synthetic").unwrap().generation = u64::MAX;
        assert_eq!(
            c.archive("synthetic"),
            Err(CollectionError::CounterExhausted)
        );
        assert_eq!(c.recall("synthetic").unwrap().state(), EntryState::Active);
    }
}
