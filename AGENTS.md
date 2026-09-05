# AGENTS.md

## Purpose

This file defines the repository-level contract for AI-assisted work on Arcanum.

Agents may inspect, analyze, draft, implement bounded changes, and verify evidence when explicitly authorized. Agents do not own the repository and do not acquire authority from automation.

## Repository posture

- `main` is the **sole persistent canonical branch**.
- There is no default permanent integration branch.
- A temporary work branch may be created from the exact current `main` head when isolation or review is useful.
- Temporary branches are disposable: verify, merge or close, record evidence, then delete the branch.
- A repository write requires explicit Human Architect authorization and an exact target surface.
- Merge, deploy, rollback, or constitutional-impacting changes require the stronger applicable authorization and evidence gate.

Never infer a historical branch name from old commits, archived documents, session records, or issue discussions.

## Architect and registered agent roles

Architect GPT is the doctrine-aware builder/review interface. The registered supporting roles in `docs/governance/architectgpt/agent-registry.yaml` are bounded analytical lenses, not independent authorities.

No registered agent may:

- ratify canon;
- override the Human Architect;
- expose secrets or private user data;
- silently broaden scope;
- bypass verification;
- manufacture permissions, identity, recognition, governance weight, or economic rights.

## Grounding before action

For repository work:

1. resolve the exact repository and branch/ref;
2. inspect `docs/repo/repo-index.json` and current Git state;
3. open the live files that govern the requested surface;
4. distinguish canonical sources from summaries, research, and history;
5. state any missing evidence rather than filling gaps by assumption.

`docs/archive/` and old Git history are historical evidence only. They may be consulted for explicit audit or migration work, but they must not supply active operating instructions when a current canonical source exists.

## Change discipline

- Keep commits small and coherent.
- Prefer one substantive source commit followed by the deterministic `docs/repo/repo-index.json` companion commit.
- Do not hand-edit or fabricate repository-index output.
- Preserve source/index lineage and exact-head evidence.
- Do not squash or rewrite certified history merely to make the repository look cleaner.

Preferred commit prefixes include `docs(...)`, `feat(...)`, `fix(...)`, `chore(...)`, and `test(...)`.

## Verification

Use the checks appropriate to the touched surface. The full repository baseline includes:

```bash
pnpm install --frozen-lockfile
pnpm verify:ce-w01
pnpm verify:repo-index
bash scripts/verify-sync.sh
pnpm lint
pnpm typecheck
pnpm build

git diff --check
```

For the Rust local runtime:

```bash
cargo fmt --manifest-path runtime/arcanum-runtime/Cargo.toml --all -- --check
cargo clippy --manifest-path runtime/arcanum-runtime/Cargo.toml \
  --all-targets --all-features --locked --offline -- -D warnings
cargo test --manifest-path runtime/arcanum-runtime/Cargo.toml --locked --offline
```

If a required check cannot be run, report that fact explicitly; absence of evidence is not a pass.

## Doctrine boundaries

All assisted work must preserve controlling doctrine, including dignity, non-coercion, human sovereignty, consent, provenance, separation of authority layers, factual receipt semantics, and the prohibition on deriving human worth or permission from geometry, timing, counts, payment, or symbolic correspondence.

## Secrets

Never expose or commit API keys, private keys, wallet seeds, passwords, session tokens, credentials, or private user data.

## Closure

Agents may build. Agents may advise. Agents may verify.

The Human Architect and ratified governance/doctrine retain final authority.
