---
title: "Vitae Content Foundation"
status: canonical-draft
visibility: public
last_updated: 2026-06-04
description: "Defines app-facing Vitae content classes, curriculum references, practice prompts, and review boundaries without assuming missing grade schemas."
phase: "Pre-Genesis"
layer: "App / Vitae / Content"
---

# Vitae Content Foundation

## Purpose

This document defines safe app-facing Vitae content categories.

The existing Vitae corpus contains deep curriculum material. This document does not replace that corpus.

It defines how app content may reference Vitae without converting it into ranking, speed optimization, or paid advancement.

## Constraint sources

This document is subordinate to:

- `docs/specs/modules/vitae-context-schema.md`
- `docs/specs/app/vitae-authority-integration.md`
- `docs/specs/modules/vitae-economy-boundary.md`
- `docs/governance/vitae-authority-map.md`
- `docs/architecture/canonical-modules.md`

## Content classes

```text
path_summary
grade_summary
chapter_summary
class_summary
practice_prompt
reflection_prompt
review_guidance
authority_explainer
local_receipt_summary
```

## App content entry

```ts
export type VitaeContentEntry = {
  id: string
  kind:
    | 'path_summary'
    | 'grade_summary'
    | 'chapter_summary'
    | 'class_summary'
    | 'practice_prompt'
    | 'reflection_prompt'
    | 'review_guidance'
    | 'authority_explainer'
    | 'local_receipt_summary'
  title: string
  summary: string
  body?: string
  gradeId?: string
  chapterId?: string
  classId?: string
  tags: string[]
  privacy: 'public' | 'local_private' | 'review_only'
  pressure: 'none'
  rewardMode: 'none' | 'review_context_only'
}
```

## Practice prompt

```ts
export type VitaePracticePrompt = {
  id: string
  title: string
  prompt: string
  suggestedMinutes?: number
  gradeId?: string
  chapterId?: string
  classId?: string
  optional: true
  pressure: 'none'
  storesPrivateNotesByDefault: true
}
```

## Allowed content posture

Allowed:

- summarize a path,
- explain a grade without rank language,
- invite optional practice,
- help a participant record local reflections,
- explain review requirements,
- generate review packet drafts with consent,
- attach TempusContext as optional temporal context.

## Forbidden content posture

Forbidden:

- “complete faster to become better,”
- “higher grade means higher worth,”
- “pay to advance,”
- “missed practice reduces readiness,”
- “local minutes grant authority,”
- “Tempus timing proves readiness,”
- “MANA purchase completes a grade.”

## Grade/chapter/class caution

The existing curriculum contains grade, chapter, and class material.

This document does not define the complete canonical grade/chapter/class ID map.

Implementation must read actual curriculum files or a future generated registry rather than inventing structure.

## Suggested registry target

A future implementation may create a generated registry:

```text
apps/web/src/lib/vitae/curriculum-registry.ts
```

or a docs-generated JSON artifact:

```text
docs/vitae/vitae-curriculum-index.json
```

That registry should be generated from actual curriculum paths, not hand-invented.

## Review content

Review guidance may explain:

- what evidence can be exported,
- what remains private,
- what authority envelope is being requested,
- that recognition is not guaranteed,
- that payment is not evidence of readiness.

Review guidance may not promise recognition.

## Tempus bridge

Vitae prompts may optionally display Tempus context.

Example:

```text
Recorded during a lunar reflection window.
```

Forbidden:

```text
This lunar timing makes the practice stronger or more advanced.
```

## Requires Human Architect decision

The following are intentionally not finalized here:

- canonical ID format for every grade/chapter/class,
- whether the first app pass should generate a curriculum registry,
- which Vitae grades unlock advanced Tempus ceremonial content,
- whether review guidance belongs in `/vitae/mastery` or a future `/vitae/authority` route.

## Canonical closure

Vitae content may teach.

Vitae content may invite practice.

Vitae content may prepare review.

Vitae content may not rank the being.