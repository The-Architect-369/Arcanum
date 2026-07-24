---
title: "Architect GPT AST and Dependency Integrity Protocol"
status: canonical
visibility: public
phase: Pre-Genesis
---

# AST and Dependency Integrity Protocol

## Purpose

This protocol defines how Architect GPT verifies TypeScript source integrity before repository promotion. It supplements, but does not replace, the canonical TypeScript compiler and production build.

## Authority boundary

AST and dependency reports are evidentiary only. They may block promotion when failures are present, but they do not alter doctrine, grant permissions, or authorize repository writes.

## Canonical inputs

- project configuration: `apps/web/tsconfig.json`
- package declarations: `apps/web/package.json`
- source surface: `apps/web/src/**/*.{ts,tsx}`
- analyzer: `scripts/architect/ast-integrity.py`
- report schema: `docs/governance/architectgpt/ast-integrity.schema.json`

## Required checks

A passing report requires all of the following:

1. The TypeScript compiler accepts the configured project with `--noEmit`.
2. Every relative or `@/` local import resolves to a repository source file.
3. Every external package import is declared in dependencies, development dependencies, peer dependencies, or optional dependencies.
4. Node built-in modules are not misclassified as external package drift.
5. The local source dependency graph contains no import cycles.
6. The report is bound to the exact repository HEAD.
7. Report paths and hashes are deterministic across Ubuntu and Termux workspaces.

## Failure classes

- `compiler_errors`: TypeScript parsing, type, configuration, or module-resolution failures reported by `tsc`.
- `unresolved_local_imports`: relative or `@/` imports that cannot be resolved.
- `undeclared_dependencies`: external package imports absent from the package manifest.
- `dependency_cycles`: a closed local module path discovered by deterministic depth-first traversal.

Any non-empty failure class sets the report status to `fail`.

## Report contract

The analyzer emits `ast_dependency_integrity_report` schema version `1.0`. Reports include the exact commit, project path, source-file count, failure count, structured findings, and a SHA-256 digest over the canonical report payload.

Default report destination:

```text
.architect-reports/orchestration/ast-integrity/
```

## Verification fixtures

`scripts/architect/test-ast-integrity.sh` must prove:

- the live application passes;
- repeated clean runs produce the same report digest;
- malformed TypeScript is rejected;
- unresolved local imports are rejected;
- undeclared external dependencies are rejected;
- local dependency cycles are rejected.

Fixtures must clean up all temporary source files before exit.

## Promotion rule

Wave promotion is blocked when the analyzer, its schema, its fixtures, or the TypeScript compiler fails. A passing AST report does not replace the full web typecheck, production build, repository sync, CI promotion evidence, or Vercel exact-head verification.
