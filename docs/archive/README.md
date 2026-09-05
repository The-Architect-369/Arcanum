---
title: "Historical Material"
status: canonical
visibility: public
last_updated: 2026-09-04
description: "Boundary for superseded historical material; active instruction comes only from current canonical sources."
---

# Historical Material

`docs/archive/` is a bounded historical surface, not a second source of current truth.

## Authority rule

Archived material is **never active instruction** merely because it remains in the working tree.

Current doctrine, governance, architecture, specifications, implementation, and exact Git state control their respective domains. Active code, validators, or Architect instructions must not depend on a superseded archive body for present semantics.

## Working-tree archive boundary

After the post-CE-W01 cleanup, the only historical implementation payload intentionally retained in `docs/archive/` is:

- `docs/archive/chain/arcanum/app-disabled/`

That exception exists because `docs/specs/chain/README.md` explicitly assigns disabled chain source to that location for bounded migration/recovery context. Those `.disabled` files are not active build inputs.

Superseded app guides, legacy ArchitectGPT bodies, the pre-schema HOPE session prototype, old migration notes, and the obsolete chain command scaffold are Git-history-only. They do not remain as working-tree copies.

Architect continuity before `ARC-CONT-EPOCH-2` is preserved by `docs/governance/architectgpt/continuity-epoch.json`, not by archive replay.

## Provenance anchor

The certified pre-contraction working-tree archive is preserved at:

```text
17ab0eec51622a0cfbffae867e27d65059a29b60
```

Recover a removed historical path without reactivating it:

```bash
git show 17ab0eec51622a0cfbffae867e27d65059a29b60:<path>
```

List the complete pre-contraction archive tree:

```bash
git ls-tree -r --name-only 17ab0eec51622a0cfbffae867e27d65059a29b60 docs/archive
```

That commit is a provenance anchor only. It has no current instructional authority.
