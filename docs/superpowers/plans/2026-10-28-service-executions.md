# Service Executions Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement the approved change inline, task by task.

**Goal:** Convert the existing city coverflow into a complete service execution presentation, then abbreviate team surnames.

**Architecture:** Retain CoverflowCoverage and its existing scroll/pin controls. Add a typed serviceShowcase content object in site.ts, consolidate synonymous service labels into individual stops, and make each stop ready for one confirmed execution photo. Preserve the coverage anchor and the earlier Services video section.

**Tech Stack:** Existing React, TypeScript, GSAP and CSS; no dependencies.

**Spec:** ../specs/2026-10-28-service-executions-design.md (approved by the user).

## Global constraints

- Use supplied services only; never invent clients, locations, execution photographs or performance claims.
- Pending images stay clearly marked. Preserve keyboard, touch and reduced-motion controls.
- Keep the existing palette and typography. No automated browser inspection under AGENTS.md.
- Publishing to the existing home-page/GitHub Pages setup remains authorized by this conversation.

## Review focus

- Every current catalogue/environment format must map to a service stop, including overlapping names.
- Native selection must preserve its own arrow-key behavior and allow access to the last stop.
- Unselected image requests stay bounded; supplied image paths retain the Pages base path.
- Long service titles and small screens must not depend on fixed-width city-name styling.
- Founder name stays complete; all four other display names use surname initials, including biography headings.

## Task 1: Service content and presentation

Files: src/content/site.ts, src/components/site/CoverflowCoverage.tsx, src/styles.css, tests/coverage-content.test.mjs.

- [x] Replace the old location-only assertions with checks for complete format coverage, unique service IDs, placeholder truthfulness, accessible selection and supplied-image rendering; run and observe failure.
- [x] Add ServiceExecution and ShowcaseService types and serviceShowcase content. Each stop owns title, category, original format aliases and nullable execution data. Consolidate clear aliases into 37 service stops.
- [x] Replace city markup with a large photo/pending panel, service title and optional confirmed client/location/description. Keep existing motion, ID and controls. Replace the city selector with a labeled native service picker; bypass stage arrow handling inside it.
- [x] Load image elements only for the active stop and immediate neighbours; use responsive source sets where supplied. Add image failure fallback.
- [x] Restyle the existing coverflow cards for photos, balanced multiline service names and mobile. Rename the Coverage nav label to Executions.
- [x] Run content, pin-order, motion and whole-page integrity tests; confirm success.

## Task 2: Team names

Files: src/content/site.ts, tests/team-roster.test.mjs.

- [x] Update roster assertions and observe failure for the four shortened names.
- [x] Change memberName to Akshay D, Dilip J, Mansi J and Ashika J. Keep Yash Nile and all portraits/biographies unchanged.
- [x] Run roster tests and verify shared biography headings use the same names.

## Task 3: Verify and publish

- [x] Review the complete diff against the approved spec, run npm test and npm run build, and check for credentials/diff whitespace.
- [ ] Commit the verified source, publish the build through the existing gh-pages process without rewriting history, and confirm GitHub Pages reports built for that commit.
- [ ] Check live asset hashes, thumbnails and video range loading; return the test link with an explicit note that execution photos are pending.

## Execution record

Ruling: Keep the working home-page checkout rather than create another worktree; only the approved design file was untracked and this is the established release checkout. No unrelated edits were present.

Ruling: Consolidate exact/clear service aliases into 37 stops with a format-coverage test; retain all original service labels in each stop's formats list so nothing is silently dropped.

Task 1 and 2: Targeted content/control, motion, pin-order, page-integrity and roster checks passed (14/14). Initial assertions failed for the missing showcase and full surnames before implementation. The first full suite/build passed (76/76).

Final review: An independent read-only reviewer found one accessibility issue: card labels hid execution details. Fixed with per-card aria-describedby content, photograph descriptions and a status fallback; regression observed RED then GREEN (3/3 targeted tests). No other concrete findings or deferred issues. Browser/visual and assistive-technology testing were not performed under the repository's inspection restriction.

Self-review: Image preparation now uses wrapped coverflow distance so the first/last visible neighbour is included (maximum three images). Endpoint tests observed RED (two images rather than three) then GREEN (2/2 tests).

Final verification after the accessibility fix: npm test passed 76/76 with no failures; npm run build passed. Publishing and live verification follow the source commit and are recorded in the release tool results.
