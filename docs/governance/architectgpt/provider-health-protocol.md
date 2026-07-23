# Provider Health and Drift Protocol

## Purpose

Provider health evidence records whether an external capability surface was observed as healthy, degraded, unavailable, or unverified at a specific repository commit. Provider observations are evidence only; they do not override doctrine, governance, or repository state.

## Canonical surfaces

- Registry: `docs/governance/architectgpt/capability-registry.yaml`
- Snapshot schema: `docs/governance/architectgpt/provider-health.schema.json`
- Validator and reporter: `scripts/architect/provider-health.py`
- Report directory: `.architect-reports/orchestration/provider-health`

## Snapshot contract

A snapshot must include:

- schema version and record type;
- UTC observation timestamp;
- repository identifier;
- exact 40-character commit SHA;
- one observation for every provider declared in the capability registry;
- each provider's observed health state and the registry status observed at collection time;
- an optional provider-native reference or detail.

The snapshot commit must equal the checked-out repository HEAD. A snapshot from another commit is not promotion evidence for the current head.

## Health states

- `healthy`: provider responded and the intended read surface was observed.
- `degraded`: provider responded, but capability, freshness, or completeness was reduced.
- `unavailable`: provider could not be observed or returned a blocking failure.
- `unverified`: no live observation was made, or the registry intentionally marks the provider unverified.

Health state does not imply write authorization. Provider writes remain governed by the permission class and explicit human authorization rules in the capability registry.

## Drift rules

Drift exists when a snapshot's `registry_status` for a provider differs from the current canonical registry status. Missing providers, invalid states, stale evidence, malformed timestamps, and commit mismatches are failures rather than drift warnings.

The default freshness window is 24 hours. Callers may set a stricter window; they must not silently extend freshness for promotion evidence.

## Report contract

The monitor emits a deterministic JSON report containing:

- exact commit and observation timestamp;
- age and configured freshness threshold;
- stale, drift, and failure counts;
- provider-level observed and canonical states;
- overall `pass` or `fail` status.

A passing report means the snapshot is complete, exact-head, fresh, and registry-aligned. It does not claim provider uptime beyond the recorded observation.

## CI integrity tests

Repository verification must prove that the monitor:

1. accepts a complete, fresh, exact-head snapshot;
2. rejects registry drift;
3. rejects stale evidence;
4. rejects malformed or incomplete snapshots.

These fixtures use synthetic observations and do not represent live provider status.
