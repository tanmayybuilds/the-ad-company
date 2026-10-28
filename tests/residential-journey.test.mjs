import test from 'node:test';
import assert from 'node:assert/strict';
import { residentialPose, walkingPose } from '../src/lib/residential-journey.mjs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { gsap } from 'gsap/gsap-core.js';

test('residential progress reaches every stop, clamps both boundaries and holds the placement in view', () => {
  assert.equal(residentialPose(-1).stop, 0);
  assert.equal(residentialPose(2).stop, 4);
  assert.deepEqual(residentialPose(1).eye, [3.8, 2.65, -51.8]);
  for (const [progress, stop] of [[0, 0], [.2, 1], [.4, 2], [.6, 3], [.8, 4], [1, 4]]) {
    assert.equal(residentialPose(progress).stop, stop);
    const held = (stop + .8) / 5;
    assert.deepEqual(residentialPose(held).eye, residentialPose((stop + .98) / 5).eye);
  }
});

test('the camera travels around the lobby and corridor walls instead of through them', () => {
  for (let p = .4; p < .75; p += .0005) {
    const { eye: [x, y, z] } = residentialPose(p);
    for (const wall of [-13, -27]) {
      if (Math.abs(z - wall) < .4 && y < 5.2) assert.ok(x > 5.5, `Camera intersects the wall at ${wall}: ${[x, y, z]}`);
    }
  }
});

async function withJourney(staticMode, run) {
  const names = ['window', 'document', 'ResizeObserver', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', '__residentialTest'];
  const originals = Object.fromEntries(names.map(key => [key, globalThis[key]]));
  const fixture = globalThis.__residentialTest = { refs: [], effects: [], state: 0, stop: 0, staticMode, gsap };
  const frames = new Map(); let frame = 0;
  globalThis.window = Object.assign(new EventTarget(), { innerHeight: 880, scrollY: 1920, scrollTo({ top }) { this.scrollY = Math.round(top); } });
  globalThis.document = window.document = { body: { style: { overflow: '' } } };
  globalThis.getComputedStyle = () => ({ top: '80px', getPropertyValue: () => '4.5rem' });
  globalThis.ResizeObserver = class { observe() {} disconnect() {} };
  globalThis.requestAnimationFrame = callback => { frames.set(++frame, callback); return frame; };
  globalThis.cancelAnimationFrame = id => frames.delete(id);
  const server = await createServer({ server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom', plugins: [{
    name: 'residential-timeline-hooks', enforce: 'pre',
    resolveId(id) { if (id.startsWith('virtual:residential-')) return '\0' + id; },
    load(id) {
      if (id === '\0virtual:residential-hooks') return `
        export { Component, lazy, Suspense } from 'react';
        export const useRef = value => { const ref = { current: value }; globalThis.__residentialTest.refs.push(ref); return ref; };
        export const useCallback = callback => callback;
        export const useEffect = callback => globalThis.__residentialTest.effects.push(callback);
        export const useState = value => { const slot = globalThis.__residentialTest.state++; return [slot === 3 ? globalThis.__residentialTest.staticMode : value, next => { if (slot === 0) globalThis.__residentialTest.stop = next; }]; };
      `;
      if (id === '\0virtual:residential-motion') return 'export const gsap = globalThis.__residentialTest.gsap;';
    },
    transform(code, id) { if (id.replaceAll('\\', '/').endsWith('/site/ResidentialJourney.tsx')) return code.replace("from 'react'", "from 'virtual:residential-hooks'").replace("from '@/lib/motion'", "from 'virtual:residential-motion'"); },
  }] });
  let cleanup;
  try {
    const { ResidentialJourney } = await server.ssrLoadModule('/src/components/site/ResidentialJourney.tsx');
    renderToStaticMarkup(createElement(ResidentialJourney));
    fixture.refs[0].current = { offsetHeight: 5000, style: { setProperty() {} }, getBoundingClientRect: () => ({ top: 2000 - window.scrollY }) };
    fixture.refs[1].current = { offsetHeight: 800 };
    cleanup = fixture.effects[2]();
    const flush = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback()); };
    const input = deltaY => { const event = new Event('wheel'); Object.assign(event, { deltaY, deltaX: 0 }); window.dispatchEvent(event); };
    const scroll = y => { window.scrollY = y; window.dispatchEvent(new Event('scroll')); flush(); };
    await run({ fixture, scroll, input });
  } finally { cleanup?.(); await server.close(); gsap.ticker.sleep(); Object.assign(globalThis, originals); }
}

test('the live timeline scrubs in both directions, seeks exact holds and bypasses a spent journey on upward re-entry', () => withJourney(false, ({ fixture, scroll, input }) => {
  scroll(4020); assert.equal(fixture.stop, 2); assert.equal(fixture.refs[2].current, .5);
  input(-100); scroll(3180); assert.equal(fixture.stop, 1);
  fixture.refs[4].current(4); assert.equal(fixture.stop, 4); assert.equal(window.scrollY, 5969);
  fixture.refs[4].current(-10); assert.equal(fixture.stop, 0);
  document.body.style.overflow = 'hidden';
  scroll(4020); assert.equal(fixture.stop, 0, 'Modal scrolling must not move the journey');
  document.body.style.overflow = '';
  input(100); scroll(6950); assert.equal(fixture.stop, 4);
  input(-100); scroll(6100); assert.equal(window.scrollY, 1919); assert.equal(fixture.refs[2].current, 0);
  fixture.refs[4].current(2); assert.equal(fixture.stop, 2, 'Explicit navigation re-arms the journey');
}));

test('reduced motion keeps stop selection usable without trapping the page in a long scroll', () => withJourney(true, ({ fixture }) => {
  fixture.refs[4].current(3); assert.equal(fixture.stop, 3);
  assert.equal(window.scrollY, 1920);
  fixture.refs[4].current(999); assert.equal(fixture.stop, 4);
}));

test('seeking the camera and people backwards restores exactly the same pose without an idle clock', () => {
  const samples = Array.from({ length: 101 }, (_, i) => i / 100);
  const snapshots = samples.map(p => [residentialPose(p), walkingPose(p, .3)]);
  [...samples].reverse().forEach(p => {
    assert.deepEqual([residentialPose(p), walkingPose(p, .3)], snapshots[Math.round(p * 100)]);
  });
  for (const boundary of [.2, .4, .6, .8]) {
    const a = residentialPose(boundary - .000001), b = residentialPose(boundary);
    assert.ok(Math.hypot(...a.eye.map((v, i) => v - b.eye[i])) < .001, 'No camera cut at a chapter boundary');
  }
  assert.ok(Math.abs(walkingPose(.25, .3).stride) <= .55);
});
