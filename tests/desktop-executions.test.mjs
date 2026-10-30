import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

test('desktop showcases only the nine supplied execution photos with valid subject crops; mobile remains unchanged', async () => {
  const server = await createServer({ base: '/the-ad-company/', server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { desktopServiceShowcase, serviceShowcase } = await server.ssrLoadModule('/src/content/site.ts');
    const { CoverflowCoverage } = await server.ssrLoadModule('/src/components/site/CoverflowCoverage.tsx');
    assert.ok(desktopServiceShowcase);
    const items = desktopServiceShowcase.items;
    assert.equal(items.length, 9);
    assert.equal(new Set(items.map(item => item.id)).size, 9);
    for (const item of items) {
      const photo = item.execution;
      assert.ok(photo?.src && photo.alt);
      assert.ok(existsSync(new URL(`../public${photo.src}`, import.meta.url)));
      assert.ok(statSync(new URL(`../public${photo.src}`, import.meta.url)).size < 300_000);
      const [x, y, width, height] = photo.crop;
      assert.ok(x >= 0 && y >= 0 && width > 0 && height > 0);
      assert.ok(x + width <= photo.width && y + height <= photo.height);
    }
    assert.ok(serviceShowcase.items.every(item => !item.execution), 'Desktop images must not reveal a new section or navigation item on mobile');
    const markup = renderToStaticMarkup(createElement(CoverflowCoverage));
    const options = markup.match(/<select\b[\s\S]*?<\/select>/)[0];
    assert.equal([...options.matchAll(/<option\b/g)].length, 9);
    assert.doesNotMatch(options, /Television|Radio|In-flight|Coworking/);
    assert.doesNotMatch(markup, /coming soon|being curated/);
    assert.equal([...markup.matchAll(/class="cov-execution-photo"/g)].length, 3, 'Only the current photo and its two neighbours should load');
    assert.match(markup, /href="\/the-ad-company\/executions\//);
    assert.match(markup, /viewBox="90 300 760 810"/);
  } finally { await server.close(); }
});
