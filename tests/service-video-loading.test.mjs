import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('Services loads one video near the viewport and coalesces slow seeks without cancelling them', async () => {
  const names = ['window', 'document', '__serviceLoading', 'IntersectionObserver', 'Image'];
  const originals = Object.fromEntries(names.map(name => [name, globalThis[name]]));
  const fixture = globalThis.__serviceLoading = { refs: [], effects: [], states: 0, unavailable: false };
  const observers = [], seeks = [];
  const preference = Object.assign(new EventTarget(), { matches: false });
  globalThis.window = { innerWidth: 1280, matchMedia: () => preference };
  globalThis.document = Object.assign(new EventTarget(), { hidden: false });
  globalThis.Image = class { constructor() { throw new Error('Animation must not request hundreds of separate frame images'); } };
  globalThis.IntersectionObserver = class {
    constructor(callback, options) { this.callback = callback; this.options = options; observers.push(this); }
    observe() {} disconnect() {}
  };
  const server = await createServer({
    server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom',
    plugins: [{ name: 'service-loading-hooks', enforce: 'pre',
      resolveId(id) { if (id === 'virtual:service-loading') return '\0' + id; },
      load(id) { if (id === '\0virtual:service-loading') return `
        export const useRef = value => { const ref = { current: value }; globalThis.__serviceLoading.refs.push(ref); return ref; };
        export const useEffect = callback => globalThis.__serviceLoading.effects.push(callback);
        export const useState = value => { const index = globalThis.__serviceLoading.states++; return [value, next => { if (index === 1) globalThis.__serviceLoading.unavailable = next; }]; };
      `; },
      transform(code, id) { if (id.replaceAll('\\', '/').endsWith('/site/Services.tsx')) return code.replace('from "react"', 'from "virtual:service-loading"'); },
    }],
  });
  try {
    const { Services } = await server.ssrLoadModule('/src/components/site/Services.tsx');
    for (const [mobile, reduced] of [[false, false], [true, false], [false, true]]) {
      Object.assign(fixture, { refs: [], effects: [], states: 0, unavailable: false });
      window.innerWidth = mobile ? 390 : 1280; preference.matches = reduced;
      renderToStaticMarkup(createElement(Services));
      const player = Object.assign(new EventTarget(), {
        src: '', dataset: {}, readyState: 0, seeking: false, time: 0, loads: 0,
        load() { this.loads++; this.readyState = 0; this.seeking = false; this.time = 0; },
        pause() {}, removeAttribute() { this.src = ''; }, getAttribute() { return this.src || null; },
      });
      Object.defineProperty(player, 'currentTime', { get() { return this.time; }, set(value) { this.time = value; this.seeking = true; seeks.push(value); } });
      const complete = () => { player.readyState = 2; player.seeking = false; player.dispatchEvent(new Event('seeked')); };
      fixture.refs[3].current = player; fixture.refs[2].current = {};
      fixture.refs[4].current = { hidden: false };
      const cleanup = fixture.effects[1](), render = fixture.refs[9].current;
      assert.equal(player.src, '', 'No video request before approaching Services');
      observers.at(-1).callback([{ isIntersecting: true }]);
      if (reduced) {
        assert.equal(player.src, '', 'Reduced motion must use only the selected poster');
        render(100); assert.equal(player.loads, 0); cleanup(); continue;
      }
      assert.ok(player.src.endsWith(`services-v3-${mobile ? 'mobile' : 'desktop'}.mp4`));
      assert.ok(parseInt(observers.at(-1).options.rootMargin) >= 1000, 'Prepare before the section enters the screen');
      const before = seeks.length;
      render(100); assert.equal(seeks.length, before, 'Wait for metadata before seeking');
      player.readyState = 1; player.dispatchEvent(new Event('loadedmetadata'));
      assert.equal(seeks.at(-1), 100 / 24);
      for (let frame = 101; frame <= 200; frame++) render(frame);
      assert.equal(seeks.length, before + 1, 'Finish the in-flight seek instead of cancelling it every scroll tick');
      complete(); assert.equal(seeks.at(-1), 200 / 24);
      complete(); assert.equal(player.dataset.frame, '201'); assert.equal(player.dataset.ready, 'true');
      render(50); complete(); assert.equal(player.dataset.frame, '51', 'Reverse scrolling remains available');
      const loads = player.loads;
      observers.at(-1).callback([{ isIntersecting: false }]); render(300);
      observers.at(-1).callback([{ isIntersecting: true }]);
      assert.equal(player.loads, loads, 'Returning must retain the buffered video');
      complete(); assert.equal(player.dataset.frame, '301');
      document.hidden = true; document.dispatchEvent(new Event('visibilitychange'));
      const hiddenSeeks = seeks.length; render(400); assert.equal(seeks.length, hiddenSeeks);
      document.hidden = false; document.dispatchEvent(new Event('visibilitychange')); complete();
      assert.equal(player.dataset.frame, '401');
      player.dispatchEvent(new Event('error')); assert.equal(fixture.unavailable, true); assert.equal(player.dataset.ready, 'false');
      player.dispatchEvent(new Event('loadeddata')); assert.equal(fixture.unavailable, false);
      preference.matches = true; preference.dispatchEvent(new Event('change'));
      assert.equal(player.src, ''); assert.equal(player.dataset.ready, 'false');
      cleanup(); const ended = seeks.length; render(500); assert.equal(seeks.length, ended);
    }
  } finally { await server.close(); Object.assign(globalThis, originals); }
});
