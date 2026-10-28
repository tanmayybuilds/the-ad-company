# Five service videos as one scroll sequence

Use all five supplied MP4 animations in the existing Services section, in its established order: residential, corporate, outdoor, cinema/travel, delivery. Preserve every source frame (240, 239, 239, 240, 239 frames at 24 fps). Insert 18 eased dissolve frames between complete clips, giving 1,269 frames. Scrolling remains the only animation clock; reversing works during a visit.

Reuse the existing canvas, pinned stage, service descriptions, category controls, reduced-motion and short-screen fallbacks. Use 1080 × 608 WebP assets to fit the existing canvas. Load a bounded neighborhood near the current frame, pause and release images offscreen, and retain a category-specific still when animation is unavailable. Category selection opens the beginning of every clip, including delivery. Labels switch halfway through each dissolve.

Approaches considered: seeking the five MP4s can stall between codec keyframes; recreating the scenes in WebGL would replace the supplied animation. Extending the existing frame sequence directly preserves the videos and established interaction with no player or dependencies. This is the implementation choice for the requested change.

Scope: sequence metadata/helper/declarations, reproducible FFmpeg asset preparation, Services loading/navigation, shared scroll distance, service hint copy, existing sequence/accessibility/pin tests, and asset/provenance documentation. Preserve current uncommitted residential prototype work. Local changes only; the repository requires an explicit publishing request. Automated browser inspections are excluded by AGENTS.md unless requested.
