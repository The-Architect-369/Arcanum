---
title: "Grade Viii Generator & Module Mapping"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# Grade Viii Generator & Module Mapping
## **Grade VIII — The Sage**

### **Generator & Module Mapping**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **modules** required to implement Grade VIII — The Sage, and the **contracts** between them (inputs, outputs, invariants enforced, and failure behavior). It is content-agnostic and code-agnostic.

**Note on assets:** Some older uploaded reference files may expire over time in this environment. This mapping is derived from the sealed Grade VIII canons and cross-grade dependency canons captured in the project’s canonical document stack.

This mapping is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Intermediate School Canon  
* Grade VIII — The Sage: Master Canon  
* Grade VIII — The Sage: System Responsibility & Invariants Canon  
* Grade VIII — The Sage: Procedural Systems Canon  
* Cross-Grade Dependency Canon (Intermediate)

---

## **I. Module Topology (Sage-Specific)**

Grade VIII reuses the Core Arcanum runtime with additional enforcement and telemetry for:

* integration without authority  
* wisdom as restraint  
* reflection without instruction  
* coherence without closure  
* challengeability / openness guarantees  
* silence without dominance controls

**Client / App Layer**

* Integration UI (multi-grade holding prompts, non-resolution journaling)  
* Challengeability UI ("revise", "hold uncertainty", "no conclusion" affordances)  
* Silence-safe UI (no authority cues, no deference triggers)

**Core Runtime Layer**

* Progression Engine (Sage ruleset)  
* Tempus (Pacing Engine — extended reflection intervals)  
* Sage Generator Orchestrator  
* Hope (Companion Engine — Sage policy)

**Integrity Layer**

* Sage Policy Engine (non-authority, non-closure invariants)  
* Drift Detector (passive dominance \+ closure \+ detachment superiority)  
* Audit Harness (Sampling \+ Replay)

**Data Layer**

* Practitioner State Store (integration state, openness flags)  
* Event Log (append-only)  
* Seed Registry (deterministic replay)

**Governance Layer**

* Version Registry (policy \+ pacing)  
* Pause / Rollback Controls

---

## **II. Shared Data Contracts (Sage Extensions)**

### **A. Integration State (IS)**

Additional fields layered onto core Practitioner Profile:

* integration\_cycle\_id (optional)  
* integration\_mode (HOLD | REVISE | REVISIT | RELEASE)  
* openness\_index (bounded)  
* closure\_risk (LOW | MED | HIGH)  
* detachment\_risk (LOW | MED | HIGH)  
* authority\_signal\_risk (LOW | MED | HIGH)  
* last\_challengeable\_at

Forbidden:

* "wisdom score" or "insight rank"  
* social deference signals

---

### **B. Sage Progress Cursor (PC-S)**

Canonical location plus integration gating:

* grade\_id=8  
* class\_id (1–10)  
* chapter\_id (1–7)  
* element\_id (1–5)  
* integration\_mode

Invariant:

* PC-S may only advance when reflection and openness constraints are satisfied.

---

### **C. Sage Generation Request (SGR)**

Inputs to generation pipeline:

* practitioner\_id  
* PC-S  
* seed (optional; assigned if absent)  
* constraints\_bundle\_id (derived)  
* integration\_mode  
* openness\_index / risk flags  
* context (time\_of\_day, day\_of\_week)  
* history\_summary (bounded)

---

### 

### 

### 

### 

### **D. Sage Generated Unit (SGU)**

Output of generation pipeline:

* unit\_id  
* PC-S  
* seed  
* title  
* instructions (bounded, non-performative)  
* integration\_prompt (required)  
* uncertainty\_prompt (required)  
* challengeability\_prompt (required)  
* non\_intervention\_reminder (optional)  
* completion\_criteria (binary, non-performative)  
* safety\_notes (optional)  
* ia\_binding (exactly one primary Internal Agreement)  
* fo\_targets (\>=1)

Forbidden:

* instructional authority ("here is the truth")  
* concluding synthesis ("therefore")  
* mentoring/guiding framing  
* composure-as-superiority cues

---

### **E. Completion Event (CE-S)**

Append-only record:

* practitioner\_id  
* unit\_id  
* PC-S  
* completed\_at  
* completion\_attestation (yes/no)  
* openness\_attestation (optional)  
* revision\_attestation (optional)  
* notes (optional; user-supplied)

Invariant:

* CE-S cannot directly advance PC-S; Progression Engine must validate.

---

## **III. Core Modules**

## **1\) Progression Engine (Sage Ruleset)**

**Purpose:** Canonical integration progression state machine.

**Inputs:**

* CE-S (Completion Events)  
* Tempus decisions (allowed\_to\_generate/advance)  
* Policy Engine decisions (valid\_instance)  
* Drift events (closure, passive authority, detachment)

**Outputs:**

* Updated PC-S  
* integration\_mode transitions  
* next-step request to Sage Generator Orchestrator

**Must enforce:**

* Integration without authority (G-1)  
* No instruction by default (G-2)  
* No closure events (G-3)  
* Restraint not framed as superiority (G-4)  
* Reflection not used to evade responsibility (G-5)

**Failure behavior:**

* invariant violation → HARD FAIL → freeze progression \+ governance alert

---

## 

## 

## 

## 

## **2\) Tempus (Pacing Engine — Sage)**

**Purpose:** Enforce extended reflection intervals and prevent rapid synthesis cycles.

**Inputs:**

* timestamps  
* PC-S  
* configured reflection pacing policy (versioned)

**Outputs:**

* allowed\_to\_generate  
* allowed\_to\_advance  
* next\_unlock\_at  
* required\_reflection\_window

**Must enforce:**

* extended reflection intervals  
* prohibition of rapid integration loops  
* non-accumulative pacing

**Failure behavior:**

* override attempt → HARD FAIL → log \+ governance alert

---

**3\) Sage Generator Orchestrator**

**Purpose:** Build an SGU using deterministic, constrained generation.

**Inputs:**

* SGR  
* Sage constraint bundle (mode \+ element \+ IA/FO \+ openness rules)

**Outputs:**

* SGU

**Must enforce:**

* deterministic seed assignment  
* structural adherence (PC-S correctness)  
* delegation to Policy Engine pre/post checks

**Failure behavior:**

* Policy rejection → regenerate with bounded retries  
* repeated rejection → STALL / pause integration cycle

---

## **4\) Sage Policy Engine (Constraints / Invariants)**

**Purpose:** Single source of truth for Sage rule enforcement.

**Inputs:**

* SGR  
* SGU  
* PC-S  
* active policy version

**Outputs:**

* accept/reject  
* rejection\_reason  
* required\_corrections

**Must enforce (Sage invariants):**

* G-1 Wisdom grants no authority  
* G-2 No instruction by default  
* G-3 Coherence is not closure  
* G-4 Restraint is not superiority  
* G-5 Reflection does not override responsibility

**Failure behavior:**

* systemic breach → HARD FAIL → freeze generators \+ governance alert

---

## 

## 

## 

## **5\) Drift Detector (Passive Dominance \+ Closure)**

**Purpose:** Detect non-obvious failure modes.

**Signals (non-exhaustive):**

* synthesis-as-conclusion language  
* implied teaching/mentoring cues  
* deference dynamics (UI or copy)  
* detachment-as-elevation framing  
* immunity-to-questioning patterns

**Outputs:**

* drift\_event(type, severity)

**Failure behavior:**

* on drift\_event → Progression Engine enters STABILIZE or STALLED; constraints tighten

---

## **6\) Hope (Companion Engine — Sage Policy)**

**Purpose:** Non-directive companion surface for reflection.

**Must enforce:**

* no guidance or instruction by default  
* no "final understanding" validation  
* no authority cues (tone, certainty)  
* preserve challengeability (questions over statements)

**Failure behavior:**

* violating response → block \+ neutral refusal \+ log for audit

---

**IV. Integrity & Audit Modules**

## **7\) Seed Registry (Deterministic Replay)**

**Purpose:** Ensure every generated unit is reproducible.

**Must enforce:**

* seeds immutable once issued

---

## **8\) Event Log (Append-only)**

**Purpose:** Source of truth for audits.

**Records:**

* SGR, SGU, CE-S  
* policy decisions  
* drift events  
* state transitions

**Must enforce:**

* append-only semantics

---

## **9\) Audit Harness (Sage)**

**Purpose:** Sampling, replay, and invariant verification.

**Must verify:**

* non-closure enforcement  
* no instruction/mentoring emergence  
* no authority cues in UI or copy  
* extended reflection pacing and anti-rapid-synthesis gates  
* challengeability preserved

---

## **V. Minimal API Surface (Conceptual)**

* GET /state → returns IS \+ PC-S  
* POST /request-unit → submits SGR, returns SGU or next\_unlock\_at  
* POST /complete-unit → submits CE-S, returns updated PC-S/state  
* POST /hope → companion interaction (policy-filtered)  
* GET /audit/sample → returns sample seeds for replay (internal)

---

## **VI. Canonical Assertion**

If an implementation includes the modules above and enforces the contracts and invariants described herein, it is a **valid Sage implementation**.

If any module enables passive authority, instruction-by-default, closure events, deference dynamics, or detachment superiority, the implementation is invalid.

---

**End of Grade VIII — The Sage: Generator & Module Mapping**
