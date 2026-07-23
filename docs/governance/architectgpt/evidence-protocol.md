---
title: "Architect GPT Evidence Protocol"
status: canonical
visibility: public
last_updated: 2026-07-23
version: "1.0"
architect_gpt_version: "3.5"
arcanum_phase: "Pre-Genesis"
maintainer: "The-Architect-369"
---

# Architect GPT Evidence Protocol

## Purpose

Wave III converts orchestration claims into machine-verifiable local evidence. Execution and provider observations are recorded as JSON Lines under `.architect-reports/orchestration/` and remain uncommitted by default.

## Canonical files

- Schema: `docs/governance/architectgpt/execution-record.schema.json`
- Validator: `scripts/architect/validate-evidence.py`
- Producer: `scripts/architect/orchestrate.sh`

## Record types

### Execution

An execution record represents an Architect GPT action governed by a permission class. It must include the repository, branch, full commit SHA, permission class, status, timestamp, and summary.

### Provider evidence

A provider-evidence record represents observed state from GitHub, Vercel, Google Workspace, Notion, the public web, or local Termux. It must include the provider, status, reference, repository, branch, full commit SHA, timestamp, and summary.

Provider evidence is evidentiary only. It cannot override doctrine or repository canon.

## Commands

```bash
bash scripts/architect/orchestrate.sh record \
  W2 success "Repository update verified"

bash scripts/architect/orchestrate.sh evidence \
  vercel observed dpl_example \
  "Deployment for the exact branch head is READY"

bash scripts/architect/orchestrate.sh validate
```

## Validation rules

- Every non-empty JSONL line must be valid JSON.
- The schema version must be `1.0`.
- Commit identifiers must be full lowercase 40-character SHAs or `unknown`.
- Execution records require one of `R0`, `R1`, `W1`, `W2`, `W3`, or `C1`.
- Provider records require a registered provider and a non-empty external reference.
- Unsupported keys fail validation.
- Malformed local evidence blocks orchestration preflight.

## Privacy and canonicality

Local reports may contain private operational context and are excluded from Git by default. A record may be promoted into repository canon only through deliberate review and a separate authorized repository write.

## Failure semantics

Missing evidence is not success. Permission denial, unavailable data, pending state, observed state, failure, and success must remain distinct statuses.
