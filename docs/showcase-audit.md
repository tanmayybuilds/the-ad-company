# First-showcase code audit — 22 October 2026

Reviewed the complete application composition, site components, motion/reveal hooks, shared libraries, content, styles, local media references, enquiry validation, and build configuration. This was a source review and code-level verification, without browser automation or manual section-by-section inspection.

## Findings fixed

| Problem | Change |
| --- | --- |
| Services exited to the page immediately on upward input, including while its animation was still visible. | Allow frame scrubbing in both directions during an active visit. Latch a completed visit only once the whole released stage has scrolled above the header, then bypass the animation on upward re-entry. Reset this latch on a fresh downward visit or explicit category selection. |
| Coverage could pin over Corporate Services, return to Services midway through the journey, and leave an empty range later. Services creates its pin after a viewport fit measurement, so it could register after Coverage and refresh in the wrong order. | Give Services an explicit upstream refresh priority so its complete spacer is restored before Coverage is measured. A regression runs both real component setups in late-registration order and verifies repeated refresh, removal and recreation against a pin-spacing model. |
| Team could mistake rounded programmatic scroll positions for upward scrolling and reset to pointer 01. Services and Coverage also trusted stale ScrollTrigger direction after layout changes. | Reverse exits require recent actual upward input. Programmatic navigation clears that input, and Team records the browser's actual rounded/clamped scroll position. Refresh and navigation callbacks no longer authorize reverse resets by themselves. |
| A long Coverage flick could re-arm after a timer and skip cities; the last city could release before its transition completed. | Team and Coverage share the gesture latch: one fresh downward gesture advances one stop, input during travel is consumed, and another gesture exits the final stop. |
| Services reserved 13% of its pin distance for unchanged first/last frames; Coverage reserved another initial buffer. | Removed the buffer ranges. Services maps the full pin range to its full frame sequence. |
| Reduced-motion visitors still received long Services and Coverage pins. | Both use natural document flow; their explicit category/city controls remain available. Team already provides a natural grid for reduced motion. |
| A Services panel taller than the viewport could pin its lower categories below the screen. | Measure the stage against available viewport height on mount, font readiness, and resize. Panels that cannot fit use natural scrolling and category selection. |
| Services could cancel its own navigation when selecting its first frame, and refresh could replace the selected category during travel. | Avoid the start reset and immediate refresh synchronization during explicit navigation. |
| The hero capability probe left a temporary WebGL context alive; its development capture callback retained the renderer after unmount. | Release the probe context and remove the owned capture callback on cleanup. |
| Team's visibility callback could miss synchronizing a restored scroll position on entry. | Measure before marking the scene visible. |
| The closed Work dialog referenced a title that was not mounted. | Attach the title reference only when dialog content exists. |
| Parallel code-render tests attempted to share Vite's WebSocket port. | Disable WebSockets in the test-only servers. |

Earlier performance improvements remain: Services holds at most nine nearby image references (one for reduced motion), releases them and its canvas buffer offscreen/hidden, and Team limits visible scene stops to three. These are application resource bounds, not a guarantee about browser-internal image caching or device frame rates.

## Verification

- `npm test`: 47 passing tests. Includes Services forward/backward frame scrubbing, reversal after pin release while still visible, upward re-entry after the complete stage leaves the screen, fresh downward re-entry, late upstream pin registration/removal/recreation, actual Services setup/navigation callbacks with hook/motion boundaries stubbed, stale direction at completion, refresh during navigation, first-category travel, reduced-motion and oversized-stage selection, rounding/clamping, wheel inertia, touch/key/scrollbar direction and listener teardown.
- Complete-page server rendering checks unique IDs, internal anchors, accessible label/control targets, and case-correct local assets under a hosting subpath. Existing media tests cover all 266 sequence frames, client logos, work MP4s, camera geometry, form validation and local brief formatting.
- `npm run build`: TypeScript and production bundling pass. The optional lazy-loaded Three.js chunk still produces Vite's size advisory; it remains separate from the main page bundle.
- The generated entry point's local script, stylesheet and favicon paths are checked against the build output.

## Showcase limits and business handoff

The form prepares a local brief download; automatic enquiry delivery still requires an approved backend destination. The visible sample team roster/portraits and illustrative work need approved business replacements. A complete business privacy notice, address and launch approvals remain pending. Existing noindex/crawler restrictions are intentional for the preview. No publication was performed.

No additional reproducible code defect remained in the reviewed paths after these checks. Physical low-end devices, browser layout, scrolling physics, and measured frame rates were not tested in this pass; passing code checks cannot establish that every browser/device is bug-free.
