---
title: "Vitae Context Schema"
status: canonical-draft
visibility: public
last_updated: 2026-06-04
description: "Defines the app-facing Vitae context, practice session, review packet, and TempusContext attachment boundaries."
phase: "Pre-Genesis"
layer: "App / Vitae / Schema"
---

# Vitae Context Schema

## Purpose

This document defines the implementation-facing schema for Vitae app context.

VitaeContext represents local practice, selected path, curriculum references, optional Tempus context, and future review packet structure.

It does not represent worth, superiority, guaranteed readiness, or automatic authority.

## Constraint sources

This document is subordinate to:

- `docs/specs/app/vitae-authority-integration.md`
- `docs/specs/modules/vitae-economy-boundary.md`
- `docs/governance/vitae-authority-map.md`
- `docs/architecture/canonical-modules.md`
- `docs/specs/modules/tempus-context-schema.md`
- `docs/doctrine/authority.md`

## Core principle

Vitae may remember practice.

Vitae may prepare review.

Vitae may not claim that local metrics alone make a participant ready, worthy, superior, or authoritative.

## TypeScript target

A first implementation may create:

```text
apps/web/src/lib/vitae/context.ts
```

## Local band

Current app bands are local practice summaries only.

```ts
export type VitaeLocalBand =
  | 'Preview'
  | 'Beginning'
  | 'Steady'
  | 'Established'
```

These labels must not unlock governance authority.

## Vitae path

```ts
export type VitaePath = {
  id: string
  title: string
  summary: string
  source: 'local_selection' | 'curriculum_reference'
}
```

A path is an emphasis, not destiny, rank, or authority.

## Practice session

```ts
export type VitaePracticeSession = {
  id: string
  recordedAt: string
  pathId?: string
  gradeId?: string
  chapterId?: string
  classId?: string
  minutes?: number
  note?: string
  noteVisibility: 'local_private' | 'consented_export'
  tempusContextId?: string
  receiptStatus: 'local_only' | 'queued' | 'anchored'
}
```

Notes are local-private by default.

`tempusContextId` may reference a locally captured TempusContext, but Tempus timing must not advance Vitae automatically.

## Vitae context

```ts
export type VitaeContext = {
  version: 'vitae.context.v0.1'
  capturedAt: string
  identityId?: string | null
  selectedPath?: VitaePath | null
  localBand: VitaeLocalBand
  sessionCount: number
  totalMinutes?: number
  latestSessionAt?: string | null
  authorityState?: VitaeAuthorityState
  privacy: {
    notesDefault: 'local_private'
    exportRequiresConsent: true
  }
}
```

## Authority state reference

Authority state must follow `docs/specs/app/vitae-authority-integration.md`.

```ts
export type VitaeAuthorityEnvelope =
  | 'participant'
  | 'witness'
  | 'steward_candidate'
  | 'module_steward'
  | 'governance_steward'
  | 'treasury_steward'
  | 'protocol_steward'
  | 'architect_delegate'
  | 'architect_succession_council'

export type VitaeAuthorityState = {
  envelope: VitaeAuthorityEnvelope
  source: 'local_preview' | 'review_pending' | 'recognized' | 'chain_witnessed'
  moduleScope?: string
  grantedAt?: string
  receiptId?: string
  txHash?: string
  notes?: string
}
```

`local_preview` must never unlock real governance execution.

## Review packet

```ts
export type VitaeReviewPacket = {
  id: string
  createdAt: string
  requestedEnvelope?: VitaeAuthorityEnvelope
  requestedScope?: string
  reason: string
  consentedEvidence: Array<{
    type: 'practice_summary' | 'session_reference' | 'public_contribution' | 'governance_draft' | 'other'
    reference: string
    includesPrivateNotes: boolean
  }>
  status: 'draft' | 'submitted' | 'deferred' | 'recognized' | 'declined'
}
```

Review packets require explicit consent before private notes are included.

## Forbidden fields

Do not implement:

```ts
readinessScore: number
worthScore: number
rank: number
speedScore: number
automaticAuthority: boolean
paidAdvancement: boolean
```

## Tempus bridge

Allowed:

- attach factual TempusContext to practice session,
- include timestamps in review packets,
- describe context as optional supporting evidence.

Forbidden:

- advance grade because of timing,
- score readiness from Tempus,
- punish missed windows,
- imply ceremonial layer equals Vitae readiness.

## ARCnet bridge

ARCnet may witness factual review or authority events only after governance activates that path.

Allowed receipt examples:

- `vitae_review_submitted`
- `vitae_authority_assigned`
- `vitae_authority_suspended`

Forbidden chain payloads:

- private notes,
- curriculum answers,
- readiness scores,
- public rankings,
- superiority claims.

## Requires Human Architect decision

The following remain undefined and must not be assumed:

- exact grade/chapter/class canonical ID format,
- exact review authority flow for each Vitae grade,
- whether ceremonial Tempus layers require a specific Vitae envelope,
- whether any review processing fee exists in the first app implementation.

## Canonical closure

VitaeContext may organize practice.

It may prepare review.

It must not sell, score, or automate becoming.