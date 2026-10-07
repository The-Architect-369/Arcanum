---
title: "Public pillar orbit preview"
status: implementation-candidate
visibility: public
last_updated: 2026-10-07
---

# Public pillar orbit preview

At canonical base `7a98d86c22dc18be2af78f4c5ea422878d909f58`, the Human
requested a five-card carousel in place of the three-over-two public pillar grid,
and specifically requested reuse of the earlier web application's work. The
bounded target is `PillarCards`, shared by the homepage and Explore page. This began
as a preview for review; the Human subsequently authorized merge and publication
when the revised interactions and verification are ready. The earlier publication
grant was already executed and is not the basis of this new authorization.

## Reuse and presentation

The existing `BentoShowcase.tsx` supplies the cyclic next/previous convention and
50px gesture threshold. Its wraparound calculation is extracted into a small
shared helper used by both the old showcase and this public component; its
existing presentation is otherwise unchanged. The public carousel adapts the
vertical-first swipe convention found in `TabMenuPager.tsx` and `SwipeRoutes.tsx`
without importing their app-route navigation or app-only state.

The central decorative seed uses the origin and six unit neighbors of the
existing Flower lattice in `arcnet-spatial-architecture.v0.2.json`. Five editorial
pillar cards orbit that motif; they are not five canonical lattice nodes and make
no new semantic mapping, network connection or authority claim. Current card
symbols remain unchanged. The Human requested distinct pillar symbols as a
separate design, preview and approval step.

The Human's follow-up requests refine the preview into a perspective orbit tilted
15 degrees: one complete foreground card, partially faded neighbors, and two
faint rear cards passing behind the decorative center. The shared carousel keeps
its original ordering. Selection and swipes rotate the ring along its circular
path; there is no automatic advance. Cards remain upright and reduced-motion
users receive the same positions without animated transitions.

Homepage cards link to `/explore#pillar-<slug>`. Explore selects that pillar and
opens its detail dialog. Clicking a card while already on Explore opens the same
dialog without leaving the page. The dialog reuses the existing title,
introduction and implementation-status wording, with a link to the full module
page. Escape, the close button and a backdrop click dismiss it; focus returns to
the selected card. Named selectors remain underneath. Previous/next arrows flank the foreground
card; the visible name-and-count label is removed, with a screen-reader status
announcement retained.

The visible list switch is removed after the Human preferred the orbit and
requested publication when verified. The named selectors and step arrows provide
a non-spatial selection path. Only the foreground card takes pointer events or
focus; faded cards are decorative previews and cannot intercept a mobile tap.
Server-rendered and JavaScript-disabled access still retains all five ordinary
links. No-JavaScript homepage links reach the corresponding Explore card, whose
link continues to the full module. No dialog depends on new editorial claims.

The original five titles, themes, summaries and destinations are reused from
`public-site.ts`. No native behavior, economics, permissions, personal records,
release descriptor or domain configuration changes are included.

## Explore page transitions

Explore has three proximity scroll stops: the introduction, the orbit, and the
wider-constellation section. Native browser scrolling stays available, including
within sections taller than the viewport; no wheel or touch events are captured
for snapping. Reduced-motion disables snapping. The final section reuses the
Nexus diamond glyph from `ModuleDeckReveal.tsx` as decoration, without adding a
new module route or claiming a newly approved symbol.

## Verification observed on October 7

The Node 24 production build, frozen install, lint, typecheck and CE-W01 spec
checks passed. The built local server passed all 50 public route, host, device
classification, artwork and unchanged Android release checks.

Chrome desktop (1440px) and narrow viewport (390px) checks passed for perspective
placement, named selection, cyclic navigation, horizontal-versus-vertical gesture
handling, all five dialogs and module destinations, Escape/focus return, scroll
unlock, reduced motion and absent horizontal overflow. The actual homepage →
selected Explore dialog → full HOPE page path passed. With JavaScript disabled,
all five linked cards remain available and a native pointer click navigated to
the full HOPE page. No browser page errors were observed. These are desktop Chrome
viewport tests, not physical-phone or cross-browser certification.

Publication requires the exact source/index candidate's repository and GitHub
checks, followed by production deployment readback and live route/interaction
verification. This pre-publication record does not claim those later outcomes.
