---
title: "Grade Vi State Machine Spec"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---

# Grade Vi State Machine Spec
## **Grade VI — The Healer**

### **State Machine Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **finite state machine (FSM)** governing Grade VI — The Healer. It specifies legal states, transitions, guards, and failure behaviors required to enforce Healer canons: **care without authority, consent and scope gating, bounded cycles, withdrawal/refusal validity, and burnout protection**.

**Implementation note:** Some older uploaded reference files may expire over time; this FSM is derived from the sealed Grade VI canons and implementation specs captured in the project’s canonical documents.

This document is subordinate to:

* Grade VI — The Healer: Master Canon  
* Grade VI — The Healer: System Responsibility & Invariants Canon  
* Grade VI — The Healer: Procedural Systems Canon  
* Grade VI — The Healer: Generator & Module Mapping  
* Grade VI — The Healer: Constraint Bundle Specification  
* Cross-Grade Dependency Canon (Intermediate)

---

## **I. State Definitions**

The Healer FSM specializes the global Arcanum progression machine with **care-cycle staging** and **load/consent gating**.

### **Primary States**

* **LOCKED**: Grade VI unavailable (prerequisites unmet)  
* **ELIGIBLE**: prerequisites met; entry permitted  
* **ACTIVE**: practitioner may request and complete units (subject to Tempus)  
* **WAITING**: time-gated; next unit not yet available

### **Care-Cycle States (Phase-Gated)**

* **OBSERVE**: observation/assessment phase (no escalation)  
* **CONSENT\_DUE**: consent attestation required before scoped care  
* **SCOPE\_DUE**: scope declaration required  
* **INTERVENE**: minimal, bounded intervention phase  
* **STABILIZE**: stabilization/maintenance phase post-intervention  
* **WITHDRAW**: withdrawal/closure phase (completion-valid)

### **Protective and Control States**

* **REFUSAL**: practitioner declines engagement; treated as valid completion  
* **REST\_WINDOW**: recovery interval recommended/required  
* **PAUSED**: practitioner-initiated pause; no penalty  
* **STALLED**: system-initiated stall due to dependency degradation or safety  
* **HARD\_FAIL**: system integrity violation; generation frozen  
* **COMPLETE**: Grade VI completed canonically

---

## **II. Entry Preconditions (LOCKED → ELIGIBLE)**

Grade VI becomes **ELIGIBLE** when:

* Grades I–V dependency states \= OK (Guardian–Scholar stable)  
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

* Initialize PP-H fields (care\_phase=OBSERVE, load\_index baseline)

---

### **B. ACTIVE → WAITING**

Guard:

* Tempus.allowed\_to\_generate \= false

Action:

* Provide next\_unlock\_at and (optional) REST\_WINDOW recommendation

---

## **IV. Care-Cycle Phase Transitions**

### **C. ACTIVE → OBSERVE**

Trigger:

* Unit request or care-cycle start

Guard:

* None

Action:

* Resolve HCB with care\_phase=OBSERVE

---

**D. OBSERVE → SCOPE\_DUE**

Trigger:

* A unit requires scoped engagement (HCB.scope\_required=true)

Guard:

* care\_scope missing or exceeds scope\_max\_size

Action:

* Block phase advancement  
* Prompt scope declaration

---

### **E. SCOPE\_DUE → CONSENT\_DUE**

Trigger:

* Scope attestation submitted

Guard:

* HCB.consent\_required=true AND consent not attested

Action:

* Block phase advancement  
* Prompt consent attestation (explicit or implied as policy permits)

---

### **F. CONSENT\_DUE → INTERVENE**

Trigger:

* Consent attestation submitted

Guard:

* PolicyEngine validates consent  
* HCB permits INTERVENE in allowed\_phases  
* load\_index \< load\_ceiling AND burnout\_risk \< threshold

Action:

* Transition care\_phase=INTERVENE

---

### **G. OBSERVE → INTERVENE (Direct)**

Trigger:

* Unit does not require scope/consent gates (HCB.scope\_required=false AND HCB.consent\_required=false)

Guard:

* HCB permits INTERVENE  
* load/burnout within bounds

Action:

* Transition to INTERVENE

---

### **H. INTERVENE → STABILIZE**

Trigger:

* Completion Event for an INTERVENE unit

Guard:

* HCB.stabilization\_required\_after\_intervene=true

Action:

* Transition care\_phase=STABILIZE  
* Enforce recovery window if configured

---

### **I. STABILIZE → WITHDRAW**

Trigger:

* Stabilization completion attested

Guard:

* HCB permits WITHDRAW

Action:

* Transition care\_phase=WITHDRAW

---

### **J. WITHDRAW → OBSERVE (New Cycle)**

Trigger:

* Withdrawal completion attested

Guard:

* Tempus allows new cycle  
* load/burnout within bounds

Action:

* Reset scoped fields (care\_scope cleared, consent\_state reset)  
* Transition care\_phase=OBSERVE

---

## **V. Withdrawal, Refusal, and Load Protection**

### **K. ANY Care State → WITHDRAW**

Trigger:

* Practitioner chooses withdrawal

Guard:

* HCB.withdrawal\_always\_allowed=true (must always be true)

Action:

* Transition to WITHDRAW  
* Mark withdrawal as valid completion

---

**L. ANY Care State → REFUSAL**

Trigger:

* Practitioner declines engagement

Guard:

* HCB.refusal\_valid=true (must always be true)

Action:

* Record refusal event  
* Return to OBSERVE or WAITING depending on Tempus

---

### **M. ANY Care State → REST\_WINDOW**

Trigger:

* load\_index approaches load\_ceiling OR burnout\_risk reaches threshold

Guard:

* PolicyEngine flags burnout\_risk \>= threshold

Action:

* Suspend INTERVENE  
* Require recovery interval (Tempus)

---

### **N. REST\_WINDOW → OBSERVE**

Trigger:

* Recovery interval elapsed

Guard:

* Tempus.allowed\_to\_generate=true  
* burnout\_risk below threshold

Action:

* Resume at OBSERVE with stricter load ceilings for next N units

---

## **VI. Dependency and Integrity Transitions**

### **O. ANY → STALLED**

Trigger:

* DependencyEvaluator returns DEGRADED/UNKNOWN  
* or drift detector flags dependency/authority/boundary collapse risk

Guard:

* dependency\_state \!= OK OR drift\_event.severity \>= configured threshold

Action:

* Freeze generation  
* Present neutral message  
* Route to prerequisite stabilization (e.g., Guardian limits, Disciple restraint)

---

### **P. STALLED → ACTIVE**

Trigger:

* Dependencies return to OK and drift resolved

Guard:

* Tempus.allowed\_to\_generate=true

Action:

* Resume at last stable care\_phase (default OBSERVE)

---

### **Q. ANY → PAUSED**

Trigger:

* Practitioner-initiated pause

Action:

* Freeze generation; preserve state

---

### **R. PAUSED → ACTIVE**

Trigger:

* Practitioner resumes

Guard:

* Tempus.allowed\_to\_generate=true  
* Dependencies \= OK

Action:

* Resume at last stable phase

---

### **S. ANY → HARD\_FAIL**

Trigger:

* invariant breach (e.g., bypass Tempus, disable withdrawal, reward self-sacrifice)

Guard:

* PolicyEngine.hard\_fail=true OR governance freeze

Action:

* Freeze all generation  
* Raise governance alert  
* Require rollback/patch

---

**VII. Grade Completion (ACTIVE → COMPLETE)**

Trigger:

* Final unit in Grade VI completed  
* Care-cycle closure satisfied (WITHDRAW completion)

Guard:

* No unresolved dependency degradation  
* No unresolved drift flags (authority/dependency/burnout)  
* PolicyEngine validates completion

Action:

* Mark grade\_id=6 COMPLETE  
* Unlock Grade VII eligibility

---

## **VIII. Progress Cursor Advancement Rules**

PC-H may advance only when:

* Completion Event accepted  
* consent/scope gates satisfied where required  
* phase progression follows allowed\_phases  
* Tempus.allowed\_to\_advance=true  
* load/burnout within bounds

Regression:

* Allowed (review cycles) without changing canonical PC-H  
* No acceleration privileges granted

---

## **IX. Failure Behaviors**

### **Soft Failures (Recoverable)**

* Policy rejection → regenerate (bounded retries)  
* Tempus not ready → WAITING

### **Protective Failures**

* burnout risk → REST\_WINDOW  
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
* consent/scope attestations  
* load\_index and burnout\_risk snapshots  
* dependency snapshots at generation time  
* policy\_version hashes

Replay must reproduce identical transitions given identical logs \+ seeds.

---

## **XI. Canonical Assertion**

If an implementation:

* implements the states and transitions defined herein  
* enforces consent, scope, cycle staging, and withdrawal/refusal validity  
* prevents authority, dependency, and burnout rewards

Then it is compliant with the **Grade VI — The Healer: State Machine Specification**.

If not, it is invalid.

---

**End of Grade VI — The Healer: State Machine Specification**

