# The Ad Company — first build

Lovable's exported components and artwork, completed against the approved Stitch design. Original exports remain untouched in Downloads.

Stack: React 19, TypeScript, Vite 8, Tailwind CSS 4, GSAP + ScrollTrigger, Three.js + React Three Fiber. Static output hosted on Sites with owner-only access. The blank TanStack Start shell was replaced with a Vite entry point; this site currently needs no server rendering or server secrets.

Commands: `npm install`, `npm run dev`, `npm test`, `npm run build`.

Editable business content is in `src/content/site.ts`. Shared motion settings live in `src/lib/motion.ts`. The desktop city is lazy-loaded and renders on demand; mobile and reduced-motion users receive the existing static artwork. All retained imagery is local.

The enquiry form validates and downloads a brief. It does not submit enquiries, save visitor details, or send notifications. No fake success state is used. Direct links use the confirmed email ad@theadcompany.com and phone/WhatsApp +91 77150 01514. Before a public launch: connect a server-side submission destination, add a business privacy notice, confirm coverage, and replace the clearly labelled illustrative work and team placeholders with approved assets. The 16 client names are user-supplied; their logos are served locally from official website assets. See [client logo sources](docs/client-logos.md).

Sites identity is in `.openai/hosting.json`. Use Sites helpers for dependency installation, builds, source sync and publication. Keep credentials in session memory and stdin. This private review version intentionally uses noindex and disallows crawlers; remove these only when public launch is authorized and ready.
