# **Arcanum Vitae**

## **Grade IX — The Oracle**

### **Generator & Module Mapping**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **modules** required to implement Grade IX — The Oracle, and the **contracts** between them (inputs, outputs, invariants enforced, and failure behavior). It is content-agnostic and code-agnostic.

**Note on assets:** Some previously uploaded reference files have expired in this environment (this is expected). This mapping is derived from the **sealed Grade IX canons** and the High-School cross-grade dependency canon already present in the canonical document stack. No missing assets are required to proceed.

This mapping is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* High School Canon  
* Grade IX — The Oracle: Master Canon  
* Grade IX — The Oracle: System Responsibility & Invariants Canon  
* Grade IX — The Oracle: Procedural Systems Canon  
* Cross-Grade Dependency Canon (High School)

---

## **I. Module Topology (Oracle-Specific)**

Grade IX reuses the Core Arcanum runtime with additional enforcement and telemetry for:

* pattern perception without prediction  
* foresight without authority  
* witnessing without intervention  
* probabilistic sensing without certainty claims  
* ethical silence and non-directive awareness

**Client / App Layer**

* Pattern Visualization UI (non-directive, non-actionable)  
* Probability & Trajectory Display (no future claims)  
* Silence-first UX (no advice, no prompts to act)

**Core Runtime Layer**

* Progression Engine (Oracle ruleset)  
* Tempus (Pacing Engine — long observation windows)  
* Oracle Generator Orchestrator  
* Hope (Companion Engine — Oracle policy)

**Integrity Layer**

* Oracle Policy Engine (non-prediction, non-intervention invariants)  
* Drift Detector (authority creep, certainty language, intervention framing)  
* Audit Harness (Sampling \+ Replay)

**Data Layer**

* Practitioner State Store (pattern exposure state)  
* Event Log (append-only)  
* Seed Registry (deterministic replay)

**Governance Layer**

* Version Registry (policy \+ pacing)  
* Pause / Rollback Controls

---

## **II. Shared Data Contracts (Oracle Extensions)**

### **A. Perception State (PS)**

Additional fields layered onto core Practitioner Profile:

* perception\_cycle\_id (optional)  
* perception\_mode (OBSERVE | HOLD | RELEASE)  
* certainty\_risk (LOW | MED | HIGH)  
* authority\_signal\_risk (LOW | MED | HIGH)  
* intervention\_impulse\_risk (LOW | MED | HIGH)  
* last\_observation\_at

Forbidden:

* prediction confidence scores  
* foresight accuracy metrics  
* social influence indicators

---

### **B. Oracle Progress Cursor (PC-O)**

Canonical location plus perception gating:

* grade\_id \= 9  
* class\_id (1–10)  
* chapter\_id (1–7)  
* element\_id (1–5)  
* perception\_mode

Invariant:

* PC-O may advance only when observation and non-intervention constraints are satisfied.

---

### **C. Oracle Generation Request (OGR)**

Inputs to generation pipeline:

* practitioner\_id  
* PC-O  
* seed (optional; assigned if absent)  
* constraints\_bundle\_id (derived)  
* perception\_mode  
* risk flags (certainty, authority, intervention)  
* context (time\_of\_day, day\_of\_week)  
* history\_summary (bounded)

---

### 

### 

### 

### **D. Oracle Generated Unit (OGU)**

Output of generation pipeline:

* unit\_id  
* PC-O  
* seed  
* title  
* perception\_prompt (required)  
* pattern\_display (non-actionable)  
* uncertainty\_reminder (required)  
* non\_intervention\_clause (required)  
* completion\_criteria (binary, non-performative)  
* safety\_notes (optional)  
* ia\_binding (exactly one primary Internal Agreement)  
* fo\_targets (\>=1)

Forbidden:

* predictions or forecasts  
* advice or guidance  
* probability-to-action framing  
* inevitability language

---

### **E. Completion Event (CE-O)**

Append-only record:

* practitioner\_id  
* unit\_id  
* PC-O  
* completed\_at  
* completion\_attestation (yes/no)  
* silence\_attestation (optional)  
* notes (optional; user-supplied)

Invariant:

* CE-O cannot directly advance PC-O; Progression Engine must validate.

---

## 

## **III. Core Modules**

## **1\) Progression Engine (Oracle Ruleset)**

**Purpose:** Canonical perception-only progression state machine.

**Must enforce:**

* Observation without prediction (O-1)  
* No authority through foresight (O-2)  
* Non-intervention as default (O-3)  
* Silence does not imply dominance (O-4)  
* Uncertainty preservation (O-5)

**Failure behavior:**

* invariant violation → HARD FAIL → freeze progression \+ governance alert

---

## **2\) Tempus (Pacing Engine — Oracle)**

**Purpose:** Enforce long observation windows and prevent rapid pattern accumulation.

**Must enforce:**

* extended observation intervals  
* prohibition of rapid exposure loops  
* no acceleration based on perceived insight

---

## **3\) Oracle Generator Orchestrator**

**Purpose:** Build an OGU using deterministic, constrained generation.

**Must enforce:**

* deterministic seed assignment  
* strict non-actionable output structure  
* delegation to Policy Engine pre/post checks

---

## **4\) Oracle Policy Engine (Constraints / Invariants)**

**Must enforce:**

* no prediction or certainty framing  
* no intervention prompts  
* no authority cues  
* uncertainty reminders present

**Failure behavior:**

* systemic breach → HARD FAIL → freeze generators \+ governance alert

---

## **5\) Drift Detector (Authority & Certainty)**

**Signals:**

* certainty language drift  
* implied future claims  
* intervention framing  
* elevated tone implying knowing

---

## **6\) Hope (Companion Engine — Oracle Policy)**

**Must enforce:**

* silence-first responses  
* reflective questions only  
* no advice, guidance, or validation of foresight

---

## **IV. Integrity & Audit Modules**

Seed Registry, Event Log, and Audit Harness operate identically to prior grades with Oracle-specific checks for prediction and intervention leakage.

---

## **V. Canonical Assertion**

If an implementation includes the modules above and enforces the contracts and invariants described herein, it is a **valid Grade IX — Oracle implementation**.

If any module enables prediction, authority through foresight, or intervention framing, the implementation is invalid.

---

**End of Grade IX — The Oracle: Generator & Module Mapping**

