# CE-W04-A13.4 — Native Workspace Verification

Status: implementation-candidate
Phase: Pre-Genesis
Era: Construction Era
Wave: CE-W04
Arc: CE-W04-A13.4
Certified predecessor: CE-W04-A13.3 at `e06143883fb67c7185e98d65845153d6444c1b05`

## Purpose

CE-W04-A13.4 removes copied shell commands from canonical workspace certification. After
one explicit native Human confirmation, Android may ask Termux to run one fixed
`verify_workspace` operation through the existing A13 operator transport.

A13.4 does not require the A11 broker to be running and does not require native pairing.
It does not replace the authenticated A11 broker command registry; it adds only one fixed
native operator action whose sole verifier target is the repository-owned
`scripts/verify-sync.sh`.

## Fixed operation registry

The Android → Termux operator registry contains exactly five compile-time IDs:

1. `probe_workspace`
2. `pair_native_client`
3. `start_broker`
4. `stop_broker`
5. `verify_workspace`

The command path remains fixed at:

`/data/data/com.termux/files/home/Arcanum/scripts/mobile/arcanum-operator.sh`

No caller data may select shell text, executable path, verifier path, workdir, stdin,
environment, timeout, repository path, log path, or additional argv.

## Verification contract

`verify_workspace` requires explicit native Human confirmation.

Before execution, Termux validates:

- canonical `$HOME/Arcanum` Git root;
- accepted `The-Architect-369/Arcanum` origin;
- attached branch;
- lowercase 40-hex HEAD;
- clean Git worktree;
- exact repository-owned `scripts/verify-sync.sh`;
- usable Termux `TMPDIR`.

The helper launches only:

```text
bash <canonical $HOME/Arcanum>/scripts/verify-sync.sh
```

with `shell=False`, fixed argv, no stdin, a bounded inherited Termux toolchain environment,
and a 420-second deadline.

The verifier output is not returned through Android's one-shot result payload. Combined
stdout/stderr is written to one private local file:

`$HOME/.config/arcanum/architect-workspace-verification.log`

The directory is mode `0700` and the log is mode `0600`. Each verification truncates and
reuses that one log rather than accumulating unbounded artifacts.

After verification, A13.4 revalidates canonical origin, branch, HEAD, and worktree
cleanliness. Any branch/HEAD drift, origin rejection, or non-clean worktree after the run
fails closed as `repository_state_changed` and reports `repositoryMutation=true`.

## Result contract

The one-line schema `1.0` result reports:

- `operationId="verify_workspace"`;
- pass/fail status and bounded reason;
- `authorityEffect="none"`;
- observed `repositoryMutation`;
- `runtimeEffect` (`verification_log_written` or `none`);
- canonical repository/workspace identity;
- branch and HEAD;
- clean-before and clean-after facts;
- verifier exit code;
- verified check count;
- duration;
- fixed private log path;
- SHA-256 of the exact private verification log.

A PASS requires exit code `0`, exact `15/15` final `verify-sync` receipt, unchanged
branch/HEAD, and clean worktree before and after.

## Authority ceiling

A13.4 adds verification execution only. It does not add repository, governance, proposal,
deployment, model, or autonomous approval authority.

Forbidden:

- arbitrary shell;
- caller-selected executable or verifier path;
- caller-selected argv, environment, timeout, repository, or log path;
- Git staging, commit, reset, checkout, merge, rebase, fetch, pull, push, or clean;
- proposal application;
- artifact installation;
- broker auto-start;
- broker action approval;
- widening the A11 broker registry;
- model-provider invocation;
- production deployment.

The only intended persistent filesystem effect is rewriting the private verification log
outside the repository. Successful verification reports `repositoryMutation=false` and
`authorityEffect="none"`.

## Android provenance

- `versionCode = 17`
- `versionName = 0.1.13-cew04-a13-4`
- `ARCANUM_IMPLEMENTATION_ARC = CE-W04-A13.4`

## Certification target

A13.4 requires:

1. exact certified A13.3 ancestry from `e06143883fb67c7185e98d65845153d6444c1b05`;
2. frozen A12 predecessor regression remains green;
3. exactly five native operator IDs;
4. explicit Human confirmation for `verify_workspace`;
5. fixed `bash scripts/verify-sync.sh` execution with `shell=False`;
6. clean-worktree precondition;
7. private `0600` bounded verification log;
8. exact branch/HEAD/cleanliness post-attestation;
9. mutation-detection fixture;
10. no broker or pairing dependency for native verification;
11. A13.4 Android provenance;
12. canonical `verify-sync` pass;
13. exact-head Android CI assembly;
14. physical Seed Node Alpha native verification PASS with no copied shell command.

Artifact/application handoff and final UX closure remain A13.5.
