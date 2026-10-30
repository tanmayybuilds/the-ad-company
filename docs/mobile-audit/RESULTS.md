# Mobile optimization implementation results

29 October 2026. Implemented locally; not published.

## What changed

- Mobile menu fits the available viewport, scrolls internally, locks/inerts background content and contains keyboard focus. Small-phone links and CTA remain reachable.
- Fixed the real section-navigation exception caused by ScrollTrigger.getTween() returning a non-tween. Added bounded navigation ownership and history-pop handling.
- Mobile Team retains the portraits, pedestal scene, camera movement, five profiles and full bios. Heading, scene, card and controls now follow document flow. Vertical scrolling is native; profile buttons and Prev/Next select people without a 475vh spacer. Disabling browser scroll anchoring prevents camera motion from shifting page position. Ordinary desktop tour behavior is retained.
- Hero keeps all six tilted panels and its one-time assembly. Mobile uses a two-column grid, useful 12px captions, readable copy and consistent narrow-phone CTAs.
- Client band uses capped mobile spacing. Client dialog now fits its container with a compact sticky header and 44px close control.
- Services keeps five environments and format lists with readable metadata/chips and a selection hint when the stage does not fit for scroll playback.
- Work previews retain accessible media entry and a clear footer action. Detail dialog has a single illustrative notice, short Close button and one content scroller.
- Execution coverflow retains all 37 services and pending-photo states with compact placeholder sizing and larger controls. Pending text is described once to assistive technology.
- Gallery keeps all 43 photographs, brand filters and print styling. One photo column below360px, two above; viewer reserves space for close, caption and navigation.
- About/Contact/footer spacing is tighter; form fields use16px text, readable labels and an intelligible default select label. Brief download, validation and direct contact links retain their behavior.

## Verification evidence

- Baseline: 76 tests passed after resolving a local pnpm transitive PostCSS import via a node_modules symlink. No manifest or lockfile changes were needed.
- Final: `pnpm test` — **80 tests passed, 0 failed**.
- Final: `pnpm run build` — **passed**. Vite still reports a large optional ResidentialScene chunk; this pass does not claim to resolve that existing bundle concern.
- New regression coverage: missing/non-tween ScrollTrigger results, mobile/landscape profile selection without document scrolling, native vertical input, and reduced-motion scene height reset. New behavioral regressions were observed failing before their fixes.
- Independent read-only code review caught the reduced-motion cascade defect; fixed it with a failing-then-passing regression. No remaining confirmed important source defects were reported. Later browser validation caught scroll anchoring and client-dialog containment; both were corrected and rechecked.
- Viewport geometry checked at320×568,360×640,390×844,430×932,844×390,932×430,768×1024,1024×768,1280×800 and1440×900. No document horizontal overflow was measured. Mobile scene/card separation remained20px. These geometry checks are not a complete visual pass at every size.
- Visual checks: narrow hero, normal-phone Services/Work/Executions/Team/Contact, narrow gallery wall/viewer, landscape menu/viewer, client and biography dialogs, desktop hero. Screenshots are in this directory.
- Interaction checks: all five service categories; long execution title; Team→Contact and gallery→homepage Contact; gallery Next and brand filter; menu backward focus cycling/Escape; biography Escape/focus return; empty-form first-error focus;16px form inputs; a dummy local brief download (no enquiry sent).
- Native browser scroll anchoring originally moved scrollY7989→7816 during profile selection. After the mobile subtree fix, repeated changes and settled animation kept scrollY7816 unchanged.

## Remaining checks and limits

Physical iOS Safari/Android Chrome, touch inertia, native keyboard/address-bar behavior, safe areas and200% text enlargement were not available in this session. Reduced-motion height was regression-tested in source; a physical/browser emulation visual pass remains. No controlled slow-network/media-failure browser run or before/after performance benchmark was performed. Existing media/failure logic tests pass; no speed improvement is claimed from viewport checks.

## Implementation decisions and recoverability

The supplied folder has no Git metadata. Implementation was performed in place with a complete pre-change src/tests backup in `.superpowers/mobile-optimization/before/`; no repository was initialized or pushed. The ledger and logs remain in `.superpowers/mobile-optimization/` because there is no commit history to replace them.

Optional horizontal Team swipe was omitted: numbered buttons and Prev/Next preserve the artwork with fewer gesture conflicts; the tradeoff is one less gesture. Hero is allowed to grow to keep all six panels and readable captions; the tradeoff is a longer opening on narrow phones. CSS presentation changes were checked through browser cases, while logic changes use Node regressions; this does not substitute for the physical-device checks above.
