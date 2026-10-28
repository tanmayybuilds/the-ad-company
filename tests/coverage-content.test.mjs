import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('the execution showcase covers every offered service and keeps truthful photo slots and native selection', async () => {
  const server = await createServer({ base: '/the-ad-company/', server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { CoverflowCoverage } = await server.ssrLoadModule('/src/components/site/CoverflowCoverage.tsx');
    const { serviceShowcase, services, nav: links } = await server.ssrLoadModule('/src/content/site.ts');
    assert.ok(serviceShowcase, 'The city cards must be replaced by a service execution catalogue');
    assert.equal(serviceShowcase.items.length, 37);
    assert.equal(new Set(serviceShowcase.items.map(item => item.id)).size, serviceShowcase.items.length);
    const formats = new Set(serviceShowcase.items.flatMap(item => item.formats));
    for (const group of [...services.catalogue, ...services.items]) {
      for (const format of group.formats) assert.ok(formats.has(format), `Missing offered service: ${format}`);
    }
    assert.ok(serviceShowcase.items.every(item => item.execution === null), 'No unprovided execution may be presented as completed work');
    assert.ok(links.some(link => link.label === 'Executions' && link.href === '#coverage'));
    const markup = renderToStaticMarkup(createElement(CoverflowCoverage));
    const options = markup.match(/<select\b[\s\S]*?<\/select>/)?.[0];
    assert.ok(options);
    assert.equal([...options.matchAll(/<option\b/g)].length, serviceShowcase.items.length);
    for (const item of serviceShowcase.items) assert.ok(options.includes(item.title.replaceAll('&', '&amp;')));
    assert.match(markup, /id="coverage"/);
    assert.match(markup, /for="execution-service"/);
    assert.match(markup, /id="execution-service"/);
    assert.match(markup, /href="#contact"/);
    assert.match(markup, /Execution photograph coming soon/);
    for (const item of serviceShowcase.items) {
      assert.ok(markup.includes(`aria-describedby="execution-info-${item.id}"`), 'Each card must expose its execution status and details to assistive technology');
      assert.ok(markup.includes(`id="execution-info-${item.id}"`));
    }
    assert.doesNotMatch(markup, /cov-city-art|Illustrative city scene|Mumbai|Pune/);
    for (const button of markup.matchAll(/<button\b[\s\S]*?<\/button>/g)) {
      assert.doesNotMatch(button[0], /<a\b/, 'A card button must not contain another interactive control');
    }
    assert.equal([...markup.matchAll(/class="cov-photo-placeholder"/g)].length, serviceShowcase.items.length);
    const execution = { src: '/campaigns/malabar/01.webp', thumbnail: '/campaigns/malabar/01-thumb.webp', thumbnailWidth: 480, width: 1152, height: 648, alt: 'Confirmed hoarding execution', client: 'Confirmed brand', location: 'Confirmed location', description: 'Approved campaign details' };
    try {
      for (const item of serviceShowcase.items) item.execution = execution;
      const withPhotos = renderToStaticMarkup(createElement(CoverflowCoverage));
      assert.equal([...withPhotos.matchAll(/<img\b/g)].length, 3, 'The active execution and its two visual neighbours must load, including the wrapped last service');
      assert.match(withPhotos, /src="\/the-ad-company\/campaigns\/malabar\/01.webp"/);
      assert.match(withPhotos, /srcSet="\/the-ad-company\/campaigns\/malabar\/01-thumb.webp 480w, \/the-ad-company\/campaigns\/malabar\/01.webp 1152w"/);
      assert.match(withPhotos, /loading="eager"/);
      assert.match(withPhotos, /loading="lazy"/);
      assert.match(withPhotos, /Confirmed brand/);
      assert.match(withPhotos, /Confirmed location/);
      assert.match(withPhotos, /Approved campaign details/);
      assert.match(withPhotos, /id="execution-info-hoardings"[^>]*>[\s\S]*?Confirmed hoarding execution[\s\S]*?Confirmed brand[\s\S]*?Confirmed location[\s\S]*?Approved campaign details/);
    } finally { for (const item of serviceShowcase.items) item.execution = null; }
  } finally { await server.close(); }
});

test('the service picker reaches every stop, leaves native keys alone and recovers a missing image', async () => {
  const original = globalThis.__executionControls;
  const fixture = globalThis.__executionControls = { refs: [], states: [], cursor: 0, refCursor: 0 };
  const server = await createServer({ server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom', plugins: [{
    name: 'execution-controls', enforce: 'pre',
    resolveId(id) { if (id.startsWith('virtual:execution-')) return '\0' + id; },
    load(id) {
      if (id === '\0virtual:execution-hooks') return `
        export const useCallback = callback => callback;
        export const useState = value => { const f = globalThis.__executionControls, i = f.cursor++; if (!(i in f.states)) f.states[i] = value; return [f.states[i], next => f.states[i] = next]; };
        export const useRef = value => { const f = globalThis.__executionControls; return f.refs[f.refCursor++] ??= { current: value }; };
      `;
      if (id === '\0virtual:execution-motion') return 'export const useGSAP = () => {}; export const gsap = {}; export const MQ = {}; export const ScrollTrigger = {};';
    },
    transform(code, id) { if (id.replaceAll('\\', '/').endsWith('/site/CoverflowCoverage.tsx')) return code.replace('from "react"', 'from "virtual:execution-hooks"').replace('from "@/lib/motion"', 'from "virtual:execution-motion"'); },
  }] });
  const nodes = value => !value ? [] : Array.isArray(value) ? value.flatMap(nodes) : typeof value === 'object' ? [value, ...nodes(value.props?.children)] : [];
  const render = Component => { fixture.cursor = fixture.refCursor = 0; return Component(); };
  let items;
  try {
    const { CoverflowCoverage } = await server.ssrLoadModule('/src/components/site/CoverflowCoverage.tsx');
    ({ items } = (await server.ssrLoadModule('/src/content/site.ts')).serviceShowcase);
    let tree = render(CoverflowCoverage);
    const requested = [];
    fixture.refs[5].current = index => { requested.push(index); fixture.refs[4].current = fixture.states[0] = index; };
    for (let index = 0; index < items.length; index++) {
      nodes(tree).find(node => node.type === 'select').props.onChange({ currentTarget: { value: String(index) } });
      tree = render(CoverflowCoverage);
      assert.equal(nodes(tree).find(node => node.type === 'select').props.value, index);
      const selected = nodes(tree).filter(node => node.props?.['aria-pressed']);
      assert.equal(selected.length, 1);
      assert.ok(selected[0].props['aria-label'].startsWith(items[index].title));
    }
    assert.deepEqual(requested, items.map((_, index) => index));
    const stage = nodes(tree).find(node => node.props?.className === 'cov-stage');
    stage.props.onKeyDown({ key: 'ArrowLeft', target: { closest: () => ({}) }, preventDefault() { assert.fail('Native select keys must retain their default behavior'); } });
    for (const item of items) item.execution = { src: `/execution-${item.id}.webp`, alt: 'Confirmed execution', width: 800, height: 600 };
    tree = render(CoverflowCoverage);
    const images = nodes(tree).filter(node => node.type === 'img');
    assert.equal(images.length, 3, 'The final stop must load itself and both visual neighbours');
    assert.deepEqual(images.map(node => node.props.src), [items[0], items.at(-2), items.at(-1)].map(item => item.execution.src));
    let revealed = false;
    const failed = { hidden: false, nextElementSibling: { removeAttribute(name) { assert.equal(name, 'hidden'); revealed = true; } } };
    images[0].props.onError({ currentTarget: failed });
    assert.ok(failed.hidden && revealed, 'A broken image must reveal the unavailable-image fallback');
  } finally {
    if (items) for (const item of items) item.execution = null;
    await server.close(); globalThis.__executionControls = original;
  }
});
