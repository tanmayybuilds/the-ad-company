# Website typography — October 28, 2026

Only the user's circled or explicitly named typefaces are used for editable website text. Font names were normalized from “Rx100” and “rajhani” to RX100 and Rajdhani.

| Family | Role | Weights supplied | Official source |
| --- | --- | --- | --- |
| Outfit | Hero, primary section headings, campaign titles | Variable 100–900 | https://www.fontshare.com/fonts/outfit |
| General Sans | Paragraphs, forms, descriptions and dialogs | Variable 200–700 | https://www.fontshare.com/fonts/general-sans |
| Satoshi | Navigation, action buttons and team names | Variable 300–900 | https://www.fontshare.com/fonts/satoshi |
| RX100 | Indices, captions and small labels | Regular 400 | https://www.fontshare.com/fonts/rx-100 |
| Rajdhani | Service selectors and campaign channel labels | Variable 300–700 | https://www.fontshare.com/fonts/rajdhani |
| Sora | Team section headline | Variable 100–800 | https://www.fontshare.com/fonts/sora |
| Zodiak | About positioning and brand-visual caption | Variable 100–900 | https://www.fontshare.com/fonts/zodiak |
| Kalam | Commitment strip and small handwritten artwork accents | Variable 300–700 | https://www.fontshare.com/fonts/kalam |

The eight original WOFF2 files are served locally from public/fonts/ (303,452 bytes total), with the corresponding supplied FFL/OFL licenses retained in public/fonts/licenses/. Files were downloaded from the official Fontshare `/v2/fonts/download/<slug>` endpoints and copied unchanged. No subset, conversion, font modification or runtime font-service request is used. Only Outfit and General Sans are preloaded; all faces use font-display: swap. Generic CSS fallbacks are retained for unavailable-font conditions. Font synthesis is disabled so the single-weight RX100 is not artificially bolded or slanted.

The family roles live in src/styles.css and faces in src/fonts.css. Retained canvas artwork loads Outfit and RX100 explicitly. Raster campaign images, existing logos and video footage retain their embedded lettering.

Validation: regression checks reject the previous families and require eight genuine WOFF2 files, all eight license files and only two critical preloads. Production CSS resolves font URLs relative to assets, and the HTML preloads resolve relative to the repository base path.

Browser verification at 390×844 and desktop widths confirmed all eight role variables resolve to the chosen families. No mobile heading or document overflow was found. The hero eyebrow was widened for RX100; a single-column grid constraint also fixes an observed mobile Coverage footer overflow (580px reduced to 375px, caption content 335px), keeping its enquiry CTA on-screen. About's Zodiak copy and the Sora/Satoshi team hierarchy were inspected at mobile width.
