# Architect portal — first read-only build

Human-authorized implementation packet r1, November 10, 2026. Source: Ambassador turn `01a1c512-47ca-7640-9291-2ad0100e945f`; packet SHA-256 `9298c6895771147c49b3fe95a6414f6abba6dc88afde9a86e3e56e1c534aa12a`. Build/selected-record reconciliation/protected preview are authorized. This is not production adoption, new viewer enrollment, private-library publication, provider migration, paid provisioning or a new execution service.

## Surfaces and access

Now, Projects and Timeline reuse Current's composed stationary frame, blue rounded cards, gold, readable type and shared modal. Timeline is an editable first-build label, not a canonical identity. Hierarchy is domain → project → milestone → dated snapshots. Existing Era/Wave/Arc labels are retained only where sourced. Previous accepted milestones remain accessible; source progress does not create doctrine or action rights.

The Architect root redirects to protected review. Each review/API/RSC request validates the exact origin, Auth.js Google identity and fresh enrollment store. Google identifies; enrollment authorizes. The real store initially contains only the Human-selected owner. Synthetic viewer fixtures test the future explicit-viewer model; no real viewer is enrolled by this build. The designated owner retains the verified exact Workspace email/hosted-domain checks; a nonempty verified Google subject is required and can be pinned in the owner entry. Other viewers require an explicit exact subject/email binding. A null owner subject is the existing exact-verified-owner bootstrap policy, not a domain-wide grant. Active state and enrollment version are checked per request, so revocation/version change denies an existing cookie on the next authorization check. Sessions remain short-lived and host-only.

Only basic `openid email profile` is requested. No Drive/Gmail/Calendar access, database migration or experimental provider is activated. Sign-out uses Auth.js and fixed redirect paths. API exposes no member registry, raw source files or private attachments. All enrolled viewers see all shared overviews; first-build resource links are restricted to selected public project resources. Restricted evidence requires its own future attachment guard and is not served here.

Protected HTML/API/RSC responses are no-store/noindex. Public workers exclude Architect/auth/API namespaces. No private record is placed in browser storage, static assets or the repository. On page hide/return, connectivity loss and visible refresh, the client hides retained private content pending a fresh authorization check. A failed authorization/network check removes the displayed corpus. No claim of secure erasure of previously delivered browser memory is made. The UI reads snapshots every minute while visible; this is not a workstation daemon, scheduled provider crawl or live event publisher.

## Selected record pipeline

`model.ts` validates a strict versioned schema: stable event/source/project/milestone IDs, source order/version, observed/event/ingestion times, status class, scope, audience, source digest/ref and next gate. Unknown/private fields and non-shared audiences are rejected. Reported/observed/implemented/tested/Human accepted/adopted/publicly released/blocked/unknown stay distinct. Accepted milestone selection and active work are separate; old snapshots are retained.

`scripts/architect/ingest-portal.mjs` reads only an explicit allowlist of absolute file paths with expected SHA-256, known adapter kind, source order and version. It does not discover directories, execute source text, dispatch work or publish anything externally. Atomic writes and an exclusive lock protect the owner-local store. Stable event replay deduplicates; changed content on an existing event is retained as a conflict instead of replacing the original. Failed sources preserve previous records and last success. Store update time is an ingestion attempt, not proof of a new source observation.

The first real local selection comprises Herald Current preview/publication receipts; an observed public34 listing; sanitized native qualification and Hub report; Human-reported home-node direction; and an observed unchanged WWW baseline. A later actual portal build receipt can be added after its checks pass. Raw source directories, Sites v8, private Hope/Journey/Finance, device identifiers and private library interiors are not ingested. The separate existing ChatGPT Site and its audience/history are untouched.

The selected native receipt binding was reconciled with Hub and independently checked: substantive source, indexed build head and the index-only companion remain distinct fields. Exact private artifact/source coordinates and receipt digests stay in the owner-local selection, not this public source document. Dated isolated technical evidence does not certify present phone bytes. Installation/opening may remain Human-reported while visual/full construction acceptance is open. Historical qualification-time main is not used as current main.

## Persistence, transport and honest preview

Local storage is a private file outside the checkout/public assets, configured by `ARCHITECT_STORE_PATH`; it contains enrollment and selected events and is read anew per request. Serverless preview cannot reach that workstation file. The supported remote interface is a selected HTTPS JSON endpoint configured by `ARCHITECT_STORE_URL` plus server-only `ARCHITECT_STORE_TOKEN`, with no redirects, no-store fetch, timeout and strict schema. That endpoint must be an approved durable authorization/read-model source independent of an asleep workstation. No such transport is configured by this build. If that authorization service is unavailable, access fails closed; an unreachable upstream ingestion source can instead preserve the already stored authorized evidence.

`/architect/preview` exists only when the platform marks the deployment as preview. It renders a conspicuously labelled synthetic fixture, never the configured real store. It has no auth bypass, real API payload or active refresh masquerading as a live feed. Production returns404. The existing Vercel preview protection is preserved; no share bypass URL is created. Real local ingestion and authenticated-policy testing are separate from this visual fixture.

## Google activation steps

Provider metadata was inspected without secret values: no project environment variables were configured. The connected tools do not manage Google OAuth clients; browser connection setup also failed in this workspace. Actual Google identity exchange is therefore a Human setup/device gate, not a passed fixture test.

1. Select the exact existing Google Cloud OAuth application/project and configure a Web client for basic identity only. Do not create a new project or submit broad consent verification under this packet.
2. For protected preview, register the **verified stable branch origin** callback `/api/auth/callback/google`. Its exact URL is returned in the owner-local handoff. Preview `AUTH_URL` and `ARCHITECT_PREVIEW_ORIGIN` must match each other and Vercel's trusted `VERCEL_BRANCH_URL` origin. No wildcard suffix/random preview origin is accepted. Production retains only `https://architect.the-arcanum.net`.
3. Enter client ID/secret, a strong Auth.js secret, designated owner address, fixed origin and approved private store transport directly into scoped secure Vercel settings; do not paste credentials into chat or put them in Git. Do not set production variables/publication from this first-build request.
4. Verify actual owner login, non-enrolled refusal, logout/expiry/revocation and cross-host cookies on the intended phone. Exact membership removal must be reflected in the fresh private registry, not merely a deployment-time allowlist.

## Passkey decision

The installed Auth.js Google foundation is retained. [Auth.js Passkey documentation](https://authjs.dev/getting-started/providers/passkey) still calls its WebAuthn provider experimental and not production-recommended, and requires an adapter/Authenticator storage. No suitable durable credential store or recovery model is established here, so a portal-enrolled passkey is not enabled and no fake biometric action appears.

A Google-account passkey is a different path controlled by Google. [Google's guidance](https://developers.google.com/identity/passkeys) explains that the device may use fingerprint, face or PIN; server credential metadata is not a biometric template. Future portal passkeys require explicit stable subject/RP/origin binding, one-use challenge storage, verification, revocation and Google-backed recovery, with no unauthenticated recovery bypass. No user enrollment/device biometric interaction is performed by this build.

## Gates and verification

Test schema minimization, replay/conflict/order/history, failed source preservation, per-request membership/revocation, direct API/HTML/RSC/alias protection, wrong/expired/forged sessions, sign-out/CSRF, no-store and public-worker exclusions. Test actual selected ingestion separately from fixtures. Check portrait/landscape/desktop, enlarged text, modal/Back/Escape/focus, final-line spacing and public Current regression. Exact source/index/head, results and screenshots belong in the owner-local first-build handoff. Local signed-session tests are not real Google login; visual preview is not production or Human acceptance. No production merge/publication is granted here.
