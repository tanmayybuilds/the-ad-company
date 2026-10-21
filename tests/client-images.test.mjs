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
    const { clients } = await server.ssrLoadModule('/src/content/site.ts');
    const markup = renderToStaticMarkup(createElement(ClientStrip));
    const sources = [...markup.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]);
    assert.equal(sources.length, clients.items.length);
    for (const source of sources) {
      const url = new URL(source, 'https://tanmayybuilds.github.io/the-ad-company/');
      assert.ok(url.pathname.startsWith('/the-ad-company/clients/'), `Wrong logo URL: ${url.href}`);
      assert.ok(existsSync(new URL(`../public/${url.pathname.slice('/the-ad-company/'.length)}`, import.meta.url)), `Missing logo: ${source}`);
    }
  } finally {
    await server.close();
  }
});
