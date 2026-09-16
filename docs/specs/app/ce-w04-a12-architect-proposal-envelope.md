# CE-W04-A12 — Architect Proposal Envelope

Status: implementation-candidate
Phase: Pre-Genesis
Era: Construction Era
Wave: CE-W04
Arc: CE-W04-A12
Certified predecessor: CE-W04-A11 at `5db926762d249314083ac9dbe549fd91ec613c22`

## Purpose

CE-W04-A12 adds a deterministic, inspectable proposal envelope for exact-base source candidates. It does not add repository mutation authority. A proposal may be generated and verified, but A12 cannot apply a patch, write repository files, stage changes, create commits, push, merge, deploy, or approve itself.

A12 is additive to the frozen A11 broker/session boundary. A11 remains the transport and authentication authority for native review requests.

## Frozen authority ceiling

A12 preserves all A11 prohibitions and adds the following exact boundary:

- proposal generation is read-only with respect to repository state;
- proposal review is read-only with respect to repository state;
- every proposal is bound to one exact 40-hex base commit;
- the proposal's `baseCommit` must equal the authenticated A11 `targetHead` and current repository `HEAD`;
- permitted paths are trusted external context, confirmed through the native Human surface or explicit CLI `--allow-path` arguments;
- the envelope cannot widen its own scope;
- malformed, stale, non-canonical, digest-invalid, unsupported, or out-of-scope proposals fail closed;
- verification reconstructs candidate postimages in memory only;
- no `git apply`, `patch`, checkout, reset, index write, ref write, file write, arbitrary shell, commit, push, merge, deploy, or autonomous approval is permitted;
- `docs/repo/repo-index.json` is never an A12 proposal target;
- A12 does not invoke `verify-sync`, `verify:repo-index`, or the repository-index generator from proposal generation/review paths.

`authorityEffect` for every successful A12 review receipt is exactly `none`. `applied` is exactly `false`.

## Envelope contract

The canonical envelope has exactly these fields:

```json
{
  "schemaVersion": "1.0",
  "envelopeType": "architect_proposal",
  "repository": "The-Architect-369/Arcanum",
  "baseCommit": "<40-lowercase-hex>",
  "permittedPaths": ["path/a", "path/b"],
  "touchedPaths": ["path/a"],
  "diffFormat": "arcanum-unified-text-diff-v1",
  "unifiedDiff": "--- a/path/a\n+++ b/path/a\n@@ ...",
  "diffSha256": "<64-lowercase-hex>",
  "proposalSha256": "<64-lowercase-hex>"
}
```

`permittedPaths` and `touchedPaths` are non-empty, lexicographically sorted, unique arrays. `touchedPaths` must equal the paths parsed from the canonical diff and must be a subset of the externally trusted permitted scope.

The envelope contains no timestamp, approval flag, branch-mutation instruction, execution command, provider instruction, or apply directive. This keeps candidate bytes deterministic for the same repository identity, base commit, trusted scope, and desired postimages.

## Proposal digest

`diffSha256` is SHA-256 over the exact UTF-8 bytes of `unifiedDiff`.

`proposalSha256` is SHA-256 over this UTF-8 material:

```text
ARCANUM-A12-PROPOSAL-V1
<repository>
<baseCommit>
<sha256(LF-joined permittedPaths)>
<sha256(LF-joined touchedPaths)>
<diffSha256>
```

No trailing newline is added to this digest material.

## Path and file profile

A12 v1 supports repository-relative UTF-8 regular text blobs only.

Accepted paths:

- use canonical `/` separators;
- are NFC-normalized;
- contain no empty, `.` or `..` segment;
- are not absolute;
- contain no backslash or control character;
- do not contain a `.git` segment;
- are at most 240 characters;
- are not `docs/repo/repo-index.json`.

Accepted base entries are regular Git blobs with mode `100644` or `100755`. Symlinks, submodules, binary blobs, copies, renames, timestamps, mode changes, and Git metadata headers are rejected. Text uses LF only and, when non-empty, ends with LF.

## Canonical unified diff profile

`diffFormat` is exactly `arcanum-unified-text-diff-v1`.

Each file section contains only:

```text
--- a/path
+++ b/path
@@ -oldStart,oldCount +newStart,newCount @@
 context
-old
+new
```

Creation uses `--- /dev/null`; deletion uses `+++ /dev/null`. Counts are always explicit, including `,1`. Context depth is fixed at three lines, produced by the A12 deterministic generator. File sections are sorted by path. Hunks are ordered and non-overlapping.

The verifier parses the candidate, validates hunk preimages against exact blobs from `baseCommit`, reconstructs postimages in memory, regenerates the canonical A12 diff, and requires byte-for-byte equality. A semantically equivalent but differently formatted diff fails as `noncanonical_diff`.

## Exact-base and external-scope verification

Generation and review both require an external exact base and permitted scope.

CLI trusted context is supplied using:

```bash
python3 scripts/architect/proposal_envelope.py generate \
  --repo "$ARCANUM_REPO_DIR" \
  --repository-id The-Architect-369/Arcanum \
  --base "$HEAD" \
  --allow-path path/a \
  --allow-path path/b
```

The native broker trusted context is supplied by the authenticated A11 request:

- local repository path;
- active branch;
- `targetHead`;
- fresh session, request ID, nonce, exact request bytes, and HMAC;
- a native `scopeAssertion` containing the Human-confirmed permitted paths.

The nested envelope's `repository`, `baseCommit`, and `permittedPaths` must exactly equal the trusted context. Envelope data alone never authorizes scope.

## Native scope assertion

The proposal review route is `POST /proposal/review`. It is not a broker command and does not change the frozen A11 command registry.

The request remains A11 schema `1.1` and adds exactly:

```json
{
  "scopeAssertion": {
    "scopeId": "<native UUID>",
    "confirmedAt": "<fresh RFC3339 instant>",
    "surface": "native_dialog",
    "permittedPaths": ["path/a", "path/b"]
  },
  "proposal": { "...": "A12 envelope" }
}
```

The Human action confirms only the permitted review scope. It is not approval to apply, commit, publish, merge, deploy, or otherwise mutate repository state.

## Review receipt

A successful authenticated broker review returns an `architect_proposal_review_receipt` with:

- A11 client/session/request binding;
- `verification: "valid_candidate"`;
- `authorityEffect: "none"`;
- `applied: false`;
- canonical repository identity;
- base commit;
- `headBefore` and `headAfter`;
- confirmed permitted paths;
- touched paths;
- diff and proposal digests;
- candidate postimage digests;
- request and result digests.

The Android client independently verifies the authenticated response headers and `resultSha256`.

The native presentation text is:

`Verified candidate · not approved · not applied`

## Fail-closed cases

A12 rejects at minimum:

- current HEAD or authenticated target HEAD differs from `baseCommit`;
- HEAD changes during generation or review;
- canonical repository identity differs;
- envelope scope differs from Human-confirmed/CLI trusted scope;
- any touched path is outside scope;
- absolute, traversal, backslash, control-character, `.git`, or repository-index path;
- duplicate or unsorted envelope path arrays;
- unknown envelope fields;
- duplicate JSON keys;
- malformed UTF-8 or non-finite JSON values;
- diff or proposal digest mismatch;
- empty, malformed, overlapping, or count-invalid hunks;
- base context/deletion mismatch;
- create of an existing base path;
- modify/delete of an absent base path;
- binary, non-UTF-8, CRLF, symlink, submodule, rename, copy, mode-change, or timestamp form;
- semantically equivalent but non-canonical diff;
- empty/no-op proposal;
- stale request, replay, bad HMAC, wrong A11 session/repository/branch/HEAD binding;
- any repository HEAD drift detected before receipt completion.

## Repository-state discipline

Git reads are invoked with `GIT_OPTIONAL_LOCKS=0` and `shell=False`. The proposal engine uses only read operations required to resolve `HEAD`, inspect the exact base tree, and read committed blobs.

The proposal engine writes only its JSON result to stdout. Broker review reconstructs all candidate content in memory. No repository file, Git index, ref, worktree path, or generated repository evidence is changed.

Repository-index generation remains a separate post-source companion step under the existing repo-interface discipline and occurs only after A12 source certification. It is not part of proposal generation or review.

## Certification target

A12 certification requires:

1. frozen A11 contract fixtures remain unchanged;
2. A11 verifier remains green;
3. A12 static verifier is green;
4. deterministic proposal fixture is generated twice with byte-identical result;
5. valid candidate review succeeds without repository mutation;
6. stale, malformed, digest-invalid, unsupported, and out-of-scope fixtures fail closed;
7. Android native code preserves the seven A11 exposed actions and adds only proposal review;
8. broker preserves eight registered A11 commands and adds only the authenticated `/proposal/review` route;
9. source/index companion cadence is completed after source certification;
10. promotion to the next canonical baseline is separately authorized and does not occur as part of A12 implementation.
