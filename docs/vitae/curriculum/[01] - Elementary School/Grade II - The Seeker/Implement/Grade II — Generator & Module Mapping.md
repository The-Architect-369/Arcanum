---
title: "Grade Ii — Generator & Module Mapping"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---

# Grade Ii — Generator & Module Mapping
## **Generator & Module Mapping**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **modules** required to implement Grade II — The Seeker, and the **contracts** between them (inputs, outputs, invariants enforced, and failure behavior). It is content-agnostic and code-agnostic, and is intended to be directly usable as an engineering specification without prescribing UI or code style.

This mapping is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Grade I — The Guardian: Implementation Mapping (all documents)  
* Grade II — The Seeker: Master Canon  
* Grade II — The Seeker: Procedural Systems Canon  
* Grade II — The Seeker: Audit & Validation Canon  
* Grade II — The Seeker: System Responsibility & Invariants Map

---

## **I. Module Topology**

**Canonical principle:** Governance acts on *systems*, never on *people*. The Seeker is non-authoritative by design; no module may act as an oracle.

**Client / App Layer**

* UI/UX surfaces, journaling, notifications

**Core Runtime Layer**

* Progression Engine (Grade II rules)  
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
* No data contract may include comparative, reputational, ranking, or “insight score” fields.  
* Seeker must verify Guardian dependency prior to generation and progression.

### **A. Practitioner Profile (PP)**

Minimal fields:

* practitioner\_id  
* grade\_id \= 2  
* class\_id (1–10)  
* chapter\_id (1–6)  
* element\_id (1–5)  
* state (ACTIVE | PAUSED | STALLED)  
* last\_active\_at  
* guardian\_dependency\_state (OK | DEGRADED | UNKNOWN)  
* self\_report (energy\_level optional; user-provided only)

Forbidden fields:

* ranks, leaderboards, comparative metrics  
* “insight level,” “awakening score,” or equivalents  
* social graphs as progression inputs  
* interpreted psychological labels

---

### **B. Progress Cursor (PC)**

Represents canonical location in the Seeker curriculum:

* grade\_id  
* class\_id  
* chapter\_id  
* element\_id  
* unit\_id (optional)

Invariants:

* PC may only advance forward according to Tempus \+ completion rules.  
* PC advancement must be blocked if Guardian dependency is not OK.

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
* instructions (bounded, question-forward)  
* completion\_criteria (binary, non-performative)  
* safety\_notes (optional)  
* ia\_binding (exactly one primary Internal Agreement)  
* fo\_targets (\>=1; internal)

Forbidden:

* answers-as-authority  
* “arrival” or completion claims  
* interpretive scoring  
* identity labels  
* motivational manipulation (streak pressure, urgency)

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

**Canonical authority:** This module is the only component permitted to advance the Progress Cursor (PC).

**Purpose:** Canonical Grade II progression state machine.

**Inputs:**

* CE (Completion Events)  
* Tempus decisions (allowed\_to\_advance)  
* Policy Engine decisions (valid\_instance)  
* Guardian dependency state

**Outputs:**

* Updated PC  
* State transitions (ACTIVE/PAUSED/STALLED)  
* Next-step request to Generator Orchestrator

**Must enforce:**

* No skipping units  
* No admin/manual advancement  
* No performance/insight-based acceleration  
* Guardian dependency gating  
* Stalling/return logic for premature coherence triggers

**Failure behavior:**

* If invariant violation detected → HARD FAIL → freeze Seeker progression and generation, raise governance alert, require rollback/patch before resume

---

## **2\) Tempus (Pacing Engine)**

**Canonical authority:** Tempus controls time gates. No other module may simulate, bypass, or override pacing.

**Purpose:** Enforce spacing between inquiry cycles and prevent binge patterns where policy forbids.

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
* Inquiry spacing policies (where specified)

**Failure behavior:**

* If override attempt → HARD FAIL → log \+ governance alert

---

## **3\) Generator Orchestrator**

**Canonical principle:** Seeker generation must preserve ambiguity. If policy cannot be satisfied, stall—do not improvise closure.

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

**Canonical authority:** Single source of truth for invariant enforcement and forbidden-pattern detection.

**Purpose:** Enforce Seeker invariants and constraint bundles.

**Inputs:**

* GR  
* GU  
* PC  
* active policy version

**Outputs:**

* accept/reject  
* rejection\_reason  
* required\_corrections (optional)

**Must enforce (Seeker invariants):**

* Ambiguity preservation (S-1)  
* No premature coherence (S-2)  
* No insight reward (S-3)  
* No identity formation (S-4)  
* Inquiry over answers (S-5)  
* Guardian stability required (S-6)

**Forbidden-pattern detection must include (minimum):**

* “arrival” / completion claims  
* oracle-tone answers  
* interpretation validation loops  
* identity labeling  
* comparative/hierarchy language

**Failure behavior:**

* Any systemic breach → HARD FAIL → freeze generation and progression, raise governance alert, require rollback/patch before resume

---

## **5\) Hope (Companion Engine)**

**Canonical principle:** Hope is a mirror and question-refiner. It does not answer.

**Purpose:** Non-directive companion surface for inquiry.

**Inputs:**

* user message  
* PC  
* GU context  
* companion policy constraints

**Outputs:**

* reflective response  
* refining question (optional)  
* structure reminder (optional)

**May do:**

* Reflect the user’s question back  
* Ask narrowing/broadening questions  
* Highlight ambiguity without resolving it  
* Remind constraints (no closure, no oracle)

**May NOT do:**

* Provide answers or conclusions  
* Validate interpretations (“that means X”)  
* Accelerate coherence  
* Praise insight as progress  
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
* interpret insights  
* bypass Tempus  
* override Guardian dependency

---

## **VI. Seeker Constraint Bundles**

**Implementation key:** A Constraint Bundle is the machine-readable policy context derived from the Progress Cursor (PC). Bundle definition is the next artifact to be authored after this mapping.

A bundle is a computed set of restrictions derived from PC:

* planet profile (chapter)  
* element profile  
* IA binding  
* FO targets  
* forbidden pattern list (anti-coherence \+ anti-oracle)

Invariants:

* Every GR must resolve to exactly one bundle.  
* Every GU must declare its bundle\_id and policy\_version.

---

## **VII. Minimal API Surface (Conceptual)**

* GET /state → returns PP \+ PC (+ guardian\_dependency\_state)  
* POST /request-unit → submits GR, returns GU or next\_unlock\_at  
* POST /complete-unit → submits CE, returns updated PC/state  
* POST /hope → companion interaction (policy-filtered)

Internal-only:

* GET /audit/sample → returns sample seeds for replay  
* POST /audit/replay → replays seed+policy\_version and verifies invariant checks

---

## **VIII. Canonical Assertion**

If an implementation includes the modules above and enforces the contracts and invariants described herein, it is a **valid Seeker implementation**.

If any module provides answers-as-authority, accelerates coherence, rewards insight, forms identity, or bypasses Tempus/Guardian dependency, the implementation is invalid.

---

**End of Grade II — The Seeker: Generator & Module Mapping**