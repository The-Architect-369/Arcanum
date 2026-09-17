# CE-W04-A13.2 — Zero-Copy Native Pairing

Status: implementation-candidate
Phase: Pre-Genesis
Era: Construction Era
Wave: CE-W04
Arc: CE-W04-A13.2
Certified predecessor: CE-W04-A13.1 at `5f8552eff460d61aa720105b6c8c23321e311809`

## Purpose

CE-W04-A13.2 extends the certified A13.1 Android → Termux operator transport with one
additional fixed operation: `pair_native_client`.

A13.1 proved the Human-confirmed native transport and canonical workspace probe on physical
Seed Node Alpha. A13.2 removes the copied 64-hex pairing secret. The Human taps the native
pairing control, confirms one explicit dialog, and Android asks Termux to create or reuse
the canonical local broker secret and return it through the existing app-private one-shot
result channel. Android stores the material through the inherited A11
AndroidKeyStore-protected pairing store.

The pairing code is never displayed in the native UI and does not need to be copied
through the clipboard, shell, Downloads, Trash, or another application.

A13.2 does not start or stop the broker. Broker lifecycle remains A13.3.

## Fixed operation registry

The command path remains:

`/data/data/com.termux/files/home/Arcanum/scripts/mobile/arcanum-operator.sh`

The working directory remains:

`/data/data/com.termux/files/home/Arcanum`

The A13.2 registry contains exactly:

1. `probe_workspace`
2. `pair_native_client`

No caller data may select executable path, workdir, stdin, environment, shell text, or
arbitrary argv.

## Pairing contract

Before pairing material is created or returned, `pair_native_client` validates:

- canonical workspace `$HOME/Arcanum`;
- exact Git-root resolution;
- canonical `The-Architect-369/Arcanum` origin;
- attached non-empty branch;
- lowercase 40-hex HEAD.

Only then may it access:

`$HOME/.config/arcanum/architect-broker.secret`

If absent, exactly 32 random bytes are created as 64 lowercase hex using exclusive file
creation and private permissions. If present, the secret is reused rather than rotated.
Invalid secret material fails closed and returns no pairing code.

The successful result is schema `1.0` and reports:

- `operationId="pair_native_client"`;
- `authorityEffect="none"`;
- `repositoryMutation=false`;
- canonical repository/workspace identity;
- branch and HEAD;
- canonical pairing-secret path;
- created-vs-reused state;
- exact 64-lowercase-hex pairing material.

Android independently validates the full result before storing the credential.

## Native storage and Human approval

The Human must explicitly confirm the native pairing dialog. Pairing is not triggered by
app launch, workspace probing, broker probing, background execution, proposal review, or
model output.

The native UI does not render or request manual entry of the pairing code. The validated
credential is passed directly to the existing A11 pairing store, which encrypts the
decoded secret at rest using AndroidKeyStore AES-GCM.

Replacing an existing native pairing requires the same explicit Human confirmation.

Clearing native pairing still removes only app-private Android state. It does not delete
or rotate the Termux secret.

## Authority ceiling

A13.2 changes credential transport, not repository or governance authority.

Forbidden:

- arbitrary shell or caller-selected executable paths;
- caller-supplied stdin, argv, or environment injection;
- copied/displayed pairing secrets;
- repository writes or Git state mutation;
- broker start/stop/kill/restart;
- proposal application;
- artifact installation;
- autonomous approval;
- model-provider invocation.

The only new local filesystem mutation is creation of the canonical Termux-private pairing
secret when absent. It is outside the repository and every result still reports
`repositoryMutation=false` and `authorityEffect=none`.

## Android provenance

- `versionCode = 15`
- `versionName = 0.1.13-cew04-a13-2`
- `ARCANUM_IMPLEMENTATION_ARC = CE-W04-A13.2`

## Certification target

A13.2 requires:

1. exact certified A13.1 ancestry from `5f8552eff460d61aa720105b6c8c23321e311809`;
2. frozen A12 predecessor regression remains green;
3. exactly two native operator IDs: `probe_workspace` and `pair_native_client`;
4. explicit Human pairing confirmation;
5. no active manual 64-character pairing input;
6. strict repository/branch/HEAD/secret-path/code validation;
7. first-create, exact-reuse, mode-0600, wrong-origin, invalid-secret, and repository
   immutability fixtures;
8. A13.2 Android provenance;
9. canonical `verify-sync` pass;
10. exact-head Android CI assembly;
11. physical Seed Node Alpha tap → confirm → pair flow with no copied secret.

Broker start/stop remains outside this tranche.
