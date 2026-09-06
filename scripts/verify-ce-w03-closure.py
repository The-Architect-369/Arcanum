#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def require(condition: bool, label: str) -> None:
    if not condition:
        raise SystemExit(f"❌ {label}")
    print(f"✅ {label}")


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def main() -> None:
    readme = read("README.md")
    status = read("docs/status/project-status.md")
    canonical = read("docs/roadmap/canonical-roadmap.md")
    construction = read("docs/roadmap/construction-era-roadmap.md")
    baseline = read("docs/repo/arcanum-baseline.md")
    workflow = read(".github/workflows/verify-ce-w03-integrated.yml")

    require("CE-W03: complete / certified / promoted" in readme, "CE-W03 README closure state")
    require("Current implementation wave: **CE-W03" in readme, "CE-W03 README verifier-compatible current-wave marker")
    require("Next evidence-gated wave: **CE-W04 — Seed Node Alpha**" in readme, "CE-W04 README handoff")

    require('wave: "CE-W03"' in status, "project status remains CE-W03 closure record")
    require("CE-W03 is complete, certified, and promoted" in status, "project status CE-W03 closed")
    require("F61–F72 are green" in status, "project status F61-F72 closure")
    require("CE-W04 remains the next evidence-gated wave" in status, "project status CE-W04 next")

    require('wave: "CE-W03"' in canonical, "canonical roadmap closure wave marker")
    require("CE-W03 — Hope at the Center / Arcanum Native Vertical Slice — **COMPLETE**" in canonical, "canonical roadmap CE-W03 complete")
    require("CE-W04 — Seed Node Alpha — **NEXT**" in canonical, "canonical roadmap CE-W04 next")

    require('wave: "CE-W03"' in construction, "Construction roadmap closure wave marker")
    require("### CE-W03 — Hope at the Center / Arcanum Native Vertical Slice — COMPLETE" in construction, "Construction roadmap CE-W03 complete")
    require("### CE-W04 — Seed Node Alpha — NEXT" in construction, "Construction roadmap CE-W04 next")

    require('wave: "CE-W03"' in baseline, "forward baseline advanced to CE-W03")
    require("F1–F72" in baseline and "F61–F72" in baseline, "forward baseline records inherited and CE-W03 falsification ranges")
    require("hope.reflection.v0.1" in baseline, "forward baseline records Construction Hope record")
    require("Android Keystore" in baseline and "AES-GCM" in baseline, "forward baseline records protected Hope storage")
    require("signed local receipt (scope=local)" in baseline, "forward baseline preserves CE-W04 signing handoff")
    require("CE-W04" in baseline and "Seed Node Alpha" in baseline, "forward baseline names CE-W04 next")

    require("name: CE-W03 Integrated Evidence" in workflow, "F72 integrated workflow present")
    require("Atman exact-source certification" in workflow and "git diff --check" in workflow, "Atman exact-source diff integrity present")
    require("pnpm verify:ce-w03:closure" in workflow, "F1-F71 and closure contract composed")
    for library in [
        "libarcanum_android_jni.so",
        "libarcanum_android_tempus_lifecycle_jni.so",
        "libarcanum_android_hope_jni.so",
    ]:
        require(library in workflow, f"F72 integrated workflow packages {library}")
    require("arm64-v8a" in workflow and "x86_64" in workflow, "F72 both Android ABIs verified")
    require("Verify deterministic repository index on indexed heads" in workflow, "F72 deterministic index verification present")
    require("F72 exact head:" in workflow, "F72 exact-head evidence marker present")

    print("✅ CE-W03 W03.5 closure and CE-W04 handoff invariants verified")


if __name__ == "__main__":
    main()
