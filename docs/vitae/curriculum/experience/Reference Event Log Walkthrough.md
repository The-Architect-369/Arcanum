---
title: "Reference Event Log Walkthrough"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---

# Reference Event Log Walkthrough
## **Reference Event Log Walkthrough (Happy Path \+ Stall \+ Exit)**

**Status:** Canonical · Internal · Implementation Reference (Illustrative)

**Audience:** Builders, system architects, implementers, auditors

This document provides **illustrative, end-to-end event log sequences** for three scenarios:

1. **Happy Path** (normal generation → completion → cursor advance)  
2. **Dependency Stall \+ Recovery** (cross-grade enforcement \+ RR routing)  
3. **Adept Exit Path** (Grade X completion as freedom)

It is designed to make the Runtime Event Schema \+ DS Attachment Contract **concrete**.

**Transparency note:** Some older uploaded reference files have expired in this environment (expected). This walkthrough does **not** require those files; it uses the sealed canonical event model, DS attachment contract, and DE/RR specs.

Subordinate to:

* Arcanum Vitae — Runtime Event Schema & DS Attachment Contract  
* Arcanum Vitae — Cross-Grade Dependency Enforcement Specification  
* Arcanum Vitae — Dependency Evaluator Blueprint (DE \+ DS \+ RR)  
* Arcanum Vitae — Reason Code Registry & Risk-Flag Mapping Table

---

## **Conventions**

* Timestamps are illustrative.  
* `event_hash`/`prev_event_hash` omitted for brevity (MUST exist in implementation).  
* Every event includes the universal envelope; we show only relevant fields.  
* DS objects are shown separately when first evaluated; later events reference `ds_ref`.

---

# **Scenario A — Happy Path (Grade VII example)**

### **Narrative**

A practitioner in **Grade VII (Alchemist)** requests the next unit. Dependencies are OK. A seed is issued, a unit is generated, the practitioner completes it, progression validates, and the cursor advances.

### **A1) DS Evaluated**

{  
  "event\_type": "DS\_EVALUATED",  
  "occurred\_at": "2026-01-13T10:00:01Z",  
  "practitioner\_id": "P-001",  
  "grade\_id": 7,  
  "cursor": {"class\_id": 3, "chapter\_id": 2, "element\_id": 1, "mode": "ASSESS"},  
  "versions": {"dependency\_graph\_version": "DG.v1", "dependency\_evaluator\_version": "DE.v1", "constants\_hash": "C.v1"},  
  "ds\_ref": {"ds\_id": "DS-100", "ds\_hash": "H(DS-100)"},  
  "payload": {"ds\_id": "DS-100"}  
}  
**DS-100 (stored object):**  
{  
  "ds\_id": "DS-100",  
  "timestamp": "2026-01-13T10:00:01Z",  
  "practitioner\_id": "P-001",  
  "evaluated\_for\_grade": 7,  
  "graph\_version": "DG.v1",  
  "evaluator\_version": "DE.v1",  
  "constants\_hash": "C.v1",  
  "grade\_health": {  
    "1": {"state": "OK", "reasons": \[\]},  
    "2": {"state": "OK", "reasons": \[\]},  
    "3": {"state": "OK", "reasons": \[\]},  
    "4": {"state": "OK", "reasons": \[\]},  
    "5": {"state": "OK", "reasons": \[\]},  
    "6": {"state": "OK", "reasons": \[\]}  
  },  
  "aggregate": {"structural": "OK", "systems": "OK", "restraint": "OK"},  
  "decision": {"action": "ALLOW", "reason": "ALL\_OK", "blocking\_grades": \[\]},  
  "recovery\_route": null  
}

### **A2) Unit Requested**

{  
  "event\_type": "UNIT\_REQUESTED",  
  "occurred\_at": "2026-01-13T10:00:02Z",  
  "practitioner\_id": "P-001",  
  "grade\_id": 7,  
  "cursor": {"class\_id": 3, "chapter\_id": 2, "element\_id": 1, "mode": "ASSESS"},  
  "versions": {"policy\_version": "POL-7.v3", "tempus\_version": "TMP.v2", "generator\_version": "GEN-7.v5", "dependency\_graph\_version": "DG.v1", "dependency\_evaluator\_version": "DE.v1", "constants\_hash": "C.v1"},  
  "ds\_ref": {"ds\_id": "DS-100", "ds\_hash": "H(DS-100)"},  
  "payload": {"request\_id": "R-200", "constraints\_bundle\_id": "ACB-7-3-2-1-ASSESS", "seed\_id": null, "context": {"day\_of\_week": "TUE"}}  
}

### **A3) Seed Issued**

{  
  "event\_type": "SEED\_ISSUED",  
  "occurred\_at": "2026-01-13T10:00:03Z",  
  "practitioner\_id": "P-001",  
  "grade\_id": 7,  
  "cursor": {"class\_id": 3, "chapter\_id": 2, "element\_id": 1, "mode": "ASSESS"},  
  "versions": {"policy\_version": "POL-7.v3", "generator\_version": "GEN-7.v5", "dependency\_graph\_version": "DG.v1", "dependency\_evaluator\_version": "DE.v1", "constants\_hash": "C.v1"},  
  "ds\_ref": {"ds\_id": "DS-100", "ds\_hash": "H(DS-100)"},  
  "payload": {"seed\_id": "S-300", "seed": "0xA1B2..."}  
}

### 

### 

### 

### 

### 

### **A4) Unit Generated**

{  
  "event\_type": "UNIT\_GENERATED",  
  "occurred\_at": "2026-01-13T10:00:04Z",  
  "practitioner\_id": "P-001",  
  "grade\_id": 7,  
  "cursor": {"class\_id": 3, "chapter\_id": 2, "element\_id": 1, "mode": "ASSESS"},  
  "versions": {"policy\_version": "POL-7.v3", "tempus\_version": "TMP.v2", "generator\_version": "GEN-7.v5", "dependency\_graph\_version": "DG.v1", "dependency\_evaluator\_version": "DE.v1", "constants\_hash": "C.v1"},  
  "ds\_ref": {"ds\_id": "DS-100", "ds\_hash": "H(DS-100)"},  
  "payload": {"unit\_id": "U-400", "constraints\_bundle\_id": "ACB-7-3-2-1-ASSESS", "seed\_id": "S-300", "title": "Assess: bounded change", "body\_ref": "blob://U-400", "completion\_criteria": "attest complete", "ia\_binding": "IA-7.1", "fo\_targets": \["FO-7.1"\], "forbidden\_checks\_passed": true}  
}

### **A5) Unit Completed**

{  
  "event\_type": "UNIT\_COMPLETED",  
  "occurred\_at": "2026-01-13T10:22:10Z",  
  "practitioner\_id": "P-001",  
  "grade\_id": 7,  
  "cursor": {"class\_id": 3, "chapter\_id": 2, "element\_id": 1, "mode": "ASSESS"},  
  "versions": {"policy\_version": "POL-7.v3", "tempus\_version": "TMP.v2", "generator\_version": "GEN-7.v5", "dependency\_graph\_version": "DG.v1", "dependency\_evaluator\_version": "DE.v1", "constants\_hash": "C.v1"},  
  "ds\_ref": {"ds\_id": "DS-100", "ds\_hash": "H(DS-100)"},  
  "payload": {"unit\_id": "U-400", "completion\_attestation": true, "attestations": {"reflection": true}, "notes\_ref": "blob://N-1"}  
}

### 

### 

### 

### 

### 

### **A6) Progression Validated**

{  
  "event\_type": "PROGRESSION\_VALIDATED",  
  "occurred\_at": "2026-01-13T10:22:12Z",  
  "practitioner\_id": "P-001",  
  "grade\_id": 7,  
  "cursor": {"class\_id": 3, "chapter\_id": 2, "element\_id": 1, "mode": "ASSESS"},  
  "versions": {"policy\_version": "POL-7.v3", "tempus\_version": "TMP.v2", "dependency\_graph\_version": "DG.v1", "dependency\_evaluator\_version": "DE.v1", "constants\_hash": "C.v1"},  
  "ds\_ref": {"ds\_id": "DS-100", "ds\_hash": "H(DS-100)"},  
  "payload": {"unit\_id": "U-400", "valid": true, "validation\_reason": "OK", "next\_action": "ADVANCE"}  
}

### **A7) Cursor Advanced**

{  
  "event\_type": "CURSOR\_ADVANCED",  
  "occurred\_at": "2026-01-13T10:22:13Z",  
  "practitioner\_id": "P-001",  
  "grade\_id": 7,  
  "cursor": {"class\_id": 3, "chapter\_id": 2, "element\_id": 2, "mode": "DESIGN"},  
  "versions": {"policy\_version": "POL-7.v3", "tempus\_version": "TMP.v2", "dependency\_graph\_version": "DG.v1", "dependency\_evaluator\_version": "DE.v1", "constants\_hash": "C.v1"},  
  "ds\_ref": {"ds\_id": "DS-100", "ds\_hash": "H(DS-100)"},  
  "payload": {"from\_cursor": {"class\_id":3,"chapter\_id":2,"element\_id":1,"mode":"ASSESS"}, "to\_cursor": {"class\_id":3,"chapter\_id":2,"element\_id":2,"mode":"DESIGN"}}  
}

---

# 

# 

# **Scenario B — Dependency Stall \+ Recovery (Grade IX example)**

### **Narrative**

A practitioner in **Grade IX (Oracle)** attempts to request a unit. The Dependency Evaluator detects **Grade VIII closure drift** (Sage closure risk). Oracle must STALL. RR routes the practitioner to **Grade VIII STABILIZE**. After stabilization, dependencies return to OK and Oracle resumes.

### **B1) DS Evaluated (FAIL)**

{  
  "event\_type": "DS\_EVALUATED",  
  "occurred\_at": "2026-01-13T12:00:01Z",  
  "practitioner\_id": "P-002",  
  "grade\_id": 9,  
  "cursor": {"class\_id": 1, "chapter\_id": 1, "element\_id": 1, "mode": "OBSERVE"},  
  "versions": {"dependency\_graph\_version": "DG.v1", "dependency\_evaluator\_version": "DE.v1", "constants\_hash": "C.v1"},  
  "ds\_ref": {"ds\_id": "DS-201", "ds\_hash": "H(DS-201)"},  
  "payload": {"ds\_id": "DS-201"}  
}

**DS-201:**

{  
  "ds\_id": "DS-201",  
  "timestamp": "2026-01-13T12:00:01Z",  
  "practitioner\_id": "P-002",  
  "evaluated\_for\_grade": 9,  
  "graph\_version": "DG.v1",  
  "evaluator\_version": "DE.v1",  
  "constants\_hash": "C.v1",  
  "grade\_health": {  
    "1": {"state": "OK", "reasons": \[\]},  
    "2": {"state": "OK", "reasons": \[\]},  
    "3": {"state": "OK", "reasons": \[\]},  
    "4": {"state": "OK", "reasons": \[\]},  
    "5": {"state": "OK", "reasons": \[\]},  
    "6": {"state": "OK", "reasons": \[\]},  
    "7": {"state": "OK", "reasons": \[\]},  
    "8": {"state": "DEGRADED", "reasons": \["G8.CLOSURE.FINAL\_SYNTHESIS"\]}  
  },  
  "aggregate": {"structural": "OK", "systems": "DEGRADED", "restraint": "OK"},  
  "decision": {"action": "STALL", "reason": "CRITICAL\_LINK\_FAILED", "blocking\_grades": \[8\]},  
  "recovery\_route": {"target\_grade": 8, "mode": "STABILIZE", "reason\_code": "G8.CLOSURE.FINAL\_SYNTHESIS", "min\_window": "P7D", "return\_condition": "DS.all\_required\_ok"}  
}

### **B2) Unit Requested (but cannot generate)**

{  
  "event\_type": "UNIT\_REQUESTED",  
  "occurred\_at": "2026-01-13T12:00:02Z",  
  "practitioner\_id": "P-002",  
  "grade\_id": 9,  
  "cursor": {"class\_id": 1, "chapter\_id": 1, "element\_id": 1, "mode": "OBSERVE"},  
  "versions": {"policy\_version": "POL-9.v1", "tempus\_version": "TMP.v4", "generator\_version": "GEN-9.v2", "dependency\_graph\_version": "DG.v1", "dependency\_evaluator\_version": "DE.v1", "constants\_hash": "C.v1"},  
  "ds\_ref": {"ds\_id": "DS-201", "ds\_hash": "H(DS-201)"},  
  "payload": {"request\_id": "R-901", "constraints\_bundle\_id": "OCB-9-1-1-1-OBSERVE", "seed\_id": null}  
}

### **B3) Stall Issued**

{  
  "event\_type": "STALL\_ISSUED",  
  "occurred\_at": "2026-01-13T12:00:03Z",  
  "practitioner\_id": "P-002",  
  "grade\_id": 9,  
  "cursor": {"class\_id": 1, "chapter\_id": 1, "element\_id": 1, "mode": "OBSERVE"},  
  "versions": {"policy\_version": "POL-9.v1", "dependency\_graph\_version": "DG.v1", "dependency\_evaluator\_version": "DE.v1", "constants\_hash": "C.v1"},  
  "ds\_ref": {"ds\_id": "DS-201", "ds\_hash": "H(DS-201)"},  
  "payload": {"stall\_reason": "DEPENDENCY\_NOT\_OK", "blocking\_grades": \[8\], "recovery\_route": {"target\_grade": 8, "mode": "STABILIZE", "reason\_code": "G8.CLOSURE.FINAL\_SYNTHESIS", "min\_window": "P7D"}}  
}

### 

### **B4) State Transitioned → STALLED**

{  
  "event\_type": "STATE\_TRANSITIONED",  
  "occurred\_at": "2026-01-13T12:00:04Z",  
  "practitioner\_id": "P-002",  
  "grade\_id": 9,  
  "cursor": {"class\_id": 1, "chapter\_id": 1, "element\_id": 1, "mode": "OBSERVE"},  
  "versions": {"policy\_version": "POL-9.v1", "dependency\_graph\_version": "DG.v1", "dependency\_evaluator\_version": "DE.v1", "constants\_hash": "C.v1"},  
  "ds\_ref": {"ds\_id": "DS-201", "ds\_hash": "H(DS-201)"},  
  "payload": {"from\_state": "ACTIVE", "to\_state": "STALLED", "reason": "Dependency failure", "metadata": {"blocking\_grade": 8}}  
}

### **B5) Stabilize Assigned (Grade VIII)**

{  
  "event\_type": "STABILIZE\_ASSIGNED",  
  "occurred\_at": "2026-01-13T12:00:10Z",  
  "practitioner\_id": "P-002",  
  "grade\_id": 8,  
  "cursor": {"class\_id": 4, "chapter\_id": 5, "element\_id": 3, "mode": "HOLD"},  
  "versions": {"policy\_version": "POL-8.v4", "generator\_version": "GEN-8.v6", "dependency\_graph\_version": "DG.v1", "dependency\_evaluator\_version": "DE.v1", "constants\_hash": "C.v1"},  
  "ds\_ref": {"ds\_id": "DS-201", "ds\_hash": "H(DS-201)"},  
  "payload": {"target\_grade": 8, "protocol\_id": "SAGE-STAB-01", "reason\_code": "G8.CLOSURE.FINAL\_SYNTHESIS", "constraints\_bundle\_id": "SCB-8-...-HOLD"}  
}

### **B6) After Stabilization — DS Evaluated (PASS)**

{  
  "event\_type": "DS\_EVALUATED",  
  "occurred\_at": "2026-01-20T12:00:01Z",  
  "practitioner\_id": "P-002",  
  "grade\_id": 9,  
  "cursor": {"class\_id": 1, "chapter\_id": 1, "element\_id": 1, "mode": "OBSERVE"},  
  "versions": {"dependency\_graph\_version": "DG.v1", "dependency\_evaluator\_version": "DE.v1", "constants\_hash": "C.v1"},  
  "ds\_ref": {"ds\_id": "DS-202", "ds\_hash": "H(DS-202)"},  
  "payload": {"ds\_id": "DS-202"}  
}

**DS-202:** (grade 8 now OK)

{  
  "ds\_id": "DS-202",  
  "timestamp": "2026-01-20T12:00:01Z",  
  "practitioner\_id": "P-002",  
  "evaluated\_for\_grade": 9,  
  "graph\_version": "DG.v1",  
  "evaluator\_version": "DE.v1",  
  "constants\_hash": "C.v1",  
  "grade\_health": {  
    "1": {"state": "OK", "reasons": \[\]},  
    "2": {"state": "OK", "reasons": \[\]},  
    "3": {"state": "OK", "reasons": \[\]},  
    "4": {"state": "OK", "reasons": \[\]},  
    "5": {"state": "OK", "reasons": \[\]},  
    "6": {"state": "OK", "reasons": \[\]},  
    "7": {"state": "OK", "reasons": \[\]},  
    "8": {"state": "OK", "reasons": \[\]}  
  },  
  "aggregate": {"structural": "OK", "systems": "OK", "restraint": "OK"},  
  "decision": {"action": "ALLOW", "reason": "ALL\_OK", "blocking\_grades": \[\]},  
  "recovery\_route": null  
}

At this point, Oracle generation resumes with standard `UNIT_REQUESTED → SEED_ISSUED → UNIT_GENERATED` flow using DS-202.

---

# 

# 

# **Scenario C — Adept Exit Path (Grade X completion)**

### **Narrative**

A practitioner in **Grade X (Adept)** reaches INDEPENDENT mode. Exit readiness becomes true. The system logs EXIT\_READY, offers export, the practitioner exits, and the grade completes. Exit is neutral and non-coerced.

### **C1) DS Evaluated (ALLOW)**

{  
  "event\_type": "DS\_EVALUATED",  
  "occurred\_at": "2026-03-01T09:00:01Z",  
  "practitioner\_id": "P-003",  
  "grade\_id": 10,  
  "cursor": {"class\_id": 9, "chapter\_id": 7, "element\_id": 5, "mode": "INDEPENDENT"},  
  "versions": {"dependency\_graph\_version": "DG.v1", "dependency\_evaluator\_version": "DE.v1", "constants\_hash": "C.v1"},  
  "ds\_ref": {"ds\_id": "DS-301", "ds\_hash": "H(DS-301)"},  
  "payload": {"ds\_id": "DS-301"}  
}

### **C2) Exit Ready**

{  
  "event\_type": "EXIT\_READY",  
  "occurred\_at": "2026-03-01T09:00:05Z",  
  "practitioner\_id": "P-003",  
  "grade\_id": 10,  
  "cursor": {"class\_id": 9, "chapter\_id": 7, "element\_id": 5, "mode": "INDEPENDENT"},  
  "versions": {"policy\_version": "POL-10.v2", "dependency\_graph\_version": "DG.v1", "dependency\_evaluator\_version": "DE.v1", "constants\_hash": "C.v1"},  
  "ds\_ref": {"ds\_id": "DS-301", "ds\_hash": "H(DS-301)"},  
  "payload": {"export\_enabled": true, "exit\_always\_available": true, "message": "Exit is optional and neutral."}  
}

### 

### 

### **C3) State Transitioned → EXIT\_READY**

{  
  "event\_type": "STATE\_TRANSITIONED",  
  "occurred\_at": "2026-03-01T09:00:06Z",  
  "practitioner\_id": "P-003",  
  "grade\_id": 10,  
  "cursor": {"class\_id": 9, "chapter\_id": 7, "element\_id": 5, "mode": "INDEPENDENT"},  
  "versions": {"policy\_version": "POL-10.v2", "dependency\_graph\_version": "DG.v1", "dependency\_evaluator\_version": "DE.v1", "constants\_hash": "C.v1"},  
  "ds\_ref": {"ds\_id": "DS-301", "ds\_hash": "H(DS-301)"},  
  "payload": {"from\_state": "ACTIVE", "to\_state": "EXIT\_READY", "reason": "Exit readiness satisfied"}  
}

### **C4) Practitioner Exits (Exit Attestation)**

{  
  "event\_type": "EXITED",  
  "occurred\_at": "2026-03-01T09:05:00Z",  
  "practitioner\_id": "P-003",  
  "grade\_id": 10,  
  "cursor": {"class\_id": 9, "chapter\_id": 7, "element\_id": 5, "mode": "INDEPENDENT"},  
  "versions": {"policy\_version": "POL-10.v2", "dependency\_graph\_version": "DG.v1", "dependency\_evaluator\_version": "DE.v1", "constants\_hash": "C.v1"},  
  "ds\_ref": {"ds\_id": "DS-301", "ds\_hash": "H(DS-301)"},  
  "payload": {"export\_package\_id": "EXP-900", "exit\_attestation": true, "reentry\_optional": true}  
}

### **C5) Completion Recorded**

{  
  "event\_type": "STATE\_TRANSITIONED",  
  "occurred\_at": "2026-03-01T09:05:02Z",  
  "practitioner\_id": "P-003",  
  "grade\_id": 10,  
  "cursor": {"class\_id": 9, "chapter\_id": 7, "element\_id": 5, "mode": "INDEPENDENT"},  
  "versions": {"policy\_version": "POL-10.v2", "dependency\_graph\_version": "DG.v1", "dependency\_evaluator\_version": "DE.v1", "constants\_hash": "C.v1"},  
  "ds\_ref": {"ds\_id": "DS-301", "ds\_hash": "H(DS-301)"},  
  "payload": {"from\_state": "EXIT\_READY", "to\_state": "COMPLETE", "reason": "Non-coerced exit finalized"}  
}

---

## **Appendix — Minimal Event Sequences (Checklist)**

### **Happy Path Checklist**

1. DS\_EVALUATED (ALLOW)  
2. UNIT\_REQUESTED  
3. SEED\_ISSUED  
4. UNIT\_GENERATED  
5. UNIT\_COMPLETED  
6. PROGRESSION\_VALIDATED  
7. CURSOR\_ADVANCED  
8. STATE\_TRANSITIONED (optional, if state changes)

### **Stall \+ Recovery Checklist**

1. DS\_EVALUATED (STALL)  
2. UNIT\_REQUESTED  
3. STALL\_ISSUED  
4. STATE\_TRANSITIONED → STALLED  
5. STABILIZE\_ASSIGNED (target grade)  
6. DS\_EVALUATED (ALLOW)  
7. Resume happy path

### **Exit Checklist (Grade X)**

1. DS\_EVALUATED (ALLOW)  
2. EXIT\_READY  
3. STATE\_TRANSITIONED → EXIT\_READY  
4. EXITED  
5. STATE\_TRANSITIONED → COMPLETE

---

**End of Arcanum Vitae — Reference Event Log Walkthrough (Happy Path \+ Stall \+ Exit)**

