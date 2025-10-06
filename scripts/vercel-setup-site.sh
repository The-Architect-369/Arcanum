#!/usr/bin/env bash
set -euo pipefail
APP_DIR="apps/site"
PROJECT_NAME="arcanum-site"
DOMAIN="arcanum.io"
BASE_URL="https://arcanum.io"

pushd "$APP_DIR" >/dev/null

# link/create Vercel project for this subapp
vercel link --project "$PROJECT_NAME" --yes

# ensure prod base URL for SEO (robots/sitemap/OG)
echo "$BASE_URL" | vercel env add NEXT_PUBLIC_SITE_URL production --yes || true

# attach domains (safe if already added)
vercel domains add "$DOMAIN" --yes || true
vercel domains add "www.$DOMAIN" --yes || true

# production deploy
vercel deploy --prod --yes

popd >/dev/null
echo "✅ Site deployed to $DOMAIN"
