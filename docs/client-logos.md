# Client logo sources

Downloaded 21 October 2026 from the official websites or the asset CDNs referenced by them. Files in `public/clients/` retain the supplied colours, proportions and native resolution. Decathlon's SVG is extracted directly from its homepage header; the other files are unmodified downloads.

| Client | Local file | Native size | Official source |
| --- | --- | --- | --- |
| Malabar Gold and Diamonds | `malabar-gold-diamonds.svg` | Vector, 255 × 52 | [Desktop header logo](https://www.malabargoldanddiamonds.com/content/dam/mgdsite/assets-for-content-fragments/india/pan-india/header-v1/NewMalabarLogoDesktop.svg), referenced by [homepage model](https://www.malabargoldanddiamonds.com/content/mgdsite/in.model.json) |
| TDF Diamonds & Gold | `tdf-diamonds-gold.webp` | WebP, 152 × 152 | [Website logo](https://tdfjewellery.com/wp-content/uploads/2025/12/TDF-LOGO-FINAL-2025-01-152x152-1.webp), referenced by [homepage](https://tdfjewellery.com/) |
| Vihan Modular | `vihan-modular.png` | PNG, 200 × 48 | [Header logo](https://www.vihanmodular.com/assets/img/vihan-images/vihan-logo.png), referenced by [homepage](https://www.vihanmodular.com/) |
| Jagannath Gangaram Pednekar Jewellers | `jg-pednekar.png` | PNG, 632 × 395 | [Header logo](https://jgpednekarjewellers.s3.amazonaws.com/images/YouNMeByJGP/updated_logo__web.png), referenced by [homepage](https://www.jgpednekarjewellers.com/) |
| Michelin | `michelin.svg` | Vector, 534 × 120 | [Colour brand logo](https://www.michelin.in/public/themes/michelin-commercial/assets/images/logos/svg/logo-brand-color.svg), referenced by [homepage metadata](https://www.michelin.in/) |
| TyresNmore | `tyresnmore.png` | PNG, 1854 × 314 | [Header logo](https://tyresnmore.com/images/header/TnM_TM_BlackLogo.png), referenced by [homepage](https://tyresnmore.com/) |
| State Bank of India (SBI) | `sbi.png` | PNG, 125 × 43 | [Header logo](https://sbi.bank.in/o/SBI-Theme/images/custom/logo.png?refresh=1), referenced by [homepage](https://sbi.bank.in/). A cache-busting query was needed to retrieve the asset. |
| Wockhardt Hospitals | `wockhardt-hospitals.webp` | WebP, 276 × 49 | [Header logo](https://wockhardthospitals.com/wp-content/uploads/2025/09/wockhardtlogo.webp), referenced by [homepage](https://wockhardthospitals.com/) |
| Toyota India | `toyota.svg` | Vector, 136 × 24 | [Header logo](https://static3.toyotabharat.com/images/toyota-logo-main-136x24.svg), referenced by [official header](https://www.toyotabharat.com/common/header.html) |
| Maruti Suzuki India | `maruti-suzuki.svg` | Vector, 1398 × 156 | [Corporate logo](https://www.marutisuzuki.com/adobe/assets/urn:aaid:aem:791b5601-4cfa-4b0f-a77b-ec588eba84ad/as/Maruti-suzuki_logo_v1.svg), referenced by [homepage metadata](https://www.marutisuzuki.com/) |
| Milkbasket | `milkbasket.png` | PNG, 800 × 300 | [Horizontal logo](https://milkbasket.com/download/assets/img/logo/mb-logo-horizontal.png), referenced by [official download page](https://milkbasket.com/download/) |
| Truemeds | `truemeds.svg` | Vector, 202 × 48 | [Navigation logo](https://assets.truemeds.in/Images/website-assets/images/logo/truemedslogonav.svg), referenced by [homepage](https://www.truemeds.in/) |
| Apollo Diagnostics | `apollo-diagnostics.png` | PNG, 1920 × 1080 | [Header logo](https://apollodiagnostics.in/images/logo.png), referenced by [homepage](https://apollodiagnostics.in/) |
| Suburban Diagnostics | `suburban-diagnostics.webp` | WebP, 226 × 63 | [Website logo](https://media.suburbandiagnostics.com/home/assets/images/homepage/logo.webp), referenced by [homepage](https://www.suburbandiagnostics.com/) |
| Nova IVF Fertility | `nova-ivf.webp` | WebP, 350 × 54 | [Header logo](https://d1qrfl4c5a6fwd.cloudfront.net/live/s3fs-public/2026-04/nova-new-logo.webp), referenced by [homepage](https://www.novaivffertility.com/) |
| Decathlon Sports India | `decathlon.svg` | Vector, 188 × 28 | Inline SVG with `data-test-id="header-desktop:decathlon-logo"` on [homepage](https://www.decathlon.in/) |

Raster logos retain their website-supplied resolution; no artificial upscaling or tracing was applied. The client strip uses `object-fit: scale-down` to avoid enlarging low-resolution source images, including SBI's 125 × 43 header asset. Malabar's supplied white SVG is displayed on a charcoal card for contrast. Client relationships are supplied by the business and are not inferred from these downloads.

Performance update, October 28: the live strip uses optimized `jg-pednekar.webp` (35,438 bytes, quality 90) and lossless `apollo-diagnostics.webp` (45,964 bytes), both at their original dimensions. This replaces 367,304 bytes of PNG transfers with 81,402 bytes. The original downloaded PNG files are retained as sources. Every displayed logo is now below 64 KB; `scripts/optimize-site-media.mjs` reproduces the two WebP conversions.
