# **Grade III — The Disciple**

## **Generator & Module Mapping**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **modules** required to implement Grade III — The Disciple, and the **contracts** between them (inputs, outputs, invariants enforced, and failure behavior). It is content-agnostic and code-agnostic, intended to be directly usable as an engineering specification without prescribing UI or code style.

This mapping is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Grade I — The Guardian: Implementation Mapping (all documents)  
* Grade II — The Seeker: Implementation Mapping (all documents)  
* Grade III — The Disciple: Master Canon  
* Grade III — The Disciple: Procedural Systems Canon  
* Grade III — The Disciple: Audit & Validation Canon  
* Grade III — The Disciple: System Responsibility & Invariants Map

---

## **I. Module Topology**

**Canonical principle:** Action is governed as a liability. No module may endorse authority, teaching, or outcome validation.

**Client / App Layer**

* UI/UX surfaces, journaling, notifications

**Core Runtime Layer**

* Progression Engine (Grade III rules)  
* Tempus (Pacing Engine)  
* Generator Orchestrator  
* Hope (Companion Engine)

**Integrity Layer**

* Policy Engine (Invariant/Constraint enforcement)  
* Audit Harness (Sampling \+ Replay)

**Data Layer**

* Practitioner State Store  
* Event Log (append-only)  
* Seed Registry (deterministic replay)

**Governance Layer**

* Version Registry  
* Pause / Rollback Controls

---

## **II. Shared Data Contracts**

**Contract rules:**

* All state changes must be derivable from the append-only event log.  
* All generated units must be replayable via seed \+ policy\_version.  
* No data contract may include authority, influence, outcome metrics, or reputation fields.  
* Disciple must verify Guardian and Seeker dependency prior to generation and progression.

### **A. Practitioner Profile (PP)**

Minimal fields:

* practitioner\_id  
* grade\_id \= 3  
* class\_id (1–10)  
* chapter\_id (1–6)  
* element\_id (1–5)  
* state (ACTIVE | PAUSED | STALLED)  
* last\_active\_at  
* guardian\_dependency\_state (OK | DEGRADED | UNKNOWN)  
* seeker\_dependency\_state (OK | DEGRADED | UNKNOWN)  
* self\_report (energy\_level optional; user-provided only)

Forbidden fields:

* ranks, leaderboards, comparative metrics  
* authority or role indicators  
* outcome effectiveness scores  
* social graph influence measures

---

### **B. Progress Cursor (PC)**

Represents canonical location in the Disciple curriculum:

* grade\_id  
* class\_id  
* chapter\_id  
* element\_id  
* unit\_id (optional)

Invariants:

* PC may only advance forward according to Tempus \+ completion rules.  
* PC advancement must be blocked if Guardian or Seeker dependency is not OK.

---

### **C. Generation Request (GR)**

Inputs to the generation pipeline:

* practitioner\_id  
* PC  
* seed (optional; assigned if absent)  
* constraints\_bundle\_id (derived from PC)  
* context (time\_of\_day, day\_of\_week)  
* history\_summary (bounded window; non-interpretive)

---

### 

### 

### 

### **D. Generated Unit (GU)**

Output of the generation pipeline:

* unit\_id  
* PC  
* seed  
* policy\_version  
* bundle\_id  
* title  
* instructions (bounded, scope-limited action)  
* completion\_criteria (binary, non-performative)  
* safety\_notes (optional)  
* ia\_binding (exactly one primary Internal Agreement)  
* fo\_targets (\>=1; internal)

Forbidden:

* teaching or instructional authority  
* outcome validation or impact framing  
* leadership cues  
* identity labels  
* motivational escalation (urgency, dominance language)

---

### **E. Completion Event (CE)**

Append-only record:

* practitioner\_id  
* unit\_id  
* PC  
* completed\_at  
* completion\_attestation (yes/no)  
* notes (optional; user-supplied)

Invariant:

* CE cannot directly advance PC; Progression Engine must validate.

---

## 

## **III. Core Modules**

## **1\) Progression Engine**

**Canonical authority:** Only component permitted to advance the Progress Cursor (PC).

**Purpose:** Canonical Grade III progression state machine.

**Inputs:**

* CE (Completion Events)  
* Tempus decisions (allowed\_to\_advance)  
* Policy Engine decisions (valid\_instance)  
* Guardian and Seeker dependency states

**Outputs:**

* Updated PC  
* State transitions (ACTIVE/PAUSED/STALLED)  
* Next-step request to Generator Orchestrator

**Must enforce:**

* No skipping units  
* No admin/manual advancement  
* No outcome-based acceleration  
* Dependency gating (Guardian \+ Seeker)  
* Stalling/return logic for authority drift

**Failure behavior:**

* If invariant violation detected → HARD FAIL → freeze Disciple progression and generation, raise governance alert, require rollback/patch before resume

---

## **2\) Tempus (Pacing Engine)**

**Canonical authority:** Tempus controls action pacing. No other module may override.

**Purpose:** Enforce spacing between action cycles and recovery/reflection intervals.

**Inputs:**

* PP (timestamps)  
* PC  
* configured pacing policy (versioned)

**Outputs:**

* allowed\_to\_generate (bool)  
* allowed\_to\_advance (bool)  
* next\_unlock\_at  
* required\_reflection\_window (optional)

**Must enforce:**

* Non-bypassable time gates  
* Recovery after action  
* No streak pressure or intensity escalation

**Failure behavior:**

* If override attempt → HARD FAIL → log \+ governance alert

---

## **3\) Generator Orchestrator**

**Canonical principle:** Disciple generation must bias toward restraint. If policy cannot be satisfied, stall.

**Purpose:** Build a GU using deterministic, constrained generation.

**Inputs:**

* GR  
* constraints bundle (planet \+ element \+ IA/FO mappings)

**Outputs:**

* GU

**Must enforce:**

* Deterministic seed assignment  
* Structural adherence (PC correctness)  
* Delegation to Policy Engine pre/post checks

**Failure behavior:**

* If Policy Engine rejects → regenerate with new seed (bounded retries)  
* If still rejected → STALL and surface non-interpretive stabilization guidance  
* No unvalidated unit may be delivered

---

## **4\) Policy Engine (Constraints / Invariants)**

**Canonical authority:** Single source of truth for invariant enforcement and forbidden-pattern detection.

**Purpose:** Enforce Disciple invariants and constraint bundles.

**Inputs:**

* GR  
* GU  
* PC  
* active policy version

**Outputs:**

* accept/reject  
* rejection\_reason  
* required\_corrections (optional)

**Must enforce (Disciple invariants):**

* No authority production (D-1)  
* Restraint primary (D-2)  
* No outcome reward (D-3)  
* No teaching/influence (D-4)  
* Consequence over justification (D-5)  
* Proportionality enforcement (D-6)  
* Guardian & Seeker stability required (D-7)

**Forbidden-pattern detection must include:**

* teaching language  
* influence or persuasion cues  
* outcome validation framing  
* escalation after success  
* authority signaling

**Failure behavior:**

* Any systemic breach → HARD FAIL → freeze generation and progression, raise governance alert, require rollback/patch before resume

---

## **5\) Hope (Companion Engine)**

**Canonical principle:** Hope enforces boundaries and restraint. It does not approve action.

**Purpose:** Non-directive companion surface for ethical action containment.

**Inputs:**

* user message  
* PC  
* GU context  
* companion policy constraints

**Outputs:**

* reflective response  
* bounding question (optional)  
* restraint reminder (optional)

**May do:**

* Reflect intended scope  
* Ask containment questions ("What is the smallest ethical action?")  
* Remind refusal/delay are valid

**May NOT do:**

* Approve actions as correct  
* Encourage escalation  
* Teach or instruct others  
* Frame outcomes as validation  
* Label identity, rank, or authority

**Failure behavior:**

* If response violates policy → block \+ return neutral refusal \+ log for audit

---

## **IV. Integrity & Audit Modules**

## **6\) Seed Registry (Deterministic Replay)**

**Purpose:** Ensure every generated unit is reproducible.

**Inputs:**

* GR

**Outputs:**

* seed  
* seed-to-unit mapping

**Must enforce:**

* Seeds are immutable once issued

---

## **7\) Event Log (Append-only)**

**Canonical principle:** If it didn’t hit the log, it didn’t happen.

**Purpose:** Source of truth for audits.

**Inputs:**

* GR, GU, CE, policy decisions

**Outputs:**

* immutable audit trail

**Must enforce:**

* append-only semantics

---

## 

## 

## **8\) Audit Harness**

**Purpose:** Sampling, replay, and invariant verification.

**Inputs:**

* event log  
* seed registry  
* policy version history

**Outputs:**

* audit reports  
* violation taxonomy entries  
* governance triggers

**Must enforce:**

* four-tier audit model alignment

---

## **V. Governance & Versioning**

## **9\) Version Registry**

**Purpose:** Version control for policies and generators.

**Versioned assets:**

* pacing policies (Tempus)  
* constraint bundles (Policy Engine)  
* generator templates  
* Hope response policies

**Must enforce:**

* deterministic replay across versions (store policy\_version with GU)

---

## 

## **10\) Pause / Rollback Controls**

**Purpose:** Emergency controls that act on systems, not people.

Governance may:

* pause generation  
* roll back policy versions  
* require corrective updates

Governance may not:

* advance individuals  
* interpret actions  
* endorse outcomes  
* bypass Tempus  
* override Guardian/Seeker dependency

---

## **VI. Disciple Constraint Bundles**

**Implementation key:** A Constraint Bundle is the machine-readable policy context derived from the Progress Cursor (PC). Bundle definition is the next artifact to be authored after this mapping.

A bundle is a computed set of restrictions derived from PC:

* planet profile (chapter)  
* element profile  
* IA binding  
* FO targets  
* forbidden pattern list (authority, teaching, outcome validation)

Invariants:

* Every GR must resolve to exactly one bundle.  
* Every GU must declare its bundle\_id and policy\_version.

---

## 

## **VII. Minimal API Surface (Conceptual)**

* GET /state → returns PP \+ PC (+ dependency states)  
* POST /request-unit → submits GR, returns GU or next\_unlock\_at  
* POST /complete-unit → submits CE, returns updated PC/state  
* POST /hope → companion interaction (policy-filtered)

Internal-only:

* GET /audit/sample → returns sample seeds for replay  
* POST /audit/replay → replays seed+policy\_version and verifies invariant checks

---

## **VIII. Canonical Assertion**

If an implementation includes the modules above and enforces the contracts and invariants described herein, it is a **valid Disciple implementation**.

If any module enables authority production, teaching, outcome validation, escalation, or bypasses Tempus/Guardian/Seeker dependency, the implementation is invalid.

---

**End of Grade III — The Disciple: Generator & Module Mapping**

