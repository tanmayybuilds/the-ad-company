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

The WebP sequence remains the preparation source and supplies five category posters. The live animation now uses a paused native H.264 video with the same 1,269 frames and 52.875-second duration. The original rolling image loader repeatedly cancelled unfinished downloads when scrolling changed its frame window; 1,269 separate requests also added substantial latency.

The replacement uses fast-start metadata and a keyframe every 12 frames (0.5 seconds). Desktop is 960 × 540, 8,725,534 bytes; mobile is 640 × 360, 4,316,824 bytes. This reduces Services transfer by 83.4% and 91.8% respectively against the 52,491,354-byte frame sequence. Files are requested only within 1,200 px of the section. A pending seek finishes before the latest scroll target is requested, so continuous input cannot repeatedly cancel decoding. Browser buffers are retained on offscreen return; hidden tabs stop seeking. Reduced motion requests no video and retains selected category posters.

Work previews use 50 KB of posters with `preload="none"`; hover/click still starts playback and detail dialogs retain controls. Their three 1280 × 720 videos total 2,800,042 bytes instead of 78,605,773 bytes, with every original frame and duration retained. All five optimized videos have metadata before their media data for immediate streaming/seeking.

To prepare the optimized videos, posters and two large client logos after generating the original frame sequence:

```powershell
node scripts/optimize-site-media.mjs
```

This command validates output frame counts, transfer budgets and fast-start metadata before installing prepared files. It refuses to overwrite existing optimized outputs. Original sources remain unchanged.

Scroll distance is now 22 / 1.3 viewport heights on desktop and 16 / 1.3 on compact layouts where the complete stage fits, advancing the sequence 30% faster for the same scroll input. Taller stages keep the existing unpinned category selection. This preserves access to every service on short screens. These distances are an implementation choice and can be tuned after real device feedback.

Verification: all 69 Node tests passed; TypeScript and the production Vite build passed. FFmpeg decoded all five optimized files without errors and confirmed matching source frame counts/durations. Desktop/mobile contact sheets were inspected. Tests reproduce delayed metadata and seeks, continuous updates during a pending seek, reverse navigation, buffer retention, hidden tabs, reduced motion, errors and cleanup. Asset tests enforce transfer budgets and fast-start metadata. Automated browser inspection was not run, as required by `AGENTS.md`; actual touch performance and timing on the visitor's connection still need device testing.
