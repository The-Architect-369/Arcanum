#!/usr/bin/env python3
"""Local falsification tests for the A14.2 distribution inspector."""

from __future__ import annotations

import copy
import hashlib
import io
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts/update"))
import trusted_distribution_inspection as distribution  # noqa: E402

FIX = ROOT / "tests/fixtures/trusted-update"
MANIFEST_URL = "https://updates.the-arcanum.net/v1/manifest.json"
APK_URL = "https://updates.the-arcanum.net/v1/candidate.apk"


class Response(io.BytesIO):
    status = 200

    def __init__(self, url, body, headers=None):
        super().__init__(body)
        self.url = url
        self.headers = headers or {"Cache-Control": "no-store"}

    def geturl(self):
        return self.url


class Opener:
    def __init__(self, bodies, headers=None):
        self.bodies = bodies
        self.headers = headers

    def open(self, request, timeout):
        return Response(request.full_url, self.bodies[request.full_url], self.headers)


class DistributionTests(unittest.TestCase):
    def setUp(self):
        self.apk = b"APK test bytes only"
        manifest = copy.deepcopy(json.loads((FIX / "valid.json").read_text()))
        manifest["artifact"]["sha256"] = hashlib.sha256(self.apk).hexdigest()
        manifest["artifact"]["sizeBytes"] = len(self.apk)
        self.manifest = json.dumps(
            manifest, sort_keys=True, separators=(",", ":")
        ).encode()
        self.observation = json.loads(
            (FIX / "candidate-observation.json").read_text()
        )
        self.observation["artifactSha256"] = manifest["artifact"]["sha256"]
        self.observation["artifactSizeBytes"] = manifest["artifact"]["sizeBytes"]
        self.bodies = {MANIFEST_URL: self.manifest, APK_URL: self.apk}

    def inspect(self, bodies=None, headers=None):
        with tempfile.TemporaryDirectory() as directory:
            observation = Path(directory) / "observation.json"
            observation.write_text(
                json.dumps(self.observation, sort_keys=True, separators=(",", ":"))
            )
            with patch.object(distribution, "verify_apk_signer") as signer:
                receipt = distribution.inspect_distribution(
                    MANIFEST_URL,
                    APK_URL,
                    FIX / "trust-context.json",
                    observation,
                    Opener(bodies or self.bodies, headers),
                )
                signer.assert_called_once()
                return receipt

    def test_valid_bounded_receipt(self):
        result = self.inspect()
        self.assertTrue(result["apkSignatureVerified"])
        self.assertTrue(result["networkUsed"])
        self.assertFalse(result["eligibleForInstallDecision"])
        self.assertFalse(result["installPerformed"])
        self.assertEqual(result["authorityEffect"], "none")

    def test_external_origin_and_url_tricks_rejected(self):
        for url in (
            "http://updates.the-arcanum.net/x",
            "https://updates.the-arcanum.net.evil.test/x",
            "https://user@updates.the-arcanum.net/x",
            "https://updates.the-arcanum.net/x?q=1",
        ):
            with self.subTest(url=url), self.assertRaises(distribution.PreflightError):
                distribution.checked_url(url)

    def test_digest_mismatch_rejected(self):
        bodies = {**self.bodies, APK_URL: b"different APK"}
        with self.assertRaisesRegex(distribution.PreflightError, "differs"):
            self.inspect(bodies)

    def test_cache_policy_rejected(self):
        with self.assertRaisesRegex(distribution.PreflightError, "cache policy"):
            self.inspect(headers={"Cache-Control": "max-age=3600"})

    def test_redirect_handler_fails_closed(self):
        with self.assertRaisesRegex(distribution.PreflightError, "redirect denied"):
            distribution.NoRedirect().redirect_request(None, None, 302, "", {}, APK_URL)

    def test_response_size_limit(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaisesRegex(distribution.PreflightError, "size limit"):
                distribution.fetch(
                    APK_URL, 4, Path(directory) / "apk", Opener({APK_URL: b"12345"})
                )

    def test_signer_tool_unavailable_fails_closed(self):
        with patch.object(distribution.subprocess, "run", side_effect=FileNotFoundError):
            with self.assertRaisesRegex(distribution.PreflightError, "unavailable"):
                distribution.verify_apk_signer(Path("candidate.apk"), "a" * 64)

    def test_verified_signer_must_match(self):
        result = subprocess.CompletedProcess(
            [], 0, "Signer #1 certificate SHA-256 digest: " + "b" * 64, ""
        )
        with patch.object(distribution.subprocess, "run", return_value=result):
            with self.assertRaisesRegex(distribution.PreflightError, "signer differs"):
                distribution.verify_apk_signer(Path("candidate.apk"), "a" * 64)
            distribution.verify_apk_signer(Path("candidate.apk"), "b" * 64)

    def test_apk_signature_failure_rejected(self):
        result = subprocess.CompletedProcess([], 1, "", "failed")
        with patch.object(distribution.subprocess, "run", return_value=result):
            with self.assertRaisesRegex(distribution.PreflightError, "verification failed"):
                distribution.verify_apk_signer(Path("candidate.apk"), "a" * 64)


if __name__ == "__main__":
    unittest.main()
