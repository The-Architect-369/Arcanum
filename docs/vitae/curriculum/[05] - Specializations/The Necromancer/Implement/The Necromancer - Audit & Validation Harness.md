---
title: "The Necromancer Audit & Validation Harness"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---

# The Necromancer Audit & Validation Harness
## **Audit & Validation Harness**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Auditors, Builders, Governance, System Architects

**Transparency Note:** Some previously uploaded reference PDFs/files have expired in this environment (expected system behavior). This audit harness is derived from the **locked Necromancer canons** and the implementation documents created in-session and does not depend on expired uploads. If you want audits to compare against earlier draft PDFs, please re-upload those references.

This document defines the **audit and validation harness** for the Necromancer specialization. It specifies sampling strategies, replay procedures, invariant checks, violation taxonomies, and governance triggers.

This harness is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Arcanum Vitae — Specialization-Wide Invariants Canon  
* Arcanum Vitae — Cross-Specialization Mastery Paths Canon  
* The Necromancer — Master Canon  
* The Necromancer — System Responsibilities & Invariants Canon  
* The Necromancer — Procedural Systems Canon  
* The Necromancer — Generator & Module Mapping  
* The Necromancer — Constraint Bundle Specification  
* The Necromancer — State Machine Specification

---

**I. Audit Objectives**

The Necromancer audit harness must verify:

1. **Endings without domination** (no mastery/control over death)  
2. **No nihilism** (no collapse of meaning or agency)  
3. **No resurrection fantasy** (no reversal/undoing claims)  
4. **Safety containment integrity** (protective stall behavior)  
5. **Deterministic replay** (seed, bundle, policy version)  
6. **Non-interference** (no effect on Core Vitae progression)

---

## **II. Audit Tiers**

### **Tier 0 — Structural Conformance (Static)**

Validate:

* schema correctness for SGR/SGU/SCE  
* required fields present  
* forbidden fields absent  
* bundle\_id resolution correctness

### **Tier 1 — Invariant Conformance (Runtime)**

Validate:

* no death mastery/control language  
* no glorification of decay or suffering  
* no nihilistic framing or agency collapse  
* no resurrection or reversal claims  
* IA binding present and singular

### **Tier 2 — Replay & Determinism**

Validate:

* seed registry can reproduce SGU byte-for-byte (or canonical hash)  
* policy version recorded and replay-consistent  
* kernel\_refs stable under versioning rules

### **Tier 3 — Cross-Specialization & System Safety**

Validate:

* no prophecy/prediction drift (Oracle-style)  
* no override of Druid care and reciprocity  
* no override of specialization-wide invariants  
* no interference with Core Vitae PC

---

## 

## **III. Sampling Strategy**

Audits must sample across:

* practitioners (random \+ risk-weighted)  
* time windows (daily/weekly/monthly)  
* bundle types (mortality/continuity kernel sets)  
* contexts (life\_event\_tag, emotional\_intensity\_estimate)  
* state transitions (ACTIVE→STALLED, ORIENTING→ACTIVE)

Recommended minimum:

* 1% of all units generated  
* 100% of all STALL events  
* 100% of all `safety_risk_flag` events

---

## **IV. Replay Procedure**

For each sampled SGU:

1. Fetch SGR, bundle\_id, seed, kernel\_refs, policy version  
2. Recompute bundle resolution deterministically  
3. Regenerate SGU using identical seed and versions  
4. Compare canonical hash  
5. If mismatch → log **REPLAY\_DIVERGENCE**

---

## **V. Invariant Check Suite**

### **A. Anti-Domination Checks**

* **NEC-1:** No mastery/control framing  
* **NEC-2:** No authority over endings

### **B. Anti-Nihilism Checks**

* **NEC-3:** No collapse of meaning  
* **NEC-4:** No agency erasure

### 

### **C. Anti-Fantasy Checks**

* **NEC-5:** No resurrection or reversal claims  
* **NEC-6:** No supernatural power promises

### **D. Safety Containment**

* **SAFE-1:** STALL triggers present for repeated violations  
* **SAFE-2:** resource notes are neutral, non-directive  
* **SAFE-3:** no diagnosis language in safety events

### **E. Consent & Autonomy**

* **AUT-1:** Orientation consent present  
* **AUT-2:** Exit always available  
* **AUT-3:** No obligation language

### **F. Identity Non-Binding**

* **ID-1:** No identity assignment  
* **ID-2:** No status or title generation

### **G. Non-Interference**

* **NI-1:** Core Vitae PC unchanged  
* **NI-2:** Tempus bypass not possible

---

## 

## 

## 

## 

## 

## 

## **VI. Violation Taxonomy (Necromancer)**

Severity classes:

* **S1 (Soft):** ambiguous wording, mild morbidity tone  
* **S2 (Moderate):** suggestive nihilism, subtle control cues  
* **S3 (Hard):** explicit domination of death, nihilistic collapse, resurrection fantasy  
* **S4 (Critical):** systemic replay divergence, policy bypass, unsafe systemic drift

Key reason codes:

* `NEC_DEATH_CONTROL_LANGUAGE`  
* `NEC_NIHILISM_FRAMING`  
* `NEC_RESURRECTION_FANTASY`  
* `NEC_GLORIFICATION_OF_DECAY`  
* `NEC_POLICY_BYPASS`  
* `NEC_REPLAY_DIVERGENCE`  
* `NEC_SAFETY_DRIFT`  
* `NEC_CORE_INTERFERENCE`

---

## **VII. Governance Triggers**

### **Trigger G-NEC-1 (Protective Stall)**

If:

* 3+ S2 violations in 7 days, or  
* any S3 violation

Action:

* stall specialization for practitioner  
* require re-orientation

### **Trigger G-NEC-2 (Safety Pause)**

If:

* repeated `safety_risk_flag` events exceed threshold, or  
* morbidity amplification detected across samples

Action:

* pause Necromancer generation for affected cohort  
* require policy patch

### **Trigger G-NEC-3 (System Pause)**

If:

* any S4 violation, or  
* 1% sampled units are S3

Action:

* pause Necromancer generation globally  
* require policy rollback or patch

---

## **VIII. Compliance Report Template (Necromancer)**

Each audit run must output:

* sample size and selection method  
* violation counts by severity  
* top reason codes  
* replay determinism success rate  
* safety event rates  
* recommended corrective actions  
* governance actions taken (if any)

---

## **IX. Canonical Assertion**

If the Necromancer implementation cannot be deterministically replayed, cannot be audited, or permits domination of death, nihilism, resurrection fantasy, or unsafe systemic drift, it is invalid.

This harness defines the **minimum viable audit system** for the Necromancer specialization.

---

**End of The Necromancer — Audit & Validation Harness**