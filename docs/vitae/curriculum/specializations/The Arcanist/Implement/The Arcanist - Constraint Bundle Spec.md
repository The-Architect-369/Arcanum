---
title: "The Arcanist Constraint Bundle Spec"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# The Arcanist Constraint Bundle Spec
## **Constraint Bundle Specification**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

**Note:** Interpreting “organist and string bundle” as **Arcanist Constraint Bundle Specification** per the active implementation sequence. If a different specialization was intended, say the word and this document will be amended or replaced.

This document defines the **constraint bundles** used by the generator to produce valid Arcanist specialization units. Constraint bundles are the enforceable rule-sets that bind generated content to epistemic safety, ethical non-authority, and auditability.

This specification is subordinate to:

* Arcanum Vitae — Master Constitution & Architecture  
* Arcanum Vitae — Specialization Overview Codex  
* Arcanum Vitae — Cross-Specialization Mastery Paths Canon  
* The Arcanist — Master Canon  
* The Arcanist — System Responsibilities & Invariants Canon  
* The Arcanist — Procedural Systems Canon  
* The Arcanist — Generator & Module Mapping

---

## **I. Constraint Bundle Purpose**

An **Arcanist Constraint Bundle (ACB)** is a computed, immutable set of constraints derived at generation-time. Every Generated Unit (SGU) must resolve to **exactly one** ACB.

The ACB ensures that:

* knowledge remains non-authoritative,  
* inquiry remains open-ended,  
* no truth or certainty claims are possible,  
* identity and status are not formed.

---

## **II. Bundle Composition**

Each ACB is composed of the following components:

### **A. Epistemic Kernel Set**

* One or more **epistemic kernels** (fixed authored content)  
* Kernels must:  
  * frame knowledge as provisional  
  * invite inquiry rather than conclusion  
  * avoid metaphysical or empirical claims of truth

---

### **B. Inquiry Prompt Grammar**

* Bounded prompt templates that:  
  * ask comparative or exploratory questions  
  * avoid evaluative or diagnostic language  
  * never imply correct/incorrect answers

---

### **C. Prohibited Claim List**

Explicitly forbidden within any SGU:

* declarations of truth  
* certainty language (e.g., “is”, “proves”, “means that”)  
* superiority framing (e.g., “more advanced”, “higher understanding”)  
* identity assignment (e.g., “you are the kind of person who…”)

Any violation invalidates the unit.

---

### **D. Internal Agreement (IA) Binding**

* Exactly **one** IA is bound per bundle  
* IA enforces:  
  * epistemic humility  
  * consent-first inquiry  
  * reversibility of engagement

---

### **E. Functional Outcome Targets**

* Each bundle must target **at least one** Arcanist FO  
* FO targets may not be framed as achievements or milestones

---

## **III. Bundle Resolution Rules**

At generation time:

1. SPC state is read  
2. Applicable epistemic kernels are selected  
3. Prompt grammar is instantiated with bounded variables  
4. Prohibited claim list is enforced  
5. IA \+ FO targets are attached  
6. Seed is issued and recorded

Failure at any step → bundle rejection → regeneration or stall

---

## **IV. Determinism & Replay**

* Every ACB is identified by a `constraint_bundle_id`  
* Bundle resolution is deterministic given:  
  * SPC  
  * kernel versions  
  * policy version  
  * seed

This enables full replay and audit verification.

---

**V. Violation Handling**

If a Generated Unit violates bundle constraints:

* the unit is rejected  
* regeneration is attempted (bounded retries)  
* repeated failure triggers specialization stall

No human override is permitted.

---

**VI. Cross-Specialization Safety**

Arcanist bundles must not:

* subsume Philosopher coherence  
* bypass Illusionist distortion checks  
* assert symbolic or metaphysical authority

All cross-specialization conflicts defer to the **Policy Engine**.

---

## **VII. Canonical Assertion**

If a constraint bundle allows truth claims, certainty scoring, or epistemic authority, it is invalid.

This specification defines the **only valid constraint bundle structure** for the Arcanist specialization.

---

**End of The Arcanist — Constraint Bundle Specification**

