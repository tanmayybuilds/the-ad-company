import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

async function withTour(run, viewport = { width: 1440, height: 900 }) {
  const names = ['window', 'document', 'Element', 'IntersectionObserver', 'ResizeObserver', 'requestAnimationFrame', 'cancelAnimationFrame', '__teamLookahead'];
  const original = Object.fromEntries(names.map(name => [name, globalThis[name]]));
  const harness = globalThis.__teamLookahead = { refs: [], effects: [], selection: 0 };
  const frames = new Map();
  let frameID = 0, time = 0, observer;
  const element = () => {
    const node = { style: { setProperty() {}, removeProperty() {} }, hidden: false, inert: false, prepared: 0 };
    node.querySelector = () => ({ decode: () => { node.prepared++; return Promise.resolve(); } });
    return node;
  };
  globalThis.window = Object.assign(new EventTarget(), {
    innerWidth: viewport.width, innerHeight: viewport.height, scrollY: 2000,
    scrollTo({ top }) { this.scrollY = Math.round(top); },
    matchMedia: query => Object.assign(new EventTarget(), { matches: query.includes('max-width') && (viewport.width < 768 || (viewport.width < 1024 && viewport.height <= 500)) }),
  });
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, body: { style: { overflow: '' } } });
  globalThis.Element = class {};
  window.document = document;
  globalThis.IntersectionObserver = class { constructor(callback) { observer = callback; } observe() {} disconnect() {} };
  globalThis.ResizeObserver = class { observe() {} disconnect() {} };
  globalThis.requestAnimationFrame = callback => { frames.set(++frameID, callback); return frameID; };
  globalThis.cancelAnimationFrame = id => frames.delete(id);
  const tick = () => {
    time += 16;
    const batch = [...frames.values()]; frames.clear();
    batch.forEach(callback => callback(time));
  };
  const settle = () => {
    for (let i = 0; frames.size && i < 100; i++) tick();
    assert.equal(frames.size, 0);
  };
  const server = await createServer({ server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom',
    plugins: [{ name: 'team-lookahead-hooks', enforce: 'pre',
      resolveId(id) { if (id.startsWith('virtual:team-lookahead-')) return `\0${id}`; },
      load(id) {
        if (id === '\0virtual:team-lookahead-hooks') return `
          export const useRef = value => { const ref = { current: value }; globalThis.__teamLookahead.refs.push(ref); return ref; };
          export const useEffect = callback => globalThis.__teamLookahead.effects.push(callback);
          export const useState = value => [value, selected => { globalThis.__teamLookahead.selection = selected; }];
        `;
        if (id === '\0virtual:team-lookahead-motion') return 'export const ScrollTrigger = { addEventListener() {}, removeEventListener() {} };';
      },
      transform(code, id) {
        if (id.replaceAll('\\', '/').endsWith('/site/TeamTour.tsx')) return code.replace("from 'react'", "from 'virtual:team-lookahead-hooks'").replace("from '@/lib/motion'", "from 'virtual:team-lookahead-motion'");
      },
    }],
  });
  let cleanup;
  try {
    const { TeamTour } = await server.ssrLoadModule('/src/components/site/TeamTour.tsx');
    renderToStaticMarkup(createElement(TeamTour));
    harness.refs[0].current = { ...element(), dataset: {}, offsetHeight: 4950, getBoundingClientRect: () => ({ top: 2000 - window.scrollY }) };
    harness.refs[1].current = element();
    const nodes = harness.refs[2].current = Array.from({ length: 5 }, element);
    const paths = harness.refs[3].current = Array.from({ length: 4 }, element);
    cleanup = harness.effects[0]();
    observer([{ isIntersecting: true }]);
    settle();
    const jump = index => { time = performance.now(); harness.refs[6].current(index); settle(); };
    const input = (type, properties = {}) => {
      const event = new Event(type, { cancelable: true });
      for (const [key, value] of Object.entries(properties)) Object.defineProperty(event, key, { value });
      window.dispatchEvent(event);
      return event;
    };
    await run({ harness, nodes, paths, jump, input, tick, settle, frames, startTravel: index => { time = performance.now(); harness.refs[6].current(index); } });
  } finally { cleanup?.(); await server.close(); Object.assign(globalThis, original); }
}

test('moving from pointer 02 to 03 prepares the next two people before the camera settles', () => withTour(({ harness, nodes, paths, jump, startTravel, tick, frames }) => {
    jump(1);
    assert.equal(harness.selection, 1);
    assert.equal(nodes[4].hidden, true);
    assert.equal(nodes[4].prepared, 0);
    startTravel(2);
    tick();
    assert.equal(nodes[4].hidden, false);
    assert.ok(nodes[4].prepared > 0, 'The portrait must be decoded ahead of the arriving pointer');
    assert.equal(paths[3].hidden, false, 'The 04 → 05 path must already be part of the scene');
    while (frames.size) {
      tick();
      assert.equal(nodes[4].hidden, false);
      assert.ok(nodes.filter(node => !node.hidden).length <= 4, 'Lookahead must remain bounded during travel');
    }
    assert.equal(harness.selection, 2);
    assert.equal(nodes.filter(node => !node.hidden).length, 3);
}));

test('active team input steps backward and forward, then releases and skips replay after leaving the screen', () => withTour(({ harness, jump, input, settle }) => {
  jump(3);
  const wheel = (deltaY, timeStamp) => input('wheel', { deltaY, deltaX: 0, timeStamp });
  assert.equal(wheel(-100, 1000).defaultPrevented, true);
  settle();
  assert.equal(harness.selection, 2, 'Upward scrolling at 04 must go to 03, not reset the tour');
  assert.equal(window.scrollY, 4025);
  document.body.style.overflow = 'hidden';
  assert.equal(wheel(100, 1600).defaultPrevented, false, 'Reading a biography must not move the team tour');
  input('keydown', { key: 'ArrowDown' });
  settle(); assert.equal(harness.selection, 2);
  document.body.style.overflow = '';
  wheel(100, 2200); settle();
  assert.equal(harness.selection, 3);
  assert.equal(input('keydown', { key: 'ArrowUp' }).defaultPrevented, true);
  settle(); assert.equal(harness.selection, 2);
  input('touchstart', { touches: [{ clientX: 100, clientY: 100 }] });
  assert.equal(input('touchmove', { touches: [{ clientX: 100, clientY: 180 }] }).defaultPrevented, true);
  settle(); assert.equal(harness.selection, 1);
  input('touchend');
  input('touchstart', { touches: [{ clientX: 100, clientY: 200 }] });
  input('touchmove', { touches: [{ clientX: 100, clientY: 100 }] });
  settle(); assert.equal(harness.selection, 2);
  input('touchend');
  // Native scrollbar movement must also move backward within the active tour.
  window.document.documentElement = { clientWidth: 1440 };
  input('pointerdown', { button: 0, clientX: 1440 });
  window.scrollY = 3500; input('scroll'); settle(); input('pointerup');
  assert.equal(harness.selection, 1);
  jump(0);
  assert.equal(wheel(-100, 3400).defaultPrevented, false, 'Pointer 01 must allow leaving upward');
  jump(4);
  assert.equal(wheel(100, 4600).defaultPrevented, false, 'The last person must allow leaving downward');
  window.scrollY = 6200; input('scroll');
  wheel(-100, 5800); window.scrollY = 6000; input('scroll'); settle();
  assert.equal(harness.selection, 3, 'The released but still visible stage must remain reversible');
  jump(4);
  window.scrollY = 7000; input('scroll');
  assert.equal(wheel(-100, 7000).defaultPrevented, false, 'Offscreen input belongs to the website');
  window.scrollY = 6000; input('scroll'); settle();
  assert.equal(window.scrollY, 1999, 'Returning from below must bypass the spent animation distance');
  assert.equal(harness.selection, 0);
  wheel(100, 8200); window.scrollY = 2010; input('scroll'); settle();
  wheel(100, 9400); settle(); assert.equal(harness.selection, 1, 'A fresh downward visit can play again');
}));

for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }]) {
  test(`mobile team selection preserves page scroll and leaves vertical input native at ${viewport.width}x${viewport.height}`, () => withTour(({ harness, jump, input, settle }) => {
    const before = window.scrollY;
    jump(4);
    assert.equal(harness.selection, 4);
    assert.equal(window.scrollY, before, 'Choosing a person must not move the document');
    const event = input('wheel', { deltaY: 100, deltaX: 0, ctrlKey: false });
    assert.equal(event.defaultPrevented, false);
    input('touchstart', { touches: [{ clientX: 150, clientY: 400 }] });
    const touch = input('touchmove', { touches: [{ clientX: 150, clientY: 200 }] });
    assert.equal(touch.defaultPrevented, false);
    window.scrollY += 100; input('scroll'); settle();
    assert.equal(harness.selection, 4, 'Page scrolling must not choose another person');
    jump(9); assert.equal(harness.selection, 4);
    jump(-2); assert.equal(harness.selection, 0);
  }, viewport));
}
