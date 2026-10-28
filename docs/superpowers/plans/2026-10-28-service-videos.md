# Service video sequence implementation plan

> **For agentic workers:** Implement inline with superpowers:executing-plans. Use checkbox steps for tracking.

**Goal:** Combine the five supplied service videos into the existing scroll animation with smooth transitions.

**Architecture:** Keep the React/GSAP canvas sequence. A shared clip catalogue supplies frame counts, category positions and the reproducible FFmpeg conversion; eased endpoint dissolves preserve all source action.

**Tech stack:** Existing React, GSAP, Node test runner; installed FFmpeg for one-time asset preparation.

**Spec:** `docs/superpowers/specs/2026-10-28-service-videos-design.md`

## Global constraints

- Preserve all 1,197 source frames and add 18 frames at each of four boundaries.
- Keep existing typography, layout, business copy and residential prototype.
- No new dependency, deployment, or automated browser inspection.

## Review focus

- Category boundaries: label changes at dissolve midpoint; buttons reach clip starts.
- Reverse scrolling and interrupted selection: existing accessibility harness continues passing.
- Cold loading: bounded requests and no backwards frame flashes while moving forwards.
- Reduced motion/short viewports: no pin; all five still previews reachable.
- GitHub Pages base path: every generated asset resolves under a hosting subdirectory.

### Task 1: Shared sequence and assets

- [x] Extend sequence tests for 1,269 frames, exact clip counts, four dissolves, safe bounds and URLs; run and observe failure.
- [x] Update `src/lib/service-sequence.mjs` and `.d.mts`; add `scripts/prepare-service-sequence.mjs` to verify sources and generate WebP assets under `public/frames/services-v2/`.
- [x] Verify all assets and transition blends with FFmpeg and Node tests.

### Task 2: Integrate the longer sequence

- [x] Adapt existing accessibility/pin tests to catalogue values; add a loading test for late frames, unavailable images and cleanup.
- [x] Update `Services.tsx` frame window/loading, poster and clip-start navigation; scale scroll distance in `motion.ts` and revise service hint in `src/content/site.ts`.
- [x] Run focused tests, then `npm test` and `npm run build`.
- [x] Document source order, conversion command, frame budget and verification limits; inspect final diff.

Verification: 69 tests passed; production build succeeded; all 1,269 frames decoded with FFmpeg; generated transition contact sheet inspected. Local preview module and final frame returned HTTP 200. No browser automation, deployment or changes to the existing residential prototype.
