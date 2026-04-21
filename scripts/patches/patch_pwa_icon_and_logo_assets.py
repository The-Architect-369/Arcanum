#!/usr/bin/env python3

from pathlib import Path
import base64
import shutil
import subprocess
import sys
import tempfile
import textwrap

ROOT = Path.cwd()
PUBLIC = ROOT / "apps/web/public"
ICONS = PUBLIC / "icons"

LOGO_SVG = PUBLIC / "logo-arcanum.svg"
ICON_192 = ICONS / "icon-192.png"
ICON_512 = ICONS / "icon-512.png"
MASKABLE_192 = ICONS / "maskable-192.png"
MASKABLE_512 = ICONS / "maskable-512.png"

SVG_TEMPLATE = """\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="title desc">
  <title>Arcanum</title>
  <desc>Arcanum emblem on a cosmic field</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#090B14"/>
      <stop offset="100%" stop-color="#151A2E"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#D7CCFF"/>
      <stop offset="55%" stop-color="#8E6BFF"/>
      <stop offset="100%" stop-color="#62E5FF"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="512" height="512" rx="112" fill="url(#bg)"/>

  <g opacity="0.95">
    <circle cx="90" cy="96" r="3.2" fill="#ffffff"/>
    <circle cx="412" cy="110" r="3.2" fill="#ffffff"/>
    <circle cx="434" cy="388" r="2.8" fill="#ffffff"/>
    <circle cx="106" cy="396" r="2.8" fill="#ffffff"/>
    <circle cx="256" cy="72" r="2.6" fill="#ffffff"/>
    <circle cx="256" cy="440" r="2.6" fill="#ffffff"/>
  </g>

  <g filter="url(#glow)">
    <circle cx="256" cy="256" r="138" fill="none" stroke="url(#accent)" stroke-width="10" opacity="0.92"/>
    <path d="M256 126 L338 352 H301 L283 299 H229 L211 352 H174 Z"
          fill="none" stroke="url(#accent)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M241 264 H271"
          fill="none" stroke="url(#accent)" stroke-width="16" stroke-linecap="round"/>
  </g>
</svg>
"""

def backup(path: Path) -> Path | None:
    if not path.exists():
        return None
    backup_path = path.with_suffix(path.suffix + ".pre-pwa-icons-logo.bak")
    shutil.copy2(path, backup_path)
    return backup_path

def write_logo_svg():
    LOGO_SVG.parent.mkdir(parents=True, exist_ok=True)
    svg_backup = backup(LOGO_SVG)
    LOGO_SVG.write_text(textwrap.dedent(SVG_TEMPLATE), encoding="utf-8")
    return svg_backup

def require_pillow():
    try:
        from PIL import Image, ImageDraw, ImageFilter
        return Image, ImageDraw, ImageFilter
    except Exception:
        print(
            "error: Pillow is required for PNG icon generation.\n"
            "Install it with one of:\n"
            "  sudo apt install python3-pil\n"
            "or\n"
            "  python3 -m pip install Pillow",
            file=sys.stderr,
        )
        raise SystemExit(1)

def draw_icon(size: int, maskable: bool):
    Image, ImageDraw, ImageFilter = require_pillow()

    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Cosmic dark background
    bg0 = (9, 11, 20, 255)
    bg1 = (21, 26, 46, 255)
    for y in range(size):
        t = y / max(size - 1, 1)
        color = tuple(int(bg0[i] * (1 - t) + bg1[i] * t) for i in range(4))
        draw.line((0, y, size, y), fill=color)

    # Rounded tile field
    radius = int(size * 0.22)
    inset = int(size * (0.08 if maskable else 0.02))
    draw.rounded_rectangle(
        (inset, inset, size - inset, size - inset),
        radius=max(radius - inset // 2, 12),
        fill=(13, 16, 30, 235),
        outline=(160, 140, 255, 38),
        width=max(2, size // 128),
    )

    # Accent ring
    ring_pad = int(size * (0.23 if maskable else 0.18))
    ring_bbox = (ring_pad, ring_pad, size - ring_pad, size - ring_pad)

    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse(
        ring_bbox,
        outline=(123, 231, 255, 180),
        width=max(8, size // 32),
    )
    glow = glow.filter(ImageFilter.GaussianBlur(max(4, size // 64)))
    img.alpha_composite(glow)

    draw.ellipse(
        ring_bbox,
        outline=(143, 107, 255, 235),
        width=max(8, size // 32),
    )

    # Stylized A
    line = max(10, size // 28)
    top = int(size * 0.27)
    left = int(size * 0.35)
    right = int(size * 0.65)
    bottom = int(size * 0.70)
    cross_y = int(size * 0.52)

    draw.line((left, bottom, size // 2, top), fill=(216, 204, 255, 255), width=line, joint="curve")
    draw.line((size // 2, top, right, bottom), fill=(98, 229, 255, 255), width=line, joint="curve")
    draw.line((int(size * 0.42), cross_y, int(size * 0.58), cross_y), fill=(198, 187, 255, 255), width=max(8, line - 2))

    # Stars
    star_r = max(2, size // 96)
    stars = [
        (int(size * 0.20), int(size * 0.22)),
        (int(size * 0.80), int(size * 0.24)),
        (int(size * 0.74), int(size * 0.76)),
        (int(size * 0.26), int(size * 0.78)),
        (int(size * 0.50), int(size * 0.16)),
    ]
    for x, y in stars:
        draw.ellipse((x - star_r, y - star_r, x + star_r, y + star_r), fill=(255, 255, 255, 230))

    return img

def write_png(path: Path, size: int, maskable: bool):
    path.parent.mkdir(parents=True, exist_ok=True)
    path_backup = backup(path)
    img = draw_icon(size=size, maskable=maskable)
    img.save(path, format="PNG")
    return path_backup

def main() -> int:
    backups = []

    svg_backup = write_logo_svg()
    if svg_backup:
        backups.append(svg_backup)

    for path, size, maskable in [
        (ICON_192, 192, False),
        (ICON_512, 512, False),
        (MASKABLE_192, 192, True),
        (MASKABLE_512, 512, True),
    ]:
        bak = write_png(path, size, maskable)
        if bak:
            backups.append(bak)

    print(f"wrote:   {LOGO_SVG}")
    print(f"wrote:   {ICON_192}")
    print(f"wrote:   {ICON_512}")
    print(f"wrote:   {MASKABLE_192}")
    print(f"wrote:   {MASKABLE_512}")
    if backups:
        print()
        print("backups:")
        for bak in backups:
            print(f"  {bak}")

    print()
    print("next:")
    print("  pnpm -C apps/web typecheck")
    print("  pnpm -C apps/web build")
    print("  bash scripts/repo-index.sh")
    print("  bash scripts/verify-sync.sh")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
