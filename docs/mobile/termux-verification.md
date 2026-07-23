# Mobile Termux Verification

Status: active integration workflow  
Branch: `mobile`  
Environment: Android Termux inside the isolated Shelter work profile

## Purpose

This environment is the mobile verification surface for Arcanum integration work. It is used to pull the GitHub `mobile` branch, execute repository scripts, run the web typecheck/build surfaces, and produce local evidence before any merge toward `main`.

The work profile is isolated from the personal phone profile. Google Workspace may be connected inside the work profile, but Workspace content remains working context and is not canonical unless ratified into the repository.

## Install Termux

Install Termux from a maintained distribution source supported by the device. Do not mix packages or add-ons from incompatible Termux distributions.

Open Termux inside the Shelter work profile, then run:

```bash
pkg update -y
pkg install -y git curl

mkdir -p "$HOME/bootstrap"
curl -fsSL \
  https://raw.githubusercontent.com/The-Architect-369/Arcanum/mobile/scripts/mobile/termux-bootstrap.sh \
  -o "$HOME/bootstrap/termux-bootstrap.sh"

bash "$HOME/bootstrap/termux-bootstrap.sh"
```

The bootstrap installs the command-line toolchain, enables Corepack/pnpm, creates the Arcanum workspace environment file, and configures safe Git defaults.

## Clone the integration branch

```bash
source "$HOME/.config/arcanum/mobile.env"
mkdir -p "$ARCANUM_WORKSPACE_ROOT"
cd "$ARCANUM_WORKSPACE_ROOT"

git clone --branch mobile --single-branch \
  "$ARCANUM_REPOSITORY" Arcanum

cd "$ARCANUM_REPO_DIR"
```

For authenticated operations, configure GitHub authentication without writing tokens into repository files or shell history.

## Run the verification batch

```bash
cd "$ARCANUM_REPO_DIR"
git pull --ff-only origin mobile
bash scripts/mobile/termux-verify.sh
```

The verifier checks:

- required commands;
- repository and current branch;
- clean/modified working-tree state;
- Node engine compatibility;
- pnpm lockfile presence;
- frozen dependency installation;
- `pnpm -C apps/web typecheck`;
- `pnpm -C apps/web build`;
- `scripts/verify-sync.sh` when available.

Reports are written locally under:

```text
.architect-reports/mobile/
```

That directory is ignored by Git. Evidence should be summarized into a PR, issue, or session record rather than committed wholesale.

## Reduced verification modes

Skip dependency installation when it has already completed successfully:

```bash
ARCANUM_SKIP_INSTALL=1 bash scripts/mobile/termux-verify.sh
```

Skip the resource-intensive production build while checking the basic environment:

```bash
ARCANUM_SKIP_BUILD=1 bash scripts/mobile/termux-verify.sh
```

A skipped check is recorded as a warning, not a pass. Merge evidence still requires the full expected verification surface.

## Update cycle

```bash
cd "$ARCANUM_REPO_DIR"
git status --short
git pull --ff-only origin mobile
bash scripts/mobile/termux-verify.sh
```

Do not reset, clean, rebase, merge, or force-update the branch from the phone unless the exact action is intentional and reviewed.

## Initial verified surfaces

Earlier mobile verification established:

- `pnpm install --ignore-scripts`;
- `pnpm -C apps/web typecheck`;
- `pnpm -C apps/web build`;
- Nexus module navigation using the shared labeled module tab rail.

The executable verifier now supersedes this prose-only checklist for future sessions.
