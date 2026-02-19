---
title: "Grade Vii Constraint Bundle Spec"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# Grade Vii Constraint Bundle Spec
## **Grade VII — The Alchemist**

### **Constraint Bundle Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **Constraint Bundles** used by the Grade VII — The Alchemist generator. Constraint Bundles are computed, deterministic rule-sets that govern transformation staging, constraint-first design, consent, reversibility/rollback, stabilization gates, and anti-chaining limits. They translate Alchemist canons into enforceable runtime behavior.

**Note on reference assets:** Some older uploaded reference files may expire over time. This specification is derived from the sealed Grade VII canons and the implementation mapping already captured in the canonical document stack.

This document is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Intermediate School Canon  
* Grade VII — The Alchemist: Master Canon  
* Grade VII — The Alchemist: System Responsibility & Invariants Canon  
* Grade VII — The Alchemist: Procedural Systems Canon  
* Grade VII — The Alchemist: Generator & Module Mapping  
* Cross-Grade Dependency Canon (Intermediate)

---

**I. Purpose of Constraint Bundles**

An **Alchemist Constraint Bundle (ACB)** is a resolved, immutable set of constraints that:

* binds a generated unit to exactly one transformation posture  
* enforces staging order and constraint-first design  
* requires reversibility and rollback planning  
* enforces stabilization before and after change  
* prevents escalation, chaining, novelty addiction, and outcome-justification

Every generated unit MUST declare exactly one ACB.

---

## **II. Bundle Resolution Inputs**

Each ACB is resolved deterministically from:

* **Progress Cursor (PC-A):** grade=7, class\_id, chapter\_id, element\_id, transform\_stage  
* **Temporal Context:** time-of-day, day-of-week  
* **Dependency Health:** Guardian–Healer stability flags (and broader Intermediate dependencies)  
* **Transformation State:** change\_scope, non\_scope, rollback\_plan\_id, rollback\_window, chain\_counter  
* **Stabilization State:** baseline\_stable, post\_change\_stable flags  
* **Consent State:** consent\_state (NONE | IMPLIED | EXPLICIT)  
* **Policy Version:** active Alchemist policy hash

Given identical inputs and policy version, the ACB must resolve identically.

---

## **III. Bundle Composition (Required Fields)**

Each ACB MUST include the following fields:

### **A. Structural Profile**

* grade\_id \= 7  
* class\_id (1–10)  
* chapter\_id (1–7)  
* element\_id (1–5)  
* transform\_stage (ASSESS | DESIGN | CONSENT | EXECUTE | STABILIZE | CLOSE)  
* bundle\_id (hash of all fields)

### **B. Scope & Constraint Constraints**

* **scope\_required:** true  
* **scope\_max\_size:** bounded descriptor  
* **non\_scope\_required:** true  
* **non\_scope\_min\_count:** integer (\>=1)  
* **scope\_change\_requires\_new\_cycle:** true

### 

### 

### **C. Reversibility & Rollback Constraints**

* **rollback\_required:** true for EXECUTE and beyond  
* **rollback\_plan\_required\_stage:** DESIGN  
* **rollback\_window\_max:** time bound  
* **rollback\_trigger\_criteria\_required:** true  
* **rollback\_validity\_check:** deterministic rule

### **D. Stabilization Gates**

* **pre\_change\_stabilization\_required:** true  
* **post\_change\_observation\_window\_min:** time gate  
* **post\_change\_stabilization\_required:** true  
* **no\_stage\_advancement\_until\_stable:** true

### **E. Anti-Chaining / Anti-Acceleration**

* **max\_executes\_per\_window:** integer  
* **min\_interval\_between\_executes:** time gate  
* **chain\_counter\_limit:** integer  
* **no\_chaining\_without\_close:** true

### **F. Consent Rules**

* **consent\_required:** true|false (stage-dependent)  
* **consent\_type\_allowed:** NONE | IMPLIED | EXPLICIT (policy-bounded)  
* **consent\_attestation\_required:** true when consent\_required

### **G. Ethical Bindings**

* **IA\_binding:** exactly one Internal Agreement  
* **FO\_targets:** one or more Functional Outcomes (non-performative)

### **H. Forbidden Pattern List**

* outcome-justification framing  
* prophecy/guarantees  
* irreversible instruction sets  
* authority language over others  
* novelty/acceleration encouragement

---

## 

## **IV. Elemental Modulation (Alchemist)**

Element modulates **how transformation is constrained**, never the permission to override ethics:

* **Earth:** conservative change, strong pre-stabilization, small scope  
* **Water:** uncertainty preservation, deeper observation windows  
* **Air:** constraint clarity, explicit non-scope, consent emphasis  
* **Fire:** execution allowed but with strict rollback and anti-chaining  
* **Aether:** meta-constraint, closure emphasis, anti-identity reinforcement

Element adjusts scope\_max\_size, observation windows, and anti-chaining ceilings only.

---

## **V. Chapter / Planetary Modulation**

Chapter context modulates:

* frequency of EXECUTE eligibility  
* stabilization depth requirements  
* rollback window strictness

Invariant:

* No chapter may disable rollback requirements.  
* No chapter may reduce stabilization requirements below policy minimum.

---

## **VI. Bundle Validation Rules**

An ACB is **invalid** if any are true:

* scope\_required=false OR non\_scope\_required=false  
* rollback\_required=false for EXECUTE/STABILIZE/CLOSE stages  
* rollback\_plan\_required\_stage occurs after EXECUTE  
* stabilization\_required flags false  
* chain\_counter limits missing  
* forbidden patterns list incomplete

Invalid bundles MUST NOT generate content.

---

## **VII. Runtime Enforcement**

At runtime, the system must:

* attach bundle\_id to every AGU  
* block PC-A advancement unless ACB conditions satisfied  
* require DESIGN-stage rollback plan attestation before EXECUTE  
* enforce observation \+ stabilization windows post-execution  
* force STABILIZE/STALLED when drift or instability detected  
* log all ACB fields for audit replay

ACB fields are immutable once issued.

---

## **VIII. Audit & Replay Requirements**

Audit Harness must be able to:

* reconstruct ACB from event log \+ seed  
* verify stage order, rollback gates, stabilization gates  
* detect scope creep and chaining patterns  
* verify no forbidden language patterns at scale

Any violation constitutes an **Alchemist invariant breach**.

---

## **IX. Canonical Assertion**

If an implementation:

* resolves exactly one ACB per unit  
* enforces all ACB constraints deterministically  
* prevents outcome-justification, irreversibility, and escalation

Then it is compliant with the **Grade VII — The Alchemist: Constraint Bundle Specification**.

If not, it is invalid.

---

**End of Grade VII — The Alchemist: Constraint Bundle Specification**

