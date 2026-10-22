import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { TOTAL_FRAMES, ZONE_STARTS, sequenceFrame, sequenceProgressFrame, sequenceZone, sequenceSource } from '../src/lib/service-sequence.mjs';

test('scroll progress reaches every frame and selects the same category in both directions', () => {
  const forward = Array.from({ length: TOTAL_FRAMES }, (_, frame) => sequenceProgressFrame(frame / 265));
  assert.deepEqual(forward, Array.from({ length: TOTAL_FRAMES }, (_, frame) => frame));
  assert.deepEqual([...forward].reverse().map(frame => sequenceProgressFrame(frame / 265)), [...forward].reverse());
  assert.deepEqual([0, .2, .4, .6, .8, 1].map(progress => sequenceZone(sequenceProgressFrame(progress))), [0, 1, 2, 3, 4, 4]);
  assert.equal(sequenceProgressFrame(-1), 0);
  assert.equal(sequenceProgressFrame(2), 265);
});

test('all 266 frames map to the five requested ranges and valid local WebP assets', () => {
  const counts = [0, 0, 0, 0, 0];
  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    counts[sequenceZone(frame)]++;
    const path = sequenceSource(frame);
    const bytes = readFileSync(new URL(`../public${path}`, import.meta.url));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', path);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', path);
    assert.ok(bytes.length > 100, path);
  }
  assert.deepEqual(counts, [53, 53, 53, 53, 54]);
  assert.deepEqual(ZONE_STARTS.map(sequenceZone), [0, 1, 2, 3, 4]);
  for (let zone = 1; zone < ZONE_STARTS.length; zone++) {
    assert.equal(sequenceZone(ZONE_STARTS[zone] - 1), zone - 1);
  }
  assert.equal(sequenceFrame(-10), 0);
  assert.equal(sequenceFrame(999), 265);
  assert.equal(sequenceSource(265, '/the-ad-company/'), '/the-ad-company/frames/frame_0266.webp');
});

test('the environment index exposes all five categories and only the active description', async () => {
  const server = await createServer({ base: '/the-ad-company/', server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' });
  try {
    const { Services } = await server.ssrLoadModule('/src/components/site/Services.tsx');
    const { services } = await server.ssrLoadModule('/src/content/site.ts');
    const markup = renderToStaticMarkup(createElement(Services));
    assert.equal([...markup.matchAll(/class="service-zone-card"/g)].length, 5);
    assert.equal([...markup.matchAll(/aria-expanded="true"/g)].length, 1);
    assert.equal([...markup.matchAll(/class="service-zone-details" aria-hidden="true"/g)].length, 4);
    for (const service of services.items) {
      assert.ok(markup.includes(`aria-controls="service-details-${service.id}"`));
      assert.ok(markup.includes(`id="service-details-${service.id}"`));
    }
    assert.match(markup, /src="\/the-ad-company\/frames\/frame_0001.webp"/);
  } finally { await server.close(); }
});
