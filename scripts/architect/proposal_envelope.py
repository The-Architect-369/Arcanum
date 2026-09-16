#!/usr/bin/env python3
"""CE-W04-A12 deterministic Architect proposal envelope.

This module only reads committed Git objects and writes JSON to stdout. It never
applies a patch, writes repository files, stages changes, updates refs, or runs
arbitrary shell text.
"""

from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import os
import re
import subprocess
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any

PROPOSAL_SCHEMA_VERSION = "1.0"
ENVELOPE_TYPE = "architect_proposal"
DIFF_FORMAT = "arcanum-unified-text-diff-v1"
DIGEST_DOMAIN = "ARCANUM-A12-PROPOSAL-V1"
DEFAULT_REPOSITORY_ID = "The-Architect-369/Arcanum"
DENIED_PATHS = {"docs/repo/repo-index.json"}
MAX_PATHS = 32
MAX_PATH_LENGTH = 240
MAX_DIFF_BYTES = 192 * 1024
SHA40_RE = re.compile(r"^[0-9a-f]{40}$")
SHA64_RE = re.compile(r"^[0-9a-f]{64}$")
HUNK_RE = re.compile(r"^@@ -([0-9]+),([0-9]+) \+([0-9]+),([0-9]+) @@\n$")


class EnvelopeError(ValueError):
    def __init__(self, code: str, detail: str) -> None:
        super().__init__(detail)
        self.code = code
        self.detail = detail


@dataclass(frozen=True)
class DiffSection:
    path: str
    operation: str
    old_header: str
    new_header: str
    hunks: tuple[tuple[int, int, int, int, tuple[str, ...]], ...]


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def _reject_constant(value: str) -> None:
    raise EnvelopeError("invalid_json", f"non-finite JSON number is forbidden: {value}")


def _object_pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise EnvelopeError("duplicate_json_key", f"duplicate JSON key: {key}")
        result[key] = value
    return result


def strict_json_loads(value: bytes | str) -> Any:
    try:
        text = value.decode("utf-8", errors="strict") if isinstance(value, bytes) else value
        return json.loads(text, object_pairs_hook=_object_pairs, parse_constant=_reject_constant)
    except UnicodeDecodeError as error:
        raise EnvelopeError("invalid_utf8", "JSON must be strict UTF-8") from error
    except json.JSONDecodeError as error:
        raise EnvelopeError("invalid_json", f"malformed JSON: {error.msg}") from error


def canonical_json(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def validate_path(path: Any) -> str:
    if not isinstance(path, str):
        raise EnvelopeError("invalid_path", "proposal paths must be strings")
    if not path or len(path) > MAX_PATH_LENGTH:
        raise EnvelopeError("invalid_path", "proposal path length is outside the A12 bound")
    if unicodedata.normalize("NFC", path) != path:
        raise EnvelopeError("invalid_path", f"path is not NFC-normalized: {path!r}")
    if "\\" in path or path.startswith("/") or path.endswith("/") or path.startswith("./"):
        raise EnvelopeError("invalid_path", f"path is not canonical repository-relative POSIX form: {path!r}")
    if any(ord(character) < 32 or ord(character) == 127 for character in path):
        raise EnvelopeError("invalid_path", f"path contains control characters: {path!r}")
    parts = path.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        raise EnvelopeError("invalid_path", f"path contains an empty/dot/traversal segment: {path!r}")
    if any(part.casefold() == ".git" for part in parts):
        raise EnvelopeError("denied_path", f".git paths are forbidden: {path!r}")
    if path in DENIED_PATHS:
        raise EnvelopeError("denied_path", f"A12 cannot propose generated repository evidence: {path}")
    return path


def validate_path_list(values: Any, *, label: str, allow_empty: bool = False) -> list[str]:
    if not isinstance(values, list):
        raise EnvelopeError("invalid_scope", f"{label} must be an array")
    if len(values) > MAX_PATHS:
        raise EnvelopeError("invalid_scope", f"{label} exceeds the {MAX_PATHS}-path bound")
    paths = [validate_path(value) for value in values]
    if not allow_empty and not paths:
        raise EnvelopeError("invalid_scope", f"{label} must not be empty")
    if paths != sorted(paths):
        raise EnvelopeError("noncanonical_paths", f"{label} must be lexicographically sorted")
    if len(paths) != len(set(paths)):
        raise EnvelopeError("noncanonical_paths", f"{label} must not contain duplicates")
    return paths


def _validate_sha40(value: Any, label: str) -> str:
    if not isinstance(value, str) or SHA40_RE.fullmatch(value) is None:
        raise EnvelopeError("invalid_commit", f"{label} must be exactly 40 lowercase hexadecimal characters")
    return value


def _validate_sha64(value: Any, label: str) -> str:
    if not isinstance(value, str) or SHA64_RE.fullmatch(value) is None:
        raise EnvelopeError("invalid_digest", f"{label} must be exactly 64 lowercase hexadecimal characters")
    return value


def _git(repository: Path, *args: str, check: bool = True) -> bytes:
    env = os.environ.copy()
    env["GIT_OPTIONAL_LOCKS"] = "0"
    process = subprocess.run(
        ("git", *args),
        cwd=repository,
        env=env,
        shell=False,
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=20,
    )
    if check and process.returncode != 0:
        detail = process.stderr.decode("utf-8", errors="replace").strip() or "Git read failed"
        raise EnvelopeError("git_read_failed", detail)
    return process.stdout


def current_head(repository: Path) -> str:
    value = _git(repository, "rev-parse", "HEAD").decode("ascii", errors="strict").strip()
    return _validate_sha40(value, "current HEAD")


def ensure_commit(repository: Path, commit: str) -> None:
    _validate_sha40(commit, "baseCommit")
    process = subprocess.run(
        ("git", "cat-file", "-e", f"{commit}^{{commit}}"),
        cwd=repository,
        env={**os.environ, "GIT_OPTIONAL_LOCKS": "0"},
        shell=False,
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        timeout=20,
    )
    if process.returncode != 0:
        raise EnvelopeError("base_not_found", "baseCommit is not a readable local commit")


def read_base_blob(repository: Path, commit: str, path: str) -> tuple[str, bytes] | None:
    validate_path(path)
    ensure_commit(repository, commit)
    raw = _git(repository, "ls-tree", "-z", commit, "--", path)
    if not raw:
        return None
    records = [record for record in raw.split(b"\0") if record]
    if len(records) != 1:
        raise EnvelopeError("ambiguous_path", f"base tree lookup was not exact for {path}")
    meta, separator, raw_path = records[0].partition(b"\t")
    if not separator:
        raise EnvelopeError("invalid_git_entry", f"unparseable Git tree entry for {path}")
    try:
        entry_path = raw_path.decode("utf-8", errors="strict")
        mode, object_type, object_sha = meta.decode("ascii", errors="strict").split(" ", 2)
    except (UnicodeDecodeError, ValueError) as error:
        raise EnvelopeError("invalid_git_entry", f"unparseable Git tree entry for {path}") from error
    if entry_path != path:
        raise EnvelopeError("ambiguous_path", f"Git tree lookup returned a different path for {path}")
    if object_type != "blob" or mode not in {"100644", "100755"}:
        raise EnvelopeError("unsupported_git_entry", f"A12 supports regular text blobs only: {path}")
    content = _git(repository, "cat-file", "blob", object_sha)
    return mode, content


def validate_text_blob(value: bytes, *, path: str) -> str:
    if b"\0" in value:
        raise EnvelopeError("binary_file", f"NUL byte detected in {path}")
    try:
        text = value.decode("utf-8", errors="strict")
    except UnicodeDecodeError as error:
        raise EnvelopeError("invalid_utf8", f"{path} is not strict UTF-8 text") from error
    if "\r" in text:
        raise EnvelopeError("noncanonical_text", f"{path} must use LF line endings")
    if value and not value.endswith(b"\n"):
        raise EnvelopeError("noncanonical_text", f"{path} must end with LF")
    return text


def _range_start(start_zero: int, count: int) -> int:
    return start_zero if count == 0 else start_zero + 1


def canonical_file_diff(path: str, old_value: bytes | None, new_value: bytes | None) -> str:
    path = validate_path(path)
    if old_value is None and new_value is None:
        raise EnvelopeError("invalid_operation", f"both preimage and postimage are absent for {path}")
    if old_value is not None:
        old_text = validate_text_blob(old_value, path=path)
    else:
        old_text = ""
    if new_value is not None:
        new_text = validate_text_blob(new_value, path=path)
    else:
        new_text = ""
    if old_value == new_value:
        raise EnvelopeError("noop_proposal", f"proposal does not change {path}")

    old_lines = old_text.splitlines(keepends=True)
    new_lines = new_text.splitlines(keepends=True)
    matcher = difflib.SequenceMatcher(a=old_lines, b=new_lines, autojunk=False)
    groups = list(matcher.get_grouped_opcodes(3))
    if not groups:
        raise EnvelopeError("unrepresentable_diff", f"no textual hunk can represent {path}")

    old_header = "/dev/null" if old_value is None else f"a/{path}"
    new_header = "/dev/null" if new_value is None else f"b/{path}"
    rendered: list[str] = [f"--- {old_header}\n", f"+++ {new_header}\n"]
    for group in groups:
        old_begin = group[0][1]
        old_end = group[-1][2]
        new_begin = group[0][3]
        new_end = group[-1][4]
        old_count = old_end - old_begin
        new_count = new_end - new_begin
        rendered.append(
            f"@@ -{_range_start(old_begin, old_count)},{old_count} "
            f"+{_range_start(new_begin, new_count)},{new_count} @@\n"
        )
        for tag, i1, i2, j1, j2 in group:
            if tag == "equal":
                rendered.extend(f" {line}" for line in old_lines[i1:i2])
            elif tag == "delete":
                rendered.extend(f"-{line}" for line in old_lines[i1:i2])
            elif tag == "insert":
                rendered.extend(f"+{line}" for line in new_lines[j1:j2])
            elif tag == "replace":
                rendered.extend(f"-{line}" for line in old_lines[i1:i2])
                rendered.extend(f"+{line}" for line in new_lines[j1:j2])
            else:
                raise EnvelopeError("internal_diff_error", f"unexpected diff opcode: {tag}")
    return "".join(rendered)


def _proposal_digest(
    repository_id: str,
    base_commit: str,
    permitted_paths: list[str],
    touched_paths: list[str],
    diff_sha256: str,
) -> str:
    permitted_sha = sha256_bytes("\n".join(permitted_paths).encode("utf-8"))
    touched_sha = sha256_bytes("\n".join(touched_paths).encode("utf-8"))
    material = "\n".join(
        (
            DIGEST_DOMAIN,
            repository_id,
            base_commit,
            permitted_sha,
            touched_sha,
            diff_sha256,
        )
    ).encode("utf-8")
    return sha256_bytes(material)


def generate_envelope(
    repository: Path,
    *,
    repository_id: str,
    base_commit: str,
    permitted_paths: list[str],
    desired_files: list[dict[str, Any]],
) -> dict[str, Any]:
    repository = repository.resolve(strict=True)
    base_commit = _validate_sha40(base_commit, "baseCommit")
    trusted_scope = validate_path_list(permitted_paths, label="permittedPaths")
    head_before = current_head(repository)
    if head_before != base_commit:
        raise EnvelopeError("stale_base", "baseCommit does not equal the current repository HEAD")
    ensure_commit(repository, base_commit)
    if not isinstance(desired_files, list) or not desired_files:
        raise EnvelopeError("invalid_generation_request", "files must be a non-empty array")

    seen: set[str] = set()
    sections: list[tuple[str, str]] = []
    touched: list[str] = []
    for item in desired_files:
        if not isinstance(item, dict) or set(item) not in ({"path", "operation", "content"}, {"path", "operation"}):
            raise EnvelopeError("invalid_generation_request", "each file entry must exactly match the A12 generation contract")
        path = validate_path(item.get("path"))
        if path in seen:
            raise EnvelopeError("invalid_generation_request", f"duplicate desired file: {path}")
        seen.add(path)
        if path not in trusted_scope:
            raise EnvelopeError("out_of_scope", f"desired file is outside the trusted permitted scope: {path}")
        operation = item.get("operation")
        base_entry = read_base_blob(repository, base_commit, path)
        old_value = base_entry[1] if base_entry else None
        if operation == "delete":
            if set(item) != {"path", "operation"}:
                raise EnvelopeError("invalid_generation_request", "delete entries must not include content")
            if old_value is None:
                raise EnvelopeError("missing_preimage", f"cannot delete absent base path: {path}")
            new_value = None
        elif operation == "upsert":
            if set(item) != {"path", "operation", "content"} or not isinstance(item.get("content"), str):
                raise EnvelopeError("invalid_generation_request", "upsert entries require string content")
            new_value = item["content"].encode("utf-8")
            validate_text_blob(new_value, path=path)
        else:
            raise EnvelopeError("invalid_generation_request", f"unsupported operation for {path}")
        sections.append((path, canonical_file_diff(path, old_value, new_value)))
        touched.append(path)

    touched = sorted(touched)
    sections.sort(key=lambda item: item[0])
    unified_diff = "".join(section for _, section in sections)
    diff_bytes = unified_diff.encode("utf-8")
    if len(diff_bytes) > MAX_DIFF_BYTES:
        raise EnvelopeError("proposal_too_large", "canonical unified diff exceeds the A12 byte bound")
    diff_sha = sha256_bytes(diff_bytes)
    envelope = {
        "schemaVersion": PROPOSAL_SCHEMA_VERSION,
        "envelopeType": ENVELOPE_TYPE,
        "repository": repository_id,
        "baseCommit": base_commit,
        "permittedPaths": trusted_scope,
        "touchedPaths": touched,
        "diffFormat": DIFF_FORMAT,
        "unifiedDiff": unified_diff,
        "diffSha256": diff_sha,
        "proposalSha256": _proposal_digest(repository_id, base_commit, trusted_scope, touched, diff_sha),
    }
    head_after = current_head(repository)
    if head_after != head_before:
        raise EnvelopeError("head_changed", "repository HEAD changed while generating the proposal")
    return envelope


def _parse_section_headers(old_header: str, new_header: str) -> tuple[str, str]:
    if old_header == "/dev/null":
        if not new_header.startswith("b/"):
            raise EnvelopeError("malformed_diff", "create section must use /dev/null and b/<path>")
        path = validate_path(new_header[2:])
        return path, "create"
    if new_header == "/dev/null":
        if not old_header.startswith("a/"):
            raise EnvelopeError("malformed_diff", "delete section must use a/<path> and /dev/null")
        path = validate_path(old_header[2:])
        return path, "delete"
    if not old_header.startswith("a/") or not new_header.startswith("b/"):
        raise EnvelopeError("malformed_diff", "modify section headers must use a/<path> and b/<path>")
    old_path = validate_path(old_header[2:])
    new_path = validate_path(new_header[2:])
    if old_path != new_path:
        raise EnvelopeError("unsupported_diff_feature", "renames/copies are forbidden")
    return old_path, "modify"


def parse_unified_diff(value: Any) -> list[DiffSection]:
    if not isinstance(value, str) or not value:
        raise EnvelopeError("malformed_diff", "unifiedDiff must be a non-empty string")
    encoded = value.encode("utf-8")
    if len(encoded) > MAX_DIFF_BYTES:
        raise EnvelopeError("proposal_too_large", "unifiedDiff exceeds the A12 byte bound")
    if "\r" in value or not value.endswith("\n"):
        raise EnvelopeError("noncanonical_diff", "unifiedDiff must use LF and end with LF")
    lines = value.splitlines(keepends=True)
    sections: list[DiffSection] = []
    index = 0
    while index < len(lines):
        if not lines[index].startswith("--- "):
            raise EnvelopeError("malformed_diff", "each diff section must begin with an old-file header")
        old_header = lines[index][4:-1]
        index += 1
        if index >= len(lines) or not lines[index].startswith("+++ "):
            raise EnvelopeError("malformed_diff", "old-file header must be followed by a new-file header")
        new_header = lines[index][4:-1]
        index += 1
        if "\t" in old_header or "\t" in new_header:
            raise EnvelopeError("unsupported_diff_feature", "timestamps and header metadata are forbidden")
        path, operation = _parse_section_headers(old_header, new_header)
        hunks: list[tuple[int, int, int, int, tuple[str, ...]]] = []
        while index < len(lines):
            if lines[index].startswith("--- "):
                break
            match = HUNK_RE.fullmatch(lines[index])
            if match is None:
                raise EnvelopeError("malformed_diff", f"invalid hunk header in {path}")
            old_start, old_count, new_start, new_count = (int(part) for part in match.groups())
            index += 1
            body: list[str] = []
            consumed_old = 0
            consumed_new = 0
            while consumed_old < old_count or consumed_new < new_count:
                if index >= len(lines):
                    raise EnvelopeError("malformed_diff", f"truncated hunk body in {path}")
                line = lines[index]
                if not line or line[0] not in {" ", "+", "-"}:
                    raise EnvelopeError("malformed_diff", f"invalid hunk body line in {path}")
                if not line.endswith("\n"):
                    raise EnvelopeError("noncanonical_diff", f"hunk line in {path} is not LF-terminated")
                prefix = line[0]
                if prefix in {" ", "-"}:
                    consumed_old += 1
                if prefix in {" ", "+"}:
                    consumed_new += 1
                if consumed_old > old_count or consumed_new > new_count:
                    raise EnvelopeError("malformed_diff", f"hunk body exceeds declared counts in {path}")
                body.append(line)
                index += 1
            if not body:
                raise EnvelopeError("malformed_diff", f"empty hunk is forbidden in {path}")
            hunks.append((old_start, old_count, new_start, new_count, tuple(body)))
            if index < len(lines) and not lines[index].startswith(("@@ ", "--- ")):
                raise EnvelopeError("malformed_diff", f"unexpected content after hunk in {path}")
        if not hunks:
            raise EnvelopeError("malformed_diff", f"diff section has no hunks: {path}")
        sections.append(DiffSection(path, operation, old_header, new_header, tuple(hunks)))

    paths = [section.path for section in sections]
    if paths != sorted(paths) or len(paths) != len(set(paths)):
        raise EnvelopeError("noncanonical_diff", "diff sections must be sorted and unique by path")
    return sections


def _apply_section(base_value: bytes | None, section: DiffSection) -> bytes:
    base_text = validate_text_blob(base_value or b"", path=section.path)
    base_lines = base_text.splitlines(keepends=True)
    output: list[str] = []
    cursor = 0
    for old_start, old_count, _new_start, _new_count, body in section.hunks:
        old_index = old_start if old_count == 0 else old_start - 1
        if old_index < cursor or old_index > len(base_lines):
            raise EnvelopeError("preimage_mismatch", f"hunks overlap or target an invalid base range: {section.path}")
        output.extend(base_lines[cursor:old_index])
        base_cursor = old_index
        for line in body:
            prefix, payload = line[0], line[1:]
            if prefix in {" ", "-"}:
                if base_cursor >= len(base_lines) or base_lines[base_cursor] != payload:
                    raise EnvelopeError("preimage_mismatch", f"hunk preimage does not match exact base blob: {section.path}")
                if prefix == " ":
                    output.append(payload)
                base_cursor += 1
            elif prefix == "+":
                output.append(payload)
        if base_cursor != old_index + old_count:
            raise EnvelopeError("malformed_diff", f"old hunk count is internally inconsistent: {section.path}")
        cursor = base_cursor
    output.extend(base_lines[cursor:])
    return "".join(output).encode("utf-8")


def verify_proposal_envelope(
    repository: Path,
    *,
    expected_repository_id: str,
    expected_base: str,
    trusted_permitted_paths: list[str],
    envelope: Any,
) -> dict[str, Any]:
    repository = repository.resolve(strict=True)
    expected_base = _validate_sha40(expected_base, "expected base")
    trusted_scope = validate_path_list(trusted_permitted_paths, label="trusted permitted paths")
    head_before = current_head(repository)
    if head_before != expected_base:
        raise EnvelopeError("stale_base", "authenticated target HEAD is no longer current")

    if not isinstance(envelope, dict):
        raise EnvelopeError("invalid_envelope", "proposal envelope must be a JSON object")
    expected_keys = {
        "schemaVersion",
        "envelopeType",
        "repository",
        "baseCommit",
        "permittedPaths",
        "touchedPaths",
        "diffFormat",
        "unifiedDiff",
        "diffSha256",
        "proposalSha256",
    }
    if set(envelope) != expected_keys:
        raise EnvelopeError("invalid_envelope", "proposal envelope fields do not exactly match the A12 contract")
    if envelope["schemaVersion"] != PROPOSAL_SCHEMA_VERSION or envelope["envelopeType"] != ENVELOPE_TYPE:
        raise EnvelopeError("invalid_envelope", "proposal schema/type is not CE-W04-A12")
    if envelope["repository"] != expected_repository_id:
        raise EnvelopeError("repository_mismatch", "proposal repository identity does not match trusted context")
    base_commit = _validate_sha40(envelope["baseCommit"], "baseCommit")
    if base_commit != expected_base:
        raise EnvelopeError("stale_base", "proposal baseCommit does not equal authenticated target HEAD")
    permitted_paths = validate_path_list(envelope["permittedPaths"], label="permittedPaths")
    if permitted_paths != trusted_scope:
        raise EnvelopeError("scope_mismatch", "proposal permittedPaths do not equal the Human-confirmed trusted scope")
    touched_paths = validate_path_list(envelope["touchedPaths"], label="touchedPaths")
    if any(path not in trusted_scope for path in touched_paths):
        raise EnvelopeError("out_of_scope", "proposal touches a path outside the trusted permitted scope")
    if envelope["diffFormat"] != DIFF_FORMAT:
        raise EnvelopeError("invalid_diff_format", "proposal diffFormat is not supported")

    diff_sha = _validate_sha64(envelope["diffSha256"], "diffSha256")
    proposal_sha = _validate_sha64(envelope["proposalSha256"], "proposalSha256")
    diff_value = envelope["unifiedDiff"]
    if not isinstance(diff_value, str):
        raise EnvelopeError("malformed_diff", "unifiedDiff must be a string")
    actual_diff_sha = sha256_bytes(diff_value.encode("utf-8"))
    if diff_sha != actual_diff_sha:
        raise EnvelopeError("diff_digest_mismatch", "diffSha256 does not match exact unifiedDiff bytes")
    expected_proposal_sha = _proposal_digest(
        expected_repository_id,
        expected_base,
        permitted_paths,
        touched_paths,
        diff_sha,
    )
    if proposal_sha != expected_proposal_sha:
        raise EnvelopeError("proposal_digest_mismatch", "proposalSha256 does not match deterministic envelope material")

    sections = parse_unified_diff(diff_value)
    parsed_paths = [section.path for section in sections]
    if parsed_paths != touched_paths:
        raise EnvelopeError("touched_paths_mismatch", "touchedPaths do not exactly match paths derived from unifiedDiff")

    canonical_sections: list[str] = []
    postimage_sha: dict[str, str | None] = {}
    for section in sections:
        base_entry = read_base_blob(repository, expected_base, section.path)
        base_value = base_entry[1] if base_entry else None
        if section.operation == "create":
            if base_value is not None:
                raise EnvelopeError("preimage_mismatch", f"create target already exists at base: {section.path}")
        elif section.operation in {"modify", "delete"}:
            if base_value is None:
                raise EnvelopeError("preimage_mismatch", f"base path is absent: {section.path}")
        else:
            raise EnvelopeError("unsupported_diff_feature", f"unsupported operation: {section.operation}")

        postimage = _apply_section(base_value, section)
        if section.operation == "delete":
            if postimage != b"":
                raise EnvelopeError("malformed_diff", f"delete proposal must reconstruct an empty postimage: {section.path}")
            new_value: bytes | None = None
            postimage_sha[section.path] = None
        else:
            new_value = postimage
            validate_text_blob(new_value, path=section.path)
            postimage_sha[section.path] = sha256_bytes(new_value)
        canonical_sections.append(canonical_file_diff(section.path, base_value, new_value))

    canonical_diff = "".join(canonical_sections)
    if canonical_diff != diff_value:
        raise EnvelopeError("noncanonical_diff", "proposal is semantically valid but not byte-canonical A12 unified diff")

    head_after = current_head(repository)
    if head_after != head_before:
        raise EnvelopeError("head_changed", "repository HEAD changed during proposal verification")
    return {
        "repository": expected_repository_id,
        "baseCommit": expected_base,
        "headBefore": head_before,
        "headAfter": head_after,
        "permittedPaths": trusted_scope,
        "touchedPaths": touched_paths,
        "diffSha256": diff_sha,
        "proposalSha256": proposal_sha,
        "postimageSha256": postimage_sha,
        "verification": "valid_candidate",
        "authorityEffect": "none",
        "applied": False,
    }


def _cli() -> int:
    parser = argparse.ArgumentParser(description="Generate or verify a CE-W04-A12 proposal envelope without mutating repository state")
    parser.add_argument("mode", choices=("generate", "verify"))
    parser.add_argument("--repo", required=True, help="Repository root")
    parser.add_argument("--repository-id", default=DEFAULT_REPOSITORY_ID)
    parser.add_argument("--base", required=True, help="Exact 40-hex target HEAD")
    parser.add_argument("--allow-path", action="append", default=[], help="Human-authorized path; repeat for each permitted path")
    args = parser.parse_args()
    repository = Path(args.repo)
    trusted_paths = sorted(args.allow_path)
    try:
        payload = strict_json_loads(sys.stdin.buffer.read())
        if args.mode == "generate":
            if not isinstance(payload, dict) or set(payload) != {"files"}:
                raise EnvelopeError("invalid_generation_request", "generate stdin must contain exactly one files array")
            result = generate_envelope(
                repository,
                repository_id=args.repository_id,
                base_commit=args.base,
                permitted_paths=trusted_paths,
                desired_files=payload["files"],
            )
        else:
            result = verify_proposal_envelope(
                repository,
                expected_repository_id=args.repository_id,
                expected_base=args.base,
                trusted_permitted_paths=trusted_paths,
                envelope=payload,
            )
    except (EnvelopeError, OSError) as error:
        code = error.code if isinstance(error, EnvelopeError) else "io_error"
        detail = error.detail if isinstance(error, EnvelopeError) else str(error)
        print(json.dumps({"status": "fail", "error": code, "detail": detail}, separators=(",", ":")), file=sys.stderr)
        return 2
    sys.stdout.buffer.write(canonical_json(result) + b"\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(_cli())
