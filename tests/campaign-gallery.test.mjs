import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { galleryItems } from '../src/lib/gallery.mjs';

test('the photo wall interleaves brands and preserves single-brand order with a strict three-photo maximum', () => {
  const brands = [{ id: 'a', name: 'Alpha', photos: [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }, { id: 'a4' }] }, { id: 'b', name: 'Beta', photos: [{ id: 'b1' }] }];
  assert.deepEqual(galleryItems(brands).map(photo => photo.id), ['a1', 'b1', 'a2', 'a3']);
  assert.deepEqual(galleryItems(brands, 'a').map(photo => photo.id), ['a1', 'a2', 'a3']);
  assert.equal(galleryItems(brands, 'missing').length, 0);
  assert.equal(galleryItems(brands)[1].brandName, 'Beta');
});

test('curated campaign media maps to real clients, stays within budgets and never exceeds three photos per brand', async () => {
  const server = await createServer({ base: '/the-ad-company/', server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { clients, work } = await server.ssrLoadModule('/src/content/site.ts');
    const { default: catalogue } = await server.ssrLoadModule('/src/content/campaigns.json');
    assert.equal(catalogue.brands.length, 16);
    assert.equal(catalogue.brands.find(brand => brand.id === 'decathlon')?.photos.length, 3);
    const ids = new Set();
    for (const brand of catalogue.brands) {
      assert.ok(brand.photos.length >= 1 && brand.photos.length <= 3);
      if (brand.id !== 'highland') assert.ok(clients.items.some(client => client.name === brand.name), brand.name);
      const project = work.projects.find(project => project.client === brand.name);
      assert.ok(project, brand.name);
      assert.equal(project.photos.length, brand.photos.length);
      for (const photo of brand.photos) {
        assert.ok(!ids.has(photo.id)); ids.add(photo.id);
        assert.ok(photo.alt.includes(brand.name));
        assert.ok(photo.width > 0 && photo.height > 0);
        for (const [source, budget] of [[photo.thumbnail, 100_000], [photo.src, 350_000]]) {
          const file = new URL(`../public${source}`, import.meta.url);
          const bytes = readFileSync(file);
          assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
          assert.ok(statSync(file).size < budget, source);
        }
      }
    }
    assert.ok(!work.projects.some(project => project.client === 'State Bank of India (SBI)'));
    const { CampaignPreview } = await server.ssrLoadModule('/src/components/site/ClientStrip.tsx');
    for (const brand of catalogue.brands.filter(brand => brand.id !== 'highland')) {
      const markup = renderToStaticMarkup(createElement(CampaignPreview, { clientName: brand.name, active: false, motion: false }));
      assert.match(markup, new RegExp(`/the-ad-company/gallery.html\\?brand=${brand.id}`));
      assert.ok(markup.includes(brand.photos[0].thumbnail));
      assert.doesNotMatch(markup, /Campaign showcase coming soon/);
    }
  } finally { await server.close(); }
});

test('gallery is a separate page with working filters, lazy previews, a native viewer and homepage navigation', async () => {
  const server = await createServer({ base: '/the-ad-company/', server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { Gallery } = await server.ssrLoadModule('/src/components/site/Gallery.tsx');
    const { default: catalogue } = await server.ssrLoadModule('/src/content/campaigns.json');
    for (const selected of ['all', 'malabar', 'michelin', 'highland', 'decathlon', 'invalid']) {
      const markup = renderToStaticMarkup(createElement(Gallery, { initialBrand: selected }));
      const expected = galleryItems(catalogue.brands, selected === 'invalid' ? 'all' : selected);
      assert.equal([...markup.matchAll(/class="gallery-photo-button"/g)].length, expected.length);
      assert.equal([...markup.matchAll(/aria-pressed="true"/g)].length, 1);
      assert.match(markup, /loading="lazy"/);
      assert.match(markup, /<dialog\b/);
      assert.match(markup, /href="\/the-ad-company\/#services"/);
      assert.match(markup, /href="\/the-ad-company\/#contact"/);
      const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
      assert.equal(new Set(ids).size, ids.length);
      for (const match of markup.matchAll(/\bhref="#([^"]+)"|\b(?:aria-labelledby|aria-controls)="([^"]+)"/g)) {
        for (const id of (match[1] || match[2]).split(/\s+/)) assert.ok(ids.includes(id), id);
      }
      for (const match of markup.matchAll(/\bsrc="([^"]+)"/g)) assert.ok(match[1].startsWith('/the-ad-company/'), match[1]);
    }
    const { App } = await server.ssrLoadModule('/src/main.tsx');
    const home = renderToStaticMarkup(createElement(App));
    assert.match(home, /href="\/the-ad-company\/gallery.html"/);
    assert.doesNotMatch(home, /class="gallery-wall"|\/campaigns\//, 'The landing page must not load the photo wall or hidden client photos');
    assert.ok(readFileSync(new URL('../gallery.html', import.meta.url), 'utf8').includes('/src/gallery.tsx'));
  } finally { await server.close(); }
});
