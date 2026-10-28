# October 28 interface refinements

- Added three selected Decathlon Sports India photographs from the new six-photo pack. The gallery now contains 43 photos across 16 brands, still capped at three per brand. The same catalogue automatically populates the Decathlon client dialog.
- Gallery hero cards spread wider and rise on pointer hover or keyboard focus. The pointed card lifts above the stack. Entrance movement, fan positioning and individual lift use separate elements so their transforms do not fight. Cards are real links that also filter and scroll to the selected brand; touch remains usable. Reduced motion disables the movement.
- Campaign-services dialogs use 35% video / 65% service columns at widths of at least 640 px. The service column scrolls independently, retaining the video and close button. Narrow phones stack the media and services. Video remains muted, inline, autoplay-on-open, with controls and no loop. Reopening creates a fresh player.
- Added a solid gold, always-visible “View more” label on every work animation. The existing whole-animation click target and footer action remain available.
- Full team biographies retain their original copy, portraits, roles and quotes, with a themed pointer bar, playful portrait pedestal, gold accents, bold borders and a brief entrance animation. Native dialog focus, close and scroll restoration remain intact. Reduced motion removes the entrance.
- Corrected the shared contact address to `ad@theadcompany.in`, including mailto links on both pages.
- Services progresses 30% faster for the same scroll input: desktop distance is `22 / 1.3` viewport heights; compact distance is `16 / 1.3`. The complete animation, category navigation and reverse scrolling remain intact. Ordinary document scrolling is unchanged.
- Capped the About illustration at 400 px and kept it vertically centered beside its text, preserving the full image and caption.

Verification: 74 tests passed and the production multi-page TypeScript/Vite build passed. No new runtime dependency. Browser visual inspection remains excluded by AGENTS.md unless explicitly requested; real-device appearance still needs review.
