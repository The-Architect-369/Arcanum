#!/usr/bin/env python3
from __future__ import annotations

import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "docs/specs/app/ce-w03-native-hope.v0.1.json"
SEED = ROOT / "docs/specs/geometry/hope-seed-overlay.v0.1.json"
SEED_VECTORS = ROOT / "docs/specs/geometry/hope-seed-overlay.vectors.v0.1.json"
SOURCE = ROOT / "docs/specs/geometry/arcnet-coordinate-frame.v0.1.json"


def require(condition: bool, label: str) -> None:
    if not condition:
        raise SystemExit(f"❌ {label}")
    print(f"✅ {label}")


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def close(a: float, b: float, tolerance: float) -> bool:
    return abs(a - b) <= tolerance * max(1.0, abs(a), abs(b))


def verify_seed_overlay() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    seed = json.loads(SEED.read_text(encoding="utf-8"))
    vectors = json.loads(SEED_VECTORS.read_text(encoding="utf-8"))
    require(source["innerOctahedron"]["role"] == "hope-centered-inner-rendering", "inherited Hope octahedron retained")
    require([vertex["q"] for vertex in source["innerOctahedron"]["vertices"]] == [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]], "inherited octahedral source coordinates exact")
    overlay = seed["overlay"]
    require(seed["source"]["registry"] == "./arcnet-coordinate-frame.v0.1.json", "Seed overlay bound to inherited registry")
    require(seed["source"]["sourceCoordinatesMutable"] is False, "Seed overlay cannot mutate source coordinates")
    require(overlay["type"] == "symbolic-presentation-overlay", "F69 Seed overlay explicitly symbolic")
    require(overlay["exactMappingSpecified"] is False, "F69 exact mapping not fabricated")
    require(overlay["mathematicalIdentityClaimed"] is False, "F69 mathematical identity not fabricated")
    require(overlay["authorityEffect"] == "none", "F69 geometry has no authority effect")
    require(seed["presentationScale"]["type"] == "viewport-relative-presentation-only", "F69 presentation scale typed")
    require(seed["geometryFreeEquivalent"]["required"] is True, "F70 geometry-free equivalent required")
    centers = {entry["id"]: entry["p"] for entry in overlay["centers"]}
    require(len(centers) == 7 and centers["seed_center"] == [0.0, 0.0], "Seed seven-circle local geometry fixed")
    require(close(centers["seed_ne"][1], math.sqrt(3) / 2, 1e-12), "Seed local vector sqrt(3)/2 fixed")
    width = vectors["referenceViewport"]["width"]
    height = vectors["referenceViewport"]["height"]
    origin_x, origin_y = vectors["referenceOrigin"]
    radius = min(width, height) * seed["presentationScale"]["unitRadiusFractionOfMinViewport"]
    expected = {sample["id"]: sample for sample in vectors["samples"]}
    for point_id, point in centers.items():
        screen_x = origin_x + point[0] * radius
        screen_y = origin_y - point[1] * radius
        sample = expected[point_id]
        require(close(screen_x, sample["screen"][0], vectors["tolerance"]), f"Seed vector {point_id} x")
        require(close(screen_y, sample["screen"][1], vectors["tolerance"]), f"Seed vector {point_id} y")
        require(close(radius, sample["radius"], vectors["tolerance"]), f"Seed vector {point_id} radius")


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
    verify_seed_overlay()
    ceiling = data["capabilityCeiling"]
    require(all(value is False for value in ceiling.values()), "offline/capability ceiling is closed")
    require("Current implementation wave: **CE-W03" in read("README.md"), "README current wave reconciled")
    require('wave: "CE-W03"' in read("docs/status/project-status.md"), "project status current wave reconciled")
    require('wave: "CE-W03"' in read("docs/roadmap/canonical-roadmap.md"), "canonical roadmap current wave reconciled")
    require('wave: "CE-W03"' in read("docs/roadmap/construction-era-roadmap.md"), "Construction roadmap current wave reconciled")
    print("✅ CE-W03 contract and implemented tranche invariants verified")


if __name__ == "__main__":
    main()
