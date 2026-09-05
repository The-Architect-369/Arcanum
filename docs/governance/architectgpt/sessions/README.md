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

The directory may contain zero active records. That is the canonical birth state of
the post-baseline continuity epoch.
