#!/usr/bin/env python3
"""Independent synthetic question-profile vector against the adopted logical schema."""
import hashlib
import json
from pathlib import Path
import struct
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'docs/specs/runtime/fixtures/a17-v1'
schema = json.loads((ROOT / 'docs/specs/runtime/sovereign-continuity-object.schema.json').read_text())
x = json.loads((FIXTURE / 'question.json').read_text())
Draft202012Validator.check_schema(schema)
Draft202012Validator(schema, format_checker=FormatChecker()).validate(x)
b = bytearray(b'ARCANUM-A17-PUBLIC-QUESTION-V1\0')

def text(value):
    data = value.encode('utf-8')
    b.extend(struct.pack('>I', len(data)))
    b.extend(data)

def optional(value):
    b.append(int(value is not None))
    if value is not None:
        text(value)

claims = ['observation', 'report', 'inference', 'proposal', 'unknown']
for name in ['object_id', 'subject_id']:
    text(x[name])
b.append(claims.index(x['claim_class']))
optional(x['temporal']['occurred_at'])
for name in ['observed_at', 'recorded_at']:
    text(x['temporal'][name])
text(x['custody']['retention_authority_ref'])
p = x['provenance'][0]
b.append(['local', 'human', 'github', 'notion', 'google-drive', 'vercel', 'model-provider', 'imported-file', 'other'].index(p['source_kind']))
text(p['source_ref'])
optional(p['source_revision'])
text(p['captured_at'])
b.append(int(p['content_digest_sha256'] is not None))
if p['content_digest_sha256'] is not None:
    b.extend(bytes.fromhex(p['content_digest_sha256']))
b.append(claims.index(p['evidence_class']))
for name in ['proposed', 'ratified', 'authorized_for_effect', 'executed', 'verified', 'canonicalized']:
    e = x['authority']['effect_state'][name]
    b.append(['established', 'not-established', 'unknown', 'not-applicable'].index(e['state']))
    b.append(len(e['evidence_refs']))
    for ref in e['evidence_refs']:
        text(ref)
text(x['payload']['statement'])
b.append(['open', 'accepted', 'rejected', 'deferred', 'superseded', 'resolved'].index(x['payload']['status']))
b.append(int(bool(x['relationships'])))
if x['relationships']:
    text(x['relationships'][0]['target_object_id'])
    text(x['relationships'][0]['basis_ref'])
assert b.hex() == (FIXTURE / 'question.hex').read_text().strip()
assert hashlib.sha256(b).hexdigest() == (FIXTURE / 'question.sha256').read_text().strip()
print('PASS A17 logical-schema fixture and independent canonical bytes/digest')
