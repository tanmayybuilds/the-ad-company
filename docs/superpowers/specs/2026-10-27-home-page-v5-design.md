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
