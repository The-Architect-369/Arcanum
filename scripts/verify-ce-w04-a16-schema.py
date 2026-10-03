#!/usr/bin/env python3
"""Validate the display schema and public synthetic fixtures, not signed bytes."""
from copy import deepcopy
import json
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent.parent
SPEC = ROOT / "docs/specs/runtime"
schema = json.loads((SPEC / "ce-w04-a16-local-continuity-receipt-v1.schema.json").read_text())
Draft202012Validator.check_schema(schema)
validator = Draft202012Validator(schema)
for name in ("recording-minimal", "recording-rich", "human-adoption"):
    value = json.loads((SPEC / f"fixtures/a16-v1/{name}.projection.json").read_text())
    validator.validate(value)
    for field, invalid in ((0, "wrong-domain"), (1, 2), (3, "chain"), (7, "sha512"), (8, "00"), (10, "00"), (11, "other-algorithm"), (16, 2**63)):
        changed = deepcopy(value)
        changed["signedMessage"][field] = invalid
        assert not validator.is_valid(changed), (name, field)
    changed = deepcopy(value)
    changed["signedMessage"][17] = None if name == "human-adoption" else 1
    assert not validator.is_valid(changed), (name, "adoption-time")
    if name == "human-adoption":
        changed = deepcopy(value)
        changed["signedMessage"][13] = []
        assert not validator.is_valid(changed), (name, "adoption-source")
    changed = deepcopy(value)
    changed["extra"] = "unsupported"
    assert not validator.is_valid(changed), (name, "extra-field")
print("PASS A16 display schema: 3 synthetic projections and invalid field/adoption cases")
