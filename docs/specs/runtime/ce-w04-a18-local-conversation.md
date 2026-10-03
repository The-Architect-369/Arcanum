---
title: "CE-W04 A18 — Local Architect Conversation Candidate"
status: implementation-candidate
visibility: public
last_updated: 2026-10-03
---

# Scope and authority

Human direction: proceed with A18, using a home-computer local model first and an
optional OpenAI path through the same private gateway later. This candidate starts
from canonical `main` at `27b0d814c6a64bdbdf1dd12e8b1db53449d8223c` on disposable
`work/a18-conversation-foundation-20261003`. A17 is closed; CE-W04 remains open.
The September 20 [frozen execution baseline](https://app.notion.com/p/3e12bb4420b881219b88f57e93e25d5a)
and [A18 work record](https://app.notion.com/p/3df2bb4420b881c6a0f8d03bd52dc445)
control the bounded advisory conversation scope. No doctrine or governance change.

This tranche implements one explicitly reviewed English request and answer at a
time. Previous answers are not automatically resent. A17-selected development
records retain their identity, source, revision, evidence class and execution claim.
No private Hope/Journey store, directory crawl, automatic publication, model tool,
shell command, patch application, approval, or execution adapter is reachable.
The existing Architect tools remain separate human-operated surfaces.

OpenAI is a planned optional adapter, **not implemented or activated** here.
The retained web-security qualification gate is not shown closed by the inspected
record; cloud service expansion and its credentials/disclosure/retention/cost profile
remain separate gates. Local inference neither certifies that gate nor closes A18.

# Request and disclosure

`arcanum.architect.conversation/v1` is a gateway boundary independent of A17 custody.
The profile identifies the home-local Ollama provider, exact model tag and digest,
fixed system instruction, retention notice and budget. Its revision is a SHA-256
of the serialized profile. The Android client accepts this closed local provider
profile only. Future adapters must explicitly define and qualify their profiles.

A draft freezes an operation UUID and exact JSON bytes. The review displays the
provider/model/digest, fixed instruction, exact request including every selected
record and its attribution, retention and budget. The final Send checkbox separately
authorizes disclosure and minimal encrypted request metadata retention. A17's local
preview consent is never used as provider-send authorization.

Immediately before send, the client re-reads the profile and selected memory. Changed
profile, generation, deleted record or changed record digest requires a new review.
No selected records means memory setup is unnecessary. Selection is at most eight
records; the entire UTF-8 request is at most 6000 bytes, including metadata. Prompt
is at most 4096 bytes. Oversize input is rejected without truncation. Recognizable
credential patterns are rejected on Android; this is not a complete secret detector.
User review is still required. The gateway does not independently attest consent.

The model sees the fixed system instruction and a JSON user message containing the
prompt and selected evidence. It receives no previous conversation or unselected
records. The 8192-token model context and conservative input byte limit leave room
for templates, instruction and 512 output tokens in the selected Qwen profile.
Responses over 16 KiB, incomplete protocol responses, tool calls or images fail.
Output limit exhaustion is reported visibly, not silently called a complete answer.
Model text is rendered in a plain TextView with no automatic action or link handling.

# Local transport and credentials

`scripts/conversation/gateway.py` uses Python's standard library and binds only
`127.0.0.1:18765`. All API routes require a random 256-bit bearer credential generated
in an operator-owned mode-0700 state directory; the credential file is mode 0600.
Browser Origin requests are rejected; no CORS is enabled. There is no LAN/public bind
option, redirect following, environment proxy, arbitrary provider URL, or cloud retry.
The selected local profile is `qwen3:4b-instruct-2507-q4_K_M`, manifest
`0edcdef34593eac1aa2be9c7d06c432dcf81945adca5eca2f27662c18f168ba0`.
Use the explicit Instruct tag; the generic 4B tag selects a thinking-only variant.
Ollama is reached only at `127.0.0.1:11434`; run it with `OLLAMA_NO_CLOUD=1`.
Both loopback services trust the host OS and local administrator.

Android uses the existing loopback cleartext exception and fixed port 18765 through
an explicitly configured development tunnel. For the initial physical sequence,
use ADB reverse on the already paired wireless ADB transport after verifying that
Windows ADB can reach the WSL gateway. Wireless ADB reachability does not itself prove
that route. No firewall exposure or public ADB port is required. VPN and production
remote access remain separate qualification work.

The gateway credential is entered as a masked, observation-private, session-only
field; never compile it into an APK, commit it, put it in command arguments, or
request it in chat. Production pairing UX is not claimed complete. Test-only pairing
may place a key through a protected stdin channel into the isolated package's private
no-backup file, removed after qualification. Test credentials never enter reports.

# Budgets, custody and recovery

Only one inference runs at a time; at most eight gateway HTTP handlers are active.
Header/body reads time out after five seconds. Ollama tag verification has five
seconds and model waiting has a 60-second deadline; Android allows 65 seconds for
chat transport. Token output is bounded at 512, with no automatic continuation.
These are initial profile limits, not a ceiling on future creative capability.

Before dispatch, Android durably writes an AES-256-GCM intent with a separate
AndroidKeyStore alias under `noBackupFilesDir/architect-conversation.v1`. It contains
request ID, request digest, profile ID, timestamp and conservative unknown state;
no prompt, answer, credential or record body. Prior intents authenticate before new
sends. Missing keys/corruption block sends and preserve evidence; no reset is offered.
There is a 1000-intent bound and no silent pruning. App-private paths and OS custody
are trust assumptions, not protection from a compromised privileged device.

The gateway commits a SQLite FULL-synchronous UUID/hash/unknown/timestamp journal
before contacting the model. Duplicate operation IDs never redispatch, even after
restart. The gateway stores no conversation bodies or response text. Its metadata
is protected by filesystem permissions, **not application encryption**. It also
stops at 1000 entries instead of silently deleting recovery evidence. Future archival
or reset needs its own reviewed procedure. No zero-retention claim is made about
OS memory, swap, model runtime, administrator access or backups of the host.

Stop waiting disconnects the client. It does not prove cancellation of remote
computation or absence of disclosure. Exceptions, timeouts, and lost acknowledgments
remain unknown. `GET /v1/requests/<original UUID>` reconciles the original receipt
without replaying it. `response_observed` means the gateway parsed a model response,
not that the phone received it or that any proposed action happened. `not_recorded`
is a point-in-time observation, not absence proof for an in-flight dispatch.
There is no automatic retry, provider fallback or response replay.

Conversation text remains in session memory and clears on Close; no transcript
saving, clipboard export or A17 auto-retention is attached. UI dialogs use FLAG_SECURE
and Architect observation redaction. Protected screenshots cannot prove their private
text. Accessibility/keyboard/OS behavior remains a platform boundary.

# Qualification and next gate

The A18 build lane emits isolated `org.arcanum.nativehost.a18qualification` versions
30/31 and an instrumentation APK, each bound to the exact source commit. Existing
A16 and A17 build selectors remain explicit. Production packages are not updated by
building this candidate. The source set is shared; do not treat rebuilding an older
qualification selector as re-certifying its historical arc.

Host tests cover selected-context freshness, provider drift, disclosure bounds,
request identity, encrypted journal recovery/corruption, gateway authentication,
model identity, replay prevention, unknown outcomes and hostile text/tool replies.
Prepared device methods are individually invoked; the live synthetic test refuses
a second send if its marker already exists. Reconciliation is a separate method.
No physical pass or install is implied by host compilation or CI artifact creation.

Before A18 closure: exact source/index/CI verification; authorized isolated phone
install; verify Wi-Fi transport/tunnel; real selected-evidence response; manual UI
review/cancel/close; offline, timeout, interruption and provider-error paths; reconcile
an original request after restart and compatible update; verify receipt disclosure,
protected screenshots, and unchanged production/A16/A17 packages. The native fixture
response and phone observations need human quality review. Multiturn context selection
and polished pairing remain explicit follow-on product work, not hidden auto-capture.
