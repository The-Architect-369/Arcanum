#!/usr/bin/env python3

from pathlib import Path
import shutil
import sys
import textwrap

ROOT_LAYOUT = Path("apps/web/src/app/layout.tsx")
PWA_REGISTER = Path("apps/web/src/components/PWARegister.tsx")
SW_FILE = Path("apps/web/public/sw.js")

ROOT_LAYOUT_CONTENT = textwrap.dedent("""\
import type { Metadata } from "next";
import "./globals.css";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "Arcanum",
  description: "Decentralized identity. Cosmic timing. Community-owned network.",
  applicationName: "Arcanum",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Arcanum",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
""")

PWA_REGISTER_CONTENT = textwrap.dedent("""\
"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (!window.isSecureContext && window.location.hostname !== "localhost") return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((error) => console.warn("[pwa] service worker registration failed", error));
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
""")

SW_CONTENT = textwrap.dedent("""\
const CACHE_NAME = "arcanum-shell-v1";
const APP_SHELL = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/logo-arcanum.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-192.png",
  "/icons/maskable-512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url)))
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match("/");
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === "opaque") {
          return response;
        }

        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
""")

def backup(path: Path):
    if not path.exists():
        return None
    backup_path = path.with_suffix(path.suffix + ".pre-min-sw.bak")
    shutil.copy2(path, backup_path)
    return backup_path

def write_text(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    bak = backup(path)
    path.write_text(content, encoding="utf-8")
    return bak

def main() -> int:
    missing = [p for p in [ROOT_LAYOUT] if not p.exists()]
    if missing:
        for path in missing:
            print(f"error: missing required file: {path}", file=sys.stderr)
        return 1

    root_backup = write_text(ROOT_LAYOUT, ROOT_LAYOUT_CONTENT)
    register_backup = write_text(PWA_REGISTER, PWA_REGISTER_CONTENT)
    sw_backup = write_text(SW_FILE, SW_CONTENT)

    print(f"patched: {ROOT_LAYOUT}")
    if root_backup:
      print(f"backup:  {root_backup}")

    print(f"patched: {PWA_REGISTER}")
    if register_backup:
      print(f"backup:  {register_backup}")

    print(f"patched: {SW_FILE}")
    if sw_backup:
      print(f"backup:  {sw_backup}")

    print()
    print("next:")
    print("  pnpm -C apps/web typecheck")
    print("  pnpm -C apps/web build")
    print("  bash scripts/repo-index.sh")
    print("  bash scripts/verify-sync.sh")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
