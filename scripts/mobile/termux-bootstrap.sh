#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

log() { printf '\n[arcanum-termux] %s\n' "$*"; }
fail() { printf '\n[arcanum-termux] ERROR: %s\n' "$*" >&2; exit 1; }

command -v pkg >/dev/null 2>&1 || fail "Run this script inside Termux."

log "Updating Termux packages"
pkg update -y
pkg upgrade -y

log "Installing repository verification toolchain"
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

log "Enabling Corepack and repository-pinned pnpm"
corepack enable
corepack prepare pnpm@9.10.0 --activate

WORKSPACE_ROOT="${ARCANUM_WORKSPACE_ROOT:-$HOME/work}"
REPO_DIR="${ARCANUM_REPO_DIR:-$WORKSPACE_ROOT/Arcanum}"
ENV_FILE="$HOME/.config/arcanum/repo.env"
mkdir -p "$WORKSPACE_ROOT" "$HOME/.config/arcanum"

cat > "$ENV_FILE" <<EOF
export ARCANUM_REPOSITORY="https://github.com/The-Architect-369/Arcanum.git"
export ARCANUM_CANONICAL_BRANCH="main"
export ARCANUM_WORKSPACE_ROOT="$WORKSPACE_ROOT"
export ARCANUM_REPO_DIR="$REPO_DIR"
unset ARCANUM_INTEGRATION_BRANCH 2>/dev/null || true
EOF

SHELL_RC="$HOME/.bashrc"
touch "$SHELL_RC"
# Stop automatically sourcing the retired branch-era environment if it was
# installed by an older bootstrap. The old file itself is left untouched.
sed -i '\|\.config/arcanum/mobile\.env|d' "$SHELL_RC" 2>/dev/null || true
if ! grep -Fq '.config/arcanum/repo.env' "$SHELL_RC"; then
  cat >> "$SHELL_RC" <<'EOF'

# Arcanum repository environment
[ -f "$HOME/.config/arcanum/repo.env" ] && . "$HOME/.config/arcanum/repo.env"
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
  source "$ENV_FILE"
  mkdir -p "$WORKSPACE_ROOT"
  cd "$WORKSPACE_ROOT"
  git clone --branch main \
    https://github.com/The-Architect-369/Arcanum.git Arcanum
  cd "$REPO_DIR"
  ARCANUM_EXPECTED_BRANCH=main bash scripts/mobile/termux-verify.sh

For authenticated operations, configure GitHub authentication separately.
Do not paste tokens into shell history or repository files.
EOF
