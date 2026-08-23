---
title: "Tempus × Vitae Live Phase Audit"
status: design-candidate
visibility: public
last_updated: 2026-08-23
phase: Pre-Genesis
authority: non-canonical research evidence
---

# Purpose

Test whether Tempus can enter the current Tree / vibration research as an independent live context coordinate without becoming a schedule, advancement mechanism, recognition input, musical modulator, or causal cosmology.

# Repository access posture

Repository access is provided for this audit.

Controlling evidence includes:

- `docs/specs/modules/tempus-context-schema.md`;
- `docs/architecture/registries/tempus-vitae-becoming-field-registry.v0.1.json`;
- `docs/architecture/registries/vitae-grade-cycle-registry.v0.1.json`;
- `docs/architecture/registries/vitae-tree-transformation-operator-registry.v0.1.json`;
- the current articulation/timbre projection research.

This audit changes no canon, runtime authority, recognition, MANA policy, Identity rule, governance rule, or Tempus advancement rule.

# 1. Source constraints

The canonical-draft Tempus schema gives the decisive boundary:

```text
TempusContext records the moment.
It does not interpret the human.
```

A Vitae practice session may attach Tempus context, but Tempus must not produce readiness, worth, advancement, or recognition.

The Vitae grade-cycle registry independently defines:

```text
360 indexed positions per grade
10 class sectors × 36 positions
10 grades
3,600 total intended Core Vitae positions
```

and explicitly rejects:

```text
one section = one day
one section = one zodiac degree
time causes advancement
section position causes recognition
```

Therefore any live field must preserve two independent clocks:

```text
Tempus changes because time changes.
Vitae changes only because a participant or recorded practice event changes the Vitae coordinate.
```

# 2. Prototype boundary

The new renderer is:

```text
docs/architecture/renderings/tempus-vitae-live-phase-field-v0.1.html
```

Its supporting registry is:

```text
docs/architecture/registries/tempus-vitae-live-phase-projection.v0.1.json
```

The first default Tempus cycle is deliberately modest:

```text
local civil-day phase
= seconds since local midnight / 86,400
```

This uses only device-local time.

The prototype does **not** claim to compute:

- lunar phase;
- zodiac position;
- planetary day or hour;
- ritual windows;
- astronomical ephemerides;
- readiness;
- destiny.

Therefore the live coordinate is called `TempusPhaseCoordinate`, not a complete `TempusContext`.

# 3. The first torus model passes only as a presentation envelope

The earlier becoming-field registry proposed the normalized mathematical product:

```text
S¹Tempus × S¹Vitae
```

which admits a torus visualization.

The live render reveals an important refinement.

Tempus may be treated as continuously changing phase for presentation.

Vitae is not semantically continuous.

The registered Vitae state is:

```text
grade_section_index ∈ {1, 2, ..., 360}
```

and it changes only through explicit participant navigation or a recorded practice event.

Therefore the more accurate semantic state space for one grade is:

```text
S¹Tempus × C360Vitae
```

where `C360` means the 360 indexed cyclic presentation positions of one grade.

The torus remains useful as the continuous **presentation envelope**:

```text
presentation envelope = S¹ × S¹
semantic state        = S¹ × C360
```

For the ten-grade Core Vitae structure, the current research model becomes:

```text
S¹Tempus
× {grade 1..10}
× C360Vitae
```

with the existing ten-turn spiral available as a separate visualization.

Candidate law:

> **The Torus Is an Envelope, Not the State Machine.**

# 4. Continuous geometry must not imply continuous advancement

A visually smooth torus can accidentally imply that Vitae moves gradually merely because time passes.

That implication is false under the source registries.

Persisted Vitae state must remain snapped to registered coordinates.

Interpolation is permitted only for visual legibility.

Candidate law:

> **Continuous Geometry Must Not Imply Continuous Advancement.**

This law generalizes beyond the torus. Any future spiral, field, animation, waveform, or transported-frame rendering must preserve the difference between:

```text
visual interpolation
and
semantic state transition
```

# 5. Pause / rest test

The primary falsification test is:

```text
fix Vitae at section N
allow Tempus to move
```

Required outcome:

```text
Tempus phase changes
Vitae section remains N
recognition remains unchanged
authority remains unchanged
no debt or lateness appears
```

In the phase-square view, this becomes:

```text
Tempus →

──────────────→

Vitae remains fixed
```

At Tempus wrap:

```text
0.99 → 1.00 → 0.00 → 0.01
```

Vitae must remain fixed.

Therefore:

> **Temporal Wrap Is Not Curriculum Return.**

and:

> **Pause Is a Valid Trajectory.**

The live renderer includes an accelerated wrap test specifically to expose violations of this invariant.

# 6. The history trajectory is hybrid, not diagonal

The render produces a more useful model for participant history.

If Tempus is plotted on x and Vitae on y:

```text
rest / silence / ordinary time
→ horizontal movement

explicit Vitae event
→ discrete vertical change at that moment
```

Conceptually:

```text
Tempus →

Vitae  ───────────────┐
                      │ explicit event
                      └───────────────┐
                                      │ explicit event
                                      └──────────────→
```

This is not a forced diagonal progress trajectory.

It is a hybrid system:

```text
Tempus = continuous / regularly sampled
Vitae  = discrete / event-driven
```

Candidate law:

> **Continuous Time, Eventful Becoming.**

This is a stronger interpretation of the Human Architect's original intuition that participation should synchronize with Tempus.

The safe meaning of synchronization is not:

```text
time moves
therefore curriculum moves
```

It is:

```text
a voluntary curriculum event occurs
inside a factual temporal context
and the pair may be remembered together
```

# 7. Relative phase remains descriptive only

The renderer can compute a wrapped difference between normalized phases:

```text
delta = ((tempus - vitae + 0.5) mod 1) - 0.5
```

This number is allowed only as geometric/descriptive metadata.

It must never be labeled:

- aligned;
- misaligned;
- ahead;
- behind;
- early;
- late;
- auspicious;
- inauspicious;
- optimal.

There is no score.

Candidate law:

> **Relative Phase Is Descriptive, Not Evaluative.**

# 8. Tempus must not modulate the Tree operator

The previous transformation grammar defined:

```text
Vertical   → frequency trajectory
Horizontal → stereo trajectory
Diagonal   → both
```

and the articulation audit added replaceable timbre coloration as another independent perceptual axis.

This audit intentionally gives Tempus **no audio control**.

Tempus may timestamp the event.

Tempus may be rendered around the event.

Tempus may not alter:

- V/H/D operator identity;
- operator pitch trajectory;
- stereo trajectory;
- articulation class;
- synthetic timbre proxy;
- musical carrier;
- recognition;
- authority.

Candidate law:

> **Context May Move Around the Operator; It May Not Rewrite the Operator.**

This is the temporal equivalent of the earlier carrier/operator firewall.

# 9. Full TempusContext is deliberately deferred

The live render could have tried to display zodiac, lunar, or planetary state.

It does not.

That restraint is architecturally important.

The source schema requires deterministic context capture and notes an implementation fix before replay-sensitive records are trustworthy.

Therefore the current renderer uses only a factual civil-day phase that the browser can derive directly.

A later prototype may accept a real `TempusContext` object as input, but it should not fabricate one.

Candidate law:

> **Render Only the Context You Actually Have.**

# 10. Accessibility test

The prototype provides:

```text
torus view
phase-square view
dual-ring view
plain-text view
```

The phase square is particularly important because it communicates the product relation without requiring 3D geometry.

Plain text includes:

- Tempus cycle;
- Tempus phase;
- Vitae grade;
- Vitae section;
- Vitae class station;
- relative phase;
- explicit `score: none`;
- explicit `readiness: none`;
- explicit `recognition effect: none`.

The first render revision exposed an accessibility defect: `prefers-reduced-motion` did not stop the live point from beginning in motion.

The prototype was corrected so reduced-motion preference starts the Tempus display frozen until the participant explicitly activates it.

Disposition:

```text
plain-text equivalent       PASS
geometry-light equivalent   PASS
reduced-motion default      PASS after correction
audio independence          PASS
human comprehension         requires user testing
```

# 11. Falsification matrix

| Test | Result | Reason |
|---|---|---|
| Tempus can move while Vitae is fixed | PASS | independent coordinates and controls |
| Tempus wrap forces Vitae movement | REJECTED | explicit invariant |
| Vitae moves automatically with clock | REJECTED | explicit event-only control |
| Torus can visualize both cycles | BOUNDED PASS | presentation envelope only |
| Torus is the semantic state machine | FAIL | Vitae is discrete |
| Relative phase may be shown | BOUNDED PASS | description only |
| Relative phase may score readiness | FAIL | forbidden by Tempus/Vitae boundaries |
| Tempus may alter Tree audio operator | FAIL | operator firewall |
| Civil-day phase may be rendered | PASS | factual local-device derivation |
| Prototype may fabricate full TempusContext | FAIL | unsupported data |
| Rest/silence may produce a valid trajectory | PASS | Tempus moves, Vitae remains fixed |
| Reduced-motion user must watch live animation | FAIL | corrected to frozen default |

# 12. Architecture after this audit

The emerging information grammar is now:

```text
IDENTITY / HUMAN
      │
      │ sovereign participation
      ▼
VITAE DISCRETE STATE
      │
      │ explicit event
      ▼
TREE RELATION / OPERATOR
      │
      ├── optional articulation/timbre projection
      ├── optional musical carrier projection
      │
      └── factual timestamp/context attachment
                    │
                    ▼
                 TEMPUS
          independent moving context
```

A captured event can therefore be described as:

```text
what curriculum coordinate was active
+
what typed transformation was occurring
+
what factual temporal context surrounded it
```

without allowing the third term to command the first two.

# 13. What this says about “the becoming field”

The becoming field survives this audit, but in a narrower and stronger form.

It is not a force that advances the participant.

It is not a cosmological score.

It is not a new sovereign module.

It is a query and rendering field over independently owned coordinates:

```text
where the participant chose to be in Vitae
+
when the event occurred in Tempus
+
which optional perceptual projections make the relation legible
```

The strongest current formulation is:

> **Co-observation creates context without creating causation.**

# 14. Next gate — transported ARCnet frame

The live phase projection now passes the structural gates required before adding the outer ARCnet geometry.

The next bounded experiment should place the stable eight-system ARCnet stellar frame at a captured point on the Tempus-Vitae field.

Required invariants:

```text
system identities stay fixed
authority boundaries stay fixed
Edge Contract requirements stay fixed
Identity remains sovereign
Tempus does not activate systems
Vitae does not unlock systems
geometric position does not grant permissions
```

Only visual position, selected faculty/path, and captured context may vary.

Candidate law already established in the becoming-field registry:

> **Transport the Frame; Do Not Rewrite the Frame.**

# Final disposition

The live Tempus × Vitae field **passes as a bounded co-observation architecture** with one major refinement:

```text
Torus = continuous presentation envelope
Vitae = discrete event-driven state
Tempus = independently moving context
```

The strongest new law from the render is:

> **Continuous Time, Eventful Becoming.**

The next experiment may therefore add the transported ARCnet stellar frame without granting Tempus, Vitae, geometry, sound, or symbolic correspondence any new authority.
