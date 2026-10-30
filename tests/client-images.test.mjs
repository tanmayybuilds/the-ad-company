import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('client logos resolve to real assets when hosted under the GitHub Pages path', async () => {
  const server = await createServer({
    base: '/the-ad-company/',
    server: { middlewareMode: true, watch: null, hmr: false, ws: false },
    appType: 'custom',
  });
  try {
    const { ClientStrip, CampaignPreview } = await server.ssrLoadModule('/src/components/site/ClientStrip.tsx');
    const { clients, work } = await server.ssrLoadModule('/src/content/site.ts');
    const markup = renderToStaticMarkup(createElement(ClientStrip));
    assert.match(markup, /data-brand-track/, 'The client showcase should include the shared track');
    const reverseStart = markup.indexOf('data-brand-row="reverse"');
    assert.ok(reverseStart > 0, 'The phone layout needs a second counterflow row');
    const primary = markup.slice(0, reverseStart), reverse = markup.slice(reverseStart);
    const split = Math.ceil(clients.items.length / 2);
    const secondaryCount = clients.items.length - split;
    const renderedCards = (clients.items.length + secondaryCount) * 2;
    assert.equal([...primary.matchAll(/data-brand-card=/g)].length, clients.items.length * 2, 'Desktop retains all clients and its identical loop copy');
    assert.equal([...reverse.matchAll(/data-brand-card=/g)].length, secondaryCount * 2, 'The counterflow row has its own seamless loop copy');
    const secondaryIndices = [...reverse.matchAll(/data-brand-index="(\d+)"/g)].map(match => Number(match[1])).filter(index => index < clients.items.length);
    assert.deepEqual(secondaryIndices, clients.items.map((_, index) => index).slice(split), 'The lower row must contain different brands from the first mobile half');
    assert.equal([...primary.matchAll(/aria-label="Preview /g)].length, clients.items.length);
    assert.equal([...reverse.matchAll(/aria-label="Preview /g)].length, secondaryCount, 'Visual loop duplicates must not add keyboard stops');
    assert.match(markup, /aria-label="Pause brand animation"/);
    assert.equal([...markup.matchAll(/View more/g)].length, renderedCards, 'Backs should show a clear preview action');
    assert.doesNotMatch(markup, /Campaign showcase coming soon/, 'Campaign details belong in the popup, not on spinning cards');
    assert.doesNotMatch(markup, /<canvas\b|<video\b/i, 'No invented campaign media or renderer dependency');
    const sources = [...markup.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]);
    assert.equal(sources.length, renderedCards);
    for (const source of sources) {
      const url = new URL(source, 'https://tanmayybuilds.github.io/the-ad-company/');
      assert.ok(url.pathname.startsWith('/the-ad-company/clients/'), `Wrong logo URL: ${url.href}`);
      assert.ok(existsSync(new URL(`../public/${url.pathname.slice('/the-ad-company/'.length)}`, import.meta.url)), `Missing logo: ${source}`);
      assert.ok(statSync(new URL(`../public/${url.pathname.slice('/the-ad-company/'.length)}`, import.meta.url)).size < 64_000, `Logo is unnecessarily heavy: ${source}`);
    }
    // A supplied campaign must bind only to its named brand and retain Pages-relative media URLs.
    work.projects.push({ id: 'test-campaign', client: clients.items[6].name, title: 'Fixture campaign', description: 'Fixture description', photos: [{ src: '/campaigns/fixture.jpg', alt: 'Fixture execution' }], deliverables: ['Fixture deliverable'] });
    try {
      const withCampaign = renderToStaticMarkup(createElement(CampaignPreview, { clientName: clients.items[6].name, active: false, motion: false }));
      assert.equal([...withCampaign.matchAll(/Fixture campaign/g)].length, 1);
      assert.equal([...withCampaign.matchAll(/src="\/the-ad-company\/campaigns\/fixture.jpg"/g)].length, 1);
      assert.match(withCampaign, /Fixture deliverable/);
      const otherBrand = renderToStaticMarkup(createElement(CampaignPreview, { clientName: clients.items[15].name, active: false, motion: false }));
      assert.match(otherBrand, /\/decathlon\/01-thumb.webp/);
      assert.doesNotMatch(otherBrand, /Fixture campaign/);
    } finally {
      work.projects.pop();
    }
  } finally {
    await server.close();
  }
});
