---
title: "Repo Index Generator Spec"
status: canonical
visibility: public
last_updated: 2026-09-06
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
   If source state cannot be resolved, a tracked non-index change is present, an unsupported Git object is encountered, a merge introduces substantive combined state with no single parent carrying the exact promoted non-index tree, or exact verification fails, structural certification fails.

---

## Indexed source commit

The generator resolves the indexed source commit from `HEAD` by comparing exact Git trees while excluding only:

```text
docs/repo/repo-index.json
```

Resolution repeatedly peels a commit when its complete tracked non-index tree is byte-identical to one of its parents.

This makes two promotion-only commit shapes transparent to the structural snapshot:

- an index-only companion commit whose parent already carries the exact substantive source tree;
- a normal merge promotion whose source/index parent already carries the exact promoted non-index tree.

If more than one parent is structurally equivalent, parent order is preserved and first-parent ancestry is preferred. If a merge commit's non-index tree matches **no** parent, that merge combines substantive state from multiple parents and has no single pre-merge source commit that can truthfully back the existing companion artifact. Generation MUST fail closed and require the source tranche to be refreshed from latest canonical `main` before a new companion is generated and promoted.

The first commit reached that cannot be peeled by this rule is the **indexed source commit**.

Therefore:

- a substantive source commit advances the indexed source commit;
- an index-only companion does not;
- a normal no-conflict merge promotion does not;
- regeneration on the exact indexed head and on the resulting canonical merge head must reproduce the same bytes;
- a divergent merge that synthesizes new combined state is rejected instead of being assigned misleading provenance;
- the canonical workflow is latest canonical `main` → substantive source commit(s) → generate deterministic index companion → verify exact indexed head → normal merge → verify canonical `main`.

The short `commit` field is the first nine hexadecimal characters of the indexed source commit's full SHA. The generator obtains the full SHA first and then slices exactly nine characters; it does not rely on Git's variable-width abbreviation behavior.

---

## Deterministic timestamp

`generated_at` is **not wall-clock generation time**.

It is the indexed source commit's committer timestamp normalized to UTC in RFC 3339 form:

```text
YYYY-MM-DDTHH:MM:SSZ
```

This makes repeated generation from the same indexed source commit byte-stable across index-only companions and normal merge promotion.

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
  "generated_at": "2026-09-06T00:00:00Z",
  "repo": "The-Architect-369/Arcanum",
  "commit": "abc123def",
  "generator_version": "1.5",
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

`scripts/test-repo-index-merge-stability.sh` is the promotion regression proof. It constructs a disposable Git repository and proves substantive source → generated companion → normal merge → regeneration remains byte-identical and still names the original substantive source commit.

The verifier and regression proof use only the Python standard library plus Git/Bash already required by repository tooling.

Canonical local command:

```bash
pnpm verify:repo-index
```

---

## Refresh workflow

After substantive repository changes are committed:

```bash
bash scripts/repo-index.sh
python3 scripts/verify-repo-index.py
git add docs/repo/repo-index.json
git commit -m "chore(repo): refresh deterministic repo index"
pnpm verify:repo-index
```

A clean final verification proves that the index-only commit did not change the indexed source state, the normal-merge promotion invariant is covered by regression, and regeneration remains byte-identical.

`bash scripts/verify-sync.sh` remains part of whole-repository certification. This exact verifier is the controlling check for byte-level repo-index determinism and freshness while the broader sync verifier continues to cover governance/orchestration integrity.

---

## Construction Era repair notes

### CE-W01 — generator v1.4

CE-W01 audit found two defects in the previous contract/tooling pair:

1. generator v1.2/v1.3 used current wall-clock time for `generated_at`, contradicting the canonical requirement that identical source state produce identical output;
2. the canonical spec declared `file | directory` while the implementation indexed Git-tracked files and symlinks, and Git does not track standalone directories.

Research generator v1.3 correctly moved commit abbreviations toward deterministic full-SHA slicing, but it retained the wall-clock and entry-model contradictions. Version 1.4 adopted the fixed-SHA behavior while repairing the source-state, timestamp, self-reference, and entry-type contract explicitly rather than promoting v1.3 wholesale.

### CE-W03.R1 — generator v1.5

CE-W03 canonical-main certification exposed a promotion defect: the v1.4 "latest substantive commit" lookup could reinterpret a normal merge commit as new source state even when the exact generated companion already carried the promoted tree. This made the pre-merge indexed head green while post-merge canonical `main` regenerated different provenance metadata.

Version 1.5 repairs the invariant by structural parent equivalence rather than commit chronology. Index-only companions and normal merge promotions are peeled when a parent already carries the exact non-index tree; divergent substantive merge synthesis fails closed. The merge-stability regression is part of `pnpm verify:repo-index` so future promotion changes cannot silently reintroduce the defect.
