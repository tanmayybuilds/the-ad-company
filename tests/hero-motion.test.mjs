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

test('one smooth pinned assembly settles on the homepage, then releases, including on mobile', async () => {
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
            return { add: (_, setup) => { cleanup = setup({ conditions: globalThis.__heroMotionTest.conditions }); },
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
        assert.equal(harness.timelines.length, 1, 'The full first scroll must assemble before ordinary site scrolling begins');
        const entrance = harness.timelines[0];
        const trigger = entrance.options.scrollTrigger;
        assert.equal(trigger.pin, harness.refs[1].current, 'Keep the hero at the top throughout assembly, on phones too');
        assert.equal(trigger.start, 'top top');
        assert.equal(trigger.end(), `+=${window.innerHeight}`, 'The opening occupies one full viewport of scroll');
        assert.ok(trigger.scrub >= .7, 'Smooth the response to coarse mouse-wheel input');
        assert.deepEqual(trigger.snap.snapTo, [0, 1], 'A first scroll settles on one complete scene');
        assert.equal(trigger.snap.inertia, false);
        assert.equal(trigger.invalidateOnRefresh, true);
        const artwork = harness.initial.find(set => set.targets.includes('[data-home-panel-enter]'));
        assert.equal(artwork.values.autoAlpha, 1, 'Artwork must be visible throughout the scattered opening');
        assert.ok(artwork.values.scale > 0 && artwork.values.scale < 1);
        assert.equal(harness.refs[0].current.dataset.assembly, 'true');
        assert.ok(entrance.calls.every(call => !call[2]?.clearProps), 'Scrubbed transforms must survive refresh/reversal');
        window.innerHeight = 700;
        assert.equal(trigger.end(), '+=700', 'Resize updates the full-page boundary');
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
