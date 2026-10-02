#!/usr/bin/env python3
"""Compile production update paths, then exercise isolated host fault adapters.

All dependencies are supplied explicitly. No downloading, Android device control,
installation submission, or real HTTP transfer occurs. The adapters do not certify
Android framework durability or actual PackageInstaller failure delivery.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("java-home", "kotlin-home", "android-jar", "json-jar", "apksig-jar"):
        parser.add_argument("--" + name, type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()
    here = Path(__file__).resolve().parent
    repo = here.parents[3]
    java_home = args.java_home.resolve()
    windows = (java_home / "bin/java.exe").exists()
    suffix = ".exe" if windows else ""
    java = java_home / ("bin/java" + suffix)
    javac = java_home / ("bin/javac" + suffix)

    def native(path):
        path = str(Path(path).resolve())
        if windows:
            return subprocess.check_output(["wslpath", "-w", path], text=True).strip()
        return path

    def cp(paths):
        return (";" if windows else os.pathsep).join(native(p) for p in paths)

    libs = [args.json_jar, args.apksig_jar,
            args.kotlin_home / "lib/kotlin-stdlib.jar", args.android_jar]
    source_root = repo / "apps/android/app/src/main/java/org/arcanum/nativehost/update"
    sources = sorted(p for p in source_root.glob("*.kt") if p.name != "OwnPackageUpdatePanel.kt")
    fixture_sources = sorted((here / "src").rglob("*.java"))
    manifest = repo / "apps/web/public/updates/a15-settlement-verification/manifest.json"
    with tempfile.TemporaryDirectory(prefix="a15-production-fault-") as temporary:
        root = Path(temporary)
        production = root / "production.jar"
        classes = root / "classes"
        classes.mkdir()
        subprocess.run([
            str(java), "-cp", native(args.kotlin_home / "lib") + "/*",
            "org.jetbrains.kotlin.cli.jvm.K2JVMCompiler",
            "-kotlin-home", native(args.kotlin_home), "-cp", cp(libs),
            *[native(p) for p in sources], "-d", native(production),
        ], check=True)
        subprocess.run([
            str(javac), "-cp", cp([production] + libs), "-d", native(classes),
            *[native(p) for p in fixture_sources],
        ], check=True)
        result = subprocess.run([
            str(java), "-cp", cp([classes, production] + libs),
            "ProductionFaultPaths", native(manifest),
        ], check=True, capture_output=True, text=True)
        assert "PASS 15 isolated production-path fault cases" in result.stdout
        report = {
            "evidenceClass": "isolated-host-production-path-fixture",
            "decision": "pass", "casesPassed": 15,
            "productionSources": {str(p.relative_to(repo)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sources},
            "fixtureSources": {str(p.relative_to(here)): hashlib.sha256(p.read_bytes()).hexdigest() for p in fixture_sources},
            "cases": ["truncated manifest", "truncated APK", "thread interruption",
                      "orphan partial cleanup", "seven known failure statuses persist FAILED",
                      "aborted persists CANCELLED", "missing/unexpected status persists UNKNOWN",
                      "mismatched session ignored", "all callback journals block resubmission"],
            "deviceActions": False, "realNetworkRequests": False,
            "androidFrameworkDurabilityCertified": False,
            "physicalFailedInstallObserved": False,
            "limits": "Host Context/Intent/Build/AtomicFile adapters; genuine production staging/callback/serialization/eligibility code, not real Android service delivery or AtomicFile crash semantics.",
            "output": result.stdout.strip(),
        }
        args.report.write_text(json.dumps(report, indent=2) + "\n")
        print(result.stdout.strip())


if __name__ == "__main__":
    main()
