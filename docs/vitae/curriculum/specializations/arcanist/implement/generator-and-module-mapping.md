---
title: "The Arcanist Generator & Module Mapping"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# The Arcanist Generator & Module Mapping
## **Generator & Module Mapping**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

**Transparency Note:** Some earlier reference uploads have expired in this environment (expected system behavior). This mapping is derived from the locked Arcanist canons and does not depend on those files. Re-upload is optional for later alignment checks.

This document defines the **runtime modules**, **data contracts**, and **system boundaries** required to implement the **Arcanist specialization**. It mirrors the implementation pattern used for the Core Vitae grades, adapted for specialization overlays.

This mapping is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Arcanum Vitae — Specialization Overview Codex  
* Arcanum Vitae — Cross-Specialization Mastery Paths Canon  
* The Arcanist — Master Canon  
* The Arcanist — System Responsibilities & Invariants Canon  
* The Arcanist — Procedural Systems Canon

---

## **I. Module Topology (Specialization Overlay)**

**Client / App Layer**

* Arcanist UI surfaces (reading, comparison, inquiry prompts)  
* Annotation & note capture (non-authoritative)

**Core Runtime Layer**

* Specialization Progress Engine (overlay)  
* Generator Orchestrator (specialization scope)  
* Tempus Adapter (pacing inherited from Core Vitae)

**Integrity Layer**

* Policy Engine (epistemic invariants)  
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
* specialization\_id \= ARCANIST  
* state (ACTIVE | PAUSED | STALLED)  
* focus\_vector (optional; non-scoring)  
* last\_active\_at

Forbidden:

* rank, titles, authority flags

---

### **B. Specialization Progress Cursor (SPC)**

* specialization\_id  
* depth\_index (non-linear)  
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
* context (time\_of\_day, reading\_duration)

---

### **D. Generated Unit (SGU)**

* unit\_id  
* specialization\_id  
* seed  
* kernel\_refs (\>=1 epistemic kernel)  
* prompts (bounded, non-interpretive)  
* completion\_criteria (binary, non-performative)  
* ia\_binding (exactly one)  
* fo\_targets (\>=1)

Forbidden:

* truth claims  
* certainty scoring  
* identity labeling

---

### **E. Completion Event (SCE)**

* practitioner\_id  
* unit\_id  
* completed\_at  
* attestation (yes/no)  
* notes (optional)

Invariant:

* SCE cannot grant authority or progression acceleration

---

## 

## **III. Core Modules**

### **1\) Specialization Progress Engine**

**Purpose:** Maintain Arcanist overlay state.

**Must enforce:**

* Non-hierarchy  
* No authority inflation  
* Independence from Core Vitae state

**Failure behavior:**

* Invariant violation → HARD FAIL → stall specialization

---

### **2\) Generator Orchestrator (Arcanist Scope)**

**Purpose:** Assemble epistemic inquiry units.

**Must enforce:**

* Kernel anchoring (knowledge without certainty)  
* Deterministic seed assignment  
* Policy Engine checks pre/post

---

### **3\) Policy Engine (Epistemic Constraints)**

**Must enforce:**

* No truth declaration  
* No certainty claims  
* No epistemic superiority  
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
* Epistemic violation detection

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

## 

## 

## 

## **VI. Constraint Bundles (Arcanist)**

Each SGR resolves to exactly one **Arcanist Constraint Bundle**, composed of:

* Epistemic kernel set  
* Prohibited claim list  
* IA binding  
* FO targets

---

## **VII. Minimal API Surface (Conceptual)**

* GET /specialization/state  
* POST /specialization/request-unit  
* POST /specialization/complete-unit  
* GET /specialization/audit/sample (internal)

---

## **VIII. Canonical Assertion**

If an implementation enables truth claims, certainty scoring, or epistemic authority, it is invalid.

This mapping defines a **valid Arcanist specialization implementation**.

---

**End of The Arcanist — Generator & Module Mapping**
