import test from 'node:test';
import assert from 'node:assert/strict';
import { installSectionNavigation } from '../src/lib/section-navigation.mjs';

test('section links settle after pin layout changes and cross-page links keep native navigation', async () => {
  const previous = { window: globalThis.window, document: globalThis.document };
  const frames = new Map(); let nextFrame = 0, position = 1000, shifts = 0, focused = 0;
  let resolveFonts; const ready = new Promise(resolve => { resolveFonts = resolve; });
  const target = { getBoundingClientRect: () => ({ top: position - window.scrollY }), setAttribute() {}, focus() { focused++; } };
  globalThis.window = Object.assign(new EventTarget(), {
    location: { href: 'https://example.test/the-ad-company/', hash: '#services', origin: 'https://example.test', pathname: '/the-ad-company/' }, scrollY: 0,
    history: { pushState(_, __, url) { window.location.hash = url.hash; window.location.href = url.href; } },
    requestAnimationFrame(callback) { frames.set(++nextFrame, callback); return nextFrame; }, cancelAnimationFrame(id) { frames.delete(id); },
    scrollTo({ top, behavior }) { assert.equal(behavior, 'instant'); this.scrollY = top; },
  });
  globalThis.document = Object.assign(new EventTarget(), { fonts: { ready }, body: { style: { overflow: '' } },
    getElementById: id => ['services', 'work', 'about'].includes(id) ? target : null,
    querySelector: () => ({ getBoundingClientRect: () => ({ height: 80 }) }),
  });
  const flush = () => { for (let pass = 0; frames.size && pass < 30; pass++) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback()); } assert.equal(frames.size, 0); };
  const click = (href, options = {}) => {
    const event = new Event('click', { cancelable: true });
    const anchor = { getAttribute: name => name === 'href' ? href : null, hasAttribute: () => false, target: '' };
    Object.defineProperty(event, 'target', { value: { closest: () => anchor } });
    Object.assign(event, { button: 0, ...options }); document.dispatchEvent(event); return event;
  };
  try {
    const cleanup = installSectionNavigation(() => { if (shifts++ === 1) position = 1400; });
    flush(); assert.equal(window.scrollY, 1304, 'The final scroll position must reflect the expanded layout and fixed header');
    assert.ok(focused > 0);
    position = 2400; const work = click('#work'); assert.ok(work.defaultPrevented); flush(); assert.equal(window.scrollY, 2304); assert.equal(window.location.hash, '#work');
    assert.equal(click('./gallery.html').defaultPrevented, false);
    assert.equal(click('https://another.test/#about').defaultPrevented, false);
    assert.equal(click('#about', { ctrlKey: true }).defaultPrevented, false);
    assert.equal(click('#missing').defaultPrevented, false);
    position = 3400; click('#about'); window.dispatchEvent(new Event('wheel')); flush(); assert.equal(window.scrollY, 2304, 'User scrolling must cancel any queued alignment');
    resolveFonts(); await Promise.resolve(); flush(); assert.equal(window.scrollY, 2304, 'Late font loading must not pull the user back after manual scrolling');
    window.location.hash = '#services'; window.dispatchEvent(new Event('hashchange')); flush(); assert.equal(window.scrollY, 3304);
    cleanup(); position = 4400; assert.equal(click('#work').defaultPrevented, false); flush(); assert.equal(window.scrollY, 3304);
    window.location.pathname = '/the-ad-company/gallery.html'; window.location.href = 'https://example.test/the-ad-company/gallery.html'; window.location.hash = '';
    const galleryCleanup = installSectionNavigation(() => {});
    assert.equal(click('./#services').defaultPrevented, false, 'Gallery → homepage links must load the homepage, whose initial-hash handler then aligns the section');
    galleryCleanup();
  } finally { Object.assign(globalThis, previous); }
});
