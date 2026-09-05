# Termux Repository Verification

Status: active portable verification workflow  
Canonical branch: `main`  
Environment: Android Termux inside the isolated work profile

## Purpose

Termux is a portable local verification surface for Arcanum. It is not a branch authority and does not define a permanent integration branch.

The normal checkout begins from `main`. When an explicitly authorized disposable work branch is under review, the same verifier may run on that branch by naming the expected branch.

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
