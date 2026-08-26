---
title: "Repo Index Generator Spec"
status: canonical
visibility: public
last_updated: 2026-08-26
description: "Deterministic generator contract for docs/repo/repo-index.json (Git-tracked structural snapshot)."
---

# Repo Index Generator Spec

This document specifies the repository index generator: a deterministic mechanism for producing an auditable structural snapshot of the committed Git tree.

## Canonical output

- `docs/repo/repo-index.json`

The output is the canonical machine-readable structural index for its declared **indexed source commit**.

The output file does not index itself. This exclusion is required to avoid self-referential size, provenance, and commit metadata.

---

## Design principles

1. **Structure over content**  
   The index captures what Git tracks and the minimum structural metadata needed to audit it; it does not define semantic meaning or authority.

2. **Deterministic**  
   Given the same indexed source commit and generator version, output bytes must be identical across repeated runs.

3. **Committed source state**  
   Canonical generation reads the committed Git tree, not arbitrary working-tree bytes. Tracked changes other than the index output itself must be committed or removed before generation.

4. **Auditable**  
   Humans can read the JSON and tools can parse it without reconstructing implicit generator state.

5. **Fail-closed**  
   If source state cannot be resolved, a tracked non-index change is present, an unsupported Git object is encountered, or exact verification fails, structural certification fails.

---

## Indexed source commit

The generator resolves the latest commit reachable from `HEAD` that changed a tracked path other than:

```text
docs/repo/repo-index.json
```

That commit is the **indexed source commit**.

This rule intentionally allows a later commit that changes only `docs/repo/repo-index.json` to carry the generated snapshot without changing the source state that the snapshot describes.

Therefore:

- a substantive repository commit advances the indexed source commit;
- an index-only refresh commit does not;
- regeneration after an index-only refresh must reproduce the same bytes;
- the canonical workflow is substantive commit → generate index → verify exact determinism → commit the index-only refresh.

The short `commit` field is the first nine hexadecimal characters of the indexed source commit's full SHA. The generator obtains the full SHA first and then slices exactly nine characters; it does not rely on Git's variable-width abbreviation behavior.

---

## Deterministic timestamp

`generated_at` is **not wall-clock generation time**.

It is the indexed source commit's committer timestamp normalized to UTC in RFC 3339 form:

```text
YYYY-MM-DDTHH:MM:SSZ
```

This makes repeated generation from the same indexed source commit byte-stable.

Operational logs may separately record when a human or CI job actually ran the generator; that runtime timestamp does not belong in the deterministic structural artifact.

---

## Source entries

The generator enumerates the indexed source commit with Git tree/blob plumbing.

Only tracked blob entries are indexed.

Directories are implicit in repository-relative paths and are not emitted as separate entries because Git does not track standalone directories.

Supported entry types are:

- `file`
- `symlink`

A symlink entry additionally includes its Git-stored target.

Unsupported tracked Git object types must fail generation rather than being silently coerced.

---

## Required fields per entry

Each entry MUST include:

- `path` — repository-relative tracked path;
- `type` — `file` or `symlink`;
- `size_bytes` — exact Git blob byte length;
- `last_modified_commit` — first nine characters of the latest full commit SHA affecting that path at or before the indexed source commit, or `"unknown"` if resolution fails;
- `is_empty` — `true` only when the Git blob byte length is exactly zero;
- `extension` — final suffix or empty string;
- `lines` — text-like line count, or `0` for symlinks/binary-or-unknown content.

For symlinks, the entry MUST also include:

- `target` — the target string stored in the Git blob.

There is no undefined "below threshold" empty-file category. Empty means exactly zero bytes.

---

## Top-level structure

```json
{
  "generated_at": "2026-08-26T00:00:00Z",
  "repo": "The-Architect-369/Arcanum",
  "commit": "abc123def",
  "generator_version": "1.4",
  "files": []
}
```

Top-level fields:

- `generated_at` — deterministic indexed-source commit timestamp;
- `repo` — normalized repository identifier when available;
- `commit` — fixed nine-character prefix of the indexed source commit;
- `generator_version` — behavior version of `scripts/repo-index.sh`;
- `files` — lexicographically path-sorted tracked entries excluding the canonical output itself.

---

## Exact verification

`scripts/verify-repo-index.py` is the exact determinism/freshness verifier for this contract.

It must:

1. preserve the stored canonical index;
2. run the generator once and capture the bytes;
3. run it a second time from unchanged source state;
4. fail if the two generated byte streams differ;
5. fail if the stored canonical index differs from the generated bytes;
6. restore the original stored file before exit;
7. report source commit, generator version, and entry count on success.

The verifier uses only the Python standard library plus Git/Bash already required by repository tooling.

Canonical local command:

```bash
pnpm verify:repo-index
```

---

## Refresh workflow

After substantive repository changes are committed:

```bash
bash scripts/repo-index.sh
pnpm verify:repo-index
git add docs/repo/repo-index.json
git commit -m "chore(repo): refresh deterministic repo index"
pnpm verify:repo-index
```

A clean final verification proves that the index-only commit did not change the indexed source state and that regeneration remains byte-identical.

`bash scripts/verify-sync.sh` remains part of whole-repository certification. This exact verifier is the controlling check for byte-level repo-index determinism and freshness while the broader sync verifier continues to cover governance/orchestration integrity.

---

## Construction Era repair note

CE-W01 audit found two defects in the previous contract/tooling pair:

1. generator v1.2/v1.3 used current wall-clock time for `generated_at`, contradicting the canonical requirement that identical source state produce identical output;
2. the canonical spec declared `file | directory` while the implementation indexed Git-tracked files and symlinks, and Git does not track standalone directories.

Research generator v1.3 correctly moved commit abbreviations toward deterministic full-SHA slicing, but it retained the wall-clock and entry-model contradictions. Version 1.4 adopts the fixed-SHA behavior while repairing the source-state, timestamp, self-reference, and entry-type contract explicitly rather than promoting v1.3 wholesale.
