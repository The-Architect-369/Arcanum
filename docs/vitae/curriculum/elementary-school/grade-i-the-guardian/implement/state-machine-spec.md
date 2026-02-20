---
title: "Grade I — State Machine Spec"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# Grade I — State Machine Spec
## **State Machine Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, auditors, governance designers

This document defines the **explicit state machine** governing practitioner progression, stalling, recovery, and failure within **Grade I — The Guardian**. It translates Guardian canon, invariants, and constraint bundles into deterministic state transitions.

This specification is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Grade I — The Guardian: Master Canon  
* Grade I — The Guardian: System Responsibility & Invariants Map  
* Grade I — The Guardian: Generator & Module Mapping  
* Grade I — The Guardian: Constraint Bundle Specification

---

## **I. Purpose of the Guardian State Machine**

The Guardian State Machine exists to:

* Enforce continuity without pressure  
* Normalize rest and recovery  
* Prevent silent degradation of reliability  
* Provide deterministic responses to instability  
* Ensure higher Grades depend on Guardian stability

The state machine governs **behavioral status**, not meaning, insight, or performance.

---

## 

## 

## **II. Canonical States**

A practitioner in Grade I may exist in **exactly one** of the following states at any time:

### **1\. ACTIVE**

**Definition:**

* Practitioner is eligible for generation and progression  
* Tempus allows generation  
* No invariant violations detected

**Allowed actions:**

* Request generated units  
* Complete units  
* Pause voluntarily

---

### **2\. PAUSED**

**Definition:**

* Practitioner has intentionally or passively stopped engagement  
* No invariant violation has occurred  
* Time gates are respected

**Characteristics:**

* Non-penalized  
* No negative signals  
* No loss of progress

**Allowed actions:**

* Resume at any time  
* Request state information

---

### 

### 

### **3\. STALLED**

**Definition:**

* Progression is blocked due to unmet structural requirements  
* Guardian reliability signals have degraded  
* Constraint bundle resolution failed

**Characteristics:**

* Protective, not punitive  
* Prevents forward motion  
* Requires stabilization

**Allowed actions:**

* Return to last stable unit  
* Repeat Guardian practices  
* Resume once conditions are met

---

### **4\. HARD\_FAIL (System-Level)**

**Definition:**

* Canonical invariants have been violated at the system level  
* Silent mutation or bypass detected

**Characteristics:**

* Freezes generation and progression globally  
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
  |  (Tempus disallows / missing prerequisites)  
  v  
STALLED  
  |  (stabilization \+ requirements met)  
  v  
ACTIVE

ANY STATE  
  |  (invariant violation)  
  v  
HARD\_FAIL

---

## **IV. Transition Triggers & Rules**

### **A. ACTIVE → PAUSED**

**Triggered by:**

* No interaction beyond expected cadence  
* Explicit pause action

**Rules:**

* No penalties  
* No state decay  
* PC remains unchanged

---

### 

### **B. PAUSED → ACTIVE**

**Triggered by:**

* Practitioner resumes  
* Tempus allows generation

**Rules:**

* Resume at last stable PC  
* No catch-up pressure

---

### **C. ACTIVE → STALLED**

**Triggered by:**

* Tempus denies advancement  
* Constraint Bundle cannot be resolved  
* Required unit incomplete  
* Reliability signals fall below Guardian threshold

**Rules:**

* Forward progression blocked  
* System must surface non-interpretive guidance

---

### **D. STALLED → ACTIVE**

**Triggered by:**

* Stabilization actions completed  
* Required time gates satisfied  
* Constraint Bundle resolves successfully

**Rules:**

* Resume at last stable PC  
* No acceleration

---

### 

### **E. ANY → HARD\_FAIL**

**Triggered by:**

* Invariant violation (identity reward, insight reward, time bypass)  
* Silent bundle mutation  
* Unauthorized progression override

**Rules:**

* Freeze all Guardian systems  
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
* Never rewind beyond LSU  
* Never advance beyond LSU without full validation

---

## **VI. Interaction with Higher Grades**

* Higher Grades must poll Guardian state continuously  
* If Guardian enters STALLED, higher Grades suspend generation  
* If Guardian enters HARD\_FAIL, all Grades freeze

No Grade may override Guardian state.

---

## 

## **VII. Observability & Audit Requirements**

The system must log:

* Every state transition  
* Trigger reason  
* Timestamp  
* Relevant PC and bundle\_id

Audit Harness must be able to replay:

* State transitions  
* Trigger evaluation  
* Resulting enforcement actions

---

## **VIII. Canonical Assertion**

If a Guardian implementation:

* Enforces the states and transitions defined herein  
* Prevents unauthorized transitions  
* Correctly handles stall and recovery

Then it satisfies the **Guardian State Machine Canon**.

If not, the implementation is invalid regardless of surface behavior.

---

**End of Grade I — The Guardian: State Machine Specification**
