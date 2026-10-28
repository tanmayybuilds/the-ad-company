import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { TOTAL_FRAMES, ZONE_STARTS, sequenceZone } from '../src/lib/service-sequence.mjs';

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
    export const gsap = { to: (target, options) => {
      globalThis.__serviceTest.tween = options;
      const travel = { target, options, from: target.frame, killed: false,
        kill() { this.killed = true; globalThis.__serviceTest.kills++; options.onInterrupt?.(); }
      };
      globalThis.__serviceTest.travel = travel;
      return travel;
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
      update: () => {
        const trigger = globalThis.__serviceTest.trigger;
        trigger.progress = Math.max(0, Math.min(1, (window.scrollY - trigger.start) / (trigger.end - trigger.start)));
        trigger.vars.onUpdate(trigger);
      }
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
      assert.equal(frames.at(-1), ZONE_STARTS[4]);
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
    const goal = zone => ZONE_STARTS[zone];
    const advance = (fraction, zone) => {
      const travel = harness.travel;
      assert.ok(!travel.killed);
      assert.ok(travel.options.duration <= .55, 'Manual category switching must finish within 550ms');
      travel.target.frame = travel.from + (travel.options.frame - travel.from) * fraction;
      travel.options.onUpdate?.();
      trigger.vars.onUpdate(trigger);
      assert.equal(harness.selection, zone, 'The selected category must stay stable throughout its transition');
      assert.equal(frames.at(-1), Math.round(travel.target.frame), 'The visual must follow the manual transition directly, without a second easing loop');
    };
    const finish = zone => {
      advance(1, zone);
      harness.travel.options.onComplete();
      trigger.vars.onUpdate(trigger);
      settle();
      assert.equal(frames.at(-1), goal(zone));
      assert.equal(harness.selection, zone, 'Completion must not bounce back to the previous category');
      assert.equal(pendingFrames.size, 0);
    };
    // Reproduce fifth → first: the first queued scroll update can still report the old endpoint.
    trigger.progress = 1; window.scrollY = Math.round(trigger.end);
    trigger.vars.onRefreshInit(); trigger.vars.onRefresh(trigger);
    navigate(0);
    trigger.progress = 1;
    trigger.vars.onUpdate(trigger);
    assert.equal(harness.selection, 0, 'A stale fifth-category endpoint must not overwrite the first category chosen by the user');
    assert.equal(harness.kills, 0, 'Navigation to the first frame must not cancel its own tween');
    finish(0);
    for (let from = 0; from < 5; from++) for (let to = 0; to < 5; to++) {
      navigate(from); finish(from);
      navigate(to);
      advance(.5, to);
      trigger.vars.onRefreshInit(); trigger.vars.onRefresh(trigger);
      assert.equal(harness.selection, to, 'Refresh during explicit navigation must preserve its category');
      finish(to);
    }
    navigate(4); advance(.25, 4);
    const replaced = harness.travel;
    navigate(0);
    assert.ok(replaced.killed, 'A new click must cancel the previous transition');
    advance(.25, 0);
    const replacedAgain = harness.travel;
    navigate(2);
    assert.ok(replacedAgain.killed);
    finish(2);
    navigate(0); advance(.25, 0);
    window.dispatchEvent(new Event('pointerdown'));
    assert.ok(harness.travel.killed);
    assert.equal(frames.at(-1), 0, 'Interrupting a manual transition must settle to its aligned document position, not freeze on a different category');
    assert.equal(harness.selection, 0);
    navigate(4); finish(4);
    const wheel = deltaY => {
      const event = new Event('wheel'); Object.assign(event, { deltaY, deltaX: 0 }); window.dispatchEvent(event);
    };
    wheel(100);
    trigger.direction = -1;
    trigger.vars.onUpdate(trigger);
    trigger.vars.onLeaveBack();
    assert.equal(harness.selection, 4, 'Stale GSAP direction at completion must not reset the sequence');
    wheel(-100);
    assert.equal(window.scrollY, Math.round(trigger.start + ZONE_STARTS[4] / (TOTAL_FRAMES - 1) * (trigger.end - trigger.start)), 'Reversing while the stage is visible must not jump to the website above it');
    const scrub = progress => {
      window.scrollY = Math.round(trigger.start + progress * (trigger.end - trigger.start));
      trigger.progress = progress;
      trigger.vars.onUpdate(trigger);
      settle();
      assert.equal(frames.at(-1), Math.round(progress * (TOTAL_FRAMES - 1)));
    };
    trigger.direction = -1;
    scrub(.6);
    assert.equal(harness.selection, sequenceZone(Math.round(.6 * (TOTAL_FRAMES - 1))));
    const beforeRefresh = frames.length;
    trigger.vars.onRefreshInit();
    trigger.progress = 0;
    trigger.vars.onUpdate(trigger);
    trigger.vars.onEnter(trigger);
    trigger.vars.onLeaveBack();
    assert.equal(frames.length, beforeRefresh, 'Temporary zero progress during layout refresh must not rewind or reload the frame window');
    trigger.progress = .6;
    trigger.vars.onRefresh(trigger);
    assert.equal(frames.at(-1), Math.round(.6 * (TOTAL_FRAMES - 1)));
    wheel(100); trigger.direction = 1; scrub(.8);
    assert.equal(harness.selection, sequenceZone(Math.round(.8 * (TOTAL_FRAMES - 1))));
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
    trigger.vars.onRefreshInit();
    trigger.vars.onEnter(trigger);
    trigger.vars.onRefresh(trigger);
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
