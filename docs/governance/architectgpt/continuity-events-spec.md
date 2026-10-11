---
title: "Independent continuity event chronology"
status: review-candidate
visibility: public
last_updated: 2026-10-08
---

# Independent continuity event chronology

Wave/Arc represents capability and dependencies. ARC-SES identifies reviewed
conversations. ARC-EVT identifies material chronology independently of both.
The controlling append-only architect log remains the source of event claims;
this index is metadata evidence and grants no authority or session closure.

`continuity-events.jsonl` is the reviewed append-only source. One JSON record per
line binds an allocation ID, original event date, observation timestamp (nullable
when unknown), recording date, title, optional construction arc, optional session,
exact source revision/heading and SHA-256 of the complete source section with trailing newlines normalized to one, claim
and authority class, and limits. Provider/commit/effect evidence remains in that
bound section. Historical entries indexed October8 receive IDs allocated on
October8; the ID date is allocation date, not proof of original occurrence time.

IDs use ARC-EVT-YYYYMMDD-NNNN, increasing in append/allocation order. Late evidence
keeps its true event date and appends a new ID; do not renumber earlier events to
sort by occurrence date. Corrections append new log/source records, referencing
the prior ID. Never remove, reorder or rewrite previously committed source rows.
Only public minimized metadata is allowed. Private Hope/Journey bodies and
sensitive derivatives remain excluded.

`generate-continuity-events.py` deterministically writes `continuity-events.json`,
including events, latest_checkpoint and known_gaps. `--check` verifies sources,
digests, independent IDs, checkpoint existence and the committed append-only prefix.
It reads no providers, writes no sessions and never changes continuity-index.json.
This initial candidate allows no session references; later recovered sessions need
an additive reviewed extension under the existing session contract.

Unpinned rows bind new candidate log sections by digest; historical rows bind exact
Git blobs. A later update must pin existing unpinned rows without changing their
original recorded data: until an explicitly reviewed migration contract exists,
leave those rows intact and keep their source section immutable. Canonical adoption
requires its separate review/merge gate. Source validation is not adoption.

Validation: `python3 scripts/architect/generate-continuity-events.py --check`.
