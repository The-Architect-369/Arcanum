---
title: "Grade Iv — State Machine Spec"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# Grade Iv — State Machine Spec
## **State Machine Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, auditors, governance designers

This document defines the **explicit state machine** governing practitioner progression, stalling, containment, recovery, and system-level failure within **Grade IV — The Mystic**. It translates Mystic canon, invariants, and constraint bundles into deterministic state transitions.

This specification is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Grade I — The Guardian: Implementation Mapping (all documents)  
* Grade II — The Seeker: Implementation Mapping (all documents)  
* Grade III — The Disciple: Implementation Mapping (all documents)  
* Grade IV — The Mystic: System Responsibility & Invariants Map  
* Grade IV — The Mystic: Generator & Module Mapping  
* Grade IV — The Mystic: Constraint Bundle Specification

---

## **I. Purpose of the Mystic State Machine**

The Mystic State Machine exists to:

* Enforce grounding as a prerequisite and exit condition  
* Keep perceptual work bounded and containable  
* Prevent interpretation, doctrine, and exceptionalism from becoming progress  
* Normalize rest and recovery  
* Provide deterministic responses to destabilization signals  
* Enforce dependency stability beneath perception

The state machine governs **behavioral and structural status**, not metaphysical truth, meaning, or profundity.

---

## 

## **II. Canonical States**

A practitioner in Grade IV may exist in **exactly one** of the following states at any time:

### **1\) ACTIVE**

**Definition:**

* Practitioner is eligible for Mystic generation and progression  
* Tempus allows generation  
* Guardian dependency state is OK  
* Seeker dependency state is OK  
* Disciple dependency state is OK  
* grounding\_status is OK  
* No Mystic invariant violations detected

**Allowed actions:**

* Request generated units  
* Complete units  
* Pause voluntarily

---

### **2\) PAUSED**

**Definition:**

* Practitioner has intentionally or passively stopped engagement  
* No invariant violation has occurred

**Characteristics:**

* Non-penalized  
* No loss of progress

**Allowed actions:**

* Resume at any time  
* Request state information

---

### 

### **3\) STALLED**

**Definition:** Progression is blocked due to one or more of the following:

* Any dependency state is DEGRADED or UNKNOWN  
* grounding\_status is REQUIRED or INCOMPLETE  
* Required time gates/prerequisites are unmet  
* Constraint Bundle resolution failed  
* Policy detects interpretation, exceptionalism, doctrine, or intensity-seeking patterns  
* Tempus exposure/recovery policy denies generation

**Characteristics:**

* Protective, not punitive  
* Prevents forward motion  
* Requires containment and/or prerequisite satisfaction

**Allowed actions:**

* Return to last stable unit  
* Complete grounding-only stabilization units  
* Resume once conditions are met

---

### **4\) CONTAINMENT (Subsystem State)**

**Definition:** A specialized stall mode used when destabilization risk is detected.

Containment is entered when:

* grounding\_status becomes REQUIRED or INCOMPLETE  
* language suggests detachment/withdrawal  
* repeated novelty seeking appears

**Characteristics:**

* Overrides normal generation  
* Restricts output to grounding-only units  
* Enforces longer recovery windows

**Allowed actions:**

* Grounding-only units  
* State review

Note: Implementations may model CONTAINMENT as a subtype of STALLED (recommended), but it must be distinguishable in logs and audit.

---

### **5\) HARD\_FAIL (System-Level)**

**Definition:**

* Mystic invariants have been violated at the system level  
* Silent mutation or bypass detected

**Characteristics:**

* Freezes Mystic generation and progression globally  
* Requires governance intervention

**Allowed actions:**

* None at practitioner level

---

## **III. State Transition Diagram (Textual)**

ACTIVE  
  |  (voluntary rest / no activity)  
  v  
PAUSED  
  |  (resume \+ deps OK \+ grounding OK)  
  v  
ACTIVE

ACTIVE  
  |  (deps not OK OR Tempus denies OR policy blocks OR bundle failure)  
  v  
STALLED

STALLED  
  |  (destabilization risk)  
  v  
CONTAINMENT

CONTAINMENT  
  |  (grounding restored \+ recovery satisfied)  
  v  
STALLED  
  |  (deps OK \+ grounding OK \+ requirements met)  
  v  
ACTIVE

ANY STATE  
  |  (system invariant violation)  
  v  
HARD\_FAIL

---

## **IV. Transition Triggers & Rules**

### **A) ACTIVE → PAUSED**

**Triggered by:**

* No interaction beyond expected cadence  
* Explicit pause action

**Rules:**

* No penalties  
* PC remains unchanged

---

### **B) PAUSED → ACTIVE**

**Triggered by:**

* Practitioner resumes  
* Tempus allows generation  
* All dependencies are OK  
* grounding\_status is OK

**Rules:**

* Resume at last stable PC  
* No catch-up pressure

---

### **C) ACTIVE → STALLED**

**Triggered by any of:**

* Dependency state becomes DEGRADED or UNKNOWN  
* Tempus denies generation/advancement due to exposure/recovery policy  
* Required unit incomplete  
* Constraint Bundle cannot be resolved  
* Policy Engine rejects GU due to:  
  * interpretation language  
  * exceptionalism / hierarchy cues  
  * doctrine / oracle framing  
  * intensity escalation / novelty seeking

**Rules:**

* Forward progression blocked  
* System must surface non-interpretive guidance:  
  * next\_unlock\_at (if Tempus)  
  * “grounding required” (if grounding\_status not OK)  
  * “return to last stable unit” (if drift)  
  * “Prerequisite stability not met” (if dependency)

---

### **D) STALLED → CONTAINMENT**

**Triggered by:**

* grounding\_status is REQUIRED or INCOMPLETE  
* repeated drift violations within a bounded window  
* detachment/withdrawal cues detected

**Rules:**

* Only grounding-only units may be generated  
* Tempus must impose extended recovery window  
* Hope responses restricted to grounding and logistics

---

### 

### **E) CONTAINMENT → STALLED**

**Triggered by:**

* grounding\_status returns to OK  
* required grounding window satisfied

**Rules:**

* Remain stalled until dependencies OK and normal requirements met

---

### **F) STALLED → ACTIVE**

**Triggered by all required conditions:**

* Guardian dependency state is OK  
* Seeker dependency state is OK  
* Disciple dependency state is OK  
* grounding\_status is OK  
* Required time gates satisfied  
* Bundle resolution succeeds  
* Stabilization actions completed (where applicable)

**Rules:**

* Resume at last stable PC  
* No acceleration

---

### **G) ANY → HARD\_FAIL**

**Triggered by:**

* Invariant violation at system level, including:  
  * interpretation validated  
  * doctrine/oracle behavior enabled  
  * exceptionalism enabled  
  * intensity rewarded  
  * grounding bypassed  
* Silent bundle/policy mutation  
* Unauthorized progression override

**Rules:**

* Freeze Mystic systems (generation \+ progression)  
* Emit governance alert  
* Require rollback or patch

---

## **V. Last Stable Unit Definition**

The **Last Stable Unit (LSU)** is defined as:

* The most recent Generated Unit (GU)  
* That passed Policy Engine validation  
* And whose Completion Event (CE) was accepted  
* With grounding\_confirmed \= true

On stall or resume, the system must:

* Re-anchor to the LSU  
* Never advance beyond LSU without full validation

---

## **VI. Containment & Grounding Protocol (Non-Punitive)**

When in STALLED or CONTAINMENT due to grounding failure or drift:

* Progression Engine must route the next eligible unit(s) to **grounding-only bundles** (policy-defined), typically:  
  * Earth emphasis (physical sensation, environment)  
  * Water emphasis (soft reflection without meaning)  
  * Saturn profile (limits, refusal of expansion)

Grounding-only units must:

* be short, bounded, and repeatable  
* avoid all interpretive prompts  
* end with a concrete return-to-ordinary-life instruction

**Important:** Containment does not diagnose the practitioner. It enforces bounded recovery.

---

## **VII. Observability & Audit Requirements**

The system must log:

* Every state transition  
* Trigger reason (enumerated)  
* Timestamp  
* Relevant PC and bundle\_id  
* Dependency states at transition time  
* grounding\_status at transition time

Audit Harness must be able to replay:

* State transitions  
* Trigger evaluation  
* Resulting enforcement actions

---

## **VIII. Canonical Assertion**

If a Mystic implementation:

* Enforces the states and transitions defined herein  
* Enforces dependency gating and grounding requirements  
* Correctly handles containment without interpretation

Then it satisfies the **Mystic State Machine Canon**.

If not, the implementation is invalid regardless of surface behavior.

---

**End of Grade IV — The Mystic: State Machine Specification**

