#!/usr/bin/env python3
"""CE-W04-A14.1 offline trusted-update preflight."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

MAX_MANIFEST_BYTES = 16 * 1024
MAX_AUXILIARY_INPUT_BYTES = 16 * 1024
MAX_APK_BYTES = 256 * 1024 * 1024

SCHEMA_VERSION = "1.0"
MANIFEST_TYPE = "arcanum-own-package-update"
APPLICATION_ID = "org.arcanum.nativehost"
REPOSITORY = "The-Architect-369/Arcanum"
PROMOTION_BRANCH = "main"
CHANNEL = "pre-genesis"

BROKER_CONTRACT = "arcanum-termux-broker/1.1"
OPERATOR_CONTRACT = "ce-w04-a13.5/five-op-v1"

NATIVE_OPERATIONS = [
    "probe_workspace",
    "pair_native_client",
    "start_broker",
    "stop_broker",
    "verify_workspace",
]

HEX64 = re.compile(r"^[0-9a-f]{64}$")
HEX40 = re.compile(r"^[0-9a-f]{40}$")


class PreflightError(ValueError):
    pass


def reject(message: str) -> None:
    raise PreflightError(message)


def no_duplicate_keys(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            reject(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        allow_nan=False,
    ).encode("utf-8")


def load_json(path: Path, *, manifest: bool = False) -> Any:
    limit = (
        MAX_MANIFEST_BYTES
        if manifest
        else MAX_AUXILIARY_INPUT_BYTES
    )

    with path.open("rb") as source:
        raw = source.read(limit + 1)

    if len(raw) > limit:
        if manifest:
            reject("manifest exceeds 16 KiB")
        reject(f"{path.name} exceeds 16 KiB")

    try:
        text = raw.decode("utf-8", errors="strict")
    except UnicodeDecodeError:
        reject(f"{path.name} is not valid UTF-8")

    try:
        value = json.loads(
            text,
            object_pairs_hook=no_duplicate_keys,
            parse_constant=lambda token: reject(
                f"forbidden JSON constant: {token}"
            ),
        )
        canonical = canonical_bytes(value)
    except PreflightError:
        raise
    except json.JSONDecodeError as exc:
        reject(f"{path.name} malformed JSON: {exc.msg}")
    except (ValueError, OverflowError, RecursionError):
        reject(f"{path.name} malformed JSON")

    if raw != canonical:
        reject(f"{path.name} is not canonical JSON")

    return value


def closed_object(
    value: Any,
    label: str,
    expected: set[str],
) -> dict[str, Any]:
    if not isinstance(value, dict):
        reject(f"{label} must be an object")

    actual = set(value)

    unknown = actual - expected
    missing = expected - actual

    if unknown:
        reject(f"{label} contains unknown fields: {sorted(unknown)}")

    if missing:
        reject(f"{label} is missing fields: {sorted(missing)}")

    return value


def nonempty_string(
    value: Any,
    label: str,
    *,
    maximum: int | None = None,
) -> str:
    if not isinstance(value, str) or not value:
        reject(f"{label} must be a non-empty string")
    if maximum is not None and len(value) > maximum:
        reject(f"{label} exceeds {maximum} characters")
    return value


def positive_int(value: Any, label: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        reject(f"{label} must be a positive integer")
    return value


def lowercase_hex(
    value: Any,
    pattern: re.Pattern[str],
    label: str,
) -> str:
    value = nonempty_string(value, label)

    if pattern.fullmatch(value) is None:
        reject(f"{label} has invalid hexadecimal form")

    return value


def sorted_unique_strings(
    value: Any,
    label: str,
    *,
    maximum: int,
    empty_ok: bool = True,
) -> list[str]:
    if not isinstance(value, list):
        reject(f"{label} must be an array")

    if len(value) > maximum:
        reject(f"{label} exceeds {maximum} entries")

    if not empty_ok and not value:
        reject(f"{label} must not be empty")

    items = [
        nonempty_string(
            item,
            f"{label}[]",
            maximum=256,
        )
        for item in value
    ]

    if items != sorted(set(items)):
        reject(f"{label} must be sorted and unique")

    return items


def parse_manifest(value: Any) -> dict[str, Any]:
    root = closed_object(
        value,
        "manifest",
        {
            "schemaVersion",
            "manifestType",
            "package",
            "artifact",
            "build",
            "compatibility",
        },
    )

    if root["schemaVersion"] != SCHEMA_VERSION:
        reject("unsupported schemaVersion")

    if root["manifestType"] != MANIFEST_TYPE:
        reject("unexpected manifestType")

    package = closed_object(
        root["package"],
        "package",
        {"applicationId", "versionCode", "versionName"},
    )

    if package["applicationId"] != APPLICATION_ID:
        reject("wrong package identity")

    positive_int(package["versionCode"], "versionCode")
    nonempty_string(
        package["versionName"],
        "versionName",
        maximum=256,
    )

    artifact = closed_object(
        root["artifact"],
        "artifact",
        {"sha256", "sizeBytes", "publisherSignerSha256"},
    )

    lowercase_hex(
        artifact["sha256"],
        HEX64,
        "artifact.sha256",
    )

    if positive_int(
        artifact["sizeBytes"],
        "artifact.sizeBytes",
    ) > MAX_APK_BYTES:
        reject("candidate APK exceeds 256 MiB")

    lowercase_hex(
        artifact["publisherSignerSha256"],
        HEX64,
        "publisher signer",
    )

    build = closed_object(
        root["build"],
        "build",
        {
            "repository",
            "sourceCommit",
            "promotionBranch",
            "promotionCommit",
            "channel",
        },
    )

    if build["repository"] != REPOSITORY:
        reject("wrong repository")

    if build["promotionBranch"] != PROMOTION_BRANCH:
        reject("wrong promotion branch")

    if build["channel"] != CHANNEL:
        reject("wrong update channel")

    lowercase_hex(
        build["sourceCommit"],
        HEX40,
        "sourceCommit",
    )

    lowercase_hex(
        build["promotionCommit"],
        HEX40,
        "promotionCommit",
    )

    compatibility = closed_object(
        root["compatibility"],
        "compatibility",
        {
            "minSdk",
            "targetSdk",
            "abis",
            "dataContracts",
            "companion",
        },
    )

    positive_int(
        compatibility["minSdk"],
        "minSdk",
    )

    positive_int(
        compatibility["targetSdk"],
        "targetSdk",
    )

    sorted_unique_strings(
        compatibility["abis"],
        "abis",
        maximum=8,
        empty_ok=False,
    )

    sorted_unique_strings(
        compatibility["dataContracts"],
        "dataContracts",
        maximum=32,
    )

    companion = closed_object(
        compatibility["companion"],
        "companion",
        {
            "brokerContract",
            "operatorContract",
            "nativeOperations",
        },
    )

    if companion["brokerContract"] != BROKER_CONTRACT:
        reject("broker contract mismatch")

    if companion["operatorContract"] != OPERATOR_CONTRACT:
        reject("operator contract mismatch")

    if companion["nativeOperations"] != NATIVE_OPERATIONS:
        reject("native operation registry mismatch")

    return root


def parse_trust_context(value: Any) -> dict[str, Any]:
    root = closed_object(
        value,
        "trustContext",
        {
            "installedApplicationId",
            "installedVersionCode",
            "installedPublisherSignerSha256",
            "approvedRotatedPublisherSignerSha256",
            "revokedPublisherSignerSha256",
            "requiredMinTargetSdk",
            "deviceAndroidApi",
            "deviceAbis",
            "currentDataContracts",
        },
    )

    if root["installedApplicationId"] != APPLICATION_ID:
        reject("installed application identity mismatch")

    positive_int(
        root["installedVersionCode"],
        "installedVersionCode",
    )

    lowercase_hex(
        root["installedPublisherSignerSha256"],
        HEX64,
        "installed publisher signer",
    )

    for field in (
        "approvedRotatedPublisherSignerSha256",
        "revokedPublisherSignerSha256",
    ):
        values = sorted_unique_strings(
            root[field],
            field,
            maximum=32,
        )

        for digest in values:
            lowercase_hex(
                digest,
                HEX64,
                field,
            )

    positive_int(
        root["requiredMinTargetSdk"],
        "requiredMinTargetSdk",
    )

    positive_int(
        root["deviceAndroidApi"],
        "deviceAndroidApi",
    )

    sorted_unique_strings(
        root["deviceAbis"],
        "deviceAbis",
        maximum=8,
        empty_ok=False,
    )

    sorted_unique_strings(
        root["currentDataContracts"],
        "currentDataContracts",
        maximum=32,
    )

    return root


def parse_observation(value: Any) -> dict[str, Any]:
    root = closed_object(
        value,
        "candidateObservation",
        {
            "applicationId",
            "versionCode",
            "versionName",
            "artifactSha256",
            "artifactSizeBytes",
            "publisherSignerSha256",
            "minSdk",
            "targetSdk",
            "abis",
        },
    )

    nonempty_string(
        root["applicationId"],
        "observed applicationId",
    )

    positive_int(
        root["versionCode"],
        "observed versionCode",
    )

    nonempty_string(
        root["versionName"],
        "observed versionName",
    )

    lowercase_hex(
        root["artifactSha256"],
        HEX64,
        "observed artifactSha256",
    )

    if positive_int(
        root["artifactSizeBytes"],
        "observed artifactSizeBytes",
    ) > MAX_APK_BYTES:
        reject("observed APK exceeds 256 MiB")

    lowercase_hex(
        root["publisherSignerSha256"],
        HEX64,
        "observed publisher signer",
    )

    positive_int(
        root["minSdk"],
        "observed minSdk",
    )

    positive_int(
        root["targetSdk"],
        "observed targetSdk",
    )

    sorted_unique_strings(
        root["abis"],
        "observed abis",
        maximum=8,
        empty_ok=False,
    )

    return root


def inspect(
    manifest_path: Path,
    trust_context_path: Path,
    observation_path: Path,
) -> dict[str, Any]:
    manifest = parse_manifest(
        load_json(
            manifest_path,
            manifest=True,
        )
    )

    trust = parse_trust_context(
        load_json(trust_context_path)
    )

    observed = parse_observation(
        load_json(observation_path)
    )

    package = manifest["package"]
    artifact = manifest["artifact"]
    build = manifest["build"]
    compatibility = manifest["compatibility"]

    comparisons = (
        (
            package["applicationId"]
            == observed["applicationId"],
            "observed package mismatch",
        ),
        (
            package["versionCode"]
            == observed["versionCode"],
            "observed versionCode mismatch",
        ),
        (
            package["versionName"]
            == observed["versionName"],
            "observed versionName mismatch",
        ),
        (
            artifact["sha256"]
            == observed["artifactSha256"],
            "observed digest mismatch",
        ),
        (
            artifact["sizeBytes"]
            == observed["artifactSizeBytes"],
            "observed size mismatch",
        ),
        (
            artifact["publisherSignerSha256"]
            == observed["publisherSignerSha256"],
            "observed signer mismatch",
        ),
        (
            compatibility["minSdk"]
            == observed["minSdk"],
            "observed minSdk mismatch",
        ),
        (
            compatibility["targetSdk"]
            == observed["targetSdk"],
            "observed targetSdk mismatch",
        ),
        (
            compatibility["abis"]
            == observed["abis"],
            "observed ABI mismatch",
        ),
    )

    for ok, reason in comparisons:
        if not ok:
            reject(reason)

    if package["versionCode"] <= trust["installedVersionCode"]:
        reject("candidate does not advance installed version")

    signer = artifact["publisherSignerSha256"]

    revoked = set(
        trust["revokedPublisherSignerSha256"]
    )

    allowed = {
        trust["installedPublisherSignerSha256"]
    } | set(
        trust["approvedRotatedPublisherSignerSha256"]
    )

    if signer in revoked:
        reject("publisher signer is revoked")

    if signer not in allowed:
        reject("publisher signer is not trusted")

    if (
        compatibility["minSdk"]
        > trust["deviceAndroidApi"]
    ):
        reject("candidate minSdk exceeds device API")

    if (
        compatibility["targetSdk"]
        < trust["requiredMinTargetSdk"]
    ):
        reject("candidate targetSdk below local requirement")

    if not (
        set(compatibility["abis"])
        & set(trust["deviceAbis"])
    ):
        reject("candidate has no compatible ABI")

    if not set(
        trust["currentDataContracts"]
    ).issubset(
        compatibility["dataContracts"]
    ):
        reject("candidate drops a current data contract")

    return {
        "schemaVersion": SCHEMA_VERSION,
        "decision": "pass",
        "applicationId": APPLICATION_ID,
        "candidateVersionCode": package["versionCode"],
        "candidateVersionName": package["versionName"],
        "artifactSha256": artifact["sha256"],
        "publisherSignerSha256": signer,
        "sourceCommit": build["sourceCommit"],
        "promotionCommit": build["promotionCommit"],
        "channel": CHANNEL,
        "readyForTrustedDistributionInspection": True,
        "eligibleForInstallDecision": False,
        "installPerformed": False,
        "repositoryMutation": False,
        "networkUsed": False,
        "networkRequired": False,
        "redirectPolicy": "deny",
        "cacheMaxAgeSeconds": 0,
        "authorityEffect": "none",
        "promotionEvidence": "manifest-bound-offline-stage1",
    }


def main() -> int:
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--manifest",
        type=Path,
        required=True,
    )

    parser.add_argument(
        "--trust-context",
        type=Path,
        required=True,
    )

    parser.add_argument(
        "--observation",
        type=Path,
        required=True,
    )

    args = parser.parse_args()

    try:
        receipt = inspect(
            args.manifest,
            args.trust_context,
            args.observation,
        )
    except (OSError, PreflightError) as exc:
        print(
            json.dumps(
                {
                    "decision": "reject",
                    "reason": str(exc),
                },
                sort_keys=True,
                separators=(",", ":"),
            )
        )
        return 1

    print(
        json.dumps(
            receipt,
            sort_keys=True,
            separators=(",", ":"),
        )
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
