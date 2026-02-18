---
title: "Cross Grade Dependency Enforcement Spec"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# Cross Grade Dependency Enforcement Spec
## **Cross-Grade Dependency Enforcement Specification (Vitae-Wide)**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors, governance stewards

This document defines the **Vitae-wide cross-grade dependency enforcement layer**. It specifies how dependency health is computed, how dependency failures propagate (stall/stabilize/regress), what must be logged for deterministic replay, and which failure modes constitute hard invalidation.

**Transparency note:** Some previously uploaded reference files may have expired in this environment (expected). This specification is derived from the **sealed grade implementation documents and canons** already established across Grades I–X; no additional files are required.

This specification is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Elementary / Intermediate / High School Canons  
* All Grade Implementation Stacks (Generator Mapping, Constraint Bundles, FSMs, Audit Harnesses)

---

## **I. Purpose**

Cross-grade dependency enforcement ensures that:

1. **No advanced grade can operate on a degraded foundation.**  
2. **Progression is integrity-first, not throughput-first.**  
3. System behavior remains **deterministic and auditable** under dependency changes.

Dependencies are evaluated as **system conditions**, not judgments about practitioners.

---

## 

## **II. Definitions**

### **A. Dependency**

A **dependency** is a required prior-grade state condition that must remain within acceptable bounds for a downstream grade to:

* generate units  
* advance the progress cursor  
* maintain safety invariants

### **B. Dependency Health States**

Each dependency is evaluated into exactly one of the following:

* **OK**: dependency satisfied and stable  
* **DEGRADED**: dependency likely violated or drifting (protective stop required)  
* **UNKNOWN**: insufficient evidence to validate (protective stop required)

### **C. Dependency Snapshot**

A **Dependency Snapshot (DS)** is the recorded evaluation output at a specific time:

* dependency graph version  
* evaluator version  
* per-grade health states  
* reason codes  
* timestamp

Every generation and advancement event MUST store a DS.

---

## 

## 

## 

## 

## **III. Canonical Dependency Graph**

### **A. Global Rule**

For Grade **N**, canonical baseline dependencies include **all prior grades 1..(N-1)**.

### **B. Tier Emphasis**

While all prior grades are dependencies, enforcement applies **tier-weighted severity**:

* **Elementary (I–IV)** are *structural dependencies* (integrity and safety)  
* **Intermediate (V–VIII)** are *systems dependencies* (maintenance, ethics, synthesis)  
* **High School (IX–X)** are *restraint dependencies* (non-authority, exit integrity)

### **C. Critical Cross-Links (Non-Exhaustive)**

Some grades introduce special critical failure pathways:

* **V (Scholar)** depends heavily on **III–IV** (discipline \+ mystic stability) to prevent ideation drift.  
* **VI (Healer)** depends heavily on **I–III** (boundaries \+ non-reactivity \+ restraint) to prevent savior dynamics.  
* **VII (Alchemist)** depends heavily on **V–VI** (ethics \+ care) to prevent outcome-justification and harm.  
* **VIII (Sage)** depends heavily on **V–VII** to prevent closure and passive authority.  
* **IX (Oracle)** depends heavily on **VIII** to prevent prediction and authority creep.  
* **X (Adept)** depends heavily on **VIII–IX** to preserve exit neutrality and prevent dominance.

Graph is versioned as **DG.vX**.

---

## 

## 

## 

## 

## 

## **IV. Dependency Evaluator (DE)**

### **A. Role**

The Dependency Evaluator computes DS from:

* event log summaries  
* per-grade risk flags  
* drift detector outputs  
* policy/version registry  
* current progression cursor

DE MUST be deterministic and versioned.

### **B. Inputs**

* practitioner\_id  
* current grade\_id  
* bounded event log window (per grade)  
* drift flags per grade (if any)  
* last known DS  
* policy hashes

### **C. Outputs**

* DS: { grade\_health\_map, reason\_codes, evaluator\_version, graph\_version, timestamp }

---

## 

## 

## 

## 

## 

## 

## **V. Enforcement Actions**

Enforcement actions occur at **three system moments**:

1. **Before Generation** (request-unit)  
2. **Before Advancement** (complete-unit validation)  
3. **During Drift Events** (asynchronous within runtime loop)

### **A. Action Types**

* **ALLOW**: proceed normally  
* **WAIT**: time-gated; no dependency failure  
* **STALL**: protective stop due to DEGRADED or UNKNOWN dependency  
* **STABILIZE**: enforce stabilization protocol within current grade  
* **REGRESS (Soft)**: shift user into review mode without moving canonical cursor  
* **HARD\_FAIL**: system integrity violation (builder/governance issue)

### **B. Canonical Mapping (Dependency Health → Action)**

* If any dependency \= **UNKNOWN** → **STALL**  
* If any structural dependency (Grades I–IV) \= **DEGRADED** → **STALL**  
* If any systems dependency (V–VIII) \= **DEGRADED** and current grade ≥ VII → **STALL or STABILIZE** (grade-defined)  
* If any restraint dependency (VIII–IX) \= **DEGRADED** and current grade ≥ IX → **STALL**

### **C. Non-Punitive Requirement**

STALL/STABILIZE MUST:

* provide neutral messaging  
* avoid judgment framing  
* avoid urgency  
* offer safe recovery route

---

## 

## 

## 

## **VI. Recovery Routing (Where to Send the Practitioner)**

When dependency failure occurs, the system must compute a **Recovery Route (RR)**:

### **A. Recovery Route Algorithm**

1. Identify the **highest-severity failed dependency** (structural \> systems \> restraint)  
2. Choose the **lowest grade** whose stabilization resolves the failure  
3. Enter that grade in one of:  
   * REVIEW mode (non-advancing)  
   * STABILIZE protocol (grade-specific)

### **B. Recovery Route Output**

RR includes:

* target\_grade\_id  
* mode: REVIEW | STABILIZE  
* reason\_code  
* minimum\_time\_window (optional)

### **C. Return Conditions**

System may return practitioner to original grade only when:

* DS shows all dependencies OK  
* Tempus gates satisfied

---

## 

## 

## 

## 

## 

## **VII. Dependency Logging & Deterministic Replay**

### **A. Required Log Attachments**

Every relevant event must attach:

* DS (dependency snapshot)  
* evaluator\_version  
* graph\_version  
* policy version hashes

Events include:

* generation requests  
* generated units  
* completion events  
* cursor advances  
* stall/stabilize transitions

### **B. Replay Assertion**

Given:

* event log  
* seeds  
* policy versions  
* graph \+ evaluator versions

Replay MUST reproduce:

* identical dependency snapshots  
* identical enforcement actions  
* identical state transitions (WAIT/STALL/STABILIZE)

If replay diverges → **HARD\_FAIL**.

---

## 

## 

## 

## **VIII. Invariants (Vitae-Wide)**

The following invariants are global and non-negotiable:

### **VDX-1 No Bypass**

No module may bypass dependency enforcement.

### **VDX-2 Determinism**

Dependency decisions must be deterministic and versioned.

### **VDX-3 Neutrality**

Dependency failures must not be presented as personal failure.

### **VDX-4 No Manual Advancement**

Governance may not manually advance practitioners past dependency stalls.

### **VDX-5 Safety Over Progress**

If dependency state is uncertain, the system must protect (STALL), not guess.

---

## **IX. Hard Failure Conditions (System Invalidations)**

Any of the following constitutes a system-level invalidation:

* dependency enforcement disabled or bypassed  
* DS not logged with units/events  
* dependency evaluator non-deterministic  
* graph version mismatch not stored  
* progression continues while structural dependency is DEGRADED/UNKNOWN  
* governance advances individuals past dependency stalls

Hard failures must trigger:

* generation freeze  
* governance alert  
* rollback or patch requirement

---

## **X. Minimal API Surface (Conceptual)**

* GET /dependencies/state → returns latest DS \+ RR if applicable  
* POST /dependencies/evaluate → computes DS (internal)  
* POST /dependencies/ack-stall → records stall acknowledgment (optional)  
* GET /dependencies/graph → returns DG.vX (internal)

---

## **XI. Canonical Assertion**

If an implementation:

* computes deterministic dependency snapshots  
* enforces stalls/stabilization when dependencies degrade or are unknown  
* logs DS for replay  
* routes recovery non-punitively

Then it is compliant with the **Arcanum Vitae — Cross-Grade Dependency Enforcement Specification**.

If not, the Vitae runtime is invalid.

---

**End of Arcanum Vitae — Cross-Grade Dependency Enforcement Specification**

