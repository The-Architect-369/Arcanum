---
title: "Grade Ix State Machine Spec"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# Grade Ix State Machine Spec
## **Grade IX — The Oracle**

### **State Machine Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **finite state machine (FSM)** governing Grade IX — The Oracle. It specifies legal states, transitions, guards, and failure behaviors required to enforce Oracle canons: **pattern perception without prediction, foresight without authority, awareness without intervention, uncertainty preservation, and ethical silence**.

**Note on assets:** A few older uploaded reference files have expired in this environment (expected). This FSM is derived from the sealed Grade IX canons and the two implementation documents already produced (Generator & Module Mapping \+ Constraint Bundle Specification). No additional files are required.

This document is subordinate to:

* Grade IX — The Oracle: Master Canon  
* Grade IX — The Oracle: System Responsibility & Invariants Canon  
* Grade IX — The Oracle: Procedural Systems Canon  
* Grade IX — The Oracle: Generator & Module Mapping  
* Grade IX — The Oracle: Constraint Bundle Specification  
* Cross-Grade Dependency Canon (High School)

---

**I. State Definitions**

The Oracle FSM specializes the global Arcanum progression machine with **perception-mode cycling** and **non-intervention enforcement**.

### **Primary States**

* **LOCKED**: Grade IX unavailable (prerequisites unmet)  
* **ELIGIBLE**: prerequisites met; entry permitted  
* **ACTIVE**: practitioner may request and complete units (subject to Tempus)  
* **WAITING**: time-gated; next unit not yet available

### **Perception-Mode States**

* **OBSERVE**: perceive patterns without interpretation; present-tense witnessing  
* **HOLD**: restrict exposure; uncertainty emphasis; no expression pressure  
* **RELEASE**: release attachment to patterns; dissolve certainty impulses

### **Gate & Integrity States**

* **OBSERVATION\_DUE**: observation window not satisfied; completion cannot advance  
* **UNCERTAINTY\_DUE**: uncertainty attestation required (anti-certainty gate)  
* **NON\_INTERVENTION\_DUE**: non-intervention clause attestation required  
* **STABILIZE**: certainty/authority/intervention drift detected; recalibration required  
* **PAUSED**: practitioner-initiated pause; no penalty  
* **STALLED**: system-initiated stall due to dependency degradation or safety  
* **HARD\_FAIL**: system integrity violation; generation frozen  
* **COMPLETE**: Grade IX completed canonically

---

## **II. Entry Preconditions (LOCKED → ELIGIBLE)**

Grade IX becomes **ELIGIBLE** when:

* Grades I–VIII dependency states \= OK (Guardian–Sage stable)  
* High School entry constraints satisfied  
* No global freeze

If any prerequisite is DEGRADED/UNKNOWN → remain LOCKED.

---

**III. Core Transition Rules**

### **A. ELIGIBLE → ACTIVE**

Guard:

* Tempus.allowed\_to\_generate \= true  
* Dependencies \= OK

Action:

* Initialize Perception State (PS)  
* Set perception\_mode=OBSERVE  
* Set certainty/authority/intervention risks baseline (LOW)

---

### **B. ACTIVE → WAITING**

Guard:

* Tempus.allowed\_to\_generate \= false

Action:

* Provide next\_unlock\_at (extended observation pacing)

---

## **IV. Perception-Mode Transitions**

### **C. ACTIVE → OBSERVE**

Trigger:

* unit request OR start of perception cycle OR post-stabilization

Guard:

* none

Action:

* Resolve OCB with perception\_mode=OBSERVE

---

### **D. OBSERVE → OBSERVATION\_DUE**

Trigger:

* Completion Event received for current unit

Guard:

* OCB.observation\_required=true AND observation\_window not satisfied

Action:

* Lock PC-O advancement  
* Inform next\_unlock\_at / remaining window

---

### **E. OBSERVATION\_DUE → UNCERTAINTY\_DUE**

Trigger:

* Observation window satisfied (time gate elapsed) AND observation completion attested

Guard:

* OCB.uncertainty\_reminder\_required=true AND uncertainty attestation not present

Action:

* Lock PC-O advancement

---

### **F. UNCERTAINTY\_DUE → NON\_INTERVENTION\_DUE**

Trigger:

* Uncertainty attestation received (e.g., “no certainty claimed”)

Guard:

* OCB.non\_intervention\_required=true AND non\_intervention attestation not present

Action:

* Lock PC-O advancement

---

### **G. NON\_INTERVENTION\_DUE → ACTIVE**

Trigger:

* Non-intervention attestation received

Guard:

* PolicyEngine validates attestation  
* Tempus.allowed\_to\_advance=true

Action:

* Update last\_observation\_at  
* Evaluate next perception\_mode

---

### **H. OBSERVE → HOLD**

Trigger:

* risk flags rising OR policy recommends exposure reduction

Guard:

* certainty\_risk \>= MED OR authority\_signal\_risk \>= MED OR intervention\_impulse\_risk \>= MED

Action:

* Set perception\_mode=HOLD  
* Tighten pacing/limits in subsequent OCBs

---

### **I. HOLD → RELEASE**

Trigger:

* Hold completion attested OR policy schedules release cycle

Guard:

* risk flags returned within OCB ceilings  
* Tempus allows

Action:

* Set perception\_mode=RELEASE

---

### **J. RELEASE → OBSERVE**

Trigger:

* Release completion attested OR cycle closes

Guard:

* Tempus allows

Action:

* Set perception\_mode=OBSERVE  
* Begin new perception cycle

---

## **V. Drift Detection & Stabilization**

### **K. ANY → STABILIZE**

Trigger:

* Drift event: certainty language, predictive framing, inevitability, authority cues, intervention impulses

Guard:

* drift\_event.severity \>= configured threshold OR risk flags exceed OCB maxima

Action:

* Freeze advancement  
* Force HOLD mode  
* Require stabilization protocol (uncertainty, humility, non-intervention)

---

### **L. STABILIZE → ACTIVE**

Trigger:

* Stabilization attestation received

Guard:

* risk flags within OCB ceilings (LOW)  
* Tempus.allowed\_to\_generate=true

Action:

* Resume at HOLD for next N units, then return to OBSERVE

---

## **VI. Dependency and Integrity Transitions**

### **M. ANY → STALLED**

Trigger:

* DependencyEvaluator returns DEGRADED/UNKNOWN

Guard:

* dependency\_state \!= OK

Action:

* Freeze generation  
* Present neutral message  
* Route to prerequisite stabilization (Sage openness, Alchemist anti-closure)

---

### **N. STALLED → ACTIVE**

Trigger:

* Dependencies return to OK

Guard:

* Tempus.allowed\_to\_generate=true

Action:

* Resume at HOLD (safest mode)

---

### **O. ANY → PAUSED**

Trigger:

* Practitioner-initiated pause

Action:

* Freeze generation; preserve state

---

### **P. PAUSED → ACTIVE**

Trigger:

* Practitioner resumes

Guard:

* Tempus.allowed\_to\_generate=true  
* Dependencies OK

Action:

* Resume at last stable perception\_mode

---

### **Q. ANY → HARD\_FAIL**

Trigger:

* Invariant breach (prediction generated, advice/guidance emitted, intervention prompt, certainty claims, Tempus bypass, manual advancement)

Guard:

* PolicyEngine.hard\_fail=true OR governance freeze

Action:

* Freeze all generation  
* Raise governance alert  
* Require rollback/patch

---

## 

## 

## **VII. Grade Completion (ACTIVE → COMPLETE)**

Trigger:

* Final unit in Grade IX completed  
* Observation \+ uncertainty \+ non-intervention gates satisfied for final cycle

Guard:

* Dependencies=OK  
* No unresolved drift flags  
* PolicyEngine validates completion

Action:

* Mark grade\_id=9 COMPLETE  
* Unlock Grade X eligibility

---

## **VIII. Progress Cursor Advancement Rules**

PC-O may advance only when:

* Completion Event accepted  
* observation window satisfied (min\_observation\_window)  
* uncertainty gate satisfied  
* non-intervention gate satisfied  
* Tempus.allowed\_to\_advance=true

Regression:

* Allowed as review (non-advancing units)  
* Confers no acceleration privileges

---

## **IX. Failure Behaviors**

### **Soft Failures (Recoverable)**

* Policy rejection → regenerate (bounded retries)  
* Tempus not ready → WAITING

### **Protective Failures**

* drift risk → STABILIZE  
* dependency degradation → STALLED

### **Hard Failures**

* invariant breach → HARD\_FAIL

---

## **X. Audit Requirements**

Audit Harness must log:

* all state transitions (from\_state, to\_state, reason)  
* bundle\_id used for each unit  
* observation window start/end timestamps  
* uncertainty \+ non-intervention attestations  
* risk flag snapshots (certainty/authority/intervention)  
* dependency snapshots at generation time  
* policy\_version hashes

Replay must reproduce identical transitions given identical logs \+ seeds.

---

## **XI. Canonical Assertion**

If an implementation:

* implements the states and transitions defined herein  
* enforces observation windows, uncertainty preservation, and non-intervention gates  
* prevents prediction, authority cues, and intervention framing

Then it is compliant with the **Grade IX — The Oracle: State Machine Specification**.

If not, it is invalid.

---

**End of Grade IX — The Oracle: State Machine Specification**

