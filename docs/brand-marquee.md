# V2 brand marquee

Replaces the first Brand Boulevard prototype with the synchronized dark 3D strip requested on October 21, 2026. Local v2 work only.

One GSAP ticker owns track translation and the rotation angle. Resting cards receive the same angle each frame. Hover/focus cards settle on their reverse face; on release their relative offset decays and snaps to zero. The master clock continues while a preview is open. The track pauses during preview; the explicit pause control also stops the master clock. Offscreen/hidden-page animation and active media stop.

The strip reserves 25vh and scroll progress expands cards within it, avoiding document layout shifts. Desktop pitch is 22vw (roughly 4–5 visible cards). Phones use 44vw for legibility. Cards pop to 1.7× on desktop and 1.6× on phones. Reduced motion switches to a static grid with instant previews. The duplicate group is visual only; the original group provides one keyboard control per brand. Escape dismisses the preview; tap again closes a touch preview.

Official logos retain their native colors. Light logo plates protect contrast for assets designed for white backgrounds; Malabar retains its dark background.

## Campaign content

All 16 logos exist. Approved campaign photographs, videos, descriptions and deliverables are still absent. No illustrative service images are presented as client work.

Add real projects in `src/content/site.ts`, under `work.projects`. Set `client` to the exact matching `clients.items[].name`. Existing `photos` and `description` fields are supported, alongside optional `title`, `deliverables` (string array) and `video` (`src`, optional `poster`, descriptive `alt`). Store local media under `public/` and use root-relative source paths. The component applies Vite's base path for GitHub Pages. All matching project copy and tags appear on the back; photos cycle while active, or the first supplied video plays muted. Reduced motion uses still images/posters. Empty brands display “Campaign showcase coming soon.”

## Verification

Node tests cover exact shared angles, release synchronization at 30/60/120fps, full-revolution hover behavior, track wrapping, all logo paths, one keyboard control per brand, and campaign-to-brand binding. Production TypeScript/Vite build required. Automated browser inspection was not requested; visual layout and real-device frame rate remain unverified.
