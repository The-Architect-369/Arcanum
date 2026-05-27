---
title: "Arcanum Daemon Command Scaffold Archive"
status: archived-index
visibility: public
last_updated: 2026-05-26
description: "Historical daemon command scaffold removed from active chain build after Cosmos SDK / Ignite API drift."
---

# Arcanum Daemon Command Scaffold Archive

This folder preserves historical `cmd/arcanumd/cmd` scaffold code that referenced older Cosmos SDK / Ignite application APIs.

The archived scaffold referenced constructors and command helpers that are not currently exposed by the active app package, including:

- `app.New`
- `app.App`
- `app.MakeEncodingConfig`
- `NewInPlaceTestnetCmd`
- `NewTestnetMultiNodeCmd`

The active daemon command surface should remain minimal until the chain app constructor surface is intentionally restored.
