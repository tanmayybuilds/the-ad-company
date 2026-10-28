import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('late images never flash ahead of the scroll position; loading stays bounded and releases offscreen', async () => {
  const names = ['window', 'document', 'Image', 'IntersectionObserver', '__serviceLoading'];
  const originals = Object.fromEntries(names.map(name => [name, globalThis[name]]));
  const fixture = globalThis.__serviceLoading = { refs: [], effects: [], states: 0, unavailable: false };
  const images = [], draws = [], observers = [];
  const preference = Object.assign(new EventTarget(), { matches: false });
  globalThis.window = { matchMedia: () => preference };
  globalThis.document = Object.assign(new EventTarget(), { hidden: false });
  globalThis.Image = class {
    complete = false; naturalWidth = 0; naturalHeight = 0; onload = null; onerror = null;
    constructor() { images.push(this); }
    removeAttribute() { this.src = ''; }
  };
  globalThis.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this); }
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
    renderToStaticMarkup(createElement(Services));
    const canvas = fixture.refs[3].current = { dataset: {}, getContext: () => ({ drawImage: image => draws.push(Number(image.src.match(/(\d+)\.webp$/)[1]) - 1) }) };
    fixture.refs[2].current = {};
    fixture.refs[4].current = { hidden: false, style: { setProperty() {} }, setAttribute() {} };
    const cleanup = fixture.effects[1]();
    const render = fixture.refs[9].current;
    const live = () => images.filter(image => image.src);
    const ready = frame => {
      const image = live().find(image => image.src.endsWith(`frame_${String(frame + 1).padStart(4, '0')}.webp`));
      assert.ok(image, `Frame ${frame} must be requested`);
      Object.assign(image, { complete: true, naturalWidth: 1080, naturalHeight: 608 });
      image.onload();
    };
    assert.equal(live().length, 0);
    observers[0].callback([{ isIntersecting: true }]);
    assert.equal(live().length, 9);
    ready(0);
    render(100); assert.equal(live().length, 17);
    ready(99); ready(100); ready(102);
    assert.equal(draws.at(-1), 100);
    render(105); assert.equal(draws.at(-1), 102);
    ready(107);
    assert.equal(draws.at(-1), 102, 'A decoded frame beyond the requested position must not flash then reverse');
    ready(104); assert.equal(draws.at(-1), 104);
    ready(105); assert.equal(draws.at(-1), 105);
    render(100); assert.equal(draws.at(-1), 100, 'Reverse scrubbing must remain immediate');
    render(200);
    live().find(image => image.src.endsWith('frame_0201.webp')).onerror();
    assert.equal(fixture.unavailable, true);
    ready(200); assert.equal(fixture.unavailable, false);
    observers[0].callback([{ isIntersecting: false }]);
    assert.equal(live().length, 0); assert.equal(canvas.dataset.ready, 'false');
    assert.deepEqual([canvas.width, canvas.height], [1, 1]);
    render(300); assert.equal(live().length, 0);
    observers[0].callback([{ isIntersecting: true }]);
    assert.equal(live().length, 17);
    preference.matches = true; preference.dispatchEvent(new Event('change'));
    assert.equal(live().length, 1, 'Reduced motion loads only its selected still');
    document.hidden = true; document.dispatchEvent(new Event('visibilitychange'));
    assert.equal(live().length, 0);
    cleanup(); render(400); assert.equal(live().length, 0);
  } finally { await server.close(); Object.assign(globalThis, originals); }
});
