# Sovereign continuity specification adoption review — 2026-09-30

Human direction: review and adopt PR66 without discarding its history. Scope is specification adoption only. A17 runtime activation, provider import, ledger migration, disclosure and chain publication remain independently gated.

Reviewed vocabulary: immutable objects, explicit observation/report/inference/proposal/unknown classes, independent effect states, factual time coordinates, selected provider snapshots, private custody, typed graph edges and derived projections. Current-state views cannot override original history or fabricate missing session identifiers.

Schema hardening rejects snapshot/full-content without retention authorization/reference; no-export with replication; private-local with replication or no encryption; public replication without public disclosure. Runtime must authenticate grant references and enforce revocation, scope, namespace custody and actual effects. A schema-valid record alone grants no authority.

Validation: JSON Schema Draft2020-12 checked with jsonschema4.10.3 and format checking; 3 positive and 5 negative custody cases passed. Synthetic event fixture included for reproducibility. Positive cases were metadata-only private-local, explicitly granted snapshot, and independently established verification state without promoting other authority states. Negative cases were ungranted full-content, authorization without reference, public/no-export replication, private-local peer replication and unencrypted private-local custody. These fixtures are synthetic and not real authorization evidence.

Repository index and normal merge stability passed on the refreshed source. Local verify-sync in this checkout stopped at TypeScript AST fixtures because Node dependencies were absent; that local run is not a pass. Applicable GitHub CI must pass at the final PR head before adoption. The existing managed website worktree passed its own15/15 verification. No private stores were read or imported.

PR66 retains its original source history and is reconciled with the merged website/milestone baseline. This record adopts design/specification into main, not new doctrine or implemented runtime continuity. A14 remains conditional on A15, and chain-live compatibility is unestablished.

The final schema source is reconciled with main abfc3115bb5ea0ab2af7a54268b36409b2bf1825. Index conflicts from combining the independently reviewed source tranches are resolved by deterministic regeneration from a fresh non-merge source commit; intermediate merge/index attempts confer no verification status. Final exact-head CI is controlling for adoption.
