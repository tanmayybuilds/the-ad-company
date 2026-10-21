import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('client logos resolve to real assets when hosted under the GitHub Pages path', async () => {
  const server = await createServer({
    base: '/the-ad-company/',
    server: { middlewareMode: true, watch: null },
    appType: 'custom',
  });
  try {
    const { ClientStrip } = await server.ssrLoadModule('/src/components/site/ClientStrip.tsx');
    const { clients, work } = await server.ssrLoadModule('/src/content/site.ts');
    const markup = renderToStaticMarkup(createElement(ClientStrip));
    assert.match(markup, /data-brand-track/, 'The client showcase should include the shared track');
    assert.equal([...markup.matchAll(/data-brand-card=/g)].length, clients.items.length * 2, 'Two identical groups make the loop seamless');
    assert.equal([...markup.matchAll(/aria-label="Preview /g)].length, clients.items.length, 'Every brand has exactly one keyboard control');
    assert.match(markup, /aria-label="Pause brand animation"/);
    assert.doesNotMatch(markup, /<canvas\b|<video\b/i, 'No invented campaign media or renderer dependency');
    const sources = [...markup.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]);
    assert.equal(sources.length, clients.items.length * 2);
    for (const source of sources) {
      const url = new URL(source, 'https://tanmayybuilds.github.io/the-ad-company/');
      assert.ok(url.pathname.startsWith('/the-ad-company/clients/'), `Wrong logo URL: ${url.href}`);
      assert.ok(existsSync(new URL(`../public/${url.pathname.slice('/the-ad-company/'.length)}`, import.meta.url)), `Missing logo: ${source}`);
    }
    // A supplied campaign must bind only to its named brand and retain Pages-relative media URLs.
    work.projects.push({ id: 'test-campaign', client: clients.items[0].name, title: 'Fixture campaign', description: 'Fixture description', photos: [{ src: '/campaigns/fixture.jpg', alt: 'Fixture execution' }], deliverables: ['Fixture deliverable'] });
    try {
      const withCampaign = renderToStaticMarkup(createElement(ClientStrip));
      assert.equal([...withCampaign.matchAll(/Fixture campaign/g)].length, 2);
      assert.equal([...withCampaign.matchAll(/src="\/the-ad-company\/campaigns\/fixture.jpg"/g)].length, 2);
      assert.match(withCampaign, /Fixture deliverable/);
      assert.equal([...withCampaign.matchAll(/Campaign showcase coming soon/g)].length, (clients.items.length - 1) * 2);
    } finally {
      work.projects.pop();
    }
  } finally {
    await server.close();
  }
});
