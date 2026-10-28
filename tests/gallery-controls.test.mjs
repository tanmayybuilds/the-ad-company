import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

test('gallery filters, keyboard viewer and client photo buttons work without losing focus or scroll state', async () => {
  const originals = Object.fromEntries(['window', 'document', '__galleryControls'].map(key => [key, globalThis[key]]));
  const fixture = globalThis.__galleryControls = { states: [], refs: [], effects: [], cursor: 0, refCursor: 0 };
  let url, focused = 0, prevented = 0;
  globalThis.window = { location: { href: 'https://example.test/the-ad-company/gallery.html?v=release' }, history: { replaceState(_, __, value) { url = value; } } };
  globalThis.document = { activeElement: { focus(options) { assert.equal(options.preventScroll, true); focused++; } }, body: { style: { overflow: 'auto' } } };
  const server = await createServer({ base: '/the-ad-company/', server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom', plugins: [{
    name: 'gallery-controls', enforce: 'pre',
    resolveId(id) { if (id.startsWith('virtual:gallery-')) return '\0' + id; },
    load(id) {
      if (id === '\0virtual:gallery-hooks') return `
        export const useState = value => { const f = globalThis.__galleryControls, i = f.cursor++; if (!(i in f.states)) f.states[i] = value; return [f.states[i], next => f.states[i] = typeof next === 'function' ? next(f.states[i]) : next]; };
        export const useRef = value => { const f = globalThis.__galleryControls; return f.refs[f.refCursor++] ??= { current: value }; };
        export const useEffect = callback => globalThis.__galleryControls.effects.push(callback);
      `;
      if (id === '\0virtual:gallery-motion') return 'export const useGSAP = () => {}; export const gsap = {}; export const MQ = {}; export const MOTION = {};';
    },
    transform(code, id) { if (/\/site\/(Gallery|ClientStrip)\.tsx$/.test(id.replaceAll('\\', '/'))) return code.replace('from "react"', 'from "virtual:gallery-hooks"').replace('from "@/lib/motion"', 'from "virtual:gallery-motion"'); },
  }] });
  const nodes = value => !value ? [] : Array.isArray(value) ? value.flatMap(nodes) : typeof value === 'object' ? [value, ...nodes(value.props?.children)] : [];
  const render = (Component, props) => { fixture.cursor = fixture.refCursor = 0; fixture.effects = []; return Component(props); };
  try {
    const { Gallery } = await server.ssrLoadModule('/src/components/site/Gallery.tsx');
    const { gallery, clients } = await server.ssrLoadModule('/src/content/site.ts');
    let tree = render(Gallery, { initialBrand: 'all' });
    const count = nodes(tree).filter(node => node.props?.className === 'gallery-photo-button').length;
    nodes(tree).find(node => node.props?.className === 'gallery-photo-button').props.onClick();
    assert.equal(fixture.states[1], 0);
    tree = render(Gallery, {});
    fixture.refs[3].current = { open: false, showModal() { this.open = true; }, close() { this.open = false; } };
    const cleanup = fixture.effects[0]();
    assert.equal(document.body.style.overflow, 'hidden');
    assert.equal(fixture.refs[3].current.open, true);
    let viewer = nodes(tree).find(node => node.type === 'dialog');
    viewer.props.onKeyDown({ key: 'ArrowLeft', preventDefault() { prevented++; } });
    assert.equal(fixture.states[1], count - 1);
    tree = render(Gallery, {}); viewer = nodes(tree).find(node => node.type === 'dialog');
    viewer.props.onKeyDown({ key: 'ArrowRight', preventDefault() { prevented++; } });
    assert.equal(fixture.states[1], 0); assert.equal(prevented, 2);
    nodes(tree).find(node => node.props?.['aria-label'] === gallery.closePhoto).props.onClick();
    assert.equal(fixture.states[1], null); cleanup();
    assert.equal(document.body.style.overflow, 'auto'); assert.equal(focused, 1);
    tree = render(Gallery, {});
    nodes(tree).find(node => node.type === 'button' && Array.isArray(node.props.children) && node.props.children[0] === 'TDF').props.onClick();
    assert.equal(fixture.states[0], 'tdf'); assert.equal(url.searchParams.get('brand'), 'tdf'); assert.equal(url.searchParams.get('v'), 'release');
    tree = render(Gallery, {});
    assert.equal(nodes(tree).filter(node => node.props?.className === 'gallery-photo-button').length, 3);
    nodes(tree).find(node => node.type === 'button' && node.props.children === gallery.all).props.onClick();
    assert.equal(fixture.states[0], 'all'); assert.equal(url.searchParams.get('brand'), null);

    const { CampaignPreview } = await server.ssrLoadModule('/src/components/site/ClientStrip.tsx');
    fixture.states = []; fixture.refs = [];
    const props = { clientName: 'TDF Diamonds & Gold', active: false, motion: false };
    tree = render(CampaignPreview, props);
    assert.ok(nodes(tree).some(node => node.type === 'img' && node.props.src.endsWith('/tdf/01-thumb.webp')));
    nodes(tree).find(node => node.props?.['aria-label'] === clients.previousPhoto).props.onClick();
    assert.equal(fixture.states[0], 2);
    tree = render(CampaignPreview, props);
    assert.ok(nodes(tree).some(node => node.type === 'img' && node.props.src.endsWith('/tdf/03-thumb.webp')));
    nodes(tree).find(node => node.props?.['aria-label'] === clients.nextPhoto).props.onClick();
    assert.equal(fixture.states[0], 0);
    tree = render(CampaignPreview, { ...props, clientName: 'Michelin' });
    assert.ok(nodes(tree).filter(node => node.type === 'button').every(node => node.props.disabled));
  } finally { await server.close(); Object.assign(globalThis, originals); }
});
