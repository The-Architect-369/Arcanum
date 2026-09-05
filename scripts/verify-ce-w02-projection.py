#!/usr/bin/env python3
"""Deterministic CE-W02 screen-projection verifier using only stdlib."""

from __future__ import annotations

import itertools
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GEOM = ROOT / "docs" / "specs" / "geometry"


def load(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def close(a: float, b: float, tolerance: float) -> bool:
    return math.isclose(a, b, rel_tol=tolerance, abs_tol=tolerance)


def close_vec(a, b, tolerance: float) -> bool:
    return len(a) == len(b) and all(close(x, y, tolerance) for x, y in zip(a, b))


def dot(a, b) -> float:
    return sum(x * y for x, y in zip(a, b))


def cross(a, b):
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ]


def norm(v) -> float:
    return math.sqrt(dot(v, v))


def normalize(v):
    length = norm(v)
    require(length > 0.0, "camera vector must be non-zero")
    return [value / length for value in v]


def distance(a, b) -> float:
    return norm([x - y for x, y in zip(a, b)])


def mat_vec(matrix, vector):
    return [
        sum(matrix[row][column] * vector[column] for column in range(len(vector)))
        for row in range(len(matrix))
    ]


def model_transform(q, model):
    rotation = model["compositeMatrix"]
    scale = model["scale"]
    translation = model["translation"]
    rotated = mat_vec(rotation, list(q))
    return [translation[index] + scale * rotated[index] for index in range(3)]


def camera_basis(camera):
    eye = camera["eye"]
    target = camera["target"]
    up_reference = camera["upReference"]
    forward = normalize([target[index] - eye[index] for index in range(3)])
    right = normalize(cross(forward, up_reference))
    up = cross(right, forward)
    require(norm(up) > 0.0, "camera up basis must be non-zero")
    return right, up, forward


def view_transform(world, camera):
    right, up, forward = camera_basis(camera)
    relative = [world[index] - camera["eye"][index] for index in range(3)]
    return [dot(right, relative), dot(up, relative), -dot(forward, relative)]


def perspective_clip(view, perspective, viewport):
    fov_y = math.radians(perspective["fovYDegrees"])
    near = perspective["near"]
    far = perspective["far"]
    width = viewport["width"]
    height = viewport["height"]
    require(0.0 < fov_y < math.pi, "perspective FOV range")
    require(0.0 < near < far, "perspective near/far range")
    require(width > 0.0 and height > 0.0, "viewport dimensions")
    aspect = width / height
    t = 1.0 / math.tan(fov_y / 2.0)
    x, y, z = view
    return [
        (t / aspect) * x,
        t * y,
        ((far + near) / (near - far)) * z + ((2.0 * far * near) / (near - far)),
        -z,
    ]


def inside_clip(clip, tolerance):
    x, y, z, w = clip
    return (
        w > 0.0
        and x >= -w - tolerance
        and x <= w + tolerance
        and y >= -w - tolerance
        and y <= w + tolerance
        and z >= -w - tolerance
        and z <= w + tolerance
    )


def to_ndc(clip):
    require(clip[3] > 0.0, "positive perspective w")
    return [clip[index] / clip[3] for index in range(3)]


def viewport_map(ndc, viewport):
    return [
        viewport["x0"] + (ndc[0] + 1.0) * viewport["width"] / 2.0,
        viewport["y0"] + (1.0 - ndc[1]) * viewport["height"] / 2.0,
    ]


def project(q, profile):
    world = model_transform(q, profile["model"])
    view = view_transform(world, profile["camera"])
    clip = perspective_clip(view, profile["perspective"], profile["viewport"])
    require(inside_clip(clip, 1e-12), "reference point inside canonical clip volume")
    ndc = to_ndc(clip)
    screen = viewport_map(ndc, profile["viewport"])
    return {
        "world": world,
        "view": view,
        "clip": clip,
        "ndc": ndc,
        "screen": screen,
        "viewDepth": -view[2],
    }


def verify() -> None:
    schema = load(GEOM / "arcnet-screen-projection.schema.json")
    registry = load(GEOM / "arcnet-screen-projection.v0.1.json")
    vectors = load(GEOM / "arcnet-screen-projection.vectors.v0.1.json")
    source = load(GEOM / "arcnet-coordinate-frame.v0.1.json")
    tolerance = vectors["tolerance"]
    expectations = vectors["expectations"]
    profile = registry["referenceProfile"]

    require(schema["$schema"].endswith("2020-12/schema"), "projection schema draft")
    require(
        schema["$id"] == "urn:arcanum:ce-w02:arcnet-screen-projection:0.1.0",
        "projection schema ID",
    )
    require(schema["additionalProperties"] is False, "projection closed root schema")
    require(
        registry["$schema"] == "./arcnet-screen-projection.schema.json",
        "registry schema binding",
    )
    require(registry["projectionContractId"] == "arcnet-screen-projection", "projection contract ID")
    require(registry["schemaVersion"] == "0.1.0", "projection contract version")
    require(vectors["vectorSet"] == "arcnet-screen-projection-falsification", "projection vector set")
    require(vectors["version"] == "0.1.0", "projection vector version")
    require(vectors["registry"] == "./arcnet-screen-projection.v0.1.json", "vector registry binding")
    require(
        registry["inheritedFalsificationIds"] == [f"F{i}" for i in range(1, 21)],
        "projection inherits F1-F20",
    )
    require(
        registry["falsificationIds"] == [f"F{i}" for i in range(21, 31)],
        "projection declares F21-F30",
    )
    require(
        list(expectations) == [f"F{i}" for i in range(21, 31)],
        "projection vector coverage F21-F30",
    )

    # F21 — certified source coordinates are referenced, not rewritten.
    f21 = expectations["F21"]
    require(registry["sourceFrame"]["frameId"] == f21["sourceFrameId"], "F21 source frame")
    require(
        registry["sourceFrame"]["sourceCoordinatesMutable"] is False,
        "F21 immutable source declaration",
    )
    require(source["frameId"] == f21["sourceFrameId"], "F21 live source registry")
    require(
        "coordinates" not in registry and "sourceCoordinates" not in registry,
        "F21 no duplicate source-coordinate registry",
    )
    original = [vertex["q"][:] for vertex in source["outerCube"]["vertices"]]
    _ = [model_transform(point, profile["model"]) for point in original]
    require(
        original == [vertex["q"] for vertex in source["outerCube"]["vertices"]],
        "F21 projection does not mutate source points",
    )

    # F22 — rigid model transport.
    f22 = expectations["F22"]
    rotation = f22["rotationMatrix"]
    for first_row in range(3):
        for second_row in range(3):
            observed = dot(rotation[first_row], rotation[second_row])
            expected = 1.0 if first_row == second_row else 0.0
            require(close(observed, expected, tolerance), "F22 orthonormal rotation")
    require(f22["scale"] > 0.0, "F22 positive common scale")
    points = [vertex["q"] for vertex in source["outerCube"]["vertices"]]
    moved = [model_transform(point, profile["model"]) for point in points]
    for (a, b), (ma, mb) in zip(
        itertools.combinations(points, 2), itertools.combinations(moved, 2)
    ):
        require(
            close(distance(ma, mb), f22["scale"] * distance(a, b), tolerance),
            "F22 pairwise rigid transport",
        )

    # F23 — explicit convention.
    f23 = expectations["F23"]
    conventions = registry["vectorConvention"]
    for key, expected in f23.items():
        require(conventions[key] == expected, f"F23 convention {key}")
    require(
        registry["modelTransform"]["anisotropicScaleAllowed"] is False,
        "F23 no anisotropic model scale",
    )

    # F24 — deterministic camera basis and view transform.
    f24 = expectations["F24"]
    right, up, forward = camera_basis(profile["camera"])
    require(close_vec(right, f24["referenceBasis"]["right"], tolerance), "F24 right basis")
    require(close_vec(up, f24["referenceBasis"]["up"], tolerance), "F24 up basis")
    require(
        close_vec(forward, f24["referenceBasis"]["forward"], tolerance),
        "F24 forward basis",
    )
    require(
        close_vec(
            view_transform([0.0, 0.0, 0.0], profile["camera"]),
            f24["referenceOriginView"],
            tolerance,
        ),
        "F24 origin view coordinate",
    )
    for invalid_camera in (
        {"eye": [0, 0, 0], "target": [0, 0, 0], "upReference": [0, 1, 0]},
        {"eye": [0, 0, 5], "target": [0, 0, 0], "upReference": [0, 0, -1]},
    ):
        try:
            camera_basis(invalid_camera)
        except AssertionError:
            pass
        else:
            raise AssertionError("F24 degenerate camera must fail closed")

    # F25 — deterministic perspective and viewport results.
    for sample in expectations["F25"]["samples"]:
        result = project(sample["q"], profile)
        require(close_vec(result["screen"], sample["screen"], tolerance), f"F25 screen {sample['id']}")
        require(close(result["viewDepth"], sample["viewDepth"], tolerance), f"F25 depth {sample['id']}")

    # F26 — fixed vertical FOV preserves equal x/y pixel scale.
    f26 = expectations["F26"]
    wide_profile = json.loads(json.dumps(profile))
    wide_profile["model"] = {
        "translation": [0.0, 0.0, 0.0],
        "scale": 1.0,
        "rotationOrder": [],
        "compositeMatrix": [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]],
    }
    wide_profile["viewport"]["width"] = f26["wideViewport"]["width"]
    wide_profile["viewport"]["height"] = f26["wideViewport"]["height"]
    center = project([0.0, 0.0, 0.0], wide_profile)["screen"]
    x_point = project(f26["equalPixelScaleCase"]["unitX"], wide_profile)["screen"]
    y_point = project(f26["equalPixelScaleCase"]["unitY"], wide_profile)["screen"]
    x_pixels = abs(x_point[0] - center[0])
    y_pixels = abs(y_point[1] - center[1])
    require(close(x_pixels, y_pixels, tolerance), "F26 equal pixel scale under aspect change")

    # F27 — canonical clip volume and near-plane crossing.
    f27 = expectations["F27"]["nearCrossingSegment"]
    identity_profile = json.loads(json.dumps(profile))
    identity_profile["model"] = {
        "translation": [0.0, 0.0, 0.0],
        "scale": 1.0,
        "rotationOrder": [],
        "compositeMatrix": [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]],
    }
    a_view = view_transform(f27["aWorld"], identity_profile["camera"])
    b_view = view_transform(f27["bWorld"], identity_profile["camera"])
    a_clip = perspective_clip(a_view, identity_profile["perspective"], identity_profile["viewport"])
    b_clip = perspective_clip(b_view, identity_profile["perspective"], identity_profile["viewport"])
    require(not inside_clip(a_clip, tolerance), "F27 near-outside endpoint")
    require(inside_clip(b_clip, tolerance), "F27 inside endpoint")
    near = identity_profile["perspective"]["near"]
    depth_a = -a_view[2]
    depth_b = -b_view[2]
    intersection_t = (near - depth_a) / (depth_b - depth_a)
    intersection = [
        f27["aWorld"][index]
        + intersection_t * (f27["bWorld"][index] - f27["aWorld"][index])
        for index in range(3)
    ]
    require(close(intersection_t, f27["expectedT"], tolerance), "F27 near intersection parameter")
    require(
        close_vec(intersection, f27["expectedNearIntersectionWorld"], tolerance),
        "F27 near intersection point",
    )
    intersection_clip = perspective_clip(
        view_transform(intersection, identity_profile["camera"]),
        identity_profile["perspective"],
        identity_profile["viewport"],
    )
    require(inside_clip(intersection_clip, tolerance), "F27 clipped intersection survives")

    # F28 — deterministic positive view-depth ordering.
    f28 = expectations["F28"]
    sample_by_id = {sample["id"]: sample for sample in expectations["F25"]["samples"]}
    require(close(sample_by_id[f28["nearer"]]["viewDepth"], f28["nearerDepth"], tolerance), "F28 nearer depth")
    require(close(sample_by_id[f28["farther"]]["viewDepth"], f28["fartherDepth"], tolerance), "F28 farther depth")
    require(0.0 < f28["nearerDepth"] < f28["fartherDepth"], "F28 smaller positive depth is nearer")

    # F29 — screen coincidence is not spatial or semantic identity.
    f29 = expectations["F29"]["identityCoincidence"]
    first = project(f29["first"], identity_profile)
    second = project(f29["second"], identity_profile)
    require(close_vec(first["screen"], f29["expectedScreen"], tolerance), "F29 first screen")
    require(close_vec(second["screen"], f29["expectedScreen"], tolerance), "F29 second screen")
    require(close(first["viewDepth"], f29["firstDepth"], tolerance), "F29 first depth")
    require(close(second["viewDepth"], f29["secondDepth"], tolerance), "F29 second depth")
    require(f29["first"] != f29["second"], "F29 distinct 3D points")
    require(f29["spatiallyIdentical"] is False, "F29 no spatial identity")
    require(f29["semanticRelationshipCreated"] is False, "F29 no semantic relation")
    require(f29["executableRelationCreated"] is False, "F29 no executable relation")

    # F30 — geometry-free operation and authority firewall.
    f30 = expectations["F30"]
    require(registry["authorityEffect"] == f30["authorityEffect"] == "none", "F30 authority effect")
    require(
        registry["geometryFreeEquivalentRequired"]
        is f30["geometryFreeEquivalentRequired"]
        is True,
        "F30 geometry-free equivalent",
    )
    require(
        set(f30["forbiddenAuthorityInputs"]).issubset(set(registry["forbiddenAuthorityInputs"])),
        "F30 forbidden authority inputs",
    )

    print("✅ CE-W02 projection verification passed: F21-F30")


if __name__ == "__main__":
    verify()
