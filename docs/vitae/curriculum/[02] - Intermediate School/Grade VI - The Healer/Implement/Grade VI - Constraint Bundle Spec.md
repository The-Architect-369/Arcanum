---
title: "Grade Vi Constraint Bundle Spec"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---

# Grade Vi Constraint Bundle Spec
## **Grade VI — The Healer**

### **Constraint Bundle Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **Constraint Bundles** used by the Grade VI — The Healer generator. Constraint Bundles are computed, deterministic rule-sets that govern care cycles, consent, scope, pacing, withdrawal, and burnout protection. They translate Healer canons into enforceable runtime behavior.

This document is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Intermediate School Canon  
* Grade VI — The Healer: Master Canon  
* Grade VI — The Healer: System Responsibility & Invariants Canon  
* Grade VI — The Healer: Procedural Systems Canon  
* Grade VI — The Healer: Generator & Module Mapping  
* Cross-Grade Dependency Canon (Intermediate)

---

## **I. Purpose of Constraint Bundles**

A **Healer Constraint Bundle (HCB)** is a resolved, immutable set of constraints that:

* binds a generated unit to exactly one care posture  
* enforces consent, scope, and proportionality  
* prevents authority, dependency, and burnout  
* ensures withdrawal and refusal remain valid outcomes

Every generated unit MUST declare exactly one HCB.

---

## 

## **II. Bundle Resolution Inputs**

Each HCB is resolved deterministically from:

* **Progress Cursor (PC-H):** grade=6, class\_id, chapter\_id, element\_id, care\_phase  
* **Temporal Context:** time-of-day, day-of-week  
* **Dependency Health:** Guardian–Sage stability flags  
* **Practitioner State:** load\_index, burnout\_risk, withdrawal\_count  
* **Consent & Scope State:** consent\_state, care\_scope (if present)  
* **Policy Version:** active Healer policy hash

Given identical inputs and policy version, the HCB must resolve identically.

---

## **III. Bundle Composition (Required Fields)**

Each HCB MUST include the following fields:

### **A. Structural Profile**

* grade\_id \= 6  
* class\_id (1–10)  
* chapter\_id (1–7)  
* element\_id (1–5)  
* care\_phase (OBSERVE | INTERVENE | STABILIZE | WITHDRAW)  
* bundle\_id (hash of all fields)

### **B. Consent & Scope Constraints**

* **consent\_required:** true|false  
* **consent\_type:** NONE | IMPLIED | EXPLICIT  
* **scope\_required:** true|false  
* **scope\_max\_size:** bounded descriptor

### **C. Load & Burnout Ceilings**

* **load\_ceiling:** numeric bound  
* **burnout\_threshold:** LOW|MED|HIGH  
* **max\_consecutive\_cycles:** integer

### 

### 

### **D. Care-Cycle Rules**

* **allowed\_phases:** set of legal next phases  
* **withdrawal\_always\_allowed:** true  
* **refusal\_valid:** true  
* **stabilization\_required\_after\_intervene:** true|false

### **E. Pacing & Time Gates**

* **min\_interval\_since\_last\_cycle**  
* **min\_recovery\_window**  
* **anti-continuous\_care\_limit**

### **F. Ethical Bindings**

* **IA\_binding:** exactly one Internal Agreement  
* **FO\_targets:** one or more Functional Outcomes (non-performative)

### **G. Forbidden Pattern List**

* authority framing  
* savior language  
* diagnostic/therapeutic claims  
* outcome-justification  
* dependency cues

---

## **IV. Elemental Modulation (Healer)**

Element modulates **how** care is applied, never **who** is fixed:

* **Earth:** maintenance, routines, environmental stability (low scope)  
* **Water:** reflection, emotional awareness without leverage  
* **Air:** informed care, clarity, consent emphasis  
* **Fire:** targeted intervention with strict bounds  
* **Aether:** meta-care, withdrawal literacy, restraint

Element adjusts scope\_max\_size, load\_ceiling, and allowed\_phases only.

---

## 

## **V. Chapter / Planetary Modulation**

Chapter context modulates:

* frequency of INTERVENE vs OBSERVE  
* stabilization depth  
* recovery window length

Invariant:

* No chapter may disable WITHDRAW or REFUSAL.

---

## **VI. Bundle Validation Rules**

An HCB is **invalid** if any are true:

* consent\_required=true and consent\_type=NONE  
* scope\_required=true and scope missing/over limit  
* load\_ceiling exceeds policy bounds  
* withdrawal\_always\_allowed=false  
* forbidden patterns list incomplete

Invalid bundles MUST NOT generate content.

---

## **VII. Runtime Enforcement**

At runtime, the system must:

* attach bundle\_id to every HGU  
* block PC-H advancement unless HCB conditions satisfied  
* force STABILIZE or STALLED when load/burnout thresholds reached  
* log all HCB fields for audit replay

HCB fields are immutable once issued.

---

## 

## **VIII. Audit & Replay Requirements**

Audit Harness must be able to:

* reconstruct HCB from event log \+ seed  
* verify consent/scope gates  
* verify withdrawal/refusal availability  
* detect dependency loops or savior drift

Any violation constitutes a **Healer invariant breach**.

---

## **IX. Canonical Assertion**

If an implementation:

* resolves exactly one HCB per unit  
* enforces all HCB constraints deterministically  
* prevents authority, dependency, and burnout

Then it is compliant with the **Grade VI — The Healer: Constraint Bundle Specification**.

If not, it is invalid.

---

**End of Grade VI — The Healer: Constraint Bundle Specification**

