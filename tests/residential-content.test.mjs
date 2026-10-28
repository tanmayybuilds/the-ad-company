import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('the opt-in page replaces only Services and exposes five placements, fallback, skip and original-page links', async () => {
  const server = await createServer({ base: '/the-ad-company/', server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { App } = await server.ssrLoadModule('/src/main.tsx');
    const markup = renderToStaticMarkup(createElement(App, { residentialPrototype: true }));
    assert.equal([...markup.matchAll(/id="services"/g)].length, 1);
    assert.equal([...markup.matchAll(/class="rj-stop-line"/g)].length, 5);
    assert.match(markup, /\/the-ad-company\/brand\/logo.svg/);
    assert.match(markup, /href="\/the-ad-company\/#services"/);
    assert.match(markup, /href="#work"/);
    assert.match(markup, /class="rj-still"/);
    assert.doesNotMatch(markup, /service-zones|frames\/frame_/);
    for (const id of ['top', 'work', 'about', 'coverage', 'team', 'contact']) assert.ok(markup.includes(`id="${id}"`));
    const normal = renderToStaticMarkup(createElement(App));
    assert.match(normal, /service-zones/);
    assert.doesNotMatch(normal, /class="rj-section"/);
  } finally { await server.close(); }
});
