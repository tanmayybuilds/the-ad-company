import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

test('the homepage and gallery use the corrected .in contact address and email links', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom' });
  try {
    const { company } = await server.ssrLoadModule('/src/content/site.ts');
    assert.equal(company.contact.email, 'ad@theadcompany.in');
    const { App } = await server.ssrLoadModule('/src/main.tsx');
    const { Gallery } = await server.ssrLoadModule('/src/components/site/Gallery.tsx');
    for (const component of [App, Gallery]) {
      const markup = renderToStaticMarkup(createElement(component));
      assert.match(markup, /href="mailto:ad@theadcompany.in"/);
      assert.doesNotMatch(markup, /ad@theadcompany.com/);
    }
  } finally { await server.close(); }
});
