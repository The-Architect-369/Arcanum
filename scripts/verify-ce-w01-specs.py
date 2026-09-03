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


def verify_spatial_architecture() -> None:
    schema = load(GEOM / "arcnet-spatial-architecture.schema.json")
    registry = load(GEOM / "arcnet-spatial-architecture.v0.2.json")
    vectors = load(GEOM / "arcnet-spatial-architecture.vectors.v0.2.json")
    tolerance = vectors["tolerance"]
    expectations = vectors["expectations"]

    require(
        schema["$schema"].endswith("2020-12/schema"),
        "spatial architecture schema draft",
    )
    require(
        schema["$id"] == "urn:arcanum:ce-w01:arcnet-spatial-architecture:0.2.0",
        "spatial architecture schema ID",
    )
    require(
        schema["additionalProperties"] is False,
        "spatial architecture closed root schema",
    )
    require(
        registry["$schema"] == "./arcnet-spatial-architecture.schema.json",
        "spatial architecture local schema binding",
    )
    require(
        registry["spatialArchitectureId"] == "arcnet-spatial-architecture",
        "spatial architecture registry ID",
    )
    require(
        registry["schemaVersion"] == "0.2.0",
        "spatial architecture schema version",
    )
    require(
        registry["extendsFrameId"] == "arcnet-coordinate-frame",
        "spatial architecture inherited Geometry v0.1 frame",
    )
    require(
        registry["authorityEffect"] == "none",
        "spatial architecture authority effect",
    )

    require(
        vectors["vectorSet"] == "arcnet-spatial-architecture-falsification",
        "spatial architecture vector-set ID",
    )
    require(vectors["version"] == "0.2.0", "spatial architecture vector version")
    require(
        vectors["registry"] == "./arcnet-spatial-architecture.v0.2.json",
        "spatial architecture vector registry binding",
    )
    require(
        list(expectations) == [f"F{i}" for i in range(11, 21)],
        "spatial architecture F11-F20 vector coverage",
    )
    require(
        registry["inheritedFalsificationIds"] == [f"F{i}" for i in range(1, 11)],
        "spatial architecture preserves F1-F10",
    )
    require(
        registry["falsificationIds"] == [f"F{i}" for i in range(11, 21)],
        "spatial architecture declares F11-F20",
    )

    families = {entry["id"]: entry for entry in registry["coordinateFamilies"]}
    require(
        set(families) == {"flower-lattice-2d", "stellar-frame-3d"},
        "spatial architecture coordinate families",
    )
    require(
        families["flower-lattice-2d"]["role"] == "first-class-coordinate-family",
        "Flower lattice first-class coordinate family",
    )
    require(
        families["flower-lattice-2d"]["canonicalAddressType"]
        == "integer-axial-pair",
        "Flower canonical address type",
    )
    require(
        families["stellar-frame-3d"]["role"] == "inherited-certified-v0.1",
        "stellar frame inherited from Geometry v0.1",
    )

    flower = registry["flowerLattice"]

    def planar(address):
        q, r = address
        return (
            q + r / 2.0,
            (math.sqrt(3) / 2.0) * r,
        )

    def lift(point):
        x, y = point
        return (x, y, 0.0)

    def shell_distance(address):
        q, r = address
        return max(abs(q), abs(r), abs(q + r))

    def window(max_shell):
        return [
            (q, r)
            for q in range(-max_shell, max_shell + 1)
            for r in range(-max_shell, max_shell + 1)
            if shell_distance((q, r)) <= max_shell
        ]

    # F11 — Flower basis and six nearest neighbors.
    f11 = expectations["F11"]

    require(
        flower["basis"]["bQ"]["exact"] == ["1", "0"],
        "F11 exact bQ basis",
    )
    require(
        flower["basis"]["bR"]["exact"] == ["1/2", "sqrt(3)/2"],
        "F11 exact bR basis",
    )

    for observed, expected in zip(
        flower["basis"]["bQ"]["decimal"],
        f11["basisDecimal"]["bQ"],
    ):
        require(close(observed, expected, tolerance), "F11 decimal bQ basis")

    for observed, expected in zip(
        flower["basis"]["bR"]["decimal"],
        f11["basisDecimal"]["bR"],
    ):
        require(close(observed, expected, tolerance), "F11 decimal bR basis")

    require(
        flower["neighborOffsets"] == f11["neighborOffsets"],
        "F11 six-neighbor offsets",
    )
    require(
        len({tuple(offset) for offset in flower["neighborOffsets"]}) == 6,
        "F11 six unique neighbor offsets",
    )
    require(
        close(
            flower["nearestNeighborSpacing"],
            f11["expectedNeighborDistance"],
            tolerance,
        ),
        "F11 nearest-neighbor spacing",
    )
    require(
        close(flower["circleRadius"], 1.0, tolerance),
        "F11 overlapping-circle radius",
    )

    for address in f11["sampleAddresses"]:
        point = planar(address)
        for dq, dr in f11["neighborOffsets"]:
            neighbor = [address[0] + dq, address[1] + dr]
            require(
                close(
                    distance(point, planar(neighbor)),
                    f11["expectedNeighborDistance"],
                    tolerance,
                ),
                "F11 Flower nearest-neighbor distance",
            )

    # F12 — exact shell and cumulative-window counts.
    f12 = expectations["F12"]

    require(
        flower["shellDistanceFormula"] == "max(abs(q),abs(r),abs(q+r))",
        "F12 shell-distance formula",
    )
    require(
        flower["shellCountFormula"] == "6*n for n>0",
        "F12 shell-count formula",
    )
    require(
        flower["windowCountFormula"] == "1+3*n*(n+1)",
        "F12 window-count formula",
    )

    for case in f12["shellCounts"]:
        n = case["n"]
        observed_count = sum(
            shell_distance(address) == n
            for address in window(n)
        )
        require(
            observed_count == case["count"],
            f"F12 shell count n={n}",
        )

    for case in f12["cumulativeWindowCounts"]:
        n = case["n"]
        require(
            len(window(n)) == case["count"],
            f"F12 cumulative window count n={n}",
        )

    finite_windows = {
        entry["id"]: entry["cumulativeCount"]
        for entry in flower["finiteWindows"]
    }
    require(
        finite_windows == f12["finiteWindows"],
        "F12 named finite-window counts",
    )
    require(
        flower["initialWindowCounts"]
        == [case["count"] for case in f12["cumulativeWindowCounts"]],
        "F12 exact 1/7/19/37 sequence",
    )
    require(
        flower["nineEmanationCardinalityClaim"] is False,
        "F12 nine-emanation cardinality boundary",
    )

    # F13 — axial-address uniqueness.
    f13 = expectations["F13"]
    addresses = window(f13["testMaxShell"])

    require(
        len(addresses) == f13["expectedDistinctAddressCount"],
        "F13 tested finite-window cardinality",
    )

    # Exact uniqueness key:
    # x = q + r/2, so 2*x = 2*q+r; y uniquely determines r.
    exact_planar_keys = {
        (2 * q + r, r)
        for q, r in addresses
    }
    require(
        len(exact_planar_keys) == len(addresses),
        "F13 axial-address uniqueness",
    )

    # F14 — exact planar 2D -> 3D lift.
    f14 = expectations["F14"]
    planar_lift = registry["transforms"]["planarLift"]

    require(
        planar_lift["formula"] == f14["formula"],
        "F14 planar-lift formula",
    )
    require(planar_lift["exact"] is True, "F14 planar lift exact")
    require(
        planar_lift["preservesPlanarDistance"] is True,
        "F14 planar lift distance declaration",
    )

    for address in window(f14["testMaxShell"]):
        require(
            close(lift(planar(address))[2], f14["expectedZ"], tolerance),
            "F14 lifted z coordinate",
        )

    for pair in f14["samplePairs"]:
        first = planar(pair["a"])
        second = planar(pair["b"])
        require(
            close(
                distance(first, second),
                distance(lift(first), lift(second)),
                tolerance,
            ),
            "F14 pairwise distance preservation",
        )

    stronger_relation = registry["transforms"]["strongerFlowerStellarRelation"]
    require(
        stronger_relation["identityClaim"] is False,
        "F14 no Flower/stellar identity claim",
    )
    require(
        stronger_relation["ratified"] is False,
        "F14 stronger Flower/stellar relation unratified",
    )
    require(
        stronger_relation["requireDerivation"] is True,
        "F14 stronger relation requires derivation",
    )
    require(
        stronger_relation["requireMachineFalsification"] is True,
        "F14 stronger relation requires machine falsification",
    )

    # F15 — orientation changes cannot mutate canonical addresses.
    f15 = expectations["F15"]
    orientation = registry["orientationFrames"]

    require(orientation["bounded"] is True, "F15 bounded orientation")
    require(
        orientation["universalSemanticNorth"] is False,
        "F15 no universal semantic North",
    )
    require(
        orientation["canonicalAddressMutationAllowed"] is False,
        "F15 orientation cannot mutate canonical address",
    )
    require(
        orientation["canonicalAddressMutationAllowed"]
        is f15["canonicalAddressMutationAllowed"],
        "F15 vector orientation mutation boundary",
    )
    require(
        f15["canonicalAddress"] == f15["expectedCanonicalAddress"],
        "F15 canonical address invariant",
    )

    for context in f15["orientationContexts"]:
        require(
            context in orientation["referenceRootExamples"],
            "F15 registered reference-root context",
        )

    require(
        set(orientation["northKinds"])
        == {
            "semantic-root",
            "geographic",
            "device",
            "astronomical",
            "scene",
            "custom-registered",
        },
        "F15 typed North references",
    )

    # F16 — geometry/correspondence cannot independently create authority.
    f16 = expectations["F16"]
    correspondence = registry["correspondenceProfiles"]

    require(
        registry["authorityEffect"] == f16["authorityEffect"],
        "F16 spatial architecture non-authority",
    )
    require(
        correspondence["authorityEffect"] == f16["authorityEffect"],
        "F16 correspondence non-authority",
    )
    require(
        set(registry["forbiddenEffects"]) == set(f16["forbiddenEffects"]),
        "F16 forbidden authority effects",
    )

    # F17 — correspondence provenance and status are mandatory.
    f17 = expectations["F17"]
    required_profile_fields = set(correspondence["requiredFields"])

    require(
        correspondence["sourceOwned"] is True,
        "F17 correspondence source ownership",
    )
    require(
        correspondence["domainScoped"] is True,
        "F17 correspondence domain scope",
    )
    require(
        set(f17["requiredCorrespondenceFields"]).issubset(
            required_profile_fields
        ),
        "F17 correspondence provenance/status fields",
    )
    require(
        correspondence["coordinatesSelfAuthenticateMeaning"]
        is f17["coordinatesSelfAuthenticateMeaning"],
        "F17 coordinates do not self-authenticate meaning",
    )

    # F18 — geometry-free operational equivalence.
    f18 = expectations["F18"]
    geometry_free = registry["geometryFreeEquivalent"]

    require(
        geometry_free["required"] is f18["geometryFreeEquivalentRequired"],
        "F18 geometry-free equivalent required",
    )
    require(
        geometry_free["operationalStatePreserved"]
        is f18["operationalStatePreserved"],
        "F18 operational state preserved",
    )
    require(
        geometry_free["authorityMeaningPreserved"]
        is f18["authorityMeaningPreserved"],
        "F18 authority meaning preserved",
    )
    require(
        "topology-mapping-status" in geometry_free["requiredFields"],
        "F18 topology mapping remains inspectable without geometry",
    )

    # F19 — semantic/execution/physical graph separation.
    f19 = expectations["F19"]
    topology = registry["topology"]
    logical_topology = topology["logicalFlowerTopology"]

    require(
        topology["graphTypes"] == f19["graphTypes"],
        "F19 graph-type separation",
    )
    require(
        len(set(topology["graphTypes"])) == 3,
        "F19 graph types distinct",
    )
    require(
        logical_topology["createsExecutionPath"]
        is f19["logicalAdjacencyCreatesExecutionPath"],
        "F19 Flower adjacency does not create execution path",
    )
    require(
        logical_topology["createsPhysicalEdge"]
        is f19["logicalAdjacencyCreatesPhysicalEdge"],
        "F19 Flower adjacency does not create physical edge",
    )
    require(
        topology["adapterCanInventPhysicalConnectivity"]
        is f19["adapterCanInventPhysicalConnectivity"],
        "F19 adapter cannot invent physical connectivity",
    )
    require(
        topology["absentPhysicalLogicalEdgePolicy"]
        == f19["absentPhysicalLogicalEdgePolicy"],
        "F19 absent physical edge policy",
    )
    require(
        topology["mappingPipeline"]
        == [
            "logical-arcnet-geometry",
            "placement-routing-compiler",
            "hardware-specific-topology-adapter",
            "measured-mapping-result",
        ],
        "F19 logical-to-physical mapping pipeline",
    )

    # F20 — hardware remains an empirical research hypothesis.
    f20 = expectations["F20"]
    hardware = registry["hardwareHypothesis"]

    for key, expected in f20.items():
        require(
            hardware[key] is expected,
            f"F20 hardware hypothesis field {key}",
        )

    require(
        registry["quantumTerminology"][
            "entanglementReservedForActualQuantumStateRelationships"
        ]
        is True,
        "F20 entanglement reserved for actual quantum-state relationships",
    )
    require(
        registry["quantumTerminology"]["ceW01QuantumHardwareDependency"]
        is False,
        "F20 no CE-W01 quantum hardware dependency",
    )

    negative_cases = vectors["negativeCases"]
    negative_ids = [case["id"] for case in negative_cases]

    require(
        len(negative_ids) == len(set(negative_ids)),
        "spatial architecture negative-case IDs unique",
    )
    require(
        all(
            case["expectedFailure"] in {f"F{i}" for i in range(11, 21)}
            for case in negative_cases
        ),
        "spatial architecture negative cases target F11-F20",
    )


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
    for name, check in (
        ("geometry", verify_geometry),
        ("spatial-architecture", verify_spatial_architecture),
        ("tempus", verify_tempus),
    ):
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
