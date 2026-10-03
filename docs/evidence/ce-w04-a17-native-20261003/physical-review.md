# A17 isolated physical qualification — 2026-10-03

A17 native development memory passed the implemented physical acceptance sequence on
Samsung SM-S176V, Android16/API36, arm64. This records observed implementation/test
results, not canonical adoption, A17 closure, key attestation or production deployment.
The Human authorized implementation through readiness and subsequent phone testing.
Only public synthetic development fixtures were used.

## Source and installation lineage

- Native source/index: `48033edeb` / `8ac960494c55fa61e74601aa69043f2dd94d7546`.
- [Successful APK build](https://github.com/The-Architect-369/Arcanum/actions/runs/37127686969).
- Isolated application: `org.arcanum.nativehost.a17qualification`, actual version28
  installation followed by the same CI-run/signer version29 update. Instrumentation
  package targets only that application and checks the installed source/arc binding.
- APK hashes, shared certificate SHA-256, source and per-test observations are in
  [physical-results.json](physical-results.json). Downloaded bytes were independently
  checked with SHA-256, apksigner, aapt, manifest/DEX provenance and both ABI library lists.
- Production `org.arcanum.nativehost` version25 and A16 qualification version27 retain
  the exact pre-test version/first-install/last-update observations. Neither was replaced.
- AndroidKeyStore returned a non-exportable key and KeyInfo securityLevel1 (TEE).
  This is the platform provider's report, not remote or independent attestation.

The initial observer CI check rejected the interpolated arc label. Verifier correction
`2955314b6`, indexed by `c942144e1`, recognizes only the explicit closed A16/A17
selector with A17 default. That delta changes verification/evidence/index only;
Android and runtime sources are byte-identical to the physically tested APK source.
The initial failed CI run remains preserved. No APK from a second signer/run was mixed
into the compatible-update experiment.

## Physical sequence and results

All **eight separately journaled instrumentation invocations passed** (six distinct
methods; recovery ran at three checkpoints). Each effectful attempt was journaled
before execution. No seed, installation or destructive fault operation was replayed.

| Sequence | Observed result |
| --- | --- |
| Open fresh memory, cancel setup | NOT_INITIALIZED; opening/cancellation did not provision memory |
| Seed three selected synthetic records | Encrypted vault, three records, non-exportable AndroidKeyStore key |
| Force-stop and reopen | Exact multi-record history/digests retained; UNKNOWN/PENDING preserved |
| Selected context and denied content | Only selected record included; unselected records absent; Hope namespace and recognizable credential fixture denied without mutation |
| Delete selected record, then force-stop/reopen | Removed record absent, tombstone retained; surviving record bytes/provenance unchanged; stale preview denied |
| Actual version28→29 compatible update | History and tombstone survive; reusing deleted identity denied |
| Three interrupted deletion boundaries | Original pending transaction reconciles before publication, after publication, and after completed cleanup; no recreated record |
| Tampering and missing key in separate fixtures | Corrupt bytes preserved/fail closed; removed fixture key not silently recreated; primary demonstration vault intact |
| Native editor and review | Cancel keeps generation4/count2; retention checkbox required; exact-content confirmation saves one public synthetic note to generation5/count3 |
| Native context preview | Destination confirmed locally; exactly the selected UI note with source and evidence class; no network/export action |
| Native deletion cancel, then confirm | Cancel preserves generation5/count3; confirm removes only UI fixture, generation6/count2/deletedIDs2 |
| Final force-stop/reopen | Original two surviving records still match original digests; pending/unknown claims unchanged |

## Visual and privacy evidence

The existing crest menu leads to Architect, where Development memory is visible.
Native hierarchy snapshots verified control state, consent prompts, selected context
and record-count transitions. Original screenshots of the entry and protected dialogs
were captured. Visual inspection confirmed the memory and selected-context pixels are
concealed by FLAG_SECURE. Protection was not disabled to obtain readable screenshots.
Thus protected screenshots prove concealment, not the text/layout inside that window;
control/content assertions come from the isolated synthetic UI hierarchy and tests.
Raw images, UI hierarchies and device identifiers stay in ignored local build evidence.
Selected screenshot hashes are preserved in the JSON report.

The existing A13/A15 artifact-handoff console rejects the A17 qualification arc as
unsupported. This inherited allowlist boundary was visible in the entry screenshot;
it is not a qualified A17 production update path. The present compatible update was
performed using the explicitly authorized ADB installation sequence. No update server,
production handoff metadata or broker scope was changed to bypass that boundary.

## Verification and limits

All95 Android host unit tests passed (ten new A17 tests), and CI compiled the production
and instrumentation APKs. Frozen Node24 install, CE-W01, lint, typecheck, production
build, runtime format/Clippy/offline tests, deterministic index and all15 sync gates
passed. The inherited Next.js plugin-detection warning remains. Final PR-head checks
are recorded separately; these physical observations remain bound to the APK source
above rather than being relabeled to a later documentation commit.

This test covers force-stop/reopen and injected publication boundaries, not sudden
power loss, hostile filesystem rollback, uninstall recovery, secure flash erasure,
complete credential detection, provider delivery or portable key recovery. Hand-entered
claims remain attributed claims. Private dialogs do not defeat privileged OS access,
accessibility tools or external cameras. A18's provider integration remains separate.
A17 stays open for Human closure review and remaining broader continuity mappings.
