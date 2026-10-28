# Campaign gallery implementation plan

> **For agentic workers:** Implement inline with superpowers:executing-plans. Track completion below.

**Goal:** Add up to three best campaign photographs per brand to client previews and a separate animated gallery page.
**Architecture:** One curated catalogue feeds the existing client dialogs and a second Vite HTML entry. Reuse native dialog, shared navigation/footer, and GSAP. No new runtime dependency.
**Tech stack:** React, TypeScript, GSAP, Vite, existing Node tests; bundled Python/Pillow for image preparation.
**Spec:** `docs/superpowers/specs/2026-10-28-campaign-gallery-design.md`.

## Global constraints

- Maximum three selected photos per brand; never fabricate assets, results or campaign details.
- Preserve existing styles, service animations, performance improvements and homepage section order.
- Gallery remains a separate webpage; direct GitHub Pages links and refreshes must work.
- Native dialog keyboard/focus behavior and reduced motion remain usable.
- No automated browser inspection unless explicitly requested, per AGENTS.md.

## Review focus

- Alias mapping prevents another brand's images appearing in a client preview.
- SBI/Decathlon empty folders remain pending; Highland stays named without an invented logo.
- Both pages retain valid links and GitHub Pages subdirectory asset paths.
- Filters, next/previous wrapping, Escape, focus restoration and body-scroll cleanup work.
- Landing page requests no campaign wall; full-size images load only in viewers.

## Tasks

- [x] Add failing catalogue, gallery ordering, navigation/build and viewer tests.
- [x] Prepare selected WebP previews/full images and a source manifest; validate dimensions and budgets.
- [x] Populate `work.projects`, add client photo controls and brand-specific gallery links.
- [x] Build gallery component/styles/entry and shared page navigation; test actual filters/viewer handlers.
- [x] Run full tests/build and inspect assets/diff: 73 tests passed, multi-page production build passed, 80 WebP files decoded successfully, both local page routes returned HTTP 200.

Deployment uses the authorized home-page/gh-pages workflow; the source commit and corresponding Pages build identify the published result.
