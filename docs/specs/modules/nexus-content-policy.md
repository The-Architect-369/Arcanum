---
title: "Nexus Content Policy"
status: canonical-draft
visibility: public
last_updated: 2026-06-04
description: "Defines Nexus post, channel, event, moderation, visibility, and anti-domination content boundaries."
phase: "Pre-Genesis"
layer: "App / Nexus / Content"
---

# Nexus Content Policy

## Purpose

This document defines safe content boundaries for Nexus.

Nexus is a social fabric surface.

It must support connection without ranking humans, enforcing doctrine through popularity, or creating domination mechanics.

## Constraint sources

This document is subordinate to:

- `docs/specs/modules/nexus-context-schema.md`
- `docs/architecture/canonical-modules.md`
- `docs/specs/app/navigation-and-gates.md`
- `docs/specs/modules/hope-content-foundation.md`

## Content classes

```text
post
reply
channel_description
event_proposal
ritual_proposal
announcement
moderation_notice
receipt_summary
```

## Allowed posture

Nexus content may:

- connect participants,
- publish posts,
- display channels,
- share event proposals,
- host ritual proposal drafts,
- surface community notices,
- link to factual receipts.

## Forbidden posture

Nexus content must not:

- rank human worth,
- create social credit scores,
- assign Vitae readiness,
- enforce doctrine by popularity,
- shame non-participation,
- imply MANA balance equals social value,
- create hidden pressure loops.

## Draft vs execution

Hope may draft Nexus proposals.

Nexus may display drafts.

Execution requires human, steward, or governance review depending on scope.

Draft content must be labeled:

```text
Draft only. Not yet scheduled or ratified.
```

## Visibility

Every post-like object should have a visibility label:

```text
public
channel
group
private_draft
```

The UI must not imply privacy beyond the actual transport/storage layer.

## Moderation posture

Moderation is a safety function, not doctrine sovereignty.

Allowed moderation reasons:

- spam,
- abuse,
- privacy violation,
- illegal content,
- safety risk,
- off-topic operational cleanup.

Forbidden moderation reasons:

- disagreement with non-binding interpretation,
- failure to perform rites,
- low MANA balance,
- lower Vitae local practice band,
- refusal to reveal private notes.

## Anti-spam MANA

MANA may be used as an anti-spam or event-creation utility if policy is explicit.

It must not buy human rank, worth, or doctrinal authority.

## Requires Human Architect decision

The following remain undefined:

- exact first moderation policy,
- whether public posting requires activation or MANA,
- whether replies exist in the first implementation,
- whether event proposals route into Tempus calendar immediately,
- whether channel creation is open, gated, or governance-reviewed.

## Canonical closure

Nexus may gather voices.

It may not manufacture hierarchy.