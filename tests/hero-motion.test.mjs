import test from 'node:test';
import assert from 'node:assert/strict';
import { heroScatter } from '../src/lib/hero-motion.mjs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('the opening scatters letters and artwork across the whole viewport, deterministically', () => {
  for (const [width, height] of [[360, 740], [1440, 900], [2560, 1440]]) {
    for (const [type, count] of [['letter', 25], ['panel', 6]]) {
      const points = Array.from({ length: count }, (_, index) => heroScatter(index, width, height, type));
      assert.deepEqual(points, points.map((_, index) => heroScatter(index, width, height, type)));
      assert.ok(Math.min(...points.map(p => p.x)) < width * .3);
      assert.ok(Math.max(...points.map(p => p.x)) > width * .7);
      assert.ok(Math.min(...points.map(p => p.y)) < height * .3);
      assert.ok(Math.max(...points.map(p => p.y)) > height * .7);
      for (const { x, y, rotation } of points) {
        assert.ok(x >= width * .05 && x <= width * .95);
        assert.ok(y >= height * .14 && y <= height * .88);
        assert.ok(Number.isFinite(rotation) && Math.abs(rotation) <= 65);
      }
    }
  }
});

test('the landing animation plays automatically once, without pinning or controlling scrolling', async () => {
  const previous = globalThis.__heroMotionTest;
  const originalGlobals = Object.fromEntries(['window', 'document', 'getComputedStyle', 'ResizeObserver', 'requestAnimationFrame', 'cancelAnimationFrame'].map(key => [key, globalThis[key]]));
  const server = await createServer({ server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom', plugins: [{
    name: 'hero-motion-boundaries', enforce: 'pre',
    resolveId(id) { if (id === 'virtual:hero-hooks' || id === 'virtual:hero-gsap') return '\0' + id; },
    load(id) {
      if (id === '\0virtual:hero-hooks') return 'export const useRef = value => { const ref = { current: value }; globalThis.__heroMotionTest.refs.push(ref); return ref; };';
      if (id === '\0virtual:hero-gsap') return `
        export const MQ = { motion: 'motion' };
        export const ScrollTrigger = { refresh() {} };
        export const useGSAP = setup => { globalThis.__heroMotionTest.setup = setup; };
        export const gsap = {
          set: (targets, values) => { globalThis.__heroMotionTest.initial.push({ targets, values }); },
          utils: { selector: () => selector => [selector] },
          matchMedia: () => {
            let cleanup;
            return { add: (queries, setup) => { globalThis.__heroMotionTest.queries = queries; cleanup = setup({ conditions: globalThis.__heroMotionTest.conditions }); },
              revert: () => { cleanup?.(); globalThis.__heroMotionTest.reverted++; } };
          },
          timeline: options => {
            const timeline = { options, calls: [], killed: 0,
              fromTo(...args) { this.calls.push(args); return this; },
              to(...args) { this.calls.push(args); return this; },
              kill() { this.killed++; }
            };
            globalThis.__heroMotionTest.timelines.push(timeline); return timeline;
          }
        };`;
    },
    transform(code, id) { if (id.replaceAll('\\', '/').endsWith('/site/Hero.tsx')) return code.replace("from 'react'", "from 'virtual:hero-hooks'").replace("from '@/lib/motion'", "from 'virtual:hero-gsap'"); },
  }] });
  try {
    const { Hero } = await server.ssrLoadModule('/src/components/site/Hero.tsx');
    for (const conditions of [{ motion: false, desktop: true }, { motion: true, desktop: true }, { motion: true, desktop: false }]) {
      const harness = globalThis.__heroMotionTest = { refs: [], timelines: [], initial: [], reverted: 0, conditions };
      renderToStaticMarkup(createElement(Hero));
      harness.refs[0].current = { dataset: {} };
      harness.refs[1].current = { clientWidth: conditions.desktop ? 1440 : 390 };
      globalThis.window = { innerHeight: conditions.desktop ? 900 : 844, addEventListener() {}, removeEventListener() {} };
      globalThis.document = {};
      globalThis.getComputedStyle = () => ({ paddingBottom: '22px' });
      globalThis.ResizeObserver = class { observe() {} disconnect() {} };
      globalThis.requestAnimationFrame = () => 1;
      globalThis.cancelAnimationFrame = () => {};
      const cleanup = harness.setup();
      if (conditions.motion) {
        assert.equal(harness.timelines.length, 1, 'One automatic entrance assembles the homepage');
        const entrance = harness.timelines[0];
        assert.equal(entrance.options.scrollTrigger, undefined, 'No scroll input, spacer, pin or snap may drive the landing animation');
        assert.notEqual(entrance.options.paused, true);
        assert.equal(entrance.options.repeat, 0, 'The completed homepage must stay assembled');
        assert.deepEqual(harness.queries, { motion: 'motion' }, 'Resizing across a layout breakpoint must not replay the entrance');
        assert.ok(entrance.options.delay > 0 && entrance.options.delay <= .6);
        const artwork = harness.initial.find(set => set.targets.includes('[data-home-panel-enter]'));
        assert.equal(artwork.values.autoAlpha, 1, 'Artwork must be visible throughout the scattered opening');
        assert.ok(artwork.values.scale > 0 && artwork.values.scale < 1);
        assert.equal(harness.refs[0].current.dataset.assembly, 'true');
        assert.ok(entrance.calls.every(call => !call[0].includes('[data-home-cue]')), 'Do not tell visitors to scroll to start an automatic animation');
        cleanup();
        assert.equal(entrance.killed, 1);
        assert.equal(harness.refs[0].current.dataset.assembly, undefined);
      } else {
        assert.equal(harness.timelines.length, 0, 'Reduced motion must create no pin, snap or animation');
        assert.equal(harness.initial.length, 0);
        cleanup();
      }
      assert.equal(harness.reverted, 1);
    }
  } finally { await server.close(); globalThis.__heroMotionTest = previous; Object.assign(globalThis, originalGlobals); }
});
