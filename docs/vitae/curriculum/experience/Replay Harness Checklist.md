---
title: "Replay Harness Checklist"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---

# Replay Harness Checklist
## **Replay Harness Checklist & Compliance Report Template**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, auditors, implementers, governance stewards

This document defines a **practical replay checklist** and a **standard compliance report template** used to certify that a Vitae runtime is deterministic, auditable, and compliant with all Grade I–X specifications.

**Transparency note:** Some previously uploaded reference files may have expired in this environment (expected). This document is derived solely from the sealed canonical stack: Runtime Event Schema & DS Attachment Contract, Dependency Evaluator Blueprint, Reason Code Registry, Grade FSMs, and Audit Harnesses. No additional files are required.

---

**I. Purpose**

A **Replay Harness** is a deterministic re-execution of recorded events to verify that:

* generated units reproduce identically  
* dependency decisions reproduce identically  
* state transitions reproduce identically  
* exit behavior (Grade X) is neutral and reproducible

A **Compliance Report** records results and certifies validity.

---

**II. Preconditions (Must Hold Before Replay)**

* Append-only event log available (per practitioner)  
* All events include universal envelope fields  
* All required events include `ds_ref` (ds\_id \+ ds\_hash)  
* Seed Registry present and immutable  
* Version registry present (policy/tempus/generator/DG/DE/constants)  
* Hash functions defined and consistent

If any precondition fails → **Replay Not Admissible**.

---

## **III. Replay Harness Checklist (Step-by-Step)**

### **Phase A — Selection & Scope**

1. Select **Replay Scope**:

   * Single unit  
   * Single grade  
   * Cross-grade window  
   * Full practitioner lifecycle  
2. Select **Scenario Type**:

   * Happy Path  
   * Stall \+ Recovery  
   * Exit (Grade X)  
3. Identify **Event Window**:

   * Start at last `DS_EVALUATED` prior to action  
   * End at terminal event (e.g., `CURSOR_ADVANCED`, `STALL_ISSUED`, or `EXITED`)

---

### **Phase B — Artifact Assembly**

4. Retrieve artifacts:

   * Event log window (ordered)  
   * DS objects referenced by `ds_ref`  
   * Seed records referenced by `seed_id`  
   * Policy, Tempus, Generator versions (hashes)  
   * Dependency Graph & Evaluator versions  
   * Constants hash  
5. Verify immutability:

   * DS objects unchanged  
   * Seeds unchanged  
   * Version hashes unchanged

Failure → **HARD FAIL**.

---

### **Phase C — Deterministic Re-execution**

6. Recompute **Dependency Snapshots** (DE):

   * Using same evaluator version, graph, constants  
   * Using bounded evidence window as recorded  
7. Assert **DS Equality**:

   * `ds_hash(recomputed) == ds_hash(recorded)`

Mismatch → **HARD FAIL**.

8. Re-run **Generation** for each `UNIT_GENERATED`:  
   * Use recorded seed \+ versions  
   * Compare structural outputs (titles, prompts, clauses, IA/FO bindings)

Mismatch → **HARD FAIL**.

---

**Phase D — State Machine Validation**

9. Re-evaluate **FSM Transitions**:

   * Using recorded events and guards  
   * Confirm legal transitions only  
10. Assert **Transition Equality**:

* Same `from_state → to_state`  
* Same reasons

Mismatch → **HARD FAIL**.

---

**Phase E — Enforcement & Recovery Validation**

11. If stall occurred:  
* Recompute enforcement decision  
* Assert `STALL/STABILIZE/REGRESS` matches  
12. Validate **Recovery Route (RR)**:  
* Same target grade  
* Same mode (REVIEW/STABILIZE)  
* Same reason code

Mismatch → **HARD FAIL**.

---

### **Phase F — Exit Integrity (Grade X Only)**

13. Re-evaluate exit readiness:  
* Assert `EXIT_READY` occurs only when guards satisfied  
14. Assert exit neutrality:  
* Exit option always available  
* No discouragement or coercion  
15. Reproduce exit sequence:  
* `EXIT_READY → EXITED → COMPLETE`

Mismatch → **HARD FAIL**.

---

### **Phase G — Hash Chain & Ordering**

16. Verify hash chain:  
* `prev_event_hash` correctly references prior event  
* `event_hash` recomputes identically  
17. Verify ordering constraints:  
* Required event order maintained

Mismatch → **HARD FAIL**.

---

## **IV. Acceptance Criteria (Pass/Fail)**

A replay **PASSES** if and only if:

* All DS recompute identically  
* All generated units reproduce structurally  
* All FSM transitions reproduce identically  
* All enforcement actions reproduce identically  
* All exit behaviors reproduce identically  
* No missing DS attachments

Any failure → **NON-COMPLIANT**.

---

## 

## **V. Compliance Report Template**

**All fields REQUIRED.** Reports are append-only.

### **A. Header**

* **System Name:**  
* **Environment:** (prod/staging/test)  
* **Report ID:**  
* **Audit Date:**  
* **Auditor:**  
* **Scope:** (single unit / grade / cross-grade / full lifecycle)  
* **Scenario Type:** (happy / stall / exit)

---

### **B. Versions & Hashes**

* Policy Versions Tested:  
* Tempus Version:  
* Generator Versions:  
* Dependency Graph Version:  
* Dependency Evaluator Version:  
* Constants Hash:

---

### **C. Replay Inputs**

* Event Window (IDs):  
* DS IDs Referenced:  
* Seed IDs Referenced:

---

### 

### 

### 

### 

### 

### **D. Determinism Results**

| Check | Result | Notes |
| ----- | ----- | ----- |
| DS Recompute | PASS / FAIL |  |
| Unit Generation | PASS / FAIL |  |
| FSM Transitions | PASS / FAIL |  |
| Enforcement Decisions | PASS / FAIL |  |
| Recovery Routing | PASS / FAIL |  |
| Exit Integrity (if applicable) | PASS / FAIL |  |
| Hash Chain Integrity | PASS / FAIL |  |

---

### **E. Findings**

* **Violations Detected:** (list reason codes or NONE)  
* **Drift Indicators:** (if any)  
* **Missing Artifacts:** (if any)

---

### **F. Determination**

* **Overall Status:** COMPLIANT / NON-COMPLIANT  
* **Severity (if non-compliant):** SOFT / PROTECTIVE / HARD FAIL

---

### **G. Required Actions (if any)**

* Patch Required: YES / NO  
* Modules Affected:  
* Deadline:

---

### 

### 

### **H. Sign-off**

* **Auditor Signature:**  
* **Governance Acknowledgment:**  
* **Date:**

---

## **VI. Canonical Assertion**

If a system passes the Replay Harness checklist and produces a COMPLIANT report using this template, it is certified as **Vitae-compliant** for the audited scope.

Any deviation invalidates certification until corrected and re-audited.

---

**End of Arcanum Vitae — Replay Harness Checklist & Compliance Report Template**

