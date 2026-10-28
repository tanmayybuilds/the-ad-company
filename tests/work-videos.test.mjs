import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('the three bento illustrations bind to real MP4s under the Pages base path', async () => {
  const server = await createServer({ base: '/the-ad-company/', server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom' });
  try {
    const { Work } = await server.ssrLoadModule('/src/components/site/Work.tsx');
    const { work } = await server.ssrLoadModule('/src/content/site.ts');
    const markup = renderToStaticMarkup(createElement(Work));
    const sources = [...markup.matchAll(/<video[^>]+src="([^"]+)"/g)].map(match => match[1]);
    assert.equal(sources.length, 3);
    assert.equal([...markup.matchAll(/aria-haspopup="dialog"/g)].length, 6, 'Both each animation and its View more button must open details');
    assert.equal([...markup.matchAll(/aria-label="View more:/g)].length, 6);
    assert.equal([...markup.matchAll(/preload="none"/g)].length, 3, 'Work previews must not compete with Services for video bandwidth before interaction');
    assert.equal([...markup.matchAll(/poster="\/the-ad-company\/videos\/Card_0\d-poster.webp"/g)].length, 3);
    assert.doesNotMatch(markup, /autoplay|<img\b/i);
    assert.doesNotMatch(markup, /bento-view-cursor/);
    assert.match(markup, /Illustrative formats; campaign stories to follow/);
    assert.ok(readdirSync(new URL('../public/', import.meta.url)).includes('videos'), 'Directory case must match production URLs');
    for (const [index, source] of sources.entries()) {
      assert.equal(source, `/the-ad-company/videos/Card_0${index + 1}-web.mp4#t=0.001`);
      const bytes = readFileSync(new URL(`../public${work.examples[index].video}`, import.meta.url));
      assert.equal(bytes.toString('ascii', 4, 8), 'ftyp');
      assert.ok(bytes.length < 6_000_000, 'Each work video must stay below 6 MB');
      assert.ok(bytes.indexOf(Buffer.from('moov')) < bytes.indexOf(Buffer.from('mdat')), 'Work videos need fast-start metadata');
      const poster = readFileSync(new URL(`../public${work.examples[index].poster}`, import.meta.url));
      assert.ok(poster.length < 50_000, 'Preview posters must remain lightweight');
    }
  } finally { await server.close(); }
});
