#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "docs/specs/app/ce-w03-native-hope.v0.1.json"


def require(condition: bool, label: str) -> None:
    if not condition:
        raise SystemExit(f"❌ {label}")
    print(f"✅ {label}")


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def main() -> None:
    data = json.loads(CONTRACT.read_text(encoding="utf-8"))
    require(data["contractId"] == "ce-w03-native-hope.v0.1", "CE-W03 contract ID")
    require(data["constructionEra"] == "CE-W03", "CE-W03 era identity")
    require(data["canonicalBase"] == "cb42fb0f9497e406b189230f753c1398c22e6afd", "CE-W03 exact opening baseline")
    require(data["authorityEffect"] == "none", "CE-W03 authority effect remains none")
    require(list(data["decisions"]) == [f"D{i}" for i in range(1, 8)], "D1-D7 frozen")
    require(list(data["falsificationIds"]) == [f"F{i}" for i in range(61, 73)], "F61-F72 frozen")
    require(data["tranches"] == [f"W03.{i}" for i in range(6)], "W03.0-W03.5 ordered")

    record = data["hopeRecord"]
    require(record["version"] == "hope.reflection.v0.1", "Construction Hope record version")
    require(record["visibilityDefault"] == "local_private", "Hope local-private default")
    require(record["authority"] == "advisory_only", "Hope advisory-only authority")
    require(record["interpretation"] is None, "Hope interpretation remains null")
    require(record["receiptScope"] == "local", "Hope receipt scope local")
    require(record["receiptSigningRequired"] is False, "CE-W03 does not fabricate receipt signing")

    storage = data["storage"]
    require(storage["namespace"] == "hope", "Hope namespace fixed")
    require(storage["platformKeyProvider"] == "AndroidKeyStore", "Android Keystore provider fixed")
    require(storage["cipher"] == "AES/GCM/NoPadding", "authenticated AES-GCM fixed")
    require(storage["keyExportable"] is False and storage["keyCrossesJni"] is False, "key isolation invariant")
    require(storage["tamperFailure"] == "fail_closed", "tamper fails closed")

    geometry = data["geometry"]
    require(geometry["seedRelationship"] == "symbolic_presentation_overlay", "Seed overlay typing")
    require(geometry["exactIdentityClaimed"] is False, "no unproved Seed/octahedron identity")
    require(geometry["geometryFreeEquivalentRequired"] is True, "geometry-free equivalent required")

    ceiling = data["capabilityCeiling"]
    require(all(value is False for value in ceiling.values()), "offline/capability ceiling is closed")

    require("Current implementation wave: **CE-W03" in read("README.md"), "README current wave reconciled")
    require('wave: "CE-W03"' in read("docs/status/project-status.md"), "project status current wave reconciled")
    require('wave: "CE-W03"' in read("docs/roadmap/canonical-roadmap.md"), "canonical roadmap current wave reconciled")
    require('wave: "CE-W03"' in read("docs/roadmap/construction-era-roadmap.md"), "Construction roadmap current wave reconciled")

    print("✅ CE-W03 opening contract verified")


if __name__ == "__main__":
    main()
