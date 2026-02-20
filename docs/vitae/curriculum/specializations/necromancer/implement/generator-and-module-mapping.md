---
title: "The Necromancer Generator & Module Mapping"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# The Necromancer Generator & Module Mapping
## **Generator & Module Mapping**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

**Transparency Note:** Some previously uploaded reference PDFs/files have expired in this environment (expected system behavior). This mapping is derived from the **locked Necromancer canons** created in-session and does not depend on expired uploads. If you want alignment against earlier draft PDFs, please re-upload those references.

This document defines the **runtime modules**, **data contracts**, and **system boundaries** required to implement the **Necromancer specialization**. It mirrors the implementation pattern used for the Core Vitae grades and prior specialization mappings, adapted for **working with endings, decay, loss, and continuity without nihilism or control**.

This mapping is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Arcanum Vitae — Specialization Overview Codex  
* Arcanum Vitae — Cross-Specialization Mastery Paths Canon  
* The Necromancer — Master Canon  
* The Necromancer — System Responsibilities & Invariants Canon  
* The Necromancer — Procedural Systems Canon

---

## **I. Module Topology (Specialization Overlay)**

**Client / App Layer**

* Necromancer UI surfaces (grief processing, impermanence reflection)  
* Memory and continuity journaling (non-possessive)

**Core Runtime Layer**

* Specialization Progress Engine (overlay)  
* Generator Orchestrator (specialization scope)  
* Tempus Adapter (pacing inherited from Core Vitae)

**Integrity Layer**

* Policy Engine (anti-nihilism, anti-control constraints)  
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
* specialization\_id \= NECROMANCER  
* state (ACTIVE | PAUSED | STALLED)  
* mortality\_focus (optional; non-scoring)  
* last\_active\_at

Forbidden:

* death mastery flags  
* domination over endings

---

### **B. Specialization Progress Cursor (SPC)**

* specialization\_id  
* cycle\_axis (e.g., ending | decay | remembrance | continuity)  
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
* context (life\_event\_tag, emotional\_intensity\_estimate)

---

### **D. Generated Unit (SGU)**

* unit\_id  
* specialization\_id  
* seed  
* kernel\_refs (\>=1 mortality/continuity kernel)  
* prompts (bounded; supportive, non-directive)  
* holding\_task (optional; grief/impermanence witnessing)  
* completion\_criteria (binary, non-performative)  
* ia\_binding (exactly one)  
* fo\_targets (\>=1)

Forbidden:

* control over death language  
* glorification of decay  
* nihilistic framing  
* resurrection fantasies

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

**Purpose:** Maintain Necromancer overlay state.

**Must enforce:**

* Careful containment of mortality themes  
* No mastery over death  
* Independence from Core Vitae state

**Failure behavior:**

* Invariant violation → HARD FAIL → stall specialization

---

### **2\) Generator Orchestrator (Necromancer Scope)**

**Purpose:** Assemble units that engage endings without control or nihilism.

**Must enforce:**

* Kernel anchoring (impermanence, remembrance)  
* Deterministic seed assignment  
* Policy Engine checks pre/post

---

### **3\) Policy Engine (Mortality Constraints)**

**Must enforce:**

* No domination of death  
* No nihilistic collapse  
* No resurrection or reversal fantasies  
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
* Nihilism or control drift detection

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

**VI. Constraint Bundles (Necromancer)**

Each SGR resolves to exactly one **Necromancer Constraint Bundle (NCB)** composed of:

* Mortality/continuity kernel set  
* Supportive prompt grammar  
* Prohibited domination/nihilism list  
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

If an implementation enables domination of death, nihilism, resurrection fantasy, or interference with Core Vitae progression, it is invalid.

This mapping defines a **valid Necromancer specialization implementation**.

---

**End of The Necromancer — Generator & Module Mapping**
