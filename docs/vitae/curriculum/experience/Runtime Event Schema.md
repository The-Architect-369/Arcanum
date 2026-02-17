# **Arcanum Vitae**

## **Runtime Event Schema & DS Attachment Contract**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines the **Vitae-wide runtime event model** and the **Dependency Snapshot (DS) attachment contract** required for deterministic replay, cross-grade enforcement, and auditability across Grades I–X.

**Transparency note:** Some previously uploaded reference files have expired in this environment (expected). This schema is derived from the sealed Grade I–X implementation documents and the following canonical layers:

* Arcanum Vitae — Cross-Grade Dependency Enforcement Specification  
* Arcanum Vitae — Dependency Evaluator Blueprint (DE \+ DS \+ RR)  
* Arcanum Vitae — Reason Code Registry & Risk-Flag Mapping Table

This document is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* All Grade FSMs and Audit Harnesses

---

## **I. Design Goals**

1. **Append-only truth:** all events are immutable once written.  
2. **Deterministic replay:** given event log \+ seeds \+ policy versions, the system reproduces identical units and transitions.  
3. **Cross-grade integrity:** every generation/advance decision is bound to a dependency snapshot.  
4. **Audit completeness:** every externally visible action has a log representation.

---

## 

## **II. Event Envelope (Universal)**

Every event MUST implement the following envelope:

{  
  "event\_id": "uuid",  
  "event\_type": "STRING",  
  "occurred\_at": "RFC3339 timestamp",  
  "practitioner\_id": "string",  
  "actor": "SYSTEM|PRACTITIONER|GOVERNANCE",  
  "grade\_id": 1,  
  "cursor": {  
    "class\_id": 1,  
    "chapter\_id": 1,  
    "element\_id": 1,  
    "mode": "optional mode field per grade"  
  },  
  "versions": {  
    "policy\_version": "hash",  
    "tempus\_version": "hash",  
    "generator\_version": "hash",  
    "dependency\_graph\_version": "DG.vX",  
    "dependency\_evaluator\_version": "DE.vX",  
    "constants\_hash": "hash"  
  },  
  "ds\_ref": {  
    "ds\_id": "uuid",  
    "ds\_hash": "hash"  
  },  
  "payload": {},  
  "integrity": {  
    "prev\_event\_hash": "hash|null",  
    "event\_hash": "hash"  
  }  
}

### **Envelope Invariants**

* `event_hash` MUST include the full envelope contents (excluding itself) deterministically.  
* `prev_event_hash` provides a **hash-chain** per practitioner for tamper evidence.

---

## **III. Dependency Snapshot (DS) Object & Contract**

### **A. DS Object Schema**

{  
  "ds\_id": "uuid",  
  "timestamp": "RFC3339",  
  "practitioner\_id": "string",  
  "evaluated\_for\_grade": 7,  
  "graph\_version": "DG.vX",  
  "evaluator\_version": "DE.vX",  
  "constants\_hash": "hash",  
  "grade\_health": {  
    "1": {"state": "OK|DEGRADED|UNKNOWN", "reasons": \["..."\]},  
    "2": {"state": "OK|DEGRADED|UNKNOWN", "reasons": \["..."\]}  
  },  
  "aggregate": {  
    "structural": "OK|DEGRADED|UNKNOWN",  
    "systems": "OK|DEGRADED|UNKNOWN",  
    "restraint": "OK|DEGRADED|UNKNOWN"  
  },  
  "decision": {  
    "action": "ALLOW|STALL|STABILIZE|REGRESS|HARD\_FAIL",  
    "reason": "string",  
    "blocking\_grades": \[1,2\]  
  },  
  "recovery\_route": {  
    "target\_grade": 3,  
    "mode": "REVIEW|STABILIZE",  
    "reason\_code": "G3...",  
    "min\_window": "P7D",  
    "return\_condition": "DS.all\_required\_ok"  
  }  
}

### 

### 

### 

### 

### **B. DS Attachment Contract**

The following events MUST reference DS via `ds_ref`:

* Unit generation requests  
* Generated unit issuance  
* Completion submissions  
* Progression validations  
* Cursor advancements  
* Stall/Stabilize transitions

**Invariant:** Any of the above events missing DS reference → `SYS.LOGS.MISSING_DS` and MUST yield protective stall (and may escalate to HARD FAIL if systemic).

### **C. DS Lifecycle**

* DS is computed by DE and written as a standalone object.  
* Events reference DS by `ds_id` \+ `ds_hash`.  
* DS is immutable once written.

---

## **IV. Seed Contract (Deterministic Generation)**

### **A. Seed Record**

{  
  "seed\_id": "uuid",  
  "practitioner\_id": "string",  
  "grade\_id": 7,  
  "cursor": {"class\_id": 1, "chapter\_id": 2, "element\_id": 3, "mode": "..."},  
  "seed": "string",  
  "issued\_at": "RFC3339",  
  "policy\_version": "hash",  
  "generator\_version": "hash"  
}

**Invariant:** Seeds are immutable once issued.

---

## 

## **V. Canonical Event Types**

**Note:** Grade-specific payloads extend these event types; the envelope remains invariant.

### **1\) `STATE_READ` (Optional)**

Used when state is explicitly requested (not required if reads are not logged).

### **2\) `DS_EVALUATED`**

Written whenever DE computes a DS.

Payload:

{"ds\_id":"uuid"}

### **3\) `UNIT_REQUESTED`**

A generation request event.

Payload:

{  
  "request\_id": "uuid",  
  "constraints\_bundle\_id": "id",  
  "seed\_id": "uuid|null",  
  "context": {"time\_of\_day": "...", "day\_of\_week": "..."},  
  "history\_summary\_ref": "optional"  
}

### **4\) `SEED_ISSUED`**

If seed assigned during request.

Payload:

{"seed\_id":"uuid","seed":"string"}

### **5\) `UNIT_GENERATED`**

Issued unit event.

Payload:

{  
  "unit\_id": "uuid",  
  "constraints\_bundle\_id": "id",  
  "seed\_id": "uuid",  
  "title": "...",  
  "body\_ref": "content pointer",  
  "completion\_criteria": "binary description",  
  "ia\_binding": "IA-id",  
  "fo\_targets": \["FO-..."\],  
  "forbidden\_checks\_passed": true  
}

### **6\) `UNIT_REJECTED`**

Policy engine rejects generated unit.

Payload:

{  
  "request\_id": "uuid",  
  "rejection\_reason": "string",  
  "attempt": 1  
}

### **7\) `UNIT_COMPLETED`**

Practitioner completion submission.

Payload:

{  
  "unit\_id": "uuid",  
  "completion\_attestation": true,  
  "attestations": {"reflection": true, "consent": false, "non\_intervention": true},  
  "notes\_ref": "optional"  
}

### **8\) `PROGRESSION_VALIDATED`**

Progression engine validates completion against Tempus \+ Policy \+ DS.

Payload:

{  
  "unit\_id": "uuid",  
  "valid": true,  
  "validation\_reason": "string",  
  "next\_action": "ADVANCE|WAIT|STALL|STABILIZE|REJECT"  
}

### **9\) `CURSOR_ADVANCED`**

Canonical cursor moved forward.

Payload:

{  
  "from\_cursor": {"class\_id":1,"chapter\_id":1,"element\_id":1,"mode":"..."},  
  "to\_cursor": {"class\_id":1,"chapter\_id":1,"element\_id":2,"mode":"..."}  
}

### **10\) `STATE_TRANSITIONED`**

FSM state changes (ACTIVE/WAITING/STALLED/STABILIZE/etc.)

Payload:

{  
  "from\_state": "ACTIVE",  
  "to\_state": "WAITING",  
  "reason": "Tempus gate",  
  "metadata": {"next\_unlock\_at": "RFC3339"}  
}

### 

### 

### 

### 

### **11\) `STALL_ISSUED`**

Explicit stall event with RR.

Payload:

{  
  "stall\_reason": "DEPENDENCY\_NOT\_OK",  
  "blocking\_grades": \[3,6\],  
  "recovery\_route": {"target\_grade":3,"mode":"STABILIZE","reason\_code":"G3..."}  
}

### **12\) `STABILIZE_ASSIGNED`**

Stabilization protocol assigned within a grade.

Payload:

{  
  "target\_grade": 8,  
  "protocol\_id": "string",  
  "reason\_code": "G8...",  
  "constraints\_bundle\_id": "id"  
}

### **13\) `PAUSE_SET` / `PAUSE_CLEARED`**

Pause state toggles.

### **14\) `GOVERNANCE_FREEZE` / `GOVERNANCE_UNFREEZE`**

Emergency controls.

Payload:

{"scope":"GENERATION|PROGRESSION|GLOBAL","reason":"..."}

### **15\) `EXIT_READY` / `EXITED` (Grade X)**

Adept finalization events.

Payload:

{  
  "export\_package\_id": "uuid",  
  "exit\_attestation": true  
}

---

## **VI. Event Ordering & Causality**

### **A. Minimal Ordering Constraints**

* `UNIT_REQUESTED` precedes `UNIT_GENERATED`  
* `UNIT_GENERATED` precedes `UNIT_COMPLETED`  
* `UNIT_COMPLETED` precedes `PROGRESSION_VALIDATED`  
* `PROGRESSION_VALIDATED(valid=true,next_action=ADVANCE)` precedes `CURSOR_ADVANCED`  
* Any enforcement action (`STALL_ISSUED`, `STATE_TRANSITIONED` to STALLED/STABILIZE) must be logged before subsequent `UNIT_REQUESTED`

### **B. Idempotency**

* `UNIT_COMPLETED` for a given unit\_id must be idempotent (ignore duplicates).  
* `CURSOR_ADVANCED` must be idempotent by (from\_cursor,to\_cursor,event\_hash).

---

## 

## 

## 

## 

## 

## **VII. DS Attachment Rules by Event Type**

| Event Type | DS Required? | DS Purpose |
| ----- | ----- | ----- |
| `DS_EVALUATED` | n/a | defines DS object |
| `UNIT_REQUESTED` | ✅ | dependency pre-check for generation |
| `UNIT_GENERATED` | ✅ | binds unit to dependency state at issuance |
| `UNIT_REJECTED` | ✅ | records dependency context for rejection |
| `UNIT_COMPLETED` | ✅ | binds completion to dependency snapshot used |
| `PROGRESSION_VALIDATED` | ✅ | validates advance eligibility |
| `CURSOR_ADVANCED` | ✅ | records dependency state at advance |
| `STATE_TRANSITIONED` | ✅ | records why system changed state |
| `STALL_ISSUED` | ✅ | records enforcement decision \+ RR |
| `STABILIZE_ASSIGNED` | ✅ | binds stabilization protocol to DS |
| `EXIT_READY/EXITED` | ✅ | binds exit readiness to dependency state |

**Invariant:** If DS missing where required → protective stall \+ `SYS.LOGS.MISSING_DS`.

---

## 

## 

## 

## **VIII. Audit Replay Contract**

A valid implementation MUST support replay such that:

* For every `UNIT_GENERATED`, re-running generation with stored seed \+ versions yields identical unit structure.  
* For every `CURSOR_ADVANCED`, re-evaluating DS \+ policy versions yields identical `PROGRESSION_VALIDATED` outcome.  
* For every `STALL_ISSUED`, replay produces the same RR.

Replay divergence → HARD FAIL.

---

## **IX. Minimal API Surface (Conceptual)**

* `POST /dependencies/evaluate` → returns DS \+ RR  
* `POST /unit/request` → logs UNIT\_REQUESTED, returns UNIT\_GENERATED or STALL/WAIT  
* `POST /unit/complete` → logs UNIT\_COMPLETED \+ PROGRESSION\_VALIDATED, returns new state  
* `GET /events` (internal) → returns append-only log window  
* `GET /audit/replay` (internal) → returns seeds \+ versions for replay

---

## **X. Canonical Assertion**

If an implementation:

* uses the universal event envelope  
* logs append-only events with hash chaining  
* attaches DS to all required events  
* stores seeds for replay  
* reproduces identical behavior under replay

Then it is compliant with the **Arcanum Vitae — Runtime Event Schema & DS Attachment Contract**.

If not, the runtime is invalid.

---

