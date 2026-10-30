import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('mobile has five readable team rows, no tour, then a campaign brief link; desktop retains the tour', async () => {
  const server = await createServer({ base: '/the-ad-company/', server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom', plugins: [{
    name: 'mobile-layout-fixture', enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('/hooks/use-mobile-layout.ts')) return 'export const useMobileLayout = () => globalThis.__mobilePolish ?? false;';
    },
  }] });
  try {
    const { Team } = await server.ssrLoadModule('/src/components/site/Team.tsx');
    const { ServiceExecutions } = await server.ssrLoadModule('/src/components/site/ServiceExecutions.tsx');
    const { team, serviceShowcase } = await server.ssrLoadModule('/src/content/site.ts');
    globalThis.__mobilePolish = true;
    const mobile = renderToStaticMarkup(createElement(Team));
    assert.equal([...mobile.matchAll(/class="team-member-row"/g)].length, 5);
    for (const member of team.members) {
      assert.ok(mobile.includes(member.memberName));
      assert.ok(mobile.includes(member.roleTitle));
      assert.ok(mobile.includes(member.responsibility));
      assert.ok(mobile.includes(member.cutoutUrl));
    }
    assert.equal([...mobile.matchAll(/aria-haspopup="dialog"/g)].length, 5);
    assert.doesNotMatch(mobile, /team-world|team-pedestal|team-step|team-viewport/);
    assert.ok(mobile.indexOf('href="#contact"') > mobile.indexOf(team.members.at(-1).memberName));
    assert.equal(renderToStaticMarkup(createElement(ServiceExecutions)), '', 'No empty mobile execution section');
    const first = serviceShowcase.items[0];
    first.execution = { src: '/campaigns/malabar/01.webp', alt: 'Confirmed execution', width: 1152, height: 864 };
    try {
      const execution = renderToStaticMarkup(createElement(ServiceExecutions));
      assert.match(execution, /id="coverage"/);
      assert.equal([...execution.matchAll(/<figure/g)].length, 1);
      assert.match(execution, /\/the-ad-company\/campaigns\/malabar\/01.webp/);
      assert.doesNotMatch(execution, /coming soon|<select|cov-scene/);
    } finally { first.execution = null; }
    globalThis.__mobilePolish = false;
    const desktop = renderToStaticMarkup(createElement(Team));
    assert.match(desktop, /team-world/);
    assert.equal([...desktop.matchAll(/class="team-node /g)].length, 5);
    assert.match(renderToStaticMarkup(createElement(ServiceExecutions)), /cov-scene/);
  } finally { delete globalThis.__mobilePolish; await server.close(); }
});

test('each mobile client destination opens available photos under the deployed base path', async () => {
  const server = await createServer({ base: '/the-ad-company/', server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { clientGalleryHref } = await server.ssrLoadModule('/src/lib/client-gallery.ts');
    const { clients, work } = await server.ssrLoadModule('/src/content/site.ts');
    for (const client of clients.items) {
      const href = clientGalleryHref(client.name, work.projects, '/the-ad-company/');
      const target = new URL(href, 'https://example.com');
      assert.equal(target.pathname, '/the-ad-company/gallery.html');
      const id = target.searchParams.get('brand');
      if (id) {
        const project = work.projects.find(project => project.galleryId === id);
        assert.equal(project.client, client.name);
        assert.ok(project.photos.length > 0);
        assert.ok(existsSync(new URL(`../public${project.photos[0].src}`, import.meta.url)));
      }
    }
    assert.equal(clientGalleryHref('Unknown brand', work.projects, '/'), '/gallery.html#campaign-wall');
    assert.equal(clientGalleryHref('Empty', [{ client: 'Empty', galleryId: 'empty', photos: [] }], '/'), '/gallery.html#campaign-wall');
  } finally { await server.close(); }
});

test('one tap on every moving logo copy opens photos on mobile; desktop still opens its preview', async () => {
  const originalWindow = globalThis.window;
  const originalFixture = globalThis.__clientTap;
  const fixture = globalThis.__clientTap = { states: [] };
  let mobile = true;
  const destinations = [];
  globalThis.window = { matchMedia: () => ({ matches: mobile }), location: { assign: href => destinations.push(href) } };
  const server = await createServer({ base: '/the-ad-company/', server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom', plugins: [{
    name: 'client-tap-fixture', enforce: 'pre',
    resolveId(id) { if (id.startsWith('virtual:client-tap-')) return '\0' + id; },
    load(id) {
      if (id === '\0virtual:client-tap-react') return `
        export const useState = value => { const i = globalThis.__clientTap.states.length; globalThis.__clientTap.states.push(value); return [value, next => globalThis.__clientTap.states[i] = next]; };
        export const useRef = value => ({ current: value });
        export const useEffect = () => {};
      `;
      if (id === '\0virtual:client-tap-motion') return 'export const useGSAP = () => {}; export const gsap = {}, MOTION = {}, MQ = {};';
    },
    transform(code, id) {
      if (id.endsWith('/site/ClientStrip.tsx')) return code.replace('from "react"', 'from "virtual:client-tap-react"').replace('from "@/lib/motion"', 'from "virtual:client-tap-motion"');
    },
  }] });
  const walk = node => !node ? [] : Array.isArray(node) ? node.flatMap(walk) : typeof node === 'object' ? [node, ...walk(node.props?.children)] : [];
  try {
    const { ClientStrip } = await server.ssrLoadModule('/src/components/site/ClientStrip.tsx');
    const { clients, work } = await server.ssrLoadModule('/src/content/site.ts');
    const { clientGalleryHref } = await server.ssrLoadModule('/src/lib/client-gallery.ts');
    const nodes = walk(ClientStrip());
    const slots = nodes.filter(node => node.props?.['data-brand-card'] === '');
    assert.equal(slots.length, 48);
    for (const slot of slots) {
      const action = walk(slot).find(node => node.props?.className === 'brand-lift');
      action.props.onClick();
      const client = clients.items[slot.props['data-brand-index'] % clients.items.length];
      assert.equal(destinations.at(-1), clientGalleryHref(client.name, work.projects, '/the-ad-company/'));
    }
    assert.equal(fixture.states[2], null, 'Mobile taps must navigate directly instead of opening the flip-card dialog');
    assert.ok(nodes.some(node => node.type === 'a' && node.props.href === '/the-ad-company/gallery.html#campaign-wall'));
    const before = destinations.length;
    mobile = false;
    nodes.find(node => node.props?.className === 'brand-lift').props.onClick();
    assert.equal(destinations.length, before);
    assert.equal(fixture.states[2], 0, 'Desktop retains the first brand preview');
  } finally { globalThis.window = originalWindow; globalThis.__clientTap = originalFixture; await server.close(); }
});
