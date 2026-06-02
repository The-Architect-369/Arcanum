# Pass 14 — Vitae Structural UI Audit

Status: canonical-draft
Phase: Pre-Genesis
Branch: mobile
Scope: Vitae doctrine/curriculum tree compared against current app UI/UX surfaces.

## Purpose

This report audits the relationship between the deep Vitae document tree and the current app-layer Vitae UI.

The concern being addressed:

> The app currently presents Vitae as three lightweight surfaces, while the doctrine/curriculum tree describes a much deeper school, grade, specialization, and experience architecture.

## Repository Grounding

Grounding state: live-file partial scan of the mobile branch.

Reviewed surfaces:

- `docs/vitae/index.md`
- `docs/vitae/overview.md`
- `docs/vitae/curriculum/elementary-school/elementary-school-canon.md`
- `docs/vitae/curriculum/intermediate-school/intermediate-school-canon.md`
- `docs/vitae/curriculum/high-school/high-school-canon.md`
- `docs/vitae/curriculum/specializations/specialization-overview-codex.md`
- `apps/web/src/app/(app)/vitae/grade/page.tsx`
- `apps/web/src/app/(app)/vitae/path/page.tsx`
- `apps/web/src/app/(app)/vitae/mastery/page.tsx`
- `apps/web/src/lib/mobile/vitae.ts`

Also confirmed through GitHub search that the deeper tree includes `docs/vitae/curriculum/*`, grade folders, specialization master canons, and experience-layer files.

## Key Finding

The current app UI is doctrinally safe but structurally under-representative.

It avoids the major forbidden failures:

- no worth scoring,
- no ranking,
- no authority claims,
- no forced recognition.

However, it does not yet communicate the true shape of the Vitae.

The doctrine describes Vitae as a deep navigable architecture:

```text
Vitae
  ↓
Authority
  ↓
Constitution
  ↓
Curriculum
      ↓
      Elementary School: Grades I–IV
      Intermediate School: Grades V–VIII
      High School: Grades IX–X
      Experience Layer
      Lexicon
      Specializations
```

The app currently presents:

```text
Vitae
  ↓
Grade
Path
Mastery
```

That is too flat.

## Current Vitae Doctrine Structure

### Vitae Root

`docs/vitae/index.md` defines Vitae as the recognition layer of becoming and points to three primary surfaces:

- Authority,
- Constitution,
- Curriculum.

It also names the curriculum as a live structure with schools, grades, experience systems, lexicon, and specializations.

### Overview

`docs/vitae/overview.md` defines Vitae as:

- recognition without coercion,
- structured becoming,
- auditability and coherence,
- implementation alignment.

It states that the curriculum is intentionally deep and modular, and typically splits grade/specialization material into `canon/` and `implement/`.

### Elementary School

`elementary-school-canon.md` defines Grades I–IV:

- Grade I — The Guardian,
- Grade II — The Seeker,
- Grade III — The Disciple,
- Grade IV — The Mystic.

Its purpose is to stabilize the human being before systems, creation, or mastery are approached.

### Intermediate School

`intermediate-school-canon.md` defines Grades V–VIII:

- Grade V — The Scholar,
- Grade VI — The Healer,
- Grade VII — The Alchemist,
- Grade VIII — The Sage.

Its purpose is to stabilize systems and complexity.

### High School

`high-school-canon.md` defines Grades IX–X:

- Grade IX — The Oracle,
- Grade X — The Adept.

Its purpose is to stabilize creation itself and prepare for specialization.

### Specializations

`specialization-overview-codex.md` defines ten advanced specialization paths:

- Arcanist,
- Philosopher,
- Illusionist,
- Astrologer,
- Hierophant,
- Druid,
- Necromancer,
- Alchemist,
- Artificer,
- Enchanter.

Specializations are non-hierarchical, non-exclusive, and ethically constrained.

## Current App Vitae UI

### `/vitae/grade`

Current role:

- shows practice band,
- sessions,
- minutes,
- selected path,
- available practices.

Issue:

The word `Grade` in the UI does not currently represent the ten-grade Vitae school architecture.

Instead, it displays a local practice band:

- Preview,
- Beginning,
- Steady,
- Established.

This is safe, but semantically misleading.

### `/vitae/path`

Current role:

- lets the user choose one of three local practice emphases:
  - Guardian,
  - Weaver,
  - Steward.

Issue:

The doctrine uses `Path` more expansively through grade progression and specialization/mastery paths. The current three-path selector is useful as local emphasis, but it does not map clearly to the canonical ten grades or ten specializations.

### `/vitae/mastery`

Current role:

- records local practice sessions,
- stores notes,
- displays recent sessions.

Issue:

The doctrine uses mastery to imply long-duration progression through grade/specialization architecture. The app currently uses `Mastery` as a local practice ledger. This is doctrinally safe but structurally shallow.

## Main UX Mismatch

The app currently treats Vitae like:

```text
Practice tracker
```

The doctrine treats Vitae like:

```text
Living academy / curriculum tree / recognition architecture
```

The current UI is not wrong in its restraint. It is incomplete in its architecture.

## Recommended UX Reframe

The three tabs should be reconsidered as:

### 1. Map

Formerly or currently `Grade`.

Purpose:

Show the full Vitae map:

- Elementary School,
- Intermediate School,
- High School,
- Adept Threshold,
- Specializations.

This page should feel like a living library, academy map, constellation, or folder tree.

### 2. Path

Purpose:

Show the user's present local emphasis and current position.

It should answer:

- Where am I currently oriented?
- What school/grade/path is presently visible?
- What remains locked, private, or not yet appropriate?

### 3. Ledger / Practice / Mastery

Current `Mastery` page may remain, but the label should be reconsidered.

Better possible names:

- Practice,
- Ledger,
- Record,
- Continuity,
- Journal.

Because true mastery in doctrine is larger than session logging.

## Recommended Information Architecture

```text
/vitae
  redirects to /vitae/map or /vitae/path

/vitae/map
  full curriculum tree
  schools
  grades
  specializations

/vitae/path
  current local emphasis
  current visible position
  consent-aware entry points

/vitae/record
  local practice ledger
  private notes
  receipts

/vitae/authority
  future responsibility envelope display
```

## Recommended Map Model

The app should define a static Vitae curriculum registry that mirrors the canonical tree without exposing hidden curriculum.

Suggested model:

```ts
type VitaeSchool = {
  id: string
  title: string
  purpose: string
  grades: VitaeGrade[]
}

type VitaeGrade = {
  id: string
  number: string
  title: string
  function: string
  school: string
  status: 'visible' | 'threshold_locked' | 'private' | 'available'
}

type VitaeSpecialization = {
  id: string
  title: string
  mandate: string
  domain: string
  primaryRisk: string
  safeguard: string
  status: 'locked' | 'visible' | 'active'
}
```

## Recommended Grade Map

### Elementary School

- I — Guardian: self-governance and reliability
- II — Seeker: meaning discipline and inquiry stability
- III — Disciple: ethical action without authority
- IV — Mystic: perception without interpretation

### Intermediate School

- V — Scholar: structured knowledge and cognitive architecture
- VI — Healer: care, maintenance, and restoration
- VII — Alchemist: transformation and synthesis
- VIII — Sage: integration and reflective wisdom

### High School

- IX — Oracle: pattern perception and foresight without prophecy
- X — Adept: creative stabilization and governance readiness

## Recommended Specialization Map

- Arcanist: epistemic stewardship
- Philosopher: coherence without closure
- Illusionist: perceptual hygiene
- Astrologer: scale and rhythm without fate
- Hierophant: threshold stewardship
- Druid: living systems stewardship
- Necromancer: ethical endings and release
- Alchemist: ethical transformation
- Artificer: responsible form and tool stewardship
- Enchanter: meaning and resonance without control

## App Implementation Priority

### Phase 1 — Rename or clarify current tabs

Current `Grade` should not imply the canonical grade system unless it displays the actual grades.

Options:

- Rename `Grade` → `Map`, or
- Keep `Grade` but implement the full grade map.

Current `Mastery` should not imply total mastery unless it includes specialization/long-duration architecture.

Options:

- Rename `Mastery` → `Record`, or
- Expand it into mastery-path architecture.

### Phase 2 — Add static Vitae registry

Create a static app-side registry from the public-facing canon:

- schools,
- grades,
- specializations,
- descriptions,
- constraints.

### Phase 3 — Build `/vitae/map`

Display:

- schools as major sections,
- grades as cards/books/doors,
- specializations as post-Adept paths,
- no gamified progress bar.

### Phase 4 — Connect `/vitae/path`

Path should show present orientation against the map.

It should not falsely imply that choosing a path equals recognition.

### Phase 5 — Preserve local ledger

Keep session recording local/private.

Rename or contextualize to avoid confusing practice records with canonical mastery.

## UX Direction

Vitae should feel less like:

```text
fitness tracker
```

and more like:

```text
academy archive
living library
threshold map
folder tree
constellation of schools and paths
```

Each grade can be represented as:

- a book,
- a school door,
- a sealed folder,
- a threshold card,
- a chamber in a larger map.

Each specialization can be represented as:

- a post-Adept discipline,
- a non-hierarchical path,
- a stewardship domain.

## Safety Constraints

The map must avoid:

- leaderboards,
- percentage progress,
- social comparison,
- superiority language,
- pressure to advance,
- paid unlocking,
- public disclosure by default.

## Immediate Recommendation

The next implementation should not add governance yet.

It should first realign the Vitae UI language and structure:

1. Add `apps/web/src/lib/mobile/vitae-map.ts`.
2. Add full grade and specialization registry.
3. Replace `/vitae/grade` with a true map view or rename it.
4. Recontextualize `/vitae/mastery` as a local record/ledger.
5. Keep `/vitae/path` as current orientation.

## Canonical Closure

The current Vitae UI is safe but too shallow.

The doctrine describes a living curriculum architecture.

The app should let the user feel that architecture without turning it into pressure, status, or a game.
