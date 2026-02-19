---
title: "Grade I — Constraint Bundle Spec"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# Grade I — Constraint Bundle Spec
## **Constraint Bundle Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, policy-engine designers, auditors, generator implementers

This document defines the **Constraint Bundle** system for Grade I — The Guardian. A Constraint Bundle is the machine-readable policy context derived from the Progress Cursor (PC) that governs what may be generated, how it may be generated, and what patterns are explicitly forbidden.

Constraint Bundles are the primary mechanism by which Guardian canon is enforced procedurally.

This specification is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Grade I — The Guardian: Master Canon  
* Grade I — The Guardian: Procedural Systems Canon  
* Grade I — The Guardian: Audit & Validation Canon  
* Grade I — The Guardian: System Responsibility & Invariants Map  
* Grade I — The Guardian: Generator & Module Mapping

---

## **I. Purpose of Constraint Bundles**

Constraint Bundles exist to:

* Translate Guardian canon into enforceable machine rules  
* Ensure deterministic, auditable generation  
* Prevent interpretive drift or feature creep  
* Provide a single source of truth for generator constraints

A generator **must never infer rules implicitly**. All generation rules must be supplied explicitly via a Constraint Bundle.

---

## **II. Bundle Resolution Rule**

For every Generation Request (GR):

* Exactly **one** Constraint Bundle must be resolved  
* Bundle resolution is **purely deterministic** based on PC  
* No user input, history interpretation, or model inference may alter bundle selection

If a bundle cannot be resolved, generation must **stall**.

---

**III. Constraint Bundle Structure**

Each Constraint Bundle consists of the following required components:

### **A. Bundle Metadata**

* bundle\_id (stable, versioned)  
* grade\_id \= 1  
* class\_id  
* chapter\_id (planet)  
* element\_id  
* policy\_version

---

**B. Planetary Profile (Chapter Constraints)**

Defines constraints derived from the current **planetary chapter**.

Guardian planetary intent:

* **Moon:** Establish routine and observation  
* **Mars:** Apply effort without escalation  
* **Mercury:** Execute instructions precisely  
* **Venus:** Maintain care without attachment  
* **Saturn:** Practice restraint and limits  
* **Sun:** Complete and consolidate reliably

Planetary profiles constrain:

* task complexity  
* task duration  
* allowed verbs (e.g., observe, perform, repeat)  
* forbidden verbs (e.g., interpret, analyze, explain)

---

### **C. Elemental Profile (Section Constraints)**

Defines constraints derived from the current **elemental section**.

Guardian elemental intent:

* **Spirit:** Orientation without meaning  
* **Air:** Information without interpretation  
* **Earth:** Physical or practical action  
* **Fire:** Sustained effort without urgency  
* **Water:** Reflection without analysis

Elemental profiles constrain:

* prompt tone  
* instruction format  
* allowed cognitive load  
* explicit prohibition of meaning-making

---

### **D. Internal Agreement (IA) Binding**

Each bundle must bind **exactly one** Guardian Internal Agreement.

The IA binding:

* must be declared explicitly in the bundle  
* must be enforceable by the Policy Engine  
* may not be overridden by generators

If no IA can be bound, the bundle is invalid.

---

### **E. Functional Outcome (FO) Targets**

Each bundle must declare:

* one or more Functional Outcomes it supports

FO targets:

* guide generator selection  
* inform audit expectations  
* do not affect progression directly

FO targets may not be surfaced to the practitioner.

---

**F. Forbidden Pattern List**

Each bundle must include an explicit list of **forbidden patterns**, including but not limited to:

* interpretation requests  
* self-narrative prompts  
* symbolic meaning  
* insight framing  
* identity labeling  
* urgency or streak language

Forbidden patterns are evaluated by the Policy Engine **before and after generation**.

---

**IV. Bundle Lifecycle**

### **A. Creation**

* Bundles are authored and versioned by governance  
* Bundles are immutable once published

### **B. Resolution**

* Bundle is resolved from PC at request time  
* Bundle\_id is attached to GR and GU

### **C. Enforcement**

* Policy Engine validates GU against bundle constraints  
* Generator Orchestrator may not bypass or modify bundles

### **D. Audit**

* Bundles are used as the reference context for replay  
* Audit verifies that GU complies with its declared bundle

---

## **V. Determinism & Replay Guarantees**

A valid Guardian instance must be reproducible using:

* Generation seed  
* Bundle\_id  
* Policy\_version

If replay produces a different result, the implementation is invalid.

---

## **VI. Failure Modes**

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

## **VII. Dependency Rules**

* No higher Grade may redefine Guardian bundles  
* Higher Grades may only **extend** constraint bundles, never weaken them  
* Guardian bundles remain active beneath all higher Grades

---

## 

## **VIII. Canonical Assertion**

If every generated Guardian unit:

* resolves exactly one Constraint Bundle  
* declares its bundle\_id  
* passes Policy Engine validation against that bundle

Then the Guardian system is **canonically compliant**.

If not, the system is invalid regardless of surface behavior.

---

**End of Grade I — The Guardian: Constraint Bundle Specification**

