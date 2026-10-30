# Mobile branch release readiness

This branch contains the approved mobile homepage, gallery navigation, Services player, alternating team profiles, restored contact introduction, compact submission form and footer. Desktop presentation is retained, with the nine subsequently supplied photographs installed in its What we do showcase; desktop services without photos are omitted. Mobile remains isolated from that photo dataset. The branch is a source release; pushing it does not publish `gh-pages` or merge into `main`.

## Reproducible verification

Use Node 24 from `.nvmrc`, then run:

```sh
npm ci
npm run verify
npm audit --audit-level=high
```

`verify` runs all Node tests, TypeScript checking, the production Vite build, and checks both generated HTML pages, their local entry assets and the GitHub Pages marker. Tests cover application behavior and hosting under a repository subdirectory. CI repeats this process on pull requests and pushes to `main` and `mobile-adcompany`; it has read-only repository permissions and no deployment job.

The Vite dependency is updated within version 8 to resolve the advisories reported against 8.1.5. PostCSS is explicitly declared because tests import its parser directly. Local backups, environment files, generated build output and logs are ignored.

## Before public launch

- Configure the public `VITE_WEB3FORMS_ACCESS_KEY` for `ad@theadcompany.in`, rebuild, and verify an approved enquiry arrives. The user will provide the key later. Until then, sending is disabled and the visitor sees a clear connection notice. See [Web3Forms setup](web3forms-setup.md).
- Approve the business privacy notice and any campaign claims/images required for public launch. Illustrations remain explicitly labelled; missing execution photos are not invented.
- Complete the user's manual phone/desktop review. No browser automation or real-device acceptance test was performed for this release.
- The homepage/gallery keep `noindex,nofollow` and `robots.txt` blocks indexing until these launch items are complete. Update these only as part of the approved public launch, then verify the live domain and canonical URLs.

## Publishing separately

After launch approval and configuration, build and publish `dist/` through the existing hosting process. Keep `.nojekyll`. Do not publish local source backups, credentials or `.env.local`. Environment values beginning with `VITE_` are bundled into public client code; only Web3Forms' public form access key belongs there, never private management credentials.
