#!/usr/bin/env python3
"""Verify tamper, truncation and numbering failures in independent chronology."""
import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('events', Path(__file__).with_name('generate-continuity-events.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class EventTests(unittest.TestCase):
    def test_source_and_ids(self):
        result = m.derive()
        self.assertTrue(result['events'])
        self.assertTrue(all(x['session_id'] is None for x in result['events']))
        self.assertEqual(result['active_epoch'], 'ARC-CONT-EPOCH-2')

    def rejected(self, mutation, message):
        rows = [json.loads(x) for x in (m.ROOT / m.SOURCE).read_text().splitlines()]
        altered = copy.deepcopy(rows)
        mutation(altered)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / m.DIRECTORY).mkdir(parents=True)
            (root / m.SOURCE).write_text(''.join(json.dumps(x) + '\n' for x in altered))
            for name in ['architect-log.md', 'present-state-checkpoint-20261008.md']:
                (root / m.DIRECTORY / name).write_bytes((m.ROOT / m.DIRECTORY / name).read_bytes())
            blobs = {x['source_revision'] + ':' + x['source_ref'].split('#', 1)[0]:
                     m.subprocess.check_output(['git', 'show', x['source_revision'] + ':' + x['source_ref'].split('#', 1)[0]], cwd=m.ROOT)
                     for x in rows if x['source_revision']}
            def show(args, **kwargs):
                return b'' if args[1] == 'log' else blobs[args[-1]]
            committed = m.subprocess.CompletedProcess([], 0, (m.ROOT / m.SOURCE).read_bytes(), b'')
            with patch.object(m.subprocess, 'check_output', side_effect=show), patch.object(m.subprocess, 'run', return_value=committed):
                with self.assertRaisesRegex(ValueError, message):
                    m.derive(root)

    def test_truncation_rejected(self):
        self.rejected(lambda rows: rows.pop(), 'cannot be removed')

    def test_source_tamper_rejected(self):
        self.rejected(lambda rows: rows[0].update(content_digest_sha256='0' * 64), 'digest mismatch')

    def test_renumbering_rejected(self):
        self.rejected(lambda rows: rows[0].update(event_id='ARC-EVT-20261008-0000'), 'cannot be removed')

    def test_session_fabrication_rejected(self):
        self.rejected(lambda rows: rows[0].update(session_id='ARC-SES-11'), 'allocates no session')


if __name__ == '__main__':
    unittest.main()
