#!/usr/bin/env bash
set -euo pipefail
APP_DIR="apps/web"
PROJECT_NAME="arcanum-web"
DOMAIN="app.arcanum.io"
APP_URL="https://app.arcanum.io"
SITE_URL="https://arcanum.io"

pushd "$APP_DIR" >/dev/null

vercel link --project "$PROJECT_NAME" --yes

# env needed by web app
echo "$APP_URL"  | vercel env add NEXT_PUBLIC_APP_URL production --yes || true
echo "$SITE_URL" | vercel env add NEXT_PUBLIC_SITE_URL production --yes || true

vercel domains add "$DOMAIN" --yes || true

vercel deploy --prod --yes

popd >/dev/null
echo "✅ App deployed to $DOMAIN"
