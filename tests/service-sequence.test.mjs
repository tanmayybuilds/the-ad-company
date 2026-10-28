import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { TOTAL_FRAMES, ZONE_STARTS, sequenceFrame, sequenceProgressFrame, sequenceZone, sequenceSource, sequenceWindow } from '../src/lib/service-sequence.mjs';

test('the complete five videos retain every source frame plus four 18-frame dissolves', () => {
  assert.equal(TOTAL_FRAMES, 1269);
  assert.deepEqual(ZONE_STARTS, [0, 258, 515, 772, 1030]);
});

test('frame loading is bounded and prioritizes the current frame in either scroll direction', () => {
  assert.deepEqual(sequenceWindow(100), [100, 99, 101, 98, 102, 97, 103, 96, 104, 95, 105, 94, 106, 93, 107, 92, 108]);
  assert.deepEqual(sequenceWindow(0), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(sequenceWindow(TOTAL_FRAMES - 1), Array.from({ length: 9 }, (_, i) => TOTAL_FRAMES - 1 - i));
  assert.deepEqual(sequenceWindow(99, true), [99]);
  for (let frame = -1; frame <= TOTAL_FRAMES + 1; frame++) {
    const window = sequenceWindow(frame);
    assert.ok(window.length <= 17);
    assert.equal(new Set(window).size, window.length);
    assert.ok(window.every(index => index >= 0 && index < TOTAL_FRAMES));
  }
});

test('scroll progress reaches every frame and selects the same category in both directions', () => {
  const forward = Array.from({ length: TOTAL_FRAMES }, (_, frame) => sequenceProgressFrame(frame / (TOTAL_FRAMES - 1)));
  assert.deepEqual(forward, Array.from({ length: TOTAL_FRAMES }, (_, frame) => frame));
  assert.deepEqual([...forward].reverse().map(frame => sequenceProgressFrame(frame / (TOTAL_FRAMES - 1))), [...forward].reverse());
  assert.deepEqual([0, .3, .5, .7, .9, 1].map(progress => sequenceZone(sequenceProgressFrame(progress))), [0, 1, 2, 3, 4, 4]);
  assert.equal(sequenceProgressFrame(-1), 0);
  assert.equal(sequenceProgressFrame(2), TOTAL_FRAMES - 1);
});

test('all frames map to the five videos and valid local WebP assets with 1080 × 608 dimensions', () => {
  const counts = [0, 0, 0, 0, 0];
  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    counts[sequenceZone(frame)]++;
    const path = sequenceSource(frame);
    const bytes = readFileSync(new URL(`../public${path}`, import.meta.url));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', path);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', path);
    assert.ok(bytes.length > 100, path);
    assert.equal(bytes.toString('ascii', 12, 16), 'VP8 ', path);
    assert.deepEqual([bytes.readUInt16LE(26) & 0x3fff, bytes.readUInt16LE(28) & 0x3fff], [1080, 608], path);
  }
  assert.deepEqual(counts, [249, 257, 257, 258, 248]);
  assert.deepEqual(ZONE_STARTS.map(sequenceZone), [0, 1, 2, 3, 4]);
  for (let zone = 1; zone < ZONE_STARTS.length; zone++) {
    assert.equal(sequenceZone(ZONE_STARTS[zone] - 10), zone - 1);
    assert.equal(sequenceZone(ZONE_STARTS[zone] - 9), zone);
  }
  assert.equal(sequenceFrame(-10), 0);
  assert.equal(sequenceFrame(9999), TOTAL_FRAMES - 1);
  assert.equal(sequenceSource(TOTAL_FRAMES - 1, '/the-ad-company/'), '/the-ad-company/frames/services-v2/frame_1269.webp');
  const manifest = JSON.parse(readFileSync(new URL('../public/frames/services-v2/manifest.json', import.meta.url), 'utf8'));
  assert.deepEqual(manifest.clips.map(clip => clip.frames), [240, 239, 239, 240, 239]);
  assert.deepEqual(manifest.clips.map(clip => clip.id), ['residential', 'corporate', 'outdoor', 'cinema', 'delivery']);
  assert.equal(manifest.totalFrames, TOTAL_FRAMES);
  assert.equal(manifest.transitionFrames, 18);
  assert.equal(manifest.fps, 24);
  assert.deepEqual([manifest.width, manifest.height], [1080, 608]);
  assert.ok(manifest.clips.every(clip => /^[a-f0-9]{64}$/.test(clip.sha256)));
});

test('the environment index exposes all five categories and only the active description', async () => {
  const server = await createServer({ base: '/the-ad-company/', server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom' });
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
    assert.match(markup, /src="\/the-ad-company\/frames\/services-v2\/frame_0001.webp"/);
  } finally { await server.close(); }
});
