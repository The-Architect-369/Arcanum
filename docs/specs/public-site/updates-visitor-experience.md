# Arcanum Current visitor experience — preview candidate

## November 9 r3 walkthrough reconciliation

Human approved the accumulated revision in Ambassador turn `01a1bfb5-9caf-7d72-ba4a-ac73d9b66de5`. Packet SHA-256: `b099a41bb4f5dfb158e17011669fde3cfe14a25600873ed2371b1f2652ead3d6`. The existing candidate/preview authority remains; production/native releases and private resources are outside this revision.

One opaque rounded header now contains a centered reusable provisional Arcanum / The Current lockup and the active tab title/subtitle. The public emblem remains provisional; native-logo provenance is still unresolved. On short narrow/enlarged-text screens the header’s own section text can scroll to preserve reading space. No title is layered into the moving cards. Coming next uses “See what’s taking shape.” / “Follow the work across Arcanum.” with the same visuals and framing as Updates.

Tabs stay mounted, preserving filters, device choice and per-tab reading positions during in-app tab navigation. Horizontal touch swipes move in Updates → Available → Coming next order without wrapping. A distance/direction threshold rejects vertical intent; controls, open panels, selection and screen edges are excluded. Tap and keyboard links remain equivalent navigation. The active Updates retap returns to newest matching entries. The header explicitly returns to newest Updates. No carousel animation is needed; reduced motion remains respected.

No selected public build screenshots accompany the dated records. Consistent application/network/web topic icons are used instead, explicitly described as topic icons rather than product screenshots. No mock product demonstration or private media is generated or published.

Available retains reviewed Android prose and uses one dropdown, with native availability visible in option labels. Only the chosen platform or Current web-app content is rendered. Change selection returns focus to the chooser. Installation instructions stay inside this panel; no second dialog is stacked on the package panel.

An application-owned installation invitation appears on arrival without requesting a browser prompt or notification permission. Its dismissal is stored under `arcanum.current.install-invite.v1` on the current origin; blocked storage preserves dismissal for the current mounted visit only. Detectable standalone/iOS standalone or appinstalled hides the invitation; absence of detection is not a claim that no installation exists. An eligible browser prompt is only invoked by a click, otherwise the action opens installation help. Permanent access is Available → Arcanum Current — web app. Phones and computers are covered, preview/public origins remain separate, and existing installed-name refresh remains browser-controlled. Official help: [Chrome](https://support.google.com/chrome/answer/9658361), [Safari on Mac](https://support.apple.com/104996). No login, notification request, follower account or alert service is added. The Updates-only worker is registered on arrival and keeps its private/API/APK exclusions.

This r3 section supersedes conflicting r2 presentation below. Human physical-device/visual acceptance remains pending; exact checks/source/head/deployment belong in the handoff.

## November 9 r2 reconciliation (retained history)

Human approved the revised visitor direction in Ambassador turn `01a1bf79-a571-7493-8af8-7d61dd3a6c00`. Packet SHA-256: `26248ba40a7c446b94457e8fda753428cd81f419a12bf17ca1bf29769f602450`. This supersedes the r1 presentation described below where specified; it grants no production promotion or native release change.

Arcanum Current is the public development web app; Arcanum retains the native application name; ARCnet means Arcanum Network. Current uses a dedicated stationary header, no website menu, three fixed tabs, one deep canvas/blue card/gold accent system, and a shared accessible modal component. Header and active Updates tab return to the newest matching posts without leaving Current. Detail/archive pages retain this frame. A compact sticky Updates title sits above collapsible search and filters. The filter controls scroll within their bounded area. On a very short, narrow reading area (including extreme enlarged text), the section title scrolls with content to preserve access to reading; the app header and tray remain stationary.

Available is one Arcanum package opening a platform-choice panel. Availability is stated before expansion. Android leads through requirements, capabilities, release evidence and review/download. Other platforms have no download and a contextual link to wider development; no platform-specific project is fabricated. Coming next groups existing public evidence into The application, ARCnet technology and Web experiences, with purpose, present state, work ahead, next gates and public resources. The private/offline library is not ingested or copied.

**Logo provenance gap:** the current canonical Android manifest declares no dedicated icon and build106 contains no image asset. The preview retains the existing public `apps/web/public/logo-arcanum.svg` emblem; it is not certified as a native-app logo. Exact approved native-logo provenance remains a separate reconciliation gate. No logo is invented or copied from a private source.

The scoped manifest requests Arcanum Current Preview / Current Preview on preview and Arcanum Current / Current on production. Existing app id, start URL, scope and origin separation remain unchanged. Browser-controlled installed-name refresh is not guaranteed; an existing installation may need reinstalling. Existing icons are retained pending the logo gate. Service-worker version changes only its scoped public cache; private/API/APK exclusions remain.

The latest approved release metadata was rechecked live before implementation: version34, source `75cad68cb3733a44b5b13bcea153f2f77dfa7bda`, APK SHA-256 `7113e51f1b12e3c8d40848e1219537b4d757790222629cceb4522375540467f4`. No availability is promoted by an editorial post or preview.

Human visual/physical-device acceptance remains pending. Library reconciliation, unseen badge, follower accounts, email and push remain deferred under the boundaries below.

## Retained r1 record (historical presentation; r2 above controls changes)

Human-approved visitor direction supplied through Ambassador on November 9, 2026. Packet SHA-256: `7ef5d14caefeedcf5b69086785c861eb5267615da6fb2b23259fdaa94622197b`. This document records implementation scope; it grants no production publication, native release promotion, accounts, email, push or governance authority.

## Visitor flow

The brand is Arcanum, with “Follow the developing ARCnet.” ARCnet means the Arcanum Network. Updates is the public window into the network and Arcanum experiences, rather than only an Android release page.

Three primary destinations:

- Updates: “Watch it take shape.” / “The latest from Arcanum and ARCnet.” A newest-first curated published record, human meaning on distinct rounded cards, local search/topic/type/date filters, explicit empty/reset states and progressive older entries. Opening/closing a panel preserves feed state, reading position and focus. Close, Escape and browser Back dismiss panels. Tapping the active Updates tab returns to the newest matching entries at the top while retaining filters and their visible indication.
- Available: “Find your starting point.” / “Explore what you can use today.” One current Android release card, followed by compact expandable “What you can do” and “Your device” groups. Requirements and actual download live with approved release details. Capability prose remains bound to its reviewed artifact. Other platform cards state “No download available” before expansion and do not invent development commitments. Browser reading and the Updates PWA are separate from native package availability.
- Coming next: “See what’s taking shape.” / “A look at the work ahead.” Each rounded card separates intended improvement, actual status and next review. These are not release commitments or promised dates.

The stationary tray remains outside the scrolling region. Its measured height sets content/focus padding so enlarged labels do not hide the final lines. Search stays reachable while reading; expanded filters have a bounded, scrollable control area. Native details/panels may scroll rather than clipping small or enlarged-text screens. Reduced-motion preferences suppress panel animation and smooth top-return scrolling.

Reading the public experience needs neither a follower account nor native app installation. The review preview retains Vercel access protection; this hosting requirement is distinct from future public reading and the separate owner-only Google review area.

## Editorial record and publication cycle

Use real dated records only. This implementation contains the selected existing public development and website entries, not a live provider feed or every historical repository event. No media demonstrations were invented. Search/filter result counts reflect the current matching dataset and are not unseen-post badges.

Each publication cycle separately considers the dated Updates post, Available capability/artifact alignment, and Coming next status. Source integration can leave the approved APK unchanged. Only the applicable release gate can promote a native artifact. Preserve original history and source coordinates behind readable summaries; do not turn an editorial adaptation into doctrine.

## Explicitly deferred following capability

No unseen-post badge, follower account, cross-device seen state, email collection/sending, push registration or notification permission prompt is activated by this preview. Installation is convenient access, not automatic alerts.

The first proposed following feature is a per-browser badge counting genuinely new/unseen **published** posts. It needs a separate bounded functional packet settling:

1. First-visit baseline, newly published versus historical posts, revisions and removed IDs.
2. What actually viewed means for a modal, full page, keyboard and assistive technology; arbitrary navigation must not mark all posts seen.
3. Per-browser persistence, privacy notice/reset, blocked storage, multiple tabs and preview-versus-production origins.
4. Accessible count labels, badge-clearing behavior and durable test fixtures proving no fake counts.

These decisions are proposed requirements, not implemented behaviors or a new alert-service grant.

## Verification and next gate

Verify ordering and progressive loading; search/topic/type/date intersections and resets; modal close/Escape/Back with filter/focus/scroll preservation; active-tab top-return; compact platform availability states; zoom/enlarged text, phone portrait/landscape, desktop, keyboard and reduced motion. Technical checks do not replace Human aesthetic/usability acceptance. Exact source/index/deployment and viewport evidence belong in the completion handoff.
