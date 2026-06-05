---
title: "Text Communication Boundary"
status: canonical-draft
visibility: public
last_updated: 2026-06-04
description: "Clarifies Text as a communication surface subordinate to canonical module boundaries until and unless ratified as a first-class module."
phase: "Pre-Genesis"
layer: "App / Text / Boundary"
---

# Text Communication Boundary

## Purpose

This document defines the current boundary for Text.

Text exists as an app communication surface.

It is not yet defined as a first-class canonical module in `docs/architecture/canonical-modules.md`.

Until ratified otherwise, Text must operate subordinate to:

- Nexus for social fabric,
- Identity for continuity and consent,
- Wallet/Economy for any paid utility,
- App navigation and gates for access posture.

## Constraint sources

This document is subordinate to:

- `docs/architecture/canonical-modules.md`
- `docs/specs/modules/nexus-context-schema.md`
- `docs/specs/app/navigation-and-gates.md`
- `docs/doctrine/identity-model.md`
- `docs/doctrine/dignity-content-boundaries.md`

## Core principle

Text may carry messages.

Text must not become surveillance, ranking, coercion, or hidden identity authority.

## Current app posture

Current routes include:

```text
/text/contacts
/text/messages
/text/groups
```

The current implementation may read public Matrix timelines as preview surfaces.

This does not establish private messaging guarantees.

## Boundary decision

Current status:

```text
Text is an app communication surface, not an independent canonical module.
```

Future options:

1. ratify Text as its own canonical module,
2. define Text permanently as a Nexus submodule,
3. merge Text into Nexus routes.

No implementation should assume one of those future options without Human Architect decision.

## Message record

```ts
export type TextMessageRecord = {
  id: string
  createdAt: string
  senderId?: string
  recipientId?: string
  groupId?: string
  body: string
  visibility: 'public_preview' | 'direct' | 'group' | 'local_draft'
  transport: 'matrix' | 'local' | 'future_encrypted'
  receiptStatus: 'local_only' | 'sent' | 'delivered' | 'failed'
}
```

## Contact record

```ts
export type TextContactRecord = {
  id: string
  handle?: string
  identityId?: string
  consentStatus: 'unknown' | 'requested' | 'connected' | 'blocked'
  source: 'local' | 'identity_anchor' | 'matrix' | 'manual'
}
```

## Group record

```ts
export type TextGroupRecord = {
  id: string
  title: string
  visibility: 'public_preview' | 'group'
  memberPolicy: 'manual' | 'invite_only' | 'governance_defined'
  transport: 'matrix' | 'future_encrypted'
}
```

## Privacy posture

Text must not claim encryption, privacy, or delivery guarantees unless the underlying transport supports them.

The UI must clearly label:

- public preview,
- direct message,
- group message,
- local draft,
- future encrypted surface if implemented.

## Forbidden behavior

Text must not:

- scrape contacts without consent,
- publish private messages as public content,
- use messages as Vitae readiness evidence without consent,
- rank users by response speed,
- require replies to maintain status,
- expose private content on-chain,
- imply Matrix public timeline equals private chat.

## Nexus bridge

Public or channel-like Text content may be treated as Nexus content where appropriate.

Direct or group messages require stricter consent and privacy posture.

## Requires Human Architect decision

The following remain undefined:

- whether Text becomes a canonical module,
- whether Text remains a Nexus submodule,
- first private messaging transport,
- encryption requirements,
- contact discovery model,
- group creation gates,
- whether MANA is involved in anti-spam for messages.

## Canonical closure

Text carries signal.

Consent carries legitimacy.