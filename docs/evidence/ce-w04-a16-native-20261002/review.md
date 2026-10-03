# A16 UI/JNI integration — candidate review

Event/observation date: 2026-10-02. Producer: Codex using Architect GPT v4.1.
Human instruction: begin UI/JNI integration and physical device qualification.
Exact repository: `The-Architect-369/Arcanum`; disposable branch
`work/a16-receipt-foundation-20261002`; draft
[PR #84](https://github.com/The-Architect-369/Arcanum/pull/84).
Grounded canonical main: `ad7c75039a6701145e3051ca151ae003f4ca542d`, matching
the remote observation. Clean starting head:
`33045f26ffdadb2a4b0eaa7e91a0b9e57b27fe43`, the deterministic index companion
of source `05cf4c67ef98a4b29a7ddb4fe9b35efb83ed6e2a`. Existing dated foundation
and custody records remain unchanged. No ARC-SES ID is inferred across external
sequence gaps.

## Result and effect states

The [bounded integration specification](../../specs/runtime/ce-w04-a16-native-integration-and-qualification.md)
defines the native dialog, separate six-export JNI library, synthetic-only Rust
facade, explicit action coordinator, operation intent journal and isolated physical
protocol. App candidate version is 26. Compatible-update qualification uses 27
with the same source and signer. The inherited base JNI contract remains closed.

| State | Evidence / limit |
| --- | --- |
| Proposed | Concrete UI/JNI candidate and seven-step physical test protocol |
| Ratified | No constitutional/doctrine ratification claimed |
| Authorized for effect | Human instruction authorizes bounded repository implementation and qualification preparation |
| Executed | Source, tests, specification and CI artifact preparation logic |
| Verified | Local checks below; remote builds/artifact checks require exact-head CI observation |
| Canonicalized | Unmet; no merge, production installation, deploy or A16 closure |

## Local observations before source/index commits

- Runtime formatting and all-target/all-feature locked/offline Clippy passed.
  Stable and declared Rust 1.78 suites passed: 48 ordinary tests plus the inherited
  ignored helper actually invoked by a subprocess test. Four new tests cover the
  native synthetic flow, adoption provenance/time, reuse of a staged signature and
  rejection of unsupported/private schema before publication.
- The separate JNI crate passed formatting, all-target locked/offline Clippy and
  compilation at its declared minimum Rust 1.82. Its tracked lock pins the existing
  MSRV-compatible P-256 dependencies; it does not alter the base JNI ABI.
- All native production and unit-test Kotlin sources compile against local Android
  API36 stubs; 85 JUnit cases passed on Windows OpenJDK21. Seven new coordinator
  cases cover observation without effects, missing signing acknowledgment, original
  signature reuse, missing publication acknowledgment, frozen unsigned intent,
  lost key/stale preview, malformed packet and damaged journal. The existing local
  development BuildConfig stub does not prove a bound APK or physical custody.
- `pnpm install --frozen-lockfile`, `pnpm verify:ce-w01`,
  `pnpm verify:ce-w02:integrated`, `pnpm lint`, `pnpm typecheck` and `pnpm build`
  passed with Node24.21.0/pnpm9.10.0. The inherited Next.js-plugin warning remains.
  Changed workflow YAML parses. Final source whitespace/index checks follow commit.
- The Windows SDK ADB device probe reported no connected device. It did not read
  private content or provision/sign/install anything. Connection clarification was
  requested once; physical execution remains unavailable at this observation.

The Android API35 Gradle/instrumentation package and both-ABI builds are prepared
as a new exact-head CI job. Its standalone receipt/custody JVM job now includes 20
A16 cases. Seven physical instrumentation methods are prepared but **not run**.
Future CI or physical outcomes are not asserted in this pre-commit record. PR #84
records source/index lineage and subsequent observed checks/artifact coordinates.

## Limits and next gate

The fixture and plaintext store are synthetic-only. No Hope/Journey content,
private derivatives, participant secrets, publisher/broker/encryption keys or
physical credential material were read/exported. The isolated test package
contains the same production continuity logic under a separate UID. Its key-loss
method deletes only a generation-checked test alias inside that isolated UID;
executing it retains the applicable exact-target effect gate.

Host tests establish neither physical non-exportability nor measured security
level. The prepared process-restart test is not device reboot or power-loss
certification. UI confirmation is not independent Human-presence proof. Missing
signing acknowledgment stays unknown and is never repaired by signing again.
Original receipt verification remains independent of current key availability.
No private-content custody/export policy or whole-device recovery claim is made.

Commit the source and deterministic index companion, verify all sync gates, obtain
exact-head native CI artifacts, then qualify on a connected, explicitly selected
physical device under the installation/test effect grant. Canonical main and
A16/CE-W04 closure remain unchanged pending Human authority and missing evidence.

## Additive host verification correction

Integration source `86cbbdbcc88fa1d97e65b63b642ae3ffb3487a91` and deterministic
index companion `f98afbfe1fa034622322a3691e977fc70503b745` remain independent
commits. The first full sync check passed gates 1–12, then the inherited A13.5
static verifier rejected a provider-expression versionCode because it recognizes
literal defaults. The correction retains explicit baseline 26 and a bounded
qualification override for 26/27; it does not weaken the inherited check.

The Android adapter now resolves the platform-owned no-backup root once, then
continues to reject symlinks below that trusted root before creating directories.
The native host and instrumentation use the same resolved root. This avoids
treating a platform app-storage path alias as participant metadata corruption;
physical compatibility remains subject to actual device execution. Follow-up
source/index commits and a fresh sequential sync check retain exact-head lineage.

At correction/index head `f9532c9ed39de973f11d6b5d6e084e4faa500244`, all 15
local sync gates passed, the tree was clean and compiled Kotlin JNI descriptors
matched the intended exports. The remote A16 receipt/custody and inherited native
unit build passed. The first new native CI run
[37011373903](https://github.com/The-Architect-369/Arcanum/actions/runs/37011373903)
passed stable JNI formatting/Clippy but failed its Rust 1.82 offline resolution
because the newer Cargo fetch did not populate an index usable by the older tool.
No Android qualification artifact was produced by that failed run. The workflow
now explicitly performs a locked fetch with Rust 1.82 before its offline check,
matching the successful local MSRV procedure. Later exact-head outcomes remain
separate observations in the PR.

The prepared instrumentation preflight was additionally tightened before device
execution: it reads source/arc fields from the installed target's BuildConfig via
the target context class loader, avoiding proof based solely on inlined test APK
constants. Seed asserts and records actual baseline version 26; update recovery
requires 27. These assertions still await physical execution and do not turn
build compilation into device qualification.

At source/index head `0ae750c7dbfa318511225b1facbbe3166109fee9`, all 15 local
sync gates passed. The next native
[CI run 37011826692](https://github.com/The-Architect-369/Arcanum/actions/runs/37011826692)
passed stable/MSRV JNI checks, both-ABI four-library builds, closed exports,
Android unit tests and all three APK assemblies. The subsequent artifact
validation shell step failed without a failing-line diagnostic; its exact failed
predicate remains unobserved. No qualification artifact was uploaded. The
workflow now reads instrumentation fields from AAPT's parsed manifest and consumes
full ZIP listings under pipefail, while preserving signer/package/version/library
requirements. A failing-line diagnostic is included for further qualification.
