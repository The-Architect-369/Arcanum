# **Arcanum Vitae**

## **Grade VIII — The Sage**

### **State Machine Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **finite state machine (FSM)** governing Grade VIII — The Sage. It specifies legal states, transitions, guards, and failure behaviors required to enforce Sage canons: **integration without authority, wisdom as restraint, coherence without closure, challengeability, and extended reflection pacing**.

**Note on assets:** Some older uploaded reference files may expire in this environment. This FSM is derived from the sealed Grade VIII canonical documents and the implementation specs already produced (Generator & Module Mapping \+ Constraint Bundle Specification).

This document is subordinate to:

* Grade VIII — The Sage: Master Canon  
* Grade VIII — The Sage: System Responsibility & Invariants Canon  
* Grade VIII — The Sage: Procedural Systems Canon  
* Grade VIII — The Sage: Generator & Module Mapping  
* Grade VIII — The Sage: Constraint Bundle Specification  
* Cross-Grade Dependency Canon (Intermediate)

---

## **I. State Definitions**

The Sage FSM specializes the global Arcanum progression machine with **integration-mode cycling** and **non-closure enforcement**.

### **Primary States**

* **LOCKED**: Grade VIII unavailable (prerequisites unmet)  
* **ELIGIBLE**: prerequisites met; entry permitted  
* **ACTIVE**: practitioner may request and complete units (subject to Tempus)  
* **WAITING**: time-gated; next unit not yet available

### **Integration-Mode States**

* **HOLD**: maintain parallel holding; do not resolve; restraint emphasis  
* **REVISE**: revise prior integrations; keep openness; remove certainty  
* **REVISIT**: revisit earlier grades/units without regression penalty  
* **RELEASE**: release attachment to conclusions; dissolve identity hooks

### **Gate & Integrity States**

* **REFLECTION\_DUE**: reflection requirement not satisfied  
* **CHALLENGEABILITY\_DUE**: revise/uncertainty prompt not satisfied  
* **STABILIZE**: closure/detachment/authority-signal drift detected; recalibration required  
* **PAUSED**: practitioner-initiated pause; no penalty  
* **STALLED**: system-initiated stall due to dependency degradation or safety  
* **HARD\_FAIL**: system integrity violation; generation frozen  
* **COMPLETE**: Grade VIII completed canonically

---

**II. Entry Preconditions (LOCKED → ELIGIBLE)**

Grade VIII becomes **ELIGIBLE** when:

* Grades I–VII dependency states \= OK (Guardian–Alchemist stable)  
* Intermediate School constraints satisfied  
* No global freeze

If any prerequisite is DEGRADED/UNKNOWN → remain LOCKED.

---

**III. Core Transition Rules**

### **A. ELIGIBLE → ACTIVE**

Guard:

* Tempus.allowed\_to\_generate \= true  
* Dependencies \= OK

Action:

* Initialize Integration State (IS)  
* Set integration\_mode=HOLD  
* Set risk flags baseline (closure\_risk=LOW)

---

### **B. ACTIVE → WAITING**

Guard:

* Tempus.allowed\_to\_generate \= false

Action:

* Provide next\_unlock\_at (extended reflection pacing)

---

## **IV. Integration-Mode Transitions**

### **C. ACTIVE → HOLD**

Trigger:

* unit request OR drift recovery OR start of integration cycle

Guard:

* none

Action:

* Resolve SCB with integration\_mode=HOLD

---

### **D. HOLD → REFLECTION\_DUE**

Trigger:

* Completion Event received for current unit

Guard:

* SCB.reflection\_required=true AND reflection not attested

Action:

* Lock PC-S advancement

---

**E. REFLECTION\_DUE → CHALLENGEABILITY\_DUE**

Trigger:

* Reflection attestation received

Guard:

* SCB.challengeability\_required=true AND challengeability not attested

Action:

* Lock PC-S advancement

---

**F. CHALLENGEABILITY\_DUE → ACTIVE**

Trigger:

* Challengeability attestation received (e.g., uncertainty held, revision statement)

Guard:

* PolicyEngine validates attestation  
* Tempus.allowed\_to\_advance=true

Action:

* Update last\_challengeable\_at  
* Evaluate next integration\_mode

---

**G. HOLD → REVISE**

Trigger:

* Mode rotation OR openness below floor OR closure risk rising

Guard:

* PolicyEngine recommends revise OR SCB specifies REVISE next

Action:

* Set integration\_mode=REVISE

---

### **H. REVISE → REVISIT**

Trigger:

* Revision completion attested

Guard:

* Tempus allows  
* Dependencies OK

Action:

* Set integration\_mode=REVISIT  
* Enable regression-mode generation (review) without changing canonical cursor

---

### **I. REVISIT → RELEASE**

Trigger:

* Revisit completion attested

Guard:

* Openness within bounds  
* Authority signal risk LOW

Action:

* Set integration\_mode=RELEASE

---

### **J. RELEASE → HOLD**

Trigger:

* Release completion attested OR cycle closes

Guard:

* Tempus allows

Action:

* Set integration\_mode=HOLD  
* Begin new integration cycle

---

## **V. Drift Detection & Stabilization**

### **K. ANY → STABILIZE**

Trigger:

* Drift event: closure, passive authority, deference cues, detachment superiority, immunity-to-questioning

Guard:

* drift\_event.severity \>= configured threshold OR risk flags exceed SCB maxima

Action:

* Freeze advancement  
* Tighten constraints (force HOLD or REVISE)  
* Require stabilization protocol (non-conclusion, humility, openness)

---

### **L. STABILIZE → ACTIVE**

Trigger:

* Stabilization attestation received

Guard:

* risk flags within bounds  
* Tempus.allowed\_to\_generate=true

Action:

* Resume at HOLD with stricter pacing for next N units

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
* Route to prerequisite stabilization (e.g., Healer boundaries, Alchemist closure)

---

### **N. STALLED → ACTIVE**

Trigger:

* Dependencies return to OK

Guard:

* Tempus.allowed\_to\_generate=true

Action:

* Resume at HOLD

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

* Resume at last stable integration\_mode

---

### **Q. ANY → HARD\_FAIL**

Trigger:

* Invariant breach (e.g., system produces instruction-by-default, closure events, authority signaling, Tempus bypass, manual advancement)

Guard:

* PolicyEngine.hard\_fail=true OR governance freeze

Action:

* Freeze all generation  
* Raise governance alert  
* Require rollback/patch

---

## **VII. Grade Completion (ACTIVE → COMPLETE)**

Trigger:

* Final unit in Grade VIII completed  
* Reflection \+ challengeability satisfied for final cycle

Guard:

* Dependencies=OK  
* No unresolved drift flags (closure/detachment/authority)  
* PolicyEngine validates completion

Action:

* Mark grade\_id=8 COMPLETE  
* Unlock Grade IX eligibility

---

## **VIII. Progress Cursor Advancement Rules**

PC-S may advance only when:

* Completion Event accepted  
* reflection\_required satisfied  
* challengeability\_required satisfied  
* non\_conclusion\_required satisfied  
* Tempus.allowed\_to\_advance=true

Regression (REVISIT):

* Generates review units flagged as non-advancing  
* Does not change canonical cursor  
* Confers no acceleration privileges

---

## **IX. Failure Behaviors**

### **Soft Failures (Recoverable)**

* Policy rejection → regenerate (bounded retries)  
* Tempus not ready → WAITING

### **Protective Failures**

* drift risk → STABILIZE  
* dependency issues → STALLED

### 

### **Hard Failures**

* invariant breach → HARD\_FAIL

---

## **X. Audit Requirements**

Audit Harness must log:

* all state transitions (from\_state, to\_state, reason)  
* bundle\_id used for each unit  
* reflection \+ challengeability attestations  
* openness\_index and risk flags snapshots  
* dependency snapshots at generation time  
* policy\_version hashes

Replay must reproduce identical transitions given identical logs \+ seeds.

---

## **XI. Canonical Assertion**

If an implementation:

* implements the states and transitions defined herein  
* enforces non-closure, non-authority, and challengeability gates  
* preserves extended pacing and drift stabilization

Then it is compliant with the **Grade VIII — The Sage: State Machine Specification**.

If not, it is invalid.

---

**End of Grade VIII — The Sage: State Machine Specification**

