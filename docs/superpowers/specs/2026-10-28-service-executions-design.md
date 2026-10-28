# Service execution showcase

Approved by the user. Converts the existing “Where we work” section; supplied execution images are still pending.

## Purpose

Help the team present what the agency offers and show an actual execution of each service during client meetings.

## Layout and behavior

- Reuse the current city coverflow, scroll transitions, previous/next controls, swipe, keyboard navigation and reduced-motion support.
- Change the heading to “What we do. Out in the world.” Replace the oversized city name with the selected service name, such as “Hoardings”.
- Put a large execution photograph below that service title, with the client, placement/location and a short description when supplied. The photograph should be the main focus rather than a decorative city illustration.
- Give individual services their own stops, rather than making only five broad environment cards. Include the full existing offering, with duplicate labels consolidated after review. The current content contains 43 distinct labels, including overlapping descriptions such as “Airport media” and “Airport advertising”.
- Provide direct service selection so a salesperson can jump to the example a client asks about without scrolling through the whole list. Keep the selector scrollable on mobile.
- Keep the current first Services video section in place. Change the later “Coverage” navigation label to “Executions”; retain its anchor so existing links continue to work.

## Content inventory

Use the existing catalogue and environment lists in `src/content/site.ts`; add no services or execution claims from assumptions.

| Area | Existing services to cover |
| --- | --- |
| ATL | Television; radio; cinema; hoardings; newspaper advertising and inserts |
| Residential and community | Society advertising; residential digital screens; door-to-door campaigns; flyer distribution; community activations |
| Corporate and coworking | Corporate office advertising; coworking campaigns; workspace activations |
| BTL and delivery | Residential/corporate activations; community campaigns; sampling; Swiggy Instamart inserts; Zepto inserts; Blinkit inserts; delivery flyer campaigns |
| Outdoor and transit | Bus branding; metro; train branding; auto branding; cab branding; airport advertising; pole kiosks; transit media; signage branding; outdoor digital advertising |
| Travel | In-flight advertising, alongside the airport and cinema services already listed |
| Branded content | Podcast integration; in-film branding; brand ambassador and celebrity endorsements |
| Media planning and buying | Strategic media planning; location and audience mapping; cost-effective media buying |
| Digital and indoor | Digital branding and promotions; residential/indoor screens; in-app advertising |

## Images

The user will supply service execution images. Map each image to its confirmed service; show an awaiting-image state where no image is supplied. Never substitute the illustrative city art or an unrelated campaign as proof of an execution. Treat “best execution” as the user's selection, not an unverified ranking.

Prepare each supplied image as responsive WebP sizes; load the first selected image promptly and defer the remainder. Retain descriptive alternative text and avoid importing original large files into the page.

## Scope and checks

Update shared content, the coverflow component, its styles and relevant content/control tests. Verify every service is reachable, title/image selection stays synchronized, old anchors resolve and the site passes its existing tests/build. Follow AGENTS.md's restriction on automated browser inspection.

Team names are the next, separate change: keep Yash Nile complete; show Akshay D, Dilip J, Mansi J and Ashika J using the existing roster. Do not add or rename a team member based on an unclear spoken example.
