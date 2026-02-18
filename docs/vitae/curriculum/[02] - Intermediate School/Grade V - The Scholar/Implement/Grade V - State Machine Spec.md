---
title: "Grade V State Machine Spec"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# Grade V State Machine Spec
## **Grade V — The Scholar**

### **State Machine Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **finite state machine (FSM)** governing Grade V — The Scholar. It specifies legal states, transitions, guards, and failure behaviors required to enforce Scholar canons: **cognitive stability, synthesis-before-expansion, reflection-as-completion, and anti-authority constraints**.

This document is subordinate to:

* Grade V — The Scholar: Master Canon  
* Grade V — The Scholar: System Responsibility & Invariants Canon  
* Grade V — The Scholar: Procedural Systems Canon  
* Grade V — The Scholar: Generator & Module Mapping  
* Grade V — The Scholar: Constraint Bundle Specification  
* Cross-Grade Dependency Canon (Intermediate)

---

## 

## 

## 

## 

## 

## 

## **I. State Definitions**

The Scholar FSM is a specialization of the global Arcanum progression machine.

### **Primary States**

* **LOCKED**: Grade V not available (prerequisites unmet)  
* **ELIGIBLE**: prerequisites met; entry permitted  
* **ACTIVE**: practitioner may request and complete units (subject to Tempus)  
* **WAITING**: time-gated; next unit not yet available  
* **REFLECTION\_DUE**: unit completed but reflection requirement not satisfied  
* **SYNTHESIS\_DUE**: synthesis\_required=true and synthesis not completed  
* **STABILIZE**: cognitive drift detected; stabilization protocol required  
* **PAUSED**: practitioner-initiated pause; no penalty  
* **STALLED**: system-initiated stall due to invariant or dependency degradation  
* **HARD\_FAIL**: system integrity violation; generation frozen  
* **COMPLETE**: Grade V completed canonically

### **Optional Substates (Implementation Allowed)**

* **REST\_WINDOW** (substate of WAITING): recovery interval recommended  
* **REGRESSION\_MODE** (substate of ACTIVE): revisiting prior material

---

## **II. Entry Preconditions (LOCKED → ELIGIBLE)**

Grade V becomes **ELIGIBLE** when:

* Grades I–IV dependency states \= OK  
* Intermediate School entry gate satisfied  
* Practitioner state not under global freeze

If any prerequisite is DEGRADED or UNKNOWN → remain LOCKED.

---

## 

## 

## 

## **III. Core Transition Rules**

### **A. ELIGIBLE → ACTIVE**

Guard:

* Tempus.allowed\_to\_generate \= true  
* No global freeze

Action:

* Initialize Scholar Cognitive State (SCS)  
* Set synthesis\_required=false

---

### **B. ACTIVE → WAITING**

Guard:

* Tempus.allowed\_to\_generate \= false

Action:

* Provide next\_unlock\_at

---

### **C. ACTIVE → REFLECTION\_DUE**

Trigger:

* Completion Event received for current unit

Guard:

* SCB.reflection\_required \= true  
* reflection not yet attested

Action:

* Lock PC advancement  
* Prompt reflection unit (bounded)

---

### **D. REFLECTION\_DUE → ACTIVE**

Trigger:

* Reflection attestation received

Guard:

* Tempus.allowed\_to\_advance \= true  
* PolicyEngine validates reflection event

Action:

* Update last\_reflection\_at  
* Evaluate synthesis\_required

---

### **E. ACTIVE/REFLECTION\_DUE → SYNTHESIS\_DUE**

Trigger:

* Synthesis required by SCB or progression rules

Guard:

* synthesis\_required=true AND synthesis\_completed\_at is null

Action:

* Lock PC advancement  
* Issue synthesis unit request

---

### **F. SYNTHESIS\_DUE → ACTIVE**

Trigger:

* Synthesis attestation received

Guard:

* PolicyEngine validates synthesis event

Action:

* Set synthesis\_required=false  
* Set synthesis\_completed\_at=now

---

### **G. ACTIVE → STABILIZE**

Trigger:

* Drift detection event (overload, rigidity, abstraction detachment)

Guard:

* PolicyEngine flags drift=true

Action:

* Suspend generation  
* Issue stabilization protocol unit (grounding \+ integration)

---

### **H. STABILIZE → ACTIVE**

Trigger:

* Stabilization attestation received

Guard:

* PolicyEngine validates stabilization  
* cognitive\_load\_index within ceiling

Action:

* Resume generation under stricter ceilings for next N units

---

### 

### 

### 

### 

### **I. ANY → PAUSED**

Trigger:

* Practitioner-initiated pause

Guard:

* none

Action:

* Freeze generation; preserve state

---

### **J. PAUSED → ACTIVE**

Trigger:

* Practitioner resumes

Guard:

* Tempus.allowed\_to\_generate \= true  
* Dependencies \= OK

Action:

* Resume at last stable cursor

---

### 

### 

### 

### 

### 

### 

### **K. ANY → STALLED**

Trigger:

* DependencyEvaluator returns DEGRADED/UNKNOWN for prerequisites  
* or invariant threatened requiring protective stop

Guard:

* dependency\_state \!= OK OR policy mismatch

Action:

* Freeze generation  
* Present neutral message  
* Route to prerequisite grade requiring attention

---

### **L. STALLED → ACTIVE**

Trigger:

* Dependencies return to OK

Guard:

* Tempus.allowed\_to\_generate \= true

Action:

* Resume at last stable cursor

---

### 

### 

### 

### 

### 

### **M. ANY → HARD\_FAIL**

Trigger:

* invariant breach (e.g., bypass Tempus, authority reward, manual advancement)

Guard:

* PolicyEngine.hard\_fail=true OR governance freeze

Action:

* Freeze all generation  
* Raise governance alert  
* Require rollback or patch

---

### **N. ACTIVE → COMPLETE**

Trigger:

* Final unit in Grade V completed  
* Reflection \+ synthesis satisfied

Guard:

* Dependencies \= OK  
* No unresolved drift flags  
* PolicyEngine validates completion

Action:

* Mark grade\_id=5 COMPLETE  
* Unlock Grade VI eligibility

---

## 

## 

## 

## **IV. Progress Cursor (PC) Advancement Rules**

PC may advance only when:

* Completion Event accepted  
* reflection\_required satisfied  
* synthesis\_required satisfied  
* Tempus.allowed\_to\_advance \= true

PC advancement is **monotonic** unless practitioner enters REGRESSION\_MODE.

Regression:

* Does not change canonical PC  
* Generates units flagged as review  
* Earns no acceleration privileges

---

## **V. Failure Behaviors**

### **Soft Failures**

* Policy rejection of generated unit → regenerate with bounded retries  
* Tempus not ready → WAITING

### **Protective Failures**

* Drift detected → STABILIZE  
* Dependencies degrade → STALLED

### **Hard Failures**

* Invariant breach → HARD\_FAIL

---

## 

## 

## 

## **VI. Audit Requirements**

Audit Harness must log:

* all state transitions (from\_state, to\_state, reason)  
* bundle\_id used for each unit  
* dependency snapshots at generation time  
* policy\_version hashes

Replay must reproduce:

* identical state transitions given same event log \+ seeds

---

## **VII. Canonical Assertion**

If an implementation:

* implements the states and transitions defined herein  
* enforces reflection and synthesis gates  
* prevents accumulation, authority, and overload

Then it is compliant with the **Grade V — The Scholar: State Machine Specification**.

If not, it is invalid.

---

**End of Grade V — The Scholar: State Machine Specification**

