#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple


ROMAN = {
    "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5,
    "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10,
    "XI": 11, "XII": 12, "XIII": 13, "XIV": 14, "XV": 15,
}


def roman_to_int(s: str) -> int | None:
    s = s.strip().upper()
    return ROMAN.get(s)


def pad2(n: int) -> str:
    return f"{n:02d}"


def slugify(text: str) -> str:
    """
    Lowercase kebab-case. Removes problematic punctuation, collapses whitespace/dashes,
    strips bracket prefixes like "[01] -", and preserves a .md suffix if present.
    """
    t = text.strip()

    # Normalize unicode punctuation
    t = t.replace("—", "-").replace("–", "-")
    t = t.replace("→", " to ").replace("➡", " to ")
    t = t.replace("’", "'").replace("“", '"').replace("”", '"')

    # Remove leading "[01] - " style prefixes
    t = re.sub(r"^\[\s*\d+\s*\]\s*-\s*", "", t)

    # Preserve .md suffix if present
    ext = ""
    if t.lower().endswith(".md"):
        ext = ".md"
        t = t[:-3]

    # Remove parentheses but keep text
    t = re.sub(r"[()]", "", t)

    # Normalize separators
    t = t.replace("&", " and ")
    t = re.sub(r"[\/:]", " ", t)

    # Remove everything except alnum, space, hyphen
    t = re.sub(r"[^a-zA-Z0-9\s\-]+", "", t)

    # Collapse whitespace/hyphens -> single hyphen
    t = re.sub(r"[\s\-]+", "-", t).strip("-").lower()

    return t + ext


def canonical_dir_name(name: str) -> str:
    """Folder naming rules (Grade/Class/Chapter/Canon/Implement/Content/etc.)."""
    raw = name.strip()
    lower = raw.lower().strip()

    if lower in ("canon", "implement", "content"):
        return lower

    # School buckets: "[01] - Elementary School" -> "elementary-school"
    if re.match(r"^\[\s*\d+\s*\]\s*-\s*", raw):
        return slugify(raw).replace(".md", "")

    # Class N -> class-0N
    m = re.match(r"^Class\s+(\d+)\s*$", raw, re.IGNORECASE)
    if m:
        return f"class-{pad2(int(m.group(1)))}"

    # Chapter N -> chapter-0N
    m = re.match(r"^Chapter\s+(\d+)\s*$", raw, re.IGNORECASE)
    if m:
        return f"chapter-{pad2(int(m.group(1)))}"

    # Grade folders: "Grade II - The Seeker"
    m = re.match(r"^Grade\s+([0-9]+|[IVX]+)\s*-\s*The\s+(.+?)\s*$", raw, re.IGNORECASE)
    if m:
        num_raw = m.group(1).upper()
        title_raw = m.group(2)
        n = int(num_raw) if num_raw.isdigit() else (roman_to_int(num_raw) or 0)
        if n > 0:
            return f"grade-{pad2(n)}-{slugify(title_raw).replace('.md','')}"
        return slugify(raw).replace(".md", "")

    # "The Alchemist" -> "alchemist"
    m = re.match(r"^The\s+(.+?)\s*$", raw, re.IGNORECASE)
    if m:
        return slugify(m.group(1)).replace(".md", "")

    return slugify(raw).replace(".md", "")


def canonical_file_name(name: str) -> str:
    """File naming rules (strip grade prefix, strip specialization prefix, slugify)."""
    raw = name.strip()

    # Fix trailing spaces before extension: "Kernel Set .md" -> "Kernel Set.md"
    raw = re.sub(r"\s+\.md$", ".md", raw)

    # Remove Grade prefix: "Grade I — Constraint Bundle Spec.md" -> "Constraint Bundle Spec.md"
    raw = re.sub(r"^Grade\s+([0-9]+|[IVX]+)\s*[-—]\s*", "", raw, flags=re.IGNORECASE)

    # Remove specialization prefix: "The Alchemist - Constraint Bundle Spec.md" -> "Constraint Bundle Spec.md"
    raw = re.sub(r"^The\s+.+?\s*-\s*", "", raw, flags=re.IGNORECASE)

    return slugify(raw)


def is_git_repo(root: Path) -> bool:
    return (root / ".git").exists()


def run(cmd: List[str], cwd: Path) -> Tuple[int, str]:
    p = subprocess.run(
        cmd,
        cwd=str(cwd),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    return p.returncode, p.stdout


def is_tracked(repo: Path, p: Path) -> bool:
    try:
        subprocess.run(
            ["git", "ls-files", "--error-unmatch", str(p)],
            cwd=repo,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True,
        )
        return True
    except Exception:
        return False


@dataclass
class Move:
    src: Path
    dst: Path


def build_plan(root: Path) -> List[Move]:
    """
    Bottom-up rename plan for everything under `root`.

    - Directories renamed via canonical_dir_name()
    - Only .md files renamed via canonical_file_name()
    - Deepest-first ordering avoids breaking paths during parent folder renames.
    """
    all_paths: List[Path] = []
    for p in root.rglob("*"):
        if p.is_file() and p.name.lower() == "corefiletree.txt":
            continue
        all_paths.append(p)

    all_paths.sort(key=lambda x: len(x.parts), reverse=True)

    moves: List[Move] = []
    for p in all_paths:
        parent = p.parent

        if p.is_dir():
            new_name = canonical_dir_name(p.name)
        else:
            if p.suffix.lower() != ".md":
                continue
            new_name = canonical_file_name(p.name)

        if new_name == p.name:
            continue

        moves.append(Move(src=p, dst=parent / new_name))

    return moves


def resolve_collisions(moves: List[Move]) -> List[Move]:
    """
    If multiple sources map to the same destination, append -2, -3, etc.
    """
    seen: Dict[Path, int] = {}
    out: List[Move] = []

    for m in moves:
        dst = m.dst
        if dst not in seen:
            seen[dst] = 1
            out.append(m)
            continue

        seen[dst] += 1
        i = seen[dst]

        if dst.suffix:
            new_dst = dst.with_name(f"{dst.stem}-{i}{dst.suffix}")
        else:
            new_dst = dst.with_name(f"{dst.name}-{i}")

        out.append(Move(src=m.src, dst=new_dst))

    return out


def apply_moves(moves: List[Move], repo_root: Path, apply: bool, use_git: bool) -> int:
    changed = 0

    for m in moves:
        if not m.src.exists():
            # It may have moved due to a parent directory rename; safe to skip
            continue

        if m.dst.exists():
            print(f"SKIP (dst exists): {m.src} -> {m.dst}")
            continue

        if not apply:
            print(f"WOULD MOVE {m.src} -> {m.dst}")
            changed += 1
            continue

        # Ensure destination parent exists
        m.dst.parent.mkdir(parents=True, exist_ok=True)

        # Directories: use filesystem move (git doesn't track dirs; git mv may fail)
        if m.src.is_dir():
            shutil.move(str(m.src), str(m.dst))
            print(f"MOVED {m.src} -> {m.dst}")
            changed += 1
            continue

        # Files: use git mv if tracked; otherwise filesystem move
        if use_git and is_tracked(repo_root, m.src):
            code, out = run(["git", "mv", str(m.src), str(m.dst)], cwd=repo_root)
            if code != 0:
                print(out.rstrip())
                # fallback
                shutil.move(str(m.src), str(m.dst))
        else:
            shutil.move(str(m.src), str(m.dst))

        print(f"MOVED {m.src} -> {m.dst}")
        changed += 1

    return changed


def main() -> None:
    ap = argparse.ArgumentParser(description="Bulk rename Vitae curriculum to lowercase kebab-case.")
    ap.add_argument("--root", default="docs/vitae/curriculum", help="Curriculum root directory")
    ap.add_argument("--apply", action="store_true", help="Perform changes (default: dry-run)")
    args = ap.parse_args()

    repo_root = Path(".").resolve()
    root = (repo_root / args.root).resolve()

    if not root.exists() or not root.is_dir():
        raise SystemExit(f"Root not found or not a directory: {root}")

    use_git = is_git_repo(repo_root)

    moves = resolve_collisions(build_plan(root))
    print(f"Plan: {len(moves)} rename(s) under {root}")

    changed = apply_moves(moves, repo_root=repo_root, apply=args.apply, use_git=use_git)
    print(f"\n{changed} rename(s) {'applied' if args.apply else 'planned (dry-run)' }.")


if __name__ == "__main__":
    main()
