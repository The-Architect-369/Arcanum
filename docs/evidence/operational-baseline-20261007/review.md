# Operational baseline — October 7, 2026

## Authority and scope

The Human reviewed the derived current-state view and requested its merge, Arcanum
cleanup and archival, live environment tests, and an updated capabilities registry
across Ubuntu, Termux, GitHub, Notion and Drive. The reviewed projection was adopted
through [PR90](https://github.com/The-Architect-369/Arcanum/pull/90), normal merge
`f839027a3c82197d0087e0a530126f67b884618a`, after all ten returned check/status rows
succeeded at reviewed head `73b597065b0855fd1a0e85b67204819e9a15cdcd`.
The source/index history is preserved. Its disposable branch was deleted.

This follow-on baseline begins at that exact main head. It records bounded results,
not a certification of every file, device failure mode or future connection.
The capability register is observation-only; it cannot dispatch work or grant
permissions. No A19 implementation, Hope access, Agent C launch, APK installation,
cloud-model activation, doctrine amendment or new ARC-SES allocation occurred.

## Verified observations

- **Ubuntu:** 24.04.3 LTS on WSL2; Python 3.12.3; Rust/Cargo 1.98.0. The default
  nonlogin environment lacked Cargo/ADB paths and used Node 22. A writable Node
  24.21.0 toolchain and Corepack shims are now retained in ignored local storage.
  `scripts/dev/with-local-toolchain.sh` explicitly selects these tools and the
  existing Cargo installation. The host Rust format, clippy and test checks passed with locked offline
  dependencies. This change does not rewrite system Node or install system links.
- **Termux:** canonical checkout fast-forwarded from
  `d2e30b275234c820708cdcc0b025a38be9a5fe61` to the PR90 merge above, clean on main.
  Node 24.17.0, pnpm 9.10.0, Python 3.14.6, Git 2.55.0 and Rust/Cargo 1.98.0.
  Frozen dependency installation, all 15 synchronization gates, lint and typecheck
  passed at that head. Android web production build and on-phone Rust compilation
  were not tested in this observation.
- **Transport:** trusted-key private SSH and explicitly selected network ADB both
  returned synthetic sentinels with phone Wi-Fi disabled and LTE reported at
  08:46Z. Wi-Fi was restored. USB stayed physically attached as the recovery path;
  this is not a fresh unplugged, reboot or long-idle recovery certification.
- **Installed application:** Android 16, Arcanum version 34 / 0.1.18-cew04-a18.
  Independently read installed APK SHA-256
  `7113e51f1b12e3c8d40848e1219537b4d757790222629cceb4522375540467f4`
  matches the qualified A18 artifact. No reinstall, uninstall or data clearing.
- **Local inference:** an early direct advisory-alias probe completed with an empty
  answer (failed answer check). Separately, the configured authenticated gateway
  using `qwen3:4b-instruct-2507-q4_K_M` returned exactly `BASELINE_OK`, untruncated,
  and reached `response_observed` at 08:49:35Z. The public synthetic prompt contained
  no private records. An unauthenticated request returned 401. The alias failure
  is retained as a distinct observation, not erased by the configured-path success.
  No fresh native UI conversation, private Hope access or provider zero-retention
  claim follows.
- **GitHub:** authenticated fetch, push, PR creation, check readback and authorized
  merge succeeded. Ubuntu and Termux resolved the same remote canonical head.
- **Notion:** dashboard and October 5 handoff received dated supersession notices;
  A19's stale predecessor block was cleared to Ready, preserving its September 20
  baseline and acceptance criteria. All three pages were fetched after edits and
  the requested content was confirmed. Ready does not mean implementation complete.
- **Drive:** both superseded handoffs were moved with original file IDs, bytes and
  visibility preserved. Metadata readback confirmed new parents. The owner-private
  research handoff stayed in an owner-private archive; it was not moved into the
  shared Journey archive. No sharing changes were made.

## Archived material and retained exceptions

| Surface | Action | Preservation / limit |
| --- | --- | --- |
| Laptop Downloads | Five pre-A19 packet/envelope files moved to `Arcanum Archive/2026-10-07-pre-a19` | Every file hash verified; archive manifest retained. |
| Phone Downloads/Arcanum | 31 superseded installer/package files moved to `Archive/2026-10-07-superseded` | Before/after SHA-256 equality; no installed app removal. Other subdirectories were not exhaustively audited. |
| Phone legacy checkout | Clean unused `work/Arcanum` moved intact into `Arcanum-Archive/2026-10-07/legacy-checkout` | Original head `1e189e9a9245c39b79ea7da0d44f14ef248909ff` retained. |
| Ubuntu Git | Fifteen merged archive branches retired; two clean merged obsolete worktrees removed | Verified Git bundle retains refs; only disposable ignored caches removed with the worktrees. |
| Older primary Ubuntu checkout | Retained | Owns shared Git metadata and has 18 modified/untracked source files; verified source-only backup created, original work untouched. |
| Older managed inspection worktree | Retained | Belongs to a separate managed context; no forced removal. |
| Historical stash and unmerged phone branch | Retained | Their unique work was not discarded or declared obsolete. |
| Active local runtime data | Retained | Model, gateway, tailnet and ADB recovery services depend on the older-named local directories. Age is not proof of obsolescence. |
| Notion October 5 handoff | Historical notice prepended | Original body retained in place; no claim of a physical page move. |
| Drive pre-A19 envelope | Moved to existing Archive & Superseded folder | Same stable ID and sharing. |
| Drive October 5 research handoff | Moved into owner-private Archive — Superseded Handoffs | Same stable ID and original content; owner-only visibility verified. |

Private receipt files and archive manifests remain in ignored
`.local/environment-baseline-20261007/`; phone verification logs remain in the dated
phone archive. They are operator evidence, not public source payloads or universally
available CI inputs. This public report is a minimized attributed execution record.
No credentials, private endpoint identifiers, reflection bodies or derivatives are
included. Personal files outside the Arcanum scope were not swept or deleted.

## Two starting points and refresh procedure

1. [Current state](../../governance/architectgpt/current-state.md) answers where the
   project stands, with claim provenance and proposals kept distinct.
2. [Operational capabilities](../../governance/architectgpt/operational-capabilities.md)
   answers which paths were actually tested, what failed and what remains untested.

Both are dated snapshots. At the next task, resolve remote main and the local branch,
inspect the index and live contracts, then probe only the required connection before
relying on it. Do not treat a saved passed result as current liveness or authorization.
Update the reviewed source records and regenerate; preserve older observations.

For this Ubuntu checkout, use `bash scripts/dev/with-local-toolchain.sh <command>`.
The ignored Node installation is under `.local/toolchains/node24`, with writable
Corepack and Windows-ADB shims under `.local/toolchains/bin`; Cargo uses its existing
user installation. No temporary-directory dependency remains. On another checkout,
provide Node 24 and pnpm 9.10.0 explicitly; the wrapper is not an installer. On Termux,
the existing native Node 24 satisfies the same version guard. Never copy credentials
or ignored runtime state into Git to reproduce a toolchain.

The repository baseline remains frozen install, CE-W01, repo-index, all sync gates,
lint, typecheck, production build and diff check. Rust fmt/clippy/test apply to runtime
work; the host suite was also exercised during this environment baseline. New work
must preserve the source-commit/index-companion cadence and exact-head evidence.

## Remaining limits

Agent C readiness, editor Memory-off and schedules remain unverified; no agent run
was started. A19 collection tests remain ahead, A20 navigation remains separate, and
Hope/spatial-semantic extensions remain proposed. No new production deployment or
public-site smoke certification is claimed by these device/provider probes. The
source/index baseline follow-on must pass its own final checks before integration.
