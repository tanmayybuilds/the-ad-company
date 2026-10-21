# Brand Boulevard Implementation Plan

> **For agentic workers:** Use native execution in this session. Steps use checkbox syntax for tracking.

**Goal:** Build the first local v2 animation: a readable, dimensional client-logo boulevard.

**Architecture:** Keep the semantic logo list in `ClientStrip.tsx`. Use native CSS 3D planes for billboard faces, buildings and the street, with GSAP for the entrance and pointer tilt. This keeps original logo images sharp and visible without loading another WebGL scene or generating video frames.

**Tech Stack:** Existing React, TypeScript, CSS and GSAP; no new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-21-brand-boulevard-design.md`

## Global Constraints

- Work on `v2`; do not change `main`, push or deploy.
- Preserve all 16 official logos, names, ordering and base-path-aware URLs.
- Leave the homepage city and all other sections unchanged.
- Preserve the original palette, including Malabar's dark logo surface.
- Normal scrolling; no sound, video assets, forced intro or non-actionable keyboard stops.
- Respect reduced motion and clean up pointer handlers and GSAP animations.

## Review Focus

- All 16 logos remain available before JavaScript animation runs, covered by server-rendered markup assertions.
- GitHub Pages subdirectory URLs continue to resolve, covered by the existing client-image test.
- Phone widths cannot require pointer interaction; use a two-column layout and disable tilt on coarse pointers.
- StrictMode remounts and changed motion preferences must remove old listeners; use the existing GSAP matchMedia lifecycle.
- Low-resolution artwork must retain `object-fit: scale-down`; animate the surrounding structures without stretching image content.

### Task 1: Build the client boulevard

**Files:** Modify `src/components/site/ClientStrip.tsx`, `src/styles.css`, `src/lib/motion.ts`, and `tests/client-images.test.mjs`.

**Interfaces:** Consume `clients.items` and the existing `gsap`, `MQ`, `MOTION`, `useGSAP` exports. Preserve the `ClientStrip()` export and existing heading ID. Introduce no shared subsystem or content schema.

- [x] Add a regression assertion for a semantic boulevard with one billboard per client and no video/canvas dependency or decorative focus stops.
- [x] Run `npm test`; expect the new boulevard assertion to fail against the existing flat grid.
- [x] Implement the billboard structures and CSS perspective, buildings, windows, street and responsive layout. Keep logos as normal images in the list.
- [x] Add a roughly two-second GSAP street/building/sign entrance, followed by a settled state; add bounded pointer tilt only for fine pointers without reduced motion.
- [x] Run `npm test`, `npm run build` and `git diff --check`; expect all to pass.
- [x] Review source and generated output for motion cleanup, 16 images and correct asset paths; provide a local preview.

Verification: the new stage assertion failed first, then all five tests passed after implementation. TypeScript/Vite build and diff whitespace checks passed. All 16 local logo URLs returned image responses. A focused independent source review found no actionable issues. Local preview: `http://127.0.0.1:5174/#clients-title`.

Browser automation is not part of this slice without an explicit visual-verification request, per AGENTS.md. Device performance remains unmeasured until that check is requested. No production publication occurs.
