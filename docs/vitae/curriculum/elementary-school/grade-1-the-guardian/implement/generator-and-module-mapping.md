---
title: "Grade I — Generator & Module Mapping"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# Grade I — Generator & Module Mapping
## **Generator & Module Mapping**

**Status:** Canonical · Internal · Implementation Reference (Edited)

**Audience:** Builders, system architects, implementers, auditors

This document defines the **modules** required to implement Grade I — The Guardian, and the **contracts** between them (inputs, outputs, invariants enforced, and failure behavior). It is content-agnostic and code-agnostic, and is intended to be directly usable as an engineering specification without prescribing UI or code style.

This mapping is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Grade I — The Guardian: Master Canon  
* Grade I — The Guardian: Procedural Systems Canon  
* Grade I — The Guardian: Audit & Validation Canon  
* Grade I — The Guardian: System Responsibility & Invariants Map

---

## **I. Module Topology**

**Canonical principle:** Governance acts on *systems*, never on *people*. Progression is enforced by code and policy, never by operator discretion.

**Client / App Layer**

* UI/UX surfaces, journaling, notifications

**Core Runtime Layer**

* Progression Engine  
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
* All generated units must be replayable via seed \+ policy version.  
* No data contract may include comparative, reputational, or ranking fields.

### **A. Practitioner Profile (PP)**

Minimal fields:

* practitioner\_id  
* grade\_id \= 1  
* class\_id (1–10)  
* chapter\_id (1–6)  
* element\_id (1–5)  
* state (ACTIVE | PAUSED | STALLED)  
* last\_active\_at  
* self\_report (energy\_level optional; user-provided only)

Forbidden fields:

* ranks, leaderboards, comparative metrics  
* social graphs as progression inputs  
* interpreted psychological labels

---

### **B. Progress Cursor (PC)**

Represents the canonical location in the curriculum:

* grade\_id  
* class\_id  
* chapter\_id  
* element\_id  
* unit\_id (optional)

Invariant:

* PC may only advance forward according to Tempus \+ completion rules.

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

### **D. Generated Unit (GU)**

Output of the generation pipeline:

* unit\_id  
* PC  
* seed  
* policy\_version  
* bundle\_id  
* title  
* instructions (bounded, actionable)  
* completion\_criteria (binary, non-performative)  
* safety\_notes (optional)  
* ia\_binding (exactly one primary Internal Agreement)  
* fo\_targets (\>=1)

Forbidden:

* interpretive scoring  
* identity labels  
* promises of transformation  
* motivational manipulation (streaks, pressure, urgency)

---

**E. Completion Event (CE)**

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

**III. Core Modules**

## **1\) Progression Engine**

**Canonical authority:** This module is the only component permitted to advance the Progress Cursor (PC).

**Purpose:** Canonical progression state machine.

**Inputs:**

* CE (Completion Events)  
* Tempus decisions (allowed\_to\_advance)  
* Policy Engine decisions (valid\_instance)

**Outputs:**

* Updated PC  
* State transitions (ACTIVE/PAUSED/STALLED)  
* Next-step request to Generator Orchestrator

**Must enforce:**

* No skipping units  
* No admin/manual advancement  
* No performance-based acceleration  
* Stalling/return logic

**Failure behavior:**

* If invariant violation detected → HARD FAIL → freeze progression and generation, raise governance alert, require rollback/patch before resume

---

## **2\) Tempus (Pacing Engine)**

**Canonical authority:** Tempus controls time gates. No other module may simulate, bypass, or override pacing.

**Purpose:** Enforce time gates and recovery cycles.

**Inputs:**

* PP (timestamps)  
* PC  
* configured pacing policy (versioned)

**Outputs:**

* allowed\_to\_generate (bool)  
* allowed\_to\_advance (bool)  
* next\_unlock\_at  
* recommended\_recovery\_window (optional)

**Must enforce:**

* Non-bypassable time gates  
* Rest/absence are valid states  
* No streak pressure or urgency cues  
* Minimum recovery windows when defined by policy

**Failure behavior:**

* If override attempt → HARD FAIL → log \+ governance alert

---

## **3\) Generator Orchestrator**

**Canonical principle:** Generation is allowed only within policy. If policy cannot be satisfied, the correct behavior is to stall—not to improvise.

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
* If still rejected → STALL and surface next\_unlock\_at or corrective instruction (non-interpretive)  
* No unvalidated unit may be delivered

---

## **4\) Policy Engine (Constraints / Invariants)**

**Canonical authority:** This module is the single source of truth for invariant enforcement and forbidden-pattern detection.

**Purpose:** Enforce Guardian invariants and constraint bundles.

**Inputs:**

* GR  
* GU  
* PC  
* active policy version

**Outputs:**

* accept/reject  
* rejection\_reason  
* required\_corrections (optional)

**Must enforce (Guardian invariants):**

* No acceleration (G-5)  
* No insight reward (G-3)  
* No identity formation (G-4)  
* Continuity over intensity (G-1)  
* Self-correction over prompting (G-2)

**Failure behavior:**

* Any systemic breach → HARD FAIL → freeze generators and progression, raise governance alert, require rollback/patch before resume

---

## **5\) Hope (Companion Engine)**

**Canonical principle:** Hope is a mirror and structure-keeper. It is not a coach, judge, or oracle.

**Purpose:** Non-directive companion surface.

**Inputs:**

* user message  
* PC  
* GU context  
* companion policy constraints

**Outputs:**

* reflective response  
* clarifying question (optional)  
* structure reminder (optional)

**May do:**

* Remind of structure and timing  
* Encourage return without judgment  
* Ask clarifying questions about logistics (time, completion criteria) without interpretation

**May NOT do:**

* Interpret experience  
* Offer insight  
* Praise, motivate, or validate meaning  
* Accelerate pacing or imply urgency  
* Label identity, rank, or status

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

## **10\) Pause / Rollback Controls**

**Purpose:** Emergency controls that act on systems, not people.

Governance may:

* pause generation  
* roll back policy versions  
* require corrective updates

Governance may not:

* advance individuals  
* interpret outcomes  
* bypass Tempus

---

## **VI. Guardian Constraint Bundles**

**Implementation key:** A Constraint Bundle is the machine-readable policy context derived from the Progress Cursor (PC). Bundle definition is the next artifact to be authored after this mapping.

A bundle is a computed set of restrictions derived from PC:

* planet profile (chapter)  
* element profile  
* IA binding  
* FO targets  
* forbidden pattern list

Invariants:

* Every GR must resolve to exactly one bundle.  
* Every GU must declare its bundle\_id and policy\_version.

---

## **VII. Minimal API Surface (Conceptual)**

* GET /state → returns PP \+ PC  
* POST /request-unit → submits GR, returns GU or next\_unlock\_at  
* POST /complete-unit → submits CE, returns updated PC/state  
* POST /hope → companion interaction (policy-filtered)

Internal-only:

* GET /audit/sample → returns sample seeds for replay  
* POST /audit/replay → replays seed+policy\_version and verifies invariant checks

---

## **VIII. Canonical Assertion**

If an implementation includes the modules above and enforces the contracts and invariants described herein, it is a **valid Guardian implementation**.

If any module enables bypass of Tempus, rewards insight, forms identity, or accelerates progression, the implementation is invalid.

---

**End of Grade I — The Guardian: Generator & Module Mapping**
