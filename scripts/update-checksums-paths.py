#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import sys
import hashlib
import re

REPO = Path(".").resolve()

CHECKSUM_FILE_CANDIDATES = [
    REPO / "docs" / "governance" / "constitution" / "doctrine-checksums.yaml",
    REPO / "docs" / "00_CONSTITUTION" / "doctrine-checksums.yaml",
]

checksum_path = next((p for p in CHECKSUM_FILE_CANDIDATES if p.exists()), None)
if not checksum_path:
    print("❌ Could not find doctrine-checksums.yaml in expected locations.")
    for p in CHECKSUM_FILE_CANDIDATES:
        print("  -", p)
    sys.exit(1)


def sha256_file(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def pick(*cands: str) -> str:
    for c in cands:
        if (REPO / c).exists():
            return c
    return cands[0]


MAP = {
    # Core Constitution docs
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
    ),

    # Optional additional constitution docs (if present in the checksum file)
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

LINE_RE = re.compile(r"^(?P<indent>\s*)(?P<key>[^:\n]+):(?P<rest>.*)$")

original = checksum_path.read_text(encoding="utf-8")
lines = original.splitlines(True)

out = []
remapped = 0
rehash_count = 0
missing_targets = set()

for line in lines:
    stripped = line.strip()
    if not stripped or stripped.startswith("#"):
        out.append(line)
        continue

    m = LINE_RE.match(line)
    if not m:
        out.append(line)
        continue

    indent = m.group("indent")
    key = m.group("key").strip()
    rest = m.group("rest")

    # Only rewrite + rehash entries that look like path keys
    if not key.startswith("docs/"):
        out.append(line)
        continue

    new_key = MAP.get(key, key)
    if new_key != key:
        remapped += 1

    target = (REPO / new_key)
    if not target.exists():
        missing_targets.add(new_key)
        out.append(line)
        continue

    # Preserve inline comment if present
    comment = ""
    if "#" in rest:
        before, after = rest.split("#", 1)
        comment = "#"+after.rstrip("\n")
    else:
        before = rest

    new_hash = sha256_file(target)
    rehash_count += 1

    newline = "\n" if line.endswith("\n") else ""
    rebuilt = f"{indent}{new_key}: {new_hash}"
    if comment:
        rebuilt += f" {comment}"
    out.append(rebuilt + newline)

if missing_targets:
    print("❌ The following checksum target paths do not exist (fix filenames or mapping):")
    for p in sorted(missing_targets):
        print("  -", p)
    sys.exit(1)

backup = checksum_path.with_suffix(".yaml.bak")
backup.write_text(original, encoding="utf-8")
checksum_path.write_text("".join(out), encoding="utf-8")

print(f"✅ Updated {remapped} path(s) and rehashed {rehash_count} entry(ies) in {checksum_path}")
print(f"🗂️  Backup written to {backup}")
