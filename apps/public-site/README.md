# Arcanum public site

Static public-facing download home for the proposed `the-arcanum.net` site. It is separate from the transitional application at `apps/web` and the private Architect dashboard.

Vercel project configuration: import the existing Arcanum repository as a **new project**, set Root Directory to `apps/public-site`, Framework Preset to **Other**, and Output Directory to `.` (or leave its default when it resolves to this root). Preview the deployment before attaching the custom domain.

The page intentionally has no APK download link. Before enabling one, verify the exact signed APK, checksum, signer, provenance, immutable URL, and direct unauthenticated response under the approved A14.2 release procedure. Keep the machine update origin separate; do not use this page as its manifest endpoint. Domain DNS cutover and production publication have their own review gate. Preserve existing Google Workspace MX, SPF, DKIM, and DMARC records.

Local preview: `python3 -m http.server 8000 --directory apps/public-site` from the repository root, then visit `http://localhost:8000/`.
