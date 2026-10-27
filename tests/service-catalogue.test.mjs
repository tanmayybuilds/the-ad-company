import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('each work card opens grouped services, retains the full offering, and supports an enquiry', async () => {
  let selected = 0, state = 0;
  globalThis.__workCatalogueState = value => [state++ === 1 ? selected : value, () => {}];
  const server = await createServer({ base: '/the-ad-company/', server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom', plugins: [{
    name: 'selected-work-card', enforce: 'pre',
    resolveId(id) { if (id === 'virtual:selected-work-card') return '\0' + id; },
    load(id) { if (id === '\0virtual:selected-work-card') return "export const useRef = value => ({ current: value }); export const useEffect = () => {}; export const useState = value => globalThis.__workCatalogueState(value);"; },
    transform(code, id) { if (id.replaceAll('\\', '/').endsWith('/site/Work.tsx')) return code.replace("from 'react'", "from 'virtual:selected-work-card'") + '\nexport { BentoCard };'; },
  }] });
  try {
    const { Services } = await server.ssrLoadModule('/src/components/site/Services.tsx');
    const { Contact } = await server.ssrLoadModule('/src/components/site/Contact.tsx');
    const { About } = await server.ssrLoadModule('/src/components/site/Sections.tsx');
    const { Work, BentoCard } = await server.ssrLoadModule('/src/components/site/Work.tsx');
    const { services, work } = await server.ssrLoadModule('/src/content/site.ts');
    const markup = renderToStaticMarkup(createElement(Services));
    assert.doesNotMatch(markup, /id="service-catalogue"/, 'The long standalone catalogue should be removed');
    for (selected = 0; selected < work.examples.length; selected++) {
      state = 0;
      const workMarkup = renderToStaticMarkup(createElement(Work));
      const catalogue = workMarkup.slice(workMarkup.indexOf('<dialog'));
      const video = catalogue.match(/<video\b[^>]*>/)?.[0];
      assert.ok(video, 'Every detail panel must contain its animation');
      assert.match(video, /autoPlay=""/i, 'The detail video must start automatically when opened');
      assert.doesNotMatch(video, /\bloop\b/i, 'The detail video must stop at the end');
      assert.match(video, /muted=""/i, 'Muted playback allows browser autoplay');
      assert.match(video, /controls=""/i, 'Manual playback controls must remain available');
      for (const offering of ['Television', 'Radio', 'Newspaper advertising &amp; inserts', 'Swiggy Instamart inserts', 'Zepto inserts', 'Blinkit inserts', 'Bus branding', 'Metro advertising', 'Train branding', 'Pole kiosks', 'Podcast integration', 'In-film branding', 'Brand ambassador &amp; celebrity endorsements', 'Location &amp; audience mapping', 'Cost-effective media buying']) {
        assert.ok(catalogue.includes(offering), `Card ${selected} loses supplied offering: ${offering}`);
      }
      const expanded = [...catalogue.matchAll(/<details\b[^>]*open=""[\s\S]*?<\/details>/g)].map(match => match[0]);
      assert.equal(expanded.length, work.examples[selected].serviceIds.length);
      for (const id of work.examples[selected].serviceIds) {
        const title = services.catalogue.find(service => service.id === id)?.title;
        assert.ok(title && expanded.some(group => group.includes(title.replaceAll('&', '&amp;'))), `Card ${selected} must expand ${id}`);
      }
      assert.match(catalogue, /href="#contact"/);
      let opened = 0;
      const card = BentoCard({ index: selected, active: true, reduced: false, onActivate: value => assert.equal(value, null), onExplore: () => opened++ });
      const [animation, footer] = card.props.children;
      animation.props.onClick();
      footer.props.children.at(-1).props.onClick();
      assert.equal(opened, 2, 'Clicking either the animation or View more must open the details');
    }
    const form = renderToStaticMarkup(createElement(Contact));
    for (const service of services.catalogue) {
      assert.ok(form.includes(`<option>${service.title.replaceAll('&', '&amp;')}</option>`), `Cannot enquire about ${service.title}`);
    }
    const about = renderToStaticMarkup(createElement(About));
    for (const reason of ['Strategic planning', 'Pan-India presence', 'Timely execution', 'Transparent pricing', 'End-to-end support']) assert.ok(about.includes(reason));
    assert.match(about, /src="\/the-ad-company\/brand\/billboard.jpg"/);
    assert.match(about, /Brand visual · illustrative placement/);
  } finally { await server.close(); delete globalThis.__workCatalogueState; }
});
