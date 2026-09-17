# CE-W04-A13.3 — Human-Triggered Broker Lifecycle

Status: implementation-candidate
Phase: Pre-Genesis
Era: Construction Era
Wave: CE-W04
Arc: CE-W04-A13.3
Certified predecessor: CE-W04-A13.2 at `608c6bd1a8283ef20e07160c2d32ac15ec24b41a`

## Purpose

CE-W04-A13.3 removes copied shell commands from the local broker lifecycle while
preserving the authenticated A11 broker boundary and the fixed A13 native operator
transport.

After A13.3, the Human may explicitly start or stop the local Architect broker from the
native Architect surface. App launch, workspace probing, pairing, broker probing, proposal
review, model output, and background execution do not start or stop the broker.

## Fixed operation registry

The Android → Termux operator registry contains exactly four compile-time IDs:

1. `probe_workspace`
2. `pair_native_client`
3. `start_broker`
4. `stop_broker`

The command path remains fixed at:

`/data/data/com.termux/files/home/Arcanum/scripts/mobile/arcanum-operator.sh`

No caller data may select shell text, executable path, workdir, stdin, environment, host,
port, broker argv, state path, log path, or signal target.

## Start contract

`start_broker` requires one explicit native Human confirmation.

Termux validates the canonical `$HOME/Arcanum` repository, canonical origin, attached
branch, lowercase 40-hex HEAD, the exact repo-owned broker script, the canonical pairing
secret, secret mode `0600`, and Termux `TMPDIR`.

The helper then launches only:

```text
python <canonical repo>/scripts/architect/termux-broker.py
  --repo <canonical $HOME/Arcanum>
  --secret-file <canonical private secret>
  --host 127.0.0.1
  --port 8765
```

The argv is constructed internally as a list and executes with `shell=False`. The child is
detached with a fresh process session so it can survive completion of the one-shot Termux
RunCommand request.

Before returning success, A13.3 polls `/health` and validates the A11 service identity,
loopback repository, branch, HEAD, authenticated-service requirement, and fresh broker
session ID.

Starting the broker does not approve any broker action. Every A11 registered action still
requires its own authenticated native Human approval assertion.

## Owned lifecycle state

A13.3 records only non-secret lifecycle metadata at:

`$HOME/.config/arcanum/architect-broker.lifecycle.json`

and broker stdout/stderr at:

`$HOME/.config/arcanum/architect-broker.log`

Both are private mode `0600`. The state binds the broker PID to its `/proc` start ticks and
exact fixed argv, repository, branch, HEAD, session ID, secret path, log path, and port.

If a valid owned broker is already running, `start_broker` is idempotent and returns
`already_running`.

If loopback port `8765` is occupied without matching A13.3 ownership state, start fails
closed. It does not replace, signal, or adopt the unknown process.

## Stop contract

`stop_broker` requires a separate explicit native Human confirmation.

When lifecycle state exists, A13.3 may signal only the process whose PID, `/proc` start
ticks, and exact argv all match the recorded owned broker identity. It first sends
`SIGTERM`; if that exact owned process does not exit within the bounded grace period,
`SIGKILL` is permitted only as a fallback for that same verified process.

A PID-reused, argv-mismatched, malformed-state, or unowned listener fails closed and is
never signaled.

A missing broker with no loopback listener returns idempotent `already_stopped`.

## Result contract

Successful lifecycle results use schema `1.0` and report:

- exact operation ID;
- `authorityEffect="none"`;
- `repositoryMutation=false`;
- explicit `runtimeEffect` (`broker_started`, `broker_stopped`, or `none`);
- canonical repository/workspace identity;
- branch and HEAD;
- broker lifecycle state;
- owned PID when applicable;
- fixed port `8765`;
- broker session ID when applicable;
- fixed lifecycle-state and log paths.

Pairing material is never included in lifecycle results or logs.

## Authority ceiling

A13.3 adds bounded local process lifecycle effects only. It does not add repository,
governance, proposal, deployment, or model authority.

Forbidden:

- autonomous broker startup or shutdown;
- start/stop from app launch or background policy;
- arbitrary shell;
- caller-selected executable paths or argv;
- caller-selected host/port/environment;
- signaling an unowned process;
- repository writes or Git mutation;
- widening the A11 broker command registry;
- bypassing A11 per-action Human approval;
- proposal application;
- artifact installation;
- Git commit/push/merge;
- production deployment;
- model-provider invocation.

## Android provenance

- `versionCode = 16`
- `versionName = 0.1.13-cew04-a13-3`
- `ARCANUM_IMPLEMENTATION_ARC = CE-W04-A13.3`

## Certification target

A13.3 requires:

1. exact certified A13.2 ancestry from `608c6bd1a8283ef20e07160c2d32ac15ec24b41a`;
2. frozen A12 predecessor regression remains green;
3. exactly four native operator IDs;
4. explicit Human confirmation independently for start and stop;
5. fixed loopback `127.0.0.1:8765` broker argv with `shell=False`;
6. private lifecycle state/log paths;
7. PID + `/proc` start-time + exact-argv ownership binding before stop;
8. idempotent already-running/already-stopped behavior;
9. rejection of an unowned loopback listener without signaling it;
10. repository HEAD/worktree immutability across lifecycle fixtures;
11. A13.3 Android provenance;
12. canonical `verify-sync` pass;
13. exact-head Android CI assembly;
14. physical Seed Node Alpha start → authenticated broker → stop flow with no copied shell command.

Native workspace verification remains A13.4.
