---
title: "The Illusionist Generator & Module Mapping"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# The Illusionist Generator & Module Mapping
## **Generator & Module Mapping**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

**Transparency Note:** Some earlier uploaded reference PDFs/files have expired in this environment (expected system behavior). This mapping is derived from the **locked Illusionist canons** and does not depend on expired uploads. If you want alignment against earlier drafts, please re-upload those files.

This document defines the **runtime modules**, **data contracts**, and **system boundaries** required to implement the **Illusionist specialization**. It mirrors the implementation pattern used for the Core Vitae grades, the Arcanist, and the Philosopher, adapted for perceptual hygiene and distortion-detection overlays.

This mapping is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Arcanum Vitae — Specialization Overview Codex  
* Arcanum Vitae — Cross-Specialization Mastery Paths Canon  
* The Illusionist — Master Canon  
* The Illusionist — System Responsibilities & Invariants Canon  
* The Illusionist — Procedural Systems Canon

---

## **I. Module Topology (Specialization Overlay)**

**Client / App Layer**

* Illusionist UI surfaces (perception checks, narrative deconstruction prompts)  
* Visual distortion cues (non-interpretive)

**Core Runtime Layer**

* Specialization Progress Engine (overlay)  
* Generator Orchestrator (specialization scope)  
* Tempus Adapter (pacing inherited from Core Vitae)

**Integrity Layer**

* Policy Engine (perceptual safety & non-superiority constraints)  
* Audit Harness (sampling \+ replay)

**Data Layer**

* Specialization State Store  
* Event Log (append-only)  
* Seed Registry (deterministic replay)

**Governance Layer**

* Version Registry  
* Pause / Rollback Controls

---

## **II. Shared Data Contracts**

### **A. Specialization Profile (SP)**

* practitioner\_id  
* specialization\_id \= ILLUSIONIST  
* state (ACTIVE | PAUSED | STALLED)  
* distortion\_focus (optional; non-scoring)  
* last\_active\_at

Forbidden:

* rank, authority flags, superiority markers

---

### **B. Specialization Progress Cursor (SPC)**

* specialization\_id  
* perception\_axis (e.g., bias | projection | narrative | illusion)  
* unit\_id (current)

Invariant:

* SPC does not affect Core Vitae progression

---

### **C. Generation Request (SGR)**

* practitioner\_id  
* specialization\_id  
* SPC  
* seed (optional; assigned if absent)  
* constraint\_bundle\_id  
* context (time\_of\_day, cognitive\_load\_estimate)

---

### **D. Generated Unit (SGU)**

* unit\_id  
* specialization\_id  
* seed  
* kernel\_refs (\>=1 perceptual hygiene kernel)  
* prompts (bounded; non-interpretive)  
* observation\_task (optional; noticing without correcting)  
* completion\_criteria (binary, non-performative)  
* ia\_binding (exactly one)  
* fo\_targets (\>=1)

Forbidden:

* claims of seeing "through" others  
* superiority framing  
* truth declaration  
* identity labeling

---

### **E. Completion Event (SCE)**

* practitioner\_id  
* unit\_id  
* completed\_at  
* attestation (yes/no)  
* notes (optional)

Invariant:

* SCE cannot grant authority or accelerate any progression

---

## **III. Core Modules**

### **1\) Specialization Progress Engine**

**Purpose:** Maintain Illusionist overlay state.

**Must enforce:**

* No perceptual superiority  
* No interpretive authority  
* Independence from Core Vitae state

**Failure behavior:**

* Invariant violation → HARD FAIL → stall specialization

---

### **2\) Generator Orchestrator (Illusionist Scope)**

**Purpose:** Assemble perceptual hygiene units.

**Must enforce:**

* Kernel anchoring (awareness without correction)  
* Deterministic seed assignment  
* Policy Engine checks pre/post

---

### **3\) Policy Engine (Perceptual Constraints)**

**Must enforce:**

* No claims of seeing truth  
* No diagnostic labeling of self or others  
* No superiority or awakening narratives  
* Consent and reversibility

---

### **4\) Tempus Adapter**

**Purpose:** Inherit pacing from Core Vitae without acceleration.

---

## **IV. Integrity & Audit Modules**

### **5\) Seed Registry**

* Immutable seed-to-unit mapping  
* Enables deterministic replay

### **6\) Event Log**

* Append-only  
* Stores SGR, SGU, SCE, policy decisions

### **7\) Audit Harness**

* Sampling and replay  
* Perceptual authority drift detection

---

## **V. Governance & Versioning**

### **8\) Version Registry**

* Kernel versions  
* Policy versions  
* Generator templates

### **9\) Pause / Rollback Controls**

* Pause specialization  
* Roll back policy versions  
* No manual advancement

---

**VI. Constraint Bundles (Illusionist)**

Each SGR resolves to exactly one **Illusionist Constraint Bundle (ICB)** composed of:

* Perceptual kernel set  
* Observation-only prompt grammar  
* Prohibited superiority/truth list  
* IA binding  
* FO targets

Invariant:

* Every SGU must declare its `constraint_bundle_id`.

---

## **VII. Minimal API Surface (Conceptual)**

* GET /specialization/state  
* POST /specialization/request-unit  
* POST /specialization/complete-unit  
* GET /specialization/audit/sample (internal)

---

## **VIII. Canonical Assertion**

If an implementation enables perceptual superiority, interpretive authority, or truth claims, it is invalid.

This mapping defines a **valid Illusionist specialization implementation**.

---

**End of The Illusionist — Generator & Module Mapping**
