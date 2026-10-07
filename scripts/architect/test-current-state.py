#!/usr/bin/env python3
"""Behavioral fixtures for bounded evidence selection and historical preservation."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import unittest

spec = importlib.util.spec_from_file_location('current_state', Path(__file__).with_name('generate-current-state.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class ProjectionTests(unittest.TestCase):
    def setUp(self):
        self.seed = json.loads((m.ROOT / m.INPUT).read_text())

    def evidence(self, field='completed_arc'):
        return next(o for o in self.seed['objects'] if o['object_id'] == 'coherence:' + field)

    def rival(self, field='completed_arc'):
        obj = copy.deepcopy(self.evidence(field))
        obj['object_id'] += ':rival'
        obj['payload']['evidence_id'] = obj['object_id']
        obj['payload']['summary'] = 'A competing statement.'
        obj['relationships'] = []
        self.seed['objects'].append(obj)
        return obj

    def test_unsupported_schema_keyword_rejected_in_inactive_branch(self):
        with self.assertRaisesRegex(ValueError, 'unsupported schema keyword'):
            m.validate('text', {'if': {'type': 'integer'}, 'then': {'unsupported': True}})

    def test_chronicle_marks_historical_pending_as_superseded(self):
        outputs = m.render(m.derive(self.seed))
        self.assertIn(b'completed_arc: superseded', outputs['coherence-chronicle.md'])

    def test_temporal_boundaries(self):
        for changes in [{'recorded_at': '2026-10-01T00:00:00Z'},
                        {'effective_from': '2026-10-01T00:00:00Z'},
                        {'effective_until': '2026-10-06T00:00:00Z'},
                        {'occurred_at': '2099-01-01T00:00:00Z'}]:
            with self.subTest(changes=changes):
                seed = copy.deepcopy(self.seed)
                seed['objects'][0]['temporal'].update(changes)
                with self.assertRaises(ValueError):
                    m.derive(seed)

    def test_valid_seed_and_proposals(self):
        result = m.derive(self.seed)
        self.assertEqual(result['coverage'], 'bounded-seed-only')
        self.assertEqual(result['fields']['hope_extensions']['status'], 'proposed')
        self.assertEqual(result['fields']['a19_baseline']['status'], 'supported')

    def test_equal_authority_conflict_remains(self):
        self.rival()
        field = m.derive(self.seed)['fields']['completed_arc']
        self.assertEqual(field['status'], 'conflict')
        self.assertIsNone(field['value'])
        self.assertEqual(len(field['selected_object_ids']), 2)

    def test_newer_lower_authority_cannot_win_or_supersede(self):
        rival = self.rival()
        rival['authority']['authority_class'] = 'derived'
        rival['temporal']['observed_at'] = self.seed['as_of']
        rival['temporal']['recorded_at'] = self.seed['as_of']
        self.evidence()['temporal']['observed_at'] = '2026-10-06T00:00:00Z'
        rival['relationships'] = [{'type': 'supersedes', 'target_object_id': 'coherence:completed_arc',
                                  'basis_ref': str(m.PROFILE)}]
        field = m.derive(self.seed)['fields']['completed_arc']
        self.assertEqual(field['selected_object_ids'], ['coherence:completed_arc'])
        self.assertNotIn('coherence:completed_arc', field['superseded_object_ids'])

    def test_partial_supersession_only_overlapping_fields(self):
        old = self.rival()
        old['payload']['supports'].append('wave')
        self.evidence()['relationships'].append({'type': 'supersedes', 'target_object_id': old['object_id'],
                                                'basis_ref': str(m.PROFILE)})
        fields = m.derive(self.seed)['fields']
        self.assertEqual(fields['completed_arc']['status'], 'supported')
        self.assertEqual(fields['wave']['status'], 'conflict')
        self.assertNotIn(old['object_id'], fields['wave']['superseded_object_ids'])

    def test_proposal_cannot_establish_or_suppress_fact(self):
        rival = self.rival()
        rival['claim_class'] = 'proposal'
        rival['relationships'] = [{'type': 'supersedes', 'target_object_id': self.evidence()['object_id'],
                                  'basis_ref': str(m.PROFILE)}]
        field = m.derive(self.seed)['fields']['completed_arc']
        self.assertEqual(field['selected_object_ids'], ['coherence:completed_arc'])
        self.assertIn(rival['object_id'], field['all_claim_ids'])

    def test_missing_source_yields_partial_not_fact(self):
        self.evidence()['provenance'][0]['source_ref'] = 'docs/not-a-real-source.md'
        result = m.derive(self.seed)
        self.assertEqual(result['coverage'], 'partial')
        self.assertEqual(result['fields']['completed_arc']['status'], 'unknown')
        self.assertIn('coherence:completed_arc', result['source_problems'])

    def test_digest_drift_yields_partial(self):
        self.evidence()['provenance'][0]['content_digest_sha256'] = '0' * 64
        self.assertEqual(m.derive(self.seed)['coverage'], 'partial')

    def test_duplicate_id_rejected(self):
        self.seed['objects'].append(copy.deepcopy(self.evidence()))
        with self.assertRaisesRegex(ValueError, 'duplicate object ID'):
            m.derive(self.seed)

    def test_unsupported_relation_rejected(self):
        self.evidence()['relationships'][0]['type'] = 'verified_by'
        with self.assertRaises(ValueError):
            m.derive(self.seed)

    def test_dangling_relation_rejected(self):
        self.evidence()['relationships'][0]['target_object_id'] = 'absent'
        with self.assertRaisesRegex(ValueError, 'dangling'):
            m.derive(self.seed)

    def test_private_and_no_export_rejected(self):
        for key, value in [('disclosure', 'private-local'), ('do_not_export', True),
                           ('retention_authorized', False), ('replication', 'public'),
                           ('encryption_required', True)]:
            with self.subTest(key=key):
                seed = copy.deepcopy(self.seed)
                seed['objects'][0]['custody'][key] = value
                with self.assertRaisesRegex(ValueError, 'custody'):
                    m.derive(seed)

    def test_unknown_effect_not_promoted(self):
        result = m.derive(self.seed)
        for obj in result['objects']:
            self.assertTrue(all(e['state'] == 'unknown' for e in obj['authority']['effect_state'].values()))
        self.evidence()['authority']['effect_state']['verified']['state'] = 'established'
        with self.assertRaisesRegex(ValueError, 'lacks evidence'):
            m.derive(self.seed)

    def test_invalid_payload_and_timestamp_rejected(self):
        for mutate in [lambda o: o['payload'].update(unexpected=True),
                       lambda o: o['temporal'].update(observed_at='2026-02-30T00:00:00Z')]:
            seed = copy.deepcopy(self.seed)
            mutate(seed['objects'][0])
            with self.assertRaises(ValueError):
                m.derive(seed)

    def test_cycle_rejected(self):
        rival = self.rival()
        for a, b in [(self.evidence(), rival), (rival, self.evidence())]:
            a['relationships'].append({'type': 'supersedes', 'target_object_id': b['object_id'],
                                       'basis_ref': str(m.PROFILE)})
        with self.assertRaisesRegex(ValueError, 'cyclic'):
            m.derive(self.seed)

    def test_order_independence_and_byte_determinism(self):
        first = m.render(m.derive(self.seed))
        self.seed['objects'].reverse()
        self.assertEqual(first, m.render(m.derive(self.seed)))
        for content in first.values():
            self.assertNotIn(b'\r', content)
            self.assertTrue(content.endswith(b'\n'))

    def test_source_path_escape_not_read(self):
        self.evidence()['provenance'][0]['source_ref'] = 'docs/../../etc/passwd'
        self.assertEqual(m.derive(self.seed)['coverage'], 'partial')

    def test_historical_records_and_core_preserved(self):
        base = self.seed['base_ref']
        def original(path):
            return subprocess.check_output(['git', 'show', base + ':' + str(path)], cwd=m.ROOT)
        log = m.DIRECTORY / 'architect-log.md'
        marker = '## CONTINUITY-EVENT'.encode()
        self.assertTrue((m.ROOT / log).read_bytes().split(marker, 1)[1].startswith(original(log).split(marker, 1)[1]))
        contract = m.DIRECTORY / 'architect-gpt.md'
        marker = b'## Adopted core operating instructions'
        self.assertEqual(original(contract).split(marker, 1)[1], (m.ROOT / contract).read_bytes().split(marker, 1)[1])
        for name in ['continuity-index.json', 'continuity-epoch.json']:
            path = m.DIRECTORY / name
            self.assertEqual(original(path), (m.ROOT / path).read_bytes())
        self.assertEqual(original(m.OBJECT_SCHEMA), (m.ROOT / m.OBJECT_SCHEMA).read_bytes())

    def test_follow_on_supersedes_only_named_historical_fields(self):
        # Keep the earlier adoption checkpoint independently testable as new
        # reviewed evidence is appended to the live seed.
        baseline = copy.deepcopy(self.seed)
        baseline['objects'] = [obj for obj in baseline['objects']
                               if not obj['object_id'].endswith(':20261007-architecture-review')]
        result = m.derive(baseline)
        for field in ['canonical_base', 'implementation_gate', 'source_conflicts']:
            self.assertEqual(result['fields'][field]['selected_object_ids'],
                             ['coherence:' + field + ':20261007-baseline'])
            self.assertIn('coherence:' + field, result['fields'][field]['superseded_object_ids'])
        self.assertEqual(result['fields']['a19_baseline']['selected_object_ids'], ['coherence:a19_baseline'])

    def test_architecture_review_preserves_baselines_and_extends_decisions(self):
        result = m.derive(self.seed)
        for field in ['canonical_base', 'implementation_gate', 'outstanding_human_decisions']:
            self.assertEqual(result['fields'][field]['selected_object_ids'],
                             ['coherence:' + field + ':20261007-architecture-review'])
            self.assertIn('coherence:' + field, result['fields'][field]['superseded_object_ids'])
        for field in ['a19_baseline', 'a20_baseline']:
            self.assertEqual(result['fields'][field]['selected_object_ids'], ['coherence:' + field])
        self.assertEqual(result['fields']['agent_c_state']['selected_object_ids'],
                         ['coherence:agent_c_state:20261007-connection-check'])
        for field in ['hope_extensions', 'spatial_extensions']:
            self.assertEqual(result['fields'][field]['status'], 'proposed')

    def test_empty_session_index_is_valid_and_unmodified(self):
        path = m.ROOT / m.DIRECTORY / 'continuity-index.json'
        before = path.read_bytes()
        self.assertEqual(json.loads(before)['sessions'], [])
        subprocess.run(['python3', 'scripts/architect/validate-continuity-index.py'],
                       cwd=m.ROOT, check=True, capture_output=True)
        m.derive(self.seed)
        self.assertEqual(before, path.read_bytes())


if __name__ == '__main__':
    unittest.main()
