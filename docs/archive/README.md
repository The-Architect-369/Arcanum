---
title: "Historical Material"
status: canonical
visibility: public
last_updated: 2026-09-04
description: "Boundary for superseded historical material; active instruction must come from current canonical sources."
---

# Historical Material

`docs/archive/` contains superseded material retained temporarily or intentionally for bounded audit/migration purposes.

## Authority rule

Archived material is **never active instruction** merely because it remains in the working tree.

A current canonical source always wins. Active code, specifications, validators, or Architect instructions must not depend on an archived document for present semantics.

## Post-CE-W01 policy

The repository is moving to a leaner history model:

- Git commit history is the durable source for superseded document bodies;
- the active tree should retain only historical material with a demonstrated current audit/migration need;
- when that need is absent, keep a compact provenance/replacement pointer and remove the old body from the working tree;
- deleting a superseded working-tree copy does not erase its Git history.

Until the post-CE-W01 cleanup is certified, some legacy bodies remain here because existing validators still reference them. Their presence does not grant authority.

See `docs/tooling/archive-manifest.yaml` for replacement mappings and GitHub issue #41 for the cleanup record.
