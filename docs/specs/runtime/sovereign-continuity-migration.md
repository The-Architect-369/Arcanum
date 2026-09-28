---
title: "Sovereign Continuity Migration and Activation Plan"
status: implementation-candidate
visibility: public
last_updated: 2026-09-28
description: "Evidence-first staged migration from provider-backed project continuity toward a node-local sovereign continuity substrate."
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W04"
layer: "Roadmap / Runtime / Architect"
authority: "Human-directed design candidate; no gate reordering or runtime activation implied"
depends_on:
  - docs/specs/runtime/sovereign-continuity-substrate.md
  - docs/specs/runtime/sovereign-continuity-object.schema.json
---

# Sovereign Continuity Migration and Activation Plan

## Objective

Move project continuity from a provider-dependent recovery pattern toward a participant-controlled node substrate while preserving exact historical provenance, provider authority boundaries, privacy, and the existing CE-W04 gate sequence.

The migration is not a database dump. It is an evidence reconciliation and typed-object reconstruction.

## Starting posture

Current project continuity is distributed across several distinct authorities and mirrors:

- GitHub: repository and CI truth, canonical Architect continuity files, source history;
- Notion: operational Work Registry and project records;
- Google Drive: documents, evidence, and collaboration artifacts;
- model conversations: development context and reasoning that are not automatically durable canon;
- local runtime/native work: participant-controlled storage and receipts;
- public sites: derived/public expression, not authority.

The migration must preserve these distinctions.

## Stage 0 — schema candidate

Deliverables:

- semantic continuity substrate specification;
- machine-readable continuity-object schema;
- migration and activation plan.

No provider data is bulk imported and no runtime storage is activated.

Exit condition:

- Human review accepts or corrects the object classes, custody model, relationship vocabulary, temporal fields, authority/effect-state model, and provider boundaries.

## Stage 1 — ARC-1 through current Arc evidence reconstruction

Goal: reconstruct the developmental Arc trail as typed candidate objects without rewriting historical records.

For each Arc:

1. recover the primary Notion Work Registry record where one exists;
2. recover exact GitHub commits, PRs, files, issues, checks, and continuity records relevant to the Arc;
3. recover selected Drive artifacts only when they materially establish the Arc;
4. classify each consequential statement as observation, report, inference, proposal, or unknown;
5. preserve event time and observation/import time separately;
6. encode dependencies and parallel tracks explicitly;
7. preserve closure-time uncertainty;
8. mark unresolved conflicts instead of guessing;
9. produce a candidate Arc object plus referenced evidence/source objects;
10. do not canonicalize the reconstructed dataset merely because the sources were imported.

Initial reconstruction target:

- ARC-1 through ARC-55, then continue with later operational Arcs allocated through the existing Work Registry process.

Because the active GitHub Architect continuity epoch has known unreconciled external session evidence, Arc reconstruction must not allocate or renumber missing ARC-SES identifiers.

## Stage 2 — provider adapter manifests

Implement read-only adapter contracts before write-back or bulk retention.

### GitHub

Capture exact refs and immutable coordinates first:

- repository;
- branch/ref;
- commit SHA;
- PR/issue/release/check identity;
- file path and blob identity where needed;
- observation time.

### Notion

Capture:

- workspace/database/page identity;
- property projection used;
- provider revision/last-edited coordinate when available;
- observation time;
- normalized Arc/gate mapping.

Notion remains an operational projection. Provider properties do not silently become canonical node authority.

### Google Drive

Capture:

- file ID;
- MIME type;
- revision/version when available;
- content digest when bytes are retained;
- observation time;
- related Arc/session/object IDs;
- retention mode.

Default to metadata-only until a specific artifact needs sovereign local retention.

## Stage 3 — local object store and deterministic indexes

After the existing runtime dependency gate allows implementation, add the node-local continuity namespace.

Minimum capabilities:

- append immutable object;
- load by object ID;
- resolve subject history;
- verify object digest;
- store/recover optional content-addressed blobs;
- derive relationship index;
- derive chronological index;
- derive current-state projection;
- fail visibly on corruption;
- rebuild indexes from source objects.

No network requirement is permitted for restart recovery.

## Stage 4 — Architect development-memory boundary

Enable the Architect to assemble conversational context from explicitly permitted local objects.

Required controls:

- namespace and disclosure filtering;
- retention-authorization check;
- provider-context preview/minimization;
- provenance attached to retrieved context;
- selected-output capture rather than automatic raw transcript retention;
- typed candidate creation for decisions, ideas, questions, corrections, events, artifacts, and gates;
- Human review or applicable authority check before durable promotion when required.

Private Hope/Journey objects remain excluded by default.

## Stage 5 — human and public projections

Add derived surfaces:

- current-state machine projection;
- Chronicle of the Arcanum;
- Arc/dependency graph;
- temporal timeline;
- public-candidate publication manifests.

A publication manifest must identify the exact source object set and reject any source whose custody policy does not permit the requested output.

Public publication remains a separate effect from local retention.

## Stage 6 — peer-node synchronization

Prove selective transfer between at least two participant-controlled nodes.

The first expected personal constellation is:

- Ubuntu development node;
- Android/Termux Seed Node.

Transfer only selected immutable objects/blobs that are replication-eligible.

Required evidence:

- sender object digest;
- receiver materialization result;
- custody-policy evaluation;
- dependency handling;
- restart recovery on receiver;
- no whole-store cloning;
- no authority derived from receipt of an object.

## Stage 7 — TEMPUS annotations

Only after factual continuity is stable should TEMPUS connotations be layered over it.

TEMPUS annotations:

- reference existing object IDs;
- preserve original factual timestamps;
- remain additive;
- distinguish doctrine, application rendering, and lived interpretation;
- grant no authority;
- do not convert rhythm into urgency, rank, worth, or prediction.

This stage may add spiral/cycle/return relationships or other temporal views without altering the underlying historical record.

## Stage 8 — optional ARCnet witness

A later separately authorized protocol stage may witness selected minimal factual digests.

The witness boundary must not publish:

- private content;
- raw conversations;
- full documents;
- narrative interpretations;
- TEMPUS semantic meaning;
- Human-worth or readiness claims.

## Reconstruction outputs

The expected long-term derived artifacts are:

```text
continuity objects       -> immutable source records
relationship index       -> rebuildable graph
timeline index           -> rebuildable chronology
current-state projection -> what evidence supports now
chronicle projection     -> human-readable history
provider mirrors         -> operational convenience
public projection        -> selected public expression
ARCnet receipts          -> minimal factual witness only
```

## Gate discipline

This design work may proceed before A17 runtime activation because it is specification work.

Runtime implementation remains subject to the controlling CE-W04 dependency chain. This plan does not claim that A14, A15, or A16 are complete, and it does not silently reprioritize A17-A20.

If the Human Architect later changes the controlling sequence, that change must be recorded explicitly rather than inferred from this design document.

## First bounded implementation after acceptance

Once the schema is accepted and the applicable runtime gate is open, the first implementation slice should be deliberately small:

1. local append/load for one continuity object;
2. SHA-256 digest verification;
3. one supersession relationship;
4. restart recovery;
5. deterministic current-state derivation over two conflicting historical objects;
6. no providers, model calls, network sync, public publishing, or chain effects.

That slice proves the sovereign substrate before external complexity is introduced.
