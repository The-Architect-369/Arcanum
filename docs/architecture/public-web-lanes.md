---
title: "Public website, updates, Journeys, and Architect"
status: implementation-candidate
visibility: public
last_updated: 2026-10-07
---

# Four public web destinations

The Human Architect requested three connected public destinations in the October 7,
2026 workspace conversation, then added `architect.the-arcanum.net` and explicitly
accepted a public development dashboard with future architect sign-in. This
candidate starts from canonical main
`6b5a69febba492b9e157628ef512f0de22ca3486`. It does not establish deployment,
change the approved Android release, or open A19.

| Destination | Role | Candidate implementation |
| --- | --- | --- |
| `the-arcanum.net` | Main public introduction | Existing homepage; Vercel redirects `www` here with HTTP 308. |
| `updates.the-arcanum.net` | Releases and development history | Only `/` rewrites to `/updates`, which combines the current release, canonical change history links, and preserved website journal. Installation details stay at `/download`. |
| `journeys.the-arcanum.net` | Great Journey entry point | Only `/` rewrites to `/journeys`, a reusable public shell and clearly marked pilot outline. |
| `architect.the-arcanum.net` | Public development status | Only `/` rewrites to `/architect`, a dated view grounded in public repository sources. |

All four use the existing Vercel `arcanum` project. Exact-host rules run before
filesystem routing. Existing paths, APIs, static assets, desktop gates and signed
update coordinates retain their behavior. The hostname is a presentation choice,
not a security boundary. Each lane links back to Arcanum; navigation between lanes
uses explicit public URLs. Local previews can inspect `/download` and `/journeys`.

## DNS and mail observations

During this conversation, the Human added Journeys and updated the `www` record
in Squarespace. Removing the website preset temporarily removed the root address
record; the Human restored it. Subsequent Google and Cloudflare DNS reads both
returned root A `216.198.79.1`. HTTPS returned 200 for root, Journeys and updates;
`www` returned 308 to `https://the-arcanum.net/`. These are dated observations,
not a continuing availability guarantee. The assistant did not mutate DNS.

The Human subsequently added Architect to the same project. Connector readback
showed the hostname verified, and an HTTPS probe returned 200 with the existing
main homepage before this candidate's routing changes. Adding a Vercel hostname
does not publish or migrate the separately hosted ChatGPT Sites dashboard.

Google DNS also returned MX `1 smtp.google.com.`, SPF
`v=spf1 include:_spf.google.com ~all`, and a public DKIM key at
`google._domainkey.the-arcanum.net`. `_dmarc.the-arcanum.net` returned NXDOMAIN.
Published DKIM does not prove outgoing signing is enabled. No email was sent,
received or inspected, and no mail-policy change was made. Follow-up: review
DMARC setup and verify actual delivery separately. Google guidance:
[MX](https://support.google.com/a/answer/6156494),
[SPF](https://support.google.com/a/answer/33786),
[DKIM](https://support.google.com/a/answer/174124).

## Journey scope and next gates

The Human selected The Great Journey as a bounded parallel subsystem, with a
Colorado Springs Tesla-themed pilot and reusable blocks. The public candidate
contains only a proposed five-part outline, not a verified travel itinerary or
evidence that anyone has completed a pathway. Personal Journey records and private
workspace links are excluded. No accounts, bookings, affiliate links, rewards,
or private reflection capture are introduced.

Next: source and review the pilot's historical claims, locations, access and
practical details; prepare disclosed affiliate links only for approved programs;
review and release, then maintain through content blocks. Arcanum development
remains the priority. This web work does not change the participant permissions
proposal, A19 storage scope, A20 navigation scope or Agent C research conditions.

## Architect dashboard boundary

The existing Sites dashboard contains dated provider observations and private
workspace destinations. This candidate exposes a selected public development view
with repository evidence links; it does not copy private provider contents or change
the Sites dashboard's workspace audience. The requested future chain-backed sign-in
and architect access control is recorded as direction, not an implemented check.
Before adding controls, specify authenticated identity, scoped appointments,
revocation and server-side authorization. Titles, grades and wallet connections
must not independently confer execution authority. No privileged action endpoint
is added by this candidate.

The Human's follow-up clarified that Architect should show state, tested
capabilities, direction and next work directly; the main website is the visual
introduction; updates offers a deeper release/development record; Journeys carries
Arcanum outward into experience. The candidate incorporates that division and
retains explicit links between the four destinations. Capability summaries retain
both passing results and their tested limits, including the failed advisory alias.

The Human further described Architect as both the founder/builder and an inclusive
path others may take. The public invitation supports early private creation and
reviewed shared responsibility. Symbolic identity, artwork and recognition do not
grant execution rights or establish a worth hierarchy. The founder is not presented
as the only possible architect.

## Verification and recovery

`scripts/verify-public-site.mjs` runs against the built production server. It checks
desktop/mobile host routing, similar-host rejection, existing routes and gates,
and byte equality of the release listing, manifest and APK. The APK digest must
still match its approved listing. Full repository checks are reported separately;
test definitions alone do not establish a pass.

The app-level change is reversible by reverting its source commit and generating
the repository index companion. No DNS changes are required to revert these
landing pages. Merge and production adoption remain separately evidenced effects.

## Main website visual refresh — 2026-10-07

The Human subsequently requested time to consider the relationship between the
four destinations, and selected the main public website for a visual refresh
without changing its information. That narrows the immediate presentation work;
it does not approve a new cross-site information architecture. Earlier candidate
updates and Architect summaries remain separately reviewable in this branch.

The approved Hope–Architect concept supplies the blue/gold palette. The shared
public shell carries fine orbital decoration, clearer surfaces and a collapsible,
vertically stacked navigation on desktop and mobile. The existing emblem is
unchanged. The artwork is labeled as a concept; imagined scenery is not a factual
astronomical scene, implemented interface, credential or authority claim.

Selected asset: `apps/web/public/art/hope-architect-v2.png`, 1672 × 941 PNG.
SHA-256: `c7d366d76508ca173f6b904fd6d31cf49cac7a53c3581d644b7eb5b7387ca8ae`.
The built-in image-generation tool produced the illustration and a focused
revision of Hope's face and brunette hair using Human-supplied references. The
Human accepted the revised image in this conversation. The original photographs
are not included in the repository. The edit preserved the approved composition,
Architect, costume, landscape and blue/gold style; it introduced no text or logo.

Motion is optional presentation: a short page entrance, subtle section arrival,
and a reading-progress line. There is no forced scroll snapping, wheel handling,
automatic advance, or content gate. Reduced-motion preference disables these
animations. Browsers without scroll-timeline support retain ordinary scrolling;
content remains visible without JavaScript. Menu links retain ordinary link
semantics, Escape returns focus to the toggle, and selecting a link closes it.

Verification compares headings and body text on the ten original public content
pages before and after styling. Existing TEMPUS illustration content is retained
lower on the homepage. The new concept caption is additional image context.
Production route checks include the exact public image and its optimized response,
so the older desktop alpha gate cannot silently block the artwork. Neither that
asset exemption nor the menu grants access to gated application routes.

Observed local verification on October 7: Windows Chrome headless, driven through
Playwright against the Ubuntu production build, rendered the desktop (1440 px)
and mobile (390 px) layouts. Ten pages retained identical heading/body text, with
no horizontal overflow. Menu stacking, link navigation, outside-click dismissal,
Escape/focus return and keyboard entry passed. The image loaded, the reading
indicator reached the page end, reduced-motion disabled animation, and content
remained visible with JavaScript disabled. No browser page errors were recorded.
This replaces the earlier browser-tool startup limitation for this local review;
it is not device certification or verification of a production deployment.
