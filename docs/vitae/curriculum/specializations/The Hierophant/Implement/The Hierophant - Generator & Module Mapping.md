---
title: "The Hierophant Generator & Module Mapping"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# The Hierophant Generator & Module Mapping
## **Generator & Module Mapping**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

**Transparency Note:** Some previously uploaded reference PDFs/files have expired in this environment (expected system behavior). This mapping is derived from the **locked Hierophant canons** created in-session and does not depend on expired uploads. If you want alignment against earlier draft PDFs, please re-upload those references.

This document defines the **runtime modules**, **data contracts**, and **system boundaries** required to implement the **Hierophant specialization**. It mirrors the implementation pattern used for the Core Vitae grades and prior specialization mappings, adapted for **threshold stewardship without initiation authority**.

This mapping is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Arcanum Vitae — Specialization Overview Codex  
* Arcanum Vitae — Cross-Specialization Mastery Paths Canon  
* The Hierophant — Master Canon  
* The Hierophant — System Responsibilities & Invariants Canon  
* The Hierophant — Procedural Systems Canon

---

## **I. Module Topology (Specialization Overlay)**

**Client / App Layer**

* Hierophant UI surfaces (threshold visualization, transition pacing tools)  
* Liminal journaling (non-directive)

**Core Runtime Layer**

* Specialization Progress Engine (overlay)  
* Generator Orchestrator (specialization scope)  
* Tempus Adapter (pacing inherited from Core Vitae)

**Integrity Layer**

* Policy Engine (anti-initiation, anti-authority constraints)  
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
* specialization\_id \= HIEROPHANT  
* state (ACTIVE | PAUSED | STALLED)  
* threshold\_focus (optional; non-scoring)  
* last\_active\_at

Forbidden:

* rank, initiation authority flags, readiness judgments

---

### **B. Specialization Progress Cursor (SPC)**

* specialization\_id  
* threshold\_axis (e.g., preparation | crossing | integration)  
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
* context (transition\_stage, time\_of\_day)

---

### **D. Generated Unit (SGU)**

* unit\_id  
* specialization\_id  
* seed  
* kernel\_refs (\>=1 liminal/threshold kernel)  
* prompts (bounded; non-directive)  
* pacing\_task (optional; prepare/hold/release)  
* completion\_criteria (binary, non-performative)  
* ia\_binding (exactly one)  
* fo\_targets (\>=1)

Forbidden:

* initiation claims  
* readiness judgments  
* authority over transitions  
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

**Purpose:** Maintain Hierophant overlay state.

**Must enforce:**

* No initiation authority  
* No readiness judgments  
* Independence from Core Vitae state

**Failure behavior:**

* Invariant violation → HARD FAIL → stall specialization

---

### **2\) Generator Orchestrator (Hierophant Scope)**

**Purpose:** Assemble threshold units that support pacing without directing outcomes.

**Must enforce:**

* Kernel anchoring (liminality without initiation)  
* Deterministic seed assignment  
* Policy Engine checks pre/post

---

### **3\) Policy Engine (Threshold Constraints)**

**Must enforce:**

* No initiation language  
* No readiness declarations  
* No authority over transitions  
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
* Initiation authority drift detection

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

**VI. Constraint Bundles (Hierophant)**

Each SGR resolves to exactly one **Hierophant Constraint Bundle (HCB)** composed of:

* Liminal kernel set  
* Non-directive pacing grammar  
* Prohibited initiation/authority list  
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

If an implementation enables initiation authority, readiness judgment, or coercive transition control, it is invalid.

This mapping defines a **valid Hierophant specialization implementation**.

---

**End of The Hierophant — Generator & Module Mapping**

