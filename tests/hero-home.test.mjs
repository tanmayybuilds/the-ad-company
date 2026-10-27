import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('the homepage has a readable heading, six campaign panels and honest optional-image placeholders', async () => {
  const server = await createServer({ base: '/the-ad-company/', server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { Hero } = await server.ssrLoadModule('/src/components/site/Hero.tsx');
    const { hero } = await server.ssrLoadModule('/src/content/site.ts');
    const markup = renderToStaticMarkup(createElement(Hero));
    assert.match(markup, /<h1[^>]+aria-label="Your brand\. Where it matters\."/);
    assert.equal([...markup.matchAll(/class="home-panel-slot /g)].length, 6);
    assert.equal(hero.panels.length, 6);
    for (const panel of hero.panels) assert.ok(markup.includes(panel.channel.replaceAll('&', '&amp;')));
    assert.match(markup, /\/the-ad-company\/brand\/billboard.jpg/);
    assert.equal([...markup.matchAll(/Artwork placeholder/g)].length, 5);
    assert.match(markup, /href="#work"/);
    assert.match(markup, /href="#contact"/);
    assert.doesNotMatch(markup, /<video|<canvas|src="(?:null|undefined)"|A little scroll|data-home-cue|Scroll to set things in motion/);
  } finally { await server.close(); }
});
