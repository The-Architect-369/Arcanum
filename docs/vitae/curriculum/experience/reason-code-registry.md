---
title: "Reason Code Registry"
status: draft
visibility: internal
last_updated: 2026-02-18
description: ""
---


# Reason Code Registry
## **Reason Code Registry & Risk-Flag Mapping Table (Vitae-Wide)**

**Status:** Canonical · Internal · Implementation Reference

**Audience:** Builders, system architects, implementers, auditors

This document defines a **Vitae-wide registry** of:

* **Reason Codes** used by the Dependency Evaluator (DE)  
* the corresponding **Risk Flags / Signals** that set those codes  
* deterministic thresholds that classify each grade state as **OK / DEGRADED / UNKNOWN**  
* the recommended **Recovery Mode**: REVIEW vs STABILIZE

**Transparency note:** Some older uploaded reference files have expired in this environment (expected). This registry is derived from the sealed Grade I–X canons and implementation stacks already produced in-canvas. If you want perfect alignment with earlier draft nomenclature, re-upload those draft files later and we can reconcile names without changing semantics.

This registry is subordinate to:

* Arcanum Vitae — Cross-Grade Dependency Enforcement Specification  
* Arcanum Vitae — Dependency Evaluator Blueprint (DE \+ DS \+ RR)  
* Grade Audit Harnesses (I–X)

---

## 

## 

## 

## 

## **I. Global Taxonomy**

### **A. Reason Code Format**

`G{grade}.{DOMAIN}.{CODE}`

Examples:

* `G6.BOUNDARIES.SAVIOR_DRIFT`  
* `G9.NONINTERVENTION.ADVICE_LEAK`  
* `SYS.EVIDENCE.INSUFFICIENT`

### **B. State Classification (Deterministic)**

A grade is:

* **OK** when: no active STABILIZE/STALLED, risk flags within ceilings, sufficient evidence  
* **DEGRADED** when: risk ceilings exceeded OR repeated drift events OR unresolved STABILIZE/STALLED  
* **UNKNOWN** when: insufficient evidence OR missing logs OR version mismatch

### **C. Recovery Mode (Deterministic)**

* **UNKNOWN → REVIEW** (evidence building)  
* **DEGRADED → STABILIZE** (repair protocol)

---

## 

## 

## 

## 

## 

## 

## **II. System-Level Reason Codes (All Grades)**

| Reason Code | Trigger / Risk Flag | State | Recovery Mode | Notes |
| ----- | ----- | ----- | ----- | ----- |
| `SYS.EVIDENCE.INSUFFICIENT` | `evidence_window_missing=true` OR fewer than K events in window | UNKNOWN | REVIEW | Protective default |
| `SYS.LOGS.MISSING_DS` | generation/advance event lacks DS attachment | UNKNOWN | REVIEW → may escalate | If systemic, becomes HARD FAIL |
| `SYS.VERSION.MISMATCH` | policy hash/graph version missing or inconsistent | UNKNOWN | REVIEW | Requires migration |
| `SYS.INTEGRITY.BYPASS_DETECTED` | dependency enforcement bypass attempt | DEGRADED | STABILIZE → HARD FAIL | Governance escalation |

---

## 

## 

## 

## 

## 

## 

## 

## **III. Grade-by-Grade Registry**

**Implementation note:** “Risk flags” below are canonical conceptual fields. Builders may name actual variables differently, but MUST preserve semantics.

### **Grade I — The Guardian (Continuity & Self-Government)**

| Reason Code | Risk Flags / Signals | State | Recovery Mode | Deterministic Threshold |
| ----- | ----- | ----- | ----- | ----- |
| `G1.CONTINUITY.BREAKDOWN` | `continuity_breaks_count` high, repeated resets without self-correction | DEGRADED | STABILIZE | ≥3 breakdowns in T=21d |
| `G1.SELFCORRECTION.EXTERNAL_DEPENDENCE` | user requires repeated prompting; `self_correction_rate` low | DEGRADED | STABILIZE | below floor for window |
| `G1.PACING.BYPASS_ATTEMPT` | Tempus overrides attempted | DEGRADED | STABILIZE → HARD FAIL if systemic | any occurrence |
| `G1.EVIDENCE.INSUFFICIENT` | insufficient events | UNKNOWN | REVIEW | \<K events |

### 

### 

### 

### 

### 

### 

### 

### **Grade II — The Seeker (Mind Stabilization)**

| Reason Code | Risk Flags / Signals | State | Recovery Mode | Threshold |
| ----- | ----- | ----- | ----- | ----- |
| `G2.STABILITY.REACTIVITY_SPIKE` | `reactivity_risk` rising; volatility markers | DEGRADED | STABILIZE | ≥2 spikes in 21d |
| `G2.COGNITION.RUMINATION_LOOP` | `rumination_risk` sustained | DEGRADED | STABILIZE | sustained ≥7d |
| `G2.ATTENTION.FRAGMENTATION` | `attention_fragmentation` high | DEGRADED | STABILIZE | above ceiling |
| `G2.EVIDENCE.INSUFFICIENT` | missing logs | UNKNOWN | REVIEW | \<K |

### **Grade III — The Disciple (Discipline without Rigidity)**

| Reason Code | Risk Flags / Signals | State | Recovery Mode | Threshold |
| ----- | ----- | ----- | ----- | ----- |
| `G3.DISCIPLINE.RIGIDITY_DRIFT` | `rigidity_risk` high; inflexibility signals | DEGRADED | STABILIZE | above ceiling |
| `G3.PERFORMANCE.PUNISHMENT_LOOP` | self-punishment language detected frequently | DEGRADED | STABILIZE | ≥3 events |
| `G3.PACING.OVERCONTROL` | compulsive pacing attempts; `control_compulsion` high | DEGRADED | STABILIZE | sustained |
| `G3.EVIDENCE.INSUFFICIENT` | insufficient evidence | UNKNOWN | REVIEW | \<K |

### **Grade IV — The Mystic (Meaning without Inflation)**

| Reason Code | Risk Flags / Signals | State | Recovery Mode | Threshold |
| ----- | ----- | ----- | ----- | ----- |
| `G4.MEANING.INFLATION_RISK` | meaning narratives escalating; `meaning_inflation_risk` high | DEGRADED | STABILIZE | above ceiling |
| `G4.CLOSURE.CERTAINTY_SPIKE` | “final understanding” signals; `closure_risk` high | DEGRADED | STABILIZE | ≥2 spikes |
| `G4.IDENTITY.SPIRITUAL_SUPERIORITY` | superiority cues detected | DEGRADED | STABILIZE | any occurrence |
| `G4.EVIDENCE.INSUFFICIENT` | insufficient evidence | UNKNOWN | REVIEW | \<K |

### 

### 

### 

### 

### 

### 

### 

### 

### 

### **Grade V — The Scholar (Open Mind, Non-Rigidity)**

| Reason Code | Risk Flags / Signals | State | Recovery Mode | Threshold |
| ----- | ----- | ----- | ----- | ----- |
| `G5.KNOWLEDGE.DOGMA_DRIFT` | `dogma_risk` high; doctrine language | DEGRADED | STABILIZE | above ceiling |
| `G5.THINKING.OVERCONFIDENCE` | certainty about models; `certainty_risk` rising | DEGRADED | STABILIZE | above ceiling |
| `G5.META.ARGUMENT_COMPULSION` | debate compulsion; `argument_drive` high | DEGRADED | STABILIZE | sustained |
| `G5.EVIDENCE.INSUFFICIENT` | insufficient evidence | UNKNOWN | REVIEW | \<K |

### 

### 

### 

### 

### 

### 

### 

### 

### 

### 

### 

### **Grade VI — The Healer (Care with Boundaries)**

| Reason Code | Risk Flags / Signals | State | Recovery Mode | Threshold |
| ----- | ----- | ----- | ----- | ----- |
| `G6.BOUNDARIES.SAVIOR_DRIFT` | savior framing detected; `savior_risk` high | DEGRADED | STABILIZE | any occurrence |
| `G6.DEPENDENCY.LOOP_RISK` | continuous intervention; `dependency_loop_risk` high | DEGRADED | STABILIZE | repeated cycles w/o withdraw |
| `G6.BURNOUT.LOAD_EXCEEDED` | `burnout_risk` \>= threshold; load ceilings hit | DEGRADED | STABILIZE/REST | threshold reached |
| `G6.CONSENT.SCOPE_BYPASS` | scope/consent gate bypass attempt | DEGRADED | STABILIZE → HARD FAIL if systemic | any |
| `G6.EVIDENCE.INSUFFICIENT` | insufficient evidence | UNKNOWN | REVIEW | \<K |

### 

### 

### 

### 

### 

### 

### 

### 

### 

### **Grade VII — The Alchemist (Ethical Transformation)**

| Reason Code | Risk Flags / Signals | State | Recovery Mode | Threshold |
| ----- | ----- | ----- | ----- | ----- |
| `G7.TRANSFORM.SCOPE_CREEP` | scope expanded without reset; `scope_creep_risk` high | DEGRADED | STABILIZE | any occurrence |
| `G7.ROLLBACK.AVOIDANCE` | missing rollback plan / avoidance patterns | DEGRADED | STABILIZE | any occurrence |
| `G7.STAGING.SKIP_ATTEMPT` | stage order violations | DEGRADED | STABILIZE → HARD FAIL if systemic | any |
| `G7.ACCELERATION.CHAINING` | execute loops; `chain_counter` limit breached | DEGRADED | STABILIZE/REST | limit breach |
| `G7.EVIDENCE.INSUFFICIENT` | insufficient evidence | UNKNOWN | REVIEW | \<K |

### 

### 

### 

### 

### 

### 

### 

### 

### 

### **Grade VIII — The Sage (Integration without Authority)**

| Reason Code | Risk Flags / Signals | State | Recovery Mode | Threshold |
| ----- | ----- | ----- | ----- | ----- |
| `G8.AUTHORITY.PASSIVE_DOMINANCE` | authority cues in tone/UI; `authority_signal_risk` rising | DEGRADED | STABILIZE | any occurrence |
| `G8.CLOSURE.FINAL_SYNTHESIS` | closure language; `closure_risk` high | DEGRADED | STABILIZE | any occurrence |
| `G8.DETACHMENT.SUPERIORITY` | detachment elevation; `detachment_risk` high | DEGRADED | STABILIZE | above ceiling |
| `G8.CHALLENGEABILITY.BYPASS` | challengeability gate bypass attempt | DEGRADED | STABILIZE → HARD FAIL if systemic | any |
| `G8.EVIDENCE.INSUFFICIENT` | insufficient evidence | UNKNOWN | REVIEW | \<K |

### 

### 

### 

### 

### 

### 

### 

### 

### **Grade IX — The Oracle (Perception without Prediction)**

| Reason Code | Risk Flags / Signals | State | Recovery Mode | Threshold |
| ----- | ----- | ----- | ----- | ----- |
| `G9.PREDICTION.FORECAST_LEAK` | prediction language detected | DEGRADED | STABILIZE → HARD FAIL if systemic | any |
| `G9.NONINTERVENTION.ADVICE_LEAK` | advice/guidance detected | DEGRADED | STABILIZE → HARD FAIL if systemic | any |
| `G9.CERTAINTY.INEVITABILITY` | inevitability framing; `certainty_risk` above LOW | DEGRADED | STABILIZE | any |
| `G9.AUTHORITY.KNOWER_CUES` | authority signaling; `authority_signal_risk` rising | DEGRADED | STABILIZE | any |
| `G9.EVIDENCE.INSUFFICIENT` | insufficient evidence | UNKNOWN | REVIEW | \<K |

### 

### 

### 

### 

### 

### 

### 

### 

### **Grade X — The Adept (Freedom, Exit Integrity)**

| Reason Code | Risk Flags / Signals | State | Recovery Mode | Threshold |
| ----- | ----- | ----- | ----- | ----- |
| `G10.EXIT.DISCOURAGED` | UI/copy discourages exit; retention cues | DEGRADED | STABILIZE → HARD FAIL if systemic | any |
| `G10.DEPENDENCY.PROMPT_RELIANCE` | rising prompt reliance; `dependency_risk` \>= MED | DEGRADED | STABILIZE | threshold reached |
| `G10.DOMINATION.INFLUENCE_CUES` | superiority / domination cues; `domination_risk` \> LOW | DEGRADED | STABILIZE | any |
| `G10.ATTACHMENT.SYSTEM_BOND` | system attachment; `system_attachment_risk` high | DEGRADED | STABILIZE | above ceiling |
| `G10.TRANSCENDENCE.ARRIVAL_NARRATIVE` | enlightenment/arrival narratives in outputs | DEGRADED | STABILIZE → HARD FAIL if systemic | any |
| `G10.EVIDENCE.INSUFFICIENT` | insufficient evidence | UNKNOWN | REVIEW | \<K |

---

## 

## 

## 

## **IV. Threshold Constants (Recommended Defaults)**

These constants make DE deterministic across implementations.

* **K (event window):** 50 events per grade  
* **T (time window):** 21 days rolling  
* **Spike definition:** risk flag above ceiling twice within 21d  
* **Sustained definition:** risk above ceiling for ≥7 consecutive days  
* **Any-occurrence flags:** authority, prediction, advice, exit discouragement, domination (single event triggers DEGRADED)

All constants MUST be versioned:

* `DE.v1.constants_hash`

---

## **V. Mapping to DS and RR**

### **A. DS Population**

For each required grade:

* set `state` from deterministic rule  
* populate `reasons[]` with one or more reason codes above

### **B. RR Selection**

* Choose **lowest grade** among failed dependencies, weighted by tier severity  
* Mode:  
  * UNKNOWN → REVIEW  
  * DEGRADED → STABILIZE

---

## 

## 

## 

## **VI. Audit Requirements**

Audit harness must verify:

* DE uses only reason codes from this registry  
* reason codes correspond to logged risk flags  
* constants hash matches stored evaluator version  
* replay reproduces identical reason codes and DS states

Any unregistered code or non-deterministic mapping → HARD FAIL.

---

## **VII. Canonical Assertion**

If an implementation:

* uses this registry exclusively  
* maps risk flags deterministically to states and RR  
* versions constants and reproduces under replay

Then it is compliant with the **Arcanum Vitae — Reason Code Registry & Risk-Flag Mapping Table**.

If not, the runtime is invalid.

---

**End of Arcanum Vitae — Reason Code Registry & Risk-Flag Mapping Table**
