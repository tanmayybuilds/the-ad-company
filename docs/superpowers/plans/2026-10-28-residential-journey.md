# Residential Journey Implementation Plan

> **For agentic workers:** Execute inline using the approved design and existing project conventions.

**Goal:** Deliver a reviewable five-stop live Residential journey.
**Architecture:** A native sticky stage owns a paused GSAP progress timeline. A lazy React Three Fiber scene consumes deterministic camera/actor poses; HTML provides captions, navigation and a still fallback. The existing Services remains the default.
**Tech Stack:** React, Three.js/R3F, GSAP, CSS; installed dependencies only.
**Spec:** ../specs/2026-10-28-residential-journey-design.md

## Global constraints
- Use the actual logo, centralized content, fixed brand palette, no invented campaign claims.
- No MP4 requirement, no idle rendering, no publication, preserve normal page exit and reduced motion.
- Work on the existing clean feature branch; keep the prototype opt-in and reversible.

## Review focus
- Exact start/end and every chapter boundary in both directions.
- Readable placement holds and deterministic movement after arbitrary seeking.
- Hidden tabs, WebGL failure and reduced motion.
- Mobile caption/control layout and slow-device rendering cost.
- Existing Services, anchors and hosting subpath remain valid.

## Tasks
- [x] Add stop data and pure camera/actor pose helpers; write and run failing tests, then implement and pass.
- [x] Build neighborhood geometry, people, vehicles and actual branded ad surfaces in a lazy demand-rendered scene.
- [x] Add sticky scroll stage, timeline, captions, stop controls, fallback and opt-in integration; test actual markup/route behavior.
- [x] Run full tests/build, inspect code, serve and open the prototype. Record limitations; do not deploy.

## Execution ledger
- Design approved in chat; existing branch is home-page and started clean. Inline opt-in implementation avoids disrupting the default site.
- Six new regression checks cover stop holds/clamping, reversible deterministic poses, swept camera-wall clearance, real GSAP timeline/navigation/skip behaviour, reduced-motion selection and opt-in full-page markup. Full suite: 65 passed. TypeScript and production build passed.
- Read-only review found and resolved wall crossings, relative-position fallback top offset, and rem-to-pixel header measurement. Camera curves clear the lobby/corridor walls; bounds use the screen's computed pixel top.
- Ruling: the user explicitly owns visual testing. No browser automation or rendered visual checks were run. Real-device GPU performance, lighting and visual composition remain for review.
- The Three.js renderer is a separate lazy production chunk (~246 KB gzip); default-page loading does not mount WebGL. No new dependencies, MP4, external models, commit, push or publication.
