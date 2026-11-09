# Architect Google sign-in and Updates candidate

Prepared November 8, 2026 against main `49ac7380c45f5bf8cf836a53c13de737be9d7d67`. Implementation candidate, not deployed or accepted.

Updates uses four server-rendered navigation views: Latest, Updates, Website and History. Entries open individual detail pages. The public A18/version34 manifest and accepted homepage bytes are unchanged. Journeys is paused and untouched. This is not a new PWA or notification subscription feature.

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
