# CE-W04-A08 — Native Architect Read-Only Broker Bridge

Status: implementation candidate

## Purpose

Attach the first bounded operational capability to the native Architect surface established in A07: a Human-approved, read-only repository inspection routed through the existing Termux Architect broker on the same Seed Node Alpha device.

A08 is an Architect Evolution / Iteration Plane tranche. It improves the development loop without becoming a fourth Geometry / Embodiment / Architecture spine and without granting the Architect autonomous repository authority.

## Frozen capability

The A08 native Architect surface exposes exactly one operational action:

```text
Inspect local repository
```

The action:

1. requires an explicit Human confirmation dialog;
2. connects only to the compile-time loopback endpoint `http://127.0.0.1:8765`;
3. verifies the local service identifies itself as `arcanum-termux-broker` and is ready;
4. requests only the already-registered `git_status` broker command;
5. submits `approvedByHumanArchitect=true` only after the confirmation action;
6. receives and displays the structured execution receipt;
7. reports branch, exact commit, working-tree state, receipt ID, and result SHA when available.

## Transport boundary

A08 introduces Android `INTERNET` permission solely because Android requires that permission for TCP loopback sockets between the native app process and the Termux process.

This does **not** change the CE-W04 proof into a network-dependent or remotely connected proof:

- broker host is compile-time pinned to `127.0.0.1`;
- broker port is compile-time pinned to `8765` in the native client;
- cleartext transport is denied by default and allowed only for `127.0.0.1` / `localhost` by Android network-security configuration;
- the native broker client contains no remote HTTPS endpoint;
- model-provider access is not introduced;
- Seed Node Alpha continues to boot, render, capture/recall Hope, capture Tempus, observe, and operate when the broker is absent;
- `networkRequired=false` therefore remains true at the wave capability level.

The inherited Architect Observer observation manifest remains `transport = none`; A08 does not route observation captures through the broker.

## Broker authority boundary

The native application does not accept shell text. It delegates only a fixed command ID already registered in `scripts/architect/termux-broker.py`.

A08 MUST NOT:

- execute arbitrary shell or PTY input;
- accept a command string from user-authored text;
- run `git add`, `git commit`, `git push`, merge, checkout, reset, rebase, or branch mutation;
- alter Hope, Tempus, identity, receipts, geometry, protocol, governance, treasury, or economic state;
- read or expose secrets or environment dumps;
- invoke OpenAI or another model provider;
- start the Termux broker silently;
- operate without a distinct Human approval action;
- reinterpret a successful technical receipt as authority, readiness, certification, or permission to promote.

`authorityEffect=none` remains the truthful native presentation label.

## Termux entry point

A08 adds the repo-owned helper:

```text
scripts/mobile/arcanum-broker.sh
```

It resolves the repository root from `ARCANUM_REPO_DIR`, the current Git working tree, or `$HOME/Arcanum`; then starts the existing fixed-command broker bound to `127.0.0.1`.

This helper does not daemonize the broker, alter the repository, persist credentials, or widen the broker command registry.

## Failure behavior

If the broker is not running, is not the expected service, times out, returns a non-success HTTP status, rejects the command, or returns a failing receipt, the native Architect surface MUST report failure and MUST NOT fabricate repository state.

No retry loop, background polling, hidden broker launch, or fallback remote request is allowed in A08.

## Relationship to A07

A07 remains the persistent Arcanum shell and navigation layer. A08 mounts under the existing Architect destination. The Arcanum mark, Hope navigation, observation capture, long-press Human share flow, viewer orbit, Hope protected storage, and Tempus behavior are unchanged.

## Physical acceptance sequence

1. Install A08 over the physically accepted A07 build without clearing application data.
2. Confirm Hope recall/capture, Tempus, geometry orbit, Arcanum shell navigation, and observation capture still function.
3. Open Architect while the Termux broker is stopped.
4. Tap `Inspect local repository`, approve the dialog, and confirm an explicit broker-unavailable failure is shown.
5. In Termux, from the repository root, run `bash scripts/mobile/arcanum-broker.sh`.
6. Return to Architect and repeat `Inspect local repository`.
7. Approve the action and confirm branch, exact commit, working-tree state, receipt ID, and result SHA are shown.
8. Confirm the broker terminal shows only the registered local request and no repository mutation.
9. Stop the broker with Ctrl-C and confirm the native app continues to operate normally.
10. Relaunch the app and confirm Hope continuity is preserved.

## Forward direction

Once A08 is physically accepted, the next Architect Evolution tranche may add a small registry of additional Human-approved operations such as exact-head verification or CI inspection. Mutation remains out of scope until a separate proposal/patch/review authority contract exists.
