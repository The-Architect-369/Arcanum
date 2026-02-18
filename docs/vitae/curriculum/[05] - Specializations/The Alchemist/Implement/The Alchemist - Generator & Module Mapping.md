---
title: "The Alchemist Generator & Module Mapping"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---

# The Alchemist Generator & Module Mapping
## **Generator & Module Mapping**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

**Transparency Note (File Expiry):** Some previously uploaded reference PDFs/files have expired in this environment (expected system behavior). This mapping is derived from the **locked Alchemist specialization canons created in-session** and does not depend on expired uploads. If you want alignment against older draft PDFs, please re-upload those references.

This document defines the **runtime modules**, **data contracts**, and **system boundaries** required to implement the **Alchemist specialization**. It mirrors the implementation pattern used for the Core Vitae grades and prior specialization mappings, adapted for **ethical transformation via synthesis under constraint**.

This mapping is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Arcanum Vitae — Specialization Overview Codex  
* Arcanum Vitae — Cross-Specialization Mastery Paths Canon  
* The Alchemist — Master Canon  
* The Alchemist — System Responsibilities & Invariants Canon  
* The Alchemist — Procedural Systems Canon

---

## **I. Module Topology (Specialization Overlay)**

**Client / App Layer**

* Alchemist UI surfaces (transformation lab, hypothesis journaling, reversal plans)  
* Safety disclosures \+ reversibility reminders

**Core Runtime Layer**

* Specialization Progress Engine (overlay)  
* Generator Orchestrator (specialization scope)  
* Tempus Adapter (pacing inherited from Core Vitae)

**Integrity Layer**

* Policy Engine (ethical transformation \+ reversibility constraints)  
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
* specialization\_id \= ALCHEMIST  
* state (ACTIVE | PAUSED | STALLED)  
* experiment\_focus (optional; non-scoring)  
* last\_active\_at

Forbidden:

* power promises  
* irreversible transformation claims

---

### **B. Specialization Progress Cursor (SPC)**

* specialization\_id  
* synthesis\_axis (e.g., constraint | mixture | refinement | reversal)  
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
* context (available\_time, environment\_tag, risk\_tolerance\_self\_report optional)  
* history\_summary (bounded)

---

### **D. Generated Unit (SGU)**

* unit\_id  
* specialization\_id  
* seed  
* kernel\_refs (\>=1 synthesis/constraint kernel)  
* prompts (bounded; hypothesis-driven)  
* transformation\_task (small, reversible)  
* reversal\_plan (required field; simple undo / restore action)  
* completion\_criteria (binary, non-performative)  
* safety\_notes (required when risk \> low)  
* ia\_binding (exactly one)  
* fo\_targets (\>=1)

Forbidden:

* irreversible actions  
* coercive escalation  
* identity formation via “transformation”

---

### **E. Completion Event (SCE)**

* practitioner\_id  
* unit\_id  
* completed\_at  
* attestation (yes/no)  
* reversal\_executed (yes/no/na)  
* notes (optional)

Invariant:

* SCE cannot grant authority or accelerate any progression

---

## **III. Core Modules**

### **1\) Specialization Progress Engine**

**Purpose:** Maintain Alchemist overlay state.

**Must enforce:**

* Reversibility requirement  
* Ethical constraint compliance  
* No escalation or power framing  
* Independence from Core Vitae state

**Failure behavior:**

* Invariant violation → HARD FAIL → stall specialization

---

### **2\) Generator Orchestrator (Alchemist Scope)**

**Purpose:** Assemble transformation units where synthesis occurs under constraint.

**Must enforce:**

* Kernel anchoring (ethical transformation)  
* Deterministic seed assignment  
* Reversal plan generation and validation  
* Policy Engine checks pre/post

---

### 

### 

### 

### 

### **3\) Policy Engine (Transformation Constraints)**

**Must enforce:**

* Every task must be reversible or safely bounded  
* No medical/clinical claims  
* No coercive behavior change  
* No identity-based transformation claims  
* Consent and exit

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
* Reversibility compliance checks  
* Escalation drift detection

---

## 

## 

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

## **VI. Constraint Bundles (Alchemist)**

Each SGR resolves to exactly one **Alchemist Constraint Bundle (ALC\_CB)** composed of:

* Synthesis/constraint kernel set  
* Hypothesis-driven prompt grammar  
* Required reversibility rules  
* Prohibited escalation/power list  
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

## 

## **VIII. Canonical Assertion**

If an implementation produces irreversible transformation tasks, promises of power, escalation pressure, or interferes with Core Vitae progression, it is invalid.

This mapping defines a **valid Alchemist specialization implementation**.

---

**End of The Alchemist — Generator & Module Mapping**

