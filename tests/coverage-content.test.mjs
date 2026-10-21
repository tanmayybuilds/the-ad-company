import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('coverage keeps every location selectable and separates enquiry links from card buttons', async () => {
  const server = await createServer({ server: { middlewareMode: true, watch: null, hmr: false }, appType: 'custom' });
  try {
    const { CoverflowCoverage } = await server.ssrLoadModule('/src/components/site/CoverflowCoverage.tsx');
    const { coverage } = await server.ssrLoadModule('/src/content/site.ts');
    const markup = renderToStaticMarkup(createElement(CoverflowCoverage));
    const nav = markup.match(/<nav\b[\s\S]*?<\/nav>/)?.[0];
    assert.ok(nav);
    for (const location of coverage.locations) assert.ok(nav.includes(`>${location.name}</button>`));
    assert.match(markup, /href="#contact"/);
    assert.match(markup, /Illustrative city scene/);
    for (const button of markup.matchAll(/<button\b[\s\S]*?<\/button>/g)) {
      assert.doesNotMatch(button[0], /<a\b/, 'A card button must not contain another interactive control');
    }
    assert.equal([...markup.matchAll(/class="cov-city-art" aria-hidden="true"/g)].length, coverage.locations.length);
  } finally { await server.close(); }
});
