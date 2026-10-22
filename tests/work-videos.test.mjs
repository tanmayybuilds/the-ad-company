import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('the three bento illustrations bind to real MP4s under the Pages base path', async () => {
  const server = await createServer({ base: '/the-ad-company/', server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' });
  try {
    const { Work } = await server.ssrLoadModule('/src/components/site/Work.tsx');
    const { work } = await server.ssrLoadModule('/src/content/site.ts');
    const markup = renderToStaticMarkup(createElement(Work));
    const sources = [...markup.matchAll(/<video[^>]+src="([^"]+)"/g)].map(match => match[1]);
    assert.equal(sources.length, 3);
    assert.equal([...markup.matchAll(/aria-pressed="false"/g)].length, 3);
    assert.equal([...markup.matchAll(/aria-haspopup="dialog"/g)].length, 3);
    assert.equal([...markup.matchAll(/preload="metadata"/g)].length, 3);
    assert.doesNotMatch(markup, /autoplay|poster=|<img\b/i);
    assert.doesNotMatch(markup, /bento-view-cursor/);
    assert.match(markup, /Illustrative formats; campaign stories to follow/);
    assert.ok(readdirSync(new URL('../public/', import.meta.url)).includes('videos'), 'Directory case must match production URLs');
    for (const [index, source] of sources.entries()) {
      assert.equal(source, `/the-ad-company/videos/card_0${index + 1}.mp4#t=0.001`);
      const bytes = readFileSync(new URL(`../public${work.examples[index].video}`, import.meta.url));
      assert.equal(bytes.toString('ascii', 4, 8), 'ftyp');
    }
  } finally { await server.close(); }
});
