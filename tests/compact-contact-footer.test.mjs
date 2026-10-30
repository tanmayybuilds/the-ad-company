import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('mobile shows three primary enquiry fields with collapsed optional details, a submit action and a compact footer', async () => {
  const server = await createServer({ server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom', plugins: [{
    name: 'compact-mobile-fixture', enforce: 'pre',
    transform(code, id) { if (id.endsWith('/hooks/use-mobile-layout.ts')) return 'export const useMobileLayout = () => globalThis.__compactMobile ?? false;'; },
  }] });
  try {
    globalThis.__compactMobile = true;
    const { Contact } = await server.ssrLoadModule('/src/components/site/Contact.tsx');
    const { Footer } = await server.ssrLoadModule('/src/components/site/Sections.tsx');
    const { Work } = await server.ssrLoadModule('/src/components/site/Work.tsx');
    const { work } = await server.ssrLoadModule('/src/content/site.ts');
    const contact = renderToStaticMarkup(createElement(Contact));
    assert.doesNotMatch(contact, /Download my brief|Prepare a campaign brief|First build|download=/i);
    assert.match(contact, /Submit enquiry/);
    const optional = contact.match(/<details[^>]*class="contact-optional"[^>]*>[\s\S]*?<\/details>/)?.[0];
    assert.ok(optional, 'Optional company, email and service fields belong in one collapsible group');
    assert.doesNotMatch(optional, /<details[^>]*\bopen=/);
    for (const name of ['company', 'email', 'service']) assert.ok(optional.includes(`name="${name}"`));
    const primary = contact.replace(optional, '');
    assert.equal([...primary.matchAll(/<(?:input|textarea)\b[^>]*\brequired=""/g)].length, 3);
    assert.match(contact, /Email delivery is being connected/);
    const footer = renderToStaticMarkup(createElement(Footer));
    assert.match(footer, /class="mobile-footer /);
    assert.doesNotMatch(footer, /First website build|Campaign portfolio awaiting|Explore<|Make a start|End-to-end advertising/);
    assert.doesNotMatch(footer, /href="#coverage"/);
    assert.match(footer, /href="#privacy"/);
    const cards = renderToStaticMarkup(createElement(Work));
    assert.equal([...cards.matchAll(/class="bento-copy(?: bento-copy--mobile)?"/g)].length, 3);
    for (const item of work.examples) assert.ok(cards.includes(item.copy));
    globalThis.__compactMobile = false;
    assert.match(renderToStaticMarkup(createElement(Footer)), /site-footer/);
    assert.match(renderToStaticMarkup(createElement(Contact)), /class="contact-optional" open=""/);
  } finally { delete globalThis.__compactMobile; await server.close(); }
});
