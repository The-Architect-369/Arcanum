---
title: Architect GPT Build Diagnostics and Attribution Protocol
status: canonical
version: 1.0
roadmap_wave: IX
arcanum_phase: Pre-Genesis
authority: evidentiary_only
---

# Build Diagnostics and Attribution Protocol

## Purpose

The build-diagnostics control converts raw build/deployment logs into deterministic diagnostic evidence without granting the parser authority to modify code, retry deployments, or promote commits.

It:

1. classifies recognized TypeScript, module-resolution, Next.js, runtime-boundary, environment, and warning signals;
2. maps diagnostics to source paths/locations when present;
3. collapses repeated instances of the same root signal;
4. binds optional deployment metadata for provider attribution.

## Inputs

The parser accepts one UTF-8 build/deployment log, optional JSON deployment metadata, and an optional output path.

Supported deployment metadata fields are `provider`, `deployment_id`, `environment`, `state`, `branch`, and `commit`.

Network access is not required. Provider data must be captured separately and supplied as bounded evidence.

## Classification

Recognized categories are:

- `typescript`
- `module_resolution`
- `environment`
- `nextjs`
- `runtime_boundary`
- `warning`

Errors set report status to `fail`. Warning-only or empty logs produce `pass`.

## Attribution and determinism

Attribution is evidence, not proof of causality. Diagnostics may include source path, one-based line/column, compiler code, and stable diagnostic identity.

Repeated diagnostics with the same category, code/normalized message, and source path are collapsed.

The report binds the exact repository commit, SHA-256 of the input log, sorted diagnostics, and SHA-256 of canonical report content before the final report digest is added. Identical commit/log/metadata input must produce the same `report_sha256`.

## Authority boundary

The parser is `evidentiary_only`. It must not change repository files, install dependencies, fetch provider logs, retry/cancel deployments, infer or expose secrets, or authorize promotion/merge.

Provider connectors and Human review remain responsible for trustworthy source evidence and remediation decisions.

## Verification

Canonical fixtures must prove deterministic output, TypeScript/source attribution, module-resolution/environment/Next.js classification, warning-only pass semantics, duplicate collapse, deployment metadata binding, and malformed-metadata rejection.

Reports belong under:

```text
.architect-reports/orchestration/build-diagnostics/
```

Current Architect operating authority is defined by `docs/governance/architectgpt/architect-gpt.md` and its machine manifest. Archived Architect specifications are not dependencies of this protocol.
