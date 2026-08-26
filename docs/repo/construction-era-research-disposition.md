---
title: "Construction Era Research Branch Disposition"
status: implementation-candidate
visibility: public
phase: "Pre-Genesis"
era: "Construction Era"
wave: "CE-W01"
last_updated: 2026-08-26
authority: "audit evidence only; no disposition here self-ratifies canon"
source_issue: "https://github.com/The-Architect-369/Arcanum/issues/39"
research_branch: "docs/creation-era-architecture-trail"
research_head: "5e4be0cd733845e21a172b122aa8c1b157b4f674"
stable_base: "cfd332516597501301b7a1ad4d0fc84943ed57f5"
---

# Construction Era Research Branch Disposition

## Purpose

This document records the artifact-by-artifact and family-by-family disposition audit of the post-Wave-XXIV research branch before any research material is consolidated into the Construction Era baseline.

It complements `construction-era-consolidation-ledger.md` and must be read as audit evidence rather than canonical architecture.

## Exact comparison grounding

At audit start:

```text
base: main@cfd332516597501301b7a1ad4d0fc84943ed57f5
head: docs/creation-era-architecture-trail@5e4be0cd733845e21a172b122aa8c1b157b4f674
status: ahead
commits ahead: 147
commits behind: 0
merge base: cfd332516597501301b7a1ad4d0fc84943ed57f5
```

The research branch therefore has one clean stable ancestor. Consolidation does not require conflict archaeology; it requires evidence-based selection.

GitHub's compare metadata reports some files with zero textual additions/deletions when patch statistics are not materialized. That metadata must not be interpreted as proof that those files are empty. Content-level disposition requires opening the source artifact.

## Disposition states

Primary dispositions are:

- `PROMOTE` — artifact or bounded content is ready for active baseline after verification.
- `SYNTHESIZE` — surviving content should be rewritten into a smaller authoritative artifact.
- `RETAIN-AS-RESEARCH` — useful evidence remains, but it is not active authority.
- `RELOCATE` — content survives but belongs in a different repository layer.
- `ARCHIVE` — historical/rejected evidence worth preserving outside active research.
- `RETIRE` — no durable value remains after surviving knowledge is preserved.

This audit additionally uses `VERIFY-BEFORE-PROMOTE` and `AUDIT-PENDING` as temporary qualifiers. They are not final primary dispositions.

## Tranche 1 — branch-family separation

### A. Capability evaluator application stream

Paths:

```text
apps/web/src/app/(app)/vitae/capabilities/CapabilityEvaluatorDemo.tsx
apps/web/src/app/(app)/vitae/capabilities/VerifiableCapabilityEvaluatorDemo.tsx
apps/web/src/app/(app)/vitae/capabilities/page.tsx
apps/web/src/lib/capabilities/authorization-gate.ts
apps/web/src/lib/capabilities/authorization-gate.vectors.ts
apps/web/src/lib/capabilities/evaluator.ts
apps/web/src/lib/capabilities/evaluator.vectors.ts
apps/web/src/lib/capabilities/policies.ts
apps/web/src/lib/capabilities/verifiable.demo.ts
apps/web/src/lib/capabilities/verifiable.ts
apps/web/src/lib/capabilities/verifiable.vectors.ts
docs/architecture/capability-authorization-gate-implementation.md
docs/architecture/capability-state-evaluator-implementation.md
docs/architecture/capability-verifiable-records-implementation.md
docs/architecture/registries/arcnet-authorization-gate.v0.2.json
docs/architecture/registries/arcnet-capability-requirements.v0.1.json
docs/architecture/registries/arcnet-capability-state-evaluator.v0.1.json
docs/architecture/registries/arcnet-capability-verifiable-records.v0.2.json
```

Primary disposition: **RETAIN-AS-RESEARCH**.

Construction-baseline action: **do not import into CE-W01 implementation**.

Reasoning:

- this stream is materially different from the geometry/Tempus consolidation purpose;
- its own implementation document says the evaluator is not an authorization service and remains design-candidate implementation evidence;
- it has unresolved production prerequisites around signed provenance, grants, lifecycle, destination verification, Edge Contract invocation, decision receipts, and policy digests;
- importing the code because it shares a research branch would collapse an independent capability/authorization workstream into the native-runtime baseline without a dedicated wave gate.

Surviving principles may later be synthesized into the capability architecture, especially the firewall that geometry, display titles, and current Vitae position are non-authorizing inputs.

### B. Whole-system geometry synthesis sources

Paths:

```text
docs/architecture/arcanum-living-system-intent-and-direction.md
docs/architecture/creation-era-architecture-trail.md
docs/architecture/creation-era-whole-system-falsification-audit.md
docs/architecture/nested-geometry-research-map.md
docs/architecture/sovereign-faculty-geometry.md
docs/architecture/arcnet-transported-frame-audit.md
docs/architecture/arcnet-vitae-nested-cosmic-motion-audit.md
docs/architecture/tree-of-life-vitae-tempus-stellar-cube-study.md
docs/architecture/platonic-scale-frame-and-vitae-mathematics-audit.md
docs/architecture/platonic-cosmology-source-and-science-audit.md
```

Primary disposition: **SYNTHESIZE**.

Construction-baseline target: a compact Geometry & Mathematics authority surface plus clearly labeled research provenance.

Already-supported surviving constraints include:

- registry/source meaning precedes geometric projection;
- semantic edge is not automatically executable edge;
- geometry does not create authority;
- self-similar layers require a scale firewall;
- Identity is not merely a geometric point;
- geometric accessibility must have a geometry-free equivalent;
- exact mathematical object, project symbolic name, screen projection, and runtime behavior must remain separately typed;
- no module/application/authority may be invented merely to satisfy a numerical or geometric count.

The sovereign-faculty artifact remains explicitly non-canonical and acknowledges that the current canonical module registry controls until a future Module Architecture v2 review. Therefore it is evidence for synthesis, not a direct promotion artifact.

### C. ARCnet edge studies

Paths:

```text
docs/architecture/arcnet-edge-contract.md
docs/architecture/edge-studies/arcanum-aerarium.md
docs/architecture/edge-studies/arcanum-commercium.md
docs/architecture/edge-studies/arcanum-imperium.md
docs/architecture/edge-studies/arcanum-nexus.md
docs/architecture/edge-studies/arcanum-protection.md
docs/architecture/edge-studies/arcanum-theatrum.md
docs/architecture/edge-studies/architect-aerarium.md
docs/architecture/edge-studies/architect-imperium.md
docs/architecture/edge-studies/architect-protection.md
docs/architecture/edge-studies/commercium-architect.md
docs/architecture/edge-studies/commercium-imperium.md
docs/architecture/edge-studies/commercium-protection.md
docs/architecture/edge-studies/commercium-theatrum.md
docs/architecture/edge-studies/cross-tetrahedron-operational-synthesis.md
docs/architecture/edge-studies/generative-tetrahedron-synthesis.md
docs/architecture/edge-studies/imperium-aerarium.md
docs/architecture/edge-studies/nexus-aerarium.md
docs/architecture/edge-studies/nexus-architect.md
docs/architecture/edge-studies/nexus-commercium.md
docs/architecture/edge-studies/nexus-protection.md
docs/architecture/edge-studies/nexus-theatrum.md
docs/architecture/edge-studies/protection-aerarium.md
docs/architecture/edge-studies/protection-imperium.md
docs/architecture/edge-studies/stewardship-tetrahedron-synthesis.md
docs/architecture/edge-studies/theatrum-aerarium.md
docs/architecture/edge-studies/theatrum-architect.md
docs/architecture/edge-studies/theatrum-imperium.md
```

Primary disposition: **RETAIN-AS-RESEARCH**.

Secondary action: **SYNTHESIZE** only the relationship laws that survive the full family audit.

Reasoning:

- the branch's own falsification work rejects treating every possible K8 pair as a required executable contract;
- detailed bilateral studies preserve useful provenance and domain reasoning but would overload the active architecture surface;
- CE-W01 requires stable coordinate/runtime/temporal contracts, not a premature ratification of all future system-to-system edge semantics.

No edge study may be promoted merely because an eight-point graph mathematically permits the relationship.

### D. Inner junction studies

Paths:

```text
docs/architecture/junction-studies/01-commons-witness.md
docs/architecture/junction-studies/02-practice-safety.md
docs/architecture/junction-studies/03-cultural-commons.md
docs/architecture/junction-studies/04-market-assurance.md
docs/architecture/junction-studies/05-creator-public-goods.md
docs/architecture/junction-studies/06-standards-and-rights.md
docs/architecture/junction-studies/inner-junction-neighbor-edge-audit.md
docs/architecture/junction-studies/inner-octahedron-synthesis-and-orientation.md
```

Primary disposition: **RETAIN-AS-RESEARCH**.

Construction-baseline synthesis law: an inner geometric junction may be a presentation/composition coordinate, but it is not automatically an application, sovereign actor, authority source, or runtime executor.

### E. Hope relational geometry

Paths:

```text
docs/architecture/hope-a2-inner-portrait.md
docs/architecture/hope-fixed-nodes-and-internal-edge-audit.md
```

Primary disposition: **SYNTHESIZE**.

Required safeguards before promotion of any derived model:

- participant observation must not harden into personality typing;
- any observation/projection requires source/provenance and revisability where applicable;
- geometry may organize reflection without defining identity, worth, capability, or destiny;
- Hope remains subject to controlling module/doctrine boundaries.

### F. Classical Seven research

Paths:

```text
docs/architecture/classical-seven-archetype-layer.md
docs/architecture/classical-seven-axis-falsification.md
docs/architecture/classical-seven-lens-model-test.md
```

Primary disposition: **RETAIN-AS-RESEARCH**.

Reasoning: the branch treats the Classical Seven as an exploratory lens/archetype layer. It is not required for the CE-W01 runtime or coordinate minimum and must remain clearly separated from empirical astronomy and authorization.

### G. Tempus observer/frame mathematics

Opened source:

```text
docs/architecture/registries/tempus-observer-frame-and-scale-registry.v0.1.json
```

Primary disposition: **SYNTHESIZE** with qualifier **VERIFY-BEFORE-PROMOTE**.

Strong surviving content:

- separation of solar-system barycentric, heliocentric, geocentric apparent, topocentric, and body-fixed frames;
- explicit observer/center and axes;
- explicit physical versus angular presentation domains;
- exact distinction between an astronomical unit and Earth's instantaneous solar distance;
- frame translation boundaries;
- explicit warning that a simple geometric transform is not a production apparent ephemeris;
- required ephemeris/time provenance;
- explicit separation of physical-scale and compressed presentation-scale values;
- law that a viewpoint may be central to experience without being central to cosmology.

Before any numerical/source claim is promoted, its external scientific references must be independently verified against current authoritative sources.

Construction-baseline target: derive the minimal `TempusAnchor` source/observer/frame/time/provenance contract rather than importing the full research registry unchanged.

### H. Tempus geometry, ephemeris, and phase-space family

Paths:

```text
docs/architecture/tempus-72-correspondence-source-audit.md
docs/architecture/tempus-72-sector-render-findings.md
docs/architecture/tempus-arcnet-ephemeris-unified-render-findings.md
docs/architecture/tempus-dodecahedron-geometry-audit.md
docs/architecture/tempus-ephemeris-arcnet-unification-audit.md
docs/architecture/tempus-lunar-gate-audit.md
docs/architecture/tempus-lunar-unified-render-findings.md
docs/architecture/tempus-solar-system-gaia-render-findings.md
docs/architecture/tempus-solar-system-observatory-and-platonic-precedent-audit.md
docs/architecture/tempus-solar-system-observatory-render-findings.md
docs/architecture/tempus-vitae-duality-audit.md
docs/architecture/tempus-vitae-eventful-unification-and-icosahedral-cell-audit.md
docs/architecture/tempus-vitae-eventful-unification-render-findings.md
docs/architecture/tempus-vitae-live-phase-audit.md
docs/architecture/registries/tempus-72-correspondence-source-registry.v0.1.json
docs/architecture/registries/tempus-72-sector-coordinate.v0.1.json
docs/architecture/registries/tempus-cosmic-motion-correspondence.v0.1.json
docs/architecture/registries/tempus-dodecahedral-compass-registry.v0.1.json
docs/architecture/registries/tempus-ephemeris-arcnet-unification-registry.v0.1.json
docs/architecture/registries/tempus-geocentric-sky-window-registry.v0.1.json
docs/architecture/registries/tempus-lunar-ephemeris-overlay.v0.1.json
docs/architecture/registries/tempus-solar-system-gaia-frame.v0.1.json
docs/architecture/registries/tempus-solar-system-observatory-registry.v0.1.json
docs/architecture/registries/tempus-vitae-becoming-field-registry.v0.1.json
docs/architecture/registries/tempus-vitae-eventful-unification-registry.v0.1.json
docs/architecture/registries/tempus-vitae-live-phase-projection.v0.1.json
docs/architecture/registries/tempus-zodiac-registry.v0.1.json
```

Primary disposition: **RETAIN-AS-RESEARCH** with bounded **SYNTHESIZE** targets.

Immediate Construction synthesis targets:

1. source/observer/frame/time provenance;
2. coordinate-domain separation;
3. local `TempusAnchor` semantics;
4. transport/persistence rules;
5. astronomy/symbolism authority firewall;
6. optional later protocol witness semantics.

Not required for CE-W01 baseline activation:

- mandatory 72-sector UI;
- mandatory zodiac presentation;
- full dodecahedral compass ontology;
- lunar/solar live rendering suite;
- Tempus × Vitae torus/phase-space UI;
- automatic chain witness of ephemeris movement.

Those may remain future research even if mathematically coherent.

### I. Vitae geometry and curriculum projection family

Paths:

```text
docs/architecture/sefer-yetzirah-articulation-timbre-audit.md
docs/architecture/tree-letter-wheel-harmonic-audit.md
docs/architecture/vitae-arcnet-capability-overlay-audit.md
docs/architecture/vitae-harmonic-rendering-findings.md
docs/architecture/vitae-icosahedral-achievement-axis-decision.md
docs/architecture/vitae-icosahedral-specialization-family-audit.md
docs/architecture/vitae-icosahedron-g10-2-follow-up.md
docs/architecture/vitae-icosahedron-geometry-audit.md
docs/architecture/vitae-tree-transformation-render-findings.md
docs/architecture/registries/sefer-yetzirah-articulation-sonification-registry.v0.1.json
docs/architecture/registries/sefer-yetzirah-letter-coordinate-matrix.v0.1.json
docs/architecture/registries/sefer-yetzirah-letter-wheel-registry.v0.1.json
docs/architecture/registries/tree-harmonic-sonification-overlay.v0.1.json
docs/architecture/registries/vitae-arcnet-capability-overlay.v0.1.json
docs/architecture/registries/vitae-curriculum-registry.v0.1.json
docs/architecture/registries/vitae-grade-cycle-registry.v0.1.json
docs/architecture/registries/vitae-harmonic-rendering-projection.v0.1.json
docs/architecture/registries/vitae-icosahedral-achievement-axis.v0.1.json
docs/architecture/registries/vitae-icosahedral-fivefold-orientation.v0.1.json
docs/architecture/registries/vitae-resonance-overlay.v0.1.json
docs/architecture/registries/vitae-specialization-fivefold-family-audit.v0.1.json
docs/architecture/registries/vitae-tree-of-life-class-registry.v0.1.json
docs/architecture/registries/vitae-tree-of-life-path-registry.v0.1.json
docs/architecture/registries/vitae-tree-transformation-operator-registry.v0.1.json
```

Primary disposition: **RETAIN-AS-RESEARCH**.

Secondary action: **SYNTHESIZE** only source-grounded curriculum relations needed by future Embodiment waves.

The baseline must preserve the already-surviving rejection of geometry as a progress meter, fixed curriculum adjacency merely because of icosahedral edges, fixed grade-specialization spokes, or symbolic geometry as recognition/authorization input.

### J. Core geometry/projection registries

Paths:

```text
docs/architecture/registries/arcnet-transported-frame-projection.v0.1.json
docs/architecture/registries/arcnet-vitae-nested-subframe-projection.v0.1.json
docs/architecture/registries/becoming-field-geometry-registry.v0.1.json
docs/architecture/registries/platonic-solid-exact-metrics.v0.1.json
docs/architecture/registries/registry-validation-v0.1.md
```

Primary disposition: **SYNTHESIZE** with qualifier **VERIFY-BEFORE-PROMOTE**.

These are candidate inputs to the CE-W01 Geometry & Mathematics registry surface. Exact metrics and transformation claims require independent mathematical/source verification; presentation-only registries must not be confused with runtime authority.

### K. Research renderings

Paths:

```text
docs/architecture/renderings/arcnet-transported-stellar-frame-3d-v0.1.html
docs/architecture/renderings/arcnet-vitae-nested-subframe-3d-v0.1.html
docs/architecture/renderings/sefer-yetzirah-letter-coordinate-matrix-v0.1.svg
docs/architecture/renderings/tempus-72-sector-dodecahedral-compass-v0.1.html
docs/architecture/renderings/tempus-arcnet-ephemeris-unified-3d-v0.1.html
docs/architecture/renderings/tempus-arcnet-solar-lunar-unified-3d-v0.1.html
docs/architecture/renderings/tempus-solar-system-gaia-arcnet-v0.1.html
docs/architecture/renderings/tempus-vitae-arcnet-eventful-unification-3d-v0.1.html
docs/architecture/renderings/tempus-vitae-live-phase-field-v0.1.html
docs/architecture/renderings/vitae-articulation-operator-matrix-audition-v0.1.html
docs/architecture/renderings/vitae-class-harmonic-microcycle-v0.1.svg
docs/architecture/renderings/vitae-icosahedral-achievement-axis-v0.1.html
docs/architecture/renderings/vitae-tree-harmonic-audition-v0.1.html
docs/architecture/renderings/vitae-tree-transformation-audition-v0.1.html
docs/architecture/renderings/vitae-tree-transformation-grammar-v0.1.svg
docs/architecture/renderings/vitae-tree-variant-render-v0.1.svg
```

Primary disposition: **RELOCATE**.

Target: a deliberate research/prototype rendering area rather than the authoritative `docs/architecture/` surface.

Some renderings may eventually be **ARCHIVE** or **RETIRE** after the source registries and surviving visual findings are consolidated. No generated rendering is architectural authority by itself.

### L. Architect system-development method

Path:

```text
docs/governance/architectgpt/system-development-method.md
```

Primary disposition: **SYNTHESIZE**.

Reasoning:

- it explicitly remains non-canonical design evidence;
- its Arc → Wave → Milestone grammar is already reflected in the Construction roadmap;
- it correctly preserves the separate bounded-operation lifecycle `GROUND → INSPECT → DIAGNOSE → PLAN → AUTHORIZE → ACT → VERIFY → RECORD`;
- it keeps Human review/ratification as a constitutional boundary;
- it rejects self-ratification, productivity-as-worth, and gamified status.

The surviving methodology should be reconciled with the canonical Architect specification/manifest rather than copied wholesale into authority.

### M. Repository index changes on research branch

Paths:

```text
docs/repo/repo-index.json
scripts/repo-index.sh
```

Primary disposition: **AUDIT-PENDING**.

The branch contains deterministic provenance-hash work at its head. The generator changes must be compared against the current Construction branch and validated independently before any script change is carried over. The research branch's generated index itself must not be promoted because the target tree will differ after consolidation.

## Tranche 1 conclusions

The research branch is not one promotable unit. It contains at least five distinct evidence classes:

1. foundational geometry/Tempus ideas worth synthesis;
2. detailed relationship/curriculum/symbolic research worth retaining as research;
3. generated/prototype renderings that should be relocated out of active architecture;
4. an independent capability-evaluator implementation stream that should not enter CE-W01;
5. repository-index tooling changes requiring separate verification.

This supports the clean-branch strategy: construct the final baseline from `construction/ce-w01-baseline` and selectively synthesize surviving research rather than merging `docs/creation-era-architecture-trail`.

## Next audit tranche

Open and evaluate the source artifacts that can materially affect CE-W01:

1. exact ARCnet stellar-frame and Platonic metrics;
2. whole-system falsification findings;
3. transported-frame registry;
4. Tempus ephemeris unification registry;
5. Tempus 72-sector coordinate registry;
6. current canonical module registry conflict with sovereign-faculty hypothesis;
7. research repo-index generator changes;
8. current root workspace/package inconsistency.

The next tranche should begin producing explicit `PROMOTE` versus `SYNTHESIZE` decisions for the minimal Geometry & Mathematics and Tempus baseline contracts.