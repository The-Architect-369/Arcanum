# A17 first local foundation review

Date: 2026-10-03. Producer: Codex under Architect GPT v4.1.
Human direction: “With A16 closed let's keep this momentum and begin work on A17”.
Repository: The-Architect-369/Arcanum. Exact canonical base:
`bfa1ea659937f1fec4216680de81f989bd9961d4`. Work branch:
`work/a17-continuity-foundation-20261003`.

## Outcome

The [bounded contract](../../specs/runtime/ce-w04-a17-local-foundation.md) implements
the adopted migration plan's initial offline object-store slice. One typed public
question profile supports immutable append/load, deterministic SHA-256, provenance,
independent effect-state claims, explicit authorized supersession and a derived view
that preserves unresolved alternatives and historical records. The module is not
connected to native/UI/provider entrypoints and does not admit private memory.

Host authorization is independent of retained grant strings or claims. Negative cases
reject private namespaces/disclosure, required encryption, revoked retention/read,
unauthorized supersession, self/cross-subject/missing-target edges, invalid dates,
oversize fields, duplicate evidence refs, conflicting identities, corrupt bytes,
partial pending writes, symlinks and duplicate transaction locations.

## Verification observed before source commit

- Independent Python encoder validates the synthetic logical JSON fixture against
  the adopted schema and matches the Rust golden canonical bytes/digest.
- Stable and declared minimum Rust 1.78 full runtime suites pass: 62 ordinary tests;
  two ignored process helpers are invoked by their parent recovery tests. A17 adds
  14 ordinary cases (two module tests and twelve integration tests).
- A17 includes real subprocess reopen verification and injected failures after
  create/write/flush/rename/sync; those are host evidence, not device power-loss proof.
- Runtime all-target/all-feature offline Clippy and formatting pass. No new dependency.
- Initial full runs exposed transient Busy failures while another test spawned a
  process. Explicit OS unlock fixes the inherited-descriptor lifetime race. Five
  repeated recovery suites passed after that fix; a focused inherited-descriptor
  regression and privacy-negative cases then passed on stable and 1.78.
- Final source/index-head repository and remote results belong to the candidate PR;
  this pre-commit record does not claim checks that have not yet run.

## Scope, authority and next gate

Proposed/Authorized-for-effect: bounded A17 repository implementation under the Human
request. Ratified: existing September sequence and adopted continuity specification;
this new profile remains a candidate. Executed: Rust module, synthetic fixtures,
focused CI and documentation. Verified: the host checks above, with final repository/
remote verification pending. Canonicalized: no; no merge/closure authorization inferred.

Public synthetic fixtures do not establish encrypted private custody, authentic host
grants, deletion/anti-resurrection, provider context filtering, Android process/update
behavior or a useful installed memory interface. Hashes are not signatures and do not
prove author identity or resist rollback by the filesystem owner. Read denial may
block an entire projection; partial history is not silently presented as complete.

A16 remains closed. CE-W04 and A17 remain open. Next: review this candidate, then
implement protected retention/deletion and selected-context contracts, followed by
native integration and physical acceptance. No device or external private store was
read, installed or ingested during this tranche. No canonical session IDs allocated.
