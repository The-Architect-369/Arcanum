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

Wave IX converts raw build and deployment logs into deterministic diagnostic evidence without granting the parser authority to modify code, retry deployments, or promote commits.

The control serves four functions:

1. classify recognized TypeScript, module-resolution, Next.js, runtime-boundary, environment, and warning signals;
2. map diagnostics to repository source paths and line or column locations when present;
3. collapse repeated instances of the same root signal so cascading logs do not inflate the apparent failure count;
4. bind optional deployment metadata to the analyzed log for Vercel and CI attribution.

## Inputs

The parser accepts:

- one UTF-8 build or deployment log;
- optional JSON deployment metadata;
- an optional output path.

Supported deployment metadata fields are:

- `provider`;
- `deployment_id`;
- `environment`;
- `state`;
- `branch`;
- `commit`.

Network access is not required. Provider data must be captured separately and supplied as bounded evidence.

## Classification

Recognized categories are:

- `typescript` — compiler diagnostics with TS codes and source locations;
- `module_resolution` — missing modules or unresolved imports;
- `environment` — absent or undefined environment configuration;
- `nextjs` — framework compilation, prerender, or export failures;
- `runtime_boundary` — Edge, server-only, client-component, or Server Component boundary violations;
- `warning` — non-fatal warning signals.

Errors set report status to `fail`. Warning-only or empty logs produce `pass`.

## Attribution

Attribution is evidence, not proof of causality. A diagnostic may include:

- repository-relative source path;
- one-based line number;
- one-based column number;
- compiler code;
- stable diagnostic identifier.

Repeated diagnostics with the same category, code or normalized message, and source path are collapsed into one record. This prevents a single root failure from being counted repeatedly when tools echo the same message.

## Determinism

The report binds:

- exact repository commit;
- SHA-256 of the complete input log;
- sorted diagnostics;
- SHA-256 of the canonical report content before the final report digest is added.

The same repository commit, log bytes, and metadata must produce the same `report_sha256`.

## Authority Boundary

The parser is `evidentiary_only`.

It must not:

- change repository files;
- install dependencies;
- fetch provider logs;
- retry or cancel deployments;
- infer secrets or expose environment values;
- authorize promotion or merge.

Provider connectors and human review remain responsible for obtaining trustworthy logs and deciding remediation.

## Verification

Canonical verification requires executable fixtures proving:

- deterministic output for identical inputs;
- TypeScript source and code attribution;
- module-resolution classification;
- environment and Next.js failure classification;
- warning-only pass semantics;
- duplicate collapse;
- deployment metadata binding;
- malformed metadata rejection.

Reports belong under:

```text
.architect-reports/orchestration/build-diagnostics/
```

Refer to full module schema in docs/architect/architectgpt-extended.md.
