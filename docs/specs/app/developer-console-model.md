# Developer Console Model

Status: canonical-draft
Phase: Pre-Genesis
Layer: App

## Purpose

Defines the in-app developer console as a local sovereign development surface for the Human Architect and, later, trusted contributors with bounded authority envelopes.

The console exists to help a node prepare, test, document, and propose changes.

It must not become a hidden governance bypass, treasury executor, protocol mutator, or unrestricted terminal.

## Core Principle

Local sovereignty is broad.
Network sovereignty is governed.

A node may change its own local experience within safe boundaries.
A node may propose network changes.
A node may not unilaterally alter ARCnet truth.

## Canonical Dependencies

- docs/governance/governance-permission-model.md
- docs/governance/governance-lifecycle.md
- docs/specs/app/governance-state-machine.md
- docs/specs/network/node-participation-model.md
- docs/specs/network/node-upgrade-model.md
- docs/specs/chain/governance-receipts.md
- docs/specs/identity/authority-binding-model.md

## Console Domains

### Local Experience Domain

Allowed:

- themes
- skins
- motion presets
- layout preferences
- local accessibility preferences
- local module display options

These changes affect only the local device unless exported as a proposal.

### Local Drafting Domain

Allowed:

- governance drafts
- treasury proposal drafts
- protocol proposal drafts
- documentation drafts
- release notes drafts
- local patch descriptions

Drafting is not submission.

### Local Agent Domain

Allowed:

- local assistant configuration
- local prompt templates
- local documentation references
- local review checklists

Forbidden:

- hidden autonomous commits
- secret exfiltration
- bypassing user approval
- modifying governance state without authorization

### Local Verification Domain

Allowed where supported:

- checklist execution
- static validation summaries
- build instruction generation
- local verification result display

The app may guide verification.
The app should not falsely claim verification it did not perform.

### Repository Proposal Domain

Allowed:

- prepare patch descriptions
- prepare branch proposals
- generate review packets
- link local changes to governance proposals

Actual repository writes require explicit authority and external repository authorization.

## Forbidden Console Powers

The developer console must not directly:

- assign authority envelopes
- execute treasury actions
- deploy protocol upgrades
- bypass governance review
- bypass timelocks
- expose secrets
- access private user data without consent
- rewrite doctrine without proposal and review
- mutate chain state outside approved transaction paths

## Permission Levels

### Architect Local Mode

Available to the Human Architect during Pre-Genesis.

May include:

- local UI editing
- local docs drafting
- local proposal drafting
- local release planning
- repository patch preparation

Still requires explicit external action for commits, merges, deployments, or protocol operations.

### Contributor Local Mode

Future mode for trusted contributors.

Requires:

- trusted device
- identity continuity
- bounded authority envelope
- scope assignment

### Steward Mode

Future mode for V3+ scoped module stewards.

May include:

- module proposal drafting
- module configuration review
- module documentation patch preparation

### Protocol Steward Mode

Future mode for V6+ protocol stewards.

May include:

- protocol review checklists
- release candidate inspection
- upgrade proposal preparation

No mode grants unilateral protocol execution.

## Console State Model

```ts
type DeveloperConsoleMode =
  | 'disabled'
  | 'architect_local'
  | 'contributor_local'
  | 'steward'
  | 'protocol_steward'

 type DeveloperConsoleCapability =
  | 'theme_edit'
  | 'layout_edit'
  | 'proposal_draft'
  | 'docs_patch_prepare'
  | 'app_patch_prepare'
  | 'release_review'
  | 'protocol_review'

 type DeveloperConsoleSession = {
  mode: DeveloperConsoleMode
  identityAnchor?: string
  authorityEnvelope?: string
  scope?: string
  capabilities: DeveloperConsoleCapability[]
  startedAt: string
  localOnly: boolean
}
```

## Local Patch Flow

```text
Edit locally
  ↓
Save local preset or draft
  ↓
Generate patch/proposal summary
  ↓
Run local verification where possible
  ↓
Submit proposal or export patch
```

## Proposal Generation Flow

```text
Local change
  ↓
Describe intent
  ↓
Classify domain
  ↓
Attach verification notes
  ↓
Attach doctrinal impact notes
  ↓
Create governance draft
```

## Verification Expectations

For app-facing changes, the console should encourage:

- typecheck
- build
- route review
- privacy review
- doctrine boundary review

For protocol-facing changes, the console should encourage:

- Go tests
- message/keeper review
- genesis review
- receipt review
- localnet readiness review

## Audit Log

The console should keep a local audit log for meaningful actions:

- session started
- local change saved
- proposal draft created
- patch exported
- verification noted
- governance submission initiated

Local audit logs should remain private unless the user chooses to include them in a proposal.

## Security Boundaries

The console should never store or display:

- raw private keys
- API tokens
- deployment secrets
- multisig signing secrets
- private user data from other identities

## Pre-Genesis Implementation Path

1. Add read-only Developer Console explanation page.
2. Add local theme/preset editor.
3. Add proposal draft generator.
4. Add local audit log.
5. Add verification checklist display.
6. Add export-to-repository workflow outside the app.
7. Add governed contributor modes only after authority and governance activation.

## Canonical Closure

The developer console helps a sovereign node prepare evolution.
It does not make the node sovereign over the network.

Local change is freedom.
Network change is governance.
Protocol change is collective responsibility.
