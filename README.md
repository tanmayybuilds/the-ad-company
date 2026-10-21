# The Ad Company — first build

Lovable's exported components and artwork, completed against the approved Stitch design. Original exports remain untouched in Downloads.

Stack: React 19, TypeScript, Vite 8, Tailwind CSS 4, GSAP + ScrollTrigger, Three.js + React Three Fiber. Static output is hosted on GitHub Pages at https://tanmayybuilds.github.io/the-ad-company/. The blank TanStack Start shell was replaced with a Vite entry point; this site currently needs no server rendering or server secrets.

Commands: `npm install`, `npm run dev`, `npm test`, `npm run build`.

Editable business content is in `src/content/site.ts`. Shared motion settings live in `src/lib/motion.ts`. The desktop city is lazy-loaded and renders on demand; mobile and reduced-motion users receive the existing static artwork. All retained imagery is local.

The enquiry form validates and downloads a brief. It does not submit enquiries, save visitor details, or send notifications. No fake success state is used. Direct links use the confirmed email ad@theadcompany.com and phone/WhatsApp +91 77150 01514. Before a public launch: connect a server-side submission destination, add a business privacy notice, confirm coverage, and replace the clearly labelled illustrative work and team placeholders with approved assets. The 16 client names are user-supplied; their logos are served locally from official website assets. See [client logo sources](docs/client-logos.md).

Version control: `main` holds the stable website source, `v1.0.0` marks the version 1 checkpoint, and `v2` starts from that checkpoint for the 3D redesign. The design brief is in `docs/superpowers/specs/2026-10-21-brand-boulevard-design.md`. Changes on `v2` do not affect the live site until explicitly published.

Deployment: run `npm ci`, `npm test` and `npm run build`, then commit the contents of `dist/` to the existing `gh-pages` branch without rewriting its history. GitHub Pages publishes that branch's root. Keep `.nojekyll` in the output. Vite's relative base and base-aware client image URLs support the repository subdirectory. Verify the live page after refreshing any older cached bundle, including all 16 logos.

Publish only when the user explicitly requests it. Do not deploy to Sites; `.openai/hosting.json` is retained solely as the earlier hosting identity. Never store GitHub tokens in repository files, remote URLs or Git configuration. The current site retains noindex and disallows crawlers while campaign content, team profiles and enquiry delivery are unfinished.
