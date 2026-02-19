#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
import sys

REPO = Path(".").resolve()

# Where your checksum file lives NOW (adjust if yours differs)
CHECKSUM_FILE_CANDIDATES = [
    REPO / "docs" / "governance" / "constitution" / "doctrine-checksums.yaml",
    REPO / "docs" / "00_CONSTITUTION" / "doctrine-checksums.yaml",  # fallback
]

checksum_path = next((p for p in CHECKSUM_FILE_CANDIDATES if p.exists()), None)
if not checksum_path:
    print("❌ Could not find doctrine-checksums.yaml in expected locations.")
    for p in CHECKSUM_FILE_CANDIDATES:
        print("  -", p)
    sys.exit(1)

# Helper: pick first existing target among candidates
def pick(*cands: str) -> str:
    for c in cands:
        if (REPO / c).exists():
            return c
    # If none exist, return first candidate (we’ll error later)
    return cands[0]

MAP = {
    "docs/00_CONSTITUTION/ARCHITECT_GPT_CORE.md": pick(
        "docs/governance/constitution/architectgpt-core.md",
        "docs/governance/constitution/architect-gpt-core.md",
    ),
    "docs/00_CONSTITUTION/ARCHITECT_GPT_EXTENDED.md": pick(
        "docs/governance/constitution/architectgpt-extended.md",
        "docs/governance/constitution/architect-gpt-extended.md",
    ),
    "docs/00_CONSTITUTION/TREASURY_CONSTITUTION.md": pick(
        "docs/governance/constitution/treasury-constitution.md",
    ),
    "docs/00_CONSTITUTION/ARCHITECT_REPOSITORY_INTERFACE.md": pick(
        "docs/governance/constitution/repo-interface.md",
        "docs/governance/constitution/architect-repository-interface.md",
        "docs/governance/constitution/architect-repository-interface.md",
    ),
    # (Optional but recommended) map other constitution docs if they were in the checksum file:
    "docs/00_CONSTITUTION/CANONICAL_MODULES.md": pick(
        "docs/governance/constitution/canonical-modules.md",
    ),
    "docs/00_CONSTITUTION/ARCHITECT_ROLE.md": pick(
        "docs/governance/constitution/architect-role.md",
    ),
    "docs/00_CONSTITUTION/METAPHYSICAL_NEUTRALITY.md": pick(
        "docs/governance/constitution/metaphysical-neutrality.md",
    ),
    "docs/00_CONSTITUTION/ECONOMIC_PRINCIPLES.md": pick(
        "docs/governance/constitution/economic-principles.md",
    ),
    "docs/00_CONSTITUTION/FOUNDER_TRANSITION_AND_ARCHETYPE.md": pick(
        "docs/governance/constitution/founder-transition-and-archetype.md",
    ),
    "docs/00_CONSTITUTION/REPO_INDEX_GENERATOR_SPEC.md": pick(
        "docs/governance/constitution/repo-index-generator-spec.md",
    ),
}

text = checksum_path.read_text(encoding="utf-8").splitlines(True)
out = []
changed = 0
missing_targets = []

for line in text:
    # Skip comments / blank lines
    stripped = line.strip()
    if not stripped or stripped.startswith("#") or ":" not in line:
        out.append(line)
        continue

    key, rest = line.split(":", 1)
    key_str = key.strip()
    new_key = MAP.get(key_str, key_str)

    if new_key != key_str:
        changed += 1

    # Verify target exists
    if not (REPO / new_key).exists():
        missing_targets.append(new_key)

    out.append(f"{new_key}:{rest}")

if missing_targets:
    print("❌ The following mapped target paths do not exist (fix filenames or mapping):")
    for p in sorted(set(missing_targets)):
        print("  -", p)
    sys.exit(1)

backup = checksum_path.with_suffix(".yaml.bak")
backup.write_text("".join(text), encoding="utf-8")
checksum_path.write_text("".join(out), encoding="utf-8")

print(f"✅ Updated {changed} checksum path(s) in {checksum_path}")
print(f"🗂️  Backup written to {backup}")
