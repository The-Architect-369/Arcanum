---
title: "TempusAnchor — CE-W01 Temporal Provenance Contract"
status: implementation-candidate
visibility: public
last_updated: 2026-09-02
description: "Minimal local-first temporal provenance contract for CE-W01, separating clock/ephemeris observation from symbolic interpretation, runtime authorization, and optional protocol witnessing."
era: "Construction Era"
wave: "CE-W01"
authority: "implementation-facing specification subordinate to canonical Temporal Model and current Tempus module boundaries"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/39"
---

# TempusAnchor — CE-W01 Temporal Provenance Contract

## Purpose

`TempusAnchor` is the minimum factual temporal record required by CE-W01 so a local ARCnet node can persist and later prove **when, from which clock/source, for which observer, and in which coordinate frame** a temporal observation was made.

The contract is local-first.

It does not require network access, chain finality, astronomical computation, zodiac rendering, symbolic correspondence, Vitae movement, Hope interpretation, or protocol settlement in order to exist.

It is subordinate to the canonical Temporal Model:

- time does not judge;
- participation is optional;
- missed windows carry no penalty;
- timing does not imply intent;
- astronomical context does not grant permission;
- protocol may witness that something occurred but may not define temporal meaning.

## Core flow

```text
clock / astronomical observation
          ↓
     TempusAnchor
          ↓
 signed local receipt when signing exists
          ↓
 optional explicit submission
          ↓
 designated ARCnet witness when required
          ↓
 protocol finality only for facts that actually require finality
```

There is no automatic chain transaction for ordinary clock ticks, ephemeris movement, seasonal change, lunar phase change, zodiac-sector change, application rendering, or participant observation.

## Typed layers

### Observation

A factual reading from a declared source.

Examples:

- device/system clock reading;
- monotonic clock sample associated with a wall-clock reading;
- ephemeris output for a declared target and observer;
- manually entered factual event time with explicit provenance.

### Anchor

A normalized local record that captures the observation and its provenance.

### Local receipt

An append-only local statement that an anchor was accepted/persisted by the local runtime.

The CE-W01 local runtime boundary now defines an opaque signing-handle boundary for local receipt signing. This specification does not expose private key material or choose a production signing algorithm/provider; concrete signing implementation and tests remain an implementation gate.

### Protocol witness

An optional separately authorized network/chain record attesting to selected anchor/receipt facts.

A protocol witness is not the default state and does not reinterpret the anchor.

### Symbolic overlay

An optional user-facing interpretation or correspondence attached outside the factual anchor.

It cannot be used as authorization input merely because it references the anchor.

## Minimal `TempusAnchor` shape

The implementation contract is conceptually:

```text
TempusAnchor
- anchorId
- schemaVersion
- capturedAt
- timeScale
- source
- observer
- frame
- observation
- precision
- provenance
- interpretation
```

The machine-readable serialization contract and deterministic digest vectors are now represented by:

- `docs/specs/tempus/tempus-anchor.schema.json`;
- `docs/specs/tempus/tempus-anchor.vectors.v0.1.json`;
- `scripts/verify-ce-w01-specs.py`, which verifies the Tempus schema, vectors, provenance constraints, local/protocol separation, and authority firewall.

## Required fields

### `anchorId`

A locally unique stable identifier.

It must identify the record, not the person.

It must not encode rank, recognition, worth, destiny, zodiac identity, Vitae Grade, Hope state, capability, or economic status.

### `schemaVersion`

The version of the anchor serialization/semantic contract.

A verifier must not silently apply rules from a different version.

### `capturedAt`

The civil timestamp at which the observation was captured or accepted into the anchor record.

Preferred interchange form:

```text
RFC 3339 / ISO 8601 with explicit UTC offset or Z
```

Example:

```text
2026-08-26T06:15:00Z
```

A timezone-local display may be derived separately.

### `timeScale`

The time scale associated with the observation when relevant.

Examples include:

- `UTC` for ordinary civil/local application observations;
- `TDB` or another explicitly declared dynamical scale for an ephemeris computation when required by the provider/model.

The implementation must not assume that all astronomical provider times are interchangeable with civil UTC.

### `source`

The source that produced the temporal observation.

Minimum conceptual fields:

```text
source
- kind
- provider
- model
- version
- sourceId
```

Possible `kind` values include:

- `system-clock`
- `monotonic-clock`
- `ephemeris`
- `manual-factual-entry`
- later explicitly registered source kinds

`provider`, `model`, and `version` may be null when they genuinely do not apply, but absence must remain explicit rather than fabricated.

### `observer`

The coordinate or experiential observer/center for a sourced astronomical observation.

Minimum conceptual fields:

```text
observer
- kind
- body
- site
- latitude
- longitude
- altitude
```

Examples:

- Earth geocenter;
- a specific topocentric site on Earth;
- another body center;
- no spatial observer for a simple device-clock anchor.

Private location must not be required merely to use Tempus.

Where location is unnecessary, it must be omitted rather than collected opportunistically.

### `frame`

The coordinate/reference frame used by an astronomical observation.

Minimum conceptual fields:

```text
frame
- family
- center
- axes
- referencePlane
- epochRule
```

Candidate `family` examples include:

- `ICRF/barycentric`
- `heliocentric-ecliptic`
- `geocentric-ecliptic-apparent`
- `topocentric`
- `body-fixed`

The exact registered vocabulary will be defined by a later machine-readable registry.

`epochRule` must explicitly distinguish fixed epoch from `of-date` when the distinction affects the coordinate.

### `observation`

The actual factual observation.

For a simple clock anchor this may be only the normalized timestamp and clock metadata.

For an astronomical anchor it may additionally contain:

```text
observation
- target
- coordinateType
- longitudeDeg
- latitudeDeg
- distance
- distanceUnit
- additionalProviderFields
```

Only values actually supplied or computed by the declared source may be stored as source observations.

A symbolic sector, archetype, correspondence, interpretation, or rendered geometric position is not an astronomical source measurement.

### `precision`

Precision/uncertainty appropriate to the source.

Minimum conceptual fields:

```text
precision
- timeResolution
- coordinateResolution
- uncertainty
- notes
```

A source without a known uncertainty must not be presented as infinitely precise.

### `provenance`

Information needed to reproduce or audit the observation where technically possible.

Examples:

- provider/source URI or registered source ID;
- request parameters or digest;
- model/version;
- local software version;
- computation backend;
- fallback mode if a provider library used a fallback;
- original unmodified provider fields where retained.

### `interpretation`

The factual anchor's interpretation field defaults to:

```text
null
```

Any later symbolic or participant-owned interpretation must be separately typed and attributable.

The absence of interpretation is a valid and preferred baseline state.

## Frame hierarchy

CE-W01 recognizes that multiple legitimate coordinate frames can describe the same broader astronomical system.

A minimal frame stack includes:

```text
solar-system barycentric / ICRF
        ↓
heliocentric physical view
        ↓
geocentric apparent sky view
        ↓
topocentric local observer view
        ↓
body-fixed local surface view
```

This is not a hierarchy of truth or worth. It is a hierarchy of coordinate transformations and viewpoints.

> **A viewpoint may be central to experience without being central to cosmology.**

## Physical distance versus angular sky

A radial physical coordinate and an angular sky coordinate are different domains.

Examples:

- kilometers/AU describe physical distance;
- ecliptic longitude/latitude describe angular/directional coordinates;
- a visual dodecahedral or other shell may organize directions without having a physical radius in AU.

A renderer must not pretend that an angular shell's normalized screen radius is a physical solar-system distance.

> **Change frame before you change meaning.**

> **Angular shell is not radial shell.**

## Astronomical unit boundary

When `au` is used as a physical length unit, CE-W01 adopts the IAU conventional definition:

```text
1 au = 149,597,870,700 meters exactly
```

The astronomical unit is a unit of length. It is not Earth's instantaneous distance from the Sun.

No normalized ARCnet geometric radius is an AU unless an independent explicit physical mapping says so.

## Validated solar-longitude example

When Tempus later needs an ephemeris-backed Earth-season solar longitude, a validated example observable is:

```text
apparent observer-centered ecliptic-of-date longitude of the Sun
observer: Earth geocenter
```

JPL Horizons documents quantity `31` as observer-centered ecliptic longitude/latitude and specifically directs Earth-season determination to quantity 31 for the Sun as seen from the geocenter.

This example does **not** lock ARCnet to JPL Horizons as the only provider.

A production provider must satisfy equivalent explicit source, observer, frame, time, model/version, precision, and reproducibility requirements.

## Apparent-coordinate boundary

A simple vector translation from heliocentric to geocentric coordinates is not automatically equivalent to an apparent ephemeris.

Apparent observations may include source/model handling for effects such as:

- light-time;
- aberration;
- gravitational deflection;
- precession/nutation or other declared frame treatment;
- topocentric/refraction treatment where applicable.

The source/model owns those corrections.

ARCnet must record which coordinate family it received rather than silently upgrading a geometric approximation into an apparent astronomical claim.

## Optional normalized cycle projections

A factual astronomical longitude may be projected into a neutral registered cycle coordinate if the projection formula is explicit.

Example research candidate:

```text
normalized longitude λ ∈ [0, 360)
sector count = 72
sector width = 5 degrees
sectorIndex = floor(λ / 5) + 1
```

This projection is **not required** by the minimal `TempusAnchor`.

If implemented later:

- the source longitude remains primary factual evidence;
- sector identity is a derived coordinate;
- zodiac/correspondence labels are optional overlays;
- no sector, sign, decan, quinary, face, pose, orientation, or coincidence grants authority.

## Authority firewall

The following may not authorize a runtime action merely by appearing in or being derived from a `TempusAnchor`:

- timestamp;
- lateness or punctuality;
- solar longitude;
- lunar phase;
- planet position;
- zodiac sign/face;
- 72-sector index;
- decan/quinary;
- season;
- astronomical coincidence;
- frame orientation;
- rendered geometry;
- participant timing pattern.

A separate controlling capability/authority contract must authorize an action.

> **Astronomical position is context, not permission.**

> **The sky may position the vehicle; it may not drive its authority.**

## Privacy boundary

A `TempusAnchor` must collect the minimum spatial and temporal data required for the selected function.

Rules:

- ordinary local clock use requires no precise location;
- geocentric astronomy requires no participant location;
- topocentric observation may request location only when the participant chooses a feature that genuinely requires it;
- precise location remains participant-controlled and must not silently become social, identity, advertising, capability, governance, Treasury, or recognition data;
- historical anchors must not become a behavioral timing dossier by default.

## Local persistence semantics

Creating a local `TempusAnchor` means only:

```text
this local runtime accepted this factual temporal record
```

It does not mean:

- the chain witnessed it;
- another device received it;
- the participant acted because of it;
- the participant was ready;
- the participant consented to disclosure;
- the observation has metaphysical meaning.

A local receipt should bind, when available:

```text
- receipt ID
- anchor ID
- anchor schema version
- content digest
- local runtime/device signer ID
- persistedAt
```

The signer attests to the local record, not to cosmic or symbolic truth beyond the declared source facts.

## Synchronization boundary

When anchors move between participant-owned devices:

- original `capturedAt` and source provenance remain unchanged;
- synchronization time is a separate event;
- conflict resolution may not rewrite the original observation silently;
- one device's timezone/display preference may not mutate the anchor's source time scale;
- ordering metadata must not become an inference of intent.

## Protocol witness boundary

An anchor may be submitted for protocol witnessing only when an independently defined system requirement actually needs irreversible/federated finality.

Examples may later include selected legal, governance, economic, security, institutional, or civilizational receipts.

A protocol witness should carry only the minimum factual material required, preferably through a digest/reference rather than unnecessary private source data.

Protocol finality may establish:

```text
this designated fact/digest was witnessed/finalized at protocol state N
```

It may not establish:

```text
the time was spiritually favorable
the participant was ready
the participant should have acted
the participant gained worth or status
the astronomical configuration granted permission
```

## Geometry relationship

`TempusAnchor` can position or annotate an ARCnet visual frame without changing its local geometry or semantics.

If a renderer transports the stable ARCnet frame through a Tempus visualization, it must preserve the coordinate-frame contract defined by:

```text
docs/specs/geometry/arcnet-coordinate-frame.md
```

Tempus may alter presentation translation/orientation/context.

Tempus may not rewrite:

- Identity sovereignty;
- local coordinate identities;
- module boundaries;
- capability state;
- authority;
- economic state;
- governance state;
- Vitae recognition/progression.

## Geometry-free equivalent

Every temporal state required for operation must have a non-geometric representation.

Minimum card/list representation:

```text
Temporal observation
- captured time
- time scale
- source/provider/model/version
- observer
- frame / epoch rule
- target / coordinates when applicable
- precision
- provenance
- local receipt state
- network witness state
- optional separately labeled interpretation
```

No information necessary for consent, authority, provenance, or verification may exist only inside animation or celestial geometry.

## Falsification tests

### T1 — offline creation

A system-clock `TempusAnchor` can be created and persisted with no network connection.

### T2 — no mandatory astronomy

The runtime can create a valid anchor without ephemeris data.

### T3 — provenance completeness

An astronomical anchor cannot claim a coordinate without an explicit target, observer/center, frame/reference plane, epoch/of-date rule, source/model, time context, and precision posture.

### T4 — frame separation

Changing from heliocentric physical view to geocentric apparent sky view changes the declared frame, not merely the camera label.

### T5 — local/chain separation

Creating or updating a local anchor produces no automatic protocol transaction.

### T6 — authority firewall

Changing timestamp, solar longitude, symbolic sector, season, pose, or astronomical coincidence cannot activate a capability without a separate authorized input.

### T7 — no timing coercion

The application can display an expired/passed window without penalty, shame, loss of worth, forced action, or urgency scoring.

### T8 — privacy minimization

A user can use ordinary Tempus clock/cycle features without disclosing precise location.

### T9 — immutable provenance

Synchronization/rendering cannot silently rewrite the anchor's original source, observer, frame, captured time, or model/version.

### T10 — geometry-free equivalence

All factual temporal and witness state can be understood without a 3D visualization.

## Explicit CE-W01 non-scope

The baseline does not require:

- a mandatory zodiac user interface;
- a mandatory dodecahedron;
- a mandatory 72-sector compass;
- Goetic, angelic, planetary, archetypal, or other correspondence data;
- astrological causation;
- lunar-gate authorization;
- Tempus-driven Vitae advancement;
- a Tempus×Vitae torus;
- planetary assignment to ARCnet applications;
- automatic ephemeris polling receipts;
- automatic chain settlement;
- prediction of participant behavior, readiness, destiny, or benefit.

These remain optional research or later explicitly gated features.

## Machine-verifiable status

CE-W01 now provides the machine-readable `TempusAnchor` schema, deterministic serialization/digest vectors, deterministic Tempus verification, semantic `ClockProvider` boundaries, optional ephemeris-provider semantics, and an opaque local signing-handle boundary.

These completed semantic and machine-contract items are no longer future implementation gates.

## Remaining implementation gates

Before CE-W02, Tempus still requires:

- binding a concrete `ClockProvider` implementation to the semantic runtime interface;
- persistence/restart tests;
- optional ephemeris-provider implementation;
- implementation and testing of local receipt signing through the opaque signing handle;
- location/privacy tests for location-free default use and participant-controlled topocentric features;
- a later explicit protocol-witness envelope without making network finality mandatory.

Temporal or astronomical data remains context and provenance only. It never grants identity, capability, recognition, economic, governance, protocol, or authority semantics.
