#!/usr/bin/env python3

from pathlib import Path
import shutil
import sys
import textwrap

TARGET = Path("apps/web/src/app/(marketing)/layout.tsx")

NEW_CONTENT = textwrap.dedent("""\
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

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
""")

def main() -> int:
    if not TARGET.exists():
        print(f"error: target file not found: {TARGET}", file=sys.stderr)
        return 1

    original = TARGET.read_text(encoding="utf-8")

    if "ClientLayout" not in original:
        print(
            f"error: expected ClientLayout reference not found in {TARGET}; refusing to patch",
            file=sys.stderr,
        )
        return 1

    backup = TARGET.with_suffix(TARGET.suffix + ".pre-remove-nested-html.bak")
    shutil.copy2(TARGET, backup)
    TARGET.write_text(NEW_CONTENT, encoding="utf-8")

    print(f"patched: {TARGET}")
    print(f"backup:  {backup}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
