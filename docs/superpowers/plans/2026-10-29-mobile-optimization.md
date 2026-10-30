# Mobile Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Implementation status (29 October 2026):** Tasks 1–7 implemented. Task 8 automated/build/browser checks complete within available tooling; physical-device, 200% text and performance checks remain. See `docs/mobile-audit/RESULTS.md` for exact evidence and limits.

**Goal:** Refine the existing website for phones while retaining its design, content and signature artwork.

**Architecture:** Keep the React/Vite components and content source. Refine their existing responsive styles and introduce a bounded, control-driven mobile team mode; retain desktop animation behavior. Coordinate explicit section navigation with animation controllers so navigation always wins.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS 4, GSAP, existing Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-29-mobile-optimization-audit.md` (audit and proposed design; implementation has not been approved).

## Global Constraints

- Preserve the Porcelain & Teal palette, transparent logo, selected fonts, section order and existing business content.
- Preserve all six hero panels, 16 client logos, five service environments, three work previews, 37 execution entries, five profiles and 43 gallery photographs.
- Keep business text in `src/content/site.ts`; keep campaign records in their existing catalogue.
- No new dependencies, invented imagery/claims, backend work, deployment or unrelated refactoring.
- Phone behavior below 768px; short landscape below 1024px and at most 500px tall needs a safe content-flow layout. Desktop tour remains at 1024px and above in ordinary-height windows.
- At least 44px interactive targets; 16px form text; 12px useful supporting text. Preserve native pinch zoom.
- Reduced motion, keyboard access, dialog focus restoration and offscreen/lazy media behavior must remain intact.
- This folder currently has no Git metadata (`git status` reports “not a git repository”). Confirm the intended source-control location before implementation. Do not initialize a repository or push anything merely to execute this plan.

## Review Focus

1. Short-height and landscape phones: menu, team and modal controls remain reachable (Tasks 1, 3, 6, 8).
2. Navigation across animated sections and late layout changes: anchors land correctly and user scrolling can interrupt pending alignment (Task 2).
3. Touch versus keyboard versus mouse: mobile page scroll is native; pills, arrows, filters and dialogs still work (Tasks 1, 3, 5, 7).
4. Long content and larger text: names, service labels, notices and errors wrap without obscuring controls (Tasks 3, 5–8).
5. Reduced motion, media failure and orientation changes: content remains visible and stale animation listeners/spacers are removed (Tasks 3–5, 8).

## File map

| Files | Responsibility |
| --- | --- |
| `src/components/site/Header.tsx` | Bounded, scrollable mobile menu and focus/scroll lifecycle |
| `src/components/site/primitives.tsx`, `src/styles.css` | Shared mobile sizing, readability and section-specific layout refinements |
| `src/lib/section-navigation.mjs`, `src/lib/section-navigation.d.mts`, `src/components/site/SectionNavigation.tsx` | Explicit navigation ownership and final section alignment |
| `src/components/site/TeamTour.tsx`, `team-tour.css`, `src/lib/team-tour.mjs` | Existing scene/camera, mobile selection mode, flow layout |
| `src/components/site/Hero.tsx`, `hero-home.css` | Six-panel responsive collage, readable actions/captions |
| `src/components/site/ClientStrip.tsx`, `src/lib/brand-motion.mjs` | Mobile strip expansion, stable touch preview behavior |
| `src/components/site/Services.tsx` | Fit-aware service selection/video journey |
| `src/components/site/Work.tsx`, `Sections.tsx`, `Contact.tsx` | Work dialogs, About/footer pacing, brief form |
| `src/components/site/CoverflowCoverage.tsx` | Execution cards, placeholder state and selection controls |
| `src/components/site/Gallery.tsx`, `gallery.css` | Photo wall, filters and viewer |
| Existing relevant `tests/*.test.mjs` | Behavioral regression coverage; avoid tests that only assert CSS source strings |

## Task 1: Make the header/menu fully reachable (M01, M11)

**Files:** `Header.tsx`, `primitives.tsx`, `styles.css`.
**Interface:** Preserve link generation and `homePath`; opening/closing must restore the prior page scroll state and return focus to the trigger.

- [ ] Record failing manual cases: open menu at 320 × 568 and 844 × 390; attempt to reach every link and final CTA without scrolling the underlying page.
- [ ] Constrain panel height to `100dvh - var(--header-h)` with an appropriate fallback; add internal overflow, overscroll containment and bottom safe-area padding. Use compact link spacing on short-height screens, without shrinking targets below 44px.
- [ ] Implement a consistent modal-navigation lifecycle: focus containment with access to the close trigger, Escape, background scroll lock with prior-value cleanup, and unlock before anchor alignment. Keep the existing appearance and header logo.
- [ ] Verify opening, closing, link activation, keyboard traversal, orientation changes, desktop breakpoint transition and teardown. No residual scroll lock or offscreen CTA.

## Task 2: Resolve anchor navigation conflicts (M02)

**Files:** `section-navigation.mjs`, its declaration, `SectionNavigation.tsx`, `TeamTour.tsx`; modify `Services.tsx`/coverage only if reproduction shows their handlers participate. Tests: `tests/section-navigation.test.mjs`, `tests/reverse-pin.test.mjs`, `tests/team-tour.test.mjs` as relevant.
**Interface:** Preserve `installSectionNavigation(settle)` and its disposer. Add a shared exported read-only `isSectionNavigating(): boolean` if controllers need ownership checks; declare it in the existing `.d.mts`. Keep ownership bounded to the alignment operation and clear it on cancellation and disposal.

- [ ] Reproduce Team → menu → Let’s talk at 320 × 568 before changing code; repeat without resizing and at 390 × 844. Record hash, target top, scroll position and which handler changes position. Treat the observed failure as unconfirmed across devices until reproduced.
- [ ] Add behavioral regression coverage for navigation while an animated section is active and while layout changes. Verify the target settles below the fixed header; modifier-click/cross-page links retain native behavior; manual input cancels pending alignment.
- [ ] Coordinate controllers so programmatic navigation cannot be interpreted as a new tour step. Settle animation/layout before the final alignment; avoid timer-based retries without a lifecycle reason.
- [ ] Run the focused Node tests and browser checks: all header/footer/hero anchors, Team → Contact, executions skip, gallery → homepage Contact, initial `/#team` and `/#contact`, Back/Forward, font/media completion and an open/closed menu.

## Task 3: Preserve the team scene with a usable mobile layout (M03, M04, M11)

**Files:** `TeamTour.tsx`, `team-tour.css`, `team-tour.mjs` and declaration if needed. Tests: `team-tour.test.mjs`, `team-lookahead.test.mjs`, `team-roster.test.mjs`.
**Interface:** Keep the roster, camera math, biography dialogs and desktop scroll-to-stop mapping. Mobile selection updates the existing active index/camera without changing document scroll position.

- [ ] Record the 320 × 568 card/portrait overlap. Add behavioral tests ensuring selection clamps to the five-member roster and mobile selection does not call document-scroll helpers.
- [ ] Add a responsive mode boundary with cleanup: mobile below 768px, plus short landscape below 1024px/at most 500px high. In that mode remove the 475vh spacer and disable vertical wheel/touch interception; retain existing render visibility/offscreen safeguards.
- [ ] Lay out heading, numbered controls, scene, profile card and navigation in flow/grid rows. Give the scene its own bounded area; let the complete section exceed a short viewport naturally. Remove the mobile card's absolute bottom offset.
- [ ] Keep numbered selection and Prev/Next at 44px targets. Optional horizontal swipe must only claim predominantly horizontal movement after a threshold; vertical swipes remain page scroll. Do not add swipe if buttons already meet usability needs.
- [ ] Keep full bio available for all five people; preserve portrait treatment, pedestal styling and active transitions. Short-height layout must retain readable profile content rather than simply hiding it.
- [ ] Verify all five stops, rapid changes, first/last boundaries, biography scroll/close/focus, resizing across modes, reduced motion and desktop reverse exits. No duplicated listeners or stale travel state.

## Task 4: Refine the hero and client strip (M05, M06)

**Files:** `Hero.tsx`, `hero-home.css`, `ClientStrip.tsx`, `styles.css`, `brand-motion.mjs` only for expansion logic. Existing hero/brand tests where behavior changes.
**Interface:** Preserve assembly `data-home-*` hooks and panel order. Preserve client IDs, dialog linkage and pause state.

- [ ] Capture hero/strip baselines at 320, 390 and 430px; include the fully expanded client-strip state.
- [ ] Use a two-column mobile grid for all six hero slots, maintaining varied rotations and hard shadows. Keep each panel's content and hit area inside the layout, including transformed bounds. Tune panel height after readable captions are set, not the reverse.
- [ ] Raise useful card captions/labels to 12px, retain larger panel titles, keep the main headline intact, and stack equal-width CTAs below 360px with 44px minimum height. Decorative in-art text may remain smaller only where its meaning is repeated in readable copy.
- [ ] Keep one-time assembly and reduced-motion completed state; resizing must not replay entrance. Keep normal scrolling available throughout.
- [ ] Cap the mobile client band's expansion using content plus padding rather than 50svh; start with a 240–280px maximum band at ordinary phone heights and tune from screenshot evidence. Increase pause target to 44px and verify clear single-tap preview behavior.
- [ ] Check every logo is still reachable, long client names/dialogs fit, pause persists, and no all-logo asset replacements occur. Confirm desktop collage and strip unchanged.

## Task 5: Improve Services, Work and Executions (M07, M08, M10)

**Files:** `Services.tsx`, `Work.tsx`, `CoverflowCoverage.tsx`, associated blocks in `styles.css`; copy changes only in `site.ts`. Relevant service/video/coverage tests.
**Interface:** Retain active category/service IDs, video/poster sources, all catalogue entries and current modal routing.

- [ ] Record the longest service label, expanded format chips, Work overlays and pending execution card at 320/390px.
- [ ] Raise service labels/hints/chips to readable sizes, keep the scene aspect ratio predictable and metadata subordinate. Recheck the existing fit condition after type increases so an oversized mobile stage does not pin.
- [ ] Ensure selecting each of five categories visibly updates its poster/video and expanded formats; if the preview is offscreen, provide a deliberate nearby selection affordance rather than an unexpected large scroll jump. Retain honest loading/failure states.
- [ ] Keep work previews at 16:9 on phones. Reduce the visual overlay's size and make the text action below a clear 44px target; retain accessible media entry and one shared dialog action. Restrict hover transforms to hover-capable fine pointers.
- [ ] Shorten placeholder-only execution scenes to an initial proposed 300–360px card area; allow real photographs more room. Show one pending message, raise picker/arrow targets to 44px, and keep long names readable.
- [ ] Verify all 37 options, first/last boundaries, rapid selection, vertical page scroll, reduced motion, video loading failures and all work-dialog entry points. No unrelated photographs may fill pending execution slots.

## Task 6: Make dialogs and gallery usable on narrow screens (M08, M13, M14)

**Files:** `Work.tsx`, `Gallery.tsx`, `gallery.css`, `styles.css`; biography CSS only if the same issue is reproduced there. Tests: `gallery-controls.test.mjs`, `campaign-gallery.test.mjs` for any logic change.
**Interface:** Preserve native dialog behavior, current photo index/filter association and focus return to the opening control.

- [ ] Record work-dialog close/header wrapping and gallery viewer controls at 320 × 568. Inspect client-preview and biography dialogs as part of this task; they were not visually audited earlier.
- [ ] Give work details a reachable sticky header, a short unwrapped Close control and one content scroller. Render the illustrative notice once at a readable size; preserve all service information.
- [ ] Set gallery wall to one column below 360px and retain two columns above where captions remain readable. Set captions to at least 12px. Preserve print rotations and increase padding only enough to prevent cropped shadows/text.
- [ ] Keep horizontal filters native-scrollable, selected state clear and all brand options reachable. Ensure changing a filter does not strand a stale selected photo.
- [ ] Explicitly center gallery viewer. Allocate rows for close/header, flexible contained photo, caption and navigation within the dynamic viewport; reserve controls before sizing the photo. Long caption text may scroll without pushing Close/Next/Previous away.
- [ ] Verify portrait/landscape photos, longest brand name, next/previous/keyboard boundaries, filter changes, background lock, Escape/backdrop close and focus restoration at 320 × 568 and 844 × 390.

## Task 7: Tighten About, Contact and footer (M09, M12, M15)

**Files:** `Sections.tsx`, `Contact.tsx`, `styles.css`; `site.ts` only if a shorter select label is required. Existing enquiry/contact tests if logic/copy changes.
**Interface:** Keep enquiry names/types, validation, `formatBrief` payload and downloaded file behavior unchanged. Keep direct-contact hrefs.

- [ ] Record About's long stacked rhythm, Contact pre-form distance, select clipping and footer legal text at small-phone widths.
- [ ] Reduce repeated large spacing in About: proposed 40–56px section padding, 24–32px between major groups, 16–20px within benefit/process groups. Preserve the billboard and every story/benefit/process paragraph.
- [ ] Tighten Contact's pre-form callout spacing and make the form easier to reach. Keep every field, the direct contact actions and the download-only disclosure.
- [ ] Set input/select/textarea text to at least 16px. Keep the phone/email input types and autocomplete. Fit an intelligible default selection label without shrinking text; preserve the selected value in brief generation.
- [ ] Set footer/legal and privacy-summary text to at least 12px and pad text-link targets. Reduce redundant group gaps while keeping contact and navigation groups distinct.
- [ ] Check empty/invalid form submission, first-error focus below the header, long error messages, keyboard-open access and completed brief download. On physical iOS check focus zoom and keyboard scrolling; on Android check native select and download access. Confirm external contact links without sending messages.

## Task 8: Verify the complete responsive pass

**Files:** Update the audit with after-results; save reproducible before/after screenshots in a dedicated audit directory during implementation. No new test framework required solely for this pass.

- [ ] Run focused behavioral tests during their owning tasks, then run `npm test` and `npm run build` after integration. Success requires passing output, not merely starting the commands.
- [ ] This session's shell lacks npm on PATH. Node exists at `/Users/tanmayc/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`; pnpm is at `/Users/tanmayc/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm`. If the environment is unchanged, put these directories on PATH and use `pnpm test` / `pnpm run build`. Preserve `package-lock.json`; do not create a second tracked lockfile. Dependency setup is already present from localhost startup.
- [ ] Inspect 320 × 568, 360 × 640, 390 × 844, 430 × 932, 844 × 390 and 932 × 430; spot-check 768px/1024px transitions, 1280px and 1440px desktop. Include exact breakpoint-adjacent widths where layout changes.
- [ ] Test real iOS Safari and Android Chrome for touch, address-bar resizing, safe areas, keyboard, downloads and portrait/landscape rotation. Mark unavailable physical-device checks explicitly rather than reporting them as passed.
- [ ] Test text enlargement to 200%, reduced motion, failed video request, slow first load, repeated forward/reverse scroll, reload at a hash, all dialogs, every menu link and gallery → homepage anchors.
- [ ] Check component bounds in addition to document scrollWidth; no hidden CTA, cropped required text or clipped focus ring. Review screenshots after entrance/reveal animations settle.
- [ ] Record performance before/after under the same conditions: layout shifts, media requests/bytes, interaction responsiveness and offscreen activity. Keep existing lazy-loading behavior; investigate any increase rather than claiming an unmeasured speed gain.
- [ ] Compare desktop screenshots and existing tour/service behavior with baseline. Deliver before/after evidence plus any remaining device-specific limitations. Do not publish.

## Suggested execution order and review gates

1. **Reachability:** Tasks 1–2. Review menu and anchor reproduction results before polishing layouts.
2. **Largest mobile defect:** Task 3. Review short-phone and ordinary-phone team scenes before proceeding.
3. **Visual consistency:** Tasks 4–7. Review hero, service/work, execution and gallery screenshots; preserve desktop identity.
4. **Completion:** Task 8. Only report completion after checks and screenshot comparison.

The mobile team interaction adaptation is the most meaningful product choice in this plan. If retaining vertical scroll-to-step on phones is preferred, retain that mechanism but still implement flow layout and navigation ownership; accept that the tour remains longer and requires additional touch validation. All other tasks remain useful independently.
