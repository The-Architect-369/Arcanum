# Public Arcanum website v2

Status: supporting editorial implementation; no constitutional or protocol effect.
Recorded: 2026-09-28.
Baseline: `main@77b59d6a2d0f46f17e6334f2f954472b8dc8b66e`.
Work branch: `work/public-home-v2-20260928`.
Work record: [ARC-55](https://app.notion.com/p/3e92bb4420b88151a37debeeb772891c).

## Purpose and Human direction

Refine the public face of Arcanum before APK publication. Explain what Arcanum
stands for and how its participant interface relates to the developing ARCnet
network. The five featured pillars are an editorial introduction, not a replacement
for the canonical module registry. Public documents retain their individual status,
authority, and amendment channels. Public visibility alone does not ratify a draft.

## Experience

The home introduces the project and five pillars. The vision, pillar overview,
TEMPUS, HOPE, Vitae, ARCnet, MANA, principles, journal, and download status each have
a distinct URL. Navigation follows scrolling and offers a mobile disclosure menu,
keyboard focus, skip link, reduced motion support, and browser zoom.
Public routes do not mount app wallet synchronization, service-worker registration,
or install prompts. Existing alpha routes retain their runtime and device gate.

TEMPUS receives a prominent time/place/meaning illustration and a dedicated page.
The illustration is conceptual; it does not depict current astronomical positions.
Examples are labeled design illustrations. No reflection collection, token offer,
protocol participation, APK download, or installation flow is introduced.

## Editorial source audit

Public source links are pinned to the baseline above so future canon edits do not
silently change the provenance of this copy. A later editorial revision must review
and advance that pin deliberately.

| Topic              | Controlling or supporting sources                                                        | Treatment                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Arcanum / ARCnet   | System overview, canonical modules, layer boundaries                                     | Human interface distinct from network and protocol; Pre-Genesis remains explicit.                               |
| TEMPUS             | Temporal Model, TempusAnchor contract; draft TEMPUS module                               | Factual context distinct from personal meaning; no coercive timing or location prerequisite.                    |
| HOPE               | Canonical modules, native HOPE contract, conversation-memory contract; draft HOPE module | Reflective support with consent; private interiors excluded from Architect memory by default.                   |
| Vitae              | Overview, constitution, curriculum index                                                 | Stability before recognition; no ranking of human worth or grades awarded by the website.                       |
| MANA               | Economic Constitution, Treasury Constitution, governance specification                   | Utility and value exchange; no unratified rates, automatic yield, token sale, or live economy claim.            |
| Principles         | Identity, dignity/content boundaries, temporal and layer doctrine                        | Human agency, harm-based boundaries, bounded governance, reviewable changes.                                    |
| Manifesto / themes | Manifesto outline, metaphysical neutrality                                               | Manifesto identified as a developing outline; symbolism does not establish scientific claims or enforce belief. |

This is a targeted editorial source audit, not certification of every repository
document or of a live public ARCnet implementation. Draft module text supplies
explanatory context only where consistent with controlling doctrine and canon.

## Machine-readable dated log

`/site-log.json` and `/updates` share the same editorial entries. The JSON includes a
schema identifier, dates, source repository, editorial base, build commit when Vercel
provides it, and an explicit authority boundary. The v2 entry says
`included-in-this-build`, so a preview does not claim a production deployment.
It is not a TempusAnchor, protocol receipt, or trusted APK update manifest.
The response requires revalidation; the service worker bypasses its cache for this
path. No distribution-origin or A14 verifier policy is changed.

## Verification and next conversation

Use Node 24 and the pinned pnpm 9.10.0. Run the frozen install, lint, typecheck,
production build, CE-W01, deterministic repo-index verification (including merge
stability), and the full verify-sync gate. Against the production server, run
`node scripts/verify-public-site.mjs http://127.0.0.1:3000`. Visually review desktop
and mobile navigation, persistent header, source links, and release status.

Source changes require their deterministic index-only companion. The PR is the
review and CI record; a branch preview is not production adoption. A normal merge
to main automatically deploys production and needs the applicable merge authority.

APK publication is paused by Human priority. A14.1 remains integrated; A14 is open
and A15 remains blocked. Do not build, sign, publish, or install an APK merely to
complete this website task. Resume the artifact/distribution gate separately after
the public-site review. Preserve the Ubuntu draft, its preservation copy, and the
historical stash. Great Journey remains an independent project.

For continuity, begin with ARC-55, this document, the PR's exact head/base/checks,
and the current main/deployment. Reconcile evidence before further source edits.

## 2026-09-30 distribution reconciliation

The Human Architect subsequently authorized A14.2 build and publication. PR69
merged the candidate identity and PR70 published the independently inspected
version19 APK. The earlier paused-publication instruction above records the
2026-09-28 website scope; it is superseded for this authorized download-page
correction. The download page now offers the exact inspected development
candidate with its checksum, signer, source/build and update-manifest links.
The existing PWA manifest remains separate. Production release readiness, A15
installation/recovery, and chain-live compatibility remain gated.

Audience-tone source located on Atman: `Documents/Codex/2026-08-01-new-realtime-voice-chat/arcanum-hero-copy-and-voice-draft.md`. The Human Architect requested adoption of its “Look up” direction in this session. It remains editorial guidance, not doctrine or proof of implemented features. Home hero, shared tagline, vision introduction and download invitation use active, concrete language and preserve voluntary participation. Consequential download facts and status boundaries stay explicit.

The website source tranche was reconciled with merged PR71's conditional A14
milestone before canonical adoption. The public invitation and APK availability
do not remove the A15 installation/recovery or chain-integration gates recorded
there. The reconciliation receives a fresh deterministic source/index companion.
