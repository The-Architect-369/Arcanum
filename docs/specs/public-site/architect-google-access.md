# Architect Google sign-in and Updates candidate

Prepared November 8, 2026 against main `49ac7380c45f5bf8cf836a53c13de737be9d7d67`. Implementation candidate, not deployed or accepted.

The initial Updates candidate used four server-rendered navigation views. The November9 follow-up uses five: Feed, App, Roadmap, Website and History. Entries open individual detail pages. The public A18/version34 manifest and accepted homepage bytes are unchanged. Journeys is paused and untouched. This is not a new PWA or notification subscription feature.

## Access boundary

The designated owner selected by the Human is `the-architect@the-arcanum.net`. Configure this exact address as `ARCHITECT_GOOGLE_EMAIL`; do not allow the whole domain. The candidate pins Auth.js/next-auth `5.0.0-beta.32` for Next15 compatibility; deployment still requires live integration review. Auth.js validates Google OIDC, then the application requires exact email, `email_verified === true`, a nonempty Google subject, and the matching Workspace hosted-domain claim. Session reads reapply the policy. Google tokens are not exposed in browser session data. One-hour encrypted JWT sessions use host-only cookies; no cross-subdomain cookie domain is configured. Disabling credentials or changing the allowlist denies access to the review page. Rotate AUTH_SECRET to invalidate all existing sessions.

Only the fixed `https://architect.the-arcanum.net` production origin may handle Google OAuth. Route handlers and sign-in/sign-out server actions check the origin/host. Auth.js handles CSRF/state/PKCE/OIDC validation; no custom password or token grant is added. The public device gate is not authentication and cannot grant review access.

Private pages and auth routes receive private/no-store headers and are excluded from the service-worker cache. The cache version changes to retire prior shell caches. The review page contains no testing APK or download link; no artifact is copied into public assets, bundles or the repository.

Sign-in grants read-only review access only, never repository writes, deployment, agent execution or constitutional authority. The public Architect informational page remains separate from private review.

## Secure activation prerequisites

The selected Vercel project returned no environment variables during the November 8 metadata-only check. No client ID/secret or auth secret was retrieved or created by this implementation. No working Google login is claimed.

1. Create or select an OAuth **web application** client in the Human-controlled Google Cloud project. Confirm the project and consent-screen audience before changing provider settings. For a Workspace-only application use its internal audience where applicable.
2. Register the exact redirect URI `https://architect.the-arcanum.net/api/auth/callback/google`. Use identity scopes only: openid, email, profile. No Drive, Gmail, Calendar or offline refresh access is requested by this website.
3. Store AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET and a cryptographically random AUTH_SECRET in the hosting provider’s secure environment settings. Set AUTH_URL to `https://architect.the-arcanum.net` and ARCHITECT_GOOGLE_EMAIL to the Human-selected exact address. Never paste secrets into chat or commit them. Preview credentials and callback URLs need a separately selected trusted preview origin; arbitrary preview hosts are denied by this candidate.
4. Review the source/index candidate and authorize adoption/deployment to the existing Arcanum project. This record grants no merge or publication effect.
5. Verify real Google login, rejection of a second Workspace user and an unrelated account, logout, expired/tampered cookies, copied URLs on sibling hosts and logged-out cache behavior on the S26. Automated synthetic sessions are not Google login proof.

## Mobile access to local builds

The Human separately requested an authorized owner-only path from local builds while away on the S26. A bounded owner-only Drive transfer can satisfy that interim need using existing Workspace authentication, without exposing a workstation port, installing a daemon, or placing an APK in public assets. Its actual file identity/permissions and checksum readback belong in the owner-local transfer journal, not this public repository. Do not publish its private file URL or infer that the website OAuth connection is configured.

A private website download later requires an authenticated server-side byte path/private object store, authorization on every request, private/no-store response headers, fixed artifact/digest binding and no public/signed-link bypass. That separate delivery feature is withheld in this candidate.

## November 9 — follower experience

The Human selected a mostly static development-following web experience, updated editorially as development changes. The classic app’s five-destination footer (Hope, Tempus, Nexus, Wallet, Vitae) supplies the navigation pattern only. Its accounts, balances, notification badges and application behavior are not reused as public Updates capabilities.

Feed is the default dated thread. App explains the approved public artifact and its available/conditional/unavailable capabilities. Roadmap presents anticipated blocks with statuses and next gates, without dates or release commitments. Website preserves the web editorial journal. History groups the selected record by month. Every destination has a text label; mobile navigation uses a five-position bottom dock with safe-area spacing, while desktop navigation stays above the content. Original latest/updates query URLs remain aliases. Entries retain individual detail pages.

Capability copy is bound to the reviewed public version/source. Changing the release listing to a different source without updating its reviewed summary shows a review-needed message rather than silently applying old capability claims. Anticipated work does not promote private candidates or activate any feature. This pass adds no comments, reactions, accounts, subscriptions, notifications or new PWA installation behavior. Its follower experience and release-intake workflow can be extended after separate design/verification.

## Mobile preview revision — three destinations and an Updates PWA

Later Human direction reduced the primary navigation to Updates, App and Ahead. Website notes and prior dated entries are retained behind `/updates/archive`, not a primary tab. Older query URLs redirect or alias to the corresponding new surface. No source-history purge or scheduled deletion is authorized; redundant local drafts can be reviewed separately after the new experience is accepted.

The Human requested remote review on the S26 and an installable mobile-first Updates experience. This authorizes preparation and a protected preview deployment of this candidate on the existing Arcanum Vercel project, not a main merge or production-domain replacement. Record exact pushed source and deployment identities in the owner-local preview journal and reconcile any ambiguous provider result before retrying. Preserve Vercel preview protection; do not create bypass links or change account permissions to work around it. Vercel Authentication is separate from the website’s Google sign-in.

The scoped Updates PWA uses a separate manifest (`/updates/manifest.webmanifest`), app identity/start path `/updates`, standalone display, existing icons and the `/updates-sw.js` worker registered with scope `/updates`. It does not change the original `/manifest.json`, app modules or general app worker registration. Preview name is “Arcanum Updates Preview,” distinct from the final production-origin installation. Metadata allows zoom, and three labeled destinations form the mobile bottom dock.

The Updates worker saves public editorial pages and immutable build assets, with bounded caches and network-first editorial reads. A plain offline fallback and freshness warning are included. The worker excludes private pages, APIs, APKs, signed-release metadata and cross-origin URLs. Provider login wrappers cannot replace the cached app shell. Native browser install prompting is offered only when the browser exposes it; otherwise browser-menu instructions are shown. No fabricated installed state or notification permission is added.

Local fixtures/HTTP checks are not proof of Chrome/S26 installability, standalone launch, offline behavior or touch/readability. Those require the Human’s remote device review. A preview installed from its Vercel hostname is a separate origin/app from the later production site. Keep access protection and first-run cookie behavior visible during testing.
