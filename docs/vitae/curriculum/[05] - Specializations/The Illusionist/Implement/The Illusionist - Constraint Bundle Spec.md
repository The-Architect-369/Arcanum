# **The Illusionist**

## **Constraint Bundle Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

**Transparency Note:** Some previously uploaded reference PDFs/files have expired in this environment (expected system behavior). This specification is derived entirely from the **locked Illusionist canons** and the existing implementation mappings. If you want alignment against older drafts, please re-upload those references.

This document defines the **constraint bundles** used by the generator to produce valid Illusionist specialization units. Constraint bundles ensure perceptual hygiene without granting interpretive authority, superiority, or claims of truth.

This specification is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Arcanum Vitae — Specialization Overview Codex  
* Arcanum Vitae — Cross-Specialization Mastery Paths Canon  
* The Illusionist — Master Canon  
* The Illusionist — System Responsibilities & Invariants Canon  
* The Illusionist — Procedural Systems Canon  
* The Illusionist — Generator & Module Mapping

---

## **I. Constraint Bundle Purpose**

An **Illusionist Constraint Bundle (ICB)** is a deterministic, immutable set of constraints resolved at generation-time. Every Generated Unit (SGU) must bind to **exactly one** ICB.

The ICB ensures that:

* perception is examined without interpretation,  
* distortion is observed without correction,  
* awareness does not become superiority,  
* truth claims are structurally impossible.

---

## **II. Bundle Composition**

Each ICB consists of the following components:

### **A. Perceptual Kernel Set**

* One or more **perceptual hygiene kernels** (fixed authored content)  
* Kernels must:  
  * frame perception as partial and conditioned  
  * invite noticing rather than analysis  
  * avoid any implication of seeing “through” others

---

### **B. Observation-Only Prompt Grammar**

* Bounded prompt templates that:  
  * invite noticing sensations, thoughts, or narratives  
  * prohibit interpretation or diagnosis  
  * avoid cause-and-effect claims

---

### **C. Prohibited Superiority & Truth List**

Explicitly forbidden within any SGU:

* claims of insight superiority  
* "awakening" or "seeing the truth" language  
* labeling distortions in others  
* interpretive conclusions  
* identity formation via perception (e.g., "you are more aware than…")

Any violation invalidates the unit.

---

**D. Internal Agreement (IA) Binding**

* Exactly **one** IA is bound per bundle  
* IA enforces:  
  * humility of perception  
  * consent-first engagement  
  * reversibility of observation

---

### **E. Functional Outcome Targets**

* Each bundle must target **at least one** Illusionist FO  
* FO targets must describe capacities of noticing, not insight achievements

---

## **III. Bundle Resolution Rules**

At generation time:

1. SPC perception axis is read  
2. Applicable perceptual kernels are selected  
3. Observation-only prompt grammar is instantiated  
4. Prohibited superiority/truth list is enforced  
5. IA and FO targets are attached  
6. Seed is issued and recorded

Failure at any step → bundle rejection → regeneration or stall

---

**IV. Determinism & Replay**

* Every ICB is identified by a unique `constraint_bundle_id`  
* Bundle resolution is deterministic given:  
  * SPC  
  * kernel versions  
  * policy version  
  * seed

This guarantees full replay and audit reproducibility.

---

**V. Violation Handling**

If a Generated Unit violates bundle constraints:

* the unit is rejected  
* regeneration is attempted (bounded retries)  
* repeated failures trigger specialization stall

No human override is permitted.

---

## **VI. Cross-Specialization Safety**

Illusionist constraint bundles must not:

* override Philosopher coherence safeguards  
* grant epistemic authority conflicting with Arcanist humility  
* impose correction or instruction

All cross-specialization conflicts defer to the **Policy Engine**.

---

## **VII. Canonical Assertion**

If a constraint bundle permits perceptual superiority, interpretive authority, or truth claims, it is invalid.

This specification defines the **only valid constraint bundle structure** for the Illusionist specialization.

---

**End of The Illusionist — Constraint Bundle Specification**

