---
title: "Nexus Context Schema"
status: canonical-draft
visibility: public
last_updated: 2026-06-04
description: "Defines Nexus social context, posts, channels, event proposals, visibility, and no-ranking boundaries."
phase: "Pre-Genesis"
layer: "App / Nexus / Schema"
---

# Nexus Context Schema

## Purpose

This document defines the implementation-facing schema for Nexus context.

Nexus is social fabric.

It supports connection and discourse without domination mechanics.

## Constraint sources

This document is subordinate to:

- `docs/architecture/canonical-modules.md`
- `docs/specs/modules/nexus-content-policy.md`
- `docs/specs/app/navigation-and-gates.md`
- `docs/specs/economy/mana-lifecycle.md`
- `docs/specs/modules/hope-context-schema.md`
- `docs/specs/modules/tempus-context-schema.md`

## Core principle

Nexus may connect participants.

Nexus may not rank human worth, enforce doctrine, or alter Vitae progression.

## TypeScript target

A first implementation may create:

```text
apps/web/src/lib/nexus/context.ts
```

## Visibility

```ts
export type NexusVisibility = 'public' | 'channel' | 'group' | 'private_draft'
```

## Nexus context

```ts
export type NexusContext = {
  version: 'nexus.context.v0.1'
  capturedAt: string
  identityId?: string | null
  activeChannelId?: string
  visibility: NexusVisibility
  source: 'matrix' | 'local_draft' | 'arcnet_receipt' | 'helia_cid'
  warnings: string[]
}
```

## Post record

```ts
export type NexusPostRecord = {
  id: string
  createdAt: string
  authorId?: string
  body: string
  visibility: NexusVisibility
  media?: Array<{
    cid: string
    name?: string
    mime?: string
    size?: number
  }>
  contextIds?: {
    tempusContextId?: string
    hopeDraftId?: string
  }
  receiptStatus: 'local_only' | 'published' | 'anchored'
}
```

## Channel record

```ts
export type NexusChannelRecord = {
  id: string
  title: string
  summary?: string
  visibility: 'public' | 'group'
  moderationMode: 'human_review' | 'community_guided' | 'governance_defined'
  rankingMode: 'none' | 'chronological' | 'curated'
}
```

`rankingMode` must never rank humans by worth.

## Event proposal

```ts
export type NexusEventProposal = {
  id: string
  createdAt: string
  title: string
  summary: string
  proposedBy?: string
  tempusContextId?: string
  hopeDraftId?: string
  status: 'draft' | 'submitted' | 'scheduled' | 'declined'
  executionAuthority: 'none' | 'human_review' | 'governance_required'
}
```

Hope may draft a proposal. Nexus may display it. Execution requires separate authority.

## MANA boundary

MANA may be used for:

- anti-spam posting gates,
- public event creation,
- channel creation where governance permits,
- optional media/storage utility.

MANA may not be used to:

- buy reach as human superiority,
- purchase doctrine enforcement,
- alter Vitae progression,
- force social access,
- rank participants by balance.

## Receipt boundary

Allowed receipts:

- `nexus_post_published`
- `nexus_event_proposed`
- `nexus_event_scheduled`
- `nexus_channel_created`

Forbidden receipts:

- `user_ranked_higher`
- `vitae_advanced_by_social_score`
- `doctrine_enforced_by_popularity`

## Requires Human Architect decision

The following remain undefined:

- first moderation mode,
- exact Matrix room/channel mapping,
- whether posting costs MANA in the first implementation,
- whether Nexus event scheduling integrates with Tempus calendar immediately,
- whether Nexus supports private encrypted groups in the first pass.

## Canonical closure

Nexus connects.

Nexus does not dominate.