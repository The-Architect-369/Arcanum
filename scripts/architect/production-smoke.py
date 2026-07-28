#!/usr/bin/env python3
"""Run bounded non-destructive smoke checks against an exact deployment."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, unquote, urljoin, urlparse
from urllib.request import HTTPRedirectHandler, Request, build_opener

ALLOWED_METHODS = {"GET", "HEAD"}
ALLOWED_TARGETS = {"production", "preview"}
REPOSITORY = "The-Architect-369/Arcanum"


def fail(message: str) -> None:
    print(f"FAIL {message}", file=sys.stderr)
    raise SystemExit(1)


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha256(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def load_json(path: Path, label: str) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"unable to read {label}: {exc}")
    if not isinstance(value, dict):
        fail(f"{label} must be a JSON object")
    return value


def git_head() -> str:
    return subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()


def validate_evidence(evidence: dict[str, Any]) -> dict[str, Any]:
    required = {"repository", "commit", "deployment"}
    missing = sorted(required - evidence.keys())
    if missing:
        fail(f"deployment evidence missing fields: {', '.join(missing)}")
    if evidence["repository"] != REPOSITORY:
        fail("deployment evidence repository mismatch")
    commit = evidence["commit"]
    if not isinstance(commit, str) or len(commit) != 40 or any(c not in "0123456789abcdef" for c in commit):
        fail("deployment evidence commit must be a lowercase 40-character SHA")
    if commit != git_head():
        fail("deployment evidence commit does not match exact HEAD")
    deployment = evidence["deployment"]
    if not isinstance(deployment, dict):
        fail("deployment evidence deployment must be an object")
    required_deployment = {"provider", "deployment_id", "state", "target", "commit", "url"}
    missing_deployment = sorted(required_deployment - deployment.keys())
    if missing_deployment:
        fail(f"deployment evidence deployment missing fields: {', '.join(missing_deployment)}")
    if deployment["provider"] != "vercel":
        fail("deployment provider must be vercel")
    if deployment["state"] != "READY":
        fail("deployment state must be READY")
    if deployment["target"] not in ALLOWED_TARGETS:
        fail("deployment target must be production or preview")
    if deployment["commit"] != commit:
        fail("deployment commit does not match evidence commit")
    if not isinstance(deployment["deployment_id"], str) or not deployment["deployment_id"]:
        fail("deployment ID must be non-empty")
    if not isinstance(deployment["url"], str) or not deployment["url"]:
        fail("deployment URL must be non-empty")
    return deployment


def validate_base_url(raw_url: str, allow_localhost: bool) -> str:
    url = raw_url if "://" in raw_url else f"https://{raw_url}"
    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    if parsed.path not in {"", "/"} or parsed.query or parsed.fragment:
        fail("deployment URL must contain only scheme and host")
    if allow_localhost and host in {"127.0.0.1", "localhost"}:
        if parsed.scheme != "http":
            fail("fixture localhost URL must use http")
    else:
        if parsed.scheme != "https":
            fail("deployment URL must use https")
        if not (host.endswith(".vercel.app") or host == "the-arcanum.net"):
            fail("deployment host is not allowlisted")
    if not host:
        fail("deployment URL host is missing")
    return url.rstrip("/")


def validate_manifest(manifest: dict[str, Any]) -> list[dict[str, Any]]:
    if manifest.get("schema_version") != "1.0" or manifest.get("record_type") != "production_smoke_route_manifest":
        fail("unsupported route manifest schema or record type")
    routes = manifest.get("routes")
    if not isinstance(routes, list) or not routes:
        fail("route manifest must contain at least one route")
    ids: set[str] = set()
    pairs: set[tuple[str, str]] = set()
    validated: list[dict[str, Any]] = []
    for index, item in enumerate(routes):
        if not isinstance(item, dict):
            fail(f"route {index} must be an object")
        required = {"id", "method", "path", "expected_status", "max_redirects", "timeout_ms", "required_text"}
        missing = sorted(required - item.keys())
        if missing:
            fail(f"route {index} missing fields: {', '.join(missing)}")
        route_id = item["id"]
        method = item["method"]
        path = item["path"]
        if not isinstance(route_id, str) or not route_id:
            fail(f"route {index} ID must be non-empty")
        if route_id in ids:
            fail(f"duplicate route ID: {route_id}")
        ids.add(route_id)
        if method not in ALLOWED_METHODS:
            fail(f"route {route_id} uses unsupported method: {method}")
        if not isinstance(path, str) or not path.startswith("/") or "://" in path or "#" in path:
            fail(f"route {route_id} has an unsafe path")
        pair = (method, path)
        if pair in pairs:
            fail(f"duplicate route method/path: {method} {path}")
        pairs.add(pair)
        expected = item["expected_status"]
        redirects = item["max_redirects"]
        timeout_ms = item["timeout_ms"]
        max_duration = item.get("max_duration_ms")
        markers = item["required_text"]
        if not isinstance(expected, int) or not 100 <= expected <= 599:
            fail(f"route {route_id} expected status is invalid")
        if not isinstance(redirects, int) or not 0 <= redirects <= 10:
            fail(f"route {route_id} max redirects is invalid")
        if not isinstance(timeout_ms, int) or not 100 <= timeout_ms <= 60000:
            fail(f"route {route_id} timeout is invalid")
        if max_duration is not None and (not isinstance(max_duration, int) or not 1 <= max_duration <= 120000):
            fail(f"route {route_id} max duration is invalid")
        if not isinstance(markers, list) or any(not isinstance(marker, str) for marker in markers):
            fail(f"route {route_id} required_text must be an array of strings")
        if method == "HEAD" and markers:
            fail(f"route {route_id} cannot require text markers for HEAD")
        validated.append(item)
    return validated


class BoundedRedirectHandler(HTTPRedirectHandler):
    def __init__(self, original_host: str, maximum: int) -> None:
        super().__init__()
        self.original_host = original_host
        self.maximum = maximum
        self.count = 0

    def redirect_request(self, req: Request, fp: Any, code: int, msg: str, headers: Any, newurl: str) -> Request | None:
        self.count += 1
        if self.count > self.maximum:
            raise HTTPError(newurl, code, "redirect limit exceeded", headers, fp)
        if (urlparse(newurl).hostname or "").lower() != self.original_host:
            raise HTTPError(newurl, code, "cross-host redirect rejected", headers, fp)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def preflight_provider_access(
    base_url: str,
    timeout_ms: int,
) -> dict[str, Any]:
    """Detect provider-level access controls before route verification."""

    request = Request(
        base_url + "/",
        method="HEAD",
        headers={"User-Agent": "ArchitectGPT-Production-Smoke/1.0"},
    )
    opener = build_opener(HTTPRedirectHandler())
    started = time.monotonic()

    try:
        with opener.open(request, timeout=timeout_ms / 1000) as response:
            final_url = response.geturl()
            observed_status = response.status
    except HTTPError as exc:
        final_url = exc.geturl()
        observed_status = exc.code
    except (URLError, TimeoutError, OSError) as exc:
        return {
            "status": "fail",
            "classification": "transport_error",
            "observed_status": None,
            "final_url": None,
            "duration_ms": round(
                (time.monotonic() - started) * 1000,
                3,
            ),
            "error": str(exc),
        }

    duration_ms = round(
        (time.monotonic() - started) * 1000,
        3,
    )
    original_host = (
        urlparse(base_url).hostname or ""
    ).lower()
    final_host = (
        urlparse(final_url).hostname or ""
    ).lower()

    final_parsed = urlparse(final_url)
    final_query = parse_qs(final_parsed.query)
    login_next = unquote(final_query.get("next", [""])[0])

    if (
        final_host == "vercel.com"
        and (
            final_parsed.path.startswith("/sso-api")
            or (
                final_parsed.path == "/login"
                and login_next.startswith("/sso-api")
            )
        )
    ):
        return {
            "status": "fail",
            "classification": "provider_access_protected",
            "observed_status": observed_status,
            "final_url": final_url,
            "duration_ms": duration_ms,
            "error": (
                "Vercel Deployment Protection prevents "
                "unauthenticated smoke verification"
            ),
        }

    if final_host != original_host:
        return {
            "status": "fail",
            "classification": "cross_host_redirect",
            "observed_status": observed_status,
            "final_url": final_url,
            "duration_ms": duration_ms,
            "error": "provider preflight crossed host boundary",
        }

    return {
        "status": "pass",
        "classification": "publicly_accessible",
        "observed_status": observed_status,
        "final_url": final_url,
        "duration_ms": duration_ms,
        "error": None,
    }


def check_route(base_url: str, route: dict[str, Any]) -> dict[str, Any]:
    target = urljoin(base_url + "/", route["path"].lstrip("/"))
    host = (urlparse(base_url).hostname or "").lower()
    redirect_handler = BoundedRedirectHandler(host, route["max_redirects"])
    opener = build_opener(redirect_handler)
    request = Request(target, method=route["method"], headers={"User-Agent": "ArchitectGPT-Production-Smoke/1.0"})
    started = time.monotonic()
    observed_status: int | None = None
    body = b""
    error: str | None = None
    try:
        with opener.open(request, timeout=route["timeout_ms"] / 1000) as response:
            observed_status = response.status
            if route["method"] == "GET":
                body = response.read(2_000_000)
    except HTTPError as exc:
        observed_status = exc.code
        error = str(exc.reason)
        try:
            body = exc.read(2_000_000)
        except Exception:
            body = b""
    except (URLError, TimeoutError, OSError) as exc:
        error = str(exc)
    duration_ms = round((time.monotonic() - started) * 1000, 3)
    decoded = body.decode("utf-8", errors="replace")
    markers = [{"text": marker, "present": marker in decoded} for marker in route["required_text"]]
    status_ok = observed_status == route["expected_status"]
    markers_ok = all(item["present"] for item in markers)
    duration_ok = route.get("max_duration_ms") is None or duration_ms <= route["max_duration_ms"]
    passed = status_ok and markers_ok and duration_ok and error is None
    return {
        "id": route["id"],
        "method": route["method"],
        "path": route["path"],
        "expected_status": route["expected_status"],
        "observed_status": observed_status,
        "redirect_count": redirect_handler.count,
        "duration_ms": duration_ms,
        "response_bytes": len(body),
        "markers": markers,
        "error": error,
        "status": "pass" if passed else "fail",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--deployment-evidence", type=Path, required=True)
    parser.add_argument(
        "--manifest",
        type=Path,
        default=Path("docs/governance/architectgpt/production-smoke-routes.json"),
    )
    parser.add_argument("--base-url")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--allow-localhost", action="store_true", help=argparse.SUPPRESS)
    args = parser.parse_args()

    evidence = load_json(args.deployment_evidence, "deployment evidence")
    deployment = validate_evidence(evidence)
    manifest = load_json(args.manifest, "route manifest")
    routes = validate_manifest(manifest)
    base_url = validate_base_url(args.base_url or deployment["url"], args.allow_localhost)
    evidence_url = validate_base_url(deployment["url"], args.allow_localhost)
    if base_url != evidence_url:
        fail("base URL does not match deployment evidence")

    manifest_digest = sha256(canonical_bytes(manifest))
    request_identity = {
        "repository": REPOSITORY,
        "commit": evidence["commit"],
        "deployment": deployment,
        "manifest_sha256": manifest_digest,
    }
    request_digest = sha256(canonical_bytes(request_identity))

    preflight = preflight_provider_access(
        base_url,
        min(route["timeout_ms"] for route in routes),
    )

    if preflight["status"] == "pass":
        results = [
            check_route(base_url, route)
            for route in routes
        ]
    else:
        results = []

    passed = sum(result["status"] == "pass" for result in results)
    failed = len(results) - passed
    report = {
        "schema_version": "1.0",
        "record_type": "production_smoke_attestation",
        "observed_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "repository": REPOSITORY,
        "commit": evidence["commit"],
        "deployment": deployment,
        "base_url": base_url,
        "manifest_sha256": manifest_digest,
        "request_sha256": request_digest,
        "preflight": preflight,
        "routes": results,
        "summary": {
            "total": len(results),
            "passed": passed,
            "failed": failed,
        },
        "status": (
            "pass"
            if preflight["status"] == "pass" and failed == 0
            else "fail"
        ),
    }
    rendered = json.dumps(report, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return (
        0
        if preflight["status"] == "pass" and failed == 0
        else 1
    )


if __name__ == "__main__":
    raise SystemExit(main())
