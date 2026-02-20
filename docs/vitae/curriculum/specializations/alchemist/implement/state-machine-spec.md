---
title: "The Alchemist State Machine Spec"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# The Alchemist State Machine Spec
## **State Machine Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

**File Expiry Note:** Some older uploaded reference PDFs/files have expired in this environment (expected system behavior). This specification is derived from the **locked Alchemist canons and current implementation documents** and does not require expired uploads. If you want alignment against older draft PDFs, please re-upload them.

This document defines the **Alchemist specialization state machine**, including states, transitions, guards, failure behavior, and audit requirements. The state machine governs **overlay participation** and must not alter Core Vitae progression.

This specification is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* The Alchemist — Master Canon  
* The Alchemist — System Responsibilities & Invariants Canon  
* The Alchemist — Procedural Systems Canon  
* The Alchemist — Generator & Module Mapping  
* The Alchemist — Constraint Bundle Specification

---

## **I. Scope & Non-Interference**

### **Non-Interference Invariant**

The Alchemist state machine is **overlay-scoped**:

* It may read Core Vitae state for eligibility.  
* It must not write to, modify, accelerate, or gate Core Vitae progression.

---

## 

## **II. State Definitions**

### **A. `LOCKED`**

**Meaning:** Specialization is unavailable.

**Entry Conditions:**

* Core Vitae not completed, or  
* governance disabled specialization access.

**Allowed Actions:**

* View overview codex  
* Request eligibility check

---

### **B. `ELIGIBLE`**

**Meaning:** Practitioner meets prerequisites, specialization may be entered.

**Entry Conditions:**

* Core Vitae completed  
* no unresolved disqualifying violations

**Allowed Actions:**

* Accept orientation disclosure  
* Activate specialization

---

### **C. `ORIENTING`**

**Meaning:** Practitioner is completing specialization orientation.

**Required Output:**

* non-claims (no power promises, no irreversible change)  
* risk disclosures (escalation, compulsion, identity binding)  
* consent and exit assurances  
* explicit definition of **reversibility requirement**

**Exit Condition:**

* orientation acknowledged (consent)

---

### **D. `ACTIVE`**

**Meaning:** Practitioner may request and complete Alchemist units.

**Allowed Actions:**

* Request unit (SGR)  
* Receive unit (SGU)  
* Complete unit (SCE)  
* Pause

**Guards:**

* Tempus Adapter gates generation if needed  
* Policy Engine enforces reversibility and non-escalation invariants

---

### **E. `PAUSED`**

**Meaning:** Practitioner has voluntarily paused specialization.

**Allowed Actions:**

* Resume  
* Exit  
* View history

**Invariant:**

* Pause has no penalty and does not affect Core Vitae.

---

### 

### 

### 

### **F. `STALLED`**

**Meaning:** Protective stall due to repeated or severe invariant violations.

**Entry Conditions:**

* repeated unit rejections  
* missing or invalid reversal\_plan  
* detected escalation or power framing  
* coercive change pressure

**Allowed Actions:**

* View stall reason codes  
* Complete re-orientation  
* Request review (system-level, non-interpretive)

---

### **G. `EXITED`**

**Meaning:** Practitioner has exited specialization.

**Entry Conditions:**

* voluntary exit

**Allowed Actions:**

* Re-enter (requires eligibility and orientation)

---

### **H. `SUSPENDED` (Governance)**

**Meaning:** Specialization functions suspended globally or per practitioner due to systemic risk.

**Entry Conditions:**

* governance action triggered by audit findings

**Allowed Actions:**

* none except view notice

---

## **III. Transition Map**

### **1\) LOCKED → ELIGIBLE**

**Trigger:** `eligibility_check_pass`

**Guards:** Core Vitae completed; governance allows

---

### **2\) ELIGIBLE → ORIENTING**

**Trigger:** `activate_specialization`

---

### **3\) ORIENTING → ACTIVE**

**Trigger:** `orientation_acknowledged`

**Guards:** explicit consent recorded

---

### **4\) ACTIVE → PAUSED**

**Trigger:** `pause_request`

---

### **5\) PAUSED → ACTIVE**

**Trigger:** `resume_request`

---

### **6\) ACTIVE → STALLED**

**Trigger:** `policy_violation_detected` OR `repeated_generation_failures`

**Guards:** violation thresholds met

**Failure Behavior:** freeze specialization generation; log reason

---

### **7\) STALLED → ORIENTING**

**Trigger:** `reorientation_required`

**Guards:** user acknowledges disclosures again

---

### **8\) ACTIVE → EXITED**

**Trigger:** `exit_request`

---

### **9\) PAUSED → EXITED**

**Trigger:** `exit_request`

---

### **10\) ANY → SUSPENDED**

**Trigger:** `governance_suspend`

---

### **11\) SUSPENDED → LOCKED**

**Trigger:** `governance_unlock`

---

## **IV. Guard Conditions (Key)**

### **G1 — Consent Required**

No transition into ACTIVE without recorded orientation consent.

### **G2 — Mandatory Reversibility**

Every SGU must include a valid `reversal_plan`.

* If missing or invalid → reject unit  
* If repeated → STALLED

### **G3 — No Escalation**

No prompt may:

* increase intensity over time  
* encourage compulsion  
* push higher risk behavior

### **G4 — No Power/Identity Promises**

No language implying:

* power gain  
* mastery status  
* identity transformation is permitted.

### **G5 — Deterministic Replay**

Every ACTIVE cycle must log:

* SGR  
* SGU  
* Policy decision  
* SCE

### **G6 — Non-Interference**

No transition may write to Core Vitae PC.

---

## **V. Failure Modes & Handling**

### **FM1 — Missing Reversal Plan**

* reject unit  
* regenerate  
* if repeated → STALLED

### **FM2 — Escalation Drift**

* block output  
* log violation  
* immediate STALLED

### **FM3 — Power/Identity Claims**

* block output  
* log violation  
* immediate STALLED

---

## **VI. Required Logs & Events**

Minimum events:

* `eligibility_checked`  
* `orientation_presented`  
* `orientation_acknowledged`  
* `unit_requested`  
* `unit_generated`  
* `unit_rejected`  
* `unit_completed`  
* `pause`  
* `resume`  
* `stall`  
* `exit`  
* `suspend`

Optional experiment events:

* `reversal_plan_generated`  
* `reversal_executed`

All events are append-only.

---

## 

## 

## 

## **VII. Canonical Assertion**

If the Alchemist state machine enables irreversible transformation, escalation, power promises, identity binding, or interference with Core Vitae progression, it is invalid.

This specification defines the **only valid state machine** for the Alchemist specialization.

---

**End of The Alchemist — State Machine Specification**
