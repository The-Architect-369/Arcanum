---
title: "Dependency Evaluator Blueprint"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# Dependency Evaluator Blueprint
## **Dependency Evaluator Blueprint (DE \+ DS \+ RR)**

**Status:** Canonical · Internal · Implementation Blueprint

**Audience:** Builders, system architects, implementers, auditors

This blueprint specifies a deterministic reference design for the **Dependency Evaluator (DE)**, **Dependency Snapshot (DS)** persistence, and **Recovery Routing (RR)**. It is intended to be directly implementable in any runtime language.

**Transparency note:** Some older uploaded reference files have expired in this environment (expected). This blueprint relies only on the sealed Grade I–X implementation stack and the Vitae-wide Cross-Grade Dependency Enforcement Specification.

This blueprint is subordinate to:

* Arcanum Vitae — Cross-Grade Dependency Enforcement Specification  
* Arcanum Vitae — Master Constitution & Architecture  
* Grade FSMs and Audit Harnesses (I–X)

---

## **I. Core Design Goals**

DE MUST:

1. Be **deterministic** (same inputs → same DS)  
2. Be **versioned** (evaluator\_version, graph\_version)  
3. Operate on **bounded evidence** (no unbounded scanning)  
4. Produce **non-judgmental outputs** (system health, not person worth)  
5. Support **replay** (DS attached to all key events)

RR MUST:

1. Produce the **lowest-grade** stabilization that resolves the failure  
2. Prefer **REVIEW** before **STABILIZE** when safe  
3. Never create urgency, punishment, or shame loops

---

## **II. Data Model (Schemas)**

### **A. Dependency Graph (DG)**

Versioned static structure describing dependencies.

{  
  "graph\_version": "DG.v1",  
  "nodes": \[1,2,3,4,5,6,7,8,9,10\],  
  "edges": \[  
    {"from": 5, "requires": \[1,2,3,4\]},  
    {"from": 6, "requires": \[1,2,3,4,5\]},  
    {"from": 7, "requires": \[1,2,3,4,5,6\]},  
    {"from": 8, "requires": \[1,2,3,4,5,6,7\]},  
    {"from": 9, "requires": \[1,2,3,4,5,6,7,8\]},  
    {"from": 10,"requires": \[1,2,3,4,5,6,7,8,9\]}  
  \],  
  "tier\_weights": {  
    "elementary": {"grades": \[1,2,3,4\], "severity": "STRUCTURAL"},  
    "intermediate": {"grades": \[5,6,7,8\], "severity": "SYSTEMS"},  
    "high": {"grades": \[9,10\], "severity": "RESTRAINT"}  
  },  
  "critical\_links": \[  
    {"from": 6, "critical": \[1,2,3\]},  
    {"from": 7, "critical": \[5,6\]},  
    {"from": 8, "critical": \[5,6,7\]},  
    {"from": 9, "critical": \[8\]},  
    {"from": 10, "critical": \[8,9\]}  
  \]  
}

### 

### 

### 

### 

### 

### 

### **B. Dependency Snapshot (DS)**

Stored and attached to events.

{  
  "practitioner\_id": "...",  
  "evaluated\_for\_grade": 7,  
  "timestamp": "2026-01-13T...Z",  
  "graph\_version": "DG.v1",  
  "evaluator\_version": "DE.v1",  
  "grade\_health": {  
    "1": {"state": "OK", "reasons": \[\]},  
    "2": {"state": "OK", "reasons": \[\]},  
    "3": {"state": "DEGRADED", "reasons": \["G3.DRIFT\_RIGIDITY"\]},  
    "4": {"state": "OK", "reasons": \[\]},  
    "5": {"state": "OK", "reasons": \[\]},  
    "6": {"state": "UNKNOWN", "reasons": \["G6.INSUFFICIENT\_EVIDENCE"\]}  
  },  
  "aggregate": {  
    "structural": "DEGRADED",  
    "systems": "UNKNOWN",  
    "restraint": "OK"  
  },  
  "decision": {  
    "action": "STALL",  
    "reason": "DEPENDENCY\_NOT\_OK",  
    "blocking\_grades": \[3,6\]  
  }  
}

### **C. Recovery Route (RR)**

Returned when action is STALL/STABILIZE/REGRESS.

{  
  "target\_grade": 3,  
  "mode": "STABILIZE",  
  "reason\_code": "G3.DRIFT\_RIGIDITY",  
  "min\_window": "P7D",  
  "return\_condition": "DS.all\_required\_ok"  
}

---

## **III. Evidence Inputs (Bounded)**

DE MUST only use bounded signals:

### **A. Per-Grade Risk Flags**

Each grade runtime already computes risk flags (from bundles \+ drift detectors). DE reads the **latest snapshot** per grade:

* Guardian: continuity/self-correction signals  
* Seeker: mind stability signals  
* Disciple: discipline/rigidity drift  
* Mystic: meaning inflation / closure risk  
* Scholar: ideological rigidity risk  
* Healer: savior/dependency/burnout risks  
* Alchemist: scope creep / rollback avoidance  
* Sage: passive authority / closure / detachment risks  
* Oracle: prediction/authority/intervention risks  
* Adept: dependency/domination/attachment risks

### **B. Minimal Evidence Window**

Per grade, use:

* last **K** events (recommended K=50)  
* last **T** days (recommended T=21)  
* last drift event (if any)

### **C. Missing Evidence → UNKNOWN**

If evidence window absent or insufficient for a grade: state=UNKNOWN.

---

## 

## 

## 

## 

## **IV. Deterministic Scoring Rules**

Each grade produces a **health state** based on deterministic thresholds.

### **A. Health State Determination**

**OK** if:

* no active hard fails  
* no unresolved STABILIZE / STALLED state  
* risk flags within policy ceilings  
* sufficient evidence present

**DEGRADED** if:

* unresolved STABILIZE/STALLED  
* risk flags exceed ceilings  
* repeated drift events in window  
* any grade-specific critical invariant breached (non-hard-fail)

**UNKNOWN** if:

* insufficient evidence  
* policy/version mismatch without migration  
* missing required logs

### **B. Severity Weighting (Tier)**

When aggregating:

* any DEGRADED in Grades I–IV → structural=DEGRADED  
* any UNKNOWN in Grades I–IV → structural=UNKNOWN  
* for Grades V–VIII → systems aggregate  
* for Grades IX–X → restraint aggregate

### **C. Critical Link Override**

If a critical dependency is DEGRADED/UNKNOWN, it overrides the aggregate decision for that downstream grade.

Example:

* If current grade=9 and grade 8 is DEGRADED → action=STALL regardless of other grades.

---

## **V. Decision Algorithm (Action Resolver)**

### **A. Deterministic Action Resolution**

Pseudo-code:

function evaluate\_dependencies(practitioner\_id, current\_grade):  
  DG \= load\_dependency\_graph(version)  
  required \= DG.requires(current\_grade)  
  health\_map \= {}

  for g in required:  
    evidence \= load\_evidence(practitioner\_id, g, window)  
    health\_map\[g\] \= assess\_grade\_health(g, evidence)

  aggregates \= aggregate\_by\_tier(health\_map)  
  critical \= DG.critical(current\_grade)

  if any\_missing\_logs\_or\_versions(evidence):  
    return decision(STALL, reason="UNKNOWN")

  if any(health\_map\[g\].state \== UNKNOWN for g in required):  
    return decision(STALL, reason="UNKNOWN")

  if any(health\_map\[g\].state \== DEGRADED for g in required where g in \[1..4\]):  
    return decision(STALL, reason="STRUCTURAL\_DEGRADED")

  if any(health\_map\[g\].state in {DEGRADED, UNKNOWN} for g in critical):  
    return decision(STALL, reason="CRITICAL\_LINK\_FAILED")

  if aggregates.systems \== DEGRADED and current\_grade \>= 7:  
    return decision(STALL, reason="SYSTEMS\_DEGRADED")

  if aggregates.restraint \!= OK and current\_grade \>= 9:  
    return decision(STALL, reason="RESTRAINT\_FAILED")

  return decision(ALLOW, reason="ALL\_OK")

### **B. WAIT vs ALLOW**

WAIT is decided by Tempus, not DE. DE outputs only dependency-based actions.

---

## **VI. Recovery Routing Algorithm (RR)**

### **A. Selection Logic**

1. Identify failing grades in DS:  
* F \= { g | health\_map\[g\] \!= OK }  
2. Rank by severity:  
* STRUCTURAL failures highest  
* then SYSTEMS  
* then RESTRAINT  
3. Select lowest grade capable of resolving failure:  
* If any structural fail → pick **lowest failing grade in 1..4**  
* Else if systems fail → pick **lowest failing grade in 5..8**  
* Else if restraint fail → pick **lowest failing grade in 8..9** (prefer 8 before 9\)  
4. Choose mode:  
* If grade health=UNKNOWN → mode=REVIEW (evidence building)  
* If grade health=DEGRADED → mode=STABILIZE

### **B. RR Pseudocode**

function compute\_recovery\_route(DS):  
  fails \= list\_failed(DS)  
  if empty(fails): return null

  target \= pick\_lowest\_by\_severity(fails)  
  mode \= (DS.grade\_health\[target\].state \== UNKNOWN) ? REVIEW : STABILIZE

  return RR(target\_grade=target, mode=mode, reason\_code=DS.grade\_health\[target\].reasons\[0\])

### **C. Return Conditions**

System returns to blocked grade only when:

* DS shows all required grades OK  
* Tempus gates satisfied

---

## 

## **VII. Persistence & Event Attachment**

### **A. Where DS is Written**

DE MUST write DS at:

* pre-generation  
* pre-advancement  
* on STALL/STABILIZE transition

### **B. Event Attachment Rules**

Every generated unit must include:

* DS hash  
* evaluator\_version  
* graph\_version

Every completion/advance event must include:

* DS used for validation

---

## **VIII. Reason Code Taxonomy (Suggested)**

Reason codes must be deterministic, minimal, and non-judgmental.

Format:

* `G{grade}.{CATEGORY}.{DETAIL}`

Examples:

* `G3.DRIFT_RIGIDITY`  
* `G6.BOUNDARY_COLLAPSE_RISK`  
* `G7.ROLLBACK_AVOIDANCE`  
* `G8.CLOSURE_RISK_HIGH`  
* `G9.PREDICTION_LANGUAGE_DETECTED`  
* `G10.EXIT_DISCOURAGED` (system-level)  
* `SYS.INSUFFICIENT_EVIDENCE`  
* `SYS.VERSION_MISMATCH`

---

## **IX. Audit & Validation Requirements**

Audit Harnesses must test:

* determinism of DE  
* DS storage on all key events  
* correctness of action resolution  
* correctness of RR routing  
* replay reproduces DS and enforcement decisions

Any DS missing or evaluator non-deterministic → HARD FAIL.

---

## **X. Canonical Assertion**

If an implementation:

* computes DS deterministically (versioned)  
* stalls on UNKNOWN/DEGRADED dependencies  
* routes RR non-punitively  
* attaches DS to generation and advancement events  
* replays identically

Then it is compliant with the **Arcanum Vitae — Dependency Evaluator Blueprint (DE \+ DS \+ RR)**.

If not, the runtime is invalid.

---

**End of Arcanum Vitae — Dependency Evaluator Blueprint (DE \+ DS \+ RR)**

