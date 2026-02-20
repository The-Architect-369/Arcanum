---
title: "Vitae Overview"
status: canonical
visibility: public
last_updated: 2026-02-20
description: "What Vitae is, what it is not, and how to navigate its authority, constitution, curriculum, and mastery paths."
---

# Vitae Overview

Vitae is Arcanum’s **Recognition Layer of Becoming**.

It exists to **name maturation after it has stabilized** — not to force it, not to rank it, and not to convert it into a status economy. Vitae is a structure for **responsibility, coherence, and discernment** across learning and practice, while keeping human dignity intact.

If you are new to Vitae, read in this order:

1) `authority.md`  
2) `constitution/`  
3) `curriculum/overview.md` → `curriculum/index.md`

---

## What Vitae is

Vitae is a system for:

- **Recognition without coercion**  
  Acknowledging real development only after it becomes durable.

- **Structured becoming**  
  A map of grades, responsibilities, and mastery paths that are **architected**, not improvised.

- **Auditability and coherence**  
  Curriculum and mastery paths are designed to be consistent across time, with clear invariants and dependency rules.

- **Implementation alignment**  
  Vitae is not just prose: it has specs, schemas, and enforcement logic that connect doctrine to systems.

---

## What Vitae is not

Vitae is **not**:

- A leaderboard, reputation score, or social credit system  
- A moral worth hierarchy  
- A compliance weapon  
- A coercive certification gate that blocks life or dignity  
- A substitute for lived discernment

Vitae is allowed to be **silent**. Non-participation is valid. Recognition is never owed.

---

## The core posture

Vitae is built around a few non-negotiables:

- **Stability-first recognition**: becoming is recognized *after* it stabilizes.  
- **No worth scoring**: responsibility can be named; worth is never measured.  
- **Consent-respecting architecture**: the system must not trap or compel.  
- **Separation of layers**: doctrine ↔ curriculum ↔ implementation stay distinct, but aligned.

---

## How the Vitae docs are structured

Vitae documentation is organized into three primary surfaces:

### 1) Authority (meaning + posture)
- `authority.md`

This is the “why” and “how” of recognition: what authority means inside Vitae, and what it must never become.

### 2) Constitution (what is allowed, what is forbidden)
Folder: `constitution/`

This is the canonical constraint layer: invariants, audit rules, amendment mechanics, and cross-grade coherence requirements.

### 3) Curriculum (the live tree)
Folder: `curriculum/`

This contains the grade ladder, content structures, dependency discipline, and mastery paths. It is intentionally deep and modular.

**Curriculum entrypoints:**
- `curriculum/overview.md`
- `curriculum/index.md`

---

## Curriculum at a glance

Vitae curriculum is organized into:

- **Foundations** (threshold + anatomy frameworks)
- **Elementary School** (Grades I–IV)
- **Intermediate School** (Grades V–VIII)
- **High School** (Grades IX–X)
- **Experience layer** (runtime + replay + event schema discipline)
- **Lexicon** (seed definitions)
- **Specializations** (mastery paths with canon + implement)

Each grade and specialization is typically split into:

- `canon/` — invariants, responsibilities, procedures, validation rules  
- `implement/` — enforcement specs, mappings, constraint bundles, state machines  

This separation keeps the doctrine *stated clearly* while also keeping the system *buildable and testable*.

---

## How to navigate

Use these pages as “maps”:

- `index.md` — Vitae-wide navigation hub (authority + constitution + curriculum map)
- `curriculum/overview.md` — how curriculum is shaped (philosophy + structure)
- `curriculum/index.md` — the curriculum’s table of contents (grades + specializations)

If you’re doing implementation work, also reference:

- `../specs/modules/vitae.md` (implementation-facing module spec)
- relevant chain/runtime specs under `../specs/` where Vitae hooks into system behavior

---

## How to extend Vitae safely

When adding or revising Vitae content, keep these rules:

1) **Don’t break invariants**  
   If it changes “what is allowed,” it belongs in `constitution/` first.

2) **Respect cross-grade dependencies**  
   If a concept is required earlier, define it earlier (or explicitly gate it).

3) **Canon before implement**  
   State the invariant or responsibility clearly before writing enforcement logic.

4) **Never introduce worth scoring**  
   If a change can be used as status extraction, redesign it.

5) **Prefer legibility over cleverness**  
   Vitae is meant to be navigable by humans and enforceable by systems.

---

## Quick links

- Authority: `authority.md`  
- Constitution: `constitution/`  
- Curriculum: `curriculum/`  
- Curriculum map: `index.md#curriculum-map`  
- Vitae module spec: `../specs/modules/vitae.md`
