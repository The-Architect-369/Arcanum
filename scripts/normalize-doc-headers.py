#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path

TODAY = date.today().isoformat()
FM_START = "---"
FM_END = {"---", "..."}

KEY_RE = re.compile(r"^([A-Za-z0-9_-]+):\s*(.*)$")
H1_RE = re.compile(r"^#\s+(.+?)\s*$")


@dataclass
class DocMetaDefaults:
    status: str
    visibility: str


def classify(path: Path) -> DocMetaDefaults:
    p = str(path.as_posix())
    if "/docs/governance/constitution/" in p:
        return DocMetaDefaults(status="canonical", visibility="public")
    if "/docs/whitepaper/" in p:
        return DocMetaDefaults(status="draft", visibility="public")
    if "/docs/vitae/" in p:
        return DocMetaDefaults(status="draft", visibility="private")
    if "/docs/specs/" in p:
        return DocMetaDefaults(status="draft", visibility="public")
    if "/docs/reference/" in p:
        return DocMetaDefaults(status="reference", visibility="public")
    return DocMetaDefaults(status="draft", visibility="public")


def split_frontmatter(lines: list[str]) -> tuple[list[str] | None, list[str]]:
    if not lines or lines[0].strip() != FM_START:
        return None, lines
    for i in range(1, len(lines)):
        if lines[i].strip() in FM_END:
            return lines[: i + 1], lines[i + 1 :]
    return None, lines


def frontmatter_keys(fm: list[str]) -> dict[str, str]:
    out: dict[str, str] = {}
    for line in fm[1:-1]:
        if line.startswith(" ") or line.startswith("\t") or line.startswith("-"):
            continue
        m = KEY_RE.match(line)
        if m:
            out[m.group(1)] = m.group(2)
    return out


def derive_title(path: Path, fm_keys: dict[str, str], body: list[str]) -> str:
    t = fm_keys.get("title")
    if t:
        return t.strip().strip('"').strip("'")

    f = fm_keys.get("file")
    if f:
        base = Path(f.strip().strip('"').strip("'")).name
        base = base.rsplit(".", 1)[0]
        base = base.replace("_", " ").replace("-", " ").strip()
        return base

    for line in body[:40]:
        m = H1_RE.match(line)
        if m:
            return m.group(1).strip()

    return path.stem.replace("-", " ").replace("_", " ").title()


def insert_missing_frontmatter_keys(fm: list[str], inserts: dict[str, str]) -> list[str]:
    closing = fm[-1]
    content = fm[:-1]
    for k, v in inserts.items():
        vv = v
        if ":" in vv or vv != vv.strip():
            vv = f"\"{vv.strip().replace('\"', '\\\"')}\""
        content.append(f"{k}: {vv}")
    content.append(closing)
    return content


def ensure_h1(body: list[str], title: str) -> list[str]:
    i = 0
    while i < len(body) and body[i].strip() == "":
        i += 1
    if i < len(body) and body[i].lstrip().startswith("# "):
        return body
    return body[:i] + [f"# {title}", ""] + body[i:]


def normalize_file(path: Path, apply: bool) -> bool:
    raw = path.read_text(encoding="utf-8", errors="replace")
    raw_norm = raw if raw.endswith("\n") else raw + "\n"

    lines = raw_norm.splitlines()
    fm, body = split_frontmatter(lines)
    defaults = classify(path)

    if fm is None:
        title = derive_title(path, {}, body)
        out_lines = [
            FM_START,
            f"title: \"{title}\"",
            f"status: {defaults.status}",
            f"visibility: {defaults.visibility}",
            f"last_updated: {TODAY}",
            FM_START,
            "",
        ] + ensure_h1(body, title)
    else:
        keys = frontmatter_keys(fm)
        title = derive_title(path, keys, body)

        inserts: dict[str, str] = {}
        if "title" not in keys:
            inserts["title"] = title
        if "status" not in keys:
            inserts["status"] = defaults.status
        if "visibility" not in keys:
            inserts["visibility"] = defaults.visibility
        if "last_updated" not in keys:
            inserts["last_updated"] = TODAY

        new_fm = fm if not inserts else insert_missing_frontmatter_keys(fm, inserts)
        out_lines = new_fm + ensure_h1(body, title)

    out = "\n".join(out_lines).rstrip() + "\n"
    if out == raw_norm:
        return False

    if apply:
        path.write_text(out, encoding="utf-8")
    return True


def iter_docs(root: Path) -> list[Path]:
    out: list[Path] = []
    for p in root.rglob("*.md"):
        if any(part in {".git", "node_modules", "dist", "build"} for part in p.parts):
            continue
        out.append(p)
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--docs-root", default="docs", help="Docs root directory")
    ap.add_argument("--apply", action="store_true", help="Write changes")
    args = ap.parse_args()

    root = Path(args.docs_root).resolve()
    changed = 0
    for md in iter_docs(root):
        if normalize_file(md, args.apply):
            changed += 1

    if args.apply:
        print(f"✅ Normalized {changed} file(s).")
    else:
        print(f"Plan: would normalize {changed} file(s). Run again with --apply to write.")


if __name__ == "__main__":
    main()
