---
title: "Grade Vi Generator & Module Mapping"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# Grade Vi Generator & Module Mapping
## **Grade VI — The Healer**

### **Generator & Module Mapping**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **modules** required to implement Grade VI — The Healer, and the **contracts** between them (inputs, outputs, invariants enforced, and failure behavior). It is content-agnostic and code-agnostic.

**Note:** Some previously uploaded reference files may expire over time; this implementation mapping relies on the sealed Grade VI canons and cross-grade dependency canons already captured in the project’s canonical documents.

This mapping is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Intermediate School Canon  
* Grade VI — The Healer: Master Canon  
* Grade VI — The Healer: System Responsibility & Invariants Canon  
* Grade VI — The Healer: Procedural Systems Canon  
* Cross-Grade Dependency Canon (Intermediate)

---

## **I. Module Topology (Healer-Specific)**

Grade VI reuses the Core Arcanum runtime with additional enforcement and telemetry for:

* consent \+ scope  
* care-cycle staging  
* withdrawal/refusal mechanics  
* burnout risk detection  
* anti-dependency safeguards

**Client / App Layer**

* Care Cycle UI (scope declaration, consent capture, withdrawal)  
* Reflection \+ Maintenance journaling surfaces

**Core Runtime Layer**

* Progression Engine (Healer ruleset)  
* Tempus (Pacing Engine — care-cycle timing)  
* Healer Generator Orchestrator  
* Hope (Companion Engine — Healer policy)

**Integrity Layer**

* Healer Policy Engine (authority/dependency/burnout invariants)  
* Drift Detector (care loop \+ superiority drift)  
* Audit Harness (Sampling \+ Replay)

**Data Layer**

* Practitioner State Store (incl. care load)  
* Event Log (append-only)  
* Seed Registry (deterministic replay)

**Governance Layer**

* Version Registry (policy \+ pacing)  
* Pause / Rollback Controls

---

## **II. Shared Data Contracts (Healer Extensions)**

### **A. Practitioner Profile Extensions (PP-H)**

Additional fields layered onto core profile:

* care\_cycle\_id (optional)  
* care\_phase (OBSERVE | INTERVENE | STABILIZE | WITHDRAW)  
* care\_scope (bounded descriptor; optional)  
* consent\_state (NONE | IMPLIED | EXPLICIT)  
* load\_index (bounded)  
* burnout\_risk (LOW | MED | HIGH)  
* withdrawal\_count (rolling window)

Forbidden fields:

* savior metrics  
* “helpfulness” scores  
* dependency indicators shown to user as status

---

### **B. Healer Progress Cursor (PC-H)**

Canonical location plus care-phase gating:

* grade\_id=6  
* class\_id (1–10)  
* chapter\_id (1–7)  
* element\_id (1–5)  
* care\_phase (as above)

Invariant:

* PC-H may only advance when care-cycle rules and Tempus gates are satisfied.

---

### **C. Healer Generation Request (HGR)**

Inputs to generation pipeline:

* practitioner\_id  
* PC-H  
* seed (optional; assigned if absent)  
* constraints\_bundle\_id (derived)  
* consent\_state  
* care\_scope (optional)  
* load\_index / burnout\_risk  
* context (time\_of\_day, day\_of\_week)  
* history\_summary (bounded)

---

### 

### 

### 

### **D. Healer Generated Unit (HGU)**

Output of generation pipeline:

* unit\_id  
* PC-H  
* seed  
* title  
* instructions (bounded, actionable, non-therapeutic)  
* scope\_declaration (required where applicable)  
* consent\_prompt (required where applicable)  
* withdrawal\_option (always present)  
* completion\_criteria (binary, non-performative)  
* safety\_notes (optional)  
* ia\_binding (exactly one primary Internal Agreement)  
* fo\_targets (\>=1)

Forbidden:

* diagnosing language  
* authority framing (“you should”, “they need”)  
* emotional leverage  
* identity labels (“you are a healer”)

---

### **E. Completion Event (CE-H)**

Append-only record:

* practitioner\_id  
* unit\_id  
* PC-H  
* completed\_at  
* completion\_attestation (yes/no)  
* consent\_attestation (optional)  
* scope\_attestation (optional)  
* notes (optional; user-supplied)

Invariant:

* CE-H cannot directly advance PC-H; Progression Engine must validate.

---

## **III. Core Modules**

## **1\) Progression Engine (Healer Ruleset)**

**Purpose:** Canonical care-cycle progression state machine.

**Inputs:**

* CE-H (Completion Events)  
* Tempus decisions (allowed\_to\_generate/advance)  
* Policy Engine decisions (valid\_instance)  
* Drift events (dependency, authority, burnout)

**Outputs:**

* Updated PC-H  
* care\_phase transitions  
* next-step request to Healer Generator Orchestrator

**Must enforce:**

* Consent \+ scope gating where applicable (H-5)  
* Care-cycle staging (observe → intervene → stabilize → withdraw)  
* Withdrawal/refusal as valid completion (Procedural Canon)  
* Burnout stalls (H-4)  
* No dependency loops (H-2)

**Failure behavior:**

* invariant violation → HARD FAIL → freeze progression \+ governance alert

---

## **2\) Tempus (Pacing Engine — Healer)**

**Purpose:** Enforce time gates \+ recovery cycles for care work.

**Inputs:**

* PP-H timestamps  
* PC-H  
* configured care pacing policy (versioned)

**Outputs:**

* allowed\_to\_generate  
* allowed\_to\_advance  
* next\_unlock\_at  
* recovery\_window

**Must enforce:**

* bounded engagement windows  
* mandatory recovery intervals  
* prohibition of continuous care loops

**Failure behavior:**

* override attempt → HARD FAIL → log \+ governance alert

---

## **3\) Healer Generator Orchestrator**

**Purpose:** Build an HGU using deterministic, constrained generation.

**Inputs:**

* HGR  
* Healer constraint bundle (phase \+ element \+ IA/FO \+ load ceilings)

**Outputs:**

* HGU

**Must enforce:**

* Deterministic seed assignment  
* Structural adherence (PC-H correctness)  
* Delegation to Policy Engine pre/post checks

**Failure behavior:**

* Policy rejection → regenerate with bounded retries  
* repeated rejection → STALL / PAUSE care-cycle

---

## **4\) Healer Policy Engine (Constraints / Invariants)**

**Purpose:** Single source of truth for Healer rule enforcement.

**Inputs:**

* HGR  
* HGU  
* PC-H  
* active policy version

**Outputs:**

* accept/reject  
* rejection\_reason  
* required\_corrections

**Must enforce (Healer invariants):**

* H-1 Care grants no authority  
* H-2 No dependency may form  
* H-3 Boundaries are mandatory  
* H-4 Self-sacrifice is not virtue (burnout stall)  
* H-5 Consent is required  
* H-6 Care is proportional

**Failure behavior:**

* systemic breach → HARD FAIL → freeze generators \+ governance alert

---

## **5\) Drift Detector (Care Loop \+ Superiority)**

**Purpose:** Detect non-obvious failure modes.

**Signals (non-exhaustive):**

* repeated high-load cycles  
* refusal/withdrawal suppression  
* escalating scope without reset  
* moral superiority language  
* implicit authority patterns

**Outputs:**

* drift\_event(type, severity)

**Failure behavior:**

* on drift\_event → Progression Engine enters STABILIZE or STALLED

---

## **6\) Hope (Companion Engine — Healer Policy)**

**Purpose:** Non-directive companion surface for care reflection.

**Must enforce:**

* no therapeutic claims  
* no diagnosing or prescribing  
* no savior validation loops  
* always offer withdrawal/limits framing

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

## **8\) Event Log (Append-only)**

**Purpose:** Source of truth for audits.

**Records:**

* HGR, HGU, CE-H  
* policy decisions  
* drift events  
* state transitions

**Must enforce:**

* append-only semantics

---

## **9\) Audit Harness (Healer)**

**Purpose:** Sampling, replay, and invariant verification.

**Must verify:**

* consent \+ scope gating  
* withdrawal validity  
* burnout stall behavior  
* absence of dependency loops  
* absence of authority language

---

## **V. Minimal API Surface (Conceptual)**

* GET /state → returns PP-H \+ PC-H  
* POST /request-unit → submits HGR, returns HGU or next\_unlock\_at  
* POST /complete-unit → submits CE-H, returns updated PC-H/state  
* POST /hope → companion interaction (policy-filtered)  
* GET /audit/sample → returns sample seeds for replay (internal)

---

## 

## **VI. Canonical Assertion**

If an implementation includes the modules above and enforces the contracts and invariants described herein, it is a **valid Healer implementation**.

If any module enables care-based authority, dependency formation, boundary collapse, or burnout rewards, the implementation is invalid.

---

**End of Grade VI — The Healer: Generator & Module Mapping**
