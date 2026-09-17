# Termux Repository Verification

Status: active portable verification workflow  
Canonical branch: `main`  
Environment: Android Termux inside the isolated work profile

## Purpose

Termux is a portable local verification surface for Arcanum. It is not a branch authority and does not define a permanent integration branch.

The normal checkout begins from `main`. When an explicitly authorized disposable work branch is under review, the same verifier may run on that branch by naming the expected branch.

## Canonical mobile workspace

CE-W04-A13.1 standardizes the phone checkout at:

```text
$HOME/Arcanum
```

The older `$HOME/work/Arcanum` location is treated as a legacy checkout. The A13.1 native
workspace probe reports it when present so duplicate/stale workspace state is visible to
the Human Architect.

## A13.1 native operator setup

A13.1 adds one Human-confirmed read-only Android → Termux operation: `probe_workspace`.
One-time setup still requires Termux's own external-app policy and Android permission:

```bash
cd "$HOME/Arcanum"
bash scripts/mobile/arcanum-operator-setup.sh
```

The setup script writes only `allow-external-apps=true` in
`$HOME/.termux/termux.properties` and reloads Termux settings when supported. It cannot
grant Android permission to itself.

Then grant **ARCnet Native Host → Additional permissions → Run commands in Termux
environment** in Android Settings.

After those one-time gates, the A13.1 workspace probe is launched from the native
Architect surface; no shell command is copied for routine probing.

## A13.2 zero-copy native pairing

A13.2 adds `pair_native_client` through the same fixed Android → Termux operator path.
The Human taps **Pair native client** (or **Replace native pairing**) and confirms the
native dialog. Termux creates or reuses
`$HOME/.config/arcanum/architect-broker.secret`, returns the credential only through the
app-private one-shot result channel, and Android stores it with the inherited
AndroidKeyStore-backed pairing store.

No 64-character secret is copied or displayed. Pairing does not start the broker and does
not mutate the repository. Broker start/stop remains outside A13.2.

## A13.3 Human-triggered broker lifecycle

A13.3 adds `start_broker` and `stop_broker` to the same fixed native operator path.
Each operation requires its own explicit native Human confirmation. App launch, pairing,
workspace probing, and broker probing do not start or stop the broker automatically.

Start validates the canonical workspace, the private `0600` pairing secret, the fixed
repo-owned broker script, Termux `TMPDIR`, loopback host `127.0.0.1`, and port `8765`.
The broker is launched with an internally constructed argv list and `shell=False`, then
A13.3 waits for a matching authenticated-service `/health` response before reporting
success.

Lifecycle ownership metadata is stored privately at
`$HOME/.config/arcanum/architect-broker.lifecycle.json`; broker output is written to
`$HOME/.config/arcanum/architect-broker.log`. Both are mode `0600`.

Stop may signal only the PID whose `/proc` start ticks and exact broker argv match the
recorded lifecycle state. An unknown listener on port `8765` fails closed and is never
signaled. Starting the broker does not approve any A11 broker action; every registered
action still requires its own authenticated native Human approval.

No shell command is copied for routine broker start or stop, and neither operation mutates
the repository.

## A13.4 native workspace verification

A13.4 adds `verify_workspace` to the fixed native operator registry. After explicit Human
confirmation, Termux requires a clean canonical `$HOME/Arcanum` checkout and runs only
the repository-owned `scripts/verify-sync.sh`. No broker session or pairing is required.

Combined verifier output is written to
`$HOME/.config/arcanum/architect-workspace-verification.log`, outside the repository, with
mode `0600`. Android receives only a compact structured result containing branch, HEAD,
check count, exit code, duration, clean-before/clean-after facts, and the SHA-256 of that
private log.

After verification, the helper rechecks origin, branch, HEAD, and worktree cleanliness.
Any state drift fails closed as `repository_state_changed`. A successful result therefore
binds `15/15` canonical checks to the same clean branch/HEAD observed before execution,
with `authorityEffect=none` and `repositoryMutation=false`.

No shell command is copied for routine workspace verification, and A13.4 does not start
the broker, approve a broker action, apply a proposal, stage, commit, push, merge, or
deploy.

## Bootstrap

```bash
pkg update -y
pkg install -y git curl

mkdir -p "$HOME/bootstrap"
curl -fsSL \
  https://raw.githubusercontent.com/The-Architect-369/Arcanum/main/scripts/mobile/termux-bootstrap.sh \
  -o "$HOME/bootstrap/termux-bootstrap.sh"

bash "$HOME/bootstrap/termux-bootstrap.sh"
```

The bootstrap installs the command-line toolchain, enables Corepack/pnpm, writes `$HOME/.config/arcanum/repo.env`, and configures safe Git defaults.

## Clone the canonical repository

```bash
source "$HOME/.config/arcanum/repo.env"
mkdir -p "$ARCANUM_WORKSPACE_ROOT"
cd "$ARCANUM_WORKSPACE_ROOT"

git clone --branch main "$ARCANUM_REPOSITORY" Arcanum
cd "$ARCANUM_REPO_DIR"
```

For authenticated operations, configure GitHub authentication without writing tokens into repository files or shell history.

## Run verification

On canonical `main`:

```bash
cd "$ARCANUM_REPO_DIR"
git pull --ff-only origin main
ARCANUM_EXPECTED_BRANCH=main bash scripts/mobile/termux-verify.sh
```

On an explicitly authorized temporary branch:

```bash
ARCANUM_EXPECTED_BRANCH="$(git branch --show-current)" \
  bash scripts/mobile/termux-verify.sh
```

The verifier checks the local toolchain, repository/branch identity, clean/modified worktree state, Node compatibility, lockfile, frozen dependency installation, CE-W01 regression verification, deterministic repo-index validation, web typecheck/build, and `scripts/verify-sync.sh` when available.

Reports are local-only under:

```text
.architect-reports/termux/
```

Evidence should be summarized into the applicable issue/PR/session record rather than committed wholesale.

## Reduced modes

```bash
ARCANUM_SKIP_INSTALL=1 bash scripts/mobile/termux-verify.sh
ARCANUM_SKIP_BUILD=1 bash scripts/mobile/termux-verify.sh
```

A skipped check is a warning, not a pass.

## Safety

Do not reset, clean, rebase, merge, force-update refs, or publish from the phone unless that exact operation is intentional and separately authorized.

Termux evidence is verification evidence only. GitHub commit/ref state remains authoritative for repository identity.
