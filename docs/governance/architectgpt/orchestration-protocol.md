---
title: "Architect GPT Orchestration Protocol"
status: canonical-supporting
visibility: internal
last_updated: 2026-07-23
architect_gpt_version: "3.5"
arcanum_phase: "Pre-Genesis"
---

# Architect GPT Orchestration Protocol

This protocol turns the Architect GPT capability fabric into an auditable operating loop. It supports the canonical Architect GPT specification and does not create independent authority.

## 1. Operating sequence

Every structured action follows:

`GROUND → INSPECT → DIAGNOSE → PLAN → AUTHORIZE → ACT → VERIFY → RECORD`

A stage may be skipped only when it is demonstrably inapplicable. Authorization and verification may not be skipped for write, merge, deployment, rollback, or constitutional-impact actions.

## 2. Session grounding

At the beginning of repository work, the orchestration control must capture:

- repository and branch;
- stable or integration branch role;
- current commit and working-tree state;
- Architect GPT version and Arcanum phase;
- repository-index timestamp and commit;
- observed provider states;
- source and authority boundaries.

Generate a local session record with:

```bash
bash scripts/architect/orchestrate.sh session "task label"
```

Reports are evidence only and remain under `.architect-reports/orchestration/`.

## 3. Capability preflight

Run:

```bash
bash scripts/architect/orchestrate.sh preflight
```

The preflight validates local commands, canonical files, GitHub CLI state when available, registered provider observations, and repository synchronization policy.

Provider observations are not interchangeable:

- GitHub is authoritative for repository state.
- Vercel is authoritative for observed deployment state.
- Google Workspace is working context and is non-canonical.
- Termux is local verification evidence.
- External research is evidentiary only.

## 4. Permission classes

| Class | Surface | Required gate |
|---|---|---|
| R0 | Public research | No confirmation |
| R1 | Connected private read | Contextual disclosure |
| W1 | Reversible external write | Explicit human request |
| W2 | Repository-history write | Explicit human request and visible permission |
| W3 | Merge, deploy, promote, rollback | Explicit human request and green verification evidence |
| C1 | Constitutional impact | Explicit human request and impact report |

The highest applicable permission class governs the whole action.

## 5. Execution records

Record material actions with:

```bash
bash scripts/architect/orchestrate.sh record W2 success "updated capability registry"
```

Each JSONL record includes timestamp, repository, branch, commit, permission class, status, and summary. Records are local operational evidence unless intentionally ratified into repository documentation.

## 6. Google Workspace boundary

Google Drive, Docs, Sheets, Slides, Gmail, Calendar, and Contacts may provide planning and working context. Their content does not become Arcanum canon automatically.

Canonical adoption requires:

1. explicit review;
2. reconciliation with doctrine and existing repository canon;
3. repository change under the appropriate permission class;
4. verification and recorded provenance.

## 7. Vercel feedback boundary

Deployment state must be associated with an exact Git commit. A successful local build does not imply a successful Vercel deployment, and a successful preview does not authorize promotion or merge.

Merge or deployment requires:

- exact branch and commit grounding;
- typecheck and build evidence where applicable;
- repository synchronization success;
- successful provider status;
- explicit Human Architect authorization.

## 8. Failure semantics

The orchestration layer must distinguish:

- unavailable provider;
- unauthenticated provider;
- permission denial;
- missing data;
- stale evidence;
- command failure;
- policy failure.

It must not convert uncertainty into a passing state.

## 9. Canonical relationship

Authority remains ordered as:

1. canonical doctrine;
2. ratified governance;
3. live repository code;
4. GitHub branch and commit state;
5. CI and deployment evidence;
6. connected workspace context;
7. external research;
8. model inference.

Architect GPT remains an instrument of the Human Architect, not an autonomous governing authority.
