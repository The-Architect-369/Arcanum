#!/usr/bin/env python3

from pathlib import Path
import json
import shutil
import sys
import textwrap

LAYOUT = Path("apps/web/src/app/(marketing)/layout.tsx")
MANIFEST = Path("apps/web/public/manifest.json")

LAYOUT_CONTENT = textwrap.dedent("""\
import "../globals.css";
import "./styles/motion.css";
import "./styles/utilities.css";
import ClientLayout from "./client-layout";
import type { Metadata } from "next";

const title = "Arcanum";
const description =
  "Decentralized identity. Cosmic timing. Community-owned network.";
const ogImage = "/favicon.ico";

export const metadata: Metadata = {
  metadataBase: new URL("https://thearcanum.net"),
  title: { default: title, template: `%s • ${title}` },
  description,
  applicationName: "Arcanum",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: title,
    images: [{ url: ogImage, alt: "Arcanum" }],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: [ogImage],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased text-white bg-black">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
""")

DESIRED_ICONS = [
    {"src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
    {
        "src": "/icons/maskable-192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "maskable",
    },
    {
        "src": "/icons/maskable-512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "maskable",
    },
]

def backup(path: Path) -> Path:
    backup_path = path.with_suffix(path.suffix + ".pre-pwa-metadata-manifest.bak")
    shutil.copy2(path, backup_path)
    return backup_path

def patch_layout() -> Path:
    if not LAYOUT.exists():
        raise FileNotFoundError(f"missing layout file: {LAYOUT}")

    original = LAYOUT.read_text(encoding="utf-8")
    if "manifest:" not in original or "metadata" not in original:
        raise RuntimeError(
            f"{LAYOUT} does not look like the expected marketing metadata file"
        )

    backup_path = backup(LAYOUT)
    LAYOUT.write_text(LAYOUT_CONTENT, encoding="utf-8")
    return backup_path

def patch_manifest() -> Path:
    if not MANIFEST.exists():
        raise FileNotFoundError(f"missing manifest file: {MANIFEST}")

    with MANIFEST.open("r", encoding="utf-8") as f:
        data = json.load(f)

    backup_path = backup(MANIFEST)

    data["name"] = "Arcanum"
    data["short_name"] = "Arcanum"
    data["description"] = "Arcanum — mobile-first portal for Hope, Tempus, Nexus, and ARCnet."
    data["id"] = "/"
    data["start_url"] = "/"
    data["scope"] = "/"
    data["display"] = "standalone"
    data["background_color"] = data.get("background_color", "#0B0E1A")
    data["theme_color"] = data.get("theme_color", "#6B4CFF")
    data["icons"] = DESIRED_ICONS

    with MANIFEST.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

    return backup_path

def main() -> int:
    try:
        layout_backup = patch_layout()
        manifest_backup = patch_manifest()
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    print(f"patched: {LAYOUT}")
    print(f"backup:  {layout_backup}")
    print(f"patched: {MANIFEST}")
    print(f"backup:  {manifest_backup}")
    print()
    print("note: this script aligns metadata + manifest paths only.")
    print("note: run the icon asset replacement patch next to replace empty install PNGs.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
