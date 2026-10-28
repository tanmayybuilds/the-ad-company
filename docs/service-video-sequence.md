# Services video sequence

The default Services section uses the five videos supplied on October 28, 2026. The separate `?prototype=residential` route remains available.

| Service | Original file | Source frames | First output frame | Last output frame |
| --- | --- | ---: | ---: | ---: |
| Residential & community | residential and community.mp4 | 240 | 1 | 240 |
| Corporate & coworking | Corporate and coworking.mp4 | 239 | 259 | 497 |
| Outdoor & transit | Outdoor and Transit.mp4 | 239 | 516 | 754 |
| Cinema, airports & in-flight | Cinema airports and inflight.mp4 | 240 | 773 | 1012 |
| Delivery & in-app | Delivery and in app.mp4 | 239 | 1031 | 1269 |

Each gap contains 18 additional frames dissolving between held clip endpoints with smoothstep easing. None of the original action is overlapped or trimmed. The label changes at the dissolve midpoint. Sequence positions, source names and frame counts live in `src/lib/service-sequence.mjs`; source SHA-256 checksums are recorded in `public/frames/services-v2/manifest.json`.

To regenerate with installed FFmpeg and ffprobe, run from the site directory:

```powershell
node scripts/prepare-service-sequence.mjs 'C:/Users/Tanmay/Downloads'
```

The command verifies all five source names, frame rates and frame counts before conversion. It generates into its own temporary directory, verifies completeness, and moves the result into `public/frames/services-v2/`. It refuses to overwrite an existing output directory. Source videos stay untouched.

The sequence uses 1080 × 608 WebP at quality 80 (52,491,354 bytes, about 50 MiB). At most 17 images are retained near the target frame; reduced motion requests one. Frames are released offscreen and when the tab is hidden. Loading never shows a frame ahead of the requested scroll position while moving forwards, or behind it while moving backwards. This prevents flashes when images decode out of order. A selected category's first frame is also its fallback poster.

Scroll distance is 22 viewport heights on desktop and 16 on compact layouts where the complete stage fits. Taller stages keep the existing unpinned category selection. This preserves access to every service on short screens. These distances are an implementation choice and can be tuned after real device feedback.

Verification: all 69 Node tests passed; TypeScript and the production Vite build passed; FFmpeg decoded all 1,269 frames without errors. All four endpoint/midpoint/endpoint transition contact sheets were inspected. The existing local preview returned HTTP 200 for the sequence module and final frame. Automated browser inspection was not run, as required by `AGENTS.md`; actual scrolling, touch performance and cold-network playback still need visual review. No publishing was requested or performed.
