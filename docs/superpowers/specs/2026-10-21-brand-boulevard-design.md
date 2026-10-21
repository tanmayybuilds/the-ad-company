# Brand Boulevard: first stage of the 3D redesign

## Approved direction and purpose

The Ad Company website becomes a living miniature advertising city. Preserve the existing ivory, charcoal, orange and lime theme, typography and business content. The intended audience is brand and marketing decision-makers; the experience should feel youthful, playful and ambitious while making the agency's services and client relationships easy to understand.

The user accepted the advertising-city direction on 21 October 2026. Start with the client showcase. Leave the homepage city, services, work, about, coverage, team and enquiry implementation unchanged during this first stage. Later sections follow their own scene designs rather than repeating the same effect.

The user explicitly authorized the version 1 GitHub Pages release and creation of a separate `v2` branch on 21 October 2026. Future redesign work stays local on `v2` unless publication is requested. Do not deploy to Sites or change hosting/access settings as part of this redesign.

## First scene

Replace the flat client-card presentation with a miniature advertising boulevard: a sculptural city block carrying the 16 existing official logos on billboards, rooftop signs and freestanding display structures.

- Keep the current heading, all 16 brand names, user-supplied order and original logo files. Future clients come from the same content list.
- Compose the desktop scene in shallow tiers, with varied structures and generous negative space. Billboard faces point sufficiently toward the viewer to remain readable. Building bodies may rotate; logo artwork must not be stretched or redrawn.
- Use ivory surfaces, charcoal supports, orange road markings and limited lime accents. Keep Malabar's supplied white logo on a dark surface. Do not upscale raster artwork beyond its usable native resolution.
- Show all brands in the settled composition without requiring a carousel, game controls or hover to discover them. Reserve enough vertical space for legibility instead of shrinking 16 logos into a narrow banner.
- The miniature placements are a creative client showcase, not claims about which advertising formats were executed for individual clients.

## Motion sequence

The scene starts assembling when it first enters the viewport, rather than running while visitors are still in the hero.

1. A road draws across the base.
2. Building blocks rise and slide into place.
3. Billboard supports unfold; signs settle into their readable positions.
4. A brief lighting accent completes the composition.

Target approximately two seconds for the complete reveal. Settle after the entrance; avoid continuous spinning or flashing. Fine-pointer movement adds restrained depth. Hover or keyboard focus can lift an individual sign without hiding other brands. Signs do not open invented campaign details or add links the user has not requested.

Use normal page scrolling. No scroll hijacking, navigation lock, autoplay sound or mandatory intro. Motion must clean up correctly when navigating away or when React remounts components.

## Mobile, accessibility and fallback

- Mobile gets a compact, shallow boulevard composition with naturally flowing rows and simpler motion. Logos must fit from 320px wide and remain readable.
- Keep a semantic list of all client names and meaningful image alternatives. Do not add keyboard stops to purely decorative buildings or non-actionable logos.
- Reduced-motion mode shows a fully assembled, still composition with the same content.
- If WebGL is unavailable or the scene fails to load, display the working logo list immediately. Do not leave a blank canvas or make logos depend on successful 3D loading.

## Implementation boundaries

Reuse the installed React, React Three Fiber, Three.js and GSAP stack. Build the simple scene geometry directly; no video generation, new model-generation service, animation framework or paid asset is required.

`src/content/site.ts` remains the content source. `ClientStrip.tsx` owns the section and its semantic fallback; a lazy-loaded scene component may own the 3D presentation. Use existing motion constants and conventions where applicable. Preserve base-path-aware logo URLs using `import.meta.env.BASE_URL`, including existing uncommitted work and its client-image tests.

Load the scene near the viewport. Render during motion and interaction; pause when settled, offscreen or in a hidden tab. Keep the hero and this scene independently paused rather than maintaining unnecessary render loops.

## Acceptance and verification

- All 16 clients appear with the original artwork, correct names and correct image paths under root and subdirectory hosting.
- The settled presentation is readable, recognisably three-dimensional and consistent with the existing brand palette.
- The entrance sequence completes and settles; ordinary scrolling and navigation remain available throughout.
- Phone, reduced-motion and WebGL-failure paths retain every logo and the section heading.
- Existing tests and the production TypeScript/Vite build pass. Add focused checks for new non-trivial scene state or asset handling, rather than tests that duplicate markup.
- Automated browser checks require the user's explicit request under the repository's AGENTS.md. Until then, report visual and device performance as unverified; do not claim measured frame-rate or visual acceptance.

## Later stages and assets

After the client scene's visual language is agreed, design the transforming service neighbourhoods, street-level campaign showcase, brief-to-execution city canvas, and raised India coverage map. The user confirmed pan-India execution; distinguish named completed locations from general national availability and represent Gujarat as a region.

Real campaign photographs and confirmed team profiles can be supplied later. They are not blockers for this client-section prototype. Videos would only be optional future promotional outputs, not the implementation of the interactive website.
