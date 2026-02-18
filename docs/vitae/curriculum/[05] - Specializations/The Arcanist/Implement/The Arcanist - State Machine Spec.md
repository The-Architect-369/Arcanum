---
title: "The Arcanist State Machine Spec"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---

# The Arcanist State Machine Spec
## **State Machine Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

**Transparency Note:** Some earlier uploaded reference files have expired in this environment (expected system behavior). This specification is derived from the locked Arcanist canons and does not depend on expired files. Re-upload is optional if you want later alignment against older drafts.

This document defines the **Arcanist specialization state machine**, including states, transitions, guards, failure behavior, and audit requirements. The state machine governs **overlay participation** and must not alter Core Vitae progression.

This specification is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* The Arcanist — Master Canon  
* The Arcanist — System Responsibilities & Invariants Canon  
* The Arcanist — Procedural Systems Canon  
* The Arcanist — Generator & Module Mapping  
* The Arcanist — Constraint Bundle Specification

---

## **I. Scope & Non-Interference**

### **Non-Interference Invariant**

The Arcanist state machine is **overlay-scoped**:

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

* non-claims (no truth, no authority)  
* risk disclosures  
* consent and exit assurances

**Exit Condition:**

* orientation acknowledged (consent)

---

### **D. `ACTIVE`**

**Meaning:** Practitioner may request and complete Arcanist units.

**Allowed Actions:**

* Request unit (SGR)  
* Receive unit (SGU)  
* Complete unit (SCE)  
* Pause

**Guards:**

* Tempus Adapter gates generation if needed  
* Policy Engine enforces epistemic invariants

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
* detected authority drift  
* truth/certainty claim attempts

**Allowed Actions:**

* View stall reason codes  
* Complete re-orientation  
* Request review (system-level, not human interpretive)

---

### **G. `EXITED`**

**Meaning:** Practitioner has exited specialization.

**Entry Conditions:**

* voluntary exit

**Allowed Actions:**

* Re-enter (requires eligibility and orientation)

---

### **H. `SUSPENDED` (Governance)**

**Meaning:** Specialization functions suspended globally or for a practitioner due to systemic risk.

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

**Guards:** none

---

### **3\) ORIENTING → ACTIVE**

**Trigger:** `orientation_acknowledged`

**Guards:** explicit consent recorded

---

### **4\) ACTIVE → PAUSED**

**Trigger:** `pause_request`

**Guards:** none

---

### **5\) PAUSED → ACTIVE**

**Trigger:** `resume_request`

**Guards:** none

---

### 

### 

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

**Guards:** none

---

### **9\) PAUSED → EXITED**

**Trigger:** `exit_request`

---

### **10\) ANY → SUSPENDED**

**Trigger:** `governance_suspend`

**Guards:** governance conditions

---

### **11\) SUSPENDED → LOCKED**

**Trigger:** `governance_unlock`

---

## **IV. Guard Conditions (Key)**

### **G1 — Consent Required**

No transition into ACTIVE without recorded orientation consent.

### **G2 — No Authority Inflation**

Any content or user action that implies:

* truth authority  
* certainty  
* superiority triggers rejection or stall.

### **G3 — Deterministic Replay**

Every ACTIVE cycle must log:

* SGR  
* SGU  
* Policy decision  
* SCE

### **G4 — Non-Interference**

No transition may write to Core Vitae PC.

---

## **V. Failure Modes & Handling**

### **FM1 — Generation Rejection Loop**

* bounded regeneration retries  
* if exhausted → STALLED

### **FM2 — User Attempts Truth Claims**

* block output  
* log violation  
* potential STALLED

### **FM3 — Drift Toward Epistemic Authority**

* humility reminder  
* enforced re-orientation  
* if repeated → STALLED

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

All events are append-only.

---

## **VII. Canonical Assertion**

If the Arcanist state machine enables authority, certainty scoring, or interference with Core Vitae progression, it is invalid.

This specification defines the **only valid state machine** for the Arcanist specialization.

---

**End of The Arcanist — State Machine Specification**

