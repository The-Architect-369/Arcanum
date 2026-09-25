#!/usr/bin/env python3

from __future__ import annotations

import copy
import importlib.util
import io
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FIX = ROOT / "tests/fixtures/trusted-update"

spec = importlib.util.spec_from_file_location(
    "trusted_update_preflight",
    ROOT / "scripts/update/trusted_update_preflight.py",
)
assert spec is not None
assert spec.loader is not None

preflight = importlib.util.module_from_spec(spec)
spec.loader.exec_module(preflight)


def fixture(name: str) -> Path:
    return FIX / name


def load(name: str):
    return json.loads(
        fixture(name).read_text(encoding="utf-8")
    )


def canonical(value) -> bytes:
    return json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")


def inspect_values(
    manifest=None,
    trust=None,
    observation=None,
):
    manifest = (
        copy.deepcopy(manifest)
        if manifest is not None
        else load("valid.json")
    )
    trust = (
        copy.deepcopy(trust)
        if trust is not None
        else load("trust-context.json")
    )
    observation = (
        copy.deepcopy(observation)
        if observation is not None
        else load("candidate-observation.json")
    )

    with tempfile.TemporaryDirectory() as td:
        root = Path(td)

        paths = {
            "manifest": root / "manifest.json",
            "trust": root / "trust.json",
            "observation": root / "observation.json",
        }

        paths["manifest"].write_bytes(
            canonical(manifest)
        )
        paths["trust"].write_bytes(
            canonical(trust)
        )
        paths["observation"].write_bytes(
            canonical(observation)
        )

        return preflight.inspect(
            paths["manifest"],
            paths["trust"],
            paths["observation"],
        )


class TrustedUpdatePreflightTests(unittest.TestCase):

    def test_01_valid_receipt(self):
        result = preflight.inspect(
            fixture("valid.json"),
            fixture("trust-context.json"),
            fixture("candidate-observation.json"),
        )

        self.assertEqual(result["decision"], "pass")
        self.assertTrue(
            result["readyForTrustedDistributionInspection"]
        )
        self.assertFalse(
            result["eligibleForInstallDecision"]
        )
        self.assertFalse(result["installPerformed"])
        self.assertFalse(result["repositoryMutation"])
        self.assertFalse(result["networkUsed"])
        self.assertFalse(result["networkRequired"])
        self.assertEqual(
            result["redirectPolicy"],
            "deny",
        )
        self.assertEqual(
            result["cacheMaxAgeSeconds"],
            0,
        )
        self.assertEqual(
            result["authorityEffect"],
            "none",
        )

    def test_02_wrong_package_fixture(self):
        with self.assertRaises(
            preflight.PreflightError
        ):
            preflight.inspect(
                fixture("wrong-package.json"),
                fixture("trust-context.json"),
                fixture("candidate-observation.json"),
            )

    def test_03_untrusted_signer_fixture(self):
        with self.assertRaises(
            preflight.PreflightError
        ):
            preflight.inspect(
                fixture("untrusted-signer.json"),
                fixture("trust-context.json"),
                fixture(
                    "untrusted-signer-observation.json"
                ),
            )

    def test_04_downgrade_fixture(self):
        with self.assertRaises(
            preflight.PreflightError
        ):
            preflight.inspect(
                fixture("downgrade.json"),
                fixture("trust-context.json"),
                fixture("downgrade-observation.json"),
            )

    def test_05_runtime_incompatible_fixture(self):
        with self.assertRaises(
            preflight.PreflightError
        ):
            preflight.inspect(
                fixture("runtime-incompatible.json"),
                fixture("trust-context.json"),
                fixture("candidate-observation.json"),
            )

    def test_06_unknown_field_fixture(self):
        with self.assertRaises(
            preflight.PreflightError
        ):
            preflight.inspect(
                fixture("unknown-field.json"),
                fixture("trust-context.json"),
                fixture("candidate-observation.json"),
            )

    def test_07_wrong_digest_observation(self):
        with self.assertRaises(
            preflight.PreflightError
        ):
            preflight.inspect(
                fixture("valid.json"),
                fixture("trust-context.json"),
                fixture(
                    "wrong-digest-observation.json"
                ),
            )

    def test_08_approved_signer_rotation(self):
        manifest = load("valid.json")
        trust = load("trust-context.json")
        observation = load(
            "candidate-observation.json"
        )

        rotated = "55" * 32

        manifest["artifact"][
            "publisherSignerSha256"
        ] = rotated

        observation[
            "publisherSignerSha256"
        ] = rotated

        trust[
            "approvedRotatedPublisherSignerSha256"
        ] = [rotated]

        result = inspect_values(
            manifest,
            trust,
            observation,
        )

        self.assertEqual(
            result["publisherSignerSha256"],
            rotated,
        )

    def test_09_revocation_overrides_rotation(self):
        manifest = load("valid.json")
        trust = load("trust-context.json")
        observation = load(
            "candidate-observation.json"
        )

        rotated = "55" * 32

        manifest["artifact"][
            "publisherSignerSha256"
        ] = rotated

        observation[
            "publisherSignerSha256"
        ] = rotated

        trust[
            "approvedRotatedPublisherSignerSha256"
        ] = [rotated]

        trust[
            "revokedPublisherSignerSha256"
        ] = [rotated]

        with self.assertRaises(
            preflight.PreflightError
        ):
            inspect_values(
                manifest,
                trust,
                observation,
            )

    def test_10_wrong_channel(self):
        manifest = load("valid.json")
        manifest["build"]["channel"] = "canary"

        with self.assertRaises(
            preflight.PreflightError
        ):
            inspect_values(manifest=manifest)

    def test_11_target_sdk_below_local_policy(self):
        manifest = load("valid.json")
        observation = load(
            "candidate-observation.json"
        )

        manifest["compatibility"][
            "targetSdk"
        ] = 34

        observation["targetSdk"] = 34

        with self.assertRaises(
            preflight.PreflightError
        ):
            inspect_values(
                manifest=manifest,
                observation=observation,
            )

    def test_12_no_device_abi_overlap(self):
        manifest = load("valid.json")
        observation = load(
            "candidate-observation.json"
        )

        manifest["compatibility"]["abis"] = [
            "x86_64"
        ]
        observation["abis"] = ["x86_64"]

        with self.assertRaises(
            preflight.PreflightError
        ):
            inspect_values(
                manifest=manifest,
                observation=observation,
            )

    def test_13_durable_data_contract_removed(self):
        manifest = load("valid.json")

        manifest["compatibility"][
            "dataContracts"
        ] = [
            "tempus-anchor/0.1.0"
        ]

        with self.assertRaises(
            preflight.PreflightError
        ):
            inspect_values(manifest=manifest)

    def test_14_duplicate_json_key_rejected(self):
        raw = fixture("valid.json").read_bytes()

        duplicate = (
            raw[:-1]
            + b',"schemaVersion":"1.0"}'
        )

        with tempfile.TemporaryDirectory() as td:
            path = Path(td) / "manifest.json"
            path.write_bytes(duplicate)

            with self.assertRaises(
                preflight.PreflightError
            ):
                preflight.inspect(
                    path,
                    fixture("trust-context.json"),
                    fixture(
                        "candidate-observation.json"
                    ),
                )

    def test_15_noncanonical_json_rejected(self):
        value = load("valid.json")

        with tempfile.TemporaryDirectory() as td:
            path = Path(td) / "manifest.json"

            path.write_text(
                json.dumps(value, indent=2),
                encoding="utf-8",
            )

            with self.assertRaises(
                preflight.PreflightError
            ):
                preflight.inspect(
                    path,
                    fixture("trust-context.json"),
                    fixture(
                        "candidate-observation.json"
                    ),
                )

    def test_16_malformed_json_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            path = Path(td) / "manifest.json"
            path.write_bytes(b'{"schemaVersion":')

            with self.assertRaises(
                preflight.PreflightError
            ):
                preflight.inspect(
                    path,
                    fixture("trust-context.json"),
                    fixture(
                        "candidate-observation.json"
                    ),
                )

    def test_17_invalid_utf8_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            path = Path(td) / "manifest.json"
            path.write_bytes(b"\xff")

            with self.assertRaises(
                preflight.PreflightError
            ):
                preflight.inspect(
                    path,
                    fixture("trust-context.json"),
                    fixture(
                        "candidate-observation.json"
                    ),
                )

    def test_18_oversized_manifest_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            path = Path(td) / "manifest.json"

            path.write_bytes(
                b" " * (
                    preflight.MAX_MANIFEST_BYTES
                    + 1
                )
            )

            with self.assertRaises(
                preflight.PreflightError
            ):
                preflight.inspect(
                    path,
                    fixture("trust-context.json"),
                    fixture(
                        "candidate-observation.json"
                    ),
                )


    def test_19_oversized_trust_context_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            path = Path(td) / "trust.json"
            path.write_bytes(
                b" " * (
                    preflight.MAX_AUXILIARY_INPUT_BYTES
                    + 1
                )
            )

            with self.assertRaisesRegex(
                preflight.PreflightError,
                "trust.json exceeds 16 KiB",
            ):
                preflight.inspect(
                    fixture("valid.json"),
                    path,
                    fixture("candidate-observation.json"),
                )

    def test_20_oversized_observation_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            path = Path(td) / "observation.json"
            path.write_bytes(
                b" " * (
                    preflight.MAX_AUXILIARY_INPUT_BYTES
                    + 1
                )
            )

            with self.assertRaisesRegex(
                preflight.PreflightError,
                "observation.json exceeds 16 KiB",
            ):
                preflight.inspect(
                    fixture("valid.json"),
                    fixture("trust-context.json"),
                    path,
                )

    def test_21_reads_stop_after_limit_plus_one(self):
        class GuardedStream(io.BytesIO):
            def __init__(self, data, limit):
                super().__init__(data)
                self.limit = limit
                self.read_sizes = []

            def read(self, size=-1):
                self.read_sizes.append(size)
                if size < 0 or size > self.limit + 1:
                    raise AssertionError("unbounded input read")
                return super().read(size)

        class GuardedPath:
            name = "oversized.json"

            def __init__(self, limit):
                self.stream = GuardedStream(
                    b" " * (limit + 100),
                    limit,
                )

            def open(self, mode):
                self.assert_mode(mode)
                return self.stream

            @staticmethod
            def assert_mode(mode):
                if mode != "rb":
                    raise AssertionError("input is not read as bytes")

        for manifest, limit in (
            (True, preflight.MAX_MANIFEST_BYTES),
            (False, preflight.MAX_AUXILIARY_INPUT_BYTES),
        ):
            with self.subTest(manifest=manifest):
                path = GuardedPath(limit)

                with self.assertRaises(
                    preflight.PreflightError
                ):
                    preflight.load_json(
                        path,
                        manifest=manifest,
                    )

                self.assertEqual(
                    path.stream.read_sizes,
                    [limit + 1],
                )


if __name__ == "__main__":
    unittest.main()
