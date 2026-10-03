# A18 local conversation candidate — 2026-10-03

Authority: Human-requested A18 implementation, local home model first, optional
OpenAI gateway path later. Base main: `27b0d814c6a64bdbdf1dd12e8b1db53449d8223c`.
This is candidate evidence, not closure, installation or canonical adoption.

Implemented surfaces: immutable Android conversation contract, selected A17 context
freshness checks, private review/send UI, session-only transcript, encrypted local
send intents, bounded authenticated loopback gateway, SQLite no-replay metadata,
and isolated A18 build/test lane. See the [contract](../../specs/runtime/ce-w04-a18-local-conversation.md).

Observed host verification before source commit:

- All Android production and host test sources compiled with Kotlin 2.0.21, Java 21
  and the installed Android API 36 stubs. 102 JUnit tests passed (95 inherited, seven
  A18 tests). This is not an APK build or API-35 instrumentation execution.
- Ten gateway tests passed, including HTTP authentication/origin rejection, unknown
  outcome handling, restart replay refusal, exact schema/budget and tool-response
  rejection. Offline fixtures do not prove model answer quality.
- Observer provenance verification and CE-W01 specification checks passed.
- Frozen dependency installation, lint, typecheck and the production web build passed. Remaining baseline/index checks
  and source-bound Android artifacts are recorded after their actual execution.
- The first synchronization run correctly failed because the source worktree was
  dirty and the deterministic index had not yet been generated. It is not a pass.

Local runtime: official portable Ollama v0.35.1 Linux amd64 archive verified against
SHA-256 `9fcd79ac4575b2bd31b992eee18b1000c8ad126b451627c8f8cd091714cfbb10`.
Ollama reported cloud disabled and a loopback-only listener. Model files/runtime and
credentials live in ignored local state, outside Git. No paid provider calls occurred.

Initial model qualification found that the generic `qwen3:4b` tag resolves to the
thinking variant, manifest `359d7dd4bcdab3d86b87d73ac27966f4dbb9f5efdfcc75d34a8764a09474fae7`.
Its first synthetic answer exhausted the 512-token output limit in 47.71 seconds;
a separate template experiment also failed response quality (7.57 seconds).
Both operations completed and their receipts were preserved locally before new
qualification requests. Neither is a successful conversational acceptance result.
The official [tag catalog](https://ollama.com/library/qwen3/tags) distinguishes the
explicit Instruct variant. The explicit `qwen3:4b-instruct-2507-q4_K_M` manifest
`0edcdef34593eac1aa2be9c7d06c432dcf81945adca5eca2f27662c18f168ba0` then produced a
complete advisory answer in 5.49 seconds through the final local gateway. It correctly
separated the reported host-test result from unperformed physical testing. It used
two sentences rather than the requested three; one bounded fixture is not broad
reasoning or instruction-following certification. No output truncation occurred,
and the original request reconciled as `response_observed`.
No runtime-template experiment is included in the candidate source.

Physical status: A18 has not been installed or tested on the phone. Existing wireless
ADB and A17 qualification do not establish A18 readiness. Cloud/OpenAI configuration,
web-security qualification, broader reasoning quality and A18 closure remain open.

Windows loopback received the expected HTTP 401 from the gateway without a credential,
establishing host reachability and rejection of an unauthenticated request. The
local Instruct model reported 100% GPU placement with an 8192-token context.
These observations do not prove a phone tunnel or production remote access.
