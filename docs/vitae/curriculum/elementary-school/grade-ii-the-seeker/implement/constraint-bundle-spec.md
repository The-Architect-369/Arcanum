---
title: "Grade Ii — Constraint Bundle Spec"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# Grade Ii — Constraint Bundle Spec
## **Constraint Bundle Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, policy-engine designers, auditors, generator implementers

This document defines the **Constraint Bundle** system for Grade II — The Seeker. A Constraint Bundle is the machine-readable policy context derived from the Progress Cursor (PC) that governs what may be generated, how it may be generated, and what patterns are explicitly forbidden.

Constraint Bundles are the primary mechanism by which Seeker canon is enforced procedurally while preserving ambiguity and preventing oracle behavior.

This specification is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Grade I — The Guardian: Implementation Mapping (all documents)  
* Grade II — The Seeker: Master Canon  
* Grade II — The Seeker: Procedural Systems Canon  
* Grade II — The Seeker: Audit & Validation Canon  
* Grade II — The Seeker: System Responsibility & Invariants Map  
* Grade II — The Seeker: Generator & Module Mapping

---

## **I. Purpose of Constraint Bundles**

Constraint Bundles exist to:

* Translate Seeker canon into enforceable machine rules  
* Preserve ambiguity as a legitimate state  
* Prevent premature coherence and “arrival” language  
* Prevent Hope and generators from acting as oracles  
* Enable deterministic, auditable generation

A generator must never infer rules implicitly. All generation rules must be supplied explicitly via a Constraint Bundle.

---

## **II. Bundle Resolution Rule**

For every Generation Request (GR):

* Exactly **one** Constraint Bundle must be resolved  
* Bundle resolution is **deterministic** based solely on PC  
* No user text, history interpretation, or model inference may alter bundle selection

If a bundle cannot be resolved, generation must **stall**.

---

**III. Constraint Bundle Structure**

Each Constraint Bundle consists of the following required components:

### **A. Bundle Metadata**

* bundle\_id (stable, versioned)  
* grade\_id \= 2  
* class\_id  
* chapter\_id (planet)  
* element\_id  
* policy\_version

---

**B. Planetary Profile (Chapter Constraints)**

Defines constraints derived from the current **planetary chapter**.

Seeker planetary intent (ambiguity-preserving):

* **Moon:** Receive the question; hold uncertainty  
* **Mars:** Apply disciplined inquiry without forcing conclusions  
* **Mercury:** Differentiate signal and noise in thought  
* **Venus:** Examine values and attachments shaping inquiry  
* **Saturn:** Enforce limits; refuse closure; accept “not yet”  
* **Sun:** Integrate inquiry as a posture, not an answer

Planetary profiles constrain:

* allowable verbs (ask, notice, refine, compare, bracket)  
* forbidden verbs (conclude, prove, explain, diagnose)  
* allowable “output types” (questions, lists of possibilities, distinctions)  
* forbidden output types (answers, interpretations, revelations)

---

### **C. Elemental Profile (Section Constraints)**

Defines constraints derived from the current **elemental section**.

Seeker elemental intent:

* **Spirit:** Orient inquiry without narrative  
* **Air:** Provide “ancient wisdom as new information” without prescribing meaning  
* **Earth:** Ground inquiry into a concrete observation or practice  
* **Fire:** Sustain attention without intensity escalation  
* **Water:** Reflect and soften; no meaning-making pressure

Elemental profiles constrain:

* tone and linguistic style  
* instruction format  
* allowed cognitive load  
* explicit prohibition of certainty and closure

---

### **D. Internal Agreement (IA) Binding**

Each bundle must bind **exactly one** Seeker Internal Agreement.

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

### **F. Forbidden Pattern List (Anti-Coherence / Anti-Oracle)**

Each bundle must include an explicit forbidden pattern list, including but not limited to:

* answers-as-authority  
* “arrival” / completion claims  
* interpretation validation loops ("that means X")  
* revelation / prophecy framing  
* identity labels ("you are becoming...")  
* comparative or hierarchy cues  
* urgency and streak manipulation

Forbidden patterns are evaluated by the Policy Engine **before and after generation**.

---

## **IV. Oracle Prevention Rules (Hard Constraints)**

Every Seeker bundle must enforce:

* **No Answers:** output must not provide a final interpretation  
* **No Validation:** output must not confirm meaning  
* **No Authority Tone:** output must not speak as an oracle  
* **No Closure:** output must not imply arrival or completion

If any oracle prevention rule fails, the generated unit is invalid.

---

## 

## 

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

A valid Seeker instance must be reproducible using:

* Generation seed  
* bundle\_id  
* policy\_version

If replay produces a different result, the implementation is invalid.

---

## **VII. Failure Modes**

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

## **VIII. Guardian Dependency Interaction**

Seeker bundles are only valid if Guardian dependency state is OK.

If Guardian dependency is DEGRADED or UNKNOWN:

* Seeker bundle resolution may still occur  
* but generation must STALL until Guardian is OK

No Seeker bundle may weaken Guardian invariants.

---

## **IX. Canonical Assertion**

If every generated Seeker unit:

* resolves exactly one Constraint Bundle  
* declares its bundle\_id  
* passes Policy Engine validation against that bundle  
* satisfies oracle prevention rules

Then the Seeker system is **canonically compliant**.

If not, the system is invalid regardless of surface behavior.

---

**End of Grade II — The Seeker: Constraint Bundle Specification**
