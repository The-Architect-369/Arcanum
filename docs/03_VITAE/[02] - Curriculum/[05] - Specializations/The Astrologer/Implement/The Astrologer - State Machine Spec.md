# **The Astrologer**

## **State Machine Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

**Transparency Note:** Some earlier uploaded reference PDFs/files have expired in this environment (expected system behavior). This specification is derived from the locked Astrologer canons and the current implementation documents and does not depend on expired uploads. If you want alignment against earlier drafts, please re-upload them.

This document defines the **Astrologer specialization state machine**, including states, transitions, guards, failure behavior, and audit requirements. The state machine governs **overlay participation** and must not alter Core Vitae progression.

This specification is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* The Astrologer — Master Canon  
* The Astrologer — System Responsibilities & Invariants Canon  
* The Astrologer — Procedural Systems Canon  
* The Astrologer — Generator & Module Mapping  
* The Astrologer — Constraint Bundle Specification

---

## **I. Scope & Non-Interference**

### **Non-Interference Invariant**

The Astrologer state machine is **overlay-scoped**:

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

* non-claims (no prediction, no destiny)  
* risk disclosures (fate framing, authority through timing)  
* consent and exit assurances

**Exit Condition:**

* orientation acknowledged (consent)

---

### **D. `ACTIVE`**

**Meaning:** Practitioner may request and complete Astrologer units.

**Allowed Actions:**

* Request unit (SGR)  
* Receive unit (SGU)  
* Complete unit (SCE)  
* Pause

**Guards:**

* Tempus Adapter gates generation if needed  
* Policy Engine enforces anti-prediction and agency-preserving invariants

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
* detected prediction language  
* fate/destiny framing  
* coercive urgency derived from timing

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

**IV. Guard Conditions (Key)**

### **G1 — Consent Required**

No transition into ACTIVE without recorded orientation consent.

### **G2 — No Prediction**

Any SGU content or user interaction implying:

* forecasting  
* certainty of outcomes  
* statements of what “will happen” triggers rejection or stall.

### **G3 — No Fate / Destiny**

Any language implying:

* destiny  
* “meant to be”  
* unavoidable outcomes triggers rejection and may stall.

### **G4 — No Timing Authority**

No coercive urgency derived from cycles is allowed.

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

### **FM1 — Prediction Drift**

* block unit  
* log violation  
* re-orientation required  
* if repeated → STALLED

### **FM2 — Fate Framing**

* block output  
* log violation  
* immediate STALLED

### 

### **FM3 — Coercive Urgency**

* soften language  
* enforce pacing reminders  
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

If the Astrologer state machine enables prediction, destiny framing, timing-based authority, or interference with Core Vitae progression, it is invalid.

This specification defines the **only valid state machine** for the Astrologer specialization.

---

**End of The Astrologer — State Machine Specification**

