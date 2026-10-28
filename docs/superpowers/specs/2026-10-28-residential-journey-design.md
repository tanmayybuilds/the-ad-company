# Residential journey prototype

Approved direction: the user requested a live, editable Residential prototype with semi-realistic animated people and vehicles, the supplied company logo on advertising placements, and Hyperframes where useful.

Five stops: society gate, lift/lobby screen, doorstep leaflet, flyer handoff and community activation. A single continuous, deterministic progress value drives camera travel, walking, vehicle movement and placement labels. Stop labels live inside the scene; there is no external category accordion. Each stop includes an approach and a readable hold. Backward scrolling retraces the active journey; the section releases at its end. A skip link remains available.

Use the existing React/Three.js stack for spatial movement and GSAP for the paused master timeline. Apply Hyperframes' deterministic composition/timeline approach without adding a second player or generating an MP4. Real geometry is needed to travel between spaces; layered still images would not expose unseen surfaces. No new dependency or externally fetched model is needed for this prototype.

Visual identity: Porcelain #F7F9F8, pale teal #E5EFF0, logo teal #12546B, gold #D9A328, dark text #102F38. Warm plaster, pavement, foliage, skin and clothing use plausible material colors. Existing Syne display and Plus Jakarta Sans body typography. One immersive screen with quiet chapter labels, an explanatory lower third and five compact progress controls. People have adult proportions, articulated limbs, faces and clothing; vehicle proportions and pedestrian routes must be coherent. Advertisements are illustrative concepts, not campaign evidence.

Performance: lazy-load WebGL near the section, cap pixel ratio, render only on scroll changes, pause while hidden/offscreen, reuse geometry/materials and limit visible environments. Reduced motion, unavailable WebGL and asset failure retain a readable still preview and stop controls. Never promise a device-independent frame rate.

Keep the existing Services journey available by default until this prototype is accepted. Opt into the replacement with ?prototype=residential#services. Do not publish or change other sections.
