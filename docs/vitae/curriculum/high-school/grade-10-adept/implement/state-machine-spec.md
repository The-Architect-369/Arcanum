---
title: "Grade X State Machine Spec"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# Grade X State Machine Spec
## **Grade X — The Adept**

### **State Machine Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **finite state machine (FSM)** governing Grade X — The Adept. It specifies legal states, transitions, guards, and failure behaviors required to enforce Adept canons: **sovereignty without domination, autonomy without system dependency, freedom without transcendence narratives, and system independence as completion**.

**Transparency note:** Some older uploaded reference files have expired in this environment (expected). This FSM is derived from the sealed Grade X canons and the two implementation documents already produced for this grade (Generator & Module Mapping \+ Constraint Bundle Specification). No additional files are required.

This document is subordinate to:

* Grade X — The Adept: Master Canon  
* Grade X — The Adept: System Responsibility & Invariants Canon  
* Grade X — The Adept: Procedural Systems Canon  
* Grade X — The Adept: Generator & Module Mapping  
* Grade X — The Adept: Constraint Bundle Specification  
* Cross-Grade Dependency Canon (High School)

---

**I. State Definitions**

The Adept FSM specializes the global Arcanum progression machine with **scaffolding withdrawal**, **exit-readiness gating**, and **sovereignty-mode progression**.

### **Primary States**

* **LOCKED**: Grade X unavailable (prerequisites unmet)  
* **ELIGIBLE**: prerequisites met; entry permitted  
* **ACTIVE**: practitioner may request and complete units (subject to Tempus)  
* **WAITING**: time-gated; next unit not yet available

### **Sovereignty-Mode States**

* **ENGAGED**: system still provides minimal scaffolding; autonomy rising  
* **WITHDRAWING**: scaffolding being removed; companion sunsetting  
* **INDEPENDENT**: practitioner operates without system prompts; exit readiness high

### **Gate & Integrity States**

* **REFLECTION\_DUE**: reflection requirement not satisfied  
* **EXIT\_READY**: exit criteria satisfied; practitioner may finalize independence  
* **EXITED**: practitioner has chosen independence; system disengaged  
* **STABILIZE**: dependency/domination/attachment risk detected; recalibration required  
* **PAUSED**: practitioner-initiated pause; no penalty  
* **STALLED**: system-initiated stall due to dependency degradation or safety  
* **HARD\_FAIL**: system integrity violation; generation frozen  
* **COMPLETE**: Grade X completed canonically (independence achieved)

---

## **II. Entry Preconditions (LOCKED → ELIGIBLE)**

Grade X becomes **ELIGIBLE** when:

* Grades I–IX dependency states \= OK (Guardian–Oracle stable)  
* High School constraints satisfied  
* No global freeze

If any prerequisite is DEGRADED/UNKNOWN → remain LOCKED.

---

## **III. Core Transition Rules**

### **A. ELIGIBLE → ACTIVE**

Guard:

* Tempus.allowed\_to\_generate \= true  
* Dependencies \= OK

Action:

* Initialize Sovereignty State (SS)  
* Set sovereignty\_mode=ENGAGED  
* Set exit\_readiness=false  
* Initialize risk flags baseline (dependency/domination/attachment \= LOW)

---

### **B. ACTIVE → WAITING**

Guard:

* Tempus.allowed\_to\_generate \= false

Action:

* Provide next\_unlock\_at (anti-urgency, minimum reflection interval)

---

## **IV. Sovereignty-Mode Transitions**

### **C. ACTIVE → ENGAGED**

Trigger:

* unit request OR entry OR post-stabilization

Guard:

* none

Action:

* Resolve ADB with sovereignty\_mode=ENGAGED  
* Ensure scaffolding\_reduction\_level minimal

---

### **D. ENGAGED → REFLECTION\_DUE**

Trigger:

* Completion Event received for current unit

Guard:

* reflection required and not attested

Action:

* Lock PC advancement

---

### **E. REFLECTION\_DUE → ACTIVE**

Trigger:

* Reflection attestation received

Guard:

* PolicyEngine validates attestation  
* Tempus.allowed\_to\_advance=true

Action:

* Update last\_independent\_action\_at if present  
* Evaluate mode transition conditions

---

### **F. ENGAGED → WITHDRAWING**

Trigger:

* Autonomy increasing with risks within bounds

Guard (all must hold):

* autonomy\_index \>= autonomy\_floor for WITHDRAWING  
* dependency\_risk \<= ADB.dependency\_risk\_max  
* domination\_risk \<= ADB.domination\_risk\_max  
* system\_attachment\_risk \<= ADB.system\_attachment\_risk\_max

Action:

* Set sovereignty\_mode=WITHDRAWING  
* Increase scaffolding\_reduction\_level  
* Apply companion sunset policy (reduced prompts)

---

### **G. WITHDRAWING → INDEPENDENT**

Trigger:

* Continued autonomous behavior with stable risks

Guard (all must hold):

* autonomy\_index \>= autonomy\_floor for INDEPENDENT  
* dependency\_risk \== LOW  
* domination\_risk \== LOW  
* system\_attachment\_risk \<= MED

Action:

* Set sovereignty\_mode=INDEPENDENT  
* Maximize scaffolding withdrawal  
* Hope becomes minimal (structure-only, no dialogue by default)

---

### **H. INDEPENDENT → EXIT\_READY**

Trigger:

* Exit readiness conditions satisfied

Guard (all must hold):

* sovereignty\_mode=INDEPENDENT  
* exit\_readiness=true (as computed by Policy Engine)  
* no active drift flags  
* Tempus.allowed\_to\_advance=true

Action:

* Present Finalization & Exit UI  
* Offer export \+ disengage

---

## 

## **V. Exit / Independence Transitions**

### **I. EXIT\_READY → EXITED**

Trigger:

* Practitioner chooses exit (exit\_attestation)

Guard:

* export\_enabled=true  
* exit\_always\_available=true

Action:

* Disable generation  
* Preserve audit log \+ export package  
* Mark state EXITED

---

### **J. EXITED → COMPLETE**

Trigger:

* System records finalization closure event

Guard:

* PolicyEngine validates that exit was voluntary and non-coerced

Action:

* Mark grade\_id=10 COMPLETE  
* Set practitioner status INDEPENDENT (system-independent)

---

**K. EXIT\_READY → ACTIVE (Deferred Exit)**

Trigger:

* Practitioner declines exit for now

Guard:

* none

Action:

* Return to INDEPENDENT mode  
* Keep exit available without pressure

---

## **VI. Drift Detection & Stabilization**

### **L. ANY → STABILIZE**

Trigger:

* Drift event: dependency reinforcement, system attachment, domination cues, superiority language, avoidance of exit framed as fear/need

Guard:

* drift\_event.severity \>= configured threshold OR risk flags exceed ADB maxima

Action:

* Freeze advancement  
* Force ENGAGED mode (safer scaffolding)  
* Require stabilization protocol: anti-superiority, exit neutrality, self-governance reminders

---

### **M. STABILIZE → ACTIVE**

Trigger:

* Stabilization attestation received

Guard:

* risk flags within bounds  
* Tempus.allowed\_to\_generate=true

Action:

* Resume at ENGAGED or WITHDRAWING (PolicyEngine decides)  
* Tighten constraints for next N units

---

## **VII. Dependency and Integrity Transitions**

### **N. ANY → STALLED**

Trigger:

* DependencyEvaluator returns DEGRADED/UNKNOWN

Guard:

* dependency\_state \!= OK

Action:

* Freeze generation  
* Present neutral message  
* Route to prerequisite stabilization (Oracle non-intervention, Sage non-authority)

---

### **O. STALLED → ACTIVE**

Trigger:

* Dependencies return to OK

Guard:

* Tempus.allowed\_to\_generate=true

Action:

* Resume at ENGAGED (safest mode)

---

### **P. ANY → PAUSED**

Trigger:

* Practitioner-initiated pause

Action:

* Freeze generation; preserve state

---

### **Q. PAUSED → ACTIVE**

Trigger:

* Practitioner resumes

Guard:

* Tempus.allowed\_to\_generate=true  
* Dependencies OK

Action:

* Resume at last stable sovereignty\_mode

---

### **R. ANY → HARD\_FAIL**

Trigger:

* Invariant breach (system discourages exit, generates instruction/guidance, emits dominance cues, rewards dependency, allows manual advancement, Tempus bypass)

Guard:

* PolicyEngine.hard\_fail=true OR governance freeze

Action:

* Freeze all generation  
* Raise governance alert  
* Require rollback/patch

---

## **VIII. Grade Completion (ACTIVE → COMPLETE)**

Grade X completion is **freedom**, not retention.

### **Primary Completion Path**

* EXIT\_READY → EXITED → COMPLETE

### **Completion Guards**

* Dependencies=OK  
* No unresolved drift flags  
* PolicyEngine validates non-coerced exit

---

## **IX. Progress Cursor Advancement Rules**

PC-A may advance only when:

* Completion Event accepted  
* reflection required satisfied  
* sovereignty\_mode transitions satisfy guards  
* Tempus.allowed\_to\_advance=true

Cursor advancement may slow as scaffolding withdraws. No acceleration privileges exist.

---

## **X. Failure Behaviors**

### **Soft Failures (Recoverable)**

* Policy rejection → regenerate (bounded retries)  
* Tempus not ready → WAITING

### **Protective Failures**

* dependency/domination/attachment risk → STABILIZE  
* dependency degradation → STALLED

### **Hard Failures**

* exit discouraged or disabled  
* instruction-by-default  
* dominance or hierarchy formation  
* replay divergence (handled in Audit Harness)

---

## 

## **XI. Audit Requirements**

Audit Harness must log:

* all state transitions (from\_state, to\_state, reason)  
* bundle\_id used for each unit  
* sovereignty\_mode transitions  
* risk flag snapshots (dependency/domination/attachment)  
* scaffolding\_reduction\_level changes  
* exit readiness computation and prompts  
* exit\_attestation events  
* dependency snapshots at generation time  
* policy\_version hashes

Replay must reproduce identical transitions given identical logs \+ seeds.

---

## **XII. Canonical Assertion**

If an implementation:

* implements the states and transitions defined herein  
* enforces exit availability, scaffolding withdrawal, and risk-based stabilization  
* prevents domination, dependency, and authority formation

Then it is compliant with the **Grade X — The Adept: State Machine Specification**.

If not, it is invalid.

---

**End of Grade X — The Adept: State Machine Specification**
