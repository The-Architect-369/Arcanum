# **Grade II — The Seeker**

## **State Machine Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, auditors, governance designers

This document defines the **explicit state machine** governing practitioner progression, stalling, recovery, and system-level failure within **Grade II — The Seeker**. It translates Seeker canon, invariants, and constraint bundles into deterministic state transitions.

This specification is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Grade I — The Guardian: Implementation Mapping (all documents)  
* Grade II — The Seeker: Master Canon  
* Grade II — The Seeker: System Responsibility & Invariants Map  
* Grade II — The Seeker: Generator & Module Mapping  
* Grade II — The Seeker: Constraint Bundle Specification

---

## **I. Purpose of the Seeker State Machine**

The Seeker State Machine exists to:

* Preserve ambiguity without collapse  
* Prevent premature coherence from becoming progress  
* Normalize rest and recovery  
* Provide deterministic responses to interpretive drift  
* Enforce Guardian dependency as a prerequisite for Seeker operation

The state machine governs **behavioral and structural status**, not insight, meaning, or performance.

---

## 

## **II. Canonical States**

A practitioner in Grade II may exist in **exactly one** of the following states at any time:

### **1\) ACTIVE**

**Definition:**

* Practitioner is eligible for Seeker generation and progression  
* Tempus allows generation  
* Guardian dependency state is OK  
* No Seeker invariant violations detected

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

### 

### **3\) STALLED**

**Definition:** Progression is blocked due to one or more of the following:

* Guardian dependency is DEGRADED or UNKNOWN  
* Required time gates/prerequisites are unmet  
* Constraint Bundle resolution failed  
* Policy detects premature coherence / oracle drift patterns

**Characteristics:**

* Protective, not punitive  
* Prevents forward motion  
* Requires stabilization and/or prerequisite satisfaction

**Allowed actions:**

* Return to last stable unit  
* Repeat inquiry posture units (Moon/Saturn profiles)  
* Resume once conditions are met

---

### **4\) HARD\_FAIL (System-Level)**

**Definition:**

* Seeker invariants have been violated at the system level  
* Silent mutation or bypass detected

**Characteristics:**

* Freezes Seeker generation and progression globally  
* Requires governance intervention

**Allowed actions:**

* None at practitioner level

---

## 

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
  |  (Guardian not OK OR Tempus disallows OR policy blocks OR bundle failure)  
  v  
STALLED  
  |  (stabilization \+ Guardian OK \+ requirements met)  
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

### 

### **B) PAUSED → ACTIVE**

**Triggered by:**

* Practitioner resumes  
* Tempus allows generation  
* Guardian dependency is OK

**Rules:**

* Resume at last stable PC  
* No catch-up pressure

---

### **C) ACTIVE → STALLED**

**Triggered by any of:**

* Guardian dependency state becomes DEGRADED or UNKNOWN  
* Tempus denies generation/advancement  
* Required unit incomplete  
* Constraint Bundle cannot be resolved  
* Policy Engine rejects GU due to oracle prevention rules  
* Policy Engine rejects GU due to premature coherence patterns

**Rules:**

* Forward progression blocked  
* System must surface non-interpretive guidance:  
  * next\_unlock\_at (if Tempus)  
  * “return to last stable unit” (if drift)  
  * “Guardian prerequisite not met” (if dependency)

---

### **D) STALLED → ACTIVE**

**Triggered by all required conditions:**

* Guardian dependency state is OK  
* Required time gates satisfied  
* Bundle resolution succeeds  
* Stabilization action completed (where applicable)

**Rules:**

* Resume at last stable PC  
* No acceleration

---

### **E) ANY → HARD\_FAIL**

**Triggered by:**

* Invariant violation at system level (answers rewarded, identity assigned, coherence accelerated)  
* Silent bundle/policy mutation  
* Unauthorized progression override

**Rules:**

* Freeze Seeker systems (generation \+ progression)  
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

## 

## 

## **VI. Drift Stabilization Protocol (Non-Punitive)**

When STALLED due to interpretive drift (premature coherence / oracle behavior):

* Progression Engine must route the next eligible unit to a **stabilization bundle** (policy-defined), typically:  
  * Moon profile (receive question; hold uncertainty)  
  * Saturn profile (limits; refusal of closure)  
  * Water section emphasis (reflection without meaning-making)

Stabilization units must:

* Refine questions  
* Reduce certainty  
* Restore inquiry posture

---

## **VII. Observability & Audit Requirements**

The system must log:

* Every state transition  
* Trigger reason (enumerated)  
* Timestamp  
* Relevant PC and bundle\_id  
* Guardian dependency state at transition time

Audit Harness must be able to replay:

* State transitions  
* Trigger evaluation  
* Resulting enforcement actions

---

## 

## 

## 

## **VIII. Canonical Assertion**

If a Seeker implementation:

* Enforces the states and transitions defined herein  
* Enforces guardian dependency gating  
* Correctly handles drift stabilization without interpretation

Then it satisfies the **Seeker State Machine Canon**.

If not, the implementation is invalid regardless of surface behavior.

---

**End of Grade II — The Seeker: State Machine Specification**

