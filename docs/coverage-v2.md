# Where we work — V2 refinement

October 22, 2026. Refines the existing carousel on v2; no deployment.

The main card spans 38vw on desktop (maximum 520px). Its scene retains the available viewport area, capped at 70svh. Two neighbours recede at 18% opacity; the visual neighbours wrap at the ends so the composition always contains three cards, while the scroll journey still follows the city list. A large lime city name sits behind and above the smaller center card. The header and navigation occupy separate rows. On phones the scene is 70svh, with a 410px minimum and 560px maximum, and cards stack their information above the illustration.

The palette uses ivory information panels over a deep green-charcoal stage, with lime navigation and orange accents. Checked text pairs range from 6.42:1 to 14.58:1 contrast. Decorative low-contrast background graphics carry no essential information.

One GSAP scroll-linked sequence drives both cards and names: the old name fades during the first 18% of a step, the cards slide during the next 60%, and the new name reveals during the last 22%, after the center card has arrived. The same sequence reverses with scroll direction. Scroll settling snaps to a completed step. Pointer tilt operates on an inner layer, so it cannot override scroll transforms. The scene pins on desktops at least 720px high. Mobile, shorter windows and reduced-motion users retain direct city buttons; mobile supports horizontal swipes without blocking vertical scrolling. Reduced motion uses immediate selection and stops decorative traffic.

The miniature skylines are illustrative geometry, not actual landmarks or campaign evidence. Each location retains its name and classification from `src/content/site.ts`; Gujarat remains a region. Campaign photographs remain pending and are identified as such in the scene.

Checks cover continuous/symmetrical card positions, valid transforms, every location's navigation control, separate enquiry links, and illustrative labeling. Run `npm test` and `npm run build`. Visual appearance, touch behavior on physical devices, and achieved frame rate require browser/device verification; automated browser inspection was not requested.
