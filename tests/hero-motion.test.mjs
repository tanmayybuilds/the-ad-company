import test from 'node:test';
import assert from 'node:assert/strict';
import { heroScatter } from '../src/lib/hero-motion.mjs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('letter scatter is deterministic, varied and bounded at phone and desktop sizes', () => {
  for (const [width, height] of [[360, 740], [1440, 900], [2560, 1440]]) {
    const positions = Array.from({ length: 30 }, (_, index) => heroScatter(index, width, height));
    assert.deepEqual(positions, positions.map((_, index) => heroScatter(index, width, height)));
    assert.equal(new Set(positions.map(position => `${position.x},${position.y}`)).size, 30);
    for (const { x, y, rotation } of positions) {
      assert.ok(Number.isFinite(x) && Math.abs(x) <= width * .3);
      assert.ok(Number.isFinite(y) && Math.abs(y) <= height * .25);
      assert.ok(Number.isFinite(rotation) && Math.abs(rotation) <= 65);
    }
  }
});

test('hero motion uses separate entrance and scrub layers, cleans up, and respects reduced motion', async () => {
  const previous = globalThis.__heroMotionTest;
  const originalGlobals = Object.fromEntries(['window', 'document', 'ResizeObserver', 'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle'].map(key => [key, globalThis[key]]));
  const server = await createServer({ server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom', plugins: [{
    name: 'hero-motion-boundaries', enforce: 'pre',
    resolveId(id) { if (id === 'virtual:hero-hooks' || id === 'virtual:hero-gsap') return '\0' + id; },
    load(id) {
      if (id === '\0virtual:hero-hooks') return 'export const useRef = value => { const ref = { current: value }; globalThis.__heroMotionTest.refs.push(ref); return ref; };';
      if (id === '\0virtual:hero-gsap') return `
        export const MQ = { motion: 'motion' };
        export const ScrollTrigger = { refresh: () => { globalThis.__heroMotionTest.refreshes++; } };
        export const useGSAP = setup => { globalThis.__heroMotionTest.setup = setup; };
        export const gsap = {
          utils: { selector: () => selector => selector === '.home-hero-bottom' ? [{ offsetTop: 880, offsetHeight: 28 }] : [selector] },
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
    for (const conditions of [{ motion: false, desktop: true, tall: true, height: 1080 }, { motion: true, desktop: true, tall: true, height: 1080 }, { motion: true, desktop: true, tall: true, height: 800 }, { motion: true, desktop: false, tall: false, height: 844 }]) {
      const harness = globalThis.__heroMotionTest = { refs: [], timelines: [], reverted: 0, refreshes: 0, conditions };
      renderToStaticMarkup(createElement(Hero));
      harness.refs[0].current = { dataset: {} };
      harness.refs[1].current = { clientWidth: 1440, clientHeight: 930, scrollHeight: 930 };
      const listeners = new Map(), frames = new Map();
      let frame = 0;
      globalThis.window = { innerHeight: conditions.height, addEventListener: (name, callback) => listeners.set(name, callback), removeEventListener: name => listeners.delete(name) };
      globalThis.document = { fonts: { ready: Promise.resolve() } };
      globalThis.getComputedStyle = () => ({ paddingBottom: '22px' });
      globalThis.ResizeObserver = class { constructor(callback) { harness.resize = callback; } observe() {} disconnect() { harness.disconnected = true; } };
      globalThis.requestAnimationFrame = callback => { frames.set(++frame, callback); return frame; };
      globalThis.cancelAnimationFrame = id => frames.delete(id);
      const cleanup = harness.setup();
      if (conditions.motion) {
        assert.equal(harness.timelines.length, 2);
        const [entrance, scroll] = harness.timelines;
        assert.equal(scroll.options.scrollTrigger.scrub, .65);
        const fits = conditions.desktop && conditions.tall && conditions.height >= 930;
        assert.equal(harness.refs[0].current.dataset.sticky, String(fits), 'Sticky must be disabled when the content is taller than the viewport');
        assert.equal(scroll.options.scrollTrigger.end(), fits ? 'bottom bottom' : 'bottom top');
        assert.ok(!scroll.options.scrollTrigger.pin, 'Native sticky must not create another GSAP pin spacer');
        const entryTargets = entrance.calls.flatMap(call => call[0]);
        const scrollTargets = scroll.calls.flatMap(call => call[0]);
        assert.ok(entryTargets.every(target => !scrollTargets.includes(target)), 'Entrance and scroll must not animate the same nodes');
        const headlineScroll = scroll.calls.find(call => call[0].includes('[data-home-letter-scroll]'));
        assert.ok(headlineScroll[1].opacity === undefined || headlineScroll[1].opacity >= 1, 'The visible headline must retain full contrast throughout scrolling');
        window.innerHeight = 700;
        harness.resize();
        assert.equal(harness.refs[0].current.dataset.sticky, 'false');
        assert.equal(scroll.options.scrollTrigger.end(), 'bottom top');
        cleanup();
        assert.ok(harness.timelines.every(timeline => timeline.killed === 1));
        assert.equal(harness.refs[0].current.dataset.sticky, undefined);
        assert.equal(listeners.size, 0);
        assert.equal(frames.size, 0);
        assert.equal(harness.disconnected, true);
      } else {
        assert.equal(harness.timelines.length, 0, 'Reduced motion must create no entrance or scroll timeline');
        cleanup();
      }
      assert.equal(harness.reverted, 1);
    }
  } finally { await server.close(); globalThis.__heroMotionTest = previous; Object.assign(globalThis, originalGlobals); }
});
