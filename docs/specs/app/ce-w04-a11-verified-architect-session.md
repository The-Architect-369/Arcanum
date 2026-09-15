---
title: "CE-W04-A11 — Verified Architect Runtime Session"
status: implementation-candidate
visibility: public
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W04"
implementation_arc: "CE-W04-A11"
last_updated: 2026-09-15
---

# CE-W04-A11 — Verified Architect Runtime Session

## Purpose

A11 repairs the trust boundary beneath the A10 local Architect console without
widening the command registry or repository authority.

The local Termux broker remains loopback-only and fixed-command. A11 adds
Human-mediated pairing, one ephemeral broker-process session, exact-byte
request/response authentication, replay/freshness controls, repository/branch/HEAD
binding, and independently checked receipt/output digests.

## Frozen capability boundary

A11 preserves the inherited A09/A10 ceiling:

- no free-form shell text;
- no repository mutation;
- no Git commit, push, merge, rebase, reset, checkout, switch, or branch mutation;
- no arbitrary file writes from Android request data;
- no automatic broker launch from Android;
- no remote Architect endpoint;
- no model-provider dependency;
- no patch generation or application;
- no package installation or update action;
- no protocol or governance authority;
- `authorityEffect=none`.

The Android allowlist remains exactly seven actions:

- `git_status`
- `git_branch`
- `git_head`
- `git_log_10`
- `git_diff_names`
- `git_diff_stat`
- `verify_sync`

The Termux broker may continue to register the backend-only `web_typecheck`
verification action; Android does not expose it.

## Pairing boundary

The Termux launcher creates a 32-byte random pairing secret only when one does not
already exist. The secret file:

- lives outside the repository under the Human's Termux-private home/config area;
- is mode `0600`;
- is never committed;
- is displayed in full only when first generated;
- may be explicitly read by the Human for one-time transfer.

The Android app accepts the 64-hex-character pairing code only through a Human
pairing dialog. The decoded secret is encrypted at rest using an AndroidKeyStore
AES-256-GCM key and app-private preferences.

Pairing is possession-based local authentication. It is not identity, governance,
protocol authority, or proof of Human intent by itself.

## Session contract

Every broker process creates a fresh random `sessionId`.

`GET /health` remains an unauthenticated loopback metadata probe and MUST expose:

- schema version;
- service identity;
- `authRequired = true`;
- `authAlgorithm = HMAC-SHA256`;
- expected native `clientId`;
- current `sessionId`;
- exact repository path;
- active branch;
- exact HEAD;
- registered command metadata.

A11 adds authenticated `POST /session` as a no-command session verification
surface. It MUST execute no repository command.

Authenticated request bodies bind:

- schema version;
- native client ID;
- broker session ID;
- unique request ID;
- unique nonce;
- request timestamp;
- exact repository path;
- active branch;
- target HEAD.

Execution requests additionally bind the registered command ID and one
Human-approval assertion.

## Exact-byte authentication

The Android client computes SHA-256 over the exact UTF-8 bytes it sends.

Request authentication uses HMAC-SHA256 over a domain-separated material string
binding method, path, client ID, session ID, request ID, request timestamp, nonce,
and exact request-body SHA-256.

Authenticated broker responses expose:

- client ID;
- session ID;
- request ID;
- exact response-body SHA-256;
- HMAC-SHA256 response authentication.

The Android client MUST independently verify all of those bindings before
accepting a successful or failed authenticated response.

## Human approval assertion

A11 removes the legacy caller-supplied Boolean as an authorization mechanism.

Each native approval dialog creates one short-lived assertion containing:

- unique `approvalId`;
- `approvedAt`;
- `surface = native_dialog`.

The assertion is covered by the authenticated request bytes.

This records that the authenticated native client reports a Human dialog approval.
It MUST NOT be interpreted as cryptographic proof of subjective Human intent, and
it grants no authority beyond the selected registered action.

## Rejection and replay rules

Before any registered command runs, the broker MUST fail closed on:

- wrong client ID;
- wrong broker session;
- malformed/missing authentication headers;
- request-body digest mismatch;
- bad HMAC;
- stale request timestamp;
- invalid nonce;
- request/session/client body/header mismatch;
- repository path mismatch;
- active branch mismatch;
- target HEAD mismatch;
- repeated request-ID/nonce pair;
- invalid or stale Human approval;
- unknown command ID.

Replay state is in-memory and scoped to the current broker process/session.

## Execution serialization

A11 permits at most one active registered broker action at a time.

A concurrent action request fails as `broker_busy`; it does not queue silently.
Process-tree cancellation and autonomous broker lifecycle management remain
deferred.

## Receipt integrity

Authenticated execution receipts retain the A10 provenance surface and add:

- client ID;
- session ID;
- request ID;
- approval assertion;
- SHA-256 of broker-bounded stdout;
- SHA-256 of broker-bounded stderr.

The Android client MUST independently verify:

- exact request-body SHA-256;
- response-body SHA-256;
- response HMAC;
- receipt result SHA-256;
- stdout SHA-256;
- stderr SHA-256.

For `resultSha256`, the broker and native verifier use the same compact canonical
JSON representation: object keys are lexicographically sorted, insignificant
whitespace is absent, UTF-8 is retained, and JSON string solidus characters `/`
are escaped as `\/` to match the Android `org.json` encoder used by the native
verifier. This secondary canonical digest is independent of the exact-byte
response-body SHA-256 and HMAC and MUST NOT replace either of them.

Raw output means the broker-bounded output returned in the authenticated receipt.
Android MUST NOT silently apply a second 4,000-character truncation while
presenting it.

## Verification target

Repository and physical validation SHOULD demonstrate:

1. An unpaired native caller cannot authenticate an execution.
2. The correct pairing verifies through `POST /session` without running a command.
3. Restarting the broker creates a new session and invalidates an old session.
4. A replayed signed request is rejected.
5. A stale signed request is rejected.
6. Repository, branch, or target-HEAD drift is rejected before command execution.
7. A wrong pairing secret is rejected.
8. `git_head` succeeds with authenticated request/response verification.
9. `verify_sync` can still complete through the inherited A09.2 timeout/TMPDIR envelope.
10. Broker and Android registered-action counts remain 8 and 7 respectively.
11. Hope capture/recall, Tempus persistence, geometry interaction, and persistent
    Arcanum navigation remain functional.
12. Repository HEAD remains unchanged after all A11 actions.

## Deferred capability

A11 does not create proposal, mutation, update, installation, conversational model,
or Hope-memory authority. Those remain separate approved arcs with their own
contracts and evidence gates.
