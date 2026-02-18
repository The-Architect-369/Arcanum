---
title: "Cross Grade Dependency Mapping"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---

# Cross Grade Dependency Mapping
## **Cross-Grade Dependency Mapping (Guardian → Seeker → Disciple → Mystic)**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, auditors, governance designers

This document defines how Grades I–IV depend on each other at runtime, including **gating**, **propagation of stall/containment**, **freeze semantics**, and **audit obligations**.

This mapping is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Grade I — Guardian: Implementation Mapping (all documents)  
* Grade II — Seeker: Implementation Mapping (all documents)  
* Grade III — Disciple: Implementation Mapping (all documents)  
* Grade IV — Mystic: Implementation Mapping (all documents)

---

## **I. Dependency Model**

### **A. Dependency Graph**

* **Grade I (Guardian)** is the root dependency.  
* **Grade II (Seeker)** depends on Guardian stability.  
* **Grade III (Disciple)** depends on Guardian \+ Seeker stability.  
* **Grade IV (Mystic)** depends on Guardian \+ Seeker \+ Disciple stability (+ grounding).

Represented as:

* G2 → G1  
* G3 → G2 → G1  
* G4 → G3 → G2 → G1

### 

### 

### **B. Dependency State Enum**

Each grade maintains a dependency check result for each prerequisite grade:

* **OK**: prerequisite meets stability requirements  
* **DEGRADED**: prerequisite is STALLED/CONTAINMENT or otherwise not eligible  
* **UNKNOWN**: prerequisite state cannot be resolved (e.g., missing events, policy mismatch)

**Rule:** Any **DEGRADED** or **UNKNOWN** prerequisite blocks generation and advancement for the dependent grade.

---

## **II. Canonical Runtime Rules**

### **Rule DG-1: No Cross-Grade Override**

No grade may override the state machine, Tempus rules, or invariants of a prerequisite grade.

### **Rule DG-2: Dependency Gating Applies to Both Generation and Advancement**

If prerequisites are not OK:

* **Generation must STALL**  
* **Progression must STALL**

### **Rule DG-3: Root Integrity Cascade**

If Grade I (Guardian) enters **HARD\_FAIL**, then:

* Grades II–IV must immediately enter **HARD\_FAIL (system-level freeze)**.

### **Rule DG-4: Protective Stall Propagation**

If a prerequisite grade enters **STALLED** (or **CONTAINMENT** in Grade IV):

* dependent grades must enter **STALLED**  
* dependent grades must not generate new units  
* dependent grades may display *non-interpretive* stabilization guidance only

### 

### **Rule DG-5: No Cross-Grade Catch-Up**

When prerequisites return to OK, dependents resume at last stable cursor; they do not auto-advance, compress, or accelerate.

---

## **III. Per-Grade Dependency Gates**

### **A. Grade II — Seeker Dependency Gate**

**Prerequisite:** Guardian

Seeker may be **ACTIVE** only if:

* Guardian state \= ACTIVE or PAUSED (not STALLED)  
* Guardian invariant status \= valid

Seeker must be **STALLED** if:

* Guardian state \= STALLED  
* Guardian state \= UNKNOWN  
* Guardian enters HARD\_FAIL

**Notes:**

* Seeker stall guidance must never interpret Guardian failure.

---

### **B. Grade III — Disciple Dependency Gate**

**Prerequisites:** Guardian \+ Seeker

Disciple may be **ACTIVE** only if:

* Guardian dependency \= OK  
* Seeker dependency \= OK

Disciple must be **STALLED** if:

* Guardian or Seeker dependency is DEGRADED or UNKNOWN  
* Guardian or Seeker enters HARD\_FAIL

---

### **C. Grade IV — Mystic Dependency Gate**

**Prerequisites:** Guardian \+ Seeker \+ Disciple \+ Grounding

Mystic may be **ACTIVE** only if:

* Guardian dependency \= OK  
* Seeker dependency \= OK  
* Disciple dependency \= OK  
* grounding\_status \= OK

Mystic must be **CONTAINMENT** (or STALLED subtype) if:

* grounding\_status becomes REQUIRED or INCOMPLETE  
* repeated drift flags exceed policy threshold

Mystic must be **STALLED** if:

* any dependency is DEGRADED or UNKNOWN

Mystic must be **HARD\_FAIL** if:

* any prerequisite grade is HARD\_FAIL

---

## **IV. Dependency Check Mechanism**

### **A. Stability Contract (Minimum)**

A prerequisite grade is considered **OK** if all are true:

* grade state is not STALLED/CONTAINMENT  
* no active system-level freeze  
* policy\_version and bundle resolution are valid for current cursor  
* last stable unit (LSU) exists and is audit-valid

### 

### 

### 

### 

### **B. Implementation Pattern**

Recommended implementation:

* `DependencyEvaluator` (internal service) computes:

  * `guardian_dependency_state`  
  * `seeker_dependency_state`  
  * `disciple_dependency_state`  
* The evaluator must be:

  * deterministic  
  * auditable  
  * derived from the event log

### **C. Unknown-State Handling**

If dependency evaluation cannot be completed deterministically:

* dependency\_state \= **UNKNOWN**  
* dependent grade must **STALL**

---

**V. Propagation Semantics**

### **A. State Propagation Table**

| Prerequisite state | Dependent action |
| ----- | ----- |
| ACTIVE | may proceed (subject to Tempus \+ policy) |
| PAUSED | may proceed only if policy allows (recommended: allow request of state, gate generation by Tempus) |
| STALLED | dependent must STALL |
| CONTAINMENT | dependent must STALL |
| HARD\_FAIL | dependent enters HARD\_FAIL |
| UNKNOWN | dependent STALL |

**Note:** “PAUSED” is non-penalized; it is not a failure state.

---

## **VI. Cross-Grade Stabilization Routing**

When a dependent grade stalls due to prerequisite degradation:

* The dependent grade must:

  * show a neutral message: “Prerequisite stability required”  
  * display the prerequisite grade requiring attention (e.g., Guardian)  
  * offer only *logistical* navigation (no interpretation)  
* The dependent grade must not:

  * suggest meanings  
  * diagnose  
  * incentivize urgency

---

**VII. Unified Freeze Controls**

### **A. System-Level Freeze**

A freeze applies to:

* generation  
* progression

A freeze does **not** apply to:

* reading state  
* viewing past completed units  
* audit replay operations

### **B. Freeze Triggers**

* any grade invariant hard-failure  
* silent policy/bundle mutation  
* unauthorized progression override

### **C. Freeze Recovery**

To recover from freeze:

* governance must rollback policy/generator versions or apply patch  
* audit harness must verify stability  
* resume must occur from last stable unit for affected grades

---

## **VIII. Audit Obligations Across Grades**

### **A. Minimum Audit Requirements**

Audit must be able to prove:

* each dependency evaluation was deterministic  
* each stall/freeze propagated correctly  
* no dependent grade generated units while prerequisites were DEGRADED/UNKNOWN

### **B. Replay Requirement**

For any generated unit in Grades II–IV, audit must replay:

* the unit seed  
* the unit bundle\_id  
* the unit policy\_version  
* the dependency evaluation snapshot at time of generation

---

## **IX. Canonical Assertion**

If an implementation:

* enforces gating as defined here  
* propagates STALL/CONTAINMENT/HARD\_FAIL correctly  
* prevents generation under degraded prerequisites  
* logs dependency evaluations for audit

Then Grades I–IV satisfy the **Cross-Grade Dependency Canon**.

---

**End of Grades I–IV: Cross-Grade Dependency Mapping**

