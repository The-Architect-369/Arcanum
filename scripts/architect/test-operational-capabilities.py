#!/usr/bin/env python3
"""Check observation boundaries, stale output inputs and unsafe evidence paths."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('capabilities', Path(__file__).with_name('generate-operational-capabilities.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class ObservationTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads(m.SOURCE.read_text())

    def test_results_remain_distinct_and_order_is_deterministic(self):
        output = m.render(self.data)
        for result in ['passed', 'failed', 'untested']:
            self.assertIn('| ' + result + ' |', output)
        self.data['capabilities'].reverse()
        self.assertEqual(output, m.render(self.data))

    def test_no_dispatch_or_authority_fields(self):
        for change in [{'authority': 'authorized'}, {'execute': 'anything'}]:
            data = copy.deepcopy(self.data)
            data.update(change)
            with self.assertRaises(ValueError):
                m.render(data)

    def test_missing_or_escaping_evidence_rejected(self):
        for ref in ['docs/missing.md', 'docs/../../etc/passwd.md']:
            self.data['capabilities'][0]['evidence'] = [ref]
            with self.assertRaises(ValueError):
                m.render(self.data)

    def test_bad_dates_and_duplicate_ids_rejected(self):
        for date in ['2099-01-01', '2026-02-30']:
            data = copy.deepcopy(self.data)
            data['capabilities'][0]['observed_on'] = date
            with self.assertRaises(ValueError):
                m.render(data)
        self.data['capabilities'].append(copy.deepcopy(self.data['capabilities'][0]))
        with self.assertRaises(ValueError):
            m.render(self.data)

    def test_description_cannot_break_table_or_add_html(self):
        self.data['capabilities'][0]['summary'] = '<script>|[link](target)'
        output = m.render(self.data)
        self.assertNotIn('<script>', output)
        self.assertIn('&lt;script&gt;&#124;&#91;link&#93;', output)


if __name__ == '__main__':
    unittest.main()
