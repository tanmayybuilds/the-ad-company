# Version 5 — Home page

The user approved implementing the homepage concept discussed against the supplied Advillains recording, and explicitly requested continuous implementation on a GitHub branch. The existing repository is retained; `home-page` is the Git-compatible form of “home page”.

## Direction

An advertising composition coming together: scattered letters form “Your brand. Where it matters.” while six campaign panels settle around the headline. A short automatic entrance establishes readability; a separate scroll-controlled layer unfolds the campaign panels and moves the composition toward the existing client section. Scrolling backward reverses that layer. No artificial wheel interception or repeated automatic loop.

Porcelain #F7F9F8, pale teal #E5EFF0, brand teal #12546B, gold #D9A328 and text #102F38 remain fixed. Syne carries the large central headline; Plus Jakarta Sans carries descriptions. The design is an agency's campaign worktable with route marks, editorial posters and placement shapes, rather than a copy of the reference's dark palette or artwork.

The hero contains six distinct illustrative panels: community, outdoor/transit, digital screens, ATL, branded content and planning. The supplied billboard visual may appear in the outdoor panel. Optional image fields default to null and produce labelled, intentionally designed illustration placeholders; no broken URLs or invented campaign evidence.

## Scope

Replace the hero on the complete existing homepage. Preserve all sixteen clients, five service environments, three work videos and detail dialogs, About story/reasons, coverage locations, real team, and enquiry/download behaviour. Keep the trimmed second video and all approved content.

Use the installed React, CSS and GSAP tools; add no dependencies. Remove live WebGL from the active hero import path. Native sticky positioning may extend the desktop hero for one short scroll sequence; smaller or short screens get ordinary document flow. Keep a readable accessible H1, working navigation and contact actions. Reduced motion receives the completed composition without entrance or scroll effects. No-JS/server markup is already readable.

## Motion and failure rules

Animate only presentation transforms and opacity on separate entrance and scroll wrappers. Place letters with deterministic bounded offsets. Use one scoped GSAP entrance timeline and one scoped scroll timeline, with no per-frame React updates. Retain heading readability through the scroll phase. Fonts and viewport changes must not leave transforms or stale timelines behind. Cleanup reverts motion on unmount or preference changes. Do not intercept wheel/touch events. No hero video downloads.

## Approaches

The previous discussion compared entirely scroll-controlled assembly with a short entrance followed by scroll movement. The user selected the latter while explicitly retaining scroll control. We implement the hybrid: automatic letter assembly, reversible panel progression on scroll. A full new WebGL scene or video background would add weight and is outside this bounded change.

## Verification

Tests cover complete readable SSR, all six panel labels and optional-image handling, valid site anchors/assets, deterministic bounded motion geometry, reduced-motion/no-scroll setup and cleanup. Run the full existing suite and production build. Inspect the local homepage at desktop and mobile sizes and exercise scrolling, anchors and work dialogs as part of the user's requested preview. Do not promise lag-free performance on untested devices. Push only the home-page source branch; do not publish GitHub Pages.

## Follow-up: assembly begins on scroll

The user subsequently requested that the opening stay scattered until a small scroll, with a designed background rather than a blank white page. This supersedes the automatic entrance described above. Assembly now scrubs over a short first-scroll range, after a small lead-in, and the onward movement begins only when assembly finishes. The opening canvas uses static brand-tinted lighting, street/route linework and a scroll cue. Header/navigation remain available. Panels and supporting actions use visibility-aware fades so invisible controls are not keyboard targets. Reduced motion retains the completed composition.

## Full-screen opening refinement — October 27

The user requested a complete scattered first screen, a first scroll that assembles the main homepage, and subsequent ordinary page scrolling. Keep the approved porcelain/teal/gold and Syne typography. Distribute all 25 letters and all six artwork panels across viewport coordinates, including on mobile, rather than offsetting them around their final layout positions. Reuse the actual elements so assembly has no duplicate-image crossfade or jump.

Approach: one GSAP ScrollTrigger pins the natural-height hero at its top for one viewport of scroll, with endpoint snapping after input settles. Use transform/opacity animation and an eased scrub; then release to normal document flow. This also allows the full mobile collage to remain naturally scrollable after assembly. A second page/overlay would duplicate the headline/artwork and risk a visible swap; wheel interception would make touch and keyboard scrolling less predictable. Reduced-motion users keep the completed static hero with no pin or snapping. Existing sections, navigation and company copy remain intact.

Scope: Hero.tsx, hero-home.css, hero-motion.mjs, its motion tests, README and project status. Verify deterministic viewport coverage, visible starting panels, one-viewport pin/snap, responsive resizing, reduced-motion cleanup, desktop/mobile composition and release to subsequent sections.
