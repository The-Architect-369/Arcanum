---
title: "Construction Era Implementation Arc Ledger"
status: implementation-candidate
visibility: public
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W04"
last_updated: 2026-09-17
maintainer: The-Architect-369
authority: "Human Architect naming/continuity convention; evidence and promotion remain governed by existing wave contracts"
---

# Construction Era Implementation Arc Ledger

## Purpose

Construction Era waves remain the large evidence-gated capability boundaries (`CE-W01`, `CE-W02`, ...). An **Arc** is the bounded implementation unit inside a wave.

Arc identifiers use `CE-WNN-ANN`, where `WNN` is the Construction Era wave and `ANN` is the sequential implementation arc within that wave. This convention does not predetermine how many arcs a wave contains. A wave closes only when its evidence contract closes.

## Compatibility rule

Existing historical branch names, workflow filenames, issue references, commit subjects, specification paths, and certified wave identifiers are not renamed in place. They are immutable provenance. The Arc ledger adds stable aliases and forward naming.

## Retrospective continuity map

- `CE-W01-A01` — Sovereign Coordinate & Runtime Foundation certified implementation package.
- `CE-W02-A01` — Native Geometric Host certified implementation package.
- `CE-W03-A01` — Hope at the Center / Arcanum Native Vertical Slice certified implementation package.

These aliases do not replace the detailed commit, issue, falsification, or certification history inside those waves.

## CE-W04 — Seed Node Alpha arc lineage

### CE-W04-A01 — Scope, contract, and physical baseline

Established the bounded Seed Node Alpha implementation/audit scope, physical installation posture, triple-spine requirement, and offline authority ceiling.

### CE-W04-A02 — Architect Observer and Observation Bridge

Established Human-triggered local observation, privacy-redacted frozen export, visual diagnostics, and bounded Android share/provider surfaces without model authority.

### CE-W04-A03 — Persistent signing and Hope protected-recovery repair

Established the persistent private development signing path, migrated the physical node into that signing lineage, repaired AndroidKeyStore/provider-generated AES-GCM IV handling, and physically demonstrated recovered Hope state on v3.

### CE-W04-A04 — Repository-index closure and v4 continuity proof

Closed the stale deterministic repository index, produced Android v4 with the same persistent development signer, and physically demonstrated a clean in-place update without uninstall/data clear with protected Hope reflection recovery preserved.

### CE-W04-A05 — Hope-first static embodiment and SceneViewportPolicy

Established the protected Hope-first static scene, hard participant-control exclusion via `SceneViewportPolicy`, visually subordinate outer ARCnet geometry, compact Hope/Tempus participant surfaces, versionCode 5 provenance, and a physically audited v4 → v5 continuity path.

### CE-W04-A06 — Viewer-only orbit + bounded motion foundation

Established pure bounded viewer orbit state/reducer behavior, then attached SceneViewport-bounded drag/orbit, pinch zoom, and exact neutral reset without mutating canonical geometry. Physical A06.3 validation confirmed geometry rotation on Seed Node Alpha while Hope capture/recall and inherited functions remained operational.

### CE-W04-A07 — Persistent Arcanum shell control

Established the monochrome Arcanum crest as the persistent highest-layer native shell control. The mark remains fixed outside viewer transforms and provides Human navigation among Hope, Architect, and observation capture. Physical validation confirmed the new shell, Architect destination, observation path, geometry interaction, and Hope continuity all function in place.

### CE-W04-A08 — Native Architect read-only broker bridge

Established the first bounded operational capability on the native Architect destination:

```text
Human tap
→ explicit approval dialog
→ compile-time loopback broker endpoint
→ registered git_status command ID
→ structured execution receipt
→ native factual presentation
```

A08 intentionally introduced only read-only repository inspection. It did not accept shell text, mutate Git state, start the broker silently, contact a model provider, merge/promote branches, or convert technical evidence into authority.

Physical validation confirmed the installed Android Architect could reach the loopback Termux broker, execute the registered action, return a receipt, and report the exact active `stage/ce-w04-architect-observer` branch and installed-source commit after repository-target continuity was corrected.

### CE-W04-A09 — Architect bounded action registry and repository continuity

A09 expands the native Architect from one hard-coded inspection into a compact Human-selected action registry while preserving A08's fixed-command and loopback-only boundary. The Android allowlist exposes repository status, branch, exact HEAD, recent commits, changed filenames, diff statistics, and canonical synchronization verification. Each action requires explicit Human approval and broker risk-class agreement before execution.

A09 also hardens the Termux launcher against stale shell environment targeting: when launched from inside a Git checkout, the current repository takes precedence over `ARCANUM_REPO_DIR`, with the canonical `$HOME/Arcanum` checkout as fallback. The resolved path must be the Git repository root before broker startup.

Repository mutation, free-form shell input, patch application, Git push/merge, artifact installation, remote model dependency, and autonomous promotion remain outside A09.

#### CE-W04-A09.1 — Mobile verification execution-envelope repair

Physical A09 testing proved that `verify_sync` itself was healthy and completed 15/15 when run directly in Termux, while the native invocation failed at the broker's original 120-second deadline. A09.1 therefore changed only the bounded execution envelope: `verify_sync` receives a 300-second broker timeout and the Android loopback client receives a 310-second read timeout so the broker remains the primary deadline and can return a structured receipt.

A09.1 also advanced Android provenance to versionCode 10 / `CE-W04-A09.1` for a physically distinguishable in-place update. The command registry, loopback-only transport, Human approval requirement, repository non-mutation ceiling, no-model ceiling, and `authorityEffect=none` remained unchanged.

Physical A09.1 retesting proved the timeout repair worked: the broker remained alive for the full approximately 132-second verification run and returned HTTP 200 without the prior client-side broken pipe. That run then exposed a second, narrower execution-envelope mismatch: the reduced broker child environment omitted Termux `TMPDIR`, causing `mktemp -d` inside repo-index merge-stability verification to fall back to inaccessible `/tmp`.

#### CE-W04-A09.2 — Termux-native temporary execution envelope

A09.2 preserves Termux host `TMPDIR` inside the broker's bounded child-process environment. Before any registered command executes, the broker validates that host `TMPDIR` is present, absolute, resolves to an existing directory, and is writable. Missing or invalid temporary storage fails closed as `execution_environment_unavailable`; the broker does not create a fallback directory or accept environment values from Android request data.

The canonical verification scripts remain environment-neutral. No Android/Termux condition is added to `verify-sync.sh` or repo-index merge-stability logic. Android provenance advances to versionCode 11 / `CE-W04-A09.2` so the repaired runtime can be physically distinguished during in-place validation.

The fixed command registry, 300/310-second verification timeout relation, loopback-only transport, Human approval requirement, repository non-mutation ceiling, no-model ceiling, and `authorityEffect=none` remain unchanged.

### CE-W04-A10 — Architect Local Development Console

A10 begins after physical A09.2 validation proved the bounded native Architect execution spine end-to-end on Seed Node Alpha.

A10 does not widen repository authority. Instead it turns the existing action surface into a usable local development console with factual broker readiness, active branch/commit context, compact execution summaries, execution receipts and hashes, and Human-controlled expandable raw output.

The console is mounted beneath the persistent Arcanum shell and uses a vertically scrollable presentation region so long verification output cannot dominate or escape the safe native interface.

The A09.2 fixed command registry, explicit per-action Human approval, loopback-only transport, Termux-native temporary execution envelope, repository non-mutation ceiling, no-model ceiling, and `authorityEffect=none` remain unchanged.

### CE-W04-A11 — Verified Architect Runtime Session

A11 repairs the runtime trust boundary under the A10 console without adding repository authority. The Termux launcher creates or reuses one Termux-private 32-byte pairing secret; the Human transfers the 64-hex-character code into the native app, where it is encrypted at rest with AndroidKeyStore AES-GCM.

Every broker process creates a fresh session ID. Authenticated `/session` and `/execute` requests are HMAC-SHA256-bound to exact request bytes, client ID, session, request ID, timestamp, nonce, repository, branch, and target HEAD. Stale, replayed, unpaired, mismatched-session, mismatched-repository, mismatched-branch, and mismatched-HEAD requests fail closed before command execution.

A11 replaces the legacy caller-supplied approval Boolean with a short-lived authenticated native-dialog approval assertion. This is recorded as client-reported Human approval evidence only; it does not create governance or protocol authority.

Authenticated responses are exact-byte hashed and HMAC-bound to the request/session. Android independently checks request, response, result, stdout, and stderr digests before presenting success. Raw output now means broker-bounded output; the prior additional Android 4,000-character presentation truncation is removed.

The Android command allowlist remains seven actions, the broker registry remains eight including backend-only `web_typecheck`, and repository mutation, arbitrary shell, model execution, update installation, patch application, and autonomous approval remain outside A11.

### CE-W04-A12 — Architect Proposal Envelope

A12 established deterministic exact-base proposal generation and authenticated native proposal review without repository mutation. Candidate scope is externally Human-confirmed, every successful review reports `authorityEffect=none` and `applied=false`, and A12 cannot apply, stage, commit, push, merge, deploy, or approve its own proposal.

The certified A12 indexed implementation head is `66a6479d9df921540d117820ed0d9b66eb59ba7e`.

### CE-W04-A13.1 — Native Mobile Operator Transport Foundation

A13.1 begins the mobile workflow repair from the exact certified A12 head. It adds one Human-confirmed Android → Termux operation, `probe_workspace`, through a fixed Termux service, fixed repo-owned dispatcher path, fixed working directory, one compile-time operation ID, and an app-private one-shot result receiver.

A13.1 remains read-only with respect to repository state. Pairing automation, broker lifecycle, proposal application, artifact installation, Git writes, arbitrary shell, autonomous approval, and model-provider invocation remain outside this tranche.

### CE-W04-A13.2 — Zero-copy native pairing

A13.2 begins from the physically certified A13.1 indexed head
`5f8552eff460d61aa720105b6c8c23321e311809`.

It adds only `pair_native_client` to the fixed native → Termux operator registry. After
explicit Human confirmation, Termux creates or reuses the canonical private broker secret
and returns it through the app-private one-shot result channel. Android validates the
repository, branch, HEAD, secret path, and exact credential shape before storing it through
the inherited AndroidKeyStore-backed A11 pairing store. The pairing code is never rendered
or manually entered.

A13.2 does not start or stop the broker, widen the broker command registry, mutate Git,
apply proposals, install artifacts, contact a model provider, or create autonomous
approval.

### CE-W04-A13.3 — Human-triggered broker lifecycle

A13.3 begins from the physically certified A13.2 indexed head
`608c6bd1a8283ef20e07160c2d32ac15ec24b41a`.

It adds only `start_broker` and `stop_broker` to the fixed native → Termux operator
registry. Each lifecycle effect requires its own explicit Human confirmation. Start
launches only the canonical repo-owned A11 broker on fixed loopback `127.0.0.1:8765`,
waits for a matching health response, and records private non-secret lifecycle metadata.
Stop may signal only the process whose PID, `/proc` start ticks, and exact fixed argv match
that recorded ownership state.

A13.3 does not auto-start the broker, widen the A11 broker command registry, approve any
broker action, mutate Git, apply proposals, install artifacts, contact a model provider, or
create autonomous approval. Repository authority remains unchanged.

### CE-W04-A13.4 — Native workspace verification

A13.4 begins from the physically certified A13.3 indexed head
`e06143883fb67c7185e98d65845153d6444c1b05`.

It adds only `verify_workspace` to the fixed native → Termux operator registry. After one
explicit Human confirmation, Termux requires the clean canonical `$HOME/Arcanum`
checkout, runs only repository-owned `scripts/verify-sync.sh`, writes one private `0600`
verification log outside the repository, and then revalidates origin, branch, HEAD, and
worktree cleanliness before reporting the result.

A13.4 does not require the A11 broker or pairing, widen the A11 broker action registry,
mutate Git, apply proposals, install artifacts, contact a model provider, or create
autonomous approval. Successful verification reports `authorityEffect=none` and
`repositoryMutation=false`.

### CE-W04-A13.5 — Native operator UX and Arc closure

A13.5 begins from the physically certified A13.4 indexed head
`a48d73bb489cd10281e32be87d156802ab0029c1`.

It adds no Termux operation and no A11 broker action. The native operator registry remains
exactly `probe_workspace`, `pair_native_client`, `start_broker`, `stop_broker`, and
`verify_workspace`.

A13.5 closes the remaining Human-facing handoff by surfacing the compiled implementation
arc, Android version, exact source commit, and SHA-256 of the installed APK directly inside
Architect. The APK path comes only from Android's own application metadata; no caller may
select a package path or expected digest.

The established A13 sequence remains individually Human-mediated. A13.5 does not chain
workspace verification, pairing, broker start/stop, registered actions, or proposal review,
and it adds no repository mutation, arbitrary shell, model-provider, self-update,
deployment, or autonomous approval authority.

## CE-W04-A13 closure condition

After exact-head CI/artifact certification and physical Seed Node Alpha validation of the
A13.5 installed-artifact receipt plus the inherited native operator path, CE-W04-A13 is
closed. No A13.6 is implied. Any later capability expansion requires a separately named Arc
and its own evidence contract.

A13 closure does not by itself close CE-W04, promote `main`, grant Genesis authority, or
authorize production deployment.

### CE-W04-A14.1 — Trusted update manifest and offline trust decision

A14 begins from canonical post-PR #60
`main@7b781208e08cccea14e059bb1b1869bfc4e79bc7`.

A14.1 introduces a closed canonical update manifest, a
separate local trust context, a separate already-local
candidate observation, deterministic negative fixtures,
and a fail-closed offline trust decision.

App/companion compatibility is first-class trust data.
Publisher trust comes only from the installed signer or
a separately Human-approved local rotation set; explicit
revocation wins. Publisher signing remains distinct from
A11 broker HMAC authentication and later A16
participant-continuity signing.

A14.1 performs no download, installation, Git mutation,
Termux mutation, broker lifecycle operation, proposal
application, model invocation, deployment, promotion, or
authority grant.

A passing A14.1 receipt reports
`readyForTrustedDistributionInspection=true`,
`eligibleForInstallDecision=false`,
`repositoryMutation=false`, `networkUsed=false`, and
`authorityEffect=none`.

A14 remains open after A14.1. Trusted distribution
inspection remains an A14 follow-on. Own-package
installation and recovery remain A15. Local continuity
identity and signed local receipt closure remain A16.

## Promotion discipline

An Arc may be implemented, tested, superseded, or abandoned without closing its parent wave. Arc completion does not imply wave certification, Genesis authority, protocol finality, governance authority, or promotion to `main`.

The source/index discipline remains:

```text
substantive Arc source commit(s)
→ exact-source verification
→ deterministic repo-index generation
→ separate index companion commit
→ exact indexed-head CI
→ Human review
→ promotion only when the governing wave contract permits
```
