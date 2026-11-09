# Updates visitor experience — preview candidate

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
