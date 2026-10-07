#!/usr/bin/env python3
"""Offline, bounded projection of reviewed public continuity evidence. No authority effects."""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
DIRECTORY = Path('docs/governance/architectgpt')
INPUT = DIRECTORY / 'coherence/objects.json'
OBJECT_SCHEMA = Path('docs/specs/runtime/sovereign-continuity-object.schema.json')
OUTPUT_SCHEMA = DIRECTORY / 'current-state.schema.json'
PROFILE = DIRECTORY / 'current-state-profile.md'
# Highest authority first, scoped to the field; recency never breaks a tie.
REPOSITORY = ['canonical-repository', 'operational-record', 'derived']
PLANNING = ['human-decision', 'operational-record', 'canonical-repository', 'derived']
POLICIES = {
    'canonical_base': REPOSITORY, 'era': REPOSITORY, 'wave': REPOSITORY,
    'completed_arc': REPOSITORY, 'next_arc': PLANNING, 'following_arc': PLANNING,
    'continuity_epoch': REPOSITORY, 'continuity_gaps': REPOSITORY,
    'source_conflicts': REPOSITORY, 'implementation_gate': PLANNING,
    'outstanding_human_decisions': PLANNING, 'a19_baseline': PLANNING,
    'hope_extensions': PLANNING, 'a20_baseline': PLANNING,
    'spatial_extensions': PLANNING, 'agent_c_state': PLANNING,
}
PROPOSAL_FIELDS = {'hope_extensions', 'spatial_extensions'}


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + '\n').encode('utf-8')


def require(condition, message):
    if not condition:
        raise ValueError(message)


def timestamp(value):
    require(isinstance(value, str) and re.fullmatch(
        r'\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)', value), 'invalid timestamp')
    return dt.datetime.fromisoformat(value.replace('Z', '+00:00'))


def audit_schema(schema):
    supported = {'$schema', '$id', 'title', 'description', 'type', 'const', 'enum',
                 'required', 'properties', 'additionalProperties', 'items', 'minItems',
                 'uniqueItems', 'minLength', 'pattern', 'minimum', 'format',
                 'allOf', 'if', 'then', 'else'}
    require(not set(schema) - supported, 'unsupported schema keyword')
    for child in schema.get('properties', {}).values():
        audit_schema(child)
    for child in schema.get('allOf', []):
        audit_schema(child)
    for key in ('items', 'if', 'then', 'else'):
        if key in schema:
            audit_schema(schema[key])


def validate(value, schema):
    """Closed subset used by these two schemas, not a general JSON Schema engine.

    Unsupported assertions fail closed. No reference resolution or network fetching.
    """
    audit_schema(schema)
    types = {'object': lambda x: isinstance(x, dict), 'array': lambda x: isinstance(x, list),
             'string': lambda x: isinstance(x, str), 'null': lambda x: x is None,
             'boolean': lambda x: type(x) is bool, 'integer': lambda x: type(x) is int}
    if 'type' in schema:
        names = schema['type'] if isinstance(schema['type'], list) else [schema['type']]
        require(all(n in types for n in names), 'unsupported schema type')
        require(any(types[n](value) for n in names), 'schema type mismatch')
    if 'const' in schema:
        require(value == schema['const'], 'schema constant mismatch')
    if 'enum' in schema:
        require(value in schema['enum'], 'schema enum mismatch')
    if isinstance(value, dict):
        require(set(schema.get('required', [])) <= set(value), 'missing required keys')
        properties = schema.get('properties', {})
        if schema.get('additionalProperties') is False:
            require(set(value) <= set(properties), 'unexpected keys')
        for key in value.keys() & properties.keys():
            validate(value[key], properties[key])
    if isinstance(value, list):
        require(len(value) >= schema.get('minItems', 0), 'too few items')
        if schema.get('uniqueItems'):
            require(len({encoded(v) for v in value}) == len(value), 'duplicate items')
        for item in value:
            validate(item, schema.get('items', {}))
    if isinstance(value, str):
        require(len(value) >= schema.get('minLength', 0), 'string too short')
        if 'pattern' in schema:
            require(re.search(schema['pattern'], value) is not None, 'pattern mismatch')
        if 'format' in schema:
            require(schema['format'] == 'date-time', 'unsupported format')
            timestamp(value)
    if type(value) is int and 'minimum' in schema:
        require(value >= schema['minimum'], 'below minimum')
    for clause in schema.get('allOf', []):
        validate(value, clause)
    if 'if' in schema:
        try:
            validate(value, schema['if'])
        except ValueError:
            validate(value, schema.get('else', {}))
        else:
            validate(value, schema.get('then', {}))


def source_bytes(source, root):
    """Only explicit repository paths; pinned Git blobs or reviewed working source."""
    path = source['source_ref'].split('#', 1)[0]
    rel = PurePosixPath(path)
    require(not rel.is_absolute() and '..' not in rel.parts and path.startswith('docs/'),
            'source outside documentation boundary')
    revision = source['source_revision']
    if revision is None:
        # The profile is the only uncommitted source, holding the reviewed recovery report.
        require(path == PROFILE.as_posix(), 'unpinned source outside reviewed profile')
        actual = root / path
        require(actual.resolve().is_relative_to(root.resolve()), 'source symlink escapes root')
        return actual.read_bytes()
    require(re.fullmatch('[0-9a-f]{40}', revision) is not None, 'source revision must be exact')
    result = subprocess.run(['git', 'show', f'{revision}:{path}'], cwd=root,
                            capture_output=True, check=False)
    if result.returncode:
        raise ValueError('pinned source unavailable')
    return result.stdout


def validate_input(data, root):
    require(set(data) == {'schema', 'base_ref', 'as_of', 'objects'}, 'invalid seed envelope')
    require(data['schema'] == 'arcanum.architect.current-state-seed/v1', 'invalid seed version')
    require(re.fullmatch('[0-9a-f]{40}', data['base_ref']) is not None, 'invalid base ref')
    as_of = timestamp(data['as_of'])
    require(isinstance(data['objects'], list) and data['objects'], 'empty object seed')
    schema = json.loads((root / OBJECT_SCHEMA).read_text())
    objects = {}
    problems = {}
    for obj in data['objects']:
        # Check custody before printing or projecting any record. Error messages omit payloads.
        c = obj.get('custody', {})
        require(c.get('disclosure') in {'public', 'public-candidate'} and
                c.get('retention_authorized') is True and c.get('do_not_export') is False and
                c.get('encryption_required') is False and c.get('materialization') == 'metadata-only'
                and c.get('replication') == 'none', 'nonpublic or incompatible custody rejected')
        require(obj.get('namespace') == 'architect.public-coherence', 'namespace rejected')
        validate(obj, schema)
        oid = obj['object_id']
        require(oid not in objects, 'duplicate object ID')
        require(obj['object_type'] in {'arc', 'evidence'}, 'object type outside seed profile')
        require(obj['authority']['authority_class'] != 'doctrine', 'doctrine not projected here')
        for name in ['observed_at', 'recorded_at']:
            require(timestamp(obj['temporal'][name]) <= as_of, 'observation after snapshot')
        temporal = obj['temporal']
        require(timestamp(temporal['observed_at']) <= timestamp(temporal['recorded_at']),
                'recording precedes observation')
        require(temporal['effective_from'] is None and temporal['effective_until'] is None,
                'timed activation outside bounded seed profile')
        if temporal['occurred_at'] is not None:
            require(timestamp(temporal['occurred_at']) <= timestamp(temporal['observed_at']),
                    'future event cannot be recorded as observed')
        if obj['object_type'] == 'evidence':
            fields = obj['payload']['supports']
            require(fields and set(fields) <= set(POLICIES) and len(set(fields)) == len(fields),
                    'unsupported or duplicate evidence field')
        for effect in obj['authority']['effect_state'].values():
            if effect['state'] == 'established':
                require(bool(effect['evidence_refs']), 'established effect lacks evidence')
        for source in obj['provenance']:
            require(source['source_kind'] == 'local', 'network/provider ingestion not supported')
            require(timestamp(source['captured_at']) <= as_of, 'source capture after snapshot')
            require(bool(source['content_digest_sha256']), 'source digest required')
            try:
                raw = source_bytes(source, root)
                require(hashlib.sha256(raw).hexdigest() == source['content_digest_sha256'],
                        'source digest mismatch')
            except (ValueError, OSError):
                problems.setdefault(oid, []).append('source unavailable, disallowed, or digest mismatch')
        objects[oid] = obj
    for oid, obj in objects.items():
        for relation in obj['relationships']:
            target = relation['target_object_id']
            require(target in objects and target != oid, 'dangling or self relationship')
            require(bool(relation['basis_ref']), 'relationship requires basis')
            if relation['type'] in {'supersedes', 'corrects'}:
                require(obj['subject_id'] == objects[target]['subject_id'],
                        'supersession cannot cross subjects')
    # Supersession must be a directed acyclic graph.
    visiting, visited = set(), set()
    def visit(oid):
        require(oid not in visiting, 'cyclic supersession')
        if oid in visited:
            return
        visiting.add(oid)
        for r in objects[oid]['relationships']:
            if r['type'] in {'supersedes', 'corrects'}:
                visit(r['target_object_id'])
        visiting.remove(oid)
        visited.add(oid)
    for oid in objects:
        visit(oid)
    return objects, problems


def derive(data, root=ROOT):
    objects, problems = validate_input(data, root)
    fields = {}
    for field, precedence in POLICIES.items():
        claims = [o for o in objects.values() if o['object_type'] == 'evidence'
                  and field in o['payload']['supports']]
        # Proposals/unknowns cannot suppress established claims, regardless of age or authority.
        eligible = [o for o in claims if o['object_id'] not in problems
                    and o['authority']['authority_class'] in precedence
                    and o['claim_class'] in ({'proposal'} if field in PROPOSAL_FIELDS
                                             else {'observation', 'report'})]
        def rank(o):
            return precedence.index(o['authority']['authority_class'])
        removed = set()
        for obj in eligible:
            for rel in obj['relationships']:
                target = objects[rel['target_object_id']]
                if (rel['type'] in {'supersedes', 'corrects'} and target in eligible
                        and rank(obj) <= rank(target)):
                    removed.add(target['object_id'])
        survivors = [o for o in eligible if o['object_id'] not in removed]
        best = min((rank(o) for o in survivors), default=None)
        selected = sorted(o['object_id'] for o in survivors if rank(o) == best)
        values = sorted({objects[oid]['payload']['summary'] for oid in selected})
        # Missing stronger/equal evidence must not revive a historical pending claim.
        missing_contender = any(o['object_id'] in problems and
            o['authority']['authority_class'] in precedence and
            o['claim_class'] in ({'proposal'} if field in PROPOSAL_FIELDS else {'observation', 'report'})
            and (best is None or rank(o) <= best) for o in claims)
        if missing_contender:
            selected, values = [], []
        status = 'unknown' if not values else 'conflict' if len(values) > 1 else (
            'proposed' if field in PROPOSAL_FIELDS else 'supported')
        fields[field] = {'status': status, 'value': values[0] if len(values) == 1 else None,
                         'selected_object_ids': selected,
                         'all_claim_ids': sorted(o['object_id'] for o in claims),
                         'superseded_object_ids': sorted(removed),
                         'coverage': 'partial' if any(o['object_id'] in problems for o in claims)
                                     or not selected else 'covered'}
    result = {'schema': 'arcanum.architect.current-state/v1',
              'authority': 'derived-non-authoritative', 'base_ref': data['base_ref'],
              'as_of': data['as_of'], 'coverage': 'partial' if problems or any(
                  f['coverage'] == 'partial' or f['status'] == 'conflict' for f in fields.values())
                  else 'bounded-seed-only',
              'fields': fields, 'source_problems': problems,
              'objects': sorted(objects.values(), key=lambda o: o['object_id'])}
    validate(result, json.loads((root / OUTPUT_SCHEMA).read_text()))
    return result


def link(source):
    path, _, anchor = source['source_ref'].partition('#')
    if source['source_revision']:
        return ('https://github.com/The-Architect-369/Arcanum/blob/' +
                source['source_revision'] + '/' + path + ('#' + anchor if anchor else ''))
    return 'current-state-profile.md' + ('#' + anchor if anchor else '')


def render(result):
    objects = {o['object_id']: o for o in result['objects']}
    intro = [f"As of {result['as_of']}; observed canonical base `{result['base_ref']}`.",
             'Derived, non-authoritative, bounded seed. Regeneration is not a fresh provider read.',
             'See [profile and source limits](current-state-profile.md). Historical records remain intact.', '']
    view = ['# Derived current state', ''] + intro + [
        'For tested access paths and their limits, use the companion',
        '[operational capabilities](operational-capabilities.md). Neither view grants authority.', '']
    for field, entry in result['fields'].items():
        view += [f"## {field.replace('_', ' ').capitalize()}", '',
                 f"Status: **{entry['status']}**; coverage: {entry['coverage']}.", '',
                 entry['value'] or 'No single supported value; inspect the claims below.', '']
        for oid in entry['all_claim_ids']:
            obj = objects[oid]
            sources = ', '.join(f'[source]({link(s)})' for s in obj['provenance'])
            view += [f"- `{oid}` ({obj['claim_class']}, {obj['authority']['authority_class']}): {sources}."]
            if entry['value'] != obj['payload']['summary']:
                view += ['  ' + obj['payload']['summary']]
            for limitation in obj['payload']['limitations']:
                view += ['  Limitation: ' + limitation]
        view += ['']
    chronicle = ['# Bounded coherence chronicle', ''] + intro + [
        'This short transition trace selects A18 pending/closure, A19/A20 planning and the',
        'projection gate. Ordering follows explicit supersession and the planning sequence;',
        'it does not infer event times or causation. No ARC-SES IDs are allocated.', '']
    trace_fields = ['completed_arc', 'next_arc', 'following_arc', 'implementation_gate']
    trace = [o for o in objects.values() if o['object_type'] == 'evidence'
             and set(o['payload']['supports']) & set(trace_fields)]
    def order(obj):
        field = next(f for f in trace_fields if f in obj['payload']['supports'])
        old = obj['object_id'] in result['fields'][field]['superseded_object_ids']
        return trace_fields.index(field), not old, obj['object_id']
    for obj in sorted(trace, key=order):
        t = obj['temporal']
        summary = obj['payload'].get('summary', obj['payload'].get('outcome'))
        chronicle += [f"## {obj['object_id']}", '', summary, '',
                      f"Event: {t['occurred_at'] or 'unknown'}; observed: {t['observed_at']}; recorded: {t['recorded_at']}.",
                      f"Classification: {obj['claim_class']}; source authority: {obj['authority']['authority_class']}.", '',
                      ', '.join(f'[source]({link(s)})' for s in obj['provenance']), '']
        if obj['object_type'] == 'evidence':
            for field in obj['payload']['supports']:
                entry = result['fields'][field]
                position = ('superseded' if obj['object_id'] in entry['superseded_object_ids']
                            else 'selected' if obj['object_id'] in entry['selected_object_ids']
                            else 'not selected')
                chronicle += [f"- {field}: {position}; field status {entry['status']}."]
            chronicle += ['- Limitation: ' + v for v in obj['payload']['limitations']]
        for relation in obj['relationships']:
            chronicle += [f"- {relation['type']}: `{relation['target_object_id']}`."]
        chronicle += ['']
    if result['source_problems']:
        warning = ['## Source coverage problems', '',
                   *[f'- `{oid}`: source unavailable or unverified.' for oid in sorted(result['source_problems'])], '']
        view += warning
        chronicle += warning
    return {'current-state.json': encoded(result),
            'current-state.md': ('\n'.join(view).rstrip() + '\n').encode(),
            'coherence-chronicle.md': ('\n'.join(chronicle).rstrip() + '\n').encode()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='read-only byte comparison; fails on partial coverage')
    args = parser.parse_args()
    try:
        result = derive(json.loads((ROOT / INPUT).read_text()))
        outputs = render(result)
        for name, content in outputs.items():
            path = ROOT / DIRECTORY / name
            if args.check:
                require(path.is_file() and path.read_bytes() == content, 'generated output missing or stale: ' + name)
            else:
                path.write_bytes(content)
        require(result['coverage'] != 'partial', 'partial result: resolve source problems or conflicting/missing claims')
        print('PASS current-state: deterministic bounded seed; no authority effect')
        return 0
    except (ValueError, OSError, KeyError, TypeError) as exc:
        print('FAIL current-state: ' + str(exc), file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
