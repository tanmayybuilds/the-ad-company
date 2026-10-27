import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('the five supplied people replace sample profiles and the final pointer has no sixth stop', async () => {
  const server = await createServer({ base: '/the-ad-company/', server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { team } = await server.ssrLoadModule('/src/content/site.ts');
    const { TeamTour } = await server.ssrLoadModule('/src/components/site/TeamTour.tsx');
    assert.deepEqual(team.members.map(person => [person.memberName, person.roleTitle]), [
      ['Yash Nile', 'Director | The AD Company'], ['Akshay Daundkar', 'Media Sales Manager'],
      ['Dilip Janaskar', 'Ad Sales Executive'], ['Mansi Jha', 'Social Media Manager'], ['Ashika Jha', 'BTL Head'],
    ]);
    for (const person of team.members) {
      assert.ok(existsSync(new URL(`../public${person.cutoutUrl}`, import.meta.url)));
      assert.ok(person.biography.length > 0);
    }
    assert.ok(team.members[3].biography.join('\n').includes("Always switched on. Always taking ownership. Always making things happen."));
    const markup = renderToStaticMarkup(createElement(TeamTour));
    assert.equal([...markup.matchAll(/class="team-node /g)].length, 5);
    assert.match(markup, /01—05/);
    assert.match(markup, /01 \/ 05/);
    assert.doesNotMatch(markup, /pointer-06|sample-0|awaiting confirmation/i);
    assert.match(markup, /aria-haspopup="dialog"/);
  } finally { await server.close(); }
});

test('full biographies open with page scroll locked and restore focus and scrolling when closed', async () => {
  const originalDocument = globalThis.document;
  const effects = [];
  let ref, opened = 0, closed = 0, focused = 0;
  globalThis.__teamBioTest = {
    useRef: () => ref = { current: null },
    useEffect: callback => effects.push(callback),
  };
  globalThis.document = { body: { style: { overflow: 'auto' } }, activeElement: { focus: options => { assert.equal(options.preventScroll, true); focused++; } } };
  const server = await createServer({ server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom', plugins: [{
    name: 'team-bio-hooks', enforce: 'pre',
    resolveId(id) { if (id === 'virtual:team-bio-hooks') return '\0' + id; },
    load(id) { if (id === '\0virtual:team-bio-hooks') return 'export const { useRef, useEffect } = globalThis.__teamBioTest;'; },
    transform(code, id) { if (id.replaceAll('\\', '/').endsWith('/site/TeamBiography.tsx')) return code.replace("from 'react'", "from 'virtual:team-bio-hooks'"); },
  }] });
  let cleanup;
  try {
    const { TeamBiography } = await server.ssrLoadModule('/src/components/site/TeamBiography.tsx');
    const { team } = await server.ssrLoadModule('/src/content/site.ts');
    const markup = renderToStaticMarkup(createElement(TeamBiography, { node: team.members[3], onClose() {} }));
    assert.match(markup, /aria-labelledby="team-bio-title"/);
    assert.match(markup, /Her ability to juggle multiple tasks/);
    assert.match(markup, /Always switched on. Always taking ownership. Always making things happen./);
    ref.current = { showModal: () => opened++, close: () => closed++ };
    cleanup = effects.shift()();
    assert.equal(opened, 1);
    assert.equal(document.body.style.overflow, 'hidden');
    cleanup(); cleanup = null;
    assert.equal(closed, 1);
    assert.equal(focused, 1);
    assert.equal(document.body.style.overflow, 'auto');
    const yash = renderToStaticMarkup(createElement(TeamBiography, { node: team.members[0], onClose() {} }));
    assert.match(yash, /Building an agency that believes in big ideas and honest execution/);
    renderToStaticMarkup(createElement(TeamBiography, { node: null, onClose() {} }));
    assert.equal(effects.at(-1)(), undefined);
    assert.equal(document.body.style.overflow, 'auto');
  } finally { cleanup?.(); await server.close(); globalThis.document = originalDocument; delete globalThis.__teamBioTest; }
});

test('a retained sixth-pointer selection cannot blank the page after the roster shrinks to five', async () => {
  const server = await createServer({ server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom', plugins: [{
    name: 'retained-team-selection', enforce: 'pre',
    resolveId(id) { if (id === 'virtual:retained-team-selection') return '\0' + id; },
    load(id) { if (id === '\0virtual:retained-team-selection') return "export { useRef, useEffect } from 'react'; export const useState = value => [value === 0 ? 5 : value, () => {}];"; },
    transform(code, id) { if (id.replaceAll('\\', '/').endsWith('/site/TeamTour.tsx')) return code.replace("from 'react'", "from 'virtual:retained-team-selection'"); },
  }] });
  try {
    const { TeamTour } = await server.ssrLoadModule('/src/components/site/TeamTour.tsx');
    const markup = renderToStaticMarkup(createElement(TeamTour));
    assert.match(markup, /05 \/ 05/);
    assert.match(markup, /Ashika Jha/);
    assert.match(markup, /disabled=""[^>]*>Next pointer/);
  } finally { await server.close(); }
});
