# **The Arcanist**

## **Audit & Validation Harness**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Auditors, Builders, Governance, System Architects

**Transparency Note:** Some earlier uploaded reference files have expired in this environment (expected system behavior). This audit harness is derived from the locked Arcanist canons and implementation documents and does not depend on expired files. If you want audits to compare against earlier draft PDFs, please re-upload those references.

This document defines the **audit and validation harness** for the Arcanist specialization. It specifies sampling strategies, replay procedures, invariant checks, violation taxonomies, and governance triggers.

This harness is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Arcanum Vitae — Specialization-Wide Invariants Canon  
* Arcanum Vitae — Cross-Specialization Mastery Paths Canon  
* The Arcanist — Master Canon  
* The Arcanist — System Responsibilities & Invariants Canon  
* The Arcanist — Procedural Systems Canon  
* The Arcanist — Generator & Module Mapping  
* The Arcanist — Constraint Bundle Specification  
* The Arcanist — State Machine Specification

---

## **I. Audit Objectives**

The Arcanist audit harness must verify:

1. **Epistemic safety** (no truth/certainty authority)  
2. **Non-hierarchy compliance** (no status or rank emergence)  
3. **Consent and exit integrity** (reversible engagement)  
4. **Deterministic replay** (seed, bundle, policy version)  
5. **Non-interference** (no effect on Core Vitae progression)

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

* no truth claims  
* no certainty language  
* no epistemic superiority cues  
* no identity labeling  
* IA binding present and singular

### **Tier 2 — Replay & Determinism**

Validate:

* seed registry can reproduce SGU byte-for-byte (or canonical hash)  
* policy version recorded and replay-consistent  
* kernel\_refs stable under versioning rules

### **Tier 3 — Cross-Specialization & System Safety**

Validate:

* no subsumption of Philosopher coherence  
* no bypass of Illusionist distortion checks  
* no override of specialization-wide invariants  
* no interference with Core Vitae PC

---

## 

## 

## **III. Sampling Strategy**

Audits must sample across:

* practitioners (random \+ risk-weighted)  
* time windows (daily/weekly/monthly)  
* bundle types (epistemic kernel sets)  
* state transitions (ACTIVE→STALLED, ORIENTING→ACTIVE)

Recommended minimum:

* 1% of all units generated  
* 100% of all STALL events

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

### **A. Epistemic Safety Checks**

* **EPI-1:** No truth declarations  
* **EPI-2:** No certainty scoring language  
* **EPI-3:** No superiority or “advanced” framing  
* **EPI-4:** No metaphysical claims presented as facts

### **B. Consent & Autonomy Checks**

* **AUT-1:** Orientation consent present  
* **AUT-2:** Exit always available  
* **AUT-3:** No obligation language

### **C. Identity Non-Binding Checks**

* **ID-1:** No identity assignment  
* **ID-2:** No status or title generation

### **D. Non-Interference Checks**

* **NI-1:** Core Vitae PC unchanged  
* **NI-2:** Tempus bypass not possible

---

## **VI. Violation Taxonomy (Arcanist)**

Severity classes:

* **S1 (Soft):** stylistic drift, minor ambiguity  
* **S2 (Moderate):** suggestive certainty, interpretive pressure  
* **S3 (Hard):** truth claims, authority cues, identity labeling  
* **S4 (Critical):** systemic replay divergence, policy bypass

Key reason codes:

* `ARC_TRUTH_CLAIM`  
* `ARC_CERTAINTY_LANGUAGE`  
* `ARC_SUPERIORITY_CUE`  
* `ARC_IDENTITY_LABEL`  
* `ARC_POLICY_BYPASS`  
* `ARC_REPLAY_DIVERGENCE`  
* `ARC_CORE_INTERFERENCE`

---

## **VII. Governance Triggers**

### **Trigger G-ARC-1 (Protective Stall)**

If:

* 3+ S2 violations in 7 days, or  
* any S3 violation

Action:

* stall specialization for practitioner  
* require re-orientation

### **Trigger G-ARC-2 (System Pause)**

If:

* any S4 violation, or  
* 1% sampled units are S3

Action:

* pause Arcanist generation globally  
* require policy rollback or patch

---

## **VIII. Compliance Report Template (Arcanist)**

Each audit run must output:

* sample size and selection method  
* violation counts by severity  
* top reason codes  
* replay determinism success rate  
* recommended corrective actions  
* governance actions taken (if any)

---

## **IX. Canonical Assertion**

If the Arcanist implementation cannot be deterministically replayed, cannot be audited, or permits truth/certainty authority, it is invalid.

This harness defines the **minimum viable audit system** for the Arcanist specialization.

---

**End of The Arcanist — Audit & Validation Harness**