#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from datetime import date
from pathlib import Path

TODAY = date.today().isoformat()

FRONTMATTER_RE = re.compile(r"\A---\n(.*?)\n---\n", re.DOTALL)
H1_RE = re.compile(r"^\s*#\s+(.+?)\s*$", re.MULTILINE)

REQUIRED_KEYS = ["title", "status", "visibility", "last_updated", "description"]

def kebab_to_title(name: str) -> str:
    parts = re.split(r"[-_ ]+", name.strip())
    return " ".join(p.capitalize() for p in parts if p)

def guess_title(path: Path) -> str:
    return kebab_to_title(path.stem)

def default_visibility(rel: str) -> str:
    # Keep curriculum internal by default
    if rel.startswith("docs/vitae/curriculum/"):
        return "internal"
    return "public"

def default_status(rel: str) -> str:
    # Conservative defaults: constitution/specs/architecture are canonical-ish; others draft.
    if rel.startswith("docs/governance/constitution/"):
        return "canonical"
    if rel.startswith("docs/specs/"):
        return "draft"
    if rel.startswith("docs/architecture/"):
        return "canonical"
    return "draft"

def parse_frontmatter(text: str) -> dict[str, str] | None:
    m = FRONTMATTER_RE.search(text)
    if not m:
        return None
    fm = m.group(1)
    out: dict[str, str] = {}
    for line in fm.splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out

def render_frontmatter(meta: dict[str, str]) -> str:
    # Keep a consistent ordering, preserve any extra keys at the bottom.
    ordered = []
    for k in REQUIRED_KEYS:
        ordered.append(f'{k}: "{meta[k]}"' if k in ("title", "description") else f"{k}: {meta[k]}")
    extras = [k for k in meta.keys() if k not in REQUIRED_KEYS]
    for k in sorted(extras):
        v = meta[k]
        ordered.append(f'{k}: "{v}"' if re.search(r"\s", v) else f"{k}: {v}")
    return "---\n" + "\n".join(ordered) + "\n---\n"

def ensure_h1(body: str, title: str) -> str:
    m = H1_RE.search(body)
    if m:
        current = m.group(1).strip()
        if current != title:
            body = H1_RE.sub(f"# {title}", body, count=1)
        return body
    return f"# {title}\n\n" + body.lstrip()

def normalize_file(path: Path, apply: bool) -> bool:
    text = path.read_text(encoding="utf-8")
    rel = str(path).replace("\\", "/")

    fm_match = FRONTMATTER_RE.search(text)
    meta = parse_frontmatter(text) if fm_match else None

    if meta is None:
        # Insert brand new front matter
        title = guess_title(path)
        meta = {
            "title": title,
            "status": default_status(rel),
            "visibility": default_visibility(rel),
            "last_updated": TODAY,
            "description": "",
        }
        body = text.lstrip()
        new_text = render_frontmatter(meta) + "\n" + ensure_h1(body, title)
    else:
        # Update existing front matter, but do not delete keys.
        title = meta.get("title") or guess_title(path)
        meta["title"] = title
        meta.setdefault("status", default_status(rel))
        meta.setdefault("visibility", default_visibility(rel))
        meta.setdefault("last_updated", TODAY)
        meta.setdefault("description", "")

        # Rebuild the front matter block
        body_start = fm_match.end()
        body = text[body_start:]
        new_text = render_frontmatter(meta) + "\n" + ensure_h1(body, title)

    if new_text != text:
        if apply:
            path.write_text(new_text, encoding="utf-8")
        return True
    return False

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--docs-root", default="docs")
    ap.add_argument("--apply", action="store_true", help="Write changes (default is dry-run)")
    args = ap.parse_args()

    docs_root = Path(args.docs_root)
    if not docs_root.exists():
        raise SystemExit(f"Docs root not found: {docs_root}")

    changed = 0
    for md in docs_root.rglob("*.md"):
        # Skip generated index artifacts if you want; keep for now.
        if normalize_file(md, args.apply):
            changed += 1
            print(("UPDATED " if args.apply else "WOULD UPDATE ") + str(md))

    print(f"\n{changed} file(s) {'updated' if args.apply else 'would be updated'}.")

if __name__ == "__main__":
    main()
