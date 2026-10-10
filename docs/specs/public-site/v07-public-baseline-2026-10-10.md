# Public v0.7 baseline — 10 October 2026

The Human Architect selected the preserved v0.7 experience over the later Living Octave experiments, requested a homepage-only menu correction, and authorized bringing that baseline live after verification. This record fixes the release input and bounds subsequent refinement; it does not adopt doctrine or certify application capabilities.

## Selected experience

Seven continuous animated scenes plus the Arcanum return-to-beginning position form the homepage. Discover, Principles, Follow the Work, Journeys and Get the Arcanum move to their respective scenes. Scene actions open panels; only deliberate links inside panels leave the experience. Closing restores focus, selection and position. Footer references also open their relevant panels first; direct links remain available without JavaScript.

The five pillars retain HOPE → TEMPUS → VITAE → MANA → ARCnet. The retained v0.7 narratives are an introductory baseline. Later narrative refinement can cover Home, all five pillars, and Agency / Follow the Work / Journeys. **Download remains a straightforward release-review panel and does not require an eight-beat narrative.**

## Preservation and integration

The original v0.7 files and later experiments remain preserved outside this release. The machine-readable [baseline receipt](v07-baseline-receipt.json) records the original standalone hash, selected source, deployment predecessor, public artifact hashes and preservation checks.

The reviewed SVG and CSS are byte-identical to the selected navigation candidate. The existing standalone renderer is served as the root document through a Next rewrite, after the three hostname-specific landing rules. This avoids translating the approved animation into another renderer. The public asset filenames carry content hashes; future edits must update both filenames, their HTML references and the exact public-route allowlist. Existing application routes and device gates remain separate. Initial scene restoration waits until page load has completed, so the browser’s native fragment scrolling cannot subsequently move a deep link into the previous scene.

Publication adaptations are limited to public metadata, root-relative assets, accurate presentation wording, a no-JavaScript download link, and replacing the unreviewed local Reading Library destination with the existing Principles source page. The dated source checkpoint remains historical. The older deeper pages remain available; their brand uses a normal document navigation back to the standalone homepage.

No unreviewed Reading Library documents, Living Octave replacements, PR #95 reconciliation records, Android changes or economic decisions are imported. Sound is still an optional synthesized sketch, initially silent. Geometry and scripted dialogue are illustrative, not evidence of live model, chain, reflection storage or location access.

## Verification and release

Use the production server for routing and browser checks:

- `node scripts/verify-public-site.mjs http://127.0.0.1:3020` checks hostname routing, public pages, signed download bytes, metadata and device gates.
- `node scripts/verify-v07-browser.cjs http://localhost:3020/ <evidence-directory>` checks the full experience; supply Playwright through `PLAYWRIGHT_MODULE` if it is not installed in the current runtime.
- Run the repository-required install, synchronization, lint, type and production-build gates. Generate the repository index after the substantive source commit.

A passing local build is not a deployment receipt. Production adoption requires all final PR checks to pass, a merge under the existing Human authorization, and verification of the resulting production deployment and live interactions. Physical Android, speaker output and formal screen-reader acceptance are not represented by desktop browser emulation.
