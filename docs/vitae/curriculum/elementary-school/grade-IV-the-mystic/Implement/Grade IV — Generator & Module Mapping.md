---
title: "Grade Iv — Generator & Module Mapping"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# Grade Iv — Generator & Module Mapping
## **Generator & Module Mapping**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **modules** required to implement Grade IV — The Mystic, and the **contracts** between them (inputs, outputs, invariants enforced, and failure behavior). It is content-agnostic and code-agnostic, intended to be directly usable as an engineering specification without prescribing UI or code style.

This mapping is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Grade I — The Guardian: Implementation Mapping (all documents)  
* Grade II — The Seeker: Implementation Mapping (all documents)  
* Grade III — The Disciple: Implementation Mapping (all documents)  
* Grade IV — The Mystic: Master Canon  
* Grade IV — The Mystic: Procedural Systems Canon  
* Grade IV — The Mystic: Audit & Validation Canon  
* Grade IV — The Mystic: System Responsibility & Invariants Map

---

## **I. Module Topology**

**Canonical principle:** Perception is governed as a volatile resource. No module may interpret, ratify, or elevate perceptual experience.

**Client / App Layer**

* UI/UX surfaces, journaling, notifications

**Core Runtime Layer**

* Progression Engine (Grade IV rules)  
* Tempus (Pacing & Exposure Engine)  
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
* No data contract may encode spiritual status, insight scores, or perceptual hierarchy.  
* Mystic must verify Guardian, Seeker, and Disciple dependency prior to generation and progression.

### **A. Practitioner Profile (PP)**

Minimal fields:

* practitioner\_id  
* grade\_id \= 4  
* class\_id (1–10)  
* chapter\_id (1–6)  
* element\_id (1–5)  
* state (ACTIVE | PAUSED | STALLED)  
* last\_active\_at  
* guardian\_dependency\_state (OK | DEGRADED | UNKNOWN)  
* seeker\_dependency\_state (OK | DEGRADED | UNKNOWN)  
* disciple\_dependency\_state (OK | DEGRADED | UNKNOWN)  
* grounding\_status (OK | REQUIRED | INCOMPLETE)  
* self\_report (energy\_level optional; user-provided only)

Forbidden fields:

* ranks, leaderboards, comparative metrics  
* spiritual status labels  
* experience intensity scores  
* diagnostic or psychological classifications

---

### **B. Progress Cursor (PC)**

Represents canonical location in the Mystic curriculum:

* grade\_id  
* class\_id  
* chapter\_id  
* element\_id  
* unit\_id (optional)

Invariants:

* PC may only advance forward according to Tempus \+ completion rules.  
* PC advancement must be blocked if any dependency state is not OK.

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
* instructions (perception-focused, containment-first)  
* completion\_criteria (binary, non-performative)  
* grounding\_requirements (explicit, mandatory)  
* safety\_notes (optional)  
* ia\_binding (exactly one primary Internal Agreement)  
* fo\_targets (\>=1; internal)

Forbidden:

* interpretation prompts  
* symbolic or revelatory framing  
* exceptionalism language  
* intensity escalation cues  
* identity/status labels

---

### **E. Completion Event (CE)**

Append-only record:

* practitioner\_id  
* unit\_id  
* PC  
* completed\_at  
* completion\_attestation (yes/no)  
* grounding\_confirmed (yes/no)  
* notes (optional; user-supplied)

Invariant:

* CE cannot advance PC unless grounding\_confirmed is true.

---

## **III. Core Modules**

## **1\) Progression Engine**

**Canonical authority:** Only component permitted to advance the Progress Cursor (PC).

**Purpose:** Canonical Grade IV progression state machine.

**Inputs:**

* CE (Completion Events)  
* Tempus decisions (allowed\_to\_advance)  
* Policy Engine decisions (valid\_instance)  
* Dependency states (Guardian, Seeker, Disciple)  
* grounding\_status

**Outputs:**

* Updated PC  
* State transitions (ACTIVE/PAUSED/STALLED)  
* Next-step request to Generator Orchestrator

**Must enforce:**

* No skipping units  
* No admin/manual advancement  
* No intensity-based acceleration  
* Dependency gating (Guardian \+ Seeker \+ Disciple)  
* Mandatory grounding before advancement

**Failure behavior:**

* If invariant violation detected → HARD FAIL → freeze Mystic progression and generation, raise governance alert, require rollback/patch before resume

---

## **2\) Tempus (Pacing & Exposure Engine)**

**Canonical authority:** Tempus controls exposure duration and recovery. No other module may override.

**Purpose:** Enforce bounded perceptual exposure and recovery cycles.

**Inputs:**

* PP (timestamps, grounding\_status)  
* PC  
* configured pacing/exposure policy (versioned)

**Outputs:**

* allowed\_to\_generate (bool)  
* allowed\_to\_advance (bool)  
* next\_unlock\_at  
* required\_grounding\_window  
* exposure\_ceiling (session duration limits)

**Must enforce:**

* Exposure ceilings  
* Mandatory grounding windows  
* Recovery after perceptual work  
* No streak pressure or escalation

**Failure behavior:**

* If override attempt → HARD FAIL → log \+ governance alert

---

## **3\) Generator Orchestrator**

**Canonical principle:** Mystic generation must privilege containment over novelty. If policy cannot be satisfied, stall.

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
* If still rejected → STALL and surface grounding-only guidance  
* No unvalidated unit may be delivered

---

## **4\) Policy Engine (Constraints / Invariants)**

**Canonical authority:** Single source of truth for invariant enforcement and forbidden-pattern detection.

**Purpose:** Enforce Mystic invariants and constraint bundles.

**Inputs:**

* GR  
* GU  
* PC  
* active policy version

**Outputs:**

* accept/reject  
* rejection\_reason  
* required\_corrections (optional)

**Must enforce (Mystic invariants):**

* Grounding mandatory (M-1)  
* No interpretation (M-2)  
* No exceptionalism (M-3)  
* No intensity reward (M-4)  
* Ordinary function preserved (M-5)  
* Containment over expansion (M-6)  
* No oracle / doctrine (M-7)  
* Prior grade stability required (M-8)

**Forbidden-pattern detection must include:**

* meaning-making language  
* superiority or special access cues  
* dissociation/detachment framing  
* escalation after novelty  
* withdrawal encouragement

**Failure behavior:**

* Any systemic breach → HARD FAIL → freeze generation and progression, raise governance alert, require rollback/patch before resume

---

**5\) Hope (Companion Engine)**

**Canonical principle:** Hope mirrors perception without interpretation and enforces grounding.

**Purpose:** Non-directive companion surface for perceptual containment.

**Inputs:**

* user message  
* PC  
* GU context  
* companion policy constraints

**Outputs:**

* neutral reflection  
* grounding prompt (optional)  
* containment reminder (optional)

**May do:**

* Reflect sensory descriptions neutrally  
* Ask grounding questions ("What is your body doing right now?")  
* Redirect interpretation to observation

**May NOT do:**

* Interpret experiences  
* Validate meaning or insight  
* Encourage escalation or novelty  
* Frame experiences as progress  
* Label identity, rank, or status

**Failure behavior:**

* If response violates policy → block \+ return grounding-only response \+ log for audit

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

**7\) Event Log (Append-only)**

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

* pacing/exposure policies (Tempus)  
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
* interpret experiences  
* ratify visions  
* bypass Tempus or grounding requirements  
* override dependency gates

---

## **VI. Mystic Constraint Bundles**

**Implementation key:** A Constraint Bundle is the machine-readable policy context derived from the Progress Cursor (PC). Bundle definition is the next artifact to be authored after this mapping.

A bundle is a computed set of restrictions derived from PC:

* planet profile (chapter)  
* element profile  
* IA binding  
* FO targets  
* forbidden pattern list (interpretation, exceptionalism, intensity)

Invariants:

* Every GR must resolve to exactly one bundle.  
* Every GU must declare its bundle\_id and policy\_version.

---

## 

## **VII. Minimal API Surface (Conceptual)**

* GET /state → returns PP \+ PC (+ dependency \+ grounding status)  
* POST /request-unit → submits GR, returns GU or next\_unlock\_at  
* POST /complete-unit → submits CE, returns updated PC/state  
* POST /hope → companion interaction (policy-filtered)

Internal-only:

* GET /audit/sample → returns sample seeds for replay  
* POST /audit/replay → replays seed+policy\_version and verifies invariant checks

---

## **VIII. Canonical Assertion**

If an implementation includes the modules above and enforces the contracts and invariants described herein, it is a **valid Mystic implementation**.

If any module enables interpretation, exceptionalism, intensity reward, oracle behavior, or bypasses grounding/dependency gates, the implementation is invalid.

---

**End of Grade IV — The Mystic: Generator & Module Mapping**

