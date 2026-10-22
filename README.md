# The Ad Company — first build

Lovable's exported components and artwork, completed against the approved Stitch design. Original exports remain untouched in Downloads.

Stack: React 19, TypeScript, Vite 8, Tailwind CSS 4, GSAP + ScrollTrigger, Three.js + React Three Fiber. Static output is hosted on GitHub Pages at https://tanmayybuilds.github.io/the-ad-company/. The blank TanStack Start shell was replaced with a Vite entry point; this site currently needs no server rendering or server secrets.

Commands: `npm install`, `npm run dev`, `npm test`, `npm run build`.

Editable business content is in `src/content/site.ts`. Shared motion settings live in `src/lib/motion.ts`. The desktop city is lazy-loaded and renders on demand; mobile and reduced-motion users receive the existing static artwork. All retained imagery is local.

Section 06 now uses a scroll-driven CSS 3D team pathway with six sample profiles, local stock portraits, jump controls and a reduced-motion layout. The sample names and portraits are not a confirmed roster. See [tour implementation](docs/team-tour.md) and [portrait sources](docs/team-portraits.md).

The team camera uses a centered close-up with a 14-degree tilt, larger pedestals and portraits, and readable active profile cards. Three stops render at rest; travel briefly retains the outgoing stop while preparing the arriving pointer and its next two stops, with at most four visible. Upcoming portraits are decoded ahead of arrival, and decorative effects stay still when idle. The Services sequence keeps at most nine frames in memory instead of preloading all 266, and releases them off-screen.

Within the team tour, one scroll gesture moves one pointer forward or backward and settles exactly there. At pointer 01 upward scrolling exits; at pointer 06 downward scrolling exits. Once the whole section has left the screen, returning upward skips its animation distance and resets the tour. A later downward visit starts again at pointer 01.

Services scrolls forward and backward within the animation during an active visit. This remains available just after the pin releases while the stage is still visible. Once the entire stage has scrolled above the header, returning upward bypasses the animation distance and resets it; a fresh downward visit can scrub both ways again.

Manual Services selection uses a single 450 ms frame transition with the category highlight held on the chosen destination. Its document position aligns immediately, rapid clicks replace the previous transition, and new scroll input settles the interrupted transition before resuming normal scrubbing.

Reverse exits require actual upward input, so rounding, pin refreshes and manual pointer navigation cannot reset a forward journey. Services scrolls naturally when its panel cannot fit the viewport, and Services/Coverage omit long pins under reduced motion. See the [showcase code audit](docs/showcase-audit.md) for fixes, verification and remaining business handoff items.

The enquiry form validates and downloads a brief. It does not submit enquiries, save visitor details, or send notifications. No fake success state is used. Direct links use the confirmed email ad@theadcompany.com and phone/WhatsApp +91 77150 01514. Before a public launch: connect a server-side submission destination, add a business privacy notice, confirm coverage, and replace the clearly labelled illustrative work and team placeholders with approved assets. The 16 client names are user-supplied; their logos are served locally from official website assets. See [client logo sources](docs/client-logos.md).

Version control: `main` holds the stable website source, `v1.0.0` marks the version 1 checkpoint, and `v2` starts from that checkpoint for the 3D redesign. The design brief is in `docs/superpowers/specs/2026-10-21-brand-boulevard-design.md`. Changes on `v2` do not affect the live site until explicitly published.

Deployment: run `npm ci`, `npm test` and `npm run build`, then commit the contents of `dist/` to the existing `gh-pages` branch without rewriting its history. GitHub Pages publishes that branch's root. Keep `.nojekyll` in the output. Vite's relative base and base-aware client image URLs support the repository subdirectory. Verify the live page after refreshing any older cached bundle, including all 16 logos.

Publish only when the user explicitly requests it. Do not deploy to Sites; `.openai/hosting.json` is retained solely as the earlier hosting identity. Never store GitHub tokens in repository files, remote URLs or Git configuration. The current site retains noindex and disallows crawlers while campaign content, team profiles and enquiry delivery are unfinished.
