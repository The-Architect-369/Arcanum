---
title: "Grade Vii Generator & Module Mapping"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---

# Grade Vii Generator & Module Mapping
## **Grade VII — The Alchemist**

### **Generator & Module Mapping**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **modules** required to implement Grade VII — The Alchemist, and the **contracts** between them (inputs, outputs, invariants enforced, and failure behavior). It is content-agnostic and code-agnostic.

**Note on assets:** Some previously uploaded reference files may expire over time. This mapping is derived from the sealed Grade VII canons and cross-grade dependency canons already captured in the project’s canonical document stack.

This mapping is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Intermediate School Canon  
* Grade VII — The Alchemist: Master Canon  
* Grade VII — The Alchemist: System Responsibility & Invariants Canon  
* Grade VII — The Alchemist: Procedural Systems Canon  
* Cross-Grade Dependency Canon (Intermediate)

---

## **I. Module Topology (Alchemist-Specific)**

Grade VII reuses the Core Arcanum runtime with additional enforcement and telemetry for:

* transformation staging (assessment → design → consent → execution → stabilization → closure)  
* constraint-first change design  
* mandatory reversibility / rollback  
* stabilization gates (pre and post)  
* anti-escalation / anti-chaining controls

**Client / App Layer**

* Transformation UI (scope, non-scope, rollback plan capture)  
* Consent \+ impact acknowledgement surfaces  
* Stabilization \+ closure journaling

**Core Runtime Layer**

* Progression Engine (Alchemist ruleset)  
* Tempus (Pacing Engine — transformation staging)  
* Alchemist Generator Orchestrator  
* Hope (Companion Engine — Alchemist policy)

**Integrity Layer**

* Alchemist Policy Engine (transformation invariants)  
* Drift Detector (scope creep \+ novelty/acceleration)  
* Audit Harness (Sampling \+ Replay)

**Data Layer**

* Practitioner State Store (incl. transformation plans)  
* Event Log (append-only)  
* Seed Registry (deterministic replay)

**Governance Layer**

* Version Registry (policy \+ pacing)  
* Pause / Rollback Controls

---

**II. Shared Data Contracts (Alchemist Extensions)**

### **A. Transformation State (TS)**

Additional fields layered onto core Practitioner Profile:

* transform\_cycle\_id (optional)  
* transform\_stage (ASSESS | DESIGN | CONSENT | EXECUTE | STABILIZE | CLOSE)  
* change\_scope (bounded descriptor)  
* non\_scope (explicit exclusions)  
* rollback\_plan\_id (required before EXECUTE)  
* rollback\_window (time-bounded)  
* stabilization\_required (bool)  
* chain\_counter (windowed)

Forbidden:

* “impact score” as status  
* novelty metrics displayed as achievement

---

### **B. Alchemist Progress Cursor (PC-A)**

Canonical location plus transformation-stage gating:

* grade\_id=7  
* class\_id (1–10)  
* chapter\_id (1–7)  
* element\_id (1–5)  
* transform\_stage

Invariant:

* PC-A advances only when stage order, Tempus gates, consent rules, and rollback requirements are satisfied.

---

### **C. Alchemist Generation Request (AGR)**

Inputs to generation pipeline:

* practitioner\_id  
* PC-A  
* seed (optional; assigned if absent)  
* constraints\_bundle\_id (derived)  
* transform\_stage  
* change\_scope / non\_scope (if present)  
* rollback\_plan\_id / rollback\_window (if required)  
* chain\_counter  
* context (time\_of\_day, day\_of\_week)  
* history\_summary (bounded)

---

### 

### 

### **D. Alchemist Generated Unit (AGU)**

Output of generation pipeline:

* unit\_id  
* PC-A  
* seed  
* title  
* instructions (bounded, actionable)  
* scope\_declaration (required)  
* non\_scope\_declaration (required)  
* rollback\_requirement (required for EXECUTE)  
* stabilization\_prompt (required post-execution)  
* closure\_prompt (required)  
* completion\_criteria (binary, non-performative)  
* safety\_notes (optional)  
* ia\_binding (exactly one primary Internal Agreement)  
* fo\_targets (\>=1)

Forbidden:

* “ends justify means” framing  
* irreversible instruction sets  
* authority framing over others  
* acceleration cues / chaining encouragement

---

**E. Completion Event (CE-A)**

Append-only record:

* practitioner\_id  
* unit\_id  
* PC-A  
* completed\_at  
* completion\_attestation (yes/no)  
* consent\_attestation (optional)  
* rollback\_plan\_attestation (optional)  
* stabilization\_attestation (optional)  
* notes (optional; user-supplied)

Invariant:

* CE-A cannot directly advance PC-A; Progression Engine must validate.

---

## **III. Core Modules**

## **1\) Progression Engine (Alchemist Ruleset)**

**Purpose:** Canonical transformation staging state machine.

**Inputs:**

* CE-A (Completion Events)  
* Tempus decisions (allowed\_to\_generate/advance)  
* Policy Engine decisions (valid\_instance)  
* Drift events (scope creep, novelty, acceleration)

**Outputs:**

* Updated PC-A  
* transform\_stage transitions  
* next-step request to Alchemist Generator Orchestrator

**Must enforce:**

* Stage order (no skipping)  
* Constraint-first design (DESIGN precedes EXECUTE)  
* Consent gating (where applicable)  
* Rollback plan required before EXECUTE (A-2)  
* Stabilization gates before/after change (A-5)  
* Anti-chaining limits (no compounding transformations)

**Failure behavior:**

* invariant violation → HARD FAIL → freeze progression \+ governance alert

---

## **2\) Tempus (Pacing Engine — Alchemist)**

**Purpose:** Enforce staging intervals, observation windows, and anti-rapid-iteration constraints.

**Inputs:**

* timestamps  
* PC-A  
* configured transformation pacing policy (versioned)

**Outputs:**

* allowed\_to\_generate  
* allowed\_to\_advance  
* next\_unlock\_at  
* required\_observation\_window

**Must enforce:**

* minimum reflection intervals between stages  
* mandatory observation windows post-execution  
* prohibition of rapid iteration loops

**Failure behavior:**

* override attempt → HARD FAIL → log \+ governance alert

---

## **3\) Alchemist Generator Orchestrator**

**Purpose:** Build an AGU using deterministic, constrained generation.

**Inputs:**

* AGR  
* Alchemist constraint bundle (stage \+ element \+ IA/FO \+ rollback rules)

**Outputs:**

* AGU

**Must enforce:**

* deterministic seed assignment  
* structural adherence (PC-A correctness)  
* delegation to Policy Engine pre/post checks

**Failure behavior:**

* Policy rejection → regenerate with bounded retries  
* repeated rejection → STALL / pause transformation cycle

---

## **4\) Alchemist Policy Engine (Constraints / Invariants)**

**Purpose:** Single source of truth for Alchemist rule enforcement.

**Inputs:**

* AGR  
* AGU  
* PC-A  
* active policy version

**Outputs:**

* accept/reject  
* rejection\_reason  
* required\_corrections

**Must enforce (Alchemist invariants):**

* A-1 Outcomes do not justify means  
* A-2 Reversibility is mandatory  
* A-3 Change is bounded  
* A-4 Consent is required  
* A-5 Stability precedes and follows change  
* A-6 No identity through creation

**Failure behavior:**

* systemic breach → HARD FAIL → freeze generators \+ governance alert

---

**5\) Drift Detector (Scope Creep \+ Acceleration)**

**Purpose:** Detect non-obvious failure modes.

**Signals (non-exhaustive):**

* scope expansion attempts  
* rollback avoidance patterns  
* repeated EXECUTE stages without stabilization completion  
* novelty language drift  
* optimization obsession signals

**Outputs:**

* drift\_event(type, severity)

**Failure behavior:**

* on drift\_event → Progression Engine enters STABILIZE or STALLED; rollback may be required

---

## **6\) Hope (Companion Engine — Alchemist Policy)**

**Purpose:** Non-directive companion surface for transformation reflection.

**Must enforce:**

* no prophecy/guarantees  
* no outcome validation  
* no escalation encouragement  
* always offer rollback/closure framing

**Failure behavior:**

* violating response → block \+ neutral refusal \+ log for audit

---

## **IV. Integrity & Audit Modules**

## **7\) Seed Registry (Deterministic Replay)**

**Purpose:** Ensure every generated unit is reproducible.

**Must enforce:**

* seeds immutable once issued

---

## 

## 

## 

## **8\) Event Log (Append-only)**

**Purpose:** Source of truth for audits.

**Records:**

* AGR, AGU, CE-A  
* policy decisions  
* drift events  
* state transitions

**Must enforce:**

* append-only semantics

---

## **9\) Audit Harness (Alchemist)**

**Purpose:** Sampling, replay, and invariant verification.

**Must verify:**

* staging order  
* rollback planning and rollback window enforcement  
* stabilization gates  
* anti-chaining limits  
* absence of outcome-justification language

---

## **V. Minimal API Surface (Conceptual)**

* GET /state → returns TS \+ PC-A  
* POST /request-unit → submits AGR, returns AGU or next\_unlock\_at  
* POST /complete-unit → submits CE-A, returns updated PC-A/state  
* POST /hope → companion interaction (policy-filtered)  
* GET /audit/sample → returns sample seeds for replay (internal)

---

## 

## **VI. Canonical Assertion**

If an implementation includes the modules above and enforces the contracts and invariants described herein, it is a **valid Alchemist implementation**.

If any module enables irreversible change, outcome-justification, scope creep without reset, or transformation chaining without stabilization, the implementation is invalid.

---

**End of Grade VII — The Alchemist: Generator & Module Mapping**

