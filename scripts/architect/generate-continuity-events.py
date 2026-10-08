#!/usr/bin/env python3
"""Project reviewed append-only event metadata; no sessions or provider operations."""
import argparse
import datetime
import hashlib
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[2]
DIRECTORY = Path('docs/governance/architectgpt')
SOURCE = DIRECTORY / 'continuity-events.jsonl'
OUTPUT = DIRECTORY / 'continuity-events.json'
CHECKPOINT = (DIRECTORY / 'present-state-checkpoint-20261008.md').as_posix()
GAPS = ['ARC-SES-11..22 originals remain unreconciled.',
        'External ARC-SES-23 retains its ID; not canonicalized as a session here.']


def derive(root=ROOT):
    rows = [json.loads(line) for line in (root / SOURCE).read_text().splitlines() if line]
    if not rows:
        raise ValueError("empty event chronology")
    ids = set()
    required = {'event_id', 'event_date', 'observed_at', 'recorded_on', 'title',
                'arc_id', 'session_id', 'source_ref', 'source_revision',
                'content_digest_sha256', 'authority_class', 'claim_class', 'limits'}
    previous = ''
    for row in rows:
        if set(row) != required or not re.fullmatch(r'ARC-EVT-\d{8}-\d{4}', row['event_id']):
            raise ValueError('invalid event envelope')
        eid = row['event_id']
        if eid in ids or eid <= previous:
            raise ValueError('event IDs must be unique and append in allocation order')
        ids.add(eid)
        previous = eid
        if row['session_id'] is not None:
            raise ValueError('this bounded reconciliation allocates no session IDs')
        if row['arc_id'] is not None and not re.fullmatch(r'CE-W\d{2}-A\d{2}', row['arc_id']):
            raise ValueError('invalid construction arc')
        for key in ('event_date', 'recorded_on'):
            if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', row[key]):
                raise ValueError('invalid date')
            datetime.date.fromisoformat(row[key])
        if row['event_date'] > row['recorded_on'] or eid[8:16] != row['recorded_on'].replace('-', ''):
            raise ValueError('inconsistent event/allocation date')
        if row['authority_class'] != 'continuity-metadata-only' or row['claim_class'] != 'report' or not row['limits'] or not row['title']:
            raise ValueError('invalid claim or missing limits')
        path, marker, heading = row['source_ref'].partition('#')
        if path != (DIRECTORY / 'architect-log.md').as_posix() or not marker:
            raise ValueError('source outside controlling log')
        revision = row['source_revision']
        if revision is None:
            raw = (root / path).read_text()
        else:
            if not re.fullmatch(r'[0-9a-f]{40}', revision):
                raise ValueError('source revision must be exact')
            raw = subprocess.check_output(['git', 'show', f'{revision}:{path}'], cwd=root).decode()
        sections = re.split(r'(?m)(?=^#{2,3} CONTINUITY-EVENT — )', raw)
        matching = [s for s in sections if s.splitlines()[0] == heading]
        if len(matching) != 1 or hashlib.sha256((matching[0].rstrip('\n') + '\n').encode()).hexdigest() != row['content_digest_sha256']:
            raise ValueError('event source missing or digest mismatch')
    # Against the last committed source, every prior record must be an exact prefix.
    history = subprocess.check_output(
        ['git', 'log', '--format=%H', '-2', '--', str(SOURCE)], cwd=root).decode().splitlines()
    # HEAD catches uncommitted edits; the previous source-changing commit also
    # catches a rewrite already committed before CI, including index companions.
    refs = ['HEAD'] + history[1:]
    for ref in refs:
        prior = subprocess.run(['git', 'show', f'{ref}:{SOURCE}'], cwd=root, capture_output=True)
        if prior.returncode == 0:
            old = [json.loads(line) for line in prior.stdout.decode().splitlines() if line]
            if rows[:len(old)] != old:
                raise ValueError('existing event records cannot be removed, reordered or rewritten')
    if not (root / CHECKPOINT).is_file():
        raise ValueError('checkpoint missing')
    return {'schema': 'arcanum.architect.continuity-events/v1',
            'authority': 'derived-non-authoritative', 'active_epoch': 'ARC-CONT-EPOCH-2',
            'latest_checkpoint': CHECKPOINT, 'known_gaps': GAPS, 'events': rows}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    try:
        raw = json.dumps(derive(), ensure_ascii=False, sort_keys=True, indent=2) + '\n'
        if args.check:
            if (ROOT / OUTPUT).read_text() != raw:
                raise ValueError('event projection stale')
        else:
            (ROOT / OUTPUT).write_text(raw)
        print('PASS continuity events: sources, append-only prefix and independent IDs')
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        parser.exit(1, f'FAIL continuity events: {error}\n')


if __name__ == '__main__':
    main()
