# Navigation and layout follow-up

- About heading now has three rows: “Committed”, a centered “to”, and “commitments.”. The middle word is centered across the title's own width.
- The service-dialog media column vertically centers its video and caption while retaining the existing 35/65 media/services split.
- The gallery opening now features ten supplied brands in two staggered, animated rows, including Decathlon. Each remains a real brand-filter link with hover/focus lift. The full photo wall still includes all 16 supplied brands; no client or logo is invented.
- Shared section navigation now handles same-page links after the scroll-triggered layout settles, offsets the fixed header, and restores initial hash targets after fonts/load. Cross-page links keep native navigation; the destination homepage then aligns its requested section. Ctrl/Command clicks, external links and downloads retain browser behavior. Manual input cancels pending alignment. The installer is cleaned up on unmount.

The navigation test simulates a changed pin layout, initial hash, Services/Work/About links, gallery-to-home links, hash history, late fonts and user interruption. Tests run serially because their Vite servers share a dependency cache; parallel runs can race while replacing it. Browser visual inspection remains excluded by AGENTS.md unless explicitly requested.
