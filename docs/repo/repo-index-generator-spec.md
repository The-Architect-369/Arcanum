---
title: "Repo Index Generator Spec"
status: canonical
visibility: public
last_updated: 2026-02-28
description: "Deterministic generator for docs/repo/repo-index.json (structure snapshot)."
---

# Repo Index Generator Spec

This document specifies the repo index generator: a deterministic mechanism for producing a complete structural snapshot of the repository.

## Canonical output

- `docs/repo/repo-index.json`

This is the authoritative structural index of the repository at a given commit.

---

## Design principles

1) **Structure over content**  
   The index captures *what exists*, not what it means.

2) **Deterministic**  
   Given the same repo state, output must be identical.

3) **Auditable**  
   Humans can read it; tools can parse it.

4) **Fail-closed**  
   If generation fails, structural certification fails.

---

## Required fields (per entry)

Each entry MUST include:

- `path` (repo-relative path)
- `type` (`file` | `directory`)
- `size_bytes`
- `last_modified_commit` (short SHA if available; otherwise `"unknown"`)
- `is_empty` (true if empty or below threshold)
- `extension` (or empty string)
- `lines` (0 if unknown)

---

## Top-level structure

```json
{
  "generated_at": "2026-02-28T00:00:00Z",
  "repo": "The-Architect-369/Arcanum",
  "commit": "abc1234",
  "generator_version": "1.0",
  "files": [ ... ]
}