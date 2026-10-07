#!/usr/bin/env python3
"""Validate reviewed observations and render a dated view. No probes or dispatch."""
import argparse
import datetime as dt
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'docs/governance/architectgpt/operational-capabilities.json'
OUTPUT = SOURCE.with_suffix('.md')


def require(condition, message):
    if not condition:
        raise ValueError(message)


def text(value):
    require(isinstance(value, str) and bool(value.strip()), 'empty or invalid text')
    require(not any(ord(c) < 32 for c in value), 'control character in text')
    # Render descriptions as literal table text, never executable Markdown/HTML.
    return value.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('|', '&#124;').replace('`', '&#96;').replace('[', '&#91;').replace(']', '&#93;').replace('*', '&#42;').replace('_', '&#95;')


def render(data):
    require(set(data) == {'schema', 'as_of', 'observed_main', 'authority', 'capabilities'}, 'unexpected source fields')
    require(data['schema'] == 'arcanum.operational-observations/v1', 'unsupported schema')
    require(data['authority'] == 'observation-only', 'observations cannot grant authority')
    require(isinstance(data['as_of'], str) and re.fullmatch(r'\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ', data['as_of']), 'invalid snapshot time')
    as_of = dt.datetime.fromisoformat(data['as_of'].replace('Z', '+00:00'))
    require(isinstance(data['observed_main'], str) and re.fullmatch(r'[0-9a-f]{40}', data['observed_main']), 'invalid observed commit')
    require(isinstance(data['capabilities'], list) and data['capabilities'], 'empty capability set')
    ids = set()
    rows = []
    for item in data['capabilities']:
        require(set(item) == {'id', 'surface', 'status', 'observed_on', 'summary', 'limitations', 'before_use', 'evidence'}, 'unexpected capability fields')
        require(isinstance(item['id'], str) and re.fullmatch(r'[a-z][a-z0-9-]+', item['id']), 'invalid capability id')
        require(item['id'] not in ids, 'duplicate capability id')
        ids.add(item['id'])
        require(item['status'] in {'passed', 'failed', 'untested'}, 'unknown result')
        require(isinstance(item['observed_on'], str) and re.fullmatch(r'\d{4}-\d\d-\d\d', item['observed_on']), 'invalid observation date')
        require(dt.date.fromisoformat(item['observed_on']) <= as_of.date(), 'observation after snapshot')
        require(isinstance(item['limitations'], list) and item['limitations'], 'limitations required')
        limits = ' '.join(text(v) for v in item['limitations'])
        require(isinstance(item['evidence'], list) and item['evidence'], 'evidence required')
        links = []
        for ref in item['evidence']:
            require(isinstance(ref, str) and re.fullmatch(r'docs/[a-zA-Z0-9_./-]+\.md', ref), 'invalid evidence path')
            path = (ROOT / ref).resolve()
            require(path.is_relative_to(ROOT / 'docs') and path.is_file(), 'missing or escaped evidence')
            links.append('[record](../../../' + ref + ')')
        rows.append((item['id'], f"| {text(item['surface'])} / {text(item['id'])} | {text(item['status'])} | {text(item['summary'])} | {limits} | {text(item['before_use'])} | {item['observed_on']} / {', '.join(links)} |"))
    head = f'''# Operational capabilities

Snapshot: **{data['as_of']}**. Observed starting main: `{data['observed_main']}`.

This register answers what was tested and where it stopped. It is a reviewed,
dated observation set, not live health, an action registry or a permission grant.
A passed result applies only to its stated probe. Untested is not a failure.
Refresh required evidence before relying on a connection or changing state.
No private Hope data is included. Prior results remain in dated evidence and Git.

Use alongside the [current-state view](current-state.md), which explains project
status, source precedence and proposed extensions. See the
[baseline and archive report](../../evidence/operational-baseline-20261007/review.md)
for environment setup, retained exceptions and preservation evidence.

| Surface / capability | Result | What was observed | Limits | Before relying on it | Observation / evidence |
| --- | --- | --- | --- | --- | --- |
'''
    return head + '\n'.join(row for _, row in sorted(rows)) + '''

Source: `operational-capabilities.json`. Regenerate with
`python3 scripts/architect/generate-operational-capabilities.py`; `--check` compares
without writing. Generation performs no network reads or capability tests, and
cannot certify the truth or consent behind a manually reviewed observation.
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    try:
        content = render(json.loads(SOURCE.read_text(encoding='utf-8'))).encode('utf-8')
        if args.check:
            require(OUTPUT.read_bytes() == content, 'operational capabilities view is stale')
        else:
            OUTPUT.write_bytes(content)
        print('operational capabilities: valid, deterministic observation-only view')
    except (ValueError, TypeError, KeyError, OSError) as error:
        raise SystemExit(str(error)) from error


if __name__ == '__main__':
    main()
