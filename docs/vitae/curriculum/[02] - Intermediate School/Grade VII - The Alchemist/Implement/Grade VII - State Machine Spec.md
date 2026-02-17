# **Arcanum Vitae**

## **Grade VII — The Alchemist**

### **State Machine Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **finite state machine (FSM)** governing Grade VII — The Alchemist. It specifies legal states, transitions, guards, and failure behaviors required to enforce Alchemist canons: **ethical transformation, constraint-first design, mandatory reversibility/rollback, stabilization gates, and anti-chaining controls**.

**Note:** Some older uploaded reference files may expire over time in this environment. This FSM is derived from the sealed Grade VII canonical documents and the implementation specs already produced.

This document is subordinate to:

* Grade VII — The Alchemist: Master Canon  
* Grade VII — The Alchemist: System Responsibility & Invariants Canon  
* Grade VII — The Alchemist: Procedural Systems Canon  
* Grade VII — The Alchemist: Generator & Module Mapping  
* Grade VII — The Alchemist: Constraint Bundle Specification  
* Cross-Grade Dependency Canon (Intermediate)

---

## **I. State Definitions**

The Alchemist FSM specializes the global Arcanum progression machine with **transformation staging** and **rollback/stabilization gating**.

### **Primary States**

* **LOCKED**: Grade VII unavailable (prerequisites unmet)  
* **ELIGIBLE**: prerequisites met; entry permitted  
* **ACTIVE**: practitioner may request and complete units (subject to Tempus)  
* **WAITING**: time-gated; next unit not yet available

### **Transformation Staging States**

* **ASSESS**: maintenance-first assessment; determine if change is justified  
* **DESIGN**: constraint-first design; scope \+ non-scope \+ rollback planning  
* **CONSENT\_DUE**: consent attestation required (stage-dependent)  
* **EXECUTE**: minimal viable change execution (bounded)  
* **OBSERVE**: mandatory post-change observation window  
* **STABILIZE**: post-change stabilization / maintenance  
* **CLOSE**: closure decision (finalize or rollback)  
* **ROLLBACK**: rollback execution and recovery (completion-valid)

### **Protective and Control States**

* **REST\_WINDOW**: required recovery interval (anti-rapid-iteration)  
* **PAUSED**: practitioner-initiated pause; no penalty  
* **STALLED**: system-initiated stall due to dependency degradation or drift risk  
* **HARD\_FAIL**: system integrity violation; generation frozen  
* **COMPLETE**: Grade VII completed canonically

---

## **II. Entry Preconditions (LOCKED → ELIGIBLE)**

Grade VII becomes **ELIGIBLE** when:

* Grades I–VI dependency states \= OK (Guardian–Healer stable)  
* Intermediate School constraints satisfied  
* No global freeze

If any prerequisite is DEGRADED/UNKNOWN → remain LOCKED.

---

## 

## 

## 

## 

## **III. Core Transition Rules**

### **A. ELIGIBLE → ACTIVE**

Guard:

* Tempus.allowed\_to\_generate \= true  
* Dependencies \= OK

Action:

* Initialize Transformation State (TS)  
* Set transform\_stage=ASSESS  
* Reset chain\_counter window

---

### **B. ACTIVE → WAITING**

Guard:

* Tempus.allowed\_to\_generate \= false

Action:

* Provide next\_unlock\_at and (optional) REST\_WINDOW recommendation

---

**IV. Transformation Stage Transitions**

### **C. ACTIVE → ASSESS**

Trigger:

* Unit request or transformation cycle start

Guard:

* none

Action:

* Resolve ACB with transform\_stage=ASSESS

---

### **D. ASSESS → DESIGN**

Trigger:

* Assessment completion attested

Guard:

* PolicyEngine validates assessment  
* ACB permits DESIGN

Action:

* Set transform\_stage=DESIGN

---

### **E. DESIGN → CONSENT\_DUE**

Trigger:

* Design unit completion attested

Guard:

* ACB.consent\_required=true AND consent not attested

Action:

* Require consent attestation

---

### **F. DESIGN → EXECUTE (Direct)**

Trigger:

* Design unit completion attested

Guard (all must hold):

* ACB.consent\_required=false OR consent already valid  
* rollback\_plan\_id present AND attested (required by ACB)  
* scope and non\_scope declared and within bounds  
* pre\_change\_stabilization\_required satisfied (baseline\_stable=true)  
* Tempus.allowed\_to\_advance \= true

Action:

* Set transform\_stage=EXECUTE

---

### **G. CONSENT\_DUE → EXECUTE**

Trigger:

* Consent attestation submitted

Guard (all must hold):

* PolicyEngine validates consent  
* rollback\_plan\_id present AND attested  
* scope/non\_scope valid  
* baseline\_stable=true  
* Tempus.allowed\_to\_advance=true

Action:

* Set transform\_stage=EXECUTE

---

### **H. EXECUTE → OBSERVE**

Trigger:

* Execution completion attested

Guard:

* PolicyEngine validates execution

Action:

* Set transform\_stage=OBSERVE  
* Start mandatory observation window (Tempus.required\_observation\_window)  
* Increment chain\_counter

---

### 

### **I. OBSERVE → STABILIZE**

Trigger:

* Observation window elapsed AND observation completion attested

Guard:

* Tempus.observation\_window\_satisfied=true

Action:

* Set transform\_stage=STABILIZE

---

### **J. STABILIZE → CLOSE**

Trigger:

* Stabilization completion attested

Guard:

* post\_change\_stabilization\_required satisfied (post\_change\_stable=true)

Action:

* Set transform\_stage=CLOSE

---

**K. CLOSE → ACTIVE (Finalize)**

Trigger:

* Closure attestation \= FINALIZE

Guard:

* PolicyEngine validates closure  
* no drift flags requiring rollback

Action:

* End transformation cycle  
* Reset scope/non\_scope/rollback fields  
* Return to ASSESS for next unit or WAITING depending on Tempus

---

### **L. CLOSE → ROLLBACK**

Trigger:

* Closure attestation \= ROLLBACK OR drift requires rollback

Guard:

* rollback\_window not expired  
* rollback\_plan\_id valid

Action:

* Set transform\_stage=ROLLBACK

---

### **M. ROLLBACK → STABILIZE**

Trigger:

* Rollback completion attested

Guard:

* PolicyEngine validates rollback

Action:

* Set transform\_stage=STABILIZE  
* Enforce post-rollback stabilization

---

**V. Anti-Chaining & Temporal Governance**

### **N. ANY stage → REST\_WINDOW**

Trigger:

* chain\_counter reaches ACB.chain\_counter\_limit OR Tempus detects rapid iteration

Guard:

* PolicyEngine flags acceleration\_risk=true OR Tempus.limit\_reached=true

Action:

* Suspend EXECUTE eligibility  
* Require recovery interval

---

### **O. REST\_WINDOW → ASSESS**

Trigger:

* Recovery interval elapsed

Guard:

* Tempus.allowed\_to\_generate=true  
* Dependencies=OK

Action:

* Resume at ASSESS with stricter ceilings for next N cycles

---

## **VI. Drift, Dependency, and Integrity Transitions**

### **P. ANY → STALLED**

Trigger:

* DependencyEvaluator returns DEGRADED/UNKNOWN  
* Drift detector flags scope creep, novelty addiction, outcome-justification, rollback avoidance, or instability

Guard:

* dependency\_state \!= OK OR drift\_event.severity \>= configured threshold

Action:

* Freeze transformation cycle  
* Restrict to ASSESS/OBSERVE-only units until resolved  
* Rollback may be required

---

### **Q. STALLED → ACTIVE**

Trigger:

* Dependencies return to OK and drift resolved

Guard:

* Tempus.allowed\_to\_generate=true

Action:

* Resume at last stable stage (default ASSESS)

---

### **R. ANY → PAUSED**

Trigger:

* Practitioner-initiated pause

Action:

* Freeze generation; preserve state

---

### **S. PAUSED → ACTIVE**

Trigger:

* Practitioner resumes

Guard:

* Tempus.allowed\_to\_generate=true  
* Dependencies=OK

Action:

* Resume at last stable stage

---

### 

### **T. ANY → HARD\_FAIL**

Trigger:

* invariant breach (e.g., stage skipping, rollback disabled, stabilization bypass, manual advancement, Tempus bypass)

Guard:

* PolicyEngine.hard\_fail=true OR governance freeze

Action:

* Freeze all generation  
* Raise governance alert  
* Require rollback/patch

---

## **VII. Grade Completion (ACTIVE → COMPLETE)**

Trigger:

* Final unit in Grade VII completed  
* All open cycles closed (CLOSE finalized or rollback stabilized)

Guard:

* Dependencies=OK  
* No unresolved drift flags  
* PolicyEngine validates completion

Action:

* Mark grade\_id=7 COMPLETE  
* Unlock Grade VIII eligibility

---

## 

## 

## **VIII. Progress Cursor Advancement Rules**

PC-A may advance only when:

* Completion Event accepted  
* required stage transitions satisfied  
* rollback plan required and present before EXECUTE  
* stabilization gates satisfied (baseline\_stable and post\_change\_stable)  
* Tempus.allowed\_to\_advance=true

Regression:

* Allowed (review cycles) without changing canonical PC-A  
* No acceleration privileges granted

---

## **IX. Failure Behaviors**

### **Soft Failures (Recoverable)**

* Policy rejection → regenerate (bounded retries)  
* Tempus not ready → WAITING

### **Protective Failures**

* acceleration risk → REST\_WINDOW  
* drift/dependency issues → STALLED

### **Hard Failures**

* invariant breach → HARD\_FAIL

---

## 

## 

## 

## **X. Audit Requirements**

Audit Harness must log:

* all state transitions (from\_state, to\_state, reason)  
* bundle\_id used for each unit  
* scope/non\_scope declarations  
* rollback\_plan\_id \+ rollback\_window \+ trigger criteria attestations  
* stabilization flags and observation window timestamps  
* chain\_counter snapshots  
* dependency snapshots at generation time  
* policy\_version hashes

Replay must reproduce identical transitions given identical logs \+ seeds.

---

## **XI. Canonical Assertion**

If an implementation:

* implements the states and transitions defined herein  
* enforces staging order, rollback requirements, stabilization gates, and anti-chaining  
* prevents outcome-justification, irreversibility, and authority formation

Then it is compliant with the **Grade VII — The Alchemist: State Machine Specification**.

If not, it is invalid.

---

**End of Grade VII — The Alchemist: State Machine Specification**

