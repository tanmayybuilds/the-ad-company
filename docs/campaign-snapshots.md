# Curated campaign snapshots

The user supplied 398 JPEGs and one MP4 across 17 folders, then limited the website to a maximum of three best photographs per brand. Reviewed contact sheets of all photographs; selected 40 photographs across the 15 populated brand folders. Selection prioritizes clear branding, useful context, sharpness and different placements. The video, exact duplicates, near-duplicate views, dark door-hanger shots, a spreadsheet screenshot, and photographs with minimal visible campaign artwork are excluded from the curated gallery.

The initial Decathlon folder was empty; a later six-photo Decathlon pack now supplies three curated shots. Only State Bank of India retains the pending notice. The gallery now contains 43 photos across 16 brands. Highland's folder also contains a Wockhardt-branded image; it was excluded from the Highland selection. Highland is included by name in the gallery without inventing or adding a logo to the existing 16-logo roster.

| Source folder | Website brand | Selected photos |
| --- | --- | ---: |
| Malabar Gold and Diamonds | Malabar Gold and Diamonds | 3 |
| Maruti Suzuki | Maruti Suzuki India | 3 |
| True Meds | Truemeds | 3 |
| The Diamond Factory | TDF Diamonds & Gold | 3 |
| Vihan | Vihan Modular | 3 |
| JGP | Jagannath Gangaram Pednekar Jewellers | 3 |
| Michelin | Michelin | 1 |
| TyersNmore | TyresNmore | 3 |
| Wockard | Wockhardt Hospitals | 3 |
| Toyota | Toyota India | 3 |
| Milk Basket | Milkbasket | 3 |
| Apollo Diagnostics | Apollo Diagnostics | 2 |
| Suburban | Suburban Diagnostics | 3 |
| Nova | Nova IVF Fertility | 2 |
| Highland | Highland | 2 |
| Decathlon (additional pack) | Decathlon Sports India | 3 |

`scripts/campaign-selection.json` records exact original filenames, SHA-256 checksums and descriptive alt text. `src/content/campaigns.json` supplies the same selected media to both the homepage client dialogs and `gallery.html`. Brand previews show one photo at a time with manual wrapping controls and brand-filtered gallery links. There is no automatic photo carousel or hidden photo-wall download on the landing page.

Images retain their entire framing and their corrected orientation. Each has a 640 px WebP preview and a 1440 px full-size version (maximum long edge, no upscaling). All previews total 1,654,174 bytes; full images total 6,218,536 bytes. Gallery previews are lazy-loaded and full images are requested only when opened. There are no added runtime dependencies or original full JPEG copies in the deployment.

To regenerate, use Python with Pillow (available in the bundled runtime):

```powershell
python scripts/prepare-campaign-snapshots.py 'C:/Users/Tanmay/Downloads/Campaign Snapshots-20261028T075504Z-1-001/Campaign Snapshots'
```

The script checks original hashes and the three-photo cap before writing, preserves source files and refuses to overwrite an existing `public/campaigns` directory. Presentation copy remains in `src/content/site.ts`; gallery-specific styles live in `src/components/site/gallery.css`.

The later Decathlon pack is imported incrementally with `python scripts/prepare-campaign-snapshots.py 'C:/Users/Tanmay/Downloads/Decathlon-20261028T110449Z-1-001' decathlon`. It preserves existing brand outputs and refuses duplicate catalogue entries. A full regeneration now requires a combined source directory containing the selected original brand folders and the later Decathlon folder; the initial pack's empty Decathlon folder is insufficient. Exceptionally detailed full images use quality 76 when quality 82 exceeds the 350 KB transfer budget.

`gallery.html` is a separate build entry, so direct links, brand query strings and refreshes work on GitHub Pages without a routing library. Shared navigation resolves homepage sections correctly from either page. The gallery uses one entrance fan and a filter-triggered photo-wall reveal, with a small unpinned scroll movement. Reduced motion retains all content and controls without these animations. The native viewer handles Escape, left/right keys, focus restoration and body-scroll restoration.

Validation: 73 tests passed, including catalogue mapping, transfer budgets, alias/empty-folder handling, strict maximum counts, separate-page links and assets, actual filter/keyboard/client-photo handlers, and dialog focus/scroll cleanup. TypeScript and the multi-page Vite build passed. Browser visual inspection is excluded by the repository's AGENTS.md unless explicitly requested; responsive appearance and motion still need device review.
