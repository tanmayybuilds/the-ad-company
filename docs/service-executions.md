# Service execution photographs

The nine explicitly supplied October 28 service photographs populate the existing coverflow. Only services with an execution image appear in the cards, selector, categories and counter. The full catalogue remains saved in content; adding an execution image makes that service appear on the next build. No additional campaign photographs were taken from the source folder.

| Service ID | Source file | Display service |
| --- | --- | --- |
| hoardings | Hoarding.jpg | Hoardings |
| lift-posters | Lift Poster.jpg | Lift posters |
| pole-kiosks | Pole Kiosk.jpg | Pole kiosks |
| community | Society BTL Activity.jpg | Society BTL activity |
| tagging | Tagging Activity.jpg | Tagging activity |
| van | Van Branding 2.jpg | Van branding |
| auto | Auto Branding.jpg | Auto branding |
| cab | Cab Branding.jpg | Cab branding |
| outdoor-digital | Digital Hoarding.jpg | Digital hoardings |

Lift posters, tagging activity and van branding are new service entries. They were also added to the relevant shared service catalogue/environment lists, so service details include them; enquiries retain the existing category choices. Existing Community activations and Outdoor digital advertising labels remain as aliases for Society BTL activity and Digital hoardings. There are 40 saved service entries: 9 displayed executions and 31 hidden until photographs are supplied.

Brand captions use only clearly identifiable brands. Pune and Kalyan are copied from the respective photo watermarks. Venue names printed on advertising creatives are not assumed to be the photograph's location. No results or performance claims are added.

Assets in `public/service-executions/` preserve complete framing and corrected orientation. Full images have a maximum 1440 px long edge; previews have a maximum 640 px long edge, with no upscaling. The 18 WebPs total 1,894,062 bytes. Metadata in `src/content/service-executions.json` records each actual image/preview width for accurate responsive selection. Existing coverflow code requests only the active execution and its two visual neighbours.

The originals remain untouched. Reproduction uses Python with the existing Pillow installation:

```powershell
python scripts/prepare-service-executions.py 'C:/Users/Tanmay/Downloads/Services -20261028T132521Z-1-001/Services'
```

The preparation script refuses existing outputs, validates source presence, decodes each generated WebP and checks dimensions and transfer budgets. Existing outputs must be preserved before any deliberate regeneration. The Node test checks all nine mappings, source-set widths, full dimensions and file budgets alongside the service picker and page-integrity checks.
