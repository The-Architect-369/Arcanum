diff --git a/vercel.json b/vercel.json
deleted file mode 100644
index 4809641..0000000
--- a/vercel.json
+++ /dev/null
@@ -1,7 +0,0 @@
-{
-  "projects": [
-    {
-      "name": "arcanum-web",
-      "rootDirectory": "apps/web"
-    }
-  ]
-}
diff --git a/scripts/vercel-setup-web.sh b/scripts/vercel-setup-web.sh
new file mode 100755
index 0000000..1111111
--- /dev/null
+++ b/scripts/vercel-setup-web.sh
@@ -0,0 +1,31 @@
+#!/usr/bin/env bash
+set -euo pipefail
+
+echo "== vercel-setup-web =="
+echo "Repo: arcanum"
+
+if ! command -v vercel >/dev/null 2>&1; then
+  echo "❌ Vercel CLI not found. Install with: pnpm add -g vercel"
+  exit 1
+fi
+
+if ! command -v pnpm >/dev/null 2>&1; then
+  echo "❌ pnpm not found."
+  exit 1
+fi
+
+corepack enable >/dev/null 2>&1 || true
+corepack prepare pnpm@9.10.0 --activate >/dev/null 2>&1 || true
+
+echo "[1/3] Install dependencies"
+pnpm install --frozen-lockfile
+
+echo "[2/3] Verify web build locally"
+pnpm -C apps/web typecheck
+pnpm -C apps/web build
+
+echo "[3/3] Link Vercel project to apps/web"
+cd apps/web
+vercel link
+
+echo "✅ Local Vercel setup complete"
+echo "Set project root in Vercel dashboard to: apps/web"