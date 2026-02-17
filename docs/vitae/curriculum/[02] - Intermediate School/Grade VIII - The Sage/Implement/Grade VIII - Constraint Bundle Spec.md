# **Arcanum Vitae**

## **Grade VIII — The Sage**

### **Constraint Bundle Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **Constraint Bundles** used by the Grade VIII — The Sage generator. Constraint Bundles are computed, deterministic rule-sets that govern integration without authority, wisdom as restraint, non-closure coherence, challengeability, and extended reflection pacing. They translate Sage canons into enforceable runtime behavior.

**Note:** Some older uploaded reference files may expire in this environment. This specification is derived from the sealed Grade VIII canons and the Generator & Module Mapping already captured in the canonical document stack.

This document is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Intermediate School Canon  
* Grade VIII — The Sage: Master Canon  
* Grade VIII — The Sage: System Responsibility & Invariants Canon  
* Grade VIII — The Sage: Procedural Systems Canon  
* Grade VIII — The Sage: Generator & Module Mapping  
* Cross-Grade Dependency Canon (Intermediate)

---

**I. Purpose of Constraint Bundles**

A **Sage Constraint Bundle (SCB)** is a resolved, immutable set of constraints that:

* binds a generated unit to exactly one integration posture  
* enforces wisdom as restraint, not authority  
* preserves coherence without closure  
* guarantees challengeability and openness  
* prevents silent dominance, mentoring drift, or detachment superiority

Every generated unit MUST declare exactly one SCB.

---

## **II. Bundle Resolution Inputs**

Each SCB is resolved deterministically from:

* **Progress Cursor (PC-S):** grade=8, class\_id, chapter\_id, element\_id, integration\_mode  
* **Temporal Context:** time-of-day, day-of-week  
* **Dependency Health:** Guardian–Alchemist stability flags (and broader Intermediate dependencies)  
* **Integration State:** openness\_index, closure\_risk, detachment\_risk, authority\_signal\_risk  
* **Reflection History:** last\_reflection\_at, last\_challengeable\_at  
* **Policy Version:** active Sage policy hash

Given identical inputs and policy version, the SCB must resolve identically.

---

## **III. Bundle Composition (Required Fields)**

Each SCB MUST include the following fields:

### **A. Structural Profile**

* grade\_id \= 8  
* class\_id (1–10)  
* chapter\_id (1–7)  
* element\_id (1–5)  
* integration\_mode (HOLD | REVISE | REVISIT | RELEASE)  
* bundle\_id (hash of all fields)

### **B. Openness & Closure Constraints**

* **openness\_floor:** numeric bound  
* **openness\_ceiling:** numeric bound  
* **closure\_risk\_max:** LOW | MED  
* **detachment\_risk\_max:** LOW | MED  
* **authority\_signal\_max:** LOW

### **C. Reflection & Challengeability Rules**

* **reflection\_required:** true  
* **challengeability\_required:** true  
* **revision\_permitted:** true  
* **non\_conclusion\_required:** true

### **D. Pacing & Time Gates**

* **min\_reflection\_window:** extended time gate  
* **min\_interval\_between\_units:** extended time gate  
* **anti-rapid\_integration\_limit:** integer

### **E. Ethical Bindings**

* **IA\_binding:** exactly one Internal Agreement  
* **FO\_targets:** one or more Functional Outcomes (non-performative)

### **F. Forbidden Pattern List**

* instructional authority  
* mentoring or guiding framing  
* concluding synthesis language  
* deference cues (tone, UI, copy)  
* detachment-as-elevation framing

---

## **IV. Elemental Modulation (Sage)**

Element modulates **how integration is held**, never permitting closure or authority:

* **Earth:** grounding integration, restraint emphasis, low abstraction  
* **Water:** reflective depth, uncertainty preservation  
* **Air:** articulation without conclusion, clarity without instruction  
* **Fire:** vitality tempered by restraint, no escalation  
* **Aether:** meta-holding, release emphasis, non-attachment

Element adjusts openness\_floor/ceiling and reflection pacing only.

---

**V. Chapter / Planetary Modulation**

Chapter context modulates:

* reflection window length  
* revision frequency  
* integration\_mode rotation

Invariant:

* No chapter may permit conclusion or instruction.

---

## **VI. Bundle Validation Rules**

An SCB is **invalid** if any are true:

* openness\_floor/openness\_ceiling outside policy bounds  
* closure\_risk\_max \> MED  
* authority\_signal\_max \> LOW  
* reflection\_required=false OR challengeability\_required=false  
* non\_conclusion\_required=false  
* forbidden patterns list incomplete

Invalid bundles MUST NOT generate content.

---

## **VII. Runtime Enforcement**

At runtime, the system must:

* attach bundle\_id to every SGU  
* block PC-S advancement unless SCB conditions satisfied  
* force HOLD/REVISE modes when closure or authority risk detected  
* log all SCB fields for audit replay

SCB fields are immutable once issued.

---

**VIII. Audit & Replay Requirements**

Audit Harness must be able to:

* reconstruct SCB from event log \+ seed  
* verify non-closure enforcement  
* detect passive authority or detachment drift  
* verify extended pacing and anti-rapid-integration gates

Any violation constitutes a **Sage invariant breach**.

---

## **IX. Canonical Assertion**

If an implementation:

* resolves exactly one SCB per unit  
* enforces all SCB constraints deterministically  
* prevents authority, closure, mentoring drift, and detachment superiority

Then it is compliant with the **Grade VIII — The Sage: Constraint Bundle Specification**.

If not, it is invalid.

---

**End of Grade VIII — The Sage: Constraint Bundle Specification**

