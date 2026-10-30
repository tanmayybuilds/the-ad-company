import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('the complete page has unique IDs, valid anchors and labels, and real local assets under a hosting subpath', async () => {
  const base = '/the-ad-company/';
  const server = await createServer({ base, server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { App } = await server.ssrLoadModule('/src/main.tsx');
    const markup = renderToStaticMarkup(createElement(App));
    const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, 'IDs must be unique across the actual page');
    for (const match of markup.matchAll(/\bhref="#([^"]+)"|\b(?:aria-labelledby|aria-describedby|aria-controls|for)="([^"]+)"/g)) {
      for (const id of (match[1] || match[2]).split(/\s+/)) assert.ok(ids.includes(id), `Missing anchor or accessible label: ${id}`);
    }
    const paths = new Set([...markup.matchAll(/\b(?:src|poster)="([^"]+)"/g)].map(match => match[1]));
    const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
    for (const match of css.matchAll(/url\(["']?(\/[^\s)'"?]+)/g)) paths.add(base + match[1].slice(1));
    for (const source of paths) {
      if (/^(?:https?:|data:)/.test(source)) continue;
      assert.ok(source.startsWith(base), `Asset loses hosting subpath: ${source}`);
      const relative = decodeURIComponent(new URL(source, 'https://example.test').pathname.slice(base.length));
      const segments = (relative.startsWith('src/') ? relative : `public/${relative}`).split('/');
      let directory = new URL('../', import.meta.url);
      for (const segment of segments) {
        assert.ok(readdirSync(directory).includes(segment), `Missing or incorrectly cased asset: ${source}`);
        directory = new URL(`${segment}/`, directory);
      }
    }
    for (const section of ['services', 'work', 'about', 'coverage', 'team', 'contact', 'privacy']) assert.ok(ids.includes(section));
    assert.doesNotMatch(markup, /Download my brief|does not submit an enquiry/);
  } finally { await server.close(); }
});
