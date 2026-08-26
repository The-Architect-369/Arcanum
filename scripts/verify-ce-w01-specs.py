#!/usr/bin/env python3
"""Deterministic CE-W01 Geometry/Tempus verifier using only stdlib."""

from __future__ import annotations

import hashlib
import itertools
import json
import math
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GEOM = ROOT / "docs" / "specs" / "geometry"
TEMPUS = ROOT / "docs" / "specs" / "tempus"

FORBIDDEN_TEMPUS_KEYS = {
    "authority",
    "authorization",
    "capability",
    "readiness",
    "worth",
    "score",
    "vitaeGrade",
    "hopeState",
    "economicStatus",
    "governancePower",
}


def load(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def close(a: float, b: float, tolerance: float) -> bool:
    return math.isclose(a, b, rel_tol=tolerance, abs_tol=tolerance)


def distance(a, b) -> float:
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))


def canonical_bytes(value) -> bytes:
    return json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")


def sha256(value) -> str:
    return hashlib.sha256(canonical_bytes(value)).hexdigest()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def verify_geometry() -> None:
    schema = load(GEOM / "arcnet-coordinate-frame.schema.json")
    registry = load(GEOM / "arcnet-coordinate-frame.v0.1.json")
    vectors = load(GEOM / "arcnet-coordinate-frame.vectors.v0.1.json")
    tolerance = vectors["tolerance"]

    require(schema["$schema"].endswith("2020-12/schema"), "geometry schema draft")
    require(registry["frameId"] == "arcnet-coordinate-frame", "geometry frame ID")
    require(registry["schemaVersion"] == "0.1.0", "geometry schema version")

    cube = {vertex["id"]: vertex["q"] for vertex in registry["outerCube"]["vertices"]}
    expected_cube = {
        (x, y, z)
        for x in (-1, 1)
        for y in (-1, 1)
        for z in (-1, 1)
    }
    require(len(cube) == 8, "F1 cube vertex count")
    require({tuple(q) for q in cube.values()} == expected_cube, "F1 cube coordinates")

    tetrahedra = {entry["id"]: entry for entry in registry["tetrahedra"]}
    require(set(tetrahedra) == {"G", "S"}, "F2 tetrahedron IDs")
    for tetrahedron_id, sign in (("G", 1), ("S", -1)):
        tetrahedron = tetrahedra[tetrahedron_id]
        require(len(tetrahedron["vertexIds"]) == 4, f"F2 {tetrahedron_id} cardinality")
        points = [cube[vertex_id] for vertex_id in tetrahedron["vertexIds"]]
        require(all(math.prod(point) == sign for point in points), f"F2 {tetrahedron_id} membership")
        for first, second in itertools.combinations(points, 2):
            require(
                close(distance(first, second), 2 * math.sqrt(2), tolerance),
                f"F2 {tetrahedron_id} regularity",
            )

    octahedron = [vertex["q"] for vertex in registry["innerOctahedron"]["vertices"]]
    expected_octahedron = {
        (1, 0, 0),
        (-1, 0, 0),
        (0, 1, 0),
        (0, -1, 0),
        (0, 0, 1),
        (0, 0, -1),
    }
    require({tuple(q) for q in octahedron} == expected_octahedron, "F3 octahedron coordinates")
    require(
        close(registry["innerOctahedron"]["circumradius"]["decimal"], 1.0, tolerance),
        "F3 octahedron circumradius",
    )

    origin = registry["origin"]
    require(origin["q"] == [0, 0, 0], "F4 origin")
    require(origin["isSystem"] is False, "F4 center non-system")
    require(origin["authorityEffect"] == "none", "F4 center no authority")

    observed_distances = [
        distance(first, second)
        for first, second in itertools.combinations(cube.values(), 2)
    ]
    expected_classes = [
        (2.0, 12),
        (2 * math.sqrt(2), 12),
        (2 * math.sqrt(3), 4),
    ]
    for expected_distance, expected_count in expected_classes:
        count = sum(close(value, expected_distance, tolerance) for value in observed_distances)
        require(count == expected_count, "outer distance class count")

    transport = vectors["expectations"]["F5"]["transport"]
    rotation = transport["rotation"]
    scale = transport["scale"]
    translation = transport["translation"]
    for row_index in range(3):
        for other_row_index in range(3):
            dot = sum(
                rotation[row_index][column] * rotation[other_row_index][column]
                for column in range(3)
            )
            expected = 1.0 if row_index == other_row_index else 0.0
            require(close(dot, expected, tolerance), "F5 rotation orthonormal")

    local_points = list(cube.values())
    moved_points = []
    for point in local_points:
        rotated = [
            sum(rotation[row][column] * point[column] for column in range(3))
            for row in range(3)
        ]
        moved_points.append(
            [translation[index] + scale * rotated[index] for index in range(3)]
        )
    local_pairs = itertools.combinations(local_points, 2)
    moved_pairs = itertools.combinations(moved_points, 2)
    for (first, second), (moved_first, moved_second) in zip(local_pairs, moved_pairs):
        require(
            close(
                distance(moved_first, moved_second),
                scale * distance(first, second),
                tolerance,
            ),
            "F5 rigid transport",
        )

    overlays = registry["optionalOverlays"]
    require(overlays["icosahedron"]["enabledByDefault"] is False, "F6 optional icosahedron")
    require(overlays["seedOfLife"]["enabledByDefault"] is False, "F6 optional Seed-of-Life")
    require(overlays["icosahedron"]["relationToCube"] == "embedding", "F7 cube/icosahedron relation")
    require(overlays["icosahedron"]["duality"] is False, "F7 no false duality")
    require(registry["unit"] == "unitless", "F8 normalized scale type")
    require(overlays["seedOfLife"]["exactMappingSpecified"] is False, "F8 Seed mapping remains unratified")
    require(registry["geometryFreeEquivalentRequired"] is True, "F9 geometry-free equivalent")
    require(registry["authorityEffect"] == "none", "F10 registry authority")
    require(
        set(vectors["expectations"]["F10"]["forbiddenAuthorityInputs"]).issubset(
            set(registry["forbiddenAuthorityInputs"])
        ),
        "F10 forbidden inputs",
    )

    icosahedron = [vertex["q"] for vertex in overlays["icosahedron"]["vertices"]]
    edge = overlays["icosahedron"]["edge"]["decimal"]
    edge_pairs = sum(
        close(distance(first, second), edge, tolerance)
        for first, second in itertools.combinations(icosahedron, 2)
    )
    require(edge_pairs == 30, "optional icosahedron edge count")


def parse_datetime(value: str):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def validate_anchor(anchor) -> set[str]:
    failures: set[str] = set()
    required_fields = {
        "anchorId",
        "schemaVersion",
        "capturedAt",
        "timeScale",
        "source",
        "observer",
        "frame",
        "observation",
        "precision",
        "provenance",
        "interpretation",
    }
    if not required_fields.issubset(anchor):
        failures.add("schema")
        return failures

    try:
        parse_datetime(anchor["capturedAt"])
    except Exception:
        failures.add("schema")

    if anchor["schemaVersion"] != "0.1.0":
        failures.add("schema")
    if anchor["interpretation"] is not None:
        failures.add("T6")
    if FORBIDDEN_TEMPUS_KEYS.intersection(anchor):
        failures.add("T6")

    source = anchor["source"]
    source_kind = source.get("kind")
    observation = anchor["observation"]

    if source_kind in {"system-clock", "monotonic-clock"}:
        if observation.get("kind") != "clock":
            failures.add("T2")
        if anchor["observer"] is not None:
            failures.add("T8")
        if anchor["frame"] is not None:
            failures.add("T2")

    if source_kind == "ephemeris":
        observer = anchor["observer"]
        frame = anchor["frame"]
        if observer is None or frame is None:
            failures.add("T3")
        if not observation.get("target") or not observation.get("coordinateType"):
            failures.add("T3")
        if frame is not None:
            if not frame.get("family") or not frame.get("epochRule"):
                failures.add("T3")
        for field in ("provider", "model", "version", "sourceId"):
            if source.get(field) is None:
                failures.add("T3")
        if not anchor["timeScale"]:
            failures.add("T3")

    if {"protocolWitness", "chainTransaction", "networkFinality"}.intersection(anchor):
        failures.add("T5")
    return failures


def verify_tempus() -> None:
    schema = load(TEMPUS / "tempus-anchor.schema.json")
    vectors = load(TEMPUS / "tempus-anchor.vectors.v0.1.json")

    require(schema["$schema"].endswith("2020-12/schema"), "Tempus schema draft")
    assertions = vectors["semanticAssertions"]
    require(assertions["automaticProtocolTransaction"] is False, "T5 local/chain separation")
    require(assertions["astronomicalPositionMayAuthorize"] is False, "T6 authority firewall")
    require(assertions["timingMayScoreWorth"] is False, "T7 no timing worth score")
    require(assertions["preciseLocationRequiredForClock"] is False, "T8 location-free clock")
    require(assertions["geometryRequiredForUnderstanding"] is False, "T10 geometry-free equivalent")

    for vector in vectors["valid"]:
        anchor = vector["anchor"]
        failures = validate_anchor(anchor)
        require(not failures, f"valid Tempus vector {vector['id']} failed: {sorted(failures)}")
        require(sha256(anchor) == vector["canonicalSha256"], f"digest mismatch: {vector['id']}")

    for vector in vectors["invalid"]:
        failures = validate_anchor(vector["anchor"])
        require(
            vector["expectedFailure"] in failures,
            f"invalid Tempus vector {vector['id']} did not fail {vector['expectedFailure']}",
        )

    clock = next(vector["anchor"] for vector in vectors["valid"] if vector["id"] == "clock-offline")
    ephemeris = next(
        vector["anchor"]
        for vector in vectors["valid"]
        if vector["id"] == "ephemeris-provenance"
    )
    require(clock["observer"] is None and clock["frame"] is None, "T1/T2 offline clock minimum")
    require(ephemeris["frame"]["family"] == "geocentric-ecliptic-apparent", "T4 frame declaration")
    require(ephemeris["frame"]["center"] == "Earth geocenter", "T4 observer center")
    require(ephemeris["provenance"]["backend"] == "fixture", "T9 provenance retained")


def main() -> int:
    for name, check in (("geometry", verify_geometry), ("tempus", verify_tempus)):
        check()
        print(f"PASS {name}")
    print("PASS CE-W01 machine-readable spec verification")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as error:
        print(f"FAIL {error}", file=sys.stderr)
        raise SystemExit(1)
