import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('the catalogue keeps every service while the showcase displays only photographed executions', async () => {
  const server = await createServer({ base: '/the-ad-company/', server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { CoverflowCoverage } = await server.ssrLoadModule('/src/components/site/CoverflowCoverage.tsx');
    const { serviceShowcase, services, nav: links } = await server.ssrLoadModule('/src/content/site.ts');
    assert.ok(serviceShowcase, 'The city cards must be replaced by a service execution catalogue');
    assert.equal(serviceShowcase.items.length, 40);
    assert.equal(new Set(serviceShowcase.items.map(item => item.id)).size, serviceShowcase.items.length);
    const formats = new Set(serviceShowcase.items.flatMap(item => item.formats));
    for (const group of [...services.catalogue, ...services.items]) {
      for (const format of group.formats) assert.ok(formats.has(format), `Missing offered service: ${format}`);
    }
    const photographed = ['hoardings', 'lift-posters', 'pole-kiosks', 'community', 'tagging', 'van', 'auto', 'cab', 'outdoor-digital'];
    assert.deepEqual(serviceShowcase.items.filter(item => item.execution).map(item => item.id), photographed);
    assert.deepEqual(serviceShowcase.items.slice(0, 9).map(item => item.id), photographed, 'Supplied executions must appear before pending photo slots');
    const displayed = serviceShowcase.items.filter(item => item.execution?.src);
    assert.ok(links.some(link => link.label === 'Executions' && link.href === '#coverage'));
    const markup = renderToStaticMarkup(createElement(CoverflowCoverage));
    const options = markup.match(/<select\b[\s\S]*?<\/select>/)?.[0];
    assert.ok(options);
    assert.equal([...options.matchAll(/<option\b/g)].length, displayed.length);
    for (const item of displayed) assert.ok(options.includes(item.title.replaceAll('&', '&amp;')));
    for (const item of serviceShowcase.items.filter(item => !item.execution)) {
      assert.ok(!markup.includes(`execution-info-${item.id}"`), `Unphotographed service must not have a card: ${item.id}`);
      assert.ok(!options.includes(item.title.replaceAll('&', '&amp;')), `Unphotographed service must not be selectable: ${item.id}`);
    }
    assert.match(markup, /id="coverage"/);
    assert.match(markup, /for="execution-service"/);
    assert.match(markup, /id="execution-service"/);
    assert.match(markup, /href="#contact"/);
    assert.doesNotMatch(markup, /Execution photograph coming soon/);
    for (const item of displayed) {
      assert.ok(markup.includes(`aria-describedby="execution-info-${item.id}"`), 'Each card must expose its execution status and details to assistive technology');
      assert.ok(markup.includes(`id="execution-info-${item.id}"`));
    }
    assert.doesNotMatch(markup, /cov-city-art|Illustrative city scene/);
    for (const button of markup.matchAll(/<button\b[\s\S]*?<\/button>/g)) {
      assert.doesNotMatch(button[0], /<a\b/, 'A card button must not contain another interactive control');
    }
    assert.equal([...markup.matchAll(/class="cov-photo-placeholder"/g)].length, displayed.length);
    assert.equal([...markup.matchAll(/class="cov-card(?: cov-card-active)?"/g)].length, displayed.length);
    assert.match(markup, /\/ 09/);
    const execution = { src: '/campaigns/malabar/01.webp', thumbnail: '/campaigns/malabar/01-thumb.webp', thumbnailWidth: 480, width: 1152, height: 648, alt: 'Confirmed hoarding execution', client: 'Confirmed brand', location: 'Confirmed location', description: 'Approved campaign details' };
    const originals = serviceShowcase.items.map(item => item.execution);
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
    } finally { serviceShowcase.items.forEach((item, index) => item.execution = originals[index]); }
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
  let items, originals;
  try {
    const { CoverflowCoverage } = await server.ssrLoadModule('/src/components/site/CoverflowCoverage.tsx');
    items = (await server.ssrLoadModule('/src/content/site.ts')).serviceShowcase.items.filter(item => item.execution?.src);
    originals = items.map(item => item.execution);
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
    if (items) items.forEach((item, index) => item.execution = originals[index]);
    await server.close(); globalThis.__executionControls = original;
  }
});

test('all nine supplied execution photos have accurate responsive WebP dimensions and bounded transfer sizes', () => {
  const file = new URL('../src/content/service-executions.json', import.meta.url);
  assert.ok(existsSync(file), 'The supplied service photos must be imported');
  const executions = JSON.parse(readFileSync(file, 'utf8'));
  assert.deepEqual(Object.keys(executions), ['hoardings', 'lift-posters', 'pole-kiosks', 'community', 'tagging', 'van', 'auto', 'cab', 'outdoor-digital']);
  let fullBytes = 0, previewBytes = 0;
  for (const [id, execution] of Object.entries(executions)) {
    assert.ok(execution.alt.length > 15, id);
    assert.equal(execution.src, `/service-executions/${id}.webp`);
    assert.equal(execution.thumbnail, `/service-executions/${id}-thumb.webp`);
    for (const [path, width, height, budget] of [[execution.src, execution.width, execution.height, 350_000], [execution.thumbnail, execution.thumbnailWidth, null, 100_000]]) {
      const image = new URL(`../public${path}`, import.meta.url);
      const bytes = readFileSync(image);
      assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
      assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
      assert.equal(bytes.toString('ascii', 12, 16), 'VP8 ');
      assert.equal(bytes.readUInt16LE(26) & 0x3fff, width, path);
      if (height) assert.equal(bytes.readUInt16LE(28) & 0x3fff, height, path);
      assert.ok(statSync(image).size < budget, `${id} exceeds image budget`);
      if (height) fullBytes += bytes.length; else previewBytes += bytes.length;
    }
    assert.ok(Math.max(execution.width, execution.height) <= 1440);
  }
  assert.ok(fullBytes < 2_500_000);
  assert.ok(previewBytes < 700_000);
});
