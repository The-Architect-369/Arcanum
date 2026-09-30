#!/usr/bin/env python3
"""A14.2 read-only inspection of an exact public update artifact."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from trusted_update_preflight import (
    MAX_APK_BYTES,
    MAX_MANIFEST_BYTES,
    PreflightError,
    inspect as offline_inspect,
    load_json,
)

ORIGIN = "updates.the-arcanum.net"
CHUNK = 64 * 1024


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, newurl):
        raise PreflightError("redirect denied")


def checked_url(value: str) -> str:
    parsed = urllib.parse.urlsplit(value)
    if (
        parsed.scheme != "https"
        or parsed.hostname != ORIGIN
        or parsed.port not in (None, 443)
        or parsed.username is not None
        or parsed.password is not None
        or not parsed.path.startswith("/")
        or parsed.path == "/"
        or parsed.query
        or parsed.fragment
    ):
        raise PreflightError("URL is outside the fixed HTTPS update origin")
    return value


def fetch(url: str, limit: int, destination: Path, opener=None) -> tuple[int, str]:
    checked_url(url)
    opener = opener or urllib.request.build_opener(NoRedirect)
    request = urllib.request.Request(
        url,
        headers={"Accept-Encoding": "identity", "Cache-Control": "no-cache"},
        method="GET",
    )
    try:
        with opener.open(request, timeout=30) as response:
            if response.status != 200 or response.geturl() != url:
                raise PreflightError("distribution response is not direct HTTP 200")
            if response.headers.get("Content-Encoding", "identity").lower() != "identity":
                raise PreflightError("encoded distribution response denied")
            cache = response.headers.get("Cache-Control", "").lower()
            if "no-store" not in cache and "max-age=0" not in cache:
                raise PreflightError("distribution response lacks zero-age cache policy")
            digest = hashlib.sha256()
            size = 0
            with destination.open("wb") as output:
                while True:
                    part = response.read(min(CHUNK, limit + 1 - size))
                    if not part:
                        break
                    size += len(part)
                    if size > limit:
                        raise PreflightError("distribution response exceeds size limit")
                    digest.update(part)
                    output.write(part)
            return size, digest.hexdigest()
    except (urllib.error.URLError, TimeoutError) as exc:
        raise PreflightError(f"distribution request failed: {exc.reason if hasattr(exc, 'reason') else exc}") from exc


def verify_apk_signer(apk_path: Path, expected: str) -> None:
    try:
        result = subprocess.run(
            ["apksigner", "verify", "--print-certs", str(apk_path)],
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired) as exc:
        raise PreflightError("apksigner verification unavailable") from exc
    if result.returncode != 0:
        raise PreflightError("APK signature verification failed")
    digests = re.findall(
        r"Signer #\d+ certificate SHA-256 digest: ([0-9a-fA-F]{64})",
        result.stdout,
    )
    if len(digests) != 1 or digests[0].lower() != expected:
        raise PreflightError("APK signer differs from trusted manifest signer")


def inspect_distribution(
    manifest_url: str,
    apk_url: str,
    trust_context: Path,
    observation: Path,
    opener=None,
) -> dict:
    checked_url(manifest_url)
    checked_url(apk_url)
    if manifest_url == apk_url:
        raise PreflightError("manifest and APK URLs must differ")
    with tempfile.TemporaryDirectory(prefix="arcanum-a14-2-") as directory:
        manifest_path = Path(directory) / "manifest.json"
        _, manifest_digest = fetch(
            manifest_url, MAX_MANIFEST_BYTES, manifest_path, opener
        )
        stage1 = offline_inspect(manifest_path, trust_context, observation)
        manifest = load_json(manifest_path, manifest=True)
        artifact = manifest["artifact"]
        apk_path = Path(directory) / "candidate.apk"
        apk_size, apk_digest = fetch(apk_url, MAX_APK_BYTES, apk_path, opener)
        if apk_size != artifact["sizeBytes"] or apk_digest != artifact["sha256"]:
            raise PreflightError("distributed APK differs from manifest artifact")
        verify_apk_signer(apk_path, artifact["publisherSignerSha256"])
    return {
        "stage": "CE-W04-A14.2",
        "decision": "pass",
        "manifestUrl": manifest_url,
        "manifestSha256": manifest_digest,
        "apkUrl": apk_url,
        "apkSha256": apk_digest,
        "apkSizeBytes": apk_size,
        "sourceCommit": stage1["sourceCommit"],
        "promotionCommit": stage1["promotionCommit"],
        "publisherSignerSha256": stage1["publisherSignerSha256"],
        "apkSignatureVerified": True,
        "readyForA15Review": True,
        "eligibleForInstallDecision": False,
        "installPerformed": False,
        "repositoryMutation": False,
        "networkUsed": True,
        "authorityEffect": "none",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest-url", required=True)
    parser.add_argument("--apk-url", required=True)
    parser.add_argument("--trust-context", required=True, type=Path)
    parser.add_argument("--observation", required=True, type=Path)
    args = parser.parse_args()
    try:
        receipt = inspect_distribution(
            args.manifest_url, args.apk_url, args.trust_context, args.observation
        )
    except (OSError, PreflightError, ValueError) as exc:
        print(json.dumps({"decision": "reject", "reason": str(exc)}, sort_keys=True))
        return 1
    print(json.dumps(receipt, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
