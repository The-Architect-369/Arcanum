---
title: "Architect GPT Production Smoke Verification Protocol"
status: implementation_candidate
version: "1.0"
phase: "Pre-Genesis"
authority: "read_only_runtime_observation"
---

# Production Smoke Verification Protocol

## Purpose

Verify that an exact Vercel deployment responds according to a bounded, non-destructive route contract.

A successful build or READY deployment is not sufficient evidence that the deployed application serves its expected routes. The smoke verifier binds observations to an exact repository commit and deployment, performs only allowlisted `GET` and `HEAD` requests, and emits a structured attestation.

It does not authenticate, submit forms, mutate application state, invoke wallet actions, deploy, merge, roll back, or modify repository refs.

## Canonical surfaces

- Protocol: `docs/governance/architectgpt/production-smoke-protocol.md`
- Attestation schema: `docs/governance/architectgpt/production-smoke.schema.json`
- Route contract: `docs/governance/architectgpt/production-smoke-routes.json`
- Executor: `scripts/architect/production-smoke.py`
- Entrypoint: `scripts/architect/smoke-production.sh`
- Fixtures: `scripts/architect/test-production-smoke.sh`
- Report directory: `.architect-reports/orchestration/production-smoke`

## Command model

```bash
scripts/architect/smoke-production.sh \
  --deployment-evidence <deployment.json> \
  [--manifest <routes.json>] \
  [--output <report.json>]
```

The deployment evidence must bind:

- repository identity;
- exact 40-character commit;
- provider `vercel`;
- deployment ID;
- deployment URL;
- target `production` or `preview`;
- state `READY`.

The evidence commit must equal the checked-out repository HEAD.

## Route contract

Each route entry declares:

- stable route identifier;
- path beginning with `/`;
- method `GET` or `HEAD`;
- expected HTTP status;
- maximum redirects;
- timeout in milliseconds;
- optional maximum duration in milliseconds;
- optional required response text markers for `GET` requests.

The route contract is data, not executable code. Duplicate IDs and duplicate method/path pairs are rejected.

## Network boundary

Production execution permits only HTTPS deployment hosts ending in `.vercel.app` or the canonical `the-arcanum.net` host. Localhost HTTP is available only through the explicit fixture-only `--allow-localhost` switch.

Redirects are bounded. Every redirect destination must remain on the original host. Cross-host redirects are rejected.

## Allowed methods

Only `GET` and `HEAD` are permitted. Request bodies are never sent. Cookies, authorization headers, and user credentials are never supplied.

## Attestation

The verifier emits a JSON attestation containing:

- schema and record identity;
- observation timestamp;
- repository, commit, deployment, and base URL;
- canonical route-contract SHA-256;
- deterministic request SHA-256;
- route-level status, redirect, timing, byte-count, and marker evidence;
- pass and failure totals;
- overall `pass` or `fail` status.

Timing values are observations and are not deterministic. The request digest is deterministic for the same exact deployment evidence and route contract.

## Pass conditions

A route passes only when:

1. the response status equals the declared expected status;
2. the redirect count does not exceed the declared maximum;
3. all redirects remain on the original deployment host;
4. required markers are present for `GET` requests;
5. the optional duration budget is met;
6. no transport or timeout error occurs.

The overall attestation passes only when every declared route passes.

## Fail-closed conditions

The verifier rejects or fails on:

- malformed deployment evidence or route contracts;
- deployment states other than `READY`;
- unsupported provider or target identity;
- evidence commits that do not equal exact HEAD;
- non-HTTPS production URLs;
- non-allowlisted production hosts;
- unsupported HTTP methods;
- paths containing a scheme, fragment, or missing leading slash;
- duplicate route identities;
- cross-host or excessive redirects;
- unexpected statuses;
- missing content markers;
- duration budget violations;
- network and timeout failures.

## Authority

Wave XXI smoke verification has R1 observational authority only. It may read public deployment responses and write local evidence. It has no repository, deployment, account, wallet, or application mutation authority.
