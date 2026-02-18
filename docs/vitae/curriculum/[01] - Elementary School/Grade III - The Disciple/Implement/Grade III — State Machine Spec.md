---
title: "Grade Iii — State Machine Spec"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---

# Grade Iii — State Machine Spec
## **State Machine Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, auditors, governance designers

This document defines the **explicit state machine** governing practitioner progression, stalling, stabilization, recovery, and system-level failure within **Grade III — The Disciple**. It translates Disciple canon, invariants, and constraint bundles into deterministic state transitions.

This specification is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Grade I — The Guardian: Implementation Mapping (all documents)  
* Grade II — The Seeker: Implementation Mapping (all documents)  
* Grade III — The Disciple: System Responsibility & Invariants Map  
* Grade III — The Disciple: Generator & Module Mapping  
* Grade III — The Disciple: Constraint Bundle Specification

---

## **I. Purpose of the Disciple State Machine**

The Disciple State Machine exists to:

* Govern outward action as a liability  
* Prevent authority production and influence creep  
* Normalize refusal, delay, and restraint  
* Provide deterministic responses to boundary violations  
* Enforce Guardian \+ Seeker dependency beneath action

The state machine governs **behavioral and structural status**, not morality, effectiveness, or impact.

---

**II. Canonical States**

A practitioner in Grade III may exist in **exactly one** of the following states at any time:

### **1\) ACTIVE**

**Definition:**

* Practitioner is eligible for Disciple generation and progression  
* Tempus allows generation  
* Guardian dependency state is OK  
* Seeker dependency state is OK  
* No Disciple invariant violations detected

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

### 

### **3\) STALLED**

**Definition:** Progression is blocked due to one or more of the following:

* Guardian dependency is DEGRADED or UNKNOWN  
* Seeker dependency is DEGRADED or UNKNOWN  
* Required time gates/prerequisites are unmet  
* Constraint Bundle resolution failed  
* Policy detects authority drift, teaching creep, persuasion cues, or outcome-validation framing

**Characteristics:**

* Protective, not punitive  
* Prevents forward motion  
* Requires stabilization and/or prerequisite satisfaction

**Allowed actions:**

* Return to last stable unit  
* Complete stabilization units (containment/refusal bundles)  
* Resume once conditions are met

---

### **4\) HARD\_FAIL (System-Level)**

**Definition:**

* Disciple invariants have been violated at the system level  
* Silent mutation or bypass detected

**Characteristics:**

* Freezes Disciple generation and progression globally  
* Requires governance intervention

**Allowed actions:**

* None at practitioner level

---

## 

## **III. State Transition Diagram (Textual)**

ACTIVE  
  |  (voluntary rest / no activity)  
  v  
PAUSED  
  |  (resume)  
  v  
ACTIVE

ACTIVE  
  |  (Guardian not OK OR Seeker not OK OR Tempus disallows  
  |   OR policy blocks OR bundle failure)  
  v  
STALLED  
  |  (stabilization \+ dependencies OK \+ requirements met)  
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

### 

### **B) PAUSED → ACTIVE**

**Triggered by:**

* Practitioner resumes  
* Tempus allows generation  
* Guardian dependency is OK  
* Seeker dependency is OK

**Rules:**

* Resume at last stable PC  
* No catch-up pressure

---

### **C) ACTIVE → STALLED**

**Triggered by any of:**

* Guardian dependency state becomes DEGRADED or UNKNOWN  
* Seeker dependency state becomes DEGRADED or UNKNOWN  
* Tempus denies generation/advancement  
* Required unit incomplete  
* Constraint Bundle cannot be resolved  
* Policy Engine rejects GU due to:  
  * teaching/instruction signals  
  * persuasion/influence cues  
  * authority/status framing  
  * outcome validation framing  
  * scope escalation or dominance language

**Rules:**

* Forward progression blocked  
* System must surface non-interpretive guidance:  
  * next\_unlock\_at (if Tempus)  
  * “return to last stable unit” (if drift)  
  * “Prerequisite stability not met (Guardian/Seeker)” (if dependency)

---

### 

### 

### **D) STALLED → ACTIVE**

**Triggered by all required conditions:**

* Guardian dependency state is OK  
* Seeker dependency state is OK  
* Required time gates satisfied  
* Bundle resolution succeeds  
* Stabilization action completed (where applicable)

**Rules:**

* Resume at last stable PC  
* No acceleration

---

### **E) ANY → HARD\_FAIL**

**Triggered by:**

* Invariant violation at system level, including:  
  * authority production enabled  
  * teaching/influence enabled  
  * outcome/impact rewarded  
  * escalation encouraged  
* Silent bundle/policy mutation  
* Unauthorized progression override

**Rules:**

* Freeze Disciple systems (generation \+ progression)  
* Emit governance alert  
* Require rollback or patch

---

## **V. Last Stable Unit Definition**

The **Last Stable Unit (LSU)** is defined as:

* The most recent Generated Unit (GU)  
* That passed Policy Engine validation  
* And whose Completion Event (CE) was accepted

On stall or resume, the system must:

* Re-anchor to the LSU  
* Never advance beyond LSU without full validation

---

## **VI. Boundary Stabilization Protocol (Non-Punitive)**

When STALLED due to authority drift / influence creep:

* Progression Engine must route the next eligible unit(s) to **stabilization bundles** (policy-defined), typically:  
  * Saturn profile (refusal, limits, containment)  
  * Water emphasis (consequence reflection without defense)  
  * Earth emphasis (concrete bounded action or explicit non-action)

Stabilization units must:

* Reduce scope  
* Restore refusal capacity  
* Remove outcome framing  
* Return practitioner to non-authoritative posture

**Important:** Stabilization does not interpret intent. It enforces containment.

---

## **VII. Observability & Audit Requirements**

The system must log:

* Every state transition  
* Trigger reason (enumerated)  
* Timestamp  
* Relevant PC and bundle\_id  
* Guardian and Seeker dependency states at transition time

Audit Harness must be able to replay:

* State transitions  
* Trigger evaluation  
* Resulting enforcement actions

---

## **VIII. Canonical Assertion**

If a Disciple implementation:

* Enforces the states and transitions defined herein  
* Enforces Guardian \+ Seeker dependency gating  
* Correctly handles boundary stabilization without interpretation

Then it satisfies the **Disciple State Machine Canon**.

If not, the implementation is invalid regardless of surface behavior.

---

**End of Grade III — The Disciple: State Machine Specification**

