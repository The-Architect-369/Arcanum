# **Arcanum Vitae**

## **Grade V — The Scholar**

### **Generator & Module Mapping**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **modules, data contracts, and enforcement responsibilities** required to implement Grade V — The Scholar. It translates the Scholar canons into a deterministic, auditable runtime architecture.

This document is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Intermediate School Canon  
* Grade V — The Scholar: Master Canon  
* Grade V — The Scholar: System Responsibility & Invariants Canon  
* Grade V — The Scholar: Procedural Systems Canon  
* Cross-Grade Dependency Canon (Intermediate)

---

## **I. Module Topology (Scholar-Specific)**

The Scholar reuses the Core Arcanum runtime, with **additional enforcement layers** specific to cognition, synthesis, and pacing.

**Client Layer**

* Scholar UI/UX (reading, reflection, synthesis capture)

**Core Runtime Layer**

* Progression Engine  
* Tempus (Pacing Engine)  
* Scholar Generator Orchestrator  
* Hope (Companion Engine — Scholar Policy)

**Integrity Layer**

* Scholar Policy Engine (cognitive invariants)  
* Audit Harness (sampling \+ replay)

**Data Layer**

* Practitioner State Store  
* Event Log (append-only)  
* Seed Registry

---

## **II. Scholar-Specific Data Contracts**

### **A. Scholar Cognitive State (SCS)**

Additional fields layered onto Practitioner Profile:

* synthesis\_required (bool)  
* synthesis\_completed\_at  
* cognitive\_load\_index (bounded)  
* last\_reflection\_at

Invariant:

* If synthesis\_required \= true, progression must stall.

---

### **B. Scholar Generation Request (SGR)**

Extends core Generation Request:

* practitioner\_id  
* Progress Cursor  
* seed  
* constraints\_bundle\_id  
* synthesis\_state  
* reflection\_state

---

### 

### **C. Scholar Generated Unit (SGU)**

Extends Generated Unit:

* unit\_id  
* Progress Cursor  
* seed  
* title  
* instructions (bounded, non-performative)  
* reflection\_prompt  
* synthesis\_prompt (optional)  
* completion\_criteria (binary)  
* ia\_binding (exactly one)  
* fo\_targets

Forbidden:

* correctness evaluation  
* comparative framing  
* insight rewards

---

## **III. Core Modules**

### **1\) Scholar Generator Orchestrator**

**Purpose:** Generate cognitively safe, bounded learning units.

**Responsibilities:**

* Resolve Scholar Constraint Bundle  
* Assign deterministic seed  
* Generate SGU  
* Enforce synthesis & reflection inclusion

**Failure Behavior:**

* Policy rejection → bounded regeneration  
* Repeated rejection → STALL

---

### 

### **2\) Scholar Policy Engine**

**Purpose:** Enforce Scholar invariants.

**Must Enforce:**

* No accumulation pressure  
* Synthesis precedes advancement  
* Reflection required for completion  
* Cognitive load ceilings  
* No authority through knowledge

**Failure Behavior:**

* Any invariant breach → HARD FAIL → stall \+ audit flag

---

### **3\) Tempus (Scholar Configuration)**

**Additional Enforcement:**

* Minimum reflection intervals  
* Mandatory synthesis windows  
* Anti-binge pacing

Tempus decisions are non-bypassable.

---

### **4\) Progression Engine (Scholar Ruleset)**

**Additional Rules:**

* PC advancement blocked if synthesis\_required  
* Regression permitted without penalty  
* Rest windows valid

---

**5\) Hope (Scholar Companion Policy)**

**Constraints:**

* No interpretation of knowledge  
* No validation of correctness  
* No acceleration cues

**Allowed:**

* Clarifying questions  
* Structural reminders  
* Reflection support

---

## **IV. Constraint Bundles (Scholar)**

Each Scholar unit resolves to exactly one **Scholar Constraint Bundle**, composed of:

* planetary / chapter profile  
* element profile  
* IA binding  
* FO targets  
* cognitive load ceiling  
* forbidden pattern list

Invariant:

* Every SGU must declare bundle\_id

---

## **V. Event Flow (Scholar)**

1. Tempus validates generation window  
2. Scholar Generator Orchestrator receives SGR  
3. Policy Engine pre-check  
4. SGU generated  
5. Policy Engine post-check  
6. SGU delivered  
7. Completion Event submitted  
8. Progression Engine validates synthesis & reflection  
9. PC advances or stalls

---

## 

## 

## **VI. Audit & Determinism**

All Scholar generation must be:

* seed-based  
* replayable  
* policy-versioned

Audit Harness must sample for:

* accumulation drift  
* synthesis bypass  
* cognitive overload  
* authority language

---

## **VII. Canonical Assertion**

If an implementation:

* enforces all modules and contracts defined herein  
* preserves synthesis, reflection, and pacing  
* prevents authority, accumulation, and cognitive overload

Then it is compliant with the **Grade V — The Scholar: Generator & Module Mapping**.

If not, it is invalid.

---

**End of Grade V — The Scholar: Generator & Module Mapping**

