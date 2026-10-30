# Mobile branch release preparation

**Goal:** Commit all approved mobile work and production engineering fixes to the existing `tanmayybuilds/the-ad-company:mobile-adcompany` branch, preserving its history and the live deployment.

**Approach:** A clean checkout of the exact remote branch receives the current working source. Validate a reproducible lockfile install, add explicit test dependencies, run the full test/build suite, and verify the built static entry points. Keep scratch directories, credentials, local environment files and build output out of the commit. No force push, merge into main, or live deployment.

**Known business handoff:** The user explicitly deferred the Web3Forms access key. Email submissions remain disabled until configured; manual receipt verification and business privacy approval remain required before public launch. Preserve noindex while these are outstanding. Do not invent legal copy or silently enable a nonfunctional form.

- [x] Preserve all approved mobile source/content/docs/tests from the live local workspace.
- [x] Verify a clean npm install, pin the tested Node major, explicitly declare dependencies used by tests, and add a repeatable verify command.
- [x] Add static build verification and CI checks without deployment triggers. Refresh release documentation and remove stale development-only UI copy.
- [x] Run fresh tests, build, production dependency audit and HTTP/static-asset smoke checks. No browser automation, per user preference.
- [x] Perform one independent read-only review of the final patch, address material findings, and check staged paths for secrets/scratch artifacts.
- Git handoff: create a descriptive commit, push normally to mobile-adcompany, and verify the remote commit and CI status.

Final user addition: install nine supplied execution photographs on desktop only, with per-subject display crops and no image-less desktop cards. The mobile catalogue and navigation remain unchanged. Covered by dedicated asset/crop/mobile-isolation tests and a read-only review.
