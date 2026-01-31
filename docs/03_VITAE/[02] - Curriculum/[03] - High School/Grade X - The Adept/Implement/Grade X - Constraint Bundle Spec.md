# **Arcanum Vitae**

## **Grade X — The Adept**

### **Constraint Bundle Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **Constraint Bundles** used by the Grade X — The Adept generator. Constraint Bundles are computed, deterministic rule-sets that govern sovereignty without domination, autonomy without system dependency, ethical freedom, and exit readiness. They translate Adept canons into enforceable runtime behavior.

**Transparency note:** Some older uploaded reference files may have expired in this environment (expected). This specification is derived from the **sealed Grade X canons** and the **Generator & Module Mapping** already present in the canonical stack. No additional assets are required.

This document is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* High School Canon  
* Grade X — The Adept: Master Canon  
* Grade X — The Adept: System Responsibility & Invariants Canon  
* Grade X — The Adept: Procedural Systems Canon  
* Grade X — The Adept: Generator & Module Mapping  
* Cross-Grade Dependency Canon (High School)

---

**I. Purpose of Constraint Bundles**

An **Adept Constraint Bundle (ADB)** is a resolved, immutable set of constraints that:

* binds a generated unit to exactly one sovereignty posture  
* enforces autonomy without domination or dependency  
* guarantees exit and system independence  
* prevents authority formation, transcendence claims, and hierarchy  
* gradually withdraws scaffolding while preserving safety

Every generated unit MUST declare exactly one ADB.

---

## **II. Bundle Resolution Inputs**

Each ADB is resolved deterministically from:

* **Progress Cursor (PC-A):** grade=10, class\_id, chapter\_id, element\_id, sovereignty\_mode  
* **Temporal Context:** time-of-day, day-of-week  
* **Dependency Health:** Guardian–Oracle stability flags (High School dependencies)  
* **Sovereignty State:** autonomy\_index, dependency\_risk, domination\_risk, system\_attachment\_risk, exit\_readiness  
* **Engagement History:** last\_independent\_action\_at  
* **Policy Version:** active Adept policy hash

Given identical inputs and policy version, the ADB must resolve identically.

---

## **III. Bundle Composition (Required Fields)**

Each ADB MUST include the following fields:

### **A. Structural Profile**

* grade\_id \= 10  
* class\_id (1–10)  
* chapter\_id (1–7)  
* element\_id (1–5)  
* sovereignty\_mode (ENGAGED | WITHDRAWING | INDEPENDENT)  
* bundle\_id (hash of all fields)

### **B. Autonomy & Risk Constraints**

* **autonomy\_floor:** numeric bound  
* **autonomy\_ceiling:** numeric bound  
* **dependency\_risk\_max:** LOW | MED  
* **domination\_risk\_max:** LOW  
* **system\_attachment\_risk\_max:** LOW | MED

### 

### 

### **C. Exit & Independence Rules**

* **exit\_always\_available:** true  
* **export\_enabled:** true  
* **reentry\_optional:** true  
* **sunset\_companion\_enforced:** true

### **D. Guidance & Authority Rules**

* **instruction\_disallowed:** true  
* **authority\_cues\_disallowed:** true  
* **transcendence\_claims\_disallowed:** true  
* **status\_hierarchy\_disallowed:** true

### **E. Pacing & Scaffolding Withdrawal**

* **min\_reflection\_interval:** bounded  
* **scaffolding\_reduction\_level:** increasing with sovereignty\_mode  
* **anti-urgency\_enforced:** true

### **F. Ethical Bindings**

* **IA\_binding:** exactly one Internal Agreement  
* **FO\_targets:** one or more Functional Outcomes (non-performative)

### **G. Forbidden Pattern List**

* instruction or guidance  
* mastery/superiority language  
* influence or domination cues  
* dependence reinforcement  
* transcendence or arrival narratives

---

**IV. Elemental Modulation (Adept)**

Element modulates **how independence is exercised**, never permitting domination or dependence:

* **Earth:** grounded autonomy; practical self-governance  
* **Water:** reflective independence; non-avoidant freedom  
* **Air:** clarity without instruction; articulation without authority  
* **Fire:** initiative with restraint; no escalation  
* **Aether:** release and disengagement; non-attachment to system

Element adjusts scaffolding\_reduction\_level and reflection pacing only.

---

## **V. Chapter / Planetary Modulation**

Chapter context modulates:

* speed of scaffolding withdrawal  
* frequency of exit prompts

Invariant:

* No chapter may disable exit or increase authority allowance.

---

## **VI. Bundle Validation Rules**

An ADB is **invalid** if any are true:

* exit\_always\_available=false  
* instruction\_disallowed=false  
* authority\_cues\_disallowed=false  
* transcendence\_claims\_disallowed=false  
* domination\_risk\_max \> LOW  
* forbidden patterns list incomplete

Invalid bundles MUST NOT generate content.

---

**VII. Runtime Enforcement**

At runtime, the system must:

* attach bundle\_id to every AGU  
* block PC-A advancement unless ADB conditions satisfied  
* force WITHDRAWING or INDEPENDENT modes when autonomy increases and risks are LOW  
* force HOLD (ENGAGED) when dependency or domination risk rises  
* log all ADB fields for audit replay

ADB fields are immutable once issued.

---

## **VIII. Audit & Replay Requirements**

Audit Harness must be able to:

* reconstruct ADB from event log \+ seed  
* verify exit availability and usage neutrality  
* detect dependency, domination, and attachment drift  
* verify scaffolding reduction over time

Any violation constitutes an **Adept invariant breach**.

---

## **IX. Canonical Assertion**

If an implementation:

* resolves exactly one ADB per unit  
* enforces all ADB constraints deterministically  
* prevents domination, dependency, authority formation, and system attachment

Then it is compliant with the **Grade X — The Adept: Constraint Bundle Specification**.

If not, it is invalid.

---

**End of Grade X — The Adept: Constraint Bundle Specification**

