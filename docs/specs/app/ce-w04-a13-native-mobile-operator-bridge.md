# CE-W04-A13.1 — Native Mobile Operator Transport Foundation

Status: implementation-candidate
Phase: Pre-Genesis
Era: Construction Era
Wave: CE-W04
Arc: CE-W04-A13.1
Certified predecessor: CE-W04-A12 at `66a6479d9df921540d117820ed0d9b66eb59ba7e`

## Purpose

CE-W04-A13.1 establishes the first native Android → Termux operator transport for the
Architect surface. The tranche is deliberately limited to one read-only operation:
`probe_workspace`.

The Human taps the native Architect control, confirms one explicit dialog, and the app
asks Termux to execute one repository-owned dispatcher at one compile-time path. The
dispatcher accepts one fixed operation ID, reads canonical workspace facts, and returns
bounded JSON to an app-private one-shot result service.

A13.1 does not automate pairing, start or stop the broker, apply proposals, download
artifacts, mutate Git state, stage or commit files, push, merge, deploy, or accept free-form
shell text.

## Certified starting coordinate

The A13 branch must descend from the exact certified A12 indexed head:

`66a6479d9df921540d117820ed0d9b66eb59ba7e`

A13 predecessor regression is evaluated against an exported copy of that certified
predecessor tree. Successor provenance is evaluated against the live A13 tree.

## Native-to-Termux transport

The Android application declares only the Termux package visibility it needs and requests
the Termux-defined `com.termux.permission.RUN_COMMAND` permission.

The fixed service target is:

`com.termux/com.termux.app.RunCommandService`

The fixed command path is:

`/data/data/com.termux/files/home/Arcanum/scripts/mobile/arcanum-operator.sh`

The fixed working directory is:

`/data/data/com.termux/files/home/Arcanum`

The A13.1 Android operation registry contains exactly one operation:

`probe_workspace`

No UI, model output, proposal envelope, broker response, remote response, or caller-supplied
data may choose the executable path, working directory, environment, stdin, or arbitrary
argument vector.

The result PendingIntent targets only the non-exported
`TermuxOperatorResultService`. Each request uses a unique execution ID, a fresh nonce, and
a one-shot PendingIntent. On Android 12 and later the PendingIntent is mutable only because
Termux must attach the documented result bundle.

## One-time external setup

Termux independently requires two Human-controlled platform gates:

1. Arcanum must be granted the Termux `RUN_COMMAND` permission in Android settings.
2. Termux must have `allow-external-apps=true` in `~/.termux/termux.properties`.

The repository-owned `scripts/mobile/arcanum-operator-setup.sh` performs only the Termux
property setup and prints the Android permission step. It does not grant Android permission
to itself or to Arcanum.

The bootstrap canonical workspace is `$HOME/Arcanum`. The retired default
`$HOME/work/Arcanum` is not used for new bootstrap state.

## `probe_workspace` contract

The Termux dispatcher sets `GIT_OPTIONAL_LOCKS=0` and performs read-only Git inspection.

It checks:

- `$HOME/Arcanum` exists and is a Git worktree root;
- the resolved Git root is exactly the canonical workspace;
- `origin` identifies `The-Architect-369/Arcanum` through an accepted canonical HTTPS or
  SSH form;
- the current branch is not detached;
- current `HEAD` is a 40-character lowercase Git object ID;
- current tracked/untracked working-tree state is reported as clean or dirty;
- the historical `$HOME/work/Arcanum` location is reported if it still contains a Git
  checkout, so the Human can see duplicate-workspace risk.

The operation never changes branch, index, worktree, refs, remotes, configuration, or
repository files.

Its stdout is exactly one JSON document with schema `1.0`, operation ID
`probe_workspace`, `authorityEffect="none"`, and `repositoryMutation=false`.

## Native result validation

Android rejects a result when:

- Termux reports an internal execution error;
- the command exits nonzero;
- stdout/stderr was truncated;
- stderr is non-empty;
- stdout is not exactly one valid JSON object;
- schema, operation ID, repository identity, authority effect, or mutation flag differs
  from the A13.1 contract;
- canonical path differs from the fixed workspace path;
- `HEAD` is not lowercase 40-hex;
- the dispatcher reports a failed workspace status.

The native surface displays repository, branch, compact HEAD, cleanliness, and a warning
when the legacy workspace exists.

## Authority ceiling

A13.1 adds operating-system command-launch capability but intentionally narrows its
application-level use to the single registered read-only workspace probe.

Forbidden in A13.1:

- arbitrary shell, `bash -c`, `sh -c`, `eval`, or caller-supplied executable selection;
- caller-supplied stdin or environment injection;
- repository writes, reset, clean, checkout/switch, add, commit, apply, merge, rebase,
  push, fetch, pull, tag, or ref update;
- pairing-secret transfer;
- broker start/stop;
- proposal application;
- artifact download or installation;
- autonomous approval;
- background autonomous invocation;
- model-provider invocation.

Every successful A13.1 operation has `authorityEffect=none`.

## Android provenance

A13.1 advances installed-source provenance to:

- `versionCode = 14`
- `versionName = 0.1.13-cew04-a13-1`
- `ARCANUM_IMPLEMENTATION_ARC = CE-W04-A13.1`

Historical A11/A12 provenance remains immutable inside the certified predecessor tree.

## Certification target

A13.1 certification requires:

1. certified A12 verifier passes against an exported exact A12 tree;
2. the live manifest declares only the required Termux package visibility and RUN_COMMAND
   permission for this bridge;
3. the result service is non-exported;
4. the native operator registry contains exactly one operation: `probe_workspace`;
5. native source contains no caller-controlled command path, workdir, stdin, shell text,
   or arbitrary argument vector;
6. dispatcher tests prove pass, wrong-origin fail, legacy-workspace detection, unknown
   operation rejection, and repository snapshot immutability;
7. live Android provenance identifies CE-W04-A13.1;
8. canonical `verify-sync` includes A13.1 verifier and dispatcher fixtures;
9. Android CI compiles and assembles the native host;
10. physical Seed Node Alpha validation proves Human tap → native confirmation → Termux
    dispatcher → validated native workspace presentation without copied shell commands.
