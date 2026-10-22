import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('Services scrubs both ways during a visit, skips upward re-entry after leaving the screen, and keeps static categories reachable', async () => {
  const hooks = `
    export const useRef = value => { const ref = { current: value }; globalThis.__serviceTest.refs.push(ref); return ref; };
    export const useState = value => {
      const index = globalThis.__serviceTest.states++;
      return [index === 2 ? globalThis.__serviceTest.fits : value, value => globalThis.__serviceTest.selection = value];
    };
    export const useEffect = () => {};
  `;
  const motion = `
    export const MQ = { motion: 'motion', reduce: 'reduce' };
    export const MOTION = {};
    export const useGSAP = callback => globalThis.__serviceTest.effects.push(callback);
    export const gsap = { to: (_, options) => {
      globalThis.__serviceTest.tween = options;
      return { kill: () => { globalThis.__serviceTest.kills++; options.onInterrupt?.(); } };
    }, matchMedia: () => ({
      add: (_, callback) => globalThis.__serviceTest.cleanups.push(callback({ conditions: { reduce: globalThis.__serviceTest.reduced } })),
      revert: () => globalThis.__serviceTest.cleanups.forEach(cleanup => cleanup?.())
    }) };
    export const ScrollTrigger = {
      create: options => {
        if (!globalThis.__serviceTest.fits || globalThis.__serviceTest.reduced) throw new Error('Static services must never create a pin');
        return globalThis.__serviceTest.trigger = { start: 1000.4, end: 5000.6, progress: 0, direction: 1, vars: options, kill() {} };
      },
      refresh: () => { const trigger = globalThis.__serviceTest.trigger; trigger.vars.onRefreshInit(); trigger.vars.onRefresh(trigger); },
      update: () => {}
    };
  `;
  // Run the real component's setup and category handlers with hook/motion boundaries stubbed.
  const server = await createServer({
    server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom',
    plugins: [{ name: 'service-hooks-test', enforce: 'pre',
      resolveId(id) { if (id === 'virtual:service-hooks' || id === 'virtual:service-motion') return `\0${id}`; },
      load(id) { if (id === '\0virtual:service-hooks') return hooks; if (id === '\0virtual:service-motion') return motion; },
      transform(code, id) {
        if (id.replaceAll('\\', '/').endsWith('/site/Services.tsx')) return code.replace('from "react"', 'from "virtual:service-hooks"').replace('from "@/lib/motion"', 'from "virtual:service-motion"');
      },
    }],
  });
  const previous = globalThis.__serviceTest;
  const originalGlobals = Object.fromEntries(['window', 'document', 'ResizeObserver', 'requestAnimationFrame', 'cancelAnimationFrame'].map(key => [key, globalThis[key]]));
  try {
    const { Services } = await server.ssrLoadModule('/src/components/site/Services.tsx');
    for (const [reduced, fits] of [[true, true], [false, false]]) {
      const harness = globalThis.__serviceTest = { refs: [], effects: [], cleanups: [], states: 0, reduced, fits };
      renderToStaticMarkup(createElement(Services));
      const frames = [];
      harness.refs[9].current = frame => frames.push(frame);
      const cleanup = harness.effects[0]();
      const navigate = harness.refs[8].current;
      navigate(4);
      assert.equal(harness.selection, 4);
      assert.equal(frames.at(-1), 206);
      navigate(0);
      assert.equal(harness.selection, 0);
      assert.equal(frames.at(-1), 0);
      cleanup();
      harness.refs[8].current(2);
      assert.equal(harness.selection, 0, 'Unmounted category handlers must be inert');
    }
    globalThis.window = Object.assign(new EventTarget(), {
      innerWidth: 1280, innerHeight: 800, scrollY: 1000,
      scrollTo({ top }) { this.scrollY = Math.round(top); },
    });
    globalThis.document = window.document = { body: { style: { overflow: '' } }, documentElement: { style: { scrollBehavior: 'smooth' } } };
    globalThis.ResizeObserver = class { observe() {} disconnect() {} };
    const pendingFrames = new Map();
    let frameID = 0;
    globalThis.requestAnimationFrame = callback => { pendingFrames.set(++frameID, callback); return frameID; };
    globalThis.cancelAnimationFrame = id => { pendingFrames.delete(id); };
    const settle = () => {
      for (let iteration = 0; pendingFrames.size && iteration < 1000; iteration++) {
        const batch = [...pendingFrames.values()]; pendingFrames.clear();
        batch.forEach(callback => callback());
      }
      assert.equal(pendingFrames.size, 0, 'Frame damping must settle without an idle loop');
    };
    const harness = globalThis.__serviceTest = { refs: [], effects: [], cleanups: [], states: 0, reduced: false, fits: true, kills: 0 };
    renderToStaticMarkup(createElement(Services));
    harness.refs[0].current = { previousElementSibling: null };
    harness.refs[2].current = { offsetHeight: 600 };
    const frames = [];
    harness.refs[9].current = frame => frames.push(frame);
    const cleanup = harness.effects[0]();
    const trigger = harness.trigger;
    const navigate = harness.refs[8].current;
    navigate(0);
    trigger.vars.onUpdate(trigger);
    assert.equal(harness.kills, 0, 'Navigation to the first frame must not cancel its own tween');
    harness.tween.onComplete();
    for (let zone = 1; zone < 5; zone++) {
      navigate(zone);
      window.scrollY = Math.round(harness.tween.scrollTo.y);
      trigger.progress = (window.scrollY - trigger.start) / (trigger.end - trigger.start);
      trigger.vars.onUpdate(trigger);
      trigger.vars.onRefreshInit(); trigger.vars.onRefresh(trigger);
      assert.equal(harness.selection, zone, 'Refresh during explicit navigation must preserve its category');
      harness.tween.onComplete();
    }
    const wheel = deltaY => {
      const event = new Event('wheel'); Object.assign(event, { deltaY, deltaX: 0 }); window.dispatchEvent(event);
    };
    wheel(100);
    trigger.direction = -1;
    trigger.vars.onUpdate(trigger);
    trigger.vars.onLeaveBack();
    assert.equal(harness.selection, 4, 'Stale GSAP direction at completion must not reset the sequence');
    wheel(-100);
    assert.equal(window.scrollY, Math.round(trigger.end), 'Reversing while the stage is visible must not jump to the website above it');
    const scrub = progress => {
      window.scrollY = Math.round(trigger.start + progress * (trigger.end - trigger.start));
      trigger.progress = progress;
      trigger.vars.onUpdate(trigger);
      settle();
      assert.equal(frames.at(-1), Math.round(progress * 265));
    };
    trigger.direction = -1;
    scrub(.6);
    assert.equal(harness.selection, 3);
    wheel(100); trigger.direction = 1; scrub(.8);
    assert.equal(harness.selection, 4);
    scrub(1);
    // Passing the pin endpoint still leaves the released stage visible; reversal is still allowed.
    window.scrollY = trigger.end + 300;
    window.dispatchEvent(new Event('scroll'));
    wheel(-100); trigger.direction = -1;
    window.scrollY = Math.floor(trigger.end);
    trigger.vars.onEnterBack(trigger);
    scrub(.7);
    // Only after the entire stage has left the screen should upward re-entry bypass the animation.
    wheel(100); trigger.direction = 1; scrub(1);
    window.scrollY = trigger.end + 601;
    window.dispatchEvent(new Event('scroll'));
    wheel(-100); trigger.direction = -1;
    window.scrollY = Math.floor(trigger.end);
    trigger.progress = 1;
    trigger.vars.onEnterBack(trigger);
    assert.equal(harness.selection, 0, 'Returning from below the offscreen stage resets without reverse playback');
    assert.equal(window.scrollY, 999);
    // A fresh downward visit restores bidirectional scrubbing.
    wheel(100); trigger.direction = 1;
    trigger.vars.onEnter(trigger);
    scrub(.4);
    wheel(-100); trigger.direction = -1; scrub(.2);
    assert.equal(harness.selection, 1);
    trigger.vars.onLeaveBack();
    assert.equal(harness.selection, 0);
    cleanup();
    assert.equal(pendingFrames.size, 0);
  } finally {
    Object.assign(globalThis, originalGlobals);
    globalThis.__serviceTest = previous;
    await server.close();
  }
});
