# Active Architect Session Ledger

This directory contains only `ARC-CONT-EPOCH-2` session records.

- Active IDs begin at `ARC-SES-11`.
- `ARC-SES-1` through `ARC-SES-10` belong to the sealed predecessor epoch and are
  permanently non-reusable.
- Exact predecessor record paths and Git blob identities are recorded in
  `../continuity-epoch.json`.
- Historical bodies are recoverable from exact commit
  `1212f02b61ab0895a84700b9371847a6c5ebe47f`; they are intentionally not copied
  into the active working tree.

The directory may contain zero active records. That was the canonical birth state
of the post-baseline continuity epoch, but an empty active ledger must not be read as
proof that no later external continuity exists. If external originals indicate later
stable IDs while intervening records are unretrieved or unreconciled, preserve the
gap, do not allocate a potentially colliding ID, and use an unnumbered dated
`CONTINUITY-EVENT` in the controlling log when material repository continuity must
be preserved before sequence reconciliation.
