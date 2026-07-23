#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

log() { printf '\n[arcanum-termux] %s\n' "$*"; }
fail() { printf '\n[arcanum-termux] ERROR: %s\n' "$*" >&2; exit 1; }

command -v pkg >/dev/null 2>&1 || fail "Run this script inside Termux."

log "Updating Termux packages"
pkg update -y
pkg upgrade -y

log "Installing the mobile development toolchain"
pkg install -y \
  bash \
  coreutils \
  curl \
  git \
  jq \
  make \
  openssh \
  python \
  ripgrep \
  rsync \
  tar \
  unzip \
  vim \
  wget \
  zip

log "Installing Node.js LTS"
pkg install -y nodejs-lts

log "Enabling Corepack and pnpm"
corepack enable
corepack prepare pnpm@latest --activate

WORKSPACE_ROOT="${ARCANUM_WORKSPACE_ROOT:-$HOME/work}"
REPO_DIR="${ARCANUM_REPO_DIR:-$WORKSPACE_ROOT/Arcanum}"
mkdir -p "$WORKSPACE_ROOT" "$HOME/.config/arcanum"

cat > "$HOME/.config/arcanum/mobile.env" <<EOF
export ARCANUM_REPOSITORY="https://github.com/The-Architect-369/Arcanum.git"
export ARCANUM_STABLE_BRANCH="main"
export ARCANUM_INTEGRATION_BRANCH="mobile"
export ARCANUM_WORKSPACE_ROOT="$WORKSPACE_ROOT"
export ARCANUM_REPO_DIR="$REPO_DIR"
EOF

SHELL_RC="$HOME/.bashrc"
touch "$SHELL_RC"
if ! grep -Fq '.config/arcanum/mobile.env' "$SHELL_RC"; then
  cat >> "$SHELL_RC" <<'EOF'

# Arcanum mobile work-profile environment
[ -f "$HOME/.config/arcanum/mobile.env" ] && . "$HOME/.config/arcanum/mobile.env"
EOF
fi

log "Configuring Git safety and reusable defaults"
git config --global init.defaultBranch main
git config --global pull.ff only
git config --global fetch.prune true
git config --global core.autocrlf input

log "Toolchain versions"
printf 'git: '; git --version
printf 'node: '; node --version
printf 'npm: '; npm --version
printf 'pnpm: '; pnpm --version
printf 'python: '; python --version

cat <<EOF

Bootstrap complete.

Next:
  source "$HOME/.config/arcanum/mobile.env"
  mkdir -p "$WORKSPACE_ROOT"
  cd "$WORKSPACE_ROOT"
  git clone --branch mobile --single-branch \
    https://github.com/The-Architect-369/Arcanum.git Arcanum
  cd "$REPO_DIR"
  bash scripts/mobile/termux-verify.sh

For a private repository, configure GitHub authentication before cloning.
Do not paste tokens into shell history or repository files.
EOF
