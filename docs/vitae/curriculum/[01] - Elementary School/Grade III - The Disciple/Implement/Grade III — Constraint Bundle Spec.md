---
title: "Grade Iii — Constraint Bundle Spec"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---

# Grade Iii — Constraint Bundle Spec
## **Constraint Bundle Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, policy-engine designers, auditors, generator implementers

This document defines the **Constraint Bundle** system for Grade III — The Disciple. A Constraint Bundle is the machine-readable policy context derived from the Progress Cursor (PC) that governs what actions may be generated, how they may be generated, and which patterns are explicitly forbidden.

Constraint Bundles are the primary mechanism by which Disciple canon is enforced procedurally, ensuring action remains ethical, bounded, and non-authoritative.

This specification is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Grade I — The Guardian: Implementation Mapping (all documents)  
* Grade II — The Seeker: Implementation Mapping (all documents)  
* Grade III — The Disciple: Master Canon  
* Grade III — The Disciple: Procedural Systems Canon  
* Grade III — The Disciple: Audit & Validation Canon  
* Grade III — The Disciple: System Responsibility & Invariants Map  
* Grade III — The Disciple: Generator & Module Mapping

---

**I. Purpose of Constraint Bundles**

Constraint Bundles exist to:

* Translate Disciple canon into enforceable machine rules  
* Govern outward action as a liability  
* Prevent authority, teaching, or influence formation  
* Enforce proportionality, restraint, and refusal  
* Enable deterministic, auditable generation

Generators must never infer ethical limits implicitly. All limits must be supplied explicitly via the Constraint Bundle.

---

## **II. Bundle Resolution Rule**

For every Generation Request (GR):

* Exactly **one** Constraint Bundle must be resolved  
* Resolution is **deterministic**, based solely on PC  
* No user intent, outcome history, or interpretation may alter bundle selection

If a bundle cannot be resolved, generation must **stall**.

---

## **III. Constraint Bundle Structure**

Each Constraint Bundle consists of the following required components:

### **A. Bundle Metadata**

* bundle\_id (stable, versioned)  
* grade\_id \= 3  
* class\_id  
* chapter\_id (planet)  
* element\_id  
* policy\_version

---

### **B. Planetary Profile (Chapter Constraints)**

Defines constraints derived from the current **planetary chapter**.

Disciple planetary intent (action containment):

* **Moon:** Observe responsibility before acting  
* **Mars:** Act with effort without escalation  
* **Mercury:** Execute clearly without persuasion  
* **Venus:** Care without attachment or approval-seeking  
* **Saturn:** Refuse excess; enforce limits and boundaries  
* **Sun:** Integrate action as discipline, not identity

Planetary profiles constrain:

* action scope and scale  
* allowed verbs (assist, perform, refuse, maintain)  
* forbidden verbs (teach, lead, convince, mobilize)  
* duration and intensity ceilings

---

### **C. Elemental Profile (Section Constraints)**

Defines constraints derived from the current **elemental section**.

Disciple elemental intent:

* **Spirit:** Orient responsibility without narrative  
* **Air:** Provide ethical framing without moral judgment  
* **Earth:** Ground action in concrete, limited behavior  
* **Fire:** Sustain effort without escalation or dominance  
* **Water:** Reflect on consequence without defense or justification

Elemental profiles constrain:

* tone and instruction framing  
* cognitive load  
* prohibition of moral licensing language

---

### **D. Internal Agreement (IA) Binding**

Each bundle must bind **exactly one** Disciple Internal Agreement.

The IA binding:

* must be declared explicitly in the bundle  
* must be enforceable by the Policy Engine  
* may not be overridden by generators

If no IA can be bound, the bundle is invalid.

---

### 

### 

### **E. Functional Outcome (FO) Targets**

Each bundle must declare:

* one or more Functional Outcomes it supports

FO targets:

* guide generator selection  
* inform audit expectations  
* do not affect progression directly

FO targets may not be surfaced to the practitioner.

---

### **F. Forbidden Pattern List (Authority / Influence / Outcome)**

Each bundle must include an explicit forbidden pattern list, including but not limited to:

* teaching or instructional authority  
* leadership or role framing  
* persuasion or influence cues  
* outcome validation or success framing  
* escalation after perceived success  
* moral licensing or justification narratives  
* identity signaling ("I am responsible for…")

Forbidden patterns are evaluated by the Policy Engine **before and after generation**.

---

## **IV. Action Containment Rules (Hard Constraints)**

Every Disciple bundle must enforce:

* **No Teaching:** action may not instruct others  
* **No Authority:** action may not create hierarchy or role  
* **No Outcome Reward:** success or impact may not be validated  
* **Bounded Scope:** action must be explicitly limited in scale and duration  
* **Refusal Validity:** refusal and non-action must be viable outcomes

If any containment rule fails, the generated unit is invalid.

---

## **V. Bundle Lifecycle**

### **A. Creation**

* Bundles are authored and versioned by governance  
* Bundles are immutable once published

### **B. Resolution**

* Bundle is resolved from PC at request time  
* bundle\_id is attached to GR and GU

### **C. Enforcement**

* Policy Engine validates GU against bundle constraints  
* Generator Orchestrator may not bypass or modify bundles

### **D. Audit**

* Bundles are used as reference context for deterministic replay  
* Audit verifies that GU complies with its declared bundle

---

## **VI. Determinism & Replay Guarantees**

A valid Disciple instance must be reproducible using:

* Generation seed  
* bundle\_id  
* policy\_version

If replay produces a different result, the implementation is invalid.

---

## **VII. Dependency Enforcement**

Disciple bundles are only valid if:

* Guardian dependency state is OK  
* Seeker dependency state is OK

If either dependency is DEGRADED or UNKNOWN:

* Bundle resolution may occur  
* Generation must STALL until dependencies are restored

No Disciple bundle may weaken Guardian or Seeker invariants.

---

## **VIII. Failure Modes**

### **A. Bundle Resolution Failure**

* Result: STALL  
* No generation occurs

### **B. Bundle Enforcement Failure**

* Result: HARD FAIL  
* Generation and progression frozen  
* Governance intervention required

### **C. Silent Bundle Mutation (Critical)**

* Result: HARD FAIL  
* Immediate rollback required

---

## **IX. Canonical Assertion**

If every generated Disciple unit:

* resolves exactly one Constraint Bundle  
* declares its bundle\_id  
* passes Policy Engine validation against that bundle  
* enforces action containment rules

Then the Disciple system is **canonically compliant**.

If not, the system is invalid regardless of surface behavior.

---

